import { Component } from '@angular/core';
import { CommonModule, NgFor, NgIf, NgSwitchCase } from '@angular/common';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { EquationPartsService } from 'app/core/services/equation-parts.service';
import { EquationPartTypes } from 'app/core/enums/equationPartType.enum';
import { EquationService } from 'app/core/services/equation.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { VariableType, variableTypeDisplayNames } from 'app/core/enums/VariableType';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { VariableService } from 'app/core/services/variable.service';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { HistoryService } from 'app/core/services/history.service';
import { Subscription } from 'rxjs';
import { EncryptionService } from 'app/core/services/encryption.service';
import { ConditionalTypes } from 'app/core/enums/conditionalType.enum';
import _ from 'lodash';
import { EquationFunction } from 'app/core/enums/equation-function.enum';

@Component({
    selector: 'app-equation-parts',
    standalone: true,
    imports: [CommonModule, FormsModule, NgFor, ReactiveFormsModule, RouterLink, NgSwitchCase, NgIf, DragDropModule, MatMenuModule, MatButtonModule, MatFormFieldModule, MatIconModule, MatInputModule, MatPaginatorModule, MatProgressBarModule, MatSortModule, MatTableModule, MatSelectModule],
    templateUrl: './equation-parts.component.html',
    styleUrls: ['./equation-parts.component.scss']
})
export class EquationPartsComponent {

    alert: any;
    conditionalType = ConditionalTypes;
    dataSource: MatTableDataSource<EquationPart>;
    deletePartIndex: number;
    decryptConditionalPart: ConditionalTypes;
    displayedColumns: string[] = ['type', 'value','updated_at', 'actions'];
    editing: boolean = false;
    equationFunctionList =   Object.values(EquationFunction);
    equationMappedId: string;
    equationParts: EquationPart[] = [];
    equationPartTypes = Object.values(EquationPartTypes);
    isEditApiCall: boolean = false;
    isLoading: boolean = false;
    isSubmit: boolean = false;
    masterFinishesVariableList: any[] = [];
    masterMaterialVariableList: any[] = [];
    masterOrderVariableList: any[] = [];
    masterPricingModelVariableList: any[] = [];
    masterPrinterVariableList: any[] = [];
    masterProcessVariableList: any[] = [];
    operators: Operator[] = [];
    routeSub: Subscription;
    selectedEquationPartId: string;
    selectedFunction: EquationFunction = EquationFunction.None;
    subEquationId: string | null = null;
    variableTypes = Object.values(VariableType);
    variableTypeDisplayNames = variableTypeDisplayNames;


    constructor(
        private _equationPartService: EquationPartsService,
        private _equationService: EquationService,
        private _variableService: VariableService,
        private route: ActivatedRoute,
        private _fuseConfirmationService: FuseConfirmationService,
        private router: Router,
        private _historyService: HistoryService,
        private _encryptionService: EncryptionService

    ) { }

    ngOnInit(): void {
        this.decryptConditionalPart = null;
        this.routeSub = this.route.params.subscribe(params => {
            this.masterFinishesVariableList = [];
            this.masterMaterialVariableList= [];
            this.masterOrderVariableList = [];
            this.masterPricingModelVariableList= [];
            this.masterPrinterVariableList = [];
            this.masterProcessVariableList= [];
            this.route.url.subscribe((res) => {
                this.equationMappedId = res[1]?.path;
                if (res.length > 2) {
                    this.subEquationId = params.id ? params?.id : null;
                }
            });
            this.route?.queryParamMap.subscribe((param: any) => {
                if (param?.params && param?.params?.id) {
                    this.decryptConditionalPart = _.cloneDeep(ConditionalTypes[this._encryptionService.decryptData(param?.params?.id)]);
                }
            })
            this.dataSource = new MatTableDataSource(this.equationParts);
            this.getAllOperatorList();
            // this.getAllEquationFunctionList();
            this.loadAllVariableLists();
            this.getAllEquationPart();

        });
    }

    ngOnDestroy(): void {
        this.routeSub.unsubscribe();
    }

    loadStaticData(data: any) {
        this.equationParts = data.map(data => ({
            id: data._id,
            type: data.type as EquationPartTypes,
            value: data.type == EquationPartTypes.Variable ? data?.variables_value : data.value,
            order: parseInt(data.order),
            function: data.function,
            variable_id: data?.variables_value,
            variables_value: data?.variable_id,
            updated_at : data?.updated_at,
            update_by : data?.UpdatedByUserData?.first_name + ' ' + data?.UpdatedByUserData?.last_name
        }));
        this.dataSource.data = this.equationParts.sort((a, b) => a.order - b.order);
        this.selectedFunction = data[0].function;
    }

    loadAllVariableLists() {
        this.getVariables('ProcessVariable', this.masterProcessVariableList);
        this.getVariables('PrinterVariable', this.masterPrinterVariableList);
        this.getVariables('FinishesVariable', this.masterFinishesVariableList);
        this.getVariables('PricingModelVariable', this.masterPricingModelVariableList);
        this.getVariables('MaterialVariable', this.masterMaterialVariableList);
        this.getVariables('OrderVariable', this.masterOrderVariableList);
    }

