#!/usr/bin/env node
/**
 * FMEA 1.3.32 — D9 public Caterpillar research. No OEM serial/arrangement
 * applicability is inferred. All new content is public bibliographic metadata.
 */
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const data=read('data/research/d9-public-oem-literature.v1.json');
const fixture=read('data/quality/d9-public-oem-regressions.v1.json');
const schema=read('schemas/d9-public-oem-literature.schema.json');
const original=read('data/quality/oem-d9-evidence-intake.v1.json');
const request=read('data/governance/d9-oem-evidence-request.v1.json');
const upstream=read('data/research/sources.v1.json');
const core=read('data/knowledge/causal-chains.v1.json');
const errors=[],ck=(v,msg)=>{if(!v)errors.push(msg)};
const exact=(x,fields)=>x&&typeof x==='object'&&!Array.isArray(x)&&Object.keys(x).length===fields.length&&fields.every(k=>Object.hasOwn(x,k));
const clone=x=>JSON.parse(JSON.stringify(x));
const publicSources=[
['CAT-DOZER-UC-MAINT','https://www.cat.com/en_US/articles/for-owners/dozer-undercarriage-maintenance.html',true],
['CAT-UC-DOZER-GUIDE','https://www.cat.com/en_US/support/maintenance/undercarriage/dozers/',true],
['CAT-UC-MINING-CHOICES-D9','https://www.cat.com/en_US/support/maintenance/undercarriage.html',false],
['CAT-CTS-PRO-EXPERT','https://www.cat.com/en_US/blog/mining/articles/get-expert-undercarriage-maintenance-and-repair.html',false],
['CAT-DOZER-TRACK-TENSION-PUBLIC','https://www.cat.com/en_US/articles/for-owners/how-to-check-dozer-track-tension.html/',false]
];
const expected=[
['serial-prefix','context_only_no_serial',['CAT-UC-MINING-CHOICES-D9']],
['oem-omm','method_pointer_no_effectivity',['CAT-DOZER-UC-MAINT']],
['oem-parts','options_only_no_bill_of_material',['CAT-UC-MINING-CHOICES-D9']],
['oem-bolting','general_method_no_torque_value',['CAT-UC-DOZER-GUIDE']],
['oem-cts','service_exists_no_measurement_baseline',['CAT-CTS-PRO-EXPERT']],
['sap-master','no_public_cat_evidence_for_sap',[]],
['field-review','visual_practice_only_no_field_event',['CAT-DOZER-UC-MAINT','CAT-DOZER-TRACK-TENSION-PUBLIC']]
];
const rowFields=['id','originInputId','requestId','sourceState','generalFinding','sourceIds','evidenceSupportClass','missingPrivateEvidence','requestDiscipline','canIdentifyInstalledArrangement','canVerifySerialEffectivity','canApproveParts','canApproveCTSLimits','canApproveTorqueTurnValues','canConfirmFieldFailure','documentOrInspectionReceived','independentReviewer','manualDisposition'];
const falseFields=['canIdentifyInstalledArrangement','canVerifySerialEffectivity','canApproveParts','canApproveCTSLimits','canApproveTorqueTurnValues','canConfirmFieldFailure','documentOrInspectionReceived'];
const top=['schema','version','pilotId','modelId','nature','sourceOfTruth','sourceRequest','researchDate','sources','mappings','interpretationRules','unresolvedDependencies','counts','confirmedOEMLimits','reviewDecision','coreFmeaChanged','corporateSystemsAccessed','privateManualCopied'];
const sourceFields=['id','title','url','existingCatalogSource','scope','limitedFinding'];
const safeRules=['treatProductFamilyAvailabilityAsInstalledConfiguration','treatOtherDozerOrExcavatorMeasurementsAsApplicableToD9','treatPublicTorqueTurnMentionAsAnExecutableTorqueSpecification','treatCTSMarketingAsApprovedMeasurementBaseline','doNotUseGeneralGuidanceToOverrideOEMOMM','doNotReproduceRestrictedSISManuals','mustReviewRightsBeforeUsingOEMDocumentation','privateEvidenceRequiredBeforeFieldProcedure'];
function verify(x){
 const err=[],c=(v,s)=>{if(!v)err.push(s)};
 c(exact(x,top),'top_level_fields_mismatch');if(!x||typeof x!=='object')return err;
 c(x.schema==='fmea-mining.d9-public-oem-research.v1'&&x.version==='1.3.32'&&x.nature==='caterpillar_public_source_review_not_oem_serial_homologation','research_identity_incorrect');
 c(x.pilotId===original.pilotId&&x.modelId===original.modelId&&x.sourceOfTruth==='data/quality/oem-d9-evidence-intake.v1.json'&&x.sourceRequest==='data/governance/d9-oem-evidence-request.v1.json','pilot_or_upstream_source_changed');
 c(x.researchDate==='2026-10-21','undocumented_research_date');
 c(Array.isArray(x.sources)&&x.sources.length===5,'five_public_sources_required');
 for(let i=0;i<publicSources.length;i++){
  const [id,url,exists]=publicSources[i],s=x.sources?.[i];
  c(exact(s,sourceFields),'public_source_shape_'+i);
  if(!s)continue;
  c(s.id===id&&s.url===url&&s.existingCatalogSource===exists,'source_url_or_id_altered_'+id);
  c(s.url.startsWith('https://www.cat.com/')&&!s.url.includes('?')&&s.title?.length>18&&s.scope?.length>12&&s.limitedFinding?.length>110,'unreliable_source_'+id);
  if(exists)c(upstream.sources.some(z=>z.id===id&&z.url===url),'existing_source_register_drift_'+id);
 }
 c(Array.isArray(x.mappings)&&x.mappings.length===7,'seven_gates_required');
 for(let i=0;i<expected.length;i++){
  const [gate,className,refs]=expected[i],m=x.mappings?.[i],orig=original.requiredInputs[i],req=request.gates[i];
  c(exact(m,rowFields),'map_unapproved_fields_'+gate);
  if(!m)continue;
  c(m.id==='PUB-D9-'+String(i+1).padStart(2,'0')&&m.originInputId===gate&&m.requestId===req?.id&&orig?.id===gate,'wrong_request_mapping_'+gate);
  c(m.sourceState===orig?.sourceStatus&&m.requestDiscipline===orig?.responsibleDiscipline,'upstream_status_or_discipline_altered_'+gate);
  c(m.evidenceSupportClass===className&&JSON.stringify(m.sourceIds)===JSON.stringify(refs),'false_support_classification_'+gate);
  c(m.generalFinding?.length>=90&&m.missingPrivateEvidence?.length>=95,'insufficient_limit_or_claim_'+gate);
  c(falseFields.every(k=>m[k]===false)&&m.independentReviewer===null&&m.manualDisposition==='remain_blocked','premature_acceptance_'+gate);
 }
 c(Array.isArray(x.unresolvedDependencies)&&x.unresolvedDependencies.length===4&&x.unresolvedDependencies.every(y=>typeof y==='string'&&y.length>=50),'external_evidence_gate_missing');
 const rules=x.interpretationRules||{};
 c(exact(rules,['publicInformationCanSupport','publicInformationCannotSupport',...safeRules]),'boundary_rules_altered');
 c(safeRules.slice(0,4).every(k=>rules[k]===false)&&safeRules.slice(4).every(k=>rules[k]===true),'public_pages_used_as_oem_manual');
 c(typeof rules.publicInformationCanSupport==='string'&&rules.publicInformationCanSupport.length>=110&&typeof rules.publicInformationCannotSupport==='string'&&rules.publicInformationCannotSupport.length>=140,'technical_limits_missing');
 c(JSON.stringify(x.counts)===JSON.stringify({publicSourcesReviewed:5,existingRegistrySourcesReused:2,newPublicSourceReferences:3,gatesMapped:7,gatesStillBlocked:7,effectivityVerified:0,fieldReviewsPerformed:0,requestSent:0,confirmedMechanicalRootCauses:0}),'false_approval_or_source_counts');
 c(Array.isArray(x.confirmedOEMLimits)&&x.confirmedOEMLimits.length===0&&x.reviewDecision==='general_literature_only_not_applicable_to_machine'&&x.coreFmeaChanged===false&&x.corporateSystemsAccessed===false&&x.privateManualCopied===false,'oem_or_real_approval_invented');
 c(original.requiredInputs.every(y=>y.approved===false&&y.sourceValue===null)&&request.gates.every(y=>y.requested===false&&y.received===false&&y.approved===false),'upstream_now_contains_real_evidence_reinspect');
 c(core.records.length===24,'existing_fmea_core_changed');
 return err;
}
errors.push(...verify(data));
ck(schema.additionalProperties===false&&schema.properties.version.const==='1.3.32'&&schema.properties.mappings.items.additionalProperties===false&&schema.properties.mappings.items.properties.canVerifySerialEffectivity.const===false,'research_schema_missing_boundaries');
ck(fixture.schema==='fmea-mining.d9-public-oem-research-regressions.v1'&&fixture.version==='1.3.32'&&fixture.nature==='synthetic_mutations_only','fixture_provenance_invalid');
ck(fixture.baselineCases.length===7&&fixture.mutationCases.length===24&&JSON.stringify(fixture.counts)===JSON.stringify({baselines:7,rejectedMutations:24,total:31,fieldEvents:0,serialEffectiveProcedures:0}),'fixture_count_wrong');
const map=(x,id)=>x.mappings.find(m=>m.originInputId===id);
const mutate={
 fake_serial_verified:x=>map(x,'serial-prefix').canVerifySerialEffectivity=true,
 fake_cts_approved:x=>map(x,'oem-cts').canApproveCTSLimits=true,
 fake_torque_approved:x=>map(x,'oem-bolting').canApproveTorqueTurnValues=true,
 fake_parts_approved:x=>map(x,'oem-parts').canApproveParts=true,
 fake_field_failure:x=>map(x,'field-review').canConfirmFieldFailure=true,
 fake_request_sent:x=>x.counts.requestSent=1,
 fake_installed_arrangement:x=>map(x,'serial-prefix').canIdentifyInstalledArrangement=true,
 fake_source_doc_receipt:x=>map(x,'oem-omm').documentOrInspectionReceived=true,
 invent_pn:x=>map(x,'oem-parts').partNumber='TEST-FAKE',
 invent_torque_nm:x=>map(x,'oem-bolting').torqueNm=500,
 invent_cts_percent:x=>map(x,'oem-cts').wearPercentLimit=75,
 insert_oem_manual:x=>x.privateManualText='TEST-NOT-REAL',
 insert_sap_location:x=>map(x,'sap-master').sapLocation='TEST-FUNC-LOC',
 drop_omm_mapping:x=>x.mappings.splice(1,1),
 duplicate_rodante_gate:x=>x.mappings.push({...x.mappings[0]}),
 remove_cat_source:x=>x.sources.pop(),
 invent_private_url:x=>map(x,'field-review').privateUrl='https://example.invalid/secret',
 change_cat_url:x=>x.sources[2].url='https://www.cat.com/en_US/other.html',
 cross_link_unknown_source:x=>map(x,'sap-master').sourceIds.push('CAT-NONEXISTENT'),
 fake_independent_review:x=>map(x,'field-review').independentReviewer='TEST-REVIEWER',
 fake_readiness_count:x=>x.counts.gatesStillBlocked=6,
 fake_release_decision:x=>x.reviewDecision='approved',
 disable_omm_override:x=>x.interpretationRules.doNotUseGeneralGuidanceToOverrideOEMOMM=false,
 claim_interchangeability_without_arrangement:x=>map(x,'oem-parts').evidenceSupportClass='proven_interchangeability_on_installed_D9'
};
const ids=new Set(),stats={baseline:0,rejected:0};
for(const row of fixture.baselineCases){ck(!ids.has(row.id),'duplicate_test_id');ids.add(row.id);const q=map(data,row.originInputId);if(q?.manualDisposition===row.expected&&q.canVerifySerialEffectivity===false)stats.baseline++;else errors.push('invalid_baseline_'+row.id);}
for(const row of fixture.mutationCases){ck(!ids.has(row.id),'duplicate_test_id');ids.add(row.id);const x=clone(data),fn=mutate[row.mutation];if(!fn){errors.push('unknown_mutation_'+row.id);continue;}fn(x);if(row.expected!=='reject'||verify(x).length===0)errors.push('unsafe_mutation_accepted_'+row.id+':'+row.mutation);else stats.rejected++;}
ck(stats.baseline===7&&stats.rejected===24,'test_counts_failed');
console.log(JSON.stringify({status:errors.length?'FAIL':'OK',publicOfficialReferences:5,gatesReviewed:7,syntheticBaseline:stats.baseline,adversarialRejections:stats.rejected,totalRegressions:31,verifiedOEMSerialEffectivity:0,fieldReviewsCompleted:0,publicContractChanged:false,errors:errors.slice(0,25)},null,2));
process.exit(errors.length?1:0);
