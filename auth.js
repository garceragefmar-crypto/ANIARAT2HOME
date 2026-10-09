/* Demo accounts stored in this browser (school project — not secure). Admin login: admin@aniarat2home.com / admin123 */
(function(){
var K='aa_users',S='aa_session',ADMIN={name:'Admin',email:'admin@aniarat2home.com',phone:'',pw:'admin123',role:'admin',ts:0};
function get(k,d){try{var v=JSON.parse(localStorage.getItem(k));return v==null?d:v}catch(e){return d}}
function users(){var u=get(K,[]);if(!u.some(function(x){return x.role==='admin'})){u.unshift(ADMIN);localStorage.setItem(K,JSON.stringify(u))}return u}
function user(){var e=get(S,null);return e?users().filter(function(x){return x.email===e})[0]||null:null}
function go(u){var n=new URLSearchParams(location.search).get('next');location.href=u.role==='admin'?'admin.html':(/^[a-z]+\.html$/.test(n||'')?n:'shop.html')}
window.AAauth={user:user,users:users,logout:function(){localStorage.removeItem(S);location.href='index.html'}};
var page=document.body.dataset.page,f=document.getElementById('f'),m=document.getElementById('msg');
if(page==='login'||page==='signup'){
  document.querySelectorAll('.switch a').forEach(function(a){a.href+=location.search});
  if(new URLSearchParams(location.search).get('next')&&page==='login')document.querySelector('.sub').textContent='Please log in to place your order.';
  document.querySelectorAll('.pw button').forEach(function(b){b.onclick=function(){var i=b.previousElementSibling,s=i.type==='password';i.type=s?'text':'password';b.textContent=s?'Hide':'Show'}});
  f.onsubmit=function(e){e.preventDefault();var v=function(id){return document.getElementById(id).value.trim()},em=v('email').toLowerCase(),pw=document.getElementById('pw').value,err='';
    if(page==='login'){var u=users().filter(function(x){return x.email===em&&x.pw===pw})[0];
      if(!em||!pw)err='Please enter your email and password.';else if(!u)err='Wrong email or password.';
      m.textContent=err;if(err)return;localStorage.setItem(S,JSON.stringify(u.email));go(u)}
    else{var all=users();
      if(!v('name')||!em||!pw)err='Please fill in your name, email and password.';
      else if(!/^\S+@\S+\.\S+$/.test(em))err='Please enter a valid email address.';
      else if(pw.length<8)err='Password must be at least 8 characters.';
      else if(pw!==document.getElementById('pw2').value)err='Passwords do not match.';
      else if(!document.getElementById('terms').checked)err='Please accept the terms to continue.';
      else if(all.some(function(x){return x.email===em}))err='That email already has an account. Please log in.';
      m.textContent=err;if(err)return;var u2={name:v('name'),email:em,phone:v('phone'),pw:pw,role:'customer',ts:Date.now()};
      all.push(u2);localStorage.setItem(K,JSON.stringify(all));localStorage.setItem(S,JSON.stringify(em));go(u2)}
  };
}
})();
