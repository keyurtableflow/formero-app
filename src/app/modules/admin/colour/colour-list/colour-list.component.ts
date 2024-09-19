import { AsyncPipe, CommonModule, CurrencyPipe, NgClass, NgFor, NgIf, NgTemplateOutlet } from '@angular/common';
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
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { ColourService } from 'app/core/services/colour.service';

@Component({
  selector: 'app-colour-list',
  templateUrl: './colour-list.component.html',
  styleUrls: ['./colour-list.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: fuseAnimations,
  standalone: true,
  imports: [NgIf, MatProgressBarModule, CommonModule, MatFormFieldModule, MatIconModule, MatMenuModule, MatInputModule, FormsModule, ReactiveFormsModule, MatButtonModule, MatSortModule, NgFor, NgTemplateOutlet, MatPaginatorModule, NgClass, MatSlideToggleModule, MatSelectModule, MatOptionModule, MatCheckboxModule, MatRippleModule, AsyncPipe, CurrencyPipe],
})
export class ColourListComponent {
  colourList: any[] = [];

  totalRecords: number = 10;
  currentPage: number = 0;
  pageSize: number = 10;

  flashMessage: 'success' | 'error' | null = null;
  isLoading: boolean = false;
  searchInputControl: UntypedFormControl = new UntypedFormControl('');
  selectedProductForm: UntypedFormGroup;
  tagsEditMode: boolean = false;
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  sortedData: any[];
  alert: any;
  selectedProductId: any;

  private searchSubject = new Subject<string>();
  private readonly debounceTimeMs = 300;
  sortColumn: string;
  sortOrder: number;


  /**
       * Constructor
       */
  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _colourService: ColourService,
    private _router: Router,
    private _fuseConfirmationService: FuseConfirmationService
  ) {
  }

  ngOnInit() {
    this._changeDetectorRef.detectChanges();
    this.getColourList(this.pageSize, this.currentPage);
    this.searchSubject.pipe(debounceTime(this.debounceTimeMs)).subscribe((searchValue: any) => {
      this.performSearch(searchValue);
    });
  }

  searchRecord() {
    this.searchSubject.next(this.searchInputControl.value);
  }

  performSearch(input: any) {
    this.getColourList(this.pageSize, this.currentPage, input);
  }

  getColourList(size: number = 0, current: number, search: string = '', sortColumn: string = 'created_at', sortOrder: number = 1) {
    this.pageSize = size;
    this.currentPage = current;
    let url = `?limit=${size}&page=${current+1}&orderby=${sortColumn}&sort=${sortOrder}`
    if(search != ''){
        url += `&search=${search}`
    }
    this._colourService.getAllColour(url).subscribe((result: any) => {
      this.colourList = result.data?.result;
      this.sortedData = this.colourList.slice();
      this.totalRecords = result.data?.totalCount;
      this._changeDetectorRef.detectChanges();
    }, (error: any) => {
    });
  }


  ngAfterViewInit(): void {
  }

  onPageChange(e: any) {
    this.getColourList(e.pageSize, e.pageIndex, this.searchInputControl.value, this.sortColumn, this.sortOrder)
  }

  onPageSizeChange(e: any) {
    this.getColourList(e.pageSize, e.pageIndex, this.searchInputControl.value, this.sortColumn, this.sortOrder)
  }

  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }

  redirectToAddColour() {
    this._router.navigateByUrl('colour/add-colour')
  }

  editMaterial(id) {
    this._router.navigateByUrl('colour/edit-colour/' + id)
  }

  sortData(sort: Sort) {
    this.sortColumn = sort.active;
    this.sortOrder = sort.direction == 'asc' ? 1 : -1;
    this.getColourList(this.pageSize, this.currentPage,  this.searchInputControl.value, sort.active, sort.direction == 'asc' ? 1 : -1)
}

  deleteColour(id: any) {
    this.selectedProductId = id;
    this.alert = {
      "title": "Delete Colour",
      "message": "Are you sure you want to delete this colour ?",
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
        this._colourService.deleteColour(this.selectedProductId).subscribe((response: any) => {
          if (response.statusCode == 200) {
            this.getColourList(0, 0);

          }
        }, (error: any) => {
          this.showError(error);
        })
      }
    });
  }
}


function compare(a: number | string, b: number | string, isAsc: boolean) {
  return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
}
