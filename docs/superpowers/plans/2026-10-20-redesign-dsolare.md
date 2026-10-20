# Redesign D'Solare: Plano de Implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reconstruir dsolare.com.br como landing estática de alta conversão: "um dia de sol em Maceió", com sol e partículas de luz em Three.js, animações de scroll em GSAP e o conteúdo e as funções atuais preservados.

**Architecture:** Vite + TypeScript vanilla gera uma página estática. O HTML é semântico e o conteúdo fica visível sem JS. Um módulo de movimento (GSAP + ScrollTrigger + SplitText + DrawSVG, dentro de `gsap.matchMedia`) orquestra as seções, e um único canvas WebGL (`src/sky/`) é carregado por `import()` depois do primeiro paint e controlado pelo progresso global do scroll (`dayPhase`). As regras de lead, WhatsApp e consentimento são funções puras e testadas.

**Tech Stack:** Vite, TypeScript, Tailwind CSS v4 (`@tailwindcss/vite`), GSAP ≥ 3.13 (todos os plugins gratuitos), Three.js ≥ 0.180, Lenis (só desktop), @fontsource-variable/archivo + @fontsource-variable/figtree, Vitest, Playwright + @axe-core/playwright, @lhci/cli.

**Spec:** [docs/superpowers/specs/2026-10-20-redesign-dsolare-design.md](../specs/2026-10-20-redesign-dsolare-design.md)

## Global Constraints

- Todo o texto vem do site atual, sem alteração; a única copy nova são rótulos "Exemplo ilustrativo". Nenhum número comercial é inventado.
- WhatsApp `558299980160`; a mensagem do formulário é idêntica à atual (ver Tarefa 5).
- Meta Pixel só dispara com `localStorage['dsolare_consent'] === 'granted'`.
- Cores: navy `#00428C`, navy escuro `#00315F`, laranja `#F4901E`, branco-sol `#F5F8FC`. Laranja só para luz e ação.
- Fontes: Archivo (variável) para títulos e números, Figtree no corpo, ambas self-hosted. Proibido Poppins, Montserrat e Sora.
- Conteúdo visível sem JS e com `prefers-reduced-motion: reduce`. CSS nunca esconde conteúdo por padrão.
- Pins de scroll só com `(min-width: 1024px) and (prefers-reduced-motion: no-preference)`.
- JS inicial ≤ 90 KB gzip; Three.js sempre por `import()` dinâmico.
- Lighthouse mobile: Perf ≥ 85, A11y ≥ 95, SEO 100, LCP ≤ 2,5 s, CLS ≤ 0,05.
- Sem rolagem horizontal de 360 a 1920 px.

## Review Focus

1. **Navegador sem WebGL ou GPU fraca** (celular antigo vindo de anúncio): a página deve mostrar o fallback CSS do sol e continuar 100% legível. Teste em `sky.spec.ts` (Tarefa 7).
2. **Âncora da nav com seções pinadas** ("Método" com pin horizontal): clicar no link tem que levar ao início da seção, não ao meio do pin. Teste em `nav.spec.ts` (Tarefa 9).
3. **Redimensionar/girar o celular no meio do scroll**: os pins e o canvas devem se recalcular (`ScrollTrigger.refresh`, resize do renderer), sem buraco branco. Teste em `motion.spec.ts` (Tarefa 6).
4. **Pop-up bloqueado no `window.open` do WhatsApp** (in-app browser do Instagram/Facebook): fallback para `location.href`. Teste em `lead.spec.ts` (Tarefa 5).
5. **Aba em segundo plano**: o loop WebGL tem que parar (`document.hidden`) para não drenar bateria. Teste em `sky.spec.ts` (Tarefa 7).

---

## Estrutura de arquivos

