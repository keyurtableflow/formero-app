import { AddEditProductsComponent } from './add-edit-products/add-edit-products.component';
import { Routes } from '@angular/router';
import { ProductsComponent } from './products.component';
import { ProductsListComponent } from './products-list/products-list.component';



export default [
    {
        path      : '',
        pathMatch : 'full',
        redirectTo: 'list',
    },
    {
        path     : 'list',
        component: ProductsComponent,
        children : [
            {
                path     : '',
                component: ProductsListComponent
            },
        ],
    },
    {
        path     : 'add-product',
        component: AddEditProductsComponent
    },
    {
        path     : 'edit-product/:id',
        component: AddEditProductsComponent
    },
] as Routes;
