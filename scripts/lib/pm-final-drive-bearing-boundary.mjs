/** No signal from the complete final drive uniquely proves a bearing failure. */
export const BEARING_CONDITIONS=Object.freeze([
 'COND-DRIVE-BEARING-CONTACT-WEAR','COND-DRIVE-BEARING-CONTACT-FATIGUE',
 'COND-DRIVE-BEARING-SEAL-LEAK','COND-DRIVE-BEARING-LOCAL-HEAT',
 'COND-DRIVE-MAGNETIC-DEBRIS','COND-DRIVE-OIL-CONTAMINATION',
 'COND-DRIVE-LUBRICATION-INADEQUACY','COND-DRIVE-ABNORMAL-NOISE'
]);
export const BEARING_ACTIONS=Object.freeze([
 'ACT-DRIVE-BEARING-EFFECTIVITY-CHECK','ACT-DRIVE-BEARING-DIFFERENTIAL-INSPECT',
 'ACT-DRIVE-BEARING-SEAL-SOURCE-CHECK','ACT-DRIVE-OIL-REPRESENTATIVE-SAMPLE'
]);
export const BEARING_DAMAGES=Object.freeze([
 'DMG-DRIVE-BEARING-WEAR-CANDIDATE','DMG-DRIVE-BEARING-FATIGUE-CANDIDATE',
 'DMG-DRIVE-BEARING-SEAL-CANDIDATE'
]);
const exact=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const dict=xs=>new Map(xs.map(x=>[x.id,x]));
export function validateBearingDifferentials(model,fixtures,policy,seed,sources){
 const err=[],ck=(ok,id)=>{if(!ok)err.push(id)};
 ck(model?.schema==='fmea-mining.condition-action-damage.v1'&&model?.version==='1.3.17'&&
 model?.conditions?.length===71&&model?.actions?.length===53&&model?.damageHypotheses?.length===32&&
 model?.bundles?.length===19&&model?.relations?.length===167,'ontology_version_cardinality');
 ck(model?.observations?.length===0&&model?.workOrderExecutions?.length===0&&model?.confirmedComponentDamages?.length===0,'false_field_evidence');
 const rule=seed.find(r=>r.id==='final-drive-bearing'),gear=seed.find(r=>r.id==='final-drive-gear');
 ck(rule?.system==='comando_final'&&rule?.subgroupCode==='FID2'&&rule?.partText==='Rolamento'&&
 rule?.damageId==='06.05'&&rule?.causeId==='C2.11'&&rule?.review==='pendente','bearing_seed_changed');
 ck(gear?.subgroupCode==='FID1'&&gear?.partText==='Engrenagem','gear_seed_changed');
 const b=model.bundles.find(x=>x.id==='BUNDLE-15'),g=model.bundles.find(x=>x.id==='BUNDLE-14');
 ck(b?.ruleId==='final-drive-bearing'&&exact(b?.conditionIds,BEARING_CONDITIONS)&&
 exact(b?.actionIds,BEARING_ACTIONS)&&exact(b?.differentialDamageIds,BEARING_DAMAGES),'bundle_identity');
 ck(g?.ruleId==='final-drive-gear'&&g?.differentialDamageIds.length===3&&
 !g.differentialDamageIds.some(x=>BEARING_DAMAGES.includes(x)),'gear_vs_bearing_boundary');
 ck(b?.chainIds?.length===0&&b?.mappingScope==='generic_only'&&b?.status==='review_candidate'&&
 b?.observedConditionIds.length===0&&b?.performedActionIds.length===0&&b?.confirmedDamageIds.length===0&&
 b?.automaticDamagePromotion===false&&b?.evidenceInterpretation==='sem_resultado_de_campo','bundle_approved');
 ck(b?.interpretation?.includes('NÃO comprovam rolamento avariado')&&b?.interpretation?.includes('Vedação do compartimento pode não pertencer ao rolamento'),'unsafe_interpretation');
 ck(model.bundles.filter(x=>x.ruleId==='final-drive-bearing').length===1,'duplicate_bearing_bundle');
 const c=dict(model.conditions),a=dict(model.actions),d=dict(model.damageHypotheses),sourceIds=new Set(sources.map(x=>x.id));
 const shared=BEARING_CONDITIONS.slice(4),localized=[
 'rolamento_comando_final','rolamento_comando_final','vedacao_comando_final','conjunto_comando_final'
 ];
 for(let i=0;i<BEARING_CONDITIONS.length;i++){
  const id=BEARING_CONDITIONS[i],x=c.get(id);
  const medium=i<4?localized[i]:i===7?'conjunto_comando_final':'oleo_comando_final';
  ck(x?.system==='comando_final'&&x?.medium===medium&&
    x?.status==='condition_hypothesis_not_observed'&&x?.observedValue===null&&x?.observedAt===null,'condition_falsified_'+id);
  ck(x?.sourceIds?.length>0&&x?.sourceIds?.every(s=>sourceIds.has(s))&&x?.observation?.length>80&&x?.limitations?.length>110,'condition_evidence_missing_'+id);
 }
 for(const id of BEARING_ACTIONS){
  const x=a.get(id);
  ck(x?.requiresApplicableOemProcedure===true&&x?.executionStatus==='not_performed'&&
    x?.observedResults?.length===0&&x?.intervalHours===null,'action_executed_'+id);
  ck(x?.sourceIds?.every(s=>sourceIds.has(s))&&x?.safety?.length>110&&x?.intent?.length>95,'unsafe_action_'+id);
 }
 for(const id of BEARING_DAMAGES){
  const x=d.get(id);
  ck(x?.kind==='candidate_component_damage'&&x?.confirmed===false&&x?.reviewStatus==='not_approved'&&
    Object.keys(x?.catalogMapping||{}).length===5&&Object.values(x.catalogMapping).every(z=>z===null),'damage_approved_'+id);
  ck(x?.label?.includes('Possível')&&x?.requiredEvidence?.length>120&&x?.sourceIds?.every(s=>sourceIds.has(s)),'damage_needs_proof_'+id);
 }
 ck(d.get(BEARING_DAMAGES[2])?.componentRole==='vedacao_conjunto_comando_final','seal_effectivity_conflated');
 ck(!BEARING_DAMAGES.some(id=>model.bundles.some(x=>x.id!=='BUNDLE-15'&&x.differentialDamageIds.includes(id))),'bearing_damage_shared');
 ck(exact(g?.conditionIds.filter(id=>shared.includes(id)),shared)&&
  g?.actionIds.includes('ACT-DRIVE-OIL-REPRESENTATIVE-SAMPLE'),'expected_generic_sharing_missing');
 const edges=model.relations.filter(e=>e.from==='BUNDLE-15'),targets=[...BEARING_CONDITIONS,...BEARING_ACTIONS,...BEARING_DAMAGES];
 ck(edges.length===15&&exact(edges.map(x=>x.id),Array.from({length:15},(_,i)=>'REL-'+String(i+95).padStart(3,'0'))),'relation_count');
 ck(edges.every(e=>targets.includes(e.to)&&e.observed===false&&e.reviewStatus==='interpretacao_inferida'&&
 e.type===(BEARING_CONDITIONS.includes(e.to)?'rule_monitors_condition':BEARING_ACTIONS.includes(e.to)?'rule_proposes_action':'rule_lists_differential_damage')),'unsafe_edge');
 ck(policy?.schema==='fmea-mining.pm-final-drive-bearing-discrimination.v1'&&policy?.version==='1.3.48'&&
 policy?.ruleId==='final-drive-bearing'&&policy?.competingRuleId==='final-drive-gear'&&policy?.ontologyVersion==='1.3.13','policy_identity');
 ck(exact(policy?.genericSharedConditions,shared)&&policy?.genericSharedAction==='ACT-DRIVE-OIL-REPRESENTATIVE-SAMPLE','policy_cross_component');
 ck(policy?.branches?.length===4&&policy?.branches?.every(x=>x.distinction.length>85)&&
 policy.branches.slice(0,3).every(x=>x.needsPhysicalInspection===true&&BEARING_DAMAGES.includes(x.candidateDamage)),'incomplete_differentials');
 ck(policy?.evidenceRequirements?.length===7&&policy?.guards&&Object.keys(policy.guards).length===11&&
 Object.values(policy.guards).every(Boolean),'safety_guards');
 ck(policy?.observations===0&&policy?.inspectionsPerformed===0&&policy?.confirmedFailures===0&&
 policy?.sapMappingsApproved===0&&policy?.measuredValues===null,'invented_field_or_threshold');
 ck(policy?.sources?.every(x=>sourceIds.has(x)),'unverified_source');
 ck(fixtures?.status==='synthetic_assertions_not_real_events'&&fixtures?.cases?.length===34,'fixtures_count');
 for(const [id,conditionIds,action] of [
  ['SEM-25',[BEARING_CONDITIONS[7],BEARING_CONDITIONS[4]],BEARING_ACTIONS[3]],
  ['SEM-26',[BEARING_CONDITIONS[2],BEARING_CONDITIONS[5]],BEARING_ACTIONS[2]]
 ]){
  const x=fixtures?.cases?.find(z=>z.id===id);
  ck(x?.ruleId==='final-drive-bearing'&&exact(x?.observedConditionIds,conditionIds)&&
   exact(x?.performedActionIds,[action])&&x?.independentComponentTest==='not_performed'&&
   x?.expectedConfirmedDamageIds.length===0,'synthetic_falsified_'+id);
 }
 return err;
}
