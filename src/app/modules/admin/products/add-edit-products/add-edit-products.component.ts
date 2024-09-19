import { Component } from '@angular/core';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { FormControl, FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { ProductsService } from 'app/core/services/products.service';
import { MeasurementService } from 'app/core/services/measurement.service';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-add-edit-products',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, NgIf, ReactiveFormsModule, MatIconModule, MatFormFieldModule, MatInputModule,MatButtonModule, MatSelectModule, NgFor, MatIconModule],
  templateUrl: './add-edit-products.component.html',
  styleUrls: ['./add-edit-products.component.scss']
})
export class AddEditProductsComponent {

    alert: { title: string; message: string; icon: { show: boolean; name: string; color: string; }; actions: { confirm: { show: boolean; label: string; color: string; }; cancel: { show: boolean; label: string; }; }; };
    productForm: UntypedFormGroup;
    productId: any;
    measurementList: any[] = [];

    constructor(
        private _formBuilder: UntypedFormBuilder,
        private _fuseConfirmationService: FuseConfirmationService,
        private _router: Router,
        private _route: ActivatedRoute,
        private _productService : ProductsService,
        private _measurementService: MeasurementService,
    ){
        this._route.params.subscribe(params => {
            this.productId = params['id']; // Access the 'id' parameter from the URL
        });
    }

    ngOnInit(): void {
        this.getMeasurementList();
        this.productForm = this._formBuilder.group({
            name: new FormControl('', Validators.required),
            measurement_id: new FormControl('', Validators.required),
            storage_location: new FormControl('', Validators.required),
            storage_requirement: new FormControl('', Validators.required),
            safety_requirement: new FormControl('', Validators.required),
            MSL: new FormControl(null, Validators.required),

        });

        if (this.productId){
            this.getProduct(this.productId);

        }
    }

    getProduct(id: any) {
        this._productService.getProducts(id).subscribe((result: any) => {
            if (result.statusCode == 200) {
                this.productForm.patchValue(result?.data?.result);
                // this.productForm.patchValue({
                //     measurement_id: result?.data?.result?.companyData?._id,
                // })
            }
        }, (error: Error) => {
            this.showError(error);
        })
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
                this._router.navigateByUrl('/products/list')
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

        if (!this.productForm.valid) {
            return
        }
        let result$: any;
        if (!this.productId) {
            result$ = this._productService.addProducts(this.productForm.value)
        } else {
            result$ = this._productService.updateProducts(this.productId, this.productForm.value)
        }


        result$.subscribe((response: any) => {
            if (response.statusCode == 201 || response.statusCode == 200) {
                this.alert = {
                    "title": "Success",
                    "message": `Product ${this.productId ? 'Updated' : 'Created'} Successfully`,
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
