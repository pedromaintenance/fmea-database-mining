#!/usr/bin/env node
/** Original technical synthesis of diesel engine thermal differential, public and
 * offline. Does not modify any of the 10 frozen retrieval records. */
import fs from 'node:fs';
import vm from 'node:vm';
import {validateThermalDossier} from './lib/engine-cooling-thermal-contract.mjs';
const read=p=>fs.readFileSync(p,'utf8'),json=p=>JSON.parse(read(p));
const dossier=json('data/knowledge/engine-cooling-thermal-differential.v1.json');
const registry=json('data/research/sources.v1.json');
const invalid=validateThermalDossier(dossier,registry);
if(invalid.length)throw Error('Thermal knowledge refused: '+invalid.join(', '));
const ids=new Set(dossier.primarySourceNotes.map(s=>s.sourceId));
const sources=registry.sources.filter(s=>ids.has(s.id))
 .map(({id,organization,title,url,limitation,role,lastReviewed})=>({id,organization,title,url,limitation,role,lastReviewed}));
if(sources.length!==ids.size)throw Error('Missing a referenced OEM cooling source');
const bundle={schema:'fmea-mining.engine-cooling-thermal-public.v1',version:'1.4.15',ready:true,
 nature:'source_traced_competing_mechanisms_not_diagnostic_or_field_test',
 dossier,sources,verifiedMachines:0,performedTests:0,confirmedCauses:0,
 operationalApprovals:0,changesFrozenPilot:false};
const template=read('docs/diagnostico-arrefecimento-motor.html');
const marker='{"schema":"THERMAL_DATA_PLACEHOLDER","ready":false}';
if(!template.includes(marker))throw Error('Missing browser data marker');
const html=template.replace(marker,JSON.stringify(bundle).replace(/</g,'\\u003c'));
const script=html.match(/<script>([\s\S]*?)<\/script>/)?.[1];
if(!script)throw Error('Standalone browser script not found');
new vm.Script(script,{filename:'engine-cooling-differential.js'});
if(/fetch\s*\(|XMLHttpRequest|localStorage|sessionStorage|sendBeacon|<script\s+src=/i.test(html))throw Error('No network or persistent storage allowed');
fs.mkdirSync('reports',{recursive:true});
fs.writeFileSync('reports/engine-cooling-thermal.generated.json',JSON.stringify(bundle,null,2)+'\n');
fs.writeFileSync('reports/diagnostico-arrefecimento-motor.generated.html',html);
console.log(JSON.stringify({status:'CONCEPTUAL_THERMAL_DIFFERENTIAL_BUILT',version:'1.4.15',
 competingHypotheses:dossier.hypotheses.length,illustrativeScenarios:dossier.scenarios.length,
 manufacturerReferences:sources.length,verifiedMachines:0,changesFrozenPilot:false},null,2));
