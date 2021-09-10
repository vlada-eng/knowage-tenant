export interface iTenant {
    MULTITENANT_ID?: string
    MULTITENANT_NAME: string
    MULTITENANT_THEME?: string
    DS_LIST: Array
    PRODUCT_TYPE_LIST: Array
}

export interface iProductType {
    ID: number
    LABEL: string
    CHECKED: boolean
}

export interface iDataSource {
    ID: number
    LABEL: string
    DESCRIPTION?: string
    CHECKED: boolean
}

export interface iTheme {
    VALUE_CHECK: string
}

export interface iDataItem {
    ID: number
    LABEL: string
    DESCRIPTION?: string
    CHECKED: boolean
}
