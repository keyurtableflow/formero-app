import { Route } from '@angular/router';
import { initialDataResolver } from 'app/app.resolvers';
import { AuthGuard } from 'app/core/auth/guards/auth.guard';
import { NoAuthGuard } from 'app/core/auth/guards/noAuth.guard';
import { LayoutComponent } from 'app/layout/layout.component';

// @formatter:off
/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
export const appRoutes: Route[] = [

    // Redirect empty path to '/example'
    { path: '', pathMatch: 'full', redirectTo: 'users/list' },

    // Redirect signed-in user to the '/example'
    //
    // After the user signs in, the sign-in page will redirect the user to the 'signed-in-redirect'
    // path. Below is another redirection for that path to redirect the user to the desired
    // location. This is a small convenience to keep all main routes together here on this file.
    { path: 'signed-in-redirect', pathMatch: 'full', redirectTo: 'users/list' },

    // Auth routes for guests
    {
        path: '',
        canActivate: [NoAuthGuard],
        canActivateChild: [NoAuthGuard],
        component: LayoutComponent,
        data: {
            layout: 'empty'
        },
        children: [
            { path: 'confirmation-required', loadChildren: () => import('app/modules/auth/confirmation-required/confirmation-required.routes') },
            { path: 'forgot-password', loadChildren: () => import('app/modules/auth/forgot-password/forgot-password.routes') },
            { path: 'reset-password', loadChildren: () => import('app/modules/auth/reset-password/reset-password.routes') },
            { path: 'two-step-verification', loadChildren: () => import('app/modules/auth/two-step-verification/two-step-verification.routes') },
            { path: 'sign-in', loadChildren: () => import('app/modules/auth/sign-in/sign-in.routes') },
            { path: 'sign-up', loadChildren: () => import('app/modules/auth/sign-up/sign-up.routes') }
        ]
    },

    // Auth routes for authenticated users
    {
        path: '',
        canActivate: [AuthGuard],
        canActivateChild: [AuthGuard],
        component: LayoutComponent,
        data: {
            layout: 'empty'
        },
        children: [
            { path: 'sign-out', loadChildren: () => import('app/modules/auth/sign-out/sign-out.routes') },
            { path: 'unlock-session', loadChildren: () => import('app/modules/auth/unlock-session/unlock-session.routes') }
        ]
    },

    // Landing routes
    {
        path: '',
        component: LayoutComponent,
        data: {
            layout: 'empty'
        },
        children: [
            { path: 'home', loadChildren: () => import('app/modules/landing/home/home.routes') },
        ]
    },

    // Admin routes
    {
        path: '',
        canActivate: [AuthGuard],
        canActivateChild: [AuthGuard],
        component: LayoutComponent,
        resolve: {
            initialData: initialDataResolver
        },
        children: [
            // {path: 'example', loadChildren: () => import('app/modules/admin/example/example.routes')},
            { path: 'users', loadChildren: () => import('app/modules/admin/user/user.routes') },
            { path: 'material', loadChildren: () => import('app/modules/admin/material/material.routes') },
            { path: 'process', loadChildren: () => import('app/modules/admin/process/process.routes') },
            { path: 'colour', loadChildren: () => import('app/modules/admin/colour/colour.routes') },
            { path: 'printer', loadChildren: () => import('app/modules/admin/printer/printer.routes') },
            { path: 'finishes', loadChildren: () => import('app/modules/admin/finishes/finishes.routes') },
            { path: 'company', loadChildren: () => import('app/modules/admin/company/company.routes') },
            { path: 'part', loadChildren: () => import('app/modules/admin/parts/parts.routes') },
            { path: 'measurement', loadChildren: () => import('app/modules/admin/measurement/measurement.routes') },
            { path: 'products', loadChildren: () => import('app/modules/admin/products/products.routes') },
            { path: 'stockable-products', loadChildren: () => import('app/modules/admin/stockable-products/stockable-products.routes') },
            { path: 'current-stock', loadChildren: () => import('app/modules/admin/current-stock/current-stock.routes') },
            { path: 'pricing-model', loadChildren: () => import('app/modules/PricingEngine/pricing-model/pricing-model.routes') },
            { path: 'variable', loadChildren: () => import('app/modules/PricingEngine/variable/variable.routes') },
            { path: 'equation', loadChildren: () => import('app/modules/PricingEngine/equation/equation.routes') },
            { path: 'stock-turn-over-report', loadChildren: () => import('app/modules/admin/stock-turn-over-report/stock-turn-over-report.routes') },
            { path: 'promotion', loadChildren: () => import('app/modules/admin/promotion/promotion.routes') },
            { path: 'extras', loadChildren: () => import('app/modules/admin/extras/extras.routes') }

        ]
    }
];
