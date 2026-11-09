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
      },
MIA=new mia,
HOST=[
  'http://127.0.0.1:9301/', // --> 0
  'http://127.0.0.1:9301/files/', // --> 1
  'https://raw.githubusercontent.com/9r3i/mia/master/public/files/',
  'https://rawfo.vercel.app/9r3i/mia/master/public/files/',
],
NOTE=new Audio(HOST[2]+'audio/car-lock.mp3'),
FRIENDS={};

MIA.routes.push(['','Login',async function(query,app,env){
/* clear the field */
document.body.innerHTML='';
loader();
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
    await onlineUpdate();
    return friendPage();
  }else{
    return loginPage();
  }
});
}]);
MIA.routes.push(['chat','Chat',async function(query,app,env){
/* clear the field */
document.body.innerHTML='';
loader();
if(!query.hasOwnProperty('uid')){
  return app.error('Not Found.',404);
}
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
    await onlineUpdate();
    return chatPage(query.uid);
  }else{
    return loginPage();
  }
});
}]);


/* using anonymous function to initialize */
;(async function(){
/* initialize */
MIA.init();
/* end of statement */
})();


/* chat page -- @require: div */
async function chatPage(uid){
  document.body.innerHTML='';
  MIA.title('Chat');
  const content=div('div',{'class':'content','id':'content'}),
  input=div('input',{'data-uid':uid,placeholder:'Message...'}),
  footer=div('div',{'class':'footer'},[input]),
  main=div('div',{id:'main'},[content,footer]).appendTo(document.body),
  user=FRIENDS.hasOwnProperty(uid)
    ?FRIENDS[uid]:await read('users/'+uid);
  input.onkeyup=async function(e){
    if(e.keyCode!==13||this.value==''){return;}
    this.đisabled=true;
    await sendChat(this.dataset.uid,this.value);
    this.đisabled=false;
    this.value='';
  };
  listen('chat',async function(data){
    let content=document.querySelector('#content');
    if(!content||!user){return;}
    content.innerHTML='';
    let total=0;
    for(let cid in data){
      if((data[cid].to==FBUSER.uid&&data[cid].from==user.uid)
        ||(data[cid].from==FBUSER.uid&&data[cid].to==user.uid)){
        if(data[cid].to==FBUSER.uid&&data[cid].received==false){
          total++;
        }
        chatMessage(cid,data[cid],user);
      }
    }
    document.body.scrollIntoView({behavior:'smooth',block:'end'});
    if(total>0){
      NOTE.play();
    }
  },e=>console.error(e));
}

/* generate chat message as listening -- @require: div */
function chatMessage(cid,data,user){
  let content=document.querySelector('#content');
  if(!content){return;}
  //div('pre').text(likeJSON(data)).appendTo(content);
  let time=chatMessageTime(data.time),
  text=decrypt(data.message),
  stime=div('span').text(time),
  itime=div('i').html('&#10004;'),
  justify=data.to==user.uid?'left':'right',
  photo=data.to==user.uid?FBUSER.photo:user.photo,
  username=data.to==user.uid?FBUSER.username:user.username,
  img=div('img',{src:photo,alt:username}),
  mimg=div('div',{'class':'message-photo'},[img]),
  mtext=div('div',{'class':'message-text'}).text(text),
  mtime=div('div',{'class':'message-time'},[
    data.to==user.uid?itime:'',stime
  ]),
  dm=div('div',{'class':'message message-'+justify,'data-cid':cid},[
    data.to==user.uid?mimg:'',
    div('div',{'class':'message-wrap message-wrap-'+justify},[
      mtime,
      mtext,
    ]),
    data.from==user.uid?mimg:'',
  ]).appendTo(content);
  if(data.from==FBUSER.uid){
    if(data.read==true){
      itime.classList.add('read');
    }
    if(data.received==true){
      itime.classList.add('received');
    }
  }
  if(data.to==FBUSER.uid&&data.read==false){
    data.read=true;
    data.received=true;
    chatMessageUpdate(cid,data);
  }
}

/* chat message update */
async function chatMessageUpdate(cid,data){
  return await write('chat/'+cid,data);
}

