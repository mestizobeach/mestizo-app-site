const {chromium}=require('playwright');
const http=require('node:http');
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const server=http.createServer((req,res)=>{const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);const target=path.resolve(root,'.'+(pathname==='/'?'/index.html':pathname));if(!target.startsWith(root+path.sep)){res.writeHead(403).end();return}try{const data=fs.readFileSync(target);res.setHeader('Content-Type',({'.js':'application/javascript','.css':'text/css','.html':'text/html','.wasm':'application/wasm','.gz':'application/octet-stream'})[path.extname(target)]||'application/octet-stream');res.end(data)}catch{res.writeHead(404).end()}});
(async()=>{await new Promise(r=>server.listen(0,'127.0.0.1',r));let browser;try{
 browser=await chromium.launch({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
 const page=await browser.newPage({viewport:{width:390,height:844},serviceWorkers:'block'});
 page.on('pageerror',error=>console.error('Browser error:',error.message));
 page.on('console',message=>{if(message.type()==='error')console.error(message.text())});
 await page.goto(`http://127.0.0.1:${server.address().port}`);
 await page.locator('input[name=pin]').fill('1234');await page.locator('#pin-form button').click();
 await page.locator('.home-wordmark').waitFor();
 assert.equal(await page.locator('.home-tile').count(),7);
 await page.screenshot({path:'/private/tmp/mestizo-home-20261007.png',fullPage:true});
 for(const section of ['order','history','concerts','revenue','expenses','edit']){await page.locator(`.home-tile[data-view="${section}"]`).click();await page.locator('.home-brand').click();await page.locator('.home-wordmark').waitFor()}
 await page.locator('.home-tile[data-view="expenses"]').click();
 await page.locator('#expense-date').fill('2026-10-07');await page.locator('#expense-concept').fill('Artista de prueba');await page.locator('#expense-amount').fill('150,50');await page.locator('#expense-form button.primary').click();
 await page.locator('[data-expense-edit]').waitFor();assert.match(await page.locator('.revenue-summary').innerText(),/150,50/);
 await page.locator('[data-expense-edit]').click();await page.locator('#expense-amount').fill('200');await page.locator('#expense-form button.primary').click();assert.equal(await page.locator('[data-expense-edit]').count(),1);assert.match(await page.locator('.revenue-summary').innerText(),/200,00/);
 page.once('dialog',dialog=>dialog.accept());await page.locator('[data-expense-edit]').click();await page.locator('#expense-delete').click();await page.getByText('Todavía no hay gastos de esta categoría en el mes seleccionado.',{exact:true}).waitFor();
 await page.locator('.home-brand').click();
 await page.locator('.home-tile[data-view="invoices"]').click();
 const base64=await page.evaluate(()=>{const c=document.createElement('canvas');c.width=1600;c.height=1000;const ctx=c.getContext('2d');ctx.fillStyle='white';ctx.fillRect(0,0,c.width,c.height);ctx.fillStyle='black';ctx.font='48px Arial';['FACTURA MESTIZO','Fecha de emision: 07/10/2026','Proveedor Costa','Numero factura 1234','Total factura 120,00 EUR'].forEach((s,i)=>ctx.fillText(s,80,100+i*130));return c.toDataURL('image/png').split(',')[1]});
 await page.locator('#invoice-file').setInputFiles({name:'prueba.png',mimeType:'image/png',buffer:Buffer.from(base64,'base64')});
 try{await page.getByText('Factura · 7/10/2026',{exact:true}).waitFor({timeout:60000})}catch(error){console.error(await page.locator('body').innerText());throw error}
 await page.getByText('Factura · 7/10/2026',{exact:true}).click();
 await page.waitForFunction(()=>document.querySelector('.invoice-image')?.naturalWidth>0);assert.ok(await page.locator('.invoice-image').evaluate(el=>el.complete&&el.naturalWidth>0));
 await page.reload();await page.locator('input[name=pin]').fill('1234');await page.locator('#pin-form button').click();await page.locator('.home-tile[data-view="invoices"]').click();
 await page.getByText('Factura · 7/10/2026',{exact:true}).waitFor();
 await page.getByText('Factura · 7/10/2026',{exact:true}).click();await page.locator('#invoice-edit-date input').fill('2026-09-30');await page.locator('#invoice-edit-date button').click();
 await page.getByText('Factura · 30/9/2026',{exact:true}).waitFor();
 page.on('dialog',dialog=>dialog.accept());await page.locator('#invoice-delete').click();await page.getByText('Todavía no hay facturas archivadas.',{exact:true}).waitFor();
 console.log('Browser OCR, local photo storage, reload, date correction and deletion OK');
}finally{await browser?.close();server.close()}})().catch(e=>{console.error(e);process.exitCode=1});
