/* ==========================================================================
   Loomy · Chamados T.I.
   Formulário passo-a-passo (adaptado do formulário do Monday / WorkForms)
   + malha de pontos interativa portada do protótipo React para JS puro.
   ========================================================================== */
(function () {
  'use strict';

  /* ======================================================================
     1) FUNDO INTERATIVO — malha de pontos com "erupção" no cursor
     ====================================================================== */
  (function initMesh() {
    const canvas = document.getElementById('mesh');
    const glow = document.getElementById('glow');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const spacing = 40;
    const baseRadius = 1.2;
    const maxInfluence = 300;
    let mouse = { x: -1000, y: -1000 };
    let raf;

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resize);
    resize();

    window.addEventListener('mousemove', function (e) {
      mouse = { x: e.clientX, y: e.clientY };
      glow.style.background =
        'radial-gradient(800px circle at ' + e.clientX + 'px ' + e.clientY +
        'px, rgba(166,254,31,0.05), transparent 50%)';
    });
    window.addEventListener('mouseleave', function () {
      mouse = { x: -1000, y: -1000 };
      glow.style.background = 'transparent';
    });

    function render() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const mx = mouse.x, my = mouse.y;
      for (let x = 0; x < canvas.width; x += spacing) {
        for (let y = 0; y < canvas.height; y += spacing) {
          const dx = mx - x, dy = my - y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          let drawX = x, drawY = y, radius = baseRadius, alpha = 0.1, color = '255,255,255';
          if (dist < maxInfluence) {
            const inf = 1 - dist / maxInfluence;
            radius = baseRadius + inf * 4;
            const push = inf * 12;
            drawX = x - (dx / dist) * push;
            drawY = y - (dy / dist) * push;
            alpha = 0.1 + inf * 0.9;
            color = '166,254,31';
          }
          ctx.beginPath();
          ctx.arc(drawX, drawY, radius, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(' + color + ',' + alpha + ')';
          ctx.fill();
        }
      }
      raf = requestAnimationFrame(render);
    }
    render();
    window.addEventListener('beforeunload', function () { cancelAnimationFrame(raf); });
  })();

  /* ======================================================================
     2) ÍCONES (SVG inline, estilo traço)
     ====================================================================== */
  const S = 'fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"';
  const ICONS = {
    arrow: '<svg viewBox="0 0 24 24" ' + S + '><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>',
    check: '<svg viewBox="0 0 24 24" ' + S + '><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
    chevron: '<svg viewBox="0 0 24 24" ' + S + '><polyline points="9 18 15 12 9 6"/></svg>',
    clip: '<svg viewBox="0 0 24 24" ' + S + '><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>',
    zap: '<svg viewBox="0 0 24 24" ' + S + '><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>',
    key: '<svg viewBox="0 0 24 24" ' + S + '><circle cx="7.5" cy="15.5" r="5.5"/><path d="M11.5 11.5 21 2"/><path d="m15.5 7.5 3 3L22 7l-3-3"/></svg>',
    cpu: '<svg viewBox="0 0 24 24" ' + S + '><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/></svg>',
    bot: '<svg viewBox="0 0 24 24" ' + S + '><rect x="3" y="8" width="18" height="12" rx="3"/><path d="M12 8V4"/><circle cx="12" cy="3" r="1.4"/><circle cx="9" cy="14" r="1.3" fill="currentColor" stroke="none"/><circle cx="15" cy="14" r="1.3" fill="currentColor" stroke="none"/></svg>',
    help: '<svg viewBox="0 0 24 24" ' + S + '><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
    more: '<svg viewBox="0 0 24 24" ' + S + '><circle cx="12" cy="12" r="1.6"/><circle cx="19" cy="12" r="1.6"/><circle cx="5" cy="12" r="1.6"/></svg>',
    mail: '<svg viewBox="0 0 24 24" ' + S + '><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 6L2 7"/></svg>',
    clock: '<svg viewBox="0 0 24 24" ' + S + '><circle cx="12" cy="12" r="10"/><polyline points="12 7 12 12 15 14"/></svg>',
    send: '<svg viewBox="0 0 24 24" ' + S + '><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>',
    inbox: '<svg viewBox="0 0 24 24" ' + S + '><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg>'
  };

  /* ======================================================================
     3) DADOS DO FORMULÁRIO (espelham o formulário do Monday)
     ====================================================================== */
  const CATEGORIES = [
    { id: 'automacao',    label: 'Automação / Processos', desc: 'Novos fluxos e otimizações',        icon: 'zap' },
    { id: 'acessos',      label: 'Acessos / Contas',      desc: 'IXC, Monday, Opa Suíte e outros',    icon: 'key' },
    { id: 'equipamentos', label: 'Equipamentos',          desc: 'Configuração e periféricos',         icon: 'cpu' },
    { id: 'ia',           label: 'IA Aplicada',           desc: 'Agentes de voz / chat — apontamentos', icon: 'bot' },
    { id: 'duvidas',      label: 'Dúvidas / Opinião',     desc: 'Observações e sugestões',            icon: 'help' },
    { id: 'outro',        label: 'Outro...',              desc: 'Não se encaixa nas opções',          icon: 'more' }
  ];

  // Perguntas condicionais por categoria (mesma lógica do WorkForms)
  function stepsFor(cat) {
    switch (cat) {
      case 'automacao': return [
        { key: 'proc_desc', type: 'textarea', label: 'Explique detalhadamente o processo / fluxo para melhor abordagem da automação.', hint: 'Fique à vontade com a quantidade de palavras.', required: true },
        { key: 'proc_files', type: 'file', label: 'Anexe prints e detalhes do processo / fluxo.', hint: 'Envie um print por etapa, ou diagramas/fluxogramas do Miro 😃', required: true }
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
        { key: 'ia_contato', type: 'tel', label: 'Contato do cliente atendido pela IA:', required: false, placeholder: '(00) 00000-0000' },
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

  const BASE_KEYS = ['nome', 'email', 'categoria'];

  function buildSteps(a) {
    const base = [
      { key: 'nome', type: 'text', label: 'Qual é o seu nome?', required: true, placeholder: 'Nome completo', phase: 'Identificação' },
      { key: 'email', type: 'email', label: 'Qual é o seu e-mail?', required: true, placeholder: 'nome@loomy.com.br', phase: 'Identificação' },
      { key: 'categoria', type: 'category', label: 'Como podemos ajudar?', required: true, phase: 'Categoria' }
    ];
    const extra = stepsFor(a.categoria).map(function (s) {
      const c = Object.assign({}, s); c.phase = 'Detalhes'; return c;
    });
    return base.concat(extra).filter(function (s) { return !s.showIf || s.showIf(a); });
  }

  const PHASES = ['Identificação', 'Categoria', 'Detalhes', 'Revisão'];

  /* ======================================================================
     4) ESTADO + UTILITÁRIOS
     ====================================================================== */
  const app = document.getElementById('app');
  const state = { screen: 'welcome', idx: 0, a: {}, protocol: '', historyEmail: '' };

  function activeSteps() { return buildSteps(state.a); }
  function isEmpty(v) { return v === undefined || v === null || v === '' || (Array.isArray(v) && v.length === 0); }
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  function clearCategoryAnswers() {
    Object.keys(state.a).forEach(function (k) { if (BASE_KEYS.indexOf(k) < 0) delete state.a[k]; });
  }
  function validate(step) {
    const v = state.a[step.key];
    if (step.required && isEmpty(v)) return 'Este campo é obrigatório.';
    if (step.type === 'email' && v && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return 'Informe um e-mail válido.';
    return null;
  }
  function genProtocol() {
    const d = new Date();
    const p = function (n) { return String(n).padStart(2, '0'); };
    const stamp = '' + d.getFullYear() + p(d.getMonth() + 1) + p(d.getDate());
    const rand = Math.floor(1000 + Math.random() * 9000);
    return 'TI-' + stamp + '-' + rand;
  }

  /* ======================================================================
     5) RENDER
     ====================================================================== */
  function progressHTML(active) {
    return '<div class="progress">' + PHASES.map(function (p, i) {
      const on = PHASES.indexOf(active) >= i ? ' on' : '';
      const chev = i < PHASES.length - 1 ? '<span class="chev">' + ICONS.chevron + '</span>' : '';
      return '<span class="' + on.trim() + '">' + p + '</span>' + chev;
    }).join('') + '</div>';
  }

  function filesListHTML(key) {
    const arr = state.a[key];
    if (!Array.isArray(arr) || !arr.length) return '';
    return arr.map(function (n) { return '<li>' + esc(n) + '</li>'; }).join('');
  }

  function fieldHTML(step) {
    const req = step.required ? ' <span class="req">*</span>' : '';
    const hint = step.hint ? '<p class="hint">' + esc(step.hint) + '</p>' : '';
    const val = state.a[step.key];

    if (step.type === 'text' || step.type === 'email' || step.type === 'tel') {
      const t = step.type === 'email' ? 'email' : (step.type === 'tel' ? 'tel' : 'text');
      return '<div class="field anim-up"><label for="f">' + esc(step.label) + req + '</label>' +
        '<input id="f" type="' + t + '" autocomplete="off" placeholder="' + esc(step.placeholder || '') + '" value="' + esc(val || '') + '" />' +
        hint + '<p class="err" id="err"></p></div>';
    }
    if (step.type === 'textarea') {
      return '<div class="field anim-up"><label for="f">' + esc(step.label) + req + '</label>' +
        '<textarea id="f" rows="5" placeholder="Escreva aqui...">' + esc(val || '') + '</textarea>' +
        hint + '<p class="err" id="err"></p></div>';
    }
    if (step.type === 'category') {
      return '<div class="field"><span class="q">' + esc(step.label) + req + '</span>' +
        '<p class="q-sub">Selecione a opção que melhor descreve a sua solicitação.</p>' +
        '<div class="cat-grid">' + CATEGORIES.map(function (c) {
          const sel = state.a.categoria === c.id ? ' sel' : '';
          return '<button type="button" class="cat' + sel + '" data-cat="' + c.id + '">' +
            '<span class="cat-ic">' + ICONS[c.icon] + '</span>' +
            '<span class="cat-label">' + esc(c.label) + '</span>' +
            '<span class="cat-desc">' + esc(c.desc) + '</span></button>';
        }).join('') + '</div><p class="err" id="err"></p></div>';
    }
    if (step.type === 'select') {
      return '<div class="field"><span class="q">' + esc(step.label) + req + '</span>' +
        '<div class="chips">' + step.options.map(function (o) {
          const sel = state.a[step.key] === o ? ' sel' : '';
          return '<button type="button" class="chip' + sel + '" data-val="' + esc(o) + '">' + esc(o) + '</button>';
        }).join('') + '</div>' + hint + '<p class="err" id="err"></p></div>';
    }
    if (step.type === 'multiselect') {
      const cur = Array.isArray(val) ? val : [];
      return '<div class="field"><span class="q">' + esc(step.label) + req + '</span>' +
        '<div class="chips">' + step.options.map(function (o) {
          const sel = cur.indexOf(o) >= 0 ? ' sel' : '';
          return '<button type="button" class="chip' + sel + '" data-val="' + esc(o) + '">' + esc(o) + '</button>';
        }).join('') + '</div>' + hint + '<p class="err" id="err"></p></div>';
    }
    if (step.type === 'file') {
      return '<div class="field anim-up"><span class="q">' + esc(step.label) + req + '</span>' +
        '<label class="drop" for="f"><span class="drop-ic">' + ICONS.clip + '</span>' +
        '<span class="drop-main">Clique para anexar</span>' +
        '<span class="drop-sub">ou arraste os arquivos aqui</span></label>' +
        '<input id="f" type="file" multiple hidden />' +
        '<ul class="files" id="files">' + filesListHTML(step.key) + '</ul>' +
        hint + '<p class="err" id="err"></p></div>';
    }
    return '';
  }

  function renderWelcome() {
    app.innerHTML =
      '<section class="hero anim-zoom">' +
      '<div class="hero-badge">Suporte · Apontamentos · Melhorias</div>' +
      '<h1>Portal de Chamados de T.I. na <span class="g">Loomy</span></h1>' +
      '<p class="hero-sub">Abra um chamado de Suporte de T.I., Acessos &amp; Contas, Equipamentos, Automação de Processos ou IA Aplicada.</p>' +
      '<ul class="rules">' +
      '<li>Nenhuma tratativa é feita até o chamado ser aberto.</li>' +
      '<li>Fora da regional SP, o SLA pode ser estendido (acesso remoto).</li>' +
      '<li>Abra um chamado por vez, conforme o tipo de solicitação.</li>' +
      '<li>Descreva com o máximo de detalhes e anexe evidências.</li>' +
      '<li>O retorno é feito via Teams ou WhatsApp.</li>' +
      '</ul>' +
      '<button class="btn btn-primary btn-lg" id="start">Começar agora ' + ICONS.arrow + '</button>' +
      '</section>';
    document.getElementById('start').onclick = function () { state.screen = 'form'; state.idx = 0; render(); };
  }

  function renderForm() {
    const steps = activeSteps();
    if (state.idx >= steps.length) { state.screen = 'review'; return render(); }
    if (state.idx < 0) state.idx = 0;
    const step = steps[state.idx];
    const last = state.idx === steps.length - 1;

    app.innerHTML =
      '<section class="card anim-up">' + progressHTML(step.phase) +
      '<form id="stepform" novalidate>' + fieldHTML(step) +
      '<div class="nav">' +
      '<button type="button" class="btn btn-ghost" id="back"' + (state.idx === 0 ? ' style="visibility:hidden"' : '') + '>Voltar</button>' +
      '<button type="submit" class="btn ' + (last ? 'btn-primary' : 'btn-light') + '">' + (last ? 'Revisar' : 'Próximo') + ' ' + ICONS.arrow + '</button>' +
      '</div></form></section>';

    bindStep(step, steps);
  }

  function summaryRows() {
    const steps = activeSteps();
    return steps.map(function (s) {
      let label = s.label, v = state.a[s.key];
      if (s.type === 'category') {
        const c = CATEGORIES.find(function (x) { return x.id === state.a.categoria; });
        v = c ? c.label : ''; label = 'Como podemos ajudar?';
      } else if (s.type === 'file') {
        v = (Array.isArray(v) && v.length) ? v.join(', ') : '';
      } else if (Array.isArray(v)) {
        v = v.join(', ');
      }
      if (isEmpty(v)) v = '—';
      return '<div class="review-row"><span class="k">' + esc(label) + '</span><span class="v">' + esc(v) + '</span></div>';
    }).join('');
  }

  function renderReview() {
    app.innerHTML =
      '<section class="card anim-up">' + progressHTML('Revisão') +
      '<h2 class="review-title">Revise o seu chamado</h2>' +
      '<p class="review-sub">Confira as informações antes de enviar.</p>' +
      '<div class="review">' + summaryRows() + '</div>' +
      '<div class="nav">' +
      '<button type="button" class="btn btn-ghost" id="back">Voltar</button>' +
      '<button type="button" class="btn btn-primary" id="submit">Enviar solicitação ' + ICONS.arrow + '</button>' +
      '</div></section>';

    document.getElementById('back').onclick = function () {
      state.screen = 'form'; state.idx = activeSteps().length - 1; render();
    };
    document.getElementById('submit').onclick = function () {
      const btn = this;
      btn.disabled = true; btn.textContent = 'Enviando...';
      // Envio simulado (front-end). Ver README para integração real com o Monday.
      setTimeout(function () { state.protocol = genProtocol(); state.screen = 'success'; render(); }, 1200);
    };
  }

  function renderSuccess() {
    app.innerHTML =
      '<section class="card success anim-zoom">' +
      '<div class="check">' + ICONS.check + '</div>' +
      '<h2>Recebemos o seu chamado!</h2>' +
      '<p class="protocol">Protocolo <strong>' + esc(state.protocol) + '</strong></p>' +
      '<p class="success-sub">Enviaremos as atualizações para <strong>' + esc(state.a.email || '') + '</strong>. O retorno também pode vir via Teams ou WhatsApp.</p>' +
      '<button class="btn btn-light" id="again">Abrir novo chamado</button>' +
      '<p class="demo-note">Ambiente de demonstração — a integração de envio com o Monday está em configuração.</p>' +
      '</section>';
    document.getElementById('again').onclick = resetAll;
  }

  function renderHistory() {
    // Etapa 1: pedir o e-mail
    if (!state.historyEmail) {
      app.innerHTML =
        '<section class="card anim-up">' +
        '<h2 class="card-title">Meus chamados</h2>' +
        '<p class="card-sub">Consulte o histórico de chamados que você abriu e as respostas recebidas da equipe de T.I., usando o e-mail informado na abertura.</p>' +
        '<form id="histform" novalidate>' +
        '<div class="field"><label for="hf">Seu e-mail</label>' +
        '<input id="hf" type="email" autocomplete="email" placeholder="nome@loomy.com.br" value="' + esc(state.historyEmail || '') + '" />' +
        '<p class="err" id="err"></p></div>' +
        '<div class="nav">' +
        '<button type="button" class="btn btn-ghost" id="back">Voltar</button>' +
        '<button type="submit" class="btn btn-primary">Buscar histórico ' + ICONS.arrow + '</button>' +
        '</div></form></section>';
      const inp = document.getElementById('hf');
      document.getElementById('back').onclick = resetAll;
      inp.addEventListener('input', function () { const e = document.getElementById('err'); if (e) e.textContent = ''; });
      document.getElementById('histform').onsubmit = function (e) {
        e.preventDefault();
        const v = inp.value.trim();
        if (!v || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) {
          document.getElementById('err').textContent = 'Informe um e-mail válido.';
          return;
        }
        state.historyEmail = v; render();
      };
      setTimeout(function () { inp.focus(); }, 40);
      return;
    }
    // Etapa 2: resultado — a consulta real ao Monday depende da integração (ver README)
    app.innerHTML =
      '<section class="card anim-up">' +
      '<h2 class="card-title">Meus chamados</h2>' +
      '<p class="card-sub">Histórico de <span class="hist-email">' + esc(state.historyEmail) + '</span></p>' +
      '<div class="notice"><span class="notice-ic">' + ICONS.clock + '</span>' +
      '<span>A consulta em tempo real ao Monday será ativada junto com a integração de envio. ' +
      'Assim que o back-end estiver conectado, esta tela listará automaticamente, para o e-mail informado:</span></div>' +
      '<div class="hist-cols">' +
      '<div class="hist-col"><h3><span class="hcol-ic">' + ICONS.send + '</span> Enviados</h3>' +
      '<p>Chamados que você abriu, com o status atual (Em análise, Em progresso, Feito, Parado).</p></div>' +
      '<div class="hist-col"><h3><span class="hcol-ic">' + ICONS.inbox + '</span> Respondidos</h3>' +
      '<p>Atualizações e respostas da equipe de T.I. registradas em cada chamado.</p></div>' +
      '</div>' +
      '<div class="nav">' +
      '<button type="button" class="btn btn-ghost" id="back">Trocar e-mail</button>' +
      '<button type="button" class="btn btn-light" id="new">Abrir novo chamado ' + ICONS.arrow + '</button>' +
      '</div></section>';
    document.getElementById('back').onclick = function () { state.historyEmail = ''; render(); };
    document.getElementById('new').onclick = resetAll;
  }

  function render() {
    const y = document.getElementById('year'); if (y) y.textContent = new Date().getFullYear();
    if (state.screen === 'welcome') return renderWelcome();
    if (state.screen === 'history') return renderHistory();
    if (state.screen === 'success') return renderSuccess();
    if (state.screen === 'review') return renderReview();
    return renderForm();
  }

  /* ======================================================================
     6) NAVEGAÇÃO / EVENTOS
     ====================================================================== */
  function showErr(msg) {
    const e = document.getElementById('err');
    if (e) { e.textContent = msg; }
    const card = app.querySelector('.card') || app.firstElementChild;
    if (card) { card.classList.remove('shake'); void card.offsetWidth; card.classList.add('shake'); }
  }
  function clearErr() { const e = document.getElementById('err'); if (e) e.textContent = ''; }

  function goNext(steps) {
    const step = steps[state.idx];
    const err = validate(step);
    if (err) { showErr(err); return; }
    state.idx++;
    const next = activeSteps();
    if (state.idx >= next.length) state.screen = 'review';
    render();
  }

  function addFiles(key, fileList) {
    const arr = Array.isArray(state.a[key]) ? state.a[key].slice() : [];
    for (let i = 0; i < fileList.length; i++) {
      if (arr.indexOf(fileList[i].name) < 0) arr.push(fileList[i].name);
    }
    state.a[key] = arr;
  }

  function bindStep(step, steps) {
    const form = document.getElementById('stepform');
    const back = document.getElementById('back');
    if (back) back.onclick = function () { state.idx = Math.max(0, state.idx - 1); render(); };
    form.onsubmit = function (e) { e.preventDefault(); goNext(steps); };

    if (step.type === 'text' || step.type === 'email' || step.type === 'tel' || step.type === 'textarea') {
      const inp = document.getElementById('f');
      inp.addEventListener('input', function () { state.a[step.key] = inp.value; clearErr(); });
      if (step.type !== 'textarea') {
        inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); goNext(steps); } });
      }
      setTimeout(function () { inp.focus(); }, 40);
    }

    if (step.type === 'category') {
      app.querySelectorAll('[data-cat]').forEach(function (b) {
        b.onclick = function () {
          const prev = state.a.categoria;
          if (prev !== b.dataset.cat) { state.a.categoria = b.dataset.cat; clearCategoryAnswers(); state.a.categoria = b.dataset.cat; }
          clearErr(); render();
        };
      });
    }

    if (step.type === 'select') {
      app.querySelectorAll('.chip[data-val]').forEach(function (b) {
        b.onclick = function () { state.a[step.key] = b.dataset.val; clearErr(); render(); };
      });
    }

    if (step.type === 'multiselect') {
      app.querySelectorAll('.chip[data-val]').forEach(function (b) {
        b.onclick = function () {
          const arr = Array.isArray(state.a[step.key]) ? state.a[step.key].slice() : [];
          const v = b.dataset.val, i = arr.indexOf(v);
          if (i >= 0) arr.splice(i, 1); else arr.push(v);
          state.a[step.key] = arr; clearErr(); render();
        };
      });
    }

    if (step.type === 'file') {
      const inp = document.getElementById('f');
      const drop = app.querySelector('.drop');
      inp.addEventListener('change', function () { addFiles(step.key, inp.files); render(); });
      ['dragenter', 'dragover'].forEach(function (ev) {
        drop.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.add('drag'); });
      });
      ['dragleave', 'drop'].forEach(function (ev) {
        drop.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.remove('drag'); });
      });
      drop.addEventListener('drop', function (e) {
        e.preventDefault();
        if (e.dataTransfer && e.dataTransfer.files) { addFiles(step.key, e.dataTransfer.files); render(); }
      });
    }
  }

  function resetAll() {
    state.screen = 'welcome'; state.idx = 0; state.a = {}; state.protocol = ''; state.historyEmail = ''; render();
  }

  /* ======================================================================
     7) INICIALIZAÇÃO
     ====================================================================== */
  const logo = document.getElementById('logo');
  if (logo) logo.onclick = resetAll;
  const histBtn = document.getElementById('history-btn');
  if (histBtn) histBtn.onclick = function () { state.screen = 'history'; state.historyEmail = ''; render(); };
  render();
})();
