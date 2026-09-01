export const PICKUP_LOCATIONS = [
    { value: 'MUNICH', label: 'MUNICH, U3 Olympiazentrum' },
    { value: 'HAMBURG', label: 'Hamburg (only on 12.09.2026)' },
    { value: 'BERLIN', label: 'Berlin (only on 20.09.2026)' },
    { value: 'KIEL', label: 'Kiel (only on 26.09.2026' }
] as const;

export type PickupLocation = (typeof PICKUP_LOCATIONS)[number]['value'];

export function labelForPickupLocation(value: string | null): string {
    if (!value) return '-';
    return PICKUP_LOCATIONS.find((loc) => loc.value === value)?.label ?? value;
}