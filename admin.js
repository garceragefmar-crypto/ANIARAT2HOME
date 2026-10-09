(function(){
var $=function(s){return document.querySelector(s)},root=$('#admin');
var esc=function(s){return String(s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})};
var peso=function(n){return'₱'+Number(n).toLocaleString('en-PH',{minimumFractionDigits:2,maximumFractionDigits:2})};
var when=function(t){return t?new Date(t).toLocaleString('en-PH',{dateStyle:'medium',timeStyle:'short'}):'—'};
var get=function(k,d){try{var v=JSON.parse(localStorage.getItem(k));return v==null?d:v}catch(e){return d}},set=function(k,v){localStorage.setItem(k,JSON.stringify(v))};
var me=AAauth.user();
if(!me||me.role!=='admin'){root.innerHTML='<div class="panel"><p class="empty">This page is for the admin only. <a href="login.html">Log in as admin</a></p></div>';return}
var STAT=['Pending','Awaiting payment check','Payment verified','Preparing','Out for delivery','Delivered','Cancelled'],tab='orders',flt='';
var P=[];['veg','fruit'].forEach(function(c){window.AA_PRODUCTS[c].forEach(function(r){P.push({id:r[0],name:r[1],price:r[2],unit:r[3],cat:c})})});
function toast(m){var t=$('#toast');t.textContent=m;t.classList.add('show');clearTimeout(toast.h);toast.h=setTimeout(function(){t.classList.remove('show')},1800)}
function stars(n){return'<span class="st" aria-label="'+n+' out of 5">'+'★'.repeat(n)+'<i>'+'★'.repeat(5-n)+'</i></span>'}
var KEYK='aa_adminkey',ORD=null,state='idle',errMsg='';
function adminKey(){return window.AA_KEY||get(KEYK,'')}
function apiCall(method,d){
  var u=window.AA_API;
  if(method==='GET')return fetch(u+'?action=list&key='+encodeURIComponent(adminKey())).then(function(r){return r.json()});
  d.key=adminKey();return fetch(u,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify(d)}).then(function(r){return r.json()});
}
function loadRemote(){
  if(!window.AA_API){state='noapi';draw();return}
  if(!adminKey()){state='nokey';draw();return}
  state='loading';draw();
  apiCall('GET').then(function(j){
    if(!j||!j.ok)throw new Error(j&&j.error==='bad key'?'Wrong admin key.':'The server did not accept the request.');
    ORD=(j.orders||[]).sort(function(a,b){return b.ts-a.ts});state='ok';draw()
  }).catch(function(e){state='err';errMsg=e.message==='Failed to fetch'?'Could not reach the order server. Check your internet and the Web app URL in products.js.':e.message;draw()});
}
function allOrders(){
  var loc=get('aa_orders',[]);if(ORD===null)return loc;
  var seen={};ORD.forEach(function(o){seen[o.ref]=1});
  return ORD.concat(loc.filter(function(o){return!seen[o.ref]}));
}
function syncBar(){
  var btn='<button class="btn-sm alt" type="button" data-act="refresh">Refresh orders</button>';
  if(state==='noapi')return'<div class="panel" style="margin-bottom:16px"><p><b>Order sync is not set up yet.</b> Only orders placed in this browser are shown. Add your Web app URL to <code>products.js</code> (<code>window.AA_API</code>).</p></div>';
  if(state==='nokey'||state==='err')return'<div class="panel" style="margin-bottom:16px">'+(state==='err'?'<p class="err" style="display:block;margin-bottom:8px">'+esc(errMsg)+'</p>':'')+'<div class="f" style="max-width:320px"><label for="akey">Admin key (from your Google Apps Script)</label><input id="akey" type="password" autocomplete="off" value=""></div><p style="margin-top:10px"><button class="btn-sm" type="button" data-act="connect">Connect</button></p></div>';
  if(state==='loading')return'<div class="panel" style="margin-bottom:16px"><p>Loading orders from all customers…</p></div>';
  return'<div class="panel" style="margin-bottom:16px;display:flex;gap:12px;align-items:center;justify-content:space-between;flex-wrap:wrap"><span>Showing live orders from all customers.</span><span>'+btn+'</span></div>';
}
function ordersView(){
  var all=allOrders(),sales=all.filter(function(o){return o.status!=='Cancelled'}).reduce(function(s,o){return s+o.total},0),pend=all.filter(function(o){return o.status==='Pending'||o.status==='Awaiting payment check'}).length;
  var list=all.filter(function(o){return!flt||o.status===flt});
  return syncBar()+'<div class="stats"><div class="panel"><small>Total orders</small><b>'+all.length+'</b></div><div class="panel"><small>Waiting for action</small><b>'+pend+'</b></div><div class="panel"><small>Sales (not cancelled)</small><b>'+peso(sales)+'</b></div></div>'
  +'<div class="f" style="max-width:280px"><label for="flt">Show orders</label><select id="flt"><option value="">All</option>'+STAT.map(function(s){return'<option'+(s===flt?' selected':'')+'>'+s+'</option>'}).join('')+'</select></div>'
  +(list.length?list.map(function(o){return'<article class="panel ord"><div class="h"><span>'+esc(o.ref)+' · '+esc(o.name)+'</span><span class="badge">'+esc(o.status)+'</span></div><small>'+when(o.ts)+' · '+esc(o.email||'')+' · '+esc(o.contact)+'</small>'
    +'<p style="margin:8px 0;font-weight:600">Deliver to: '+esc(o.location)+'<br>Payment: '+esc(o.payment)+(o.proof?' — proof file: '+esc(o.proof):'')+'</p><div class="sum">'+o.items.map(function(x){return'<div class="r"><span>'+esc(x.name)+' — '+x.qty+' '+esc(x.unit)+'</span><strong>'+peso(x.subtotal)+'</strong></div>'}).join('')+'<div class="tot"><span>TOTAL</span><b>'+peso(o.total)+'</b></div></div>'
    +'<div class="acts2"><label class="sr" for="s'+o.ref+'">Status of '+esc(o.ref)+'</label><select id="s'+o.ref+'" data-st="'+esc(o.ref)+'">'+STAT.map(function(s){return'<option'+(s===o.status?' selected':'')+'>'+s+'</option>'}).join('')+'</select><button class="rm" type="button" data-del-o="'+esc(o.ref)+'">Delete order</button></div></article>'}).join(''):'<div class="panel"><p class="empty">No orders to show.</p></div>');
}
function prodView(){
  var ov=get('aa_prod',{});
  return'<p style="margin-bottom:12px;font-weight:700">Change a price or mark a product sold out. Changes save automatically and show in the shop.</p><div class="tblw"><table class="tbl"><thead><tr><th>Product</th><th>Type</th><th>Price (₱ per unit)</th><th>Available</th></tr></thead><tbody>'
  +P.map(function(p){var o=ov[p.id]||{},pr=o.price>0?o.price:p.price;return'<tr><td><img src="assets/products/'+p.id+'.jpg" alt="" width="44" height="44"> '+esc(p.name)+'</td><td>'+(p.cat==='veg'?'Vegetable':'Fruit')+'</td><td><input type="number" min="1" step="1" value="'+pr+'" data-price="'+p.id+'" aria-label="Price of '+esc(p.name)+'"> /'+p.unit+'</td><td><input type="checkbox" data-on="'+p.id+'"'+(o.off?'':' checked')+' aria-label="'+esc(p.name)+' available"></td></tr>'}).join('')
  +'</tbody></table></div><p style="margin-top:14px"><button class="btn-sm alt" type="button" data-reset>Reset all prices and availability</button></p>';
}
function fbView(){
  var all=get('aa_feedback',[]),avg=all.length?(all.reduce(function(s,x){return s+x.rating},0)/all.length).toFixed(1):'—';
  return'<div class="stats"><div class="panel"><small>Responses</small><b>'+all.length+'</b></div><div class="panel"><small>Average rating</small><b>'+avg+' / 5</b></div></div>'
  +(all.length?'<div class="panel">'+all.map(function(x,i){return'<div class="fb">'+stars(x.rating)+' <small>'+esc(x.name||'Anonymous')+(x.email?' ('+esc(x.email)+')':'')+' · '+when(x.ts)+'</small>'+(x.comment?'<p><b>Comment:</b> '+esc(x.comment)+'</p>':'')+(x.suggestion?'<p><b>Suggestion:</b> '+esc(x.suggestion)+'</p>':'')+'<button class="rm" type="button" data-del-f="'+i+'">Delete</button></div>'}).join('')+'</div>':'<div class="panel"><p class="empty">No feedback yet.</p></div>');
}
function custView(){
  var us=AAauth.users().filter(function(u){return u.role!=='admin'}),os=allOrders();
  return us.length?'<div class="tblw"><table class="tbl"><thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Joined</th><th>Orders</th></tr></thead><tbody>'+us.map(function(u){return'<tr><td>'+esc(u.name)+'</td><td>'+esc(u.email)+'</td><td>'+esc(u.phone||'—')+'</td><td>'+when(u.ts)+'</td><td>'+os.filter(function(o){return o.email===u.email}).length+'</td></tr>'}).join('')+'</tbody></table></div>':'<div class="panel"><p class="empty">No customers have signed up yet.</p></div>';
}
var V={orders:ordersView,products:prodView,feedback:fbView,customers:custView};
function draw(){
  root.innerHTML='<nav class="tabs" aria-label="Admin sections" style="margin-bottom:20px;flex-wrap:wrap">'+['orders','products','feedback','customers'].map(function(t){return'<button type="button" data-tab="'+t+'"'+(t===tab?' aria-current="page"':'')+'>'+t.charAt(0).toUpperCase()+t.slice(1)+'</button>'}).join('')+'</nav>'+V[tab]();
}
root.addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;
  if(b.dataset.tab){tab=b.dataset.tab;draw()}
  if(b.dataset.act==='refresh')loadRemote();
  if(b.dataset.act==='changekey'){localStorage.removeItem(KEYK);ORD=null;state='nokey';draw()}
  if(b.dataset.act==='connect'){var k=($('#akey').value||'').trim();if(!k){toast('Enter the admin key.');return}set(KEYK,k);loadRemote()}
  if(b.dataset.delO&&confirm('Delete order '+b.dataset.delO+'?')){var rf=b.dataset.delO;set('aa_orders',get('aa_orders',[]).filter(function(o){return o.ref!==rf}));if(ORD)ORD=ORD.filter(function(o){return o.ref!==rf});draw();if(state==='ok')apiCall('POST',{action:'delete',ref:rf}).then(function(j){if(!j||!j.ok)throw 0}).catch(function(){toast('Deleted here, but the server could not be reached.')})}
  if(b.dataset.delF!==undefined&&confirm('Delete this feedback?')){var f=get('aa_feedback',[]);f.splice(+b.dataset.delF,1);set('aa_feedback',f);draw()}
  if(b.hasAttribute('data-reset')&&confirm('Reset every product to its original price and availability?')){localStorage.removeItem('aa_prod');draw();toast('Products reset.')}
});
root.addEventListener('change',function(e){var t=e.target;
  if(t.id==='flt'){flt=t.value;draw()}
  if(t.dataset.st){var rf2=t.dataset.st,nv=t.value,all=get('aa_orders',[]);all.forEach(function(o){if(o.ref===rf2)o.status=nv});set('aa_orders',all);if(ORD)ORD.forEach(function(o){if(o.ref===rf2)o.status=nv});draw();if(state==='ok'){apiCall('POST',{action:'status',ref:rf2,status:nv}).then(function(j){if(!j||!j.ok)throw 0;toast('Order status updated.')}).catch(function(){toast('Could not save to the server. Please try again.')})}else toast('Order status updated.')}
  var id=t.dataset.price||t.dataset.on;
  if(id){var ov=get('aa_prod',{}),row=t.closest('tr'),pr=+row.querySelector('[data-price]').value;if(!(pr>0)){toast('Enter a price above 0.');return}ov[id]={price:pr,off:!row.querySelector('[data-on]').checked};set('aa_prod',ov);toast('Saved.')}
});
draw();loadRemote();
})();
