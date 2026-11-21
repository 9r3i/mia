/* global constant */
const FBUSER={
  uid:null,
  email:null,
},
isLocal=/^localhost|127\.0\.0\.1$/.test(location.hostname),
MIA=new mia,
HOSTS=[
  'http://127.0.0.1:9301/', // --> 0
  'http://127.0.0.1:9301/files/', // --> 1
  'https://9r3i.github.io/mia/public/', // --> 2
  'https://raw.githubusercontent.com/9r3i/mia/master/public/files/', // --> 3
  'https://rawfo.vercel.app/9r3i/mia/master/public/files/', // --> 4
  'https://9r3i.github.io/sabunjelly/files/', // --> 5
  'https://9r3i.github.io/mia/public/files/', // --> 6
],
HKEY=isLocal?1:6,
HOST=HOSTS[HKEY],
DBNAME='silsilah',
APPNAME='9r3i\\mia\\app@firebase',
LOCK=new Audio(HOST+'audio/car-lock.mp3'),
NOTE=new Audio(HOST+'audio/iphone-notification.mp3'),
PAGES=[
/* home page */
['','Silsilah',async function(query,app,env){
  document.body.innerHTML='';
  let host='https://silsilah200-default-rtdb.asia-southeast1.firebasedatabase.app/'+DBNAME+'/';
  /* tree element */
  if(query.hasOwnProperty('tree')){
    app.title('Family Tree');
    let ftree=new tree(host,{
      closer:false,
      sharer:false,
    }),
    rid=query.hasOwnProperty('root')?parseInt(query.root,10):1;
    await ftree.plant(query.tree,rid);
    return;
  }
  /* main elements */
  let content=app.element('div',{'class':'content'}),
  header=app.element('div',{'class':'header'}),
  footer=app.element('div',{'class':'footer'}),
  main=app.element('div',{id:'main'},[header,content,footer])
    .appendTo(document.body);
  /* header and title */
  let title=APPNAME+'::silsilah\\home';
  header.dataset.text=title;
  app.title(['Silsilah ',' Home'].join(String.fromCharCode(0x2015)));
  /* samples */
  let samples=[
    {
      title:'Sample Tree #1 (Adam as)',
      content:'This is the sample <b>family tree of prophets</b>: '
        +'from prophet Adam as to the last prophet Muhammad saw.',
      image:'image/prophet-family-tree.png',
      button:'Open Tree',
      url:'?tree=nabi',
    },
    {
      title:'Sample Tree #2 (Muhammad saw)',
      content:'This is the sample family tree of <b>Prophet '
        +'Muhammad saw</b> to his grandchildren. ',
      image:'image/prophet-family-tree.png',
      button:'Open Tree',
      url:'?tree=nabi&root=190',
    },
    {
      title:'Coming Soon...',
      content:'Build your own family tree.'
        +'<br />'
        +'Right now, I\'m still working on stability and performance.',
      image:'image/silsilah.png',
      button:isLocal?'Admin':'Home',
      url:isLocal?'admin':'',
    },
  ];
  /* sample loop */
  for(let sample of samples){
    let img=new Image,
    post=app.element('div',{'class':'post'}).appendTo(content),
    el=app.element('button',{
      'class':'button-blue',
      'data-url':sample.url,
    }).text(sample.button).clickOn(function(){
      app.go(this.dataset.url);
    }),
    t=app.element('div',{'class':'post-title'}).text(sample.title),
    p=app.element('p',{'class':'post-time'}).html(sample.content);
    img.src=HOST+sample.image;
    img.onerror=function(){
      this.remove();
    };
    post.append(img);
    t.appendTo(post);
    p.appendTo(post);
    el.appendTo(post);
  }
  /* grid */
  let grid=app.element('div',{'class':'grid'}).appendTo(content);
  for(let i=0;i<15;i++){
    app.element().appendTo(grid);
  }
  /* pre */
  app.pre([
    title,
    'git@github.com/9r3i/mia.git',
    'isLocal:'+JSON.stringify(isLocal),
  ].join('\n'));
}],
/* admin page */
[
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
      vh=minus?mh-10:mh+10;
      ec.style.height=vh+'px';
      ers.value=vh;
    },
  }
],
];


/* ===================[ initialize ]=================== */

