import { Routes } from '@angular/router';
import { UserComponent } from './user.component';
import { UserListComponent } from './user-list/user-list.component';
import { AddEditUserComponent } from './add-edit-user/add-edit-user.component';

export default [
    {
        path      : '',
        pathMatch : 'full',
        redirectTo: 'list',
    },
    {
        path     : 'list',
        component: UserComponent,
        children : [
            {
                path     : '',
                component: UserListComponent
            },
        ],
    },
    {
        path     : 'add-user',
        component: AddEditUserComponent
    },
    {
        path     : 'edit-user/:id',
        component: AddEditUserComponent
    },
] as Routes;
