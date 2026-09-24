import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const appNode={innerHTML:''};
const toastNode={textContent:'',classList:{add(){},remove(){}}};
const localStorage={data:{},getItem(k){return this.data[k]??null},setItem(k,v){this.data[k]=v},removeItem(k){delete this.data[k]}};
const opened=[];
const context=vm.createContext({
  console,structuredClone,TextEncoder,crypto,localStorage,
  navigator:{},confirm:()=>true,setTimeout:fn=>fn(),
  window:{open:(...args)=>opened.push(args)},
  document:{querySelector:s=>s==='#app'?appNode:s==='#toast'?toastNode:null,querySelectorAll:()=>[]},
  addEventListener(){}
});
vm.runInContext(fs.readFileSync(new URL('../app.js',import.meta.url),'utf8'),context);
vm.runInContext("state.suppliers[0].phone='34600111222';state.quantities['pachu-estrella']=2",context);
vm.runInContext("sendWhatsApp('pachu')",context);
assert.equal(vm.runInContext('state.history.length',context),1,'first WhatsApp tap records the order');
assert.equal(vm.runInContext('state.history[0].groups[0].items[0].quantity',context),2);
assert.equal(opened.length,1,'WhatsApp opens after recording');
vm.runInContext("sendWhatsApp('pachu')",context);
assert.equal(vm.runInContext('state.history.length',context),1,'repeat tap does not duplicate recent identical order');
assert.equal(opened.length,2,'repeat tap still opens WhatsApp');
console.log('WhatsApp history behavior OK');
