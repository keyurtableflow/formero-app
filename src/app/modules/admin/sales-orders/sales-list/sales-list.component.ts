import { ChangeDetectorRef, Component } from '@angular/core';
import { AsyncPipe, CommonModule, CurrencyPipe, NgClass, NgFor, NgIf, NgTemplateOutlet } from '@angular/common';
import { FormsModule, ReactiveFormsModule, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { debounceTime, Subject } from 'rxjs';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { ProcessService } from 'app/core/services/process.service';
import { Router } from '@angular/router';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { FileManagementService } from 'app/core/services/filemanagement.service';
import { HistoryService } from 'app/core/services/history.service';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatOptionModule, MatRippleModule } from '@angular/material/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSortModule, Sort } from '@angular/material/sort';
import { SalesService } from 'app/core/services/sales.service';

@Component({
  selector: 'app-sales-list',
  standalone: true,
  imports: [NgIf, MatProgressBarModule,MatTableModule , CommonModule, MatFormFieldModule, MatIconModule, MatMenuModule, MatInputModule, FormsModule, ReactiveFormsModule, MatButtonModule, MatSortModule, NgFor, NgTemplateOutlet, MatPaginatorModule, NgClass, MatSlideToggleModule, MatSelectModule, MatOptionModule, MatCheckboxModule, MatRippleModule, AsyncPipe, CurrencyPipe],
  templateUrl: './sales-list.component.html',
  styleUrls: ['./sales-list.component.scss']
})
export class SalesListComponent {

  
  totalRecords: number = 10;
  currentPage: number = 0;
  pageSize: number = 10;

  flashMessage: 'success' | 'error' | null = null;
  isLoading: boolean = false;
  searchInputControl: UntypedFormControl = new UntypedFormControl('');
  selectedProductForm: UntypedFormGroup;
  tagsEditMode: boolean = false;
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  alert: any;
  selectedProductId: any;

  private searchSubject = new Subject<string>();
  private readonly debounceTimeMs = 300;
  sortColumn: string;
  sortOrder: number;

  sales: MatTableDataSource<any>;
  displayedColumns = ["order_number","billing_contact_details","date","order_status","notes","action"];
  imagePreview:string | ArrayBuffer | null | SafeUrl = '';
  folderName: string = "processImages";
  cachedImageUrls: Map<string, SafeUrl> = new Map();

  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _salesService: SalesService,
    private _router: Router,
        private _fuseConfirmationService: FuseConfirmationService
  ) {
  }

  ngOnInit() {
    this._changeDetectorRef.detectChanges();
    this.getSalesList(this.pageSize, this.currentPage);
    this.searchSubject.pipe(debounceTime(this.debounceTimeMs)).subscribe((searchValue: any) => {
      this.performSearch(searchValue);
    });
  }

  redirectToAddSales() {
    this._router.navigateByUrl('sales/add-sales')
  }

  editMaterial(id) {
    this._router.navigateByUrl('sales/edit-sales/' + id)
  }


  performSearch(input: any) {
    this.getSalesList(this.pageSize, this.currentPage, input);
  }

  sortData(sort: Sort) {
    this.sortColumn = sort.active;
    this.sortOrder = sort.direction == 'asc' ? 1 : -1;
    this.getSalesList(this.pageSize, this.currentPage,  this.searchInputControl.value, sort.active, sort.direction == 'asc' ? 1 : -1)
}

deleteSales(id: any) {
  this.selectedProductId = id;
  this.alert = {
    "title": "Delete sales",
    "message": "Are you sure you want to delete this sales ?",
    "icon": {
      "show": true,
      "name": "heroicons_outline:exclamation-triangle",
      "color": "warn"
    },
    "actions": {
      "confirm": {
        "show": true,
        "label": "Yes, Delete It!",
        "color": "warn"
      },
      "cancel": {
        "show": true,
        "label": "Cancel"
      }
    }
  };
  this.openConfirmationDialog(this.alert);
}


openConfirmationDialog(data: any): void {

  const dialogRef = this._fuseConfirmationService.open(data);

  dialogRef.afterClosed().subscribe((result) => {
    if (result == 'confirmed') {
      this._salesService.deleteSales(this.selectedProductId).subscribe((response: any) => {
        if (response.statusCode == 200) {
          this.getSalesList(0, 0);

        }
      }, (error: any) => {
        this.showError(error);
      })
    }
  });
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


  getSalesList(size: number = 0, current: number, search: string = '', sortColumn: string = 'created_at', sortOrder: number = 1) {
    this.pageSize = size;
    this.currentPage = current;
    let url = `?limit=${size}&page=${current+1}&orderby=${sortColumn}&sort=${sortOrder}`
    if(search != ''){
        url += `&search=${search}`
    }
    this._salesService.getAllService(url).subscribe((result: any) => {
      this.sales = new MatTableDataSource(result.data?.result);
      this.totalRecords = result.data?.totalCount;
      this._changeDetectorRef.detectChanges();
    }, (error: any) => {
        // this.showError(error);
    });
  }

  searchRecord() {
    this.searchSubject.next(this.searchInputControl.value);
  }

  
  onPageChange(e: any) {
    this.getSalesList(e.pageSize, e.pageIndex, this.searchInputControl.value, this.sortColumn, this.sortOrder)
  }

  onPageSizeChange(e: any) {
    this.getSalesList(e.pageSize, e.pageIndex, this.searchInputControl.value, this.sortColumn, this.sortOrder)
  }

}
