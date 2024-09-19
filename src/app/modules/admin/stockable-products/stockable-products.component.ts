import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-stockable-products',
  standalone: true,
  imports: [CommonModule,RouterOutlet],
  templateUrl: './stockable-products.component.html',
  styleUrls: ['./stockable-products.component.scss']
})
export class StockableProductsComponent {

}
