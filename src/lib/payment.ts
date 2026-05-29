import type { PaymentMethod } from '@/types';

const IBAN_PAYMENT_DETAILS = {
  accountName: 'Vereinigung Indonesischer Studenten (V.I.S.) e.V.',
  iban: 'DE85 1005 0000 0190 3325 06',
  bic: 'BELADEBEXXX',
  bankName: 'Berliner Sparkasse',
  purposeTemplate: 'Merch 26 - {nama lengkap pemesan}',
  purposeExample: 'Merch 26 - Max Mustermann',
};

export interface PaymentInstruction {
  method: PaymentMethod;
  title: string;
  lines: string[];
  isConfigured: boolean;
}

export function getPaymentInstruction(_method: PaymentMethod = 'IBAN'): PaymentInstruction {
  return {
    method: 'IBAN',
    title: 'IBAN bank transfer',
    isConfigured: true,
    lines: [
      'Rekening PPI Jerman',
      `Nama: ${IBAN_PAYMENT_DETAILS.accountName}`,
      `IBAN: ${IBAN_PAYMENT_DETAILS.iban}`,
      `BIC: ${IBAN_PAYMENT_DETAILS.bic}`,
      `Bank: ${IBAN_PAYMENT_DETAILS.bankName}`,
      `Verwendungszweck: ${IBAN_PAYMENT_DETAILS.purposeTemplate}`,
      `Contoh: ${IBAN_PAYMENT_DETAILS.purposeExample}`,
      'Upload a screenshot or receipt after the transfer.',
    ],
  };
}
