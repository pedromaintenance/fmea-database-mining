#!/usr/bin/env node
/** Emit an offline reconciliation interface with zero human responses. */
import fs from 'node:fs';import crypto from 'node:crypto';import vm from 'node:vm';
const read=p=>fs.readFileSync(p,'utf8'),json=p=>JSON.parse(read(p));
const dossier='data/knowledge/engine-thermal-crossfluid-bridge.v1.json';
const bridge=json(dossier),policy=json('data/quality/diesel-bridge-reconciliation-policy.v1.json'),protocol=json('data/quality/diesel-bridge-expert-review-protocol.v1.json');
const ids=bridge.scenarios.flatMap(s=>s.alternatives.map(a=>a.id));
if(ids.length!==18||policy.version!=='1.4.18'||protocol.version!=='1.4.17'||bridge.version!=='1.4.16'||policy.publicStatus.actualReviewFilesReceived!==0)throw Error('Version or public policy mismatch');
const sourceSha256=crypto.createHash('sha256').update(read(dossier)).digest('hex');
const bundle={schema:'fmea-mining.diesel-bridge-reconcile-public.v1',version:'1.4.18',
 ready:true,nature:'empty_local_tool_no_real_review_records',
 ids,sourceSha256,policy,reviewProtocolVersion:'1.4.17',
 actualReviewFilesReceived:0,verifiedIndependentReviewers:0,automaticContentChanges:0,operationalApprovals:0};
const template=read('docs/conciliacao-pareceres-diesel.html');
const a='{"schema":"DIESEL_RECONCILE_PLACEHOLDER","ready":false}',b='/*DIESEL_REVIEW_VALIDATION_CORE*/',c='/*DIESEL_RECONCILIATION_CORE*/';
if(!template.includes(a)||!template.includes(b)||!template.includes(c))throw Error('Missing offline markers');
const reviewCore=read('scripts/lib/diesel-bridge-review-core.mjs').replace(/\bexport\s+(?=(?:const|function)\b)/g,'');
const reconcileCore=read('scripts/lib/diesel-bridge-reconciliation-core.mjs').replace(/^import\s+.*?;\s*$/m,'').replace(/\bexport\s+(?=(?:const|function)\b)/g,'');
const html=template.replace(a,JSON.stringify(bundle).replace(/</g,'\\u003c')).replace(b,reviewCore).replace(c,reconcileCore);
const code=html.match(/<script>([\s\S]*?)<\/script>/)?.[1];
if(!code)throw Error('No inline browser script');
new vm.Script(code,{filename:'diesel-bridge-reconciliation.browser.js'});
if(/fetch\s*\(|XMLHttpRequest|sendBeacon|localStorage|sessionStorage|innerHTML|<script\s+src=/i.test(html))throw Error('Remote API, persistence or unsafe DOM prohibited');
fs.mkdirSync('reports',{recursive:true});
fs.writeFileSync('reports/diesel-bridge-reconciliation-public.generated.json',JSON.stringify(bundle,null,2)+'\n');
fs.writeFileSync('reports/conciliacao-pareceres-diesel.generated.html',html);
console.log(JSON.stringify({status:'OFFLINE_RECONCILIATION_BUILT',version:'1.4.18',cases:ids.length,actualReviewFiles:0,independenceVerified:false},null,2));
