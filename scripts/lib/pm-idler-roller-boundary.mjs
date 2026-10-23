/**
 * Formal guardrail for IDLER ≠ ROLLER semantic boundaries.
 * No OEM serial effectivity, no inspections performed, no SAP relinking.
 */
export const IDLER_CONDITIONS=Object.freeze([
 'COND-TRACK-IDLER-WEAR','COND-TRACK-IDLER-HEAT','COND-TRACK-IDLER-SEAL-LEAK'
]);
export const IDLER_ACTIONS=Object.freeze([
 'ACT-TRACK-IDLER-CTS','ACT-TRACK-IDLER-SEAL-CHECK'
]);
export const ROLLER_CONDITIONS=Object.freeze([
 'COND-TRACK-ROLLER-WEAR','COND-TRACK-ROLLER-HEAT','COND-TRACK-ROLLER-SEAL-LEAK'
]);
export const ROLLER_ACTIONS=Object.freeze([
 'ACT-TRACK-ROLLER-CTS','ACT-TRACK-ROLLER-SEAL-CHECK'
]);
const exactList=(a,b)=>Array.isArray(a)&&a.length===b.length&&a.every((x,i)=>x===b[i]);
const candidate=(x)=>x&&x.reviewStatus==='not_approved'&&x.confirmed===false&&Object.values(x.catalogMapping||{}).length===5&&Object.values(x.catalogMapping).every(v=>v===null);
export function validateIdlerRollerBoundary(model,fixtures,gap,links){
 const errors=[],ck=(ok,id)=>{if(!ok)errors.push(id)};
 ck(model?.schema==='fmea-mining.condition-action-damage.v1'&&model?.version==='1.3.18','ontology_version_or_schema');
 ck(model?.safetyInvariant==='condition!=action!=damage'&&model?.evidenceNature==='no_field_observation','unsafe_ontology_evidence');
 ck(model?.conditions?.length===77&&model?.actions?.length===58&&model?.relations?.length===182&&model?.bundles?.length===20&&model?.damageHypotheses?.length===36,'cardinality_drift');
 ck(model?.observations?.length===0&&model?.workOrderExecutions?.length===0&&model?.confirmedComponentDamages?.length===0,'fabricated_field_records');
 const byId=(items)=>new Map(items.map(x=>[x.id,x]));
 const cond=byId(model.conditions),action=byId(model.actions),damages=byId(model.damageHypotheses),bundles=byId(model.bundles),edges=byId(model.relations);
 ck(cond.size===model.conditions.length&&action.size===model.actions.length&&damages.size===model.damageHypotheses.length&&edges.size===model.relations.length,'duplicate_semantic_identity');
 const idler=bundles.get('BUNDLE-09'),roller=bundles.get('BUNDLE-08');
 ck(idler?.ruleId==='track-idler-wear'&&roller?.ruleId==='track-roller-wear','bundle_rule_scope');
 ck(exactList(idler?.conditionIds,IDLER_CONDITIONS)&&exactList(idler?.actionIds,IDLER_ACTIONS),'idler_contains_roller_or_missing_concepts');
 ck(exactList(roller?.conditionIds,ROLLER_CONDITIONS)&&exactList(roller?.actionIds,ROLLER_ACTIONS),'roller_legacy_bundle_changed');
 ck(exactList(idler?.differentialDamageIds,['DMG-TRACK-IDLER-WEAR'])&&
   exactList(roller?.differentialDamageIds,['DMG-TRACK-ROLLER-INTERNAL']),'differential_damage_changed');
 for(const b of [idler,roller]){
  ck(b?.automaticDamagePromotion===false&&b?.mappingScope==='generic_only'&&b?.evidenceInterpretation==='sem_resultado_de_campo'&&
    b?.observedConditionIds?.length===0&&b?.performedActionIds?.length===0&&b?.confirmedDamageIds?.length===0,'bundle_approved_'+b?.id);
 }
 for(const id of [...IDLER_CONDITIONS,...ROLLER_CONDITIONS]){
  const c=cond.get(id);
  ck(c?.system==='rodante'&&c?.medium==='conjunto_rodante'&&
     c?.status==='condition_hypothesis_not_observed'&&c?.observedValue===null&&c?.observedAt===null,'condition_observed_'+id);
  ck(c?.methods?.length>0&&c?.sourceIds?.includes('CAT-CTS-UNDERCARRIAGE')&&
     c?.sourceIds?.includes('CAT-MINING-UC-WEAR-MANAGEMENT')&&
     c?.observation?.length>55&&c?.limitations?.length>60,'condition_evidence_missing_'+id);
  ck(id.includes('IDLER')?c?.label.includes('roda-guia'):c?.label.includes('rolete'),'condition_wrong_component_'+id);
 }
 for(const id of [...IDLER_ACTIONS,...ROLLER_ACTIONS]){
  const a=action.get(id);
  ck(a?.kind==='inspection'&&a?.executionStatus==='not_performed'&&
     a?.requiresApplicableOemProcedure===true&&a?.observedResults?.length===0&&a?.intervalHours===null,'action_performed_'+id);
  ck(a?.safety?.length>55&&a?.sourceIds?.includes('CAT-CTS-UNDERCARRIAGE'),'action_no_OEM_safety_'+id);
  ck(id.includes('IDLER')?a?.label.includes('roda-guia'):a?.label.includes('rolete'),'action_wrong_component_'+id);
 }
 const damage=damages.get('DMG-TRACK-IDLER-WEAR');
 ck(candidate(damage)&&damage?.label==='Desgaste da roda-guia ou dano do apoio interno sob investigação','damage_title_or_status_falsified');
 ck(candidate(damages.get('DMG-TRACK-ROLLER-INTERNAL')),'roller_damage_approved');
 const idlerEdges=model.relations.filter(x=>x.from==='BUNDLE-09');
 const rollerEdges=model.relations.filter(x=>x.from==='BUNDLE-08');
 ck(idlerEdges.length===IDLER_CONDITIONS.length+IDLER_ACTIONS.length+1,'idler_edge_count');
 ck(rollerEdges.length===ROLLER_CONDITIONS.length+ROLLER_ACTIONS.length+1,'roller_edge_count');
 const expectedEdges=[
  ['REL-049','COND-TRACK-IDLER-WEAR','rule_monitors_condition'],
  ['REL-050','COND-TRACK-IDLER-HEAT','rule_monitors_condition'],
  ['REL-054','COND-TRACK-IDLER-SEAL-LEAK','rule_monitors_condition'],
  ['REL-051','ACT-TRACK-IDLER-CTS','rule_proposes_action'],
  ['REL-052','ACT-TRACK-IDLER-SEAL-CHECK','rule_proposes_action'],
  ['REL-053','DMG-TRACK-IDLER-WEAR','rule_lists_differential_damage']
 ];
 for(const [eid,destination,type] of expectedEdges){
  const e=edges.get(eid);
  ck(e?.from==='BUNDLE-09'&&e?.to===destination&&e?.type===type&&
   e?.observed===false&&e?.reviewStatus==='interpretacao_inferida','invalid_edge_'+eid);
 }
 ck(!idlerEdges.some(x=>x.to.includes('ROLLER'))&&!rollerEdges.some(x=>x.to.includes('IDLER')),'cross_component_semantic_edges');
 ck(gap?.ruleId==='track-idler-wear'&&gap?.expectedBlocker==='component_not_registered'&&
  gap?.status==='bloqueado_aguardando_curadoria'&&gap?.autoRemapAllowed===false&&gap?.observedFailures===0,'idler_SAP_blocker_promoted');
 ck(!links.some(x=>x.originRule==='track-idler-wear'),'idler_SAP_link_autogenerated');
 ck(fixtures?.status==='synthetic_assertions_not_real_events'&&fixtures?.cases?.length===36,'fixture_count');
 const byFixture=byId(fixtures?.cases||[]);
 for(const id of ['SEM-12','SEM-13','SEM-15','SEM-16']){
  const f=byFixture.get(id);ck(!!f&&f.independentComponentTest==='not_performed'&&f.expectedConfirmedDamageIds.length===0,'fixture_faked_'+id);
 }
 ck(exactList(byFixture.get('SEM-12')?.observedConditionIds,['COND-TRACK-ROLLER-HEAT'])&&
  exactList(byFixture.get('SEM-12')?.performedActionIds,['ACT-TRACK-ROLLER-CTS']),'legacy_roller_case_regressed');
 ck(exactList(byFixture.get('SEM-13')?.observedConditionIds,['COND-TRACK-IDLER-WEAR'])&&
  exactList(byFixture.get('SEM-13')?.performedActionIds,['ACT-TRACK-IDLER-CTS']),'legacy_idler_case_regressed');
 ck(exactList(byFixture.get('SEM-15')?.observedConditionIds,['COND-TRACK-IDLER-HEAT'])&&
  exactList(byFixture.get('SEM-15')?.performedActionIds,[]),'idler_heat_case');
 ck(exactList(byFixture.get('SEM-16')?.observedConditionIds,['COND-TRACK-IDLER-SEAL-LEAK'])&&
  exactList(byFixture.get('SEM-16')?.performedActionIds,['ACT-TRACK-IDLER-SEAL-CHECK']),'idler_seal_case');
 // The fixture describes hypothetical inputs, not actual field events.
 for(const f of fixtures.cases){
  ck(f?.independentComponentTest==='not_performed'&&f?.expectedConfirmedDamageIds?.length===0,'synthetic_fixture_damage_'+f.id);
 }
 return errors;
}
