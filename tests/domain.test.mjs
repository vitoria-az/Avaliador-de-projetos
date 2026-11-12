import test from 'node:test';import assert from 'node:assert/strict';
function nota(n){if(n.length!==4||n.some(x=>!Number.isInteger(x)||x<1||x>5))throw Error('invalid');return Math.round(n.reduce((s,x,i)=>s+x*[.3,.3,.25,.15][i],0)*100)/100;}
const norm=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
test('nota ponderada 4,15',()=>assert.equal(nota([4,5,4,3]),4.15));
test('rejeita ausente, decimal e fora da faixa',()=>{for(const x of [[1,2,3],[1,2,3,2.5],[0,2,3,4],[1,2,3,6]])assert.throws(()=>nota(x));});
test('busca sem acento',()=>assert.equal(norm('TRAÇO VIVO'),norm('traco vivo')));
test('modelo B: código reutilizável em outro projeto, não no mesmo',()=>{const s=new Set(),vote=(t,p)=>{const k=t+':'+p;if(s.has(k))return false;s.add(k);return true;};assert.equal(vote('X','A'),true);assert.equal(vote('X','B'),true);assert.equal(vote('X','A'),false);assert.equal(vote('Y','A'),true);});
test('desempate alfabético determinístico',()=>assert.deepEqual([{t:'Zeta',m:4},{t:'Alfa',m:4}].sort((a,b)=>b.m-a.m||a.t.localeCompare(b.t,'pt-BR')).map(x=>x.t),['Alfa','Zeta']));