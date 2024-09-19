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
import { MaterialService } from 'app/core/services/material.service';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { HistoryService } from 'app/core/services/history.service';

@Component({
    selector: 'app-material-list',
    templateUrl: './material-list.component.html',
    styleUrls: ['./material-list.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations: fuseAnimations,
    standalone: true,
    imports: [NgIf, MatProgressBarModule,MatTableModule, MatFormFieldModule, MatIconModule, MatMenuModule, MatInputModule, FormsModule, ReactiveFormsModule, MatButtonModule, MatSortModule, NgFor, NgTemplateOutlet, MatPaginatorModule, NgClass, MatSlideToggleModule, MatSelectModule, MatOptionModule, MatCheckboxModule, MatRippleModule, AsyncPipe, CurrencyPipe],

})
export class MaterialListComponent implements OnInit, OnDestroy {

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

    private readonly debounceTimeMs = 300;
    sortOrder: number;
    sortColumn: string;
    materialList: MatTableDataSource<any>;
    displayedColumns = ["material_name","finishes_ids", "extras_ids","set_up_fee","order_value", "action" ]

    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
          private _fuseConfirmationService: FuseConfirmationService,
        private _materialService: MaterialService,
        private _router: Router,
        private _historyService:HistoryService
    ) {
    }

    ngOnInit() {
        this._changeDetectorRef.detectChanges();
        this.getMaterialList(this.pageSize,this.currentPage, this.searchInputControl.value);

        this.searchSubject.pipe(debounceTime(this.debounceTimeMs)).subscribe((searchValue:any) => {
            this.performSearch(searchValue);
          });
    }

    searchRecord(){
        this.searchSubject.next(this.searchInputControl.value);
    }

    performSearch(input:any){
        this.getMaterialList(this.pageSize,this.currentPage,input);
    }

    getMaterialList(size: number = 0, current: number, search: string = '', sortColumn: string = 'created_at', sortOrder: number = 1) {
        this.pageSize = size;
        this.currentPage = current;
        let url = `?limit=${size}&page=${current+1}&orderby=${sortColumn}&sort=${sortOrder}`
        if(search != ''){
            url += `&search=${search}`
        }
        this._materialService.getAllMaterial(url).subscribe((result: any) => {
            this.materialList = new MatTableDataSource(result.data?.result);
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
        this.getMaterialList(e.pageSize, e.pageIndex, this.searchInputControl.value, this.sortColumn, this.sortOrder)
    }

    onPageSizeChange(e: any) {
        this.getMaterialList(e.pageSize, e.pageIndex, this.searchInputControl.value, this.sortColumn, this.sortOrder)
    }

    editVariables(id){
        this._historyService.clear();
        this._historyService.push('material/material-variables/' + id);
        this._router.navigateByUrl('material/material-variables/' + id);
      }
    /**
     * On destroy
     */
    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    redirectToAddMaterial() {
        this._router.navigateByUrl('material/add-material')
    }

    editMaterial(id) {
        this._router.navigateByUrl('material/edit-material/' + id)
    }

    sortData(sort: Sort) {
        this.sortColumn = sort.active;
        this.sortOrder = sort.direction == 'asc' ? 1 : -1;
        this.getMaterialList(this.pageSize, this.currentPage,  this.searchInputControl.value, sort.active, sort.direction == 'asc' ? 1 : -1)
    }

    deleteMaterial(id) {
        let alert = {
            "title": "Delete Material",
            "message": "Are you sure you want to delete this material ?",
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
                this._materialService.deleteMaterial(id).subscribe((response: any) => {
                    if (response.statusCode == 200) {
                        this.getMaterialList(0, 0);

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

      getFinishesNames(finishesData: any[]): string {
        if(finishesData?.length){
            return finishesData?.map(finishes => finishes?.finishing_name).join(', ');
        }else{
            return '-'
        }
      }

      getExtrasNames(extrasData: any[]): string {
        if(extrasData?.length){
            return extrasData?.map(extra => extra?.name).join(', ');
        }else{
            return '-'
        }
      }
}


function compare(a: number | string, b: number | string, isAsc: boolean) {
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
}
