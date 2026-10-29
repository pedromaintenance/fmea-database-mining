#!/usr/bin/env node
import fs from "node:fs";import path from "node:path";import {fileURLToPath} from "node:url";
import {Script} from "node:vm";
import {buildDisciplineAgenda,filterDisciplineAgenda,agendaMarkdown,assessDisciplineAgenda} from "./lib/pm-discipline-review-agenda.mjs";
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const read=p=>fs.readFileSync(path.join(root,p),"utf8");
const clone=x=>JSON.parse(JSON.stringify(x));
function embedded(html,id){
 const re=new RegExp('<script type="application/json" id="'+id+'">([\\s\\S]*?)<\\/script>');
 const m=html.match(re);if(!m)throw Error("missing_embedded_"+id);return JSON.parse(m[1]);
}
const origin=read("docs/consulta-fmea.html");
const input={catalog:embedded(origin,"catalog-data"),graph:embedded(origin,"functional-graph-data"),
 inventory:embedded(origin,"knowledge-gap-data"),
 maturity:JSON.parse(read("data/quality/pm-maturity-matrix.v1.json"))};
const baseline=buildDisciplineAgenda(input);
const upstream=assessDisciplineAgenda(input,baseline);
const html=read("docs/pauta-revisao-fmea.html");
const errors=[...upstream.errors],checks=[],attacks=[];
const check=(name,ok)=>{checks.push({name,ok});if(!ok)errors.push("failed_"+name)};
try{check("embedded_agenda_equals_derived_data",JSON.stringify(embedded(html,"agenda-data"))===JSON.stringify(baseline))}
catch(e){errors.push("embedded_data_"+e.message)}
const script=html.match(/<script>\s*([\s\S]*?)<\/script>\s*<\/body>/);
if(!script)errors.push("missing_browser_script");
else try{new Script(script[1],{filename:"pauta-revisao-fmea.js"});check("valid_browser_javascript",true)}
catch(e){errors.push("invalid_browser_javascript_"+e.message)}
const ui=[
 ["offline_no_fetch",!/\b(fetch|XMLHttpRequest|WebSocket|EventSource|sendBeacon)\s*\(/.test(html)],
 ["offline_no_external_links",!/\bhttps?:\/\//i.test(html)],
 ["no_inner_html",!/\binnerHTML\s*=|insertAdjacentHTML/.test(html)],
 ["no_script_import",!/<script\s+[^>]*src\s*=/.test(html)],
 ["mobile_responsive",html.includes("@media(max-width:530px)")],
 ["controls_exposed",["discipline","system","stage","search","reset","export","records"].every(id=>html.includes('id="'+id+'"'))],
 ["documentary_safety_notice",html.includes("NO_GO")&&html.includes("NÃO risco operacional")],
 ["markdown_export",html.includes("fmea-pauta-revisao-v1.3.87.md")],
 ["html_under_110k",Buffer.byteLength(html,"utf8")<110000]
];for(const [name,ok] of ui)check("ui_"+name,ok);
check("all_25",filterDisciplineAgenda(baseline).length===25);
check("all_S1",filterDisciplineAgenda(baseline,{stage:"S1"}).length===25);
check("all_S5",filterDisciplineAgenda(baseline,{stage:"S5"}).length===25);
check("invalid_discipline",filterDisciplineAgenda(baseline,{discipline:"FAKE"}).length===0);
check("invalid_system",filterDisciplineAgenda(baseline,{system:"FAKE"}).length===0);
check("invalid_stage",filterDisciplineAgenda(baseline,{stage:"FAKE"}).length===0);
for(const d of baseline.disciplines){
 const rows=filterDisciplineAgenda(baseline,{discipline:d.discipline});
 check("count_"+d.discipline,rows.length===d.total);
 check("export_"+d.discipline,agendaMarkdown(baseline,rows,{discipline:d.discipline,stage:"all"}).includes("NO_GO"));
}
for(const x of baseline.items){
 const md=agendaMarkdown(baseline,[x],{discipline:x.discipline,stage:"all"});
 check("provenance_"+x.ruleId,x.sourceIds.every(id=>md.includes(id)));
 check("no_go_"+x.ruleId,md.includes("NÃO HOMOLOGADO")&&md.includes("NO_GO"));
 check("stages_"+x.ruleId,x.stages.length===5&&x.stages.every(y=>y.status==="NOT_STARTED_DOCUMENTARY_ONLY"));
 check("no_owner_"+x.ruleId,x.assignedTo===null&&x.meetingDate===null);
 check("evidence_"+x.ruleId,x.proposedMinimumEvidence.every(e=>md.includes(e)));
}
check("bad_export",agendaMarkdown(baseline,[{ruleId:"FAKE"}],{})===null);
function attack(name,fn){
 const source=clone(input),out=clone(baseline);try{fn(source,out)}
 catch(e){errors.push("fixture_"+name+"_"+e.message);return}
 let rejected=false;
 try{rejected=assessDisciplineAgenda(source,out).status==="REJECTED"}catch(e){rejected=true}
 attacks.push({name,rejected});if(!rejected)errors.push("accepted_"+name);
}
baseline.items.forEach((item,i)=>{
 attack("approval_"+item.ruleId,(_,out)=>out.items[i].approvedSAP=true);
 attack("meeting_"+item.ruleId,(_,out)=>out.items[i].meetingDate="2026-10-29");
 attack("assignment_"+item.ruleId,(_,out)=>out.items[i].assignedTo="SOMEONE");
 attack("evidence_"+item.ruleId,(_,out)=>out.items[i].evidenceReceived=true);
 attack("priority_"+item.ruleId,(_,out)=>out.items[i].documentaryPriority="CRITICAL");
 attack("stage_"+item.ruleId,(_,out)=>out.items[i].stages[0].status="COMPLETE");
 attack("root_"+item.ruleId,(_,out)=>out.items[i].rootCauseConfirmed=true);
 attack("missing_"+item.ruleId,(_,out)=>out.items.splice(i,1));
});
attack("group_fake",(_,out)=>out.disciplines[0].discipline="FAKE");
attack("risk_score",(_,out)=>out.safety.noRiskScore=false);
attack("invent_go",(_,out)=>out.summary.decision="GO");
attack("fake_source_approval",(src)=>src.maturity.rules[0].sap.reviewedByEngineering=true);
attack("fake_source_reference",(src)=>src.maturity.rules[0].sourceIds.push("FAKE"));
attack("fake_source_sap",(src)=>src.inventory.records[0].sapStatus="APPROVED");
const report={status:errors.length?"FAIL":"OK",version:"1.3.87",
 records:baseline.summary.records,disciplines:baseline.summary.disciplines,
 checks:checks.length,passed:checks.filter(x=>x.ok).length,
 attacks:attacks.length,rejected:attacks.filter(x=>x.rejected).length,
 decision:"NO_GO",errors};
fs.mkdirSync(path.join(root,"reports"),{recursive:true});
fs.writeFileSync(path.join(root,"reports/pm-discipline-review-agenda.generated.json"),
 JSON.stringify({...report,groups:baseline.disciplines,checksDetail:checks,attacksDetail:attacks},null,2)+"\n");
console.log(JSON.stringify(report,null,2));process.exit(errors.length?1:0);
