<template>
    <Toolbar class="kn-toolbar kn-toolbar--secondary p-m-0">
        <template #left>{{ selectedTenant.MULTITENANT_NAME }} </template>
        <template #right>
            <Button icon="pi pi-save" class="p-button-text p-button-rounded p-button-plain" @click="handleSubmit" :disabled="buttonSaveDisabled" />
            <Button icon="pi pi-times" class="p-button-text p-button-rounded p-button-plain" @click="closeTemplate" />
        </template>
    </Toolbar>
    <ProgressBar mode="indeterminate" class="kn-progress-bar" v-if="loading" />
    <TabView class="tabview-custom kn-tab" data-test="tab-view">
        <TabPanel>
            <template #header>
                <span>{{ $t('managers.tenantManagement.detail.title') }}</span>
            </template>
            <TenantDetailTab :selectedTenant="selectedTenant" @fieldChanged="onFieldChange" />
        </TabPanel>

        <TabPanel>
            <template #header>
                <span>{{ $t('managers.tenantManagement.productTypes.title') }}</span>
            </template>
            <TenantDetailListTab :itemList="productTypeList" :selected="selectedProductTypes" @changed="setSelectedProducts($event)" :showDesc="false"></TenantDetailListTab>
        </TabPanel>

        <TabPanel>
            <template #header>
                <span>{{ $t('managers.tenantManagement.dataSource.title') }}</span>
            </template>
            <TenantDetailListTab :itemList="dataSourceList" :selected="selectedDataSources" @changed="setSelectedDataSources($event)" :showDesc="true"></TenantDetailListTab>
        </TabPanel>
    </TabView>
</template>
<script lang="ts">
import { defineComponent } from 'vue'

import TabView from 'primevue/tabview'
import TabPanel from 'primevue/tabpanel'
import useValidate from '@vuelidate/core'
import axios from 'axios'
import tenantManagementTabViewDescriptor from './TenantManagementTabViewDescriptor.json'
import { iTheme } from './TenantManagement'
import { iTenant } from './TenantManagement'
import { iDataItem } from './TenantManagement'
import TenantDetailTab from './tabs/TenantDetailTab/TenantDetailTab.vue'
import TenantDetailListTab from './tabs/TenantDetailListTab/TenantDetailListTab.vue'

