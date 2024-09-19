import { JsonPipe, NgClass, NgFor, NgIf, TitleCasePipe } from '@angular/common';
import { Component, ViewEncapsulation } from '@angular/core';
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
import { FileManagementService } from 'app/core/services/filemanagement.service';
import { MaterialService } from 'app/core/services/material.service';
import { SelectAllOptionComponent } from "../../common/select-all-option/select-all-option.component";
import { FinishesService } from 'app/core/services/finishes.service';
import { ExtrasService } from 'app/core/services/extras.service';

@Component({
    selector: 'app-add-edit-material',
    templateUrl: './add-edit-material.component.html',
    styleUrls: ['./add-edit-material.component.scss'],
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [RouterLink, NgIf, FormsModule, NgClass, ReactiveFormsModule, MatIconModule, MatFormFieldModule, MatInputModule, MatCheckboxModule, MatSelectModule, NgFor, MatOptionModule, MatButtonModule, FuseHighlightComponent, JsonPipe, TitleCasePipe, SelectAllOptionComponent],
})
export class AddEditMaterialComponent {
    configForm: UntypedFormGroup;
    finishesList :any[] = [];
    extrrasList :any[] = [];
    materialId!: any;
    alert: any = null;
    formFieldHelpers: string[] = [''];
    folderName: string = "specFiles";
    uploadedFile: File;
    filePath: string = null;
    serverFileName: string | null = null;
    serverFileUrl: string | null = null;

    // for avoid duplicatefile upload
    fileUploadCount: number = 0;
    count: number = 0;

    constructor(
        private _formBuilder: UntypedFormBuilder,
        private _fuseConfirmationService: FuseConfirmationService,
        private _router: Router,
        private _materialService: MaterialService,
        private _route: ActivatedRoute,
        private _finishesService: FinishesService,
        private _extrasService: ExtrasService,
        private _fileManagementService: FileManagementService
    ) {
        this._route.params.subscribe(params => {
            this.materialId = params['id']; // Access the 'id' parameter from the URL
        });
    }

    ngOnInit(): void {
        this.getFinishesList();
        this.getExtrasList();

        // Build the config form
        this.configForm = this._formBuilder.group({
            material_name: new FormControl('', Validators.required),
            thickness: new FormControl(null, [ Validators.pattern(/^\d+(\.\d{1,2})?$/)]),
            filling: new FormControl(null, [ Validators.pattern(/^\d+(\.\d{1,2})?$/)]),
            thickness_comment: new FormControl(''),
            description: new FormControl(''),
            spec_sheet: new FormControl(''),
            length: new FormControl(null, [Validators.required, Validators.pattern(/^\d+(\.\d{1,2})?$/)]),
            width: new FormControl(null,[Validators.required, Validators.pattern(/^\d+(\.\d{1,2})?$/)]),
            height: new FormControl(null,[Validators.required, Validators.pattern(/^\d+(\.\d{1,2})?$/)]),
            set_up_fee : new FormControl(null, [Validators.required, Validators.pattern(/^\d+(\.\d{1,2})?$/)]),
            order_value : new FormControl(null, [Validators.required, Validators.pattern(/^\d+(\.\d{1,2})?$/)]),
            finishes_ids : new FormControl([]),
            extras_ids : new FormControl([]),


        });

        if (this.materialId)
            this.getMaterial(this.materialId)
    }

    getMaterial(id: any) {
        this._materialService.getMaterial(id).subscribe((result: any) => {
            if (result.statusCode == 200) {
                const patchData = {
                    ...result?.data?.result,
                    finishes_ids: result?.data?.result?.finishesData?.map((finishes: any) => finishes?._id),
                    extras_ids: result?.data?.result?.extrasData?.map((extras: any) => extras?._id),
                    thickness: result?.data?.result?.thickness?.$numberDecimal,
                    filling: result?.data?.result?.thickness?.$numberDecimal,
                    set_up_fee : result?.data?.result?.set_up_fee?.$numberDecimal,
                    order_value : result?.data?.result?.set_up_fee?.$numberDecimal,
                    height : result?.data?.result?.height?.$numberDecimal,
                    length: result?.data?.result?.length?.$numberDecimal,
                    width : result?.data?.result?.width?.$numberDecimal,
                  };
                this.getUploadedFile(result?.data?.result?.spec_sheet);
                this.configForm.patchValue(patchData);

            }
        })
    }

    getFinishesList() {
        this._finishesService.getAllFinishes('?skip_pagination=true').subscribe((result: any) => {
            this.finishesList = result?.data?.result;
        }, (error: any) => {
            this.showError(error);
        });
    }

    getExtrasList() {
        this._extrasService.getAllExtras('?skip_pagination=true').subscribe((result: any) => {
            this.extrrasList = result?.data?.result;
        }, (error: any) => {
            this.showError(error);
        });
    }

    openConfirmationDialog(data: any): void {
        // Open the dialog and save the reference of it
        const dialogRef = this._fuseConfirmationService.open(data);

        // Subscribe to afterClosed from the dialog reference
        dialogRef.afterClosed().subscribe((result) => {
            if (result == 'confirmed')
                this._router.navigateByUrl('/material/list')
        });
    }

    onFileSelected(event: any) {
        const file = (event.target as HTMLInputElement).files![0];
        this.uploadedFile = file;
        this.serverFileName = null;
        this.fileUploadCount = this.fileUploadCount + 1;
    }

    submitForm() {
        if (this.count != this.fileUploadCount) {
            this.count = this.fileUploadCount;
            const formData = new FormData();
            formData.append('files', this.uploadedFile);
            this._fileManagementService.uploadSingleFile(this.folderName, formData).subscribe((res) => {
                if (res?.statusCode == 200) {
                    this.filePath = res?.data?.filepath;
                    this.configForm.patchValue({ spec_sheet: this.filePath });
                    this.configForm.get('spec_sheet')!.updateValueAndValidity();

                    this.submit();
                }
            }, (error: any) => {
                this.showError(error);
            })
        } else {
            this.submit();
        }
    }



    submit() {
        if (!this.configForm.valid) {
            return
        }

        const formData = this.configForm.value;
        const transformedData = {
            ...formData,
            finishes_ids: formData.finishes_ids.map((id: string) => ({ finishes_id: id })),
            extras_ids: formData.extras_ids.map((id: string) => ({ extras_id: id })),
          };

        let result$: any;
        if (!this.materialId) {
            result$ = this._materialService.addMaterial(transformedData)
        } else {
            result$ = this._materialService.updateMaterial(this.materialId, transformedData)
        }

        result$.subscribe((response: any) => {
            if (response.statusCode == 201 || response.statusCode == 200) {
                this.alert = {
                    "title": "Success",
                    "message": this.materialId ? "Material Updated Successfully" : "Material Created Successfully",
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
        };;
        this.openConfirmationDialog(this.alert);
    }

    getUploadedFile(filePath: string) {
        this.serverFileName = filePath?.split('/').pop();
        this.serverFileUrl = this._fileManagementService.getFile(this.folderName, this.serverFileName);
    }

    removeFile() {
        this.uploadedFile = null; // Clear uploaded file
        this.serverFileName = null; // Clear server file name and URL if needed
        this.serverFileUrl = null;
        this.filePath = null;
        this.configForm.get("spec_sheet").setValue(null);

      }

      // while user upload file in app but not upload in server so download that file from local
      downloadFileLocal(file: File) {
        const url = URL.createObjectURL(file);
        const a = document.createElement('a');
        a.href = url;
        a.download = file.name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
}
