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
assert.equal(vm.runInContext("state.quantities['pachu-estrella']||0",context),0,'sent supplier quantities are cleared');
assert.equal(vm.runInContext('view',context),'order','last completed supplier returns to the main order screen');
vm.runInContext("sendWhatsApp('pachu')",context);
assert.equal(vm.runInContext('state.history.length',context),1,'cleared order cannot be added twice');
assert.equal(opened.length,1,'cleared order cannot reopen WhatsApp accidentally');

vm.runInContext("view='summary';state.suppliers[1].phone='34600111223';state.quantities['pachu-estrella']=1;state.quantities['cocacola-normal']=3",context);
vm.runInContext("sendWhatsApp('pachu')",context);
assert.equal(vm.runInContext('view',context),'summary','review remains open while another supplier is pending');
assert.equal(vm.runInContext("state.quantities['cocacola-normal']",context),3,'other supplier quantities remain selected');
assert.equal(vm.runInContext("state.quantities['pachu-estrella']||0",context),0,'completed supplier disappears from review');
console.log('WhatsApp history behavior OK');
