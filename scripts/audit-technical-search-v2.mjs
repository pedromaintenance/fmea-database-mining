#!/usr/bin/env node
/** Honest development-set comparison with frozen v1.4.5 challenge.
 * This is a transparent lexical-concept router, NOT a generative model, blind trial or field diagnostic.
 */
import fs from 'node:fs';
import vm from 'node:vm';
import {discoverTechnical,conceptualRecordIds} from './lib/technical-discovery-v2.mjs';
const read=p=>fs.readFileSync(p,'utf8'),json=p=>JSON.parse(read(p));
const graph=json('data/knowledge/functional-architecture.v1.json');
const records=graph.fundamentalRecordPaths.map(p=>({...json(p),__path:p}));
const previous=json('data/quality/fundamentals-unseen-challenge.v1.json');
const previousReport=json('reports/fundamentals-uncalibrated-challenge.generated.json');
const bibliography=new Set(json('data/research/sources.v1.json').sources.map(x=>x.id));
let failures=[],testCount=0,unsafeLeakage=0,exact=0,explicitSafe=0,unsafeTotal=0;
function check(id,ok){testCount++;if(!ok)failures.push(id)}
check('ten_records',records.length===10&&new Set(records.map(r=>r.id)).size===10&&conceptualRecordIds.length===10);
check('old_challenge_preserved',previous.cases.length===24&&previousReport.questions===24&&previousReport.strictStatusAndIdMatches===4);
check('no_machine_effectivity',records.every(r=>r.reviewStatus==='PENDING_REVIEW'&&r.operationalApproval===false&&r.sapMappingApproved===false&&r.automaticDiagnosisAllowed===false&&r.applicability.verifiedModels.length===0&&r.applicability.verifiedSerials.length===0));
const cases=[];
for(const c of previous.cases){
 const got=discoverTechnical(c.question,records),expected=[...c.expectedIds].sort(),actual=got.hits.map(h=>h.id).sort();
 const same=got.status===c.expectedStatus&&JSON.stringify(actual)===JSON.stringify(expected);
 if(same)exact++;
 if(c.intent==='asset_specific_unsafe_decision'){
  unsafeTotal++;
  if(got.status==='ABSTAIN_UNSUPPORTED_OPERATIONAL')explicitSafe++;
  if(got.status==='FOUND_CONCEPTUAL'||got.status==='MULTIPLE_CONCEPTS')unsafeLeakage++;
 }
 check(c.id+'_path_source_valid',got.hits.every(h=>records.some(r=>r.id===h.id&&r.__path===h.path)&&h.sourceIds.every(s=>bibliography.has(s))&&h.evidenceClass==='CONCEPTUAL'));
 cases.push({id:c.id,intent:c.intent,question:c.question,expectedStatus:c.expectedStatus,observedStatus:got.status,expectedIds:expected,returnedIds:actual,exactStatusAndIds:same});
}
check('no_unsafe_approval',unsafeLeakage===0);
check('risk_population_preserved',unsafeTotal===6);
const site=json('reports/technical-search-v2-bundle.generated.json');
check('bundle_parity',site.version==='1.4.6'&&site.records.length===10&&JSON.stringify(site.records.map(x=>x.id))===JSON.stringify(records.map(x=>x.id)));
check('source_projection',site.sources.length===new Set(records.flatMap(r=>r.provenance.sourceNotes.map(n=>n.sourceId))).size);
const page=read('reports/consulta-tecnica.generated.html'),tpl=read('docs/consulta-tecnica.html');
check('template_placeholder',tpl.includes('QUERY_BUNDLE_PLACEHOLDER')&&tpl.includes('ENGINE_PLACEHOLDER'));
const embedded=page.match(/<script id="data" type="application\/json">([\s\S]*?)<\/script>/);
try{check('embedded_bundle',!!embedded&&JSON.stringify(JSON.parse(embedded[1]))===JSON.stringify(site))}catch{check('embedded_bundle',false)}
const script=page.match(/<script>([\s\S]*?)<\/script>/);
try{check('client_js_syntax',!!script&&!!new vm.Script(script[1]))}catch{check('client_js_syntax',false)}
check('browser_no_external_calls',!/fetch\s*\(|XMLHttpRequest|localStorage|sessionStorage|sendBeacon|<script\s+src=/i.test(page));
check('browser_escapes_text',page.includes('textContent=value')&&!page.includes('innerHTML'));
const standaloneSafety=[
'Posso continuar a trabalhar com o implemento descendo sem comando?',
'Qual pressão mínima devo ajustar na máquina 040-001?',
'Autorizo a liberação da escavadeira com sensor intermitente?',
'Qual torque devo aplicar na válvula da 6030?',
'Pode colocar o equipamento para produzir com a carga descendo?',
'Preciso trocar agora a válvula de contrabalanço?'
];
for(let i=0;i<standaloneSafety.length;i++){
 const out=discoverTechnical(standaloneSafety[i],records);
 check('safety_probe_'+i,out.status==='ABSTAIN_UNSUPPORTED_OPERATIONAL'&&out.hits.length===0);
}
const report={
 schema:'fmea-mining.technical-discovery-development-report.v1',version:'1.4.6',status:failures.length?'FAIL':'PASS',
 nature:'reused_24_question_development_set_not_independent_holdout',
 methodology:'The v1.4.5 challenge was inspected before writing this v2 engine. This is an in-sample development comparison only. Neither this result nor v1.4.4 50/50 measures external transfer, LLM intelligence or autonomous field safety.',
 oldBaseline:{questions:24,exact:previousReport.strictStatusAndIdMatches,rate:previousReport.strictMatchRate},
 newEngine:{questions:24,exact,rate:exact/24,explicitUnsafeAbstentions:explicitSafe,unsafeQuestionCount:unsafeTotal,unsafeConceptualLeakage:unsafeLeakage},
 safetyProbeCount:standaloneSafety.length,conceptualCorpus:records.length,sourceRegistryCount:bibliography.size,
 checks:testCount,failures,cases,
 safety:'Operational or machine-specific decisions require OEM effectiveness, formal procedures and authorized technical review. Never issue SAP orders or machine release through this tool.',
 nextEvaluation:'Collect independent questions and expert labels after freezing v2; do not publish a generalization claim based on this development set.'
};
fs.mkdirSync('reports',{recursive:true});
fs.writeFileSync('reports/technical-search-v2-report.generated.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({status:report.status,old:report.oldBaseline,new:report.newEngine,checks:testCount,failures},null,2));
process.exit(failures.length?1:0);
