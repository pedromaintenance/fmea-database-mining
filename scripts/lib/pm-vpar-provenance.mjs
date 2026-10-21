/**
 * Examine why part-text matches emerge under AISY/COMR/VPAR in the public
 * catalogue. Object-type membership is NOT proof of BOM membership,
 * installation, circuit function, failure event, or OEM serial applicability.
 */
import {filterTerms} from '../pm-filtration-scan.mjs';

const normalize=value=>String(value??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const keyFor=loc=>JSON.stringify([loc.sistema?.codigo??null,loc.grupo?.codigo??null,loc.subgrupo?.codigo??null]);
const validVpar=loc=>loc.profundidade===3&&loc.sistema?.codigo==='AISY'&&loc.grupo?.codigo==='COMR'&&loc.subgrupo?.codigo==='VPAR';

/** A conservative TEXT hint only; never assert the physical circuit. */
export function classifyFilterDescriptor(text){
 const s=normalize(text);
 if(!filterTerms(text).length)return 'not_filtration_text';
 const types=[
  [/((filtro|filtr).*(admissao|entrada de ar|ar primario|air intake)|(admissao|entrada de ar|air intake).*(filtro|filtr))/, 'air_intake_text'],
  [/((filtro|filtr).*(oleo|oil)|(oleo|oil).*(filtro|filtr))/, 'oil_filtration_text'],
  [/((separad|coalesc).*(oleo|oil)|(oleo|oil).*(separad|coalesc))/, 'oil_separation_text'],
  [/((separad|filtr).*(agua|water)|(agua|water).*(separad|filtr))/, 'water_separation_text'],
 ];
 const found=[...new Set(types.filter(([re])=>re.test(s)).map(([,type])=>type))];
 return found.length===1?found[0]:found.length>1?'ambiguous_multiple_text_hints':'filtration_text_unclassified';
}

export function inspectVparObjectTypeProvenance(db,models){
 if(!db?.locations||!db?.partsByObjectType||!db?.compatibleFailureModesByPart)throw Error('invalid_catalogue');
 const allowed=new Set(models);
 const relevant=db.locations.filter(l=>validVpar(l)&&allowed.has(l.modelo));
 const types=[...new Set(relevant.map(l=>l.objetoTipoSAP))].sort();
 const byType=types.map((objectType,index)=>{
  const inScope=relevant.filter(l=>l.objetoTipoSAP===objectType);
  const all=db.locations.filter(l=>l.profundidade===3&&l.objetoTipoSAP===objectType);
  const otherPaths=all.filter(l=>!validVpar(l));
  const otherGroups=[...new Set(otherPaths.map(l=>JSON.stringify([l.sistema?.codigo||null,l.grupo?.codigo||null])))].sort();
  const textMatches=(db.partsByObjectType[objectType]||[]).filter(p=>filterTerms(p.pt).length>0);
  const byCode=new Map();
  for(const part of textMatches){
   const code=String(part.code);
   const existing=byCode.get(code);
   const hint=classifyFilterDescriptor(part.pt);
   const compatible=Boolean(db.compatibleFailureModesByPart?.[part.code]?.damageCauses?.['03.02']?.includes('C2.09'));
   if(existing){
    existing.descriptorHints.add(hint);
    existing.catalogueDamageCauseEligible ||= compatible;
   }else byCode.set(code,{descriptorHints:new Set([hint]),catalogueDamageCauseEligible:compatible});
  }
  const unique=[...byCode.values()];
  const counts={vparLeafPaths:inScope.length,allCatalogLeafPathsForType:all.length,
   pathsOutsideVpar:otherPaths.length,otherSystemGroupContexts:otherGroups.length,
   distinctPartCodesWithFiltrationText:unique.length,partDescriptionRows:textMatches.length,
   damageCauseCompatiblePartCodes:unique.filter(x=>x.catalogueDamageCauseEligible).length};
  const descriptorHints=[...new Set(unique.flatMap(p=>[...p.descriptorHints]))].sort();
  return {objectTypeOrdinal:index+1,counts,models:[...new Set(inScope.map(l=>l.modelo))].sort(),
   descriptorHints,crossScopeReuseRisk:counts.pathsOutsideVpar>0?'object_type_reused_outside_VPAR':'not_detected_in_catalogue',
   evidenceMeaning:'part_text_in_object_type_only_not_BOM_or_installed_component'};
 });
 const expanded=byType.reduce((sum,type)=>sum+type.counts.vparLeafPaths*type.counts.partDescriptionRows,0);
 const compatibleExpanded=byType.reduce((sum,type)=>sum+type.counts.vparLeafPaths*type.counts.damageCauseCompatiblePartCodes,0);
 return {
  functionPath:'AISY/COMR/VPAR',
  eligibleModels:[...allowed].sort(),
  counts:{vparLeafPaths:relevant.length,distinctObjectTypes:types.length,
   matchedDescriptionOccurrencesOverLocations:expanded,
   compatibleOccurrencesOverLocations:compatibleExpanded,
   uniquePartCodesWithinTypeTotal:byType.reduce((n,x)=>n+x.counts.distinctPartCodesWithFiltrationText,0),
   typesReusedOutsideVpar:byType.filter(x=>x.counts.pathsOutsideVpar>0).length},
  objectTypes:byType,
  physicalFunction:'undetermined_pending_effective_OEM_BOM',
  installationConfirmed:false,
  bomMembershipConfirmed:false,
  pmRuleRemapApproved:false,
  componentFailureObserved:false
 };
}

/** Reproducible strict guards for any attempt to treat catalog text as fact. */
export function validateVparProvenance(report){
 const errors=[];
 if(report?.functionPath!=='AISY/COMR/VPAR')errors.push('path_drift');
 if(report?.physicalFunction!=='undetermined_pending_effective_OEM_BOM')errors.push('function_fabricated');
 for(const k of ['installationConfirmed','bomMembershipConfirmed','pmRuleRemapApproved','componentFailureObserved'])
  if(report?.[k]!==false)errors.push('fabricated_'+k);
 if(!Array.isArray(report?.objectTypes))return [...errors,'missing_object_types'];
 for(const type of report.objectTypes){
  if(type.evidenceMeaning!=='part_text_in_object_type_only_not_BOM_or_installed_component')errors.push('promoted_component_evidence');
  if(type.crossScopeReuseRisk!==(type.counts.pathsOutsideVpar>0?'object_type_reused_outside_VPAR':'not_detected_in_catalogue'))errors.push('reuse_warning_drift');
  if(type.counts.damageCauseCompatiblePartCodes>type.counts.distinctPartCodesWithFiltrationText)errors.push('impossible_compatibility');
  if(type.counts.partDescriptionRows<type.counts.distinctPartCodesWithFiltrationText)errors.push('impossible_distinct_count');
  if(type.counts.allCatalogLeafPathsForType<type.counts.vparLeafPaths)errors.push('impossible_scope_count');
  if(type.models.length===0)errors.push('missing_model_coverage');
 }
 if(report.counts.vparLeafPaths!==report.objectTypes.reduce((n,t)=>n+t.counts.vparLeafPaths,0))errors.push('location_total_drift');
 return errors;
}
