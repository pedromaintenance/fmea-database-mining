/**
 * Discovery ONLY: find possible filter entries in the same functional system
 * and group as a blocked PM rule. Never use output as a PM binding.
 * A part listed for an object type is not proven installed on a machine.
 */
import {matchesRoot} from './pm-system-scope.mjs';
export const FILTER_RULE_IDS=Object.freeze(['fuel-filter-contamination','drill-compressor-filter']);
const norm=s=>String(s??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
export function filterTerms(description){
 const s=norm(description);
 return [...new Set([/filtr/.test(s)?'filtragem':null,/separad/.test(s)?'separacao':null].filter(Boolean))];
}
export function discoverFiltration(db,rule){
 if(!FILTER_RULE_IDS.includes(rule?.id))throw Error('not_a_filtration_review_rule');
 const totals={modelLeafPaths:0,functionalGroupLeafPaths:0,withFilterTextInObjectType:0,partDescriptionMatches:0,damageCauseCompatibleDescriptions:0};
 const groups=new Map();
 for(const l of db.locations){
  if(l.profundidade!==3||!rule.models.includes(l.modelo))continue;
  totals.modelLeafPaths++;
  if(!matchesRoot(rule,l))continue;
  totals.functionalGroupLeafPaths++;
  const matches=(db.partsByObjectType?.[l.objetoTipoSAP]||[]).filter(p=>filterTerms(p.pt).length>0);
  if(!matches.length)continue;
  totals.withFilterTextInObjectType++;
  totals.partDescriptionMatches+=matches.length;
  const compatible=matches.filter(p=>db.compatibleFailureModesByPart?.[p.code]?.damageCauses?.[rule.damageId]?.includes(rule.causeId));
  totals.damageCauseCompatibleDescriptions+=compatible.length;
  const key=JSON.stringify([l.sistema?.codigo,l.grupo?.codigo,l.subgrupo?.codigo]);
  const rec=groups.get(key)||{systemCode:l.sistema?.codigo||null,groupCode:l.grupo?.codigo||null,
   subgroupCode:l.subgrupo?.codigo||null,models:new Set(),objectTypeCount:new Set(),
   eligibleLeafPaths:0,partDescriptionMatches:0,damageCauseCompatibleDescriptions:0,descriptorClasses:new Set()};
  rec.models.add(l.modelo);rec.objectTypeCount.add(l.objetoTipoSAP);
  rec.eligibleLeafPaths++;rec.partDescriptionMatches+=matches.length;rec.damageCauseCompatibleDescriptions+=compatible.length;
  for(const p of matches)for(const t of filterTerms(p.pt))rec.descriptorClasses.add(t);
  groups.set(key,rec);
 }
 const candidates=[...groups.values()].map(g=>({
   systemCode:g.systemCode,groupCode:g.groupCode,subgroupCode:g.subgroupCode,
   models:[...g.models].sort(),objectTypeCount:g.objectTypeCount.size,
   eligibleLeafPaths:g.eligibleLeafPaths,partDescriptionMatches:g.partDescriptionMatches,
   damageCauseCompatibleDescriptions:g.damageCauseCompatibleDescriptions,
   descriptorClasses:[...g.descriptorClasses].sort(),
   disposition:'candidate_for_private_BOM_and_SAP_review_not_approved'
 })).sort((a,b)=>b.partDescriptionMatches-a.partDescriptionMatches||JSON.stringify(a).localeCompare(JSON.stringify(b)));
 return {ruleId:rule.id,originalRequestedSubgroup:rule.subgroupCode,
  originalRuleStatus:'blocked',totals,candidates,verifiedInstalledParts:0,
  approvedSubgroupChanges:0,confirmedFailureEvents:0};
}
