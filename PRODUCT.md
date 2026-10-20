# Product
<!-- impeccable:product-schema 1 -->

## Platform
web

## Stack
Vite + TypeScript vanilla, Tailwind CSS v4, GSAP (ScrollTrigger, SplitText, DrawSVG), Three.js, Lenis. Página estática. Escolhido pelo usuário em 2026-10-20 ("refazer do zero", recomendação aceita). Hospedagem: em aberto.

## Users
Donos de casa e gestores de empresas em Maceió e Alagoas que acham a conta de luz alta. Muitos chegam por anúncios do Meta (Instagram/Facebook) no celular. A tarefa deles: entender se energia solar compensa no caso deles e pedir uma análise, sem cair em promessa vazia.

## Product Purpose
D'Solare Energia e Inovação: consultoria, projeto, instalação com equipe própria e pós-venda de energia solar (residencial, corporativo e acompanhamento de sistemas já instalados). O site existe para gerar pedidos de análise gratuita: o visitante manda os dados e a conversa continua no WhatsApp. Sucesso = leads qualificados (nome, WhatsApp, cidade, faixa de conta).

## Positioning
"A gente mostra o cálculo." Cada sistema é dimensionado com os dados reais do telhado, do consumo e da tarifa do cliente, nunca com média de mercado. A empresa se posiciona contra três práticas do setor: preço que não sustenta entrega, sistema que não foi calculado para o cliente e número sem cálculo.

## Operating Context
- O visitante tem a conta de luz da distribuidora (Equatorial Alagoas) na mão. Ela é o documento que dispara a análise.
- Método: 01 Diagnóstico, 02 Projeto (assinatura de engenheiro), 03 Instalação (equipe própria), 04 Acompanhamento.
- A conversão acontece no WhatsApp `558299980160`. O formulário monta a mensagem.

## Capabilities and Constraints
- Formulário: nome, WhatsApp, cidade, faixa de conta (até R$ 300 / R$ 300–600 / R$ 600–1.500 / R$ 1.500–5.000 / acima de R$ 5.000), aceite LGPD e honeypot `empresa_site`.
- Captura opcional de lead via Google Apps Script (`VITE_LEAD_ENDPOINT`; vazio = desligado).
- Meta Pixel `407551268600245` só com consentimento (`localStorage['dsolare_consent']`); eventos PageView, Contact e Lead.
- Política de privacidade em `/privacidade.html`, vigente desde 21/07/2026.

## Brand Commitments
- Logo D'Solare (versões navy e branca) e as cores azul `#00428C` / `#00315F` e laranja `#F4901E` ficam (decisão do usuário, 2026-10-20).
- Voz: direta, em primeira pessoa do plural coloquial ("a gente"), honesta, sem hype. Assinatura: "Energia que transforma." / "Energia solar feita do jeito certo."
- Citação do sócio Diego Uchoa: "A gente não vende preço. A gente vende valor."

## Evidence on Hand
- Fatos: +5.000 projetos, 10 anos, +120 profissionais, fundada em 2016 por Diego Uchoa e Diego Braga, equipe própria. Endereço: Av. Dr. Júlio Marques Luz, 978, Jatiúca, Maceió/AL, CEP 57051-160. CNPJ 25.003.808/0001-53.
- Fotos reais: `public/img/usina-aerea.jpg`, `case-residencial.jpg`, `case-corporativo.jpg`, `case-industrial.jpg`.
- **Ausentes (não inventar):** depoimentos, números de economia de clientes, kWp/payback de casos reais, fotos dos sócios e da equipe, logo em SVG. Qualquer número de demonstração é rotulado "Exemplo ilustrativo".

## Product Principles
1. Mostrar antes de prometer: todo número exibido é real ou rotulado como ilustrativo.
2. O visitante sempre sabe o próximo passo: mandar a conta de luz.
3. Celular primeiro: o anúncio leva ao celular, e ali a página tem que ser rápida e legível.
4. Presença humana: equipe própria, sócios presentes, atendimento sem robô.

## Accessibility & Inclusion
WCAG 2.2 AA. Respeitar `prefers-reduced-motion`. Conteúdo legível sem JavaScript e sem WebGL. Público amplo, inclusive mais velho: corpo de texto ≥ 16 px e alto contraste.
