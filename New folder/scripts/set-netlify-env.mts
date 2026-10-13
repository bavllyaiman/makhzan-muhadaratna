/**
 * Pushes .env.local variables to Netlify via the API, bypassing the CLI's
 * shell-quoting problems with values that contain `?`, `&`, `=` and `:`.
 *
 * The values are read from disk and sent over HTTPS. Nothing is printed.
 */

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const CONFIG = 'C:/Users/dell/AppData/Roaming/netlify/Config/config.json';
const ENV_FILE = resolve(process.cwd(), '.env.local');
const SITE_ID = process.argv[2];

const cfg = JSON.parse(readFileSync(CONFIG, 'utf8'));
const userKey = Object.keys(cfg.users)[0];
const token = cfg.users[userKey]?.auth?.token;
const accountSlug = process.argv[3] || 'bavllyaiman-2009';

if (!token) throw new Error('No Netlify auth token found in the CLI config.');
if (!SITE_ID) throw new Error('Usage: node set-env.mts <siteId>');

const vars = {};
for (const line of readFileSync(ENV_FILE, 'utf8').split(/\r?\n/)) {
  const m = /^([A-Z_0-9]+)=(.*)$/.exec(line.trim());
  if (m) vars[m[1]] = m[2].trim().replace(/^"|"$/g, '');
}

const payload = Object.entries(vars)
  // Only runtime-relevant server vars; build-time ones come from netlify.toml.
  .filter(([k]) =>
    ![
      'NEXT_PUBLIC_APP_NAME',
      'ARGON2_MEMORY_COST',
      'ARGON2_TIME_COST',
      'ARGON2_PARALLELISM',
      'SESSION_TTL_SECONDS',
      'RATE_LIMIT_LOGIN_PER_IP',
      'RATE_LIMIT_LOGIN_WINDOW_SECONDS',
      'RATE_LIMIT_API_PER_IP',
    ].includes(k),
  )
  .map(([key, value]) => ({
    key,
    value,
    context: 'production',
    scope: ['builds', 'functions', 'runtime', 'post-processing'],
  }));

// SITE-level endpoint. The account-level /env endpoint is gated behind a paid
// plan ("shared environment variables"), but per-site vars are free.
const res = await fetch(`https://api.netlify.com/api/v1/sites/${SITE_ID}/env`, {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(payload),
});

if (!res.ok) {
  console.error('HTTP', res.status, await res.text());
  process.exit(1);
}

const created = await res.json();
console.log(`Pushed ${created.length} variable(s):`);
for (const v of created) console.log(`  ${v.key} (${String(v.value).length} chars)`);