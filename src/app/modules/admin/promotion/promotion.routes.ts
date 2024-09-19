import { Routes } from '@angular/router';
import { PromotionComponent } from './promotion.component';
import { ListComponent } from './list/list.component';
import { AddEditComponent } from './add-edit/add-edit.component';

export default [
    {
        path: '',
        component: PromotionComponent,
        children: [
            {
                path: '',
                component: ListComponent,
            },
        ],
    },
    {
        path: 'add',
        component: AddEditComponent
    },
    {
        path: 'edit/:id',
        component: AddEditComponent
    },
] as Routes;
