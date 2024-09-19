import { Routes } from '@angular/router';
import { ColourComponent } from './colour.component';
import { ColourListComponent } from './colour-list/colour-list.component';
import { AddEditColourComponent } from './add-edit-colour/add-edit-colour.component';

export default [
    {
        path      : '',
        pathMatch : 'full',
        redirectTo: 'list',
    },
    {
        path     : 'list',
        component: ColourComponent,
        children : [
            {
                path     : '',
                component: ColourListComponent
            },
        ],
    },
    {
        path     : 'add-colour',
        component: AddEditColourComponent
    },
    {
        path     : 'edit-colour/:id',
        component: AddEditColourComponent
    },
] as Routes;
