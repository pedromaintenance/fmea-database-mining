#!/usr/bin/env node
import fs from "node:fs";import path from "node:path";import {fileURLToPath} from "node:url";
import {buildTechnicalExplorer,assessTechnicalExplorer,queryExplorer,normalizeSearch} from "./lib/pm-technical-explorer.mjs";
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
const baseline=assessTechnicalExplorer(input,model);
const html=fs.readFileSync(path.join(root,"docs/consulta-fmea.html"),"utf8");
const errors=[...baseline.errors],attacks=[],probes=[];
const match=html.match(/<script type="application\/json" id="catalog-data">([\s\S]*?)<\/script>/);
if(!match)errors.push("missing_embedded_public_catalog");
else{
 try{
  const embedded=JSON.parse(match[1]);
  if(JSON.stringify(embedded)!==JSON.stringify(model))errors.push("standalone_html_embedded_catalog_stale_or_modified");
 }catch(e){errors.push("invalid_embedded_json_"+e.message)}
}
const staticChecks=[
 ["offline",!/<script\s[^>]*src\s*=/i.test(html)],
 ["no_stylesheets",!/<link\s[^>]*href\s*=/i.test(html)],
 ["no_network_calls",!/\b(fetch|XMLHttpRequest|WebSocket|EventSource|sendBeacon)\s*\(/.test(html)],
 ["no_external_endpoints",!/\bhttps?:\/\//i.test(html)],
 ["xss_safe_no_dynamic_html",!/\binnerHTML\s*=/.test(html)&&!/\.insertAdjacentHTML\s*\(/.test(html)],
 ["file_embedded",html.includes('id="catalog-data"')&&html.includes("JSON.parse")],
 ["has_text_filter",html.includes('id="search"')&&html.includes("norm(allFieldText(r))")],
 ["has_system_filter",html.includes('id="system"')&&html.includes('r.system===$("system").value')],
 ["has_track_filter",html.includes('id="track"')&&html.includes('r.reviewTrack===$("track").value')],
 ["has_priority_filter",html.includes('id="priority"')&&html.includes('r.documentaryPriority===$("priority").value')],
 ["has_exception_details",html.includes('r.sapException.finding')&&html.includes('r.sapException.minimumEvidence.forEach')],
 ["explicit_priority_separation",html.includes("FILA DOCUMENTAL, NÃO RISCO OPERACIONAL")],
 ["has_rule_selector",html.includes('id="rules"')&&html.includes("current=p.ruleId")],
 ["has_alternative_view",html.includes("r.alternatives.forEach")],
 ["has_diagnostic_limits",html.includes("r.attributionTrap")&&html.includes("r.missedDetection")],
 ["has_maturity_blocks",html.includes("r.blockers.forEach")],
 ["has_10_quality_checks",html.includes("r.qualityCriteria.forEach")],
 ["has_safety",html.includes("r.safetyBoundary")],
 ["has_clear",html.includes('id="clear"')],
 ["has_export_txt",html.includes('save.textContent')===false&&html.includes('a.download="fmea-consulta-"')],
 ["has_copy_summary",html.includes("navigator.clipboard.writeText")],
 ["has_all_no_go_labels",html.includes("NÃO HOMOLOGADO")&&html.includes("PRIORIDADE NÃO ATRIBUÍDA")&&html.includes("DIAGNÓSTICO INCONCLUSIVO")],
 ["mobile_responsive",html.includes("@media(max-width:830px)")],
 ["no_real_equipment_tags",!/\b0(?:10|20|21|40|55|60)-0[0-9]{2}\b/.test(match?.[1]||"")],
 ["no_css_remote_import",!/@import\b/i.test(html)],
 ["no_auto_approve",!/\bSAP\.update\s*\(/.test(html)],
 ["bounded_size",Buffer.byteLength(html,"utf8")<190000],
 ["no_duplicate_assets",new Set(model.records.map(r=>r.ruleId)).size===25]
];
for(const [name,pass] of staticChecks){probes.push({name,pass});if(!pass)errors.push("html_guard_"+name)}
function probe(name,result,expected){
 const pass=JSON.stringify(result)===JSON.stringify(expected);
 probes.push({name,pass});if(!pass)errors.push("query_"+name);
}
probe("all_unfiltered",queryExplorer(model).length,25);
probe("all_empty_query",queryExplorer(model,{query:""}).length,25);
probe("no_results",queryExplorer(model,{query:"NONEXISTENT_RANDOM_STRING_993"}).length,0);
probe("tag_exact",queryExplorer(model,{query:"final-drive-gear"}).map(x=>x.ruleId),["final-drive-gear"]);
probe("case_insensitive",queryExplorer(model,{query:"FINAL-DRIVE-GEAR"}).map(x=>x.ruleId),["final-drive-gear"]);
probe("accent_insensitive",normalizeSearch("HIDRÁULICO VÁZAMENTO"),"hidraulico vazamento");
probe("combined_filter",queryExplorer(model,{system:"pneus_rodas",query:"pneu"}).length,2);
probe("exact_unknown_system",queryExplorer(model,{system:"REAL_EQUIPMENT_TAG"}).length,0);
probe("search_differential",queryExplorer(model,{query:"rolamento"}).some(x=>x.ruleId==="final-drive-bearing"),true);
probe("search_countermechanism",queryExplorer(model,{query:"rolamentos"}).some(x=>x.ruleId==="final-drive-gear"),true);
probe("search_evidence",queryExplorer(model,{query:"morfologia"}).some(x=>x.ruleId==="final-drive-gear"),true);
probe("search_quality",queryExplorer(model,{query:"Calibração"}).length,15);
probe("system_count",new Set(model.records.map(x=>x.system)).size,13);
probe("no_go",model.summary.decision,"NO_GO");
probe("unknown_model_returns_empty",queryExplorer({records:null}),[]);
probe("track_unranked",queryExplorer(model,{track:"UNRANKED_DETECTABILITY"}).length,15);
probe("track_exceptions",queryExplorer(model,{track:"PM_SAP_DOCUMENTARY_EXCEPTION"}).length,10);
probe("priority_P0",queryExplorer(model,{priority:"P0"}).length,5);
probe("priority_P1",queryExplorer(model,{priority:"P1"}).length,5);
probe("P0_in_SAP_track",queryExplorer(model,{track:"PM_SAP_DOCUMENTARY_EXCEPTION",priority:"P0"}).length,5);
probe("P1_in_unranked_track",queryExplorer(model,{track:"UNRANKED_DETECTABILITY",priority:"P1"}).length,0);
probe("missing_status_track",queryExplorer(model,{track:"UNKNOWN"}).length,0);
probe("missing_priority",queryExplorer(model,{priority:"P99"}).length,0);
probe("exception_source_finding",queryExplorer(model,{query:"subgrupo_not_in_scope"}).length,0);
probe("exception_subgroup",queryExplorer(model,{query:"subgroup_not_in_scope"}).length,3);
probe("sap_exception_direct",queryExplorer(model,{query:"drill-compressor-filter"}).some(x=>x.reviewTrack==="PM_SAP_DOCUMENTARY_EXCEPTION"),true);
probe("P0_not_risk",model.records.filter(x=>x.documentaryPriority==="P0").every(x=>x.priorityStatus==="DOCUMENTED_QUEUE_PRIORITY_NOT_OPERATIONAL_RISK"),true);
probe("unranked_not_low_risk",model.records.filter(x=>x.reviewTrack==="UNRANKED_DETECTABILITY").every(x=>x.priorityStatus==="UNRANKED_NOT_LOW_RISK"),true);
probe("no_spurious_hypotheses_exceptions",model.records.filter(x=>x.reviewTrack==="PM_SAP_DOCUMENTARY_EXCEPTION").every(x=>x.alternatives.length===0&&x.qualityCriteria.length===0&&x.blockers.length===0),true);
for(const rule of model.records){
 probe("rule_query_"+rule.ruleId,queryExplorer(model,{query:rule.ruleId}).some(x=>x.ruleId===rule.ruleId),true);
 probe("system_"+rule.ruleId,queryExplorer(model,{system:rule.system}).some(x=>x.ruleId===rule.ruleId),true);
}
function attack(name,mutate){
 const source=clone(input),report=clone(model);
 try{mutate(source,report)}catch(e){errors.push("invalid_test_fixture_"+name+"_"+e.message);return}
 let rejected=false;
 try{rejected=assessTechnicalExplorer(source,report).status==="REJECTED"}catch(e){rejected=true}
 attacks.push({name,rejected});if(!rejected)errors.push("mutation_accepted_"+name);
}
for(let i=0;i<model.records.length;i++){
 const id=model.records[i].ruleId,isException=model.records[i].reviewTrack==="PM_SAP_DOCUMENTARY_EXCEPTION";
 attack("forged_root_"+id,(_,o)=>o.records[i].diagnosisStatus="ROOT_CAUSE_CONFIRMED");
 attack("forged_approval_"+id,(_,o)=>o.records[i].approvedSAPMapping=true);
 attack("forged_oem_"+id,(_,o)=>o.records[i].OEMSeriesEffective=true);
 attack("forged_release_"+id,(_,o)=>o.records[i].operationReleased=true);
 attack("forged_priority_"+id,(_,o)=>o.records[i].priorityStatus="LOW_RISK");
 attack("alter_symptom_"+id,(_,o)=>o.records[i].symptom="fake symptom");
 attack("alter_method_"+id,(_,o)=>o.records[i].inspectionMethod="verified test");
 attack("switch_review_track_"+id,(_,o)=>o.records[i].reviewTrack=isException?"UNRANKED_DETECTABILITY":"PM_SAP_DOCUMENTARY_EXCEPTION");
 if(isException){
  attack("forged_documentary_priority_"+id,(_,o)=>o.records[i].documentaryPriority="P2");
  attack("fake_SAP_clearance_"+id,(_,o)=>o.records[i].sapException.autoRemapAllowed=true);
  attack("fake_exception_removed_"+id,(_,o)=>o.records[i].sapException=null);
  attack("fake_proof_accepted_"+id,(_,o)=>o.records[i].sapException.minimumEvidence=[]);
  attack("fake_causal_finding_"+id,(_,o)=>o.records[i].sapException.finding="confirmado");
  attack("fake_documentary_priority_source_"+id,(s)=>s.gaps.records.find(x=>x.ruleId===id).priority="P2");
  attack("fake_sap_verified_"+id,(s)=>s.gaps.records.find(x=>x.ruleId===id).autoRemapAllowed=true);
  attack("fake_queue_approval_"+id,(s)=>s.maturity.reviewQueue.find(x=>x.ruleId===id).priority="GO");
 }else{
  attack("forged_hypothesis_"+id,(_,o)=>o.records[i].alternatives[0].status="CONFIRMED");
  attack("forged_quality_"+id,(_,o)=>o.records[i].qualityCriteria[0].status="PASSED");
  attack("forged_blocker_"+id,(_,o)=>o.records[i].blockers[0].status="CLOSED");
  attack("source_hypothesis_fake_"+id,(s)=>s.observabilityPolicy.entries.find(x=>x.ruleId===id).fieldEvidenceReceived=true);
  attack("source_OEM_fake_"+id,(s)=>s.detectabilityPolicy.checks.find(x=>x.ruleId===id).OEMMethodEffective=true);
 }
}
const rec=o=>o.records[0];
attack("remove_record",(_,o)=>o.records.pop());
attack("duplicate_record",(_,o)=>o.records.push(clone(rec(o))));
attack("drop_quality",(_,o)=>o.records.find(x=>x.reviewTrack==="UNRANKED_DETECTABILITY").qualityCriteria.pop());
attack("drop_blockers",(_,o)=>o.records.find(x=>x.reviewTrack==="UNRANKED_DETECTABILITY").blockers.pop());
attack("drop_hypothesis",(_,o)=>o.records.find(x=>x.reviewTrack==="UNRANKED_DETECTABILITY").alternatives.pop());
attack("invent_documentary_acceptance",(_,o)=>o.summary.confirmedRootCauses=1);
attack("invent_field_cases",(_,o)=>o.summary.verifiedFieldCases=1);
attack("invent_sap_link",(_,o)=>o.summary.approvedSapLinks=1);
attack("omit_sap_blocks",(_,o)=>o.summary.blockedSapExceptions=0);
attack("omit_corporate_blocks",(_,o)=>o.summary.blockedCorporateGates=0);
attack("promote_decision",(_,o)=>o.summary.decision="GO");
attack("allow_network",(_,o)=>o.boundaries.noExternalNetworkCalls=false);
attack("allow_orders",(_,o)=>o.boundaries.noWorkOrders=false);
attack("show_real_asset",(_,o)=>o.boundaries.noRealAssetData=false);
attack("alter_model_version",(_,o)=>o.provenance.observability="1.3.81");
attack("source_seed_reviewed",(s)=>s.seeds.records[0].review="approved");
attack("source_seed_dropped",(s)=>s.seeds.records.pop());
attack("source_maturity_field",(s)=>s.maturity.summary.fieldConfirmed=1);
attack("source_maturity_priority",(s)=>s.maturity.unrankedRules.pop());
attack("source_metrology_approval",(s)=>s.metrologyPolicy.criteria[0].corporateApprovalReceived=true);
attack("source_metrology_gate_false",(s)=>s.metrologyPolicy.guardrails.noFieldTestAuthorized=false);
attack("source_evidence_gate_false",(s)=>s.evidencePolicy.guardrails.noWorkOrderCreation=false);
attack("source_detection_sensitivity",(s)=>s.detectabilityPolicy.checks[0].validatedSensitivity=0.5);
attack("source_SAP_unblocked",(s)=>s.gaps.records[0].autoRemapAllowed=true);
attack("source_private_gate_unblocked",(s)=>s.runbook.phases[0].gate="GO");
attack("omit_exception_record",(_,o)=>o.records.splice(o.records.findIndex(x=>x.reviewTrack==="PM_SAP_DOCUMENTARY_EXCEPTION"),1));
attack("fake_P0_count",(_,o)=>o.summary.documentedP0=6);
attack("fake_P1_count",(_,o)=>o.summary.documentedP1=4);
attack("fake_15_count",(_,o)=>o.summary.unrankedRules=25);
attack("fake_exception_total",(_,o)=>o.summary.documentedSapExceptions=0);
attack("source_missing_exception",(s)=>s.gaps.records.pop());
attack("source_forced_low_priority",(s)=>s.gaps.records[0].priority="P2");
attack("source_approved_SAP_part",(s)=>s.gaps.records[0].approvedModelIds.push("FAKE");
const audit={status:errors.length?"FAIL":"OK",staticAndSearchProbes:probes.length,
 passedProbes:probes.filter(x=>x.pass).length,adversarialMutations:attacks.length,
 rejectedMutations:attacks.filter(x=>x.rejected).length,
 upstreamInvariants:baseline.status,htmlBytes:Buffer.byteLength(html,"utf8"),
 embeddedRecords:model.records.length,probes,attacks,errors};
fs.mkdirSync(path.join(root,"reports"),{recursive:true});
fs.writeFileSync(path.join(root,"reports/pm-technical-explorer.generated.json"),JSON.stringify({...model,audit},null,2)+"\n");
console.log(JSON.stringify({status:audit.status,summary:model.summary,
 staticAndSearchProbes:audit.staticAndSearchProbes,passedProbes:audit.passedProbes,
 adversarialMutations:audit.adversarialMutations,rejectedMutations:audit.rejectedMutations,
 htmlBytes:audit.htmlBytes,errors},null,2));
process.exit(errors.length?1:0);
