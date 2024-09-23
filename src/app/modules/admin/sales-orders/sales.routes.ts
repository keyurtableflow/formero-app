import { Routes } from '@angular/router';
import { SalesOrdersComponent } from './sales-orders.component';
import { SalesListComponent } from './sales-list/sales-list.component';
import { AddEditSalesComponent } from './add-edit-sales/add-edit-sales.component';

export default [
    {
        path: '',
        component: SalesOrdersComponent,
        children: [
            {
                path: '',
                component: SalesListComponent,
            },
        ],
    },
     {
        path     : 'add-sales',
        component: AddEditSalesComponent
    },
    {
        path     : 'edit-sales/:id',
        component: AddEditSalesComponent
    },
] as Routes;
