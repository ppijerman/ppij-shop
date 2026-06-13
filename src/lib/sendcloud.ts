const V3_URL = 'https://panel.sendcloud.sc/api/v3';

function authHeader(): string {
    const key = process.env.SENDCLOUD_API_KEY;
    const secret = process.env.SENDCLOUD_API_SECRET;
    if (!key || !secret) {
        throw new Error('SendCloud API key and secret must be set in environment variables');
    }
    return 'Basic ' + Buffer.from(`${key}:${secret}`).toString('base64');
}

async function sendcloudFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
    const res = await fetch(`${V3_URL}${path}`, {
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
    status: { code: string; message: string };
    documents: { type: string; size: string; link: string }[];
}

export interface SendCloudShippingMethod {
    id: string;
    name: string;
    carrier: string;
    min_weight: number;
    max_weight: number;
    price: number;
    lead_time_hours: number | null;
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
    shipment: { id: string };
    sender_address: number;
    order_number: string;
}

interface V3ShippingOption {
    code: string;
    name: string;
    carrier: { code: string; name: string };
    weight: { min: { value: number; unit: string }; max: { value: number; unit: string } };
    quotes: { price: { total: { value: string; currency: string } }; lead_time: number | null }[] | null;
}

function toWeightKg(value: number, unit: string): number {
    if (unit === 'gram' || unit === 'g') return value / 1000;
    return value; // assume kg
}

export async function getShippingMethods(toCountry: string, weight: number): Promise<SendCloudShippingMethod[]> {
    const weightKg = weight / 1000;
    const body = await sendcloudFetch<{ data: V3ShippingOption[] }>('/shipping-options', {
        method: 'POST',
        body: JSON.stringify({
            from_address: { country_code: 'DE' },
            to_address: { country_code: toCountry },
            parcels: [{ weight: { value: weightKg, unit: 'kg' } }],
            calculate_quotes: true,
        }),
    });

    const testMode = process.env.SENDCLOUD_TEST_MODE === 'true';
    const INCLUDE = testMode
        ? /^(DHL Paket|DPD Classic KP|Unstamped letter)$/i
        : /^(DHL Paket|DPD Classic KP)$/i;

    return body.data
        .filter((m) => {
            if (!INCLUDE.test(m.name)) return false;
            if (m.quotes?.[0]?.price.total.value == null) return false;
            const minKg = toWeightKg(m.weight.min.value, m.weight.min.unit);
            const maxKg = toWeightKg(m.weight.max.value, m.weight.max.unit);
            return minKg <= weightKg && maxKg >= weightKg;
        })
        .map((m) => ({
            id: m.code,
            name: m.name,
            carrier: m.carrier.name,
            min_weight: toWeightKg(m.weight.min.value, m.weight.min.unit),
            max_weight: toWeightKg(m.weight.max.value, m.weight.max.unit),
            price: Number(m.quotes?.[0]?.price.total.value ?? 0),
            lead_time_hours: m.quotes?.[0]?.lead_time ?? null,
            countries: [],
        }));
}

export async function createParcel(payload: CreateParcelPayload): Promise<SendCloudParcel> {
    const body = await sendcloudFetch<{ data: { parcels: SendCloudParcel[] } }>('/shipments/announce', {
        method: 'POST',
        body: JSON.stringify({
            from_address: {
                sender_address_id: payload.sender_address,
            },
            to_address: {
                name: payload.name,
                address_line_1: payload.address,
                city: payload.city,
                postal_code: payload.postal_code,
                country_code: payload.country,
                email: payload.email,
            },
            ship_with: {
                type: 'shipping_option_code',
                properties: { shipping_option_code: payload.shipment.id },
            },
            parcels: [{
                weight: { value: payload.weight, unit: 'kg' },
            }],
            order_number: payload.order_number,
        }),
    });
    if (!body.data.parcels?.length) throw new Error('SendCloud returned empty parcels array');
    return body.data.parcels[0];
}

export async function getParcel(parcelId: number): Promise<SendCloudParcel> {
    const body = await sendcloudFetch<{ data: SendCloudParcel }>(`/parcels/${parcelId}`);
    return body.data;
}
