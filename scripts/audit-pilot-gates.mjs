#!/usr/bin/env node
/** Offline self-attestation gate regression. All people and decisions below are synthetic. */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import vm from 'node:vm';
import {spawnSync} from 'node:child_process';
import {emptyPilotAttestation,validatePilotAttestation,assessPilotAttestation,REQUIRED_GATES} from './lib/pilot-readiness-core.mjs';
const read=p=>fs.readFileSync(p,'utf8'),json=p=>JSON.parse(read(p));
const hash=s=>crypto.createHash('sha256').update(s).digest('hex');
const config=json('data/quality/field-pilot-readiness.v1.json'),graph=json('data/knowledge/functional-architecture.v1.json');
const records=graph.fundamentalRecordPaths.map(p=>({...json(p),__path:p}));
const bundle=json('reports/pilot-gates-bundle.generated.json');
const expected={config,engineSha256:hash(read('scripts/lib/technical-discovery-v2.mjs')),corpusSha256:hash(JSON.stringify(records))};
const failures=[];let checks=0,mutations=0;
function check(name,yes){checks++;if(!yes)failures.push(name)}
check('bundle_exact_fingerprint',bundle.engineSha256===expected.engineSha256&&bundle.corpusSha256===expected.corpusSha256);
check('bundle_no_human_content',bundle.nature==='manual_gate_tracker_not_verified_pilot_authorization'&&bundle.humanQuestions===0&&bundle.realReviewers===0&&bundle.externalMeasurements===null);
check('eleven_required',REQUIRED_GATES.length===11&&config.prerequisites.length===11&&new Set(config.prerequisites.map(x=>x.id)).size===11);
check('all_checklist_items_human_conditioned',config.prerequisites.every(x=>x.ownerRole&&x.required===true&&typeof x.automated==='boolean'));
const page=read('reports/controle-piloto.generated.html'),template=read('docs/controle-piloto.html');
check('template_can_be_rebuilt',template.includes('PILOT_GATE_PLACEHOLDER')&&template.includes('PILOT_CORE_PLACEHOLDER'));
check('no_persistent_storage_or_network',!/fetch\s*\(|XMLHttpRequest|localStorage|sessionStorage|sendBeacon|<script\s+src=/i.test(page));
check('DOM_escapes_dynamic_values',!page.includes('innerHTML')&&page.includes('textContent=value'));
const embedded=page.match(/<script id="pilot-bundle" type="application\/json">([\s\S]*?)<\/script>/);
try{check('embedded_data_parity',JSON.stringify(JSON.parse(embedded?.[1]||''))===JSON.stringify(bundle))}catch{check('embedded_data_parity',false)}
const js=page.match(/<script>([\s\S]*?)<\/script>/);
try{check('browser_js_compiles',!!js&&!!new vm.Script(js[1]))}catch{check('browser_js_compiles',false)}
const publicStatus=json('reports/pilot-gates-public-status.generated.json');
check('public_status_has_no_claims',publicStatus.status==='NO_MANUAL_ATTESTATIONS'&&publicStatus.realQuestionCount===0&&publicStatus.realHumanReviewers===0&&publicStatus.completedGates===null&&publicStatus.externalSearchAccuracy===null);
const baseline=json('reports/dual-review-public-status.generated.json');
check('prior_public_evaluation_still_empty',baseline.status==='NO_REAL_REVIEW_DATA'&&baseline.questionCount===0&&baseline.independentRetrievalMetrics===null);
const empty=emptyPilotAttestation(bundle);
check('empty_attestation_valid',validatePilotAttestation(empty,bundle).length===0);
let assessed=assessPilotAttestation(empty,bundle);
check('empty_is_not_ready',assessed.status==='NOT_READY'&&assessed.completed===0&&assessed.externalRetrievalAccuracy===null);
check('empty_phase_blocked',assessed.phases.every(x=>x.satisfied===false));
const one=structuredClone(empty);one.flags.G01=true;
assessed=assessPilotAttestation(one,bundle);
check('authorization_only_enables_collection_phase',assessed.status==='COLLECTION_SELF_ATTESTED'&&assessed.phases[0].satisfied&&!assessed.phases[1].satisfied);
const half=structuredClone(empty);for(const id of ['G01','G02','G03','G04'])half.flags[id]=true;
assessed=assessPilotAttestation(half,bundle);
check('blind_review_phase_requires_first_four',assessed.status==='BLIND_REVIEW_SELF_ATTESTED');
const score=structuredClone(empty);for(const id of REQUIRED_GATES.slice(0,8))score.flags[id]=true;
assessed=assessPilotAttestation(score,bundle);
check('score_phase_only_after_eight',assessed.status==='LOCAL_SCORING_SELF_ATTESTED');
const full=structuredClone(empty);for(const id of REQUIRED_GATES)full.flags[id]=true;
assessed=assessPilotAttestation(full,bundle);
check('self_reported_complete_is_not_certification',assessed.status==='PUBLIC_SUMMARY_SELF_ATTESTED'&&assessed.humanEvidenceVerified===false&&assessed.externalRetrievalAccuracy===null);
const forged=structuredClone(full);forged.flags.G05=false;
assessed=assessPilotAttestation(forged,bundle);
check('cross_stage_contradiction_prevents_ready',assessed.status==='INCONSISTENT_SEQUENCE'&&assessed.contradictions.length>0);
function reject(name,mutation){
 const x=structuredClone(empty);mutation(x);mutations++;
 check('reject_'+name,validatePilotAttestation(x,bundle).length>0);
}
reject('wrong_fingerprint',x=>x.engineSha256='1'.repeat(64));
reject('modified_corpus',x=>x.corpusSha256='2'.repeat(64));
reject('old_protocol_version',x=>x.version='1.4.9');
reject('missing_g04',x=>delete x.flags.G04);
reject('extra_authority_claim',x=>x.certified=true);
reject('nonboolean_flag',x=>x.flags.G01='approved');
reject('unexpected_gate',x=>x.flags.G12=true);
const priv=path.resolve('private');fs.mkdirSync(priv,{recursive:true});
const sandbox=fs.mkdtempSync(path.join(priv,'qa-pilot-gate-1410-'));
const run=(args)=>spawnSync(process.execPath,['scripts/check-pilot-gates.mjs',...args],{encoding:'utf8',timeout:15000});
try{
 const src=path.join(sandbox,'att.json'),dst=path.join(sandbox,'report.json');
 fs.writeFileSync(src,JSON.stringify(one));
 const ok=run(['--input',src,'--out',dst]);
 check('cli_private_success',ok.status===0&&fs.existsSync(dst)&&json(dst).status==='COLLECTION_SELF_ATTESTED');
 const again=run(['--input',src,'--out',dst]);mutations++;
 check('cli_rejects_overwrite',again.status!==0);
 const escape=path.join('reports','_synthetic_private_attestation_should_not_exist.json');
 const bad=run(['--input',src,'--out',escape]);mutations++;
 check('cli_rejects_public_output',bad.status!==0&&!fs.existsSync(escape));
 const linkTarget=path.resolve('reports','_synthetic_private_symlink_should_not_exist.json');
 const linkPath=path.join(sandbox,'redirect.json');fs.symlinkSync(linkTarget,linkPath);
 const viaLink=run(['--input',src,'--out',linkPath]);mutations++;
 check('cli_rejects_symlink_escape',viaLink.status!==0&&!fs.existsSync(linkTarget));
 const notReady=run([]);check('cli_without_input_is_only_empty',notReady.status===0&&notReady.stdout.includes('"completed": 0'));
}finally{fs.rmSync(sandbox,{recursive:true,force:true})}
const report={schema:'fmea-mining.pilot-gates-quality-report.v1',version:'1.4.10',status:failures.length?'FAIL':'PASS',
 nature:'synthetic_protocol_and_privacy_checks_not_human_research',
 checks,adversarialMutations:mutations,actualHumanQuestions:0,actualExternalReviewers:0,
 independentlyVerifiedPilotApproval:false,externalAccuracy:null,failures};
fs.mkdirSync('reports',{recursive:true});
fs.writeFileSync('reports/pilot-gates-audit.generated.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report,null,2));
process.exit(failures.length?1:0);
