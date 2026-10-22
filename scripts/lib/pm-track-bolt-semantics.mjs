/**
 * Track shoe/link fastener semantics. This guard models diagnostic hypotheses,
 * not measured clamp force, installed parts, or authorization to retorque.
 */
export const BOLT_CONDITIONS=Object.freeze([
 'COND-TRACK-SHOE-FASTENER-LOOSE',
 'COND-TRACK-SHOE-ROTATION-SUSPECT',
 'COND-TRACK-SHOE-SEAT-DISTRESS',
 'COND-TRACK-SHOE-FASTENER-FRACTURE'
]);
export const BOLT_ACTIONS=Object.freeze([
 'ACT-TRACK-SHOE-JOINT-IDENTIFY',
 'ACT-TRACK-SHOE-SEAT-INSPECT',
 'ACT-TRACK-SHOE-OEM-REASSEMBLY-EVAL'
]);
export const BOLT_DAMAGES=Object.freeze([
 'DMG-TRACK-SHOE-JOINT-CLAMP-CANDIDATE',
 'DMG-TRACK-SHOE-FASTENER-FRACTURE-CANDIDATE'
]);
const eq=(x,y)=>Array.isArray(x)&&Array.isArray(y)&&x.length===y.length&&x.every((e,i)=>e===y[i]);
const map=x=>new Map(x.map(v=>[v.id,v]));
const sourceIds=['CAT-UC-DOZER-GUIDE','CAT-DOZER-UC-MAINT','NORDLOCK-BOLT-LOOSENING','NORDLOCK-BOLTING-FAILURE'];
export function auditTrackBoltOntology(m,fixtures,seed,policy,sourceList) {
 const errors=[],check=(v,id)=>{if(!v)errors.push(id)};
 check(m?.schema==='fmea-mining.condition-action-damage.v1'&&m?.version==='1.3.13'&&
  m?.conditions?.length===43&&m?.actions?.length===35&&m?.damageHypotheses?.length===20&&
  m?.bundles?.length===15&&m?.relations?.length===109,'ontology_version_or_counts');
 check(m?.safetyInvariant==='condition!=action!=damage'&&m?.evidenceNature==='no_field_observation'&&
  m?.observations?.length===0&&m?.workOrderExecutions?.length===0&&m?.confirmedComponentDamages?.length===0,'faked_provenance');
 const rule=seed.find(x=>x.id==='track-bolt-loose');
 check(rule?.system==='rodante'&&rule?.subgroupCode==='TRAK'&&rule?.partText==='Parafuso'&&
  rule?.damageId==='01.15'&&rule?.causeId==='C1.17'&&rule?.status==='hipotese_de_protecao_preventiva'&&rule?.review==='pendente','original_seed_changed');
 const b=m.bundles.find(x=>x.id==='BUNDLE-13');
 check(b?.ruleId==='track-bolt-loose'&&eq(b?.conditionIds,BOLT_CONDITIONS)&&
  eq(b?.actionIds,BOLT_ACTIONS)&&eq(b?.differentialDamageIds,BOLT_DAMAGES),'bundle_wrong_domains');
 check(b?.mappingScope==='generic_only'&&b?.status==='review_candidate'&&b?.automaticDamagePromotion===false&&
  b?.chainIds?.length===0&&b?.observedConditionIds?.length===0&&
  b?.performedActionIds?.length===0&&b?.confirmedDamageIds?.length===0&&b?.evidenceInterpretation==='sem_resultado_de_campo','bundle_promoted');
 check(b?.interpretation?.includes('pré-carga por assentamento')&&b?.interpretation?.includes('mecanismos distintos')&&
  b?.interpretation?.includes('torque-turn somente sob configuração OEM'),'failed_causal_separation');
 const known=new Set(sourceList.map(s=>s.id));
 check(sourceIds.every(s=>known.has(s)&&b?.sourceIds?.includes(s)),'missing_OEM_or_bolting_sources');
 const cond=map(m.conditions),actions=map(m.actions),damages=map(m.damageHypotheses);
 for(const id of BOLT_CONDITIONS){
  const x=cond.get(id);
  check(x?.system==='rodante'&&x?.medium==='uniao_parafusada_sapata'&&
   x?.status==='condition_hypothesis_not_observed'&&x?.observedValue===null&&x?.observedAt===null,'fake_condition_'+id);
  check(x?.sourceIds?.every(v=>known.has(v))&&x?.observation?.length>70&&x?.limitations?.length>85,'condition_source_or_differential_'+id);
 }
 for(const id of BOLT_ACTIONS){
  const x=actions.get(id);
  check(x?.kind==='inspection'&&x?.requiresApplicableOemProcedure===true&&
   x?.executionStatus==='not_performed'&&x?.observedResults?.length===0&&x?.intervalHours===null,'performed_action_'+id);
  check(x?.sourceIds?.every(v=>known.has(v))&&x?.safety?.length>100&&x?.intent?.length>80,'unsafe_action_'+id);
 }
 const assembly=actions.get('ACT-TRACK-SHOE-OEM-REASSEMBLY-EVAL');
 check(assembly?.label?.includes('torque-turn')&&assembly?.intent?.includes('sem valores generalizados')&&
  assembly?.safety?.includes('Não reapertar cegamente'),'generalized_torque_or_blind_retorque');
 for(const id of BOLT_DAMAGES){
  const x=damages.get(id);
  check(x?.confirmed===false&&x?.reviewStatus==='not_approved'&&x?.kind==='candidate_component_damage'&&
   Object.keys(x.catalogMapping||{}).length===5&&Object.values(x.catalogMapping).every(v=>v===null),'damage_falsely_confirmed_'+id);
  check(x?.requiredEvidence?.length>100&&x?.sourceIds?.every(v=>known.has(v)),'damage_lacks_independent_proof_'+id);
 }
 check(damages.get(BOLT_DAMAGES[0])?.label?.includes('Suspeita')&&damages.get(BOLT_DAMAGES[1])?.label?.includes('Suspeita'),'false_certain_damage_title');
 const edges=m.relations.filter(x=>x.from==='BUNDLE-13'),destinations=[...BOLT_CONDITIONS,...BOLT_ACTIONS,...BOLT_DAMAGES];
 check(edges.length===9&&eq(edges.map(x=>x.id),Array.from({length:9},(_,i)=>'REL-'+String(i+72).padStart(3,'0'))),'typed_edge_count_or_ids');
 for(const x of edges){
  const expected=BOLT_CONDITIONS.includes(x.to)?'rule_monitors_condition':BOLT_ACTIONS.includes(x.to)?'rule_proposes_action':'rule_lists_differential_damage';
  check(destinations.includes(x.to)&&x.type===expected&&x.observed===false&&x.reviewStatus==='interpretacao_inferida','unsafe_relation_'+x.id);
 }
 check(m.bundles.filter(x=>x.ruleId==='track-bolt-loose').length===1,'duplicate_rule_bundle');
 check(!b?.conditionIds.some(x=>/IDLER|ROLLER/.test(x))&&!b?.actionIds.some(x=>/IDLER|ROLLER/.test(x)),'cross_component_track_node');
 check(policy?.schema==='fmea-mining.pm-track-bolt-discrimination.v1'&&policy?.version==='1.3.46'&&policy?.ruleId==='track-bolt-loose'&&policy?.scope==='track_shoe_to_link_bolted_joint','invalid_policy');
 check(eq(policy?.paths?.map(x=>x.conditionId),[
  'COND-TRACK-SHOE-ROTATION-SUSPECT','COND-TRACK-SHOE-SEAT-DISTRESS',
  'COND-TRACK-SHOE-FASTENER-LOOSE','COND-TRACK-SHOE-FASTENER-FRACTURE']),'policy_mechanism_paths');
 check(policy?.paths?.every(x=>x.status==='hypothesis_not_observed'&&x.alternatives.length>=2&&x.test.length>65),'mechanisms_not_differentiated');
 check(policy?.independentEvidence?.length===6&&sourceIds.every(x=>policy?.sourceIds?.includes(x)),'missing_independent_proof');
 check(policy?.safeguards&&Object.keys(policy.safeguards).length===10&&Object.values(policy.safeguards).every(x=>x===true),'policy_safety_relaxed');
 check(policy?.measuredPreload===null&&policy?.appliedTorqueNm===null&&policy?.appliedTurnAngleDegrees===null&&
  policy?.observedFailures===0&&policy?.executedTasks===0&&policy?.approvedSapMappings===0,'pretended_torque_or_field_data');
 check(fixtures?.status==='synthetic_assertions_not_real_events'&&fixtures?.cases?.length===26,'fixtures_count');
 for(const [id,expected] of [
  ['SEM-21',['COND-TRACK-SHOE-FASTENER-LOOSE','COND-TRACK-SHOE-ROTATION-SUSPECT']],
  ['SEM-22',['COND-TRACK-SHOE-SEAT-DISTRESS','COND-TRACK-SHOE-FASTENER-FRACTURE']]
 ]){
  const x=fixtures?.cases?.find(f=>f.id===id);
  check(x?.ruleId==='track-bolt-loose'&&eq(x?.observedConditionIds,expected)&&x?.independentComponentTest==='not_performed'&&
   x?.expectedConfirmedDamageIds?.length===0,'synthetic_promoted_'+id);
 }
 return errors;
}
