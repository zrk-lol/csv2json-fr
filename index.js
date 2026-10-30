#!/usr/bin/env node
// Convertit un CSV (virgule ou point-virgule, format Excel FR) en JSON propre.
// Made by Varhex by Ȥrk Team — https://varhex.com · MIT
import { readdirSync, statSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, relative, extname } from "node:path";
import { execFileSync } from "node:child_process";
const args = process.argv.slice(2);
const SKIP = /^(node_modules|\.git|dist|build|\.next|\.output|coverage|\.vercel)$/;
function* walk(dir = ".") { for (const n of readdirSync(dir)) { if (SKIP.test(n)) continue; const p = join(dir, n), s = statSync(p); if (s.isDirectory()) yield* walk(p); else yield { path: relative(".", p), size: s.size }; } }
const read = (p) => { try { return readFileSync(p, "utf8"); } catch { return ""; } };
const git = (...a) => { try { return execFileSync("git", a, { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim(); } catch { return ""; } };
const env = (p) => Object.fromEntries(read(p).split(/\r?\n/).map((l) => l.match(/^\s*(?:export\s+)?([A-Za-z_][\w.]*)\s*=\s*(.*)$/)).filter(Boolean).map((m) => [m[1], m[2]]));
const t = read(args[0] ?? ""); if (!t) { console.log("Usage : csv2json fichier.csv"); process.exit(1); }
const sep = (t.split("\n")[0].match(/;/g) ?? []).length > (t.split("\n")[0].match(/,/g) ?? []).length ? ";" : ",";
const rows = t.replace(/^﻿/, "").trim().split(/\r?\n/).map((l) => { const out = []; let cur = "", q = false; for (const ch of l) { if (ch === '"') q = !q; else if (ch === sep && !q) { out.push(cur); cur = ""; } else cur += ch; } out.push(cur); return out; });
const [head, ...data] = rows; const num = (v) => (/^-?\d+([.,]\d+)?$/.test(v) ? Number(v.replace(",", ".")) : v);
console.log(JSON.stringify(data.map((r) => Object.fromEntries(head.map((k, i) => [k.trim(), num((r[i] ?? "").trim())]))), null, 2));
