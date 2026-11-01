import test from 'node:test';
import assert from 'node:assert/strict';
import { buildReview, signalId, checkReview } from '../scripts/radar-company-review.mjs';
const url = 'https://news.google.com/rss/articles/one';
const signal = {title:'宁安数字科技发展之路 - 新闻网',source:'新闻网',url,publishedAt:'2026-09-03T00:00:00Z'};
const snapshot = {slug:'kunming-it-radar',mode:'live',generatedAt:'2026-09-14T00:00:00Z',signals:[signal]};
const dataset = {meta:{updated_at:'2026-09-14'},companies:[{id:'ningan',name:'云南宁安数字科技股份公司',aliases:['宁安数科','宁安数字科技']}]};
test('news mentioning an unlisted company is retained without inventing a company',()=>{const db={...dataset,companies:[]};const before=JSON.stringify(db);const q=buildReview(snapshot,db);assert.equal(q.summary.needsReview,1);assert.deepEqual(q.items[0].matchedCompanyIds,[]);assert.equal(JSON.stringify(db),before);});
test('aliases match but never automatically approve a news mention',()=>{const q=buildReview(snapshot,dataset);assert.deepEqual(q.items[0].matchedCompanyIds,['ningan']);assert.equal(q.items[0].status,'needs_review');});
test('manual linkage requires an existing company and deduplicates reruns',()=>{const d={[signalId(url)]:{decision:'linked',companyIds:['ningan'],reviewedAt:'2026-09-14',title:signal.title,sourceUrl:url}};const q=buildReview({...snapshot,signals:[signal,signal]},dataset,d);assert.equal(q.items.length,1);assert.equal(q.summary.linked,1);assert.deepEqual(buildReview(snapshot,dataset,d,q),q);assert.throws(()=>buildReview(snapshot,{...dataset,companies:[]},d));});
test('unresolved headlines persist across snapshot rotation',()=>{const previous=buildReview(snapshot,dataset);const q=buildReview({...snapshot,generatedAt:'2026-09-21T00:00:00Z',signals:[]},dataset,{},previous);assert.equal(q.items.length,1);assert.equal(q.items[0].firstSeenAt,snapshot.generatedAt);});
test('capacity, stale snapshots, samples, private fields and unsafe links fail closed',()=>{assert.throws(()=>buildReview({...snapshot,signals:Array(37).fill(signal)},dataset));assert.throws(()=>buildReview({...snapshot,mode:'sample'},dataset));assert.throws(()=>buildReview({...snapshot,generatedAt:'invalid'},dataset));assert.throws(()=>buildReview({...snapshot,generatedAt:'2026-09-01'},dataset,{},buildReview(snapshot,dataset)));for(const change of [{url:'javascript:alert(1)'},{url:'https://localhost/rss/articles/one'},{title:'contact test@example.com'},{publishedAt:'bad'}])assert.throws(()=>buildReview({...snapshot,signals:[{...signal,...change}]},dataset));const full=buildReview({...snapshot,signals:Array.from({length:36},(_,i)=>({...signal,url:'https://news.google.com/rss/articles/'+i}))},dataset);assert.throws(()=>buildReview(snapshot,dataset,{},full),/review_queue_full/);});
test('old queue items are validated and unknown fields never propagated',()=>{const previous=buildReview(snapshot,dataset);previous.items[0].extra='not for export';assert.equal(buildReview({...snapshot,signals:[]},dataset,{},previous).items[0].extra,undefined);for(const change of [{id:'fake'},{title:'test@example.com'},{matchedCompanyIds:['missing']},{firstSeenAt:'bad'}]){const p=structuredClone(previous);Object.assign(p.items[0],change);assert.throws(()=>buildReview({...snapshot,signals:[]},dataset,{},p));}});
test('only public Google RSS query parameters are retained',()=>{for(const suffix of ['?password=EXAMPLE','?oc=5&token=EXAMPLE','#private','?oc=test@example.com'])assert.throws(()=>buildReview({...snapshot,signals:[{...signal,url:url+suffix}]},dataset));assert.equal(buildReview({...snapshot,signals:[{...signal,url:url+'?oc=5'}]},dataset).items.length,1);});


const evaluated = (item, code = 'company_candidate') => ({
  decision:'reviewed_not_added', companyIds:[], reviewedAt:'2026-11-01',
  title:item.title, sourceUrl:item.url, reasonCode:code,
  reason:'已阅读公开来源，候选主体尚未进入公司主库，不作关联或核验承诺。',
  evidenceUrls:['https://example.org/public-source'], candidateNames:['公开候选公司']
});

