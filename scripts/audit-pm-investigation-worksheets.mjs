#!/usr/bin/env node
import fs from "node:fs";import path from "node:path";import {fileURLToPath} from "node:url";
import {Script} from "node:vm";
import {buildTechnicalExplorer,assessTechnicalExplorer} from "./lib/pm-technical-explorer.mjs";
import {buildFunctionalNavigation,assessFunctionalNavigation} from "./lib/pm-functional-navigation.mjs";
import {buildKnowledgeGapInventory,assessKnowledgeGapInventory} from "./lib/pm-knowledge-gap-inventory.mjs";
import {buildInvestigationWorksheet,worksheetMarkdown,assessInvestigationWorksheets} from "./lib/pm-investigation-worksheets.mjs";
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),"utf8"));
const copy=x=>JSON.parse(JSON.stringify(x));
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
const rel={catalog,chains:read("data/knowledge/causal-chains.v1.json"),
 ontology:read("data/ontology/concepts.v1.json"),
 semantic:read("data/quality/pm-semantic-crosswalk-policy.v1.json")};
const graph=buildFunctionalNavigation(rel);
const dependencies={catalog,graph,maturity:input.maturity};
const inventory=buildKnowledgeGapInventory(dependencies);
const data={catalog,graph,inventory};
const sheets=catalog.records.map(r=>buildInvestigationWorksheet(data,r.ruleId));
const base=[assessTechnicalExplorer(input,catalog),assessFunctionalNavigation(rel,graph),
 assessKnowledgeGapInventory(dependencies,inventory),assessInvestigationWorksheets(data,sheets)];
