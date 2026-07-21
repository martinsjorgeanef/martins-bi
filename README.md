# Painel de Competitividade de Preços — Martins

Dashboard de BI para comparar os preços praticados pela Martins com os preços de
distribuidores concorrentes (ex: DPC), identificar oportunidades de negociação e
apoiar decisões de precificação mais rápidas.

## O que o painel mostra

Para cada produto (por EAN): descrição, preço Martins, preço de mercado (o menor
preço entre todos os concorrentes cadastrados para aquele EAN), o percentual de
diferença entre eles e um status:

| Status | Regra | Significado |
|---|---|---|
| 🟢 Competitivo | diferença ≥ limite (padrão 5%) | Martins é mais barato que o mercado com folga |
| 🟡 Negociação pontual | 0% ≤ diferença < limite | Martins ganha do mercado, mas por pouco — vale olhar |
| 🔴 Desvantagem | diferença < 0% | Martins está mais caro que o mercado |

A fórmula usada é `(Preço Mercado − Preço Martins) / Preço Mercado`. O limite de
5% pode ser ajustado a qualquer momento direto na tela (campo "Limite negociação").

## Stack

- **Next.js 14** (App Router) + **TypeScript**
- **Tailwind CSS** para estilo
- **Recharts** para os gráficos
- **Prisma + PostgreSQL** para persistência (upload de novas planilhas atualiza o banco permanentemente)
- **xlsx (SheetJS)** para leitura das planilhas no upload

## Como os dados entram no sistema

Tudo acontece pela própria tela do dashboard, no botão **"Enviar planilha"**:

1. **Preços Martins** — envie a planilha padrão `base_consulta_precos` (mesmo
   layout usado na modelagem: colunas `EAN_CONSUMO`/`EAN_MARTINS`, `DESPRD`,
   `DESCTGPRD`, `DESDIVFRN`, `PrecoUnit`). Cada envio atualiza os produtos
   existentes (por EAN) e cria os novos.
2. **Concorrente** — envie a planilha do distribuidor (mesmo layout do arquivo
   `kenviue_dpc`: colunas `EAN`, `Descrição`, `Valor final`) e informe o **nome
   do distribuidor** (ex: "DPC"). Um EAN só entra na comparação se já existir
   na base Martins.

Se o formato de algum distribuidor mudar no futuro, os parsers ficam em
`src/lib/parseMartins.ts` e `src/lib/parseCompetitor.ts` — é só ajustar os nomes
das colunas lidas.

---

## Opção sem instalar nada no computador (100% pela internet)

Se você não pode ou não quer instalar programas no seu computador, dá pra
publicar o projeto direto, sem rodar nenhum comando localmente:

