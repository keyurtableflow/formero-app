import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddEditSalesComponent } from './add-edit-sales.component';

describe('AddEditSalesComponent', () => {
  let component: AddEditSalesComponent;
  let fixture: ComponentFixture<AddEditSalesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [AddEditSalesComponent]
    });
    fixture = TestBed.createComponent(AddEditSalesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
