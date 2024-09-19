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
import { UserService } from 'app/core/user/user.service';
import { FuseAlertComponent } from '@fuse/components/alert';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { Observable, map, startWith } from 'rxjs';

@Component({
  selector: 'app-add-edit-user',
  templateUrl: './add-edit-user.component.html',
  styleUrls: ['./add-edit-user.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [RouterLink, FormsModule, ReactiveFormsModule, AsyncPipe, MatAutocompleteModule, MatIconModule, FuseAlertComponent, MatFormFieldModule, MatInputModule, MatCheckboxModule, MatSelectModule, NgFor, MatOptionModule, MatButtonModule, FuseHighlightComponent, JsonPipe, TitleCasePipe],
})
export class AddEditUserComponent {
  configForm: UntypedFormGroup;
  alert: any = null;
  countryList: any[] = [];
  userId: any;
  filteredOptions: Observable<any[]>;
  roleList: any[] = [];

  constructor(
    private _formBuilder: UntypedFormBuilder,
    private _fuseConfirmationService: FuseConfirmationService,
    private _router: Router,
    private _userService: UserService,
    private _route: ActivatedRoute
  ) {
    this._route.params.subscribe(params => {
      this.userId = params['id']; // Access the 'id' parameter from the URL
    });
  }

  ngOnInit(): void {
    this.getCountryData()
    this.getUserRoles()
    // Build the config form
    this.configForm = this._formBuilder.group({
      first_name: new FormControl('', Validators.required),
      last_name: new FormControl('', Validators.required),
      country: new FormControl('', Validators.required),
      roleId: new FormControl('', Validators.required),
      email: new FormControl('', [Validators.email, Validators.required]),
      phone: new FormControl('', Validators.required),
      countryCode: new FormControl('', Validators.required)
    });

    if (this.userId)
      this.getUser(this.userId)

    this.filteredOptions = this.configForm.get('country').valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value || '')),
    );
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.countryList.filter(option => option.name.toLowerCase().includes(filterValue));
  }

  getCountryData(){
    this._userService.getCountries().subscribe( (res:any) => {
      this.countryList = res;
    })
  }

  selectedCountry(e:any){
    this.configForm.patchValue({
      countryCode: this.countryList.find( c => c.name === e.option.value).dial_code
    })
  }

  getUserRoles(){
    this._userService.getAllRole('?skip_pagination=true').subscribe( (result:any) => {
      this.roleList = result?.data?.result
    })
  }

  getUser(id:any){
    this._userService.getUser(id).subscribe( (result : any) => {
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
        this._router.navigateByUrl('/users/list')
    });
  }



  submit() {
    if (!this.configForm.valid) {
      return
    }

    let result$: any;
    if(!this.userId){
      result$ = this._userService.addUser(this.configForm.value)
    }else{
      result$ = this._userService.updateUser(this.userId, this.configForm.value)
    }

    result$.subscribe((response: any) => {
      if (response.statusCode == 201 || response.statusCode == 200) {
        this.alert = {
          "title": "Success",
          "message": this.userId ? "User Updated Successfully" : "User Created Successfully",
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
