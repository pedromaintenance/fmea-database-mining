#!/usr/bin/env node
// Adaptador seguro para prototipos: nao inclui hipotese, causa, dano nem gabarito.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const p=JSON.parse(fs.readFileSync(path.join(root,'data/knowledge/diagnostic/playbooks.v1.json'),'utf8'));
const records=p.records.map(x=>({
 id:x.id,title:x.title,modelIds:x.target.modelIds,
 report:x.reportedSymptom.text,
 operatingContext:x.reportedSymptom.operatingContext,
 availableInvestigations:x.tests.map(t=>({id:t.id,method:t.method,question:t.question})),
 teachingStatus:'prototipo_sem_caso_resolvido',
 evidenceStatus:'sem_resultado_observado'
}));
const obj={schema:'porcaria.diagnostic-preview.v1',version:'1.2.1',
 warning:'Roteiros ainda sem curadoria OEM. Nao sao casos completos do jogo.',
 records};
const target=path.join(root,'data/knowledge/diagnostic/generated-player-preview.json');
fs.writeFileSync(target,JSON.stringify(obj,null,2)+'\n');
const secret=['hypotheses','causeId','damageId','componentCode','expectedSigns','counterSigns','possibleOutcomes','correctRepair','answerKey'];
const raw=fs.readFileSync(target,'utf8');
for(const k of secret)if(raw.includes('"'+k+'"'))throw Error('Resposta indevidamente exportada: '+k);
console.log(JSON.stringify({safePreviewCases:records.length,leakedAnswerKeys:0},null,2));
