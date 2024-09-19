import { Component } from '@angular/core';
import { CommonModule, NgClass, NgFor, NgIf } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule, ReactiveFormsModule, UntypedFormControl } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { Router } from '@angular/router';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { MeasurementService } from 'app/core/services/measurement.service';
import { Subject, debounceTime } from 'rxjs';
import { ExtrasService } from 'app/core/services/extras.service';

@Component({
  selector: 'app-extras-list',
  standalone: true,
  imports: [NgIf,MatProgressBarModule,MatTableModule,CommonModule, MatFormFieldModule, MatIconModule, MatMenuModule, MatInputModule, FormsModule, ReactiveFormsModule, MatButtonModule, MatSortModule, NgFor, MatPaginatorModule, NgClass,],
  templateUrl: './extras-list.component.html',
  styleUrls: ['./extras-list.component.scss']
})
export class ExtrasListComponent {

    alert: any;
    currentPage: number = 0;
    displayedColumns = ["name","price", "action"];
    flashMessage: 'success' | 'error' | null = null;
    extrasList: MatTableDataSource<any>;
    pageSize: number = 10;
    isLoading: boolean = false;
    searchInputControl: UntypedFormControl = new UntypedFormControl('');
    sortColumn: string;
    selectedExtrastId: any;
    sortOrder: number;
    totalRecords: number = 10;
    private searchSubject = new Subject<string>();
    private readonly debounceTimeMs = 300;

    constructor(
        private _extrasService: ExtrasService,
        private _router: Router,
        private _fuseConfirmationService: FuseConfirmationService
    ) { }

    ngOnInit() {
        this.getExtrasList(this.pageSize, this.currentPage);
        this.searchSubject.pipe(debounceTime(this.debounceTimeMs)).subscribe((searchValue: any) => {
          this.performSearch(searchValue);
        });
      }

      searchRecord() {
        this.searchSubject.next(this.searchInputControl.value);
      }

      performSearch(input: any) {
        this.getExtrasList(this.pageSize, 0, input,this.sortColumn);
      }

      getExtrasList(size: number = 0, current: number, search: string = '', sortColumn: string = 'created_at', sortOrder: number = 1) {
        this.pageSize = size;
        this.currentPage = current;
        let url = `?limit=${size}&page=${current + 1}&orderby=${sortColumn}&sort=${sortOrder}`
        if (search != '') {
          url += `&search=${search}`
        }
        this._extrasService.getAllExtras(url).subscribe((result: any) => {
          this.extrasList =new MatTableDataSource(result.data?.result);
          this.totalRecords = result.data?.totalCount;
        }, (error: any) => {
            this.showError(error);
        });
      }

      onPageChange(e: any) {
        this.getExtrasList(e.pageSize, e.pageIndex, this.searchInputControl.value, this.sortColumn, this.sortOrder)
      }

      onPageSizeChange(e: any) {
        this.getExtrasList(e.pageSize, e.pageIndex, this.searchInputControl.value, this.sortColumn, this.sortOrder)
      }

      ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this.searchSubject.next(null);
        this.searchSubject.complete();
      }

      addExtras() {
        this._router.navigateByUrl('extras/add-extras')
      }

      editExtras(id) {
        this._router.navigateByUrl('extras/edit-extras/' + id)
      }

      sortData(sort: Sort) {
        this.sortColumn = sort.active;
        this.sortOrder = sort.direction == 'asc' ? 1 : -1;
        this.getExtrasList(this.pageSize, 0, this.searchInputControl.value, sort.active, sort.direction == 'asc' ? 1 : -1)
      }

      deleteExtras(id: any) {
        this.selectedExtrastId = id;
        this.alert = {
          "title": "Delete Extras",
          "message": "Are you sure you want to delete this Extra?",
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
            this._extrasService.deleteExtras(this.selectedExtrastId).subscribe((response: any) => {
              if (response.statusCode == 200) {
                this.getExtrasList(this.pageSize, 0, this.searchInputControl.value);
              }
            }, (error: any) => {
              this.showError(error);
            })
          }
        });
      }

}
