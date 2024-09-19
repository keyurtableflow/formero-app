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
import { debounceTime, Subject } from 'rxjs';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { Router } from '@angular/router';
import { EquationService } from 'app/core/services/equation.service';

@Component({
  selector: 'app-equation-list',
  standalone: true,
  imports: [NgIf,MatProgressBarModule,MatTableModule,CommonModule, MatFormFieldModule, MatIconModule, MatMenuModule, MatInputModule, FormsModule, ReactiveFormsModule, MatButtonModule, MatSortModule, NgFor, MatPaginatorModule, NgClass],
  templateUrl: './equation-list.component.html',
  styleUrls: ['./equation-list.component.scss']
})
export class EquationListComponent {

    alert: any;
    currentPage: number = 0;
    displayedColumns = ["function_name", "action"];
    flashMessage: 'success' | 'error' | null = null;
    equationList: MatTableDataSource<any>;
    pageSize: number = 10;
    isLoading: boolean = false;
    searchInputControl: UntypedFormControl = new UntypedFormControl('');
    sortColumn: string;
    selectedEquationtId: any;
    sortOrder: number;
    totalRecords: number = 10;
    tagsEditMode: boolean = false;
    private searchSubject = new Subject<string>();
    private readonly debounceTimeMs = 300;

    constructor(
        private _router: Router,
        private _fuseConfirmationService: FuseConfirmationService,
        private _equationService:EquationService
    ) { }

    ngOnInit() {
        this.getEquationList(this.pageSize, this.currentPage);
        this.searchSubject.pipe(debounceTime(this.debounceTimeMs)).subscribe((searchValue: any) => {
          this.performSearch(searchValue);
        });
      }


      searchRecord() {
        this.searchSubject.next(this.searchInputControl.value);
      }

      performSearch(input: any) {
        this.getEquationList(this.pageSize, 0, input,this.sortColumn);
      }

      getEquationList(size: number = 0, current: number, search: string = '', sortColumn: string = 'created_at', sortOrder: number = 1) {
        this.pageSize = size;
        this.currentPage = current;
        let url = `?limit=${size}&page=${current + 1}&orderby=${sortColumn}&sort=${sortOrder}`
        if (search != '') {
          url += `&search=${search}`
        }
        this._equationService.getAllEquation(url).subscribe((result: any) => {
          this.equationList =new MatTableDataSource(result.data?.result);
          this.totalRecords = result.data?.totalCount;
        }, (error: any) => {
            this.showError(error);
        });
      }

      onPageChange(e: any) {
        this.getEquationList(e.pageSize, e.pageIndex, this.searchInputControl.value, this.sortColumn, this.sortOrder)
      }

      onPageSizeChange(e: any) {
        this.getEquationList(e.pageSize, e.pageIndex, this.searchInputControl.value, this.sortColumn, this.sortOrder)
      }

      addEquation() {
        this._router.navigateByUrl('equation/add-equation')
      }

      editEquation(id) {
        this._router.navigateByUrl('equation/edit-equation/' + id)
      }

      sortData(sort: Sort) {
        this.sortColumn = sort.active;
        this.sortOrder = sort.direction == 'asc' ? 1 : -1;
        this.getEquationList(this.pageSize, 0, this.searchInputControl.value, sort.active, sort.direction == 'asc' ? 1 : -1)
      }

      deleteEquation(id: any) {
        this.selectedEquationtId = id;
        this.alert = {
          "title": "Delete Equation",
          "message": "Are you sure you want to delete this Equation ?",
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
            this._equationService.deleteEquation(this.selectedEquationtId).subscribe((response: any) => {
              if (response.statusCode == 200) {
                this.getEquationList(this.pageSize, 0, this.searchInputControl.value);

              }
            }, (error: any) => {
              this.showError(error);
            })
          }
        });
      }

      ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this.searchSubject.next(null);
        this.searchSubject.complete();
      }



}
