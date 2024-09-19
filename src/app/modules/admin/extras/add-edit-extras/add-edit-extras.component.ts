import { Component } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { FormControl, FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { ExtrasService } from 'app/core/services/extras.service';

@Component({
  selector: 'app-add-edit-extras',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, NgIf, ReactiveFormsModule, MatIconModule, MatFormFieldModule, MatInputModule,MatButtonModule],
  templateUrl: './add-edit-extras.component.html',
  styleUrls: ['./add-edit-extras.component.scss']
})
export class AddEditExtrasComponent {
    alert: { title: string; message: string; icon: { show: boolean; name: string; color: string; }; actions: { confirm: { show: boolean; label: string; color: string; }; cancel: { show: boolean; label: string; }; }; };
    extrasForm: UntypedFormGroup;
    extrasId: any;
    formFieldHelpers: string[] = [''];

    constructor(
        private _formBuilder: UntypedFormBuilder,
        private _fuseConfirmationService: FuseConfirmationService,
        private _router: Router,
        private _extrasService:ExtrasService,
        private _route: ActivatedRoute,
    ) {
        this._route.params.subscribe(params => {
            this.extrasId = params['id']; // Access the 'id' parameter from the URL
        });
    }

    ngOnInit(): void {
        this.extrasForm = this._formBuilder.group({
            name: new FormControl('', Validators.required),
            price: new FormControl(null, [Validators.required, Validators.pattern(/^\d+(\.\d{1,2})?$/)]),
            description: new FormControl(''),
        });

        if (this.extrasId)
            this.getMeasurement(this.extrasId)
    }

    getMeasurement(id: any) {
        this._extrasService.getExtrasById(id).subscribe((result: any) => {
            if (result.statusCode == 200) {
                 this.extrasForm.patchValue(result?.data?.result);
                this.extrasForm.get('price').setValue(result?.data?.result?.price?.$numberDecimal);
            }
        }, (error: Error) => {
            this.showError(error);
        })
    }

    openConfirmationDialog(data: any): void {

        const dialogRef = this._fuseConfirmationService.open(data);

        dialogRef.afterClosed().subscribe((result) => {
            if (result == 'confirmed')
                this._router.navigateByUrl('/extras/list')
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

        if (!this.extrasForm.valid) {
            return
        }
        let result$: any;
        if (!this.extrasId) {
            result$ = this._extrasService.addExtras(this.extrasForm.value)
        } else {
            result$ = this._extrasService.updateExtras(this.extrasId, this.extrasForm.value)
        }


        result$.subscribe((response: any) => {
            if (response.statusCode == 201 || response.statusCode == 200) {
                this.alert = {
                    "title": "Success",
                    "message": `Extra ${this.extrasId ? 'Updated' : 'Created'} Successfully`,
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
