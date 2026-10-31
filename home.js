(function(){
var $=function(s,r){return (r||document).querySelector(s)},$$=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))};
document.documentElement.classList.add('js');
var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;

/* nav border + mobile menu */
var nav=$('#nav');addEventListener('scroll',function(){nav.classList.toggle('scrolled',scrollY>8)},{passive:true});
var mb=$('#menu-btn'),menu=$('#menu');
mb.addEventListener('click',function(){var o=mb.getAttribute('aria-expanded')==='true';mb.setAttribute('aria-expanded',String(!o));menu.hidden=o});
$$('#menu a').forEach(function(a){a.addEventListener('click',function(){mb.setAttribute('aria-expanded','false');menu.hidden=true})});

/* reveal on scroll */
var rv=$$('.head,.case,.ind,.svc,.offer,.steps li,.about,.calc,.tools a,.faq,.form,.strip-in>div');
if('IntersectionObserver' in window&&!reduce){rv.forEach(function(e){e.classList.add('rv')});
 var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){var sib=e.target.parentNode?$$('.rv',e.target.parentNode).indexOf(e.target):0;e.target.style.transitionDelay=Math.min(Math.max(sib,0),5)*70+'ms';e.target.classList.add('in');io.unobserve(e.target)}})},{rootMargin:'0px 0px -8% 0px'});
 rv.forEach(function(e){io.observe(e)})}

/* hero: wires from each chip into the screen */
var merge=$('#merge'),svg=$('#wires'),screen=$('#screen'),chips=$$('.chips li');
function draw(){if(!merge)return;var m=merge.getBoundingClientRect(),s=screen.getBoundingClientRect();
 var tx=s.left-m.left+2,ty0=s.top-m.top+s.height*.28,ty1=s.top-m.top+s.height*.72,html='';
 chips.forEach(function(c,i){var r=c.getBoundingClientRect(),x=r.right-m.left,y=r.top-m.top+r.height/2,ty=ty0+(ty1-ty0)*(i/(chips.length-1)),mx=(x+tx)/2;
  var d='M'+x+' '+y+' C'+mx+' '+y+' '+mx+' '+ty+' '+tx+' '+ty;
  html+='<path d="'+d+'"/><path class="flow" d="'+d+'" style="animation-delay:'+(-i*.64)+'s"/><circle cx="'+tx+'" cy="'+ty+'" r="3.5" fill="#FF5B1F"/>'});
 svg.innerHTML=html}
if(merge){draw();addEventListener('resize',draw);if(document.fonts)document.fonts.ready.then(draw);
 if(!reduce){var t=0;setInterval(function(){chips.forEach(function(c,i){c.classList.toggle('hit',i===t%chips.length)});t++},1100);
  var tick=function(){draw();requestAnimationFrame(tick)};requestAnimationFrame(tick)}}

/* contact chips */
var form=$('#form'),ta=form&&form.querySelector('textarea[name=goal]'),last='';
var S={'Spreadsheets and texts':'We run things from spreadsheets and texts, and it is getting hard to keep track. ','Too much paperwork':'We still do a lot of paperwork by hand and I want it to be simpler. ','I need a website':'I need a clear website that gets customers to contact me. ','Something else':''};
$$('.chip').forEach(function(c){c.addEventListener('click',function(){var txt=S[c.getAttribute('data-t')];
 $$('.chip').forEach(function(o){o.setAttribute('aria-pressed',o===c?'true':'false')});
 var v=ta.value;if(!v.trim()||v===last){ta.value=txt;last=txt}else if(txt&&v.indexOf(txt.trim())<0){ta.value=v.replace(/\s*$/,'')+' '+txt;last=''}
 ta.focus()})});

/* contact form -> /api/inquiry */
var t0=Date.now();
if(form){var st=$('#status'),btn=form.querySelector('button[type=submit]');
 var say=function(m){st.textContent=m};
 var fail=function(){btn.disabled=false;say('That did not send. Please email sonysimon.business@gmail.com instead.')};
 form.addEventListener('submit',function(e){e.preventDefault();var f=new FormData(form),name=(f.get('name')||'').trim(),email=(f.get('email')||'').trim(),goal=(f.get('goal')||'').trim();
  if(!name||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||!goal){say('Please add your name, a valid email and a sentence about the problem.');return}
  btn.disabled=true;say('Sending…');var ctl=window.AbortController?new AbortController():null,tm=setTimeout(function(){ctl&&ctl.abort()},12000);
  fetch('/api/inquiry',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:name,email:email,goal:goal,page:document.title,website:f.get('website')||'',t:Date.now()-t0}),signal:ctl?ctl.signal:undefined})
  .then(function(r){clearTimeout(tm);return r.json().then(function(j){return r.ok&&j&&j.ok},function(){return false})})
  .then(function(ok){if(ok){say('Thanks, '+name.split(' ')[0]+'. I will reply by email soon.');form.reset();btn.disabled=false}else fail()})
  .catch(function(){clearTimeout(tm);fail()})})}

/* calculator */
var P=$('#c-ppl'),H=$('#c-hrs'),R=$('#c-rate');
if(P){var fmt=function(n){return '$'+Math.round(n).toLocaleString('en-US')},num=function(n){return Math.round(n).toLocaleString('en-US')};
 var calc=function(){var h=+P.value*+H.value*52,c=h*+R.value;
  [[P,'o-ppl',P.value],[H,'o-hrs',H.value],[R,'o-rate','$'+R.value]].forEach(function(x){$('#'+x[1]).textContent=x[2];x[0].style.setProperty('--p',((x[0].value-x[0].min)/(x[0].max-x[0].min)*100)+'%')});
  $('#co-cost').textContent=fmt(c);$('#co-hrs').textContent=num(h);$('#co-half-h').textContent=num(h/2)+' hours';$('#co-half-c').textContent=fmt(c/2)};
 [P,H,R].forEach(function(i){i.addEventListener('input',calc)});calc();
 $('#calc-cta').addEventListener('click',function(){if(ta&&!ta.value.trim())ta.value='My rough estimate: '+P.value+' people, '+H.value+' hours a week each, about '+$('#co-cost').textContent+' a year on manual work. ';})}
})();
