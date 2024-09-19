import { Component } from '@angular/core';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormControl, FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { CurrentStockService } from 'app/core/services/current-stock.service';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { MatSelectModule } from '@angular/material/select';
import { ProductsService } from 'app/core/services/products.service';
import { StockableProductService } from 'app/core/services/stockable-products.service';
import { CompanyService } from 'app/core/services/company.service';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { pairwise, startWith } from 'rxjs';

@Component({
    selector: 'app-add-edit-current-stock',
    standalone: true,
    imports: [CommonModule, RouterLink, FormsModule, NgIf, MatDatepickerModule, ReactiveFormsModule, MatIconModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatSelectModule, NgFor, MatIconModule],
    templateUrl: './add-edit-current-stock.component.html',
    styleUrls: ['./add-edit-current-stock.component.scss']
})
export class AddEditCurrentStockComponent {

    alert: { title: string; message: string; icon: { show: boolean; name: string; color: string; }; actions: { confirm: { show: boolean; label: string; color: string; }; cancel: { show: boolean; label: string; }; }; };
    currentStocktForm: UntypedFormGroup;
    currentStocktId: any;
    productList: any[] = [];
    stockableProductList: any[] = [];
    supplierList: any[] = [];
    selectedStockableProduct: any;
    selectedProduct: any;

    constructor(
        private _formBuilder: UntypedFormBuilder,
        private _fuseConfirmationService: FuseConfirmationService,
        private _router: Router,
        private _currentStockService: CurrentStockService,
        private _route: ActivatedRoute,
        private _productService: ProductsService,
        private _companyService: CompanyService
    ) {
        this._route.params.subscribe(params => {
            this.currentStocktId = params['id']; // Access the 'id' parameter from the URL
        });
    }

    ngOnInit(): void {
        this.getProductList();
        this.getSupplierList();
        this.currentStocktForm = this._formBuilder.group({
            product_id: new FormControl('', Validators.required),
            stockable_product_id: new FormControl('', Validators.required),
            quantity: new FormControl(null, Validators.required),
            foreign_value: new FormControl(null, Validators.required),
            exchange_value: new FormControl(null, Validators.required),
            serial_number: new FormControl('', Validators.required),
            batch_number: new FormControl('', Validators.required),
            expiry_date: new FormControl('', Validators.required),
            supplier_id: new FormControl({
                value: "",
                disabled: true
            }, Validators.required),
            current_stock: new FormControl({
                value: null,
                disabled: true
            }, Validators.required),
        });

        this.currentStocktForm.get('quantity')
            .valueChanges
            .pipe(startWith(null), pairwise())
            .subscribe(([prev, next]: [any, any]) => {
                if (this.currentStocktForm.get('stockable_product_id')) {
                    this.currentStocktForm.get('current_stock').setValue(this.selectedStockableProduct?.stock_ratio * next);
                }
            });


        this.currentStocktForm.get('stockable_product_id')
            .valueChanges
            .pipe(startWith(null), pairwise())
            .subscribe(([prev, next]: [any, any]) => {
                if (this.currentStocktForm.get('quantity')) {
                    const stockable = this.stockableProductList.find(prod => prod._id == next);
                    this.currentStocktForm.get('current_stock').setValue(this.currentStocktForm.get('quantity').value * stockable?.stock_ratio);
                }
            });


        if (this.currentStocktId)
            this.getCurrentStock(this.currentStocktId)
    }

    getCurrentStock(id: any) {
        this._currentStockService.getCurrentStock(id).subscribe((result: any) => {
            if (result.statusCode == 200) {
                this.currentStocktForm.patchValue(result?.data?.result);
            }
        }, (error: Error) => {
            this.showError(error);
        })
    }

    getProductList() {
        this._productService.getAllProducts('?skip_pagination=true').subscribe((result: any) => {
            this.productList = result?.data?.result;
            if(history.state.key == "product_id"){
                this.currentStocktForm.get('product_id').setValue(history?.state?.value);
                this.selectedProduct = this.productList.find(product => product._id == history?.state?.value);
                this.getStockableProductByProduct(history?.state?.value);
            }

            if(history.state.key == "stockable_product_id"){
                this.getStockableProductByProduct(history?.state?.productId);
                this.currentStocktForm.get('product_id').setValue(history?.state?.productId);
            }

        }, (error: any) => {
            this.showError(error);
        });
    }

    getSupplierList() {
        this._companyService.getAllCompany('?skip_pagination=true').subscribe((result: any) => {
            this.supplierList = result?.data?.result;
        }, (error: any) => {
            this.showError(error);
        });
    }

    getStockableProductByProduct(id: any) {
        this._productService.getStockableFromProduct(id).subscribe((res: any) => {
            this.stockableProductList = res?.data?.result;
            if(history.state.key == "stockable_product_id"){
                this.currentStocktForm.get('stockable_product_id').setValue(history?.state?.value);
                this.selectedStockableProduct = this.stockableProductList.find((supplier) => supplier._id == history?.state?.value);
                this.currentStocktForm.get("supplier_id").setValue(this.selectedStockableProduct?.supplierData?._id);

            }
        }, (error: any) => {
            this.showError(error);
        });
    }

    onProductChange(event: any): void {
        this.currentStocktForm.get("supplier_id").setValue("");
        this.selectedProduct = this.productList.find(product => product._id == event.value);
        this.getStockableProductByProduct(event.value);
    }

    onStockableProductChange(event: any): void {
        this.selectedStockableProduct = this.stockableProductList.find((supplier) => supplier._id == event.value);
        this.currentStocktForm.get("supplier_id").setValue(this.selectedStockableProduct?.supplierData?._id);
        this.currentStocktForm.get('quantity').setValue(this.selectedStockableProduct?.default_reorder_quantity);
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

    submitForm() {
        if (!this.currentStocktForm.valid) {
            return
        }
        let result$: any;
        if (!this.currentStocktId) {
            result$ = this._currentStockService.addCurrentStock(this.currentStocktForm.getRawValue())
        } else {
            result$ = this._currentStockService.updateCurrentStock(this.currentStocktId, this.currentStocktForm.getRawValue())
        }


        result$.subscribe((response: any) => {
            if (response.statusCode == 201 || response.statusCode == 200) {
                this.alert = {
                    "title": "Success",
                    "message": `Stock ${this.currentStocktId ? 'Updated' : 'Created'} Successfully`,
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




}
