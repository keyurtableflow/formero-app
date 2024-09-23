/* eslint-disable */
import { FuseNavigationItem } from '@fuse/components/navigation';

export const defaultNavigation: FuseNavigationItem[] = [
    // {
    //     id   : 'example',
    //     title: 'Example',
    //     type : 'basic',
    //     icon : 'heroicons_outline:chart-pie',
    //     link : '/example'
    // },
    {
        id: 'master',
        title: 'Master',
        type: 'collapsable',
        // icon : 'heroicons_outline:bars-3-bottom-left',
        icon: 'heroicons_outline:square-3-stack-3d',
        children: [
            {
                id: 'process.list',
                title: 'sales order',
                type: 'basic',
                icon: 'heroicons_outline:clipboard-document-list',
                link: '/sales',
            },
            {
                id: 'process.list',
                title: 'Process',
                type: 'basic',
                icon: 'heroicons_outline:clipboard-document-list',
                link: '/process/list',
            },
            {
                id: 'printer.list',
                title: 'Printers',
                type: 'basic',
                icon: 'heroicons_outline:printer',
                link: '/printer/list',
            },
            {
                id: 'material.list',
                title: 'Material',
                type: 'basic',
                icon: 'heroicons_outline:inbox-stack',
                link: '/material/list',
            },
            {
                id: 'colour.list',
                title: 'Colour',
                type: 'basic',
                icon: 'heroicons_outline:swatch',
                link: '/colour/list',
            },
            {
                id: 'finishes.list',
                title: 'Finishes',
                type: 'basic',
                icon: 'heroicons_outline:paint-brush',
                link: '/finishes/list',
            },
            {
                id: 'company.list',
                title: 'Company',
                type: 'basic',
                icon: 'heroicons_outline:building-office-2',
                link: '/company/list',
            },
            {
                id: 'user.list',
                title: 'Users',
                type: 'basic',
                icon: 'heroicons_outline:user-group',
                link: '/users/list',
            },
            {
                id: 'measurement.list',
                title: 'Unit of measurement',
                type: 'basic',
                icon: 'mat_outline:open_in_full',
                link: '/measurement/list',
            },
            {
                id: 'part.list',
                title: 'Parts',
                type: 'basic',
                icon: 'heroicons_outline:cog',
                link: '/part/list',
            },
            {
                id: 'promotion.list',
                title: 'Promotions',
                type: 'basic',
                icon: 'heroicons_outline:ticket',
                link: '/promotion',
            },
            {
                id: 'extras.list',
                title: 'Extras',
                type: 'basic',
                icon: 'heroicons_outline:queue-list',
                link: '/extras',
            },
        ]
    },
    {
        id: 'Stockandinventorymanagement',
        title: 'Stock/inventory',
        type: 'collapsable',
        icon: 'mat_outline:assignment',
        children: [
            {
                id: 'products.list',
                title: 'Products',
                type: 'basic',
                icon: 'mat_outline:backup_table',
                link: '/products/list',
            },
            {
                id: 'stockableproducts.list',
                title: 'Stockable products',
                type: 'basic',
                icon: 'mat_outline:house_siding',
                link: '/stockable-products/list',
            },
            {
                id: 'currentstock.list',
                title: 'Current stock',
                type: 'basic',
                icon: 'mat_outline:vertical_split',
                link: '/current-stock/list',
            },
            {
                id: 'addstock',
                title: 'Add stock',
                type: 'basic',
                icon: 'mat_outline:add_shopping_cart',
                link: '/current-stock/add-current-stock',
            },
            {
                id: 'adjuststock',
                title: 'Adjust stock',
                type: 'basic',
                icon: 'heroicons_outline:adjustments-horizontal',
                link: '/current-stock/adjust-stock',
            },
            {
                id: 'stockturnoverreport',
                title: 'Stock turn over report',
                type: 'basic',
                icon: 'mat_outline:summarize',
                link: '/stock-turn-over-report/list',
            },

        ]
    },
    {
        id: 'PricingEngine',
        title: 'Pricing engine',
        type: 'collapsable',
        icon: 'mat_outline:price_change',
        children: [
            {
                id: 'pricingmodel.list',
                title: 'Pricing models',
                type: 'basic',
                icon: 'mat_outline:model_training',
                link: '/pricing-model/list',
            },
            {
                id: 'variable.list',
                title: 'Variables',
                type: 'basic',
                icon: 'mat_outline:earbuds',
                link: '/variable/list',
            },
            // {
            //     id: 'equation.list',
            //     title: 'Equation',
            //     type: 'basic',
            //     icon: 'mat_outline:auto_stories',
            //     link: '/equation/list',
            // },
        ]
    }
];
export const compactNavigation: FuseNavigationItem[] = [
    {
        id: 'example',
        title: 'Example',
        type: 'basic',
        icon: 'heroicons_outline:chart-pie',
        link: '/example'
    }
];
export const futuristicNavigation: FuseNavigationItem[] = [
    {
        id: 'example',
        title: 'Example',
        type: 'basic',
        icon: 'heroicons_outline:chart-pie',
        link: '/example'
    }
];
export const horizontalNavigation: FuseNavigationItem[] = [
    {
        id: 'example',
        title: 'Example',
        type: 'basic',
        icon: 'heroicons_outline:chart-pie',
        link: '/example'
    }
];
