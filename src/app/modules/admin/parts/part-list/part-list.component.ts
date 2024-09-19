import { AsyncPipe, CurrencyPipe, NgClass, NgFor, NgIf, NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatOptionModule, MatRippleModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSortModule, Sort } from '@angular/material/sort';
import { fuseAnimations } from '@fuse/animations';
import { Subject, debounceTime } from 'rxjs';
import { Router } from '@angular/router';
import { MatMenuModule } from '@angular/material/menu';
import { PartService } from 'app/core/services/part.service';
import { FuseConfirmationService } from '@fuse/services/confirmation';

@Component({
  selector: 'app-part-list',
  templateUrl: './part-list.component.html',
  styleUrls: ['./part-list.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: fuseAnimations,
  standalone: true,
  imports: [NgIf, MatProgressBarModule, MatFormFieldModule, MatIconModule, MatMenuModule, MatInputModule, FormsModule, ReactiveFormsModule, MatButtonModule, MatSortModule, NgFor, NgTemplateOutlet, MatPaginatorModule, NgClass, MatSlideToggleModule, MatSelectModule, MatOptionModule, MatCheckboxModule, MatRippleModule, AsyncPipe, CurrencyPipe],
})
export class PartListComponent {
  userList: any[] = [];

  totalRecords: number = 10;
  currentPage: number = 0;
  pageSize: number = 10;

  flashMessage: 'success' | 'error' | null = null;
  isLoading: boolean = false;
  searchInputControl: UntypedFormControl = new UntypedFormControl('');
  private searchSubject = new Subject<string>();
  selectedProductForm: UntypedFormGroup;
  tagsEditMode: boolean = false;
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  sortedData: any[];
  private readonly debounceTimeMs = 300;
  sortOrder: number;
  sortColumn: string;

  constructor(
      private _changeDetectorRef: ChangeDetectorRef,
        private _fuseConfirmationService: FuseConfirmationService,
      private _partService: PartService,
      private _router: Router
  ) {
      // this.getPartList(this.currentPage, this.pageSize);
  }

  ngOnInit() {
      // this.userList = this.parts;
      // this.sortedData = this.userList.slice();
      this.getPartList(this.pageSize,this.currentPage, this.searchInputControl.value);

      this.searchSubject.pipe(debounceTime(this.debounceTimeMs)).subscribe((searchValue:any) => {
          this.performSearch(searchValue);
        });
  }

  searchRecord(){
      this.searchSubject.next(this.searchInputControl.value);
  }

  performSearch(input:any){
      this.getPartList(this.pageSize,this.currentPage,input);
  }

  getPartList(size: number = 0, current: number, search: string = '', sortColumn: string = 'created_at', sortOrder: number = 1) {
      this.pageSize = size;
      this.currentPage = current;
      let url = `?limit=${size}&page=${current+1}&orderby=${sortColumn}&sort=${sortOrder}`
      if(search != ''){
          url += `&search=${search}`
      }
      this._partService.getAllPart(url).subscribe((result: any) => {
          this.userList = result.data?.result;
          // this.userList = this.parts;
          this.sortedData = this.userList.slice();
          this.totalRecords = result.data?.totalCount;
          this._changeDetectorRef.detectChanges();
      },(error: any) => {
        this.showError(error);
      });
  }

  /**
   * After view init
   */
  ngAfterViewInit(): void {
  }

  onPageChange(e: any) {
      this.getPartList(e.pageSize, e.pageIndex, this.searchInputControl.value, this.sortColumn, this.sortOrder)
  }

  onPageSizeChange(e: any) {
      this.getPartList(e.pageSize, e.pageIndex, this.searchInputControl.value, this.sortColumn, this.sortOrder)
  }
  /**
   * On destroy
   */
  ngOnDestroy(): void {
      // Unsubscribe from all subscriptions
      this._unsubscribeAll.next(null);
      this._unsubscribeAll.complete();
  }

  redirectToAddPart() {
      this._router.navigateByUrl('part/add-part')
  }

  editPart(id) {
      this._router.navigateByUrl('part/edit-part/' + id)
  }

  sortData(sort: Sort) {
      this.sortColumn = sort.active;
      this.sortOrder = sort.direction == 'asc' ? 1 : -1;
      this.getPartList(this.pageSize, this.currentPage,  this.searchInputControl.value, sort.active, sort.direction == 'asc' ? 1 : -1)
  }

  deletePart(id) {
      let alert = {
          "title": "Delete Part",
          "message": "Are you sure you want to delete this part ?",
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
      this.openConfirmationDialog(alert, id);
  }

  openConfirmationDialog(data: any,id?:any): void {

      const dialogRef = this._fuseConfirmationService.open(data);

      dialogRef.afterClosed().subscribe((result) => {
          if (result == 'confirmed') {
              this._partService.deletePart(id).subscribe((response: any) => {
                  if (response.statusCode == 200) {
                      this.getPartList(0, 0);

                  }
              }, (error: any) => {
                  this.showError(error);
              })
          }
      });
  }

  showError(err: any) {
      let alert = {
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
      this.openConfirmationDialog(alert);
    }
}
