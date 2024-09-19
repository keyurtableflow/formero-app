import { JsonPipe, NgFor, NgIf, TitleCasePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FuseHighlightComponent } from '@fuse/components/highlight';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { FileManagementService } from 'app/core/services/filemanagement.service';
import { PricingModelService } from 'app/core/services/pricing-model.service';
import { ProcessService } from 'app/core/services/process.service';

@Component({
    selector: 'app-add-edit-process',
    templateUrl: './add-edit-process.component.html',
    styleUrls: ['./add-edit-process.component.scss'],
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [RouterLink, NgIf, FormsModule, ReactiveFormsModule, MatIconModule, MatFormFieldModule, MatInputModule, MatCheckboxModule, MatSelectModule, NgFor, MatOptionModule, MatButtonModule, FuseHighlightComponent, JsonPipe, TitleCasePipe],
})

export class AddEditProcessComponent {
    configForm: UntypedFormGroup;
    alert: { title: string; message: string; icon: { show: boolean; name: string; color: string; }; actions: { confirm: { show: boolean; label: string; color: string; }; cancel: { show: boolean; label: string; }; }; };
    processId: any;
    pricingModelList:any[] = [];
    imagePreview: string | ArrayBuffer | null | SafeUrl= null;
    uploadedFile: File;
    filePath: string = null;
    folderName: string = "processImages";
    // for avoid duplicatefile upload
    fileUploadCount: number = 0;
    count:number = 0;

    constructor(
        private _formBuilder: UntypedFormBuilder,
        private _fuseConfirmationService: FuseConfirmationService,
        private _router: Router,
        private _processService: ProcessService,
        private _route: ActivatedRoute,
        private _fileManagementService: FileManagementService,
        private sanitizer: DomSanitizer,
        private _pricingModelService: PricingModelService,
    ) {
        this._route.params.subscribe(params => {
            this.processId = params['id']; // Access the 'id' parameter from the URL
        });
    }

    ngOnInit(): void {
        this.getPricingModellist();
        // Build the config form
        this.configForm = this._formBuilder.group({
            process_name: new FormControl('', Validators.required),
            short_name: new FormControl('', Validators.required),
            description: new FormControl(''),
            instant_quote: new FormControl(false),
            image: new FormControl(null),
            pricing_model_id : new FormControl('', Validators.required),
            require_review  : new FormControl(false, Validators.required),
        });

        if (this.processId)
            this.getProcess(this.processId)
    }

    getProcess(id: any) {
        this._processService.getProcessById(id).subscribe((result: any) => {
            if (result.statusCode == 200) {

                console.log(result?.data?.result,"result?.data?.result")
                this.configForm.patchValue(result?.data?.result);
                if(result?.data?.result?.image){
                    this.getUploadedFile(result?.data?.result?.image);
                }
                this.configForm.get('pricing_model_id').setValue(result?.data?.result?.pricingModelsData?._id)
            }
        }, (error: Error) => {
            this.showError(error);
        })
    }

    getPricingModellist() {
        this._pricingModelService.getAllPricingModel('?skip_pagination=true').subscribe((result: any) => {
            this.pricingModelList = result?.data?.result;
        }, (error: any) => {
            this.showError(error);
        });
    }

    onFileSelected(event: Event) {
        const file = (event.target as HTMLInputElement).files![0];
        this.uploadedFile = file;
        this.fileUploadCount = this.fileUploadCount + 1;
        const reader = new FileReader();
        reader.onload = () => {
            this.imagePreview = reader.result;
        };
        reader.readAsDataURL(file);
    }

    submitForm() {
        if (this.count != this.fileUploadCount) {
            this.count = this.fileUploadCount;
            const formData = new FormData();
            formData.append('files', this.uploadedFile);
            this._fileManagementService.uploadSingleFile(this.folderName, formData).subscribe((res) => {
                if (res?.statusCode == 200) {
                    this.filePath = res?.data?.filepath;
                    this.configForm.patchValue({ image: this.filePath });
                    this.configForm.get('image')!.updateValueAndValidity();

                    this.submit();
                }
            }, (error: any) => {
                this.showError(error);
            })
        }else{
            this.submit();
        }
    }

    openConfirmationDialog(data: any): void {

        const dialogRef = this._fuseConfirmationService.open(data);

        dialogRef.afterClosed().subscribe((result) => {
            if (result == 'confirmed')
                this._router.navigateByUrl('/process/list')
        });
    }

    removeImage(fileInput: HTMLInputElement) {
        this.uploadedFile = null;
        this.configForm.get("image")?.setValue(null);
        this.imagePreview = null;
        fileInput.value = '';
      }

    submit() {
        if (!this.configForm.valid) {
            return
        }

        let result$: any;
        if (!this.processId) {
            result$ = this._processService.addProcess(this.configForm.value)
        } else {
            result$ = this._processService.updateProcess(this.processId, this.configForm.value)
        }


        result$.subscribe((response: any) => {
            if (response.statusCode == 201 || response.statusCode == 200) {
                this.alert = {
                    "title": "Success",
                    "message": `Process ${this.processId ? "Updated" : "Created"} Successfully`,
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

    getUploadedFile(filePath: string){
        const fileName = filePath.split('/').pop();
        const fileUrl = this._fileManagementService.getFile(this.folderName, fileName);
        this.imagePreview = this.sanitizer.bypassSecurityTrustUrl(fileUrl); ;
    }
}
