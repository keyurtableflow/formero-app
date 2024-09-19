import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
    FormsModule,
    ReactiveFormsModule,
    FormControl,
    FormGroup,
    Validators,
} from '@angular/forms';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSelectModule } from '@angular/material/select';
import { debounceTime, Subject } from 'rxjs';
import { VariableService } from 'app/core/services/variable.service';
import { Router } from '@angular/router';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { DataType } from 'app/core/enums/DataType';
import {
    VariableType,
    variableTypeDisplayNames,
} from 'app/core/enums/VariableType';
import { values } from 'lodash';
import { HistoryService } from 'app/core/services/history.service';

@Component({
    selector: 'app-variable-list',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        MatMenuModule,
        MatButtonModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatPaginatorModule,
        MatProgressBarModule,
        MatSortModule,
        MatTableModule,
        MatSelectModule,
    ],
    templateUrl: './variable-list.component.html',
    styleUrls: ['./variable-list.component.scss'],
})
export class VariableListComponent implements OnInit, OnDestroy {

    @ViewChild(MatPaginator) paginator: MatPaginator;

    alert: any;
    currentPage: number = 0;
    displayedColumns = ['name', 'type', 'data_type','action'];
    flashMessage: 'success' | 'error' | null = null;
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
    varTypes =VariableType;
    variableTypeDisplayNames = variableTypeDisplayNames;
    currentlyEditingVariable: any = null;
    originalValues: any = {};
    previousPageSize: number = this.pageSize;
    previousPageIndex:number = this.currentPage;
    reset : { pageSize : boolean, pageIndex : boolean} = { pageSize :false,pageIndex:false};
    dataType = DataType;


    private searchSubject = new Subject<string>();
    private readonly debounceTimeMs = 300;

    constructor(
        private _router: Router,
        private _fuseConfirmationService: FuseConfirmationService,
        private _variableService: VariableService,
        private _historyService:HistoryService
    ) {}

    ngOnInit() {
        this.getVariableList(this.pageSize, this.currentPage);
        this.searchSubject
            .pipe(debounceTime(this.debounceTimeMs))
            .subscribe((searchValue: any) => {
                this.performSearch(searchValue);
            });
    }

    searchRecord() {
        this.searchSubject.next(this.searchInputControl.value);
    }

    performSearch(input: any) {
        this.getVariableList(this.pageSize, 0, input, this.sortColumn);
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
        let url = `?limit=${size}&page=${current + 1}&orderby=${sortColumn}&sort=${sortOrder}`;
        if (search != '') {
            url += `&search=${search}`;
        }
        this._variableService.getAllVariable(url).subscribe(
            (result: any) => {
                this.variableList = new MatTableDataSource(result.data?.result);
                this.totalRecords = result.data?.totalCount;
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

    editEquation(id){
        this._historyService.clear();
        this._historyService.push('variable/list');
        this._historyService.push('equation/equation-parts/' + id);
        this._router.navigateByUrl('equation/equation-parts/' + id);
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
            name: '',
            type: this.variableTypes[0],
            data_type: this.dataTypes[0],
            // values:'',
            isEditing: true,
            isNew: true, // flag to indicate new variable
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
            this.originalValues = { ...variable }; // Store original values
            variable.isEditing = true;
        }
    }

    saveVariable(variable) {
        if (!variable.name || !variable.type || !variable.data_type) {
            variable.showValidationErrors = true;
            return;
        }
        variable.showValidationErrors = false;
        if (variable._id) {
            this.updateVariable(variable);
        } else {
            this.createVariable(variable);
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
        this._variableService.addVariable(variable).subscribe(
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
        this._variableService.updateVariable(variable._id, variable).subscribe(
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
                this._variableService
                    .deleteVariable(this.selectedVariableId)
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
