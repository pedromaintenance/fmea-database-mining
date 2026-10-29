#!/usr/bin/env node
import fs from "node:fs";import path from "node:path";import {fileURLToPath} from "node:url";
import {Script} from "node:vm";
import {buildEvidenceRequests,filterEvidenceRequests,evidenceRequestMarkdown,assessEvidenceRequests} from "./lib/pm-evidence-request-packets.mjs";
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const read=p=>fs.readFileSync(path.join(root,p),"utf8");
const clone=x=>JSON.parse(JSON.stringify(x));
function embedded(html,id){
 const m=html.match(new RegExp('<script type="application/json" id="'+id+'">([\\s\\S]*?)<\\/script>'));
 if(!m)throw Error("missing_embedded_"+id);return JSON.parse(m[1]);
}
const source=embedded(read("docs/pauta-revisao-fmea.html"),"agenda-data");
const expected=buildEvidenceRequests(source);
const html=read("docs/pre-solicitacoes-evidencia-fmea.html");
const errors=[],checks=[],attacks=[];
const check=(name,pass)=>{checks.push({name,pass});if(!pass)errors.push("failed_"+name)};
const assessment=assessEvidenceRequests(source,expected);
check("source_assessment",assessment.status==="NO_GO_PUBLIC_PRE_REQUESTS_ONLY");
try{check("embedded_exact_matches_derivation",JSON.stringify(embedded(html,"requests-data"))===JSON.stringify(expected))}
catch(e){errors.push("embedded_"+e.message)}
const script=html.match(/<script>\s*([\s\S]*?)<\/script>\s*<\/body>/);
if(!script)errors.push("missing_browser_script");else try{new Script(script[1]);check("browser_js_syntax",true)}
catch(e){errors.push("browser_js_"+e.message)}
const ui=[
 ["no_network",!/\b(fetch|XMLHttpRequest|WebSocket|EventSource|sendBeacon)\s*\(/.test(html)],
 ["no_http",!/\bhttps?:\/\//i.test(html)],
 ["no_external_import",!/<script\b[^>]*src\s*=/.test(html)&&!/<link\b[^>]*href\s*=/.test(html)],
 ["no_unsafe_html",!/innerHTML\s*=|insertAdjacentHTML/.test(html)],
 ["input_filters",["discipline","system","stage","track","search"].every(id=>html.includes('id="'+id+'"'))],
 ["export_buttons",["export","reset","records"].every(id=>html.includes('id="'+id+'"'))],
 ["mobile_css",html.includes("@media(max-width:740px)")&&html.includes("@media(max-width:440px)")],
 ["no_go_notice",html.includes("NÃO HOMOLOGADO · NO_GO")&&html.includes("Rascunho não enviado")],
 ["individual_export",html.includes('Exportar este rascunho (MD)')],
 ["bulk_export",html.includes("fmea-pre-solicitacoes-v1.3.88.md")],
 ["source_not_status",html.includes("Sem requisito individualizado nesta etapa na fonte")],
 ["under_230k",Buffer.byteLength(html,"utf8")<230000],
 ["no_real_tags",!/\b0(?:10|20|21|40|55|60)-0[0-9]{2}\b/.test(html)]
];for(const [k,v] of ui)check("UI_"+k,v);
check("125_packets",filterEvidenceRequests(expected).length===125);
check("25_per_stage",expected.stages.every(s=>filterEvidenceRequests(expected,{stage:s.id}).length===25));
check("10_blocked_rules",new Set(expected.packets.filter(x=>x.sapState==="EXCEPTION_BLOCKED").map(x=>x.ruleId)).size===10);
check("15_other_rules",expected.summary.noApprovedSAPWithoutException===15);
check("64_require_source_specific_evidence",expected.summary.packetsWithoutSpecificSourceValues===64);
check("unknown_system_empty",filterEvidenceRequests(expected,{system:"REAL_EQUIP_TAG"}).length===0);
check("unknown_stage_empty",filterEvidenceRequests(expected,{stage:"S6"}).length===0);
check("unknown_discipline_empty",filterEvidenceRequests(expected,{discipline:"FAKE"}).length===0);
check("unknown_track_empty",filterEvidenceRequests(expected,{track:"APPROVED"}).length===0);
check("accent_query",filterEvidenceRequests(expected,{query:"engrenagem"}).some(x=>x.ruleId==="final-drive-gear"));
check("no_export_forged",evidenceRequestMarkdown(expected,[{packetId:"FAKE"}])===null);
check("empty_export_safe",evidenceRequestMarkdown(expected,[]).includes("NO_GO"));
for(const stage of expected.stages){
 const rows=filterEvidenceRequests(expected,{stage:stage.id});
 check("stage_all_25_"+stage.id,rows.length===25);
 check("export_stage_"+stage.id,evidenceRequestMarkdown(expected,rows).includes(stage.id)&&
  evidenceRequestMarkdown(expected,rows).includes("NÃO ENVIADO"));
}
for(const discipline of expected.disciplines){
 const rows=filterEvidenceRequests(expected,{discipline});
 check("discipline_rows_"+discipline,rows.length%5===0&&rows.length>0);
 check("discipline_draft_export_"+discipline,evidenceRequestMarkdown(expected,rows).includes(discipline));
}
for(const p of expected.packets){
 const md=evidenceRequestMarkdown(expected,[p]);
 check("packet_traced_"+p.packetId,md.includes(p.packetId)&&p.sourceIds.every(s=>md.includes(s)));
 check("packet_has_question_"+p.packetId,md.includes(p.reviewQuestion));
 check("packet_preserves_limits_"+p.packetId,md.includes("NÃO ENVIADO")&&md.includes("NO_GO")&&
  !md.includes("APROVADO PARA EXECUÇÃO"));
 check("packet_draft_"+p.packetId,p.status==="DRAFT_NOT_SENT"&&
  p.sentAt===null&&p.receivedAt===null&&p.assignedPerson===null);
 if(p.stageId==="S3"&&p.competingHypotheses.length)
  check("counterevidence_"+p.packetId,p.competingHypotheses.every(c=>md.includes(c.candidate)&&md.includes(c.proposedDiscriminator)));
 if(p.stageId==="S4"&&p.minimumEvidence.length)
  check("minimum_evidence_"+p.packetId,p.minimumEvidence.every(x=>md.includes(x)));
}
function attack(name,fn){
 const src=clone(source),out=clone(expected);try{fn(src,out)}catch(e){errors.push("bad_fixture_"+name+"_"+e.message);return}
 let rejected=false;try{rejected=assessEvidenceRequests(src,out).status==="REJECTED"}catch(e){rejected=true}
 attacks.push({name,rejected});if(!rejected)errors.push("attack_not_rejected_"+name);
}
expected.packets.forEach((p,i)=>{
 attack("fake_sent_"+p.packetId,(_,o)=>o.packets[i].sentAt="2026-10-29");
 attack("fake_received_"+p.packetId,(_,o)=>o.packets[i].receivedEvidence=true);
 attack("fake_measured_"+p.packetId,(_,o)=>o.packets[i].performedTest=true);
 attack("fake_SAP_"+p.packetId,(_,o)=>o.packets[i].approvedSAP=true);
 attack("fake_priority_"+p.packetId,(_,o)=>o.packets[i].documentaryPriority="CRITICAL_RISK");
 attack("fake_owner_"+p.packetId,(_,o)=>o.packets[i].assignedPerson="FAKE");
 attack("drop_packet_"+p.packetId,(_,o)=>o.packets.splice(i,1));
});
source.items.forEach((p,i)=>{
 attack("source_approval_"+p.ruleId,(s)=>s.items[i].approvedSAP=true);
 attack("source_evidence_"+p.ruleId,(s)=>s.items[i].evidenceReceived=true);
 attack("source_meeting_"+p.ruleId,(s)=>s.items[i].meetingDate="2026-10-29");
});
attack("tamper_stage",(s)=>s.stages[0].question="APPROVED");
attack("fake_all_go",(_,o)=>o.summary.decision="GO");
attack("fake_approval_counts",(_,o)=>o.summary.SAPApprovals=1);
attack("fake_risk_score",(_,o)=>o.safety.noRiskScore=false);
attack("forge_minimum_evidence",(_,o)=>o.packets.find(x=>x.minimumEvidence.length).minimumEvidence.push("PASSED TEST"));
attack("source_priority",(s)=>s.items[0].documentaryPriority="HIGH");
const report={status:errors.length?"FAIL":"OK",summary:expected.summary,
 probes:checks.length,passedProbes:checks.filter(x=>x.pass).length,
 adversarialMutations:attacks.length,rejectedMutations:attacks.filter(x=>x.rejected).length,
 errors,checks,attacks};
fs.mkdirSync(path.join(root,"reports"),{recursive:true});
fs.writeFileSync(path.join(root,"reports/pm-evidence-requests.generated.json"),JSON.stringify(report,null,2)+"\n");
console.log(JSON.stringify({status:report.status,summary:report.summary,probes:report.probes,
 passedProbes:report.passedProbes,adversarialMutations:report.adversarialMutations,
 rejectedMutations:report.rejectedMutations,errors},null,2));
process.exit(errors.length?1:0);
