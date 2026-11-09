// Runs in GitHub Actions (Node 20). Reuses the engine inside index.html so rules never diverge.
import fs from 'fs';import vm from 'vm';
const html=fs.readFileSync('index.html','utf8');
const js=html.match(/<script>([\s\S]*)<\/script>/)[1].split('/* ---------- views ---------- */')[0];
fs.mkdirSync('data',{recursive:true});
const store={swing_v1:fs.existsSync('data/state.json')?fs.readFileSync('data/state.json','utf8'):null};
const el=()=>({disabled:false,innerHTML:'',textContent:''});
const ctx=vm.createContext({console,AbortSignal,localStorage:{getItem:k=>store[k]??null,setItem:(k,v)=>{store[k]=v}},document:{querySelector:el},confirm:()=>false,
 fetch:(u,o={})=>fetch(u,{...o,headers:{'User-Agent':'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/120 Safari/537.36',Accept:'application/json'}})});
vm.runInContext('function render(){}',ctx);vm.runInContext(js,ctx);
let over={};try{over=JSON.parse(fs.readFileSync('config.json','utf8'))}catch{}
ctx.over=over;
vm.runInContext(`for(const k in over){const v=over[k];if(v&&typeof v=='object'&&!Array.isArray(v))Object.assign(cfg[k],v);else cfg[k]=v}cfg.token='';cfg.proxy='';`,ctx);
await vm.runInContext('scan()',ctx);
const ok=vm.runInContext('!(S.reg.us&&S.reg.us.err&&S.reg.in&&S.reg.in.err)',ctx);
if(!ok){console.error('Both benchmarks failed to download; keeping previous state.');process.exit(1)}
const out=vm.runInContext(`(()=>{S.last={};S.trades.filter(t=>t.status=='open').forEach(t=>{const b=BARS[t.m+t.sym];if(b)S.last[t.m+t.sym]=b.c.at(-1)});S.fx=BARS.fx?BARS.fx.c.at(-1):null;S.cfg.token='';return JSON.stringify(S)})()`,ctx);
fs.writeFileSync('data/state.json',out);console.log('Scan complete',JSON.parse(out).meta);