```
index.html                    # página única, semântica, todo o conteúdo
politica-de-privacidade.html  # migrada do site atual
public/img/                   # logo, favicon, fotos (versões .webp + .jpg)
public/img/sky-poster.webp    # pôster do fallback 'none'
src/main.ts                   # entrada: CSS, lead, consent, nav; dispara motion e sky
src/styles/tokens.css         # @theme Tailwind v4: cores, fontes, escala, easing
src/styles/base.css           # tipografia, componentes (botão, campo, régua de cota)
src/lib/day-phase.ts          # progresso → hora/céu/sol (puro)
src/lib/quality.ts            # ambiente → nível de qualidade (puro)
src/lead/whatsapp.ts          # mensagem + URL (puro)
src/lead/consent.ts           # consentimento + pixel (puro, com injeção)
src/lead/form.ts              # liga o formulário ao DOM
src/ui/nav.ts                 # header sólido, menu mobile, arco solar
src/motion/setup.ts           # registro GSAP, Lenis, matchMedia, refresh
src/motion/sections/*.ts      # uma função init por seção
src/sky/particles.ts          # campo de fótons com seed (puro)
src/sky/shaders/*.glsl        # sol, raios, partículas
src/sky/scene.ts              # renderer + controller
tests/unit/*.test.ts          # Vitest
tests/e2e/*.spec.ts           # Playwright
lighthouserc.json
```

---

### Task 1: Scaffold, ferramentas e assets

**Files:**
- Create: `package.json`, `vite.config.ts`, `tsconfig.json`, `playwright.config.ts`, `vitest.config.ts`, `index.html` (casca), `src/main.ts`, `src/styles/tokens.css`, `.gitignore`
- Create: `public/img/*` (baixar do site atual: `logo-dsolare-navy.png`, `logo-dsolare-branco.png`, `favicon.png`, `usina-aerea.jpg`, `case-residencial.jpg`, `case-corporativo.jpg`, `case-industrial.jpg` de `https://dsolare.com.br/assets/img/`)
- Test: `tests/e2e/smoke.spec.ts`

**Interfaces:**
- Produces: scripts `npm run dev`, `build`, `preview`, `test` (vitest run), `e2e` (playwright test contra `vite preview` na porta 4173).

- [ ] **Step 1:** `git init`; `npm create vite@latest . -- --template vanilla-ts`; instalar `tailwindcss @tailwindcss/vite gsap three lenis @fontsource-variable/archivo @fontsource-variable/figtree` e, como dev, `vitest @playwright/test @axe-core/playwright @types/three @lhci/cli`. Travar versões no lockfile.
- [ ] **Step 2:** Escrever `smoke.spec.ts`: `GET /` responde 200, `title` = `D'Solare — Energia Solar em Maceió, Alagoas | Análise gratuita`, `img[alt*="D'Solare"]` visível.
- [ ] **Step 3:** Rodar `npm run e2e`. Esperado: FAIL (título ausente).
- [ ] **Step 4:** Casca do `index.html` com `<title>`, metas atuais (description, OG), `lang="pt-BR"` e logo; `tokens.css` com as cores e fontes das Global Constraints em `@theme`.
- [ ] **Step 5:** `npm run e2e`. Esperado: PASS.
- [ ] **Step 6:** Commit `chore: scaffold vite + tailwind + gsap + three`.

### Task 2: HTML semântico com todo o conteúdo

**Files:**
- Modify: `index.html`
- Create: `politica-de-privacidade.html`
- Test: `tests/e2e/content.spec.ts`

**Interfaces:**
- Produces: ids `#header`, `#topo`, `#energia`, `#servicos`, `#metodo`, `#projetos`, `#sobre`, `#manifesto`, `#faq`, `#citacao`, `#contato`, e `#lead-form` com campos `nome`, `whatsapp`, `cidade`, `conta` (as 5 faixas atuais), `aceite`, honeypot `empresa_site`. Elementos animáveis recebem `data-anim="<tipo>"` (`lines`, `strike`, `mask`, `words`, `count`, `cota`) e números contáveis recebem `data-count-to`.

