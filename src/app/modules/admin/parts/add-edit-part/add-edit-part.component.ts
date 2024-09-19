import { AsyncPipe, JsonPipe, NgFor, TitleCasePipe } from '@angular/common';
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
import { PartService } from 'app/core/services/part.service';
import { FuseAlertComponent } from '@fuse/components/alert';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { Observable, map, startWith } from 'rxjs';
import { CompanyService } from 'app/core/services/company.service';

@Component({
  selector: 'app-add-edit-part',
  templateUrl: './add-edit-part.component.html',
  styleUrls: ['./add-edit-part.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [RouterLink, FormsModule, ReactiveFormsModule, AsyncPipe, MatAutocompleteModule, MatIconModule, FuseAlertComponent, MatFormFieldModule, MatInputModule, MatCheckboxModule, MatSelectModule, NgFor, MatOptionModule, MatButtonModule, FuseHighlightComponent, JsonPipe, TitleCasePipe],
})
export class AddEditPartComponent {
  configForm: UntypedFormGroup;
  alert: any = null;
  companyList: any[] = [];
  partId: any;
  filteredOptions: Observable<any[]>;
  roleList: any[] = [];

  constructor(
    private _formBuilder: UntypedFormBuilder,
    private _fuseConfirmationService: FuseConfirmationService,
    private _router: Router,
    private _partService: PartService,
    private _companyService: CompanyService,
    private _route: ActivatedRoute
  ) {
    this._route.params.subscribe(params => {
      this.partId = params['id']; // Access the 'id' parameter from the URL
    });
  }

  ngOnInit(): void {
    this.getCompanyList()
    // Build the config form
    this.configForm = this._formBuilder.group({
      part_name: new FormControl('', Validators.required),
      part_number: new FormControl('', Validators.required),
      companyId: new FormControl('', Validators.required),
      original_order_no: new FormControl('', Validators.required),
      notes: new FormControl('', [Validators.required]),
      attachment: new FormControl('', Validators.required),
      rev: new FormControl('', Validators.required),
      current_stock: new FormControl('', Validators.required),
      max_stock: new FormControl('', Validators.required),
      replenish_at: new FormControl('', Validators.required)
    });

    if (this.partId)
      this.getPart(this.partId)
  }

  getCompanyList() {
    this._companyService.getAllCompany('?skip_pagination=true').subscribe((result: any) => {
      this.companyList = result?.data?.result;
    }, (error: any) => {
        this.showError(error);
    });
  }

  getPart(id:any){
    this._partService.getPartById(id).subscribe( (result : any) => {
      if(result.statusCode == 200){
        this.configForm.patchValue(result?.data?.result)
      }
    })
  }

  openConfirmationDialog(data: any): void {
    // Open the dialog and save the reference of it
    const dialogRef = this._fuseConfirmationService.open(data);

    // Subscribe to afterClosed from the dialog reference
    dialogRef.afterClosed().subscribe((result) => {
      if (result == 'confirmed')
        this._router.navigateByUrl('/part/list')
    });
  }



  submit() {
    if (!this.configForm.valid) {
      return
    }

    let result$: any;
    if(!this.partId){
      result$ = this._partService.addPart(this.configForm.value)
    }else{
      result$ = this._partService.updatePart(this.partId, this.configForm.value)
    }

    result$.subscribe((response: any) => {
      if (response.statusCode == 201 || response.statusCode == 200) {
        this.alert = {
          "title": "Success",
          "message": this.partId ? "Part Updated Successfully" : "Part Created Successfully",
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
