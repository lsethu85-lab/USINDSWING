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
let shown=0;
ctx.hostGet=async u=>{let last;for(const h of['query1','query2']){for(let a=0;a<2;a++){try{const r=await fetch(u.replace('query1',h),{headers:{'User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',Accept:'application/json,text/plain,*/*','Accept-Language':'en-US,en;q=0.9'},signal:AbortSignal.timeout(10000)});
if(r.ok){const j=await r.json();if(j.chart&&j.chart.result)return j;last=Error('empty result '+JSON.stringify(j.chart&&j.chart.error))}else last=Error('HTTP '+r.status+' '+(await r.text()).slice(0,120))}catch(e){last=e}await new Promise(r=>setTimeout(r,1500))}}
if(shown++<6)console.log('FETCH FAILED',decodeURIComponent(u.split('chart/')[1]||u).slice(0,40),'->',String(last));throw last};
vm.runInContext('getJ=hostGet',ctx);
console.log('Starting scan',new Date().toISOString());
await vm.runInContext('scan()',ctx);
const ok=vm.runInContext('!(S.reg.us&&S.reg.us.err&&S.reg.in&&S.reg.in.err)',ctx);
if(!ok){console.log('FAILED: both benchmark downloads failed; see FETCH FAILED lines above.');process.exit(1)}
const out=vm.runInContext(`(()=>{S.last={};S.trades.filter(t=>t.status=='open').forEach(t=>{const b=BARS[t.m+t.sym];if(b)S.last[t.m+t.sym]=b.c.at(-1)});S.fx=BARS.fx?BARS.fx.c.at(-1):null;S.cfg.token='';return JSON.stringify(S)})()`,ctx);
fs.writeFileSync('data/state.json',out);console.log('Scan complete',JSON.stringify(JSON.parse(out).meta));process.exit(0);
