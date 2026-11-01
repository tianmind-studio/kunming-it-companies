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
const reviewStatuses = new Set(['needs_review', 'linked', 'no_company_in_title', 'reviewed_not_added']);
const reasonCodes = new Set(['outside_scope', 'company_candidate', 'evidence_insufficient']);
const safeText = value => typeof value === 'string' && value.length > 0 && value.length <= 600 && !/(?:1[3-9]\d{9}|[\w.+-]+@[\w.-]+\.[a-z]{2,}|(?:token|password|secret)\s*[:=])/i.test(value);
export function signalId(url) { return digest(url).slice(0, 24); }

function publicSignal(signal) {
  let url;
  try { url = new URL(signal.url); } catch { throw Error('invalid_public_signal_url'); }
  if (url.protocol !== 'https:' || url.hostname !== 'news.google.com' || !/^\/rss\/articles\/[A-Za-z0-9_-]+$/.test(url.pathname) || url.username || url.password || url.port || url.hash || [...url.searchParams].some(([key,value])=>key!=='oc' || !/^[0-9]{1,2}$/.test(value)) || [...url.searchParams].length>1) throw Error('invalid_public_signal_url');
  if (!safeText(signal.title) || !safeText(signal.source) || (signal.publishedAt !== null && !dateOK(signal.publishedAt))) throw Error('invalid_public_signal_fields');
  return { id:signalId(url.href), title:signal.title, source:signal.source, url:url.href, publishedAt:signal.publishedAt };
}

function publicEvidenceUrl(value) {
  try {
    const url = new URL(value);
    return typeof value === 'string' && value.length <= 1600 && !/[\u0000-\u0020\u007f\\]/.test(value)
      && ['http:', 'https:'].includes(url.protocol) && !url.username && !url.password && !url.hash
      && ![...url.searchParams.keys()].some(key => /token|password|passwd|secret|cookie|session|credential|authorization|api.?key/i.test(key) || /^(auth|key)$/i.test(key))
      && url.hostname.includes('.') && !['localhost', '127.0.0.1', '0.0.0.0'].includes(url.hostname);
  } catch { return false; }
}

function validateDecisions(decisions, companies) {
  if (!decisions || Array.isArray(decisions) || typeof decisions !== 'object') throw Error('invalid_review_decisions');
  for (const [id, d] of Object.entries(decisions)) {
    if (!/^[a-f0-9]{24}$/.test(id) || !['no_company_in_title', 'linked', 'reviewed_not_added'].includes(d?.decision)
      || !dateOK(d.reviewedAt) || Date.parse(d.reviewedAt) > Date.now()
      || !Array.isArray(d.companyIds) || new Set(d.companyIds).size !== d.companyIds.length
      || d.companyIds.some(x => !companies.has(x))
      || (d.decision === 'linked' ? !d.companyIds.length : d.companyIds.length !== 0)) throw Error('invalid_review_decision');
    if (!safeText(d.title)) throw Error('invalid_review_title');
    if (!publicEvidenceUrl(d.sourceUrl) || signalId(d.sourceUrl) !== id) throw Error('invalid_review_source');
    if (d.reviewedTitles !== undefined && (!Array.isArray(d.reviewedTitles) || d.reviewedTitles.length < 1 || d.reviewedTitles.length > 5 || new Set(d.reviewedTitles).size !== d.reviewedTitles.length || !d.reviewedTitles.every(safeText))) throw Error('invalid_reviewed_titles');
    if (d.reason !== undefined && !safeText(d.reason)) throw Error('invalid_review_reason');
    if (d.evidenceUrls !== undefined && (!Array.isArray(d.evidenceUrls) || d.evidenceUrls.length > 6 || !d.evidenceUrls.every(publicEvidenceUrl))) throw Error('invalid_review_evidence');
    if (d.candidateNames !== undefined && (!Array.isArray(d.candidateNames) || d.candidateNames.length > 5 || !d.candidateNames.every(x => safeText(x) && x.length <= 100))) throw Error('invalid_review_candidate');
    if (d.decision === 'reviewed_not_added' && (!reasonCodes.has(d.reasonCode) || !safeText(d.reason)
      || !d.title || !d.sourceUrl || !d.evidenceUrls?.length
      || (d.reasonCode === 'company_candidate' && !d.candidateNames?.length))) throw Error('review_conclusion_requires_evidence');
  }
}

function decisionFor(decisions, item) {
  const decision = decisions[item.id];
  // A publisher may change a title behind a stable RSS URL. Review the changed
  // claim again rather than carrying an earlier conclusion onto different text.
  return decision && (decision.title === item.title || decision.reviewedTitles?.includes(item.title)) ? decision : null;
}

function reviewMetadata(decision) {
  if (!decision) return undefined;
  const metadata = { reviewedAt: decision.reviewedAt };
  for (const field of ['reasonCode', 'reason', 'evidenceUrls', 'candidateNames']) {
    if (decision[field] !== undefined) metadata[field] = decision[field];
  }
  return metadata;
}

