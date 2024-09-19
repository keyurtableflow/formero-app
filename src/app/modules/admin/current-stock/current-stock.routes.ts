import { Routes } from '@angular/router';
import { CurrentStockComponent } from './current-stock.component';
import { CurrentStockListComponent } from './current-stock-list/current-stock-list.component';
import { AddEditCurrentStockComponent } from './add-edit-current-stock/add-edit-current-stock.component';
import { AdjustStockComponent } from './adjust-stock/adjust-stock.component';


export default [
    {
        path      : '',
        pathMatch : 'full',
        redirectTo: 'list',
    },
    {
        path     : 'list',
        component: CurrentStockComponent,
        children : [
            {
                path     : '',
                component: CurrentStockListComponent
            },
        ],
    },
    {
        path     : 'add-current-stock',
        component: AddEditCurrentStockComponent
    },
    {
        path     : 'edit-current-stock/:id',
        component: AddEditCurrentStockComponent
    },
    {
        path     : 'adjust-stock',
        component: AdjustStockComponent
    },
] as Routes;