- [ ] **Step 1:** Escrever `content.spec.ts` com 3 casos: (a) com `javaScriptEnabled: false`, cada id acima existe e seu `h1/h2` está visível; (b) viewport 390×844: `document.documentElement.scrollWidth <= 390`; (c) os 4 números `+5.000`, `10`, `+120`, `2016` aparecem como texto final no HTML (o count-up nunca é a única fonte).
- [ ] **Step 2:** `npm run e2e -- content`. Esperado: FAIL.
- [ ] **Step 3:** Transcrever o conteúdo do site atual (copiar texto exato via snapshot; o FAQ usa `<details>/<summary>` com as 4 perguntas e respostas). Imagens com `width`/`height`, `loading="lazy"` exceto no hero e `alt` descritivo. Sem estilos ainda.
- [ ] **Step 4:** `npm run e2e -- content`. Esperado: PASS.
- [ ] **Step 5:** Commit `feat: conteúdo semântico completo`.

### Task 3: Rodada de direção Impeccable (decisão, sem código de página)

**Files:**
- Create: `PRODUCT.md`, surface brief via `impeccable surface-brief write index.html <body>`

- [ ] **Step 1:** Rodar `impeccable context --target index.html`, depois `reference/init.md` para escrever `PRODUCT.md` (fatos do spec §1; marcar como suposição o que não foi confirmado).
- [ ] **Step 2:** Rodar `impeccable concept-seed --scope direction --mode persuade`. A direção do spec §3 entra como candidata; pinos do brief: logo + navy/laranja, sol/partículas, GSAP/Three.
- [ ] **Step 3:** Apresentar a página de decisão (`serve-question`) ao usuário e coletar a escolha.
- [ ] **Step 4:** Gravar o `## Direction contract` (THESIS, OWN-WORLD, STORY, FIRST VIEWPORT, FORM, FINISH) no surface brief e reler para confirmar os 6 blocos + seed key.
- [ ] **Step 5:** Commit `docs: PRODUCT.md e contrato de direção`.

> Se o usuário escolher outra direção, as Tarefas 4 e 8–10 seguem o contrato novo; as interfaces das Tarefas 5–7 não mudam.

### Task 4: Sistema visual e layout estático de todas as seções

**Files:**
- Modify: `src/styles/tokens.css`, `index.html`
- Create: `src/styles/base.css`, `public/img/*.webp`
- Test: `tests/e2e/a11y.spec.ts`, `tests/e2e/content.spec.ts` (reexecutar)

- [ ] **Step 1:** Ler `reference/craft-floor.md` do Impeccable antes de qualquer edição de UI.
- [ ] **Step 2:** Escrever `a11y.spec.ts`: axe sem violações `serious`/`critical` em 1440 e 390; todo `a, button, summary, input, select` com foco visível (`outline` ou `box-shadow` ≠ none em `:focus-visible`); alvos de toque ≥ 44×44 em 390.
- [ ] **Step 3:** `npm run e2e -- a11y`. Esperado: FAIL.
- [ ] **Step 4:** Implementar o layout final de cada seção conforme a tabela do spec §4 e o contrato: régua de cota dos números, linhas de serviço, folha técnica do método (estado final, estático), grid assimétrico de projetos, manifesto navy, FAQ, citação, contato pôr do sol, rodapé noite. Fundo do hero = gradiente CSS de amanhecer + `sky-poster.webp` (é o fallback `none` e o pôster antes do WebGL). Banner LGPD compacto no canto inferior esquerdo, longe do CTA e do botão de WhatsApp.
- [ ] **Step 5:** `npm run e2e`. Esperado: `a11y` e `content` PASS.
- [ ] **Step 6:** Commit `feat: sistema visual e layout estático`.

### Task 5: Lead, WhatsApp e consentimento

**Files:**
- Create: `src/lead/whatsapp.ts`, `src/lead/consent.ts`, `src/lead/form.ts`
- Test: `tests/unit/whatsapp.test.ts`, `tests/unit/consent.test.ts`, `tests/e2e/lead.spec.ts`

**Interfaces:**
- Produces:
  - `type LeadData = { nome: string; whatsapp: string; cidade: string; conta: string }`
  - `buildLeadMessage(d: LeadData): string`
  - `buildWhatsAppUrl(d: LeadData, phone?: string): string` (default `'558299980160'`)
  - `createConsent(storage: Pick<Storage,'getItem'|'setItem'> | null, fbq: (...a: unknown[]) => void): { state(): 'granted'|'denied'|null; grant(): void; deny(): void; track(event: string, params?: object): void }`
  - `initLeadForm(form: HTMLFormElement, consent: ReturnType<typeof createConsent>, endpoint: string): void` (`endpoint` vem de `import.meta.env.VITE_LEAD_ENDPOINT ?? ''`)

