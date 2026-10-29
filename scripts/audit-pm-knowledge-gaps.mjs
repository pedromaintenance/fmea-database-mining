#!/usr/bin/env node
import fs from "node:fs";import path from "node:path";import {fileURLToPath} from "node:url";
import {Script} from "node:vm";
import {buildTechnicalExplorer,assessTechnicalExplorer} from "./lib/pm-technical-explorer.mjs";
import {buildFunctionalNavigation,assessFunctionalNavigation} from "./lib/pm-functional-navigation.mjs";
import {buildKnowledgeGapInventory,assessKnowledgeGapInventory,queryKnowledgeGaps,GAP_CATEGORIES} from "./lib/pm-knowledge-gap-inventory.mjs";
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),"utf8"));
const clone=o=>JSON.parse(JSON.stringify(o));
const inputs={seeds:read("data/knowledge/pm-prevention/seed-rules.json"),
 observabilityPolicy:read("data/quality/pm-unranked-observability-policy.v1.json"),
 detectabilityPolicy:read("data/quality/pm-inspection-detectability-policy.v1.json"),
 metrologyPolicy:read("data/quality/pm-metrology-provenance-policy.v1.json"),
 evidencePolicy:read("data/quality/pm-evidence-maturity-policy.v1.json"),
 maturity:read("data/quality/pm-maturity-matrix.v1.json"),
 gaps:read("data/quality/pm-gap-review.v1.json"),
 runbook:read("data/governance/pm-private-deployment-runbook.v1.json")};
const catalog=buildTechnicalExplorer(inputs);
const rel={catalog,chains:read("data/knowledge/causal-chains.v1.json"),
 ontology:read("data/ontology/concepts.v1.json"),
 semantic:read("data/quality/pm-semantic-crosswalk-policy.v1.json")};
const graph=buildFunctionalNavigation(rel);
const upstream={catalog,graph,maturity:inputs.maturity};
const inventory=buildKnowledgeGapInventory(upstream);
const baseline=assessKnowledgeGapInventory(upstream,inventory);
const old=assessTechnicalExplorer(inputs,catalog);
const oldGraph=assessFunctionalNavigation(rel,graph);
const errors=[...baseline.errors,...old.errors,...oldGraph.errors],probes=[],attacks=[];
function check(id,actual,expected){const pass=JSON.stringify(actual)===JSON.stringify(expected);
 probes.push({id,pass});if(!pass)errors.push("probe_"+id);}
