import { Routes } from '@angular/router';
import { CompanyComponent } from './company.component';
import { CompanyListComponent } from './company-list/company-list.component';
import { AddEditCompanyComponent } from './add-edit-company/add-edit-company.component';

export default [
    {
        path      : '',
        pathMatch : 'full',
        redirectTo: 'list',
    },
    {
        path     : 'list',
        component: CompanyComponent,
        children : [
            {
                path     : '',
                component: CompanyListComponent
            },
        ],
    },
    {
        path     : 'add-company',
        component: AddEditCompanyComponent
    },
    {
        path     : 'edit-company/:id',
        component: AddEditCompanyComponent
    },
] as Routes;
