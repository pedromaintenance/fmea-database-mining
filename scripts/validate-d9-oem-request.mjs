#!/usr/bin/env node
/** FMEA v1.3.31 — verify a D9 OEM literature REQUEST, not OEM applicability, receipt or field evidence. */
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const manifest=read('data/governance/d9-oem-evidence-request.v1.json');
const fixtures=read('data/quality/d9-request-regressions.v1.json');
const schema=read('schemas/d9-oem-evidence-request.schema.json');
const origin=read('data/quality/oem-d9-evidence-intake.v1.json');
const pilot=read('data/quality/oem-pilot-readiness.v1.json');
const backlog=read('data/governance/consolidated-blockers.v1.json');
const core=read('data/knowledge/causal-chains.v1.json');
const errors=[],ck=(x,msg)=>{if(!x)errors.push(msg)};
const clone=x=>JSON.parse(JSON.stringify(x));
const fields=['id','originInputId','originSourceStatus','originRelevance','evidenceClass','ownerDiscipline','requestText','originalPrimaryEvidence','independentCrossCheck','acceptanceEvidence','publicationRestriction','requested','received','sourceVerified','approved','privateEvidenceReference','sourceRevision','sourceEffectivity','applicableSerialOrArrangement','reviewerPrimary','reviewerIndependent','reviewDecision','evidenceOwnerAssigned','corporateDueDate'];
const upper=['schema','version','requestId','pilotId','modelId','maturity','sourceOfTruth','relatedBlocker','classification','scope','purpose','requestRouting','gates','applicabilityPrerequisite','fieldVerificationProtocol','linkedCoreChains','releaseConstraints','counts','technicalDisposition','externalNextAction'];
const no=['requested','received','sourceVerified','approved'],nullFields=['privateEvidenceReference','sourceRevision','sourceEffectivity','applicableSerialOrArrangement','reviewerPrimary','reviewerIndependent','evidenceOwnerAssigned','corporateDueDate'];
const routingNull=['recipientIdentity','authorizedChannel','requestSentAt','trackingTicket'];
const exact=(x,keys)=>x&&typeof x==='object'&&!Array.isArray(x)&&Object.keys(x).length===keys.length&&keys.every(k=>Object.hasOwn(x,k));
const allowStatuses=['not_supplied','not_verified','not_performed'];
const EVIDENCE_CLASSES={'serial-prefix':'identification','oem-omm':'oem_manual','oem-parts':'oem_parts_arrangement','oem-bolting':'oem_service_procedure','oem-cts':'oem_measurement_method','sap-master':'corporate_master_data','field-review':'technical_field_review'};
function verify(m){
 const errs=[],check=(yes,msg)=>{if(!yes)errs.push(msg)};
 check(exact(m,upper),'top_level_fields_changed');
 if(!m||typeof m!=='object')return errs;
 check(m.schema==='fmea-mining.d9-oem-evidence-request.v1'&&m.version==='1.3.31'&&m.maturity==='ready_to_send_request_not_sent','identity_or_maturity_false');
 check(m.requestId==='OEM-REQ-D9-UNDERCARRIAGE-001'&&m.pilotId===origin.pilotId&&m.modelId===origin.modelId&&m.sourceOfTruth==='data/quality/oem-d9-evidence-intake.v1.json'&&m.relatedBlocker==='BLK-D9-OEM','source_pilot_mismatch');
 check(m.classification==='public_metadata_only_no_equipment_identifier_or_oem_content','restricted_payload_warning');
 check(typeof m.purpose==='string'&&m.purpose.length>110&&typeof m.scope==='string'&&m.scope.length>90,'request_scope_invalid');
 const routing=m.requestRouting||{};
 check(exact(routing,['initiatorDiscipline','oemLiteratureCustody','assetVerification','materialsVerification','sapCustody','independentReviewer',...routingNull]),'request_routing_has_untracked_fields');
 check(routingNull.every(k=>routing[k]===null),'request_falsely_sent_or_assigned');
 check(Array.isArray(m.gates)&&m.gates.length===7,'seven_requests_required');
 const ids=new Set();
 for(let i=0;i<(m.gates||[]).length;i++){
  const q=m.gates[i],src=origin.requiredInputs[i];
  check(exact(q,fields),'unexpected_gate_fields_'+i);
  if(!q||!src)continue;
  check(q.id==='REQ-D9-'+String(i+1).padStart(2,'0'),'gate_id_drift_'+i);
  check(q.originInputId===src.id&&!ids.has(q.originInputId),'source_mismatched_or_duplicate_'+i);ids.add(q.originInputId);
  check(q.originSourceStatus===src.sourceStatus&&allowStatuses.includes(q.originSourceStatus)&&q.originRelevance===src.relevance,'source_original_state_altered_'+i);
  check(q.ownerDiscipline===src.responsibleDiscipline&&q.originalPrimaryEvidence===src.primaryEvidence&&q.independentCrossCheck===src.independentCrossCheck,'source_crosscheck_changed_'+i);
  check(no.every(k=>q[k]===false)&&nullFields.every(k=>q[k]===null)&&q.reviewDecision==='pending','fictitious_receipt_or_approval_'+i);
  check(typeof q.requestText==='string'&&q.requestText.length>=100&&typeof q.acceptanceEvidence==='string'&&q.acceptanceEvidence.length>=60&&typeof q.publicationRestriction==='string'&&q.publicationRestriction.length>=65,'actionability_or_rights_omitted_'+i);
  check(q.evidenceClass===EVIDENCE_CLASSES[src.id],'document_class_mismatch_'+i);
 }
 check(ids.size===7&&origin.requiredInputs.every(x=>ids.has(x.id)),'source_request_coverage_incomplete');
 check(origin.requiredInputs.filter(x=>x.sourceStatus==='not_supplied').length===2&&origin.requiredInputs.filter(x=>x.sourceStatus==='not_verified').length===4&&origin.requiredInputs.filter(x=>x.sourceStatus==='not_performed').length===1,'upstream_changed_review_required');
 check(origin.requiredInputs.every(x=>!x.approved&&x.sourceValue===null&&x.documentReference===null&&x.verifiedBy===null),'upstream_evidence_has_arrived_revalidate_manually');
 check(m.linkedCoreChains&&JSON.stringify(m.linkedCoreChains)===JSON.stringify(origin.relatedChainIds)&&m.linkedCoreChains.length===8,'under_carriage_chain_scope_changed');
 check(Array.isArray(m.fieldVerificationProtocol)&&m.fieldVerificationProtocol.length===5&&m.fieldVerificationProtocol.every(x=>x.evidenceStatus==='not_performed'&&x.safeRequirement?.length>=115),'field_activity_invented');
 check(Array.isArray(m.applicabilityPrerequisite)&&m.applicabilityPrerequisite.length===3&&m.applicabilityPrerequisite.every(x=>x.length>=130),'OEM_effectivity_gate_missing');
 check(exact(m.releaseConstraints,['noActualRequestSent','noOriginalEvidenceReceived','noOemEffectivityVerified','noFieldWorkPerformed','noIndependentReviewPerformed','noSapMasterApproved','noOperationalInstructionsValidated','noCorePromotion','noPublicRestrictedData'])&&Object.values(m.releaseConstraints||{}).every(x=>x===true),'release_or_publication_falsely_approved');
 check(JSON.stringify(m.counts)===JSON.stringify({originalRequiredInputs:7,requestItems:7,notSupplied:2,notVerified:4,notPerformed:1,actualOEMDocumentsObtained:0,actualEquipmentInspections:0,approvedRequests:0,confirmedFailureEvents:0}),'fake_counts');
 check(m.technicalDisposition==='documentation_request_only_awaiting_authorized_submission'&&m.externalNextAction?.length>=160,'fake_technical_disposition');
 check(backlog.workstreams.find(x=>x.id==='BLK-D9-OEM')?.approvalStatus==='blocked_pending_external_evidence'&&pilot.status==='bloqueado_sem_efetividade_documental'&&origin.pilotOperationallyApproved===false,'D9_upstream_no_longer_blocked');
 check(core.records.length===24,'core_FMEA_modified');
 return errs;
}
errors.push(...verify(manifest));
ck(schema.additionalProperties===false&&schema.properties.version.const==='1.3.31'&&schema.properties.gates.items.additionalProperties===false&&schema.properties.gates.items.properties.approved.const===false,'schema_does_not_protect_request');
ck(fixtures.schema==='fmea-mining.d9-request-regressions.v1'&&fixtures.version==='1.3.31'&&fixtures.nature==='synthetic_mutations_only','test_provenance_modified');
ck(fixtures.baselineCases.length===7&&fixtures.mutationCases.length===28&&JSON.stringify(fixtures.counts)===JSON.stringify({baselines:7,unsafeMutationsRejected:28,total:35,realRequestsSent:0,realDocumentsReceived:0,realInspections:0}),'fixture_totals_changed');
const named=key=>manifest.gates.find(g=>g.originInputId===key);
const mutators={
 fake_sent:m=>m.releaseConstraints.noActualRequestSent=false,
 fake_received:m=>m.gates[0].received=true,
 fake_verified:m=>m.gates[1].sourceVerified=true,
 fake_approved:m=>m.gates[2].approved=true,
 fake_serial:m=>m.gates[0].applicableSerialOrArrangement='TEST-REAL-SERIAL',
 fake_manual_revision:m=>m.gates[1].sourceRevision='TEST-REV',
 fake_torque:m=>m.gates[3].torqueNm=500,
 fake_cts_limit:m=>m.gates[4].wearPercentLimit=100,
 fake_part_number:m=>m.gates[2].partNumber='TEST-PN',
 fake_sap_location:m=>m.gates[5].sapFunctionalLocation='TEST-LOC',
 fake_assignee:m=>m.requestRouting.recipientIdentity='TEST-PERSON',
 fake_deadline:m=>m.gates[0].corporateDueDate='2026-10-31',
 fake_ticket:m=>m.requestRouting.trackingTicket='TEST-TICKET',
 fake_literature_link:m=>m.gates[1].privateEvidenceReference='https://test.invalid/private',
 drop_request:m=>m.gates.pop(),
 duplicate_request:m=>m.gates.push(clone(m.gates[0])),
 wrong_origin_status:m=>m.gates[2].originSourceStatus='not_supplied',
 wrong_source_gate:m=>m.gates[0].originInputId='oem-parts',
 relax_safety_policy:m=>m.releaseConstraints.noPublicRestrictedData=false,
 approve_field_review:m=>namedField(m).approved=true,
 mark_field_work:m=>m.fieldVerificationProtocol[0].evidenceStatus='done',
 drop_independent_check:m=>m.gates[0].independentCrossCheck='',
 invent_reviewer:m=>m.gates[0].reviewerIndependent='TEST-REVIEWER',
 replace_evidence_class:m=>m.gates[1].evidenceClass='not_a_document',
 inject_raw_oem:m=>m.oemDocument='RESTRICTED MANUAL',
 change_pilot:m=>m.pilotId='OTHER',
 change_core_links:m=>m.linkedCoreChains.pop(),
 promote_core:m=>m.releaseConstraints.noCorePromotion=false
};
function namedField(m){return m.gates.find(x=>x.originInputId==='field-review')}
const ids=new Set(),totals={baselines:0,refused:0};
for(const t of fixtures.baselineCases){
 ck(!ids.has(t.id),'repeated_fixture');ids.add(t.id);
 const row=manifest.gates.find(x=>x.id===t.gateId);
 if(row&&t.expected==='request_ready_not_sent'&&row.requested===false)totals.baselines++;else errors.push('bad_baseline_'+t.id);
}
for(const t of fixtures.mutationCases){
 ck(!ids.has(t.id),'repeated_fixture');ids.add(t.id);
 const mutant=clone(manifest),fn=mutators[t.mutation];
 if(!fn){errors.push('unrecognized_mutation_'+t.id);continue}
 fn(mutant);const e=verify(mutant);
 if(t.expected!=='reject'||e.length===0)errors.push('unsafe_mutation_accepted_'+t.id+':'+t.mutation);
 else totals.refused++;
}
ck(totals.baselines===7&&totals.refused===28,'incorrect_mutation_coverage');
console.log(JSON.stringify({status:errors.length?'FAIL':'OK',requestItems:7,originalStatuses:{notSupplied:2,notVerified:4,notPerformed:1},successfulSyntheticBaselines:totals.baselines,adversarialRejections:totals.refused,syntheticRegressions:35,actualRequestsSent:0,actualOEMFilesReceived:0,fieldReviewsPerformed:0,originalFmeaChains:24,errors:errors.slice(0,25)},null,2));
process.exit(errors.length?1:0);
