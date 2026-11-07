#!/usr/bin/env node
/** Validate a conceptual graph as links to existing evidence, not OEM machine authority. */
import fs from 'node:fs';
import vm from 'node:vm';
const read=p=>fs.readFileSync(p,'utf8'),json=p=>JSON.parse(read(p));
const graph=json('data/knowledge/functional-architecture.v1.json');
const source=json('data/research/sources.v1.json');
const ontology=json('data/ontology/concepts.v1.json');
const old=json('data/quality/hydraulic-circuit-differential.v1.json');
const foundation=new Map(graph.fundamentalRecordPaths.map(p=>{const x=json(p);return [x.id,{...x,path:p}]}));
const bibliography=new Set(source.sources.map(x=>x.id));
const mechanisms=new Set(ontology.mechanismFamilies.map(x=>x.id));
const errors=[],checks=[];const test=(name,yes)=>{checks.push(name);if(!yes)errors.push(name)};
test('graph_contract',graph.schema==='fmea-mining.functional-architecture.v1'&&graph.version==='1.4.6');
test('public_no_authority',graph.nature==='public_conceptual_system_graph_not_machine_configuration'&&graph.claimPolicy.noSerialVerification===true&&graph.claimPolicy.realAssetsObserved===0&&graph.claimPolicy.performedTests===0&&graph.claimPolicy.operationalApprovals===0&&graph.claimPolicy.sapMappingsApproved===0&&graph.claimPolicy.edgesConditional===true);
test('systems_count',graph.systems.length===2&&new Set(graph.systems.map(s=>s.id)).size===2);
test('foundation_count',foundation.size===10);
test('all_articles_conceptual', [...foundation.values()].every(r=>r.evidenceClass==='CONCEPTUAL'&&r.reviewStatus==='PENDING_REVIEW'&&r.operationalApproval===false&&r.sapMappingApproved===false));
let components=0,edges=0,unlinked=0;const ids=new Set();
for(const s of graph.systems){
 test(s.id+'_scope',s.architectureVerified===false&&s.verifiedModels.length===0&&s.verifiedSerials.length===0&&s.scope.length>45);
 const locals=new Map(s.components.map(c=>[c.id,c]));
 test(s.id+'_unique_components',locals.size===s.components.length);
 for(const c of s.components){
  components++;
  test(c.id+'_global_unique',!ids.has(c.id));ids.add(c.id);
  test(c.id+'_field_not_verified',c.verifiedOnAsset===false&&c.oemSerialApplicable===null);
  test(c.id+'_functional_chain',typeof c.requiredFunction==='string'&&c.requiredFunction.length>30&&c.potentialFunctionalEffect.length>40&&c.evidenceQuestions.length>=2);
  test(c.id+'_ontology_fk',c.mechanismConceptIds.length>0&&c.mechanismConceptIds.every(id=>mechanisms.has(id)));
  test(c.id+'_article_fk',c.knowledgeRecordIds.every(id=>foundation.has(id)));
  test(c.id+'_source_fk',c.sourceIds.length>0&&c.sourceIds.every(id=>bibliography.has(id)));
  if(!c.knowledgeRecordIds.length)unlinked++;
 }
 for(const e of s.edges){
  edges++;
  test(s.id+'_edge_fk_'+edges,locals.has(e.from)&&locals.has(e.to)&&e.from!==e.to&&e.conditional===true&&e.flowConfirmed===false);
 }
}
const h=graph.systems.find(s=>s.id==='SYS-HYD-IMPLEMENT');
test('hydraulic_topology_copied',!!h&&h.origin.path==='data/quality/hydraulic-circuit-differential.v1.json'&&old.genericCircuitGraph.status==='illustrative_not_machine_specific');
test('hydraulic_nodes_identical',!!h&&JSON.stringify(h.components.map(x=>x.id))===JSON.stringify(old.genericCircuitGraph.nodes.map(x=>x.id)));
test('hydraulic_edges_identical',!!h&&h.edges.length===old.genericCircuitGraph.edges.length&&h.edges.every((e,i)=>{const o=old.genericCircuitGraph.edges[i];return e.from===o.from&&e.to===o.to&&e.relationship===o.relationship&&e.conditional===o.conditional}));
test('bearing_origin_synthesis',graph.systems.find(s=>s.id==='SYS-BRG-LUBE')?.origin.status==='original_conceptual_synthesis_not_manufacturer_machine_schematic');
test('expected_graph_size',components===13&&edges===15);
test('all_hydraulic_nodes_linked',!!h&&h.components.every(c=>c.knowledgeRecordIds.length>0));
const view=json('reports/functional-architecture.generated.json');
test('view_parity',view.ready===true&&JSON.stringify(view.systems)===JSON.stringify(graph.systems)&&view.fundamentals.length===10);
test('sources_in_generated_view',view.sources.length===new Set(graph.systems.flatMap(s=>s.components.flatMap(c=>c.sourceIds))).size);
const html=read('reports/arquitetura-funcional.generated.html'),template=read('docs/arquitetura-funcional.html');
test('template_empty',template.includes('FUNCTIONAL_PLACEHOLDER')&&template.includes('"ready":false'));
const embed=html.match(/<script id="graph-data" type="application\/json">([\s\S]*?)<\/script>/);
try{test('html_json_parity',!!embed&&JSON.stringify(JSON.parse(embed[1]))===JSON.stringify(view))}catch{test('html_json_parity',false)}
const script=html.match(/<script>([\s\S]*?)<\/script>/);
try{test('html_js_syntax',!!script&&!!new vm.Script(script[1]))}catch{test('html_js_syntax',false)}
test('no_browser_network_or_persistence',!/fetch\s*\(|XMLHttpRequest|localStorage|sessionStorage|sendBeacon|<script\s+src=/i.test(html));
test('safe_dom_rendering',html.includes('textContent=value')&&!html.includes('innerHTML'));
test('no_numeric_oem_thresholds',![...graph.systems].some(s=>s.components.some(c=>/bar\b|psi\b|kpa\b|mbar\b|rpm\b/i.test(c.potentialFunctionalEffect))));
const report={schema:'fmea-mining.functional-architecture-audit.v1',version:'1.4.6',status:errors.length?'FAIL':'PASS',systems:graph.systems.length,components,conditionalConnections:edges,componentsWithoutFundamentalArticle:unlinked,sourceRegistryCount:source.sources.length,checks:checks.length,operationalApprovals:0,errors};
fs.mkdirSync('reports',{recursive:true});fs.writeFileSync('reports/functional-architecture-audit.generated.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report,null,2));process.exit(errors.length?1:0);
