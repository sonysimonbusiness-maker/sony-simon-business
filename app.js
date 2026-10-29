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
var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
/* header: solid bar on inner pages, floating glass pill with progress on the home page */
var hdr=$('#hdr'),prog=$('#prog'),home=hdr.classList.contains('on-dark'),amb=$$('.ambient i');
function onScroll(){var y=pageYOffset,max=document.documentElement.scrollHeight-innerHeight;
 if(home){hdr.classList.toggle('pill',y>90);if(prog)prog.style.setProperty('--p',max>0?(y/max).toFixed(4):0);
  if(!reduce)amb.forEach(function(el,i){var k=[.07,-.05,.09][i];el.style.transform='translate3d('+(Math.sin(y/900+i*2)*60)+'px,'+(-y*k)+'px,0)'})}
 else hdr.classList.toggle('solid',y>40)}
onScroll();addEventListener('scroll',onScroll,{passive:true});
/* reveals */
var rv=$$('.work h2,.sub,.wk,.bi,.wc,.steps li,.aiNote,.ab>*,.ogrid article,.faq details,.build h2,.who h2,.how h2,.offers h2,.faq h2,.contact .wrap>*,.rgrid a,.real h2');
rv.forEach(function(x){x.classList.add('rv')});
if('IntersectionObserver' in window){var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}})},{threshold:.12});rv.forEach(function(x){io.observe(x)})}else rv.forEach(function(x){x.classList.add('in')});

/* problem scene: looping slider */
var slides=$$('.sl'),dots=$$('#sdots i'),capEl=$('#fx-cap'),idx=0,timer=null,LOOP=4200;
var CAPS=['One screen. Everyone sees the same thing.','Drivers check in and scan paperwork from the cab.','Yesterday’s numbers, ready every morning.','Staff clock in and send receipts from a phone.','Every store, every shift, in one view.','Customers order online. You get the order.'];
function show(n){n=(n+slides.length)%slides.length;if(!slides.length||(n===idx&&slides[idx].classList.contains('on')))return;
 var prev=slides[idx],nx=slides[n];idx=n;prev.classList.remove('on');prev.classList.add('out');setTimeout(function(){prev.classList.remove('out')},980);
 nx.classList.remove('out');void nx.offsetWidth;nx.classList.add('on');
 dots.forEach(function(d,k){d.classList.remove('on','done');if(k<idx)d.classList.add('done')});void dots[idx].offsetWidth;dots[idx].classList.add('on');
 capEl.classList.add('sw');setTimeout(function(){capEl.textContent=CAPS[idx];capEl.classList.remove('sw')},300)}
function startLoop(){if(timer||reduce)return;dots.forEach(function(d){d.style.setProperty('--dur',LOOP+'ms')});dots[idx].classList.remove('on');void dots[idx].offsetWidth;dots[idx].classList.add('on');timer=setInterval(function(){show(idx+1)},LOOP)}
function stopLoop(){clearInterval(timer);timer=null}
function resetLoop(){stopLoop();if(idx!==0){slides.forEach(function(s,k){s.classList.remove('out','on');if(k===0)s.classList.add('on')});idx=0;capEl.textContent=CAPS[0]}dots.forEach(function(d,k){d.classList.remove('on','done');if(k===0)d.classList.add('on')})}
dots.forEach(function(d,k){d.addEventListener('click',function(){show(k);if(timer){stopLoop();startLoop()}})});
var slEl=$('#slider');if(slEl){slEl.addEventListener('mouseenter',stopLoop);slEl.addEventListener('mouseleave',function(){if(slEl.dataset.live==='1')startLoop()})}
if(!pin&&slEl&&'IntersectionObserver' in window){new IntersectionObserver(function(es){slEl.dataset.live=es[0].isIntersecting?'1':'0';if(es[0].isIntersecting)startLoop();else stopLoop()},{threshold:.4}).observe(slEl)}

