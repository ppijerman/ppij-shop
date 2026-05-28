import type { PaymentMethod } from '@/types';

export interface PaymentInstruction {
  method: PaymentMethod;
  title: string;
  lines: string[];
  isConfigured: boolean;
}

export function getPaymentInstruction(method: PaymentMethod): PaymentInstruction {
  if (method === 'PAYPAL') {
    const email = process.env.NEXT_PUBLIC_PPIJ_PAYPAL_EMAIL?.trim();

    return {
      method,
      title: 'PayPal transfer',
      isConfigured: Boolean(email),
      lines: email
        ? [
            `Send the total to ${email}.`,
            'Use your order ID as the transfer note.',
            'Upload a screenshot or receipt after the transfer.',
          ]
        : ['Payment details are not configured yet. Please contact the PPIJ admin team.'],
    };
  }

  const iban = process.env.NEXT_PUBLIC_PPIJ_IBAN?.trim();
  const bankName = process.env.NEXT_PUBLIC_PPIJ_BANK_NAME?.trim();
  const accountName = process.env.NEXT_PUBLIC_PPIJ_BANK_ACCOUNT_NAME?.trim();
  const configuredLines = [
    accountName ? `Account name: ${accountName}` : null,
    bankName ? `Bank: ${bankName}` : null,
    iban ? `IBAN: ${iban}` : null,
    'Use your order ID as the transfer reference.',
    'Upload a screenshot or receipt after the transfer.',
  ].filter((line): line is string => Boolean(line));

  return {
    method,
    title: 'IBAN bank transfer',
    isConfigured: Boolean(iban),
    lines: iban
      ? configuredLines
      : ['Bank transfer details are not configured yet. Please contact the PPIJ admin team.'],
  };
}