/* anonymously initialize */
;(async function(app){
  //if(true){return;}
  document.body.innerHTML='';
  app.loader();
  /* get ready */
  let ready=await onFunctionReady('listen');
  document.body.innerHTML='';
  app.pre({ready});
  /* pages */
  for(let page of PAGES){
    app.routes.push(page);
  }
  /* initialize */
  if(ready){
    app.init();
  }
  /* end of statement */
})(MIA);

/* =====================[ blog ]===================== */

function __speak(s,l='en-US'){
  if(typeof s!=='string'){return false;}
  var p=new SpeechSynthesisUtterance();
  p.text=s;
  p.volume=1;
  p.rate=1;
  p.pitch=1;
  p.lang=l;
  window.speechSynthesis.speak(p);
  return true;
};

/* upload page */
function uploadPage(query,app,env){
  document.body.innerHTML='';
  let content=app.element('div',{'class':'content'}),
  main=app.element('div',{id:'main'},[content])
    .appendTo(document.body),
  input=app.element('input',{
    'class':'family-photo-input',
    'type':'file',
    'accept':'image/*',
  }).appendTo(content);
  input.onchange=function(){
    let file=this.files[0],
    esize=200,
    imgx=new Image;
    imgx.onload=async function(){
      let ratio=imgx.width>imgx.height
               ?imgx.height/imgx.width
               :imgx.width/imgx.height,
          iw=imgx.width>imgx.height?ratio*imgx.width:imgx.width,
          ih=imgx.height>imgx.width?ratio*imgx.height:imgx.height,
          sx=imgx.width>imgx.height
            ?(imgx.width-imgx.height)/2:0,
          sy=imgx.height>imgx.width
            ?(imgx.height-imgx.width)/2:0;
      let canvas=app.element('canvas',{
        width:esize,
        height:esize,
      }),
      ctx=canvas.getContext('2d');
      ctx.drawImage(imgx,sx,sy,iw,ih,0,0,esize,esize);
      canvas.appendTo(content);
      let base64ImageData=canvas.toDataURL(),
      apikey='f03253cc7545c473174bb996f67fdcad',
      url='https://api.imgbb.com/1/upload?key='+apikey,
      imageData=base64ImageData
        .replace('data:image/png;base64,',''),
      fdata=new FormData;
      fdata.append('image',imageData);
      let res=await fetch(url,{
        method:'POST',
        body:fdata,
      }).then(r=>r.json()).catch(e=>false);
      app.alert(res,3);
      if(res.success){
        // --> res.data.url;
      }
    };
    imgx.src=URL.createObjectURL(file);
  };
};

/* =====================[ admin ]===================== */

