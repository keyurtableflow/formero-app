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
import { UserService } from 'app/core/user/user.service';
import { Router } from '@angular/router';
import { MatMenuModule } from '@angular/material/menu';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import * as countries from '../../../../../assets/CountryCodes.json';

@Component({
    selector: 'user-list',
    templateUrl: './user-list.component.html',
    styleUrls: [
        './user-list.component.scss'
    ],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations: fuseAnimations,
    standalone: true,
    imports: [NgIf, MatProgressBarModule, MatFormFieldModule, MatIconModule, MatMenuModule, MatInputModule, FormsModule, ReactiveFormsModule, MatButtonModule, MatSortModule, NgFor, NgTemplateOutlet, MatPaginatorModule, NgClass, MatSlideToggleModule, MatSelectModule, MatOptionModule, MatCheckboxModule, MatRippleModule, AsyncPipe, CurrencyPipe],
})
export class UserListComponent implements OnInit, OnDestroy {
    userList: any[] = [];
    countryList: any[] = countries;

    totalRecords: number = 0;
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

    sortedData: any[] = [];
    sortColumn: string;
    sortOrder: number;

    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _userService: UserService,
        private _router: Router,
        private _fuseConfirmationService: FuseConfirmationService
    ) {
        // this.getUserList(this.pageSize,this.currentPage);
    }

    ngOnInit() {
        this.getUserList(this.pageSize, this.currentPage, this.searchInputControl.value);
        this.searchSubject.pipe(debounceTime(this.debounceTimeMs)).subscribe((searchValue:any) => {
            this.performSearch(searchValue);
          });
    }

    searchRecord(){
        this.searchSubject.next(this.searchInputControl.value);
    }

    performSearch(input:any){
        this.getUserList(this.pageSize,this.currentPage,input);
    }

    getUserList(size: number = 0, current: number, search: string = '', sortColumn: string = 'created_at', sortOrder: number = 1) {
        this.pageSize = size;
        this.currentPage = current;
        let url = `?limit=${size}&page=${current+1}&orderby=${sortColumn}&sort=${sortOrder}`
        if(search != ''){
            url += `&search=${search}`
        }
        this._userService.getAllUser(url).subscribe((result: any) => {
            if (result.statusCode == 200) {
                this.userList = result.data?.result;
                this.sortedData = this.userList.slice();
                this.totalRecords = result.data?.totalCount;
                this._changeDetectorRef.detectChanges();
            }
        }, (error : any) => {
            if(error.status == 401){
                this._router.navigateByUrl('sign-in')
            }
        });
    }

    ngAfterViewInit(): void {
    }

    onPageChange(e: any) {
        this.getUserList(e.pageSize, e.pageIndex,  this.searchInputControl.value, this.sortColumn, this.sortOrder)
    }

    onPageSizeChange(e: any) {
        this.getUserList(e.pageSize, e.pageIndex,  this.searchInputControl.value, this.sortColumn, this.sortOrder)
    }

    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    trackByFn(index: number, item: any): any {
        // return item.id || index;
    }

    redirectToAdduser() {
        this._router.navigateByUrl('users/add-user')
    }

    editUser(id) {
        this._router.navigateByUrl('users/edit-user/' + id)
    }

    sortData(sort: Sort) {
        this.sortColumn = sort.active;
        this.sortOrder = sort.direction == 'asc' ? 1 : -1;
        this.getUserList(this.pageSize, this.currentPage,  this.searchInputControl.value, sort.active, sort.direction == 'asc' ? 1 : -1)
    }

    deleteUser(id) {
        let alert = {
            "title": "Delete Printer",
            "message": "Are you sure you want to delete this printer ?",
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
                this._userService.deleteUser(id).subscribe((response: any) => {
                    if (response.statusCode == 200) {
                        this.getUserList(0, 0);

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


function compare(a: number | string, b: number | string, isAsc: boolean) {
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
}
