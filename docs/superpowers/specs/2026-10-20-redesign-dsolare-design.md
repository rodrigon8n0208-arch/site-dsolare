# Redesign dsolare.com.br — Direção e Design

**Data:** 2026-10-20 · **Site atual:** https://dsolare.com.br/ · **Modo Impeccable:** Persuade (landing de captação; o visitante decide e manda a conta de luz)

## 1. O que é verdade e não muda

- **Conteúdo e voz:** todo o texto atual permanece (hero, números, serviços, método 01–04, projetos, quem somos, manifesto "contra três práticas", FAQ, citação do Diego Uchoa, contato, rodapé). Reescrita só com aprovação.
- **Fatos:** +5.000 projetos, 10 anos, +120 profissionais, fundação 2016, Maceió/AL, endereço, CNPJ 25.003.808/0001-53, WhatsApp `558299980160`, @dsolareenergia. Nenhum número novo é inventado.
- **Marca:** logo atual (versões navy e branca) + azul `#00428C` / `#00315F` + laranja `#F4901E`.
- **Funções:** formulário (nome, WhatsApp, cidade, faixa de conta, aceite LGPD, honeypot `empresa_site`) → mensagem pronta no WhatsApp; `LEAD_ENDPOINT` opcional (Apps Script, `sendBeacon` + fallback `fetch keepalive`); Meta Pixel **só após consentimento** (`localStorage['dsolare_consent']`), eventos `PageView`, `Contact` (clique em wa.me) e `Lead` (submit, com `cidade` e `faixa_conta`).

## 2. Diagnóstico do site atual

| Problema | Evidência |
|---|---|
| Conteúdo some sem animação | Captura full-page: Projetos, Quem somos, Contato em branco — `.reveal` esconde até o IntersectionObserver disparar |
| Hero genérico | Foto duotone + headline Montserrat 900; serve para qualquer integradora |
| Ritmo monótono | Toda seção é "eyebrow laranja + título + 3–4 cards" |
| Três famílias tipográficas | Montserrat, Poppins e Sora sem papéis definidos |
| Banner de cookies cobre o CTA | No desktop 1440×900 ele cobre a linha "resposta pelo WhatsApp" |
| Animação sem significado | Só fade/count-up; nada demonstra o diferencial ("a gente mostra o cálculo") |

## 3. Direção: "Um dia de sol em Maceió" × "Memorial de cálculo"

**Tese.** O diferencial da D'Solare é *mostrar o cálculo*. A página transforma isso em experiência: a luz do sol vira partícula, a partícula vira kWh, o kWh vira número na conta. Ela recusa o padrão do setor (foto de painel + "economize até 95%" + cards com ícones).

**Metáfora de scroll (o fio condutor).** Rolar a página é atravessar um dia: o hero começa no **amanhecer** (céu navy, sol nascendo no horizonte), o meio da página é **dia claro** (branco-sol, tinta navy) e o contato é o **pôr do sol** (laranja). O rodapé é a **noite**. Um pequeno *arco solar* no header marca a "hora" (06h → 19h) conforme o progresso do scroll.

**Gramática visual (mundo próprio).**
- **Laranja = luz.** Laranja/dourado só aparece no que é luz ou ação: partículas, raios, destaque de números, CTAs. Nunca como decoração de ícone.
- **Navy = céu e tinta.** Estratégia de cor *Committed*: o navy cobre 40–60% da página (amanhecer, manifesto, noite); as seções de dia usam branco-sol frio `#F5F8FC` (não creme).
- **Linguagem de memorial de cálculo:** linhas de cota, réguas, grade técnica fina, rótulos em números tabulares (kWh, kWp, R$, °, %). Ecoa "dimensionamento técnico com assinatura de engenheiro" e a conta de luz que todo alagoano conhece.
- **Tipografia (2 famílias, self-hosted):** *Archivo* variável (eixos `wdth` 62–125 e `wght`) para títulos (expandido e pesado, herdando o peso do logo) e para números com `font-variant-numeric: tabular-nums`; *Figtree* no corpo. Poppins, Montserrat e Sora saem do site. A escolha é confirmada na rodada de direção.
- **Fotos reais:** `usina-aerea.jpg`, `case-*.jpg`. Revelação por máscara (clip-path de retângulo), nunca em moldura de card.

## 4. Mapa da página (ordem, conteúdo, movimento)