/* chat message time */
function chatMessageTime(time,format='en-US'){
  let now=new Date(),
  date=new Date(time),
  options={
    weekday:'long',
    year:'numeric',
    month:'long',
    day:'numeric',
    hour:'numeric',
    minute:'numeric',
  },
  fdate=date.toLocaleDateString(format,options),
  ndate=now.toLocaleDateString(format,options),
  ptrn=/^(\w+),\s(\w+)\s(\d+),\s(\d+)\sat\s(\d+:\d+\s\w+)/i,
  match=fdate.match(ptrn),
  nope=ndate.match(ptrn);
  if(match[4]==nope[4]){
    if(match[2]==nope[2]
      &&parseInt(nope[3])-parseInt(match[3])<7){
      if(parseInt(nope[3])-parseInt(match[3])==1){
        return 'Yesterday at '+match[5];
      }
      if(match[3]==nope[3]){
        return 'Today at '+match[5];
      }
      return match[1]+' at '+match[5];
    }
    return match[2]+' '+match[3]+' at '+match[5];
  }
  return fdate;
}

/* clear all chat */
async function clearChat(){
  return await write('chat',null);
}

/* friend page -- @require: div */
async function friendPage(){
  document.body.innerHTML='';
  MIA.title('Friends');
  let content=div('div',{'class':'content'}),
  main=div('div',{id:'main'},[content]).appendTo(document.body);
  div('button',{'class':''}).text('@'+FBUSER.username).appendTo(content);
  div('button',{'class':'button-red button-float-right'}).text('Logout').appendTo(content).clickOn(async function(){
    let yes=await MIA.confirm('Logout now?\n'+FBUSER.username);
    if(!yes){return;}
    let load=loader();
    await logout();
    load.remove();
  });
  if(FBUSER.admin){
    div('button',{'class':'button-purple button-float-right'}).text('Clear').appendTo(content).clickOn(async function(){
      let yes=await MIA.confirm('Clear all chat?');
      if(!yes){return;}
      let load=loader();
      await clearChat();
      load.remove();
    });
  }
  div('h1').appendTo(content).text('Friends');
  let cload=div('div',{'class':'content-loader'}).appendTo(content),
  data=await read('friends/'+FBUSER.uid);
  cload.remove();
  for(let uid in data){
    let user=data[uid],
    dimg=div('div',{'class':'post-image'},[
      div('img',{src:user.photo}),
    ]),
    ptitle=div('div',{'class':'post-title','data-uid':uid}).text(user.username),
    pemail=div('div',{'class':'post-time'}).text(
      user.email+'\n'+MIA.parseDatetime(user.online)
    ),
    button=div('button',{'class':'button-tosca','data-uid':uid}).text('Chat').clickOn(function(){
      return MIA.go('chat?uid='+this.dataset.uid);
    }),
    post=div('div',{'class':'post'},[
      dimg,ptitle,pemail,
      div('div',{'class':'post-button'},[button]),
    ]).appendTo(content);
    FRIENDS[uid]=user;
  }
  listen('chat',async function(data){
    let total={},counter=0;
    for(let cid in data){
      let ndata=data[cid];
      if(!total.hasOwnProperty(ndata.from)){
        total[ndata.from]=0;
      }
      if(data[cid].to==FBUSER.uid&&data[cid].read==false){
        let uid=data[cid].from,
        uq='.post-title[data-uid="'+uid+'"]',
        uel=document.querySelector(uq);
        if(!uel){continue;}
        let ux=document.getElementById('post-notif-'+uid);
        if(!ux){
          ux=div('div',{'class':'post-notif','id':'post-notif-'+uid,'data-total':'0'}).appendTo(uel);
        }
        total[ndata.from]++;
        ux.dataset.total=total[ndata.from]+'';
        ndata.received=true;
        chatMessageUpdate(cid,ndata);
        counter++;
      }
    }
    if(counter>0){
      NOTE.play();
    }
  },e=>console.error(e));
}