/* admin page -- @require: logout */
async function adminPage(query,app,env){
  document.body.innerHTML='';
  /* main element */
  let header=app.element('header',{'class':'admin-header'}),
  content=app.element('div',{'class':'admin-content'}),
  main=app.element('div',{'id':'main'},[
    header,content
  ]).appendTo(document.body),
  alias={
    id:'ID',
    name:'Name',
    father:'Father',
    mother:'Mother',
    birth:'Birthdate',
    death:'Deathdate',
    spouse:'Spouse',
    gender:'Gender',
    order:'Family Order',
    privilege:'Privilege',
    phone:'Phone Number',
    job:'Occupation',
    address:'Address',
    nickname:'Nickname',
    photo:'Photo URL',
  };
  /* load data */
  app.title('Members');
  let load=app.contentLoader('admin-content'),
  members=await readData();
  members=typeof members==='object'&&members!==null
    ?Object.values(members):[];
  load.remove();
  /* header button */
  app.element('button',{}).text('@'+FBUSER.email.split('@')[0]).appendTo(header).clickOn(()=>app.go('admin'));
  let logoutbtn=app.element('button',{'class':'button-red button-float-right'}).text('Logout').appendTo(header).clickOn(async function(){
    LOCK.play();
    let yes=await app.confirm('Logout now?\n'+FBUSER.email);
    if(!yes){return;}
    return await logout();
  });
  let plusbtn=app.element('button',{'class':'button-green button-float-right','style':'font-size:0.95rem;'}).html('&#xff0b;').appendTo(header).clickOn(()=>app.go('admin?add'));
  /* info */
  if(query.hasOwnProperty('id')){
    let member=getMemberData(query.id,members);
    if(!member){
        return app.alert('Error: Member is not found.');
    }
    /* set the form */
    let table=app.table(),
    img=new Image,
    photo=app.element('div',{'class':'member-photo'},[img]),
    hide=['privilege','photo'],
    date=['birth','death'],
    selection=['father','mother','spouse'],
    edit=app.element('button',{'class':'button-blue'}).text('Edit').clickOn(e=>app.go('admin?edit='+member.id));
    table.appendTo(content);
    /* photo */
    let head=table.header(photo,2);
    head.childNodes[0].style.backgroundColor='transparent';
    img.src=member.photo||HOST+'image/user.png';
    img.onload=function(){
    };
    img.onerror=function(){
      this.src=HOST+'image/user.png';
    };
    /* each data of the member */
    for(let key in member){
      let value=member[key],
      val=value.toString();
      if(hide.includes(key)){
        continue;
      }
      else if(date.includes(key)){
        let dp=app.parseDatetime(value);
        val=dp.match(/\sat\s/)?dp.split(' at ')[0]:'-';
      }
      else if(key=='gender'){
        val=['','Male','Female'][value];
      }
      else if(selection.includes(key)){
        val='-';
        let gdata=getMemberData(value,members);
        if(gdata){
          val=app.element('a',{
            'href':'#admin?id='+value,
          }).content(gdata.name);
        }
      }
      let row=table.row(alias[key],val);
    }
    /* buttons */
    table.row('',edit);
    return;
  }
  /* edit */
  if(query.hasOwnProperty('edit')||query.hasOwnProperty('add')){
    let def=defaultData(),
    isEdit=false;
    if(query.hasOwnProperty('edit')){
      def=getMemberData(query.edit,members);
      isEdit=true;
      if(!def){
        return app.alert('Error: Member is not found.');
      }
      def=defaultData(def);
      app.title('Edit Member #'+def.id);
    }else{
      let last=lastID(members,true);
      def.id=last;
      app.title('Add Member #'+def.id);
    }
    /* set the form */
    let id=isEdit?query.edit:'0',
    table=app.table(),
    input=app.element('input',{
      'class':'member-photo-input',
      'type':'file',
      'accept':'image/*',
    }),
    img=new Image,
    photo=app.element('div',{'class':'member-photo'},[img,input]),
    hide=['privilege','photo'],
    date=['birth','death'],
    readonly=['id'],
    number=['order'],
    selection=['father','mother','spouse'],
    save=app.element('button',{'class':'button-blue'}).text('Save'),
    del=app.element('button',{'class':'button-red','data-id':id}).text('Delete');
    table.appendTo(content);
    /* photo */
    let head=table.header(photo,2);
    head.childNodes[0].style.backgroundColor='transparent';
    img.src=def.photo||HOST+'image/user.png';
    img.onload=function(){
    };
    img.onerror=function(){
      this.src=HOST+'image/user.png';
    };
    /* each data of the member */
    for(let key in def){
      let value=def[key],
      val=app.element('input',{
        type:'text',
        name:key,
        maxlength:100,
        placeholder:alias[key]+'...',
        value:value,
      });
      if(hide.includes(key)){
        val.type='hidden';
        val.appendTo(content);
        continue;
      }
      else if(readonly.includes(key)){
        let clone=val.cloneNode(true),
        text=app.element().text(value);
        clone.type='hidden';
        val=app.element('div',{},[text,clone]);
      }
      else if(date.includes(key)){
        val.type='date';
      }
      else if(number.includes(key)){
        val.type='number';
      }
      else if(key=='gender'){
        val=app.select({
          '1':'Male',
          '2':'Female',
        },value,key);
        val.dataset.spouse=def.spouse;
        val.dataset.id=def.id;
        val.addEventListener('change',function(){
          let spouse=document.querySelector('select[name="spouse"]');
          if(!spouse){return;}
          let gdata=getMemberByGender(this.value==1?2:1,members,this.dataset.id),
          parent=spouse.parentNode,
          nsel=app.select({...{'0':'-'},...gdata},this.dataset.spouse,'spouse');
          parent.innerHTML='';
          parent.append(nsel);
        },false);
      }
      else if(selection.includes(key)){
        let gender=key=='father'?1:key=='mother'?2:def.gender==1?2:1,
        gdata=getMemberByGender(gender,members,def.id);
        val=app.select({...{'0':'-'},...gdata},value,key);
      }
      let row=table.row(alias[key],val);
    }
    /* buttons */
    table.row('',app.element('div',{'class':'buttons'},[save,del]));
    /* upload photo */
    input.onchange=async function(){
      let load=app.loader(),
      file=this.files[0],
      url=URL.createObjectURL(file),
      iphoto=document.querySelector('input[name="photo"]'),
      res=await upload(file,photo);
      load.remove();
      if(res){
        img.src=url;
        iphoto.value=res;
      }
    };
    /* save the post */
    save.clickOn(async function(e){
      let stext=this.innerText;
      this.disabled=true;
      this.text('Saving...');
      let data=app.formSerialize(),
      ndata=Object.values(members);
      data=defaultData(data);
      if(isEdit){
        let key=ndata.findIndex(d=>d.id==data.id);
        if(ndata.hasOwnProperty(key)){ndata[key]=data;}
        else{ndata.push(data);}
      }else{
        ndata.push(data);
      }
      let res=await writeData('',ndata);
      this.disabled=false;
      this.text(stext);
      if(!res){
        let pre=app.element('pre').text('Failed to save!'),
        parent=this.parentNode;
        parent.insertBefore(pre,save);
        await app.sleep(2000);
        pre.remove();
        return;
      }
      app.go('admin');
    });
    /* delete the entry */
    del.clickOn(async function(){
      LOCK.play();
      let yes=await app.confirm('Delete this member?');
      if(!yes){return;}
      let ndata=Object.values(members),
      key=ndata.findIndex(d=>d.id==this.dataset.id);
      if(!ndata.hasOwnProperty(key)){return;}
      delete ndata[key];
      ndata=Object.values(ndata);
      let stext=this.innerText;
      this.disabled=true;
      this.text('Deleting...');
      let load=app.loader(),
      res=await writeData('',ndata);
      this.disabled=false;
      this.text(stext);
      if(!res){
        await app.alert('Failed to delete.');
        return;
      }
      app.go('admin');
    });
    return;
  }
  /* empty */
  if(members.length==0){
    app.element('div',{'class':'content-empty'}).appendTo(content).clickOn(async function(){
      let yes=await app.confirm('Load from template?');
      if(!yes){return;}
      let temp=membersTemplate(),
      load=app.loader(),
      res=await writeData('',temp);
      load.remove();
      if(!res){
        return await app.alert('Failed to save template.');
      }
      app.go('admin');
    });
    return;
  }
  /* table */
  let table=app.table(),
  gender=['','male','female',
    app.element('div',{'style':'white-space:nowrap;'},[
      app.element('i',{'class':'member-gender-male'}),
      app.element('i',{'class':'member-gender-female'})
    ])
  ];
  table.appendTo(content);
  table.rowHead('ID','Name',gender[3],'Father','Mother','');
  /* search */
  table.row('',app.searchForm('name'),'',app.searchForm('father'),app.searchForm('mother'),'');
  /* members loop */
  for(let member of members){
    let father=getMemberData(member.father,members),
    mother=getMemberData(member.mother,members),
    hrefTree='#?tree='+FBUSER.uid+'&root='+member.id,
    hrefEdit='#admin?id='+member.id,
    name=app.element('a',{'href':hrefEdit}).content(member.name),
    ltr=app.element('a',{'href':hrefTree}).content(member.id),
    btn=app.element('button',{'class':'table-button','data-id':member.id}).html('&#x270e;').clickOn(function(){app.go('admin?edit='+this.dataset.id)}),
    chart=app.element('button',{'class':'table-button','data-id':member.id}).html('&#x1F4CA;').clickOn(function(){
      //app.go('?tree='+FBUSER.uid+'&root='+this.dataset.id);
      frameTree(FBUSER.uid,this.dataset.id);
    }),
    row=table.row(
      member.id,
      name,
      app.element('div',{
        'class':'member-gender-'+gender[member.gender],
      }),
      father?father.name:'',
      mother?mother.name:'',
      chart,
    );
    row.dataset.name=member.name;
    row.dataset.father=father?father.name:'';
    row.dataset.mother=mother?mother.name:'';
    row.childNodes[0].classList.add('td-center');
    row.childNodes[2].classList.add('td-center');
  }
  /* test */
  //plusbtn.style.maxHeight=logoutbtn.offsetHeight+'px';
  //app.alert([header.offsetHeight,plusbtn.offsetHeight]);
  //app.alert([logoutbtn.offsetHeight,plusbtn.offsetHeight]);
  //app.alert(Array.isArray(members));
}

