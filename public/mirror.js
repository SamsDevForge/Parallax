/* Original procedural CSS 3D geometry. No remote assets or sensor uploads. */
'use strict';
(()=>{
const el=id=>document.getElementById(id);
// Reference silhouettes; dimensions are illustrative unless verified in the README.
const profiles=[
 ['iphone17pro','iPhone 17 Pro style',72,150,8.8,'plateau','island','#c37942',[]],
 ['iphone17promax','iPhone 17 Pro Max style',78,163,8.8,'plateau','island','#526686',[]],
 ['s26ultra','Galaxy S26 Ultra',78.1,163.6,7.9,'ultra-pill','hole','#817c9f',['sm-s948','galaxy s26 ultra']],
 ['pixel10pro','Pixel 10 Pro / Pro XL style',72,153,8.6,'pixel-pill','hole','#889c86',['pixel 10 pro','pixel 10 pro xl']],
 ['oneplus15','OnePlus 15 style',77,162,8.2,'square-four','hole','#5d586c',['oneplus 15']],
 ['iphone16pro','iPhone 16 Pro',71.5,149.6,8.25,'triple-square','island','#a9a39a',[]],
 ['iphone16promax','iPhone 16 Pro Max',77.6,163,8.25,'triple-square','island','#a8a29b',[]],
 ['iphone16','iPhone 16 / 16 Plus style',72,148,7.8,'dual-pill','island','#738eaa',[]],
 ['iphone15pro','iPhone 15 Pro style',71,147,8.3,'triple-square','island','#747f91',[]],
 ['iphone14pro','iPhone 14 Pro style',72,148,8,'triple-square','island','#655b78',[]],
 ['s25ultra','Galaxy S25 Ultra',77.6,162.8,8.2,'ultra','hole','#9c9fa7',['sm-s938']],
 ['s24ultra','Galaxy S24 Ultra style',79,162,8.6,'ultra','hole','#9f9a90',['sm-s928']],
 ['s25','Galaxy S25 / S25+ style',71,147,7.3,'vertical-three','hole','#8599b1',['sm-s931','sm-s936']],
 ['pixel9pro','Pixel 9 Pro / Pro XL style',72,152.8,8.5,'pixel-pill','hole','#b5b2a6',['pixel 9 pro']],
 ['pixel9','Pixel 9 style',72,153,8.5,'pixel-pill-dual','hole','#a0b5a5',['pixel 9']],
 ['pixel8pro','Pixel 8 Pro style',77,163,8.8,'pixel-bar','hole','#7299bc',['pixel 8 pro']],
 ['oneplus13','OnePlus 13',76.5,162.9,8.9,'circle-four','hole','#48627f',['cph2649','cph2653','cph2655','pjz110','oneplus 13']],
 ['oneplus12','OnePlus 12 style',76,164,9.2,'circle-four','hole','#548175',['cph2573','cph2581','cph2583','pjd110','oneplus 12']],
 ['xiaomi15','Xiaomi 15 style',71,152,8.1,'square-four','hole','#91a79b',['xiaomi 15']],
 ['ce5','OnePlus Nord CE5 style',77,164,8.2,'dual-pill','hole','#7c8881',['cph2717','cph2719','oneplus nord ce5']],
 ['generic-iphone','Generic iPhone silhouette',72,150,8,'dual-square','island','#8296a2',[]],
 ['generic-dual','Generic dual-camera phone',74,160,8,'dual-pill','hole','#778e91',[]],
 ['generic-vertical','Generic vertical-camera phone',75,160,8,'vertical-three','hole','#777d89',[]],
 ['generic-circle','Generic circular-camera phone',76,162,9,'circle-four','hole','#737e79',[]],
 ['generic-square','Generic square-camera phone',75,161,8.5,'square-four','hole','#8f858f',[]],
 ['generic-tablet','Generic tablet',170,245,7,'single','hole','#858b92',[]]
].map(([id,name,w,h,d,camera,front,color,aliases])=>({id,name,w,h,d,camera,front,color,aliases}));
const byId=id=>profiles.find(p=>p.id===id);
let attemptId=0,manual=false,hasSensor=false,last=null,lastAt=0,manualSelected=false,previewRear=false,drag=null,frame=0,autoResume=true,permissionGranted=false,permissionBusy=false,relativeSensor=null,source='',lastEventAt=-Infinity;
const phone=el('mirror-phone'),stage=el('mirror-stage'),select=el('mirror-select');
const mode=el('mirror-mode'),view=el('mirror-view');
function node(cls,parent,styles={}){const e=document.createElement('div');e.className=cls;Object.assign(e.style,styles);parent.append(e);return e;}
function choose(raw,name,ua=navigator.userAgent){
 const code=String(raw||'').toLowerCase().trim(), label=String(name||'').toLowerCase();
 // Exact codes or explicit family prefix, longest first. No model guess from screen resolution.
 const aliases=profiles.flatMap(p=>p.aliases.map(a=>({a,p}))).sort((a,b)=>b.a.length-a.a.length);
 const match=aliases.find(({a})=>code===a||(a.startsWith('sm-')&&code.startsWith(a))||label===a||((a==='pixel 9 pro')&&label==='pixel 9 pro xl'));
 if(match)return [match.p,'Model-family match from browser/catalogue; representative geometry.'];
 if(/ipad/i.test(ua)||(/macintosh/i.test(ua)&&navigator.maxTouchPoints>1))return [byId('generic-tablet'),'Tablet-like browser; exact model unavailable.'];
 if(/iphone|ipod/i.test(ua))return [byId('generic-iphone'),'iOS normally hides the exact iPhone model. Select yours manually.'];
 const hint=code+' '+label;
 if(/sm-|samsung|galaxy/i.test(hint))return [byId('generic-vertical'),'Samsung-like camera layout; approximate, not a verified match.'];
 if(/oneplus|oppo|vivo|realme|cph\d/i.test(hint))return [byId('generic-dual'),'Representative dual-camera layout; exact appearance unknown.'];
 if(/xiaomi|redmi|poco|honor/i.test(hint))return [byId('generic-square'),'Representative square-camera layout; exact appearance unknown.'];
 return [byId('generic-dual'),/Android|Mobile/i.test(ua)?'Generic phone; exact model not exposed or not in the visual catalogue.':'Example phone for this desktop browser; not your actual device.'];
}
function build(p,reason){
 select.value=p.id;el('mirror-model').textContent=p.name;el('mirror-match').textContent=reason;
 const k=218/p.h,w=p.w*k,h=p.h*k,d=Math.max(7,p.d*k),r=p.camera==='ultra'?10:p.id==='generic-tablet'?12:20;
 phone.replaceChildren();Object.assign(phone.style,{width:w+'px',height:h+'px',marginLeft:-w/2+'px',marginTop:-h/2+'px'});
 phone.style.setProperty('--phone-radius',r+'px');phone.style.setProperty('--phone-color',p.color);
 // Rounded sidewall rendered by a stack of cross sections; front/rear are real opposing planes.
 for(let z=-d/2+0.5;z<d/2;z+=1.1)node('phone-layer',phone,{transform:`translateZ(${z}px)`});
 const front=node('phone-face phone-front',phone,{transform:`translateZ(${d/2}px)`});
 node('phone-screen',front);node('phone-cutout '+(p.front==='island'?'island':''),front);node('phone-home',front);
 const rear=node('phone-face phone-rear',phone,{transform:`rotateY(180deg) translateZ(${d/2}px)`});
 const unit=w/100, u=v=>v*unit+'px';
 const lens=(x,y,size)=>node('phone-lens',rear,{left:u(x),top:u(y),width:u(size),height:u(size)});
 const plate=(x,y,pw,ph,rad)=>node('phone-plate',rear,{left:u(x),top:u(y),width:u(pw),height:u(ph),borderRadius:rad});
 const flash=(x,y)=>node('phone-flash',rear,{left:u(x),top:u(y),width:u(6),height:u(6)});
 switch(p.camera){
 case 'plateau':plate(0,0,100,58,'12%');lens(9,9,24);lens(9,36,24);lens(34,23,24);flash(81,14);break;
 case 'triple-square':plate(5,5,57,59,'20%');lens(9,9,24);lens(9,36,24);lens(34,23,24);flash(43,10);break;
 case 'dual-square':plate(5,5,51,52,'22%');lens(9,9,23);lens(30,30,23);flash(39,10);break;
 case 'dual-pill':plate(7,6,32,61,'40%');lens(11,10,24);lens(11,36,24);flash(45,17);break;
 case 'ultra-pill':plate(5,6,35,94,'32%');lens(8,11,26);lens(8,41,26);lens(8,71,26);lens(40,27,15);lens(40,57,15);flash(44,13);break;
 case 'ultra':lens(8,11,26);lens(8,41,26);lens(8,71,26);lens(40,27,15);lens(40,57,15);flash(44,13);break;
 case 'vertical-three':lens(9,10,22);lens(9,36,22);lens(9,62,22);flash(38,24);break;
 case 'pixel-pill':case 'pixel-pill-dual':case 'pixel-bar':plate(3,13,94,32,p.camera==='pixel-bar'?'8%':'24%');lens(10,18,21);lens(33,18,21);if(p.camera!=='pixel-pill-dual')lens(56,18,21);flash(84,25);break;
 case 'circle-four':plate(10,9,73,73,'50%');lens(22,20,21);lens(48,20,21);lens(22,46,21);lens(48,46,21);flash(85,9);break;
 case 'square-four':plate(6,6,58,58,'15%');lens(11,11,22);lens(37,11,22);lens(11,37,22);flash(44,44);break;
 default:lens(9,9,17);break;
 }
 node('phone-backmark',rear).textContent='◈';
 // Physical buttons sit against the sidewall, visible at oblique angles.
 const button=(side,y,len)=>node('phone-sidebutton',phone,{left:(side==='right'?w-1:-2)+'px',top:y+'px',height:len+'px',transform:`rotateY(${side==='right'?90:-90}deg)`});
 button('right',h*.25,h*.19);button('left',h*.18,h*.11);button('left',h*.31,h*.1);
}
function matrix(alpha,beta,gamma){
 // W3C intrinsic Z-X'-Y'' rotations, mapped from Y-up device space to Y-down CSS space.
 const rad=Math.PI/180,a=alpha*rad,b=beta*rad,g=gamma*rad;
 const cA=Math.cos(a),sA=Math.sin(a),cB=Math.cos(b),sB=Math.sin(b),cG=Math.cos(g),sG=Math.sin(g);
 const r=[[cA*cG-sA*sB*sG,-cB*sA,cG*sA*sB+cA*sG],[cG*sA+cA*sB*sG,cA*cB,sA*sG-cA*cG*sB],[-cB*sG,sB,cB*cG]];
 const sign=[1,-1,1],out=[];for(let j=0;j<3;j++){for(let i=0;i<3;i++)out.push(r[i][j]*sign[i]*sign[j]);out.push(0);}out.push(0,0,0,1);return out;
}
function pose(a,b,g,live){
 phone.style.transform=`matrix3d(${matrix(a??0,b??0,g??0).join(',')})`;
 for(const [key,v] of [['alpha',a],['beta',b],['gamma',g]])el('mirror-'+key).textContent=Number.isFinite(v)?v.toFixed(1)+'°':'—';
 el('mirror-camera').style.transform=live?'rotateX(55deg)':'rotateX(0deg)';
}
function status(message,hint,reference){el('mirror-state').textContent=message;el('stage-hint').textContent=hint;el('mirror-frame').textContent=reference;}
function manualPose(){const a=+el('manual-alpha').value,b=+el('manual-beta').value,g=+el('manual-gamma').value;pose(a,b,g,false);if(previewRear)phone.style.transform+= ' rotateY(180deg)';}
const hasPermissionAPI=typeof window.DeviceOrientationEvent?.requestPermission==='function';
let permissionNeeded=false;
const supported=window.isSecureContext&&(!!window.DeviceOrientationEvent||!!window.RelativeOrientationSensor);
function updateMode(){mode.textContent=manual?(permissionNeeded&&!permissionGranted?'Enable motion (permission)':'Try live sensors'):'Manual preview';}
function setManual(on){manual=on;previewRear=false;view.textContent='Inspect rear';view.disabled=!on;updateMode();el('manual-angles').hidden=!on;
 if(on){status('MANUAL PREVIEW · simulated','Drag or use the sliders','Manual values are not sensor readings.');manualPose();}
 else{status('Waiting for live motion…','Tilt your phone','Waiting for usable sensor readings.');if(last&&performance.now()-lastAt<2000)renderLive();}
}
function renderLive(){frame=0;if(manual||!last)return;pose(last.alpha,last.beta,last.gamma,true);
 const partial=[last.alpha,last.beta,last.gamma].some(v=>v===null);
 status(partial?'LIVE · partial orientation':'LIVE · orientation detected','Tilt or rotate your phone',
 source+' · '+(partial?'Unavailable axes shown as — and rendered at neutral; not full orientation.':last.absolute?'Earth-referenced orientation; accuracy varies.':'Relative orientation · heading may drift or have an arbitrary reference.'));
}
function accept(sample,label){
 if(![sample.alpha,sample.beta,sample.gamma].some(Number.isFinite))return;
 last=sample;source=label;lastAt=performance.now();hasSensor=true;permissionNeeded=false;updateMode();
 if(manual&&autoResume){setManual(false);}
 if(!manual&&!frame)frame=requestAnimationFrame(renderLive);
}
function receive(e){
 if(![e.alpha,e.beta,e.gamma].some(Number.isFinite))return;
 // A usable event proves access is available without a new permission request.
 permissionGranted=true;
 lastEventAt=performance.now();
 accept({alpha:Number.isFinite(e.alpha)?e.alpha:null,beta:Number.isFinite(e.beta)?e.beta:null,gamma:Number.isFinite(e.gamma)?e.gamma:null,absolute:e.absolute===true},e.type==='deviceorientationabsolute'?'Absolute orientation event':'Device orientation event');
}
async function startRelative(){
 if(relativeSensor||!window.RelativeOrientationSensor||!navigator.permissions||!autoResume||document.hidden)return;
 try{
 const grants=await Promise.all(['accelerometer','gyroscope'].map(name=>navigator.permissions.query({name})));
 if(!grants.every(p=>p.state==='granted')||relativeSensor||!autoResume||document.hidden)return;
 const sensor=new window.RelativeOrientationSensor({frequency:30,referenceFrame:'device'});relativeSensor=sensor;
 sensor.addEventListener('reading',()=>{
 if(performance.now()-lastEventAt<2200||!sensor.quaternion)return;
 const [x,y,z,w]=sensor.quaternion;
 if(![x,y,z,w].every(Number.isFinite))return;
 const r01=2*(x*y-z*w),r11=1-2*(x*x+z*z),r20=2*(x*z-y*w),r21=2*(y*z+x*w),r22=1-2*(x*x+y*y);
 const rad=180/Math.PI,b=Math.asin(Math.max(-1,Math.min(1,r21)));
 let a=Math.atan2(-r01,r11)*rad,g=Math.atan2(-r20,r22)*rad;
 if(Math.abs(Math.cos(b))<1e-5){a=Math.atan2(2*(x*y+z*w),1-2*(y*y+z*z))*rad;g=0;}
 accept({alpha:(a+360)%360,beta:b*rad,gamma:g,absolute:false},'Relative orientation sensor');
 });
 sensor.addEventListener('error',()=>{sensor.stop();if(relativeSensor===sensor)relativeSensor=null;});sensor.start();
 }catch{relativeSensor=null;}
}
function stopRelative(){if(relativeSensor){relativeSensor.stop();relativeSensor=null;}}
function attempt(){
 const id=++attemptId;autoResume=true;permissionNeeded=false;
 if(!supported){setManual(true);status('Motion unavailable · manual preview','Drag or use the sliders','Requires a supported browser and secure context.');return;}
 // Always subscribe and wait for passive readings first, even if requestPermission exists.
 setManual(false);startRelative();
 setTimeout(()=>{
  if(id!==attemptId||!autoResume||document.hidden||hasSensor)return;
  // The presence of requestPermission alone does not prove access is blocked.
  // Offer an explicit grant only when the passive probe produced no usable readings.
  permissionNeeded=hasPermissionAPI&&!permissionGranted;
  setManual(true);
  if(permissionNeeded)status('Motion not yet available · permission may be required','Enable motion or move your phone','This browser may require authorization. Select Enable motion (permission) to request access. No prompt opens automatically.');
  else status('Waiting for sensor data · preview available','Move your phone to activate live mode','Live mode resumes automatically if a usable reading arrives. Check browser motion sensor settings if none arrive.');
 },6000);
}
async function onMode(){
 if(permissionBusy)return;
 if(!manual){autoResume=false;++attemptId;stopRelative();setManual(true);return;}
 if(permissionNeeded&&hasPermissionAPI&&!permissionGranted){
 permissionBusy=true;mode.disabled=true;
 try{permissionGranted=(await window.DeviceOrientationEvent.requestPermission())==='granted';}
 catch{permissionGranted=false;}
 finally{permissionBusy=false;mode.disabled=false;}
 if(!permissionGranted&&!hasSensor){autoResume=false;status('Motion access not granted','Drag or use the sliders','No live readings available. Allow motion access in browser settings or use manual preview.');return;}
 }
 attempt();
}
select.append(...profiles.map(p=>{const o=document.createElement('option');o.value=p.id;o.textContent=p.name;return o;}));
select.addEventListener('change',()=>{manualSelected=true;build(byId(select.value),'Manually selected visual model; not a detected device.');});
mode.addEventListener('click',onMode);view.addEventListener('click',()=>{if(!manual)return;autoResume=false;stopRelative();previewRear=!previewRear;view.textContent=previewRear?'Inspect front':'Inspect rear';manualPose();});
for(const k of ['alpha','beta','gamma'])el('manual-'+k).addEventListener('input',()=>{autoResume=false;stopRelative();manualPose();});
stage.addEventListener('pointerdown',e=>{if(!manual)return;autoResume=false;stopRelative();drag={x:e.clientX,y:e.clientY,a:+el('manual-alpha').value,b:+el('manual-beta').value,g:+el('manual-gamma').value};stage.setPointerCapture(e.pointerId);});
stage.addEventListener('pointermove',e=>{if(!drag||!manual)return;el('manual-gamma').value=Math.max(-90,Math.min(90,drag.g+(e.clientX-drag.x)*.45));el('manual-beta').value=Math.max(-180,Math.min(180,drag.b+(e.clientY-drag.y)*.6));manualPose();});
for(const e of ['pointerup','pointercancel','lostpointercapture'])stage.addEventListener(e,()=>drag=null);
const initial=choose(null,null);build(...initial);if(supported){window.addEventListener('deviceorientation',receive,{passive:true});window.addEventListener('deviceorientationabsolute',receive,{passive:true});}attempt();
// The existing report publishes only the model hint, not raw orientation or persistent identifiers.
function matchReport(){if(manualSelected)return;const info=typeof modelInfo==='function'?modelInfo():null;build(...choose(info?.raw,info?.name));}
window.addEventListener('parallax:report',matchReport);matchReport();
document.addEventListener('visibilitychange',()=>{if(document.hidden){stopRelative();}else if(autoResume){attempt();}});
setInterval(()=>{if(document.hidden||!autoResume)return;if(!manual&&hasSensor&&performance.now()-lastAt>6000){status('Sensor feed paused','Move your phone','Last pose shown; waiting for a new reading.');startRelative();}},2000);
})();
