<template>
    <Card class="domainCard" :style="tenantDetailTabDescriptor.card.style">
        <template #content>
            <DataTable
                :value="itemList"
                v-model:selection="selectedItems"
                class="p-datatable-sm kn-table"
                dataKey="ID"
                :paginator="true"
                :rows="20"
                responsiveLayout="stack"
                breakpoint="960px"
                @rowSelect="setDirty"
                @rowUnselect="setDirty"
                @rowSelectAll="setDirty"
                @rowUnselectAll="setDirty"
                data-test="data-table"
            >
                <template #empty>
                    {{ $t('common.info.noDataFound') }}
                </template>
                <Column selectionMode="multiple" :style="tenantDetailTabDescriptor.column.style" dataKey="ID"></Column>
                <Column field="LABEL" :header="$t('common.name')" :style="tenantDetailTabDescriptor.column.header.style"></Column>
                <Column v-if="showDesc" field="DESCRIPTION" :header="$t('common.description')" :style="tenantDetailTabDescriptor.column.header.style"></Column>
            </DataTable>
        </template>
    </Card>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { iDataItem } from './../../TenantManagement'
import Card from 'primevue/card'
import Column from 'primevue/column'
import DataTable from 'primevue/datatable'
import tenantDetailTabDescriptor from './TenantDetailListTabDescriptor.json'

export default defineComponent({
    name: 'data-item-list-tab',
    components: {
        Card,
        Column,
        DataTable
    },
    props: {
        itemList: Array,
        selected: Array,
        showDesc: Boolean
    },
    emits: ['changed'],
    data() {
        return {
            tenantDetailTabDescriptor,
            selectedItems: [] as iDataItem[]
        }
    },
    watch: {
        selected() {
            this.selectedItems = this.selected as iDataItem[]
        }
    },
    created() {
        this.selectedItems = this.selected as iDataItem[]
    },
    methods: {
        setDirty() {
            this.$emit('changed', this.selectedItems)
        }
    }
})
</script>
<style lang="scss" scoped>
.domainCard {
    &:deep(.p-card-body) {
        height: calc(100% - 35px);
        .p-card-content {
            height: 100%;
            padding-bottom: 0;
            .p-paginator-bottom {
                border: none;
            }
        }
    }
}
</style>
