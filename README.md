# Diário de Viagem

Blog de viagens pessoal: cada viagem é um diário com capítulos, textos e fotos, e tem seu próprio visual animado (floresta, montanha, praia, deserto ou cidade). Tudo é salvo automaticamente enquanto você escreve.

**Stack:** Next.js 15 · Supabase (Postgres, Auth, Storage) · Tiptap · Vercel

## Rodar localmente

```bash
npm install
cp .env.example .env.local
npm run dev
```

## Banco de dados

As migrations ficam em `supabase/migrations` e rodam em ordem, uma vez cada:

```bash
DATABASE_URL="postgresql://postgres.yaofnxygfcrmcyzrdegu:SENHA@aws-0-us-east-1.pooler.supabase.com:5432/postgres" npm run db:migrate
```

- `trips`: cada viagem (título, local, datas, capa, preset, publicada ou rascunho)
- `sections`: capítulos de cada viagem (título + conteúdo do editor em JSON)
- bucket `media`: imagens (leitura pública, envio só pelo admin)
- `app_private.blog_admins`: e-mails que podem editar

Leitura é pública para viagens publicadas; escrita só para os e-mails em `blog_admins` (RLS).

## Deploy

Todo push na `main` roda `.github/workflows/deploy.yml`: checa tipos, aplica migrations (se o secret `DATABASE_URL` existir) e publica no Vercel.

Configuração no GitHub:
- Secret `VERCEL_TOKEN` (obrigatório)
- Secret `DATABASE_URL` (opcional, para migrations automáticas)
- Variáveis `VERCEL_ORG_ID` e `VERCEL_PROJECT_ID`
