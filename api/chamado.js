// POST /api/chamado — cria um chamado no board do Monday.com
// O token fica em process.env.MONDAY_TOKEN (variável de ambiente da Vercel).

const MONDAY_API = 'https://api.monday.com/v2';
const BOARD_ID = 9595494020;
const GROUP_ID = 'topics';

const ALLOWED = [
  'https://luccasaqui.github.io',
  'https://chamados-ti-loomy.vercel.app',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
];

// IDs das colunas do board (ver estrutura do WorkForms)
const COL = {
  category: 'single_selectma83sy3',
  email: 'emailn6m8hl1c',
  desc: 'text_mkswjt1a',
  sistema: 'single_select9gv5az4',
  equip: 'multi_selectpe8okm6r',
  iaTipo: 'single_selectty19lkm',
  phone: 'phone9wrm9f06',
};

const CATEGORY = {
  automacao:    { index: 0, short: 'Automação',    label: 'Automação / Processos' },
  acessos:      { index: 1, short: 'Acessos',      label: 'Acessos / Contas' },
  equipamentos: { index: 2, short: 'Equipamentos', label: 'Equipamentos / Periféricos' },
  ia:           { index: 3, short: 'IA Aplicada',  label: 'IA Aplicada' },
  duvidas:      { index: 4, short: 'Dúvidas',      label: 'Dúvidas / Opinião' },
  outro:        { index: 6, short: 'Outro',        label: 'Outro' },
};

const SISTEMA_INDEX = { 'IXC': 0, 'Opa Suíte': 1, 'Monday': 2, 'Make Integromat': 3, 'Lovable': 4, 'Claude': 6, 'Office': 7, 'Teams': 8, 'VPN': 9, 'Ferramentas NOC': 10, 'Outro...': 11 };
const IA_TIPO_INDEX = { 'I.A. de voz (ligação | chamadas)': 0, 'I.A. de chat (WhatsApp)': 1, "I.A. de E-mail's": 2 };

const LABELS = {
  proc_desc: 'Processo / fluxo',
  sistema: 'Sistema',
  sistema_outro: 'Sistema (Outro)',
  acessos_desc: 'Problema / solicitação',
  equip_itens: 'Equipamentos',
  equip_outro: 'Equipamento (Outro)',
  equip_desc: 'Problema / solicitação',
  ia_tipo: 'Tipo de IA',
  ia_contato: 'Contato do cliente',
  ia_protocolo: 'Protocolo do atendimento',
  ia_apontamento: 'Apontamento',
  duvida_desc: 'Observação / sugestão',
  outro_desc: 'Descrição',
  proc_files: 'Anexos informados',
  acessos_files: 'Anexos informados',
  equip_files: 'Anexos informados',
  ia_files: 'Anexos informados',
};

function setCors(req, res) {
  const o = req.headers.origin;
  if (ALLOWED.indexOf(o) >= 0) res.setHeader('Access-Control-Allow-Origin', o);
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'content-type');
}

async function monday(token, query, variables) {
  const r = await fetch(MONDAY_API, {
    method: 'POST',
    headers: { 'Authorization': token, 'Content-Type': 'application/json', 'API-Version': '2024-10' },
    body: JSON.stringify({ query: query, variables: variables }),
  });
  const j = await r.json();
  if (j.errors || j.error_code) throw new Error(JSON.stringify(j.errors || j));
  return j.data;
}

function mainDescription(a) {
  return a.proc_desc || a.acessos_desc || a.equip_desc || a.ia_apontamento || a.duvida_desc || a.outro_desc || '';
}

function buildDetails(a, protocol) {
  const L = [];
  L.push('Protocolo: ' + (protocol || '-'));
  L.push('Nome: ' + (a.nome || '-'));
  L.push('E-mail: ' + (a.email || '-'));
  const cat = CATEGORY[a.categoria];
  L.push('Categoria: ' + (cat ? cat.label : (a.categoria || '-')));
  Object.keys(LABELS).forEach(function (k) {
    let v = a[k];
    if (v == null || v === '' || (Array.isArray(v) && v.length === 0)) return;
    if (Array.isArray(v)) v = v.join(', ');
    L.push(LABELS[k] + ': ' + v);
  });
  return L.join('\n');
}

function buildColumnValues(a) {
  const cv = {};
  const cat = CATEGORY[a.categoria];
  if (cat) cv[COL.category] = { index: cat.index };
  if (a.email) cv[COL.email] = { email: a.email, text: a.email };
  const d = mainDescription(a);
  if (d) cv[COL.desc] = String(d).slice(0, 500);
  if (a.categoria === 'acessos' && a.sistema != null && SISTEMA_INDEX[a.sistema] !== undefined) {
    cv[COL.sistema] = { index: SISTEMA_INDEX[a.sistema] };
  }
  if (a.categoria === 'equipamentos' && Array.isArray(a.equip_itens) && a.equip_itens.length) {
    cv[COL.equip] = { labels: a.equip_itens };
  }
  if (a.categoria === 'ia') {
    if (a.ia_tipo != null && IA_TIPO_INDEX[a.ia_tipo] !== undefined) cv[COL.iaTipo] = { index: IA_TIPO_INDEX[a.ia_tipo] };
    if (a.ia_contato) cv[COL.phone] = { phone: String(a.ia_contato).replace(/\D/g, ''), countryShortName: 'BR' };
  }
  return cv;
}

module.exports = async function handler(req, res) {
  setCors(req, res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Método não suportado.' });

  const token = process.env.MONDAY_TOKEN;
  if (!token) return res.status(503).json({ ok: false, error: 'Integração não configurada (MONDAY_TOKEN ausente na Vercel).' });

  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch (_) { body = {}; } }
  const a = (body && body.answers) ? body.answers : (body || {});
  const protocol = (body && body.protocol) || a.protocol || '';

  if (!a.email || !a.categoria) {
    return res.status(400).json({ ok: false, error: 'Campos obrigatórios ausentes (e-mail e categoria).' });
  }

  const cat = CATEGORY[a.categoria];
  const nome = String(a.nome || '').slice(0, 80) || 'Sem nome';
  const itemName = nome + ' · ' + (cat ? cat.short : 'Chamado');
  const mutation = 'mutation ($board: ID!, $group: String!, $name: String!, $cols: JSON!) {' +
    ' create_item(board_id: $board, group_id: $group, item_name: $name, column_values: $cols, create_labels_if_missing: false) { id } }';

  try {
    let itemId;
    try {
      const cv = buildColumnValues(a);
      const data = await monday(token, mutation, { board: String(BOARD_ID), group: GROUP_ID, name: itemName, cols: JSON.stringify(cv) });
      itemId = data.create_item.id;
    } catch (e1) {
      // Fallback mínimo: garante que o chamado é criado mesmo se algum column_value falhar
      const cvMin = a.email ? { [COL.email]: { email: a.email, text: a.email } } : {};
      const data = await monday(token, mutation, { board: String(BOARD_ID), group: GROUP_ID, name: itemName, cols: JSON.stringify(cvMin) });
      itemId = data.create_item.id;
    }
    // Registra todos os detalhes como um update do item (best-effort)
    try {
      await monday(token, 'mutation ($item: ID!, $body: String!) { create_update(item_id: $item, body: $body) { id } }',
        { item: String(itemId), body: buildDetails(a, protocol) });
    } catch (_) { /* update é opcional */ }

    return res.status(200).json({ ok: true, itemId: itemId });
  } catch (e) {
    return res.status(502).json({ ok: false, error: 'Falha ao registrar no Monday.', detail: String((e && e.message) || e) });
  }
};
