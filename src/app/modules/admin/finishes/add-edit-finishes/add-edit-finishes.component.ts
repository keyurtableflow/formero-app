import { JsonPipe, NgFor, NgIf, TitleCasePipe } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, SimpleChanges, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FuseHighlightComponent } from '@fuse/components/highlight';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { ColourService } from 'app/core/services/colour.service';
import { FinishesService } from 'app/core/services/finishes.service';
import { ProcessService } from 'app/core/services/process.service';
import { SelectAllOptionComponent } from "../../common/select-all-option/select-all-option.component";

@Component({
    selector: 'app-add-edit-finishes',
    templateUrl: './add-edit-finishes.component.html',
    styleUrls: ['./add-edit-finishes.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [RouterLink, FormsModule, NgIf, ReactiveFormsModule, MatIconModule, MatFormFieldModule, MatInputModule, MatCheckboxModule, MatSelectModule, NgFor, MatOptionModule, MatButtonModule, FuseHighlightComponent, JsonPipe, TitleCasePipe, SelectAllOptionComponent]
})

export class AddEditFinishesComponent {
    finishesForm: UntypedFormGroup;
    alert: { title: string; message: string; icon: { show: boolean; name: string; color: string; }; actions: { confirm: { show: boolean; label: string; color: string; }; cancel: { show: boolean; label: string; }; }; };
    finishesId: any;
    processList: any;
    colourList: any[] = [];
    allSelected: boolean = false;
    colours: any[];
    // last_selection = null;
    constructor(
        private _formBuilder: UntypedFormBuilder,
        private _fuseConfirmationService: FuseConfirmationService,
        private _router: Router,
        private _finishesService: FinishesService,
        private _route: ActivatedRoute,
        private _processService: ProcessService,
        private _colourService: ColourService,
        private _changeDetectorRef: ChangeDetectorRef,
    ) {
        this._route.params.subscribe(params => {
            this.finishesId = params['id']; // Access the 'id' parameter from the URL
        });
    }

    ngOnInit(): void {
        // Build the config form
        this.getprocessList()
        this.getColourList()
        this.finishesForm = this._formBuilder.group({
            finishing_name: new FormControl('', Validators.required),
            // colours: new FormControl([], Validators.required),
            // available_processes: new FormControl([], Validators.required),
            default_finish  : new FormControl(false, Validators.required),
            // price: new FormControl(null, [Validators.required, Validators.pattern(/^\d+(\.\d{1,2})?$/)]),
            // price_comment: new FormControl('', Validators.required),
            description: new FormControl('', Validators.required),
        });
        // this.last_selection = this.finishesForm.controls.colours.value


        if (this.finishesId)
            this.getFinishes(this.finishesId)

    }

    getFinishes(id: any) {
        this._finishesService.getFinishesById(id).subscribe((result: any) => {
            if (result.statusCode == 200) {
                this.finishesForm.patchValue(result?.data?.result);
                // this.finishesForm.patchValue({
                //     price : result?.data?.result?.price?.$numberDecimal,
                //     colours : result?.data?.result?.colourData?.map(color => color._id),
                //     available_processes : result?.data?.result?.processData.map(process => process._id)
                // });
                this._changeDetectorRef.detectChanges();

            }

        }, (error: Error) => {
            this.showError(error);
        })
    }

    getprocessList() {
        this._processService.getAllProcess('?skip_pagination=true').subscribe((result: any) => {
            this.processList = result?.data?.result;
            // this.processList = this.materials;
        }, (error: any) => {
            this.showError(error)
        });
    }

    getColourList() {
        this._colourService.getAllColour('?skip_pagination=true').subscribe((result: any) => {
            this.colourList = result?.data?.result;
            }, (error: any) => {
                this.showError(error)

        });
    }

    openConfirmationDialog(data: any): void {

        const dialogRef = this._fuseConfirmationService.open(data);

        dialogRef.afterClosed().subscribe((result) => {
            if (result == 'confirmed')
                this._router.navigateByUrl('/finishes/list')
        });
    }

    ngOnChanges(changes: SimpleChanges): void {
        this._changeDetectorRef.detectChanges();
    }

    submitForm() {

        if (!this.finishesForm.valid) {
            return
        }
        let result$: any;
        if (!this.finishesId) {
            result$ = this._finishesService.addFinishes(this.finishesForm.value)
        } else {
            result$ = this._finishesService.updateFinishes(this.finishesId, this.finishesForm.value)
        }


        result$.subscribe((response: any) => {
            if (response.statusCode == 201 || response.statusCode == 200) {
                this.alert = {
                    "title": "Success",
                    "message": `Finishes ${this.finishesId ? 'Updated' : 'Created'} Successfully`,
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
}