export default defineComponent({
    components: {
        TabView,
        TabPanel,
        TenantDetailTab,
        TenantDetailListTab
    },
    data() {
        return {
            loading: false,
            v$: useValidate() as any,
            tenantManagementTabViewDescriptor: tenantManagementTabViewDescriptor,
            operation: 'insert',
            selectedTenant: {} as iTenant,
            themeList: [] as iTheme[],
            tenantList: [] as iTenant[],
            dataSourceList: [] as any,
            productTypeList: [] as any,
            selectedDataSources: [] as any,
            selectedProductTypes: [] as any
        }
    },
    props: {
        id: {
            type: String,
            required: false
        },
        licenseList: Array
    },
    async created() {
        await this.loadData()
    },
    computed: {
        buttonSaveDisabled(): any {
            if (this.v$.$invalid || (this.selectedProductTypes && this.selectedProductTypes.length === 0) || (this.selectedDataSources && this.selectedDataSources.length === 0)) return true
            else return false
        }
    },
    watch: {
        id() {
            this.loadData()
        }
    },
    methods: {
        closeTemplate() {
            this.$router.push('/tenant-management')
            this.$emit('closed')
        },
        onFieldChange(event) {
            this.selectedTenant[event.fieldName] = event.value
            this.$emit('touched')
        },
        async loadSelectedTenant() {
            if (this.id) {
                this.loading = true
                axios
                    .get(process.env.VUE_APP_RESTFUL_SERVICES_PATH + `multitenant`)
                    .then((response) => {
                        this.tenantList = response.data.root
                        this.selectedTenant = this.tenantList.find((t) => t.MULTITENANT_ID == this.id)!

                        for (var i = 0; i < this.tenantList.length; i++) {
                            this.tenantList[i].MULTITENANT_THEME = this.tenantList[i].MULTITENANT_THEME === undefined ? '' : this.tenantList[i].MULTITENANT_THEME
                        }
                    })
                    .finally(() => (this.loading = false))
            } else {
                this.selectedTenant = {
                    MULTITENANT_NAME: '',
                    MULTITENANT_THEME: '',
                    DS_LIST: [],
                    PRODUCT_TYPE_LIST: []
                }
                await this.clearLists()
            }
        },
        async loadSelectedTenantData() {
            var currentTenant = this.tenantList.find((item) => item.MULTITENANT_ID == this.id)
            if (this.id && currentTenant) {
                this.loading = true

                await axios.get(process.env.VUE_APP_RESTFUL_SERVICES_PATH + `multitenant/producttypes?TENANT=${currentTenant.MULTITENANT_NAME}`).then((response) => {
                    var productTypes = response.data.root
                    this.selectedProductTypes = []
                    this.copyCheckedElementArray(productTypes, this.selectedProductTypes)
                })

                await axios.get(process.env.VUE_APP_RESTFUL_SERVICES_PATH + `multitenant/datasources?TENANT=${currentTenant.MULTITENANT_NAME}`).then((response) => {
                    var dataSources = response.data.root
                    this.selectedDataSources = []
                    this.copyCheckedElementArray(dataSources, this.selectedDataSources)
                })
            }
            this.loading = false
        },
        async handleSubmit() {
            if (this.v$.$invalid) return
            if (this.selectedTenant.MULTITENANT_ID) {
                this.operation = 'update'
                this.selectedTenant.MULTITENANT_ID = this.selectedTenant.MULTITENANT_ID?.toString()
            }

            this.selectedTenant.PRODUCT_TYPE_LIST = []
            this.selectedProductTypes.map((item: any) => {
                this.selectedTenant.PRODUCT_TYPE_LIST.push({
                    ID: item.ID,
                    LABEL: item.LABEL
                })
            })
            this.selectedTenant.DS_LIST = []
            this.selectedDataSources.map((item: any) => {
                this.selectedTenant.DS_LIST.push({
                    ID: item.ID,
                    LABEL: item.LABEL,
                    DESCRIPTION: item.DESCRIPTION
                })
            })

            await axios.post(process.env.VUE_APP_RESTFUL_SERVICES_PATH + 'multitenant/save', this.selectedTenant).then(() => {
                this.$store.commit('setInfo', {
                    title: this.$t(this.tenantManagementTabViewDescriptor.operation[this.operation].toastTitle),
                    msg: this.$t(this.tenantManagementTabViewDescriptor.operation.success)
                })
                this.$emit('saved')
                this.$router.replace('/tenant-management')
            })
        },
        async loadDataCollection() {
            this.loading = true
            await this.loadThemes()
            await this.loadDataSources()
            await this.loadProductTypes()
            this.loading = false
        },
        async loadThemes() {
            await axios.get(process.env.VUE_APP_RESTFUL_SERVICES_PATH + `multitenant/themes`).then((response) => {
                this.themeList = response.data.root
            })
        },
        async loadProductTypes() {
            await axios.get(process.env.VUE_APP_RESTFUL_SERVICES_PATH + `multitenant/producttypes`).then((response) => {
                response.data.root.map((item: any) => {
                    this.productTypeList.push({
                        ID: item.ID,
                        LABEL: item.LABEL,
                        CHECKED: item.CHECKED
                    } as iDataItem)
                })
                this.filterArrayByTargetArr(this.productTypeList, this.licenseList)
            })
        },
        async loadDataSources() {
            await axios.get(process.env.VUE_APP_RESTFUL_SERVICES_PATH + `multitenant/datasources`).then((response) => {
                response.data.root.map((item: any) => {
                    this.dataSourceList.push({
                        ID: item.ID,
                        LABEL: item.LABEL,
                        DESCRIPTION: item.DESCRIPTION,
                        CHECKED: item.CHECKED
                    } as iDataItem)
                })
            })
        },
        selectedDetailListChanged(dataItems: iDataItem[]) {
            this.selectedDataSources = dataItems
            this.$emit('touched')
        },

        copyCheckedElementArray(sourceArr, targetArr) {
            for (var i = 0; i < sourceArr.length; i++) {
                if (sourceArr[i].CHECKED == true) {
                    targetArr.push(sourceArr[i])
                }
            }
        },
        setSelectedProducts(dataItems: any[]) {
            this.selectedProductTypes = dataItems
            this.$emit('touched')
        },

        setSelectedDataSources(dataItems: any[]) {
            this.selectedDataSources = dataItems
            this.$emit('touched')
        },
        filterArrayByTargetArr(sourceArr, targetArr) {
            return sourceArr.filter((src) => targetArr.find((targ) => src.LABEL == targ.product))
        },
        async clearLists() {
            this.themeList = []
            this.productTypeList = []
            this.dataSourceList = []
            this.selectedProductTypes = []
            this.selectedDataSources = []
        },
        async loadData() {
            await this.clearLists()
            await this.loadSelectedTenant()
            await this.loadDataCollection()
            await this.loadSelectedTenantData()
        }
    },
    emits: ['touched', 'closed', 'saved']
})
</script>
