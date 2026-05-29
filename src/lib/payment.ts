import type { PaymentMethod } from '@/types';

const IBAN_PAYMENT_DETAILS = {
  accountName: 'Vereinigung Indonesischer Studenten (V.I.S.) e.V.',
  iban: 'DE85 1005 0000 0190 3325 06',
  bic: 'BELADEBEXXX',
  bankName: 'Berliner Sparkasse',
  purposeTemplate: 'Merch 26 - Nama Pemesan - Nomor Order',
  purposeExample: 'Merch 26 - Max Mustermann - 12345678',
};

export interface PaymentInstruction {
  method: PaymentMethod;
  title: string;
  intro: string;
  details: {
    label: string;
    value: string;
    strong?: boolean;
  }[];
  note: string;
  isConfigured: boolean;
}

export function getPaymentInstruction(
  _method: PaymentMethod = 'IBAN',
  orderReference = 'no order',
  buyerName = 'nama pemesan',
): PaymentInstruction {
  return {
    method: 'IBAN',
    title: 'IBAN bank transfer',
    intro: 'Rekening PPI Jerman',
    isConfigured: true,
    details: [
      { label: 'Nama', value: IBAN_PAYMENT_DETAILS.accountName },
      { label: 'IBAN', value: IBAN_PAYMENT_DETAILS.iban, strong: true },
      { label: 'BIC', value: IBAN_PAYMENT_DETAILS.bic },
      { label: 'Bank', value: IBAN_PAYMENT_DETAILS.bankName },
      {
        label: 'Verwendungszweck',
        value: orderReference === 'no order'
          ? IBAN_PAYMENT_DETAILS.purposeTemplate
          : `Merch 26 - ${buyerName} - ${orderReference}`,
        strong: true,
      },
      { label: 'Contoh', value: IBAN_PAYMENT_DETAILS.purposeExample },
    ],
    note: 'Upload a screenshot or receipt after the transfer.',
  };
}
