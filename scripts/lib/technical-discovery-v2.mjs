/**
 * Evidence-gated technical discovery v2.
 * Transparent synonym/phrase matching over ten conceptual records.
 * No embeddings, LLM inference, independent semantic understanding or field authority.
 * Keep the v1.4.4 baseline unchanged for its historical audit.
 */
const concepts=[
 {id:'TK-HYD-CAVITATION-001',phrases:['cavitacao','cavidades de vapor','vapor no fluido','bolhas de vapor','sucção de bomba','sucçao de bomba','implosao','fluido ferver','parece ferver','pedrinhas na bomba','pressao de vapor']},
 {id:'TK-HYD-AERATION-001',phrases:['aeracao','ar entranhado','ar no oleo','ar incorporado','ar livre','espuma','bolhinhas','bolhas no reservatorio','esponjoso','borbulhando','gas no reservatorio']},
 {id:'TK-TRIB-ABRASION-001',phrases:['abrasao','desgaste abrasivo','sulcos','riscos na pista','pista riscada','ranhuras','areia entre','pó abrasivo','po abrasivo','limalhas e sulcos','particulas duras riscando']},
 {id:'TK-TRIB-FILM-001',phrases:['filme lubrificante','pelicula','filme de oleo','lubrificacao mista','lubrificacao limite','ehl','metal encosta','separacao das superficies','separacao fisica','graxa presente','espessura do filme','perda de pelicula']},
 {id:'TK-FLUID-SOLIDS-001',phrases:['iso 4406','contaminacao solida','contagem de particulas','frasco de coleta','amostragem','sujeira no reservatorio','sujeira fina','detritos no oleo','oleo cheio de sujeira','particulas externas','origem dos detritos','limpeza do fluido','sujeira fina no reservatorio']},
 {id:'TK-BRG-RCF-001',phrases:['fadiga de contato','spalling','subsuperficial','descascamento','descamacao','descamação','trincas depois de ciclos','tensao repetida','tensoes ciclicas','microtrincas','material comeca a lascar','descasca a pista','pista descascando']},
 {id:'TK-HYD-PILOT-001',phrases:['pilotagem','piloto hidraulico','pressao piloto','comando piloto','solenoide de comando','intertravamento','permissivo do comando','valvula direcional sem responder','alivio piloto']},
 {id:'TK-HYD-HOLD-001',phrases:['retencao de carga','sustentacao de carga','contrabalanco','counterbalance','valvula de retencao','carga descendo','descida da carga','carga cai','carga suspensa','deriva com carga','carga desce sozinha']},
 {id:'TK-HYD-ACTUATOR-001',phrases:['atuador','cilindro hidraulico','cilindro perdendo forca','deriva do cilindro','haste desce','fuga interna','passagem interna','cilindro nao move','movimento do cilindro','pistao do cilindro','vazamento na haste']},
 {id:'TK-HYD-SENSORS-001',phrases:['sensor de pressao','instrumentacao','ecm','fmi','codigo de falha','codigo diagnostico','codigo eletronico','monitor indica','leitura do sensor','chicote','sinal do sensor','diagnostico eletronico','tensao abaixo do normal']}
];
const HARD_RISK=[
 /\b(?:posso|podemos|devo|preciso|pode)\b.{0,65}\b(?:operar|produzir|liberar|colocar|rodar|continuar|assinar|trocar|parar|comecar|substituir)\b/,
 /\b(?:autorize|autoriza|libere|liberar|liberacao|aprove|assinar a liberacao)\b/,
 /\b(?:devo parar|trocar agora|encomendar|comprar imediatamente|qual componente devo|qual peca devo|qual pn)\b/,
 /\b(?:qual|quanto|quantos|defina|informe)\b.{0,75}\b(?:pressao minima|pressao maxima|torque|limite de pressao|valor de ajuste|numero de serie|prazo de troca|bar|psi|rpm)\b/,
 /\b(?:040[ -]?\d{3}|777e?|6030|395|dr410i)\b.{0,85}\b(?:pressao|minimo|torque|aceitavel|trocar|liberar)\b/,
 /\b(?:causa raiz confirmada|confirme a causa|diagnostico definitivo|garanta que e)\b/,
 /\b(?:como burlar|como contornar|desativar intertravamento|desligar protecao|pontear sensor)\b/
];
const STOP=new Set('de da do das dos a as o os um uma uns umas na no nas nos em para por como com qual quais que e ou se mais entre depois antes quando onde sobre sem quanto isso este essa minha meu nao ainda ja mesmo bem pode poderia ocorre explica'.split(' '));
export function normalizeTechnical(q){
 return String(q??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').replace(/\s+/g,' ').trim();
}
function hasPhrase(haystack,needle){const n=normalizeTechnical(needle);return n.length>0&&(' '+haystack+' ').includes(' '+n+' ')}
function tokenSet(text){return new Set(normalizeTechnical(text).split(' ').filter(t=>t.length>=4&&!STOP.has(t)))}
function scoreConcept(q,record,signature){
 // Curated synonyms are distinct from manufacturer evidence. Generic title overlap alone is insufficient.
 let sum=0,matched=[];
 for(const p of signature.phrases)if(hasPhrase(q,p)){const tokens=normalizeTechnical(p).split(' ').length;const weight=tokens>=3?5:tokens===2?4:3;sum+=weight;matched.push(p)}
 const queryTokens=tokenSet(q),titleTokens=tokenSet(record.title+' '+record.titleEn);
 let titleHits=0;for(const t of titleTokens)if(queryTokens.has(t))titleHits++;
 const score=sum+(sum>0?Math.min(titleHits,2):0);
 return {score,matched};
}
function hitFor(record,score,matched){
 return {id:record.id,path:record.__path||null,title:record.title,score,matchedPhrases:matched.slice(0,5),sourceIds:record.provenance.sourceNotes.map(x=>x.sourceId),
 evidenceClass:record.evidenceClass,reviewStatus:record.reviewStatus};
}
export function discoverTechnical(query,records){
 const q=normalizeTechnical(query);
 const fixed={scope:'ten_conceptual_records_only',engine:'transparent_lexical_concept_v2_not_LLM',warning:'Conceptual retrieval only, no OEM machine-specific values, approved tests, real diagnosis, operating release or SAP actions.'};
 if(!q)return {...fixed,status:'NOT_FOUND_IN_CATALOG',reason:'empty_query',hits:[]};
 if(HARD_RISK.some(rx=>rx.test(q)))return {...fixed,status:'ABSTAIN_UNSUPPORTED_OPERATIONAL',reason:'requires_asset_identification_OEM_procedure_and_risk_approval',hits:[]};
 const map=new Map(records.map(x=>[x.id,x]));
 const scored=concepts.map(c=>{const record=map.get(c.id);if(!record)return null;const result=scoreConcept(q,record,c);return {...result,id:c.id,record}}).filter(x=>x&&x.score>=3).sort((a,b)=>b.score-a.score||a.id.localeCompare(b.id));
 if(!scored.length)return {...fixed,status:'NOT_FOUND_IN_CATALOG',reason:'no_supported_concept_signature_in_this_subset',hits:[]};
 // Preserve multiple alternatives when evidence refers to more than one mechanism.
 const first=scored[0].score,keep=scored.filter(x=>x.score>=Math.max(3,first*0.58)).slice(0,4);
 const hits=keep.map(x=>hitFor(x.record,x.score,x.matched));
 return {...fixed,status:hits.length>1?'MULTIPLE_CONCEPTS':'FOUND_CONCEPTUAL',reason:hits.length>1?'possible_competing_mechanisms_not_confirmed':'candidate_technical_reference_not_diagnosis',hits};
}
export const conceptualRecordIds=Object.freeze(concepts.map(x=>x.id));
