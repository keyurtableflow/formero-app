import { Component } from '@angular/core';
import { CommonModule, NgClass, NgFor, NgIf } from '@angular/common';
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

@Component({
    selector: 'app-measurement-list',
    standalone: true,
    imports: [NgIf,MatProgressBarModule,MatTableModule,CommonModule, MatFormFieldModule, MatIconModule, MatMenuModule, MatInputModule, FormsModule, ReactiveFormsModule, MatButtonModule, MatSortModule, NgFor, MatPaginatorModule, NgClass,],
    templateUrl: './measurement-list.component.html',
    styleUrls: ['./measurement-list.component.scss']
})
export class MeasurementListComponent {

    alert: any;
    currentPage: number = 0;
    displayedColumns = ["name", "action"];
    flashMessage: 'success' | 'error' | null = null;
    measurementList: MatTableDataSource<any>;
    pageSize: number = 10;
    isLoading: boolean = false;
    searchInputControl: UntypedFormControl = new UntypedFormControl('');
    sortColumn: string;
    selectedMeasurementtId: any;
    sortOrder: number;
    totalRecords: number = 10;
    tagsEditMode: boolean = false;
    private searchSubject = new Subject<string>();
    private readonly debounceTimeMs = 300;

    constructor(
        private _measurementService: MeasurementService,
        private _router: Router,
        private _fuseConfirmationService: FuseConfirmationService
    ) { }

    ngOnInit() {
        this.getMeasurementList(this.pageSize, this.currentPage);
        this.searchSubject.pipe(debounceTime(this.debounceTimeMs)).subscribe((searchValue: any) => {
          this.performSearch(searchValue);
        });
      }

      searchRecord() {
        this.searchSubject.next(this.searchInputControl.value);
      }

      performSearch(input: any) {
        this.getMeasurementList(this.pageSize, 0, input,this.sortColumn);
      }

      getMeasurementList(size: number = 0, current: number, search: string = '', sortColumn: string = 'created_at', sortOrder: number = 1) {
        this.pageSize = size;
        this.currentPage = current;
        let url = `?limit=${size}&page=${current + 1}&orderby=${sortColumn}&sort=${sortOrder}`
        if (search != '') {
          url += `&search=${search}`
        }
        this._measurementService.getAllMeasurement(url).subscribe((result: any) => {
          this.measurementList =new MatTableDataSource(result.data?.result);
          this.totalRecords = result.data?.totalCount;
        }, (error: any) => {
            this.showError(error);
        });
      }

      onPageChange(e: any) {
        this.getMeasurementList(e.pageSize, e.pageIndex, this.searchInputControl.value, this.sortColumn, this.sortOrder)
      }

      onPageSizeChange(e: any) {
        this.getMeasurementList(e.pageSize, e.pageIndex, this.searchInputControl.value, this.sortColumn, this.sortOrder)
      }

      ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this.searchSubject.next(null);
        this.searchSubject.complete();
      }

      addMeasurement() {
        this._router.navigateByUrl('measurement/add-measurement')
      }

      editMeasurement(id) {
        this._router.navigateByUrl('measurement/edit-measurement/' + id)
      }

      sortData(sort: Sort) {
        this.sortColumn = sort.active;
        this.sortOrder = sort.direction == 'asc' ? 1 : -1;
        this.getMeasurementList(this.pageSize, 0, this.searchInputControl.value, sort.active, sort.direction == 'asc' ? 1 : -1)
      }

      deleteMeasurement(id: any) {
        this.selectedMeasurementtId = id;
        this.alert = {
          "title": "Delete Unit of measurements",
          "message": "Are you sure you want to delete this Unit of measurements ?",
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
            this._measurementService.deleteMeasurement(this.selectedMeasurementtId).subscribe((response: any) => {
              if (response.statusCode == 200) {
                this.getMeasurementList(this.pageSize, 0, this.searchInputControl.value);

              }
            }, (error: any) => {
              this.showError(error);
            })
          }
        });
      }



}
