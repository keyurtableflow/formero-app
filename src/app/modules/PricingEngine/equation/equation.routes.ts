import { Routes } from '@angular/router';
import { EquationComponent } from './equation.component';
import { EquationListComponent } from './equation-list/equation-list.component';
import { AddEditEquationComponent } from './add-edit-equation/add-edit-equation.component';
import { EquationPartsComponent } from './equation-parts/equation-parts.component';




export default [
    // {
    //     path      : '',
    //     pathMatch : 'full',
    //     redirectTo: 'list',
    // },
    // {
    //     path     : 'list',
    //     component: EquationComponent,
    //     children : [
    //         {
    //             path     : '',
    //             component: EquationListComponent
    //         },
    //     ],
    // },
    // {
    //     path     : 'add-equation',
    //     component: AddEditEquationComponent
    // },
    // {
    //     path     : 'edit-equation/:id',
    //     component: AddEditEquationComponent
    // },
    {
        path     : 'equation-parts/:id',
        component: EquationPartsComponent
    },
    {
        path     : 'equation-parts/:id/:id',
        component: EquationPartsComponent
    },
] as Routes;
