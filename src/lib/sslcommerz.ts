import SSLCommerzPayment from 'sslcommerz-lts'

const store_id = process.env.SSLCOMMERZ_STORE_ID!
const store_passwd = process.env.SSLCOMMERZ_STORE_PASSWORD!
const is_live = process.env.SSLCOMMERZ_IS_LIVE === 'true'

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

    const data = {
        total_amount: plan.price,
        currency: 'BDT',
        tran_id: transactionId,
        success_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/payment/sslcommerz/success`,
        fail_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/payment/sslcommerz/fail`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/student/subscription`,
        ipn_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/payment/sslcommerz/ipn`,
        shipping_method: 'No',
        product_name: plan.name,
        product_category: 'Education',
        product_profile: 'non-physical-goods',
        cus_name: userName,
        cus_email: userEmail,
        cus_add1: 'Bangladesh',
        cus_city: 'Dhaka',
        cus_country: 'Bangladesh',
        cus_phone: '01700000000',
        ship_name: userName,
        ship_add1: 'Bangladesh',
        ship_city: 'Dhaka',
        ship_country: 'Bangladesh',
        value_a: userId,
        value_b: planId,
    }

    const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live)
    const response = await sslcz.init(data)
    return response
}

export async function validateSSLCommerz(valId: string) {
    const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live)
    const response = await sslcz.validate({ val_id: valId })
    return response
}