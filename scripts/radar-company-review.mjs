import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import os from 'node:os';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const output = path.join(root, 'data/radar-review.json');
const decisionsPath = path.join(root, 'data/radar-review-decisions.json');
const digest = value => crypto.createHash('sha256').update(value).digest('hex');
const clean = value => String(value).normalize('NFKC').replace(/\s+/g, '').toLowerCase();
const dateOK = value => typeof value === 'string' && Number.isFinite(Date.parse(value));
const safeText = value => typeof value === 'string' && value.length > 0 && value.length <= 600 && !/(?:1[3-9]\d{9}|[\w.+-]+@[\w.-]+\.[a-z]{2,}|(?:token|password|secret)\s*[:=])/i.test(value);
export function signalId(url) { return digest(url).slice(0, 24); }

function publicSignal(signal) {
  let url;
  try { url = new URL(signal.url); } catch { throw Error('invalid_public_signal_url'); }
  if (url.protocol !== 'https:' || url.hostname !== 'news.google.com' || !/^\/rss\/articles\/[A-Za-z0-9_-]+$/.test(url.pathname) || url.username || url.password || url.port || url.hash || [...url.searchParams].some(([key,value])=>key!=='oc' || !/^[0-9]{1,2}$/.test(value)) || [...url.searchParams].length>1) throw Error('invalid_public_signal_url');
  if (!safeText(signal.title) || !safeText(signal.source) || (signal.publishedAt !== null && !dateOK(signal.publishedAt))) throw Error('invalid_public_signal_fields');
  return { id:signalId(url.href), title:signal.title, source:signal.source, url:url.href, publishedAt:signal.publishedAt };
}

export function buildReview(snapshot, dataset, decisions = {}, previous = null) {
  if (snapshot?.slug !== 'kunming-it-radar' || snapshot.mode !== 'live' || !dateOK(snapshot.generatedAt) || !Array.isArray(snapshot.signals) || snapshot.signals.length > 36) throw Error('invalid_public_radar_snapshot');
  if (!Array.isArray(dataset?.companies)) throw Error('invalid_company_dataset');
  if (!decisions || Array.isArray(decisions) || typeof decisions !== 'object') throw Error('invalid_review_decisions');
  const companies = new Map(dataset.companies.map(c => [c.id, c]));
  for (const [id, d] of Object.entries(decisions)) {
    if (!/^[a-f0-9]{24}$/.test(id) || !['no_company_in_title', 'linked'].includes(d?.decision) || !dateOK(d.reviewedAt) || !Array.isArray(d.companyIds) || d.companyIds.some(x => !companies.has(x)) || (d.decision === 'linked' && !d.companyIds.length) || (d.decision === 'no_company_in_title' && d.companyIds.length)) throw Error('invalid_review_decision');
  }
  if (previous && (previous.version !== 1 || !Array.isArray(previous.items) || previous.items.length > 36 || !dateOK(previous.snapshotGeneratedAt))) throw Error('invalid_previous_review');
  if (previous && Date.parse(snapshot.generatedAt) < Date.parse(previous.snapshotGeneratedAt)) throw Error('stale_snapshot_refused');
  const items = new Map();
  // Unresolved titles survive snapshot rotation. Capacity blocks rather than discards.
  const oldItems = new Map();
  for (const item of previous?.items || []) {
    const safe = publicSignal(item);
    if (safe.id!==item.id || oldItems.has(safe.id) || !['needs_review','linked','no_company_in_title'].includes(item.status) || !dateOK(item.firstSeenAt) || !dateOK(item.lastSeenAt) || Date.parse(item.firstSeenAt)>Date.parse(item.lastSeenAt) || Date.parse(item.lastSeenAt)>Date.parse(snapshot.generatedAt) || !Array.isArray(item.matchedCompanyIds) || item.matchedCompanyIds.some(id=>!companies.has(id))) throw Error('invalid_previous_item');
    const retained = {...safe,firstSeenAt:item.firstSeenAt,lastSeenAt:item.lastSeenAt,status:item.status,matchedCompanyIds:[...item.matchedCompanyIds]};
    oldItems.set(item.id,retained);
    if (retained.status === 'needs_review' && !decisions[item.id]) items.set(item.id, retained);
  }
  for (const signal of snapshot.signals) {
    const safe = publicSignal(signal);
    const id = safe.id;
    const title = clean(signal.title.replace(/\s+-\s+[^-]+$/, ''));
    const matches = dataset.companies.filter(c => [c.name, ...(c.aliases || [])].some(n => typeof n === 'string' && clean(n).length >= 4 && title.includes(clean(n)))).map(c => c.id).sort();
    const d = decisions[id];
    const old = oldItems.get(id);
    items.set(id, { ...safe, firstSeenAt: old?.firstSeenAt || snapshot.generatedAt, lastSeenAt: snapshot.generatedAt, status: d ? (d.decision === 'linked' ? 'linked' : 'no_company_in_title') : 'needs_review', matchedCompanyIds: d?.decision === 'linked' ? [...d.companyIds].sort() : matches });
  }
  // Apply decisions to retained older items without reintroducing resolved history.
  const list = [...items.values()].sort((a,b) => a.id.localeCompare(b.id));
  if (list.length > 36) throw Error('review_queue_full_preserved: review unresolved titles before importing a new snapshot');
  return { version: 1, snapshotGeneratedAt: snapshot.generatedAt, datasetUpdatedAt: dataset.meta.updated_at, summary: { total: list.length, needsReview: list.filter(x => x.status === 'needs_review').length, linked: list.filter(x => x.status === 'linked').length, noCompanyInTitle: list.filter(x => x.status === 'no_company_in_title').length }, items: list };
}

export function run(argv = process.argv.slice(2)) {
  if (argv.length !== 2 || argv[0] !== '--snapshot') throw Error('usage: radar:review -- --snapshot PATH_TO_PUBLIC_RADAR_latest.json');
  const input = path.resolve(argv[1]);
  const approved = path.join(os.homedir(),'xin system','data','kunming-it-radar','latest.json');
  if (input !== approved || fs.realpathSync(input) !== input || fs.statSync(input).size > 1000000) throw Error('public_snapshot_path_required');
  const snapshot = JSON.parse(fs.readFileSync(input, 'utf8'));
  const dataset = JSON.parse(fs.readFileSync(path.join(root,'data/companies.json'),'utf8'));
  const decisions = JSON.parse(fs.readFileSync(decisionsPath,'utf8'));
  const previous = fs.existsSync(output) ? JSON.parse(fs.readFileSync(output,'utf8')) : null;
  const next = JSON.stringify(buildReview(snapshot,dataset,decisions,previous),null,2)+'\n';
  if (fs.existsSync(output) && fs.readFileSync(output,'utf8') === next) { console.log('Review queue unchanged; no writes.'); return; }
  fs.writeFileSync(output+'.tmp',next,{flag:'w'});
  fs.renameSync(output+'.tmp',output);
  console.log('Updated data/radar-review.json; no network or company dataset writes.');
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { run(); } catch (e) { console.error(e.message.startsWith('review_queue_full') ? e.message : 'Review import failed; previous queue preserved. '+(e.code || 'invalid_input')); process.exitCode=1; }
}