export function reviewSummary(items) {
  return {
    total: items.length,
    needsReview: items.filter(x => x.status === 'needs_review').length,
    linked: items.filter(x => x.status === 'linked').length,
    noCompanyInTitle: items.filter(x => x.status === 'no_company_in_title').length,
    reviewedNotAdded: items.filter(x => x.status === 'reviewed_not_added').length
  };
}

export function buildReview(snapshot, dataset, decisions = {}, previous = null) {
  if (snapshot?.slug !== 'kunming-it-radar' || snapshot.mode !== 'live' || !dateOK(snapshot.generatedAt) || !Array.isArray(snapshot.signals) || snapshot.signals.length > 36) throw Error('invalid_public_radar_snapshot');
  if (!Array.isArray(dataset?.companies)) throw Error('invalid_company_dataset');
  const companies = new Map(dataset.companies.map(c => [c.id, c]));
  validateDecisions(decisions, companies);
  if (previous && (previous.version !== 1 || !Array.isArray(previous.items) || previous.items.length > 36 || !dateOK(previous.snapshotGeneratedAt))) throw Error('invalid_previous_review');
  if (previous && Date.parse(snapshot.generatedAt) < Date.parse(previous.snapshotGeneratedAt)) throw Error('stale_snapshot_refused');
  const items = new Map();
  const oldItems = new Map();
  for (const item of previous?.items || []) {
    const safe = publicSignal(item);
    if (safe.id !== item.id || oldItems.has(safe.id) || !reviewStatuses.has(item.status) || !dateOK(item.firstSeenAt) || !dateOK(item.lastSeenAt)
      || Date.parse(item.firstSeenAt) > Date.parse(item.lastSeenAt) || Date.parse(item.lastSeenAt) > Date.parse(snapshot.generatedAt)
      || !Array.isArray(item.matchedCompanyIds) || item.matchedCompanyIds.some(id => !companies.has(id))) throw Error('invalid_previous_item');
    const retained = { ...safe, firstSeenAt:item.firstSeenAt, lastSeenAt:item.lastSeenAt, status:item.status, matchedCompanyIds:[...item.matchedCompanyIds] };
    oldItems.set(item.id, retained);
    // Unreviewed records still survive rotation. Only a source-linked decision
    // can release a slot; the decision ledger is never truncated or cleared.
    if (!decisionFor(decisions, safe)) {
      retained.status = 'needs_review';
      items.set(item.id, retained);
    }
  }
  for (const signal of snapshot.signals) {
    const safe = publicSignal(signal);
    const id = safe.id;
    const title = clean(signal.title.replace(/\s+-\s+[^-]+$/, ''));
    const matches = dataset.companies.filter(c => [c.name, ...(c.aliases || [])].some(n => typeof n === 'string' && clean(n).length >= 4 && title.includes(clean(n)))).map(c => c.id).sort();
    const d = decisionFor(decisions, safe);
    const old = oldItems.get(id);
    const item = { ...safe, firstSeenAt:old?.firstSeenAt || snapshot.generatedAt, lastSeenAt:snapshot.generatedAt,
      status:d?.decision || 'needs_review', matchedCompanyIds:d ? (d.decision === 'linked' ? [...d.companyIds].sort() : []) : matches };
    if (d) item.review = reviewMetadata(d);
    items.set(id, item);
  }
  const list = [...items.values()].sort((a,b) => a.id.localeCompare(b.id));
  if (list.length > 36) throw Error('review_queue_full_preserved: review unresolved titles before importing a new snapshot');
  return { version:1, snapshotGeneratedAt:snapshot.generatedAt, datasetUpdatedAt:dataset.meta.updated_at, summary:reviewSummary(list), items:list };
}

export function checkReview(queue, dataset, decisions) {
  buildReview({slug:'kunming-it-radar',mode:'live',generatedAt:queue.snapshotGeneratedAt,signals:queue.items}, dataset, decisions, queue);
  if (JSON.stringify(queue.summary) !== JSON.stringify(reviewSummary(queue.items))) throw Error('review_summary_out_of_date');
  for (const item of queue.items) {
    const decision = decisionFor(decisions, item);
    if (item.status !== (decision?.decision || 'needs_review')
      || JSON.stringify(item.review) !== JSON.stringify(reviewMetadata(decision))
      || (decision && JSON.stringify(item.matchedCompanyIds) !== JSON.stringify([...decision.companyIds].sort()))) throw Error('review_queue_out_of_date');
  }
  return true;
}

export function run(argv = process.argv.slice(2)) {
  if (argv.length === 1 && argv[0] === '--check') {
    const dataset = JSON.parse(fs.readFileSync(path.join(root,'data/companies.json'),'utf8'));
    const decisions = JSON.parse(fs.readFileSync(decisionsPath,'utf8'));
    checkReview(JSON.parse(fs.readFileSync(output,'utf8')),dataset,decisions);
    console.log('Review validation passed: conclusions, evidence and queue counts agree.');
    return;
  }
  if (argv.length !== 2 || argv[0] !== '--snapshot') throw Error('usage: radar:review -- --snapshot PATH_TO_PUBLIC_RADAR_latest.json (or --check)');
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
