#!/usr/bin/env node
/** Publish only a blank anonymous diesel reviewer and a source-traced public reading pack. */
import fs from 'node:fs';
import crypto from 'node:crypto';
import vm from 'node:vm';
import {createEmptyDieselReview,validateDieselReview} from './lib/diesel-bridge-review-core.mjs';
const read=p=>fs.readFileSync(p,'utf8'),json=p=>JSON.parse(read(p));
const bridgePath='data/knowledge/engine-thermal-crossfluid-bridge.v1.json',bridge=json(bridgePath);
const protocol=json('data/quality/diesel-bridge-expert-review-protocol.v1.json');
const ids=bridge.scenarios.flatMap(s=>s.alternatives.map(a=>a.id));
if(bridge.version!=='1.4.16'||protocol.version!=='1.4.17'||ids.length!==18)throw Error('Source or protocol version changed');
const digest=crypto.createHash('sha256').update(read(bridgePath)).digest('hex');
const empty=createEmptyDieselReview(ids,digest);
if(validateDieselReview(empty,ids,digest).length)throw Error('Invalid empty review template');
const entries=bridge.scenarios.flatMap(s=>s.alternatives.map(a=>({
 id:a.id,scenarioId:s.id,scenarioTitle:s.title,observations:s.observations,
 label:a.label,why:a.why,counterEvidence:a.counterEvidence,hypothesisIds:a.hypothesisIds,evidenceRefs:a.evidenceRefs
})));
const bundle={schema:'fmea-mining.diesel-bridge-review-public.v1',version:'1.4.17',ready:true,
 nature:'blinded_author_relation_not_hidden_source_repo_or_authenticated_reviewer',
 protocol,bridgeDigest:digest,emptyReview:empty,entries,receivedHumanReviews:0,engineeringApprovals:0,operatingRelease:0,
 frozenPilotUnchanged:true};
const htmlTemplate=read('docs/revisao-diesel-especialistas.html');
const marker='{"schema":"DIESEL_REVIEW_PLACEHOLDER","ready":false}',codeMarker='/*DIESEL_REVIEW_CORE_PLACEHOLDER*/';
if(!htmlTemplate.includes(marker)||!htmlTemplate.includes(codeMarker))throw Error('Missing template markers');
const core=read('scripts/lib/diesel-bridge-review-core.mjs').replace(/\bexport\s+(?=(?:const|function)\b)/g,'');
const html=htmlTemplate.replace(marker,JSON.stringify(bundle).replace(/</g,'\\u003c')).replace(codeMarker,core);
const script=html.match(/<script>([\s\S]*?)<\/script>/)?.[1];
if(!script)throw Error('Missing standalone browser JS');
new vm.Script(script,{filename:'diesel-bridge-expert-review.browser.js'});
if(/fetch\s*\(|XMLHttpRequest|localStorage|sessionStorage|sendBeacon|innerHTML|<script\s+src=/i.test(html))throw Error('Network, persistence or unsafe HTML prohibited');
if(entries.some(x=>Object.hasOwn(x,'relation')||Object.hasOwn(x,'invalidConclusion')))throw Error('Author classification leaked');
fs.mkdirSync('reports',{recursive:true});
fs.writeFileSync('reports/diesel-bridge-review-empty.generated.json',JSON.stringify(empty,null,2)+'\n');
fs.writeFileSync('reports/diesel-bridge-review-public.generated.json',JSON.stringify(bundle,null,2)+'\n');
fs.writeFileSync('reports/revisao-diesel-especialistas.generated.html',html);
console.log(JSON.stringify({status:'EDITORIAL_REVIEW_INSTRUMENT_BUILT',version:'1.4.17',cases:entries.length,ratings:protocol.dimensions.length,anonymousFeedbackFiles:0,certifiedReviewers:0},null,2));
