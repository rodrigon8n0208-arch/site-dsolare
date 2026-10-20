export type LeadData = { nome: string; whatsapp: string; cidade: string; conta: string };

export const WHATSAPP_NUMBER = '558299980160';

export function buildLeadMessage(d: LeadData): string {
  return (
    'Olá! Vim pelo site da D’Solare e quero solicitar uma análise gratuita da minha conta de luz.\n\n' +
    `• Nome: ${d.nome.trim()}\n` +
    `• WhatsApp: ${d.whatsapp.trim()}\n` +
    `• Cidade: ${d.cidade.trim()}\n` +
    `• Conta de luz: ${d.conta}`
  );
}

export function buildWhatsAppUrl(d: LeadData, phone = WHATSAPP_NUMBER): string {
  return `https://wa.me/${phone}?text=${encodeURIComponent(buildLeadMessage(d))}`;
}
