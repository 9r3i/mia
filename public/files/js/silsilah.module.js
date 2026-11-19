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
} from "https://www.gstatic.com/firebasejs/13.3.0/firebase-auth.js";

/* main global constants */
const FBAPP  = initializeApp(config()),
      FBAUTH = getAuth(FBAPP),
      FBDB   = getDatabase(FBAPP);

/* ==================[ import to window ]================== */
window.userinfo=userinfo;
window.listen=listen;
window.send=send
window.read=read;
window.write=write;
window.login=login;
window.logout=logout;
window.signup=signup;

/* =====================[ firebase ]===================== */

/* user info */
function userinfo(cb){
  cb=typeof cb==='function'?cb:function(){};
  return onAuthStateChanged(FBAUTH,async user=>{
      if(user){
        return cb({
          uid:user.uid,
          email:user.email,
        });
      }else{
        return cb(null);
      }
  });
}

/* listen */
function listen(path,cb,er){
  cb=typeof cb==='function'?cb:function(){};
  er=typeof er==='function'?er:function(){};
  return onValue(ref(FBDB,path),r=>{return cb(r.val())},er);
}

/* send -- push --> create unique path automatically */
async function send(path,data){
  return await set(push(ref(FBDB,path)),data)
    .then(r=>true).catch(e=>false);
}

/* write */
async function write(path,data){
  return await set(ref(FBDB,path),data)
    .then(r=>true).catch(e=>false);
}

/* read */
async function read(path){
  return await get(child(ref(FBDB),path))
    .then(r=>r.exists()?r.val():null).catch(e=>null);
}

/* logout */
async function logout(){
  return await signOut(FBAUTH).then(()=>true).catch(e=>false);
}

/* login */
async function login(email,pswd){
  return await signInWithEmailAndPassword(FBAUTH,email,pswd)
    .then(c=>c.user.uid).catch(e=>false);
}

/* signup */
async function signup(email,pswd){
  return await createUserWithEmailAndPassword(FBAUTH,email,pswd).then(c=>c.user.uid).catch(e=>false);
}

/* firebase config -- standalone */
function config(i=0){
  let a=[
    'eyJhcGlLZXkiOiJBSXphU3lEa2h4bTgzclg2U2dselE4VTJrNXQ4WjZ0Tnl4SDB0WnMiLCJhdXRoRG9tYWluIjoic2lsc2lsYWgyMDAuZmlyZWJhc2VhcHAuY29tIiwiZGF0YWJhc2VVUkwiOiJodHRwczovL3NpbHNpbGFoMjAwLWRlZmF1bHQtcnRkYi5hc2lhLXNvdXRoZWFzdDEuZmlyZWJhc2VkYXRhYmFzZS5hcHAiLCJwcm9qZWN0SWQiOiJzaWxzaWxhaDIwMCIsInN0b3JhZ2VCdWNrZXQiOiJzaWxzaWxhaDIwMC5hcHBzcG90LmNvbSIsIm1lc3NhZ2luZ1NlbmRlcklkIjoiNjkzNDg2OTQ0NzYzIiwiYXBwSWQiOiIxOjY5MzQ4Njk0NDc2Mzp3ZWI6ZDEzY2U3MmY4NTA3NzkyNjRiNGI1ZSIsIm1lYXN1cmVtZW50SWQiOiJHLTlWWVNaSDczQ0MifQ==',
  ],
  b=atob(a[i]),
  c=null;
  try{c=JSON.parse(b);}catch(e){return null;}
  return c;
}


