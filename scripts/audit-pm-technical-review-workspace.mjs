#!/usr/bin/env node
import fs from "node:fs";import path from "node:path";import {fileURLToPath} from "node:url";
import {buildTechnicalExplorer,assessTechnicalExplorer} from "./lib/pm-technical-explorer.mjs";
import {relatedRules,buildTechnicalComparison,buildReviewMarkdown,assessTechnicalReviewWorkspace} from "./lib/pm-technical-review-workspace.mjs";
import {Script} from "node:vm";
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
 runbook:read("data/governance/pm-private-deployment-runbook.v1.json")
};

const model=buildTechnicalExplorer(input);
const initial=assessTechnicalExplorer(input,model);
const assessment=assessTechnicalReviewWorkspace(model);
const errors=[...initial.errors,...assessment.errors],tests=[],mutations=[];
const test=(id,value,expected)=>{const pass=JSON.stringify(value)===JSON.stringify(expected);
 tests.push({id,pass});if(!pass)errors.push("failed_test_"+id);};
const html=fs.readFileSync(path.join(root,"docs/consulta-fmea.html"),"utf8");
const embedded=html.match(/<script type="application\/json" id="catalog-data">([\s\S]*?)<\/script>/);
if(!embedded){errors.push("missing_data_embedded")}else{
 try{test("embedded_source_equals_model",JSON.parse(embedded[1]),model)}
 catch(e){errors.push("malformed_embedded_json_"+e.message)}
}
const js=html.match(/<script>\s*([\s\S]*?)<\/script>\s*<\/body>/);
if(!js)errors.push("missing_inline_javascript");
else{try{new Script(js[1],{filename:"consulta-fmea-inline.js"});test("inline_js_syntax",true,true)}
 catch(e){errors.push("inline_js_syntax_"+e.message)}}
