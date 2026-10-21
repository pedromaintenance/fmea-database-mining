#!/usr/bin/env node
/**
 * 25 seed rules x actual SAP hierarchy x generated links, with 24 adversarial
 * regression mutations. No OEM/SAP application approval is inferred.
 */
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {checkPmCandidate,auditPmCandidateSet} from './lib/pm-link-integrity.mjs';
import {matchesRoot} from './pm-system-scope.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const db=read('data/catalog/failure-db.v1.json'),rules=read('data/knowledge/pm-prevention/seed-rules.json').records;
const links=read('data/knowledge/pm-prevention/generated-links.json').records;
const fixtures=read('data/quality/pm-strict-link-regressions.v1.json');
const errors=[],ck=(v,s)=>{if(!v)errors.push(s)},clone=x=>JSON.parse(JSON.stringify(x));
const full=auditPmCandidateSet(db,rules,links);
errors.push(...full.errors);
ck(full.counts.rules===25&&rules.length===25&&links.length>0,'invalid_seed_rules_or_generated_links');
ck(full.byRule.length===25&&full.byRule.every(x=>x.reviewStatus==='pendente'&&x.operationallyApproved===false&&x.confirmedFailureEvents===0),'false_rule_review_or_field_status');
ck(full.counts.realInspections===0&&full.counts.verifiedOemEffectivity===0&&full.counts.approvedPmMappings===0,'false_oem_or_sap_approvals');
ck(fixtures.schema==='fmea-mining.pm-strict-link-regressions.v1'&&fixtures.version==='1.3.34'&&fixtures.nature==='synthetic_mutation_tests_over_real_generated_candidate_links','invalid_fixture_provenance');
ck(fixtures.baselineRules.length===25&&fixtures.mutationCases.length===24&&JSON.stringify(fixtures.counts)===JSON.stringify({sourceRules:25,adversarialMutations:24,totalChecks:49,confirmedSapMappings:0,realObservedFailures:0}),'49_regressions_required');
const allRules=new Set(rules.map(x=>x.id)),reported=new Set();
for(const t of fixtures.baselineRules){
 ck(allRules.has(t.ruleId)&&!reported.has(t.ruleId)&&t.expected==='structural_reconciliation_checked_no_approval','baseline_rule_missing_'+t.ruleId);
 reported.add(t.ruleId);
}
ck(reported.size===25,'not_all_rules_checked');
// Explicit functional root/group tests catch shared subgroup codes, even
// when one specific SAP model currently has no matching registered component.
ck(matchesRoot({system:'arrefecimento'},{sistema:{codigo:'ENSY'},grupo:{codigo:'COSY'}})===true,'cooling_group_positive_missing');
ck(matchesRoot({system:'arrefecimento'},{sistema:{codigo:'ENSY'},grupo:{codigo:'ENGN'}})===false,'cooling_group_false_positive');
ck(matchesRoot({system:'combustivel'},{sistema:{codigo:'ENSY'},grupo:{codigo:'HYSY'}})===false,'fuel_group_false_positive');
ck(matchesRoot({system:'hidraulico'},{sistema:{codigo:'HYSY'},grupo:{codigo:'STSY'}})===false,'steering_wrongly_generic_hydraulic');
ck(matchesRoot({system:'hidraulico'},{sistema:{codigo:'HYSY'},grupo:{codigo:'BRSY'}})===false,'brakes_wrongly_generic_hydraulic');
ck(matchesRoot({system:'rodante'},{sistema:{codigo:'ENSY'},grupo:{codigo:'UNCR'}})===false,'rodante_in_engine_root');
ck(matchesRoot({system:'ar_comprimido'},{sistema:{codigo:'AISY'},grupo:{codigo:'COMR'}})===true,'air_compressor_group_missing');
const first=links[0],baseRule=rules.find(x=>x.id===first?.originRule),baseLoc=db.locations.find(x=>x.id===first?.locationId);
ck(!!first&&!!baseRule&&!!baseLoc,'no_real_source_candidate_to_mutate');
const modifiers={
 origin_rule_mismatch:(p)=>{p.link.originRule='NOT-THE-ORIGINAL-RULE'},
 model_not_supported:p=>{p.link.modelId='EQ-NOT-DECLARED'},
 location_model_drift:p=>{p.location.modelo='EQ-WRONG'},
 location_id_mismatch:p=>{p.link.locationId='NOT-SAME-LOCATION'},
 not_depth_three:p=>{p.location.profundidade=2},
 wrong_subgroup:p=>{p.location.subgrupo.codigo='UNRELATED'},
 wrong_functional_system:p=>{p.location.sistema.codigo='UNRELATED'},
 wrong_sap_object_type:p=>{p.location.objetoTipoSAP='NOT-A-REGISTERED-TYPE'},
 unlisted_component:p=>{p.link.componentCode='NOT-CATALOGUED'},
 part_description_mismatch:p=>{p.rule.partText='NOT-A-MATCHING-COMPONENT'},
 wrong_damage:p=>{p.link.damageId='DAMAGE-NOT-FROM-RULE'},
 wrong_cause:p=>{p.link.causeId='CAUSE-NOT-FROM-RULE'},
 false_observation:p=>{p.link.occurrence='observada'},
 false_inspection_evidence:p=>{p.link.evidenceStatus='inspecao_com_resultado'},
 false_mapping_approval:p=>{p.link.associationStatus='homologado'},
 false_scope_confirmation:p=>{p.link.systemScope='confirmado_por_sap'},
 wrong_symptom:p=>{p.link.symptomCandidate='DIAGNOSTICADO'},
 wrong_inspection_method:p=>{p.link.inspectionMethod='TEST-NO-METHOD'},
 wrong_generated_id:p=>{p.link.id='PMF-UNRELATED'},
 missing_warning:p=>{p.link.warning=null},
 unexpected_private_field:p=>{p.link.privateOemDocument='TEST-RESTRICTED'},
 alter_rule_model_coverage:p=>{p.rule.models=[]}
};
let rejected=0;const seen=new Set();
for(const f of fixtures.mutationCases){
 ck(!seen.has(f.id),'duplicate_mutation_'+f.id);seen.add(f.id);
 let caught=false;
 if(f.mutation==='remove_candidate_link'){
  const a=auditPmCandidateSet(db,rules,links.slice(1));caught=a.errors.some(x=>x.startsWith('incomplete_or_extra_generation_'));
 }else if(f.mutation==='duplicate_candidate_link'){
  const a=auditPmCandidateSet(db,rules,[...links,links[0]]);caught=a.errors.some(x=>x.startsWith('duplicate_generated_link_'));
 }else{
  const m=modifiers[f.mutation];
  if(!m){errors.push('unknown_mutation_'+f.mutation);continue}
  const obj={link:clone(first),rule:clone(baseRule),location:clone(baseLoc)};
  m(obj);
  caught=checkPmCandidate(obj.link,obj.rule,obj.location,db).length>0;
 }
 ck(caught&&f.expected==='reject','unsafe_mutation_passed_'+f.mutation);
 if(caught)rejected++;
}
ck(rejected===24,'not_all_adversarial_mutations_rejected');
const report={...full,regressions:{baselineRulesChecked:reported.size,adversarialMutationsRejected:rejected},errors};
fs.mkdirSync(path.join(root,'reports'),{recursive:true});
fs.writeFileSync(path.join(root,'reports/pm-system-scope-audit.generated.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({status:errors.length?'FAIL':'OK',...report.counts,adversarialMutationsRejected:rejected,ruleBlockers:report.byRule.filter(x=>x.blocker).map(x=>({id:x.ruleId,blocker:x.blocker})),sharedSubgroups:report.sharedSubgroupRisk,errors:errors.slice(0,24)},null,2));
process.exit(errors.length?1:0);
