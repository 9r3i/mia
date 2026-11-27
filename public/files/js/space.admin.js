/* space.admin.js */
function SpaceAdmin(_query,_app,_env){
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
      'data-text':'__space',
      'data-version':'1.0.0'
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
  /* body header -- top left below logo */
  bodyHeader.text('Section');
  bodyHeader.divisions=['profile','account'];
  /* body header */
  bodyHeader.dataset.open='0';
  bodyHeader.dataset.width=(bodyHeader.offsetWidth+15)+'px';
  bodyHeader.style.width=(bodyHeader.offsetWidth+15)+'px';
  bodyHeader.clickOn(async function(){
    if(this.dataset.open=='1'){return;}
    this.dataset.open='1';
    this.style.width='12.5rem';
    this.dataset.text=this.innerText;
    if(Object.keys(this.divisions).length<2){
      await app.sleep(500);
      this.style.width=this.dataset.width;
      this.dataset.open='0';
      return;
    }
    let divisions={};
    for(let divis of this.divisions.sort()){
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
      await app.sleep(500);
      this.style.width=this.dataset.width;
      this.dataset.open='0';
      this.innerText=this.dataset.text;
    };
    sel.onchange=function(){
      app.go('?section='+this.value);
    };
  });
  /* app section or division */
  let section=query.hasOwnProperty('section')
    ?query.section:'profile',
  sectionName=section.split(/[^a-z]+/i).map(v=>{
    return v[0].toUpperCase()+v.substr(1);
  }).join(''),
  sectionMethod=query.hasOwnProperty('method')
    ?query.method:'dashboard',
  fname='Space'+sectionName,
  loader=app.contentLoader(),
  ready=await onFunctionReady(fname);
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
  app.title(env.title+'\\'+section);
  /* menus */
  let menus=spaceSection.hasOwnProperty('menus')
    &&Array.isArray(spaceSection.menus)
    ?spaceSection.menus:[];
  for(let mn of menus){
    this.addMenu(
      typeof mn.name==='string'?mn.name
        :typeof mn.namespace==='string'?mn.namespace:'-',
      typeof mn.icon==='string'?mn.icon:'thumb-tack',
      typeof mn.callback==='function'?mn.callback:function(){
        if(typeof mn.namespace==='string'){
          return app.go('?section='+section+'&method='+mn.namespace);
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
  return spaceSection[sectionMethod]();
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


