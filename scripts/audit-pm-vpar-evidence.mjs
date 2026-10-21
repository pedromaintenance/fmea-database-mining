#!/usr/bin/env node
/** Two anonymous VPAR candidate codes x four circuit hypotheses, seven gates each. */
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {buildVparEvidenceMatrix,validateVparEvidenceMatrix,REVIEW_GATE_IDS,CIRCUIT_IDS} from './lib/pm-vpar-evidence-matrix.mjs';
import {inspectVparObjectTypeProvenance} from './lib/pm-vpar-provenance.mjs';
import {inspectFocusGuards} from './lib/pm-functional-boundaries.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const db=read('data/catalog/failure-db.v1.json');
const rules=read('data/knowledge/pm-prevention/seed-rules.json').records;
const review=read('data/quality/pm-gap-review.v1.json').records;
const gates=read('data/quality/pm-exception-evidence-gates.v1.json').records;
const links=read('data/knowledge/pm-prevention/generated-links.json').records;
const plan=read('data/quality/pm-vpar-evidence-plan.v1.json');
const differential=read('data/research/pm-vpar-function-differentials.v1.json');
const errors=[...inspectFocusGuards(rules,review,gates,links)];
const require=(ok,id)=>{if(!ok)errors.push(id)};
const rule=rules.find(r=>r.id==='drill-compressor-filter');
require(!!rule,'missing_filter_rule');
const result=buildVparEvidenceMatrix(db,rule,differential,plan);
errors.push(...validateVparEvidenceMatrix(result,db,rule,differential,plan));
const before=inspectVparObjectTypeProvenance(db,rule.models);
require(result.counts.candidateCodeSlots===before.counts.uniquePartCodesWithinTypeTotal,'deduplicated_component_count_drift');
require(result.counts.leafPaths===before.counts.vparLeafPaths,'leaf_path_count_drift');
require(result.counts.damageCauseEligibleSlots===before.objectTypes.reduce((n,x)=>n+x.counts.damageCauseCompatiblePartCodes,0),'damage_cause_count_drift');
require(result.counts.candidateCodeSlots===2&&result.counts.damageCauseEligibleSlots===1,'unreviewed_catalogue_change');
require(result.counts.reviewScenarios===8&&result.counts.pendingEvidenceGates===56,'matrix_missing_gates');
require(result.components.length===2&&new Set(result.components.map(c=>c.componentSlot)).size===2,'component_slots_not_unique');
require(result.scenarios.length===8&&new Set(result.scenarios.map(s=>s.scenarioId)).size===8,'scenario_ids_not_unique');
require(result.scenarios.every(s=>s.evidenceGates.length===7&&s.evidenceGates.every(g=>g.status==='not_provided'&&g.evidenceRef===null&&g.reviewedBy===null)),'false_evidence_received');
require(!links.some(x=>x.originRule===rule.id),'blocked_rule_received_link');
require(result.components.every(c=>c.installed===false&&c.oemBomConfirmed===false&&c.physicalFunction==='undetermined'),'fabricated_physical_function');
require(result.scenarios.every(s=>s.decision==='blocked_no_remap_or_failure_confirmation'),'false_remap_decision');
require(JSON.stringify(result).includes('VPAR-T01-C01')&&JSON.stringify(result).includes('VPAR-T01-C02'),'slot_allocation_drift');
require(!result.scenarios.some(x=>Object.keys(x).some(k=>/partNumber|serial|actualLocationId|actualCode/i.test(k))),'private_identifiers_in_public_matrix');

const duplicate=x=>JSON.parse(JSON.stringify(x));
const attacks=[
 ['fake_installation',x=>{x.components[0].installed=true;}],
 ['fake_BOM',x=>{x.components[0].oemBomConfirmed=true;}],
 ['invent_function',x=>{x.components[1].physicalFunction='compressed_air_oil_separator';}],
 ['invent_evidence',x=>{x.scenarios[0].evidenceGates[0].status='accepted';}],
 ['fabricate_private_reference',x=>{x.scenarios[0].evidenceGates[1].evidenceRef='PRIVATE-FAKE';}],
 ['fabricate_reviewer',x=>{x.scenarios[0].evidenceGates[6].reviewedBy='FAKE';}],
 ['approve_remap',x=>{x.scenarios[0].decision='approved';}],
 ['switch_circuit',x=>{x.scenarios[0].circuitId='unsupported';}],
 ['delete_scenario',x=>{x.scenarios.pop();}],
 ['swap_damage_cause',x=>{x.components[0].catalogueDamageCauseEligible=!x.components[0].catalogueDamageCauseEligible;}],
 ['inflate_gates',x=>{x.counts.pendingEvidenceGates++;}],
 ['change_model',x=>{x.scope.models=['WRONG-MODEL'];}],
 ['remove_counterhypothesis',x=>{x.scenarios[0].alternativeExplanation='';}]
];
let rejected=0;
for(const [name,edit] of attacks){
 const x=duplicate(result);edit(x);
 if(validateVparEvidenceMatrix(x,db,rule,differential,plan).length)rejected++;
 else errors.push('unsafe_report_edit_not_detected_'+name);
}
require(rejected===attacks.length,'not_all_report_mutations_rejected');
const planMutations=[
 ['invent_received_document',x=>{x.receivedPrivateDocuments=1;}],
 ['weaken_evidence_policy',x=>{x.policy.independentApprovalNotRecorded=false;}],
 ['omit_safety_gate',x=>{x.gateDefinitions=x.gateDefinitions.filter(g=>g.id!=='safety_and_test_control');}],
 ['alias_group_as_subgroup',x=>{x.target.candidateSubgroup='COMR';}],
 ['erase_alternative',x=>{x.circuits[0].counterHypothesis='';}],
 ['invent_approval',x=>{x.approvedMappings=1;}]
];
for(const [name,edit] of planMutations){
 const p=duplicate(plan);edit(p);
 if(!validateVparEvidenceMatrix(result,db,rule,differential,p).length)errors.push('unsafe_plan_edit_not_detected_'+name);
 else rejected++;
}
const report={...result,audit:{
 originalRules:rules.length,blockedRule:'drill-compressor-filter',
 reportAttacksRejected:attacks.length,planAttacksRejected:planMutations.length,
 evaluatedCatalogueObjects:result.counts.candidateCodeSlots,
 approvedMappings:0,realInspections:0
},errors};
fs.mkdirSync(path.join(root,'reports'),{recursive:true});
fs.writeFileSync(path.join(root,'reports/pm-vpar-evidence-matrix.generated.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({status:errors.length?'FAIL':'OK',counts:result.counts,
 audit:report.audit,circuitOptions:CIRCUIT_IDS,evidenceGates:REVIEW_GATE_IDS,
 components:result.components.map(c=>({slot:c.componentSlot,descriptorHints:c.descriptorHints,damageCauseEligible:c.catalogueDamageCauseEligible,installed:c.installed})),
 errors},null,2));
process.exit(errors.length?1:0);
