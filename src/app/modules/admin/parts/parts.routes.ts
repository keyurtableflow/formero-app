import { Routes } from '@angular/router';
import { PartListComponent } from './part-list/part-list.component';
import { AddEditPartComponent } from './add-edit-part/add-edit-part.component';

export default [
    {
        path      : '',
        pathMatch : 'full',
        redirectTo: 'list',
    },
    {
        path     : 'list',
        component: PartListComponent,
        children : [
            {
                path     : '',
                component: PartListComponent
            },
        ],
    },
    {
        path     : 'add-part',
        component: AddEditPartComponent
    },
    {
        path     : 'edit-part/:id',
        component: AddEditPartComponent
    },
] as Routes;
