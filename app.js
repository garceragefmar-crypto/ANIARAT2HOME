(function(){
'use strict';
/* ===== SETTINGS — edit these ===== */
var C={
  email:'aniarat2home@gmail.com',
  gcashName:'JUAN DELA CRUZ',      // sample only — match your real GCash QR (assets/gcash-qr.png)
  gcashNumber:'09191234567',
  orderEndpoint:'',                // optional: URL that receives each order as JSON (e.g. a Formspree / Google Apps Script URL)
  feedbackEndpoint:''              // optional: URL that receives each feedback as JSON
};
/* ================================= */
var $=function(s,r){return(r||document).querySelector(s)},page=document.body.dataset.page;
var esc=function(s){return String(s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})};
var peso=function(n){return'₱'+Number(n).toLocaleString('en-PH',{minimumFractionDigits:2,maximumFractionDigits:2})};
var when=function(t){return new Date(t).toLocaleString('en-PH',{dateStyle:'medium',timeStyle:'short'})};
var store={get:function(k,d){try{var v=JSON.parse(localStorage.getItem(k));return v==null?d:v}catch(e){return d}},set:function(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}};
function post(url,data){if(!url)return Promise.resolve(false);return fetch(url,{method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json'},body:JSON.stringify(data)}).then(function(r){return r.ok}).catch(function(){return false})}
function toast(m){var t=$('#toast');if(!t)return;t.textContent=m;t.classList.add('show');clearTimeout(toast.h);toast.h=setTimeout(function(){t.classList.remove('show')},2200)}

var ALL={};['veg','fruit'].forEach(function(c){(window.AA_PRODUCTS||{veg:[],fruit:[]})[c].forEach(function(r){ALL[r[0]]={id:r[0],name:r[1],price:r[2],unit:r[3],desc:r[4],aka:r[5],cat:c}})});
var ov=store.get('aa_prod',{});Object.keys(ov).forEach(function(i){if(ALL[i]){if(ov[i].price>0)ALL[i].price=ov[i].price;ALL[i].off=!!ov[i].off}});
var me=window.AAauth?AAauth.user():null;
var cart=store.get('aa_cart',{});Object.keys(cart).forEach(function(i){if(!ALL[i]||ALL[i].off||!(cart[i]>0))delete cart[i]});
var ids=function(){return Object.keys(cart)};
var count=function(){return ids().reduce(function(s,i){return s+cart[i]},0)};
var total=function(){return ids().reduce(function(s,i){return s+cart[i]*ALL[i].price},0)};
var commit=function(){store.set('aa_cart',cart);render()};
function summary(){return ids().map(function(i){var p=ALL[i];return'<div class="r"><span><strong>'+esc(p.name)+'</strong><br>'+cart[i]+' '+p.unit+' × '+peso(p.price)+'</span><strong>'+peso(p.price*cart[i])+'</strong></div>'}).join('')+'<div class="tot"><span>GRAND TOTAL</span><b>'+peso(total())+'</b></div>'}

/* ---------- shop pages ---------- */
function drawCards(){
  var q=($('#q').value||'').trim().toLowerCase(),n=0;
  $('#grid').innerHTML=Object.keys(ALL).map(function(i){return ALL[i]}).filter(function(p){return p.cat===page}).filter(function(p){return!q||(p.name+' '+p.aka).toLowerCase().indexOf(q)>-1}).map(function(p){n++;
    return'<article class="card-p"><img src="assets/products/'+p.id+'.jpg" alt="Fresh '+esc(p.name)+' in a basket" loading="lazy"><div class="in"><h3>'+esc(p.name)+'</h3><div class="pr">'+peso(p.price)+'/'+p.unit+'</div><p class="ds">'+esc(p.desc)+'</p>'+(p.off?'<button class="add" type="button" disabled style="opacity:.5;cursor:not-allowed">SOLD OUT</button>':'<div class="step"><button type="button" data-a="dec" aria-label="Decrease '+esc(p.name)+' quantity">−</button><output>1</output><button type="button" data-a="inc" aria-label="Increase '+esc(p.name)+' quantity">+</button></div><button class="add" type="button" data-a="add" data-id="'+p.id+'">ADD TO CART</button>')+'</div></article>'}).join('');
  $('#none').hidden=n>0;
}
function basketHTML(){
  var rows=ids().map(function(i){var p=ALL[i];return'<div class="row-i"><div class="t"><span>'+esc(p.name)+'<small>'+peso(p.price)+'/'+p.unit+'</small></span><span>'+peso(p.price*cart[i])+'</span></div><div class="a"><div class="q"><button type="button" data-a="cm" data-id="'+i+'" aria-label="Decrease '+esc(p.name)+'">−</button><span>'+cart[i]+'</span><button type="button" data-a="cp" data-id="'+i+'" aria-label="Increase '+esc(p.name)+'">+</button></div><button class="rm" type="button" data-a="rm" data-id="'+i+'">Remove</button></div></div>'}).join('');
  return'<h2>Your basket <b>'+count()+'</b></h2>'+(rows||'<p class="empty">Your basket is waiting for something fresh.</p>')+'<div class="tot"><span>GRAND TOTAL</span><b>'+peso(total())+'</b></div><button class="btn-sm" type="button" data-a="checkout"'+(count()?'':' disabled')+'>PLACE ORDER</button>'+(count()?'':'<p class="empty">Add fresh produce to continue.</p>');
}
function render(){
  var b=$('#basket');if(b)b.innerHTML=basketHTML();
  if($('#hc')){$('#hc').textContent=count();$('#ht').textContent=peso(total())}
  var s=$('#co-sum');if(s)s.innerHTML=summary();
  if($('#gamt')){$('#gamt').textContent=peso(total());$('#camt').textContent=peso(total())}
  if(!count()&&$('#co'))$('#co').hidden=true;
}
function openCheckout(){if(!count())return;if(!me){location.href='login.html?next='+location.pathname.split('/').pop();return}var c=$('#co');c.hidden=false;$('#done').hidden=true;c.scrollIntoView({behavior:'smooth'})}

function checkoutHTML(){
  return'<section id="co" class="co panel" hidden aria-labelledby="co-h"><div class="cols"><form id="cf" novalidate><h2 id="co-h">Delivery details</h2><div style="height:14px"></div>'
  +'<div class="f"><label for="cn">Customer Name</label><input id="cn" autocomplete="name"><p class="err" id="e-cn"></p></div>'
  +'<div class="f"><label for="cl">Delivery Location</label><input id="cl" autocomplete="street-address" placeholder="House no., street, barangay, city"><p class="err" id="e-cl"></p></div>'
  +'<div class="f"><label for="cc">Contact Number</label><input id="cc" type="tel" inputmode="tel" autocomplete="tel" placeholder="09XX XXX XXXX"><p class="err" id="e-cc"></p></div>'
  +'<div class="f"><label for="pm">Mode of Payment</label><select id="pm"><option value="">Select payment method</option><option>Cash on Delivery</option><option>GCash</option></select><p class="err" id="e-pm"></p></div>'
  +'<div id="cod" class="note" hidden>Pay in cash to our rider when your order arrives. Please prepare <b id="camt"></b>.</div>'
  +'<div id="gcash" class="gcash" hidden><img src="assets/gcash-qr.png" alt="GCash payment QR code"><p>Send <b id="gamt"></b> to <b>'+esc(C.gcashName)+'</b><br>'+esc(C.gcashNumber)+'</p><p style="margin-top:12px"><a class="btn-sm" href="gcash://" id="og">OPEN GCASH</a></p><p class="hint">Scan the QR code in GCash, or tap the button on your phone. We check payments by hand, so keep your receipt.</p>'
  +'<div class="f"><label for="pf">Proof of payment (screenshot or PDF)</label><input id="pf" type="file" accept="image/*,.pdf"><p class="err" id="e-pf"></p></div><label class="chk"><input id="pd" type="checkbox">I have paid via GCash</label><p class="err" id="e-pd"></p></div>'
  +'<p class="err" id="e-form" role="alert"></p><button class="btn-sm" type="submit" style="width:auto;padding:13px 34px">CONFIRM ORDER</button></form>'
  +'<div><h2>Order summary</h2><div id="co-sum" class="sum" style="margin-top:12px"></div></div></div></section>'
  +'<section id="done" class="done" hidden aria-live="polite"><div class="panel"><h2>Order received!</h2><p id="dmsg" style="margin-top:8px;font-weight:700"></p><div id="dsum" class="sum"></div><div class="acts"><a id="dmail" class="btn-sm" href="#">EMAIL ORDER TO US</a><button id="dnew" class="btn-sm alt" type="button">START A NEW ORDER</button></div><p id="dnote" style="margin-top:12px;font-weight:600"></p></div></section>';
}
function orderText(o){return'Order '+o.ref+'\nName: '+o.name+'\nDeliver to: '+o.location+'\nContact: '+o.contact+'\nPayment: '+o.payment+(o.proof?' (proof file: '+o.proof+')':'')+'\n\n'+o.items.map(function(x){return x.qty+' '+x.unit+' '+x.name+' - '+peso(x.subtotal)}).join('\n')+'\n\nTOTAL: '+peso(o.total)}
function setErr(id,m){$('#e-'+id).textContent=m||'';return!m}
function submitOrder(e){
  e.preventDefault();if(!me){location.href='login.html?next='+location.pathname.split('/').pop();return}var pm=$('#pm').value,f=$('#pf').files[0],ok=true;
  ok=setErr('cn',$('#cn').value.trim()?'':'Please enter your name.')&&ok;
  ok=setErr('cl',$('#cl').value.trim()?'':'Please enter a delivery location.')&&ok;
  ok=setErr('cc',$('#cc').value.replace(/\D/g,'').length>=10?'':'Please enter a valid contact number.')&&ok;
  ok=setErr('pm',pm?'':'Please choose a payment method.')&&ok;
  if(pm==='GCash'){ok=setErr('pf',f?(f.size>5242880?'File is too large (5 MB max).':''):'Please upload your proof of payment.')&&ok;ok=setErr('pd',$('#pd').checked?'':'Please confirm that you have paid via GCash.')&&ok}
  setErr('form',ok?'':'Please fix the highlighted fields.');if(!ok||!count())return;
  var o={email:me.email,ref:'AAH-'+Date.now().toString().slice(-7),ts:Date.now(),name:$('#cn').value.trim(),location:$('#cl').value.trim(),contact:$('#cc').value.trim(),payment:pm,proof:pm==='GCash'?f.name:'',
    items:ids().map(function(i){var p=ALL[i];return{name:p.name,unit:p.unit,price:p.price,qty:cart[i],subtotal:p.price*cart[i]}}),total:total(),status:pm==='GCash'?'Awaiting payment check':'Pending'};
  var all=store.get('aa_orders',[]);all.unshift(o);store.set('aa_orders',all);post(C.orderEndpoint,o);
  $('#dmsg').textContent='Thank you, '+o.name+'! Your '+pm+' order '+o.ref+' has been saved.';
  $('#dsum').innerHTML=summary();
  $('#dmail').href='mailto:'+C.email+'?subject='+encodeURIComponent('Order '+o.ref)+'&body='+encodeURIComponent(orderText(o));
  $('#dnote').textContent=pm==='GCash'?'Please email this order and attach your GCash proof of payment so we can confirm it.':'Please email this order to us so we can prepare it. Pay cash when it arrives.';
  $('#co').hidden=true;$('#done').hidden=false;$('#done').scrollIntoView({behavior:'smooth'});
  cart={};store.set('aa_cart',cart);$('#cf').reset();prefill();payUI();render();
}
function prefill(){if(me){$('#cn').value=me.name;$('#cc').value=me.phone||''}}
function payUI(){var v=$('#pm').value;$('#gcash').hidden=v!=='GCash';$('#cod').hidden=v!=='Cash on Delivery'}

function initShop(){
  $('#checkout-root').innerHTML=checkoutHTML();
  prefill();drawCards();render();
  $('#q').addEventListener('input',drawCards);
  $('#clr').addEventListener('click',function(){$('#q').value='';drawCards();$('#q').focus()});
  $('#cf').addEventListener('submit',submitOrder);$('#pm').addEventListener('change',payUI);
  $('#pf').addEventListener('change',function(){if($('#pf').files[0])setErr('pf','')});
  $('#dnew').addEventListener('click',function(){$('#done').hidden=true;window.scrollTo({top:0,behavior:'smooth'})});
  document.addEventListener('click',function(e){
    var b=e.target.closest('[data-a]');if(!b)return;var a=b.dataset.a,id=b.dataset.id;
    if(a==='inc'||a==='dec'){var o=b.parentNode.querySelector('output');o.textContent=Math.max(1,+o.textContent+(a==='inc'?1:-1))}
    if(a==='add'){var o2=b.parentNode.querySelector('output');cart[id]=(cart[id]||0)+ +o2.textContent;o2.textContent=1;commit();toast(ALL[id].name+' added to your basket.')}
    if(a==='cp'){cart[id]++;commit()}
    if(a==='cm'){cart[id]--;if(cart[id]<1)delete cart[id];commit()}
    if(a==='rm'){delete cart[id];commit()}
    if(a==='checkout')openCheckout();
  });
}

/* ---------- orders page ---------- */
function initOrders(){
  var box=$('#olist');
  if(!me){box.innerHTML='<div class="panel"><p class="empty">Please <a href="login.html?next=orders.html">log in</a> or <a href="signup.html">sign up</a> to see your orders.</p></div>';return}
  var all=store.get('aa_orders',[]).filter(function(o){return o.email===me.email});
  box.innerHTML=all.length?all.map(function(o){return'<article class="panel ord"><div class="h"><span>'+esc(o.ref)+'</span><span class="badge">'+esc(o.status)+'</span></div><small>'+when(o.ts)+' · '+esc(o.payment)+'</small><div class="sum" style="margin-top:8px">'+o.items.map(function(x){return'<div class="r"><span>'+esc(x.name)+' — '+x.qty+' '+esc(x.unit)+'</span><strong>'+peso(x.subtotal)+'</strong></div>'}).join('')+'<div class="tot"><span>TOTAL</span><b>'+peso(o.total)+'</b></div></div><p style="margin-top:8px;font-weight:600">Deliver to: '+esc(o.location)+'</p></article>'}).join(''):'<div class="panel"><p class="empty">No orders yet. <a href="shop.html">Start shopping</a></p></div>';
  if(count())box.insertAdjacentHTML('afterbegin','<div class="note">You have '+count()+' item(s) in your basket ('+peso(total())+'). <a href="vegetables.html">Continue shopping</a> to place the order.</div>');
}

/* ---------- feedback page ---------- */
function stars(n){return'<span class="st" aria-label="'+n+' out of 5 stars">'+'★'.repeat(n)+'<i>'+'★'.repeat(5-n)+'</i></span>'}
var LBL=['','Poor','Fair','Good','Very good','Excellent'];
function listFeedback(){
  var all=store.get('aa_feedback',[]).filter(function(x){return(x.email||'')===(me?me.email:'')}),box=$('#flist');$('#fhist').hidden=!all.length;
  var avg=all.length?all.reduce(function(s,x){return s+x.rating},0)/all.length:0;
  $('#favg').textContent=all.length?avg.toFixed(1)+' / 5 average from '+all.length+' submission'+(all.length>1?'s':''):'';
  box.innerHTML=all.map(function(x){return'<div class="fb">'+stars(x.rating)+' <small>'+esc(x.name||'Anonymous')+' · '+when(x.ts)+'</small>'+(x.comment?'<p><b>Comment:</b> '+esc(x.comment)+'</p>':'')+(x.suggestion?'<p><b>Suggestion:</b> '+esc(x.suggestion)+'</p>':'')+'</div>'}).join('');
}
function initFeedback(){
  var form=$('#ff');
  form.addEventListener('change',function(e){if(e.target.name==='rate'){$('#rt').textContent=LBL[+e.target.value];$('#e-rate').textContent=''}});
  form.addEventListener('submit',function(e){
    e.preventDefault();var r=form.querySelector('input[name=rate]:checked');
    if(!r){$('#e-rate').textContent='Please choose a star rating.';return}
    var x={email:me?me.email:'',ts:Date.now(),rating:+r.value,name:$('#fn').value.trim(),comment:$('#fc').value.trim(),suggestion:$('#fs').value.trim()};
    var all=store.get('aa_feedback',[]);all.unshift(x);store.set('aa_feedback',all);post(C.feedbackEndpoint,x);
    var body='Rating: '+x.rating+'/5\nName: '+(x.name||'Anonymous')+'\n\nComments:\n'+x.comment+'\n\nSuggestions:\n'+x.suggestion;
    $('#fmail').href='mailto:'+C.email+'?subject='+encodeURIComponent('Website feedback: '+x.rating+' stars')+'&body='+encodeURIComponent(body);
    form.reset();$('#rt').textContent='';form.hidden=true;$('#fthanks').hidden=false;listFeedback();$('#fthanks').scrollIntoView({behavior:'smooth'});
  });
  $('#fagain').addEventListener('click',function(){$('#fthanks').hidden=true;form.hidden=false;$('#fn').focus()});
  if(me)$('#fn').value=me.name;listFeedback();
}
if(page==='veg'||page==='fruit')initShop();else if(page==='orders')initOrders();else if(page==='feedback')initFeedback();
})();
