import { NgFor } from '@angular/common';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatStepperModule } from '@angular/material/stepper';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { CompanyService } from 'app/core/services/company.service';
import { CdkAccordionModule } from '@angular/cdk/accordion';

@Component({
    selector: 'app-add-edit-company',
    templateUrl: './add-edit-company.component.html',
    styleUrls: ['./add-edit-company.component.scss'],
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [RouterLink, NgFor, MatIconModule, CdkAccordionModule, FormsModule, ReactiveFormsModule, MatStepperModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatOptionModule, MatButtonModule, MatCheckboxModule, MatRadioModule],
})
export class AddEditCompanyComponent {
    verticalStepperForm: UntypedFormGroup;
    roleList: any[] = [];
    companyId: any = ''

    constructor(
        private _formBuilder: FormBuilder,
        private _companyService: CompanyService,
        private _fuseConfirmationService: FuseConfirmationService,
        private _router: Router,
        private _route: ActivatedRoute) {
        this._route.params.subscribe(params => {
            this.companyId = params['id']; // Access the 'id' parameter from the URL
        });
    }

    ngOnInit(): void {
        // Vertical stepper form
        this.verticalStepperForm = this._formBuilder.group({
            companyDetails: this._formBuilder.group({
                name: ['', Validators.required],
                description: ['', Validators.required],
                tags: [''],
                lists: [''],
                type: [''],
                available_processes: [[]],
                company_email: ['', [Validators.required, Validators.email]],
                phone_number: ['', Validators.required],
                website: [''],
                currency: [''],
                payment_terms: [''],
                payment_status: [''],
                notes_timeline: [''],
                documents: [''],
                quotes_opportunity: ['']
            }),
            companyContacts: this._formBuilder.array([]),
            companyAddresses: this._formBuilder.array([])
        });

        if (this.companyId)
            this.getCompany(this.companyId)
        else{
            this.addAddress()
            this.addContact()
        }
    }

    getCompany(id: any) {
        this._companyService.getCompanyById(id).subscribe((result: any) => {
            if (result.statusCode == 200) {
                this.verticalStepperForm.get('companyDetails').patchValue(result?.data?.result?.companyDetails);

                result?.data?.result?.companyDetails?.contacts.map(contact => {
                    this.items.push(this._formBuilder.group(contact))
                })

                result?.data?.result?.companyDetails?.addresses.map(contact => {
                    this.address.push(this._formBuilder.group(contact))
                })

                this.verticalStepperForm.updateValueAndValidity();
            }

        }, (error: Error) => {
            this.showError(error);
        })
    }

    get items(): FormArray {
        return this.verticalStepperForm.get("companyContacts") as FormArray
    }

    newContact() {
        return this._formBuilder.group({
            _id: [''],
            first_name: ['', Validators.required],
            last_name: [''],
            position: ['', Validators.required],
            mobile_number: ['', Validators.required],
            tags: [''],
            lists: [''],
            assigned_to: [''],
            phone_number_work: [''],
            email: ['', [Validators.email]],
            email_1: ['', Validators.email],
            linkedin: [''],
            main_industry_type: [''],
            active: [true],
            contact_type: [''],
            follow_up_date: [''],
            do_not_call: [false],
            do_not_call_reason: [''],
            do_not_mail: [false],
            do_not_mail_reason: [''],
            physical_address: [''],
            do_not_sms: [false],
            do_not_sms_reason: [''],
            marketing_opt_in_source: [''],
            marketing_opt_in_date: [''],
            _3D_sample: [''],
            _3D_sample_sent: [''],
            postal_address: [''],
            notes: [''],
        })
    }

    addContact() {
        this.items.push(this.newContact())
    }

    get address(): FormArray {
        return this.verticalStepperForm.get("companyAddresses") as FormArray
    }

    newAddress() {
        return this._formBuilder.group({
            _id: [''],
            address_type: ['', Validators.required],
            address: ['', Validators.required],
            isPrimary: [true, Validators.required],
        })
    }

    addAddress() {
        this.address.push(this.newAddress());
    }

    submitForm() {
        if (!this.verticalStepperForm.valid) {
            return
        }

        let data = this.updateData(this.verticalStepperForm.value)
        let result$: any;
        if (!this.companyId) {
            result$ = this._companyService.addCompany(data)
        } else {
            data.companyDetails['_id'] = this.companyId;
            result$ = this._companyService.updateCompany(data)
        }


        result$.subscribe((response: any) => {
            if (response.statusCode == 201 || response.statusCode == 200) {
                let alert = {
                    "title": "Success",
                    "message": `Company ${this.companyId ? 'Updated' : 'Created'} Successfully`,
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
                this.openConfirmationDialog(alert);
            }
        }, (error: any) => {
            this.showError(error);
        })
    }

    updateData(data) {
        data?.companyAddresses.map(obj => {
            if (obj._id == '')
                delete obj._id;
        });

        data?.companyContacts.map(obj => {
            if (obj._id == '')
                delete obj._id;
        });

        return data;
    }

    openConfirmationDialog(data: any): void {

        const dialogRef = this._fuseConfirmationService.open(data);

        dialogRef.afterClosed().subscribe((result) => {
            if (result == 'confirmed')
                this._router.navigateByUrl('/company/list')
        });
    }

    showError(err: any) {
        let alert = {
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
        this.openConfirmationDialog(alert);
    }

}