if(!window.gsap)return;
gsap.registerPlugin(ScrollTrigger);
if(!reduce){
 gsap.from('.hero h1,.hero .lede,.hero .cta,.hero .for,.hero .kick',{y:30,opacity:0,duration:.8,stagger:.1,ease:'power3.out'});
 gsap.from('.hc',{y:40,opacity:0,duration:1,stagger:.25,delay:.6,ease:'power3.out'});
 gsap.to('.wall',{y:120,ease:'none',scrollTrigger:{trigger:'.hero',start:'top top',end:'bottom top',scrub:true}});
}
/* chaos -> clean scene (desktop) */
if(pin&&$('.fix-stage')){
 var kick=$('#fx-kick'),title=$('#fx-title'),stage=$('.fix-stage'),svg=$('#tangle');
 var drawTangle=function(){var W=stage.offsetWidth,H=stage.offsetHeight,notes=$$('.chaos .note'),c=notes.map(function(n){return [n.offsetLeft+n.offsetWidth/2,n.offsetTop+n.offsetHeight/2]});
  var pairs=[[0,6],[6,1],[0,2],[2,4],[4,7],[7,3],[3,5],[5,9],[1,8],[8,3],[2,6],[9,4]],d='';
  pairs.forEach(function(p,i){var a=c[p[0]],b=c[p[1]];if(!a||!b)return;var mx=(a[0]+b[0])/2+(i%2?60:-60),my=(a[1]+b[1])/2+(i%3?-50:50);d+='<path d="M'+a[0]+' '+a[1]+' Q'+mx+' '+my+' '+b[0]+' '+b[1]+'"/>'});
  svg.setAttribute('viewBox','0 0 '+W+' '+H);svg.innerHTML=d};
 drawTangle();addEventListener('resize',drawTangle);
 var live=false;
 var tl=gsap.timeline({scrollTrigger:{trigger:'.fix-stage',start:'top top',end:'+=3400',scrub:.6,pin:true,anticipatePin:1,
  onUpdate:function(s){var p=s.progress,after=p>.37;
   if(after&&title.dataset.s!=='a'){title.dataset.s='a';kick.textContent='The fix';title.textContent='Simple tools that fit.'}else if(!after&&title.dataset.s==='a'){title.dataset.s='';kick.textContent='The problem';title.textContent='Work lives in ten places.'}
   if(p>.56&&!live){live=true;slEl.dataset.live='1';startLoop()}else if(p<.5&&live){live=false;slEl.dataset.live='0';resetLoop()}}}});
 gsap.set('.slider',{xPercent:-50,yPercent:-50,y:60,scale:.9});
 tl.to('.tangle',{opacity:0,duration:.4},.8)
   .to('.chaos .note',{x:function(i,el){var r=el.getBoundingClientRect();return innerWidth/2-(r.left+r.width/2)},y:function(i,el){var r=el.getBoundingClientRect();return innerHeight/2-(r.top+r.height/2)},rotate:0,scale:.2,opacity:0,stagger:.04,duration:.5,ease:'power2.in'},.9)
   .to('.fix-tint.warm',{opacity:0,duration:.8},1)
   .to('.fix-tint.cool',{opacity:1,duration:.8},1.1)
   .to('.slider',{opacity:1,y:0,scale:1,duration:.6,ease:'power2.out'},1.5)
   .to('.fix-cap,.sdots',{opacity:1,duration:.3},2.1)
   .to({},{duration:1.7});
}
})();
/* showcase: 3D coverflow */
(function(){
var st=document.getElementById('stage');if(!st||!window.CONCEPTS)return;
var $$=function(s,c){return [].slice.call((c||document).querySelectorAll(s))};
var shotsBox=document.getElementById('shots'),shots=$$('.shot',st),th=$$('#thumbs .th'),bar=document.getElementById('stageBar'),T=document.getElementById('capT'),P=document.getElementById('capP'),ambs=document.getElementById('ambs');
var cur=0,t0=performance.now(),paused=false,DUR=5200,fanned=false,vis=false,N=shots.length;
var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
shots.forEach(function(s){var im=document.createElement('img');im.src=s.querySelector('img').src;im.alt='';ambs.appendChild(im)});var ai=$$('img',ambs);
function layout(){var w=shots[0].offsetWidth,small=innerWidth<900;
 shots.forEach(function(s,i){var d=((i-cur+N+Math.floor(N/2))%N)-Math.floor(N/2);if(d>2)d-=N;var ad=Math.abs(d),sg=d<0?-1:1,x=0,z=0,ry=0,sc=1,op=1;
  if(!fanned){sc=.5;op=0}else if(ad===0){}else if(ad===1){x=sg*w*(small?.5:.64);z=-160;ry=-sg*(small?28:38);sc=.78;op=.9}else if(ad===2){x=sg*w*(small?.78:1.05);z=-320;ry=-sg*45;sc=.58;op=.4}else{sc=.4;op=0}
  s.style.transform='translate(-50%,-50%) translateX('+x+'px) translateZ('+z+'px) rotateY('+ry+'deg) scale('+sc+')';s.style.opacity=op;s.style.zIndex=10-ad;s.style.filter=ad===0?'none':'brightness('+(ad===1?.62:.4)+')';s.style.pointerEvents=ad>2?'none':'auto'});
 th.forEach(function(b,k){b.classList.toggle('on',k===cur);if(k!==cur)b.style.removeProperty('--p')});ai.forEach(function(a,k){a.classList.toggle('on',k===cur)});}
function go(i){cur=(i+N)%N;T.style.opacity=0;setTimeout(function(){T.textContent=CONCEPTS[cur][1];P.textContent=CONCEPTS[cur][2];T.style.opacity=1},180);layout();t0=performance.now()}
T.style.transition='opacity .25s';
th.forEach(function(b){b.onclick=function(){go(+b.dataset.i)}});
document.getElementById('prevB').onclick=function(e){e.stopPropagation();go(cur-1)};document.getElementById('nextB').onclick=function(e){e.stopPropagation();go(cur+1)};
var lb=document.getElementById('lb');
shots.forEach(function(s,i){s.onclick=function(){if(i===cur&&lb){lb.querySelector('img').src=s.querySelector('img').src;lb.hidden=false}else go(i)}});
if(lb){lb.onclick=function(){lb.hidden=true};addEventListener('keydown',function(e){if(e.key==='Escape')lb.hidden=true})}
if('IntersectionObserver' in window)new IntersectionObserver(function(e){vis=e[0].isIntersecting;if(vis){t0=performance.now();if(!fanned){setTimeout(function(){fanned=true;layout()},150)}}},{threshold:.3}).observe(st);else{vis=true;fanned=true}
(function f(n){if(vis&&!paused&&!reduce&&fanned){var p=Math.min(1,(n-t0)/DUR);bar.style.width=p*100+'%';th[cur].style.setProperty('--p',p);if(p>=1)go(cur+1)}requestAnimationFrame(f)})(performance.now());
st.addEventListener('mouseenter',function(){paused=true});
st.addEventListener('mouseleave',function(){paused=false;t0=performance.now();shotsBox.style.setProperty('--ry','0deg');shotsBox.style.setProperty('--rx','0deg')});
if(matchMedia('(pointer:fine)').matches&&!reduce)st.addEventListener('mousemove',function(e){var r=st.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;shotsBox.style.setProperty('--ry',(x*7)+'deg');shotsBox.style.setProperty('--rx',(-y*4)+'deg');st.style.setProperty('--mx',(x+.5)*100+'%');st.style.setProperty('--my',(y+.5)*100+'%')});
var sx=null;st.addEventListener('pointerdown',function(e){sx=e.clientX});st.addEventListener('pointerup',function(e){if(sx!==null&&Math.abs(e.clientX-sx)>60){go(cur+(e.clientX<sx?1:-1))}sx=null});
st.addEventListener('keydown',function(e){if(e.key==='ArrowRight'){e.preventDefault();go(cur+1)}else if(e.key==='ArrowLeft'){e.preventDefault();go(cur-1)}});addEventListener('resize',layout);layout();
})();
