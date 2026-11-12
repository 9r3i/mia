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
      },
MIA=new mia,
HOST=[
  'http://127.0.0.1:9301/', // --> 0
  'http://127.0.0.1:9301/files/', // --> 1
  'https://raw.githubusercontent.com/9r3i/mia/master/public/files/', // --> 2
  'https://rawfo.vercel.app/9r3i/mia/master/public/files/',
  'https://9r3i.github.io/sabunjelly/files/', // --> 4
],
DBNAME='sabunjelly',
LOCK=new Audio(HOST[2]+'audio/car-lock.mp3'),
NOTE=new Audio(HOST[2]+'audio/iphone-notification.mp3');


/* =====================[ pages ]===================== */


/* default page */
MIA.routes.push(['','Home',async function(query,app,env){
  document.body.innerHTML='';
  /* main element */
  let header=div('header',{'class':'header','data-text':'CleanJelly'}),
  content=div('div',{'class':'content'}),
  main=div('div',{'id':'main'},[
    header,content
  ]).appendTo(document.body);
  /* load info */
  app.title('Loading...');
  header.text('Loading...');
  let load=contentLoader(),
  pid=query.hasOwnProperty('pid')
    ?query.pid:'-P6-cFC_Ja-pJ2Lr6YP6',
  site=await readData('site'),
  post=await readPost(pid),
  images=await readData('slider/images');
  load.remove();
  /* set title */
  app.title(site.name+' - '+site.description);
  header.text(site.description);
  /* slider */
  if(!query.hasOwnProperty('pid')){
    let slide=slider(images);
    content.append(slide.element);
    slide.start();
  }
  /* content body */
  let btitle=div('div',{'class':'body-title'}).text(post.title),
  bcontent=div('div',{'class':'body-content'}).html(post.content),
  body=div('div',{'class':'body'},[btitle,bcontent]).appendTo(content);
  /* footer */
  let footer=div('footer',{'class':'footer'}).appendTo(main),
  behind=div('div',{'class':'footer-left-behind'}).appendTo(footer),
  front=div('div',{'class':'footer-left-front'}).appendTo(footer),
  left=div('div',{'class':'footer-left'}).appendTo(footer),
  right=div('div',{'class':'footer-right'}).appendTo(footer),
  bottom=div('div',{'class':'footer-bottom'}).appendTo(footer),
  bank=div('div',{'class':'footer-left-top'}).text(site.data.bankAccount).appendTo(front),
  social=div('div',{'class':'footer-left-bottom'}).appendTo(front);
  for(let media in site.data.social){
    div('div',{'class':'footer-social bg-'+media,'data-url':site.data.social[media]}).appendTo(social).clickOn(function(){
      window.open(this.dataset.url,'_blank');
    });
  }
  right.text(site.data.address);
  bottom.text('Copyright '+site.date.year+', '+site.name+'. All right reserved.\nPowered by 9r3i');
  /* wa-button */
  let wa=div('div',{'class':'wa-button','data-url':site.data.social.whatsapp}).appendTo(main).clickOn(async function(){
    let load=loader();
    NOTE.play();
    await sleep(1000);
    window.open(this.dataset.url,'_blank');
    load.remove();
  });
  let visitorIMG=await env.viewsURL('sabunjelly'),
  img=new Image;
  img.src=visitorIMG;
  img.onload=function(){
    content.append(this);
  };
  img.onerror=function(){
    content.append(div().text('[Failed to load visitor]'));
  };
},{
  viewsURL:async function(user){
    let color=[0xea,0x72,0x33].join(',');
    return 'https://views-olive.vercel.app/?user='+user
      +'&color='+color+'&time='+(new Date).getTime();
  },
  views:async function(user,reg=false){
    let base='https://viewsx-default-rtdb.asia-southeast1.firebasedatabase.app/views/';
    if(reg){
      return await fetch(base+user+'/.json',{
        mode:'cors',
        method:'PUT',
        body:JSON.stringify({visitor:1})
      }).then(r=>true).catch(e=>false);
    }
    let visitor=await fetch(base+user+'/visitor.json').then(r=>r.text()).catch(e=>'error'),
    image='https://img.shields.io/badge/visitor-'+visitor+'-orange.svg?style=for-the-badge&time='+(new Date).getTime(),
    patch=fetch(base+user+'/.json',{
      mode:'cors',
      method:'PATCH',
      body:JSON.stringify({visitor:parseInt(visitor)+1})
    });
    return image;
  },
}]);

