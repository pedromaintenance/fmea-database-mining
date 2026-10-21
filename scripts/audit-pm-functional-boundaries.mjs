#!/usr/bin/env node
/** Real catalogue paths + synthetic safety tests. No real OEM/SAP approval. */
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {FOCUS_RULES,classifyPmPath,inspectFocusGuards,catalogueBranches} from './lib/pm-functional-boundaries.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const db=read('data/catalog/failure-db.v1.json');
const rules=read('data/knowledge/pm-prevention/seed-rules.json').records;
const reviews=read('data/quality/pm-gap-review.v1.json').records;
const gates=read('data/quality/pm-exception-evidence-gates.v1.json').records;
const links=read('data/knowledge/pm-prevention/generated-links.json').records;
const errors=inspectFocusGuards(rules,reviews,gates,links);
const focus=FOCUS_RULES.map(f=>{
 const rule=rules.find(r=>r.id===f.id);
 if(!rule){errors.push('missing_'+f.id);return {ruleId:f.id,error:'rule_missing'};}
 const eligible=db.locations.filter(l=>classifyPmPath(rule,l)==='candidate_path');
 const branches=catalogueBranches(db.locations,rule);
 if(f.blocker==='subgroup_not_in_scope'&&eligible.length)errors.push('new_location_requires_review_'+f.id);
 return {ruleId:f.id,expectedBlocker:f.blocker,requestedSubgroup:f.subgroup,eligibleLeafPaths:eligible.length,
  hierarchyBranches:branches,engineeringReviewed:false,confirmedInstalledComponents:0,approvedSapMappings:0};
});
const fuel=rules.find(r=>r.id==='fuel-filter-contamination');
const hose=rules.find(r=>r.id==='hydraulic-hose-leak');
const air=rules.find(r=>r.id==='drill-compressor-filter');
const loc=(rule,system,group,subgroup,depth=3,model=rule.models[0])=>({
 profundidade:depth,modelo:model,sistema:{codigo:system},grupo:{codigo:group},subgrupo:subgroup?{codigo:subgroup}:null
});
const cases=[
 ['fuel_hsvv_correct_parent',fuel,loc(fuel,'ENSY','FUSY','HSVV'),'candidate_path'],
 ['fuel_wrong_parent',fuel,loc(fuel,'ENSY','COSY','HSVV'),'system_group_out_of_scope'],
 ['fuel_wrong_subgroup',fuel,loc(fuel,'ENSY','FUSY','OTHER'),'subgroup_out_of_scope'],
 ['hose_fuel_collision',hose,loc(hose,'ENSY','FUSY','HSVV'),'system_group_out_of_scope'],
 ['hose_cooling_collision',hose,loc(hose,'ENSY','COSY','HSVV'),'system_group_out_of_scope'],
 ['hose_brake_collision',hose,loc(hose,'HYSY','BRSY','HSVV'),'system_group_out_of_scope'],
 ['hose_steering_collision',hose,loc(hose,'HYSY','STSY','HSVV'),'system_group_out_of_scope'],
 ['hose_wrong_subgroup',hose,loc(hose,'HYSY','OTHER','OTHER'),'subgroup_out_of_scope'],
 ['compressor_group_is_not_subgroup',air,loc(air,'AISY','COMR','OTHER'),'subgroup_out_of_scope'],
 ['compressor_no_subgroup',air,loc(air,'AISY','COMR',null),'subgroup_out_of_scope'],
 ['compressor_wrong_parent',air,loc(air,'AISY','OTHER','COMR'),'system_group_out_of_scope'],
 ['compressor_wrong_system',air,loc(air,'ENSY','COMR','COMR'),'system_group_out_of_scope'],
 ['hypothetical_leaf_is_not_approval',air,loc(air,'AISY','COMR','COMR'),'candidate_path'],
 ['compressor_parent_only',air,loc(air,'AISY','COMR','COMR',2),'not_leaf_location'],
 ['wrong_model',fuel,loc(fuel,'ENSY','FUSY','HSVV',3,'NOT-DECLARED'),'model_out_of_scope']
];
for(const [name,r,l,expected] of cases){
 try{if(classifyPmPath(r,l)!==expected)errors.push('failed_regression_'+name);}
 catch(e){errors.push('exception_'+name+': '+e.message);}
}
const clone=x=>JSON.parse(JSON.stringify(x));
const mutations=[
 ['unblock_gap',c=>{c.reviews.find(x=>x.ruleId==='hydraulic-hose-leak').autoRemapAllowed=true;}],
 ['fake_location',c=>{c.gates.find(x=>x.ruleId==='drill-compressor-filter').approvedLocationId='FAKE';}],
 ['fake_component',c=>{c.gates.find(x=>x.ruleId==='fuel-filter-contamination').approvedComponentCode='FAKE';}],
 ['fake_review',c=>{c.gates.find(x=>x.ruleId==='hydraulic-hose-abrasion').reviewedByEngineering=true;}],
 ['fake_failure',c=>{c.gates.find(x=>x.ruleId==='hydraulic-hose-leak').confirmedFailureEvent=true;}],
 ['fake_alias',c=>{c.rules.find(x=>x.id==='drill-compressor-filter').subgroupCode='UNVERIFIED';}],
 ['fake_link',c=>{c.links.push({originRule:'hydraulic-hose-leak'});}],
 ['missing_gate',c=>{c.reviews=c.reviews.filter(x=>x.ruleId!=='fuel-filter-contamination');}]
];
let rejected=0;
for(const [name,mutate] of mutations){
 const c=clone({rules,reviews,gates,links});mutate(c);
 if(inspectFocusGuards(c.rules,c.reviews,c.gates,c.links).length)rejected++;
 else errors.push('unsafe_mutation_'+name);
}
const payload={schema:'fmea-mining.pm-functional-boundaries.v1',version:'1.3.35',
 nature:'catalogue_structure_and_synthetic_guards_not_oem_effectivity',
 counts:{rulesInspected:focus.length,structuralRegressions:cases.length,adversarialMutationsRejected:rejected,
 confirmedFieldInspections:0,approvedSapMappings:0},focus,errors};
fs.mkdirSync(path.join(root,'reports'),{recursive:true});
fs.writeFileSync(path.join(root,'reports/pm-functional-boundaries.generated.json'),JSON.stringify(payload,null,2)+'\n');
console.log(JSON.stringify({status:errors.length?'FAIL':'OK',counts:payload.counts,
 focus:focus.map(x=>({rule:x.ruleId,eligiblePaths:x.eligibleLeafPaths,branches:x.hierarchyBranches?.length,blocker:x.expectedBlocker})),errors},null,2));
process.exit(errors.length?1:0);
