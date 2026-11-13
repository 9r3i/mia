/* import */
import { initializeApp } from "https://www.gstatic.com/firebasejs/13.2.0/firebase-app.js";
import { 
  getDatabase, 
  ref, 
  set, 
  push, 
  onValue,
  get,
  child,
} from "https://www.gstatic.com/firebasejs/13.2.0/firebase-database.js";
import { 
  getAuth, 
  signInAnonymously, 
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from "https://www.gstatic.com/firebasejs/13.2.0/firebase-auth.js";

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
    'eyJhcGlLZXkiOiJBSXphU3lCZ2xXazJrcFdVSHI5V0FPQmpvUUhQLVBoc0ctcS04em8iLCJhdXRoRG9tYWluIjoic2FidW5qZWwuZmlyZWJhc2VhcHAuY29tIiwiZGF0YWJhc2VVUkwiOiJodHRwczovL3NhYnVuamVsLWRlZmF1bHQtcnRkYi5hc2lhLXNvdXRoZWFzdDEuZmlyZWJhc2VkYXRhYmFzZS5hcHAiLCJwcm9qZWN0SWQiOiJzYWJ1bmplbCIsInN0b3JhZ2VCdWNrZXQiOiJzYWJ1bmplbC5maXJlYmFzZXN0b3JhZ2UuYXBwIiwibWVzc2FnaW5nU2VuZGVySWQiOiI0OTI5OTI2MTEyMzkiLCJhcHBJZCI6IjE6NDkyOTkyNjExMjM5OndlYjoxOTg2ODc1MzY1YTc1ODhjZDI2YzgyIiwibWVhc3VyZW1lbnRJZCI6IkctTU1RQlNYQjY4OCJ9',
  ],
  b=atob(a[i]),
  c=null;
  try{c=JSON.parse(b);}catch(e){return null;}
  return c;
}


