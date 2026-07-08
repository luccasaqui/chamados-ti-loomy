# Loomy · Portal de Chamados de T.I.

Portal de abertura de chamados de T.I. da **Loomy Smart Solutions**
(SUPORTE · APONTAMENTOS · MELHORIAS).

O formulário reproduz a estrutura e a lógica condicional do formulário oficial
do Monday (WorkForms), com uma interface passo-a-passo, tema escuro e a malha de
pontos interativa da identidade Loomy (verde `#a6fe1f`, fonte Montserrat).

## ✨ Recursos

- Fluxo **uma pergunta por vez**, com barra de progresso.
- **6 categorias** (agrupadas em Suporte · Apontamentos · Melhorias) com
  perguntas condicionais idênticas às do WorkForms:
  - Automação / Processos
  - Acessos / Contas (IXC, Monday, Opa Suíte e outros)
  - Equipamentos / Periféricos
  - IA Aplicada (agentes de voz / chat)
  - Dúvidas / Opinião
  - Outro
- **Envio real** para o board do Monday (via back-end serverless).
- **"Meus chamados"**: consulta o histórico (enviados + respostas) por e-mail.
- Fundo animado (canvas), validação, revisão e proteção contra descarte acidental.
- Acessibilidade: contraste AA, foco de teclado (`:focus-visible`) e `aria-live`.

## 📁 Estrutura

```
.
├── index.html          # marcação e containers
├── assets/
│   ├── styles.css      # identidade visual (dark + verde Loomy)
│   └── app.js          # fluxo do formulário + canvas interativo
├── api/                # funções serverless (Vercel)
│   ├── chamado.js      # POST — cria o chamado no Monday
│   └── chamados.js     # GET  — histórico por e-mail
├── .nojekyll
└── README.md
```

## 🚀 Publicação e back-end (Vercel)

Hospedado na **Vercel** (site estático + funções `/api/*` no mesmo domínio →
sem CORS). O deploy é automático a cada push na branch `main`.

- Produção: `https://chamados-ti-loomy.vercel.app`
- `POST /api/chamado` → cria o item no board `9595494020` via `create_item`
  (mais um update com todos os detalhes).
- `GET /api/chamados?email=…` → lista os chamados daquele e-mail, com status e
  respostas da equipe.

### 🔐 Variável de ambiente (obrigatória)

O token da API do Monday **nunca** fica no repositório. Configure na Vercel:

```
Settings → Environment Variables
Name:  MONDAY_TOKEN
Value: <token da API do Monday>
```

Depois faça um *redeploy* para aplicar. Sem essa variável, as funções respondem
`503 (Integração não configurada)`.

## ▶️ Rodar localmente

```bash
python -m http.server 5173   # serve apenas o front-end estático
# abra http://localhost:5173
```

Localmente o front chama a API de produção na Vercel (CORS liberado para
`localhost:5173`).

---

Feito para a equipe de T.I. / Automação / IA da Loomy.
