#!/usr/bin/env node
/** Reproducible read-only scan of public structured repository knowledge. */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root=process.cwd();
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const registry=JSON.parse(read('data/research/sources.v1.json'));
const bibliography=new Set(registry.sources.map(x=>x.id));
const roots=['data/knowledge','data/quality','data/ontology','data/research','data/governance','data/catalog','data/cases'];
const files=[];
function walk(dir){
 if(!fs.existsSync(path.join(root,dir)))return;
 for(const de of fs.readdirSync(path.join(root,dir),{withFileTypes:true})){
  const p=path.posix.join(dir,de.name);
  if(de.isDirectory()){walk(p);continue;}
  if(de.isFile()&&p.endsWith('.json')&&!p.includes('.generated.')&&!p.endsWith('/semantic-atlas.v1.json'))files.push(p);
 }
}
roots.forEach(walk);files.sort();
const topics=[
 ['hydraulics',/hydraul|cylinder|pump|hose|inlet|valve|circuit/i],
 ['tribology_and_fluids',/oil|fluid|lube|wear|tribolog|filter|bearing|gear|grease|fdao/i],
 ['powertrain',/drive|differential|transmission|torque|axle|final/i],
 ['engine_and_cooling',/engine|cooling|radiator|thermostat|exhaust|diesel|fuel/i],
 ['undercarriage_tires',/track|idler|under|tire|tyre|cts|shoe/i],
 ['drilling_compressed_air',/drill|rotary|feed|compressor|air/i],
 ['electrical_controls',/electric|electronic|fault.code|fmi|can|sensor|control/i],
 ['maintenance_reliability',/maint|reliab|pm-|sap|rcm|fmea|evidence|metric|inspection/i]
];
function topic(p){
 for(const [label,re] of topics)if(re.test(p))return label;
 return 'not_assigned_by_filename';
}
function profile(p,d){
 const nature=String(d.nature||d.status||'').toLowerCase();
 if(p.includes('/cases/')||/synthetic|simulation|simulad|scenario|didact/.test(nature))return 'synthetic_or_didactic';
 if(p.includes('/research/'))return 'bibliographic_registry';
 if(p.includes('/ontology/'))return 'ontology';
 if(p.includes('/governance/'))return 'governance_or_evidence_gate';
 if(d.schema==='fmea-mining.technical-knowledge-record.v1'||d.schema==='fmea-mining.technical-knowledge-record.v2')return 'technical_foundation_draft';
 if(p.includes('/quality/'))return 'quality_or_diagnostic_model';
 if(p.includes('/knowledge/'))return 'knowledge_dataset';
 return 'catalog_or_other';
}
function declaredRefs(obj){
 const refs=new Set(),seen=new Set();
 function walkNode(n,depth){
  if(depth>16||n===null||typeof n!=='object'||seen.has(n))return;
  seen.add(n);
  if(Array.isArray(n)){for(const x of n)walkNode(x,depth+1);return;}
  for(const [k,v] of Object.entries(n)){
   if((k==='sourceIds'||k==='sourceCatalogIds'||k==='sourceReferenceIds')&&Array.isArray(v)){
    for(const ref of v)if(typeof ref==='string')refs.add(ref);
   }else if(k==='sourceId'&&typeof v==='string')refs.add(v);
   walkNode(v,depth+1);
  }
 }
 walkNode(obj,0);return [...refs].sort();
}
const fingerprints=new Map(),assets=[],parseProblems=[];
for(const p of files){
 const bytes=fs.readFileSync(path.join(root,p)),size=bytes.length;
 const digest=crypto.createHash('sha256').update(bytes).digest('hex');
 if(!fingerprints.has(digest))fingerprints.set(digest,[]);fingerprints.get(digest).push(p);
 let d;
 try{d=JSON.parse(bytes.toString('utf8'));}
 catch(err){parseProblems.push({path:p,reason:'invalid_json'});continue;}
 const isObj=d!==null&&typeof d==='object'&&!Array.isArray(d);
 const links=declaredRefs(d);
 const linked=links.filter(x=>bibliography.has(x));
 const unresolved=links.filter(x=>!bibliography.has(x));
 const primary=isObj?['records','entries','sources','items','terms','rules','cases','observations','chapters'].find(k=>Array.isArray(d[k])):null;
 const kind=profile(p,isObj?d:{});
 assets.push({
  path:p,
  title:(isObj&&typeof d.title==='string'?d.title:path.basename(p,'.json').replace(/[-_.]/g,' ')).slice(0,180),
  schema:isObj&&typeof d.schema==='string'?d.schema:null,
  documentVersion:isObj&&typeof d.version==='string'?d.version:isObj&&typeof d.recordVersion==='string'?d.recordVersion:null,
  declaredNature:isObj&&typeof d.nature==='string'?d.nature:null,
  declaredStatus:isObj&&typeof d.status==='string'?d.status:null,
  profile:kind,
  topicHint:topic(p),
  topicMethod:'filename_heuristic_not_engineering_classification',
  primaryCollection:primary,
  primaryRecordCount:primary?d[primary].length:null,
  explicitSourceIds:links,
  sourceIdsResolvedInRegistry:linked,
  sourceIdsNotInRegistry:unresolved,
  sourceLinkMeaning:'discovery_only_not_source_verification',
  bytes:size,
  sha256:digest,
  independentTechnicalApproval:false
 });
}
const exactDuplicates=[...fingerprints.values()].filter(x=>x.length>1);
const categoryCounts={};const topicCounts={};
for(const a of assets){
 categoryCounts[a.profile]=(categoryCounts[a.profile]||0)+1;
 topicCounts[a.topicHint]=(topicCounts[a.topicHint]||0)+1;
}
const index={
 schema:'fmea-mining.semantic-atlas.v1',version:'1.4.2',
 nature:'automatic_structural_discovery_not_semantic_validation',
 scope:'public_data_json_files_only',
 sourcePathPrefix:'data/',
 methodology:'path_hints_and_declared_json_metadata; sourceIds links checked against existing registry, not original manufacturer documents',
 limitations:[
  'No claim that this is a complete ontology or a validated semantic understanding of each file',
  'Filename category may be wrong; open canonical dataset and verify source before making engineering claims',
  'Absent sourceIds can mean missing or inapplicable metadata; cannot automatically declare an orphan or invalid record',
  'Missing registry links are review leads, not proof that an assertion is false',
  'Hash-equal files are exact-byte duplicates only; different texts may still duplicate ideas',
  'No machine serial effectivity, test results, source license revalidation, SAP approval or operational release'
 ],
 summary:{
  totalFilesDiscovered:files.length,parsedDatasetCount:assets.length,invalidJsonCount:parseProblems.length,
  filesWithExplicitSourceIds:assets.filter(x=>x.explicitSourceIds.length>0).length,
  filesWithUnresolvedSourceIds:assets.filter(x=>x.sourceIdsNotInRegistry.length>0).length,
  exactDuplicateGroups:exactDuplicates.length,
  countsByProfile:categoryCounts,countsByTopicHint:topicCounts
 },
 invalidJsonFiles:parseProblems,
 exactDuplicateGroups:exactDuplicates,
 assets
};
fs.mkdirSync('reports',{recursive:true});
fs.writeFileSync('reports/semantic-atlas.generated.json',JSON.stringify(index,null,2)+'\n');
const tpl=read('docs/mapa-semantico.html');
const marker='{"schema":"ATLAS_PLACEHOLDER","ready":false}';
if(!tpl.includes(marker))throw Error('template_marker_missing');
const safe=JSON.stringify({...index,ready:true}).replace(/</g,'\\u003c');
const html=tpl.replace(marker,safe);
fs.writeFileSync('reports/mapa-semantico.generated.html',html);
console.log(JSON.stringify({schema:index.schema,version:index.version,summary:index.summary,output:['reports/semantic-atlas.generated.json','reports/mapa-semantico.generated.html']},null,2));
if(index.invalidJsonFiles.length)process.exitCode=1;
