<template>
    <div class="kn-page">
        <div class="kn-page-content p-grid p-m-0">
            <div class="kn-list--column p-col-4 p-sm-4 p-md-3 p-p-0">
                <Toolbar class="kn-toolbar kn-toolbar--primary">
                    <h3>tx</h3>
                    <template #left>
                        {{ $t('managers.tenantManagement.title') }}
                    </template>
                    <template #right>
                        <FabButton icon="fas fa-plus" @click="showForm" data-test="open-form-button" />
                    </template>
                </Toolbar>
                <ProgressBar mode="indeterminate" class="kn-progress-bar" v-if="loading" data-test="progress-bar" />
                <Listbox
                    v-if="!loading"
                    class="kn-list--column"
                    :options="tenants"
                    :filter="true"
                    :filterPlaceholder="$t('common.search')"
                    optionLabel="name"
                    filterMatchMode="contains"
                    :filterFields="tenantDecriptor.filterFields"
                    :emptyFilterMessage="$t('managers.tenantManagement.noResults')"
                    @change="showForm"
                    data-test="tenant-list"
                >
                    <template #empty>{{ $t('common.info.noDataFound') }}</template>
                    <template #option="slotProps">
                        <div class="kn-list-item" data-test="list-item">
                            <div class="kn-list-item-text">
                                <span>{{ slotProps.option.MULTITENANT_NAME }}</span>
                                <span class="kn-list-item-text-secondary">{{ slotProps.option.MULTITENANT_THEME }}</span>
                            </div>
                            <Button icon="far fa-trash-alt" class="p-button-text p-button-rounded p-button-plain" @click.stop="deleteConfirm(slotProps.option)" data-test="delete-button" />
                        </div>
                    </template>
                </Listbox>
            </div>

            <div class="p-col-8 p-sm-8 p-md-9 p-p-0 p-m-0 kn-router-view">
                <router-view @touched="touched = true" @inserted="pageReload" :licenseList="licenseList" @saved="pageReload" @closed="onFormClose" />
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { iTenant } from './TenantManagement'
import tenantDecriptor from './TenantManagementDescriptor.json'
import axios from 'axios'
import FabButton from '@/components/UI/KnFabButton.vue'
import Listbox from 'primevue/listbox'

export default defineComponent({
    name: 'user-management',
    components: {
        FabButton,
        Listbox
    },
    data() {
        return {
            tenants: [] as iTenant[],
            loading: false,
            touched: false,
            dirty: false,
            tenantDecriptor: tenantDecriptor,
            licenseList: [] as any
        }
    },
    async created() {
        await this.loadAllTenants()
        await this.loadLicenseData()
    },
    methods: {
        async loadAllTenants() {
            this.loading = true
            axios
                .get(process.env.VUE_APP_RESTFUL_SERVICES_PATH + `multitenant`)
                .then((response) => {
                    this.tenants = response.data.root
                })
                .finally(() => (this.loading = false))
        },
        showForm(event: any) {
            const path = event.value ? `/tenant-management/${event.value.MULTITENANT_ID}` : '/tenant-management/new-tenant'
            if (!this.touched) {
                this.$router.push(path)
            } else {
                this.$confirm.require({
                    message: this.$t('common.toast.unsavedChangesMessage'),
                    header: this.$t('common.toast.unsavedChangesHeader'),
                    icon: 'pi pi-exclamation-triangle',
                    accept: () => {
                        this.touched = false
                        this.$router.push(path)
                    }
                })
            }
        },
        deleteConfirm(selectedObject: Object) {
            this.$confirm.require({
                message: this.$t('common.toast.deleteMessage'),
                header: this.$t('common.toast.deleteTitle'),
                icon: 'pi pi-exclamation-triangle',
                accept: () => this.delete(selectedObject)
            })
        },
        async delete(selectedObject: Object) {
            var tenantToDelete = selectedObject as iTenant
            var toDelete = { MULTITENANT_ID: tenantToDelete.MULTITENANT_ID, MULTITENANT_NAME: tenantToDelete.MULTITENANT_NAME, MULTITENANT_THEME: tenantToDelete.MULTITENANT_THEME }

            //console.log('delete')
            //console.log(process.env.VUE_APP_RESTFUL_SERVICES_PATH + 'multitenant', { data: toDelete })

            await axios
                .delete(process.env.VUE_APP_RESTFUL_SERVICES_PATH + 'multitenant', { data: toDelete })
                .then(() => {
                    this.$store.commit('setInfo', { title: 'common.toast.deleteTitle', msg: 'common.toast.deleteSuccess' })
                    this.$router.push('/tenant-management')
                    this.loadAllTenants()
                })
                .catch((error) => {
                    if (error) {
                        console.log('delete err ', error)
                        this.$store.commit('setError', {
                            title: this.$t('common.toast.deleteTitle'),
                            msg: this.$t('common.error.deleting')
                        })
                    }
                })
        },
        pageReload() {
            this.touched = false
            this.loadAllTenants()
        },
        onFormClose() {
            this.touched = false
        },
        async loadLicenseData() {
            return axios
                .get(process.env.VUE_APP_RESTFUL_SERVICES_PATH + `1.0/license`)
                .then((response) => {
                    var host = response.data.hosts[0].hostName
                    var licenses = response.data.licenses[host]
                    this.licenseList = licenses
                })
                .finally(() => (this.loading = false))
        }
    }
})
</script>

<style lang="scss" scoped>
.kn-list-column {
    border-right: 1px solid #ccc;
}
</style>
