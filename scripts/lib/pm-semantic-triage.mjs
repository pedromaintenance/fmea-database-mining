/**
 * PM semantic triage: only conditions, non-executed action proposals and
 * differential component damage hypotheses. No SAP orders or field results.
 */
const TARGETS=Object.freeze({
 'cooling-radiator-blockage':{
  blocker:'damage_cause_not_permitted',system:'arrefecimento',
  paths:{
   air_side_debris:{condition:'COND-COOL-EXTERNAL-DEBRIS',actions:['ACT-COOL-FINS-INSPECT','ACT-COOL-FINS-CLEAN'],damages:[]},
   coolant_side_restriction:{condition:'COND-COOL-INTERNAL-FLOW-RESTRICTION',actions:['ACT-COOL-CIRCULATION-TEST'],damages:['DMG-COOL-INTERNAL-BLOCKAGE']},
   temperature_signal_only:{condition:'COND-COOL-HIGH-TEMPERATURE',actions:['ACT-COOL-FINS-INSPECT','ACT-COOL-CIRCULATION-TEST'],damages:[]}
  }
 },
 'fuel-tank-water':{
  blocker:'damage_cause_not_permitted',system:'combustivel',
  paths:{
   water_in_fuel:{condition:'COND-FUEL-WATER',actions:['ACT-FUEL-REPRESENTATIVE-SAMPLE','ACT-FUEL-DRAIN-SEPARATOR'],damages:['DMG-FUEL-DRAIN-FAILURE']},
   sediment_in_fuel:{condition:'COND-FUEL-SEDIMENT',actions:['ACT-FUEL-REPRESENTATIVE-SAMPLE','ACT-FUEL-DRAIN-SEPARATOR'],damages:[]}
  }
 }
});
const REQUIRED_POLICY=[
 'never_auto_generate_sap_order','never_confirm_damage_from_condition',
 'never_confirm_damage_from_performed_action','never_approve_blocked_sap_mapping',
 'never_invent_test_result','never_invent_oem_threshold','never_invent_operating_hours',
 'requires_safe_applicable_oem_procedure','independent_component_test_required_to_confirm_damage'
];
const forbiddenOutputNames=/^(?:serial|partNumber|partCode|sapOrder|inspectionResult|measuredValue|confirmedCause|approvedLocationId)$/i;
const setEqual=(a,b)=>Array.isArray(a)&&a.length===b.length&&new Set(a).size===a.length&&b.every(x=>a.includes(x));
const txt=(x,n)=>typeof x==='string'&&x.length>=n;
export function checkTriagePlan(plan,model,seedRules,blockedRules,sources){
 const errors=[],ck=(ok,msg)=>{if(!ok)errors.push(msg)};
 ck(plan?.schema==='fmea-mining.pm-semantic-triage-plan.v1'&&plan.version==='1.3.39','plan_identity');
 ck(plan?.nature==='editorial_condition_action_triage_without_field_observation_or_SAP_execution','plan_nature');
 ck(plan?.observedInspections===0&&plan.approvedSapMappings===0&&plan.confirmedFailures===0,'fabricated_plan_counts');
 ck(plan?.safetyPolicy&&Object.keys(plan.safetyPolicy).length===REQUIRED_POLICY.length&&REQUIRED_POLICY.every(k=>plan.safetyPolicy[k]===true),'missing_safety_policy');
 ck(model?.safetyInvariant==='condition!=action!=damage'&&model.evidenceNature==='no_field_observation','ontology_evidence_drift');
 const seed=new Map(seedRules.map(x=>[x.id,x])),blocked=new Map(blockedRules.map(x=>[x.ruleId,x]));
 const bundles=new Map(model.bundles.map(x=>[x.ruleId,x]));
 const conditions=new Map(model.conditions.map(x=>[x.id,x])),actions=new Map(model.actions.map(x=>[x.id,x]));
 const damages=new Map(model.damageHypotheses.map(x=>[x.id,x])),knownSources=new Set(sources.map(x=>x.id));
 ck(plan?.rules?.length===Object.keys(TARGETS).length,'rule_count_changed');
 ck(new Set(plan?.rules?.map(x=>x.ruleId)||[]).size===Object.keys(TARGETS).length,'rule_identity_duplicate');
 for(const [id,spec] of Object.entries(TARGETS)){
  const p=plan.rules.find(x=>x.ruleId===id),r=seed.get(id),block=blocked.get(id),b=bundles.get(id);
  ck(!!p&&!!r&&!!block&&!!b,'missing_source_'+id);
  if(!p||!r||!block||!b)continue;
  ck(p.functionalSystem===spec.system&&r.system===spec.system,'wrong_system_'+id);
  ck(block.expectedBlocker===spec.blocker&&block.status==='bloqueado_aguardando_curadoria'&&block.autoRemapAllowed===false,'blocked_rule_promoted_'+id);
  ck(r.review==='pendente'&&r.status==='hipotese_de_protecao_preventiva','seed_promoted_'+id);
  ck(b.automaticDamagePromotion===false&&b.mappingScope==='generic_only'&&b.confirmedDamageIds.length===0&&b.observedConditionIds.length===0&&b.performedActionIds.length===0,'ontology_bundle_approved_'+id);
  ck(setEqual(p.sourceIds,b.sourceIds)&&p.sourceIds.every(x=>knownSources.has(x)),'source_mismatch_'+id);
  ck(txt(p.question,55),'weak_question_'+id);
  ck(p.editorialStatus==='ready_for_human_review_not_executable'&&p.generatedMaintenanceOrders===0&&
    p.observedConditions.length===0&&p.performedActions.length===0&&p.confirmedDamages.length===0,'fabricated_field_or_execution_'+id);
  const expected=Object.keys(spec.paths);
  ck(setEqual(p.pathways?.map(x=>x.id),expected),'pathways_drift_'+id);
  for(const [pid,definition] of Object.entries(spec.paths)){
   const x=p.pathways.find(x=>x.id===pid);
   ck(!!x,'missing_path_'+pid);
   if(!x)continue;
   ck(x.conditionId===definition.condition&&b.conditionIds.includes(x.conditionId)&&conditions.has(x.conditionId),'condition_drift_'+pid);
   ck(setEqual(x.actionIds,definition.actions)&&x.actionIds.every(a=>b.actionIds.includes(a)&&actions.has(a)),'action_drift_'+pid);
   ck(setEqual(x.differentialDamageIds,definition.damages)&&x.differentialDamageIds.every(d=>b.differentialDamageIds.includes(d)&&damages.has(d)),'damage_drift_'+pid);
   ck(txt(x.interpretation,75)&&txt(x.counterEvidence,75)&&txt(x.independentComponentEvidence,75),'weak_discrimination_'+pid);
   const c=conditions.get(x.conditionId);
   ck(c?.status==='condition_hypothesis_not_observed'&&c?.observedValue===null&&c?.observedAt===null,'condition_already_observed_'+pid);
   for(const a of x.actionIds){
    const action=actions.get(a);
    ck(action?.requiresApplicableOemProcedure===true&&action?.executionStatus==='not_performed'&&action?.intervalHours===null&&action?.observedResults.length===0,'action_not_safe_'+pid+'/'+a);
   }
   for(const d of x.differentialDamageIds){
    const damage=damages.get(d);
    ck(damage?.confirmed===false&&damage?.reviewStatus==='not_approved'&&
      Object.values(damage.catalogMapping).every(v=>v===null),'damage_prematurely_mapped_'+pid+'/'+d);
   }
  }
 }
 return errors;
}
export function buildTriageReport(plan,model){
 const conditions=new Map(model.conditions.map(x=>[x.id,x])),actions=new Map(model.actions.map(x=>[x.id,x]));
 const damages=new Map(model.damageHypotheses.map(x=>[x.id,x]));
 const records=plan.rules.map(p=>({
  ruleId:p.ruleId,functionalSystem:p.functionalSystem,reviewStatus:p.editorialStatus,
  sourceIds:[...p.sourceIds],question:p.question,
  branches:p.pathways.map(x=>({
   pathId:x.id,condition:{id:x.conditionId,label:conditions.get(x.conditionId).label,status:'not_observed'},
   proposedActions:x.actionIds.map(id=>({id,label:actions.get(id).label,status:'not_performed',
    method:'requires_effective_OEM_procedure_and_safe_isolation'})),
   differentialDamageHypotheses:x.differentialDamageIds.map(id=>({id,label:damages.get(id).label,
    status:'not_approved_not_confirmed'})),
   interpretation:x.interpretation,alternativeExplanation:x.counterEvidence,
   independentEvidenceRequired:x.independentComponentEvidence,
   decision:'require_field_evidence_and_independent_review',
   sapNotificationCreated:false
  })),
  engineeringReview:'pending',confirmedFailureEvents:0,approvedSapMappings:0
 }));
 return {schema:'fmea-mining.pm-semantic-triage-report.v1',version:'1.3.39',
 nature:'non_executable_technical_review_no_observations',
 rulesExamined:records.length,conditionBranches:records.reduce((n,x)=>n+x.branches.length,0),
 observedConditions:0,performedActions:0,confirmedDamages:0,generatedSapNotifications:0,
 records,warning:'Preparacao editorial para revisao PCM. NÃO registra achados de campo, OS, medicao ou causa confirmada.'};
}
export function validateTriageReport(report,plan,model){
 const errors=[];
 if(JSON.stringify(report)!==JSON.stringify(buildTriageReport(plan,model)))errors.push('report_not_reproducible_or_fake_evidence');
 function walk(x){
  if(Array.isArray(x)){for(const v of x)walk(v);return;}
  if(!x||typeof x!=='object')return;
  for(const [k,v] of Object.entries(x)){
   if(forbiddenOutputNames.test(k))errors.push('private_or_unreviewed_field_'+k);
   walk(v);
  }
 }
 walk(report);
 return errors;
}
