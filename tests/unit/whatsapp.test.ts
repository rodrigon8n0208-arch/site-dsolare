import { describe, it, expect } from 'vitest';
import { buildLeadMessage, buildWhatsAppUrl } from '../../src/lead/whatsapp';

const d = { nome: 'Ana Lima', whatsapp: '(82) 98888-7777', cidade: 'Maceió', conta: 'R$ 600 a R$ 1.500' };

describe('mensagem do WhatsApp', () => {
  it('é idêntica à do site atual', () => {
    expect(buildLeadMessage(d)).toBe(
      'Olá! Vim pelo site da D’Solare e quero solicitar uma análise gratuita da minha conta de luz.\n\n' +
        '• Nome: Ana Lima\n• WhatsApp: (82) 98888-7777\n• Cidade: Maceió\n• Conta de luz: R$ 600 a R$ 1.500',
    );
  });

  it('URL usa o número da D’Solare por padrão', () => {
    expect(buildWhatsAppUrl(d)).toBe('https://wa.me/558299980160?text=' + encodeURIComponent(buildLeadMessage(d)));
  });

  it('remove espaços nas pontas dos campos', () => {
    expect(buildLeadMessage({ ...d, nome: '  Ana  ', cidade: ' Arapiraca ' })).toContain('• Nome: Ana\n');
    expect(buildLeadMessage({ ...d, cidade: ' Arapiraca ' })).toContain('• Cidade: Arapiraca\n');
  });
});
