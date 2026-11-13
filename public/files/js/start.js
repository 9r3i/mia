/* global constant */
const FBUSER = {
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
DBNAME='starter',
LOCK=new Audio(HOST[2]+'audio/car-lock.mp3'),
NOTE=new Audio(HOST[2]+'audio/iphone-notification.mp3');


/* =====================[ pages ]===================== */

/* admin page route */
MIA.routes.push([
  'admin',
  'Admin',
  async function(query,app,env){
    document.body.innerHTML='';
    app.loader();
    return userinfo(async user=>{
      if(user){
        FBUSER.uid=user.uid;
        FBUSER.email=user.email;
        return adminPage(query,app,env);
      }else{
        return loginPage(query,app,env);
      }
    });
  },
  {
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
  }
]);

/* home page route */
MIA.routes.push(['','Home',async function(query,app,env){
  document.body.innerHTML='';
  let load=app.contentLoader(),
  post=await readPost(query.hasOwnProperty('pid')?query.pid:'');
  load.remove();
  app.pre(post);
}]);


/* ===================[ initialize ]=================== */

/* anonymously initialize */
;(async function(){
  document.body.innerHTML='Loading...';
  /* get ready */
  let ready=await onFunctionReady('listen');
  document.body.innerHTML=JSON.stringify(ready);
  /* initialize */
  if(ready){
    MIA.init();
  }
  /* end of statement */
})();


/* =====================[ blog ]===================== */

/* admin page */
async function adminPage(query,app,env){
  document.body.innerHTML='';
  /* main element */
  let header=app.element('header',{'class':'header-admin'}),
  content=app.element('div',{'class':'content'}),
  main=app.element('div',{'id':'main'},[
    header,content
  ]).appendTo(document.body);
  /* load data */
  app.title('Admin');
  let load=app.contentLoader(),
  site=await readData('site'),
  post=await readPost();
  load.remove();
  /* logout */
  app.element('button',{}).text('@'+FBUSER.email.split('@')[0]).appendTo(header).clickOn(function(){
    app.go('admin');
  });
  app.element('button',{'class':'button-red button-float-right'}).text('Logout').appendTo(header).clickOn(async function(){
    LOCK.play();
    let yes=await app.confirm('Logout now?\n'+FBUSER.email);
    if(!yes){return;}
    return await logout();
  });
  app.element('button',{'class':'button-green button-float-right'}).text('New Post').appendTo(header).clickOn(async function(){
    return MIA.go('admin?add');
  });
  app.element('button',{'class':'button-orange button-float-right'}).text('Config').appendTo(header).clickOn(async function(){
    return MIA.go('admin?config');
  });
  /* config */
  if(query.hasOwnProperty('config')){
    /* set the form */
    let scontent=app.likeJSON(site,9),
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
  let search=app.searchForm('title'),
  end=app.element().appendTo(content);
  search.appendTo(content);
  /* each post */
  post=Object.fromEntries(
    Object.entries(post).reverse()
  );
  for(let pid in post){
    let p=post[pid],
    title=app.element('div',{'class':'post-title'}).text(p.title),
    time=app.element('div',{'class':'post-time'}).text(app.timeago(parseInt(p.time))),
    view=app.element('button',{'class':'button-tosca','data-pid':pid}).text('View').clickOn(function(){
      return MIA.go('?pid='+this.dataset.pid);
    }),
    edit=app.element('button',{'class':'button-blue','data-pid':pid}).text('Edit').clickOn(function(){
      return MIA.go('admin?edit='+this.dataset.pid);
    }),
    del=app.element('button',{'class':'button-red','data-pid':pid}).text('Delete').clickOn(async function(){
      let yes=await MIA.confirm('Delete this post?');
      if(!yes){return;}
      await writeData('post/'+this.dataset.pid,null);
      this.parentNode.parentNode.remove();
    }),
    button=app.element('div',{'class':'post-button'},[view,edit,del]),
    el=app.element('div',{'class':'post','data-title':p.title},[
      title,time,button,
    ]);
    content.append(el);
  }
}

/* login page -- @require: login */
function loginPage(query,app,env){
  document.body.innerHTML='';
  MIA.title('Login');
    let email=app.element('input',{
      value:'',
      placeholder:'Email',
      maxlength:100,
      type:'email',
      name:'email',
      autocomplete:'off',
      required:true,
    }),
    password=app.element('input',{
      value:'',
      placeholder:'Password',
      maxlength:100,
      type:'password',
      name:'password',
      autocomplete:'off',
      required:true,
    }),
    submit=app.element('button',{'class':'button-orange'}).text('Login'),
    loginForm=app.element('div',{'class':'login'},[
      app.element().text('Email'),
      email,
      app.element().text('Password'),
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
        pre=app.element('pre').text(text);
        loginForm.insertBefore(pre,submit);
        await app.sleep(1000);
        submit.disabled=false;
        submit.text(stext);
        pre.remove();
        loginForm.classList.remove('login-shake');
        return;
      }
      submit.text('Redirecting...');
    };
}


/* ===================[ basic ]=================== */

/* onFunctionReady */
function onFunctionReady(fn){
  return new Promise(resolve=>{
    return onFunctionReadyCB(fn,resolve);
  });
}

/* onFunctionReadyCB */
function onFunctionReadyCB(fn,cb,i=0){
  cb=typeof cb==='function'?cb:function(){};
  return setTimeout(e=>{
    if(window.hasOwnProperty(fn)
      &&typeof window[fn]==='function'){
      return cb(true);
    }else if(i>3000){
      return cb(false);
    }return onFunctionReadyCB(fn,cb,i+1);
  },1);
}

/* decrypt -- @require: binar.js */
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

/* encrypt -- @require: binar.js */
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


/* =====================[ blog ]===================== */

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


/* =================[ standalone ]================= */

/* test word -- standalone */
function testWord(){
  return 'yang takkan pernah terlupakan selamanya dalam hidupku\nmeskipun hanya sekejap saja\nmeresap dalam jiwa, mengakar dalam hati\ntertanam dalam sukma, terpatri dalam sanubari';
}


