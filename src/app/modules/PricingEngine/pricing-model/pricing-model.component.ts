import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-pricing-model',
  standalone: true,
  imports: [CommonModule,RouterOutlet],
  templateUrl: './pricing-model.component.html',
  styleUrls: ['./pricing-model.component.scss']
})
export class PricingModelComponent {

}
