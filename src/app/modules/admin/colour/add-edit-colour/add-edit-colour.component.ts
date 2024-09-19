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
import { ColourService } from 'app/core/services/colour.service';

@Component({
  selector: 'app-add-edit-colour',
  templateUrl: './add-edit-colour.component.html',
  styleUrls: ['./add-edit-colour.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [RouterLink, FormsModule, ReactiveFormsModule, MatIconModule, MatFormFieldModule, MatInputModule, MatCheckboxModule, MatSelectModule, NgFor, MatOptionModule, MatButtonModule, FuseHighlightComponent, JsonPipe, TitleCasePipe],
})

export class AddEditColourComponent {
  colourForm: UntypedFormGroup;
  alert: { title: string; message: string; icon: { show: boolean; name: string; color: string; }; actions: { confirm: { show: boolean; label: string; color: string; }; cancel: { show: boolean; label: string; }; }; };
  colourId: any;

  constructor(
    private _formBuilder: UntypedFormBuilder,
    private _fuseConfirmationService: FuseConfirmationService,
    private _router: Router,
    private _colourService: ColourService,
    private _route: ActivatedRoute
  ) {
    this._route.params.subscribe(params => {
      this.colourId = params['id']; // Access the 'id' parameter from the URL
    });
  }

  ngOnInit(): void {
    // Build the config form
    this.colourForm = this._formBuilder.group({
      colour_name: new FormControl('', Validators.required),
      colour_code: new FormControl('', Validators.required)
    });

    if (this.colourId)
      this.getColour(this.colourId)
  }

  getColour(id: any) {
    this._colourService.getColourById(id).subscribe((result: any) => {
      if(result.statusCode == 200){
        this.colourForm.patchValue(result?.data?.result);
      }

    }, (error:Error) => {
      this.showError(error);
    })
  }

  openConfirmationDialog(data: any): void {

    const dialogRef = this._fuseConfirmationService.open(data);

    dialogRef.afterClosed().subscribe((result) => {
      if (result == 'confirmed')
        this._router.navigateByUrl('/colour/list')
    });
  }

  submitForm() {
    if (!this.colourForm.valid) {
      return
    }

    let result$: any;
    if(!this.colourId){
      result$ = this._colourService.addColour(this.colourForm.value)
    }else{
      result$ = this._colourService.updateColour(this.colourId,this.colourForm.value)
    }


    result$.subscribe((response: any) => {
      if (response.statusCode == 201 || response.statusCode == 200) {
        this.alert = {
          "title": "Success",
          "message": `Colour ${this.colourId ? 'Updated' : "Created"} Successfully`,
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
