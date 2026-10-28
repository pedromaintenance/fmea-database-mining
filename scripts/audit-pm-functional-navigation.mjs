#!/usr/bin/env node
import fs from "node:fs";import path from "node:path";import {fileURLToPath} from "node:url";
import {Script} from "node:vm";
import {buildTechnicalExplorer,assessTechnicalExplorer} from "./lib/pm-technical-explorer.mjs";
import {buildFunctionalNavigation,assessFunctionalNavigation,relatedFunctionalLinks} from "./lib/pm-functional-navigation.mjs";
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),"utf8"));
const clone=x=>JSON.parse(JSON.stringify(x));
const input={
 seeds:read("data/knowledge/pm-prevention/seed-rules.json"),
 observabilityPolicy:read("data/quality/pm-unranked-observability-policy.v1.json"),
 detectabilityPolicy:read("data/quality/pm-inspection-detectability-policy.v1.json"),
 metrologyPolicy:read("data/quality/pm-metrology-provenance-policy.v1.json"),
 evidencePolicy:read("data/quality/pm-evidence-maturity-policy.v1.json"),
 maturity:read("data/quality/pm-maturity-matrix.v1.json"),
 gaps:read("data/quality/pm-gap-review.v1.json"),
 runbook:read("data/governance/pm-private-deployment-runbook.v1.json")};
const catalog=buildTechnicalExplorer(input);
const relations={catalog,chains:read("data/knowledge/causal-chains.v1.json"),
 ontology:read("data/ontology/concepts.v1.json"),
 semantic:read("data/quality/pm-semantic-crosswalk-policy.v1.json")};
const graph=buildFunctionalNavigation(relations);
const previous=assessTechnicalExplorer(input,catalog);
const quality=assessFunctionalNavigation(relations,graph);
const errors=[...previous.errors,...quality.errors],checks=[],attacks=[];
function check(id,got,expected){const pass=JSON.stringify(got)===JSON.stringify(expected);
 checks.push({id,pass});if(!pass)errors.push("test_failed_"+id);}
