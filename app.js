(function(){
var $=function(s,c){return (c||document).querySelector(s)},$$=function(s,c){return [].slice.call((c||document).querySelectorAll(s))};
var pin=document.documentElement.classList.contains('pin'),calm=document.documentElement.classList.contains('calm');
/* form */
var form=$('#form'),note=$('#note');
var HOOK="https://hook.us2.make.com/oe24qeoj05tg1b5bgqatd0vugcatnpmh";
if(form)form.addEventListener('submit',function(e){e.preventDefault();var f=new FormData(form),name=(f.get('name')||'').trim(),email=(f.get('email')||'').trim(),goal=(f.get('goal')||'').trim();
 if(!name||!goal||!/^\S+@\S+\.\S+$/.test(email)){note.textContent='Please add your name, a valid email and a sentence about what you need.';note.className='form-note err';return}
 var btn=form.querySelector('button[type=submit]');btn.disabled=true;note.className='form-note';note.textContent='Sending…';
 var body=new URLSearchParams({name:name,email:email,goal:goal,page:document.title,website:f.get('website')||''});
 var fb=function(){note.textContent='Could not send. Opening your email app instead.';location.href='mailto:sonysimon.business@gmail.com?subject='+encodeURIComponent('Project inquiry from '+name)+'&body='+encodeURIComponent('Name: '+name+'\nEmail: '+email+'\n\n'+goal);btn.disabled=false};
 fetch(HOOK,{method:'POST',mode:'no-cors',body:body}).then(function(){note.textContent='Thanks, '+name.split(' ')[0]+'. I will reply by email soon.';form.reset();btn.disabled=false}).catch(fb)});
/* smooth anchors */
$$('a[href^="#"]').forEach(function(a){a.addEventListener('click',function(e){var id=a.getAttribute('href');if(id.length<2)return;var t=$(id);if(!t)return;e.preventDefault();window.scrollTo({top:t.getBoundingClientRect().top+pageYOffset,behavior:calm?'auto':'smooth'});history.replaceState(null,'',id)})});
var hdr=$('#hdr');function hs(){hdr.classList.toggle('solid',pageYOffset>40)}hs();addEventListener('scroll',hs,{passive:true});
/* reveals */
var rv=$$('.work h2,.sub,.wk,.bi,.wc,.steps li,.aiNote,.ab>*,.ogrid article,.faq details,.build h2,.who h2,.how h2,.offers h2,.faq h2,.contact .wrap>*');
rv.forEach(function(x){x.classList.add('rv')});
if('IntersectionObserver' in window){var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}})},{threshold:.12});rv.forEach(function(x){io.observe(x)})}else rv.forEach(function(x){x.classList.add('in')});
if(!window.gsap)return;
gsap.registerPlugin(ScrollTrigger);
/* hero: notes drift */
if(!matchMedia('(prefers-reduced-motion: reduce)').matches){
 gsap.from('.hero h1,.hero .lede,.hero .cta,.hero .for,.hero .kick',{y:30,opacity:0,duration:.8,stagger:.1,ease:'power3.out'});
}
/* chaos -> clean scene */
if(pin&&$('.fix-stage')){
 var kick=$('#fx-kick'),title=$('#fx-title'),cap=$('#fx-cap');
 var tl=gsap.timeline({scrollTrigger:{trigger:'.fix-stage',start:'top top',end:'+=2200',scrub:.6,pin:true,anticipatePin:1,
  onUpdate:function(s){var after=s.progress>.55;if(after&&title.dataset.s!=='a'){title.dataset.s='a';kick.textContent='The fix';title.textContent='One simple tool.'}else if(!after&&title.dataset.s==='a'){title.dataset.s='';kick.textContent='The problem';title.textContent='Work lives in ten places.'}}}});
 gsap.set('.solved',{xPercent:-50,yPercent:-50,y:60,scale:.9});
 tl.to('.chaos .note',{x:function(i,el){var r=el.getBoundingClientRect(),cx=innerWidth/2;return cx-(r.left+r.width/2)},y:function(i,el){var r=el.getBoundingClientRect(),cy=innerHeight/2;return cy-(r.top+r.height/2)},rotate:0,scale:.2,opacity:0,stagger:.04,duration:.5,ease:'power2.in'},.9)
   .to('.solved',{opacity:1,y:0,scale:1,duration:.6,ease:'power2.out'},1.5)
   .to('.fix-cap',{opacity:1,duration:.3},2.2)
   .to({},{duration:.6});
}
})();
/* work tabs */
(function(){
var $=function(s,c){return (c||document).querySelector(s)},$$=function(s,c){return [].slice.call((c||document).querySelectorAll(s))};
if(!$('.tabs'))return;
var urls={dispatch:'dispatch.example.com',quote:'quotes.example.com',stores:'checks.example.com'};
$$('.tab').forEach(function(t){t.onclick=function(){$$('.tab').forEach(function(x){x.classList.toggle('on',x===t)});$$('.pane').forEach(function(p){p.classList.toggle('on',p.id==='p-'+t.dataset.t)});$('#appUrl').textContent=urls[t.dataset.t];if(t.dataset.t==='stores'){$$('.bar i').forEach(function(i){i.style.animation='none';i.offsetHeight;i.style.animation=''})}}});
var msgs=['Load 4412 left Erie at 8:10 AM. Alex last checked in 12 minutes ago.','Load 4413 delivered. Signed proof of delivery saved.','No driver yet. Closest available: Priya, 14 miles away. (Example: tap Assign in a real tool.)'];
$$('.ld').forEach(function(b){b.onclick=function(){$$('.ld').forEach(function(x){x.classList.toggle('on',x===b)});$('#ldmsg').textContent=msgs[b.dataset.i]}});
var spd=1;function q(){var mi=+$('#qRoute').value,p=+$('#qPal').value,price=Math.round((85+mi*.9+p*14)*spd);$('#qPalN').textContent=p;$('#qPrice').textContent='$'+price;$('#qMeta').textContent=(spd>1?'Next-day delivery':'Delivery in '+(mi>150?2:1)+' day'+(mi>150?'s':''))+' · fixed price'}
$('#qRoute').onchange=q;$('#qPal').oninput=q;$$('.seg button').forEach(function(b){b.onclick=function(){$$('.seg button').forEach(function(x){x.classList.toggle('on',x===b)});spd=+b.dataset.s;q()}});q();
$('#review').onclick=function(){var s=$('#sb3');s.classList.add('fixed');var c=$('#sb3c');c.className='chip g';c.textContent='Reviewed';this.textContent='Reviewed ✓';this.disabled=true};
/* agent feed */
var E=[['06:02','Checked yesterday’s cash and sales at <b>3 stores</b>.'],['06:02','<b>Store 3</b> is $42 off. Flagged for you.','Review'],['06:15','New quote request from <b>Dana Freight</b> (4 pallets, Erie to Akron).'],['06:15','Drafted a reply with a price.','Approve and send'],['06:40','Load <b>#4415</b> has no driver. Suggested <b>Priya</b> (closest).','Assign Priya'],['07:00','Morning summary is ready for you.']];
var list=$('#feedList'),started=false;
function add(i){var e=E[i],d=document.createElement('div');d.className='fe';d.innerHTML='<time>'+e[0]+'</time><div><p>'+e[1]+'</p>'+(e[2]?'<button class="act">'+e[2]+'</button>':'')+'</div>';var b=d.querySelector('.act');if(b)b.onclick=function(){b.textContent={'Review':'Reviewed by you','Approve and send':'Sent by you','Assign Priya':'Assigned by you'}[e[2]];b.classList.add('done')};list.appendChild(d)}
function run(){if(started)return;started=true;var i=0;(function n(){if(i>=E.length){setTimeout(function(){list.innerHTML='';i=0;n()},9000);return}add(i++);setTimeout(n,1500)})()}
if('IntersectionObserver' in window){new IntersectionObserver(function(es,o){if(es[0].isIntersecting){run();o.disconnect()}},{threshold:.3}).observe($('#feed'))}else run();
})();
/* showcase */
(function(){
var st=document.getElementById('stage');if(!st||!window.CONCEPTS)return;
var $$=function(s,c){return [].slice.call((c||document).querySelectorAll(s))};
var shots=$$('.shot',st),th=$$('#thumbs .th'),bar=document.getElementById('stageBar'),T=document.getElementById('capT'),P=document.getElementById('capP'),cur=0,t0=0,paused=false,DUR=5500,raf;
var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
function go(i){cur=(i+shots.length)%shots.length;shots.forEach(function(s,k){s.classList.toggle('on',k===cur)});th.forEach(function(s,k){s.classList.toggle('on',k===cur)});T.textContent=CONCEPTS[cur][1];P.textContent=CONCEPTS[cur][2];t0=performance.now()}
th.forEach(function(b){b.onclick=function(){go(+b.dataset.i)}});
function tick(n){if(!paused&&!reduce){var p=(n-t0)/DUR;bar.style.width=Math.min(100,p*100)+'%';if(p>=1)go(cur+1)}raf=requestAnimationFrame(tick)}
var vis=true;if('IntersectionObserver' in window)new IntersectionObserver(function(e){vis=e[0].isIntersecting;if(vis){t0=performance.now()}},{threshold:.2}).observe(st);
function loop(n){if(vis)tick(n);else raf=requestAnimationFrame(loop)}
t0=performance.now();raf=requestAnimationFrame(function f(n){if(vis){if(!paused&&!reduce){var p=(n-t0)/DUR;bar.style.width=Math.min(100,p*100)+'%';if(p>=1)go(cur+1)}}requestAnimationFrame(f)});
st.addEventListener('mouseenter',function(){paused=true});st.addEventListener('mouseleave',function(){paused=false;t0=performance.now();st.style.transform='';});
if(matchMedia('(pointer:fine)').matches&&!reduce)st.addEventListener('mousemove',function(e){var r=st.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;st.style.transform='perspective(1400px) rotateY('+(x*6)+'deg) rotateX('+(-y*5)+'deg)';st.style.setProperty('--mx',(x+.5)*100+'%');st.style.setProperty('--my',(y+.5)*100+'%')});
var lb=document.getElementById('lb');if(lb){var im=lb.querySelector('img');st.onclick=function(){im.src=shots[cur].querySelector('img').src;lb.hidden=false};lb.onclick=function(){lb.hidden=true};addEventListener('keydown',function(e){if(e.key==='Escape')lb.hidden=true;if(!lb.hidden)return;})}
if(window.gsap&&window.ScrollTrigger&&!reduce){gsap.from(st,{rotateX:14,y:70,scale:.92,opacity:.3,transformPerspective:1400,ease:'none',scrollTrigger:{trigger:st,start:'top 95%',end:'top 40%',scrub:.6},onComplete:function(){gsap.set(st,{clearProps:'transform'})}})}
})();
