import { Routes } from '@angular/router';
import { VariableComponent } from './variable.component';
import { VariableListComponent } from './variable-list/variable-list.component';




export default [
    {
        path      : '',
        pathMatch : 'full',
        redirectTo: 'list',
    },
    {
        path     : 'list',
        component: VariableComponent,
        children : [
            {
                path     : '',
                component: VariableListComponent
            },
        ],
    },
] as Routes;
