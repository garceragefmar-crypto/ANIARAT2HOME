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
function ordersView(){
  var all=get('aa_orders',[]),sales=all.filter(function(o){return o.status!=='Cancelled'}).reduce(function(s,o){return s+o.total},0),pend=all.filter(function(o){return o.status==='Pending'||o.status==='Awaiting payment check'}).length;
  var list=all.filter(function(o){return!flt||o.status===flt});
  return'<div class="stats"><div class="panel"><small>Total orders</small><b>'+all.length+'</b></div><div class="panel"><small>Waiting for action</small><b>'+pend+'</b></div><div class="panel"><small>Sales (not cancelled)</small><b>'+peso(sales)+'</b></div></div>'
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
  var us=AAauth.users().filter(function(u){return u.role!=='admin'}),os=get('aa_orders',[]);
  return us.length?'<div class="tblw"><table class="tbl"><thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Joined</th><th>Orders</th></tr></thead><tbody>'+us.map(function(u){return'<tr><td>'+esc(u.name)+'</td><td>'+esc(u.email)+'</td><td>'+esc(u.phone||'—')+'</td><td>'+when(u.ts)+'</td><td>'+os.filter(function(o){return o.email===u.email}).length+'</td></tr>'}).join('')+'</tbody></table></div>':'<div class="panel"><p class="empty">No customers have signed up yet.</p></div>';
}
var V={orders:ordersView,products:prodView,feedback:fbView,customers:custView};
function draw(){
  root.innerHTML='<nav class="tabs" aria-label="Admin sections" style="margin-bottom:20px;flex-wrap:wrap">'+['orders','products','feedback','customers'].map(function(t){return'<button type="button" data-tab="'+t+'"'+(t===tab?' aria-current="page"':'')+'>'+t.charAt(0).toUpperCase()+t.slice(1)+'</button>'}).join('')+'</nav>'+V[tab]();
}
root.addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;
  if(b.dataset.tab){tab=b.dataset.tab;draw()}
  if(b.dataset.delO&&confirm('Delete order '+b.dataset.delO+'?')){set('aa_orders',get('aa_orders',[]).filter(function(o){return o.ref!==b.dataset.delO}));draw()}
  if(b.dataset.delF!==undefined&&confirm('Delete this feedback?')){var f=get('aa_feedback',[]);f.splice(+b.dataset.delF,1);set('aa_feedback',f);draw()}
  if(b.hasAttribute('data-reset')&&confirm('Reset every product to its original price and availability?')){localStorage.removeItem('aa_prod');draw();toast('Products reset.')}
});
root.addEventListener('change',function(e){var t=e.target;
  if(t.id==='flt'){flt=t.value;draw()}
  if(t.dataset.st){var all=get('aa_orders',[]);all.forEach(function(o){if(o.ref===t.dataset.st)o.status=t.value});set('aa_orders',all);toast('Order status updated.');draw()}
  var id=t.dataset.price||t.dataset.on;
  if(id){var ov=get('aa_prod',{}),row=t.closest('tr'),pr=+row.querySelector('[data-price]').value;if(!(pr>0)){toast('Enter a price above 0.');return}ov[id]={price:pr,off:!row.querySelector('[data-on]').checked};set('aa_prod',ov);toast('Saved.')}
});
draw();
})();
