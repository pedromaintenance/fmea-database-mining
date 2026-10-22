/** Invariants for gear damage versus non-localizing drivetrain indications. */
export const DRIVE_CONDITIONS=Object.freeze([
 'COND-DRIVE-GEAR-TOOTH-WEAR','COND-DRIVE-GEAR-PITTING','COND-DRIVE-GEAR-TOOTH-FRACTURE',
 'COND-DRIVE-MAGNETIC-DEBRIS','COND-DRIVE-OIL-CONTAMINATION','COND-DRIVE-LUBRICATION-INADEQUACY','COND-DRIVE-ABNORMAL-NOISE'
]);
export const DRIVE_ACTIONS=Object.freeze([
 'ACT-DRIVE-PLUG-DEBRIS-INSPECT','ACT-DRIVE-OIL-REPRESENTATIVE-SAMPLE',
 'ACT-DRIVE-LUBRICATION-OEM-CHECK','ACT-DRIVE-GEAR-DAMAGE-EVALUATE'
]);
export const DRIVE_DAMAGES=Object.freeze([
 'DMG-DRIVE-GEAR-TOOTH-WEAR-CANDIDATE','DMG-DRIVE-GEAR-PITTING-CANDIDATE','DMG-DRIVE-GEAR-FRACTURE-CANDIDATE'
]);
const eq=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
export function checkGearSemanticBoundary(model,fixture,policy,seed,sources){
 const errors=[],ck=(v,id)=>{if(!v)errors.push(id)};
 ck(model?.schema==='fmea-mining.condition-action-damage.v1'&&model?.version==='1.3.13'&&model?.conditions?.length===43&&model?.actions?.length===35&&model?.damageHypotheses?.length===20&&model?.bundles?.length===15&&model?.relations?.length===109,'ontology_version_or_cardinality');
 ck(model?.safetyInvariant==='condition!=action!=damage'&&model?.evidenceNature==='no_field_observation'&&model?.observations?.length===0&&model?.workOrderExecutions?.length===0&&model?.confirmedComponentDamages?.length===0,'field_evidence_fabricated');
 const rule=seed.find(x=>x.id==='final-drive-gear');
 ck(rule?.system==='comando_final'&&rule?.subgroupCode==='FID1'&&rule?.partText==='Engrenagem'&&rule?.damageId==='02.01'&&rule?.causeId==='C2.11'&&rule?.review==='pendente','seed_changed');
 const bearing=seed.find(x=>x.id==='final-drive-bearing');
 ck(bearing?.subgroupCode==='FID2'&&bearing?.partText==='Rolamento'&&bearing?.system==='comando_final','bearing_rule_changed');
 const bundle=model.bundles.find(x=>x.id==='BUNDLE-14');
 ck(bundle?.ruleId==='final-drive-gear'&&eq(bundle?.conditionIds,DRIVE_CONDITIONS)&&eq(bundle?.actionIds,DRIVE_ACTIONS)&&eq(bundle?.differentialDamageIds,DRIVE_DAMAGES),'bundle_boundary');
 ck(bundle?.chainIds?.length===0&&bundle?.mappingScope==='generic_only'&&bundle?.status==='review_candidate'&&bundle?.automaticDamagePromotion===false&&bundle?.observedConditionIds?.length===0&&bundle?.performedActionIds?.length===0&&bundle?.confirmedDamageIds?.length===0,'bundle_promoted');
 ck(bundle?.interpretation?.includes('NÃO confirmam engrenagem')&&bundle?.interpretation?.includes('classifica aparência, sem definir causa'),'causal_separation_lost');
 ck(model.bundles.some(b=>b.id==='BUNDLE-15'&&b.ruleId==='final-drive-bearing'&&b.differentialDamageIds.every(id=>id.startsWith('DMG-DRIVE-BEARING-'))),'bearing_is_independent_bundle');
 const byId=x=>new Map(x.map(v=>[v.id,v]));
 const conditions=byId(model.conditions),actions=byId(model.actions),damages=byId(model.damageHypotheses);
 const refs=new Set(sources.map(x=>x.id));
 ck(policy?.schema==='fmea-mining.pm-final-drive-gear-discrimination.v1'&&policy?.version==='1.3.47'&&policy?.ruleId==='final-drive-gear'&&policy?.competingRuleId==='final-drive-bearing'&&policy?.status==='generic_only_unobserved','invalid_policy');
 ck(eq(policy?.conditions,DRIVE_CONDITIONS)&&eq(policy?.damages,DRIVE_DAMAGES)&&eq(policy?.nonLocalizingConditions,DRIVE_CONDITIONS.slice(3)),'policy_differential_changed');
 ck(policy?.requiresDirectGearInspectionForDamage===true&&policy?.independentEvidence?.length===6&&policy?.safety&&Object.keys(policy.safety).length===10&&Object.values(policy.safety).every(Boolean),'unsafe_policy');
 ck(policy?.observedEvents===0&&policy?.performedActions===0&&policy?.confirmedDamage===0&&policy?.approvedMappings===0&&policy?.oemCondemnationLimit===null,'fake_OEM_limit_or_approval');
 ck(policy?.sourceIds?.includes('ISO-10825-1-2022')&&policy?.sourceIds?.includes('CAT-DRIVE-MAGNET-PLUG')&&policy?.sourceIds?.every(x=>refs.has(x)),'insufficient_sources');
 for(const id of DRIVE_CONDITIONS){
  const x=conditions.get(id);
  const medium=DRIVE_CONDITIONS.indexOf(id)<3?'engrenagem_comando_final':DRIVE_CONDITIONS.indexOf(id)<6?'oleo_comando_final':'conjunto_comando_final';
  ck(x?.system==='comando_final'&&x?.medium===medium&&x?.status==='condition_hypothesis_not_observed'&&x?.observedValue===null&&x?.observedAt===null,'observed_condition_or_wrong_medium_'+id);
  ck(x?.observation?.length>70&&x?.limitations?.length>105&&x?.sourceIds?.length>0&&x?.sourceIds?.every(z=>refs.has(z)),'weak_condition_'+id);
 }
 for(const id of DRIVE_ACTIONS){
  const x=actions.get(id);
  ck(x?.requiresApplicableOemProcedure===true&&x?.executionStatus==='not_performed'&&x?.intervalHours===null&&x?.observedResults?.length===0,'executed_action_'+id);
  ck(x?.safety?.length>100&&x?.intent?.length>85&&x?.sourceIds?.every(z=>refs.has(z)),'unsafe_action_'+id);
 }
 for(const id of DRIVE_DAMAGES){
  const x=damages.get(id);
  ck(x?.componentRole==='engrenagem_comando_final'&&x?.kind==='candidate_component_damage'&&x?.confirmed===false&&x?.reviewStatus==='not_approved'&&Object.keys(x?.catalogMapping||{}).length===5&&Object.values(x.catalogMapping).every(v=>v===null),'damage_promoted_'+id);
  ck(x?.requiredEvidence?.length>105&&x?.sourceIds?.every(z=>refs.has(z))&&x?.label?.includes('Possível'),'damage_missing_evidence_'+id);
 }
 ck(!DRIVE_DAMAGES.some(id=>model.bundles.some(b=>b.id!=='BUNDLE-14'&&b.differentialDamageIds.includes(id))),'gear_damage_shared');
 const edges=model.relations.filter(e=>e.from==='BUNDLE-14');
 ck(edges.length===14&&eq(edges.map(e=>e.id),Array.from({length:14},(_,i)=>'REL-'+String(81+i).padStart(3,'0'))),'relations_count');
 ck(edges.every(e=>e.observed===false&&e.reviewStatus==='interpretacao_inferida'&&[...DRIVE_CONDITIONS,...DRIVE_ACTIONS,...DRIVE_DAMAGES].includes(e.to)&&e.type===(DRIVE_CONDITIONS.includes(e.to)?'rule_monitors_condition':DRIVE_ACTIONS.includes(e.to)?'rule_proposes_action':'rule_lists_differential_damage')),'wrong_relations');
 ck(fixture?.status==='synthetic_assertions_not_real_events'&&fixture?.cases?.length===26,'fixtures_count');
 for(const [id,cs,act] of [
  ['SEM-23',[DRIVE_CONDITIONS[3],DRIVE_CONDITIONS[6]],DRIVE_ACTIONS[0]],
  ['SEM-24',[DRIVE_CONDITIONS[4],DRIVE_CONDITIONS[5]],DRIVE_ACTIONS[1]]
 ]){
  const f=fixture?.cases?.find(v=>v.id===id);
  ck(f?.ruleId==='final-drive-gear'&&eq(f?.observedConditionIds,cs)&&eq(f?.performedActionIds,[act])&&f?.independentComponentTest==='not_performed'&&f?.expectedConfirmedDamageIds?.length===0,'synthetic_fixture_faked_'+id);
 }
 return errors;
}
