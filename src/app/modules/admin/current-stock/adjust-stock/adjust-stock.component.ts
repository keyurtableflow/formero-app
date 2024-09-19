import { filter } from 'rxjs';
import { Component } from '@angular/core';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { FormControl, FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { ProductsService } from 'app/core/services/products.service';
import { MatTabsModule } from '@angular/material/tabs';
import { CurrentStockService } from 'app/core/services/current-stock.service';
import { MeasurementService } from 'app/core/services/measurement.service';

@Component({
    selector: 'app-adjust-stock',
    standalone: true,
    imports: [CommonModule, RouterLink, FormsModule, MatTabsModule, NgIf, MatDatepickerModule, ReactiveFormsModule, MatIconModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatSelectModule, NgFor, MatIconModule],
    templateUrl: './adjust-stock.component.html',
    styleUrls: ['./adjust-stock.component.scss']
})
export class AdjustStockComponent {

    alert: { title: string; message: string; icon: { show: boolean; name: string; color: string; }; actions: { confirm: { show: boolean; label: string; color: string; }; cancel: { show: boolean; label: string; }; }; };
    stocktForm: UntypedFormGroup;
    partialStocktForm: UntypedFormGroup;
    productList: any[] = [];
    stockableProductList: any[] = [];
    currentStocktList: any[] = [];
    measurementList:any[] = [];
    selectedStocableProduct: any;
    productControl = new FormControl('', Validators.required);
    stockableProductControl = new FormControl('', Validators.required);
    selectedStockItem: any;
    tabIndex: number = 0;

    constructor(
        private _route: ActivatedRoute,
        private _productService: ProductsService,
        private _formBuilder: UntypedFormBuilder,
        private _fuseConfirmationService: FuseConfirmationService,
        private _router: Router,
        private _currentStockService: CurrentStockService,
        private _measurementService : MeasurementService
    ) { }

    ngOnInit(): void {
        this.getMesurementList();
        this.getProductList();
        this.stocktForm = this._formBuilder.group({
            stock_id: new FormControl('', Validators.required),
            is_write_off: new FormControl(false, Validators.required),
            adjusted_stock: new FormControl(null, Validators.required),
            current_stock: new FormControl(null, Validators.required),
            previous_stock: new FormControl(null, Validators.required),
        });


    }


    getProductList() {
        this._productService.getAllProducts('?skip_pagination=true').subscribe((result: any) => {
            this.productList = result?.data?.result;

            if (history.state?.product_id) {
                this.productControl.setValue(history.state?.product_id);
                this.getStockableProductByProduct(history.state?.product_id);
            }

        }, (error: any) => {
            this.showError(error);
        });
    }

    getStockableProductByProduct(id: any,isManullyChanges?:boolean) {
        this._productService.getStockableFromProduct(id).subscribe((res: any) => {
            this.stockableProductList = res?.data?.result;
            if (history.state?.stockable_product_id && !isManullyChanges ) {
                this.stockableProductControl.setValue(history.state?.stockable_product_id);
                this.selectedStocableProduct = this.stockableProductList.find((stockable) => stockable._id == history.state?.stockable_product_id);
                this.getCurrentStockList();
            }else if(isManullyChanges){
                this.currentStocktList = [];
                this.stocktForm.reset();
            }
        }, (error: any) => {
            this.showError(error);
        });
    }

    getCurrentStockList() {
        let url = `?skip_pagination=true&stockable_product_id=${this.selectedStocableProduct?._id}`
        this._currentStockService.getAllCurrentStock(url).subscribe((result: any) => {
            this.currentStocktList = result.data?.result.filter((stock) =>  stock.current_stock > 0);
            if (history.state?._id) {
                this.stocktForm.get("stock_id").setValue(history.state?._id);
                this.selectedStockItem = this.currentStocktList.find(stp => stp._id === history.state?._id);
            }
        }, (error: any) => {
            this.showError(error);
        });
    }


    onProductChange(event: any): void {
        this.getStockableProductByProduct(event.value,true);
    }

    onStockableProductChange(event: any): void {
        this.selectedStocableProduct = this.stockableProductList.find((stockable) => stockable._id == event.value);
        this.getCurrentStockList();
    }

    onStockItemChange(event: any) {
        this.selectedStockItem = this.currentStocktList.find(stp => stp._id === event.value);
    }

    getMesurementList() {
        this._measurementService.getAllMeasurement('?skip_pagination=true').subscribe((result: any) => {
            this.measurementList = result?.data?.result;
        }, (error: any) => {
            this.showError(error);
        });
    }

    onTabChanged(event) {
        this.tabIndex = event.index;
    }

    submitForm() {
        if (this.tabIndex == 0) {
            this.stocktForm.patchValue({
                is_write_off: true,
                adjusted_stock: this.selectedStockItem?.current_stock,
                previous_stock: this.selectedStockItem?.current_stock,
                current_stock: 0
            });
        } else {
            const currentStock = this.selectedStockItem.current_stock - this.stocktForm.get("adjusted_stock").value;
            this.stocktForm.patchValue({
                is_write_off: false,
                previous_stock: this.selectedStockItem?.current_stock,
                current_stock: currentStock
            })
        }


        if (!this.stocktForm.valid) {
            return
        }
        let result$: any;
        result$ = this._currentStockService.adjustStock(this.stocktForm.value);
        result$.subscribe((response: any) => {
            if (response.statusCode == 201 || response.statusCode == 200) {
                this.alert = {
                    "title": "Success",
                    "message": `Stock adjusted Successfully`,
                    "icon": {
                        "show": true,
                        "name": "heroicons_outline:check-badge",
                        "color": "success"
                    },
                    "actions": {
                        "confirm": {
                            "show": true,
                            "label": "Okay",
                            "color": "accent"
                        },
                        "cancel": {
                            "show": false,
                            "label": "Cancel"
                        }
                    }
                };
                this.openConfirmationDialog(this.alert);
            }
        }, (error: any) => {
            this.showError(error);
        })


    }

    openConfirmationDialog(data: any): void {

        const dialogRef = this._fuseConfirmationService.open(data);

        dialogRef.afterClosed().subscribe((result) => {
            if (result == 'confirmed')
                this._router.navigateByUrl('/current-stock/list')
        });
    }

    showError(err: any) {
        this.alert = {
            "title": "Error",
            "message": err.error.message,
            "icon": {
                "show": true,
                "name": "heroicons_outline:exclamation-triangle",
                "color": "warn"
            },
            "actions": {
                "confirm": {
                    "show": false,
                    "label": "Okay",
                    "color": "warn"
                },
                "cancel": {
                    "show": true,
                    "label": "Okay"
                }
            }
        };
        this.openConfirmationDialog(this.alert);
    }

    getMeasurement(measurementId: string) {
        return this.measurementList.find(measurement => measurement._id == measurementId)?.short_hand;
    }

}
