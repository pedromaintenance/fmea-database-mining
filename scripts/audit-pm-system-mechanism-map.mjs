#!/usr/bin/env node
import fs from "node:fs";import path from "node:path";import {fileURLToPath} from "node:url";
import {Script} from "node:vm";
import {buildTechnicalExplorer,assessTechnicalExplorer} from "./lib/pm-technical-explorer.mjs";
import {buildFunctionalNavigation,assessFunctionalNavigation} from "./lib/pm-functional-navigation.mjs";
import {buildSystemMechanismMap,assessSystemMechanismMaps} from "./lib/pm-system-mechanism-map.mjs";
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),"utf8"));
const clone=x=>JSON.parse(JSON.stringify(x));
const upstream={
 seeds:read("data/knowledge/pm-prevention/seed-rules.json"),
 observabilityPolicy:read("data/quality/pm-unranked-observability-policy.v1.json"),
 detectabilityPolicy:read("data/quality/pm-inspection-detectability-policy.v1.json"),
 metrologyPolicy:read("data/quality/pm-metrology-provenance-policy.v1.json"),
 evidencePolicy:read("data/quality/pm-evidence-maturity-policy.v1.json"),
 maturity:read("data/quality/pm-maturity-matrix.v1.json"),
 gaps:read("data/quality/pm-gap-review.v1.json"),
 runbook:read("data/governance/pm-private-deployment-runbook.v1.json")};
const catalog=buildTechnicalExplorer(upstream);
const dependencies={catalog,chains:read("data/knowledge/causal-chains.v1.json"),
 ontology:read("data/ontology/concepts.v1.json"),semantic:read("data/quality/pm-semantic-crosswalk-policy.v1.json")};
