import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCheckboxChange, MatCheckboxModule } from '@angular/material/checkbox';
import { FormControl, FormsModule, NgModel } from '@angular/forms';

@Component({
    selector: 'app-select-all-option',
    standalone: true,
    imports: [CommonModule, MatCheckboxModule, FormsModule],
    templateUrl: './select-all-option.component.html',
    styleUrls: ['./select-all-option.component.scss']
})
export class SelectAllOptionComponent {
    @Input() model: FormControl;
    @Input() values = [];
    @Input() text = 'Select All';

    isChecked(): boolean {
        return this.model.value && this.values?.length
          && this.model.value?.length === this.values?.map(value => value._id).length;
      }

      isIndeterminate(): boolean {
        return this.model.value && this.values?.length && this.model.value?.length
          && this.model.value?.length < this.values?.map(value => value._id).length;
      }

    toggleSelection(change: MatCheckboxChange): void {
        if (change.checked) {
            this.model.setValue(this.values.map(value => value._id));
          } else {
            this.model.setValue([]);
          }
    }

}
