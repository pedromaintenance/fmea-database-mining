#!/usr/bin/env node
/** Real mutation-tests of the same policy used by the thermal public builder.
 * All observations and faults here are conceptual, no workers or assets. */
import fs from 'node:fs';
import vm from 'node:vm';
import crypto from 'node:crypto';
import {validateThermalDossier} from './lib/engine-cooling-thermal-contract.mjs';
const raw=p=>fs.readFileSync(p),read=p=>raw(p).toString('utf8'),json=p=>JSON.parse(read(p));
const d=json('data/knowledge/engine-cooling-thermal-differential.v1.json');
const pub=json('reports/engine-cooling-thermal.generated.json');
const registry=json('data/research/sources.v1.json');
const discovery=json('data/catalog/source-discovery.v1.json');
const template=read('docs/diagnostico-arrefecimento-motor.html');
const html=read('reports/diagnostico-arrefecimento-motor.generated.html');
const lock=json('data/quality/pilot-frozen-baseline.v1.json');
const sha1blob=b=>crypto.createHash('sha1').update(Buffer.concat([Buffer.from('blob '+b.length+'\0'),b])).digest('hex');
let count=0,mutationCount=0;const errors=[];
const ck=(id,ok)=>{count++;if(!ok)errors.push(id)};
const policy=validateThermalDossier(d,registry);
ck('real_canonical_policy_pass',policy.length===0);
ck('main_schema',d.schema==='fmea-mining.engine-cooling-thermal-differential.v1'&&d.version==='1.4.15');
ck('unreviewed_and_no_authority',d.status.evidenceClass==='CONCEPTUAL'&&d.status.reviewStatus==='PENDING_REVIEW'&&d.status.reviewedByHuman===false&&d.status.operationalApproval===false);
ck('no_machine_specific_claim',d.status.verifiedModels.length===0&&d.status.verifiedSerials.length===0&&d.status.oemLimits===null&&d.status.confirmedRootCauses===0);
ck('ten_hypotheses',d.hypotheses.length===10);
ck('eight_scenarios',d.scenarios.length===8);
ck('seven_primary_references',d.primarySourceNotes.length===7&&pub.sources.length===7&&pub.sources.every(x=>['Caterpillar','Perkins Engines'].includes(x.organization)));
ck('heat_transport_rejection_control_separated',d.conceptualHeatBalance.paths.length===4);
ck('cold_and_hot_context',d.scenarios.some(s=>s.id==='CL-S7')&&d.scenarios.some(s=>s.id==='CL-S1'));
ck('prohibition_of_removing_thermostat',d.safety.doNot.some(x=>/termostato/i.test(x))&&d.hypotheses.some(x=>x.id==='CL-THERMOSTAT'));
ck('after_service_airlock',d.scenarios.some(x=>x.id==='CL-S2'&&x.hypothesisIds.includes('CL-AIRLOCK')));
ck('coolant_loss_not_oil_mix',d.scenarios.some(x=>x.id==='CL-S5'&&x.invalidConclusion.includes('mistura com óleo')));
ck('false_temperature_not_ignore_alarm',d.scenarios.some(x=>x.id==='CL-S6'&&x.invalidConclusion.includes('ignorar')));
ck('flow_and_air_both_compete',d.scenarios.some(x=>x.id==='CL-S1'&&x.hypothesisIds.includes('CL-WATER-PUMP')&&x.hypothesisIds.includes('CL-AIR-FINS')));
ck('source_registry_114_unique',registry.sources.length===114&&new Set(registry.sources.map(x=>x.id)).size===114);
ck('discovery_same_registry_version',discovery.sourceRegistryVersion===registry.version&&discovery.version==='1.4.15'&&discovery.checkedLinksOnThisCycle===false);
const projected=registry.sources.map(x=>({id:x.id,organization:x.organization,title:x.title,url:x.url,area:x.area||null,role:x.role||null,limitation:x.limitation||'',lastReviewed:x.lastReviewed||null}));
ck('discovery_source_parity',JSON.stringify(projected)===JSON.stringify(discovery.sources));
ck('published_projection_same_dossier',JSON.stringify(pub.dossier)===JSON.stringify(d));
ck('published_same_sources',pub.sources.every(x=>registry.sources.some(y=>y.id===x.id&&y.url===x.url)));
ck('published_no_field_approval',pub.verifiedMachines===0&&pub.performedTests===0&&pub.confirmedCauses===0&&pub.operationalApprovals===0&&pub.changesFrozenPilot===false);
ck('public_reference_limits',d.primarySourceNotes.every(x=>x.doesNotSupport.length>40&&x.supports.length>30));
ck('crosslinks_exist',d.crossLinks.every(x=>fs.existsSync(x.path)));
ck('doc_requests_not_execution',d.documentRequirements.length===7&&d.documentRequirements.every(x=>x.notEstablished&&x.evidenceType.endsWith('_PRIVATE')));
ck('html_no_runtime_network',!/fetch\s*\(|XMLHttpRequest|localStorage|sessionStorage|sendBeacon|<script\s+src=/i.test(html));
ck('html_safe_dom',!template.includes('innerHTML')&&template.includes('el.textContent=value'));
const embedded=html.match(/<script id="thermal-data" type="application\/json">([\s\S]*?)<\/script>/);
try{ck('html_embedded_data_parity',JSON.stringify(JSON.parse(embedded?.[1]||''))===JSON.stringify(pub))}catch{ck('html_embedded_data_parity',false)}
try{const code=html.match(/<script>([\s\S]*?)<\/script>/)?.[1];ck('html_interaction_parses',!!code&&!!new vm.Script(code))}catch{ck('html_interaction_parses',false)}
ck('frozen_eleven_blob_ids_intact',lock.lockedFiles.length===11&&lock.lockedFiles.every(x=>sha1blob(raw(x.path))===x.gitBlobSha1));
ck('frozen_graph_exact',sha1blob(raw(lock.graphPath))===lock.graphGitBlobSha1);
ck('new_dossier_not_in_frozen_ten',json(lock.graphPath).fundamentalRecordPaths.length===10&&!json(lock.graphPath).fundamentalRecordPaths.some(x=>x.includes('cooling-thermal')));
ck('no_real_asset_reference',!read('data/knowledge/engine-cooling-thermal-differential.v1.json').includes('040-')&&!read('data/knowledge/engine-cooling-thermal-differential.v1.json').includes('KYD0'));
function mutation(name,fn){
 const candidate=structuredClone(d);fn(candidate);mutationCount++;
 const invalid=validateThermalDossier(candidate,registry);
 ck('reject_mutation_'+name,invalid.length>0);
}
mutation('engine_verified',c=>c.status.verifiedModels=['CAT 777']);
mutation('serial_verified',c=>c.status.verifiedSerials=['NOT-PUBLIC']);
mutation('field_test_claimed',c=>c.status.performedTests=1);
mutation('root_cause_claimed',c=>c.status.confirmedRootCauses=1);
mutation('oem_threshold',c=>c.status.oemLimits={temperature:110});
mutation('sap_approved',c=>c.status.sapMappingApproved=true);
mutation('operational_approval',c=>c.status.operationalApproval=true);
mutation('automatic_diagnosis',c=>c.status.automaticDiagnosisAllowed=true);
mutation('fake_review',c=>c.status.reviewedByHuman=true);
mutation('pilot_contamination',c=>c.frozenPilot.includedInFrozenSearch=true);
mutation('wrong_schema',c=>c.schema='other');
mutation('removed_safety',c=>c.safety.doNot=[]);
mutation('removed_thermostat_source',c=>c.primarySourceNotes.pop());
mutation('unknown_source',c=>c.hypotheses[0].sourceIds=['NONEXISTENT']);
mutation('unsupported_confirmed',c=>c.hypotheses[2].certainty='CONFIRMED');
mutation('machine_pressure_in_hypothesis',c=>c.hypotheses[1].oemTestPressure=2);
mutation('duplicate_hypothesis',c=>c.hypotheses[1].id=c.hypotheses[0].id);
mutation('unknown_scenario_hypothesis',c=>c.scenarios[0].hypothesisIds.push('CL-UNKNOWN'));
mutation('missing_scenario_counterclaim',c=>c.scenarios[0].invalidConclusion='');
mutation('fake_peer_review',c=>c.provenance.notPeerReviewed=false);
mutation('missing_discriminators',c=>c.hypotheses[0].discriminatingQuestions=[]);
mutation('missing_counterevidence',c=>c.hypotheses[3].competingInterpretations=[]);
const report={schema:'fmea-mining.engine-cooling-thermal-audit.v1',version:'1.4.15',
 status:errors.length?'FAIL':'PASS',checks:count,adversarialMutations:mutationCount,
 hypotheses:d.hypotheses.length,scenarios:d.scenarios.length,primarySources:pub.sources.length,
 bibliographySources:registry.sources.length,unchangedFrozenTechnicalFiles:11,
 realFieldTests:0,verifiedSerials:0,rootCausesConfirmed:0,operationalApprovals:0,errors};
fs.mkdirSync('reports',{recursive:true});
fs.writeFileSync('reports/engine-cooling-thermal-audit.generated.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report,null,2));
process.exit(errors.length?1:0);