    getVariables(variable: string, targetList: any[]): any {
        this._variableService.getAllVariable(`?skip_pagination=true&search=${variable}`).subscribe((result) => {
        const responseList = result.data.result;
        const filteredItems = responseList.filter(item => item._id !== this.equationMappedId);
        targetList.push(...filteredItems);
        });
    }


    getAllOperatorList() {
        this._equationPartService.getAllOperators('?skip_pagination=true').subscribe((result) => {
            this.operators = result.data.result;
        });
    }

    // getAllEquationFunctionList() {
    //     this._equationService.getAllEquation('?skip_pagination=true').subscribe((result) => {
    //         this.equationFunctionList = result.data.result;
    //         this.selectedFunction = this.equationFunctionList.length > 0 ? this.equationFunctionList[0].function_name : '';
    //     });
    // }

    getAllEquationPart() {
        if (this.equationMappedId && this.subEquationId) {
            let url = `?skip_pagination=true&equation_mapped_id=${this.equationMappedId}&sub_equation_id=${this.subEquationId}`
            if (this.decryptConditionalPart) {
                url += `&condition_block=${this.decryptConditionalPart}`
            }
            this._equationPartService.getAllEquationParts(url).subscribe((result) => {
                if (result.data.result.length > 0) {
                    this.isEditApiCall = true;
                    this.loadStaticData(result.data.result);
                } else {
                    this.dataSource.data = [];
                }
            });
        } else {
            this._equationPartService.getAllEquationParts(`?skip_pagination=true&equation_mapped_id=${this.equationMappedId}`).subscribe((result) => {
                if (result.data.result.length > 0) {
                    this.isEditApiCall = true;
                    this.loadStaticData(result.data.result);
                } else {
                    this.dataSource.data = [];
                }
            });
        }
    }

    getOperatorName(id: string): string {
        const operator = this.operators.find(op => op._id === id);
        return operator ? operator.name : '';
    }

    getVariableName(id: string, type: VariableType): string {
        let list;
        switch (type) {
            case VariableType.PrinterVariable:
                list = this.masterPrinterVariableList;
                break;
            case VariableType.MaterialVariable:
                list = this.masterMaterialVariableList;
                break;
            case VariableType.PricingModelVariable:
                list = this.masterPricingModelVariableList;
                break;
            case VariableType.ProcessVariable:
                list = this.masterProcessVariableList;
                break;
            case VariableType.FinishesVariable:
                list = this.masterFinishesVariableList;
                break;
            case VariableType.OrderVariable:
                list = this.masterOrderVariableList;
                break;
            default:
                list = [];
        }
        const variable = list.find(varItem => varItem._id === id);
        return variable ? variable.name : '';
    }

    drop(event: CdkDragDrop<EquationPart[]>) {
        moveItemInArray(this.dataSource.data, event.previousIndex, event.currentIndex);
        this.dataSource.data.forEach((item, index) => item.order = index + 1);
        this.dataSource._updateChangeSubscription();
    }

    edit() {
        this.editing = true;
        this.displayedColumns = ['order', 'type', 'value','updated_at', 'actions'];
        if (!this.dataSource.data.length) this.addPart();
    }

    save() {
        this.isSubmit = true;
        if (!this.dataSource.data.length) {
            this.showError({
                error: {
                    message:
                        'Please Add parts to save this equation.',
                },
            });
            return
        }

        let isValid = true;
        for (let part of this.dataSource.data) {
            part.valid = true; // Reset validation status
            if (part.type === EquationPartTypes.Variable) {
                if (!part.value || !part.variables_value) {
                    part.valid = false;
                    isValid = false;
                }
            } else if (part.type === EquationPartTypes.Operator || part.type === EquationPartTypes.FixedValue) {
                if (!part.value) {
                    part.valid = false;
                    isValid = false;
                }
            }
        }

        if (isValid) {
            const result = this.dataSource.data.map(part => {
                const mappedPart: any = {
                    _id: part?.id ? part?.id : null,
                    equation_mapped_id: this.equationMappedId,
                    sub_equation_id: this.subEquationId,
                    value: part.type === EquationPartTypes.Variable ? null : part.value,
                    type: part.type,
                    order: part.order.toString(),
                    function: this.selectedFunction,
                    variable_id: part.type === EquationPartTypes.Variable ? part.variables_value : null,
                    variables_value: part.type === EquationPartTypes.Variable ? part.value : null,
                    condition_block : this.decryptConditionalPart? this.decryptConditionalPart : null
                };

                if (part.type === EquationPartTypes.Operator || part.type === EquationPartTypes.FixedValue) {
                    mappedPart.value = part.value;
                    mappedPart.variable_id = null;
                    mappedPart.variables_value = null;
                }

                if (part.type === EquationPartTypes.SubEquation || part.type === EquationPartTypes.ConditionalBlock) {
                    mappedPart.variable_id = null;
                    mappedPart.variables_value = null;
                }

                return mappedPart;
            });

            let result$: any;
            if (!this.isEditApiCall) {
                result$ = this._equationPartService.addEquationParts({ equationParts: result })
            } else {
                result$ = this._equationPartService.updateEquationParts(this.equationMappedId, result);
            }

            result$.subscribe((response) => {
                if (response.statusCode == 201 || response.statusCode == 200) {
                    this.getAllEquationPart();
                    this.alert = {
                        "title": "Success",
                        "message": `Equation ${this.isEditApiCall ? 'Updated' : 'Created'} Successfully`,
                        "icon": {
                            "show": true,
                            "name": "heroicons_outline:check-badge",
                            "color": "success"
                        },
                        "actions": {
                            "confirm": {
                                "show": false,
                                "label": "Okay",
                                "color": "accent"
                            },
                            "cancel": {
                                "show": true,
                                "label": "Okay",
                                "color": "accent"

                            }
                        }
                    };
                    this.isSubmit = false;
                    this.editing = false;
                    this.displayedColumns = ['type', 'value','updated_at', 'actions'];
                }
                this.openConfirmationDialog(this.alert);
            }, (error: any) => {
                this.showError(error);
            });
        }
    }

