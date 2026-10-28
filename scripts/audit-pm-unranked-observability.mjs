#!/usr/bin/env node
import fs from 'node:fs';import path from 'node:path';import {fileURLToPath} from 'node:url';
import {buildUnrankedObservability,assessUnrankedObservability} from './lib/pm-unranked-observability.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=f=>JSON.parse(fs.readFileSync(path.join(root,f),'utf8'));
const clone=o=>JSON.parse(JSON.stringify(o));
const input={policy:read('data/quality/pm-unranked-observability-policy.v1.json'),
 seeds:read('data/knowledge/pm-prevention/seed-rules.json'),
 maturity:read('data/quality/pm-maturity-matrix.v1.json'),
 gaps:read('data/quality/pm-gap-review.v1.json'),
 runbook:read('data/governance/pm-private-deployment-runbook.v1.json')};
const result=buildUnrankedObservability(input);
const base=assessUnrankedObservability(input,result);
const errors=[...base.errors],attacks=[];
function attack(name,mutate){
 const copy=clone(input),out=clone(result);
 try{mutate(copy,out)}catch(e){errors.push('invalid_test_setup_'+name+'_'+e.message);return}
 let rejected=false;
 try{rejected=assessUnrankedObservability(copy,out).status==='REJECTED'}catch(e){rejected=true}
 attacks.push({name,rejected});
 if(!rejected)errors.push('accepted_mutation_'+name);
}
for(const p of result.packets){
 const id=p.ruleId,index=result.packets.findIndex(x=>x.ruleId===id);
 attack('false_root_'+id,(_,o)=>o.packets[index].hypotheticalAlternatives[0].rootCauseConfirmed=true);
 attack('false_damage_'+id,(_,o)=>o.packets[index].hypotheticalAlternatives[0].physicalDamageConfirmed=true);
 attack('false_OEM_'+id,(_,o)=>o.packets[index].hypotheticalAlternatives[0].OEMEffectivityVerified=true);
 attack('wrong_priority_'+id,(_,o)=>o.packets[index].priorityInterpretation='LOW_RISK');
 attack('invalid_alternative_promotion_'+id,(i)=>i.policy.entries.find(x=>x.ruleId===id).alternatives[0].candidate='causa raiz confirmada');
}
const e=o=>o.packets[0],h=o=>o.packets[0].hypotheticalAlternatives[0];
attack('source_symptom_overwrite',(_,o)=>e(o).sourceSymptomLiteral='ruido qualquer');
attack('source_method_overwrite',(_,o)=>e(o).sourceInspectionMethodLiteral='QUALQUER_TESTE');
attack('source_subgroup_override',(_,o)=>e(o).subgroupCandidate='FAKE');
attack('source_system_override',(_,o)=>e(o).system='hidraulico');
attack('source_component_overwrite',(_,o)=>e(o).componentCandidate='CONFIRMADO');
attack('source_decision_go',(_,o)=>e(o).decision='GO');
attack('public_priority_assigned',(_,o)=>e(o).originalRecordedPriority='P0');
attack('rule_technical_confirmation',(_,o)=>e(o).technicalConclusion='CONFIRMED');
attack('rule_real_asset',(_,o)=>e(o).realAssetMapped=true);
attack('rule_oem_effectivity',(_,o)=>e(o).OEMProcedureEffective=true);
attack('rule_actual_field_measurements',(_,o)=>e(o).fieldEvidenceReviewed=true);
attack('rule_sap_approved',(_,o)=>e(o).approvedSAPMapping=true);
attack('rule_approved_for_testing',(_,o)=>e(o).mayAuthorizeTesting=true);
attack('rule_approved_workorder',(_,o)=>e(o).mayCreateWorkOrder=true);
attack('rule_fmea_promoted',(_,o)=>e(o).mayPromoteFMEA=true);
attack('rule_equipment_released',(_,o)=>e(o).operationalRelease=true);
attack('rule_safety_erased',(_,o)=>e(o).essentialSafetyBoundary='SAFE');
attack('rule_alternative_removed',(_,o)=>e(o).hypotheticalAlternatives.pop());
attack('rule_alternative_added',(_,o)=>e(o).hypotheticalAlternatives.push(clone(h(o))));
attack('rule_replaced',(_,o)=>e(o).ruleId='REAL_ASSET');
attack('rule_deleted',(_,o)=>o.packets.pop());
attack('rule_duplicated',(_,o)=>o.packets.push(clone(e(o))));
attack('rule_false_qualified_measurement',(_,o)=>h(o).qualifiedMeasurementPerformed=true);
attack('rule_false_evidence',(_,o)=>h(o).evidenceActuallyCollected=true);
attack('rule_false_excluded_other',(_,o)=>h(o).competingHypothesisExcluded=true);
attack('rule_false_engineer_signed',(_,o)=>h(o).engineeringSignoff=true);
attack('rule_false_SAP_link',(_,o)=>h(o).SAPlinkApproved=true);
attack('rule_reported_proven',(_,o)=>h(o).hypothesisDisposition='CONFIRMED');
attack('rule_reason_fabricated',(_,o)=>h(o).candidateMechanism='confirmed root cause');
attack('rule_proof_replaced',(_,o)=>h(o).requestedQualitativeDiscrimination='Test without OEM');
attack('summary_invented_cases',(_,o)=>o.summary.actualAssetCases=1);
attack('summary_invented_measurement',(_,o)=>o.summary.actualMeasurements=1);
attack('summary_invented_root',(_,o)=>o.summary.confirmedRootCauses=1);
attack('summary_invented_sap',(_,o)=>o.summary.SAPApprovedMappings=1);
attack('summary_silenced_exceptions',(_,o)=>o.summary.originalSAPExceptionsBlocked=0);
attack('summary_misrank',(_,o)=>o.summary.realPriorityAssignments=15);
attack('summary_gates_unblocked',(_,o)=>o.summary.privateGatesBlocked=0);
attack('summary_go',(_,o)=>o.summary.decision='GO');
attack('policy_synthetic_low_risk',(i)=>i.policy.prioritySemantics.unranked='LOW_RISK');
attack('policy_free_rank',(i)=>i.policy.prioritySemantics.noPriorityAssignment=false);
attack('policy_treat_symptom_as_fact',(i)=>i.policy.sourceSemantics.alternatives='verified_root_causes');
attack('policy_action_execute',(i)=>i.policy.neverActions.pop());
attack('policy_allow_sap',(i)=>i.policy.guardrails.noSAPAutomaticMapping=false);
attack('policy_waive_safety',(i)=>i.policy.guardrails.noProcedureStepsForLiveTests=false);
attack('policy_sap_approval',(i)=>i.policy.entries[0].SAPMappingApproved=true);
attack('policy_private_evidence_claim',(i)=>i.policy.entries[0].fieldEvidenceReceived=true);
attack('policy_not_serial_verified',(i)=>i.policy.entries[0].OEMSerialVerified=true);
attack('policy_explicit_priority_claim',(i)=>i.policy.entries[0].priorityFromRepository='P1');
attack('policy_alternative_proven',(i)=>i.policy.entries[0].alternatives[0].hypothesisStatus='CONFIRMED');
attack('policy_alternative_without_evidence',(i)=>i.policy.entries[0].alternatives[0].proposedDiscriminatingEvidence='pass');
attack('policy_unsafe_safety_instruction',(i)=>i.policy.entries[0].safeBoundary='safe');
attack('policy_rule_removed',(i)=>i.policy.entries.pop());
attack('policy_rule_duplicate',(i)=>i.policy.entries.push(clone(i.policy.entries[0])));
attack('seed_rule_approved',(i)=>i.seeds.records[0].review='aprovado');
attack('seed_suppressed',(i)=>i.seeds.records.pop());
attack('maturity_false_finding',(i)=>i.maturity.summary.fieldConfirmed=1);
attack('maturity_false_priority',(i)=>i.maturity.unrankedRules.pop());
attack('maturity_false_rule_action',(i)=>i.maturity.rules[0].performedActions=1);
attack('gaps_unlocked',(i)=>i.gaps.records[0].autoRemapAllowed=true);
attack('gaps_deleted',(i)=>i.gaps.records.pop());
attack('runbook_approved',(i)=>i.runbook.phases[0].gate='GO');
attack('runbook_signer_faked',(i)=>i.runbook.phases[0].decisionToken='SIGNED');
const audit={status:errors.length?'FAIL':'OK',auditedRules:result.packets.length,
 negativeTests:attacks.length,negativeRejected:attacks.filter(x=>x.rejected).length,
 attacks,errors};
fs.mkdirSync(path.join(root,'reports'),{recursive:true});
fs.writeFileSync(path.join(root,'reports/pm-unranked-observability.generated.json'),JSON.stringify({...result,audit},null,2)+'\n');
console.log(JSON.stringify({status:audit.status,summary:result.summary,tests:audit.negativeTests,rejected:audit.negativeRejected,errors},null,2));
process.exit(errors.length?1:0);
