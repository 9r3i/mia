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
      FBDB   = getDatabase(FBAPP),
      FBUSER = {
        uid: null,
        email: null,
        admin: null,
        username: null,
        photo: null,
        online: null,
      };

/* anonymous function to initialize */
;(async function(){
document.body.innerHTML='';
/* inutial statement */
onAuthStateChanged(FBAUTH,async user=>{
  if(user){
    FBUSER.uid=user.uid;
    FBUSER.email=user.email;
    let data=await read('users/'+user.uid);
    data.online=(new Date).getTime();
    FBUSER.photo=data.photo;
    FBUSER.admin=data.admin;
    FBUSER.username=data.username;
    FBUSER.online=data.online;
    await write('users/'+user.uid,data);
    pre('logged in', data); // goto chat page
  }else{
    pre('logged out'); // goto login page
  }
});

/* initialize */
let text='yang takkan pernah terlupakan selamanya dalam hidupku\n'
    +'meskipun hanya sekejap saja\n'
    +'meresap dalam jiwa\n'
    +'mengakar dalam hati\n'
    +'tertanam dalam sukma\n'
    +'terpatri dalam sanubari\n';

/**
pre('write',await write('text/binar',data));
let ndata=await read('text/binar');
pre('read',ndata);
pre('decrypt',bin.decrypt(ndata.encrypted));
//*/

//pre('test',(new Date).getTime().toString(36));
let nos=encrypt(text);
pre('encrypt',nos);
pre('decrypt',decrypt(nos));
  
//pre('isLogin',await isLogin());
})();

/**
-------------
data.map
-------------
users/<uid> {
  email: <email>,
  username: '',
  photo: '',
  admin: false,
  online: (new Date).getTime(),
}
-------------
friends/<uid> {
  uid: <uid>,
  email: <email>,
}
-------------
chat/<cid> {
  to: <uid>,
  from: <uid>,
  time: (new Date).getTime(),
  message: '',
  received: false,
  read: false,
}
-------------
**/

/* send chat */
async function sendChat(to,message){
  let data={
    to,
    from:uid,
    time: (new Date).getTime(),
    message,
    received: false,
    read: false,
  };
}

/* decrypt -- @require: binar */
function decrypt(s){
  s=typeof s==='string'?s:JSON.stringify(s);
  let a=/^([a-z]+):(\d+):/,
  b=s.match(a);
  if(!b){return null;}
  let c=s.replace(a,''),
  d=new binar(b[1],parseInt(b[2],10)),
  e=d.decrypt(c);
  return e||null;
};

/* encrypt -- @require: binar */
function encrypt(s){
  s=typeof s==='string'?s:JSON.stringify(s);
  let a=Math.ceil(Math.random()*255),
  b='abcdefghijklmnopqrstuvwxyz',
  c=b.split('').sort(r=>Math.random()-0.5)
    .join('').substr(0,9),
  d=new binar(c,a),
  e=d.encrypt(s);
  return [c,a,e].join(':');
};

/* is login */
async function isLogin(){
  return await read('access/user');
};

/* listen */
function listen(path,cb,er){
  cb=typeof cb==='function'?cb:function(){};
  er=typeof er==='function'?er:function(){};
  return onValue(ref(FBDB,path),r=>{return cb(r.val())},er);
};

/* send -- push --> create unique path automatically */
async function send(path,data){
  return await set(push(ref(FBDB,path)),data)
    .then(r=>true).catch(e=>false);
};

/* write */
async function write(path,data){
  return await set(ref(FBDB,path),data)
    .then(r=>true).catch(e=>false);
};

/* read */
async function read(path){
  return await get(child(ref(FBDB),path))
    .then(r=>r.exists()?r.val():null).catch(e=>null);
};

/* logout */
async function logout(){
  return await signOut(FBAUTH).then(()=>true).catch(e=>false);
};

/* login */
async function login(email,pswd){
  return await signInWithEmailAndPassword(FBAUTH,email,pswd)
    .then(c=>c.user.uid).catch(e=>false);
};

/* signup */
async function signup(email,pswd){
  return await createUserWithEmailAndPassword(FBAUTH,email,pswd).then(c=>c.user.uid).catch(e=>false);
};

