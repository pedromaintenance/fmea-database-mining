#!/usr/bin/env node
/** Source-traced post-freeze bridge between two distinct diesel studies. */
import fs from 'node:fs';
import vm from 'node:vm';
import crypto from 'node:crypto';
import {validateBridge} from './lib/engine-thermal-crossfluid-contract.mjs';
const read=p=>fs.readFileSync(p,'utf8'),json=p=>JSON.parse(read(p));
const bridge=json('data/knowledge/engine-thermal-crossfluid-bridge.v1.json');
const c=json(bridge.parentStudies[0].path),t=json(bridge.parentStudies[1].path),m=json(bridge.evidenceMatrix),r=json(bridge.sourceRegistry);
const errors=validateBridge(bridge,c,t,m,r);
if(errors.length)throw Error('Bridge refused: '+errors.join(', '));
const hyp=[...c.hypotheses,...t.hypotheses].map(({id,title,sourceIds})=>({id,title,sourceIds}));
const ev=[...m.evidence.map(({id,title})=>({id:'EC:'+id,title})),...t.documentRequirements.map(({id,title})=>({id:'CL:'+id,title}))];
const used=new Set(hyp.filter(h=>bridge.scenarios.some(s=>s.alternatives.some(a=>a.hypothesisIds.includes(h.id)))).flatMap(h=>h.sourceIds));
const sources=r.sources.filter(s=>used.has(s.id)).map(({id,title,organization,url,limitation})=>({id,title,organization,url,limitation}));
if(sources.length!==used.size)throw Error('Source registry incomplete');
const sha=x=>crypto.createHash('sha256').update(x).digest('hex');
const bundle={schema:'fmea-mining.engine-thermal-crossfluid-public.v1',ready:true,version:'1.4.16',bridge,hypotheses:hyp,evidence:ev,sources,
 parentDigests:{crossfluid:sha(read(bridge.parentStudies[0].path)),thermal:sha(read(bridge.parentStudies[1].path)),matrix:sha(read(bridge.evidenceMatrix))},
 verifiedAssets:0,fieldTests:0,confirmedCauses:0,operationalApprovals:0,changedFrozenPilot:false};
const template=read('docs/diagnostico-combinado-motor.html'),marker='{"schema":"BRIDGE_PLACEHOLDER","ready":false}';
if(!template.includes(marker))throw Error('HTML marker missing');
const html=template.replace(marker,JSON.stringify(bundle).replace(/</g,'\\u003c'));
const js=html.match(/<script>([\s\S]*?)<\/script>/)?.[1];
if(!js)throw Error('Browser script missing');
new vm.Script(js,{filename:'bridge.browser.js'});
if(/fetch\s*\(|XMLHttpRequest|localStorage|sessionStorage|sendBeacon|innerHTML|<script\s+src=/i.test(html))throw Error('Network, persistence or unsafe HTML forbidden');
fs.mkdirSync('reports',{recursive:true});
fs.writeFileSync('reports/engine-thermal-crossfluid-bridge.generated.json',JSON.stringify(bundle,null,2)+'\n');
fs.writeFileSync('reports/diagnostico-combinado-motor.generated.html',html);
console.log(JSON.stringify({status:'BRIDGE_BUILT',version:'1.4.16',scenarios:bridge.scenarios.length,alternatives:bridge.scenarios.reduce((n,s)=>n+s.alternatives.length,0),manufacturerSources:sources.length,verifiedAssets:0},null,2));
