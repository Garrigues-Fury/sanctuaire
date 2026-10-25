/* Personnage 3D anime (prototype demandé par Seba le 2026-10-25).
   Modèles de base VRoid (CC0) affichés avec three-vrm (MIT). Le physique se règle en direct sur le squelette
   (taille, carrure, poitrine, tour de taille, hanches, cuisses, rondeurs) ; l'armure est dessinée ici en pièces
   accrochées aux os : elle suit donc n'importe quel corps. Chargé à la demande (le reste du jeu n'en dépend pas). */
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { VRMLoaderPlugin, VRMUtils } from '@pixiv/three-vrm';

const loaded={};
function loadVRM(sex){
 const url=import.meta.env.BASE_URL+'models/vroid-'+(sex==='F'?'f':'m')+'.vrm';
 if(!loaded[url])loaded[url]=new Promise((ok,ko)=>{const L=new GLTFLoader();L.register(p=>new VRMLoaderPlugin(p));
  L.load(url,g=>{const vrm=g.userData.vrm;VRMUtils.removeUnnecessaryVertices(g.scene);VRMUtils.rotateVRM0(vrm);vrm.scene.traverse(o=>{o.frustumCulled=false;});ok(vrm);},undefined,ko);});
 return loaded[url];
}
const METAL={or:{c:0xf0c050,r:.26},argent:{c:0xd8e0ee,r:.22},bronze:{c:0xc77d45,r:.34}};
const lerp=(a,b,t)=>a+(b-a)*t;

/* ---------- physique : échelle des os, en compensant l'héritage parent → enfant ---------- */
function shape(vrm,look,sex){
 const raw=n=>vrm.humanoid.getRawBoneNode(n),L=Object.assign({height:.5,build:.5,bust:.45,waist:.5,hips:.5,thighs:.5,round:0},look||{});
 const r=L.round,b=L.build;
 const W={ // largeur voulue de chaque partie (1 = modèle de base)
  hips:lerp(.9,1.15,L.hips)+.12*r, spine:lerp(.82,1.12,L.waist)+.2*r, chest:lerp(.92,1.12,b)+.1*r, upperChest:lerp(.9,1.18,b)+.08*r,
  thigh:lerp(.85,1.2,L.thighs)+.18*r, arm:lerp(.88,1.18,b)+.12*r};
 const set=(n,x,z)=>{const o=raw(n);if(o)o.scale.set(x,1,z==null?x:z);};
 set('hips',W.hips);set('spine',W.spine/W.hips);set('chest',W.chest/W.spine);set('upperChest',W.upperChest/W.chest);
 set('neck',1/W.upperChest);set('leftShoulder',1/W.upperChest);set('rightShoulder',1/W.upperChest);
 ['leftUpperArm','rightUpperArm'].forEach(n=>set(n,W.arm,W.arm));
 ['leftLowerArm','rightLowerArm'].forEach(n=>set(n,1));
 ['leftUpperLeg','rightUpperLeg'].forEach(n=>set(n,W.thigh/W.hips));
 ['leftLowerLeg','rightLowerLeg'].forEach(n=>set(n,(1+.12*r)/W.thigh*W.hips/W.hips));
 // poitrine (os secondaires des modèles féminins, qui gardent leur balancement)
 vrm.scene.traverse(o=>{if(/J_Sec_[LR]_Bust1$/.test(o.name)){const s=sex==='F'?lerp(.6,1.45,L.bust):1;o.scale.setScalar(s);}});
 vrm.scene.scale.setScalar(lerp(.93,1.07,L.height));
}

/* ---------- couleurs : peau, cheveux, tenue sombre sous l'armure ---------- */
function paint(vrm,col){
 vrm.scene.traverse(o=>{if(!o.isMesh)return;(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>{
  const n=m.name||'';
  if(/SKIN/i.test(n)&&col.skin){m.color&&m.color.set(col.skin);}
  else if(/HAIR/i.test(n)&&col.hair){m.color&&m.color.set(col.hair);}
  else if(/Accessory|Tie/i.test(n)){m.visible=false;}
  else if(/Tops|Bottoms/i.test(n)){m.visible=false;}
  else if(/Shoes|CLOTH/i.test(n)){m.color&&m.color.set(col.suit||'#2a1f2c');if(m.shadeColorFactor)m.shadeColorFactor.set('#120c14');}
 });});
}

