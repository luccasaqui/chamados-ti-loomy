/* ==========================================================================
   Loomy · Portal de Chamados de T.I. — app (design minimalista, PWA/mobile)
   Sem canvas. Fluxo passo-a-passo com a lógica condicional do WorkForms.
   Back-end: funções serverless na Vercel (/api).
   ========================================================================== */
(function () {
  'use strict';

  // Mesmo domínio na Vercel; URL absoluta quando aberto pelo Pages/local.
  var API_BASE = /(^|\.)vercel\.app$/.test(location.hostname) ? '' : 'https://chamados-ti-loomy.vercel.app';

  /* -------------------- Ícones (traço 1.75, viewBox 24) -------------------- */
  function ic(inner) {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">' + inner + '</svg>';
  }
  var ICONS = {
    arrow: ic('<line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>'),
    chevron: ic('<polyline points="9 18 15 12 9 6"/>'),
    check: ic('<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>'),
    clip: ic('<path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>'),
    clock: ic('<circle cx="12" cy="12" r="10"/><polyline points="12 7 12 12 15 14"/>'),
    inbox: ic('<polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>'),
    key: ic('<circle cx="7.5" cy="15.5" r="5.5"/><path d="M11.5 11.5 21 2"/><path d="m15.5 7.5 3 3L22 7l-3-3"/>'),
    cpu: ic('<rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/>'),
    bot: ic('<rect x="3" y="8" width="18" height="12" rx="3"/><path d="M12 8V4"/><circle cx="12" cy="3" r="1.4"/><circle cx="9" cy="14" r="1.3" fill="currentColor" stroke="none"/><circle cx="15" cy="14" r="1.3" fill="currentColor" stroke="none"/>'),
    zap: ic('<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>'),
    help: ic('<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/>'),
    more: ic('<circle cx="12" cy="12" r="1.6"/><circle cx="19" cy="12" r="1.6"/><circle cx="5" cy="12" r="1.6"/>')
  };

  /* -------------------- Categorias + agrupamento -------------------- */
  var CATEGORIES = [
    { id: 'automacao',    label: 'Automação / Processos', desc: 'Novos fluxos e otimizações',          icon: 'zap' },
    { id: 'acessos',      label: 'Acessos / Contas',      desc: 'IXC, Monday, Opa Suíte e outros',      icon: 'key' },
    { id: 'equipamentos', label: 'Equipamentos',          desc: 'Configuração e periféricos',           icon: 'cpu' },
    { id: 'ia',           label: 'IA Aplicada',           desc: 'Agentes de voz / chat — apontamentos', icon: 'bot' },
    { id: 'duvidas',      label: 'Dúvidas / Opinião',     desc: 'Observações e sugestões',              icon: 'help' },
    { id: 'outro',        label: 'Outro...',              desc: 'Não se encaixa nas opções',            icon: 'more' }
  ];
  var CAT_GROUPS = [
    { label: 'Suporte', ids: ['acessos', 'equipamentos'] },
    { label: 'Apontamentos', ids: ['ia', 'duvidas', 'outro'] },
    { label: 'Melhorias', ids: ['automacao'] }
  ];

  /* -------------------- Perguntas condicionais (lógica do WorkForms) -------------------- */
  function stepsFor(cat) {
    switch (cat) {
      case 'automacao': return [
        { key: 'proc_desc', type: 'textarea', label: 'Explique detalhadamente o processo / fluxo para melhor abordagem da automação.', hint: 'Fique à vontade com a quantidade de palavras.', required: true },
        { key: 'proc_files', type: 'file', label: 'Anexe prints e detalhes do processo / fluxo.', hint: 'Um print por etapa, ou diagramas/fluxogramas do Miro 😃', required: true }
      ];
      case 'acessos': return [
        { key: 'sistema', type: 'select', label: 'Qual sistema?', required: false, options: ['IXC', 'Opa Suíte', 'Monday', 'Make Integromat', 'Lovable', 'Claude', 'Office', 'Teams', 'VPN', 'Ferramentas NOC', 'Outro...'] },
        { key: 'sistema_outro', type: 'text', label: 'Descreva "Outro":', required: true, showIf: function (a) { return a.sistema === 'Outro...'; } },
        { key: 'acessos_desc', type: 'text', label: 'Descreva o problema | solicitação:', required: true },
        { key: 'acessos_files', type: 'file', label: 'Anexe fotos | prints do sistema com o problema relatado.', required: true }
      ];
      case 'equipamentos': return [
        { key: 'equip_itens', type: 'multiselect', label: 'Quais equipamentos?', required: true, options: ['Celular', 'Notebook', 'Chip SIM', 'Mouse', 'Impressora', 'Outro...'] },
        { key: 'equip_outro', type: 'text', label: 'Descreva "Outro":', required: true, showIf: function (a) { return Array.isArray(a.equip_itens) && a.equip_itens.indexOf('Outro...') >= 0; } },
        { key: 'equip_desc', type: 'text', label: 'Descreva o problema | solicitação:', required: true },
        { key: 'equip_files', type: 'file', label: 'Anexe fotos | prints da etiqueta do equipamento com o problema relatado.', required: true }
      ];
      case 'ia': return [
        { key: 'ia_tipo', type: 'select', label: 'Tipo de agente de I.A.', required: true, options: ['I.A. de voz (ligação | chamadas)', 'I.A. de chat (WhatsApp)', "I.A. de E-mail's"] },
        { key: 'ia_contato', type: 'tel', label: 'Contato do cliente atendido pela IA:', required: false, placeholder: '(00) 00000-0000', showIf: function (a) { return a.ia_tipo === 'I.A. de voz (ligação | chamadas)' || a.ia_tipo === 'I.A. de chat (WhatsApp)'; } },
        { key: 'ia_cliente_email', type: 'email', label: 'E-mail do cliente atendido pela IA:', required: false, placeholder: 'cliente@exemplo.com', showIf: function (a) { return a.ia_tipo === "I.A. de E-mail's"; } },
        { key: 'ia_protocolo', type: 'text', label: 'Você tem o protocolo desse atendimento?', hint: 'Com o protocolo, conseguimos uma melhor abordagem para a solução 😃', required: false },
        { key: 'ia_apontamento', type: 'textarea', label: 'Descreva detalhadamente o seu apontamento.', required: true },
        { key: 'ia_files', type: 'file', label: 'Evidências do atendimento: gravações | prints.', required: true }
      ];
      case 'duvidas': return [
        { key: 'duvida_desc', type: 'textarea', label: 'Descreva detalhadamente a sua observação | sugestão.', hint: 'Fique à vontade com a quantidade de palavras.', required: true }
      ];
      case 'outro': return [
        { key: 'outro_desc', type: 'textarea', label: 'Descreva:', required: false }
      ];
      default: return [];
    }
  }

  var BASE_KEYS = ['nome', 'email', 'categoria'];

  function buildSteps(a) {
    var base = [
      { key: 'nome', type: 'text', label: 'Qual é o seu nome?', required: true, placeholder: 'Nome completo', phase: 'Identificação' },
      { key: 'email', type: 'email-loomy', label: 'Qual é o seu e-mail Loomy?', required: true, placeholder: 'nome.sobrenome', hint: 'Portal exclusivo para colaboradores — digite apenas o que vem antes do @loomy.com.br.', phase: 'Identificação' },
      { key: 'categoria', type: 'category', label: 'Como podemos ajudar?', required: true, phase: 'Categoria' }
    ];
    var extra = stepsFor(a.categoria).map(function (s) { var c = {}; for (var k in s) c[k] = s[k]; c.phase = 'Detalhes'; return c; });
    return base.concat(extra).filter(function (s) { return !s.showIf || s.showIf(a); });
  }

  /* -------------------- Estado + utilidades -------------------- */
  var app = document.getElementById('app');
  var state = {
    screen: 'welcome', idx: 0, a: {}, protocol: '', itemId: null,
    historyEmail: '', historyLoading: false, historyError: '', historyData: null
  };

  function activeSteps() { return buildSteps(state.a); }
  function isEmpty(v) { return v === undefined || v === null || v === '' || (Array.isArray(v) && v.length === 0); }
  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  var LOOMY_DOMAIN = '@loomy.com.br';
  function loomyUser(email) { return String(email || '').replace(/@loomy\.com\.br$/i, ''); }
  function clearCategoryAnswers() { Object.keys(state.a).forEach(function (k) { if (BASE_KEYS.indexOf(k) < 0) delete state.a[k]; }); }
  function validate(step) {
    var v = state.a[step.key];
    if (step.required && isEmpty(v)) return 'Este campo é obrigatório.';
    if (step.type === 'email' && v && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return 'Informe um e-mail válido.';
    if (step.type === 'email-loomy' && v && !/^[a-z0-9._%+\-]+@loomy\.com\.br$/i.test(v)) return 'Use apenas o texto antes do @ (ex.: nome.sobrenome).';
    return null;
  }
  function genProtocol() {
    var d = new Date(); var p = function (n) { return String(n).padStart(2, '0'); };
    return 'TI-' + d.getFullYear() + p(d.getMonth() + 1) + p(d.getDate()) + '-' + Math.floor(1000 + Math.random() * 9000);
  }
  function fmtDate(s) {
    if (!s) return '';
    var d = new Date(s);
    if (isNaN(d.getTime())) return String(s);
    return d.toLocaleDateString('pt-BR');
  }

  /* -------------------- Progresso (barra fina) -------------------- */
  function progressMin(n, total, phase) {
    var pct = Math.max(6, Math.round((n / total) * 100));
    return '<div class="progress-min"><div class="progress-top">' +
      '<span class="p-step">Passo ' + n + ' de ' + total + '</span>' +
      '<span class="p-phase">' + esc(phase) + '</span></div>' +
      '<div class="progress-bar"><div class="progress-fill" style="width:' + pct + '%"></div></div></div>';
  }

  /* -------------------- Campo (por tipo) -------------------- */
  function filesListHTML(key) {
    var arr = state.a[key];
    if (!Array.isArray(arr) || !arr.length) return '';
    return arr.map(function (n) { return '<li>' + esc(n) + '</li>'; }).join('');
  }

  function fieldHTML(step) {
    var req = step.required ? ' <span class="req">*</span>' : '';
    var hint = step.hint ? '<p class="hint">' + esc(step.hint) + '</p>' : '';
    var errP = '<p class="err" id="err" aria-live="polite"></p>';
    var val = state.a[step.key];

    if (step.type === 'email-loomy') {
      return '<label class="q" for="f">' + esc(step.label) + req + '</label>' +
        '<div class="input-group"><input class="ig-input" id="f" type="text" inputmode="text" autocapitalize="off" autocorrect="off" spellcheck="false" autocomplete="username" placeholder="' + esc(step.placeholder || 'nome.sobrenome') + '" value="' + esc(loomyUser(val)) + '" /><span class="ig-suffix">' + LOOMY_DOMAIN + '</span></div>' +
        hint + errP;
    }
    if (step.type === 'text' || step.type === 'email' || step.type === 'tel') {
      var t = step.type === 'email' ? 'email' : (step.type === 'tel' ? 'tel' : 'text');
      var im = t === 'email' ? 'email' : (t === 'tel' ? 'tel' : 'text');
      return '<label class="q" for="f">' + esc(step.label) + req + '</label>' +
        '<input class="input" id="f" type="' + t + '" inputmode="' + im + '" autocomplete="off" placeholder="' + esc(step.placeholder || '') + '" value="' + esc(val || '') + '" />' +
        hint + errP;
    }
    if (step.type === 'textarea') {
      return '<label class="q" for="f">' + esc(step.label) + req + '</label>' +
        '<textarea class="input" id="f" rows="4" placeholder="Escreva aqui…">' + esc(val || '') + '</textarea>' + hint + errP;
    }
    if (step.type === 'category') {
      var card = function (c) {
        var sel = state.a.categoria === c.id ? ' sel' : '';
        return '<div class="cat-row' + sel + '" data-cat="' + c.id + '" role="button" tabindex="0" aria-pressed="' + (sel ? 'true' : 'false') + '">' +
          '<span class="cat-ic">' + ICONS[c.icon] + '</span>' +
          '<span class="cat-body"><span class="cat-title">' + esc(c.label) + '</span><span class="cat-desc">' + esc(c.desc) + '</span></span>' +
          '<span class="cat-chev">' + ICONS.chevron + '</span></div>';
      };
      var list = CAT_GROUPS.map(function (g) {
        var rows = g.ids.map(function (id) { var c = CATEGORIES.find(function (x) { return x.id === id; }); return c ? card(c) : ''; }).join('');
        return '<span class="cat-group">' + esc(g.label) + '</span>' + rows;
      }).join('');
      return '<p class="q">' + esc(step.label) + req + '</p>' +
        '<p class="q-sub">Selecione a opção que melhor descreve a sua solicitação.</p>' +
        '<div class="cat-list">' + list + '</div>' + errP;
    }
    if (step.type === 'select') {
      return '<p class="q">' + esc(step.label) + req + '</p>' +
        '<div class="chips">' + step.options.map(function (o) {
          var sel = state.a[step.key] === o ? ' sel' : '';
          return '<button type="button" class="chip' + sel + '" data-val="' + esc(o) + '">' + esc(o) + '</button>';
        }).join('') + '</div>' + hint + errP;
    }
    if (step.type === 'multiselect') {
      var cur = Array.isArray(val) ? val : [];
      return '<p class="q">' + esc(step.label) + req + '</p>' +
        '<div class="chips">' + step.options.map(function (o) {
          var sel = cur.indexOf(o) >= 0 ? ' sel' : '';
          return '<button type="button" class="chip' + sel + '" data-val="' + esc(o) + '">' + esc(o) + '</button>';
        }).join('') + '</div>' + hint + errP;
    }
    if (step.type === 'file') {
      return '<p class="q">' + esc(step.label) + req + '</p>' +
        '<label class="drop" for="f"><span class="drop-ic">' + ICONS.clip + '</span>' +
        '<span class="drop-main">Toque para anexar</span><span class="drop-sub">ou arraste os arquivos aqui</span></label>' +
        '<input id="f" type="file" multiple hidden />' +
        '<ul class="files" id="files">' + filesListHTML(step.key) + '</ul>' + hint + errP;
    }
    return '';
  }

  /* -------------------- Telas -------------------- */
  function renderWelcome() {
    app.innerHTML = '<div class="stage anim">' +
      '<span class="tagline">Suporte · Apontamentos · Melhorias</span>' +
      '<h1>Portal de Chamados de T.I. na <b>Loomy</b></h1>' +
      '<p class="lead">Abra um chamado de Suporte, Acessos &amp; Contas, Equipamentos, Automação de Processos ou IA Aplicada.</p>' +
      '<button class="btn btn-primary" id="start" style="margin-top:6px">Começar ' + ICONS.arrow + '</button>' +
      '</div>';
    document.getElementById('start').onclick = function () { state.screen = 'form'; state.idx = 0; render(); };
  }

  function renderForm() {
    var steps = activeSteps();
    if (state.idx >= steps.length) { state.screen = 'review'; return render(); }
    if (state.idx < 0) state.idx = 0;
    var step = steps[state.idx];
    var total = steps.length + 1; // + revisão
    var last = state.idx === steps.length - 1;

    app.innerHTML = '<div class="view anim"><div class="card">' +
      progressMin(state.idx + 1, total, step.phase) +
      fieldHTML(step) +
      '<div class="nav">' +
      '<button type="button" class="btn btn-ghost" id="back"' + (state.idx === 0 ? ' style="visibility:hidden"' : '') + '>Voltar</button>' +
      '<button type="button" class="btn btn-secondary" id="next">' + (last ? 'Revisar' : 'Próximo') + ' ' + ICONS.arrow + '</button>' +
      '</div></div></div>';
    bindStep(step, steps);
  }

  function summaryRows() {
    return activeSteps().map(function (s) {
      var label = s.label, v = state.a[s.key];
      if (s.type === 'category') { var c = CATEGORIES.find(function (x) { return x.id === state.a.categoria; }); v = c ? c.label : ''; label = 'Como podemos ajudar?'; }
      else if (s.type === 'file') { v = (Array.isArray(v) && v.length) ? v.join(', ') : ''; }
      else if (Array.isArray(v)) { v = v.join(', '); }
      if (isEmpty(v)) v = '—';
      return '<div class="review-row"><span class="k">' + esc(label) + '</span><span class="v">' + esc(v) + '</span></div>';
    }).join('');
  }

  function renderReview() {
    var total = activeSteps().length + 1;
    app.innerHTML = '<div class="view anim"><div class="card">' +
      progressMin(total, total, 'Revisão') +
      '<h2 class="review-title">Revise o seu chamado</h2>' +
      '<p class="review-sub">Confira as informações antes de enviar.</p>' +
      '<div class="review">' + summaryRows() + '</div>' +
      '<p class="err" id="serr" aria-live="polite"></p>' +
      '<div class="nav">' +
      '<button type="button" class="btn btn-ghost" id="back">Voltar</button>' +
      '<button type="button" class="btn btn-primary" id="submit">Enviar solicitação ' + ICONS.arrow + '</button>' +
      '</div></div></div>';
    document.getElementById('back').onclick = function () { state.screen = 'form'; state.idx = activeSteps().length - 1; render(); };
    document.getElementById('submit').onclick = submitTicket;
  }

  function renderSuccess() {
    app.innerHTML = '<div class="stage anim"><div class="card success-card">' +
      '<div class="check">' + ICONS.check + '</div>' +
      '<h2>Chamado registrado!</h2>' +
      '<p class="protocol">Protocolo <b>' + esc(state.protocol) + '</b></p>' +
      '<p class="ssub">Seu chamado foi aberto no Monday. Enviaremos as atualizações para <b>' + esc(state.a.email || '') + '</b> — o retorno também pode vir via Teams ou WhatsApp.</p>' +
      '<div class="actions">' +
      '<button class="btn btn-ghost" id="myTickets">Ver meus chamados</button>' +
      '<button class="btn btn-secondary" id="again">Abrir novo chamado</button>' +
      '</div></div></div>';
    document.getElementById('again').onclick = resetAll;
    document.getElementById('myTickets').onclick = function () {
      var email = state.a.email || '';
      state.a = {}; state.idx = 0; state.protocol = ''; state.itemId = null;
      state.screen = 'history';
      if (email) loadHistory(email); else { state.historyEmail = ''; render(); }
    };
  }

  function statusPill(status) {
    var s = String(status || '').toLowerCase(), cls = 'pill-analise';
    if (s.indexOf('feito') >= 0 || s.indexOf('conclu') >= 0) cls = 'pill-feito';
    else if (s.indexOf('progresso') >= 0) cls = 'pill-progresso';
    else if (s.indexOf('parado') >= 0) cls = 'pill-parado';
    return '<span class="pill ' + cls + '">' + esc(status || 'Em Análise') + '</span>';
  }

  function ticketHTML(t) {
    var thread = [];
    if (t.description) thread.push({ cls: 'bubble-you', who: 'Você', body: t.description, date: t.created_at });
    (t.replies || []).forEach(function (r) { thread.push({ cls: 'bubble-team', who: r.author || 'Equipe T.I.', body: r.body, date: r.created_at }); });

    var body;
    if (thread.length) {
      body = '<div class="thread">' + thread.map(function (b) {
        return '<div class="bubble ' + b.cls + '"><div class="bubble-head"><span class="bubble-who">' + esc(b.who) + '</span><span class="bubble-date">' + fmtDate(b.date) + '</span></div><div class="bubble-body">' + esc(b.body) + '</div></div>';
      }).join('') + '</div>';
      if (!(t.replies && t.replies.length)) body += '<div class="noreply">Sem respostas da equipe ainda.</div>';
    } else {
      body = '<div class="noreply">Sem respostas ainda.</div>';
    }
    return '<div class="ticket">' +
      '<div class="ticket-head"><div><div class="ticket-name">' + esc(t.name) + '</div>' +
      '<div class="ticket-meta">' + (t.category ? esc(t.category) + ' · ' : '') + 'aberto em ' + fmtDate(t.created_at) + '</div></div>' +
      statusPill(t.status) + '</div>' + body + '</div>';
  }

  function loadHistory(email) {
    state.historyEmail = email; state.historyLoading = true; state.historyError = ''; state.historyData = null;
    render();
    fetch(API_BASE + '/api/chamados?email=' + encodeURIComponent(email))
      .then(function (r) { return r.json().catch(function () { return { ok: false, error: 'Resposta inválida do servidor.' }; }); })
      .then(function (res) {
        state.historyLoading = false;
        if (res && res.ok) state.historyData = res; else state.historyError = (res && res.error) || 'Não foi possível consultar o histórico.';
        render();
      })
      .catch(function () { state.historyLoading = false; state.historyError = 'Falha de conexão. Tente novamente.'; render(); });
  }

  function renderHistory() {
    if (!state.historyEmail) {
      app.innerHTML = '<div class="view anim"><div class="card">' +
        '<h2 class="title">Meus chamados</h2>' +
        '<p class="sub">Consulte o histórico dos seus chamados e as respostas da equipe de T.I. usando o seu e-mail Loomy.</p>' +
        '<form id="histform" novalidate><label class="field-label" for="hf">Seu e-mail Loomy</label>' +
        '<div class="input-group"><input class="ig-input" id="hf" type="text" inputmode="text" autocapitalize="off" autocorrect="off" spellcheck="false" autocomplete="username" placeholder="nome.sobrenome" value="' + esc(loomyUser(state.historyEmail)) + '" /><span class="ig-suffix">' + LOOMY_DOMAIN + '</span></div>' +
        '<p class="err" id="err" aria-live="polite"></p>' +
        '<div class="nav"><button type="button" class="btn btn-ghost" id="back">Voltar</button>' +
        '<button type="submit" class="btn btn-primary" id="buscar">Buscar histórico ' + ICONS.arrow + '</button></div></form></div></div>';
      var inp = document.getElementById('hf');
      document.getElementById('back').onclick = resetAll;
      inp.addEventListener('input', function () {
        var cleaned = inp.value.replace(/@.*$/, '');
        if (cleaned !== inp.value) inp.value = cleaned;
        var e = document.getElementById('err'); if (e) e.textContent = '';
      });
      document.getElementById('histform').onsubmit = function (e) {
        e.preventDefault();
        var u = inp.value.trim().toLowerCase().replace(/@.*$/, '');
        if (!u || !/^[a-z0-9._%+\-]+$/i.test(u)) { document.getElementById('err').textContent = 'Digite o texto antes do @ (ex.: nome.sobrenome).'; return; }
        loadHistory(u + LOOMY_DOMAIN);
      };
      setTimeout(function () { inp.focus(); }, 40);
      return;
    }
    if (state.historyLoading) {
      app.innerHTML = '<div class="view anim"><div class="card"><h2 class="title">Meus chamados</h2>' +
        '<p class="sub">Consultando <span class="hist-email">' + esc(state.historyEmail) + '</span>…</p>' +
        '<div class="loading"><span class="spinner"></span> Buscando no Monday…</div></div></div>';
      return;
    }
    if (state.historyError) {
      app.innerHTML = '<div class="view anim"><div class="card"><h2 class="title">Meus chamados</h2>' +
        '<div class="notice"><span class="notice-ic">' + ICONS.clock + '</span><span>' + esc(state.historyError) + '</span></div>' +
        '<div class="nav"><button type="button" class="btn btn-ghost" id="back">Trocar e-mail</button>' +
        '<button type="button" class="btn btn-primary" id="retry">Tentar novamente ' + ICONS.arrow + '</button></div></div></div>';
      document.getElementById('back').onclick = function () { state.historyEmail = ''; state.historyError = ''; render(); };
      document.getElementById('retry').onclick = function () { loadHistory(state.historyEmail); };
      return;
    }
    var data = state.historyData || { count: 0, sent: [] };
    var content;
    if (!data.count) {
      content = '<div class="notice"><span class="notice-ic">' + ICONS.inbox + '</span><span>Nenhum chamado encontrado para <span class="hist-email">' + esc(state.historyEmail) + '</span>. Confira se usou o mesmo e-mail da abertura.</span></div>';
    } else {
      content = '<div class="tickets">' + data.sent.map(ticketHTML).join('') + '</div>';
    }
    app.innerHTML = '<div class="view anim"><div class="card"><h2 class="title">Meus chamados</h2>' +
      '<p class="sub">' + (data.count ? data.count + ' chamado(s) para ' : 'Histórico de ') + '<span class="hist-email">' + esc(state.historyEmail) + '</span></p>' +
      content +
      '<div class="nav"><button type="button" class="btn btn-ghost" id="back">Trocar e-mail</button>' +
      '<button type="button" class="btn btn-secondary" id="new">Abrir novo chamado ' + ICONS.arrow + '</button></div></div></div>';
    document.getElementById('back').onclick = function () { state.historyEmail = ''; state.historyData = null; render(); };
    document.getElementById('new').onclick = resetAll;
  }

  function setHeaderActive() {
    var h = document.getElementById('history-btn');
    if (h) { if (state.screen === 'history') h.classList.add('on'); else h.classList.remove('on'); }
  }

  function render() {
    setHeaderActive();
    if (state.screen === 'welcome') return renderWelcome();
    if (state.screen === 'history') return renderHistory();
    if (state.screen === 'success') return renderSuccess();
    if (state.screen === 'review') return renderReview();
    return renderForm();
  }

  /* -------------------- Navegação / eventos -------------------- */
  function clearErr() { var e = document.getElementById('err'); if (e) e.textContent = ''; }
  function showErr(msg) { var e = document.getElementById('err'); if (e) e.textContent = msg; }

  function goNext(steps) {
    var step = steps[state.idx];
    var err = validate(step);
    if (err) { showErr(err); return; }
    state.idx++;
    if (state.idx >= activeSteps().length) state.screen = 'review';
    render();
  }

  function addFiles(key, list) {
    var arr = Array.isArray(state.a[key]) ? state.a[key].slice() : [];
    for (var i = 0; i < list.length; i++) { if (arr.indexOf(list[i].name) < 0) arr.push(list[i].name); }
    state.a[key] = arr;
  }

  function bindStep(step, steps) {
    var next = document.getElementById('next');
    var back = document.getElementById('back');
    if (next) next.onclick = function () { goNext(steps); };
    if (back) back.onclick = function () { state.idx = Math.max(0, state.idx - 1); render(); };

    if (step.type === 'email-loomy') {
      var le = document.getElementById('f');
      le.addEventListener('input', function () {
        var cleaned = le.value.replace(/@.*$/, '');           // impede colar domínio
        if (cleaned !== le.value) le.value = cleaned;
        var u = cleaned.trim().toLowerCase();
        state.a[step.key] = u ? (u + LOOMY_DOMAIN) : '';
        clearErr();
      });
      le.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); goNext(steps); } });
      setTimeout(function () { le.focus(); }, 40);
    }
    if (step.type === 'text' || step.type === 'email' || step.type === 'tel' || step.type === 'textarea') {
      var inp = document.getElementById('f');
      inp.addEventListener('input', function () { state.a[step.key] = inp.value; clearErr(); });
      if (step.type !== 'textarea') inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); goNext(steps); } });
      setTimeout(function () { inp.focus(); }, 40);
    }
    if (step.type === 'category') {
      app.querySelectorAll('[data-cat]').forEach(function (row) {
        var choose = function () {
          var prev = state.a.categoria;
          if (prev !== row.getAttribute('data-cat')) clearCategoryAnswers();
          state.a.categoria = row.getAttribute('data-cat');
          clearErr(); render();
        };
        row.onclick = choose;
        row.onkeydown = function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); choose(); } };
      });
    }
    if (step.type === 'select') {
      app.querySelectorAll('.chip[data-val]').forEach(function (b) { b.onclick = function () { state.a[step.key] = b.getAttribute('data-val'); clearErr(); render(); }; });
    }
    if (step.type === 'multiselect') {
      app.querySelectorAll('.chip[data-val]').forEach(function (b) {
        b.onclick = function () {
          var arr = Array.isArray(state.a[step.key]) ? state.a[step.key].slice() : [];
          var v = b.getAttribute('data-val'), i = arr.indexOf(v);
          if (i >= 0) arr.splice(i, 1); else arr.push(v);
          state.a[step.key] = arr; clearErr(); render();
        };
      });
    }
    if (step.type === 'file') {
      var fi = document.getElementById('f');
      var drop = app.querySelector('.drop');
      fi.addEventListener('change', function () { addFiles(step.key, fi.files); render(); });
      ['dragenter', 'dragover'].forEach(function (ev) { drop.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.add('drag'); }); });
      ['dragleave', 'drop'].forEach(function (ev) { drop.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.remove('drag'); }); });
      drop.addEventListener('drop', function (e) { e.preventDefault(); if (e.dataTransfer && e.dataTransfer.files) { addFiles(step.key, e.dataTransfer.files); render(); } });
    }
  }

  function submitTicket() {
    var btn = document.getElementById('submit');
    var serr = document.getElementById('serr');
    if (serr) serr.textContent = '';
    btn.disabled = true; btn.textContent = 'Enviando…';
    state.protocol = state.protocol || genProtocol();
    fetch(API_BASE + '/api/chamado', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ answers: state.a, protocol: state.protocol }) })
      .then(function (r) { return r.json().catch(function () { return { ok: false, error: 'Resposta inválida do servidor.' }; }); })
      .then(function (res) {
        if (res && res.ok) { state.itemId = res.itemId || null; state.screen = 'success'; render(); }
        else { failSubmit((res && res.error) || 'Não foi possível registrar o chamado.'); }
      })
      .catch(function () { failSubmit('Falha de conexão. Verifique a internet e tente novamente.'); });
  }
  function failSubmit(msg) {
    var btn = document.getElementById('submit'), serr = document.getElementById('serr');
    if (serr) serr.textContent = msg;
    if (btn) { btn.disabled = false; btn.innerHTML = 'Tentar novamente ' + ICONS.arrow; }
  }

  function resetAll() {
    state.screen = 'welcome'; state.idx = 0; state.a = {}; state.protocol = ''; state.itemId = null;
    state.historyEmail = ''; state.historyLoading = false; state.historyError = ''; state.historyData = null;
    render();
  }
  function inProgress() { return (state.screen === 'form' || state.screen === 'review') && Object.keys(state.a).length > 0; }
  function guarded(action) {
    return function () {
      if (inProgress() && !window.confirm('Você tem um chamado em preenchimento. Deseja sair e descartar as informações?')) return;
      action();
    };
  }

  /* -------------------- Init -------------------- */
  var logo = document.getElementById('logo');
  if (logo) logo.onclick = guarded(resetAll);
  var histBtn = document.getElementById('history-btn');
  if (histBtn) histBtn.onclick = guarded(function () {
    state.screen = 'history'; state.historyEmail = ''; state.historyLoading = false; state.historyError = ''; state.historyData = null; render();
  });
  render();
})();
