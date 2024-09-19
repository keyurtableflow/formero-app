import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { PromotionService } from 'app/core/services/promotion.service';
import { debounceTime, Observer, Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatProgressBarModule,
    MatTableModule,
    MatFormFieldModule,
    MatIconModule,
    MatMenuModule,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatSortModule,
    MatPaginatorModule,
    MatSlideToggleModule,
  ],
})
export class ListComponent implements OnInit {
  private searchSubject = new Subject<string>();
  private status = 1;
  public promotions = [];
  public isLoading = false;
  public totalRecords = 0;
  public currentPage = 0;
  public pageSize = 10;
  public orderBy = '_id';
  public sortBy = 'asc';
  public displayedColumns = [
    'active',
    'name',
    'qualifiers',
    'discount',
    'usage_limit',
    'date_limits',
    'sales_order_count',
    'action',
  ];
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  constructor(
    private _router: Router,
    private _activatedRoute: ActivatedRoute,
    private _promotionSerivce: PromotionService
  ) { }

  ngOnInit() {
    this.getPromotions();
    this.searchSubject
      .pipe(takeUntil(this._unsubscribeAll))
      .pipe(debounceTime(300))
      .subscribe((searchValue: string) => {
        this.getPromotions(searchValue);
      });
  }

  public handleSearch(event: any) {
    if (event.target.value.length >= 3) {
      this.searchSubject.next(event.target.value.trim());
    } else if (event.target.value.trim() === '') {
      this.getPromotions()
    }
  }
  public sortData(e: any) {
    this.orderBy = e.active;
    this.sortBy = e.direction;
    this.getPromotions();
  }

  public editPromotion(id: string) {
    this._router.navigate(['./', 'edit', `${id}`], {
      relativeTo: this._activatedRoute,
    });
  }

  public createPromotion() {
    this._router.navigate(['./', 'add'], {
      relativeTo: this._activatedRoute,
    });
  }
  private getPromotions(searchBy?: string) {
    this._promotionSerivce
      .getPromotions(
        false,
        this.orderBy,
        this.sortBy,
        this.currentPage,
        this.pageSize,
        searchBy ?? '',
        this.status
      )
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((res) => {
        res.data?.result.forEach((promotion) => {
          promotion.qualifiers.displayProcesses =
            promotion.qualifiers.processes.map(
              (ele) => ele.short_name
            );
        });
        this.promotions = res.data?.result;
        this.totalRecords = res.data.totalCount;
        this.pageSize = res.data.limit;
      });
  }
  public handlePageChange(event: any) {
    this.pageSize = event.pageSize;
    this.currentPage = event.pageIndex;
    this.getPromotions();
  }
  public handleToggleChange(event: any) {
    this.status = event.checked ? 0 : 1
    this.getPromotions();
  }
}
