#!/usr/bin/env node
/** VPAR provenance audit: structural matches and uncertainty, not OEM/field approval. */
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {discoverFiltration} from './pm-filtration-scan.mjs';
import {inspectFocusGuards} from './lib/pm-functional-boundaries.mjs';
import {classifyFilterDescriptor,inspectVparObjectTypeProvenance,validateVparProvenance} from './lib/pm-vpar-provenance.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=name=>JSON.parse(fs.readFileSync(path.join(root,name),'utf8'));
const db=read('data/catalog/failure-db.v1.json');
const rules=read('data/knowledge/pm-prevention/seed-rules.json').records;
const reviews=read('data/quality/pm-gap-review.v1.json').records;
const gates=read('data/quality/pm-exception-evidence-gates.v1.json').records;
const links=read('data/knowledge/pm-prevention/generated-links.json').records;
const errors=[...inspectFocusGuards(rules,reviews,gates,links)],assert=(ok,message)=>{if(!ok)errors.push(message)};
const rule=rules.find(r=>r.id==='drill-compressor-filter');
assert(!!rule,'no_original_compressor_filter_rule');
const result=inspectVparObjectTypeProvenance(db,rule?.models||[]);
errors.push(...validateVparProvenance(result));
const previous=discoverFiltration(db,rule);
const vpar=previous.candidates.find(x=>x.systemCode==='AISY'&&x.groupCode==='COMR'&&x.subgroupCode==='VPAR');
assert(!!vpar,'missing_original_VPAR_candidate');
assert(result.counts.vparLeafPaths===vpar?.eligibleLeafPaths,'VPAR_leaf_paths_changed');
assert(result.counts.matchedDescriptionOccurrencesOverLocations===vpar?.partDescriptionMatches,'filter_description_occurrence_reconciliation_failed');
assert(result.counts.compatibleOccurrencesOverLocations===vpar?.damageCauseCompatibleDescriptions,'damage_cause_occurrence_reconciliation_failed');
assert(result.counts.compatibleOccurrencesOverLocations<=result.counts.matchedDescriptionOccurrencesOverLocations,'incorrect_catalogue_compatibility');
assert(!links.some(x=>x.originRule==='drill-compressor-filter'),'blocked_filter_has_generated_link');
// Shared type fixture: matching text in a type used by other groups is NOT a confirmed VPAR item.
const location=(model,system,group,sub,type)=>({profundidade:3,modelo:model,sistema:{codigo:system},grupo:{codigo:group},subgrupo:{codigo:sub},objetoTipoSAP:type});
const fake={
 locations:[
  location('EQ05','AISY','COMR','VPAR','SHARED'),
  location('EQ06','AISY','COMR','VPAR','SHARED'),
  location('EQ05','AISY','FANX','OTHER','SHARED'),
  location('EQ06','ENSY','ENGN','OTHER','SHARED'),
  location('EQ05','AISY','COMR','NOZZ','LOCAL')
 ],
 partsByObjectType:{
  SHARED:[{code:'F1',pt:'Filtro de óleo'},{code:'F2',pt:'Separador'}],
  LOCAL:[{code:'F3',pt:'Filtro de entrada de ar'}]
 },
 compatibleFailureModesByPart:{F1:{damageCauses:{'03.02':['C2.09']}}}
};
const scenario=inspectVparObjectTypeProvenance(fake,['EQ05','EQ06']);
assert(scenario.counts.vparLeafPaths===2,'synthetic_vpar_leaf_count_wrong');
assert(scenario.counts.matchedDescriptionOccurrencesOverLocations===4,'synthetic_occurrences_wrong');
assert(scenario.objectTypes.length===1&&scenario.objectTypes[0].counts.distinctPartCodesWithFiltrationText===2,'synthetic_dedup_failed');
assert(scenario.objectTypes[0].counts.pathsOutsideVpar===2&&scenario.objectTypes[0].counts.otherSystemGroupContexts===2,'synthetic_shared_type_missed');
assert(scenario.objectTypes[0].crossScopeReuseRisk==='object_type_reused_outside_VPAR','synthetic_shared_type_flag_absent');
assert(scenario.counts.compatibleOccurrencesOverLocations===2,'synthetic_compatibility_occurrences_wrong');
assert(validateVparProvenance(scenario).length===0,'synthetic_baseline_rejected');
const language=[
 ['Filtro de ar primário','air_intake_text'],
 ['Filtro do óleo do compressor','oil_filtration_text'],
 ['Separador de óleo','oil_separation_text'],
 ['Separador de água','water_separation_text'],
 ['Filtro','filtration_text_unclassified'],
 ['Separador','filtration_text_unclassified'],
 ['Mangueira de pressão','not_filtration_text']
];
for(const [label,expected] of language)assert(classifyFilterDescriptor(label)===expected,'wrong_descriptor_hint_'+expected);
const clone=x=>JSON.parse(JSON.stringify(x));
const mutations=[
 x=>{x.installationConfirmed=true},
 x=>{x.bomMembershipConfirmed=true},
 x=>{x.pmRuleRemapApproved=true},
 x=>{x.componentFailureObserved=true},
 x=>{x.physicalFunction='compressor_oil_filter_confirmed'},
 x=>{x.objectTypes[0].evidenceMeaning='installed_oem_part'},
 x=>{x.objectTypes[0].crossScopeReuseRisk='none'},
 x=>{x.objectTypes[0].counts.damageCauseCompatiblePartCodes=999},
 x=>{x.counts.vparLeafPaths=999}
];
let rejected=0;
for(const mutate of mutations){
 const changed=clone(scenario);mutate(changed);
 if(validateVparProvenance(changed).length)rejected++;
 else errors.push('adversarial_promotion_was_accepted_'+rejected);
}
assert(rejected===mutations.length,'not_all_fake_approvals_rejected');
const payload={schema:'fmea-mining.pm-vpar-provenance.v1',version:'1.3.37',
 nature:'object_type_reuse_and_description_semantics_without_asset_effectivity',
 methodology:'deduplicate_by_catalogue_part_code_within_object_type_then_count_per_matching_leaf; no physical BOM or serial data',
 counts:{hierarchyCases:6,descriptorCases:language.length,unsafePromotionsRejected:rejected,approvedMappings:0,realInspections:0},
 previousVpar:{leafPaths:vpar?.eligibleLeafPaths??0,descriptionOccurrences:vpar?.partDescriptionMatches??0,damageCauseCompatibleOccurrences:vpar?.damageCauseCompatibleDescriptions??0},
 result,errors};
fs.mkdirSync(path.join(root,'reports'),{recursive:true});
fs.writeFileSync(path.join(root,'reports/pm-vpar-provenance.generated.json'),JSON.stringify(payload,null,2)+'\n');
console.log(JSON.stringify({status:errors.length?'FAIL':'OK',counts:payload.counts,previousVpar:payload.previousVpar,
 result:payload.result,errors},null,2));
process.exit(errors.length?1:0);
