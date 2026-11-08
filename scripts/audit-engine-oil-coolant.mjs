#!/usr/bin/env node
/** Quality gate for scoped engine oil/coolant reasoning; rejects artificial
 * OEM authority and confirms no mutation of the frozen retrieval benchmark. */
import fs from 'node:fs';
import vm from 'node:vm';
import crypto from 'node:crypto';
const read=p=>fs.readFileSync(p,'utf8'),raw=p=>fs.readFileSync(p),json=p=>JSON.parse(read(p));
const dossier=json('data/knowledge/engine-oil-coolant-differential.v1.json');
const published=json('reports/engine-oil-coolant.generated.json');
const html=read('reports/contaminacao-oleo-arrefecimento.generated.html');
const template=read('docs/contaminacao-oleo-arrefecimento.html');
const registry=json('data/research/sources.v1.json');
const discovery=json('data/catalog/source-discovery.v1.json');
const lock=json('data/quality/pilot-frozen-baseline.v1.json');
const sourceMap=new Map(registry.sources.map(s=>[s.id,s]));
const hypothesisMap=new Map(dossier.hypotheses.map(h=>[h.id,h]));
const gitBlob=b=>crypto.createHash('sha1').update(Buffer.concat([Buffer.from('blob '+b.length+'\0'),b])).digest('hex');
const errors=[];let checks=0,mutations=0;
const ck=(name,truth)=>{checks++;if(!truth)errors.push(name)};
ck('schema_version',dossier.schema==='fmea-mining.engine-oil-coolant-differential.v1'&&dossier.version==='1.4.13');
ck('conceptual_scope',dossier.nature==='conceptual_maintenance_engineering_differential_not_asset_diagnosis');
ck('review_pending_no_approval',dossier.status.reviewStatus==='PENDING_REVIEW'&&dossier.status.evidenceClass==='CONCEPTUAL'&&dossier.status.peerReviewedByHuman===false&&dossier.status.operationalApproval===false&&dossier.status.sapMappingApproved===false&&dossier.status.automaticDiagnosisAllowed===false);
ck('no_claimed_asset_or_test',dossier.status.verifiedModels.length===0&&dossier.status.verifiedSerials.length===0&&dossier.status.performedTests===0&&dossier.status.fieldObservations===0&&dossier.status.confirmedRootCauses===0&&dossier.status.oemAcceptanceLimits===null);
ck('seven_unique_hypotheses',dossier.hypotheses.length===7&&hypothesisMap.size===7);
ck('six_unique_scenarios',dossier.examples.length===6&&new Set(dossier.examples.map(e=>e.id)).size===6);
ck('directional_nature_distinguished',Object.keys(dossier.directionalModel).length===3&&['oilIntoCoolant','coolantIntoOil','unresolved'].every(k=>!!dossier.directionalModel[k]?.caveat));
ck('all_hypotheses_unconfirmed',dossier.hypotheses.every(h=>h.certainty==='UNCONFIRMED'&&h.performedTests===0));
ck('source_trace_per_hypothesis',dossier.hypotheses.every(h=>h.sourceIds.length>=2&&h.sourceIds.every(id=>sourceMap.has(id))));
ck('evidence_and_counterclaims',dossier.hypotheses.every(h=>h.discriminatingQuestions.length>=2&&h.observableEvidence.length>0&&h.notEstablishedBy.length>=2));
ck('scenario_hypothesis_links',dossier.examples.every(e=>e.candidateIds.length>=3&&e.candidateIds.every(id=>hypothesisMap.has(id))&&e.missingEvidence.length>=2&&e.invalidInference.length>=25));
ck('bidirectional_no_fixed_gradient',dossier.directionalModel.oilIntoCoolant.caveat.includes('diferenciais locais de pressão')&&dossier.directionalModel.coolantIntoOil.caveat.includes('interferências'));
ck('cooler_competes_with_head_gasket',dossier.examples.some(e=>e.candidateIds.includes('EC-COOLER-CORE')&&e.candidateIds.includes('EC-HEAD-GASKET')));
ck('contaminated_supply_competes_with_internal',dossier.examples.some(e=>e.candidateIds.includes('EC-BULK-CONTAMINATION')&&e.candidateIds.includes('EC-COOLER-CORE')));
ck('laboratory_interference_competes',dossier.examples.some(e=>e.candidateIds.includes('EC-ANALYTICAL-INTERFERENCE')&&e.candidateIds.includes('EC-COOLER-CORE')));
ck('no_operational_tests_authorized',dossier.safety.notAuthorized.length>=4&&dossier.safety.riskOfContinuedUse.length>=40);
ck('status_applicability_empty',dossier.applicability.models.length===0&&dossier.applicability.serials.length===0&&dossier.applicability.coolerPartNumbers.length===0&&dossier.applicability.actualSampleResults.length===0&&dossier.applicability.pressureThresholds===null&&dossier.applicability.confirmedFailures===0);
ck('five_source_notes',dossier.sources.length===5&&new Set(dossier.sources.map(x=>x.sourceId)).size===5&&dossier.sources.every(x=>sourceMap.has(x.sourceId)&&x.supports.length>20&&x.doesNotSupport.length>20));
ck('public_projection_matches',JSON.stringify(published.dossier)===JSON.stringify(dossier)&&published.realAssets===0&&published.performedFieldTests===0&&published.verifiedOemLimits===0);
ck('public_sources_parity',published.sources.length===5&&published.sources.every(x=>sourceMap.get(x.id)?.url===x.url));
ck('registry_105_sources',registry.sources.length===105&&new Set(registry.sources.map(x=>x.id)).size===105);
const expected=registry.sources.map(x=>({id:x.id,organization:x.organization,title:x.title,url:x.url,area:x.area||null,role:x.role||null,limitation:x.limitation||'',lastReviewed:x.lastReviewed||null}));
ck('discovery_registry_exact',JSON.stringify(discovery.sources)===JSON.stringify(expected)&&discovery.sourceRegistryVersion===registry.version&&discovery.checkedLinksOnThisCycle===false);
ck('html_no_network_or_storage',!/fetch\s*\(|XMLHttpRequest|localStorage|sessionStorage|sendBeacon|<script\s+src=/i.test(html));
ck('html_no_unsafe_dom',!template.includes('innerHTML')&&template.includes('textContent=value'));
const embedded=html.match(/<script id="dossier" type="application\/json">([\s\S]*?)<\/script>/);
try{ck('browser_data_parity',JSON.stringify(JSON.parse(embedded?.[1]||''))===JSON.stringify(published))}catch{ck('browser_data_parity',false)}
const script=html.match(/<script>([\s\S]*?)<\/script>/)?.[1];
try{ck('browser_script_parses',!!script&&!!new vm.Script(script))}catch{ck('browser_script_parses',false)}
ck('frozen_baseline_same_engine',lock.lockedFiles.every(x=>gitBlob(raw(x.path))===x.gitBlobSha1));
ck('frozen_baseline_graph',gitBlob(raw(lock.graphPath))===lock.graphGitBlobSha1);
const graph=json(lock.graphPath);
ck('new_dossier_excluded_from_blinded_corpus',graph.fundamentalRecordPaths.length===10&&!graph.fundamentalRecordPaths.some(p=>p.includes('engine-oil-coolant')));
ck('record_labeled_postfreeze',dossier.baseline.lockedPilotVersion==='1.4.11'&&dossier.baseline.postFreezeAdditionalKnowledge===true&&dossier.baseline.eligibleAsBlindPilotMaterial===false);
ck('no_PRIVATE_asset_case',!read('data/knowledge/engine-oil-coolant-differential.v1.json').includes('040-003')&&!read('data/knowledge/engine-oil-coolant-differential.v1.json').includes('KYD0'));
for(const key of ['operationalApproval','sapMappingApproved','automaticDiagnosisAllowed']){
 const forged=structuredClone(dossier);forged.status[key]=true;mutations++;
 ck('detect_false_'+key,forged.status[key]!==false);
}
for(const value of ['models','serials','coolerPartNumbers']){
 const forged=structuredClone(dossier);forged.applicability[value].push('PRIVATE');mutations++;
 ck('detect_unverified_'+value,forged.applicability[value].length!==0);
}
for(const h of dossier.hypotheses.slice(0,4)){
 const altered={...h,certainty:'CONFIRMED'};mutations++;
 ck('detect_unverified_mechanism_'+h.id,altered.certainty!=='UNCONFIRMED');
}
for(const e of dossier.examples.slice(0,4)){
 const altered={...e,candidateIds:['EC-NONEXISTENT']};mutations++;
 ck('detect_invalid_foreign_id_'+e.id,!altered.candidateIds.every(x=>hypothesisMap.has(x)));
}
const result={schema:'fmea-mining.engine-oil-coolant-audit.v1',version:'1.4.13',status:errors.length?'FAIL':'PASS',
 checks,adversarialMutations:mutations,hypotheses:7,scenarios:6,sourceRegistryCount:registry.sources.length,
 frozenSourcesChecked:lock.lockedFiles.length,changedFrozenTechnicalFiles:0,realAssetStudies:0,performedFieldTests:0,
 claimedOperationalApproval:false,errors};
fs.mkdirSync('reports',{recursive:true});
fs.writeFileSync('reports/engine-oil-coolant-audit.generated.json',JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify(result,null,2));process.exit(errors.length?1:0);