- [ ] **Step 1: Testes unitários**

```ts
const d = { nome: 'Ana Lima', whatsapp: '(82) 98888-7777', cidade: 'Maceió', conta: 'R$ 600 a R$ 1.500' };
expect(buildLeadMessage(d)).toBe(
  'Olá! Vim pelo site da D’Solare e quero solicitar uma análise gratuita da minha conta de luz.\n\n' +
  '• Nome: Ana Lima\n• WhatsApp: (82) 98888-7777\n• Cidade: Maceió\n• Conta de luz: R$ 600 a R$ 1.500');
expect(buildWhatsAppUrl(d)).toBe('https://wa.me/558299980160?text=' + encodeURIComponent(buildLeadMessage(d)));
// consent
const fbq = vi.fn(); const c = createConsent(memStorage(), fbq);
c.track('Lead'); expect(fbq).not.toHaveBeenCalled();
c.grant(); expect(fbq).toHaveBeenCalledWith('consent', 'grant'); expect(fbq).toHaveBeenCalledWith('track', 'PageView');
c.track('Lead', { cidade: 'Maceió' }); expect(fbq).toHaveBeenLastCalledWith('track', 'Lead', { cidade: 'Maceió' });
expect(createConsent(null, fbq).state()).toBe(null); // localStorage bloqueado não quebra
```

- [ ] **Step 2:** `npm test`. Esperado: FAIL (módulos inexistentes).
- [ ] **Step 3:** Implementar os três módulos. `form.ts` reproduz o fluxo atual: honeypot → `sendBeacon`/`fetch keepalive` se `endpoint` → `track('Lead', { content_name: 'analise-conta-luz', cidade, faixa_conta })` → `window.open(url, '_blank', 'noopener')`; **se `window.open` retornar `null`, usar `location.href = url`**. Cliques em `a[href*="wa.me/"]` → `track('Contact')`.
- [ ] **Step 4:** `lead.spec.ts`: stub de `window.open` registra a URL; preencher e enviar → URL igual à de `buildWhatsAppUrl`; com `empresa_site` preenchido → nenhuma chamada; com `window.open` retornando `null` → `location.href` muda para wa.me (interceptar a navegação); `window.fbq` stub não recebe `track` antes de aceitar o banner.
- [ ] **Step 5:** `npm test && npm run e2e -- lead`. Esperado: PASS.
- [ ] **Step 6:** Commit `feat: formulário, whatsapp e consentimento`.

### Task 6: Núcleo de movimento, hora do dia e header

**Files:**
- Create: `src/lib/day-phase.ts`, `src/motion/setup.ts`, `src/ui/nav.ts`
- Test: `tests/unit/day-phase.test.ts`, `tests/e2e/motion.spec.ts`

**Interfaces:**
- Produces:
  - `type DayPhase = { hour: number; sunElevation: number; skyTop: string; skyHorizon: string; warmth: number }`
  - `dayPhase(progress: number): DayPhase`: progresso 0→1 = 06h→19h. Paradas de cor: 0 amanhecer (`#061529`/`#F4901E`), 0.15 manhã, 0.5 meio-dia (`#00428C`/`#F5F8FC`), 0.85 pôr do sol (`#00315F`/`#F4901E`), 1 noite (`#040D1A`/`#00315F`). `sunElevation` em graus (−5 → 75 → −5). `warmth` em 0–1.
  - `initMotion(): { mm: gsap.MatchMedia; lenis: Lenis | null; onProgress(cb: (p: number) => void): void }` registra `ScrollTrigger`, `SplitText` e `DrawSVGPlugin`; Lenis só em `(min-width:1024px) and (prefers-reduced-motion:no-preference)`, sincronizado com `gsap.ticker`; adiciona `html.has-motion`; `ScrollTrigger.refresh()` em `resize` (debounce de 200 ms) e `orientationchange`.
  - `initNav(onProgress)`: header sólido após 24 px, menu mobile com `aria-expanded`, arco solar SVG no header ligado a `dayPhase(p).hour`.