const errors=base.flatMap(x=>x.errors),tests=[],attacks=[];
function assert(name,pass){tests.push({name,pass});if(!pass)errors.push("test_"+name)}
base.forEach((x,i)=>assert("baseline_"+i,x.status.startsWith("NO_GO")));
const html=fs.readFileSync(path.join(root,"docs/consulta-fmea.html"),"utf8");
const source=html.match(/<script>\s*([\s\S]*?)<\/script>\s*<\/body>/);
if(!source)errors.push("missing_inline_script");
else try{new Script(source[1]);assert("JS_parse",true)}catch(e){errors.push("JS_syntax_"+e.message)}
const indicators=[
 ["worksheets_panel",html.includes("Visualizar etapas de investigação documental")],
 ["markdown_export",html.includes("Preparar roteiro MD")],
 ["S1_oem",html.includes('["S1","Configuração OEM"')],
 ["S2_chains",html.includes('["S2","Mecanismo e função"')],
 ["S3_discriminators",html.includes('["S3","Discriminação e segurança"')],
 ["S4_sap",html.includes('["S4","Curadoria SAP"')],
 ["S5_independent_review",html.includes('["S5","Revisão independente"')],
 ["not_inspection",html.includes("nenhuma iniciada. Isto não autoriza inspeção")],
 ["exceptions_distinct",html.includes('r.reviewTrack==="PM_SAP_DOCUMENTARY_EXCEPTION"')],
 ["hypotheses_distinct",html.includes("r.alternatives.forEach((a,i)")],
 ["export_filename",html.includes('"fmea-roteiro-"+x.ruleId+"-v1.3.86.md"')],
 ["no_network",!/\b(fetch|XMLHttpRequest|WebSocket|EventSource|sendBeacon)\s*\(/.test(html)],
 ["no_dynamic_html",!/\binnerHTML\s*=/.test(html)],
 ["only_svg_namespace_url",!/\bhttps?:\/\//i.test(html.replaceAll("http://www.w3.org/2000/svg",""))],
 ["bounded_size",Buffer.byteLength(html,"utf8")<245000],
 ["no_script_import",!/<script\s+[^>]*src=/.test(html)]
];indicators.forEach(([name,pass])=>assert(name,pass));
for(const w of sheets){
 const md=worksheetMarkdown(w);
 assert("five_open_stages_"+w.ruleId,w.stages.length===5&&w.stages.every(x=>!x.completed&&!x.proofReceived));
 assert("source_rule_"+w.ruleId,md.includes(w.ruleId)&&md.includes(w.symptom));
 assert("no_approval_"+w.ruleId,md.includes("NÃO HOMOLOGADO")&&md.includes("NO_GO")&&md.includes("NENHUM TESTE EXECUTADO"));
 assert("has_discipline_"+w.ruleId,md.includes(w.proposedReviewDiscipline));
 assert("chain_reference_"+w.ruleId,w.chainGap?
  md.includes("não significa ausência de falha"):w.sourceChainIds.every(x=>md.includes(x)));
 assert("correct_track_"+w.ruleId,w.exception?
  md.includes(w.exception.blocker)&&w.exception.minimumEvidence.every(x=>md.includes(x)):
  w.competingHypotheses.length===2&&w.competingHypotheses.every(x=>md.includes(x.hypothesis)&&md.includes(x.proposedDiscriminator)));
}
assert("25_worksheets",sheets.length===25);
assert("ten_exceptions",sheets.filter(x=>x.exception).length===10);
assert("fourteen_uncatalogued_chains",sheets.filter(x=>x.chainGap).length===14);
assert("fifteen_two_hypotheses",sheets.filter(x=>x.competingHypotheses.length===2).length===15);
assert("unknown_id_rejected",buildInvestigationWorksheet(data,"NON_EXISTENT_RULE")===null);
assert("invalid_markdown_rejected",worksheetMarkdown({...sheets[0],decision:"GO"})===null);
function attack(name,fn){
 const a=copy(sheets);const deps=copy(data);
 try{fn(a,deps)}catch(e){errors.push("fixture_"+name+"_"+e.message);return}
 let rejected=false;try{rejected=assessInvestigationWorksheets(deps,a).status==="REJECTED"}catch{rejected=true}
 attacks.push({name,rejected});if(!rejected)errors.push("attack_"+name);
}
sheets.forEach((r,i)=>{
 attack("forge_executed_"+r.ruleId,a=>a[i].stages[0].completed=true);
 attack("forge_oem_proof_"+r.ruleId,a=>a[i].stages[0].proofReceived=true);
 attack("forge_diagnostic_root_"+r.ruleId,a=>a[i].confirmedRootCause=true);
 attack("forge_sap_mapping_"+r.ruleId,a=>a[i].SAPMappingApproved=true);
 attack("forge_release_"+r.ruleId,a=>a[i].operationReleased=true);
 attack("forge_priority_"+r.ruleId,a=>a[i].documentaryPriority="URGENT_RISK");
 attack("forge_mechanism_"+r.ruleId,a=>a[i].sourceChainIds.push("FAKE-CHAIN"));
 attack("forge_sap_source_"+r.ruleId,(_,d)=>d.inventory.records[i].sapStatus="APPROVED");
});
attack("drop_worksheet",a=>a.pop());
attack("duplicate_worksheet",a=>a.push(copy(a[0])));
attack("fake_graph_cause",(_,d)=>d.graph.summary.confirmedCauses=1);
attack("fake_inventory_decision",(_,d)=>d.inventory.summary.decision="GO");
attack("fake_catalog_approval",(_,d)=>d.catalog.summary.approvedSapLinks=1);
const result={status:errors.length?"FAIL":"OK",version:"1.3.86",
 checks:tests.length,passed:tests.filter(x=>x.pass).length,
 mutations:attacks.length,rejected:attacks.filter(x=>x.rejected).length,
 worksheets:sheets.length,exceptions:sheets.filter(x=>x.exception).length,
 uncoveredChains:sheets.filter(x=>x.chainGap).length,
 evidenceOfActualFieldWork:0,operationalRelease:"NO_GO",errors};
fs.mkdirSync(path.join(root,"reports"),{recursive:true});
fs.writeFileSync(path.join(root,"reports/pm-investigation-worksheets.generated.json"),
 JSON.stringify({...result,worksheets:sheets,checksDetail:tests,mutationDetail:attacks},null,2)+"\n");
console.log(JSON.stringify(result,null,2));process.exit(errors.length?1:0);
