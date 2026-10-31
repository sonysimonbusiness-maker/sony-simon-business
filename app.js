(function(){
var $=function(s,c){return (c||document).querySelector(s)},$$=function(s,c){return [].slice.call((c||document).querySelectorAll(s))};
var pin=document.documentElement.classList.contains('pin'),calm=document.documentElement.classList.contains('calm');
/* form */
var form=$('#form'),note=$('#note');
var MAIL='sonysimon.business@gmail.com',t0=Date.now();
if(form)form.addEventListener('submit',function(e){e.preventDefault();var f=new FormData(form),name=(f.get('name')||'').trim(),email=(f.get('email')||'').trim(),goal=(f.get('goal')||'').trim();
 var say=function(h,cls){note.className='form-note'+(cls?' '+cls:'');note.innerHTML=h};
 if(!name||!goal||!/^\S+@\S+\.\S+$/.test(email)){say('Please add your name, a valid email and a sentence about what you need.','err');return}
 var btn=form.querySelector('button[type=submit]');btn.disabled=true;say('Sending\u2026');
 var fail=function(){btn.disabled=false;say('That did not go through. Your message is still here. Please try again, or email me at <a href="mailto:'+MAIL+'?subject='+encodeURIComponent('Project inquiry from '+name)+'&body='+encodeURIComponent(goal)+'">'+MAIL+'</a>.','err')};
 var ctl=window.AbortController?new AbortController():null,tm=setTimeout(function(){if(ctl)ctl.abort()},12000);
 fetch('/api/inquiry',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:name,email:email,goal:goal,page:document.title,website:f.get('website')||'',t:Date.now()-t0}),signal:ctl?ctl.signal:undefined})
 .then(function(r){clearTimeout(tm);return r.json().then(function(j){return{ok:r.ok&&j&&j.ok}},function(){return{ok:false}})})
 .then(function(r){if(r.ok){say('Thanks, '+name.split(' ')[0]+'. I will reply by email soon.');form.reset();btn.disabled=false}else fail()})
 .catch(function(){clearTimeout(tm);fail()})});
