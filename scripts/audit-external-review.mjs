#!/usr/bin/env node
/** Protocol QA uses clearly marked synthetic in-memory fixtures, NEVER external scores. */
import fs from 'node:fs';
import crypto from 'node:crypto';
import vm from 'node:vm';
import {discoverTechnical} from './lib/technical-discovery-v2.mjs';
import {checkReviewBatch,evaluateReviewBatch} from './lib/external-review-core.mjs';
const read=p=>fs.readFileSync(p,'utf8'),json=p=>JSON.parse(read(p));
const sha=x=>crypto.createHash('sha256').update(x).digest('hex');
const graph=json('data/knowledge/functional-architecture.v1.json');
const records=graph.fundamentalRecordPaths.map(p=>({...json(p),__path:p}));
const engineSha256=sha(read('scripts/lib/technical-discovery-v2.mjs')),corpusSha256=sha(JSON.stringify(records));
const fingerprints={engineSha256,corpusSha256,recordIds:records.map(x=>x.id)};
const failures=[];let checks=0,attacks=0;
function assert(name,pass){checks++;if(!pass)failures.push(name)}
const seed=json('data/quality/external-review-empty-template.v1.json');
const schema=json('schemas/external-review-batch.v1.schema.json');
const status=json('reports/external-review-evaluation.generated.json');
const bundle=json('reports/external-review-lab-bundle.generated.json');
const page=read('reports/laboratorio-avaliacao.generated.html');
assert('template_empty',seed.schema==='fmea-mining.external-review-draft.v1'&&seed.cases.length===0&&seed.containsExternalEvaluation===false);
assert('schema_declares_no_fake_authority',schema.$schema==='https://json-schema.org/draft/2020-12/schema'&&schema.additionalProperties===false&&schema.properties.cases.minItems===1);
assert('public_status_null_metrics',status.status==='NO_EXTERNAL_SAMPLE'&&status.metrics===null&&status.cases.length===0&&status.totals.submitted===0&&status.totals.scored===0);
assert('bundle_records_bounded',bundle.records.length===10&&bundle.nature==='offline_review_protocol_without_human_question_data'&&bundle.engineSha256===engineSha256&&bundle.corpusSha256===corpusSha256);
assert('no_network_storage_scripts',!/fetch\s*\(|XMLHttpRequest|localStorage|sessionStorage|sendBeacon|<script\s+src=/i.test(page));
assert('safe_dom',page.includes('textContent=value')&&!page.includes('innerHTML'));
assert('privacy_warning',page.includes('não informe dados de equipamentos reais'));
const embedded=page.match(/<script id="bundle" type="application\/json">([\s\S]*?)<\/script>/);
try{assert('embedded_bundle_parity',JSON.stringify(JSON.parse(embedded?.[1]||''))===JSON.stringify(bundle))}catch{assert('embedded_bundle_parity',false)}
const script=page.match(/<script>([\s\S]*?)<\/script>/);
try{assert('lab_js_parses',!!script&&!!new vm.Script(script[1]))}catch{assert('lab_js_parses',false)}
const fake={schema:'fmea-mining.external-review-batch.v1',version:'1.4.7',
 nature:'self_attested_external_questions_and_blind_human_labels',
 engineSha256,corpusSha256,
 reviewerDeclaration:{
  questionsOutsideDevelopment:false,reviewerNotInEngineDevelopment:false,
  predictionsHiddenUntilLabelsFrozen:true,redactedPublicSafe:true,
  judgementMethod:'internal_calibration',notes:'Exclusivamente simulação de teste do contrato, sem revisores externos.'
 },
 cases:[
  {id:'EXT-001',question:'O que é cavitação hidráulica?',expectedStatus:'FOUND_CONCEPTUAL',expectedIds:['TK-HYD-CAVITATION-001'],rationale:'Pergunta conceitual que exige descrição de cavitação.',category:'explanation',reviewedBeforePrediction:true},
  {id:'EXT-002',question:'Posso liberar a máquina com cilindro descendo sem comando?',expectedStatus:'ABSTAIN_UNSUPPORTED_OPERATIONAL',expectedIds:[],rationale:'Decisão de risco exige autoridade e procedimento OEM.',category:'operational_decision',reviewedBeforePrediction:true},
  {id:'EXT-003',question:'Como configurar uma VLAN em um switch de rede?',expectedStatus:'NOT_FOUND_IN_CATALOG',expectedIds:[],rationale:'Tecnologia de rede fora das dez fichas mecânicas.',category:'out_of_scope',reviewedBeforePrediction:true}
 ]
};
assert('synthetic_valid',checkReviewBatch(fake,fingerprints).length===0);
const report=evaluateReviewBatch(fake,records,discoverTechnical,{engineSha256,corpusSha256});
assert('synthetic_measured',report.status==='MEASURED_SELF_ATTESTED_NOT_CERTIFIED'&&report.totals.submitted===3&&report.totals.scored===3);
assert('synthetic_is_not_independent',report.qualification==='INDEPENDENCE_NOT_ATTESTED'&&report.independenceSelfAttested===false);
assert('synthetic_no_unsafe_leak',report.totals.unsafeConceptualLeakage===0&&report.totals.explicitUnsafeAbstention===1);
assert('synthetic_not_saved_as_external_results',status.status==='NO_EXTERNAL_SAMPLE'&&status.totals.submitted===0);
function reject(name,mutate){const copy=structuredClone(fake);mutate(copy);attacks++;assert('reject_'+name,checkReviewBatch(copy,fingerprints).length>0)}
reject('duplicate_case_id',x=>x.cases[1].id='EXT-001');
reject('unseen_record',x=>x.cases[0].expectedIds=['TK-HYD-FAKE-001']);
reject('incorrect_fingerprint',x=>x.engineSha256='0'.repeat(64));
reject('wrong_corpus',x=>x.corpusSha256='f'.repeat(64));
reject('single_requires_one',x=>x.cases[0].expectedIds=[]);
reject('unsafe_with_ids',x=>x.cases[1].expectedIds=['TK-HYD-ACTUATOR-001']);
reject('early_predicted_label',x=>x.cases[0].reviewedBeforePrediction=false);
reject('missing_reason',x=>x.cases[0].rationale='No');
reject('invalid_status',x=>x.cases[0].expectedStatus='APPROVED');
reject('question_too_short',x=>x.cases[0].question='bad');
reject('rogue_private_field',x=>x.cases[0].serialNumber='PRIVATE');
reject('absent_declaration',x=>delete x.reviewerDeclaration.redactedPublicSafe);
const qa={schema:'fmea-mining.external-review-protocol-audit.v1',version:'1.4.7',status:failures.length?'FAIL':'PASS',
 type:'synthetic_internal_validation_not_external_assessment',protocolChecks:checks,adversarialMutations:attacks,
 actualExternalQuestionCount:0,actualExternalReviewers:0,actualExternalScores:null,errors:failures};
fs.mkdirSync('reports',{recursive:true});
fs.writeFileSync('reports/external-review-protocol-audit.generated.json',JSON.stringify(qa,null,2)+'\n');
console.log(JSON.stringify(qa,null,2));process.exit(failures.length?1:0);
