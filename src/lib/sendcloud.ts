const BASE_URL = 'https://api.sendcloud.sc/api/v2';

function authHeader(): string {
    const key = process.env.SENDCLOUD_API_KEY;
    const secret = process.env.SENDCLOUD_API_SECRET;
    if (!key || !secret) {
        throw new Error('SendCloud API key and secret must be set in environment variables');
    }
    return 'Basic ' + Buffer.from(`${key}:${secret}`).toString('base64')
}

async function sendcloudFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
    const res = await fetch(`${BASE_URL}${path}`, {
        ...options,
        headers: {
            'Authorization': authHeader(),
            'Content-Type': 'application/json',
            ...options.headers,
        },
    });
    if (!res.ok) {
        const text = await res.text();
        throw new Error(`SendCloud ${res.status}: ${text}`);
    }
    return res.json() as Promise<T>;
}

export interface SendCloudParcel {
    id: number;
    tracking_number: string;
    status: { id: number, message: string };
    carrier: { code: string };
    label?: { normal_printer?: string[] };
}

export interface SendCloudShippingMethod {
    id: number;
    name: string;
    carrier: string;
    min_weight: number;
    max_weight: number;
    price: number;
    countries: { iso_2: string }[];
}

export interface CreateParcelPayload {
    name: string;
    address: string;
    city: string;
    postal_code: string;
    country: string;
    weight: number;
    email?: string;
    shipment: { id: number };
    sender_address: number;
    order_number: string;
}

export async function getShippingMethods(toCountry: string, weight: number): Promise<SendCloudShippingMethod[]> {
    const params = new URLSearchParams({
        to_country: toCountry,
        shipping_function_id: '1',
    });
    const body = await sendcloudFetch<{ shipping_methods: SendCloudShippingMethod[] }>(
        `/shipping_methods?${params}`
    );
    return body.shipping_methods.filter(
        (m) => m.min_weight <= weight && m.max_weight >= weight
    );
}

export async function createParcel(payload: CreateParcelPayload): Promise<SendCloudParcel> {
    const body = await sendcloudFetch<{ parcel: SendCloudParcel }>('/parcels', {
        method: 'POST',
        body: JSON.stringify({ parcel: payload }),
    });
    return body.parcel;
}

export async function getParcel(parcelId: number): Promise<SendCloudParcel> {
    const body = await sendcloudFetch<{ parcel: SendCloudParcel }>(`/parcels/${parcelId}`);
    return body.parcel;
}