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
import { DataType } from 'app/core/enums/DataType';
import { VariableType, variableTypeDisplayNames } from 'app/core/enums/VariableType';
import { debounceTime, Subject, filter, map } from 'rxjs';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { PricingModelService } from 'app/core/services/pricing-model.service';
import { VariableService } from 'app/core/services/variable.service';
import _ from 'lodash';
import { HistoryService } from 'app/core/services/history.service';

@Component({
    selector: 'app-pricing-model-variable',
    standalone: true,
    imports: [CommonModule, RouterLink, FormsModule, ReactiveFormsModule, MatMenuModule, MatButtonModule, MatFormFieldModule, MatIconModule, MatInputModule, MatPaginatorModule, MatProgressBarModule, MatSortModule, MatTableModule, MatSelectModule,],
    templateUrl: './pricing-model-variable.component.html',
    styleUrls: ['./pricing-model-variable.component.scss']
})
export class PricingModelVariableComponent {
    @ViewChild(MatPaginator) paginator: MatPaginator;

    alert: any;
    currentPage: number = 0;
    displayedColumns = ['variables_id', 'data_type', 'value', 'action'];
    flashMessage: 'success' | 'error' | null = null;
    masterVariableList: any[] = [];
    variableList: MatTableDataSource<any>;
    pageSize: number = 10;
    isLoading: boolean = false;
    searchInputControl = new FormControl('');
    sortColumn: string;
    selectedVariableId: any;
    sortOrder: number;
    totalRecords: number = 10;
    tagsEditMode: boolean = false;
    variableTypes = Object.values(VariableType);
    dataTypes = Object.values(DataType);
    variableTypeDisplayNames = variableTypeDisplayNames;
    currentlyEditingVariable: any = null;
    originalValues: any = {};
    previousPageSize: number = this.pageSize;
    previousPageIndex: number = this.currentPage;
    pricingModelId: string;
    pricingModel: any;
    reset: { pageSize: boolean, pageIndex: boolean } = { pageSize: false, pageIndex: false };
    dataType = DataType;
    private searchSubject = new Subject<string>();
    private readonly debounceTimeMs = 300;

    constructor(
        private _route: ActivatedRoute,
        private _fuseConfirmationService: FuseConfirmationService,
        private _pricingModelService: PricingModelService,
        private _variableService: VariableService,
        private router: Router,
        private cdr: ChangeDetectorRef,
        private _historyService:HistoryService
    ) {
        this._route.params.subscribe(params => {
            this.pricingModelId = params['id'];
            this.getPricingModelName(this.pricingModelId);
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

    getMasterVariableList() {
        this._variableService.getAllVariable('?skip_pagination=true&search=PricingModelVariable&type=Constant').subscribe((result: any) => {
            const variableIds  = this.variableList.data.map((variable)=> variable.variablesData._id);
            this.masterVariableList = result?.data?.result.filter((master)=> !variableIds.includes(master._id));
        }, (error: any) => {
            this.showError(error);
        });
    }

    getPricingModelName(pricingModelId: string) {
        this._pricingModelService.getPricingModel(pricingModelId).subscribe((res) => {
            this.pricingModel = res.data.result;
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
          this.router.navigate(['/pricing-model/list']);
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
                }else {

                    if(this.reset.pageSize){
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
        let url = `?limit=${size}&page=${current + 1}&orderby=${sortColumn}&sort=${sortOrder}&pricing_model_id=${this.pricingModelId}`;
        if (search != '') {
            url += `&search=${search}`;
        }
        this._pricingModelService.getAllPricingModelVariables(url).subscribe(
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
            variablesData :{
                _id : this.masterVariableList[0]?._id,
                name : this.masterVariableList[0]?.name,
                data_type : this.masterVariableList[0]?.data_type
            },
            pricing_model_id: this.pricingModelId,
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
            this.originalValues = _.cloneDeep(variable); // Store original values
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
        let pricingModelVariable:PricingModelVariable = new PricingModelVariable(this.pricingModelId,variable.variablesData?._id,variable.value);

        if (variable._id) {
            pricingModelVariable._id =variable._id;
            this.updateVariable(pricingModelVariable);
        } else {
            this.createVariable(pricingModelVariable);
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
        this._pricingModelService.addPricingModelVariable(variable).subscribe(
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
        this._pricingModelService.updatePricingModelVariable(variable._id, variable).subscribe(
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
                this._pricingModelService
                    .deletePricingModelVariable(this.selectedVariableId)
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


class PricingModelVariable{
    _id?: string;
    pricing_model_id : string;
    variables_id : string;
    value : string;

    constructor (pricingModelId:string,variablesId:string,value:string,id?:string){
        this.pricing_model_id = pricingModelId;
        this.variables_id = variablesId;
        this.value = value;
        this._id = id;
    }



}
