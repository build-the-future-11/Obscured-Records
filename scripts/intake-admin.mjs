import { spawnSync } from 'node:child_process';
// Local-only helper. Provider dashboard and an authorized operator manage live PII.
const [command, id, from, to] = process.argv.slice(2);
const states = { received: ['acknowledged', 'triage', 'closed'], acknowledged: ['triage', 'closed'], triage: ['assigned', 'closed'], assigned: ['closed'], closed: [] };
let sql;
if (command === 'list') sql = 'SELECT id, kind, title, status, consented_at FROM editorial_submissions ORDER BY consented_at DESC LIMIT 50';
else if (command === 'read' && /^[a-f0-9-]{36}$/.test(id || '')) sql = `SELECT * FROM editorial_submissions WHERE id = '${id}'`;
else if (command === 'transition' && /^[a-f0-9-]{36}$/.test(id || '') && states[from]?.includes(to)) sql = `UPDATE editorial_submissions SET status = '${to}' WHERE id = '${id}' AND status = '${from}' RETURNING id, status`;
else throw new Error('Use list, read <UUID>, or transition <UUID> <current-status> <next-status>. Local data only. Empty transition result means no state changed.');
const child = spawnSync(process.execPath, ['node_modules/wrangler/bin/wrangler.js', 'd1', 'execute', 'DB', '--config', 'dist/server/wrangler.json', '--local', '--persist-to', '.wrangler/state', '--command', sql, '--json'], { stdio: 'inherit' });
if (child.error) throw child.error;
process.exitCode = child.status ?? 1;
