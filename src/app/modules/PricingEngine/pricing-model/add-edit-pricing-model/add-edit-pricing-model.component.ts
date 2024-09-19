import { Component } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormControl, FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { PricingModelService } from 'app/core/services/pricing-model.service';
import { FuseConfirmationService } from '@fuse/services/confirmation';

@Component({
  selector: 'app-add-edit-pricing-model',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, NgIf, ReactiveFormsModule, MatIconModule, MatFormFieldModule, MatInputModule,MatButtonModule],
  templateUrl: './add-edit-pricing-model.component.html',
  styleUrls: ['./add-edit-pricing-model.component.scss']
})
export class AddEditPricingModelComponent {

    alert: { title: string; message: string; icon: { show: boolean; name: string; color: string; }; actions: { confirm: { show: boolean; label: string; color: string; }; cancel: { show: boolean; label: string; }; }; };
    pricingModelForm: UntypedFormGroup;
    pricingModelId: any;

    constructor(
        private _formBuilder: UntypedFormBuilder,
        private _fuseConfirmationService: FuseConfirmationService,
        private _router: Router,
        private _pricingModelService:PricingModelService,
        private _route: ActivatedRoute,
    ) {
        this._route.params.subscribe(params => {
            this.pricingModelId = params['id']; // Access the 'id' parameter from the URL
        });
    }

    ngOnInit(): void {
        this.pricingModelForm = this._formBuilder.group({
            name: new FormControl('', Validators.required),
        });

        if (this.pricingModelId)
            this.getPricingModel(this.pricingModelId)
    }

    getPricingModel(id: any) {
        this._pricingModelService.getPricingModel(id).subscribe((result: any) => {
            if (result.statusCode == 200) {
                this.pricingModelForm.patchValue(result?.data?.result);
            }
        }, (error: Error) => {
            this.showError(error);
        })
    }

    openConfirmationDialog(data: any): void {

        const dialogRef = this._fuseConfirmationService.open(data);

        dialogRef.afterClosed().subscribe((result) => {
            if (result == 'confirmed')
                this._router.navigateByUrl('/pricing-model/list')
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

        if (!this.pricingModelForm.valid) {
            return
        }
        let result$: any;
        if (!this.pricingModelId) {
            result$ = this._pricingModelService.addPricingModel(this.pricingModelForm.value)
        } else {
            result$ = this._pricingModelService.updatePricingModel(this.pricingModelId, this.pricingModelForm.value)
        }


        result$.subscribe((response: any) => {
            if (response.statusCode == 201 || response.statusCode == 200) {
                this.alert = {
                    "title": "Success",
                    "message": `Pricing model ${this.pricingModelId ? 'Updated' : 'Created'} Successfully`,
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
