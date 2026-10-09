(function(){
var I={
home:'<svg viewBox="0 0 24 24"><path stroke="none" d="M12 2.5 1.5 12H5v9h5v-6h4v6h5v-9h3.5z"/></svg>',
leaf:'<svg viewBox="0 0 24 24"><path stroke="none" d="M21 3C11 3 4 8 4 15.5c0 1.7.6 3 1.6 4C6.2 14.5 9 10.5 14 8.500c-4 2.5-6.5 6-7.2 10.7 1 .5 2.1.8 3.2.8C17 20 21 12 21 3z"/></svg>',
cart:'<svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3.500h3l2.6 11h10.800l2.2-8.500H6.200M9 20h.1M17 20h.1" stroke-width="2.6"/><path d="M9.5 7v6M13 7v6M16.5 7v6"/></svg>',
phone:'<svg viewBox="0 0 24 24"><path stroke="none" d="M6.6 10.800a15 15 0 0 0 6.6 6.600l2.2-2.200c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1A17 17 0 0 1 3 4c0-.6.4-1 1-1h3.500c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .700-.2 1z"/></svg>',
info:'<svg viewBox="0 0 24 24" fill="none" stroke-width="1.5"><circle cx="12" cy="12" r="10.5"/><circle cx="12.5" cy="6.8" r="1.2" fill="#fff" stroke="none"/><path d="M11.5 10.500h1.800l-1.2 6.5" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
chat:'<svg viewBox="0 0 24 24" fill="none" stroke-width="1.7" stroke-linejoin="round"><path d="M5 3.500h14a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-7l-5 4v-4H5a2 2 0 0 1-2-2v-9a2 2 0 0 1 2-2z"/><circle cx="8" cy="10" r="1.2" fill="#fff" stroke="none"/><circle cx="12" cy="10" r="1.2" fill="#fff" stroke="none"/><circle cx="16" cy="10" r="1.2" fill="#fff" stroke="none"/></svg>'};
var L=[['index.html','HOME','home'],['shop.html','SHOP','leaf'],['orders.html','ORDERS','cart'],['contact.html','CONTACT','phone'],['about.html','ABOUT US','info'],['feedback.html','FEEDBACK','chat']];
var h='<div class="menu-back"></div><aside class="menu" id="menu" aria-label="Menu" aria-hidden="true"><button class="menu-x" aria-label="Close menu">&times;</button>'+
'<a class="stack" href="index.html"><img src="assets/logo-circle.png" alt=""><img src="assets/wordmark.png" alt="AniArat2Home"></a><ul>';
L.forEach(function(l){h+='<li><a href="'+l[0]+'"'+(l[1]==='FEEDBACK'?' class="plain"':'')+'>'+I[l[2]]+l[1]+'</a></li>'});
var U=null;try{var se=JSON.parse(localStorage.getItem('aa_session')),us=JSON.parse(localStorage.getItem('aa_users'))||[];U=us.filter(function(x){return x.email===se})[0]||null}catch(e){}
h+='</ul><div class="auth">'+(U?'<span>Hi, '+U.name.replace(/[<>&"]/g,'')+'</span>'+(U.role==='admin'?'<a href="admin.html">ADMIN PANEL</a>':'')+'<a href="#" id="lo">LOG OUT</a>':'<a href="login.html">LOG IN</a><a href="signup.html">SIGN UP</a>')+'</div></aside>';
document.body.insertAdjacentHTML('beforeend',h);
var lo=document.getElementById('lo');if(lo)lo.addEventListener('click',function(e){e.preventDefault();localStorage.removeItem('aa_session');location.href='index.html'});
var b=document.querySelector('.menu-btn'),m=document.getElementById('menu');
function set(o){document.body.classList.toggle('menu-open',o);b.setAttribute('aria-expanded',o);m.setAttribute('aria-hidden',!o);if(o)m.querySelector('.menu-x').focus();else b.focus()}
b.addEventListener('click',function(){set(!document.body.classList.contains('menu-open'))});
document.querySelector('.menu-back').addEventListener('click',function(){set(false)});
m.querySelector('.menu-x').addEventListener('click',function(){set(false)});
document.addEventListener('keydown',function(e){if(e.key==='Escape')set(false)});
})();