/* register page -- @require: signup */
function registerPage(query,app,env){
  document.body.innerHTML='';
  app.title('Register');
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
    cpassword=app.element('input',{
      value:'',
      placeholder:'Confirm Password',
      maxlength:100,
      type:'password',
      name:'cpassword',
      autocomplete:'off',
      required:true,
    }),
    keyword=app.element('input',{
      value:'',
      placeholder:'Keyword',
      maxlength:100,
      type:'text',
      name:'keyword',
      autocomplete:'off',
      required:true,
    }),
    reg=app.element('button',{'class':'button-tosca'}).text('Register'),
    regForm=app.element('div',{'class':'login'},[
      app.element().text('Email'),
      email,
      app.element().text('New Password'),
      password,
      app.element().text('Confirm Password'),
      cpassword,
      app.element().text('Keyword'),
      keyword,
      reg,
    ]).appendTo(document.body);
  reg.clickOn(async ()=>{
    let stext=reg.innerText;
    reg.disabled=true;
    reg.text('Registering...');
    let days=['sunday','monday','tuesday','wednesday','thursday','friday','saturday'],
    today=days[(new Date).getDay()],
    text='Failed to register.',
    ptrn=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if(!ptrn.test(email.value)){
      text='Invalid email.';
    }
    else if(password.value!=cpassword.value){
      text='Password doesn\'t match.';
    }
    else if(keyword.value.toLowerCase()!=today){
      text='Invalid keyword.';
    }
    else{
      let res=await signup(email.value,password.value);
      if(res){
        text='Registered!';
        let pre=app.element('pre').text(text);
        regForm.insertBefore(pre,reg);
        reg.text('Redirecting...');
        await app.sleep(1000);
        return loginPage(query,app,env);
      }
    }
    reg.text('Failed');
    regForm.classList.add('login-shake');
    let pre=app.element('pre').text(text);
    regForm.insertBefore(pre,reg);
    await app.sleep(1000);
    reg.disabled=false;
    reg.text(stext);
    pre.remove();
    regForm.classList.remove('login-shake');
  });
}

