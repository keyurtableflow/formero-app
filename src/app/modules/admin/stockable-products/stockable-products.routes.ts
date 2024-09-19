import { Routes } from '@angular/router';
import { StockableProductsComponent } from './stockable-products.component';
import { StockableProductsListComponent } from './stockable-products-list/stockable-products-list.component';
import { AddEditStockableProductsComponent } from './add-edit-stockable-products/add-edit-stockable-products.component';


export default [
    {
        path      : '',
        pathMatch : 'full',
        redirectTo: 'list',
    },
    {
        path     : 'list',
        component: StockableProductsComponent,
        children : [
            {
                path     : '',
                component: StockableProductsListComponent
            },
        ],
    },
    {
        path     : 'add-stockable-product',
        component: AddEditStockableProductsComponent
    },
    {
        path     : 'edit-stockable-product/:id',
        component: AddEditStockableProductsComponent
    },
] as Routes;
