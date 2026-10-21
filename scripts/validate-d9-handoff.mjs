#!/usr/bin/env node
// v1.3.33: public external handoff tracker. These tests DO NOT send OEM requests
// or attest that the GitHub issue is a communication to a corporate recipient.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const handoff=read('data/governance/d9-external-handoff.v1.json');
const fixtures=read('data/quality/d9-handoff-regressions.v1.json');
const origin=read('data/quality/oem-d9-evidence-intake.v1.json');
const request=read('data/governance/d9-oem-evidence-request.v1.json');
const research=read('data/research/d9-public-oem-literature.v1.json');
const schema=read('schemas/d9-external-handoff.schema.json');
const core=read('data/knowledge/causal-chains.v1.json');
const errors=[],ck=(b,m)=>{if(!b)errors.push(m)};
const clone=x=>JSON.parse(JSON.stringify(x));
const top=['schema','version','pilotId','purpose','github','sourceRequest','sourceEvidence','sourcePublicResearch','maturity','routing','processGates','originalGateSnapshot','releaseBoundary','publicProgress','externalNextDecision','coreFmeaChainsPreserved','ontologyMechanismsPreserved'];
const githubFields=['repository','issueNumber','issueUrl','issueRole','createdIssueIsNotDispatch'];
const routingFields=['internalRecipientSelected','authorizedCorporateChannelConfirmed','privateTrackingSystemConfirmed','requestSent','documentReceived','independentTechnicalReviewPerformed','corporateIdentity','privateProtocolId','sentAt','receivedAt'];
const routeFalse=routingFields.slice(0,6),routeNull=routingFields.slice(6);
const procFields=['id','state','ownerDiscipline','action','evidenceRequirement'];
const procStates=['awaiting_corporate_route','not_sent','awaiting_oem_evidence','awaiting_field_and_independent_review'];
const procIds=['HND-D9-ROUTE','HND-D9-DISPATCH','HND-D9-RECEIPT','HND-D9-REVIEW'];
const procOwner=['engenharia_manutencao','engenharia_manutencao','engenharia_ativos','engenharia_mecanica'];
const policyFields=['githubIssueCannotStoreLicensedOEM','githubIssueCannotStoreMachineSerial','githubIssueCannotStoreSapIdentifiers','closingDispatchIssueDoesNotApproveSevenOemGates','publicStatusCannotClaimActualDispatchBeforePrivateReceipt','fieldWorkNeedsOemEffectivityAndSafePermit','knowledgeCoreCannotBePromotedAutomatically','requiredHumanReviewRemainsExternal'];
const progressFields=['preparedRequest','publicTrackingIssueCreated','externalRecipientConfirmed','requestActuallySent','sourceDocsActuallyObtained','fieldInspectionsActuallyPerformed','independentOEMApprovals'];
const snapFields=['evidenceInputId','requestId','originalSourceStatus','privateEvidenceVerified','publicReleaseAllowed'];
const exact=(x,keys)=>x&&typeof x==='object'&&!Array.isArray(x)&&Object.keys(x).length===keys.length&&keys.every(k=>Object.hasOwn(x,k));
function validate(x){
 const errs=[],p=(ok,msg)=>{if(!ok)errs.push(msg)};
 p(exact(x,top),'top_fields_changed');if(!x||typeof x!=='object')return errs;
 p(x.schema==='fmea-mining.d9-external-handoff.v1'&&x.version==='1.3.33'&&x.pilotId===origin.pilotId&&x.maturity==='public_handoff_prepared_external_dispatch_pending','wrong_handoff_identity');
 p(x.sourceEvidence==='data/quality/oem-d9-evidence-intake.v1.json'&&x.sourceRequest==='data/governance/d9-oem-evidence-request.v1.json'&&x.sourcePublicResearch==='data/research/d9-public-oem-literature.v1.json','false_provenance');
 p(exact(x.github,githubFields),'github_fields_changed');
 p(x.github?.repository==='pedromaintenance/fmea-database-mining'&&x.github?.issueNumber===31&&x.github?.issueUrl==='https://github.com/pedromaintenance/fmea-database-mining/issues/31'&&x.github?.issueRole==='public_pending_action_tracker_not_an_internal_oem_request'&&x.github?.createdIssueIsNotDispatch===true,'issue_misrepresented_as_dispatch');
 p(exact(x.routing,routingFields),'routing_fields_invalid');
 p(routeFalse.every(k=>x.routing?.[k]===false)&&routeNull.every(k=>x.routing?.[k]===null),'external_action_fabricated');
 p(Array.isArray(x.processGates)&&x.processGates.length===4,'handoff_process_not_complete');
 for(let i=0;i<4;i++){
  const v=x.processGates?.[i];p(exact(v,procFields),'workflow_gate_fields_'+i);
  p(v?.id===procIds[i]&&v?.state===procStates[i]&&v?.ownerDiscipline===procOwner[i],'handoff_gate_state_or_owner_altered_'+i);
  p(v?.action?.length>75&&v?.evidenceRequirement?.length>80,'handoff_evidence_instruction_missing_'+i);
 }
 p(Array.isArray(x.originalGateSnapshot)&&x.originalGateSnapshot.length===7,'snapshot_incomplete');
 for(let i=0;i<7;i++){
  const v=x.originalGateSnapshot?.[i],a=origin.requiredInputs[i],b=request.gates[i],c=research.mappings[i];
  p(exact(v,snapFields),'snapshot_fields_'+i);
  p(v?.evidenceInputId===a?.id&&v?.requestId===b?.id&&c?.originInputId===a?.id&&v?.originalSourceStatus===a?.sourceStatus,'source_status_or_binding_drift_'+i);
  p(v?.privateEvidenceVerified===false&&v?.publicReleaseAllowed===false,'evidence_approved_without_review_'+i);
 }
 p(exact(x.releaseBoundary,policyFields)&&policyFields.every(k=>x.releaseBoundary?.[k]===true),'confidentiality_or_independent_review_weakened');
 p(exact(x.publicProgress,progressFields)&&x.publicProgress?.preparedRequest===true&&x.publicProgress?.publicTrackingIssueCreated===true&&x.publicProgress?.externalRecipientConfirmed===false&&x.publicProgress?.requestActuallySent===false&&['sourceDocsActuallyObtained','fieldInspectionsActuallyPerformed','independentOEMApprovals'].every(k=>x.publicProgress?.[k]===0),'progress_misrepresented');
 p(x.externalNextDecision?.length>=150&&x.purpose?.length>=120,'missing_action_or_purpose');
 p(x.coreFmeaChainsPreserved===24&&x.ontologyMechanismsPreserved===15&&core.records.length===24,'core_changed');
 p(request.requestRouting.requestSentAt===null&&request.gates.every(g=>g.requested===false&&g.received===false)&&origin.requiredInputs.every(g=>!g.approved),'upstream_status_changed_revalidate');
 return errs;
}
errors.push(...validate(handoff));
ck(schema.additionalProperties===false&&schema.properties?.version?.const==='1.3.33'&&schema.properties?.routing?.additionalProperties===false&&schema.properties?.routing?.properties?.requestSent?.const===false,'schema_does_not_restrict_real_dispatch');
ck(fixtures.schema==='fmea-mining.d9-handoff-regressions.v1'&&fixtures.version==='1.3.33'&&fixtures.nature==='synthetic_mutation_only','regression_source_wrong');
ck(fixtures.baselineCases.length===7&&fixtures.mutationCases.length===20&&JSON.stringify(fixtures.counts)===JSON.stringify({baseline:7,rejectedMutation:20,total:27,realCorporateRequests:0,realOEMApprovals:0}),'fixture_count_drift');
const attacks={
 fake_recipient:x=>x.routing.internalRecipientSelected=true,
 fake_channel:x=>x.routing.authorizedCorporateChannelConfirmed=true,
 fake_sent:x=>x.routing.requestSent=true,
 fake_received:x=>x.routing.documentReceived=true,
 fake_review:x=>x.routing.independentTechnicalReviewPerformed=true,
 fake_ticket:x=>x.routing.privateProtocolId='TEST-TICKET',
 fake_timestamp:x=>x.routing.sentAt='2026-10-21T12:00:00Z',
 fake_serial:x=>x.machineSerial='D9-TEST-REAL',
 fake_oem_text:x=>x.privateOemManual='OMM-RESTRICTED',
 fake_sap_id:x=>x.sapLocation='TEST-SAP',
 fake_field:x=>x.publicProgress.fieldInspectionsActuallyPerformed=1,
 fake_core_promotion:x=>x.coreFmeaChainsPreserved=25,
 fake_issue_means_sent:x=>x.github.createdIssueIsNotDispatch=false,
 erase_dispatch_gate:x=>x.processGates.splice(1,1),
 fake_approved_count:x=>x.publicProgress.independentOEMApprovals=7,
 fake_gate_status:x=>x.originalGateSnapshot[0].privateEvidenceVerified=true,
 fake_issue_number:x=>x.github.issueNumber=999,
 remove_safety_boundary:x=>x.releaseBoundary.githubIssueCannotStoreLicensedOEM=false,
 change_evidence_source:x=>x.sourceEvidence='data/research/sources.v1.json',
 close_as_oem_approved:x=>x.maturity='oem_effectivity_approved'
};
const seen=new Set(),totals={baseline:0,rejected:0};
for(const f of fixtures.baselineCases){
 ck(!seen.has(f.id),'duplicate_fixture_id');seen.add(f.id);
 const row=handoff.originalGateSnapshot.find(y=>y.requestId===f.requestId);
 if(row?.privateEvidenceVerified===false&&row?.publicReleaseAllowed===false&&f.expected==='pending_unverified')totals.baseline++;else errors.push('invalid_baseline_'+f.id);
}
for(const f of fixtures.mutationCases){
 ck(!seen.has(f.id),'duplicate_fixture_id');seen.add(f.id);
 const x=clone(handoff),fn=attacks[f.mutation];if(!fn){errors.push('unknown_mutation_'+f.mutation);continue}
 fn(x);if(f.expected!=='reject'||validate(x).length===0)errors.push('unsafe_mutation_passed_'+f.mutation);else totals.rejected++;
}
ck(totals.baseline===7&&totals.rejected===20,'mutation_regression_count_wrong');
console.log(JSON.stringify({status:errors.length?'FAIL':'OK',publicIssue:handoff.github.issueUrl,originalGates:7,sourceStates:origin.requiredInputs.map(x=>x.sourceStatus),baselines:totals.baseline,mutationsRejected:totals.rejected,regressions:27,externalDispatches:0,OEMApprovals:0,coreChains:24,errors:errors.slice(0,20)},null,2));
process.exit(errors.length?1:0);
