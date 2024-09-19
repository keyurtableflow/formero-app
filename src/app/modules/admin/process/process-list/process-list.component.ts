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
import { ProcessService } from 'app/core/services/process.service';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { FileManagementService } from 'app/core/services/filemanagement.service';
import { HistoryService } from 'app/core/services/history.service';

@Component({
  selector: 'app-process-list',
  templateUrl: './process-list.component.html',
  styleUrls: ['./process-list.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: fuseAnimations,
  standalone: true,
  imports: [NgIf, MatProgressBarModule,MatTableModule , CommonModule, MatFormFieldModule, MatIconModule, MatMenuModule, MatInputModule, FormsModule, ReactiveFormsModule, MatButtonModule, MatSortModule, NgFor, NgTemplateOutlet, MatPaginatorModule, NgClass, MatSlideToggleModule, MatSelectModule, MatOptionModule, MatCheckboxModule, MatRippleModule, AsyncPipe, CurrencyPipe],

})
export class ProcessListComponent {

  totalRecords: number = 10;
  currentPage: number = 0;
  pageSize: number = 10;

  flashMessage: 'success' | 'error' | null = null;
  isLoading: boolean = false;
  searchInputControl: UntypedFormControl = new UntypedFormControl('');
  selectedProductForm: UntypedFormGroup;
  tagsEditMode: boolean = false;
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  alert: any;
  selectedProductId: any;

  private searchSubject = new Subject<string>();
  private readonly debounceTimeMs = 300;
  sortColumn: string;
  sortOrder: number;

  processes: MatTableDataSource<any>;
  displayedColumns = ["image","process_name","short_name", "instant_quote", "action" ];
  imagePreview:string | ArrayBuffer | null | SafeUrl = '';
  folderName: string = "processImages";
  cachedImageUrls: Map<string, SafeUrl> = new Map();

  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _processService: ProcessService,
    private _router: Router,
    private _fuseConfirmationService: FuseConfirmationService,
    private _fileManagementService: FileManagementService,
    private sanitizer: DomSanitizer,
    private _historyService:HistoryService
  ) {
  }

  ngOnInit() {
    this._changeDetectorRef.detectChanges();
    this.getprocessList(this.pageSize, this.currentPage);
    this.searchSubject.pipe(debounceTime(this.debounceTimeMs)).subscribe((searchValue: any) => {
      this.performSearch(searchValue);
    });
  }

  searchRecord() {
    this.searchSubject.next(this.searchInputControl.value);
  }

  performSearch(input: any) {
    this.getprocessList(this.pageSize, this.currentPage, input);
  }

  getprocessList(size: number = 0, current: number, search: string = '', sortColumn: string = 'created_at', sortOrder: number = 1) {
    this.pageSize = size;
    this.currentPage = current;
    let url = `?limit=${size}&page=${current+1}&orderby=${sortColumn}&sort=${sortOrder}`
    if(search != ''){
        url += `&search=${search}`
    }
    this._processService.getAllProcess(url).subscribe((result: any) => {
      this.processes = new MatTableDataSource(result.data?.result);
      this.totalRecords = result.data?.totalCount;
      this._changeDetectorRef.detectChanges();
    }, (error: any) => {
        this.showError(error);
    });
  }

  editVariables(id){
    this._historyService.clear();
    this._historyService.push('process/process-variables/' + id);
    this._router.navigateByUrl('process/process-variables/' + id);
  }


  ngAfterViewInit(): void {
    this._changeDetectorRef.detectChanges();
  }

  onPageChange(e: any) {
    this.getprocessList(e.pageSize, e.pageIndex, this.searchInputControl.value, this.sortColumn, this.sortOrder)
  }

  onPageSizeChange(e: any) {
    this.getprocessList(e.pageSize, e.pageIndex, this.searchInputControl.value, this.sortColumn, this.sortOrder)
  }

  sortData(sort: Sort) {
    this.sortColumn = sort.active;
    this.sortOrder = sort.direction == 'asc' ? 1 : -1;
    this.getprocessList(this.pageSize, this.currentPage,  this.searchInputControl.value, sort.active, sort.direction == 'asc' ? 1 : -1)
}

  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }

  redirectToAddProcess() {
    this._router.navigateByUrl('process/add-process')
  }

  editMaterial(id) {
    this._router.navigateByUrl('process/edit-process/' + id)
  }

  deleteProcess(id: any) {
    this.selectedProductId = id;
    this.alert = {
      "title": "Delete Process",
      "message": "Are you sure you want to delete this process ?",
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
        this._processService.deleteProcess(this.selectedProductId).subscribe((response: any) => {
          if (response.statusCode == 200) {
            this.getprocessList(0, 0);

          }
        }, (error: any) => {
          this.showError(error);
        })
      }
    });
  }

  getUploadedFile(filePath: string){
    if (!filePath) return null;

    // Check if the URL is already cached
    if (this.cachedImageUrls.has(filePath)) {
      return this.cachedImageUrls.get(filePath) as SafeUrl;
    }

    const fileName = filePath.split('/').pop();
    const sanitizedUrl = this.sanitizer.bypassSecurityTrustUrl(this._fileManagementService.getFile(this.folderName, fileName));

    // Cache the URL
    this.cachedImageUrls.set(filePath, sanitizedUrl);

    return sanitizedUrl;
}

}

function compare(a: number | string, b: number | string, isAsc: boolean) {
  return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
}
