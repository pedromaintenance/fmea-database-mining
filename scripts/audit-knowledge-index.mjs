#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
const root=process.cwd(),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const data=JSON.parse(read('data/catalog/knowledge-index.v1.json'));
const html=read('docs/biblioteca-tecnica.html');
const errors=[],ck=(condition,message)=>{if(!condition)errors.push(message);};
ck(data.schema==='fmea-mining.knowledge-index.v1'&&data.version==='1.4.2','index_version');
ck(data.nature==='navigation_metadata_not_canonical_technical_evidence'&&data.scope==='selected_existing_public_artifacts_not_complete_inventory','index_scope');
ck(data.statuses.validatedRealAssetEvidence===0&&data.statuses.approvedOemSerials===0&&data.statuses.operationalReleases===0&&data.statuses.sapMappingsApproved===0,'no_fake_approvals');
ck(data.repository==='pedromaintenance/fmea-database-mining','repository_identity');
ck(Array.isArray(data.items)&&data.items.length>=10,'index_minimum');
const ids=new Set(),paths=new Set(),states=new Set(['PUBLIC_REFERENCE','CONCEPTUAL','PUBLIC_PRODUCT_VARIANT','SYNTHETIC','PENDING_REVIEW','PRIVATE_EVIDENCE_REQUIRED']);
for(const [i,x] of (data.items||[]).entries()){
 ck(x&&Object.keys(x).sort().join('|')==='domain|evidenceClass|id|keywords|kind|path|summary|system|title','record_keys_'+i);
 if(!x||typeof x!=='object')continue;
 ck(typeof x.id==='string'&&/^LIB-[A-Z0-9-]+$/.test(x.id)&&!ids.has(x.id),'unique_id_'+i);ids.add(x.id);
 ck(states.has(x.evidenceClass),'evidence_class_'+i);
 ck(typeof x.title==='string'&&x.title.length>=12&&typeof x.summary==='string'&&x.summary.length>=40,'editorial_quality_'+i);
 ck(Array.isArray(x.keywords)&&x.keywords.length>=2&&x.keywords.every(t=>typeof t==='string'&&t.length>1),'keywords_'+i);
 ck(typeof x.path==='string'&&!x.path.startsWith('/')&&!x.path.includes('..')&&/^(docs|data)\//.test(x.path),'safe_path_'+i);
 ck(!paths.has(x.path),'duplicate_path_'+i);paths.add(x.path);
 if(typeof x.path==='string'&&/^(docs|data)\//.test(x.path))ck(fs.existsSync(path.join(root,x.path)),'missing_file_'+x.path);
}
const match=html.match(/<script id="knowledge-index" type="application\/json">([\s\S]*?)<\/script>/);
ck(!!match,'offline_manifest_present');
try{if(match)ck(JSON.stringify(JSON.parse(match[1]))===JSON.stringify(data),'embedded_index_parity')}catch{errors.push('invalid_embedded_json')}
ck(/id="q"/.test(html)&&/id="domain"/.test(html)&&/id="evidence"/.test(html),'search_filters_present');
ck(!/<script[^>]+src=|\bfetch\s*\(|XMLHttpRequest|localStorage|sessionStorage|sendBeacon|navigator\.geolocation/i.test(html),'no_network_or_tracking');
ck(html.includes('Índice inicial curado')&&html.includes('offline')&&html.includes('não representam dados de confiabilidade'),'scope_and_safety_disclaimer');
const agents=read('AGENTS.md'),skill=read('skills/consultar-acervo-manutencao/SKILL.md');
ck(agents.includes('NOT_FOUND_IN_CATALOG')&&agents.includes('npm run qa'),'agents_routing');
ck(skill.startsWith('---\nname: consultar-acervo-manutencao\ndescription:')&&skill.includes('NOT_FOUND_IN_CATALOG'),'skill_frontmatter_and_refusal');
const report={schema:'fmea-mining.knowledge-index-audit.v1',version:'1.4.0',status:errors.length?'FAIL':'PASS',indexedAssets:ids.size,existingPathsValidated:paths.size,sourceRegistryCount:JSON.parse(read('data/research/sources.v1.json')).sources.length,safetyClaims:{oemApprovals:0,sapApproved:0,operatingRelease:0},errors};
fs.mkdirSync('reports',{recursive:true});fs.writeFileSync('reports/knowledge-index.generated.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report,null,2));process.exit(errors.length?1:0);
