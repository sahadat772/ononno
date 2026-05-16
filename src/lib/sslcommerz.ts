import axios from 'axios'

const store_id = process.env.SSLCOMMERZ_STORE_ID!
const store_passwd = process.env.SSLCOMMERZ_STORE_PASSWORD!
const is_live = process.env.SSLCOMMERZ_IS_LIVE === 'true'

const BASE_URL = is_live
    ? 'https://securepay.sslcommerz.com'
    : 'https://sandbox.sslcommerz.com'

export const plans = {
    monthly: {
        id: 'monthly',
        name: 'মাসিক',
        price: 299,
        duration_days: 30,
    },
    yearly: {
        id: 'yearly',
        name: 'বার্ষিক',
        price: 2499,
        duration_days: 365,
    },
    family: {
        id: 'family',
        name: 'পারিবারিক',
        price: 3999,
        duration_days: 365,
    },
}

export type PlanId = keyof typeof plans

export async function initSSLCommerz({
    userId,
    userEmail,
    userName,
    planId,
    transactionId,
}: {
    userId: string
    userEmail: string
    userName: string
    planId: PlanId
    transactionId: string
}) {
    const plan = plans[planId]

    const params = new URLSearchParams()
    params.append('store_id', store_id)
    params.append('store_passwd', store_passwd)
    params.append('total_amount', plan.price.toString())
    params.append('currency', 'BDT')
    params.append('tran_id', transactionId)
    params.append('success_url', `${process.env.NEXT_PUBLIC_APP_URL}/api/payment/sslcommerz/success`)
    params.append('fail_url', `${process.env.NEXT_PUBLIC_APP_URL}/api/payment/sslcommerz/fail`)
    params.append('cancel_url', `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/student/subscription`)
    params.append('ipn_url', `${process.env.NEXT_PUBLIC_APP_URL}/api/payment/sslcommerz/ipn`)
    params.append('shipping_method', 'No')
    params.append('product_name', plan.name)
    params.append('product_category', 'Education')
    params.append('product_profile', 'non-physical-goods')
    params.append('cus_name', userName)
    params.append('cus_email', userEmail)
    params.append('cus_add1', 'Bangladesh')
    params.append('cus_city', 'Dhaka')
    params.append('cus_country', 'Bangladesh')
    params.append('cus_phone', '01700000000')
    params.append('ship_name', userName)
    params.append('ship_add1', 'Bangladesh')
    params.append('ship_city', 'Dhaka')
    params.append('ship_country', 'Bangladesh')
    params.append('value_a', userId)
    params.append('value_b', planId)

    const response = await axios.post(
        `${BASE_URL}/gwprocess/v4/api.php`,
        params.toString(),
        {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        }
    )

    return response.data
}

export async function validateSSLCommerz(valId: string) {
    const response = await axios.get(
        `${BASE_URL}/validator/api/validationserverAPI.php`,
        {
            params: {
                val_id: valId,
                store_id,
                store_passwd,
                format: 'json',
            },
        }
    )

    return response.data
}