- [ ] **Step 1:** Testes unitários: `dayPhase(0).hour === 6`; `dayPhase(1).hour === 19`; `dayPhase(-1)` igual a `dayPhase(0)` e `dayPhase(2)` igual a `dayPhase(1)` (clamp); `sunElevation` é máximo em 0.5; `dayPhase(0.5).skyTop === '#00428C'`.
- [ ] **Step 2:** `motion.spec.ts`: (a) com `reducedMotion: 'reduce'`: `.pin-spacer` count = 0 e, após rolar até o fim, todo `[data-anim]` tem `opacity` computada 1; (b) desktop 1440: após rolar até o fim em passos de 400 px, todo `[data-anim]` tem `opacity` 1 (nada fica preso escondido); (c) redimensionar 1440→390→1440 no meio da página: sem `scrollWidth` > largura e o `h2` de `#metodo` visível depois de `scrollIntoView`.
- [ ] **Step 3:** Rodar e ver FAIL. Implementar. Rodar e ver PASS.
- [ ] **Step 4:** Commit `feat: núcleo de movimento e hora do dia`.

### Task 7: Céu WebGL: sol, raios e partículas de luz

**Files:**
- Create: `src/lib/quality.ts`, `src/sky/particles.ts`, `src/sky/scene.ts`, `src/sky/shaders/sun.glsl`, `src/sky/shaders/photons.vert`, `src/sky/shaders/photons.frag`
- Modify: `src/main.ts`
- Test: `tests/unit/quality.test.ts`, `tests/unit/particles.test.ts`, `tests/e2e/sky.spec.ts`

**Interfaces:**
- Consumes: `dayPhase`, `initMotion().onProgress`.
- Produces:
  - `type Tier = 'high' | 'low' | 'still' | 'none'`
  - `detectQuality(env: { webgl: boolean; reducedMotion: boolean; cores: number; width: number; saveData: boolean }): Tier`
  - `PARTICLES: Record<'high'|'low', number> = { high: 6000, low: 1800 }`
  - `createPhotonField(count: number, seed: number): { positions: Float32Array; seeds: Float32Array }`
  - `mountSky(canvas: HTMLCanvasElement, tier: Exclude<Tier,'none'>): SkyController`
  - `type SkyController = { setPhase(p: DayPhase): void; setPointer(x: number, y: number): void; setActive(on: boolean): void; dispose(): void }`

- [ ] **Step 1:** Testes unitários: `webgl:false` → `'none'`; `reducedMotion:true` → `'still'`; `cores:8,width:1440` → `'high'`; `cores:4` ou `width<1024` ou `saveData` → `'low'`. `createPhotonField(100, 7)` gera `positions.length === 300`, é determinístico com o mesmo seed e diferente com outro seed, e todos os pontos ficam dentro de `[-1,1]³`.
- [ ] **Step 2:** `sky.spec.ts`: (a) Chromium normal: `canvas#sky[data-tier]` existe e `data-tier` ∈ `high|low`; (b) projeto Playwright com `launchOptions.args: ['--disable-webgl', '--disable-3d-apis']`: sem canvas, `.sky-fallback` visível e o texto do hero legível; (c) `reducedMotion: 'reduce'`: `data-tier="still"` e nenhum `requestAnimationFrame` agendado depois do primeiro frame (contar via `page.evaluate` com rAF instrumentado); (d) `document.hidden` simulado (`page.evaluate(() => document.dispatchEvent(new Event('visibilitychange')))` com `hidden` sobrescrito) → `canvas.dataset.running === 'false'`.
- [ ] **Step 3:** Rodar e ver FAIL.
- [ ] **Step 4:** Implementar. Cena: plano de céu fullscreen com shader de gradiente (`skyTop`/`skyHorizon`) + disco do sol com halo e raios radiais (`sun.glsl`, raios só no `high`) + `THREE.Points` com `ShaderMaterial` aditivo (fótons ondulando com ruído, tamanho por profundidade, cor do navy-claro ao laranja por `warmth`). O ponteiro desvia os fótons num raio de 0,15 (só `high`). `main.ts` faz `import('./sky/scene')` em `requestIdleCallback` (fallback `setTimeout(…, 200)`) após o `load`; `setActive` é ligado por ScrollTrigger nas zonas `#topo`, `#energia` e `#contato`; o renderer usa DPR `min(devicePixelRatio, tier==='high' ? 1.5 : 1)` e respeita `visibilitychange`; `data-running` reflete o loop.
- [ ] **Step 5:** `npm test && npm run e2e -- sky`. Esperado: PASS. `npm run build` → chunk inicial ≤ 90 KB gzip (conferir no relatório do Vite).
- [ ] **Step 6:** Commit `feat: céu webgl com sol e partículas`.

