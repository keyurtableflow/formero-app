import { Routes } from '@angular/router';
import { MeasurementComponent } from './measurement.component';
import { MeasurementListComponent } from './measurement-list/measurement-list.component';
import { AddEditMeasurementComponent } from './add-edit-measurement/add-edit-measurement.component';


export default [
    {
        path      : '',
        pathMatch : 'full',
        redirectTo: 'list',
    },
    {
        path     : 'list',
        component: MeasurementComponent,
        children : [
            {
                path     : '',
                component: MeasurementListComponent
            },
        ],
    },
    {
        path     : 'add-measurement',
        component: AddEditMeasurementComponent
    },
    {
        path     : 'edit-measurement/:id',
        component: AddEditMeasurementComponent
    },
] as Routes;
