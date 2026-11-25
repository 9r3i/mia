/* import */
import { initializeApp } from "https://www.gstatic.com/firebasejs/13.3.0/firebase-app.js";
import { 
  getDatabase, 
  ref, 
  set, 
  push, 
  onValue,
  get,
  child,
} from "https://www.gstatic.com/firebasejs/13.3.0/firebase-database.js";
import { 
  getAuth, 
  signInAnonymously, 
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
} from "https://www.gstatic.com/firebasejs/13.3.0/firebase-auth.js";

/* ==================[ import to window ]================== */
window.Firebase=Firebase;

/* =====================[ firebase ]===================== */
;function Firebase(config){
if(typeof config==='string'){
  let base=atob(config);
  try{config=JSON.parse(base);}catch(e){}
}
const FBAPP  = initializeApp(config),
      FBAUTH = getAuth(FBAPP),
      FBDB   = getDatabase(FBAPP),
      FBUSER = {
        uid:null,
        email:null,
        emailVerified:null,
        displayName:null,
        photoURL:null,
      };
/* login with google */
this.loginGoogle=async function(cback,error,redirect=false){
  cback=typeof cback==='function'?cback:function(){};
  error=typeof error==='function'?error:function(){};
  let provider=new GoogleAuthProvider();
  if(redirect){
    signInWithRedirect(FBAUTH,provider);
    getRedirectResult(FBAUTH).then(result=>{
      let credential=GoogleAuthProvider.credentialFromResult(result),
      token=credential.accessToken,
      user=result.user;
    return cback(user,token);
    }).catch(error);
    return;
  }
  signInWithPopup(FBAUTH,provider).then(result=>{
    let credential=GoogleAuthProvider.credentialFromResult(result),
    token=credential.accessToken,
    user=result.user;
    return cback(user,token);
  }).catch(error);
};
/* user info */
this.userinfo=function(cb){
  cb=typeof cb==='function'?cb:function(){};
  return onAuthStateChanged(FBAUTH,async user=>{
      if(user){
        return cb({
          uid:user.uid,
          email:user.email,
          emailVerified:user.emailVerified,
          displayName:user.displayName,
          photoURL:user.photoURL,
        });
      }else{
        return cb(null);
      }
  });
};
/* listen */
this.listen=function(path,cb,er){
  cb=typeof cb==='function'?cb:function(){};
  er=typeof er==='function'?er:function(){};
  return onValue(ref(FBDB,path),r=>{return cb(r.val())},er);
};
/* send -- push --> create unique path automatically */
this.send=async function(path,data){
  return await set(push(ref(FBDB,path)),data)
    .then(r=>true).catch(e=>false);
};
/* write */
this.write=async function(path,data){
  return await set(ref(FBDB,path),data)
    .then(r=>true).catch(e=>false);
};
/* read */
this.read=async function(path){
  return await get(child(ref(FBDB),path))
    .then(r=>r.exists()?r.val():null).catch(e=>null);
};
/* logout */
this.logout=async function(){
  return await signOut(FBAUTH).then(()=>true).catch(e=>false);
};
/* login */
this.login=async function(email,pswd){
  return await signInWithEmailAndPassword(FBAUTH,email,pswd)
    .then(c=>c.user.uid).catch(e=>false);
};
/* signup */
this.signup=async function(email,pswd){
  return await createUserWithEmailAndPassword(FBAUTH,email,pswd).then(c=>c.user.uid).catch(e=>false);
};
};


