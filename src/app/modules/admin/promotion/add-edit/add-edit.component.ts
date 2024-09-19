import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, UntypedFormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { ProcessService } from 'app/core/services/process.service';
import { PromotionService } from 'app/core/services/promotion.service';
import { Subject, takeUntil } from 'rxjs';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonService } from 'app/core/common/common.service';
import { MatSnackBarModule } from '@angular/material/snack-bar';
@Component({
  selector: 'app-add-edit',
  templateUrl: './add-edit.component.html',
  styleUrls: ['./add-edit.component.scss'],
  standalone: true,
  imports: [CommonModule, MatProgressBarModule, MatFormFieldModule, MatIconModule, MatInputModule, FormsModule, ReactiveFormsModule, MatButtonModule, MatSelectModule, MatCheckboxModule, MatDatepickerModule, MatNativeDateModule, RouterModule, MatSnackBarModule]
})
export class AddEditComponent implements OnInit, OnDestroy {
  public promotionId: string = null
  public promotionFrom: UntypedFormGroup
  public processList = []
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  constructor(private _formBuilder: FormBuilder,
    private _processService: ProcessService,
    private _promotionService: PromotionService,
    private _commonService: CommonService,
    private _router: Router,
    private _route: ActivatedRoute
  ) { }

  ngOnInit() {
    this._route.url.pipe(takeUntil(this._unsubscribeAll)).subscribe(url => {
      if (url[0].path == 'edit') {
        this._route.params.pipe(takeUntil(this._unsubscribeAll)).subscribe((params) => {
          this.promotionId = params.id
          this.getPromotion()
        })
      }
    })

    this.getProcesses()
    this.initialForm()
    this.handleCheckChange()
  }

  private initialForm() {
    this.promotionFrom = this._formBuilder.group({
      is_active: [true, []],
      name: ['', [Validators.required]],
      used_count: [0, []],
      qualifiers: this._formBuilder.group({
        is_code: [false, []],
        code: ['', []],
        is_process: [false, []],
        processes: ['', []],
        show_cta: [false]
      }),
      discount: this._formBuilder.group({
        method: [1, [Validators.required]],
        dollar: [0, [Validators.required, Validators.min(0)]],
        percentage: [0, [Validators.required, Validators.min(0), Validators.max(100)]]
      }),
      limit: this._formBuilder.group({
        usage: [0, [Validators.required, Validators.min(0)]],
        start_date: [''],
        end_date: [''],
      }),
    })
  }

  private handleCheckChange() {
    this.promotionFrom.get('qualifiers.is_code').valueChanges.subscribe((checked) => {
      if (checked) {
        this.promotionFrom.get('qualifiers.code').addValidators(Validators.required)
      } else {
        this.promotionFrom.get('qualifiers.code').removeValidators(Validators.required)
        if (!this.promotionId) this.promotionFrom.get('qualifiers.code').patchValue('')
      }
    })

    this.promotionFrom.get('qualifiers.is_process').valueChanges.subscribe((checked) => {
      if (checked) {
        this.promotionFrom.get('qualifiers.processes').addValidators(Validators.required)
      } else {
        this.promotionFrom.get('qualifiers.processes').removeValidators(Validators.required)
        if (!this.promotionId) this.promotionFrom.get('qualifiers.processes').patchValue('')

      }
    })

    this.promotionFrom.get('discount.method').valueChanges.subscribe((selectedMethod) => {
      if (selectedMethod == 1) {
        this.promotionFrom.get('discount.dollar').addValidators(Validators.required)
        this.promotionFrom.get('discount.percentage').removeValidators(Validators.required)
        this.promotionFrom.get('discount.percentage').patchValue(0)
      } else {
        this.promotionFrom.get('discount.dollar').removeValidators(Validators.required)
        this.promotionFrom.get('discount.percentage').addValidators(Validators.required)
        this.promotionFrom.get('discount.dollar').patchValue(0)
      }
    })
  }

  private getProcesses() {
    this._processService.getAllProcess('?skip_pagination=true')
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((res) => {
        this.processList = res.data?.result
      })
  }
  public submitForm() {
    const promotionData = this.promotionFrom.getRawValue()

    if (!promotionData.qualifiers.is_code && !promotionData.qualifiers.is_process) {
      this._commonService.openErrorSnackBar('At least one qualifier must be chosen')
      return
    }
    // required in  edit flow
    if (!promotionData.qualifiers.is_process) {
      promotionData.qualifiers.processes = []
    }
    if (!promotionData.qualifiers.is_code) {
      promotionData.qualifiers.code = ''
    }
    delete promotionData.qualifiers.is_code
    delete promotionData.qualifiers.is_process

    if (this.promotionId) {
      this._promotionService.updatePromotion(this.promotionId, promotionData).subscribe((res) => {
        if (res.data) {
          this._router.navigate(['/promotion'])
        }
        this._commonService.openSnackBar(res.message)
      }, (error: any) => {
        this._commonService.openErrorSnackBar(error.error.message)
      })
    } else {
      this._promotionService.createPromotion(promotionData).subscribe((res) => {
        if (res.data) {
          this._router.navigate(['/promotion'])
        }
        this._commonService.openSnackBar(res.message)
      }, (error: any) => {
        this._commonService.openErrorSnackBar(error.error.message)
      })
    }
  }

  private patchFormData(data) {
    const { qualifiers, discount, limit } = data
    this.promotionFrom.patchValue({ is_active: data.is_active })
    this.promotionFrom.patchValue({ name: data.name })
    this.promotionFrom.patchValue({ used_count: data.used_count })
    // qualifiers
    this.promotionFrom.get("qualifiers").patchValue({ show_cta: qualifiers.show_cta })
    if (qualifiers.code) {
      this.promotionFrom.get('qualifiers').patchValue({ is_code: true, code: qualifiers.code })
    }
    if (qualifiers.processes.length) {
      const processIds = qualifiers.processes.map(ele => ele.processId)
      this.promotionFrom.get("qualifiers").patchValue({ is_process: true, processes: processIds })
    }
    // discount
    if (discount.method === 1) {
      this.promotionFrom.get("discount").patchValue({ method: discount.method, dollar: discount.dollar })
    } else {
      this.promotionFrom.get("discount").patchValue({ method: discount.method, percentage: discount.percentage })
    }
    // limit
    this.promotionFrom.get("limit").patchValue(limit)
  }
  private getPromotion() {
    this._promotionService.getPromotion(this.promotionId).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (res.data) this.patchFormData(res.data)
    })
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next(null)
    this._unsubscribeAll.complete()
  }
}
