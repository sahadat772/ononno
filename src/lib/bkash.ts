import CryptoJS from 'crypto-js'
import axios from 'axios'

const BKASH_BASE_URL = process.env.BKASH_BASE_URL!
const BKASH_APP_KEY = process.env.BKASH_APP_KEY!
const BKASH_APP_SECRET = process.env.BKASH_APP_SECRET!
const BKASH_USERNAME = process.env.BKASH_USERNAME!
const BKASH_PASSWORD = process.env.BKASH_PASSWORD!

// bKash token cache
let tokenCache: {
    token: string
    expiresAt: number
} | null = null

// bKash token নাও
export async function getBkashToken(): Promise<string> {
    // Cache এ token আছে কিনা check করো
    if (tokenCache && tokenCache.expiresAt > Date.now()) {
        return tokenCache.token
    }

    const response = await axios.post(
        `${BKASH_BASE_URL}/token/grant`,
        {
            app_key: BKASH_APP_KEY,
            app_secret: BKASH_APP_SECRET,
        },
        {
            headers: {
                'Content-Type': 'application/json',
                username: BKASH_USERNAME,
                password: BKASH_PASSWORD,
            },
        }
    )

    const token = response.data.id_token

    // Token cache করো (55 minutes)
    tokenCache = {
        token,
        expiresAt: Date.now() + 55 * 60 * 1000,
    }

    return token
}

// bKash payment create করো
export async function createBkashPayment({
    amount,
    transactionId,
    planId,
}: {
    amount: number
    transactionId: string
    planId: string
}) {
    const token = await getBkashToken()

    const response = await axios.post(
        `${BKASH_BASE_URL}/payment/create`,
        {
            mode: '0011',
            payerReference: transactionId,
            callbackURL: `${process.env.NEXT_PUBLIC_APP_URL}/api/payment/bkash/callback`,
            amount: amount.toString(),
            currency: 'BDT',
            intent: 'sale',
            merchantInvoiceNumber: transactionId,
        },
        {
            headers: {
                'Content-Type': 'application/json',
                Authorization: token,
                'X-APP-Key': BKASH_APP_KEY,
            },
        }
    )

    return response.data
}

// bKash payment execute করো
export async function executeBkashPayment(paymentId: string) {
    const token = await getBkashToken()

    const response = await axios.post(
        `${BKASH_BASE_URL}/payment/execute`,
        { paymentID: paymentId },
        {
            headers: {
                'Content-Type': 'application/json',
                Authorization: token,
                'X-APP-Key': BKASH_APP_KEY,
            },
        }
    )

    return response.data
}

// bKash payment query করো (verify)
export async function queryBkashPayment(paymentId: string) {
    const token = await getBkashToken()

    const response = await axios.post(
        `${BKASH_BASE_URL}/payment/query`,
        { paymentID: paymentId },
        {
            headers: {
                'Content-Type': 'application/json',
                Authorization: token,
                'X-APP-Key': BKASH_APP_KEY,
            },
        }
    )

    return response.data
}