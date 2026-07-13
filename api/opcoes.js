// GET /api/opcoes — opções (labels) ao vivo do Monday para os selects dinâmicos.
// Assim, adicionar/excluir opção no quadro reflete no portal sem mexer no código.

const MONDAY_API = 'https://api.monday.com/v2';
const BOARD_ID = 9595494020;

const ALLOWED = [
  'https://luccasaqui.github.io',
  'https://chamados-ti-loomy.vercel.app',
  'https://chamados.ti.loomy.srv.br',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
];

const COLS = {
  sistema: 'single_select9gv5az4',       // status
  equipamentos: 'multi_selectpe8okm6r',  // dropdown
  ia_tipo: 'single_selectty19lkm',        // status
};

// Labels-lixo/padrão do Monday que não devem aparecer no portal
const JUNK = ['', '...', 'nova opção'];

function setCors(req, res) {
  const o = req.headers.origin;
  if (ALLOWED.indexOf(o) >= 0) res.setHeader('Access-Control-Allow-Origin', o);
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'content-type');
}

async function monday(token, query) {
  const r = await fetch(MONDAY_API, {
    method: 'POST',
    headers: { 'Authorization': token, 'Content-Type': 'application/json', 'API-Version': '2024-10' },
    body: JSON.stringify({ query: query }),
  });
  const j = await r.json();
  if (j.errors || j.error_code) throw new Error(JSON.stringify(j.errors || j));
  return j.data;
}

function clean(names) {
  return names.filter(function (n) {
    const t = String(n == null ? '' : n).trim();
    return t && JUNK.indexOf(t.toLowerCase()) < 0;
  });
}

function parseLabels(settingsStr) {
  let s = {};
  try { s = JSON.parse(settingsStr || '{}'); } catch (_) { s = {}; }
  const labels = s.labels;
  if (Array.isArray(labels)) {
    // dropdown: [{ id, name }] (já na ordem de exibição)
    return clean(labels.map(function (l) { return l && l.name; }));
  }
  if (labels && typeof labels === 'object') {
    // status: { id: name }; ordena por labels_positions_v2 se houver, senão por id
    const pos = s.labels_positions_v2 || {};
    return clean(Object.keys(labels)
      .map(function (id) { return { name: labels[id], pos: (pos[id] != null ? Number(pos[id]) : Number(id)) }; })
      .sort(function (a, b) { return a.pos - b.pos; })
      .map(function (l) { return l.name; }));
  }
  return [];
}

module.exports = async function handler(req, res) {
  setCors(req, res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET') return res.status(405).json({ ok: false, error: 'Método não suportado.' });

  const token = process.env.MONDAY_TOKEN;
  if (!token) return res.status(503).json({ ok: false, error: 'Integração não configurada (MONDAY_TOKEN ausente na Vercel).' });

  try {
    const ids = [COLS.sistema, COLS.equipamentos, COLS.ia_tipo];
    const q = '{ boards(ids: ' + BOARD_ID + ') { columns(ids: ["' + ids.join('","') + '"]) { id type settings_str } } }';
    const data = await monday(token, q);
    const cols = (data && data.boards && data.boards[0] && data.boards[0].columns) || [];
    const byId = {};
    cols.forEach(function (c) { byId[c.id] = c; });

    const out = { ok: true };
    out.sistema = byId[COLS.sistema] ? parseLabels(byId[COLS.sistema].settings_str) : [];
    out.equipamentos = byId[COLS.equipamentos] ? parseLabels(byId[COLS.equipamentos].settings_str) : [];
    out.ia_tipo = byId[COLS.ia_tipo] ? parseLabels(byId[COLS.ia_tipo].settings_str) : [];

    // Cache curto na borda: reflete mudanças em até ~1min, sem bater no Monday a cada acesso.
    res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=60, stale-while-revalidate=120');
    return res.status(200).json(out);
  } catch (e) {
    return res.status(502).json({ ok: false, error: 'Falha ao consultar opções.', detail: String((e && e.message) || e) });
  }
};
