/** Public structural reconciliation: full path > subgroup string. Never proves installed function. */
import {classifyPmPath} from './pm-functional-boundaries.mjs';
import {auditPmCandidateSet} from './pm-link-integrity.mjs';
const sorted=x=>[...x].sort((a,b)=>a.localeCompare(b));
const key=x=>String(x||'').toLowerCase();
export function buildPmFunctionalReconciliation({db,rules,links,gaps,maturity,policy}){
 const gapMap=new Map(gaps.records.map(x=>[x.ruleId,x]));
 const linkCounts=new Map();
 for(const link of links)linkCounts.set(link.originRule,(linkCounts.get(link.originRule)||0)+1);
 const rows=sorted(rules.map(x=>x.id)).map(ruleId=>{
   const rule=rules.find(x=>x.id===ruleId),gap=gapMap.get(ruleId);
   const metrics={modelLeafPaths:0,subgroupMatchedAcrossAllSystems:0,
     subgroupRejectedBySystemOrGroup:0,fullFunctionalPaths:0,
     componentDescriptionInstances:0,permittedDamageCauseInstances:0};
   for(const loc of db.locations){
     if(loc.profundidade!==3||!rule.models.includes(loc.modelo))continue;
     metrics.modelLeafPaths++;
     const sameSubgroup=loc.subgrupo?.codigo===rule.subgroupCode;
     const classification=classifyPmPath(rule,loc);
     if(sameSubgroup)metrics.subgroupMatchedAcrossAllSystems++;
     if(sameSubgroup&&classification==='system_group_out_of_scope')metrics.subgroupRejectedBySystemOrGroup++;
     if(classification!=='candidate_path')continue;
     metrics.fullFunctionalPaths++;
     const parts=(db.partsByObjectType[loc.objetoTipoSAP]||[]).filter(p=>key(p.pt).includes(key(rule.partText)));
     metrics.componentDescriptionInstances+=parts.length;
     metrics.permittedDamageCauseInstances+=parts.filter(p=>
       db.compatibleFailureModesByPart[p.code]?.damageCauses?.[rule.damageId]?.includes(rule.causeId)
     ).length;
   }
   const actual=linkCounts.get(rule.id)||0;
   const hasGap=!!gap;
   const className=hasGap?'BLOCKED_PREEXISTING_SAP_EXCEPTION':
     actual>0?'STRUCTURAL_CANDIDATES_OEM_UNVERIFIED':'NO_GENERATED_LINK_NOT_PHYSICAL_ABSENCE';
   return {ruleId:rule.id,system:rule.system,subgroupCode:rule.subgroupCode,
     requestedModelKeys:rule.models.length,partDescriptionCandidate:rule.partText,
     counts:{...metrics,actualGeneratedLinks:actual},
     className,preexistingGapPriority:gap?.priority??null,
     preexistingSapBlocker:gap?.expectedBlocker??null,
     automaticRemapAllowed:false,rootGroupOemEffective:false,
     physicalComponentInstalledVerified:false,diagnosisConfirmed:false,
     engineeringReviewed:false,sapMappingApproved:false,
     reviewNeeded:'VERIFY_MODEL_SERIAL_BOM_SYSTEM_GROUP_SUBGROUP_COMPONENT_DAMAGE_CAUSE_IN_PRIVATE',
     zeroLinksMeansPhysicalAbsence:false};
 });
 const groups=new Map();
 for(const r of rules){
   if(!groups.has(r.subgroupCode))groups.set(r.subgroupCode,new Map());
   const systems=groups.get(r.subgroupCode);
   systems.set(r.system,(systems.get(r.system)||0)+1);
 }
 const sharedSubgroups=sorted([...groups.keys()]).filter(sub=>groups.get(sub).size>1).map(subgroupCode=>({
   subgroupCode,ruleSystems:sorted([...groups.get(subgroupCode).keys()]),
   totalSeedRules:[...groups.get(subgroupCode).values()].reduce((a,b)=>a+b,0),
   sameCodeNotProofOfSameCircuit:true,allApplicationsNeedFullPath:true
 }));
 const cases=rows.filter(x=>x.className==='BLOCKED_PREEXISTING_SAP_EXCEPTION');
 return {schema:'fmea-mining.pm-functional-reconciliation.v1',version:policy.version,
   nature:'structural_candidate_audit_not_installed_OEM_or_SAP_approval',
   upstream:{seedVersion:maturity.version,priorCatalog:'1.3.66',ontology:'1.3.23'},
   summary:{seedRules:rules.length,distinctSeedSystems:new Set(rules.map(x=>x.system)).size,
     generatedCandidateLinks:links.length,structuralCandidateRules:rows.filter(x=>x.counts.actualGeneratedLinks>0).length,
     rulesWithoutGeneratedLinks:rows.filter(x=>x.counts.actualGeneratedLinks===0).length,
     preexistingBlockedExceptions:cases.length,blockedP0:cases.filter(x=>x.preexistingGapPriority==='P0').length,
     blockedP1:cases.filter(x=>x.preexistingGapPriority==='P1').length,
     sharedSubgroupCodes:sharedSubgroups.length,
     subgroupPathsRejectedByDifferentFunctionalParent:rows.reduce((n,x)=>n+x.counts.subgroupRejectedBySystemOrGroup,0),
     diagnosticClaims:0,oemSerialClaims:0,sapApprovals:0,realObservations:0,overallState:'NO_GO'},
   rows,sharedSubgroups
 };
}
export function assessPmFunctionalReconciliation(inputs,output){
 const {db,rules,links,gaps,maturity,policy}=inputs;
 const errors=[],ck=(v,id)=>{if(!v)errors.push(id)};
 let expected;
 try{expected=buildPmFunctionalReconciliation(inputs)}
 catch(e){return {status:'REJECTED',errors:['build_error_'+e.message]}};
 ck(JSON.stringify(expected)===JSON.stringify(output),'derived_output_drift');
 ck(policy.schema==='fmea-mining.pm-functional-reconciliation-policy.v1'&&policy.version==='1.3.67'&&policy.predecessor==='1.3.66','policy_version');
 ck(policy.stageOrder.join('|')==='model_and_leaf|full_system_root_and_group|requested_subgroup|component_description_in_object_type|permitted_damage_cause_pair|existing_generated_candidate_link','stage_order');
 ck(Object.values(policy.differentialGuards).every(v=>v===true),'policy_fail_closed');
 ck(Object.values(policy.publicClaims).every(v=>v===0),'policy_must_not_claim_field_data');
 ck(policy.interpretation.zeroLinks==='not_proof_of_absent_physical_component'&&policy.interpretation.counting==='path_instances_per_rule_not_distinct_machines','no_negative_proof_or_asset_count');
 ck(rules.length===25&&new Set(rules.map(x=>x.id)).size===25&&rules.every(x=>x.review==='pendente'&&x.status==='hipotese_de_protecao_preventiva'),'seed_integrity');
 ck(maturity.summary.seedRules===25&&maturity.summary.conceptuallyModeled===25&&maturity.summary.candidatePreventiveLinks===115&&maturity.summary.sapExceptionsBlocked===10&&maturity.summary.serialOemVerified===0&&maturity.summary.fieldConfirmed===0&&maturity.summary.sapMappingsApproved===0,'original_maturity_unchanged');
 ck(links.length===115&&links.every(l=>l.occurrence==='nao_observada'&&l.evidenceStatus==='metodo_planejado_sem_resultado'&&l.associationStatus==='inferido_nao_validado'),'candidate_only');
 ck(gaps.records.length===10&&gaps.records.filter(x=>x.priority==='P0').length===5&&gaps.records.filter(x=>x.priority==='P1').length===5&&gaps.records.every(x=>x.autoRemapAllowed===false&&x.observedFailures===0&&x.status==='bloqueado_aguardando_curadoria'&&x.approvedModelIds.length===0&&x.confirmedSapLocationIds.length===0&&x.verifiedPartCodes.length===0),'exceptions_locked');
 const linkAudit=auditPmCandidateSet(db,rules,links);
 ck(linkAudit.errors.length===0,'generator_link_integrity_'+linkAudit.errors[0]);
 ck(linkAudit.counts.generatedCandidateLinks===links.length&&linkAudit.counts.rules===25,'candidate_count_reconciled');
 ck(output.schema==='fmea-mining.pm-functional-reconciliation.v1'&&output.version==='1.3.67'&&output.nature==='structural_candidate_audit_not_installed_OEM_or_SAP_approval','result_nature');
 const summary=output.summary;
 ck(summary.seedRules===25&&summary.generatedCandidateLinks===115&&summary.preexistingBlockedExceptions===10&&summary.blockedP0===5&&summary.blockedP1===5&&summary.overallState==='NO_GO','summary_locked');
 ck(summary.diagnosticClaims===0&&summary.oemSerialClaims===0&&summary.sapApprovals===0&&summary.realObservations===0,'no_real_event_claims');
 ck(output.rows.length===25&&output.rows.every(x=>{
   const v=x.counts;
   return v.modelLeafPaths>=v.subgroupMatchedAcrossAllSystems&&v.subgroupMatchedAcrossAllSystems>=v.fullFunctionalPaths&&
     v.fullFunctionalPaths>=0&&v.componentDescriptionInstances>=v.permittedDamageCauseInstances&&
     v.permittedDamageCauseInstances===v.actualGeneratedLinks&&
     v.subgroupMatchedAcrossAllSystems-v.subgroupRejectedBySystemOrGroup===v.fullFunctionalPaths&&
     x.automaticRemapAllowed===false&&x.rootGroupOemEffective===false&&
     x.physicalComponentInstalledVerified===false&&x.diagnosisConfirmed===false&&
     x.engineeringReviewed===false&&x.sapMappingApproved===false&&x.zeroLinksMeansPhysicalAbsence===false;
 }),'all_paths_well_ordered_no_false_certification');
 for(const row of output.rows){
   const gap=gaps.records.find(g=>g.ruleId===row.ruleId);
   ck((!gap||row.className==='BLOCKED_PREEXISTING_SAP_EXCEPTION')&&
      (!gap||row.preexistingSapBlocker===gap.expectedBlocker)&&
      (!gap||row.preexistingGapPriority===gap.priority)&&
      (gap||row.preexistingGapPriority===null),'respect_original_blocker_'+row.ruleId);
   ck(!gap||row.counts.actualGeneratedLinks===0,'blocked_link_was_generated_'+row.ruleId);
   ck(row.reviewNeeded==='VERIFY_MODEL_SERIAL_BOM_SYSTEM_GROUP_SUBGROUP_COMPONENT_DAMAGE_CAUSE_IN_PRIVATE','human_review_only_'+row.ruleId);
 }
 ck(output.sharedSubgroups.every(x=>x.sameCodeNotProofOfSameCircuit&&x.allApplicationsNeedFullPath&&x.ruleSystems.length>1),'shared_codes_need_functional_context');
 return {status:errors.length?'REJECTED':'NO_GO_STRUCTURAL_RECONCILIATION',errors,OEMVerified:false,sapChangeAllowed:false,realWorkAuthorized:false};
}