### Task 8: Momento-assinatura 1: luz vira energia (`#energia`) + hero

**Files:**
- Create: `src/motion/sections/hero.ts`, `src/motion/sections/energia.ts`
- Modify: `src/sky/scene.ts` (modo "captura": fótons convergem para a grade)
- Test: `tests/e2e/motion.spec.ts` (casos novos)

**Interfaces:**
- Consumes: `mm`, `SkyController`.
- Produces: `initHero(mm)`, `initEnergia(mm, sky?: SkyController)`, `SkyController.setCapture(t: number)` (0–1, fótons → centros das células da grade).

- [ ] **Step 1:** Casos novos em `motion.spec.ts`: em 1440, `#energia` gera exatamente 1 `.pin-spacer`; em 390, nenhum; ao rolar até o fim de `#energia`, todas as `.cell` têm `data-lit="true"` e a frase está visível.
- [ ] **Step 2:** Rodar e ver FAIL.
- [ ] **Step 3:** Hero: SplitText por linhas com máscara (`yPercent: 100 → 0`, 0,8 s, stagger 0,08, `power3.out`) no load; count-up dos `data-count-to` (1,6 s) ao entrar; scrub do hero → `sky.setPhase` (sol sobe). Energia: pin `+=150%` (desktop), timeline com scrub 0,6: `setCapture` 0→1, células acendem em ordem de impacto (stagger por distância ao centro) e depois a frase entra linha a linha. No mobile, uma sequência curta sem pin (células acendem ao entrar, 1,2 s).
- [ ] **Step 4:** Rodar e ver PASS. Commit `feat: hero e assinatura luz→energia`.

### Task 9: Momento-assinatura 2: memorial de cálculo (`#metodo`)

**Files:**
- Create: `src/motion/sections/metodo.ts`, SVG das cotas e da conta ilustrativa inline em `index.html`
- Test: `tests/e2e/nav.spec.ts`, `tests/e2e/motion.spec.ts` (casos novos)

**Interfaces:**
- Consumes: `mm`, `lenis` (de `initMotion`).
- Produces: `initMetodo(mm, lenis)` (ScrollTrigger com `id: 'metodo'`); `[data-step="1..4"]` recebe `aria-current="step"` na etapa ativa.

- [ ] **Step 1:** `nav.spec.ts`: em 1440, clicar em "Método" na nav → o topo de `#metodo` fica a ≤ 8 px do header e `[data-step="1"]` tem `aria-current="step"`; o mesmo vale para todas as âncoras da nav (Serviços, Método, Projetos, Quem somos, Dúvidas). Caso novo em `motion.spec`: rolar até o fim do pin → `[data-step="4"]` ativo e todos os `path[data-anim="cota"]` com `stroke-dashoffset` ≈ 0.
- [ ] **Step 2:** Rodar e ver FAIL.
- [ ] **Step 3:** Desktop: pin com track horizontal (`xPercent` −75 ao longo de `+=300%`), cada etapa desenha suas cotas com DrawSVG (0→100%) e acende o campo correspondente da conta ilustrativa (consumo kWh → telhado/orientação → sombreamento → tarifa/projeto). Selo visível "Exemplo ilustrativo". Âncoras: interceptar cliques da nav e usar `lenis.scrollTo(ScrollTrigger.getById('metodo').start)` (sem Lenis: `window.scrollTo`). Mobile: lista vertical, cotas desenhando por etapa ao entrar.
- [ ] **Step 4:** Rodar e ver PASS. Commit `feat: memorial de cálculo animado`.