test('source-backed review frees capacity without erasing decisions or changing company facts',()=>{
  const old = buildReview(snapshot,dataset);
  const decisions = {[signalId(url)]:evaluated(signal)};
  const before = JSON.stringify({dataset,decisions,old});
  const fresh = {...snapshot,generatedAt:'2026-10-26T00:00:00Z',signals:Array.from({length:36},(_,i)=>({...signal,url:`https://news.google.com/rss/articles/new${i}`}))};
  const q = buildReview(fresh,dataset,decisions,old);
  assert.equal(q.items.length,36); assert.equal(q.summary.needsReview,36);
  assert.equal(JSON.stringify({dataset,decisions,old}),before);
  assert.ok(decisions[signalId(url)].reason);
});

test('reviewed candidates remain explicit and require evidence instead of masquerading as linked',()=>{
  const decision = evaluated(signal);
  const q = buildReview(snapshot,dataset,{[signalId(url)]:decision});
  assert.equal(q.summary.reviewedNotAdded,1); assert.equal(q.summary.linked,0); assert.equal(q.summary.needsReview,0);
  assert.deepEqual(q.items[0].matchedCompanyIds,[]); assert.equal(q.items[0].review.reasonCode,'company_candidate');
  assert.equal(checkReview(q,dataset,{[signalId(url)]:decision}),true);
  for(const change of [{reason:''},{evidenceUrls:[]},{reasonCode:'approved'},{companyIds:['ningan']},{candidateNames:[]},{sourceUrl:'https://news.google.com/rss/articles/wrong'},{evidenceUrls:['javascript:alert(1)']}]) {
    assert.throws(()=>buildReview(snapshot,dataset,{[signalId(url)]:{...decision,...change}}));
  }
});

test('changed titles and removed conclusions reopen review, preserving the capacity guard',()=>{
  const decisions = {[signalId(url)]:evaluated(signal)};
  const previous = buildReview(snapshot,dataset,decisions);
  const changed = buildReview({...snapshot,signals:[{...signal,title:'新的标题，需重新阅读'}]},dataset,decisions,previous);
  assert.equal(changed.items[0].status,'needs_review'); assert.equal(changed.items[0].review,undefined);
  const reopened = buildReview({...snapshot,signals:[]},dataset,{},previous);
  assert.equal(reopened.items[0].status,'needs_review');
  const tampered = structuredClone(previous);tampered.summary.needsReview=9;
  assert.throws(()=>checkReview(tampered,dataset,decisions),/summary/);
});


test('legacy unbound conclusions cannot approve an unrelated title at the same URL',()=>{
  const legacy = {[signalId(url)]:{decision:'linked',companyIds:['ningan'],reviewedAt:'2026-09-14'}};
  assert.throws(()=>buildReview(snapshot,dataset,legacy),/review_title|review_source/);
  const decision = {...legacy[signalId(url)],title:signal.title,sourceUrl:url};
  const other = {...signal,title:'另一家完全不同的企业'};
  const q = buildReview({...snapshot,signals:[other]},dataset,{[signalId(url)]:decision});
  assert.equal(q.summary.linked,0);assert.equal(q.summary.needsReview,1);
  const titleAlias = {...signal,title:signal.title.replace('新闻网','原始发布方')};
  const reviewed = {...decision,reviewedTitles:[titleAlias.title]};
  assert.equal(buildReview({...snapshot,signals:[titleAlias]},dataset,{[signalId(url)]:reviewed}).summary.linked,1);
  assert.equal(buildReview({...snapshot,signals:[other]},dataset,{[signalId(url)]:reviewed}).summary.linked,0);
});


test('review evidence rejects authentication query fields and fragments before publication',()=>{
  for (const suffix of ['?token=SYNTHETIC_ONLY','?access_token=SYNTHETIC_ONLY','?password=SYNTHETIC_ONLY','?secret=SYNTHETIC_ONLY','?api_key=SYNTHETIC_ONLY','#session=SYNTHETIC_ONLY']) {
    const d={...evaluated(signal),evidenceUrls:[`https://example.org/public-source${suffix}`]};
    assert.throws(()=>buildReview(snapshot,dataset,{[signalId(url)]:d}),/review_evidence/);
  }
  for(const reviewedTitles of [[],[signal.title,signal.title],Array(6).fill(signal.title),'wrong',[null]]) {
    assert.throws(()=>buildReview(snapshot,dataset,{[signalId(url)]:{...evaluated(signal),reviewedTitles}}),/reviewed_titles/);
  }
});