/* firebase config */
function config(i=0){
  let a=[
    'eyJhcGlLZXkiOiJBSXphU3lDSEpBYWw3Q2ZEaDNkU2RUaHZobUUxWld0MTZ6TE16WG8iLCJhdXRoRG9tYWluIjoibW9iaWxlMjAwLmZpcmViYXNlYXBwLmNvbSIsInByb2plY3RJZCI6Im1vYmlsZTIwMCIsImRhdGFiYXNlVVJMIjoiaHR0cHM6Ly9tb2JpbGUyMDAtZGVmYXVsdC1ydGRiLmFzaWEtc291dGhlYXN0MS5maXJlYmFzZWRhdGFiYXNlLmFwcCIsImFwcElkIjoiMToxMTU0MTgzNTUwMjk6d2ViOmUwZjViZTg4NWQ0ZWViNjY4YWNiZGMiLCJzdG9yYWdlQnVja2V0IjoibW9iaWxlMjAwLmFwcHNwb3QuY29tIiwibWVzc2FnaW5nU2VuZGVySWQiOiIxMTU0MTgzNTUwMjkiLCJtZWFzdXJlbWVudElkIjoiRy0zM0c0MFc5OEQ0In0=',
  ],
  b=atob(a[i]),
  c=null;
  try{c=JSON.parse(b);}catch(e){return null;}
  return c;
}

/* html pre dom */
function pre(){
  let res=[];
  for(let s of arguments){
    res.push(typeof s==='string'?s:likeJSON(s,3));
  }
  let el=document.createElement('pre');
  document.body.append(el);
  el.innerText=res.join(' -- ');
  el.style.border='1px solid #ccc';
  el.style.padding='5px';
  el.style.color='#555';
  el.style.whiteSpace='pre-wrap';
  el.style.wordBreak='break-all';
  return el;
}

/* parse object to json string -- stand-alone */
function likeJSON(obj,limit,space,pad){
  let rtext='';  
  space=space?parseInt(space,0xa):0x0;
  limit=limit?parseInt(limit,0xa):0x1;
  pad=pad?parseInt(pad,0xa):0x2;
  if((typeof obj==='object'&&obj!==null)
    ||Array.isArray(obj)){
    let start=Array.isArray(obj)?'[':'{',
        end=Array.isArray(obj)?']':'}';
    if(space==0x0){
      rtext+=(' ').repeat(pad*space)+''+start+'\r\n';
    }
    let len=0,counter=0;
    for(let i in obj){
      if(obj.hasOwnProperty(i)){len++;}
    }
    for(let i in obj){
      counter++;
      let comma=counter<len?',':'',e=obj[i],espace=space+2;
      if((typeof e==='object'&&e!==null)
        ||Array.isArray(e)){
        let estart=Array.isArray(e)?'[':'{',
            eend=Array.isArray(e)?']':'}',
            k=start==='{'?'"'+i+'": ':'';
        rtext+=(' ').repeat(pad*espace)+''+k+estart+'\r\n';
        if((espace/2)<limit){
          rtext+=likeJSON(e,limit,espace,pad);
        }else{
          rtext+=(' ').repeat(pad*(espace+2))
            +'[***LIMITED:'+limit+'***]\r\n';
        }
        rtext+=(' ').repeat(pad*espace)+''+eend+comma+'\r\n';
      }else if(typeof e==='string'||typeof e==='number'){
        let k=typeof e==='number'?e.toString():JSON.stringify(e);
        i=start==='{'?'"'+i+'": ':'';
        rtext+=(' ').repeat(pad*espace)+''+i+k+comma+'\r\n';
      }else if(typeof e==='boolean'){
        let k=e===true?'true':'false';
        i=start==='{'?'"'+i+'": ':'';
        rtext+=(' ').repeat(pad*espace)+''+i+k+comma+'\r\n';
      }else if(e===null){
        i=start==='{'?'"'+i+'": ':'';
        rtext+=(' ').repeat(pad*espace)+''+i+'null'+comma+'\r\n';
      }else{
        let k='"['+(typeof e)+']"';
        i=start==='{'?'"'+i+'" : ':'';
        rtext+=(' ').repeat(pad*espace)+''+i+k+comma+'\r\n';
      }
    }
    if(space==0){
      rtext+=(' ').repeat(pad*space)+''+end+'\r\n';
    }
  }else if(typeof obj==='string'){
    rtext+=(' ').repeat(pad*space)+'"'+obj+'"\r\n';
  }else if(typeof obj==='number'){
    rtext+=(' ').repeat(pad*space)+''+obj.toString()+'\r\n';
  }else if(typeof obj==='boolean'){
    rtext+=(' ').repeat(pad*space)+''+(obj===true
      ?'true':'false')+'\r\n';
  }else if(obj===null){
    rtext+=(' ').repeat(pad*space)+'null\r\n';
  }else{
    rtext+=(' ').repeat(pad*space)+'"['+(typeof obj)+']"\r\n';
  }return rtext;
};