check("inventory_validator",baseline.status,"NO_GO_DOCUMENTARY_INVENTORY");
const html=fs.readFileSync(path.join(root,"docs/consulta-fmea.html"),"utf8");
const find=(id)=>html.match(new RegExp('<script type="application/json" id="'+id+'">([\\s\\S]*?)<\\/script>'));
for(const [id,original] of [["catalog-data",catalog],["functional-graph-data",graph],["knowledge-gap-data",inventory]]){
 const match=find(id);
 if(!match)errors.push("missing_"+id);
 else try{check("embedded_"+id,JSON.parse(match[1]),original)}
 catch(e){errors.push("invalid_json_"+id+"_"+e.message)}
}
const js=html.match(/<script>\s*([\s\S]*?)<\/script>\s*<\/body>/);
if(!js)errors.push("missing_js");
else try{new Script(js[1],{filename:"consulta-fmea-gaps.js"});check("valid_javascript",true,true)}
catch(e){errors.push("invalid_js_"+e.message)}
const safety=[
 ["offline_no_http",!/\bhttps?:\/\//i.test(html.replaceAll("http://www.w3.org/2000/svg",""))],
 ["offline_no_network",!/\b(fetch|XMLHttpRequest|WebSocket|EventSource|sendBeacon)\s*\(/.test(html)],
 ["offline_no_external_scripts",!/<script\b[^>]*src\s*=|<link\b[^>]*href\s*=/i.test(html)],
 ["safe_text_nodes",!/\binnerHTML\s*=|insertAdjacentHTML/.test(html)],
 ["within_standalone_budget",Buffer.byteLength(html,"utf8")<230000],
 ["gap_summary_no_risk",html.includes("não é fila de risco")&&html.includes("não gravidade operacional")],
 ["five_categories",html.includes('id="gap-category"')&&html.includes("knowledgeGaps.categories.forEach")],
 ["system_filter",html.includes('id="gap-system"')&&html.includes('gapSystems.value===x.system')],
 ["track_filter",html.includes('id="gap-track"')&&html.includes('gapTrack.value===x.reviewTrack')],
 ["search_filter",html.includes('id="gap-search"')&&html.includes("gapSearch.addEventListener")],
 ["review_export",html.includes('id="gap-export"')&&html.includes("knowledgeGapReport(filteredGaps())")],
 ["drilldown",html.includes("navigateFromMap(x.ruleId)")],
 ["documentary_priority",html.includes("P0/P1 são prioridades da fila documental")],
 ["no_chain_is_not_healthy",html.includes("não implica ausência de falha")],
 ["no_private_tags",!/\b0(?:10|20|21|40|55|60)-0[0-9]{2}\b/.test(find("knowledge-gap-data")?.[1]||"")]
];
for(const [name,v] of safety)check("static_"+name,v,true);
check("all_rules",queryKnowledgeGaps(inventory).length,25);
check("missing_generic_chains",queryKnowledgeGaps(inventory,{category:"GENERIC_CHAIN_MISSING"}).length,14);
check("all_no_OEM",queryKnowledgeGaps(inventory,{category:"OEM_SERIES"}).length,25);
check("all_without_field",queryKnowledgeGaps(inventory,{category:"FIELD_DISCRIMINATION"}).length,25);
check("all_review_pending",queryKnowledgeGaps(inventory,{category:"ENGINEERING_REVIEW"}).length,25);
check("documentary_SAP_all",queryKnowledgeGaps(inventory,{category:"SAP_DOCUMENTARY"}).length,25);
check("formal_SAP_blocked",queryKnowledgeGaps(inventory,{track:"PM_SAP_DOCUMENTARY_EXCEPTION"}).length,10);
check("nonprioritized",queryKnowledgeGaps(inventory,{track:"UNRANKED_DETECTABILITY"}).length,15);
check("accent_norm",queryKnowledgeGaps(inventory,{query:"mANGUEIRA"}).some(x=>x.ruleId==="hydraulic-hose-leak"),true);
check("no_match",queryKnowledgeGaps(inventory,{query:"ZZZZZ_HIDDEN_599"}).length,0);
check("no_invalid_system",queryKnowledgeGaps(inventory,{system:"private_tag"}).length,0);
check("no_invalid_category",queryKnowledgeGaps(inventory,{category:"CRITICAL"}).length,0);
check("all_systems",inventory.systems.length,13);
for(const row of inventory.records){
 check("sourced_"+row.ruleId,!!inputs.maturity.rules.find(x=>x.ruleId===row.ruleId)&&
  !!graph.rules.find(x=>x.ruleId===row.ruleId),true);
 check("not_an_operational_priority_"+row.ruleId,row.documentaryPriority===null||
  ["P0","P1"].includes(row.documentaryPriority),true);
 check("chain_absence_explicit_"+row.ruleId,row.categories.includes("GENERIC_CHAIN_MISSING"),row.genericAuthoredChains===0);
 check("SAP_distinction_"+row.ruleId,row.reviewTrack==="PM_SAP_DOCUMENTARY_EXCEPTION",row.sapStatus==="EXCEPTION_BLOCKED");
 check("rule_in_system_filter_"+row.ruleId,queryKnowledgeGaps(inventory,{system:row.system}).some(x=>x.ruleId===row.ruleId),true);
}
function attack(id,mutate){
 const input=clone(upstream),out=clone(inventory);
 try{mutate(input,out)}catch(e){errors.push("bad_fixture_"+id+"_"+e.message);return}
 let rejected=false;
 try{rejected=assessKnowledgeGapInventory(input,out).status==="REJECTED"}catch(e){rejected=true}
 attacks.push({id,rejected});if(!rejected)errors.push("mutation_accepted_"+id);
}
inventory.records.forEach((r,i)=>{
 attack("fake_confirmed_case_"+r.ruleId,(_,o)=>o.records[i].genericAuthoredChains=99);
 attack("remove_oem_gap_"+r.ruleId,(_,o)=>o.records[i].categories=o.records[i].categories.filter(x=>x!=="OEM_SERIES"));
 attack("fake_sap_clearance_"+r.ruleId,(_,o)=>o.records[i].sapStatus="SAP_APPROVED");
 attack("remove_independent_review_gap_"+r.ruleId,(_,o)=>o.records[i].categories.pop());
 attack("alter_documentary_priority_"+r.ruleId,(_,o)=>o.records[i].documentaryPriority="CRITICAL");
 attack("fake_field_observation_source_"+r.ruleId,(p)=>p.maturity.rules[i].fieldObservations=1);
 attack("fake_oem_serial_gate_"+r.ruleId,(p)=>p.maturity.rules[i].gates.serialBOM="approved");
});
attack("fake_no_go_decision",(_,o)=>o.summary.decision="GO");
attack("fake_high_risk_sort",(_,o)=>o.safety.notOperationalRiskScore=false);
attack("erase_sap_exceptions",(_,o)=>o.summary.formalSAPExceptions=0);
attack("remove_rule",(_,o)=>o.records.pop());
attack("modify_source_sap_mapping",(i)=>i.maturity.rules[0].sap.approvedComponentCode="123");
attack("invent_engineering_review",(i)=>i.maturity.rules[0].sap.reviewedByEngineering=true);
const result={status:errors.length?"FAIL":"OK",summary:inventory.summary,
 checks:probes.length,passed:probes.filter(x=>x.pass).length,
 adversarialMutations:attacks.length,rejected:attacks.filter(x=>x.rejected).length,
 errors,probes,attacks};
fs.mkdirSync(path.join(root,"reports"),{recursive:true});
fs.writeFileSync(path.join(root,"reports/pm-knowledge-gaps.generated.json"),JSON.stringify(result,null,2)+"\n");
console.log(JSON.stringify({status:result.status,summary:result.summary,checks:result.checks,passed:result.passed,
 adversarialMutations:result.adversarialMutations,rejected:result.rejected,errors},null,2));
process.exit(errors.length?1:0);
