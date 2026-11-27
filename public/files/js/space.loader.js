/* space.loader.js */
function SpaceLoader(_query,_app,_env){
const query=_query,
  app=_app,
  env=_env;
this.init=async function(){
  /* main, header, menu, body, content */
  let div=app.element,
    menuButton=div('div',{'class':'menu-button'},[div(),div(),div()]),
    menuHeader=div('div',{'class':'menu-header'}),
    menu=div('div',{'class':'menu menu-hide'},[menuHeader]),
    header=div('header',{
      'class':'header',
      'data-text':env.title,
      'data-version':env.version,
    },[menuButton,menu]),
    title=div('div',{'class':'title'}),
    content=div('div',{'class':'content'}),
    bodyHeader=div('div',{'class':'body-header'}),
    bodyContent=div('div',{'class':'body-content'},[title,content]),
    bodyClear=div('div',{'style':'clear:both;'}),
    body=div('div',{'class':'body chat-bg'},[
      bodyHeader,bodyContent,bodyClear
    ]),
    main=div('main',{id:'main'},[header,body]).appendTo(document.body);
  /* menu button */
  menuButton.menu=menu;
  menuButton.clickOn(function(){
    let parent=this.menu.parentNode,
    shadow=div('div',{'class':'menu-shadow'}).appendTo(parent);
    shadow.menu=this.menu;
    this.menu.classList.remove('menu-hide');
    document.body.classList.add('dont-scroll');
    shadow.clickOn(function(){
      document.body.classList.remove('dont-scroll');
      this.menu.classList.add('menu-hide');
      this.remove();
    });
  });
  /* menu slide movable */
  this.menuMovable();
  /* menu header: user email */
  menuHeader.dataset.email=FBUSER.email;
  /* logout menu */
  let logoutMenu=this.addMenu('Logout','power-off',async function(){
    let yes=await app.confirm('Logout now?\n'+FBUSER.email);
    if(!yes){return;}
    await app.db.logout();
  },'#b33');
  /* body header -- top left below logo -- loading */
  bodyHeader.text('Loader');
  let load=app.contentLoader(),
  scopes=await app.db.read([
    'private',FBUSER.uid,'scope'
  ].join('/'))||['profile'];
  Object.defineProperty(env,'isAdmin',{
    value:await app.db.read('access')||false,
    writable:false,
  });
  load.remove();
  /* body header */
  bodyHeader.divisions=Object.values(scopes).sort();
  bodyHeader.dataset.division='loader';
  bodyHeader.dataset.open='0';
  bodyHeader.clickOn(async function(){
    if(this.dataset.open=='1'){return;}
    this.dataset.width=(this.offsetWidth)+'px';
    this.style.width=(this.offsetWidth)+'px';
    await app.sleep(100);
    this.dataset.open='1';
    this.style.width='12.5rem';
    this.dataset.text=this.innerText;
    if(Object.keys(this.divisions).length<2){
      await app.sleep(500);
      this.style.width=this.dataset.width;
      this.dataset.open='0';
      await app.sleep(100);
      this.style.removeProperty('width');
      return;
    }
    let divisions={};
    for(let divis of this.divisions){
      divisions[divis]=divis.split(/[^a-z]+/i).map(v=>{
        if(v.length<1){return '';}
        return v[0].toUpperCase()+v.substr(1);
      }).join('');
    }
    let sel=app.select(divisions,this.dataset.division,'division');
    sel.style.width='100%';
    this.innerHTML='';
    this.append(sel);
    sel.focus();
    sel.onblur=async e=>{
      await app.sleep(100);
      this.style.width=this.dataset.width;
      this.dataset.open='0';
      this.innerText=this.dataset.text;
      await app.sleep(100);
      this.style.removeProperty('width');
    };
    sel.onchange=function(){
      app.go(this.value);
    };
  });
  /* app section or division */
  let path=this.getPath(),
  section=path.section,
  sectionName=section.split(/[^a-z]+/i).map(v=>{
    return v[0].toUpperCase()+v.substr(1);
  }).join(''),
  sectionMethod=path.method,
  fname='Space'+sectionName;
  app.title(env.title+'\\'+section+'\\'+sectionMethod);
  if(!scopes.includes(section)){
    title.text('Page is not available.');
    content.text('Error: "'+sectionName+'" is out of scope.');
    return;
  }
  /* load section or divisio */
  let loader=app.contentLoader(),
  ready=await env.onFunctionReady(fname);
  loader.remove();
  if(!ready){
    title.text('Page is not available.');
    content.text('Error: "'+fname+'" is not available.');
    return;
  }
  /* initialize section */
  let spaceSection=new window[fname](query,app,env);
  bodyHeader.text(sectionName);
  bodyHeader.dataset.division=section;
  /* menus */
  let menus=spaceSection.hasOwnProperty('menus')
    &&Array.isArray(spaceSection.menus)
    ?spaceSection.menus:[],
  dashMenu=[{namespace:'dashboard',name:'Dashboard',icon:'dashboard'}];
  if(!menus.find(v=>v.namespace=='dashboard')){
    menus=[...dashMenu,...menus];
  }
  for(let mn of menus){
    this.addMenu(
      typeof mn.name==='string'?mn.name
        :typeof mn.namespace==='string'?mn.namespace:'-',
      typeof mn.icon==='string'?mn.icon:'thumb-tack',
      typeof mn.callback==='function'?mn.callback:function(){
        if(typeof mn.namespace==='string'){
          return env.go([section,mn.namespace]);
        }
      },
      typeof mn.color==='string'?mn.color:'#ddd'
    );
  }
  menu.append(logoutMenu);
  /* section -- @require: function/method dashboard */
  if(typeof spaceSection[sectionMethod]!=='function'){
    title.text('Page is not available.');
    content.text('Error: "'+fname+'\\'+sectionMethod+'" is not available.');
    return;
  }
  return spaceSection[sectionMethod](path.param);
};
/* get path */
this.getPath=function(){
  let path=location.hash.substr(1).split('?')[0].split('/');
  path=path.map(v=>decodeURIComponent(v));
  return {
    section:path[0]?decodeURIComponent(path[0]):'profile',
    method:path[1]?decodeURIComponent(path[1]):'dashboard',
    param:path[2]?decodeURIComponent(path[2]):null,
  };
};
/* menu add */
this.addMenu=function(text,icon,cb,color='#ddd'){
    let menu=document.querySelector('.menu'),
    div=document.createElement('div'),
    di=document.createElement('i'),
    dt=document.createElement('div');
    div.append(di);
    div.append(dt);
    menu.append(div);
    div.classList.add('menu-each');
    di.classList.add('fa');
    di.classList.add('fa-'+icon);
    di.style.color=color;
    dt.classList.add('menu-text');
    dt.innerText=text;
    div.title=text;
    div.callback=typeof cb==='function'?cb:function(){};
    div.onclick=function(){
      let shadow=document.querySelector('.menu-shadow');
      if(shadow){shadow.click();}
      this.callback();
    };
    return div;
};
/* menu movable */
this.menuMovable=function(){
  if(!window.hasOwnProperty('ontouchstart')){return;}
  window.addEventListener('touchend',function(e){
    let menuButton=document.querySelector('.menu-button'),
    webFrame=document.querySelector('.website-frame');
    if(!menuButton||webFrame||!window.MENU_MOVABLE_LEFT){
      window.MENU_MOVABLE_LEFT=false;
      return;
    }
    let isHide=window.MENU_MOVABLE_LEFT.hide,
    x=e.changedTouches?e.changedTouches[0].pageX:e.screenX,
    left=(x-window.MENU_MOVABLE_LEFT.x)+window.MENU_MOVABLE_LEFT.l;
    window.MENU_MOVABLE_LEFT=false;
    if(!isHide){
      menuButton.click();
    }else if(left<-100){
      let shadow=document.querySelector('.menu-shadow');
      if(shadow){shadow.click();}
    }
  },false);
  window.addEventListener('touchstart',function(e){
    let menu=document.querySelector('.menu'),
    webFrame=document.querySelector('.website-frame');
    if(!menu||webFrame){return;}
    let x=e.changedTouches?e.changedTouches[0].pageX:e.screenX,
    l=menu.offsetLeft;
    if(l===0||x>15){
      if(x>250){
        window.MENU_MOVABLE_LEFT={x:x,l:l,menu:menu,hide:true};
      }return;
    }window.MENU_MOVABLE_LEFT={x:x,l:l,menu:menu,hide:false};
  },false);
};
};


