import { Component } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { FormControl, FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { MeasurementService } from 'app/core/services/measurement.service';
import { MatButtonModule } from '@angular/material/button';

@Component({
    selector: 'app-add-edit-measurement',
    standalone: true,
    imports: [CommonModule, RouterLink, FormsModule, NgIf, ReactiveFormsModule, MatIconModule, MatFormFieldModule, MatInputModule,MatButtonModule],
    templateUrl: './add-edit-measurement.component.html',
    styleUrls: ['./add-edit-measurement.component.scss']
})
export class AddEditMeasurementComponent {

    alert: { title: string; message: string; icon: { show: boolean; name: string; color: string; }; actions: { confirm: { show: boolean; label: string; color: string; }; cancel: { show: boolean; label: string; }; }; };
    measurementForm: UntypedFormGroup;
    measurementId: any;

    constructor(
        private _formBuilder: UntypedFormBuilder,
        private _fuseConfirmationService: FuseConfirmationService,
        private _router: Router,
        private _measurementService:MeasurementService,
        private _route: ActivatedRoute,
    ) {
        this._route.params.subscribe(params => {
            this.measurementId = params['id']; // Access the 'id' parameter from the URL
        });
    }

    ngOnInit(): void {
        this.measurementForm = this._formBuilder.group({
            name: new FormControl('', Validators.required),
            short_hand: new FormControl('', Validators.required),
            singular: new FormControl('', Validators.required),
            plural: new FormControl('', Validators.required),
        });

        if (this.measurementId)
            this.getMeasurement(this.measurementId)
    }

    getMeasurement(id: any) {
        this._measurementService.getMeasurement(id).subscribe((result: any) => {
            if (result.statusCode == 200) {
                this.measurementForm.patchValue(result?.data?.result);
            }
        }, (error: Error) => {
            this.showError(error);
        })
    }

    openConfirmationDialog(data: any): void {

        const dialogRef = this._fuseConfirmationService.open(data);

        dialogRef.afterClosed().subscribe((result) => {
            if (result == 'confirmed')
                this._router.navigateByUrl('/measurement/list')
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

        if (!this.measurementForm.valid) {
            return
        }
        let result$: any;
        if (!this.measurementId) {
            result$ = this._measurementService.addMeasurement(this.measurementForm.value)
        } else {
            result$ = this._measurementService.updateMeasurement(this.measurementId, this.measurementForm.value)
        }


        result$.subscribe((response: any) => {
            if (response.statusCode == 201 || response.statusCode == 200) {
                this.alert = {
                    "title": "Success",
                    "message": `Measurement ${this.measurementId ? 'Updated' : 'Created'} Successfully`,
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
