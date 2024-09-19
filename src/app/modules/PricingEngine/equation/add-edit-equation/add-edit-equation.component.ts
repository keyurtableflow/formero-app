import { Component } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { FormControl, FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { EquationService } from 'app/core/services/equation.service';

@Component({
  selector: 'app-add-edit-equation',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, NgIf, ReactiveFormsModule, MatIconModule, MatFormFieldModule, MatInputModule,MatButtonModule],
  templateUrl: './add-edit-equation.component.html',
  styleUrls: ['./add-edit-equation.component.scss']
})
export class AddEditEquationComponent {

    alert: { title: string; message: string; icon: { show: boolean; name: string; color: string; }; actions: { confirm: { show: boolean; label: string; color: string; }; cancel: { show: boolean; label: string; }; }; };
    equationForm: UntypedFormGroup;
    equationId: any;


    constructor(
        private _formBuilder: UntypedFormBuilder,
        private _fuseConfirmationService: FuseConfirmationService,
        private _router: Router,
        private _route: ActivatedRoute,
        private _equationService: EquationService
    ) {
        this._route.params.subscribe(params => {
            this.equationId = params['id']; // Access the 'id' parameter from the URL
        });
    }

    ngOnInit(): void {
        this.equationForm = this._formBuilder.group({
            function_name: new FormControl('', Validators.required),
        });

        if (this.equationId)
            this.getEquation(this.equationId)
    }

    getEquation(id: any) {
        this._equationService.getEquation(id).subscribe((result: any) => {
            if (result.statusCode == 200) {
                this.equationForm.patchValue(result?.data?.result);
            }
        }, (error: Error) => {
            this.showError(error);
        })
    }

    openConfirmationDialog(data: any): void {

        const dialogRef = this._fuseConfirmationService.open(data);

        dialogRef.afterClosed().subscribe((result) => {
            if (result == 'confirmed')
                this._router.navigateByUrl('/equation/list')
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

        if (!this.equationForm.valid) {
            return
        }
        let result$: any;
        if (!this.equationId) {
            result$ = this._equationService.addEquation(this.equationForm.value)
        } else {
            result$ = this._equationService.updateEquation(this.equationId, this.equationForm.value)
        }


        result$.subscribe((response: any) => {
            if (response.statusCode == 201 || response.statusCode == 200) {
                this.alert = {
                    "title": "Success",
                    "message": `Equation ${this.equationId ? 'Updated' : 'Created'} Successfully`,
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