/* login page -- @require: login */
function loginPage(query,app,env){
  document.body.innerHTML='';
  app.title('Login');
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
    submit=app.element('button',{'class':'button-orange other-button-down'}).text('Login'),
    reg=app.element('button',{'class':'button-tosca'}).text('Register'),
    loginForm=app.element('div',{'class':'login'},[
      app.element().text('Email'),
      email,
      app.element().text('Password'),
      password,
      submit,
      app.element().text('Have no account?'),
      reg,
    ]).appendTo(document.body);
    submit.clickOn(async ()=>{
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
    });
  reg.clickOn(()=>{
    registerPage(query,app,env);
  });
}

/* upload */
function upload(file,content,esize=200){
  return new Promise(resolve=>{
    let imgx=new Image;
    imgx.onload=async function(){
      let ratio=imgx.width>imgx.height
               ?imgx.height/imgx.width
               :imgx.width/imgx.height,
          iw=imgx.width>imgx.height?ratio*imgx.width:imgx.width,
          ih=imgx.height>imgx.width?ratio*imgx.height:imgx.height,
          sx=imgx.width>imgx.height
            ?(imgx.width-imgx.height)/2:0,
          sy=imgx.height>imgx.width
            ?(imgx.height-imgx.width)/2:0;
      let canvas=document.createElement('canvas');
      canvas.width=esize;
      canvas.height=esize;
      ctx=canvas.getContext('2d');
      ctx.drawImage(imgx,sx,sy,iw,ih,0,0,esize,esize);
      content.append(canvas);
      let base64ImageData=canvas.toDataURL(),
      apikey='f03253cc7545c473174bb996f67fdcad',
      url='https://api.imgbb.com/1/upload?key='+apikey,
      imageData=base64ImageData
        .replace('data:image/png;base64,',''),
      fdata=new FormData;
      fdata.append('image',imageData);
      let res=await fetch(url,{
        method:'POST',
        body:fdata,
      }).then(r=>r.json()).catch(e=>false);
      canvas.remove();
      if(res.success){
        let url=res.data.url
          .replace(/\/i\.ibb\.co\//,'/i.ibb.co.com/');
        return resolve(url);
      }else{
        return resolve(false);
      }
    };
    imgx.src=URL.createObjectURL(file);
  });
}

/* frame of tree */
function frameTree(uid,root=1){
  let app=MIA,
  frame=app.element('iframe',{
    'src':'#?tree='+uid+'&root='+root,
    'class':'frame-tree',
  }),
  closer=app.element('div',{'class':'frame-closer'}),
  load=app.loader();
  closer.frame=frame;
  closer.clickOn(function(){
    this.frame.remove();
    this.remove();
    document.body.style.removeProperty('overflow');
  });
  document.body.append(frame);
  document.body.append(closer);
  document.body.style.overflow='hidden';
  frame.addEventListener('load',async ()=>{
    load.remove();
    await app.sleep(1000);
    const doc=frame.contentDocument||frame.contentWindow.document;
    let viewport=doc.querySelector('meta[name="viewport"]');
    if(viewport){
      viewport.content='width=device-width,initial-scale=0.8,maximum-scale=2,user-scalable=yes';
    }
  });
  return {frame,closer};
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
    }else if(i>1000){
      return cb(false);
    }return onFunctionReadyCB(fn,cb,i+1);
  },1);
}


