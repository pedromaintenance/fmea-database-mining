#!/usr/bin/env node
/** Public standalone instrument, never containing real human opinion files. */
import fs from 'node:fs';import crypto from 'node:crypto';import vm from 'node:vm';
const read=p=>fs.readFileSync(p,'utf8'),json=p=>JSON.parse(read(p));
const path='data/knowledge/engine-thermal-crossfluid-bridge.v1.json',b=json(path);
const policy=json('data/quality/diesel-bridge-adjudication-policy.v1.json');
const ids=b.scenarios.flatMap(x=>x.alternatives.map(y=>y.id));
if(ids.length!==18||b.version!=='1.4.16'||policy.version!=='1.4.19'||policy.publicStatus.humanReviewFilesReceived!==0)throw Error('Unexpected knowledge/policy');
const bundle={schema:'fmea-mining.diesel-bridge-adjudication-public.v1',version:'1.4.19',ready:true,
 nature:'empty_local_editorial_tool_without_human_decisions',ids,
 sourceSha256:crypto.createHash('sha256').update(read(path)).digest('hex'),
 bridge:{scenarios:b.scenarios.map(s=>({alternatives:s.alternatives.map(a=>({id:a.id,label:a.label,relation:a.relation,why:a.why,evidenceRefs:a.evidenceRefs}))}))},
 policy,actualReviewFiles:0,authenticatedAdjudications:0,appliedEdits:0,operationalReleases:0};
const template=read('docs/adjudicacao-diesel-editorial.html'),m=['{"schema":"ADJUDICATION_PLACEHOLDER","ready":false}','/*REVIEW_CORE*/','/*RECONCILE_CORE*/','/*ADJUDICATION_CORE*/'];
if(m.some(x=>!template.includes(x)))throw Error('Incomplete HTML template');
const rv=read('scripts/lib/diesel-bridge-review-core.mjs').replace(/\bexport\s+(?=(?:const|function)\b)/g,'');
const rc=read('scripts/lib/diesel-bridge-reconciliation-core.mjs').replace(/^import\s+.*?;\s*$/m,'').replace(/\bexport\s+(?=(?:const|function)\b)/g,'');
const ac=read('scripts/lib/diesel-bridge-adjudication-core.mjs').replace(/\bexport\s+(?=(?:const|function)\b)/g,'');
const html=template.replace(m[0],JSON.stringify(bundle).replace(/</g,'\\u003c')).replace(m[1],rv).replace(m[2],rc).replace(m[3],ac);
new vm.Script(html.match(/<script>([\s\S]*?)<\/script>/)?.[1]||'',{filename:'adjudication.browser.js'});
if(/fetch\s*\(|XMLHttpRequest|localStorage|sessionStorage|sendBeacon|innerHTML|<script\s+src=/i.test(html))throw Error('Network or unsafe DOM forbidden');
fs.mkdirSync('reports',{recursive:true});
fs.writeFileSync('reports/diesel-bridge-adjudication-public.generated.json',JSON.stringify(bundle,null,2)+'\n');
fs.writeFileSync('reports/adjudicacao-diesel-editorial.generated.html',html);
console.log(JSON.stringify({status:'ADJUDICATION_EDITORIAL_WORKSPACE_BUILT',version:'1.4.19',alternatives:18,realReviews:0,operationalApprovals:0}));
