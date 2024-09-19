import { ChangeDetectorRef, Component, SimpleChanges, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { MaterialService } from 'app/core/services/material.service';
import { PricingModelService } from 'app/core/services/pricing-model.service';
import { VariableService } from 'app/core/services/variable.service';
import { Subject, debounceTime } from 'rxjs';
import { FinishesService } from 'app/core/services/finishes.service';
import { DataType } from 'app/core/enums/DataType';
import _ from 'lodash';
import { HistoryService } from 'app/core/services/history.service';

@Component({
    selector: 'app-finishes-variable',
    standalone: true,
    imports: [CommonModule, RouterLink, FormsModule, ReactiveFormsModule, MatMenuModule, MatButtonModule, MatFormFieldModule, MatIconModule, MatInputModule, MatPaginatorModule, MatProgressBarModule, MatSortModule, MatTableModule, MatSelectModule,],
    templateUrl: './finishes-variable.component.html',
    styleUrls: ['./finishes-variable.component.scss']
})
export class FinishesVariableComponent {
    @ViewChild(MatPaginator) paginator: MatPaginator;

    alert: any;
    currentPage: number = 0;
    displayedColumns = [ 'variables_id','data_type', 'value', 'action'];
    flashMessage: 'success' | 'error' | null = null;
    masterVariableList: any[] = [];
    dataTypes = Object.values(DataType);
    variableList: MatTableDataSource<any>;
    pageSize: number = 10;
    isLoading: boolean = false;
    searchInputControl = new FormControl('');
    sortColumn: string;
    selectedVariableId: any;
    sortOrder: number;
    totalRecords: number = 10;
    tagsEditMode: boolean = false;
    currentlyEditingVariable: any = null;
    originalValues: any = {};
    previousPageSize: number = this.pageSize;
    previousPageIndex: number = this.currentPage;
    finishesId: string;
    finishes: any;
    reset: { pageSize: boolean, pageIndex: boolean } = { pageSize: false, pageIndex: false };
    dataType = DataType;
    private searchSubject = new Subject<string>();
    private readonly debounceTimeMs = 500;

    constructor(
        private _route: ActivatedRoute,
        private _fuseConfirmationService: FuseConfirmationService,
        private _finishesService: FinishesService,
        private _pricingModelService: PricingModelService,
        private _variableService: VariableService,
        private router: Router,
        private cdr: ChangeDetectorRef,
        private _historyService:HistoryService
    ) {
        this._route.params.subscribe(params => {
            this.finishesId = params['id'];
            this.getFinishesName(this.finishesId);
        });
    }


    ngOnInit() {
        this.getVariableList(this.pageSize, this.currentPage);
        this.searchSubject
            .pipe(debounceTime(this.debounceTimeMs))
            .subscribe((searchValue: any) => {
                this.performSearch(searchValue);
            });
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['variableList']) {
          this.cdr.detectChanges();
        }
      }

    navigateIfAllowed(event: Event): void {
        if (this.currentlyEditingVariable) {
          event.preventDefault();
          this.showError({
            error: {
                message:
                    'Please save or cancel the current edit before leaving this page.',
            },
        });
        } else {
          this.router.navigate(['/finishes/list']);
        }
      }



    getMasterVariableList() {
        this._variableService.getAllVariable('?skip_pagination=true&search=FinishesVariable&type=Constant').subscribe((result: any) => {
            const variableIds  = this.variableList.data.map((variable)=> variable.variablesData._id);
            this.masterVariableList = result?.data?.result.filter((master)=> !variableIds.includes(master._id));
        }, (error: any) => {
            this.showError(error);
        });
    }

    getFinishesName(finishesId: string) {
        this._finishesService.getFinishesById(finishesId).subscribe((res) => {
            this.finishes = res.data.result;
        })
    }

    searchRecord() {
        this.searchSubject.next(this.searchInputControl.value);
    }

    performSearch(input: any) {
        if (this.currentlyEditingVariable) {
            if(input){
                this.showError({
                    error: {
                        message:
                            'Please save or cancel the current edit before searching.',
                    },
                });
                return;
            }

        }else{
            this.getVariableList(this.pageSize, 0, input, this.sortColumn);
        }
    }

    getVariableList(
        size: number = 0,
        current: number,
        search: string = '',
        sortColumn: string = 'created_at',
        sortOrder: number = 0
    ) {
        if (this.currentlyEditingVariable) {
            const alert: any = {
                title: 'Warning',
                message: 'Are you sure you want to perform this operation? You will lose your unsaved changes.',
                icon: {
                    show: true,
                    name: 'heroicons_outline:exclamation-triangle',
                    color: 'warning',
                },
                actions: {
                    confirm: {
                        show: true,
                        label: 'Okay',
                        color: 'warn',
                    },
                    cancel: {
                        show: true,
                        label: 'Cancel',
                    },
                },
            };
            const dialogRef = this._fuseConfirmationService.open(alert);

            dialogRef.afterClosed().subscribe((result) => {
                if (result == 'confirmed') {
                    this.currentlyEditingVariable = false;
                    this.fetchVariableList(size, current, search, sortColumn, sortOrder);
                } else {

                    if (this.reset.pageSize) {
                        this.pageSize = this.previousPageSize;
                        this.paginator.pageSize = this.previousPageSize;
                    }
                }
            });
        } else {
            this.fetchVariableList(size, current, search, sortColumn, sortOrder);
        }
    }

    fetchVariableList(
        size: number,
        current: number,
        search: string,
        sortColumn: string,
        sortOrder: number
    ) {
        this.pageSize = size;
        this.currentPage = current;
        let url = `?limit=${size}&page=${current + 1}&orderby=${sortColumn}&sort=${sortOrder}&finishes_id=${this.finishesId}`;
        if (search != '') {
            url += `&search=${search}`;
        }
        this._finishesService.getAllFinishesVariables(url).subscribe(
            (result: any) => {
                this.variableList = new MatTableDataSource(result.data?.result);
                this.totalRecords = result.data?.totalCount;
                this.getMasterVariableList();
            },
            (error: any) => {
                this.showError(error);
            }
        );
    }

    onPageChange(e: any) {
        this.previousPageSize = this.pageSize;
        this.pageSize = e.pageSize;
        this.getVariableList(
            e.pageSize,
            e.pageIndex,
            this.searchInputControl.value,
            this.sortColumn,
            this.sortOrder
        );
    }


    sortData(sort: Sort) {
        this.sortColumn = sort.active;
        this.sortOrder = sort.direction == 'asc' ? 1 : -1;
        this.getVariableList(
            this.pageSize,
            0,
            this.searchInputControl.value,
            sort.active,
            sort.direction == 'asc' ? 1 : -1
        );
    }

    editEquation(equationMappedId: any) {
        this.router.navigateByUrl('equation/equation-parts/' + equationMappedId);
        this._historyService.push('equation/equation-parts/' + equationMappedId);
    }

    onVariableSelectionChange(variable: any) {
        const selectedVariable = this.masterVariableList.find(v => v._id === variable.variablesData._id);
        if (selectedVariable) {
            variable.variablesData.name = selectedVariable.name;
            variable.variablesData.data_type = selectedVariable.data_type;
            // variable.value = selectedVariable.value;
            this.cdr.detectChanges();
        }
    }


    addVariable() {
        if (this.currentlyEditingVariable) {
            // Handle existing edit
            this.showError({
                error: {
                    message:
                        'Please save or cancel the current edit before adding a new variable.',
                },
            });
            return;
        }
        const newVariable = {

            variablesData: {
                _id: this.masterVariableList[0]?._id,
                name: this.masterVariableList[0]?.name,
                data_type : this.masterVariableList[0]?.data_type
            },
            finishes_id: this.finishesId,
            // value:this.masterVariableList[0]?.value,
            value:'',
            isEditing: true,
            isNew: true,
        };
        this.variableList.data = [newVariable, ...this.variableList.data];
        this.currentlyEditingVariable = newVariable;
    }

    toggleEdit(variable) {
        if (
            this.currentlyEditingVariable &&
            this.currentlyEditingVariable !== variable
        ) {
            // Handle existing edit
            this.showError({
                error: {
                    message:
                        'Please save or cancel the current edit before editing another variable.',
                },
            });
            return;
        }
        if (variable.isEditing) {
            this.cancelEdit(variable);
        } else {
            this.currentlyEditingVariable = variable;
            this.originalValues = _.cloneDeep(variable);// Store original values
            variable.isEditing = true;
        }
    }

    saveVariable(variable) {
        if (!variable.variablesData?._id) {
            variable.showValidationErrors = true;
            return;
        }else if(!variable.value && variable.variablesData.data_type != this.dataType.Equation){
            variable.showValidationErrors = true;
            return;
        }
        variable.showValidationErrors = false;
        let printerVariable: FinishesVariable = new FinishesVariable( variable.variablesData?._id, this.finishesId, variable.value);

        if (variable._id) {
            printerVariable._id = variable._id;
            this.updateVariable(printerVariable);
        } else {
            this.createVariable(printerVariable);
        }

    }

    cancelEdit(variable) {
        if (variable.isNew) {
            this.variableList.data = this.variableList.data.filter(
                (v) => v !== variable
            );
        } else {
            variable.isEditing = false;
            Object.assign(variable, this.originalValues); // Restore original values
        }
        this.currentlyEditingVariable = null;
    }

    createVariable(variable) {
        this._finishesService.addFinishesVariable(variable).subscribe(
            (result: any) => {
                variable._id = result.data._id;
                variable.isEditing = false;
                variable.isNew = false;
                this.currentlyEditingVariable = null;
                this.getVariableList(
                    this.pageSize,
                    this.currentPage,
                    this.searchInputControl.value
                );
            },
            (error: any) => {
                this.showError(error);
            }
        );
    }

    updateVariable(variable) {
        this._finishesService.updateFinishesVariable(variable._id, variable).subscribe(
            (result: any) => {
                variable.isEditing = false;
                this.currentlyEditingVariable = null;
                this.getVariableList(
                    this.pageSize,
                    this.currentPage,
                    this.searchInputControl.value
                );
            },
            (error: any) => {
                this.showError(error);
            }
        );
    }

    deleteVariable(variable) {
        if (
            this.currentlyEditingVariable &&
            this.currentlyEditingVariable !== variable
        ) {
            // Handle existing edit
            this.showError({
                error: {
                    message:
                        'Please save or cancel the current edit before deleting another variable.',
                },
            });
            return;
        }
        if (variable.isNew) {
            this.variableList.data = this.variableList.data.filter(
                (v) => v !== variable
            );
            this.currentlyEditingVariable = false;
        } else {
            this.selectedVariableId = variable._id;
            this.alert = {
                title: 'Delete Variable',
                message: 'Are you sure you want to delete this Variable?',
                icon: {
                    show: true,
                    name: 'heroicons_outline:exclamation-triangle',
                    color: 'warn',
                },
                actions: {
                    confirm: {
                        show: true,
                        label: 'Yes, Delete It!',
                        color: 'warn',
                    },
                    cancel: {
                        show: true,
                        label: 'Cancel',
                    },
                },
            };
            this.openConfirmationDialog(this.alert);
        }
    }

    showError(err: any) {
        this.alert = {
            title: 'Error',
            message: err.error.message,
            icon: {
                show: true,
                name: 'heroicons_outline:exclamation-triangle',
                color: 'warn',
            },
            actions: {
                confirm: {
                    show: false,
                    label: 'Okay',
                    color: 'warn',
                },
                cancel: {
                    show: true,
                    label: 'Okay',
                },
            },
        };
        this.openConfirmationDialog(this.alert);
    }

    openConfirmationDialog(data: any): void {
        const dialogRef = this._fuseConfirmationService.open(data);

        dialogRef.afterClosed().subscribe((result) => {
            if (result == 'confirmed') {
                this._finishesService
                    .deleteFinishesVariable(this.selectedVariableId)
                    .subscribe(
                        (response: any) => {
                            if (response.statusCode == 200) {
                                this.getVariableList(
                                    this.pageSize,
                                    0,
                                    this.searchInputControl.value
                                );
                                this.currentlyEditingVariable = false;
                            }
                        },
                        (error: any) => {
                            this.showError(error);
                        }
                    );
            }
        });
    }


    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this.searchSubject.next(null);
        this.searchSubject.complete();
    }

}


class FinishesVariable {
    _id?: string;
    variables_id: string;
    finishes_id: string;
    value: string;

    constructor( variablesId: string, finishesId: string, value: string, id?: string) {
        this.variables_id = variablesId;
        this.finishes_id = finishesId;
        this.value = value;
        this._id = id;
    }

}
