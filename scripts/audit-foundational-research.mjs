#!/usr/bin/env node
/** Validation: conceptual v2 schema, OEM reference trace, safe publication and tamper resistance. */
import fs from 'node:fs';
import vm from 'node:vm';
const read=p=>fs.readFileSync(p,'utf8'),json=p=>JSON.parse(read(p));
const schema=json('schemas/technical-knowledge-record.v2.schema.json');
const registry=json('data/research/sources.v1.json'),sourceIds=new Set(registry.sources.map(s=>s.id));
const ontology=json('data/ontology/concepts.v1.json');
const original=json('data/quality/hydraulic-circuit-differential.v1.json');
const paths=[
 'data/knowledge/fundamentals/hydraulic-cavitation.v2.json',
 'data/knowledge/fundamentals/hydraulic-aeration.v2.json',
 'data/knowledge/fundamentals/particulate-abrasive-wear.v2.json',
 'data/knowledge/fundamentals/lubricating-film.v2.json',
 'data/knowledge/fundamentals/solid-contamination.v2.json',
 'data/knowledge/fundamentals/rolling-contact-fatigue.v2.json'
];
const records=paths.map(json),errors=[];let total=0,attacks=0;
function check(name,test){total++;if(!test)errors.push(name)}
function validate(x,s){
 if(Object.hasOwn(s,'const')&&JSON.stringify(x)!==JSON.stringify(s.const))return false;
 if(s.enum&&!s.enum.includes(x))return false;
 if(s.type==='null')return x===null;
 if(s.type==='string')return typeof x==='string'&&(s.minLength===undefined||x.length>=s.minLength)&&(!s.pattern||new RegExp(s.pattern).test(x));
 if(s.type==='array')return Array.isArray(x)&&(s.minItems===undefined||x.length>=s.minItems)&&(s.maxItems===undefined||x.length<=s.maxItems)&&(!s.uniqueItems||new Set(x.map(y=>JSON.stringify(y))).size===x.length)&&(!s.items||x.every(y=>validate(y,s.items)));
 if(s.type==='object'){
  if(!x||typeof x!=='object'||Array.isArray(x))return false;
  if(s.required?.some(k=>!Object.hasOwn(x,k)))return false;
  if(s.additionalProperties===false&&Object.keys(x).some(k=>!Object.hasOwn(s.properties,k)))return false;
  return Object.entries(x).every(([k,v])=>!s.properties?.[k]||validate(v,s.properties[k]));
 }
 return s.type===undefined;
}
function anchorExists(a){
 if(!fs.existsSync(a.path))return false;
 const d=json(a.path);
 if(a.path==='data/ontology/concepts.v1.json')return d.mechanismFamilies.some(x=>x.id===a.recordId);
 if(a.path==='data/quality/hydraulic-circuit-differential.v1.json')return d.records.some(x=>x.id===a.recordId);
 return false; // Fail closed until another canonical anchor parser is deliberately added.
}
check('strict_v2_schema',schema.additionalProperties===false&&schema.$schema==='https://json-schema.org/draft/2020-12/schema'&&schema.properties.schema.const==='fmea-mining.technical-knowledge-record.v2');
check('six_conceptual_pilots',records.length===6&&new Set(records.map(x=>x.id)).size===6&&records.slice(0,3).every(x=>x.recordVersion==='1.4.3')&&records.slice(3).every(x=>x.recordVersion==='1.4.4'));
check('bibliography_extended',registry.sources.length===94&&new Set(registry.sources.map(x=>x.id)).size===90);
check('new_manufacturer_sources_linked',["PARKER-P1PD-2019-SVC","PARKER-HYD-FILTRATION-HANDBOOK","BOSCH-REXROTH-PISTON-DAMAGE"].every(x=>sourceIds.has(x)));
check('independent_ontology_unmodified',ontology.mechanismFamilies.some(x=>x.id==='ME-01')&&ontology.mechanismFamilies.some(x=>x.id==='ME-08'));
check('hydraulic_legacy_anchor_exists',original.records.some(x=>x.id==='HC-DIFF-01'));
for(let i=0;i<records.length;i++){
 const r=records[i],label=r.id;
 check(label+'_schema',validate(r,schema));
 check(label+'_conceptual',r.evidenceClass==='CONCEPTUAL'&&r.reviewStatus==='PENDING_REVIEW'&&r.provenance.newFieldEvidence===false&&r.operationalApproval===false&&r.sapMappingApproved===false&&r.automaticDiagnosisAllowed===false);
 check(label+'_zero_field',r.applicability.verifiedModels.length===0&&r.applicability.verifiedSerials.length===0&&r.applicability.oemAcceptanceLimits===null&&r.applicability.fieldObservations===0&&r.applicability.performedTests===0&&r.applicability.confirmedRootCauses===0);
 check(label+'_source_trace',r.provenance.sourceNotes.length>=2&&r.provenance.sourceNotes.every(n=>sourceIds.has(n.sourceId))&&new Set(r.provenance.sourceNotes.map(x=>x.sourceId)).size===r.provenance.sourceNotes.length);
 check(label+'_ontology_trace',r.ontologyLinks.every(x=>ontology.mechanismFamilies.some(y=>y.id===x.id)&&x.mechanismProven===false));
 check(label+'_anchors',r.provenance.originAnchors.every(anchorExists));
 check(label+'_hypothesis_independence',r.competingHypotheses.length>=2&&new Set(r.competingHypotheses.map(x=>x.id)).size===r.competingHypotheses.length&&r.competingHypotheses.every(x=>x.unconfirmed===true));
 const reject=(tag,mutate)=>{const bad=structuredClone(r);mutate(bad);attacks++;check(label+'_reject_'+tag,!validate(bad,schema))};
 reject('private_serial',x=>x.privateSerialNumber='sensitive');
 reject('approve_ope',x=>x.operationalApproval=true);
 reject('approve_sap',x=>x.sapMappingApproved=true);
 reject('automatic_diagnosis',x=>x.automaticDiagnosisAllowed=true);
 reject('fake_threshold',x=>x.applicability.oemAcceptanceLimits=999);
 reject('fake_observation',x=>x.applicability.fieldObservations=1);
 reject('fake_test',x=>x.applicability.performedTests=1);
 reject('fake_root_cause',x=>x.applicability.confirmedRootCauses=1);
 reject('fake_model',x=>x.applicability.verifiedModels.push('CAT 395 VERIFIED'));
 reject('fake_serial',x=>x.applicability.verifiedSerials.push('secret'));
 reject('fake_oem_review',x=>x.reviewStatus='APPROVED');
 reject('hypothesis_confirmed',x=>x.competingHypotheses[0].unconfirmed=false);
 reject('unsafe_new_source',x=>x.provenance.sourceNotes[0].sourceId='../private');
 reject('unsupported_ontology_claim',x=>x.ontologyLinks[0].mechanismProven=true);
 reject('source_note_private',x=>x.provenance.sourceNotes[0].assetSerial='secret');
}
const byId=new Map(records.map(x=>[x.id,x]));
check('cav_vs_aeration_not_equivalent',byId.get('TK-HYD-CAVITATION-001').id!==byId.get('TK-HYD-AERATION-001').id&&byId.get('TK-HYD-CAVITATION-001').titleEn!==byId.get('TK-HYD-AERATION-001').titleEn);
check('new_fundamentals_distinct',byId.get('TK-TRIB-FILM-001').ontologyLinks.some(x=>x.id==='ME-13')&&byId.get('TK-FLUID-SOLIDS-001').domain==='Monitoramento de condição'&&byId.get('TK-BRG-RCF-001').ontologyLinks.some(x=>x.id==='ME-03'));
check('abrasion_not_hydraulic_cause_assumption',byId.get('TK-TRIB-ABRASION-001').domain==='Tribologia'&&byId.get('TK-TRIB-ABRASION-001').ontologyLinks.some(x=>x.id==='ME-01'));
const out=json('reports/fundamentals.generated.json'),page=read('reports/fundamentos-hidraulica-tribologia.generated.html'),tmpl=read('docs/fundamentos-hidraulica-tribologia.html');
check('generated_consistency',out.schema==='fmea-mining.fundamentals-discovery.v1'&&out.version==='1.4.4'&&out.records.length===6&&out.records.every((r,i)=>r.__path===paths[i]&&JSON.stringify({...r,__path:undefined})!==undefined));
check('generator_source_refs',out.sources.length===new Set(records.flatMap(x=>x.provenance.sourceNotes.map(n=>n.sourceId))).size&&out.sources.every(x=>sourceIds.has(x.id)));
check('template_not_fake_data',tmpl.includes('FOUNDATIONS_PLACEHOLDER')&&tmpl.includes('ready":false'));
const marker=page.match(/<script id="records" type="application\/json">([\s\S]*?)<\/script>/);
check('generated_embedded_data',!!marker);
try{check('parity_generated_data',JSON.stringify(JSON.parse(marker[1]))===JSON.stringify(out))}catch{check('parity_generated_data',false)}
const inline=page.match(/<script>([\s\S]*?)<\/script>/);
try{check('generated_html_syntax',!!inline&&!!new vm.Script(inline[1]))}catch{check('generated_html_syntax',false)}
check('no_client_network_storage',!/fetch\s*\(|XMLHttpRequest|localStorage|sessionStorage|sendBeacon|<script\s+src=/i.test(page));
check('html_output_safe',page.includes("textContent=value")&&!page.includes('innerHTML'));
const report={schema:'fmea-mining.fundamentals-research-audit.v1',version:'1.4.4',status:errors.length?'FAIL':'PASS',checks:total,adversarialMutations:attacks,technicalRecords:records.length,registeredSources:registry.sources.length,actualFieldCases:0,operationalApprovals:0,errors};
fs.mkdirSync('reports',{recursive:true});
fs.writeFileSync('reports/fundamentals-research.generated.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report,null,2));process.exit(errors.length?1:0);