/* login page -- @require: div */
function loginPage(){
  document.body.innerHTML='';
  MIA.title('Login');
    let email=div('input',{
      value:'',
      placeholder:'Email',
      maxlength:100,
      type:'email',
      name:'email',
      autocomplete:'off',
      required:true,
    }),
    password=div('input',{
      value:'',
      placeholder:'Password',
      maxlength:100,
      type:'password',
      name:'password',
      autocomplete:'off',
      required:true,
    }),
    submit=div('button',{'class':'button-orange'}).text('Login'),
    loginForm=div('div',{'class':'login'},[
      div().text('Email'),
      email,
      div().text('Password'),
      password,
      submit,
    ]).appendTo(document.body);
    submit.onclick=async ()=>{
      let stext=submit.innerText;
      submit.disabled=true;
      submit.text('Checking...');
      let res=await login(email.value,password.value);
      if(!res){
        submit.text('Denied');
        loginForm.classList.add('login-shake');
        let text='Invalid username or password.',
        pre=div('pre').text(text);
        loginForm.insertBefore(pre,submit);
        await sleep(1000);
        submit.disabled=false;
        submit.text(stext);
        pre.remove();
        loginForm.classList.remove('login-shake');
        return;
      }
      submit.text('Redirecting...');
    };
}

/* online statement update */
async function onlineUpdate(){
  FBUSER.online=(new Date).getTime();
  return await write('users/'+FBUSER.uid,FBUSER);
}

/* add a friend */
async function addFriend(uid){
  let data=await read('users/'+uid);
  return await write(
    ['friends',FBUSER.uid,uid].join('/'),
    data
  );
};

/* send chat */
async function sendChat(to,message){
  let data={
    to,
    from:FBUSER.uid,
    time:(new Date).getTime(),
    message:encrypt(message),
    received:false,
    read:false,
  };
  return await send('chat',data);
};

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
  let a=Math.ceil(Math.random()*99),
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

/* loader -- standalone */
function loader(load=true){
  let el=document.getElementById('loader');
  if(el){el.remove();}
  if(load===false){return;}
  el=document.createElement('div');
  el.classList.add('loader');
  el.id='loader';
  document.body.append(el);
  return el;
};

/* sleep -- standalone */
function sleep(ms){
  return new Promise(resolve=>{
    setTimeout(resolve,ms);
  });
};

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
      this.onclick=cb;
    }return this;
  };
  /* return the element object */
  return main;
};

/* firebase config -- standalone */
function config(i=0){
  let a=[
    'eyJhcGlLZXkiOiJBSXphU3lDSEpBYWw3Q2ZEaDNkU2RUaHZobUUxWld0MTZ6TE16WG8iLCJhdXRoRG9tYWluIjoibW9iaWxlMjAwLmZpcmViYXNlYXBwLmNvbSIsInByb2plY3RJZCI6Im1vYmlsZTIwMCIsImRhdGFiYXNlVVJMIjoiaHR0cHM6Ly9tb2JpbGUyMDAtZGVmYXVsdC1ydGRiLmFzaWEtc291dGhlYXN0MS5maXJlYmFzZWRhdGFiYXNlLmFwcCIsImFwcElkIjoiMToxMTU0MTgzNTUwMjk6d2ViOmUwZjViZTg4NWQ0ZWViNjY4YWNiZGMiLCJzdG9yYWdlQnVja2V0IjoibW9iaWxlMjAwLmFwcHNwb3QuY29tIiwibWVzc2FnaW5nU2VuZGVySWQiOiIxMTU0MTgzNTUwMjkiLCJtZWFzdXJlbWVudElkIjoiRy0zM0c0MFc5OEQ0In0=',
  ],
  b=atob(a[i]),
  c=null;
  try{c=JSON.parse(b);}catch(e){return null;}
  return c;
}

/* html pre dom -- standalone */
async function pro(){
  let res=[];
  for(let s of arguments){
    res.push(typeof s==='string'?s:likeJSON(s,3));
  }
  if(MIA){return await MIA.alert(res.join('\n'));}
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

/* test word -- standalone */
function testWord(){
  return 'yang takkan pernah terlupakan selamanya dalam hidupku\nmeskipun hanya sekejap saja\nmeresap dalam jiwa\nmengakar dalam hati\ntertanam dalam sukma\nterpatri dalam sanubari'
}


