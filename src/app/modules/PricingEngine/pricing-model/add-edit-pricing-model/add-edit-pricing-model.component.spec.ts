import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddEditPricingModelComponent } from './add-edit-pricing-model.component';

describe('AddEditPricingModelComponent', () => {
  let component: AddEditPricingModelComponent;
  let fixture: ComponentFixture<AddEditPricingModelComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [AddEditPricingModelComponent]
    });
    fixture = TestBed.createComponent(AddEditPricingModelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
