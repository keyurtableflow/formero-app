import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSelectModule } from '@angular/material/select';
import { MatRadioModule } from '@angular/material/radio';
import { FormGroup, UntypedFormGroup } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router } from '@angular/router';
import { MatTabsModule } from '@angular/material/tabs';
import { SalesService } from 'app/core/services/sales.service';

@Component({
  selector: 'app-add-edit-sales',
  standalone: true,
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatCheckboxModule,
    MatSelectModule,
    MatRadioModule,
    MatIconModule,
    MatTabsModule
  ],
  templateUrl: './add-edit-sales.component.html',
  styleUrls: ['./add-edit-sales.component.scss']
})
export class AddEditSalesComponent {


  contactForm: FormGroup;
  salesId: any;

  constructor(
    private _router: Router,
    private _route: ActivatedRoute,
    private _salesService: SalesService,
  ) {
    this._route.params.subscribe(params => {
      this.salesId = params['id'];
  });
  }


  ngOnInit(): void {
    // this.getPricingModellist();
    // Build the config form


    if (this.salesId)
        this.getSales(this.salesId)
}

    configForm: UntypedFormGroup;
    getSales(id: any) {
      this._salesService.getSalesById(id).subscribe((result: any) => {
          if (result.statusCode == 200) {

              console.log(result?.data?.result,"result?.data?.result")
              // this.configForm.patchValue(result?.data?.result);
              if(result?.data?.result?.image){
                  // this.getUploadedFile(result?.data?.result?.image);
              }
              // this.configForm.get('pricing_model_id').setValue(result?.data?.result?.pricingModelsData?._id)
          }
      }, (error: Error) => {
          // this.showError(error);
      })
    }

  redirectTosales(){
    this._router.navigateByUrl('sales')
  }
}
