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
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { debounceTime, Subject } from 'rxjs';
import { Router } from '@angular/router';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { StockableProductService } from 'app/core/services/stockable-products.service';
import { MeasurementService } from 'app/core/services/measurement.service';

@Component({
    selector: 'app-stockable-products-list',
    standalone: true,
    imports: [CommonModule, NgIf, MatProgressBarModule, MatTableModule, MatFormFieldModule, MatIconModule, MatMenuModule, MatInputModule, FormsModule, ReactiveFormsModule, MatButtonModule, MatSortModule, NgFor, MatPaginatorModule, NgClass],
    templateUrl: './stockable-products-list.component.html',
    styleUrls: ['./stockable-products-list.component.scss'],
    providers: [DatePipe]
})
export class StockableProductsListComponent {

    alert: any;
    currentPage: number = 0;
    displayedColumns = ["product_id", "sku", "name", "supplier_id", "current_stock", "value_in_hand", "MSL", "usedIn30Days", "nearest_expiry_date", "action"];
    flashMessage: 'success' | 'error' | null = null;
    measurementList: any[] = [];
    pageSize: number = 10;
    isLoading: boolean = false;
    searchInputControl: UntypedFormControl = new UntypedFormControl('');
    selectedProductForm: UntypedFormGroup;
    sortColumn: string;
    selectedStockableProductId: any;
    sortOrder: number;
    stockableProductList: MatTableDataSource<any>;
    totalRecords: number = 10;
    tagsEditMode: boolean = false;
    private searchSubject = new Subject<string>();
    private readonly debounceTimeMs = 300;


    constructor(
        private _router: Router,
        private _fuseConfirmationService: FuseConfirmationService,
        private _stockableProductService: StockableProductService,
        private _measurementService: MeasurementService,
    ) { }

    ngOnInit() {
        this.getMesurementList();
        this.getStockableProductstList(this.pageSize, this.currentPage);
        this.searchSubject.pipe(debounceTime(this.debounceTimeMs)).subscribe((searchValue: any) => {
            this.performSearch(searchValue);
        });
    }

    searchRecord() {
        this.searchSubject.next(this.searchInputControl.value);
    }

    performSearch(input: any) {
        this.getStockableProductstList(this.pageSize, 0, input, this.sortColumn);
    }

    getMesurementList() {
        this._measurementService.getAllMeasurement('?skip_pagination=true').subscribe((result: any) => {
            this.measurementList = result?.data?.result;
        }, (error: any) => {
            this.showError(error);
        });
    }

    getStockableProductstList(size: number = 0, current: number, search: string = '', sortColumn: string = 'created_at', sortOrder: number = 1) {
        this.pageSize = size;
        this.currentPage = current;
        let url = `?limit=${size}&page=${current + 1}&orderby=${sortColumn}&sort=${sortOrder}`
        if (search != '') {
            url += `&search=${search}`
        }
        this._stockableProductService.getAllStockableProducts(url).subscribe((result: any) => {
            this.stockableProductList = new MatTableDataSource(result.data?.result);
            this.totalRecords = result.data?.totalCount;
        }, (error: any) => {
            this.showError(error);
        });
    }

    onPageChange(e: any) {
        this.getStockableProductstList(e.pageSize, e.pageIndex, this.searchInputControl.value, this.sortColumn, this.sortOrder)
    }

    onPageSizeChange(e: any) {
        this.getStockableProductstList(e.pageSize, e.pageIndex, this.searchInputControl.value, this.sortColumn, this.sortOrder)
    }

    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this.searchSubject.next(null);
        this.searchSubject.complete();
    }

    addStockableProduct() {
        this._router.navigateByUrl('stockable-products/add-stockable-product')
    }

    editStockableProduct(id) {
        this._router.navigateByUrl('stockable-products/edit-stockable-product/' + id)
    }

    sortData(sort: Sort) {
        this.sortColumn = sort.active;
        this.sortOrder = sort.direction == 'asc' ? 1 : -1;
        this.getStockableProductstList(this.pageSize, 0, this.searchInputControl.value, sort.active, sort.direction == 'asc' ? 1 : -1)
    }

    viewStock(stockableProduct: any) {
        this._router.navigateByUrl("current-stock/list", { state: { key: "stockable_product_id", value: stockableProduct?._id, name: stockableProduct?.name } });
    }

    addStock(stockableProduct: any) {
        this._router.navigateByUrl('current-stock/add-current-stock', { state: { key: "stockable_product_id", value: stockableProduct?._id, productId: stockableProduct?.product_id } });
    }

    deleteStockableProduct(id: any) {
        this.selectedStockableProductId = id;
        this.alert = {
            "title": "Delete Stockable product",
            "message": "Are you sure you want to delete this Stockable product ?",
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
                this._stockableProductService.deleteStockableProducts(this.selectedStockableProductId).subscribe((response: any) => {
                    if (response.statusCode == 200) {
                        this.getStockableProductstList(this.pageSize, 0, this.searchInputControl.value);

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