| # | Seção (id) | Hora | Composição | Movimento |
|---|---|---|---|---|
| 0 | Header `#header` | — | Logo, nav, CTA "Análise gratuita", arco solar | Transparente no hero → sólido; arco acompanha o scroll |
| 1 | Hero `#topo` | 06h | Headline à esquerda; **canvas WebGL** com sol nascendo atrás do texto, raios (god rays) e partículas de luz flutuando; números (+5.000 / 10 / +120 / 2016) numa régua de cota na base | Linhas da headline sobem por máscara (SplitText); sol sobe 15% e partículas aceleram com o scroll; cursor desvia as partículas (desktop); count-up dos números |
| 2 | Luz → energia `#energia` (nova, sem copy nova: usa a frase do hero "Cada sistema dimensionado com os dados reais do seu telhado, do seu consumo e da sua tarifa") | 08h | Campo de partículas desce sobre uma grade de células de painel | **Momento-assinatura 1 (pin ~150vh, desktop):** fótons caem e cada célula acende ao ser "atingida"; com a grade cheia, a frase aparece linha a linha. Não há número de kWh/R$ nessa seção (nada inventado) |
| 3 | Serviços `#servicos` | 10h | 3 linhas largas (Residencial / Corporativo / Pós-venda), não cards; frase-assinatura em destaque | Varredura de luz (gradiente laranja→transparente) atravessa cada linha ao entrar |
| 4 | Método `#metodo` | 12h | **Memorial de cálculo:** folha técnica com 4 etapas em sequência horizontal; uma conta de luz *ilustrativa* sendo analisada (consumo kWh, telhado/orientação, sombreamento, tarifa) | **Momento-assinatura 2 (pin horizontal, desktop):** linhas de cota se desenham (DrawSVG), etapa 01→04 avança, os campos da conta acendem; mobile: lista vertical com cotas desenhando no scroll |
| 5 | Projetos `#projetos` | 14h | 3 casos reais em grid assimétrico, foto grande + legenda técnica | Revelação por máscara + parallax interno de 8–12% na foto |
| 6 | Quem somos `#sobre` | 15h | Os dois sócios + time; tipografia grande | Texto revela por linha; foto (quando existir) com máscara |
| 7 | Manifesto (id `manifesto`) | 17h, céu escurecendo | Navy; as 3 más práticas | Cada prática recebe um **risco desenhado** (strike) no scroll e a resposta D'Solare acende em laranja |
| 8 | FAQ `#faq` | — | `<details>`/`<summary>` nativo estilizado | Abertura com altura animada (CSS `interpolate-size` + fallback) |
| 9 | Citação | 18h | "A gente não vende preço. A gente vende valor." em tipo gigante | Palavras acendem uma a uma (opacity 0.2 → 1) com o scroll |
| 10 | Contato `#contato` | 18h30, pôr do sol | Laranja→navy; formulário com campos em linguagem de folha técnica | O mesmo canvas volta com sol baixo e partículas quentes |
| 11 | Rodapé | 19h, noite | Navy escuro, pontos de luz estáticos (estrelas, CSS) | Nenhum |

## 5. Tese de movimento (Impeccable `animate`)

- **Momento focal:** a luz virando energia (seção 2) e o cálculo sendo desenhado (seção 4). Todo o resto é secundário e discreto.
- **Continuidade:** um único progresso global de scroll alimenta a "hora do dia" (`dayPhase`): cor do céu do canvas, posição do sol, arco no header.
- **Feedback:** botões (150 ms), campos do formulário, FAQ, menu mobile.
- **Easing:** `cubic-bezier(0.16, 1, 0.3, 1)` / `power3.out`; nada de bounce/elastic. Entradas focais 500–800 ms; rotinas 150–300 ms.
- **Orçamento:** um único `WebGLRenderer`; renderiza só com hero, seção 2 ou contato na tela; pausa com `document.hidden`; DPR máx. 1.5 (desktop) / 1 (mobile).

## 6. Níveis de qualidade (fallback)

| Nível | Quando | O que roda |
|---|---|---|
| `high` | WebGL ok, ≥ 8 núcleos, largura ≥ 1024, sem economia de dados | 6.000 partículas, god rays, interação com cursor, pins |
| `low` | WebGL ok, celular/hardware modesto | 1.800 partículas, sem god rays e sem pins; animações curtas |
| `still` | `prefers-reduced-motion: reduce` | Um único frame renderizado; sem loop, pins ou parallax; opacidade e cor continuam |
| `none` | Sem WebGL | Gradiente CSS + imagem-pôster do sol |

**Regra inquebrável:** todo conteúdo fica visível sem JavaScript. Estados iniciais escondidos só existem dentro de `gsap.matchMedia()`, depois que o JS rodou.

## 7. Metas de qualidade

- Lighthouse mobile: Performance ≥ 85, Acessibilidade ≥ 95, SEO 100, LCP ≤ 2,5 s (o LCP é o texto do hero, não o canvas), CLS ≤ 0,05.
- JS inicial ≤ 90 KB gzip; Three.js carregado por `import()` depois do primeiro paint.
- Sem rolagem horizontal em 360–1920 px; alvo de toque ≥ 44 px; foco visível.
- Banner LGPD compacto, no canto, sem cobrir CTA.
- JSON-LD `LocalBusiness`/`Electrician`, Open Graph com imagem nova.

## 8. Assets: o que temos e o que pedir à D'Solare

**Temos (baixar do site atual):** `logo-dsolare-navy.png`, `logo-dsolare-branco.png`, `favicon.png`, `usina-aerea.jpg` (1600×900), `case-residencial.jpg`, `case-corporativo.jpg`, `case-industrial.jpg`.

**Pedir:**
1. Logo em **SVG** (o PNG atual tem 974×220).
2. Fotos dos sócios e da equipe (hoje "Quem somos" não tem rosto).
3. Fotos de drone/obra em alta resolução (≥ 2400 px) para os projetos.
4. Um caso real com números autorizados (conta antes/depois, kWp, payback) para trocar o exemplo **ilustrativo** do Método por um real.
5. ID do Meta Pixel e URL do `LEAD_ENDPOINT`, se já existir.

## 9. Decisões em aberto

- Hospedagem/deploy (hoje o site está em hospedagem própria; a build é estática e roda em qualquer lugar, inclusive Vercel).
- Confirmação da direção na rodada Impeccable (Tarefa 3 do plano). Esta direção é a candidata principal, mas o `concept-seed` pode trazer alternativas.
