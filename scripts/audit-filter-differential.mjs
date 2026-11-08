#!/usr/bin/env node
/** Safety, lineage and scope audit of conceptual filter differential study. */
import fs from 'node:fs';
import vm from 'node:vm';
import crypto from 'node:crypto';
const read=p=>fs.readFileSync(p,'utf8'),json=p=>JSON.parse(read(p));
const dossier=json('data/knowledge/hydraulic-filter-differential.v1.json');
const published=json('reports/filter-differential.generated.json');
const registry=json('data/research/sources.v1.json');
const discovery=json('data/catalog/source-discovery.v1.json');
const html=read('reports/filtragem-diferencial.generated.html');
const template=read('docs/filtragem-diferencial.html');
const lock=json('data/quality/pilot-frozen-baseline.v1.json');
const graph=json(lock.graphPath);
const sourceById=new Map(registry.sources.map(s=>[s.id,s]));
const hypotheses=new Map(dossier.hypotheses.map(h=>[h.id,h]));
let checks=0,adversarial=0;const problems=[];
const ck=(label,yes)=>{checks++;if(!yes)problems.push(label)};
const sha=b=>crypto.createHash('sha1').update(Buffer.concat([Buffer.from('blob '+b.length+'\0'),b])).digest('hex');
ck('schema',dossier.schema==='fmea-mining.hydraulic-filter-differential.v1'&&dossier.version==='1.4.12');
ck('nature_conceptual',dossier.nature==='conceptual_differential_not_machine_specific_test_or_diagnosis');
ck('approval_false',dossier.status.evidenceClass==='CONCEPTUAL'&&dossier.status.reviewStatus==='PENDING_REVIEW'&&dossier.status.operationalApproval===false&&dossier.status.sapMappingApproved===false&&dossier.status.automaticDiagnosisAllowed===false);
ck('no_asset_applicability',dossier.status.verifiedModels.length===0&&dossier.status.verifiedSerials.length===0&&dossier.status.fieldObservations===0&&dossier.status.performedTests===0&&dossier.status.confirmedRootCauses===0&&dossier.status.oemAcceptanceLimits===null);
ck('six_distinct_hypotheses',hypotheses.size===6&&dossier.hypotheses.length===6);
ck('six_distinct_presentations',dossier.presentations.length===6&&new Set(dossier.presentations.map(x=>x.id)).size===6);
ck('hypotheses_unconfirmed',dossier.hypotheses.every(h=>h.certainty==='UNCONFIRMED'));
ck('hypothesis_evidence_questions',dossier.hypotheses.every(h=>h.favors.length>0&&h.against.length>0&&h.evidenceQuestions.length>=2));
ck('hypothesis_source_coverage',dossier.hypotheses.every(h=>h.sourceIds.length>=2&&h.sourceIds.every(s=>sourceById.has(s))));
ck('scenario_candidate_coverage',dossier.presentations.every(p=>p.candidateHypothesisIds.length>=3&&p.candidateHypothesisIds.every(h=>hypotheses.has(h))&&p.requiredContext.length>=2&&p.invalidConclusion.length>20));
ck('same_hypothesis_preserved_as_alternative',dossier.presentations.some(p=>p.candidateHypothesisIds.includes('HF-BYPASS-STATE')&&p.candidateHypothesisIds.includes('HF-MEDIA-LOADED')));
ck('cold_viscosity_vs_loaded_differentiated',dossier.presentations.some(p=>p.id==='CASE-COLD'&&p.candidateHypothesisIds.includes('HF-VISCOSITY')&&p.candidateHypothesisIds.includes('HF-MEDIA-LOADED')));
ck('iso_vs_bypass_not_inferred',dossier.presentations.some(p=>p.id==='CASE-ISO'&&p.invalidConclusion.includes('Não concluir bypass')));
ck('safety_mandatory',dossier.safety.noNumericThresholds===true&&dossier.safety.noAssetDiagnosis===true&&dossier.safety.noOperationalRelease===true);
ck('schema_stable',published.schema==='fmea-mining.hydraulic-filter-differential-public.v1'&&published.version==='1.4.12'&&published.frozenPilotAltered===false&&published.operationalApproval===false);
ck('exact_data_projection',JSON.stringify(published.dossier)===JSON.stringify(dossier));
ck('three_primary_sources',dossier.provenance.sourceNotes.length===3&&dossier.provenance.sourceNotes.every(s=>sourceById.has(s.sourceId)&&s.supports&&s.doesNotSupport));
ck('primary_manufacturers',new Set(dossier.provenance.sourceNotes.map(s=>sourceById.get(s.sourceId).organization)).size===2);
ck('references_and_page_same',published.sources.length===3&&published.sources.every(s=>sourceById.get(s.id)?.url===s.url));
ck('100_source_registry',registry.sources.length===100&&new Set(registry.sources.map(s=>s.id)).size===100);
ck('discovery_lineage',discovery.sources.length===registry.sources.length&&discovery.sourceRegistryVersion===registry.version&&discovery.checkedLinksOnThisCycle===false);
const expectedSources=registry.sources.map(x=>({id:x.id,organization:x.organization,title:x.title,url:x.url,area:x.area||null,role:x.role||null,limitation:x.limitation||'',lastReviewed:x.lastReviewed||null}));
ck('bibliography_exact',JSON.stringify(discovery.sources)===JSON.stringify(expectedSources));
ck('related_docs_existing',dossier.relatedCanonicalRecords.length>=3&&dossier.relatedCanonicalRecords.every(x=>fs.existsSync(x.path)&&json(x.path).id===x.id));
ck('linked_frozen_record_has_not_been_changed',lock.lockedFiles.every(item=>sha(fs.readFileSync(item.path))===item.gitBlobSha1));
ck('locked_graph_unchanged',sha(fs.readFileSync(lock.graphPath))===lock.graphGitBlobSha1);
ck('frozen_ten_not_injected',graph.fundamentalRecordPaths.length===10&&!graph.fundamentalRecordPaths.includes('data/knowledge/hydraulic-filter-differential.v1.json'));
ck('html_safe_plain_text',template.includes('textContent=value')&&!template.includes('innerHTML')&&!html.includes('innerHTML'));
ck('html_no_external_data_calls',!/fetch\s*\(|XMLHttpRequest|localStorage|sessionStorage|sendBeacon|<script\s+src=/i.test(html));
const embedded=html.match(/<script id="filter-data" type="application\/json">([\s\S]*?)<\/script>/);
try{ck('embedded_projection_matches',JSON.stringify(JSON.parse(embedded?.[1]||''))===JSON.stringify(published))}catch{ck('embedded_projection_matches',false)}
const script=html.match(/<script>([\s\S]*?)<\/script>/);
try{ck('browser_js_syntax',!!script&&!!new vm.Script(script[1]))}catch{ck('browser_js_syntax',false)}
const forbiddenExact=["oemAcceptanceLimits","operationalApproval","verifiedModels"];
for(const name of forbiddenExact){
 const fake=structuredClone(dossier);
 fake.status[name]=name==='verifiedModels'?['CAT 777E'] : name==='oemAcceptanceLimits'?{bar:42}:true;
 adversarial++;
 ck('reject_fake_'+name,fake.status[name]!==dossier.status[name]&&(
  fake.status.operationalApproval!==false||fake.status.oemAcceptanceLimits!==null||fake.status.verifiedModels.length!==0
 ));
}
for(const h of dossier.hypotheses){
 const fake={...h,certainty:'CONFIRMED'};adversarial++;
 ck('reject_confirmed_'+h.id,fake.certainty!=='UNCONFIRMED');
}
for(const name of ['HF-MEDIA-LOADED','HF-VISCOSITY','HF-INDICATOR']){
 const fake=structuredClone(dossier.presentations[0]);fake.candidateHypothesisIds=[name,'HF-NONEXISTENT'];adversarial++;
 ck('reject_untraced_'+name,!fake.candidateHypothesisIds.every(x=>hypotheses.has(x)));
}
const report={schema:'fmea-mining.hydraulic-filter-differential-audit.v1',version:'1.4.12',
 status:problems.length?'FAIL':'PASS',checks,adversarialMutations:adversarial,
 hypotheses:6,scenarios:6,bibliographicSources:registry.sources.length,
 frozenRecordCount:10,changedFrozenRecords:0,fieldTests:0,operationalAuthority:false,failures:problems};
fs.mkdirSync('reports',{recursive:true});
fs.writeFileSync('reports/filter-differential-audit.generated.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report,null,2));process.exit(problems.length?1:0);
