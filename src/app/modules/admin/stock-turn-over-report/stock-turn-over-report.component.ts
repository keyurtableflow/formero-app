import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-stock-turn-over-report',
  standalone: true,
  imports: [CommonModule,RouterOutlet],
  templateUrl: './stock-turn-over-report.component.html',
  styleUrls: ['./stock-turn-over-report.component.scss']
})
export class StockTurnOverReportComponent {

}
