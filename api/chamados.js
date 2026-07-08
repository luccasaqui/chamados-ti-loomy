// GET /api/chamados?email=... — histórico de chamados de um e-mail no Monday.com
// O token fica em process.env.MONDAY_TOKEN (variável de ambiente da Vercel).

const MONDAY_API = 'https://api.monday.com/v2';
const BOARD_ID = 9595494020;

const ALLOWED = [
  'https://luccasaqui.github.io',
  'https://chamados-ti-loomy.vercel.app',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
];

const COL = { category: 'single_selectma83sy3', email: 'emailn6m8hl1c', status: 'status', desc: 'text_mkswjt1a' };

function setCors(req, res) {
  const o = req.headers.origin;
  if (ALLOWED.indexOf(o) >= 0) res.setHeader('Access-Control-Allow-Origin', o);
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
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

module.exports = async function handler(req, res) {
  setCors(req, res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET') return res.status(405).json({ ok: false, error: 'Método não suportado.' });

  const token = process.env.MONDAY_TOKEN;
  if (!token) return res.status(503).json({ ok: false, error: 'Integração não configurada (MONDAY_TOKEN ausente na Vercel).' });

  const email = String((req.query && req.query.email) || '').trim();
  if (!email) return res.status(400).json({ ok: false, error: 'E-mail não informado.' });

  try {
    // Busca por e-mail em TODO o board (qualquer grupo, status ao vivo) — resiliente
    // a mudanças de grupo/status e ao crescimento do board.
    const q = 'query ($board: ID!, $cols: [ItemsPageByColumnValuesQuery!]) {' +
      ' items_page_by_column_values(board_id: $board, limit: 100, columns: $cols) {' +
      ' items { id name created_at' +
      ' column_values(ids: ["' + COL.email + '","' + COL.category + '","' + COL.status + '","' + COL.desc + '"]) { id text }' +
      ' updates { id text_body created_at creator { name } } } } }';
    const data = await monday(token, q, { board: String(BOARD_ID), cols: [{ column_id: COL.email, column_values: [email] }] });
    const items = (data && data.items_page_by_column_values && data.items_page_by_column_values.items) || [];
    const norm = function (s) { return String(s || '').trim().toLowerCase(); };
    const target = norm(email);

    const sent = items.filter(function (it) {
      const c = it.column_values.find(function (x) { return x.id === COL.email; });
      return norm(c && c.text) === target;
    }).map(function (it) {
      const get = function (id) { const c = it.column_values.find(function (x) { return x.id === id; }); return (c && c.text) || ''; };
      // Respostas da equipe = updates, exceto o update automático de detalhes (começa com "Protocolo:")
      const replies = (it.updates || [])
        .filter(function (u) { return !/^\s*Protocolo:/.test(u.text_body || ''); })
        .map(function (u) { return { body: u.text_body || '', created_at: u.created_at, author: (u.creator && u.creator.name) || 'Equipe T.I.' }; })
        .sort(function (a, b) { return String(a.created_at).localeCompare(String(b.created_at)); });
      return {
        id: it.id,
        name: it.name,
        created_at: it.created_at,
        category: get(COL.category),
        status: get(COL.status) || 'Em Análise',
        description: get(COL.desc),
        replies: replies,
      };
    });
    sent.sort(function (a, b) { return String(b.created_at).localeCompare(String(a.created_at)); });

    return res.status(200).json({ ok: true, email: email, count: sent.length, sent: sent });
  } catch (e) {
    return res.status(502).json({ ok: false, error: 'Falha ao consultar o Monday.', detail: String((e && e.message) || e) });
  }
};
