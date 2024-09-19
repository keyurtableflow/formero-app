import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StockTurnOverReportListComponent } from './stock-turn-over-report-list.component';

describe('StockTurnOverReportListComponent', () => {
  let component: StockTurnOverReportListComponent;
  let fixture: ComponentFixture<StockTurnOverReportListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [StockTurnOverReportListComponent]
    });
    fixture = TestBed.createComponent(StockTurnOverReportListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
