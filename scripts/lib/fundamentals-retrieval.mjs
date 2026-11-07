/** Deterministic, closed-corpus discovery baseline. Never a diagnostic engine. */
export const ALIASES=Object.freeze({
  'TK-HYD-CAVITATION-001':['cavitacao','cavidades de vapor','implosao de vapor','erosao por cavitacao','pressao local de vapor'],
  'TK-HYD-AERATION-001':['aeracao','espuma','ar livre','ar entranhado','ar incorporado','bolhas no oleo','compressibilidade do fluido'],
  'TK-TRIB-ABRASION-001':['desgaste abrasivo','abrasao','abrasivo','abrasivos','desgaste de tres corpos','sulcos abrasivos','riscos de abrasao'],
  'TK-TRIB-FILM-001':['filme lubrificante','filme de oleo','espessura do filme','lubrificacao mista','lubrificacao limite','ehl','separa superficies','pelicula lubrificante'],
  'TK-FLUID-SOLIDS-001':['iso 4406','contagem de particulas','contaminacao solida','limpeza do oleo','amostragem','particulas externas','concentracao de particulas'],
  'TK-BRG-RCF-001':['fadiga de contato','spalling','subsuperficial','microtrinca','tensoes ciclicas','descascamento','microspalling']
});
const CAUTION=[/\b(?:qual|quais) (?:a |o |os |as )?(?:pressao exata|pn|numero de serie|prazo de troca|limite universal)\b/,
 /\bquantos? (?:bar|horas)\b/,/\b(?:autorize|autoriza|liberar|liberacao|troco|trocar|substituir)\b/,
 /\b(?:confirme|comprove|certifique)(?: a)? causa raiz\b/,/\blimite universal\b/,
 /\b(?:devo usar na|devo pedir)\b/];
export const normalize=query=>String(query||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^\p{L}\p{N}]+/gu,' ').replace(/\s+/g,' ').trim();
export function retrieveFundamentals(query,records){
 const q=normalize(query),byId=new Map(records.map(x=>[x.id,x]));
 if(!q)return {status:'NOT_FOUND_IN_CATALOG',hits:[],reason:'empty_query',scope:'six_fundamental_records_only'};
 if(CAUTION.some(re=>re.test(q)))return {status:'ABSTAIN_UNSUPPORTED_OPERATIONAL',hits:[],reason:'requires_asset_effectivity_procedure_or_field_evidence',scope:'six_fundamental_records_only'};
 const hits=Object.entries(ALIASES).map(([id,aliases])=>{
  const best=aliases.filter(a=>q.includes(normalize(a))).sort((a,b)=>b.length-a.length)[0];
  return best&&byId.has(id)?{id,score:normalize(best).includes(' ')?3:2,matchedPhrase:best}:null;
 }).filter(Boolean).sort((a,b)=>b.score-a.score||a.id.localeCompare(b.id));
 if(!hits.length)return {status:'NOT_FOUND_IN_CATALOG',hits:[],reason:'no_curated_keyword_match',scope:'six_fundamental_records_only'};
 const top=hits.filter(x=>x.score===hits[0].score);
 const status=top.length>1?'MULTIPLE_CONCEPTS':'FOUND_CONCEPTUAL';
 return {status,scope:'six_fundamental_records_only',hits:top.map(x=>({id:x.id,path:byId.get(x.id).__path||null,matchedPhrase:x.matchedPhrase,sourceIds:byId.get(x.id).provenance.sourceNotes.map(s=>s.sourceId)})),reason:status==='MULTIPLE_CONCEPTS'?'more_than_one_supported_mechanism':'conceptual_record_only_canonical_read_required',warning:'Closed-set lexical discovery, not an AI accuracy benchmark, root cause, OEM value, field test, SAP or operating approval.'};
}
