import { Routes } from '@angular/router';
import { PrinterComponent } from './printer.component';
import { PrinterListComponent } from './printer-list/printer-list.component';
import { AddEditPrinterComponent } from './add-edit-printer/add-edit-printer.component';
import { PrinterVariableComponent } from './printer-variable/printer-variable.component';

export default [
    {
        path      : '',
        pathMatch : 'full',
        redirectTo: 'list',
    },
    {
        path     : 'list',
        component: PrinterComponent,
        children : [
            {
                path     : '',
                component: PrinterListComponent
            },
        ],
    },
    {
        path     : 'add-printer',
        component: AddEditPrinterComponent
    },
    {
        path     : 'edit-printer/:id',
        component: AddEditPrinterComponent
    },
    {
        path     : 'printer-variables/:id',
        component: PrinterVariableComponent
    },
] as Routes;
