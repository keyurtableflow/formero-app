import { Component } from '@angular/core';
import { CommonModule, DatePipe, NgClass, NgFor, NgIf } from '@angular/common';
import { FormsModule, ReactiveFormsModule, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { debounceTime, Subject } from 'rxjs';
import { CurrentStockService } from 'app/core/services/current-stock.service';
import { Router } from '@angular/router';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { MeasurementService } from 'app/core/services/measurement.service';

@Component({
  selector: 'app-current-stock-list',
  standalone: true,
  imports: [NgIf,MatProgressBarModule,MatTableModule,CommonModule, MatFormFieldModule, MatIconModule, MatMenuModule, MatInputModule, FormsModule, ReactiveFormsModule, MatButtonModule, MatSortModule, NgFor, MatPaginatorModule, NgClass,],
  templateUrl: './current-stock-list.component.html',
  styleUrls: ['./current-stock-list.component.scss'],
  providers: [DatePipe]
})
export class CurrentStockListComponent {

    alert: any;
    currentPage: number = 0;
    displayedColumns = ["product_id","sku","stockable_product_id" ,"current_stock","value_in_hand","created_at","expiry_date","serial_number","action"];
    flashMessage: 'success' | 'error' | null = null;
    currentStocktList: MatTableDataSource<any>;
    measurementList: any[] = [];
    pageSize: number = 10;
    isLoading: boolean = false;
    searchInputControl: UntypedFormControl = new UntypedFormControl('');
    sortColumn: string;
    selectedCurrentStockId: any;
    sortOrder: number;
    totalRecords: number = 10;
    tagsEditMode: boolean = false;
    private searchSubject = new Subject<string>();
    private readonly debounceTimeMs = 300;
    stockName : string = "All";
    viewStock :{ key:string, value:string};

    constructor(
        private _currentStockService: CurrentStockService,
        private _router: Router,
        private _fuseConfirmationService: FuseConfirmationService,
        private _measurementService : MeasurementService,
        private datePipe: DatePipe
    ) {
     }

    ngOnInit() {
        this.getMesurementList();
        if(history.state.key){
            this.viewStock = {key:history?.state?.key,value:history?.state?.value};
            this.stockName = history.state?.name
        }


        this.getCurrentStockList(this.pageSize, this.currentPage);
        this.searchSubject.pipe(debounceTime(this.debounceTimeMs)).subscribe((searchValue: any) => {
          this.performSearch(searchValue);
        });
      }

      searchRecord() {
        this.searchSubject.next(this.searchInputControl.value);
      }

      performSearch(input: any) {
        this.getCurrentStockList(this.pageSize, 0, input,this.sortColumn);
      }

      getMesurementList() {
        this._measurementService.getAllMeasurement('?skip_pagination=true').subscribe((result: any) => {
            this.measurementList = result?.data?.result;
        }, (error: any) => {
            this.showError(error);
        });
    }


      getCurrentStockList(size: number = 0, current: number, search: string = '', sortColumn: string = 'created_at', sortOrder: number = 1) {
        this.pageSize = size;
        this.currentPage = current;
        let url = `?limit=${size}&page=${current + 1}&orderby=${sortColumn}&sort=${sortOrder}`
        if (search != '') {
          url += `&search=${search}`
        }
        if(this.viewStock?.key && this.viewStock?.value){
            url += `&${this.viewStock.key}=${this.viewStock.value}`
        }
        this._currentStockService.getAllCurrentStock(url).subscribe((result: any) => {
          this.currentStocktList =new MatTableDataSource(result.data?.result);
          this.totalRecords = result.data?.totalCount;
        }, (error: any) => {
            this.showError(error);
        });
      }

      onPageChange(e: any) {
        this.getCurrentStockList(e.pageSize, e.pageIndex, this.searchInputControl.value, this.sortColumn, this.sortOrder)
      }

      onPageSizeChange(e: any) {
        this.getCurrentStockList(e.pageSize, e.pageIndex, this.searchInputControl.value, this.sortColumn, this.sortOrder)
      }

      ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this.searchSubject.next(null);
        this.searchSubject.complete();
      }

      addCurrentStock() {
        this._router.navigateByUrl('current-stock/add-current-stock')
      }

      adjustCurrentStock(stockitem:any) {
        this._router.navigateByUrl('current-stock/adjust-stock',{state:  { product_id:stockitem?.product_id , stockable_product_id : stockitem?.stockable_product_id, _id:stockitem?._id } });
      }

      sortData(sort: Sort) {
        this.sortColumn = sort.active;
        this.sortOrder = sort.direction == 'asc' ? 1 : -1;
        this.getCurrentStockList(this.pageSize, 0, this.searchInputControl.value, sort.active, sort.direction == 'asc' ? 1 : -1)
      }

      formatDate(date: string): string {
        const vicTimeZone = 'Australia/Melbourne';
        const datePipeString = this.datePipe.transform(date, 'dd/MM/yyyy hh:mm a', vicTimeZone);
        return datePipeString;
      }

      deleteCurrentStock(id: any) {
        this.selectedCurrentStockId = id;
        this.alert = {
          "title": "Delete Current stock",
          "message": "Are you sure you want to delete this Current stock ?",
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

      openConfirmationDialog(data: any): void {

        const dialogRef = this._fuseConfirmationService.open(data);

        dialogRef.afterClosed().subscribe((result) => {
          if (result == 'confirmed') {
            this._currentStockService.deleteCurrentStock(this.selectedCurrentStockId).subscribe((response: any) => {
              if (response.statusCode == 200) {
                this.getCurrentStockList(this.pageSize, 0, this.searchInputControl.value);

              }
            }, (error: any) => {
              this.showError(error);
            })
          }
        });
      }

      getMeasurement(measurementId: string) {
        return this.measurementList.find(measurement => measurement._id == measurementId)?.short_hand;
    }



}
