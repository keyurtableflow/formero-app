import { Routes } from '@angular/router';
import { MaterialComponent } from './material.component';
import { MaterialListComponent } from './material-list/material-list.component';
import { AddEditMaterialComponent } from './add-edit-material/add-edit-material.component';
import { MaterialVariableComponent } from './material-variable/material-variable.component';

export default [
    {
        path      : '',
        pathMatch : 'full',
        redirectTo: 'list',
    },
    {
        path     : 'list',
        component: MaterialComponent,
        children : [
            {
                path     : '',
                component: MaterialListComponent
            },
        ],
    },
    {
        path     : 'add-material',
        component: AddEditMaterialComponent
    },
    {
        path     : 'edit-material/:id',
        component: AddEditMaterialComponent
    },
    {
        path     : 'material-variables/:id',
        component: MaterialVariableComponent
    },
] as Routes;
