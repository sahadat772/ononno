declare module 'sslcommerz-lts' {
    class SSLCommerzPayment {
        constructor(store_id: string, store_passwd: string, is_live: boolean)
        init(data: Record<string, unknown>): Promise<{
            GatewayPageURL?: string
            status?: string
            [key: string]: unknown
        }>
        validate(data: { val_id: string }): Promise<{
            status?: string
            val_id?: string
            [key: string]: unknown
        }>
    }
    export default SSLCommerzPayment
}