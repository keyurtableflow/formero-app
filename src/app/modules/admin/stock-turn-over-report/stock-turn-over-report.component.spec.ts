import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StockTurnOverReportComponent } from './stock-turn-over-report.component';

describe('StockTurnOverReportComponent', () => {
  let component: StockTurnOverReportComponent;
  let fixture: ComponentFixture<StockTurnOverReportComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [StockTurnOverReportComponent]
    });
    fixture = TestBed.createComponent(StockTurnOverReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
