import { Component } from '@angular/core';
import { CommonModule, DatePipe, NgClass, NgFor, NgIf } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { FormsModule, ReactiveFormsModule, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { debounceTime, Subject } from 'rxjs';
import { Router } from '@angular/router';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { MeasurementService } from 'app/core/services/measurement.service';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { ProductsService } from 'app/core/services/products.service';

@Component({
  selector: 'app-products-list',
  standalone: true,
  imports: [CommonModule,NgIf,MatProgressBarModule,MatTableModule, MatFormFieldModule, MatIconModule, MatMenuModule, MatInputModule, FormsModule, ReactiveFormsModule, MatButtonModule, MatSortModule, NgFor, MatPaginatorModule, NgClass,],
  templateUrl: './products-list.component.html',
  styleUrls: ['./products-list.component.scss'],
  providers: [DatePipe]
})
export class ProductsListComponent {

    alert: any;
    currentPage: number = 0;
    displayedColumns = ["name","current_stock","value_in_hand","MSL","usedIn30Days","nearest_expiry_date","storage_location", "action"];
    flashMessage: 'success' | 'error' | null = null;
    productList: MatTableDataSource<any>;
    pageSize: number = 10;
    isLoading: boolean = false;
    searchInputControl: UntypedFormControl = new UntypedFormControl('');
    selectedProductForm: UntypedFormGroup;
    sortColumn: string;
    selectedProductId: any;
    sortOrder: number;
    totalRecords: number = 10;
    tagsEditMode: boolean = false;
    private searchSubject = new Subject<string>();
    private readonly debounceTimeMs = 300;

    constructor(
        private _router: Router,
        private _fuseConfirmationService: FuseConfirmationService,
        private _productsService: ProductsService
    ) { }

    ngOnInit() {
        this.getProductstList(this.pageSize, this.currentPage);
        this.searchSubject.pipe(debounceTime(this.debounceTimeMs)).subscribe((searchValue: any) => {
          this.performSearch(searchValue);
        });
      }

      searchRecord() {
        this.searchSubject.next(this.searchInputControl.value);
      }

      performSearch(input: any) {
        this.getProductstList(this.pageSize, 0, input,this.sortColumn);
      }

      getProductstList(size: number = 0, current: number, search: string = '', sortColumn: string = 'created_at', sortOrder: number = 1) {
        this.pageSize = size;
        this.currentPage = current;
        let url = `?limit=${size}&page=${current + 1}&orderby=${sortColumn}&sort=${sortOrder}`
        if (search != '') {
          url += `&search=${search}`
        }
        this._productsService.getAllProducts(url).subscribe((result: any) => {
          this.productList =new MatTableDataSource(result.data?.result);
          this.totalRecords = result.data?.totalCount;
        }, (error: any) => {
            this.showError(error);
        });
      }

      onPageChange(e: any) {
        this.getProductstList(e.pageSize, e.pageIndex, this.searchInputControl.value, this.sortColumn, this.sortOrder)
      }

      onPageSizeChange(e: any) {
        this.getProductstList(e.pageSize, e.pageIndex, this.searchInputControl.value, this.sortColumn, this.sortOrder)
      }

      ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this.searchSubject.next(null);
        this.searchSubject.complete();
      }

      addProduct() {
        this._router.navigateByUrl('products/add-product')
      }

      editProduct(id) {
        this._router.navigateByUrl('products/edit-product/' + id)
      }

      sortData(sort: Sort) {
        this.sortColumn = sort.active;
        this.sortOrder = sort.direction == 'asc' ? 1 : -1;
        this.getProductstList(this.pageSize, 0, this.searchInputControl.value, sort.active, sort.direction == 'asc' ? 1 : -1)
      }

      viewStock(product:any){
        this._router.navigateByUrl("current-stock/list",{state:  { key:"product_id" , value:product?._id , name : product?.name}  });
      }

      addStock(productId:any){
        this._router.navigateByUrl('current-stock/add-current-stock',{state:  { key:"product_id" , value : productId } });
      }

      deleteProduct(id: any) {
        this.selectedProductId = id;
        this.alert = {
          "title": "Delete Product",
          "message": "Are you sure you want to delete this product ?",
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
            this._productsService.deleteProducts(this.selectedProductId).subscribe((response: any) => {
              if (response.statusCode == 200) {
                this.getProductstList(this.pageSize, 0, this.searchInputControl.value);

              }
            }, (error: any) => {
              this.showError(error);
            })
          }
        });
      }
}
