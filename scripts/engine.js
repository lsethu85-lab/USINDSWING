const fs=require('fs');const H=fs.readFileSync('index.html','utf8');
const src=H.match(/<script>([\s\S]*)<\/script>/)[1].replace(/R\(\);if\(S[\s\S]*$/,'');
global.document={querySelector:()=>({})};global.localStorage={getItem:()=>null,setItem(){}};global.fetch=()=>Promise.reject(1);
const E=new Function(src+';return{S,U,FD,analyze,regime,step,autoAdd}')();
const file='paper-trades.json';let st={};try{st=JSON.parse(fs.readFileSync(file,'utf8'))}catch(e){}
if(st.set)Object.assign(E.S.set,st.set,{gh:E.S.set.gh});E.S.pos=st.pos||[];
for(const mk of ['IND','US']){let F;try{F=JSON.parse(fs.readFileSync('data/'+mk+'.json','utf8'))}catch(e){console.log('no data for',mk);continue}
 E.FD[mk]=F;const reg=E.regime(F.i),list=[];let tot=0,up=0;
 for(const s of E.U[mk].list){const D=F.s[s];if(!D)continue;const a=E.analyze(D,mk,F.i,D.f);if(a){tot++;if(a.above)up++;if(!a.none)list.push({...a,sym:s,ys:s+E.U[mk].sfx})}}
 list.sort((x,y)=>y.score-x.score);E.S.picks[mk]={list,at:Date.now(),breadth:tot?Math.round(up/tot*100):null,fails:[],tot,reg};
 for(const p of E.S.pos.filter(p=>p.mk==mk&&(p.st=='OPEN'||p.st=='PENDING'))){const D=F.s[p.sym];if(!D)continue;const n=D.c.length;
  const bars=D.d?D.c.slice(-10).map((_,k)=>{const i=n-10+k;return{d:D.d[i],h:D.h[i],l:D.l[i],c:D.c[i]}}):[];E.step(p,{px:D.last,bars});p.u=Date.now()}
 const add=E.autoAdd(mk,list,reg,tot);console.log(mk,'regime',reg,list.length,'picks',add,'auto-added');}
fs.writeFileSync(file,JSON.stringify({saved:Date.now(),by:'action',pos:E.S.pos,set:{...E.S.set,gh:undefined},del:st.del||[]},null,1));
process.exit(0);
