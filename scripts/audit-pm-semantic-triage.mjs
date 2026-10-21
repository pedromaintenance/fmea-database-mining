#!/usr/bin/env node
/** Read-only semantic-to-PM triage. Does NOT open or authorize a SAP notification. */
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {checkTriagePlan,buildTriageReport,validateTriageReport} from './lib/pm-semantic-triage.mjs';
import {auditPmCandidateSet} from './lib/pm-link-integrity.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=f=>JSON.parse(fs.readFileSync(path.join(root,f),'utf8'));
const plan=read('data/quality/pm-semantic-triage-plan.v1.json');
const model=read('data/ontology/condition-action-damage.v1.json');
const seed=read('data/knowledge/pm-prevention/seed-rules.json').records;
const gaps=read('data/quality/pm-gap-review.v1.json').records;
const sources=read('data/research/sources.v1.json').sources;
const db=read('data/catalog/failure-db.v1.json');
const links=read('data/knowledge/pm-prevention/generated-links.json').records;
const errors=checkTriagePlan(plan,model,seed,gaps,sources);
const report=buildTriageReport(plan,model);
errors.push(...validateTriageReport(report,plan,model));
const check=(ok,message)=>{if(!ok)errors.push(message)};
const audit=auditPmCandidateSet(db,seed,links);
errors.push(...audit.errors);
check(seed.length===25&&links.length===115&&gaps.length===10,'baseline_counts_changed');
check(!links.some(x=>['cooling-radiator-blockage','fuel-tank-water'].includes(x.originRule)),'unapproved_blocked_rule_link');
check(report.rulesExamined===2&&report.conditionBranches===5,'triage_coverage_changed');
check(report.records.every(r=>r.branches.every(b=>b.sapNotificationCreated===false)),'false_notification');
const radiator=report.records.find(x=>x.ruleId==='cooling-radiator-blockage');
const fuel=report.records.find(x=>x.ruleId==='fuel-tank-water');
check(radiator.branches.find(x=>x.pathId==='air_side_debris').differentialDamageHypotheses.length===0,'air_debris_promoted_to_internal_damage');
check(radiator.branches.find(x=>x.pathId==='coolant_side_restriction').differentialDamageHypotheses.length===1,'internal_candidate_missing');
check(fuel.branches.find(x=>x.pathId==='water_in_fuel').differentialDamageHypotheses.every(x=>x.status==='not_approved_not_confirmed'),'water_promoted_to_drain_failure');
check(report.generatedSapNotifications===0&&report.confirmedDamages===0&&report.performedActions===0,'fake_operational_events');
const copy=x=>JSON.parse(JSON.stringify(x));
const planMutations=[
 ['water_becomes_drain_damage',x=>x.rules[1].pathways[0].differentialDamageIds=['DMG-COOL-INTERNAL-BLOCKAGE']],
 ['air_debris_becomes_damage',x=>x.rules[0].pathways[0].differentialDamageIds=['DMG-COOL-INTERNAL-BLOCKAGE']],
 ['replace_air_check_with_circulation',x=>x.rules[0].pathways[0].actionIds=['ACT-COOL-CIRCULATION-TEST']],
 ['remove_independent_contraprove',x=>x.rules[0].pathways[1].counterEvidence=''],
 ['wrong_functional_system',x=>x.rules[0].functionalSystem='combustivel'],
 ['false_field_condition',x=>x.rules[1].observedConditions=['COND-FUEL-WATER']],
 ['false_drain_done',x=>x.rules[1].performedActions=['ACT-FUEL-DRAIN-SEPARATOR']],
 ['fake_damage_confirmed',x=>x.rules[1].confirmedDamages=['DMG-FUEL-DRAIN-FAILURE']],
 ['automatic_maintenance_order',x=>x.rules[1].generatedMaintenanceOrders=1],
 ['duplicate_branch',x=>x.rules[0].pathways.push(copy(x.rules[0].pathways[0]))],
 ['omit_temperature_branch',x=>x.rules[0].pathways.pop()],
 ['unsafe_policy_relaxation',x=>x.safetyPolicy.never_auto_generate_sap_order=false],
 ['manufactured_threshold',x=>x.safetyPolicy.never_invent_oem_threshold=false],
 ['fictional_inspection',x=>x.observedInspections=1],
 ['switch_source',x=>x.rules[1].sourceIds=['UNVERIFIED-SOURCE']],
 ['false_approved_status',x=>x.rules[1].editorialStatus='executed_and_approved']
];
let planAttacksRejected=0;
for(const [name,edit] of planMutations){
 const mutated=copy(plan);edit(mutated);
 if(checkTriagePlan(mutated,model,seed,gaps,sources).length)planAttacksRejected++;
 else errors.push('unsafe_plan_mutation_accepted_'+name);
}
const reportMutations=[
 ['fake_approval',x=>x.records[0].approvedSapMappings=1],
 ['fake_notification',x=>x.generatedSapNotifications=1],
 ['fake_performed_action',x=>x.records[0].branches[0].proposedActions[0].status='performed'],
 ['false_damage',x=>x.records[0].branches[1].differentialDamageHypotheses[0].status='confirmed'],
 ['wrong_condition',x=>x.records[1].branches[0].condition.id='COND-COOL-HIGH-TEMPERATURE'],
 ['fake_review',x=>x.records[0].engineeringReview='approved'],
 ['fabricated_measurement',x=>x.records[0].measuredValue='FAKE'],
 ['erase_alternative',x=>x.records[0].branches[1].alternativeExplanation=''],
 ['alter_action',x=>x.records[1].branches[0].proposedActions.pop()],
 ['invent_sample_result',x=>x.observedConditions=1]
];
let reportAttacksRejected=0;
for(const [name,edit] of reportMutations){
 const mutated=copy(report);edit(mutated);
 if(validateTriageReport(mutated,plan,model).length)reportAttacksRejected++;
 else errors.push('unsafe_report_mutation_accepted_'+name);
}
check(planAttacksRejected===16&&reportAttacksRejected===10,'missing_adversarial_coverage');
const output={...report,technicalAudit:{planMutationsRejected:planAttacksRejected,reportMutationsRejected:reportAttacksRejected,
 catalogueSeedRules:seed.length,generatedCandidateLinks:links.length,unresolvedPmExceptions:gaps.length,
 realInspections:0,confirmedDamages:0,approvedMappings:0},errors};
fs.mkdirSync(path.join(root,'reports'),{recursive:true});
fs.writeFileSync(path.join(root,'reports/pm-semantic-triage.generated.json'),JSON.stringify(output,null,2)+'\n');
console.log(JSON.stringify({status:errors.length?'FAIL':'OK',rules:output.rulesExamined,
 branches:output.conditionBranches,planAttacksRejected,reportAttacksRejected,
 referenceCandidateLinks:links.length,unresolvedPmExceptions:gaps.length,
 branchSummaries:output.records.map(x=>({ruleId:x.ruleId,branches:x.branches.map(b=>({path:b.pathId,
 condition:b.condition.id,actions:b.proposedActions.map(a=>a.id),
 differentialDamages:b.differentialDamageHypotheses.map(d=>d.id)}))})),
 errors:errors.slice(0,30)},null,2));
process.exit(errors.length?1:0);