const graph=buildFunctionalNavigation(dependencies);
const systems=[...new Set(catalog.records.map(x=>x.system))].sort();
const maps=systems.map(system=>buildSystemMechanismMap(catalog,graph,system));
const old=assessTechnicalExplorer(upstream,catalog);
const oldGraph=assessFunctionalNavigation(dependencies,graph);
const proof=assessSystemMechanismMaps({catalog,graph},maps);
const errors=[...old.errors,...oldGraph.errors,...proof.errors],tests=[],attacks=[];
const test=(name,ok)=>{tests.push({name,ok});if(!ok)errors.push("test_failed_"+name);};
test("previous_catalog_audit",old.status==="NO_GO_READ_ONLY_CATALOG");
test("previous_provenance_audit",oldGraph.status==="NO_GO_PUBLIC_REFERENCE_GRAPH");
test("new_maps_audit",proof.status==="NO_GO_ALL_SYSTEM_MAPS_VALIDATED");
const html=fs.readFileSync(path.join(root,"docs/consulta-fmea.html"),"utf8");
const match1=html.match(/<script type="application\/json" id="catalog-data">([\s\S]*?)<\/script>/);
const match2=html.match(/<script type="application\/json" id="functional-graph-data">([\s\S]*?)<\/script>/);
if(!match1||!match2)errors.push("embedded_data_missing");
else try{
 test("catalog_faithful",JSON.stringify(JSON.parse(match1[1]))===JSON.stringify(catalog));
 test("functional_graph_faithful",JSON.stringify(JSON.parse(match2[1]))===JSON.stringify(graph));
}catch(e){errors.push("embedded_JSON_invalid_"+e.message)}
const browser=html.match(/<script>\s*([\s\S]*?)<\/script>\s*<\/body>/);
if(!browser)errors.push("inline_script_missing");
else try{new Script(browser[1],{filename:"consulta-fmea-system-map.js"});test("JavaScript_parses",true)}
catch(e){errors.push("browser_JS_invalid_"+e.message)}
const domIndicators=[
 ["map_heading",html.includes('id="map-heading"')&&html.includes("Mapa técnico por sistema")],
 ["map_dropdown",html.includes('id="map-system"')&&html.includes('mapSystem.addEventListener("change",renderSystemMap)')],
 ["svg_semantics",html.includes('id="map-svg"')&&html.includes('role="group"')],
 ["keyboard_accessible_nodes",html.includes('tabindex:"0"')&&html.includes('ev.key==="Enter"')&&html.includes('ev.key===" "')],
 ["spatial_stability",html.includes('const columns=[{x:22,w:196},{x:272,w:235},{x:570,w:216},{x:846,w:265}]')],
 ["no_force_layout_or_animation",!/\brequestAnimationFrame\b|\bsetInterval\s*\(/.test(html)],
 ["svg_viewbox",html.includes('svg.setAttribute("viewBox","0 0 1200 "+height)')],
 ["horizontal_scroll_mobile",html.includes(".map-viewport{")&&html.includes("overflow-x:auto")],
 ["source_chain_edges_only",html.includes('kind:"authored"')&&html.includes('kind:"tag"')],
 ["missing_chains_qualified",html.includes("Nenhuma cadeia genérica vinculada nas fontes")],
 ["sourced_node_details",html.includes("node.chain.sourceIds.join")&&html.includes("node.chain.function")],
 ["mechanism_not_physical",html.includes("não prova que houve o fenômeno no equipamento")],
 ["linked_peer_boundaries",html.includes("RESTRIÇÃO: ")&&html.includes("Sem equivalência de dano")],
 ["no_source_fabrication",html.includes("NO_GO: a ausência de cadeia documentada")],
 ["no_independent_method_claim",html.includes("não aplicabilidade OEM por série")],
 ["no_http",!/\bhttps?:\/\//i.test(html.replaceAll("http://www.w3.org/2000/svg",""))],
 ["no_external_resources",!/<script\b[^>]*src\s*=|<link\b[^>]*href\s*=/i.test(html)],
 ["no_network",!/\b(fetch|XMLHttpRequest|WebSocket|EventSource|sendBeacon)\s*\(/.test(html)],
 ["no_dynamic_html",!/\binnerHTML\s*=/.test(html)&&!/insertAdjacentHTML/.test(html)],
 ["no_uploaded_private_asset_tags",!/\b0(?:10|20|21|40|55|60)-0[0-9]{2}\b/.test(match1?.[1]??"")],
 ["standalone_size",Buffer.byteLength(html,"utf8")<245000],
 ["no_SAP_mapping_call",!/\bSAP\.update\s*\(/.test(html)],
 ["source_types_legend",["Sistema","Regra preventiva","Cadeia genérica","Família de mecanismo"].every(x=>html.includes(">"+x+"</span>"))]
];
for(const [name,ok] of domIndicators)test("ui_"+name,ok);
let totalNodes=0,totalEdges=0,totalSingleSystems=0,geometryTests=0;
for(const m of maps){
 const n=m.nodes.length,total=m.nodes.filter(x=>x.kind==="rule").length+
  m.nodes.filter(x=>x.kind==="chain").length+m.nodes.filter(x=>x.kind==="mechanism").length+1;
 test("nodes_"+m.system,n===total&&n===new Set(m.nodes.map(x=>x.id)).size);
 test("status_"+m.system,m.status==="NO_GO_READ_ONLY_PUBLIC_DOCUMENTARY_MAP");
 test("no_unsupported_rule_chain_"+m.system,m.edges.filter(x=>x.kind==="RULE_REFERENCED_BY_AUTHORED_CHAIN").every(e=>{
  const rid=e.from.slice(5),cid=e.to.slice(6);
  return graph.rules.find(x=>x.ruleId===rid)?.chains.some(c=>c.id===cid);
 }));
 test("no_unsupported_mechanism_"+m.system,m.edges.filter(x=>x.kind==="CHAIN_TAGGED_ONTOLOGY_MECHANISM").every(e=>{
  const cid=e.from.slice(6),mid=e.to.slice(10);
  return graph.rules.some(x=>x.chains.some(c=>c.id===cid&&c.mechanismIds.includes(mid)));
 }));
 test("node_spacing_and_viewport_"+m.system,(()=>{
  const count=Math.max(1,m.counts.rules,m.counts.chains,m.counts.mechanisms);
  const h=Math.max(420,Math.min(850,count*73+120));
  return (h-150)/count>=50&&h<=850&&h>=420;
 })());geometryTests++;
 test("zero_is_missing_source_not_healthy_"+m.system,m.counts.chains!==0||
  (m.nodes.some(x=>x.kind==="rule")&&!m.nodes.some(x=>x.kind==="chain")));
 totalNodes+=n;totalEdges+=m.edges.length;
 if(m.counts.chains===0)totalSingleSystems++;
}
test("all_25_rules_covered",maps.reduce((n,m)=>n+m.counts.rules,0)===25);
test("24_unique_chains_covered",new Set(maps.flatMap(m=>m.nodes.filter(x=>x.kind==="chain").map(x=>x.id))).size===24);
test("all_13_systems",maps.length===13);
test("six_documentary_peer_pairs",graph.links.length===6);
test("no_real_inspections",maps.every(x=>x.counts.fieldObservations===0&&x.counts.confirmedFailures===0));
function mutate(name,change){
 const inputs=clone({catalog,graph,maps});
 try{change(inputs)}catch(e){errors.push("invalid_attack_"+name+"_"+e.message);return}
 let rejected=false;
 try{rejected=assessSystemMechanismMaps({catalog:inputs.catalog,graph:inputs.graph},inputs.maps).status==="REJECTED"}
 catch(e){rejected=true}
 attacks.push({name,rejected});if(!rejected)errors.push("attack_accepted_"+name);
}
for(let i=0;i<maps.length;i++){
 const id=maps[i].system;
 mutate("invent_damage_"+id,x=>x.maps[i].counts.confirmedFailures=1);
 mutate("invent_SAP_"+id,x=>x.maps[i].counts.approvedSAPLinks=1);
 mutate("release_operation_"+id,x=>x.maps[i].counts.operationalReleases=1);
 mutate("invent_measured_"+id,x=>x.maps[i].counts.fieldObservations=1);
 mutate("map_priority_inference_"+id,x=>x.maps[i].guardrails.noRiskScoring=false);
 mutate("map_fake_approval_"+id,x=>x.maps[i].status="GO");
 mutate("remove_rule_node_"+id,x=>x.maps[i].nodes.splice(1,1));
 mutate("invent_cross_component_edge_"+id,x=>x.maps[i].edges.push({from:"rule:FAKE",to:"mechanism:ME-01",kind:"CAUSE"}));
 mutate("remove_valid_link_"+id,x=>x.maps[i].edges.pop());
 mutate("forged_source_version_"+id,x=>x.maps[i].version="1.3.83");
 if(maps[i].nodes.some(n=>n.kind==="chain")){
  mutate("fake_chain_confirmed_"+id,x=>x.maps[i].nodes.find(n=>n.kind==="chain").status="FIELD_CONFIRMED");
  mutate("drop_chain_proof_"+id,x=>x.maps[i].nodes.find(n=>n.kind==="chain").sourceIds=[]);
 }
 if(maps[i].nodes.some(n=>n.kind==="mechanism"))
  mutate("fake_mechanism_verified_"+id,x=>x.maps[i].nodes.find(n=>n.kind==="mechanism").status="VERIFIED");
}
mutate("graph_links_forge",(x)=>x.graph.links[0].rootCauseConfirmed=true);
mutate("graph_SAP_forge",(x)=>x.graph.links[0].SAPApproved=true);
mutate("catalog_go",(x)=>x.catalog.summary.decision="GO");
mutate("catalog_change",(x)=>x.catalog.records[0].symptom="CERTIFIED_DAMAGE");
mutate("missing_map",(x)=>x.maps.pop());
mutate("duplicate_map",(x)=>x.maps.push(clone(x.maps[0])));
mutate("cross_system_relabel",(x)=>x.maps[0].system="INVALID_SYSTEM");
const result={status:errors.length?"FAIL":"OK",summary:{systems:maps.length,rules:25,
 sourceChainDefinitions:graph.summary.authoredGenericChains,
 sourcedGraphLinks:graph.links.length,totalNodesAcrossSubgraphs:totalNodes,
 totalEdgesAcrossSubgraphs:totalEdges,systemsWithoutDocumentedChains:totalSingleSystems,
 geometryChecks:geometryTests,realInspections:0,SAPChanges:0,decision:"NO_GO"},
 tests:tests.length,passed:tests.filter(x=>x.ok).length,
 adversarialMutations:attacks.length,rejected:attacks.filter(x=>x.rejected).length,
 errors,checks:tests,attacks};
fs.mkdirSync(path.join(root,"reports"),{recursive:true});
fs.writeFileSync(path.join(root,"reports/pm-system-mechanism-map.generated.json"),JSON.stringify(result,null,2)+"\n");
console.log(JSON.stringify({status:result.status,summary:result.summary,tests:result.tests,
 passed:result.passed,adversarialMutations:result.adversarialMutations,rejected:result.rejected,
 errors},null,2));
process.exit(errors.length?1:0);
