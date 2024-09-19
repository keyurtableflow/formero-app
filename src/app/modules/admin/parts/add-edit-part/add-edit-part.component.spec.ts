import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddEditPartComponent } from './add-edit-part.component';

describe('AddEditPartComponent', () => {
  let component: AddEditPartComponent;
  let fixture: ComponentFixture<AddEditPartComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [AddEditPartComponent]
    });
    fixture = TestBed.createComponent(AddEditPartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
