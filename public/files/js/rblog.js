/* rblog */
new rblog;
;function rblog(){
this.version='1.0.0';
this.pages={};
this.repos={};
// https://api.github.com/users/9r3i/gists
this.init=function(){
  /* use event listener */
  window.addEventListener('popstate',e=>{
    return this.route();
  },false);
  return this.route();
};
this.route=async function(){
  this.repos={};
  let path=this.path(),
  title=document.querySelector('title'),
  match=path.path.match(/^([^\/]+)\/([^\/]+)/);
  if(match){return this.release();}
  match=path.path.match(/^([^\/]+)/);
  if(match){return this.repo();}
  if(title){title.innerText='Insert Username';}
  document.body.innerHTML='';
  let h1=this.pre('h1')
    .text('Insert Username')
    .appendTo(document.body),
  pre=this.pre()
    .text('')
    .appendTo(document.body),
  input=this.pre('input',{
    placeholder:'Insert Username',
  }).appendTo(pre),
  button=this.pre('button').text('GO').appendTo(pre);
  input.onkeyup=function(e){
    if(e.keyCode!=13||this.value==''){return;}
    let user=this.value.replace(/[^a-z0-9_\.]+/i,'');
    window.location.assign('#'+user);
  };
  button.input=input;
  button.clickOn(function(e){
    if(this.input.value==''){return;}
    let user=this.input.value.replace(/[^a-z0-9_\.]+/i,'');
    window.location.assign('#'+user);
  });
  return true;
};
this.repo=async function(){
  this.pages={};
  let path=this.path(),
  page=path.query.hasOwnProperty('page')?path.query.page:1,
  title=document.querySelector('title'),
  match=path.path.match(/^([^\/]+)/);
  if(!match){
    if(title){title.innerText='Invalid request';}
    document.body.innerHTML='Error: Invalid request.';
    return;
  }
  let user=match[1],
  url=this.urlRepo(user,page),
  data=null;
  if(this.repos.hasOwnProperty(page)){
    return this.parseRepo(this.repos[page]);
  }
  if(title){title.innerText='Loading...';}
  document.body.innerHTML='';
  let loader=this.loader(),
  json=await fetch(url)
    .then(r=>r.text())
    .catch(e=>JSON.stringify(e));
  loader.remove();
  if(title){
    title.innerText=[
      user,
      'repo #'+page
    ].join(' > ');
  }
  try{data=JSON.parse(json);}catch(e){
    document.body.innerHTML=url+' -- '+json;
    return false;
  }
  if(!Array.isArray(data)){
    document.body.innerHTML=url+' -- '+json;
    return false;
  }
  this.repos[page]=data;
  this.parseRepo(data);
  return true;
};
this.parseRepo=function(data){
  document.body.innerHTML='';
  let path=this.path(),
  page=path.query.hasOwnProperty('page')?path.query.page:1,
  title=this.pre('h1')
    .text(path.path+'/repo #'+page)
    .appendTo(document.body),
  pre=this.pre()
    .text(' ')
    .appendTo(document.body);
  if(page>1){
    let prev=this.pre('a',{
      href:'#'+path.path+'?page='+(parseInt(page)-1),
      style:'float:left;',
    }).content('[PREVIOUS]').appendTo(pre);
  }
  if(data.length>=30){
    let next=this.pre('a',{
      href:'#'+path.path+'?page='+(parseInt(page)+1),
      style:'float:right;',
    }).content('[NEXT]').appendTo(pre);
  }
  for(let i=0;i<data.length;i++){
    this.pre()
      .html(
        i+' --> <a href="#'
        +data[i].full_name+'">'+data[i].name+'</a>'
        +'\n'+'-'.repeat(32)
        +'\n'
        +data[i].description
        +'\n\n\n'
        +'<a target="_blank" href="https://github.com/'
        +data[i].full_name+'">[Github]</a>'
      ).appendTo(document.body);
  }
  return true;
};
this.urlRepo=function(user,page=1){
  return [
    'https://api.github.com/users',
    user,
    'repos',
  ].join('/')+'?page='+page;
};
this.release=async function(){
  let path=this.path(),
  page=path.query.hasOwnProperty('page')?path.query.page:1,
  title=document.querySelector('title'),
  match=path.path.match(/^([^\/]+)\/([^\/]+)/);
  if(!match){
    if(title){title.innerText='Invalid request';}
    document.body.innerHTML='Error: Invalid request.';
    return;
  }
  let user=match[1],
  repo=match[2],
  url=this.url(user,repo,page),
  data=null;
  if(this.pages.hasOwnProperty(page)){
    return this.parse(this.pages[page]);
  }
  if(title){title.innerText='Loading...';}
  document.body.innerHTML='';
  let loader=this.loader(),
  json=await fetch(url)
    .then(r=>r.text())
    .catch(e=>JSON.stringify(e));
  loader.remove();
  if(title){
    title.innerText=[
      user,
      repo,
      'release #'+page
    ].join(' > ');
  }
  try{data=JSON.parse(json);}catch(e){
    document.body.innerHTML=url+' -- '+json;
    return false;
  }
  if(!Array.isArray(data)){
    document.body.innerHTML=url+' -- '+json;
    return false;
  }
  this.pages[page]=data;
  this.parse(data);
  return true;
};
this.parse=function(data){
  document.body.innerHTML='';
  let path=this.path(),
  page=path.query.hasOwnProperty('page')?path.query.page:1,
  title=this.pre('h1')
    .text(path.path+'/release #'+page)
    .appendTo(document.body),
  pre=this.pre()
    .text(' ')
    .appendTo(document.body);
  if(page>1){
    let prev=this.pre('a',{
      href:'#'+path.path+'?page='+(parseInt(page)-1),
      style:'float:left;',
    }).content('[PREVIOUS]').appendTo(pre);
  }
  if(data.length>=30){
    let next=this.pre('a',{
      href:'#'+path.path+'?page='+(parseInt(page)+1),
      style:'float:right;',
    }).content('[NEXT]').appendTo(pre);
  }
  for(let i=0;i<data.length;i++){
    let assets=this.asset(data[i].assets);
    this.pre()
      .html(
// https://github.com/9r3i/static/releases/tag/ufisyari
        i+' --> '+data[i].name
        +' <a target="_blank" href="https://github.com/'
        +path.path+'/releases/tag/'
        +data[i].tag_name+'">[Github]</a>'
        +'\n'+'-'.repeat(32)
        +'\n'
        +data[i].body
        +'\n'+'-'.repeat(32)
        +assets
        +'\n\n\n'
      ).appendTo(document.body);
  }
  return true;
};
this.asset=function(assets=[]){
  assets=Array.isArray(assets)?assets:[];
  let res='\n[ASSETS:'+assets.length+']:\n',
  counter=0;
  for(let r of assets){
    counter++;
    let size=Math.ceil(r.size/1024);
    res+=counter+'. <a href="'
      +r.browser_download_url+'" target="_blank">'
      +r.name+'</a> ['+size+'kb]\n';
  }
  return res;
};
this.loader=function(x){
  let el=document.getElementById('loader');
  if(el){el.remove();}
  if(x===false){return;}
  el=document.createElement('div');
  el.classList.add('loader');
  el.id='loader';
  document.body.append(el);
  return el;
};
this.path=function(){
  let query={},
  hash=window.location.hash.substr(1).split('?'),
  raw=hash.length>1?hash[1].split('&'):[];
  for(let r of raw){
    let s=r.split('=');
    query[s[0]]=s[1];
  }
  return {
    path:hash[0],
    query,
  };
};
this.url=function(user,repo,page=1){
  return [
    'https://api.github.com/repos',
    user,
    repo,
    'releases',
  ].join('/')+'?page='+page;
};
this.text=function(text){
  let el=document.createTextNode(text);
  document.body.append(el);
  return el;
};
/* parse object to json string -- stand-alone */
this.__proto__.likeJSON=function(obj,limit,space,pad){
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
          rtext+=this.likeJSON(e,limit,espace,pad);
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
/* create element -- stand-alone */
this.__proto__.pre=function(name='pre',attr={},children=[]){
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
  main.mia=this;
  /* return the element object */
  return main;
};
return this.init();
};

