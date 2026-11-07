const fs=require('fs');const H=fs.readFileSync('index.html','utf8');
const src=H.match(/<script>([\s\S]*)<\/script>/)[1].replace(/R\(\);if\(S[\s\S]*$/,'');
global.document={querySelector:()=>({})};global.localStorage={getItem:()=>null,setItem(){}};global.fetch=()=>Promise.reject(1);
const E=new Function(src+';return{S,U,analyze,regime,evalBar,exit}')();
const stat=a=>{const w=a.filter(x=>x>0),l=a.filter(x=>x<=0),sw=w.reduce((s,x)=>s+x,0),sl=-l.reduce((s,x)=>s+x,0),t=a.reduce((s,x)=>s+x,0);return{n:a.length,win:a.length?+(100*w.length/a.length).toFixed(1):0,avgR:a.length?+(t/a.length).toFixed(2):0,pf:sl?+(sw/sl).toFixed(2):null,totR:+t.toFixed(1)}};
function sim(pk,B,t,mk){const n=B.c.length,p={mk,entry:pk.entry,sl:pk.sl,sl0:pk.sl,t1:pk.t1,t2:pk.t2,qty:100,rem:100,real:0,atr:pk.atr,hh:pk.entry,stage:0,t1h:0,sess:0,st:'OPEN',log:[],fb:pk.type!='Swing Pullback'&&pk.type!='Range Bounce'};let j=t+1,k=0;
 if(pk.entry>pk.P*1.001){let ok=0;for(;j<=t+10&&j<n;j++){if(B.l[j]<=pk.sl)return null;if(B.h[j]>=pk.entry){ok=1;j++;break}}if(!ok)return null}
 for(;j<n;j++){if(E.evalBar(p,B.h[j],B.l[j],B.c[j],1))break;p.sess++;k++;
  if(p.fb&&p.stage<1&&p.sess<=3&&B.c[j]<p.entry*0.995){E.exit(p,B.c[j],'f');break}
  if(p.sess>=10&&p.stage<1&&B.c[j]<p.entry+0.3*(p.entry-p.sl0)){E.exit(p,B.c[j],'s');break}
  if(k>=30){E.exit(p,B.c[j],'t');break}}
 return p.st=='OPEN'?null:{r:p.real/(100*(pk.entry-pk.sl)),end:j}}
const out={t:Date.now(),bt:1};
for(const mk of ['IND','US']){let F;try{F=JSON.parse(fs.readFileSync('hist/'+mk+'.json','utf8'))}catch(e){continue}
 const ix=F.i,pos={};ix.d.forEach((d,i)=>pos[d]=i);const rows=[];
 for(const s of E.U[mk].list){const D=F.s[s];if(!D)continue;const n=D.c.length;let free=0;
  for(let t=200;t<n-12;t++){if(t<free)continue;const q=pos[D.d[t]];if(q===undefined)continue;const a0=Math.max(0,t-259),B={c:D.c.slice(a0,t+1),h:D.h.slice(a0,t+1),l:D.l.slice(a0,t+1),v:D.v.slice(a0,t+1)};B.last=B.c[B.c.length-1];
   const I=ix.c.slice(Math.max(0,q-259),q+1),a=E.analyze(B,mk,I,null);if(!a||a.none||a.score<55)continue;
   const r=sim(a,D,t,mk);if(!r)continue;free=r.end;rows.push({y:D.d[t],type:a.type,score:a.score,reg:E.regime(I),r:r.r})}}
 const g=f=>stat(rows.filter(f).map(x=>x.r)),cfg=x=>x.score>=60+(x.reg=='Cautious'?5:0)&&(x.reg!='Weak'||x.type=='Accumulation Base');
 const o=out[mk]={n:rows.length,all:g(()=>1),cfg:g(cfg),type:{},band:{},reg:{}};
 [...new Set(rows.map(x=>x.type))].forEach(t=>o.type[t]=g(x=>x.type==t));
 [['55-64',55,65],['65-74',65,75],['75+',75,999]].forEach(b=>o.band[b[0]]=g(x=>x.score>=b[1]&&x.score<b[2]));
 ['Bullish','Cautious','Weak'].forEach(r=>o.reg[r]=g(x=>x.reg==r));
 let c=0,pk=0,dd=0;rows.filter(cfg).sort((a,b)=>a.y<b.y?-1:1).forEach(x=>{c+=x.r;pk=Math.max(pk,c);dd=Math.min(dd,c-pk)});o.mdd=+dd.toFixed(1);console.log(mk,rows.length,'signals')}
fs.mkdirSync('data',{recursive:true});fs.writeFileSync('data/backtest.json',JSON.stringify(out));process.exit(0);
