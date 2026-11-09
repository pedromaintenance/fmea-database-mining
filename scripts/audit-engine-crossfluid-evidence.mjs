#!/usr/bin/env node
/** Verify documentary evidence quality and no accidental OEM/asset authority. */
import fs from 'node:fs';
import crypto from 'node:crypto';
import vm from 'node:vm';
import {emptyCrossfluidChecklist,validateCrossfluidChecklist,assessCrossfluidEvidence,buildCrossfluidRequest} from './lib/engine-crossfluid-evidence.mjs';
const read=p=>fs.readFileSync(p,'utf8'),raw=p=>fs.readFileSync(p),json=p=>JSON.parse(read(p));
const matrix=json('data/quality/engine-crossfluid-evidence-matrix.v1.json');
const dossier=json(matrix.parentDossier),registry=json('data/research/sources.v1.json');
const discovery=json('data/catalog/source-discovery.v1.json');
const published=json('reports/engine-crossfluid-evidence.generated.json');
const html=read('reports/matriz-evidencias-oleo-arrefecimento.generated.html');
const template=read('docs/matriz-evidencias-oleo-arrefecimento.html');
const lock=json('data/quality/pilot-frozen-baseline.v1.json');
const sha=s=>crypto.createHash('sha256').update(s).digest('hex');
const blob=b=>crypto.createHash('sha1').update(Buffer.concat([Buffer.from('blob '+b.length+'\0'),b])).digest('hex');
const sourceIds=new Set(registry.sources.map(x=>x.id));
const evidenceIds=new Set(matrix.evidence.map(x=>x.id));
const mechanismIds=new Set(dossier.hypotheses.map(x=>x.id));
let checks=0,adversarialMutations=0;const errors=[];
const check=(id,truth)=>{checks++;if(!truth)errors.push(id)};
check('matrix_version',matrix.schema==='fmea-mining.engine-crossfluid-evidence-matrix.v1'&&matrix.version==='1.4.14');
check('matrix_not_asset',matrix.nature==='documentary_evidence_request_matrix_not_machine_diagnosis'&&matrix.realAssets===0&&matrix.realOemEffectivitiesVerified===0&&matrix.realFieldStudies===0);
check('approval_and_sap_false',matrix.rootCausesConfirmed===0&&matrix.operationalApprovals===0&&matrix.sapActions===0&&matrix.reviewStatus==='PENDING_REVIEW');
check('14_unique_evidence',evidenceIds.size===14&&matrix.evidence.length===14);
check('7_distinct_hypothesis_gates',matrix.hypothesisGates.length===7&&new Set(matrix.hypothesisGates.map(x=>x.hypothesisId)).size===7);
check('hypothesis_parity_with_dossier',matrix.hypothesisGates.every(g=>mechanismIds.has(g.hypothesisId))&&mechanismIds.size===matrix.hypothesisGates.length);
check('all_evidence_scoped_and_sourced',matrix.evidence.every(e=>e.kind&&e.title&&e.request.length>45&&e.warning.length>25&&e.sourceIds.length>=1&&e.sourceIds.every(id=>sourceIds.has(id))&&e.privacy==='PRIVATE_REFS_ONLY_NO_ASSET_DATA_IN_PUBLIC_REPO'));
check('all_gates_have_doc_bases',matrix.hypothesisGates.every(g=>g.commonRequired.length===5&&g.specificRequired.length>=3&&g.interpretationBoundary.length>60));
check('all_gate_refs_exist',matrix.hypothesisGates.every(g=>[...g.commonRequired,...g.specificRequired].every(id=>evidenceIds.has(id))));
check('common_gate_parity',matrix.hypothesisGates.every(g=>JSON.stringify(g.commonRequired)===JSON.stringify(matrix.commonRequired)));
check('no_duplicate_gate_requirements',matrix.hypothesisGates.every(g=>new Set([...g.commonRequired,...g.specificRequired]).size===g.commonRequired.length+g.specificRequired.length));
check('no_automatic_oem_proven',matrix.hypothesisGates.every(g=>g.unverifiedUntilOem===true&&g.automaticPromotion===false));
check('private_custody_policy',matrix.controlledArtifacts.realDocumentsBelongIn==='corporate_private_system_outside_public_git'&&matrix.controlledArtifacts.requireIdentityAuth===true&&matrix.controlledArtifacts.automaticVerificationAvailable===false&&matrix.controlledArtifacts.authorityToTestOrRelease===false);
check('nonduplicated_references',registry.sources.length>=107&&sourceIds.size===registry.sources.length);
check('all_matrix_sources_exist',matrix.sources.every(id=>sourceIds.has(id))&&new Set(matrix.sources).size===matrix.sources.length);
const expected=registry.sources.map(s=>({id:s.id,organization:s.organization,title:s.title,url:s.url,area:s.area||null,role:s.role||null,limitation:s.limitation||'',lastReviewed:s.lastReviewed||null}));
check('bibliography_synced',JSON.stringify(discovery.sources)===JSON.stringify(expected)&&discovery.sourceRegistryVersion===registry.version);
check('valid_bundle_fingerprints',published.matrixSha256===sha(JSON.stringify(matrix))&&published.engineDossierSha256===sha(JSON.stringify(dossier)));
check('no_bundle_human_data',published.actualEvidenceRecords===0&&published.operationalApprovals===0&&published.realAssets===0&&published.independentHumanReviews===0);
check('bundle_same_source_set',published.sources.length===matrix.sources.length&&published.sources.every(s=>matrix.sources.includes(s.id)));
check('bundle_matrix_parity',JSON.stringify(published.matrix)===JSON.stringify(matrix)&&JSON.stringify(published.dossier)===JSON.stringify(dossier));
check('browser_template_has_markers',template.includes('MATRIX_CORE_PLACEHOLDER')&&template.includes('MATRIX_PLACEHOLDER'));
check('no_network_or_persistent_storage',!/fetch\s*\(|XMLHttpRequest|localStorage|sessionStorage|sendBeacon|<script\s+src=/i.test(html));
check('safe_dom_uses_textContent',!html.includes('innerHTML')&&html.includes('n.textContent=text'));
const embedded=html.match(/<script id="matrix-bundle" type="application\/json">([\s\S]*?)<\/script>/);
try{check('embedded_bundle_parity',JSON.stringify(JSON.parse(embedded?.[1]||''))===JSON.stringify(published))}catch{check('embedded_bundle_parity',false)}
try{const script=html.match(/<script>([\s\S]*?)<\/script>/)?.[1];check('browser_script_parses',!!script&&!!new vm.Script(script))}catch{check('browser_script_parses',false)}
check('pilot_source_lock_frozen',lock.lockedFiles.length===11&&lock.lockedFiles.every(e=>blob(raw(e.path))===e.gitBlobSha1));
check('pilot_graph_lock_frozen',blob(raw(lock.graphPath))===lock.graphGitBlobSha1);
check('no_postfreeze_knowledge_in_corpus',!json(lock.graphPath).fundamentalRecordPaths.some(p=>p.includes('engine-crossfluid')||p.includes('engine-oil-coolant')));
const clean=emptyCrossfluidChecklist(published),cleanValidation=validateCrossfluidChecklist(clean,published);
check('initial_checklist_valid',cleanValidation.length===0);
check('default_no_marked_documents',Object.values(clean.available).every(v=>v===false));
const initial=assessCrossfluidEvidence(clean,published);
check('initial_missing_all',initial.status==='DOCUMENTS_NOT_YET_SELF_ATTESTED'&&initial.completed===0&&initial.total>=8);
check('initial_no_authority',initial.humanEvidenceVerified===false&&initial.rootCauseConfirmed===false&&initial.operationalApproval===false&&initial.sapActionAuthorized===false&&initial.readyForPhysicalTest===false);
check('request_lists_missing',buildCrossfluidRequest(clean,published).includes('SOLICITAÇÃO DOCUMENTAL')&&buildCrossfluidRequest(clean,published).includes('DOC-ASSET'));
for(const gate of matrix.hypothesisGates){
 const input=emptyCrossfluidChecklist(published);input.selectedHypothesisId=gate.hypothesisId;
 const first=assessCrossfluidEvidence(input,published);
 check('gate_unique_'+gate.hypothesisId,first.required.length===gate.commonRequired.length+gate.specificRequired.length);
 check('gate_missing_'+gate.hypothesisId,first.missing.length===first.total);
 for(const id of first.required)input.available[id]=true;
 const after=assessCrossfluidEvidence(input,published);
 check('gate_only_self_attested_'+gate.hypothesisId,after.status==='DOCUMENT_SET_SELF_ATTESTED_FOR_HUMAN_REVIEW_ONLY'&&after.missing.length===0&&after.humanEvidenceVerified===false&&after.operationalApproval===false);
 const request=buildCrossfluidRequest(input,published);
 check('no_physical_test_instruction_'+gate.hypothesisId,!request.includes('desmontar')&&!request.includes('pressurizar')&&request.includes('Sem confirmação de causa'));
}
function reject(name,fn){
 const candidate=structuredClone(clean);fn(candidate);adversarialMutations++;
 check('reject_'+name,validateCrossfluidChecklist(candidate,published).length>0);
}
reject('extra_sensitive_serial',x=>x.serialNumber='secret');
reject('fake_oem_approval',x=>x.operationalApproval=true);
reject('different_source_hash',x=>x.matrixSha256='0'.repeat(64));
reject('different_dossier_hash',x=>x.engineDossierSha256='1'.repeat(64));
reject('wrong_version',x=>x.version='1.4.13');
reject('false_nature',x=>x.nature='certified');
reject('unknown_mechanism',x=>x.selectedHypothesisId='EC-FAKE');
reject('unknown_evidence_id',x=>x.available['DOC-SECRET']=true);
reject('missing_document',x=>delete x.available['DOC-ASSET']);
reject('non_boolean',x=>x.available['DOC-ASSET']='true');
reject('array_as_map',x=>x.available=[]);
reject('unexpected_notes',x=>x.notes='engine series/private diagnosis');
const report={schema:'fmea-mining.engine-crossfluid-evidence-audit.v1',version:'1.4.14',
 status:errors.length?'FAIL':'PASS',checks,adversarialMutations,
 evidenceRequirements:matrix.evidence.length,hypotheses:matrix.hypothesisGates.length,
 bibliographySources:registry.sources.length,frozenTechnicalFiles:lock.lockedFiles.length,
 realEvidenceRecords:0,verifiedOemEffectivities:0,diagnosesConfirmed:0,
 approvedOperations:0,errors};
fs.mkdirSync('reports',{recursive:true});
fs.writeFileSync('reports/engine-crossfluid-evidence-audit.generated.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report,null,2));
process.exit(errors.length?1:0);
