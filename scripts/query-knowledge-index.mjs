#!/usr/bin/env node
/** Local read-only index lookup. For technical answers open every canonical file. */
import fs from 'node:fs';
const args=process.argv.slice(2),get=k=>{const at=args.indexOf(k);return at<0?null:args[at+1]??null;};
const normalize=s=>String(s??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
if(args.includes('--help')){console.log('Usage: node scripts/query-knowledge-index.mjs --query "cavitacao" [--domain "Hidráulica"] [--evidence CONCEPTUAL]');process.exit(0)}
const search=get('--query')??args.filter(s=>!s.startsWith('--'))[0]??'';
const domain=get('--domain'),evidence=get('--evidence');
const data=JSON.parse(fs.readFileSync('data/catalog/knowledge-index.v1.json','utf8'));
const matches=data.items.filter(x=>(!domain||normalize(x.domain)===normalize(domain))&&(!evidence||x.evidenceClass===evidence)&&(!search||normalize([x.title,x.summary,x.system,x.domain,x.kind,...x.keywords].join(' ')).includes(normalize(search))));
const out={schema:'fmea-mining.knowledge-index-query.v1',indexVersion:data.version,query:search,discoveryOnly:true,canonicalReadRequired:true,results:matches.map(({id,title,path,evidenceClass,domain,summary})=>({id,title,path,evidenceClass,domain,summary})),status:matches.length?'FOUND_IN_SELECTED_INDEX':'NOT_FOUND_IN_CATALOG',warning:'Index is curated and incomplete; never infer operating limits, validated root causes or SAP release from summaries.'};
console.log(JSON.stringify(out,null,2));