/* ---------- armure en pièces accrochées aux os ---------- */
function armor(vrm,opt){
 const raw=n=>vrm.humanoid.getRawBoneNode(n),M=METAL[opt.rank]||METAL.or,F=opt.front;
 const metal=new THREE.MeshStandardMaterial({color:M.c,metalness:1,roughness:M.r});
 const dark=new THREE.MeshStandardMaterial({color:0x5a4020,metalness:.8,roughness:.45});
 const gem=new THREE.MeshStandardMaterial({color:opt.gem||0x4fb6ff,emissive:opt.gem||0x4fb6ff,emissiveIntensity:.6,metalness:.2,roughness:.15});
 const group=[];const add=(bone,mesh)=>{if(bone){bone.add(mesh);group.push(mesh);}return mesh;};
 const Y=new THREE.Vector3(0,1,0);
 // segment le long d'un os (de la fraction a à b vers son enfant)
 const along=(name,child,r0,r1,a,b,mat)=>{const bn=raw(name),ch=raw(child);if(!bn||!ch)return;const d=ch.position.clone(),L=d.length();d.normalize();
  const g=new THREE.CylinderGeometry(r1,r0,L*(b-a),24,1,true);const m=new THREE.Mesh(g,mat||metal);m.quaternion.setFromUnitVectors(Y,d);m.position.copy(d.clone().multiplyScalar(L*(a+b)/2));add(bn,m);
  const cap=new THREE.Mesh(new THREE.TorusGeometry(r1*1.02,.004,8,24),dark);cap.quaternion.copy(m.quaternion).multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1,0,0),Math.PI/2));cap.position.copy(d.clone().multiplyScalar(L*b));add(bn,cap);};
 // épaulières : posées sur l'épaule (l'os de l'épaule ne tourne pas quand le bras descend)
 ['left','right'].forEach(sd=>{const sh=raw(sd+'Shoulder'),up=raw(sd+'UpperArm');if(!sh||!up)return;const at=up.position.clone();const out=Math.sign(at.x)||1;
  const p=new THREE.Mesh(new THREE.SphereGeometry(.068,28,14,0,Math.PI*2,0,Math.PI*.55),metal);p.scale.set(1.25,.75,1.05);p.position.set(at.x+out*.012,at.y+.028,at.z);p.rotation.z=-out*.35;add(sh,p);
  for(let i=1;i<=2;i++){const l=new THREE.Mesh(new THREE.SphereGeometry(.07-i*.006,24,10,0,Math.PI*2,Math.PI*.42,Math.PI*.16),metal);l.scale.set(1.25,.8,1.05);l.position.set(at.x+out*(.018+i*.012),at.y+.02-i*.018,at.z);l.rotation.z=-out*(.35+i*.15);add(sh,l);}
  if(opt.motif==='water'){const v=new THREE.Mesh(new THREE.TorusGeometry(.026,.006,8,24,Math.PI*1.4),metal);v.position.set(at.x+out*.02,at.y+.075,at.z);v.rotation.y=Math.PI/2;add(sh,v);}
  const g=new THREE.Mesh(new THREE.SphereGeometry(.011,12,8),gem);g.position.set(at.x+out*.02,at.y+.07,at.z+F*.03);add(sh,g);});
 // plastron
 const uc=raw('upperChest')||raw('chest');
 if(opt.sex==='F'){
  // coques qui suivent la poitrine (et son balancement)
  vrm.scene.traverse(o=>{if(/J_Sec_[LR]_Bust1$/.test(o.name)){const ch=o.children.find(x=>/Bust2$/.test(x.name));if(!ch)return;const d=ch.position.clone().normalize();const c=new THREE.Mesh(new THREE.SphereGeometry(.05,28,16,0,Math.PI*2,0,Math.PI*.5),metal);c.quaternion.setFromUnitVectors(Y,d);c.scale.set(1,.55,1);c.position.copy(ch.position.clone().multiplyScalar(.12));o.add(c);group.push(c);
   const rim=new THREE.Mesh(new THREE.TorusGeometry(.05,.004,8,32),dark);rim.quaternion.copy(c.quaternion).multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1,0,0),Math.PI/2));rim.position.copy(c.position);o.add(rim);group.push(rim);}});
 }else{
  const plate=new THREE.Mesh(new THREE.SphereGeometry(.15,32,20,Math.PI*.1,Math.PI*.8,Math.PI*.22,Math.PI*.42),metal);plate.rotation.y=F>0?0:Math.PI;plate.scale.set(1,1.05,.84);plate.position.set(0,.02,0);add(uc,plate);
 }
 // gorgerin autour du cou
 const nk=raw('neck');if(nk){const gr=new THREE.Mesh(new THREE.CylinderGeometry(.052,.075,.035,28,1,true),metal);gr.position.set(0,-.005,0);add(nk,gr);}
 const g0=new THREE.Mesh(new THREE.OctahedronGeometry(.018),gem);g0.position.set(0,opt.sex==='F'?.14:.05,F*(opt.sex==='F'?.095:.12));add(uc,g0);
 // ceinture et tassettes
 const hips=raw('hips');
 const belt=new THREE.Mesh(new THREE.TorusGeometry(.135,.012,10,40),metal);belt.rotation.x=Math.PI/2;belt.scale.set(1.05,.82,1);belt.position.set(0,.04,0);add(hips,belt);
 [-1,1].forEach(sd=>{for(let i=0;i<2;i++){const t=new THREE.Mesh(new THREE.BoxGeometry(.055,.13,.006),metal);const a=sd*(.85+i*.45);t.position.set(Math.sin(a)*.135,-.035,F*Math.cos(a)*.11);t.rotation.y=a*F;t.rotation.z=-sd*.12;add(hips,t);}});
 const cloth=new THREE.MeshStandardMaterial({color:new THREE.Color(opt.cloth||0x2b5bb2).multiplyScalar(.7),roughness:.85,side:THREE.DoubleSide});
 // pans d'étoffe légèrement galbés, bordés d'or
 [1,-1].forEach(sgn=>{const pg=new THREE.CylinderGeometry(.125,.15,.3,16,4,true,-.45,.9);pg.translate(0,-.15,0);const pl=new THREE.Mesh(pg,cloth);pl.rotation.y=(F*sgn>0?0:Math.PI);pl.position.set(0,.035,0);add(hips,pl);
  const tr=new THREE.Mesh(new THREE.CylinderGeometry(.151,.151,.012,16,1,true,-.45,.9),metal);tr.rotation.y=pl.rotation.y;tr.position.set(0,.035-.3,0);add(hips,tr);});
 const bg=new THREE.Mesh(new THREE.SphereGeometry(.013,12,8),gem);bg.position.set(0,.04,F*.118);add(hips,bg);
 // brassards, genouillères, jambières
 const ar=opt.sex==='M'?1.25:1;along('leftLowerArm','leftHand',.034*ar,.03*ar,.15,.9);along('rightLowerArm','rightHand',.034*ar,.03*ar,.15,.9);
 along('leftLowerLeg','leftFoot',.056,.044,.04,.92);along('rightLowerLeg','rightFoot',.056,.044,.04,.92);
 ['left','right'].forEach(s=>{const k=raw(s+'LowerLeg');if(!k)return;const kn=new THREE.Mesh(new THREE.SphereGeometry(.038,20,12,0,Math.PI*2,0,Math.PI/2),metal);kn.rotation.x=Math.PI/2*F;kn.position.set(0,.01,F*.02);add(k,kn);});
 // pas de casque : un petit ornement dans les cheveux
 const head=raw('head');if(head){const o=new THREE.Mesh(new THREE.TorusGeometry(.016,.004,8,20,Math.PI*1.5),metal);o.position.set(.07,.13,0);o.rotation.y=Math.PI/2;add(head,o);const og=new THREE.Mesh(new THREE.SphereGeometry(.007,10,8),gem);og.position.set(.072,.13,0);add(head,og);}
 return()=>group.forEach(m=>{m.parent&&m.parent.remove(m);m.geometry.dispose();});
}

