import { Routes } from '@angular/router';
import { PricingModelComponent } from './pricing-model.component';
import { PricingModelListComponent } from './pricing-model-list/pricing-model-list.component';
import { AddEditPricingModelComponent } from './add-edit-pricing-model/add-edit-pricing-model.component';
import { PricingModelVariableComponent } from './pricing-model-variable/pricing-model-variable.component';



export default [
    {
        path      : '',
        pathMatch : 'full',
        redirectTo: 'list',
    },
    {
        path     : 'list',
        component: PricingModelComponent,
        children : [
            {
                path     : '',
                component: PricingModelListComponent
            },
        ],
    },
    {
        path     : 'add-pricing-model',
        component: AddEditPricingModelComponent
    },
    {
        path     : 'edit-pricing-model/:id',
        component: AddEditPricingModelComponent
    },
    {
        path     : 'pricingModel-variables/:id',
        component: PricingModelVariableComponent
    },
] as Routes;
