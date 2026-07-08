# Loomy · Chamados T.I.

Portal de abertura de chamados de T.I. da **Loomy Smart Solutions** — Suporte,
Acessos & Contas, Equipamentos, Automação de Processos e IA Aplicada.

O formulário reproduz a estrutura e a lógica condicional do formulário oficial
do Monday (WorkForms), com uma interface passo-a-passo, tema escuro e a malha de
pontos interativa da identidade Loomy (verde `#a6fe1f`, fonte Montserrat).

## ✨ Recursos

- Fluxo **uma pergunta por vez**, com barra de progresso.
- **6 categorias** com perguntas condicionais específicas:
  - Automação / Processos
  - Acessos / Contas (IXC, Monday, Opa Suíte e outros)
  - Equipamentos / Periféricos
  - IA Aplicada (agentes de voz / chat)
  - Dúvidas / Opinião
  - Outro
- Fundo animado (canvas) com "erupção" de pontos no cursor.
- Validação de campos obrigatórios, anexos e tela de revisão antes do envio.
- 100% estático — HTML, CSS e JavaScript puro, **sem etapa de build**.

## 📁 Estrutura

```
.
├── index.html          # marcação e containers
├── assets/
│   ├── styles.css      # identidade visual (dark + verde Loomy)
│   └── app.js          # fluxo do formulário + canvas interativo
├── .nojekyll           # desativa o Jekyll no GitHub Pages
└── README.md
```

## ▶️ Rodar localmente

Basta abrir o `index.html` no navegador, ou servir a pasta:

```bash
python -m http.server 5173
# abra http://localhost:5173
```

## 🚀 Publicação

Hospedado via **GitHub Pages** (branch `main`, raiz `/`).

## ⚠️ Status do envio

O envio é **simulado no front-end** — nenhum dado sai do navegador. Um site
estático público não pode armazenar com segurança o token da API do Monday.

Para gravar os chamados diretamente no board do Monday, é necessário um pequeno
back-end (ex.: **Cloudflare Worker** ou função serverless) que:

1. guarde o token da API do Monday como *secret*;
2. exponha um endpoint `POST /chamado`;
3. crie o item no board via a mutation `create_item` da API GraphQL do Monday.

O front-end então envia o formulário para esse endpoint em vez de simular.

---

Feito para a equipe de T.I. / Automação / IA da Loomy.