/* ---------- l'afficheur ---------- */
export async function mountAvatar(el,opt){
 const W=el.clientWidth||320,H=Math.round(W*1.35);
 const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,preserveDrawingBuffer:!!opt.capture});
 renderer.setPixelRatio(Math.min(2,window.devicePixelRatio||1));renderer.setSize(W,H);renderer.outputColorSpace=THREE.SRGBColorSpace;
 el.appendChild(renderer.domElement);
 const scene=new THREE.Scene();const pm=new THREE.PMREMGenerator(renderer);scene.environment=pm.fromScene(new RoomEnvironment(),.04).texture;
 scene.add(new THREE.HemisphereLight(0xffe6c0,0x3a2430,1.1));const sun=new THREE.DirectionalLight(0xffc27a,2.2);sun.position.set(1.5,2.5,2);scene.add(sun);
 const rim=new THREE.DirectionalLight(0x9ab8ff,.8);rim.position.set(-2,1.5,-2);scene.add(rim);
 const cam=new THREE.PerspectiveCamera(26,W/H,.1,20);cam.position.set(0,.84,4.1);cam.lookAt(0,.8,0);
 const vrm=await loadVRM(opt.sex);scene.add(vrm.scene);
 // le visage regarde la caméra : l'avant est vers +Z après rotateVRM0 ; dans le repère des os, l'avant est -Z
 const front=-1;
 // pose détendue : bras le long du corps, légère flexion
 const nb=n=>vrm.humanoid.getNormalizedBoneNode(n);
 const pose=()=>{nb('leftUpperArm').rotation.set(0,0,1.18);nb('rightUpperArm').rotation.set(0,0,-1.18);nb('leftLowerArm').rotation.set(0,.25,0);nb('rightLowerArm').rotation.set(0,-.25,0);};
 pose();
 let undress=null;
 const apply=(look,col)=>{shape(vrm,look,opt.sex);paint(vrm,col||{});};
 apply(opt.look,opt.colors);
 undress=armor(vrm,{rank:opt.rank,sex:opt.sex,motif:opt.motif,gem:opt.gem,front});
 // rotation au doigt
 let yaw=0,drag=null;const cv=renderer.domElement;cv.style.touchAction='pan-y';
 cv.addEventListener('pointerdown',e=>{drag=e.clientX;cv.setPointerCapture(e.pointerId);});
 cv.addEventListener('pointermove',e=>{if(drag==null)return;yaw+=(e.clientX-drag)*.01;drag=e.clientX;});
 cv.addEventListener('pointerup',()=>{drag=null;});
 const clock=new THREE.Clock();let alive=true,t=0;
 const loop=()=>{if(!alive)return;const dt=Math.min(.05,clock.getDelta());t+=dt;
  vrm.scene.rotation.y=Math.PI+yaw+Math.sin(t*.4)*.06;
  const sp=nb('spine');if(sp)sp.rotation.x=Math.sin(t*1.6)*.015;const ch=nb('chest');if(ch)ch.rotation.x=Math.sin(t*1.6+.6)*.012;
  vrm.update(dt);renderer.render(scene,cam);requestAnimationFrame(loop);};
 loop();
 return{
  update(look,col){apply(look,col);},
  shot(){return renderer.domElement.toDataURL('image/jpeg',.85);},
  mats(){const o=[];vrm.scene.traverse(x=>{if(x.isMesh)(Array.isArray(x.material)?x.material:[x.material]).forEach(m=>o.push(m.name));});return o;},
  dispose(){alive=false;undress&&undress();scene.remove(vrm.scene);renderer.dispose();cv.remove();}
 };
}
