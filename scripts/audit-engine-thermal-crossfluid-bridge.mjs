#!/usr/bin/env node
/** Adversarial provenance and safety audit of the public diesel bridge. */
import fs from 'node:fs';
import crypto from 'node:crypto';
import vm from 'node:vm';
import {validateBridge} from './lib/engine-thermal-crossfluid-contract.mjs';
const raw=p=>fs.readFileSync(p),read=p=>raw(p).toString('utf8'),json=p=>JSON.parse(read(p));
const b=json('data/knowledge/engine-thermal-crossfluid-bridge.v1.json');
const c=json(b.parentStudies[0].path),t=json(b.parentStudies[1].path),m=json(b.evidenceMatrix),r=json(b.sourceRegistry);
const generated=json('reports/engine-thermal-crossfluid-bridge.generated.json');
const html=read('reports/diagnostico-combinado-motor.generated.html');
const template=read('docs/diagnostico-combinado-motor.html');
const lock=json('data/quality/pilot-frozen-baseline.v1.json');
const blobSha=content=>crypto.createHash('sha1').update(Buffer.concat([Buffer.from('blob '+content.length+'\0'),content])).digest('hex');
let tests=0,mutations=0;const errors=[];
const ck=(name,test)=>{tests++;if(!test)errors.push(name)};
ck('canonical_pass',validateBridge(b,c,t,m,r).length===0);
ck('source_count_stable',r.sources.length===114&&b.provenance.sourceCountAdded===0);
ck('no_raw_private_data',!read('data/knowledge/engine-thermal-crossfluid-bridge.v1.json').includes('040-')&&!read('data/knowledge/engine-thermal-crossfluid-bridge.v1.json').includes('KYD0'));
ck('frozen_files_blob_unchanged',lock.lockedFiles.length===11&&lock.lockedFiles.every(x=>blobSha(raw(x.path))===x.gitBlobSha1));
ck('frozen_graph_blob_unchanged',blobSha(raw(lock.graphPath))===lock.graphGitBlobSha1);
ck('frozen_graph_scope',json(lock.graphPath).fundamentalRecordPaths.length===10&&!json(lock.graphPath).fundamentalRecordPaths.some(x=>x.includes('thermal-crossfluid')));
ck('public_no_authority',generated.verifiedAssets===0&&generated.fieldTests===0&&generated.confirmedCauses===0&&generated.operationalApprovals===0&&generated.changedFrozenPilot===false);
ck('public_projection_parity',JSON.stringify(generated.bridge)===JSON.stringify(b));
ck('source_references_present',generated.sources.every(s=>r.sources.some(x=>x.id===s.id&&x.url===s.url)));
ck('documents_linked',generated.evidence.length===21);
ck('18_competing_interpretations',b.scenarios.length===6&&b.scenarios.every(s=>s.alternatives.length===3));
ck('relations_all_represented',new Set(b.scenarios.flatMap(s=>s.alternatives.map(a=>a.relation))).size===4);
ck('source_editorial_disclaimer',b.epistemicRule.includes('síntese editorial')&&b.provenance.peerReview==='NOT_PERFORMED');
ck('html_no_network_or_unsafe_dom',!/fetch\s*\(|XMLHttpRequest|localStorage|sessionStorage|sendBeacon|innerHTML|<script\s+src=/i.test(html));
ck('html_safe_text_nodes',template.includes('e.textContent=txt')&&!template.includes('innerHTML'));
try{const j=html.match(/<script id="bridge-data" type="application\/json">([\s\S]*?)<\/script>/)?.[1];ck('html_json_parity',JSON.stringify(JSON.parse(j))===JSON.stringify(generated))}catch{ck('html_json_parity',false)}
try{const js=html.match(/<script>([\s\S]*?)<\/script>/)?.[1];ck('html_script_compiles',!!new vm.Script(js))}catch{ck('html_script_compiles',false)}
function mutation(name,fn){const x=structuredClone(b);fn(x);mutations++;ck('reject_'+name,validateBridge(x,c,t,m,r).length>0)}
mutation('verified_asset',x=>x.status.assetCount=1);
mutation('serial',x=>x.status.verifiedSerials.push('MOCK'));
mutation('oem_limit',x=>x.status.oemTestLimits={temperature:95});
mutation('field_test',x=>x.status.fieldTests=1);
mutation('fake_review',x=>x.status.humanReviewCompleted=true);
mutation('root_cause',x=>x.status.confirmedCauses=1);
mutation('sap_write',x=>x.status.sapWrites=1);
mutation('automatic_diagnosis',x=>x.status.automaticDiagnosis=true);
mutation('new_field',x=>x.status.operatingRelease=true);
mutation('remove_safety',x=>x.safety.never=[]);
mutation('unknown_thermal_hypothesis',x=>x.scenarios[0].alternatives[0].hypothesisIds[0]='CL-FAKE');
mutation('crossfluid_only',x=>x.scenarios[0].alternatives[0].hypothesisIds=['EC-RESIDUAL','EC-HEAD-GASKET']);
mutation('unknown_document',x=>x.scenarios[1].alternatives[0].evidenceRefs=['EC:NOT-A-DOC']);
mutation('fake_certainty',x=>x.scenarios[0].alternatives[0].certainty='CONFIRMED');
mutation('deleted_counterproof',x=>x.scenarios[2].alternatives[0].counterEvidence='');
mutation('missing_alternative',x=>x.scenarios[3].alternatives.pop());
mutation('pilot_contamination',x=>x.frozenPilot.includedInFrozenRetrieval=true);
mutation('fake_peer',x=>x.provenance.peerReview='DONE');
mutation('unknown_relation',x=>x.scenarios[5].alternatives[0].relation='ROOT_CAUSE');
mutation('claimed_operation',x=>x.status.operationalApproval=true);
const report={schema:'fmea-mining.engine-thermal-crossfluid-audit.v1',version:'1.4.16',status:errors.length?'FAIL':'PASS',checks:tests,adversarialMutations:mutations,scenarios:6,interpretations:18,priorSources:114,addedSources:0,unchangedFrozenFiles:11,fieldEvidence:0,independentHumanReviews:0,confirmedCauses:0,operationalApprovals:0,errors};
fs.mkdirSync('reports',{recursive:true});fs.writeFileSync('reports/engine-thermal-crossfluid-bridge-audit.generated.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report,null,2));process.exit(errors.length?1:0);
