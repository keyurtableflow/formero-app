import { Routes } from '@angular/router';
import { ExtrasComponent } from './extras.component';
import { ExtrasListComponent } from './extras-list/extras-list.component';
import { AddEditExtrasComponent } from './add-edit-extras/add-edit-extras.component';

export default [
    {
        path      : '',
        pathMatch : 'full',
        redirectTo: 'list',
    },
    {
        path     : 'list',
        component: ExtrasComponent,
        children : [
            {
                path     : '',
                component: ExtrasListComponent
            },
        ],
    },
    {
        path     : 'add-extras',
        component: AddEditExtrasComponent
    },
    {
        path     : 'edit-extras/:id',
        component: AddEditExtrasComponent
    },
] as Routes;
