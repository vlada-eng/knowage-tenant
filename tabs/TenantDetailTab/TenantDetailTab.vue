<template>
    <Card>
        <template #content>
            <form class="p-fluid p-m-5">
                <div class="p-field">
                    <span class="p-float-label">
                        <InputText
                            id="name"
                            class="kn-material-input"
                            type="text"
                            :disabled="nameEditDisabled"
                            v-model.trim="v$.tenant.MULTITENANT_NAME.$model"
                            :class="{
                                'p-invalid': v$.tenant.MULTITENANT_NAME.$invalid && v$.tenant.MULTITENANT_NAME.$dirty
                            }"
                            maxLength="20"
                            @blur="v$.tenant.MULTITENANT_NAME.$touch()"
                            @input="onFieldChange('MULTITENANT_NAME', $event.target.value)"
                            data-test="name-input"
                        />
                        <label for="name" class="kn-material-input-label"> {{ $t('common.name') }} * </label>
                    </span>
                    <KnValidationMessages
                        :vComp="v$.tenant.MULTITENANT_NAME"
                        :additionalTranslateParams="{
                            fieldName: $t('managers.tenantManagement.detail.name')
                        }"
                    />
                </div>

                <div class="p-field">
                    <span class="p-float-label">
                        <Dropdown
                            id="theme"
                            class="kn-material-input"
                            :options="themeList"
                            optionLabel="VALUE_CHECK"
                            optionValue="VALUE_CHECK"
                            v-model="v$.tenant.MULTITENANT_THEME.$model"
                            :class="{
                                'p-invalid': v$.tenant.MULTITENANT_THEME.$invalid && v$.tenant.MULTITENANT_THEME.$dirty
                            }"
                            @before-show="v$.tenant.MULTITENANT_THEME.$touch()"
                            @change="onFieldChange('MULTITENANT_THEME', $event.value)"
                        >
                        </Dropdown>
                        <label for="theme" class="kn-material-input-label"> {{ $t('managers.tenantManagement.detail.theme') }} * </label>
                    </span>
                    <KnValidationMessages
                        :vComp="v$.tenant.MULTITENANT_THEME"
                        :additionalTranslateParams="{
                            fieldName: $t('managers.tenantManagement.detail.theme')
                        }"
                    />
                </div>
            </form>
        </template>
    </Card>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { createValidations } from '@/helpers/commons/validationHelper'
import axios from 'axios'
import Card from 'primevue/card'
import Dropdown from 'primevue/dropdown'
import useValidate from '@vuelidate/core'
import KnValidationMessages from '@/components/UI/KnValidatonMessages.vue'
import tenantDetailValidationDescriptor from './TenantDetailTabValidationDescriptor.json'

export default defineComponent({
    name: 'detail-tab',
    components: {
        Card,
        Dropdown,
        KnValidationMessages
    },
    props: {
        selectedTenant: {
            type: Object,
            requried: false
        }
    },
    emits: ['fieldChanged'],
    data() {
        return {
            tenantDetailValidationDescriptor,
            v$: useValidate() as any,
            themeList: [] as any,
            tenant: {} as any
        }
    },
    validations() {
        return {
            tenant: createValidations('tenant', tenantDetailValidationDescriptor.validations.tenant)
        }
    },
    async created() {
        if (this.selectedTenant) {
            this.tenant = { ...this.selectedTenant } as any
        }
        await this.loadThemes()
    },
    computed: {
        nameEditDisabled() {
            if (this.tenant.MULTITENANT_ID) return true
            else return false
        }
    },
    methods: {
        async loadThemes() {
            axios.get(process.env.VUE_APP_RESTFUL_SERVICES_PATH + `multitenant/themes`).then((response) => {
                this.themeList = response.data.root
            })
        },
        onFieldChange(fieldName: string, value: any) {
            this.$emit('fieldChanged', { fieldName, value })
        }
    },
    watch: {
        selectedTenant() {
            this.v$.$reset()
            this.tenant = { ...this.selectedTenant } as any
        }
    }
})
</script>
