import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PricingModelListComponent } from './pricing-model-list.component';

describe('PricingModelListComponent', () => {
  let component: PricingModelListComponent;
  let fixture: ComponentFixture<PricingModelListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [PricingModelListComponent]
    });
    fixture = TestBed.createComponent(PricingModelListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
