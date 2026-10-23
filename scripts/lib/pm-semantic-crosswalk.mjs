/**
 * All 25 PM seeds are surveyed; the condition/action/damage ontology currently
 * has versioned bundles; review coverage rather than assuming all rules are modeled. A shared generic symptom is NOT an observed failure.
 */
export const EXPECTED_SHARES=Object.freeze([
 'COND-FUEL-WATER','COND-FUEL-SEDIMENT','ACT-FUEL-REPRESENTATIVE-SAMPLE',
 'COND-HYD-EXTERNAL-LEAK','COND-HYD-LOW-FUNCTIONAL-PRESSURE','ACT-HYD-PRESSURE-VERIFY',
 'COND-DRIVE-MAGNETIC-DEBRIS','COND-DRIVE-OIL-CONTAMINATION','COND-DRIVE-LUBRICATION-INADEQUACY',
 'COND-DRIVE-ABNORMAL-NOISE','ACT-DRIVE-OIL-REPRESENTATIVE-SAMPLE'
]);
const PREFIX_SYSTEM={FUEL:'combustivel',COOL:'arrefecimento',ENGINE:'motor_diesel',HYD:'hidraulico',TRACK:'rodante',DRIVE:'comando_final',DIFF:'diferencial',IMPL:'implementos'};
const LABEL_EXCEPTIONS=/\b(confirmad[oa]s?|efetiv[ao]s?)\b/i;
const unique=(items)=>new Set(items).size===items.length;
const eq=(a,b)=>JSON.stringify([...a].sort())===JSON.stringify([...b].sort());
const refs=(b)=>[
 ...b.conditionIds.map(id=>({id,kind:'condition'})),
 ...b.actionIds.map(id=>({id,kind:'action'})),
 ...b.differentialDamageIds.map(id=>({id,kind:'damage'}))
];
const systemFor=id=>PREFIX_SYSTEM[id.split('-')[1]]||null;
const byId=arr=>new Map(arr.map(x=>[x.id,x]));
export function validateSemanticCrosswalkInputs(ontology,rules,policy){
 const errors=[],ck=(value,message)=>{if(!value)errors.push(message)};
 ck(ontology?.schema==='fmea-mining.condition-action-damage.v1'&&ontology?.version===policy?.sourceOntologyVersion,'ontology_version_mismatch');
 ck(ontology?.safetyInvariant==='condition!=action!=damage'&&ontology?.evidenceNature==='no_field_observation','unsafe_ontology_provenance');
 ck(ontology?.observations?.length===0&&ontology?.workOrderExecutions?.length===0&&ontology?.confirmedComponentDamages?.length===0,'fabricated_events');
 ck(policy?.schema==='fmea-mining.semantic-crosswalk-policy.v1'&&policy?.version==='1.3.50'&&
  policy?.nature==='documented_generic_overlap_without_field_observations_or_component_approval','policy_provenance');
 ck(policy?.expectedBundles===17&&policy?.expectedSeedRules===25&&policy?.expectedUnmodeledRules===8,'coverage_policy_changed');
 ck(policy?.policy&&Object.keys(policy.policy).length===10&&Object.values(policy.policy).every(Boolean),'policy_relaxed');
 ck(policy?.fieldObservations===0&&policy?.performedInspections===0&&policy?.confirmedDamages===0&&policy?.approvedSapMappings===0,'false_policy_approval');
 ck(eq(policy?.sharedNodes?.map(s=>s.id)||[],EXPECTED_SHARES),'shared_node_policy_drift');
 ck(unique(policy?.sharedNodes?.map(s=>s.id)||[]),'duplicate_share_policy');
 ck(policy?.domainSeparation?.length===4&&
  policy.domainSeparation.some(x=>x.left==='final-drive-gear'&&x.right==='final-drive-bearing'&&x.genericOnly===true&&x.noSharedPhysicalDamages===true)&&
  policy.domainSeparation.some(x=>x.left==='track-roller-wear'&&x.right==='track-idler-wear'&&x.forbidCrossComponentRefs===true),'missing_idler_roller_guard');
 ck(eq(policy?.evidenceRequirements||[],['oem_configuration','component_identity_and_function','discriminative_test','independent_engineering_review']),'missing_independent_evidence');
 const seeds=byId(rules), bundles=byId(ontology.bundles),
   cond=byId(ontology.conditions), actions=byId(ontology.actions), damages=byId(ontology.damageHypotheses);
 ck(rules.length===25&&seeds.size===25,'seed_coverage_drift');
 ck(ontology.bundles.length===17&&bundles.size===17,'bundle_coverage_drift');
 ck(ontology.conditions.length===58&&cond.size===58&&ontology.actions.length===44&&actions.size===44&&ontology.damageHypotheses.length===26&&damages.size===26,'semantic_cardinality_drift');
 const usages=new Map();
 const byRule=new Map();
 for(const b of ontology.bundles){
  const rule=seeds.get(b.ruleId);
  ck(Boolean(rule),'orphan_bundle_'+b.id);
  ck(!byRule.has(b.ruleId),'duplicate_bundle_rule_'+b.ruleId);
  byRule.set(b.ruleId,b);
  ck(b.automaticDamagePromotion===false&&b.mappingScope==='generic_only'&&b.status==='review_candidate'&&
     b.observedConditionIds.length===0&&b.performedActionIds.length===0&&b.confirmedDamageIds.length===0&&
     b.evidenceInterpretation==='sem_resultado_de_campo','bundle_evidence_promoted_'+b.id);
  ck(unique([...b.conditionIds,...b.actionIds,...b.differentialDamageIds]),'repeated_semantic_edge_'+b.id);
  for(const v of refs(b)){
   const item=v.kind==='condition'?cond.get(v.id):v.kind==='action'?actions.get(v.id):damages.get(v.id);
   ck(Boolean(item),'missing_concept_'+v.id);
   const prefixSystem=systemFor(v.id);
   ck(prefixSystem===rule?.system,'system_scope_mismatch_'+b.ruleId+'/'+v.id);
   if(v.kind==='condition')ck(item?.system===rule?.system&&item?.status==='condition_hypothesis_not_observed'&&item.observedValue===null&&item.observedAt===null,'condition_falsified_'+v.id);
   if(v.kind==='action')ck(item?.executionStatus==='not_performed'&&item?.requiresApplicableOemProcedure===true&&item?.intervalHours===null&&item?.observedResults?.length===0,'action_falsified_'+v.id);
   if(v.kind==='damage')ck(item?.confirmed===false&&item?.reviewStatus==='not_approved'&&Object.values(item.catalogMapping).every(x=>x===null),'damage_falsified_'+v.id);
   const usage=usages.get(v.id)||{id:v.id,kind:v.kind,ruleIds:[]};
   ck(usage.kind===v.kind,'node_type_collision_'+v.id);
   usage.ruleIds.push(b.ruleId);
   usages.set(v.id,usage);
  }
 }
 const shared=[...usages.values()].filter(x=>x.ruleIds.length>1).sort((a,b)=>a.id.localeCompare(b.id));
 ck(eq(shared.map(x=>x.id),EXPECTED_SHARES)&&shared.length===11,'unexpected_shared_nodes');
 for(const s of shared){
  const rule=policy.sharedNodes.find(x=>x.id===s.id);
  ck(Boolean(rule)&&rule.kind===s.kind&&eq(s.ruleIds,rule.ruleIds),'shared_pair_or_type_changed_'+s.id);
  ck(rule?.system===systemFor(s.id)&&s.ruleIds.every(id=>seeds.get(id)?.system===rule?.system),'cross_system_shared_node_'+s.id);
  ck(rule?.sharingMeaning?.length>60&&rule?.requiredDiscrimination?.length>65,'missing_discrimination_'+s.id);
  ck(s.kind!=='damage','component_damage_shared_'+s.id);
  ck(!/(?:IDLER|ROLLER|PUMP|HOSE|DRAIN|FILTER|RADIATOR)/.test(s.id),'component_scoped_node_shared_'+s.id);
 }
 for(const [a,b] of [['track-roller-wear','track-idler-wear']]){
  const left=byRule.get(a),right=byRule.get(b);
  ck(left&&right&&refs(left).every(x=>x.id.includes('ROLLER'))&&refs(right).every(x=>x.id.includes('IDLER')),'idler_roller_boundary_regressed');
 }
 const relationByBundle=new Map();
 for(const e of ontology.relations){
  const list=relationByBundle.get(e.from)||[];list.push(e);relationByBundle.set(e.from,list);
  const parent=bundles.get(e.from);
  ck(Boolean(parent)&&refs(parent).some(x=>x.id===e.to),'orphan_or_cross_relation_'+e.id);
  ck(e.observed===false&&e.reviewStatus==='interpretacao_inferida','relation_promoted_'+e.id);
 }
 for(const b of ontology.bundles){
  const outbound=relationByBundle.get(b.id)||[];
  ck(outbound.length===refs(b).length&&unique(outbound.map(x=>x.to)),'relation_cardinality_'+b.id);
  ck(outbound.every(e=>e.type===(b.conditionIds.includes(e.to)?'rule_monitors_condition':b.actionIds.includes(e.to)?'rule_proposes_action':'rule_lists_differential_damage')),'relation_type_mismatch_'+b.id);
 }
 const coverage={totalSeeds:rules.length,modeledRules:ontology.bundles.length,
  unmodeledRuleIds:rules.filter(r=>!byRule.has(r.id)).map(x=>x.id).sort(),
  sharedGenericNodes:shared.length,sharedDamageNodes:shared.filter(x=>x.kind==='damage').length,
  distinctNodesUsed:usages.size,totalBundleReferences:[...usages.values()].reduce((n,v)=>n+v.ruleIds.length,0)};
 ck(coverage.unmodeledRuleIds.length===policy.expectedUnmodeledRules,'unmodeled_rule_coverage_drift');
 // Lexical ambiguity is a separate editorial warning, never a false approval.
 const editorialFlags=ontology.damageHypotheses.filter(x=>LABEL_EXCEPTIONS.test(x.label)).map(x=>({
  damageId:x.id,reason:'wording_may_imply_confirmed_physical_condition_check_before_publication',
  reviewState:x.reviewStatus,confirmed:x.confirmed
 }));
 return {errors,coverage,shared:shared.map(x=>({...x,
  system:policy.sharedNodes.find(s=>s.id===x.id)?.system||null,
  risk:policy.sharedNodes.find(s=>s.id===x.id)?.sharingMeaning||null,
  requiredDiscrimination:policy.sharedNodes.find(s=>s.id===x.id)?.requiredDiscrimination||null
 })),editorialFlags};
}
