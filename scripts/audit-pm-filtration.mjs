#!/usr/bin/env node
/** Searches actual catalogue, not installed configuration; no inferred links. */
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {discoverFiltration,filterTerms,FILTER_RULE_IDS} from './pm-filtration-scan.mjs';
import {inspectFocusGuards} from './lib/pm-functional-boundaries.mjs';
const base=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>JSON.parse(fs.readFileSync(path.join(base,p),'utf8'));
const db=read('data/catalog/failure-db.v1.json');
const rules=read('data/knowledge/pm-prevention/seed-rules.json').records;
const review=read('data/quality/pm-gap-review.v1.json').records;
const gates=read('data/quality/pm-exception-evidence-gates.v1.json').records;
const links=read('data/knowledge/pm-prevention/generated-links.json').records;
const research=read('data/research/pm-filtration-public-evidence.v1.json');
const errors=[],require=(p,id)=>{if(!p)errors.push(id);};
errors.push(...inspectFocusGuards(rules,review,gates,links));
require(research.schema==='fmea-mining.pm-filtration-public-evidence.v1'&&research.version==='1.3.36','research_header_drift');
require(research.nature==='manufacturer_public_technical_context_without_configuration_effectivity','research_promotion');
require(research.reviewStatus==='public_research_only_no_application_approval','review_promotion');
for(const [key,value] of Object.entries(research.policy))require(value===true,'policy_relaxed_'+key);
const expectedClaims=['CAT-FUEL-STAGES','SANDVIK-DR410i-BASE','SANDVIK-MAINT-KITS','SANDVIK-PUMP-MODULE-VARIANT'];
require(research.claims.length===expectedClaims.length,'source_count_changed');
for(const id of expectedClaims)require(research.claims.some(x=>x.id===id),'source_missing_'+id);
for(const source of research.claims){
 require(/^https:\/\/(www\.)?(cat\.com|mining\.sandvik)\//.test(source.sourceUrl),'unapproved_source_'+source.id);
 require(source.effectiveForMachine===false,'source_claims_effectivity_'+source.id);
 require(typeof source.evidence==='string'&&source.evidence.length>40,'vague_source_'+source.id);
 require(typeof source.doesNotProve==='string'&&source.doesNotProve.length>60,'missing_source_limit_'+source.id);
}
const pump=research.claims.find(x=>x.id==='SANDVIK-PUMP-MODULE-VARIANT');
require(pump?.scope==='pump_unit_upgrade_not_air_compressor'&&pump.doesNotProve.includes('NÃO'),'false_compressor_inference');
const findings=FILTER_RULE_IDS.map(id=>{
 const r=rules.find(x=>x.id===id);
 require(!!r,'source_rule_missing_'+id);
 if(!r)return {ruleId:id,error:'missing_rule'};
 const f=discoverFiltration(db,r);
 require(!links.some(x=>x.originRule===id),'automatic_approval_'+id);
 require(f.candidates.every(x=>x.disposition==='candidate_for_private_BOM_and_SAP_review_not_approved'),'false_candidate_approval_'+id);
 require(f.verifiedInstalledParts===0&&f.approvedSubgroupChanges===0&&f.confirmedFailureEvents===0,'invented_machine_evidence_'+id);
 return f;
});
const mk=(model,root,group,sub,object)=>({profundidade:3,modelo:model,sistema:{codigo:root},grupo:{codigo:group},subgrupo:{codigo:sub},objetoTipoSAP:object,id:sub+'-'+model});
const fake={compatibleFailureModesByPart:{'SYNTH-1':{damageCauses:{'03.02':['C2.09']}}},locations:[
 mk('A','ENSY','FUSY','FIL1','O-FILT'),
 mk('A','ENSY','FUSY','HSVV','O-HOSE'),
 mk('A','ENSY','COSY','FIL2','O-FILT'),
 mk('B','ENSY','FUSY','FIL3','O-FILT'),
 mk('A','ENSY','FUSY','FIL4','O-SEP'),
 mk('A','AISY','COMR','C-FILT','O-FILT'),
 mk('A','AISY','OTHER','C-BAD','O-FILT')
],partsByObjectType:{
 'O-FILT':[{code:'SYNTH-1',pt:'Elemento Filtrante'}],
 'O-HOSE':[{code:'SYNTH-2',pt:'Mangueira'}],
 'O-SEP':[{code:'SYNTH-3',pt:'Separador'}]
}};
const fr={id:'fuel-filter-contamination',system:'combustivel',models:['A'],subgroupCode:'HSVV',damageId:'03.02',causeId:'C2.09'};
const cr={id:'drill-compressor-filter',system:'ar_comprimido',models:['A'],subgroupCode:'COMR',damageId:'03.02',causeId:'C2.09'};
const fuel=discoverFiltration(fake,fr),comp=discoverFiltration(fake,cr);
require(fuel.totals.withFilterTextInObjectType===2,'wrong_fuel_candidate_count');
require(fuel.totals.damageCauseCompatibleDescriptions===1&&comp.totals.damageCauseCompatibleDescriptions===1,'compatible_pairs_not_reconciled');
require(fuel.candidates.every(x=>x.groupCode==='FUSY'&&x.models.length===1&&x.models[0]==='A'),'wrong_fuel_group_or_model');
require(fuel.candidates.some(x=>x.subgroupCode==='FIL1')&&fuel.candidates.some(x=>x.subgroupCode==='FIL4'),'missing_filter_or_separator_discovery');
require(comp.candidates.length===1&&comp.candidates[0].subgroupCode==='C-FILT','wrong_compressor_hierarchy');
require(filterTerms('separador de água').includes('separacao')&&filterTerms('Filtro de óleo').includes('filtragem'),'accent_normalization_failed');
require(!filterTerms('Mangueira de pressão').length,'hose_falsely_classed_filter');
require(!Object.keys(fuel.candidates[0]||{}).some(x=>/partnumber|componentCode|locationId|serial/i.test(x)),'identifiers_exposed');
let refused=0;
const violations=[
 x=>{x.effectiveForMachine=true;},
 x=>{x.doesNotProve='';},
 x=>{x.sourceUrl='https://example.com/unverified';},
 x=>{x.scope='compressor_filter_confirmed';}
];
for(const mutate of violations){
 const v=JSON.parse(JSON.stringify(pump));mutate(v);
 const safe=v.effectiveForMachine===false&&v.doesNotProve.length>60&&/^https:\/\/(www\.)?(cat\.com|mining\.sandvik)\//.test(v.sourceUrl)&&v.scope==='pump_unit_upgrade_not_air_compressor';
 if(!safe)refused++;
}
require(refused===4,'adversarial_research_mutations_not_rejected');
const result={schema:'fmea-mining.pm-filtration-discovery.v1',version:'1.3.36',
 provenance:'catalogue_and_oem_general_sources_not_installed_configuration',
 counts:{rulesExamined:findings.length,publicManufacturerSources:research.claims.length,
 structuralChecks:9,adversarialSourceMutations:refused,approvedMappings:0,observedFailures:0},findings,errors};
fs.mkdirSync(path.join(base,'reports'),{recursive:true});
fs.writeFileSync(path.join(base,'reports/pm-filtration-discovery.generated.json'),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({status:errors.length?'FAIL':'OK',counts:result.counts,
 findings:findings.map(f=>({ruleId:f.ruleId,candidates:f.candidates.map(c=>({systemCode:c.systemCode,groupCode:c.groupCode,
 subgroupCode:c.subgroupCode,models:c.models,leafPaths:c.eligibleLeafPaths,compatibleDamageCauseDescriptions:c.damageCauseCompatibleDescriptions,descriptorClasses:c.descriptorClasses})),
 totals:f.totals})),errors},null,2));
process.exit(errors.length?1:0);