### Task 10: Movimentos de apoio (serviços, projetos, sobre, manifesto, citação, FAQ, contato)

**Files:**
- Create: `src/motion/sections/{servicos,projetos,sobre,manifesto,citacao,faq,contato}.ts`
- Test: `tests/e2e/motion.spec.ts` (casos novos), `tests/e2e/a11y.spec.ts` (FAQ)

**Interfaces:**
- Consumes: `mm`, `SkyController` (contato).
- Produces: uma função `init<Seção>(mm)` por arquivo, chamada por `src/motion/setup.ts`.

- [ ] **Step 1:** Casos novos: no fim da página, os 3 `[data-anim="strike"]` do manifesto têm a linha completa (`scaleX` 1); todas as palavras de `#citacao [data-anim="words"]` têm opacity 1; FAQ: `Tab` até o primeiro `summary` e `Enter` → `details[open]` e resposta visível; segundo `Enter` fecha.
- [ ] **Step 2:** Rodar e ver FAIL.
- [ ] **Step 3:** Implementar conforme a coluna "Movimento" do spec §4: varredura de luz nas linhas de serviço (gradiente via `--sweep` 0→100%); projetos com `clip-path: inset()` de 100%→0 e parallax interno `yPercent` −10→10; sobre com linhas; strike do manifesto (`scaleX` 0→1, `transformOrigin: left`) seguido da resposta em laranja; citação com palavras de 0,2 → 1 por scrub; FAQ com `interpolate-size: allow-keywords` e fallback de altura via GSAP; contato `sky.setActive(true)` com fase de pôr do sol. Sem stagger acima de 0,6 s no total.
- [ ] **Step 4:** Rodar e ver PASS. Commit `feat: movimentos de apoio`.

### Task 11: SEO, performance e endurecimento

**Files:**
- Modify: `index.html` (JSON-LD, OG), `vite.config.ts`
- Create: `lighthouserc.json`, `public/og.jpg` (1200×630, gerado da cena do hero)
- Test: `tests/e2e/seo.spec.ts`, Lighthouse CI

- [ ] **Step 1:** `seo.spec.ts`: `script[type="application/ld+json"]` é JSON válido com `@type` `Electrician` (ou `LocalBusiness`), `telephone` `+55-82-9998-0160`, endereço completo do rodapé e `foundingDate` `2016`; `meta[property="og:image"]` responde 200; um único `h1`.
- [ ] **Step 2:** `lighthouserc.json` com as asserções das Global Constraints (preset mobile, 3 execuções contra `vite preview`).
- [ ] **Step 3:** Rodar `npx lhci autorun` e `npm run e2e -- seo` e ver o que falha. Corrigir: `preload` da fonte Archivo do h1, `fetchpriority="high"` no pôster, imagens `.webp` com `srcset`, Pixel carregado só após consentimento (não no `<head>`).
- [ ] **Step 4:** Rodar até PASS. Commit `perf: seo, budgets e lighthouse`.

### Task 12: Revisão final Impeccable, documentação e deploy

**Files:**
- Create: `.impeccable/review/desktop.png`, `.impeccable/review/mobile.png`, `DESIGN.md`, `.impeccable/design.json`

- [ ] **Step 1:** `impeccable detect --json index.html src/styles`, depois corrigir o que for mecânico.
- [ ] **Step 2:** Capturar 1440 (full page) e 390 com animações assentadas (rolar até o fim antes, conforme new-work §7) e conferir cada arquivo.
- [ ] **Step 3:** Disparar o subagente `impeccable-finish-reviewer` com o pacote de new-work §7 e aplicar a disposição (no máximo 2 rodadas).
- [ ] **Step 4:** Disparar `impeccable-documenter` → `DESIGN.md` + `.impeccable/design.json`.
- [ ] **Step 5:** `npm run build && npm test && npm run e2e && npx lhci autorun`. Esperado: tudo PASS. Commit `docs: DESIGN.md`. Deploy só com a aprovação do usuário (destino em aberto, spec §9).