/* contact picker: tap a topic, get a starter sentence */
(function(){var chips=$$('.chip'),ta=form&&form.querySelector('textarea[name=goal]');if(!chips.length||!ta)return;
var S={'Spreadsheets and texts':'We run things from spreadsheets and texts, and it is getting hard to keep track. ','Too much paperwork':'We still do a lot of paperwork by hand and I want it to be simpler. ','I need a website':'I need a clear website that gets customers to contact me. ','Something else':''};var last='';
chips.forEach(function(c){c.addEventListener('click',function(){var t=c.getAttribute('data-t'),txt=S[t];
 chips.forEach(function(o){o.setAttribute('aria-pressed',o===c?'true':'false')});
 var v=ta.value;if(!v.trim()||v===last){ta.value=txt;last=txt}else if(txt&&v.indexOf(txt.trim())<0){ta.value=v.replace(/\s*$/,'')+' '+txt;last=''}
 ta.focus();try{ta.setSelectionRange(ta.value.length,ta.value.length)}catch(e){}})});
if(ta)ta.addEventListener('input',function(){if(ta.value!==last)last=''})})();
/* mobile sticky call-to-action: shows after the intro, hides at the form */
(function(){var m=document.getElementById('mcta'),hero=document.getElementById('hero'),ct=document.getElementById('contact');if(!m||!hero||!ct||!('IntersectionObserver' in window))return;
var pastHero=false,atForm=false,upd=function(){var on=pastHero&&!atForm;m.classList.toggle('on',on);m.setAttribute('aria-hidden',on?'false':'true');m.tabIndex=on?0:-1};
new IntersectionObserver(function(e){pastHero=!e[0].isIntersecting;upd()},{threshold:0}).observe(hero);
new IntersectionObserver(function(e){atForm=e[0].isIntersecting;upd()},{threshold:.15}).observe(ct)})();
/* calculator: what is manual work costing you */
(function(){var P=document.getElementById('c-ppl'),H=document.getElementById('c-hrs'),R=document.getElementById('c-rate');if(!P||!H||!R)return;
var fmt=function(n){return '$'+Math.round(n).toLocaleString('en-US')},num=function(n){return Math.round(n).toLocaleString('en-US')};
var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches,shown={c:0,h:0},raf=0,cur={c:0,h:0};
var el={cost:document.getElementById('co-cost'),hrs:document.getElementById('co-hrs'),hh:document.getElementById('co-half-h'),hc:document.getElementById('co-half-c')};
function paint(c,h){el.cost.textContent=fmt(c);el.hrs.textContent=num(h)}
function calc(){var ppl=+P.value,hrs=+H.value,rate=+R.value,h=ppl*hrs*52,c=h*rate;
 [[P,'o-ppl',ppl],[H,'o-hrs',hrs],[R,'o-rate','$'+rate]].forEach(function(x){document.getElementById(x[1]).textContent=x[2];var mn=+x[0].min,mx=+x[0].max;x[0].style.setProperty('--p',((x[0].value-mn)/(mx-mn)*100)+'%')});
 el.hh.textContent=num(h/2)+' hours';el.hc.textContent=fmt(c/2);cur={c:c,h:h};
 if(reduce){paint(c,h);shown={c:c,h:h};return}
 cancelAnimationFrame(raf);(function step(){shown.c+=(cur.c-shown.c)*.22;shown.h+=(cur.h-shown.h)*.22;paint(shown.c,shown.h);if(Math.abs(cur.c-shown.c)>1)raf=requestAnimationFrame(step);else{shown={c:cur.c,h:cur.h};paint(cur.c,cur.h)}})()}
[P,H,R].forEach(function(i){i.addEventListener('input',calc)});calc();
var cta=document.getElementById('calc-cta'),ta=form&&form.querySelector('textarea[name=goal]');
if(cta&&ta)cta.addEventListener('click',function(){var line='We lose roughly '+num(cur.h)+' hours a year (about '+fmt(cur.c)+') to manual work. ';
 var v=ta.value;if(!v.trim()||/^We lose roughly/.test(v))ta.value=line;else if(v.indexOf('We lose roughly')<0)ta.value=v.replace(/\s*$/,'')+' '+line})})();
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
/* chaos -> clean scene (desktop) */
if(pin&&$('.fix-stage')){
 var kick=$('#fx-kick'),title=$('#fx-title'),stage=$('.fix-stage'),svg=$('#tangle');
 var drawTangle=function(){var W=stage.offsetWidth,H=stage.offsetHeight,notes=$$('.chaos .note'),c=notes.map(function(n){return [n.offsetLeft+n.offsetWidth/2,n.offsetTop+n.offsetHeight/2]});
  var pairs=[[0,6],[6,1],[0,2],[2,4],[4,7],[7,3],[3,5],[5,9],[1,8],[8,3],[2,6],[9,4]],d='';
  pairs.forEach(function(p,i){var a=c[p[0]],b=c[p[1]];if(!a||!b)return;var mx=(a[0]+b[0])/2+(i%2?60:-60),my=(a[1]+b[1])/2+(i%3?-50:50);d+='<path d="M'+a[0]+' '+a[1]+' Q'+mx+' '+my+' '+b[0]+' '+b[1]+'"/>'});
  svg.setAttribute('viewBox','0 0 '+W+' '+H);svg.innerHTML=d};
 drawTangle();addEventListener('resize',drawTangle);
 var live=false;
 var tl=gsap.timeline({scrollTrigger:{trigger:'.fix-stage',start:'top top',end:'+=1500',scrub:.6,pin:true,anticipatePin:1,
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

/* ===== v8 hero: preloader, drag wall, marquee, menu, cursor ===== */
(function(){
var root=document.documentElement,reduce=matchMedia('(prefers-reduced-motion: reduce)').matches,fine=matchMedia('(pointer:fine)').matches;
var D=[['dispatch','Freight dispatch','Dashboard · Maps','Every load, driver and map on one screen.'],['driver','Driver app','Mobile app','Stops, check-in and paperwork in the driver\'s pocket.'],['reports','Daily report','Reports · Email','The day\'s numbers, emailed to the owner.'],['crewhub','Staff app','Mobile app','Shift tasks and counts for store staff.'],['fuelhub','Store dashboard','Dashboard','Cash, fuel and sales for every store.'],['maple','Ordering website','Website','Online ordering for a restaurant.']];
/* preloader */
function reveal(){root.classList.add('ready');root.classList.add('pre-done');setTimeout(function(){root.classList.remove('pre');root.classList.remove('pre-done')},1100);try{sessionStorage.setItem('ss_pre','1')}catch(e){}}
if(root.classList.contains('pre')){
 var n=document.getElementById('preN'),bar=document.getElementById('preBar'),t0=performance.now(),done=false,loaded=0,shown=0;
 var NP=3;var imgs=D.slice(0,NP).map(function(d){return new Promise(function(r){var i=new Image();i.onload=i.onerror=function(){loaded++;r()};i.src='img/concept-'+d[0]+'.webp'})});
 var all=Promise.all(imgs.concat([Promise.race([document.fonts?document.fonts.ready:Promise.resolve(),new Promise(function(r){setTimeout(r,800)})])]));var ok=false;all.then(function(){ok=true});
 (function f(now){var target=ok?100:Math.min(88,loaded/NP*88);shown+=(target-shown)*.12;if(now-t0<500)shown=Math.min(shown,(now-t0)/500*100);
  n.textContent=Math.round(shown);bar.style.transform='scaleX('+(shown/100)+')';
  if((ok&&shown>96)||now-t0>1400){n.textContent=100;bar.style.transform='scaleX(1)';if(!done){done=true;setTimeout(reveal,60)}return}requestAnimationFrame(f)})(t0);
}else root.classList.add('ready');
/* infinite tile wall */
var hero=document.getElementById('hero'),tor=document.getElementById('tor');if(!hero||!tor)return;
var cards=[],cw,ch,px_,py_,NC,NR,totW,totH,vh,vw;
var offX=0,offY=0,vx=0,vy=0,mode='intro',drag=false,moved=0,lx=0,ly=0,tgt=null,mx=-1,my=-1,tx=0,ty=0,live=true,last=performance.now(),curIdx=-1,spd=0,hov=null,T=0;
function build(){
 vw=innerWidth;vh=hero.clientHeight;var small=vw<900;
 cw=Math.round(small?Math.max(170,vw*.46):Math.min(420,Math.max(280,vw*.205)));ch=Math.round(cw*.64);
 var gap=small?10:16;px_=cw+gap;py_=ch+gap;
 NC=6*Math.ceil((vw/px_+2.5)/6);NR=6*Math.ceil((vh/py_+2.5)/6);totW=NC*px_;totH=NR*py_;
 hero.style.setProperty('--cw',cw+'px');hero.style.setProperty('--ch',ch+'px');
 tor.innerHTML='';cards=[];
 for(var r=0;r<NR;r++)for(var c=0;c<NC;c++){var idx=((c+r*2+(r%2))%6+6)%6,el=document.createElement('div');el.className='tc';
  el.innerHTML='<img data-s="img/concept-'+D[idx][0]+'.webp" alt="" draggable="false" decoding="async"><span class="cc">Concept</span><span class="ct">'+D[idx][1]+'</span><span class="cg">'+D[idx][2]+'</span><span class="cd">'+D[idx][3]+'</span><span class="co">Open <b>&#8599;</b></span>';
  tor.appendChild(el);cards.push({el:el,c:c,r:r,idx:idx,h:0,vis:true,x:0,y:0})}}
build();
function setMode(m){if(m===mode)return;mode=m;hero.classList.toggle('explore',m==='explore');document.getElementById('hint').textContent=m==='explore'?'Drag anywhere · Click a tile':'Drag to explore · Scroll to continue'}
function wrap(v,t){return ((v+t*1.5)%t+t)%t-t/2}
function nudge(dx,dy){tgt={x:offX+dx,y:offY+dy};setMode('explore')}
function frame(now){requestAnimationFrame(frame);if(!live)return;var dt=Math.min(50,now-last);last=now;T+=dt;
 if(drag){}else if(tgt){offX+=(tgt.x-offX)*.12;offY+=(tgt.y-offY)*.12;if(Math.abs(tgt.x-offX)<.4&&Math.abs(tgt.y-offY)<.4){offX=tgt.x;offY=tgt.y;tgt=null}}
 else{offX+=vx;offY+=vy;vx*=.94;vy*=.94;if(mode==='intro'&&!reduce){offX-=dt*.035;offY-=dt*.012}}
 var inst=Math.min(46,Math.hypot(vx,vy)+(drag?Math.hypot(dragVx,dragVy):0));spd+=(inst-spd)*.1;
 tx+=((my<0?0:(my/vh-.5))*-3-tx)*.06;ty+=((mx<0?0:(mx/vw-.5))*4-ty)*.06;
 tor.style.transform='rotateX('+tx.toFixed(2)+'deg) rotateY('+ty.toFixed(2)+'deg)';
 var hasP=fine&&mx>=0,pxp=hasP?mx-vw/2:0,pyp=hasP?my-vh/2:(vh*0),T2=T*.0016;
 var A=reduce?0:5+spd*1.7,mx2=vw/2+px_,my2=vh/2+py_,best=1e9,hit=null,cen=null,cd=1e9;
 for(var i=0;i<cards.length;i++){var o=cards[i],x=wrap(o.c*px_+offX,totW),y=wrap(o.r*py_+offY,totH),e=o.el;
  if(Math.abs(x)>mx2||Math.abs(y)>my2){if(o.vis){e.style.visibility='hidden';o.vis=false}continue}
  if(!o.vis){e.style.visibility='visible';o.vis=true}var im=e.firstChild;if(im.dataset.s){im.src=im.dataset.s;im.removeAttribute('data-s')}
  o.x=x;o.y=y;
  var d=Math.hypot(x,y),ph=d/170-T2*2.2+(x*.0016),wz=Math.sin(ph)*A,wr=Math.cos(ph)*A*.045;
  var inx=Math.abs(pxp-x)<cw/2&&Math.abs(pyp-y)<ch/2;
  if(hasP&&inx){var dd=Math.hypot(pxp-x,pyp-y);if(dd<best){best=dd;hit=o}}
  var dc=Math.hypot(x,y);if(dc<cd){cd=dc;cen=o}
  o.wz=wz;o.wr=wr}
 var act=hasP?hit:(drag?null:cen);if(!hasP&&mode==='intro')act=null;
 for(var j=0;j<cards.length;j++){var o=cards[j];if(!o.vis)continue;var e=o.el;
  var isA=o===act,tg=isA?1:0;o.h+=(tg-o.h)*.14;
  var near=hasP?Math.exp(-(Math.pow(pxp-o.x,2)+Math.pow(pyp-o.y,2))/(2*Math.pow(px_*1.15,2))):0;
  var z=o.wz+near*46+o.h*110,s=1+o.h*.09,rx=o.wr+(isA&&hasP?(pyp-o.y)/ch*-6:0),ry=-o.wr*.8+(isA&&hasP?(pxp-o.x)/cw*8:0);
  e.style.transform='translate3d('+o.x.toFixed(1)+'px,'+o.y.toFixed(1)+'px,'+z.toFixed(1)+'px) rotateX('+rx.toFixed(2)+'deg) rotateY('+ry.toFixed(2)+'deg) scale('+s.toFixed(3)+')';
  e.style.opacity=(((mode==='explore'||hasP)?.66:.62)+.34*Math.max(o.h,near*.7)).toFixed(3);
  if(isA!==o.on){o.on=isA;e.classList.toggle('on',isA)}}
 var show=act||cen;if(show&&show.idx!==curIdx){curIdx=show.idx;document.getElementById('cnt').textContent=('0'+(show.idx+1)).slice(-2)+' / 06 · '+D[show.idx][1]}
 cur_act=act}
var cur_act=null,dragVx=0,dragVy=0;
requestAnimationFrame(frame);
/* input */
function isUI(t){return t.closest&&t.closest('a,button,.hero-ui,.hero-cnt')}
hero.addEventListener('pointerdown',function(e){if(isUI(e.target))return;drag=true;moved=0;lx=e.clientX;ly=e.clientY;vx=0;vy=0;dragVx=0;dragVy=0;tgt=null;mx=e.clientX;my=e.clientY-hero.getBoundingClientRect().top;hero.classList.add('drag');try{hero.setPointerCapture(e.pointerId)}catch(_){}});
hero.addEventListener('pointermove',function(e){mx=e.clientX;my=e.clientY-hero.getBoundingClientRect().top;if(!drag)return;var dx=e.clientX-lx,dy=fine?e.clientY-ly:0;lx=e.clientX;ly=e.clientY;moved+=Math.abs(dx)+Math.abs(dy);
 offX+=dx;offY+=dy;vx=dx;vy=dy;dragVx=dx;dragVy=dy;if(moved>8)setMode('explore')});
function up(e){if(!drag)return;drag=false;dragVx=dragVy=0;hero.classList.remove('drag');
 if(moved<8){var o=cur_act;if(fine&&o){if(mode==='explore')openLb(o.idx);else setMode('explore')}else{var t=document.elementFromPoint(e.clientX,e.clientY),cd=t&&t.closest&&t.closest('.tc');if(cd){var k=cards.filter(function(q){return q.el===cd})[0];if(k){if(mode==='explore')openLb(k.idx);else setMode('explore')}}}}}
hero.addEventListener('pointerup',up);hero.addEventListener('pointercancel',function(){drag=false;dragVx=dragVy=0;hero.classList.remove('drag')});
hero.addEventListener('pointerleave',function(){if(!drag){mx=-1;my=-1}});
var exb=document.getElementById('explore');if(exb)exb.onclick=function(){setMode('explore')};
document.getElementById('bNext').onclick=function(){nudge(-px_*1.5,0)};document.getElementById('bBack').onclick=function(){nudge(px_*1.5,0)};
document.getElementById('bIntro').onclick=function(){setMode('intro');tgt=null};
addEventListener('keydown',function(e){if(!live||/INPUT|TEXTAREA/.test((e.target||{}).tagName||''))return;if(e.key==='ArrowRight'){nudge(-px_,0)}else if(e.key==='ArrowLeft'){nudge(px_,0)}else if(e.key==='ArrowDown'&&mode==='explore'){e.preventDefault();nudge(0,-py_)}else if(e.key==='ArrowUp'&&mode==='explore'){e.preventDefault();nudge(0,py_)}else if(e.key==='Escape'&&mode==='explore'){document.getElementById('bIntro').click()}});
var lb=document.getElementById('lb');function openLb(i){if(!lb)return;lb.querySelector('img').src='img/concept-'+D[i][0]+'.webp';lb.hidden=false}
if('IntersectionObserver' in window)new IntersectionObserver(function(e){live=e[0].isIntersecting;last=performance.now()},{threshold:0}).observe(hero);
var rt;addEventListener('resize',function(){clearTimeout(rt);rt=setTimeout(build,160)});
/* cursor */
if(false){var cur=document.createElement('div');cur.className='cur';cur.setAttribute('aria-hidden','true');cur.innerHTML='<span>Drag</span>';document.body.appendChild(cur);var cx=0,cy=0,px=0,py=0;
 addEventListener('pointermove',function(e){px=e.clientX;py=e.clientY;cur.classList.add('on')});
 (function f(){cx+=(px-cx)*.2;cy+=(py-cy)*.2;cur.style.transform='translate3d('+cx+'px,'+cy+'px,0)';requestAnimationFrame(f)})();
 hero.addEventListener('pointerover',function(e){var ui=isUI(e.target);cur.classList.toggle('big',!ui);cur.classList.toggle('hide',!!ui);cur.firstChild.textContent=(e.target.closest&&e.target.closest('.tc')&&mode==='explore')?'Click to view':'Drag to explore'});
 hero.addEventListener('pointerleave',function(){cur.classList.remove('big','hide')});
 document.addEventListener('pointerover',function(e){if(!hero.contains(e.target))cur.classList.remove('big','hide')})}
})();
/* marquee: speeds up with scroll */
(function(){var rows=[].slice.call(document.querySelectorAll('.mq-row'));if(!rows.length||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
rows.forEach(function(r){r.innerHTML+=r.innerHTML+r.innerHTML});
var pos=[0,0],dir=[-1,1],boost=0,lastY=pageYOffset,w=[0,0];function meas(){rows.forEach(function(r,i){w[i]=r.scrollWidth/3});if(pos[1]===0)pos[1]=-w[1]}meas();addEventListener('resize',meas);if(document.fonts)document.fonts.ready.then(meas);
(function f(){var y=pageYOffset,v=Math.abs(y-lastY);lastY=y;boost+=(Math.min(60,v)-boost)*.08;
 rows.forEach(function(r,i){if(!w[i])return;pos[i]+=dir[i]*(.7+boost*.5);if(pos[i]<=-w[i]*2)pos[i]+=w[i];if(pos[i]>=0&&dir[i]>0)pos[i]-=w[i];r.style.transform='translate3d('+pos[i]+'px,0,0)'});requestAnimationFrame(f)})()})();
/* menu */
(function(){var b=document.getElementById('mbtn'),m=document.getElementById('menu');if(!b||!m)return;
function set(o){m.classList.toggle('open',o);m.setAttribute('aria-hidden',o?'false':'true');b.setAttribute('aria-expanded',o?'true':'false');b.textContent=o?'Close':'Menu';document.body.classList.toggle('menu-open',o)}
b.onclick=function(){set(!m.classList.contains('open'))};m.addEventListener('click',function(e){if(e.target.closest('a'))set(false)});addEventListener('keydown',function(e){if(e.key==='Escape')set(false)})})();
