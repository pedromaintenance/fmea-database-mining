#!/usr/bin/env node
/** Confirm discovery artifacts are faithful to their actual, versioned originals. */
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
const read=p=>fs.readFileSync(path.join(process.cwd(),p),'utf8'),json=p=>JSON.parse(read(p));
const terms=json('data/catalog/technical-glossary.v1.json');
const sources=json('data/catalog/source-discovery.v1.json');
const inventory=json('data/catalog/repository-inventory-snapshot.v1.json');
const ontology=json('data/ontology/concepts.v1.json');
const registry=json('data/research/sources.v1.json');
const expectedGroups=[['functionalFailures','Falha funcional'],['symptoms','Sintoma'],['mechanismFamilies','Mecanismo'],['evidenceMethods','Método de evidência'],['evidenceOutcomes','Resultado de evidência']];
const errors=[];let tests=0;function check(id,ok){tests++;if(!ok)errors.push(id)}
check('glossary_version',terms.schema==='fmea-mining.technical-glossary.v1'&&terms.version==='1.4.1'&&terms.safeForOperation===false);
check('ontology_version',terms.sourceOntologyVersion===ontology.version&&terms.sourceOntologyPath==='data/ontology/concepts.v1.json');
const expected=expectedGroups.flatMap(([group,category])=>ontology[group].map(x=>({id:x.id,category,pt:x.pt,en:x.en,criteria:x.criteria,ontologyPath:'data/ontology/concepts.v1.json',ontologyField:group,reviewStatus:'legacy_controlled_vocabulary_pending_family_review'})));
check('exact_glossary_lineage',JSON.stringify(terms.terms)===JSON.stringify(expected));
check('67_terms',terms.terms.length===67&&new Set(terms.terms.map(x=>x.id)).size===67);
check('methodological_refs',JSON.stringify(terms.sourceReferenceIds)===JSON.stringify(ontology.references));
check('bibliography_version',sources.schema==='fmea-mining.source-discovery.v1'&&sources.canonicalPath==='data/research/sources.v1.json'&&sources.sourceRegistryVersion===registry.version&&sources.checkedLinksOnThisCycle===false);
const expectedSources=registry.sources.map(x=>({id:x.id,organization:x.organization,title:x.title,url:x.url,area:x.area||null,role:x.role||null,limitation:x.limitation||'',lastReviewed:x.lastReviewed||null}));
check('exact_bibliography_lineage',JSON.stringify(sources.sources)===JSON.stringify(expectedSources));
check('87_sources',sources.sources.length===87&&new Set(sources.sources.map(x=>x.id)).size===87);
check('rights_marker',sources.rights===registry.rights);
check('inventory_snapshot',inventory.schema==='fmea-mining.repository-inventory-snapshot.v1'&&inventory.version==='1.4.1'&&inventory.totalFiles===500&&inventory.sourceCommit==='73dfc97b98230a8ff92c3db104c5607fe9d26e42');
check('inventory_unique',new Set(inventory.files.map(x=>x.path)).size===500);
check('inventory_no_traversal',inventory.files.every(x=>typeof x.path==='string'&&!x.path.startsWith('/')&&!x.path.includes('..')));
check('inventory_existing',inventory.files.every(x=>fs.existsSync(x.path)&&fs.statSync(x.path).isFile()));
check('inventory_distribution',Object.values(inventory.countsByGroup).reduce((a,b)=>a+b,0)===500&&Object.entries(inventory.countsByGroup).every(([g,n])=>inventory.files.filter(x=>x.group===g).length===n));
const pages=[
 ['docs/glossario-tecnico.html',terms,'terms'],
 ['docs/fontes-tecnicas.html',sources,'sources'],
 ['docs/inventario-acervo.html',inventory,'files']
];
for(const [p,source,key] of pages){
 const html=read(p);
 const match=html.match(/<script id="library-data" type="application\/json">([\s\S]*?)<\/script>/);
 check('embedded_'+key,!!match&&JSON.stringify(JSON.parse(match[1]))===JSON.stringify(source));
 check('offline_'+key,!/fetch\s*\(|XMLHttpRequest|localStorage|sessionStorage|sendBeacon|<script\s+src=/i.test(html));
 check('search_'+key,html.includes('id="q"')&&html.includes('id="filter"')&&html.includes("aria-live"));
 const scripts=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m=>m[1]).filter(Boolean);
 try{check('syntax_'+key,scripts.length===1&&!!new vm.Script(scripts[0],{filename:p}))}catch{check('syntax_'+key,false)}
}
const landing=read('docs/biblioteca-tecnica.html'),workflow=read('.github/workflows/deploy-library-pages.yml');
check('landing_links',pages.every(([p])=>landing.includes('./'+path.basename(p))));
check('pages_deploy',pages.every(([p])=>workflow.includes('cp '+p+' _site/')));
check('pages_json', ['technical-glossary.v1.json','source-discovery.v1.json','repository-inventory-snapshot.v1.json'].every(file=>workflow.includes('_site/'+file)));
const report={schema:'fmea-mining.knowledge-discovery-audit.v1',version:'1.4.1',status:errors.length?'FAIL':'PASS',tests,glossaryTerms:terms.terms.length,bibliographyReferences:sources.sources.length,snapshotFiles:inventory.files.length,expertReviewClaims:0,oemSerialApprovals:0,sapMappingsApproved:0,errors};
fs.mkdirSync('reports',{recursive:true});fs.writeFileSync('reports/knowledge-discovery.generated.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));process.exit(errors.length?1:0);
