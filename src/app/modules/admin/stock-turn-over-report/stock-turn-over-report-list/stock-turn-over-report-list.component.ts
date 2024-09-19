import { Component } from '@angular/core';
import { CommonModule, NgClass, NgFor, NgIf } from '@angular/common';
import { FormsModule, ReactiveFormsModule, UntypedFormControl } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { Router } from '@angular/router';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { EquationService } from 'app/core/services/equation.service';
import { Subject, debounceTime } from 'rxjs';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { CurrentStockService } from 'app/core/services/current-stock.service';

@Component({
    selector: 'app-stock-turn-over-report-list',
    standalone: true,
    imports: [NgIf, MatProgressBarModule, MatTableModule, CommonModule, MatDatepickerModule, MatFormFieldModule, MatIconModule, MatMenuModule, MatInputModule, FormsModule, ReactiveFormsModule, MatButtonModule, MatSortModule, NgFor, MatPaginatorModule, NgClass],
    templateUrl: './stock-turn-over-report-list.component.html',
    styleUrls: ['./stock-turn-over-report-list.component.scss']
})
export class StockTurnOverReportListComponent {

    alert: any;
    currentPage: number = 0;
    productBreakDownColumn = ["product_id", "opening_stock", "closing_stock", "stock_added", "stock_removed", "net_stock_movement"];
    displayedColumns = ["date_range", "opening_stock", "closing_stock", "stock_added", "stock_removed", "net_stock_movement"];
    flashMessage: 'success' | 'error' | null = null;
    reportList: MatTableDataSource<any>;
    productBreakDownReportList: MatTableDataSource<any>;
    pageSize: number = 10;
    isLoading: boolean = false;
    searchInputControl: UntypedFormControl = new UntypedFormControl('');
    sortColumn: string;
    selectedEquationtId: any;
    sortOrder: number;
    totalRecords: number = 10;
    fromDate: Date;
    toDate: Date;
    selectedRange: { from: string | null, to: string | null } | null = null;

    constructor(
        private _router: Router,
        private _fuseConfirmationService: FuseConfirmationService,
        private _currentStockService: CurrentStockService
    ) { }

    ngOnInit() {
        this.productBreakDownReportList = new MatTableDataSource([]);
        this.setPreviousMoth();
        // this.getTurnOverReport(this.pageSize, this.currentPage);
        // this.getTotalStockTurnOverReport();
    }





    getTurnOverReport(size: number = 0, current: number, sortColumn: string = 'created_at', sortOrder: number = 1) {
        this.pageSize = size;
        this.currentPage = current;
        let url = `?limit=${size}&page=${current + 1}&orderby=${sortColumn}&sort=${sortOrder}`;

        if (this.fromDate && this.toDate) {
            url += `&from=${(new Date(this.fromDate)).toISOString()}&to=${(new Date(this.toDate)).toISOString()}`;
        }
        this._currentStockService.getStockTurnOverReport(url).subscribe((result: any) => {
            this.productBreakDownReportList = new MatTableDataSource(result.data.result);
            this.totalRecords = result.data.totalCount;
        }, (error: any) => {
            this.showError(error);
        });
    }

    getTotalStockTurnOverReport() {
        let url = '';
        if (this.fromDate && this.toDate) {
            url += `?from=${(new Date(this.fromDate)).toISOString()}&to=${(new Date(this.toDate)).toISOString()}`;
        }
        this._currentStockService.getAllStockTurnOverReport(url).subscribe((result: any) => {
            const alReportData = result.data.totalCounts;
            alReportData.selectedRange = this.selectedRange;
            this.reportList = new MatTableDataSource([alReportData]);

        }, (error: any) => {
            this.showError(error);
        });
    }

    onPageChange(e: any) {
        this.pageSize = e.pageSize;
        this.currentPage = e.pageIndex;
        this.getTurnOverReport(e.pageSize, e.pageIndex, this.sortColumn, this.sortOrder)
    }

    onPageSizeChange(e: any) {
        this.pageSize = e.pageSize;
        this.currentPage = e.pageIndex;
        this.getTurnOverReport(e.pageSize, e.pageIndex, this.sortColumn, this.sortOrder)
    }

    sortData(sort: Sort) {
        this.sortColumn = sort.active;
        this.sortOrder = sort.direction == 'asc' ? 1 : -1;
        this.getTurnOverReport(this.pageSize, 0, sort.active, sort.direction == 'asc' ? 1 : -1)
    }

    runReport() {
        if (this.fromDate) {
            this.selectedRange = {
                ...this.selectedRange,
                from: (new Date(this.fromDate)).toISOString()
            };
        } else {
            this.selectedRange = {
                ...this.selectedRange,
                from: ''
            };
        }
        if (this.toDate) {
            this.selectedRange = {
                ...this.selectedRange,
                to: (new Date(this.toDate)).toISOString()
            };
        } else {
            this.selectedRange = {
                ...this.selectedRange,
                to: ''
            };
        }
        this.getTotalStockTurnOverReport();
        this.getTurnOverReport(this.pageSize, this.currentPage);
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
        };
        this.openConfirmationDialog(this.alert);
    }

    openConfirmationDialog(data: any): void {
        const dialogRef = this._fuseConfirmationService.open(data);
    }

    setPreviousMoth() {
        const currentDate = new Date();
        const startOfPreviousMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
        const endOfPreviousMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0);

        this.fromDate = startOfPreviousMonth;
        this.toDate = endOfPreviousMonth;
        this.runReport();
    }
}