    addPart() {
        const newPart: EquationPart = {
            // id: this.dataSource.data.length + 1,
            type: EquationPartTypes.Operator, // default type
            value: '',
            order: this.dataSource.data.length + 1,
            isNew: true
        };
        this.dataSource.data.push(newPart);
        this.dataSource._updateChangeSubscription();
    }

    deletePart(index: number, part: any) {
        if (part?.isNew) {
            this.dataSource.data.splice(index, 1);
            this.updateOrder();
        } else {
            this.deletePartIndex = index;
            this.deleteExtingPart(part.id);
        }
    }

    deleteExtingPart(id) {
        this.selectedEquationPartId = id;
        this.alert = {
            "title": "Delete Equation",
            "message": "Are you sure you want to delete this Equation ?",
            "icon": {
                "show": true,
                "name": "heroicons_outline:exclamation-triangle",
                "color": "warn"
            },
            "actions": {
                "confirm": {
                    "show": true,
                    "label": "Yes, Delete It!",
                    "color": "warn"
                },
                "cancel": {
                    "show": true,
                    "label": "Cancel"
                }
            }
        };
        this.openConfirmationDialog(this.alert);
    }

    updateOrder() {
        this.dataSource.data.forEach((item, index) => item.order = index + 1);
        this.dataSource._updateChangeSubscription();
    }

    getDependentVariableList(variableType: string) {
        switch (variableType) {
            case VariableType.PrinterVariable:
                return this.masterPrinterVariableList;
            case VariableType.MaterialVariable:
                return this.masterMaterialVariableList;
            case VariableType.PricingModelVariable:
                return this.masterPricingModelVariableList;
            case VariableType.ProcessVariable:
                return this.masterProcessVariableList;
            case VariableType.FinishesVariable:
                return this.masterFinishesVariableList;
            case VariableType.OrderVariable:
                return this.masterOrderVariableList;
            default:
                return [];
        }
    }

    editEquation(element: any) {
        // Implement edit equation logic
        this.router.navigateByUrl('equation/equation-parts/' + this.equationMappedId + '/' + element.id);
        this._historyService.push('equation/equation-parts/' + this.equationMappedId + '/' + element.id);
    }

    navigateIfAllowed(event: Event): void {
        this.decryptConditionalPart = null;
        if (this.editing) {
            event.preventDefault();
            this.showError({
                error: {
                    message:
                        'Please save or cancel the current edit before leaving this page.',
                },
            });
        } else {
            this._historyService.pop();
            const lastPage = this._historyService.getLastHistory();
            if(lastPage){
                this.router.navigateByUrl(lastPage);
            }else{
                this.router.navigateByUrl("pricing-model/list");
            }
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
                this._equationPartService
                    .deleteEquationParts(this.selectedEquationPartId)
                    .subscribe(
                        (response: any) => {
                            if (response.statusCode == 200) {
                                this.dataSource.data.splice(this.deletePartIndex, 1);
                                this.updateOrder();
                            }
                        },
                        (error: any) => {
                            this.showError(error);
                        }
                    );
            }
        });
    }

    cancle() {
        this.getAllEquationPart();
        this.displayedColumns = ['type', 'value','updated_at' ,'actions'];
        this.editing = false;
    }

    editConditionalBlock(equationPart: any, type: ConditionalTypes) {
        const data = this._encryptionService.encryptData(type);
        this.router.navigateByUrl('equation/equation-parts/' + this.equationMappedId + '/' + equationPart.id + `?id=${data}`);
        this._historyService.push('equation/equation-parts/' + this.equationMappedId + '/' + equationPart.id + `?id=${data}`);
    }
}

export interface EquationPart {
    _id?: any;
    type: EquationPartTypes;
    value: any;
    order: number;
    function?: string;
    variable_id?: string | null;
    variables_value?: string | null;
    isNew?: boolean;
    valid?: boolean;
    id?: any
}

export interface Operator {
    _id: string;
    name: string;
}

export interface Variable {
    _id: string;
    name: string;
}
