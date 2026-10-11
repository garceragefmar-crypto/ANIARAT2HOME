/* Accounts: customers are saved on the order server (Google Sheet) so they can log in on any device.
   Admin login: admin@aniarat2home.com / admin123 */
(function(){
var K='aa_users',S='aa_session',ADMIN={name:'Admin',email:'admin@aniarat2home.com',phone:'',pw:'admin123',role:'admin',ts:0};
function get(k,d){try{var v=JSON.parse(localStorage.getItem(k));return v==null?d:v}catch(e){return d}}
function users(){var u=get(K,[]);if(!u.some(function(x){return x.role==='admin'})){u.unshift(ADMIN);localStorage.setItem(K,JSON.stringify(u))}return u}
function user(){var e=get(S,null);return e?users().filter(function(x){return x.email===e})[0]||null:null}
function go(u){var n=new URLSearchParams(location.search).get('next');location.href=u.role==='admin'?'admin.html':(/^[a-z]+\.html$/.test(n||'')?n:'shop.html')}
window.AAauth={user:user,users:users,logout:function(){localStorage.removeItem(S);location.href='index.html'}};

/* ---- server helpers ---- */
function api(){return new Promise(function(res){
  if(window.AA_API)return res(true);
  var s=document.createElement('script');s.src='products.js';s.onload=function(){res(!!window.AA_API)};s.onerror=function(){res(false)};document.head.appendChild(s)})}
function srv(d){return fetch(window.AA_API,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify(d)}).then(function(r){return r.json()})}
function saveLocal(u){var all=users().filter(function(x){return x.email!==u.email});all.push(u);localStorage.setItem(K,JSON.stringify(all))}
/* upload an account that only exists on this device (old accounts) */
function sendCust(u){
  if(!u||u.role==='admin'||!u.pw)return;
  api().then(function(ok){if(!ok)return;return srv({action:'signup',c:{name:u.name,email:u.email,phone:u.phone||'',pw:u.pw,ts:u.ts}})}).then(function(j){
    if(j&&(j.ok||j.error==='exists'))localStorage.setItem('aa_custsync',u.email)}).catch(function(){})
}
var cu=user();if(cu&&cu.role!=='admin'&&localStorage.getItem('aa_custsync')!==cu.email)sendCust(cu);

var page=document.body.dataset.page,f=document.getElementById('f'),m=document.getElementById('msg');
if(page==='login'||page==='signup'){
  document.querySelectorAll('.switch a').forEach(function(a){a.href+=location.search});
  if(new URLSearchParams(location.search).get('next')&&page==='login')document.querySelector('.sub').textContent='Please log in to place your order.';
  document.querySelectorAll('.pw button').forEach(function(b){b.onclick=function(){var i=b.previousElementSibling,s=i.type==='password';i.type=s?'text':'password';b.textContent=s?'Hide':'Show'}});
  var btn=f.querySelector('button[type=submit]'),label=btn.textContent;
  var busy=function(on,t){btn.disabled=on;btn.textContent=on?t:label};
  var enter=function(u){localStorage.setItem(S,JSON.stringify(u.email));go(u)};
  f.onsubmit=function(e){e.preventDefault();var v=function(id){return document.getElementById(id).value.trim()},em=v('email').toLowerCase(),pw=document.getElementById('pw').value,err='';
    if(page==='login'){
      if(!em||!pw){m.textContent='Please enter your email and password.';return}
      var local=users().filter(function(x){return x.email===em&&x.pw===pw})[0];
      if(local&&local.role==='admin'){enter(local);return}
      m.textContent='';busy(true,'LOGGING IN...');
      api().then(function(ok){return ok?srv({action:'login',email:em,pw:pw}):{down:1}}).catch(function(){return{down:1}}).then(function(j){
        if(j&&j.ok&&j.user){var u=j.user;u.pw=pw;u.role='customer';saveLocal(u);localStorage.setItem('aa_custsync',u.email);enter(u)}
        else if(local){if(!j.down)sendCust(local);enter(local)}
        else{busy(false);m.textContent=j&&j.down?'Could not reach the server. Please check your internet and try again.':'Wrong email or password.'}
      });
    }else{
      if(!v('name')||!em||!pw)err='Please fill in your name, email and password.';
      else if(!/^\S+@\S+\.\S+$/.test(em))err='Please enter a valid email address.';
      else if(pw.length<8)err='Password must be at least 8 characters.';
      else if(pw!==document.getElementById('pw2').value)err='Passwords do not match.';
      else if(!document.getElementById('terms').checked)err='Please accept the terms to continue.';
      m.textContent=err;if(err)return;
      var u2={name:v('name'),email:em,phone:v('phone'),pw:pw,role:'customer',ts:Date.now()};
      busy(true,'CREATING...');
      api().then(function(ok){return ok?srv({action:'signup',c:u2}):{down:1}}).catch(function(){return{down:1}}).then(function(j){
        if(j&&j.ok){saveLocal(u2);localStorage.setItem('aa_custsync',em);enter(u2)}
        else{busy(false);m.textContent=j&&j.error==='exists'?'That email already has an account. Please log in.':'Could not create your account right now. Please check your internet and try again.'}
      });
    }
  };
}
})();
