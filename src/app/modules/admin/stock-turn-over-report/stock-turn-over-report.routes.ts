import { StockTurnOverReportListComponent } from './stock-turn-over-report-list/stock-turn-over-report-list.component';
import { StockTurnOverReportComponent } from './stock-turn-over-report.component';
import { Routes } from '@angular/router';



export default [
    {
        path      : '',
        pathMatch : 'full',
        redirectTo: 'list',
    },
    {
        path     : 'list',
        component: StockTurnOverReportComponent,
        children : [
            {
                path     : '',
                component: StockTurnOverReportListComponent
            },
        ],
    },
] as Routes;