/* admin page */
MIA.routes.push(['admin','Admin',async function(query,app,env){
document.body.innerHTML='';
loader();
onAuthStateChanged(FBAUTH,async user=>{
  if(user){
    FBUSER.uid=user.uid;
    FBUSER.email=user.email;
    return adminPage(query,app,env);
  }else{
    return loginPage();
  }
});
},{
    setRow:function(minus=false){
      let ec=document.getElementById('editor-content'),
      ers=document.getElementById('editor-row-size');
      if(!ec||!ers){return;}
      let cmh=ec.style.height,
      mh=parseInt(cmh),
      vh=minus?mh-1:mh+1;
      ec.style.height=vh+'rem';
      ers.value=vh;
    },
}]);

window.MIA=MIA;
window.readPost=readPost;

/* using anonymous function to initialize */
;(async function(){
/* initialize */
  //MIA.init();
/* end of statement */
})();


/* =====================[ blog ]===================== */

/* copy to clipboard */
async function copyToClipboard(text){
  try{
    await navigator.clipboard.writeText(text);
    return true;
  }catch(e){
    return false;
  }
}

/* slider -- @require: tns (tiny slider) */
function slider(images){
  images=Array.isArray(images)?images:[];
  var imgs=[],
  cname='slider',
  config={
    container:'.'+cname,
    items:1,
    slideBy:"page",
    mouseDrag:false,
    swipeAngle:false,
    controls:false,
    nav:false,
    speed:400,
    startIndex:0,
    rewind:false,
    center:false,
    autoWidth:false,
    loop:true,
    autoplay:true,
    autoplayHoverPause:false,
    autoplayTimeout:2500,
    autoplayText:[
      "▶",
      "❚❚",
    ],
    autoplayButton:false,
    autoplayButtonOutput:false,
    autoplayResetOnVisibility:false,
  },
  div=document.createElement('div');
  div.classList.add(cname);
  for(var i in images){
    var di=document.createElement('div');
    var img=document.createElement('img');
    img.src=''+images[i];
    di.appendChild(img);
    div.appendChild(di);
    imgs.push(img);
  }
  return {
    config:config,
    start:async function(){
      if(typeof window.tns==='function'){
        return window.tns(this.config);
      }
      return alert('Error: Slider is not loaded.');
    },
    element:div,
    images:imgs,
  };
};

/* search form */
function searchForm(){
  let search=div('input',{
    name:'search',
    placeholder:'Search...',
    maxlength:100,
    value:'',
  });
  search.onkeyup=function(){
    let rg=new RegExp(this.value,'i'),
    nm=document.querySelectorAll('div[data-title]');
    for(let i=0;i<nm.length;i++){
      if(nm[i].dataset.title.match(rg)){
        nm[i].style.removeProperty('display');
      }else{
        nm[i].style.display='none';
      }
    }
  };
  return div('div',{'class':'content-search'},[
    search,
  ]);
};