1. **Crie uma conta gratuita no GitHub** em [github.com](https://github.com), se
   ainda não tiver.
2. Clique em **New repository**, dê um nome (ex: `martins-bi`) e clique em
   **Create repository** (deixe tudo com as opções padrão, sem marcar nada).
3. Na página do repositório recém-criado, clique no link **"uploading an
   existing file"**.
4. Abra a pasta `martins-bi` que você extraiu do zip, **selecione todos os
   arquivos e pastas dentro dela** (não a pasta em si, e não o .zip) e arraste
   para a área de upload do GitHub. Clique em **Commit changes**.
5. Crie um banco gratuito em [neon.tech](https://neon.tech) (crie a conta, crie
   um projeto) e copie a "Connection string" que ele te dá.
6. Acesse [vercel.com](https://vercel.com), entre com sua conta do GitHub,
   clique em **Add New → Project** e selecione o repositório que você acabou
   de subir.
7. Antes de clicar em Deploy, abra **Environment Variables** e adicione:
   `DATABASE_URL` = a connection string que você copiou do Neon.
8. Clique em **Deploy**. A Vercel instala tudo, cria as tabelas do banco
   automaticamente e publica o site — sem você precisar rodar nada no seu
   computador. Em 1-2 minutos você recebe uma URL `.vercel.app` funcionando.

Pronto — daqui pra frente, é só acessar essa URL pelo navegador (computador ou
celular) sempre que quiser usar o painel.

---

## 1. Rodar localmente

### Pré-requisitos

- [Node.js 18+](https://nodejs.org)
- Uma URL de banco Postgres. As opções mais simples e gratuitas para começar:
  - [Neon](https://neon.tech) (recomendado, tem plano free generoso)
  - [Vercel Postgres](https://vercel.com/storage/postgres)
  - [Supabase](https://supabase.com)

### Passo a passo

```bash
# 1. Instale as dependências
npm install

# 2. Copie o arquivo de variáveis de ambiente
cp .env.example .env

# 3. Edite o .env e cole sua URL do Postgres em DATABASE_URL
#    (No Neon: Dashboard do projeto > Connection string)

# 4. Crie as tabelas no banco a partir do schema do Prisma
npx prisma db push

# 5. Rode o projeto em modo desenvolvimento
npm run dev
```

Acesse `http://localhost:3000`. Envie primeiro a planilha da Martins e depois a
do concorrente pelo botão "Enviar planilha".

Para inspecionar o banco visualmente a qualquer momento:

```bash
npm run db:studio
```

---

## 2. Publicar no GitHub

```bash
git init
git add .
git commit -m "Painel de competitividade de preços - Martins"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/NOME_DO_REPOSITORIO.git
git push -u origin main
```

(Crie o repositório vazio antes em github.com/new — sem README, sem .gitignore,
para não conflitar com os arquivos deste projeto.)

---

## 3. Publicar na Vercel

### Passo a passo

1. Acesse [vercel.com](https://vercel.com) e faça login (pode usar sua conta do GitHub).
2. Clique em **Add New → Project**.
3. Selecione o repositório que você acabou de subir no GitHub.
4. Na tela de configuração do projeto, abra **Environment Variables** e adicione:
   - `DATABASE_URL` → a mesma URL do Postgres que você usou localmente (ou crie
     um banco novo só para produção).
5. Clique em **Deploy**. A Vercel vai rodar `npm install` e `npm run build`
   automaticamente (o `build` já está configurado para rodar `prisma generate`
   antes do build do Next.js).
6. Após o primeiro deploy, se ainda não rodou `prisma db push` apontando para
   esse banco, rode uma vez localmente:
   ```bash
   # com o DATABASE_URL de produção no seu .env
   npx prisma db push
   ```
   Isso cria as tabelas no banco de produção. (Só precisa ser feito uma vez.)
7. Pronto — acesse a URL `.vercel.app` gerada. Todo push para `main` no GitHub
   dispara um novo deploy automaticamente.

### Se quiser usar o Vercel Postgres em vez do Neon

Na aba **Storage** do seu projeto na Vercel, clique em **Create Database →
Postgres**. Ao conectar o banco ao projeto, a Vercel já injeta a
`DATABASE_URL` automaticamente nas variáveis de ambiente — não precisa colar
nada manualmente.

---

## Estrutura do projeto

```
martins-bi/
├── prisma/
│   └── schema.prisma        # Modelagem do banco (Product, CompetitorPrice, UploadLog, Settings)
├── src/
│   ├── app/
│   │   ├── page.tsx          # Página do dashboard
│   │   ├── layout.tsx        # Layout raiz + fontes
│   │   ├── globals.css
│   │   └── api/
│   │       ├── upload/       # Recebe e processa as planilhas
│   │       ├── products/     # Lista de produtos com filtros, paginação e cálculo de competitividade
│   │       ├── stats/        # KPIs e dados dos gráficos
│   │       └── settings/     # Limite (%) de negociação pontual
│   ├── components/           # Dashboard, tabela, gráficos, filtros, upload, badges
│   └── lib/
│       ├── prisma.ts
│       ├── parseMartins.ts   # Leitor da planilha Martins
│       ├── parseCompetitor.ts# Leitor da planilha de concorrente
│       ├── calculations.ts   # Fórmula de diferença % e status
│       └── types.ts
└── README.md
```

## Possíveis melhorias futuras

- **Histórico de preços**: hoje cada upload sobrescreve o preço atual do EAN.
  Dá para guardar um log de preços por data para gráficos de evolução/tendência.
- **Múltiplos concorrentes visíveis lado a lado** na tabela (não só o menor preço).
- **Exportar para Excel/PDF** a visão filtrada da tabela, para levar para reunião.
- **Autenticação** (ex: login simples) antes de liberar o upload/edição em produção.
- **Alertas automáticos** (e-mail/WhatsApp) quando um produto entra em "Desvantagem".
