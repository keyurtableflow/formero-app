import { Component } from '@angular/core';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { FormControl, FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { MeasurementService } from 'app/core/services/measurement.service';
import { ProductsService } from 'app/core/services/products.service';
import { StockableProductService } from 'app/core/services/stockable-products.service';
import { CompanyService } from 'app/core/services/company.service';

@Component({
    selector: 'app-add-edit-stockable-products',
    standalone: true,
    imports: [CommonModule, RouterLink, FormsModule, NgIf, ReactiveFormsModule, MatIconModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatSelectModule, NgFor, MatIconModule],
    templateUrl: './add-edit-stockable-products.component.html',
    styleUrls: ['./add-edit-stockable-products.component.scss']
})
export class AddEditStockableProductsComponent {

    alert: { title: string; message: string; icon: { show: boolean; name: string; color: string; }; actions: { confirm: { show: boolean; label: string; color: string; }; cancel: { show: boolean; label: string; }; }; };
    stockableProductForm: UntypedFormGroup;
    stockableProductId: any;
    productList: any[] = [];
    supplierList: any[] = [];
    measurementList: any[] = [];
    selectedMeasurement :any;
    selectedProduct:any;

    constructor(
        private _formBuilder: UntypedFormBuilder,
        private _fuseConfirmationService: FuseConfirmationService,
        private _router: Router,
        private _route: ActivatedRoute,
        private _productService: ProductsService,
        private _measurementService: MeasurementService,
        private _stockableProductService: StockableProductService,
        private _companyService: CompanyService
    ) {
        this._route.params.subscribe(params => {
            this.stockableProductId = params['id']; // Access the 'id' parameter from the URL
        });
    }

    ngOnInit(): void {
        this.getMeasurementList();
        this.getProductList();
        this.getSupplierList();
        this.stockableProductForm = this._formBuilder.group({
            product_id: new FormControl('', Validators.required),
            name: new FormControl('', Validators.required),
            sku: new FormControl('', Validators.required),
            measurement_id: new FormControl('', Validators.required),
            supplier_id: new FormControl('', Validators.required),
            stock_ratio: new FormControl(null, Validators.required),
            default_reorder_quantity: new FormControl(null, Validators.required),


        });

        if (this.stockableProductId) {
            this.getStockableProduct(this.stockableProductId);

        }
    }


    getStockableProduct(id: any) {
        this._stockableProductService.getStockableProducts(id).subscribe((result: any) => {
            if (result.statusCode == 200) {
                this.stockableProductForm.patchValue(result?.data?.result);
                setTimeout(() => {
                    this.onMeasurementChange({value:this.stockableProductForm.get('measurement_id').value});
                    this.onProductChange({value:this.stockableProductForm.get('product_id').value})
                }, 200);

            }
        }, (error: Error) => {
            this.showError(error);
        })
    }

    getProductList() {
        this._productService.getAllProducts('?skip_pagination=true').subscribe((result: any) => {
            this.productList = result?.data?.result;
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

    onMeasurementChange(event: any): void {
        const selectedMeasurementId = event.value;
        this.selectedMeasurement = this.measurementList.find(measurement => measurement._id === selectedMeasurementId);
      }

      onProductChange(event: any): void {
        const selectedProducttId = event.value;
        this.selectedProduct = this.productList.find(product => product._id === selectedProducttId);
      }


    getMeasurementList() {
        this._measurementService.getAllMeasurement('?skip_pagination=true').subscribe((result: any) => {
            this.measurementList = result?.data?.result;
        }, (error: any) => {
            this.showError(error);
        });
    }

    openConfirmationDialog(data: any): void {

        const dialogRef = this._fuseConfirmationService.open(data);

        dialogRef.afterClosed().subscribe((result) => {
            if (result == 'confirmed')
                this._router.navigateByUrl('/stockable-products/list')
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

        if (!this.stockableProductForm.valid) {
            return
        }
        let result$: any;
        if (!this.stockableProductId) {
            result$ = this._stockableProductService.addStockableProducts(this.stockableProductForm.value)
        } else {
            result$ = this._stockableProductService.updateStockableProducts(this.stockableProductId, this.stockableProductForm.value)
        }


        result$.subscribe((response: any) => {
            if (response.statusCode == 201 || response.statusCode == 200) {
                this.alert = {
                    "title": "Success",
                    "message": `Stockable product ${this.stockableProductId ? 'Updated' : 'Created'} Successfully`,
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
