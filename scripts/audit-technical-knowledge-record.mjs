#!/usr/bin/env node
import fs from 'node:fs';
import vm from 'node:vm';
const read=p=>fs.readFileSync(p,'utf8'),json=p=>JSON.parse(read(p));
const schema=json('schemas/technical-knowledge-record.schema.json');
const record=json('data/knowledge/fundamentals/hydraulic-inlet-restriction.v1.json');
const differential=json('data/quality/hydraulic-circuit-differential.v1.json');
const ontology=json('data/ontology/concepts.v1.json');
const sources=json('data/research/sources.v1.json');
const failures=[];let assertions=0;
function check(name,ok){assertions++;if(!ok)failures.push(name)}
function matches(x,s){
 if(Object.hasOwn(s,'const')&&JSON.stringify(x)!==JSON.stringify(s.const))return false;
 if(s.enum&&!s.enum.includes(x))return false;
 if(s.type==='null')return x===null;
 if(s.type==='string')return typeof x==='string'&&(!s.minLength||x.length>=s.minLength)&&(!s.pattern||new RegExp(s.pattern).test(x));
 if(s.type==='array')return Array.isArray(x)&&(!s.minItems||x.length>=s.minItems)&&(!s.uniqueItems||new Set(x.map(z=>JSON.stringify(z))).size===x.length)&&x.every(v=>matches(v,s.items));
 if(s.type==='object'){
  if(!x||typeof x!=='object'||Array.isArray(x))return false;
  const keys=Object.keys(x);
  if(s.additionalProperties===false&&keys.some(k=>!Object.hasOwn(s.properties,k)))return false;
  if(s.required?.some(k=>!Object.hasOwn(x,k)))return false;
  return keys.every(k=>!s.properties?.[k]||matches(x[k],s.properties[k]));
 }
 return false;
}
check('schema_strict',schema.additionalProperties===false&&schema.$schema==='https://json-schema.org/draft/2020-12/schema');
check('record_valid',matches(record,schema));
check('record_has_no_real_data',record.applicability.verifiedModels.length===0&&record.applicability.verifiedSerials.length===0&&record.applicability.oemAcceptanceLimits===null&&record.applicability.fieldObservations===0&&record.applicability.performedTests===0&&record.applicability.confirmedRootCauses===0);
check('record_no_approvals',record.operationalApproval===false&&record.sapMappingApproved===false&&record.automaticDiagnosisAllowed===false);
check('record_pending',record.evidenceClass==='CONCEPTUAL'&&record.reviewStatus==='PENDING_REVIEW');
const source=differential.records.find(x=>x.id===record.provenance.canonicalScenarioId);
check('scenario_lineage',!!source&&record.provenance.canonicalScenarioPath==='data/quality/hydraulic-circuit-differential.v1.json');
check('hypotheses_trace',source&&record.competingHypotheses.length===source.competingHypotheses.length&&new Set(record.competingHypotheses.map(x=>x.id)).size===source.competingHypotheses.length&&record.competingHypotheses.every(x=>source.competingHypotheses.some(h=>h.id===x.id)));
const registryIds=new Set(sources.sources.map(x=>x.id));
check('source_ids_trace',record.provenance.sourceIds.length>=2&&record.provenance.sourceIds.every(x=>registryIds.has(x))&&record.provenance.sourceIds.every(x=>source.sourceIds.includes(x)));
check('ontology_ids_trace',record.ontologyLinks.every(x=>ontology.mechanismFamilies.some(y=>y.id===x.id)&&x.provesThisMechanism===false));
check('no_performed_tests_claimed',record.symptoms.every(x=>x.observedInField===false)&&record.competingHypotheses.every(x=>x.unconfirmed===true));
let attacks=0;
function rejected(id,mutate){const x=structuredClone(record);mutate(x);attacks++;check('reject_'+id,!matches(x,schema))}
rejected('extra_private_serial',x=>x.serialNumber='private');
rejected('approve_operation',x=>x.operationalApproval=true);
rejected('approve_SAP',x=>x.sapMappingApproved=true);
rejected('enable_auto_diagnosis',x=>x.automaticDiagnosisAllowed=true);
rejected('insert_acceptance_limit',x=>x.applicability.oemAcceptanceLimits=250);
rejected('insert_field_measurement',x=>x.applicability.fieldObservations=1);
rejected('insert_machine_model',x=>x.applicability.verifiedModels=['machine-A']);
rejected('invent_expert_review',x=>x.reviewStatus='APPROVED');
rejected('declare_confirmed_mechanism',x=>x.competingHypotheses[0].unconfirmed=false);
rejected('claim_observed_symptom',x=>x.symptoms[0].observedInField=true);
rejected('extra_notes',x=>x.provenance.privateOEMManual='OEM confidential');
rejected('malformed_source_id',x=>x.provenance.sourceIds=['../../secret']);
const atlas=json('reports/semantic-atlas.generated.json');
const page=read('reports/mapa-semantico.generated.html');
check('atlas_schema',atlas.schema==='fmea-mining.semantic-atlas.v1'&&atlas.version==='1.4.2'&&atlas.nature==='automatic_structural_discovery_not_semantic_validation');
check('atlas_consistency',atlas.summary.totalFilesDiscovered===atlas.summary.parsedDatasetCount+atlas.summary.invalidJsonCount&&atlas.summary.parsedDatasetCount===atlas.assets.length);
check('atlas_invalid_json_zero',atlas.summary.invalidJsonCount===0);
check('atlas_no_promoted_authority',atlas.assets.every(x=>x.independentTechnicalApproval===false&&x.topicMethod==='filename_heuristic_not_engineering_classification'));
const pilot=atlas.assets.find(x=>x.path==='data/knowledge/fundamentals/hydraulic-inlet-restriction.v1.json');
check('pilot_in_atlas',!!pilot&&pilot.schema===record.schema&&pilot.profile==='technical_foundation_draft'&&pilot.documentVersion==='1.4.2');
check('pilot_references_indexed',!!pilot&&record.provenance.sourceIds.every(x=>pilot.sourceIdsResolvedInRegistry.includes(x))&&pilot.sourceIdsNotInRegistry.length===0);
const embedded=page.match(/<script id="semantic-data" type="application\/json">([\s\S]*?)<\/script>/);
check('embedded_page_present',!!embedded);
try{const d=JSON.parse(embedded[1]);check('atlas_page_parity',d.ready===true&&JSON.stringify(d.assets)===JSON.stringify(atlas.assets))}catch{check('atlas_page_parity',false)}
check('no_client_network',!/fetch\s*\(|XMLHttpRequest|sendBeacon|localStorage|sessionStorage|<script\s+src=/i.test(page));
const script=page.match(/<script>([\s\S]*?)<\/script>/);
try{check('atlas_js_syntax',!!script&&!!new vm.Script(script[1]))}catch{check('atlas_js_syntax',false)}
const report={schema:'fmea-mining.technical-knowledge-record-audit.v1',version:'1.4.2',status:failures.length?'FAIL':'PASS',assertions,adversarialMutations:attacks,semanticDatasets:atlas.assets.length,sourceRegistryItems:sources.sources.length,realAssetTests:0,operationalApprovals:0,failures};
fs.mkdirSync('reports',{recursive:true});
fs.writeFileSync('reports/technical-knowledge-record.generated.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report,null,2));process.exit(failures.length?1:0);