/* admin page */
async function adminPage(query,app,env){
  document.body.innerHTML='';
  /* main element */
  let header=div('header',{'class':'header-admin'}),
  content=div('div',{'class':'content'}),
  main=div('div',{'id':'main'},[
    header,content
  ]).appendTo(document.body);
  /* load data */
  app.title('Admin');
  let load=contentLoader(),
  site=await readData('site'),
  post=await readPost();
  load.remove();
  /* logout */
  div('button',{}).text('@'+FBUSER.email.split('@')[0]).appendTo(header);
  div('button',{'class':'button-red button-float-right'}).text('Logout').appendTo(header).clickOn(async function(){
    LOCK.play();
    let yes=await app.confirm('Logout now?\n'+FBUSER.email);
    if(!yes){return;}
    return await logout();
  });
  div('button',{'class':'button-green button-float-right'}).text('New Post').appendTo(header).clickOn(async function(){
    return MIA.go('admin?add');
  });
  div('button',{'class':'button-orange button-float-right'}).text('Config').appendTo(header).clickOn(async function(){
    return MIA.go('admin?config');
  });
  /* config */
  if(query.hasOwnProperty('config')){
    /* set the form */
    let scontent=likeJSON(site,9),
    form=app.element('div',{'class':'editor'},[
      app.element().text('Site Config'),
      app.element('textarea',{
        name:'content',
        placeholder:'Content',
        id:'editor-content',
        style:'height:9rem;',
      }).content(scontent),
      app.element('div',{'class':'editor-row'},[
        app.element('button',{
          'class':'button-orange',
        }).text('-')
          .clickOn(function(){
            return env.setRow(true);
        }),
        app.element('input',{
          type:'number',
          readonly:'readonly',
          value:9,
          id:'editor-row-size'
        }),
        app.element('button',{
          'class':'button-orange',
        }).text('+')
          .clickOn(function(){
            return env.setRow();
        }),
      ]),
    ]).appendTo(content),
    save=app.element('button',{'class':'button-blue'}).text('Save').appendTo(form);
    /* save the post */
    save.clickOn(async function(e){
      let serial=app.formSerialize(),
      data=null;
      try{
        data=JSON.parse(serial.content);
      }catch(e){return false;}
      if(!data){return await MIA.alert('Invalid JSON format!');}
      let stext=this.innerText;
      this.disabled=true;
      this.text('Saving...');
      let res=await writeData('site',data);
      this.disabled=false;
      this.text(stext);
      if(!res){
        let pre=app.element('pre').text('Failed to save!');
        form.insertBefore(pre,save);
        await app.sleep(2000);
        pre.remove();
        return;
      }
      let pre=app.element('pre').text('Saved!');
      form.insertBefore(pre,save);
      await app.sleep(2000);
      pre.remove();
    });
    return;
  }
  /* edit */
  if(query.hasOwnProperty('edit')
    ||query.hasOwnProperty('add')){
    let def={
      title:'',
      content:'',
      time:(new Date).getTime(),
      author:'admin',
    },
    isEdit=false;
    if(query.hasOwnProperty('edit')
      &&post.hasOwnProperty(query.edit)){
      def=post[query.edit];
      isEdit=true;
    }
    /* set the form */
    let pid=isEdit?query.edit:'0',
    form=app.element('div',{'class':'editor'},[
      app.element().text('Title'),
      app.element('input',{
        type:'text',
        name:'title',
        maxlength:100,
        placeholder:'Title',
        value:def.title,
      }),
      app.element().text('Content'),
      app.element('textarea',{
        name:'content',
        placeholder:'Content',
        id:'editor-content',
        style:'height:9rem;',
      }).content(def.content),
      app.element('div',{'class':'editor-row'},[
        app.element('button',{
          'class':'button-orange',
        }).text('-')
          .clickOn(function(){
            return env.setRow(true);
        }),
        app.element('input',{
          type:'number',
          readonly:'readonly',
          value:9,
          id:'editor-row-size'
        }),
        app.element('button',{
          'class':'button-orange',
        }).text('+')
          .clickOn(function(){
            return env.setRow();
        }),
      ]),
      app.element('input',{
        type:'hidden',
        name:'time',
        value:(new Date).getTime(),
      }),
      app.element('input',{
        type:'hidden',
        name:'author',
        value:def.author,
      }),
    ]).appendTo(content),
    save=app.element('button',{'class':'button-blue','data-pid':pid,}).text('Save').appendTo(form),
    view=app.element('button',{
      'class':'button-tosca other-button',
      'data-pid':pid,
    }).text('View').clickOn(async function(){
        await this.save.click();
        await this.mia.sleep(500);
        this.mia.go('?pid='+this.dataset.pid);
      });
    if(isEdit){
      view.appendTo(form);
      view.save=save;
    }
    /* save the post */
    save.clickOn(async function(e){
      let stext=this.innerText;
      this.disabled=true;
      this.text('Saving...');
      let data=app.formSerialize();
      data.time=parseInt(data.time);
      let res=isEdit
        ?await writeData('post/'+this.dataset.pid,data)
        :await sendPost(data.title,data.content);
      this.disabled=false;
      this.text(stext);
      if(!res){
        let pre=app.element('pre').text('Failed to save!');
        form.insertBefore(pre,save);
        await app.sleep(2000);
        pre.remove();
        return;
      }
      if(query.hasOwnProperty('add')){
        app.go('admin');
        return;
      }
      let pre=app.element('pre').text('Saved!');
      form.insertBefore(pre,save);
      await app.sleep(2000);
      pre.remove();
    });
    return;
  }
  /* search */
  let search=searchForm(),
  end=div().appendTo(content);
  search.appendTo(content);
  /* each post */
  post=Object.fromEntries(
    Object.entries(post).reverse()
  );
  for(let pid in post){
    let p=post[pid],
    title=div('div',{'class':'post-title'}).text(p.title),
    time=div('div',{'class':'post-time'}).text(timeago(parseInt(p.time))),
    view=div('button',{'class':'button-tosca','data-pid':pid}).text('View').clickOn(function(){
      return MIA.go('?pid='+this.dataset.pid);
    }),
    edit=div('button',{'class':'button-blue','data-pid':pid}).text('Edit').clickOn(function(){
      return MIA.go('admin?edit='+this.dataset.pid);
    }),
    del=div('button',{'class':'button-red','data-pid':pid}).text('Delete').clickOn(async function(){
      let yes=await MIA.confirm('Delete this post?');
      if(!yes){return;}
      await writeData('post/'+this.dataset.pid,null);
      this.parentNode.parentNode.remove();
    }),
    button=div('div',{'class':'post-button'},[view,edit,del]),
    el=div('div',{'class':'post','data-title':p.title},[
      title,time,button,
    ]);
    content.append(el);
  }
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

/* read post */
async function readPost(path){
  return await readData('post'+(path?'/'+path:''));
}

/* send post */
async function sendPost(title,content,author='admin'){
  let data={
    title,
    content,
    time:(new Date).getTime(),
    author,
  };
  return await sendData('post',data);
}

/* read data */
async function readData(path){
  return await read(DBNAME+'/'+path);
}

/* send data */
async function sendData(path,data){
  return await send(DBNAME+'/'+path,data);
}

/* write data */
async function writeData(path,data){
  return await write(DBNAME+'/'+path,data);
}

/* =====================[ firebase ]===================== */

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

/* ===================[ standalone ]=================== */

/* time ago [en-US] -- standalone */
function timeago(time){
  let now=new Date(),
  date=new Date(time),
  format='en-US',
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

/* content loader -- standalone */
function contentLoader(load=true){
  let el=document.querySelector('.content-loader'),
  content=document.querySelector('.content');
  if(el){el.remove();}
  if(load===false){return;}
  el=document.createElement('div');
  el.classList.add('content-loader');
  if(content){
    content.append(el);
  }else{
    document.body.append(el);
  }
  return el;
}

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
      this.onclick=cb;
    }return this;
  };
  /* return the element object */
  return main;
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


