<template>
    <KnHint :title="'managers.tenantManagement.title'" :hint="'managers.tenantManagement.hint'"></KnHint>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import KnHint from '@/components/UI/KnHint.vue'

export default defineComponent({
    name: 'tenant-management-hint',
    components: { KnHint }
})
</script>
