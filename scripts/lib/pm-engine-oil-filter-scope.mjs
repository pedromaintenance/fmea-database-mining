/**
 * Engine-oil filter scope inquiry. Explore real public catalogue candidates
 * WITHOUT remapping the blocked LUSY rule or claiming installed OEM parts.
 */
import {matchesRoot} from '../pm-system-scope.mjs';
const normalize=s=>String(s??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
export const EVIDENCE_IDS=Object.freeze(['COND-ENGINE-FILTER-DP','COND-ENGINE-OIL-PARTICLES','COND-ENGINE-LOW-OIL-PRESSURE']);
export const ACTION_IDS=Object.freeze(['ACT-ENGINE-OIL-SAMPLE','ACT-ENGINE-FILTER-REPLACE-INSPECT','ACT-ENGINE-OIL-PRESSURE-VERIFY']);
export const DAMAGE_ID='DMG-ENGINE-OIL-FILTER-RESTRICTION';

/** Strict lexical description, not proof of actual media or circuit. */
export function classifyOilFilterText(value){
 const x=normalize(value);
 if(!/(filtr|elemento filtrante|cartucho filtrante)/.test(x))return 'not_explicit_filter_text';
 const roles=[
  [/((filtro|filtr|elemento|cartucho).*(combustivel|diesel|fuel)|(combustivel|diesel|fuel).*(filtro|filtr|elemento|cartucho))/, 'fuel_filter_text'],
  [/((filtro|filtr|elemento|cartucho).*(ar|admissao|air)|(admissao|air).*(filtro|filtr|elemento|cartucho))/, 'air_filter_text'],
  [/((filtro|filtr|elemento|cartucho).*(hidraul|hydraulic)|(hidraul|hydraulic).*(filtro|filtr|elemento|cartucho))/, 'hydraulic_filter_text'],
  [/((filtro|filtr|elemento|cartucho).*(oleo|lubrific|oil)|(oleo|lubrific|oil).*(filtro|filtr|elemento|cartucho))/, 'oil_filter_text']
 ];
 // "ar" is treated as a word, not a substring of "cartucho"/"separador".
 const noShortAir=roles.map(([re,label])=>label==='air_filter_text'?
   [/(?:\bfiltro\b|\bfiltrante\b|\belemento\b|\bcartucho\b).*(?:\bar\b|\badmissao\b|\bair\b)|(?:\bar\b|\badmissao\b|\bair\b).*(?:\bfiltro\b|\bfiltrante\b|\belemento\b|\bcartucho\b)/,label]:[re,label]);
 const found=noShortAir.filter(([regex])=>regex.test(x)).map(([,label])=>label);
 return found.length===0?'unqualified_filter_text':found.length>1?'ambiguous_filter_media':found[0];
}
const countUnique=(items)=>new Set(items).size;
export function examineEngineOilFilterScope(db,rule){
 if(!db?.locations||!db?.partsByObjectType||!db?.compatibleFailureModesByPart)throw Error('invalid_catalogue');
 if(rule?.id!=='engine-oil-filter'||rule.system!=='motor_diesel')throw Error('wrong_rule');
 const modelSet=new Set(rule.models);
 const all=db.locations.filter(l=>l.profundidade===3&&modelSet.has(l.modelo));
 const roots=all.filter(l=>['ENSY','ENS1','ENS2'].includes(l.sistema?.codigo));
 const inEngineGroup=roots.filter(l=>matchesRoot(rule,l));
 const target=inEngineGroup.filter(l=>l.subgrupo?.codigo===rule.subgroupCode);
 const filterFor=(l)=>(db.partsByObjectType[l.objetoTipoSAP]||[]).filter(p=>classifyOilFilterText(p.pt)!=='not_explicit_filter_text');
 const aggregate=(locations)=>{
  const m=new Map();
  for(const l of locations){
   const matches=filterFor(l);
   const key=JSON.stringify([l.sistema?.codigo||null,l.grupo?.codigo||null,l.subgrupo?.codigo||null]);
   let group=m.get(key);
   if(!group){
    group={systemCode:l.sistema?.codigo||null,groupCode:l.grupo?.codigo||null,
     subgroupCode:l.subgrupo?.codigo||null,models:new Set(),objectTypes:new Set(),
     leafPaths:0,pathsWithExplicitFilterText:0,descriptorMatchesPerPath:0,
     oilSpecificMatchesPerPath:0,oilSpecificEligiblePairsPerPath:0,
     mediaTextOccurrences:{oil:0,fuel:0,air:0,hydraulic:0,unqualified:0,ambiguous:0},
     damageCauseEligibleMatchesPerPath:0,lexicalHints:new Set(),codesWithinType:new Map()};
    m.set(key,group);
   }
   group.leafPaths++;group.models.add(l.modelo);group.objectTypes.add(l.objetoTipoSAP);
   if(matches.length)group.pathsWithExplicitFilterText++;
   group.descriptorMatchesPerPath+=matches.length;
   for(const p of matches){
    const eligible=Boolean(db.compatibleFailureModesByPart[p.code]?.damageCauses?.[rule.damageId]?.includes(rule.causeId));
    group.damageCauseEligibleMatchesPerPath+=Number(eligible);
    const cls=classifyOilFilterText(p.pt);
    group.lexicalHints.add(cls);
    const suffix=cls.replace('_filter_text','').replace('_filter_media','');
    const media=({oil:'oil',fuel:'fuel',air:'air',hydraulic:'hydraulic',unqualified:'unqualified',ambiguous:'ambiguous'})[suffix];
    if(media)group.mediaTextOccurrences[media]++;
    if(cls==='oil_filter_text'){
     group.oilSpecificMatchesPerPath++;
     group.oilSpecificEligiblePairsPerPath+=Number(eligible);
    }
    const byType=group.codesWithinType.get(l.objetoTipoSAP)||new Set();
    byType.add(p.code);group.codesWithinType.set(l.objetoTipoSAP,byType);
   }
  }
  return [...m.values()].map(g=>({
   systemCode:g.systemCode,groupCode:g.groupCode,subgroupCode:g.subgroupCode,
   models:[...g.models].sort(),objectTypeCount:g.objectTypes.size,
   leafPaths:g.leafPaths,pathsWithExplicitFilterText:g.pathsWithExplicitFilterText,
   descriptorMatchesPerPath:g.descriptorMatchesPerPath,
   damageCauseEligibleMatchesPerPath:g.damageCauseEligibleMatchesPerPath,
   oilSpecificMatchesPerPath:g.oilSpecificMatchesPerPath,
   oilSpecificEligiblePairsPerPath:g.oilSpecificEligiblePairsPerPath,
   mediaTextOccurrences:g.mediaTextOccurrences,
   uniqueCodesWithinObjectTypes:[...g.codesWithinType.values()].reduce((n,s)=>n+s.size,0),
   lexicalHints:[...g.lexicalHints].sort(),
   disposition:'discovery_only_requires_effective_OEM_BOM_and_SAP_review'
  })).sort((a,b)=>b.descriptorMatchesPerPath-a.descriptorMatchesPerPath||
    JSON.stringify([a.systemCode,a.groupCode,a.subgroupCode]).localeCompare(JSON.stringify([b.systemCode,b.groupCode,b.subgroupCode])));
 };
 const targetGroups=aggregate(target);
 const sameEngineOtherSubgroups=aggregate(inEngineGroup.filter(l=>l.subgrupo?.codigo!==rule.subgroupCode));
 const otherGroups=aggregate(roots.filter(l=>!matchesRoot(rule,l)));
 const summarized=(arr)=>({
  matchedLeafPaths:arr.reduce((n,g)=>n+g.pathsWithExplicitFilterText,0),
  matchedDescriptionOccurrences:arr.reduce((n,g)=>n+g.descriptorMatchesPerPath,0),
  eligibleDamageCauseOccurrences:arr.reduce((n,g)=>n+g.damageCauseEligibleMatchesPerPath,0),
  explicitOilFilterOccurrences:arr.reduce((n,g)=>n+g.oilSpecificMatchesPerPath,0),
  eligibleOilFilterOccurrences:arr.reduce((n,g)=>n+g.oilSpecificEligiblePairsPerPath,0),
  candidateBranches:arr.filter(g=>g.descriptorMatchesPerPath>0).length
 });
 return {
  schema:'fmea-mining.engine-oil-filter-scope.v1',version:'1.3.40',
  classification:'public_catalogue_only_no_installed_OEM_BOM',
  originalRuleId:rule.id,originalGroup:'ENGN',originalSubgroup:rule.subgroupCode,
  modelCount:countUnique(rule.models),
  counts:{modelLeafPaths:all.length,engineRootLeafPaths:roots.length,
   engineGroupLeafPaths:inEngineGroup.length,targetLusyLeafPaths:target.length},
  targetSubgroup:{summary:summarized(targetGroups),branches:targetGroups},
  sameEngineGroupOtherSubgroups:{summary:summarized(sameEngineOtherSubgroups),
   branches:sameEngineOtherSubgroups.filter(g=>g.descriptorMatchesPerPath>0)},
  outsideEngineGroup:{summary:summarized(otherGroups),
   branches:otherGroups.filter(g=>g.descriptorMatchesPerPath>0)},
  installedPartConfirmed:false,proposedRemapApproved:false,
  newCatalogPartCreated:false,verifiedOemEffectivity:false,confirmedFailureEvents:0
 };
}
export function validateEngineOilReport(report,db,rule){
 const expected=examineEngineOilFilterScope(db,rule);
 const errors=[];
 if(JSON.stringify(report)!==JSON.stringify(expected))errors.push('report_mismatch_or_fabricated_approval');
 if(report?.targetSubgroup?.summary?.matchedLeafPaths!==0)errors.push('original_gap_changed_requires_review');
 const allBranches=[
  ...report.targetSubgroup.branches,
  ...report.sameEngineGroupOtherSubgroups.branches,
  ...report.outsideEngineGroup.branches
 ];
 if(allBranches.some(x=>x.disposition!=='discovery_only_requires_effective_OEM_BOM_and_SAP_review'))errors.push('discovery_promoted');
 if(report?.installedPartConfirmed!==false||report?.proposedRemapApproved!==false||
    report?.verifiedOemEffectivity!==false||report?.confirmedFailureEvents!==0||report?.newCatalogPartCreated!==false)errors.push('field_evidence_fabricated');
 return errors;
}