const html=fs.readFileSync(path.join(root,"docs/consulta-fmea.html"),"utf8");
const c=html.match(/<script type="application\/json" id="catalog-data">([\s\S]*?)<\/script>/);
const g=html.match(/<script type="application\/json" id="functional-graph-data">([\s\S]*?)<\/script>/);
if(!c||!g)errors.push("missing_both_embedded_json");
else try{
 check("catalog_version_matched",JSON.parse(c[1]),catalog);
 check("functional_provenance_identical",JSON.parse(g[1]),graph);
}catch(e){errors.push("embedded_data_malformed_"+e.message)}
const js=html.match(/<script>\s*([\s\S]*?)<\/script>\s*<\/body>/);
if(!js)errors.push("missing_script");
else try{new Script(js[1],{filename:"consulta-fmea-graph.js"});check("browser_js_valid",true,true)}
catch(e){errors.push("invalid_browser_js_"+e.message)}
const staticRules=[
 ["has_source_graph",html.includes('id="functional-graph-data"')],
 ["case_specific_links",html.includes("functional.links.filter(x=>x.left===r.ruleId||x.right===r.ruleId)")],
 ["source_ids_visible",html.includes("c.sourceIds.join")],
 ["mechanisms_visible",html.includes("node.mechanismFamilies.forEach")],
 ["semantics_visible",html.includes("node.sharedNodes.forEach")],
 ["separate_structural_candidates",html.includes("Sugestões estruturais — revisão necessária")],
 ["cross_component_boundary_visible",html.includes("RESTRIÇÃO DE ENQUADRAMENTO")],
 ["generic_not_confirmed",html.includes("SOMENTE NÓ SEMÂNTICO GENÉRICO")],
 ["not_an_operational_diagnosis",html.includes("não validadas em campo")],
 ["md_includes_provenance",html.includes("Referências funcionais do catálogo")],
 ["offline_no_external_scripts",!/<script\b[^>]+src\s*=/i.test(html)],
 ["offline_no_external_network",!/\b(fetch|XMLHttpRequest|WebSocket|EventSource|sendBeacon)\s*\(/.test(html)],
 ["no_unsafe_HTML",!/\binnerHTML\s*=/.test(html)&&!/insertAdjacentHTML/.test(html)],
 ["offline_no_http",!/\bhttps?:\/\//i.test(html)],
 ["limit_standalone_size",Buffer.byteLength(html,"utf8")<230000],
 ["no_private_real_tags",!/\b0(?:10|20|21|40|55|60)-0[0-9]{2}\b/.test(c?.[1]||"")],
 ["no_private_serial_effectivity",graph.summary.fieldVerifiedMechanisms===0&&graph.summary.confirmedCauses===0]
];
for(const [id,pass] of staticRules)check("ui_"+id,pass,true);
check("six_explicits",graph.links.length,6);
check("four_chain_pairs",graph.summary.explicitChainPairs,4);
check("three_generic_pairs",graph.summary.genericNodePairs,3);
check("four_guards",graph.summary.domainGuardedLinks,4);
const idList=catalog.records.map(x=>x.ruleId);
for(const id of idList){
 const r=relatedFunctionalLinks(graph,id);
 check("no_self_"+id,r.every(x=>x.otherRuleId!==id),true);
 check("all_are_sourced_"+id,r.every(x=>x.explicitChainIds.length+x.sharedGenericNodeIds.length>0),true);
 check("no_elevated_link_"+id,r.every(x=>x.meaning==="PROPOSED_CATALOG_RELATION_NOT_CAUSAL_CONFIRMED"),true);
 check("no_links_from_shared_ontology_only_"+id,r.length,graph.links.filter(x=>x.left===id||x.right===id).length);
 const row=graph.rules.find(x=>x.ruleId===id);
 check("untested_"+id,row.fieldConfirmationCount===0&&row.validatedCausalRelations===0,true);
 check("all_chain_mechanisms_ontologized_"+id,row.chains.every(c=>c.mechanismIds.every(m=>row.mechanismFamilies.some(x=>x.id===m))),true);
}
for(let i=0;i<idList.length;i++)for(let j=0;j<idList.length;j++){
 if(i===j)continue;
 const a=idList[i],b=idList[j];
 const rel=relatedFunctionalLinks(graph,a).find(x=>x.otherRuleId===b);
 const direct=graph.links.find(x=>(x.left===a&&x.right===b)||(x.left===b&&x.right===a));
 check("directed_"+a+"_"+b,!!rel,!!direct);
 if(rel)check("not_field_confirmed_"+a+"_"+b,rel.meaning,"PROPOSED_CATALOG_RELATION_NOT_CAUSAL_CONFIRMED");
}
check("unknown_rule_links_empty",relatedFunctionalLinks(graph,"PRIVATE-EQ-001"),[]);
function attack(name,mutate){
 const inputMut=clone(relations),graphMut=clone(graph);
 try{mutate(inputMut,graphMut)}catch(e){errors.push("broken_fixture_"+name+":"+e.message);return}
 let rejected=false;
 try{rejected=assessFunctionalNavigation(inputMut,graphMut).status==="REJECTED"}catch(e){rejected=true}
 attacks.push({name,rejected});if(!rejected)errors.push("attack_accepted_"+name);
}
for(const r of graph.rules){
 const idx=graph.rules.findIndex(x=>x.ruleId===r.ruleId);
 attack("invent_field_confirmation_"+r.ruleId,(_,g)=>g.rules[idx].fieldConfirmationCount=1);
 attack("invent_approved_relation_"+r.ruleId,(_,g)=>g.rules[idx].validatedCausalRelations=1);
 if(r.chains.length)attack("remove_chain_"+r.ruleId,(_,g)=>g.rules[idx].chains.pop());
 if(r.mechanismFamilies.length)attack("rename_mechanism_"+r.ruleId,(_,g)=>g.rules[idx].mechanismFamilies[0].label="Confirmed crack");
 if(r.sharedNodes.length)attack("remove_shared_node_"+r.ruleId,(_,g)=>g.rules[idx].sharedNodes.pop());
}
for(let i=0;i<graph.links.length;i++){
 attack("invent_damage_equivalence_"+i,(_,g)=>g.links[i].mechanicalEquivalenceDemonstrated=true);
 attack("invent_causal_root_"+i,(_,g)=>g.links[i].rootCauseConfirmed=true);
 attack("invent_SAP_link_"+i,(_,g)=>g.links[i].SAPApproved=true);
 attack("fake_OEM_"+i,(_,g)=>g.links[i].OEMSerialVerified=true);
 attack("remove_explicit_provenance_"+i,(_,g)=>g.links[i].explicitChainIds=[]);
 attack("remove_semantic_provenance_"+i,(_,g)=>g.links[i].sharedGenericNodeIds=[]);
 if(graph.links[i].boundaryIds.length)
  attack("remove_domain_guard_"+i,(_,g)=>g.links[i].boundaryIds.pop());
}
attack("remove_catalog_chain",(i)=>i.chains.records.pop());
attack("fabricate_occurrence",(i)=>i.chains.records[0].empiricalOccurrences=1);
attack("approve_chain",(i)=>i.chains.records[0].confirmedRootCause=true);
attack("change_chain_review",(i)=>i.chains.records[0].review.status="homologado");
attack("invent_SAP_mapping",(i)=>i.chains.records[0].sapMapping.modelId="REAL");
attack("modify_mechanism_family",(i)=>i.ontology.mechanismFamilies[0].pt="CERTIFIED DEFECT");
attack("fake_shared_condition",(i)=>i.semantic.sharedNodes[0].sharingMeaning="Dreno definitivamente avariado");
attack("erase_separation",(i)=>i.semantic.domainSeparation.pop());
attack("allow_cross_component",(i)=>i.semantic.policy.noCrossComponentRollerIdler=false);
attack("fake_public_risk_score",(_,g)=>g.guardrails.noRiskRanking=false);
attack("invent_link",(_,g)=>g.links.push(clone(g.links[0])));
attack("remove_link",(_,g)=>g.links.pop());
attack("hide_blocked_SAP",(_,g)=>g.summary.SAPExceptionsBlocked=0);
attack("fake_corporate_gate_go",(_,g)=>g.summary.corporateGatesBlocked=0);
attack("fake_source_version",(_,g)=>g.provenance.chains="1.3.99");
attack("fake_catalog_approval",(i)=>i.catalog.summary.confirmedRootCauses=1);
const report={status:errors.length?"FAIL":"OK",
 graphSummary:graph.summary,tests:checks.length,passed:checks.filter(x=>x.pass).length,
 attacks:attacks.length,rejected:attacks.filter(x=>x.rejected).length,
 errors,checks,mutations:attacks};
fs.mkdirSync(path.join(root,"reports"),{recursive:true});
fs.writeFileSync(path.join(root,"reports/pm-functional-navigation.generated.json"),JSON.stringify(report,null,2)+"\n");
console.log(JSON.stringify({status:report.status,summary:graph.summary,tests:report.tests,
 passed:report.passed,attacks:report.attacks,rejected:report.rejected,errors},null,2));
process.exit(errors.length?1:0);
