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

/* main global constants */
const FBAPP  = initializeApp(config()),
      FBAUTH = getAuth(FBAPP),
      FBDB   = getDatabase(FBAPP),
      FBUSER = {
        uid:null,
        email:null,
      };

/* ==================[ import to window ]================== */
window.loginGoogle=loginGoogle;
window.userinfo=userinfo;
window.listen=listen;
window.send=send
window.read=read;
window.write=write;
window.login=login;
window.logout=logout;
window.signup=signup;

/* =====================[ testing ]===================== */
(async function(){
  if(true){return;}
  /* testing */
  document.body.innerHTML='';
  pro('ok1');
  userinfo(async user=>{
    pro('ok2');
    if(user){
      pro('Logged in',user);
      FBUSER.uid=user.uid;
      FBUSER.email=user.email;
      div('button').text('Logout')
        .appendTo(document.body)
        .clickOn(async function(){
        pro(await logout());
      });
    }else{
      pro('Logged out');
      div('button').text('Login with Google')
        .appendTo(document.body)
        .clickOn(async function(){
        await loginGoogle(pro,pro);
      });
    }
    pro('ok3');
  });
})();

/* html pre dom -- @require: likeJSON */
function pro(){
  let res=[];
  for(let s of arguments){
    res.push(typeof s==='string'?s:likeJSON(s,3));
  }
  let el=document.createElement('pre'),
  content=document.querySelector('.content');
  if(content){
    content.append(el);
  }else{
    document.body.append(el);
  }
  el.innerText=res.join(' -- ');
  el.style.border='1px solid #ccc';
  el.style.padding='5px';
  el.style.margin='5px';
  el.style.color='#555';
  el.style.whiteSpace='pre-wrap';
  el.style.wordBreak='break-all';
  el.style.fontSize='13px';
  return el;
}

/* sleep -- standalone */
function sleep(ms){
  return new Promise(resolve=>{
    setTimeout(resolve,ms);
  });
}

/* element creator -- standalone */
function div(name='div',attr={},children=[]){
  name=typeof name==='string'?name.toLowerCase():'div';
  attr=typeof attr==='object'&&attr!==null?attr:{};
  children=Array.isArray(children)?children:[];
  let main=document.createElement(name),
  notext=['option','a'];
  /* set attributes */
  for(let k in attr){
    main.setAttribute(k,attr[k]);
  }
  /* add children */
  for(let child of children){
    main.append(child);
  }
  /* add object property and method */
  main.attr=attr;
  main.html=function(html=''){
    this.innerHTML=html;
    return this;
  };
  main.text=notext.indexOf(name)>=0?''
    :function(text=''){
    this.innerText=text;
    return this;
  };
  main.content=function(content=''){
    this.textContent=content;
    return this;
  };
  main.appendTo=function(el){
    if(typeof el==='object'&&el!==null
    &&typeof el.append==='function'){
      el.append(this);
    }return this;
  };
  main.clickOn=function(cb){
    if(typeof cb==='function'){
      this.addEventListener('click',cb,false);
    }return this;
  };
  main.on=function(ev,cb){
    cb=typeof cb==='function'?cb:function(){};
    this.addEventListener(ev,cb,false);
    return this;
  };
  /* return the element object */
  return main;
}

/* parse object to json string -- standalone */
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

/* =====================[ firebase ]===================== */

/* login with google */
async function loginGoogle(cback,error,redirect=false){
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
}

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
    'eyJhcGlLZXkiOiJBSXphU3lET0FNMnB4bEZnai1mZUdhbHBlZjhHMEl0dEktYklXeTQiLCJhdXRoRG9tYWluIjoiaGVscGVyLTYyZmEwLmZpcmViYXNlYXBwLmNvbSIsImRhdGFiYXNlVVJMIjoiaHR0cHM6Ly9oZWxwZXItNjJmYTAtZGVmYXVsdC1ydGRiLmFzaWEtc291dGhlYXN0MS5maXJlYmFzZWRhdGFiYXNlLmFwcCIsInByb2plY3RJZCI6ImhlbHBlci02MmZhMCIsInN0b3JhZ2VCdWNrZXQiOiJoZWxwZXItNjJmYTAuZmlyZWJhc2VzdG9yYWdlLmFwcCIsIm1lc3NhZ2luZ1NlbmRlcklkIjoiMzEyNjUxMTQ5NjQ0IiwiYXBwSWQiOiIxOjMxMjY1MTE0OTY0NDp3ZWI6MzVhZGFiZDYyZDI5MDRjNmNjNWZlOSIsIm1lYXN1cmVtZW50SWQiOiJHLVNXNkVLMTFDSjYifQ==',
  ],
  b=atob(a[i]),
  c=null;
  try{c=JSON.parse(b);}catch(e){return null;}
  return c;
}


