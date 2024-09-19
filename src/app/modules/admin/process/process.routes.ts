import { Routes } from '@angular/router';
import { ProcessComponent } from './process.component';
import { ProcessListComponent } from './process-list/process-list.component';
import { AddEditProcessComponent } from './add-edit-process/add-edit-process.component';
import { ProcessVariableComponent } from './process-variable/process-variable.component';

export default [
    {
        path      : '',
        pathMatch : 'full',
        redirectTo: 'list',
    },
    {
        path     : 'list',
        component: ProcessComponent,
        children : [
            {
                path     : '',
                component: ProcessListComponent
            },
        ],
    },
    {
        path     : 'add-process',
        component: AddEditProcessComponent
    },
    {
        path     : 'edit-process/:id',
        component: AddEditProcessComponent
    },
    {
        path     : 'process-variables/:id',
        component: ProcessVariableComponent
    },
] as Routes;