const checks=[
 ["markdown_button",html.includes('h("button","Exportar ficha MD"')],
 ["compare_a_button",html.includes('h("button","Selecionar A"')],
 ["compare_b_button",html.includes('h("button","Selecionar B"')],
 ["compare_a11y",html.includes('aria-pressed')],
 ["two_column_layout",html.includes('class="compare-grid"')||html.includes('"compare-grid"')],
 ["mobile_stacks_columns",html.includes('.grid,.compare-grid,.related-list{grid-template-columns:1fr}')],
 ["related_navigation",html.includes("relatedPanel(el,r)")&&html.includes("current=x.record.ruleId")],
 ["related_not_diagnostic",html.includes("não por causalidade")],
 ["separated_track_cards",html.includes("r.reviewTrack===")&&html.includes("PM_SAP_DOCUMENTARY_EXCEPTION")],
 ["no_automatic_sap",!/\bSAP\.update\s*\(/.test(html)],
 ["no_external_fetch",!/\b(fetch|XMLHttpRequest|WebSocket|EventSource|sendBeacon)\s*\(/.test(html)],
 ["no_injected_html",!/\binnerHTML\s*=/.test(html)],
 ["no_http_links",!/\bhttps?:\/\//i.test(html.replaceAll("http://www.w3.org/2000/svg",""))],
 ["safe_export",html.includes('reviewMarkdown([r.ruleId])')&&html.includes("downloadText(")],
 ["same_rule_not_comparable",html.includes("compareSlots.right===r.ruleId")&&html.includes("compareSlots.left===r.ruleId")],
 ["no_real_asset_tags",!/\b0(?:10|20|21|40|55|60)-0[0-9]{2}\b/.test(embedded?.[1]??"")],
 ["size_under_230k",Buffer.byteLength(html,"utf8")<230000],
 ["offline_no_external_import",!/@import\b/.test(html)&&!/<script\s[^>]*src\s*=/i.test(html)]
];
for(const [id,ok] of checks)test("static_"+id,ok,true);
const rules=model.records, exceptions=rules.filter(x=>x.reviewTrack==="PM_SAP_DOCUMENTARY_EXCEPTION");
test("all_records",rules.length,25);test("sap_blockers",exceptions.length,10);
test("P0",exceptions.filter(x=>x.documentaryPriority==="P0").length,5);
test("P1",exceptions.filter(x=>x.documentaryPriority==="P1").length,5);
for(const r of rules){
 const related=relatedRules(model,r.ruleId);
 test("structural_only_"+r.ruleId,related.every(x=>{
  const other=rules.find(y=>y.ruleId===x.ruleId);
  return other&&other.ruleId!==r.ruleId&&
   (other.system===r.system||other.subgroupCode===r.subgroupCode);
 }),true);
 test("no_same_rule_in_related_"+r.ruleId,related.some(x=>x.ruleId===r.ruleId),false);
 test("max_five_related_"+r.ruleId,related.length<=5,true);
 const md=buildReviewMarkdown(model,[r.ruleId]);
 test("single_sheet_marked_"+r.ruleId,md.includes("NÃO HOMOLOGADO")&&md.includes("NO_GO")&&md.includes(r.ruleId),true);
 test("original_symptom_"+r.ruleId,md.includes(r.symptom.replace(/\n/g," ")),true);
 test("priority_is_not_risk_"+r.ruleId,md.includes("não criticidade operacional"),true);
 if(r.reviewTrack==="PM_SAP_DOCUMENTARY_EXCEPTION"){
  test("sap_blocker_preserved_"+r.ruleId,md.includes(r.sapException.expectedBlocker)&&md.includes(r.sapException.finding)&&md.includes(r.sapException.nextInspection),true);
  test("no_invented_hypotheses_"+r.ruleId,r.alternatives.length===0&&r.qualityCriteria.length===0,true);
 }else{
  test("hypothesis_list_"+r.ruleId,r.alternatives.every(x=>md.includes(x.candidate)&&md.includes(x.requestedEvidence)),true);
 }
}
for(let i=0;i<rules.length;i++)for(let j=0;j<rules.length;j++){
 if(i===j)continue;
 const a=rules[i],b=rules[j],comp=buildTechnicalComparison(model,a.ruleId,b.ruleId);
 test("pair_"+a.ruleId+"_"+b.ruleId,!!comp&&comp.left.ruleId===a.ruleId&&
  comp.right.ruleId===b.ruleId&&comp.authorization==="NO_GO_READ_ONLY"&&
  comp.documentationPriorityIsNotOperationalRisk===true&&
  comp.left.SAPApproved===false&&comp.right.operationallyReleased===false,true);
 const md=buildReviewMarkdown(model,[a.ruleId,b.ruleId]);
 test("dual_sheet_"+a.ruleId+"_"+b.ruleId,!!md&&md.includes(a.ruleId)&&
  md.includes(b.ruleId)&&md.includes("não demonstram")&&md.includes("NO_GO"),true);
}
test("reject_duplicate",buildTechnicalComparison(model,rules[0].ruleId,rules[0].ruleId),null);
test("reject_unknown",buildTechnicalComparison(model,"REAL-020-001",rules[0].ruleId),null);
test("reject_unrecognized_single_sheet",buildReviewMarkdown(model,["real_asset"]),null);
test("reject_repeated_sheet",buildReviewMarkdown(model,[rules[0].ruleId,rules[0].ruleId]),null);
test("reject_3_rules",buildReviewMarkdown(model,rules.slice(0,3).map(x=>x.ruleId)),null);
test("reject_no_rules",buildReviewMarkdown(model,[]),null);
test("reject_invalid_related",relatedRules(model,"REAL-030-001"),[]);
test("reject_invalid_limit",relatedRules(model,rules[0].ruleId,100),[]);
function attack(id,mutate){
 const obj=clone(model);mutate(obj);
 let rejected=false;
 try{rejected=assessTechnicalReviewWorkspace(obj).status==="REJECTED"||
  assessTechnicalExplorer(input,obj).status==="REJECTED"}catch(e){rejected=true}
 mutations.push({id,rejected});if(!rejected)errors.push("attack_accepted_"+id);
}
for(let i=0;i<rules.length;i++){
 const id=rules[i].ruleId;
 attack("invent_confirmed_root_"+id,x=>x.records[i].diagnosisStatus="ROOT_CONFIRMED");
 attack("invent_sap_approval_"+id,x=>x.records[i].approvedSAPMapping=true);
 attack("invent_operational_release_"+id,x=>x.records[i].operationReleased=true);
 attack("false_low_risk_"+id,x=>x.records[i].priorityStatus="LOW_RISK");
 attack("invent_OEM_series_"+id,x=>x.records[i].OEMSeriesEffective=true);
 attack("remove_rule_"+id,x=>x.records.splice(i,1));
}
attack("allow_consumer_updates",x=>x.boundaries.noSAPWrites=false);
attack("fake_field_evidence",x=>x.summary.verifiedFieldCases=1);
attack("promote_causal_score",x=>x.summary.confirmedRootCauses=1);
attack("hide_blocked_exceptions",x=>x.summary.blockedSapExceptions=0);
attack("grant_external_access",x=>x.boundaries.noExternalNetworkCalls=false);
attack("allow_workorder",x=>x.boundaries.noWorkOrders=false);
const audit={status:errors.length?"FAIL":"OK",
 tests:tests.length,passed:tests.filter(x=>x.pass).length,
 adversarialMutations:mutations.length,rejected:mutations.filter(x=>x.rejected).length,
 models:rules.length,orderedComparisons:600,reviewSheetsIndividual:25,
 errors,checks:tests,attacks:mutations};
fs.mkdirSync(path.join(root,"reports"),{recursive:true});
fs.writeFileSync(path.join(root,"reports/pm-technical-review-workspace.generated.json"),
 JSON.stringify({version:"1.3.84",summary:model.summary,audit},null,2)+"\n");
console.log(JSON.stringify({status:audit.status,tests:audit.tests,passed:audit.passed,
 adversarialMutations:audit.adversarialMutations,rejected:audit.rejected,
 orderedComparisons:audit.orderedComparisons,reviewSheetsIndividual:audit.reviewSheetsIndividual,
 errors:audit.errors},null,2));
process.exit(errors.length?1:0);
