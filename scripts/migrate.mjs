// Aplica as migrations de supabase/migrations em ordem, uma única vez cada.
// Uso: DATABASE_URL="postgresql://..." npm run db:migrate
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import pg from "pg";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("Defina DATABASE_URL para rodar as migrations.");
  process.exit(1);
}

const dir = path.join(process.cwd(), "supabase", "migrations");
const client = new pg.Client({ connectionString: url, ssl: { rejectUnauthorized: false } });
await client.connect();

await client.query(`
  create schema if not exists app_private;
  create table if not exists app_private.schema_migrations (
    name text primary key,
    applied_at timestamptz not null default now()
  );
`);

const { rows } = await client.query("select name from app_private.schema_migrations");
const applied = new Set(rows.map((r) => r.name));
const files = (await readdir(dir)).filter((f) => f.endsWith(".sql")).sort();

for (const file of files) {
  if (applied.has(file)) continue;
  const sql = await readFile(path.join(dir, file), "utf8");
  console.log(`Aplicando ${file}...`);
  try {
    await client.query("begin");
    await client.query(sql);
    await client.query("insert into app_private.schema_migrations (name) values ($1)", [file]);
    await client.query("commit");
  } catch (err) {
    await client.query("rollback");
    console.error(`Falhou em ${file}:`, err.message);
    process.exit(1);
  }
}

console.log("Migrations em dia.");
await client.end();
