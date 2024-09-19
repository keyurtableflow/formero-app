import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddEditCompanyComponent } from './add-edit-company.component';

describe('AddEditCompanyComponent', () => {
  let component: AddEditCompanyComponent;
  let fixture: ComponentFixture<AddEditCompanyComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [AddEditCompanyComponent]
    });
    fixture = TestBed.createComponent(AddEditCompanyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
