import { JsonPipe, NgFor, TitleCasePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
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
import { PrinterService } from 'app/core/services/printer.service';
import { ProcessService } from 'app/core/services/process.service';
import { SelectAllOptionComponent } from "../../common/select-all-option/select-all-option.component";
import { MaterialService } from 'app/core/services/material.service';

@Component({
  selector: 'app-add-edit-printer',
  templateUrl: './add-edit-printer.component.html',
  styleUrls: ['./add-edit-printer.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [RouterLink, FormsModule, ReactiveFormsModule, MatIconModule, MatFormFieldModule, MatInputModule, MatCheckboxModule, MatSelectModule, NgFor, MatOptionModule, MatButtonModule, FuseHighlightComponent, JsonPipe, TitleCasePipe, SelectAllOptionComponent],
})

export class AddEditPrinterComponent {
  printerForm: UntypedFormGroup;
  alert: { title: string; message: string; icon: { show: boolean; name: string; color: string; }; actions: { confirm: { show: boolean; label: string; color: string; }; cancel: { show: boolean; label: string; }; }; };
  printerId: any;
  processList: any;
  materialList: any[] = [];

  constructor(
    private _formBuilder: UntypedFormBuilder,
    private _fuseConfirmationService: FuseConfirmationService,
    private _router: Router,
    private _printerService: PrinterService,
    private _route: ActivatedRoute,
    private _processService: ProcessService,
    private _materialService:MaterialService
  ) {
    this._route.params.subscribe(params => {
      this.printerId = params['id']; // Access the 'id' parameter from the URL
    });
  }

  ngOnInit(): void {
    this.getprocessList();
    this.getMaterialList();

    // Build the config form
    this.printerForm = this._formBuilder.group({
      printer_name: new FormControl('', Validators.required),
      processId: new FormControl('', Validators.required),
      max_size_x: new FormControl('', Validators.required),
      max_size_y: new FormControl('', Validators.required),
      max_size_z: new FormControl('', Validators.required),
      materials_ids: new FormControl([], Validators.required),
      //   price: new FormControl('', Validators.required),
    });

    if (this.printerId)
      this.getPrinter(this.printerId)

  }

  getPrinter(id: any) {
    this._printerService.getPrinterById(id).subscribe((result: any) => {
      if(result.statusCode == 200){
        const patchData = {
            ...result?.data?.result,
            materials_ids: result?.data?.result?.materials_ids?.map((material: any) => material?.materials_id)
          };

        this.printerForm.patchValue(patchData);
      }

    }, (error:Error) => {
      this.showError(error);
    })
  }

  getprocessList() {
    let url = '?skip_pagination=true'
    this._processService.getAllProcess(url).subscribe((result: any) => {
      this.processList = result?.data?.result;
      // this.processList = this.materials;
    }, (error: any) => {
        this.showError(error);
    });
  }

  getMaterialList() {
    this._materialService.getAllMaterial('?skip_pagination=true').subscribe((result: any) => {
        this.materialList = result?.data?.result;
        }, (error: any) => {
            this.showError(error)

    });
}
  openConfirmationDialog(data: any): void {

    const dialogRef = this._fuseConfirmationService.open(data);

    dialogRef.afterClosed().subscribe((result) => {
      if (result == 'confirmed')
        this._router.navigateByUrl('/printer/list')
    });
  }

  submitForm() {
    if (!this.printerForm.valid) {
      return
    }

    const formData = this.printerForm.value;
    const transformedData = {
        ...formData,
        materials_ids: formData.materials_ids.map((id: string) => ({ materials_id: id }))
      };

    let result$: any;
    if(!this.printerId){
      result$ = this._printerService.addPrinter(transformedData)
    }else{
      result$ = this._printerService.updatePrinter(this.printerId, transformedData)
    }


    result$.subscribe((response: any) => {
      if (response.statusCode == 201 || response.statusCode == 200) {
        this.alert = {
          "title": "Success",
          "message": `Printer ${this.printerId ? "Updated" : "Created"} Successfully`,
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

  showError(err : any){
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
}
