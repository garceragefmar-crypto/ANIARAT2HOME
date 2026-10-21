/* Customer service chat: suggestions + automatic replies + messages to the admin (replies show up here) */
(function(){
if(window.__aaSupport)return;
var pg=document.body&&document.body.dataset.page;if(pg==='admin'||pg==='login'||pg==='signup')return;
window.__aaSupport=1;
function jget(k,d){try{var v=JSON.parse(localStorage.getItem(k));return v==null?d:v}catch(e){return d}}
var S=jget('aa_session',null),U=S?jget('aa_users',[]).filter(function(x){return x.email===S})[0]||null:null;
if(U&&U.role==='admin')return;

/* ---------- automatic replies ---------- */
var SM={'Pending':'We received your order and will confirm it soon.','Awaiting payment check':'We are checking your GCash payment.','Payment verified':'Your payment is confirmed.','Preparing':'Your fresh produce is being prepared.','Out for delivery':'Your order is on its way to you!','Delivered':'It was delivered. Enjoy your fresh produce!','Cancelled':'This order was cancelled.'};
var ANS={
pay:'To pay with GCash: choose GCash at checkout, scan the QR code and send the exact total. Then upload a screenshot of your payment and place the order. We check it and update your order status. You can also choose cash on delivery.',
cancel:'You can cancel while your order is still Pending or Awaiting payment check. Open MY ORDERS on the home page and press Cancel order. If it is already being prepared, type your order number here and our team will help.',
deliver:'Your order status changes to Out for delivery once it is on its way. You can see it any time in MY ORDERS. For a specific delivery time, type your order number here and our team will reply.',
change:'To change your items or delivery address, type your order number and what you want to change. We can only change an order that has not been prepared yet.',
refund:'We are sorry about that. Please type your order number and tell us what went wrong. Our team will review it and reply here.',
hello:'Hello! How can we help you today? Tap a suggestion below or type your question.',
thanks:'You are welcome! Is there anything else we can help you with?'
};
var RULES=[[/gcash|payment|paid|\bpay\b|\bqr\b/i,'pay'],[/cancel/i,'cancel'],[/track|status|where.*order|order.*where|my order/i,'track'],[/deliver|shipping|arrive|how long|\bwhen\b/i,'deliver'],[/change|address|edit|wrong item/i,'change'],[/refund|return|damag|spoil|rotten|missing|complain/i,'refund'],[/^\s*(hi|hello|hey|good (morning|afternoon|evening))\b/i,'hello'],[/thank/i,'thanks']];
function orderAnswer(){
  if(!U)return 'Please log in to see your orders. After logging in, tap "Where is my order?" again.';
  var os=jget('aa_orders',[]).filter(function(o){return o.email===U.email}).sort(function(a,b){return b.ts-a.ts});
  if(!os.length)return 'We cannot find an order on your account yet. If you just placed one, open MY ORDERS on the home page and press Refresh.';
  var o=os[0];return 'Your latest order '+o.ref+' is now: '+o.status+'. '+(SM[o.status]||'')+' You can see all your orders in MY ORDERS.';
}
function answerFor(k){return k==='track'?orderAnswer():ANS[k]}
function autoReply(text){
  for(var i=0;i<RULES.length;i++){if(RULES[i][0].test(text)){var k=RULES[i][1],a=answerFor(k);return(k==='hello'||k==='thanks')?a:a+'\n\nIf this did not solve it, our team will also reply here.'}}
  return 'Thanks for your message! Our team has received it and will reply here as soon as they can. Please include your order number if it is about an order.';
}
var SUG=[['How do I pay with GCash?','pay'],['Where is my order?','track'],['Can I cancel my order?','cancel'],['Delivery time','deliver'],['Change my order or address','change'],['Talk to the team','team']];

/* ---------- styles ---------- */
var CSS='.aa-sb{position:fixed;left:16px;bottom:16px;z-index:900;display:flex;align-items:center;gap:8px;border:0;cursor:pointer;background:#0b4a12;color:#fff;font-weight:800;font-size:1rem;line-height:1;font-family:inherit;padding:13px 20px;border-radius:30px;box-shadow:0 6px 18px rgba(0,0,0,.3)}'
+'.aa-sb svg{width:22px;height:22px;stroke:#fff;fill:none;stroke-width:1.8;stroke-linejoin:round}.aa-sb:hover{background:#2e7d1e}.aa-sb[hidden]{display:none}'
+'.aa-dot{position:absolute;top:-3px;right:-3px;width:16px;height:16px;border-radius:50%;background:#c0392b;border:2px solid #fff}.aa-dot[hidden]{display:none}'
+'.aa-sp{position:fixed;left:16px;bottom:16px;z-index:901;width:min(390px,calc(100vw - 32px));height:min(600px,calc(100vh - 32px));background:#fff;border-radius:18px;box-shadow:0 12px 40px rgba(0,0,0,.35);display:flex;flex-direction:column;overflow:hidden;font-family:inherit;color:#0b4a12}.aa-sp[hidden]{display:none}'
+'.aa-h{display:flex;align-items:center;gap:10px;background:#0b4a12;color:#fff;padding:12px 14px}.aa-av{width:38px;height:38px;border-radius:50%;background:#e9c53a;color:#0b4a12;display:grid;place-items:center;font-weight:900;font-size:1.1rem;flex:none}'
+'.aa-h b{display:block;font-size:1rem}.aa-h small{display:block;font-size:.78rem;opacity:.85;font-weight:600}.aa-h div{flex:1}.aa-x{background:none;border:0;color:#fff;font-size:1.8rem;line-height:1;cursor:pointer;padding:0 4px}'
+'.aa-ms{flex:1;overflow:auto;padding:14px;min-height:0;background:#f4faee}'
+'.aa-m{max-width:85%;margin:0 0 10px;padding:9px 12px;border-radius:16px;font-size:.93rem;font-weight:600;line-height:1.42;white-space:pre-wrap;word-wrap:break-word}.aa-m small{display:block;font-size:.72rem;opacity:.75;margin-top:4px;font-weight:600}'
+'.aa-me{margin-left:auto;background:#7fc12e;border-bottom-right-radius:4px}.aa-them{background:#fff;border:1px solid #cfe5bf;border-bottom-left-radius:4px}.aa-bot{background:#e7efe0;border-bottom-left-radius:4px}'
+'.aa-ms a{color:#2e7d1e;font-weight:800}.aa-err{color:#c0392b;font-weight:800;font-size:.88rem;margin:0 0 8px}'
+'.aa-chips{display:flex;gap:8px;overflow-x:auto;padding:10px 12px 6px;background:#fff;border-top:1px solid #cfe5bf;scrollbar-width:thin}.aa-chips button{flex:none;border:2px solid #7fc12e;background:#f7fcf2;color:#0b4a12;border-radius:20px;padding:7px 14px;font-weight:800;font-size:.85rem;font-family:inherit;cursor:pointer;white-space:nowrap}.aa-chips button:hover{background:#7fc12e}'
+'.aa-f{display:flex;gap:8px;padding:8px 10px 10px;background:#fff}.aa-f textarea{flex:1;resize:none;height:46px;border:2px solid #cfe5bf;border-radius:14px;padding:9px 11px;font-weight:600;font-size:.95rem;font-family:inherit;color:#0b4a12}'
+'.aa-f button{border:0;border-radius:14px;background:#0b4a12;color:#fff;font-weight:800;font-size:.95rem;font-family:inherit;padding:0 18px;cursor:pointer}.aa-f button:disabled,.aa-f textarea:disabled{opacity:.5;cursor:default}'
+'@media(max-width:480px){.aa-sp{left:8px;bottom:8px;width:calc(100vw - 16px)}}';
var st=document.createElement('style');st.textContent=CSS;document.head.appendChild(st);

/* ---------- build the chat ---------- */
function el(tag,cls,txt){var e=document.createElement(tag);if(cls)e.className=cls;if(txt!=null)e.textContent=txt;return e}
var btn=el('button','aa-sb');btn.type='button';btn.setAttribute('aria-label','Open customer service chat');
btn.innerHTML='<svg viewBox="0 0 24 24"><path d="M5 3.5h14a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-7l-5 4v-4H5a2 2 0 0 1-2-2v-9a2 2 0 0 1 2-2z"/></svg><span>Chat with us</span>';
var dot=el('i','aa-dot');dot.hidden=true;btn.appendChild(dot);
var sp=el('section','aa-sp');sp.hidden=true;sp.setAttribute('role','dialog');sp.setAttribute('aria-label','Customer service chat');
var hd=el('div','aa-h');hd.appendChild(el('span','aa-av','A'));
var ht=el('div');ht.appendChild(el('b',null,'AniArat2Home Support'));ht.appendChild(el('small',null,'Ask us anything. Our replies show up here.'));hd.appendChild(ht);
var xb=el('button','aa-x','×');xb.type='button';xb.setAttribute('aria-label','Close chat');hd.appendChild(xb);
var ms=el('div','aa-ms');ms.setAttribute('aria-live','polite');
var chips=el('div','aa-chips');
var form=el('form','aa-f');var ta=el('textarea');ta.maxLength=1000;ta.setAttribute('aria-label','Your message');
ta.placeholder=U?'Type a message…':'Log in to message our team';ta.disabled=!U;
var sb=el('button',null,'Send');sb.type='submit';sb.disabled=!U;form.appendChild(ta);form.appendChild(sb);
sp.appendChild(hd);sp.appendChild(ms);sp.appendChild(chips);sp.appendChild(form);
document.body.appendChild(btn);document.body.appendChild(sp);

var msgs=[],local=[],loaded=false,errTxt='',greetTs=Date.now();
var seenKey=U?'aa_supseen_'+U.email:'';
function adminCount(){return msgs.filter(function(m){return m.from==='admin'}).length}
function markSeen(){if(!U)return;localStorage.setItem(seenKey,String(adminCount()));dot.hidden=true}
function checkDot(){if(!U)return;if(!sp.hidden){markSeen();return}dot.hidden=!(adminCount()>(+localStorage.getItem(seenKey)||0))}
function fmt(ts){try{return new Date(+ts).toLocaleTimeString('en-PH',{timeStyle:'short'})}catch(e){return''}}
function bubble(cls,text,label,ts){var d=el('div','aa-m '+cls);d.appendChild(document.createTextNode(text));d.appendChild(el('small',null,(label?label+' · ':'')+fmt(ts)));ms.appendChild(d)}
function render(){
  ms.textContent='';
  bubble('aa-bot','Hi! Welcome to AniArat2Home. Tap a suggestion below or type your question. '+(U?'Our team will reply here.':'To message our team, please log in first.'),'Auto-reply',greetTs);
  msgs.concat(local).sort(function(a,b){return a.ts-b.ts}).forEach(function(m){
    if(m.from==='customer')bubble('aa-me',m.text,'You',m.ts);
    else if(m.from==='admin')bubble('aa-them',m.text,'AniArat2Home team',m.ts);
    else bubble('aa-bot',m.text,'Auto-reply',m.ts)});
  if(!U){var p=el('p',null,'');var a=el('a',null,'Log in to message our team');a.href='login.html?next='+encodeURIComponent(location.pathname.split('/').pop()||'index.html');p.appendChild(a);ms.appendChild(p)}
  if(errTxt)ms.appendChild(el('p','aa-err',errTxt));
  ms.scrollTop=ms.scrollHeight;
}
SUG.forEach(function(s){var b=el('button',null,s[0]);b.type='button';b.addEventListener('click',function(){
  var now=Date.now();local.push({from:'customer',text:s[0],ts:now,local:1});render();
  setTimeout(function(){
    var t=s[1]==='team'?(U?'Sure! Type your message below and our team will reply here.':'Please log in first so our team can reply to you.'):answerFor(s[1]);
    local.push({from:'bot',text:t,ts:Date.now(),local:1});render();if(s[1]==='team'&&U)ta.focus()},450)});chips.appendChild(b)});

/* ---------- server ---------- */
function api(){return new Promise(function(res){if(window.AA_API)return res(true);var s=document.createElement('script');s.src='products.js';s.onload=function(){res(!!window.AA_API)};s.onerror=function(){res(false)};document.head.appendChild(s)})}
function srv(d){return api().then(function(ok){if(!ok)throw 0;return fetch(window.AA_API,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify(d)})}).then(function(r){return r.json()})}
function load(){
  if(!U)return;
  if(!U.pw){errTxt='Please log out and log in again to use messages.';render();return}
  srv({action:'thread',email:U.email,pw:U.pw}).then(function(j){
    if(j&&j.ok){errTxt='';msgs=j.messages||[];loaded=true}
    else if(j&&j.error==='bad login'){errTxt='Please log out and log in again to use messages.'}
    else throw 0;
    if(!sp.hidden)render();checkDot();
  }).catch(function(){if(!sp.hidden&&!loaded){errTxt='Could not reach our team right now. Please check your internet.';render()}});
}
function send(){
  var text=ta.value.trim();if(!text||!U)return;
  sb.disabled=true;errTxt='';
  var now=Date.now(),m={id:'SM-'+now+Math.random().toString(36).slice(2,6),ts:now,from:'customer',text:text};
  var ar={id:'BT-'+now+Math.random().toString(36).slice(2,6),ts:now+1,from:'bot',text:autoReply(text)};
  srv({action:'support',m:{id:m.id,email:U.email,name:U.name,text:text,pw:U.pw},auto:{id:ar.id,ts:ar.ts,text:ar.text}}).then(function(j){
    if(!j||!j.ok)throw 0;msgs.push(m);msgs.push(ar);ta.value='';render()
  }).catch(function(){errTxt='Your message was not sent. Please try again.';render()}).then(function(){setTimeout(function(){sb.disabled=!U},1200)});
}
form.addEventListener('submit',function(e){e.preventDefault();send()});
ta.addEventListener('keydown',function(e){if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();send()}});

function open(o){sp.hidden=!o;btn.hidden=o;if(o){render();markSeen();load();setTimeout(function(){if(U)ta.focus()},60)}else checkDot()}
btn.addEventListener('click',function(){open(true)});
xb.addEventListener('click',function(){open(false);btn.focus()});
document.addEventListener('keydown',function(e){if(e.key==='Escape'&&!sp.hidden)open(false)});
if(U){load();var n=0;setInterval(function(){n++;if(document.hidden)return;if(!sp.hidden||n%6===0)load()},20000)}
})();
