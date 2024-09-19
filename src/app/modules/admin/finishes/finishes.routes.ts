import { Routes } from '@angular/router';
import { FinishesComponent } from './finishes.component';
import { FinishesListComponent } from './finishes-list/finishes-list.component';
import { AddEditFinishesComponent } from './add-edit-finishes/add-edit-finishes.component';
import { FinishesVariableComponent } from './finishes-variable/finishes-variable.component';

export default [
    {
        path      : '',
        pathMatch : 'full',
        redirectTo: 'list',
    },
    {
        path     : 'list',
        component: FinishesComponent,
        children : [
            {
                path     : '',
                component: FinishesListComponent
            },
        ],
    },
    {
        path     : 'add-finishes',
        component: AddEditFinishesComponent
    },
    {
        path     : 'edit-finishes/:id',
        component: AddEditFinishesComponent
    },
    {
        path     : 'finishes-variables/:id',
        component: FinishesVariableComponent
    },
] as Routes;