/* =====================[ data ]===================== */

/* get members template */
function membersTemplate(){
  let data=[
    {id:1,name:'Grandfather'},
    {id:2,name:'Father',father:1,spouse:5},
    {id:3,name:'Uncle',father:1},
    {id:4,name:'Aunt',father:1,gender:2},
    {id:5,name:'Mother',father:0,gender:2,spouse:2},
    {id:6,name:'Me',father:2,mother:5},
    {id:7,name:'Brother',father:2,mother:5},
    {id:8,name:'Sister',father:2,mother:5,gender:2},
    {id:9,name:'Daughter',father:6,gender:2},
    {id:10,name:'Son',father:6},
    {id:11,name:'Grandson',mother:9},
    {id:12,name:'Granddaughter',mother:9,gender:2},
    {id:13,name:'Cousin',mother:4,gender:2},
    {id:14,name:'Nephew',father:7},
    {id:15,name:'Niece',father:7,gender:2},
  ],
  res=[];
  for(let d of data){
    res.push(defaultData(d));
  }
  return res;
}

/* get member by gender */
function getMemberByGender(gender=1,data={},xid=0){
  data=typeof data==='object'&&data!==null?data:{};
  gender=parseInt(gender,10);
  let res={};
  for(let key in data){
    let d=data[key];
    if(d.id==xid){continue;}
    if(d.hasOwnProperty('gender')&&parseInt(d.gender,10)===gender){
      res[d.id]=d.name;
    }
  }
  return res;
}

/* get member data */
function getMemberData(id,data){
  data=typeof data==='object'&&data!==null?data:{};
  id=parseInt(id,10);
  let res=null;
  if(id==0){return res;}
  for(let key in data){
    let d=data[key];
    if(d.hasOwnProperty('id')&&parseInt(d.id,10)===id){
      res=d;
    }
  }
  return defaultData(res);
}

/* get last id */
function lastID(data,plus=false){
  data=typeof data==='object'&&data!==null?data:{};
  let last=0;
  for(let key in data){
    let d=data[key];
    if(d.hasOwnProperty('id')&&parseInt(d.id,10)>last){
      last=parseInt(d.id,10);
    }
  }
  return plus?last+1:last;
}

/* default data input */
function defaultData(data){
  let def={
    id:1,
    name:'',
    father:0,
    mother:0,
    birth:'',
    death:'',
    spouse:0,
    gender:1,
    order:0,
    privilege:'user',
    phone:'',
    job:'',
    address:'',
    nickname:'',
    photo:'',
  },
  numbers=['id','father','mother','spouse','gender','order'],
  res={};
  data=typeof data==='object'&&data!==null?data:{};
  for(let key in def){
    let val=data.hasOwnProperty(key)?data[key]:def[key];
    res[key]=numbers.includes(key)?parseInt('0'+val,10):val;
  }
  return res;
}

/* read data */
async function readData(path){
  if(!FBUSER.uid){return false;}
  return await read(DBNAME+'/'+FBUSER.uid+(path?'/'+path:''));
}

/* send data -- push with new unique id */
async function sendData(path,data){
  if(!FBUSER.uid){return false;}
  return await send(DBNAME+'/'+FBUSER.uid,data);
}

/* write data */
async function writeData(path,data){
  if(!FBUSER.uid){return false;}
  return await write(DBNAME+'/'+FBUSER.uid+(path?'/'+path:''),data);
}


