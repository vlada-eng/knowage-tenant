let routes = [
    {
        path: '/tenant-management',
        name: 'tenant-management',
        component: () => import('@/modules/managers/tenantManagement/TenantManagement.vue'),
        children: [
            {
                path: '',
                component: () => import('@/modules/managers/tenantManagement/TenantManagementHint.vue')
            },
            {
                path: ':id',
                name: 'edit-tenant',
                component: () => import('@/modules/managers/tenantManagement/TenantManagementTabView.vue'),
                props: true
            },
            {
                path: 'new-tenant',
                name: 'new-tenant',
                component: () => import('@/modules/managers/tenantManagement/TenantManagementTabView.vue')
            }
        ]
    }
]

export default routes
