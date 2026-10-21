/**
 * IDLE inventory investigation, NEVER a SAP remapping or OEM effectivity.
 * Counts are catalogue description occurrences, not installed parts or failures.
 */
import {matchesRoot} from '../pm-system-scope.mjs';
const normalize=s=>String(s??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
export const IDLER_ROLES=Object.freeze(['bearing','bushing','seal','axle','idler_wheel','roller','guide_generic']);
export function classifyIdlerPart(text){
 const s=normalize(text);
 const matches=[
  [/\b(rolament[oa]s?|bearing[s]?)\b/,'bearing'],
  [/\b(buchas?|bushing[s]?)\b/,'bushing'],
  [/\b(vedac(?:ao|oes)|retentor(?:es)?|seal[s]?)\b/,'seal'],
  [/\b(eixos?|axles?|shafts?)\b/,'axle'],
  [/\b(roda[\s-]?guia|rodas[\s-]?guia|idler[s]?)\b/,'idler_wheel'],
  [/\b(roletes?|rollers?)\b/,'roller'],
  [/\b(guias?|guides?)\b/,'guide_generic']
 ].filter(([regex])=>regex.test(s)).map(([,role])=>role);
 return [...new Set(matches)].sort();
}
const eligible=(loc,rule)=>loc.profundidade===3&&rule.models.includes(loc.modelo)&&matchesRoot(rule,loc);
const objectPart=(db,loc)=>db.partsByObjectType?.[loc.objetoTipoSAP]||[];
function aggregate(db,rule,locations){
 const groups=new Map();
 for(const loc of locations){
  const key=JSON.stringify([loc.sistema?.codigo||null,loc.grupo?.codigo||null,loc.subgrupo?.codigo||null]);
  const row=groups.get(key)||{systemCode:loc.sistema?.codigo||null,groupCode:loc.grupo?.codigo||null,
   subgroupCode:loc.subgrupo?.codigo||null,models:new Set(),objectTypes:new Map(),
   paths:0,roleOccurrences:Object.fromEntries(IDLER_ROLES.map(x=>[x,0])),bearingDamageCauseEligibleOccurrences:0};
  row.paths++;row.models.add(loc.modelo);
  const type=loc.objetoTipoSAP;
  if(!row.objectTypes.has(type))row.objectTypes.set(type,new Map());
  const codes=row.objectTypes.get(type);
  for(const part of objectPart(db,loc)){
   const roles=classifyIdlerPart(part.pt);
   if(!roles.length)continue;
   for(const role of roles)row.roleOccurrences[role]++;
   if(!codes.has(String(part.code)))codes.set(String(part.code),new Set());
   for(const role of roles)codes.get(String(part.code)).add(role);
   if(roles.includes('bearing')&&db.compatibleFailureModesByPart?.[part.code]?.damageCauses?.[rule.damageId]?.includes(rule.causeId))
    row.bearingDamageCauseEligibleOccurrences++;
  }
  groups.set(key,row);
 }
 return [...groups.values()].map(g=>{
  const distinctPerRole=Object.fromEntries(IDLER_ROLES.map(role=>[role,
   [...g.objectTypes.values()].reduce((sum,byCode)=>sum+[...byCode.values()].filter(v=>v.has(role)).length,0)]));
  return {systemCode:g.systemCode,groupCode:g.groupCode,subgroupCode:g.subgroupCode,
   models:[...g.models].sort(),leafPaths:g.paths,distinctObjectTypes:g.objectTypes.size,
   roleOccurrences:g.roleOccurrences,uniqueCodesByRoleWithinType:distinctPerRole,
   bearingDamageCauseEligibleOccurrences:g.bearingDamageCauseEligibleOccurrences,
   evidence:'descriptions_in_object_types_only_not_installed_BOM_or_bearing_failure'};
 }).sort((a,b)=>(b.roleOccurrences.bearing-a.roleOccurrences.bearing)||
  (b.roleOccurrences.idler_wheel-a.roleOccurrences.idler_wheel)||
  JSON.stringify([a.systemCode,a.groupCode,a.subgroupCode]).localeCompare(JSON.stringify([b.systemCode,b.groupCode,b.subgroupCode])));
}
const count=(groups,role)=>groups.reduce((n,x)=>n+x.roleOccurrences[role],0);
export function inspectIdlerScope(db,rule){
 if(!db?.locations||!db?.partsByObjectType||!db?.compatibleFailureModesByPart)throw Error('invalid_catalogue');
 if(rule?.id!=='track-idler-wear'||rule?.subgroupCode!=='IDLE'||rule?.system!=='rodante')throw Error('invalid_rule');
 const leaves=db.locations.filter(l=>l.profundidade===3&&rule.models.includes(l.modelo));
 const roots=leaves.filter(l=>l.sistema?.codigo==='UNCR');
 const target=roots.filter(l=>eligible(l,rule)&&l.subgrupo?.codigo===rule.subgroupCode);
 const siblings=roots.filter(l=>eligible(l,rule)&&l.subgrupo?.codigo!==rule.subgroupCode);
 const idler=aggregate(db,rule,target),others=aggregate(db,rule,siblings);
 const summary=g=>({leafPaths:g.reduce((n,x)=>n+x.leafPaths,0),
  bearingTextOccurrences:count(g,'bearing'),bearingDamageCauseEligibleOccurrences:g.reduce((n,x)=>n+x.bearingDamageCauseEligibleOccurrences,0),
  idlerWheelTextOccurrences:count(g,'idler_wheel'),bushingTextOccurrences:count(g,'bushing'),
  sealTextOccurrences:count(g,'seal'),axleTextOccurrences:count(g,'axle'),
  rollerTextOccurrences:count(g,'roller'),genericGuideTextOccurrences:count(g,'guide_generic'),
  bearingDistinctCodesPerObjectType:g.reduce((n,x)=>n+x.uniqueCodesByRoleWithinType.bearing,0)});
 return {schema:'fmea-mining.pm-idler-scope.v1',version:'1.3.41',
  sourceNature:'public_catalogue_semantic_discovery_without_oem_serial_effectivity',
  originalRuleId:rule.id,originalSubgroup:'IDLE',models:[...rule.models].sort(),
  counts:{modelLeafPaths:leaves.length,uncrLeafPaths:roots.length,idleLeafPaths:target.length,otherUncrLeafPaths:siblings.length},
  idler:{summary:summary(idler),branches:idler},
  otherUndercarriage:{summary:summary(others),bearingTextBranches:others.filter(x=>x.roleOccurrences.bearing>0)},
  installedBearingConfirmed:false,internalBearingFailureConfirmed:false,
  ctsMeasuredWearPercent:null,confirmedSealLeak:false,proposedSapRemapApproved:false,
  independentReviewCompleted:false,generatedWorkOrders:0};
}
export function validateIdlerScope(report,db,rule){
 const errors=[],expected=inspectIdlerScope(db,rule);
 if(JSON.stringify(report)!==JSON.stringify(expected))errors.push('report_changed_or_unreviewed_claim');
 if(report.idler.summary.bearingTextOccurrences!==0)errors.push('idle_bearing_gap_changed');
 if(report.installedBearingConfirmed!==false||report.internalBearingFailureConfirmed!==false||
  report.ctsMeasuredWearPercent!==null||report.confirmedSealLeak!==false||
  report.proposedSapRemapApproved!==false||report.independentReviewCompleted!==false||
  report.generatedWorkOrders!==0)errors.push('fabricated_evidence_or_work');
 for(const b of [...report.idler.branches,...report.otherUndercarriage.bearingTextBranches]){
  if(b.evidence!=='descriptions_in_object_types_only_not_installed_BOM_or_bearing_failure')errors.push('catalogue_promoted_to_BOM');
 }
 return errors;
}
