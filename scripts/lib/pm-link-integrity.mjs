/**
 * FMEA / PM — strict validation of *candidate* SAP mappings.
 *
 * This is a structural audit, NOT an OEM or SAP field review. It verifies
 * function/system/group/subgroup/model/object type/component/damage/cause and
 * the complete generator output. A valid candidate is NOT a confirmed failure.
 */
import {matchesRoot} from '../pm-system-scope.mjs';
const REQUIRED_LINK_KEYS=['id','modelId','locationId','componentCode','damageId','causeId','symptomCandidate','inspectionMethod','occurrence','evidenceStatus','associationStatus','systemScope','originRule','warning'];
const exact=(value,fields)=>!!value&&typeof value==='object'&&!Array.isArray(value)&&fields.length===Object.keys(value).length&&fields.every(k=>Object.hasOwn(value,k));
const contains=(a,b)=>typeof a==='string'&&typeof b==='string'&&b.length>0&&a.toLowerCase().includes(b.toLowerCase());
export function checkPmCandidate(link,rule,location,db){
 const errors=[],assert=(x,msg)=>{if(!x)errors.push(msg)};
 assert(exact(link,REQUIRED_LINK_KEYS),'unexpected_or_missing_link_field');
 if(!link||!rule||!location||!db)return errors.concat('unresolvable_rule_location_or_catalogue');
 assert(link.originRule===rule.id,'origin_rule_mismatch');
 assert(link.id==='PMF-'+rule.id+'-'+location.id+'-'+link.componentCode,'link_id_does_not_match_source');
 assert(rule.models?.includes(link.modelId),'rule_does_not_apply_to_model');
 assert(location.modelo===link.modelId,'model_location_mismatch');
 assert(location.id===link.locationId,'location_id_mismatch');
 assert(location.profundidade===3,'location_depth_not_3');
 assert(location.subgrupo?.codigo===rule.subgroupCode,'wrong_sap_subgroup');
 try{assert(matchesRoot(rule,location),'wrong_system_root_or_group')}catch{errors.push('unrecognized_system_scope')}
 const component=(db.partsByObjectType?.[location.objetoTipoSAP]||[]).find(x=>x.code===link.componentCode);
 assert(!!component,'component_not_in_location_object_type');
 assert(contains(component?.pt,rule.partText),'component_text_not_matched_to_rule');
 assert(link.damageId===rule.damageId,'damage_not_from_rule');
 assert(link.causeId===rule.causeId,'cause_not_from_rule');
 assert(db.compatibleFailureModesByPart?.[link.componentCode]?.damageCauses?.[link.damageId]?.includes(link.causeId),'catalogue_damage_cause_not_allowed');
 assert(link.symptomCandidate===rule.symptom,'symptom_not_from_rule');
 assert(link.inspectionMethod===rule.inspectionMethod,'inspection_not_from_rule');
 assert(link.occurrence==='nao_observada','fabricated_occurrence');
 assert(link.evidenceStatus==='metodo_planejado_sem_resultado','fabricated_evidence');
 assert(link.associationStatus==='inferido_nao_validado','fabricated_approval');
 assert(link.systemScope==='filtro_de_sistema_candidato','fabricated_scope_confirmation');
 assert(link.warning==='Hipótese para treinamento; NÃO equivale a achado ou causa raiz confirmada','lost_nonfield_disclaimer');
 return errors;
}
export function auditPmCandidateSet(db,rules,links){
 const errors=[],rulesById=new Map(),locationsById=new Map(db.locations.map(l=>[l.id,l]));
 for(const r of rules){if(rulesById.has(r.id))errors.push('duplicate_seed_rule_'+r.id);rulesById.set(r.id,r)}
 const seen=new Set(),actualByRule=new Map(),matched=new Map();
 for(const l of links){
  if(seen.has(l.id))errors.push('duplicate_generated_link_'+l.id);seen.add(l.id);
  const rule=rulesById.get(l.originRule),loc=locationsById.get(l.locationId);
  if(!rule||!loc){errors.push('unrecognized_rule_or_location_'+l.id);continue}
  const failures=checkPmCandidate(l,rule,loc,db);
  for(const e of failures)errors.push(l.id+': '+e);
  actualByRule.set(rule.id,(actualByRule.get(rule.id)||0)+1);
 }
 const coverage=[];
 for(const rule of rules){
  const m={eligibleModelLocations:0,sameSubgroupAnyRoot:0,subgroupWithAllowedSystem:0,matchingComponentInstances:0,compatibleDamageCausePairs:0};
  let wrongRoot=0;
  for(const loc of db.locations){
   if(loc.profundidade!==3||!rule.models.includes(loc.modelo))continue;
   m.eligibleModelLocations++;
   if(loc.subgrupo?.codigo!==rule.subgroupCode)continue;
   m.sameSubgroupAnyRoot++;
   if(!matchesRoot(rule,loc)){wrongRoot++;continue}
   m.subgroupWithAllowedSystem++;
   const parts=(db.partsByObjectType[loc.objetoTipoSAP]||[]).filter(p=>contains(p.pt,rule.partText));
   m.matchingComponentInstances+=parts.length;
   m.compatibleDamageCausePairs+=parts.filter(p=>db.compatibleFailureModesByPart[p.code]?.damageCauses?.[rule.damageId]?.includes(rule.causeId)).length;
  }
  const actual=actualByRule.get(rule.id)||0;
  if(actual!==m.compatibleDamageCausePairs)errors.push('incomplete_or_extra_generation_'+rule.id+'_actual_'+actual+'_expected_'+m.compatibleDamageCausePairs);
  const blocker=m.sameSubgroupAnyRoot===0?'missing_model_subgroup':m.subgroupWithAllowedSystem===0?'subgroup_outside_functional_system':m.matchingComponentInstances===0?'component_absent_in_object_type':m.compatibleDamageCausePairs===0?'damage_cause_incompatible':null;
  coverage.push({ruleId:rule.id,system:rule.system,subgroupCode:rule.subgroupCode,modelsRequested:rule.models.length,stages:m,wrongFunctionalRootCandidates:wrongRoot,actualGeneratedCandidateLinks:actual,blocker,reviewStatus:rule.review,operationallyApproved:false,confirmedFailureEvents:0});
 }
 const collisions=[];
 const subgroups=new Map();
 for(const rule of rules){let set=subgroups.get(rule.subgroupCode)||new Set();set.add(rule.system);subgroups.set(rule.subgroupCode,set);}
 for(const [subgroup,systems] of subgroups)if(systems.size>1)collisions.push({subgroup,systems:[...systems].sort(),interpretation:'code_shared_requires_full_system_group_path'});
 return {schema:'fmea-mining.pm-system-scope-audit.v1',version:'1.3.34',nature:'real_catalogue_structural_reconciliation_not_oem_validation',counts:{rules:rules.length,generatedCandidateLinks:links.length,rulesWithLinks:coverage.filter(x=>x.actualGeneratedCandidateLinks>0).length,rulesWithoutLinks:coverage.filter(x=>!x.actualGeneratedCandidateLinks).length,pathsRejectedByWrongSystem:coverage.reduce((n,x)=>n+x.wrongFunctionalRootCandidates,0),sharedSubgroupsAcrossRules:collisions.length,realInspections:0,verifiedOemEffectivity:0,approvedPmMappings:0},byRule:coverage,sharedSubgroupRisk:collisions,errors};
}
