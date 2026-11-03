/**
 * mia
 * ~ m... i... a...
 * ~ mia.js -- client
 * authored by 9r3i
 * https://github.com/9r3i/mia
 * first idea at october 2015
 * continued at october 7th 2026
 * @usage: new mia;
 **/
;const mia=function(host=''){
/* set to true before compile to appbase */
this.production=false;
/* the version code */
Object.defineProperty(this,'versionCode',{
  value:153,
  writable:false,
});
/* the version */
Object.defineProperty(this,'version',{
  value:this.versionCode.toString().split('').join('.'),
  writable:false,
});
this.host=host;
this.key=null;
this.user=null;
/* fake loader -- promise */
this.fakeLoader=function(dl,s=10){
  return new Promise(resolve=>{
    this.fakeLoaderCB(resolve,dl,s);
  });
};
/* fake loader callback -- no-ui */
this.fakeLoaderCB=function(cb,dl,s=10,i=0){
  i=typeof i==='number'&&i!==NaN?i:0;
  s=typeof s==='number'&&s!==NaN?s:10;
  if(i>=100){
    return typeof cb==='function'?cb(true):false;
  }
  i++;
  if(typeof dl==='function'){
    dl({
      type:'progress',
      loaded:i,
      total:100,
      isTrusted:true,
    });
  }
  setTimeout(e=>{
    this.fakeLoaderCB(cb,dl,s,i);
  },s);
};
/* prompt */
this.__proto__.prompt=function(text,value,ok,no){
  return new Promise(resolve=>{
    this.promptCB(text,resolve,value,ok,no);
  });
};
/* prompt callback */
this.__proto__.promptCB=function(text,cback,value='',ok='OK',no='Cancel'){
  let button=this.confirmCB(text,cback),
  input=this.element('input',{
    type:'text',
    value:value,
    placeholder:'Insert...',
    id:'alert-input'
  }).appendTo(button.content);
  button.header.dataset.text='Prompt';
  button.text(ok);
  button.input=input;
  button.cancel.text(no);
  button.clickOn(function(){
    return this.action(this.input.value);
  });
  return button;
};
/* confirm */
this.__proto__.confirm=function(text){
  return new Promise(resolve=>{
    this.confirmCB(text,resolve);
  });
};
/* confirm callback */
this.__proto__.confirmCB=function(text,cback){
  let button=this.alertCB(text,cback),
  cancel=this.element('button',{
    'class':'button-cancel',
  }).text('No').appendTo(button.footer);
  button.header.dataset.text='Confirm';
  button.text('Yes');
  cancel.button=button;
  cancel.clickOn(function(){
    return this.button.action(false);
  });
  button.cancel=cancel;
  return button;
};
/* alert */
this.__proto__.alert=function(text){
  return new Promise(resolve=>{
    this.alertCB(text,resolve);
  });
};
/* alert callback --> @return: button object */
this.__proto__.alertCB=function(text,cb){
  let old=document.getElementById('alert-bg');
  if(old){old.remove();}
  text=typeof text==='string'?text:JSON.stringify(text);
  let button=this.element('button',{
        'class':'button-confirm',
        'id':'alert-button',
      }).text('OK'),
    header=this.element('div',{
      'class':'alert-header',
      'id':'alert-header',
      'data-text':'Alert',
    }),
    content=this.element('div',{
      'class':'alert-content',
      'id':'alert-content',
    }).text(text),
    footer=this.element('div',{
      'class':'alert-footer',
      'id':'alert-footer',
    },[button]),
    main=this.element('div',{
      'class':'alert',
      'id':'alert',
    },[header,content,footer]),
    bg=this.element('div',{
      'class':'alert-bg',
      'id':'alert-bg',
    },[main]).appendTo(document.body);
  button.bg=bg;
  button.cb=typeof cb==='function'?cb:function(){};
  button.action=function(result){
    document.body.style.removeProperty('overflow');
    this.bg.remove();
    return this.cb(result);
  };
  button.clickOn(function(){
    return this.action(true);
  });
  button.main=main;
  button.header=header;
  button.content=content;
  button.footer=footer;
  document.body.style.overflow='hidden';
  return button;
};
/* get file content, @return: string text */
this.__proto__.get=async function(file){
  return await fetch(this.host+file)
    .then(r=>r.text()).catch(e=>JSON.stringify(e));
};
/* xhr method, for upload progress */
this.__proto__.uploadBase64=async function(file,progress){
  let xhr=new XMLHttpRequest,
  url=this.host,
  data=new FormData,
  content=await this.reader(file);
  data.append('exec','file');
  data.append('key',this.key);
  data.append('user',this.user);
  data.append('uploadBase64',true);
  data.append('filename',file.name);
  data.append('content',content);
  return new Promise(function(success,failure){
    xhr.responseType='blob';
    xhr.onreadystatechange=function(){
      if(xhr.readyState!=4){return;}
      return success(new Response(xhr.response,{ 
        url:xhr.responseURL, 
        status:xhr.status, 
        statusText:xhr.statusText
      }));
    };
    xhr.addEventListener('error',function(){
      return failure(new TypeError('Failed to upload.'));
    });
    xhr.upload.addEventListener('progress',progress);
    xhr.open('POST',url,true);
    xhr.send(data);
  });
};
/* xhr method, for upload progress */
this.__proto__.upload=function(file,progress){
  let xhr=new XMLHttpRequest,
  url=this.host,
  data=new FormData;
  data.append('exec','file');
  data.append('key',this.key);
  data.append('user',this.user);
  data.append('upload',true);
  data.append('file',file);
  return new Promise(function(success,failure){
    xhr.responseType='blob';
    xhr.onreadystatechange=function(){
      if(xhr.readyState!=4){return;}
      return success(new Response(xhr.response,{ 
        url:xhr.responseURL, 
        status:xhr.status, 
        statusText:xhr.statusText
      }));
    };
    xhr.addEventListener('error',function(){
      return failure(new TypeError('Failed to upload.'));
    });
    xhr.upload.addEventListener('progress',progress);
    xhr.open('POST',url,true);
    xhr.send(data);
  });
};
/* post request, @return: string text */
this.__proto__.post=async function(exec,data={}){
  let body=new FormData;
  for(let k in data){
    body.append(k,data[k]);
  }
  body.append('exec',exec);
  body.append('key',this.key);
  body.append('user',this.user);
  return await fetch(this.host,{
    mode:'cors',
    method:'POST',
    body,
  }).then(r=>r.text());
};
/* login request, @return: string of key */
this.__proto__.login=async function(data={}){
  let body=new FormData;
  for(let k in data){
    body.append(k,data[k]);
  }
  body.append('exec','login');
  body.append('key','9r3i\\mia');
  return await fetch(this.host,{
    mode:'cors',
    method:'POST',
    body,
  }).then(r=>r.text());
};
/* serialize a form by elements name -- @require: query */
this.__proto__.formSerialize=function(idata=false){
  let data={},
  res={},
  form=document.querySelectorAll('[name]');
  for(let i=0;i<form.length;i++){
    if(typeof form[i].value==='undefined'){
      continue;
    }else if(form[i].name.match(/^data/)){
      data[form[i].name]=form[i].value;
    }else if(form[i].type=='radio'){
      if(form[i].checked){
        res[form[i].name]=form[i].value;
      }
    }else{
      res[form[i].name]=form[i].value;
    }
  }
  if(idata){
    let query=[];
    for(let k in data){
      query.push(k+'='+data[k]);
    }
    let ndata=this.query(query.join('&'));
    if(!ndata.hasOwnProperty('data')){
      ndata.data={};
    }
    res.data=JSON.stringify(ndata.data);
  }
  return res;
};
/* file reader -- stand-alone -- with promise */
this.__proto__.reader=function(file){
  return new Promise(resolve=>{
    let reader=new FileReader;
    reader.onload=async ()=>{
      return resolve(reader.result);
    };
    reader.readAsDataURL(file);
  });
};
/* fetch -- stand-alone */
this.__proto__.fetch=async function(url,dl){
  url=typeof url==='string'?url:'';
  dl=typeof dl==='function'?dl:function(){};
  let response=await fetch(url),
  loaded=0,
  type='progress',
  total=parseInt(response.headers.get('content-length'),10),
  res=new Response(new ReadableStream({
    async start(controller){
      let reader=response.body.getReader();
      for(;;){
        let {done,value}=await reader.read();
        if(done){
          dl({loaded:total,total,type});
          break;
        }
        loaded+=value.byteLength;
        dl({loaded,total,type});
        controller.enqueue(value);
      }
      controller.close();
      dl({loaded:total,total,type});
    },
  }));
  return await res.text();
};
/* parse date and time -- stand-alone */
this.__proto__.parseDatetime=function(value,format='en-US'){
  let date=new Date(value),
  options={
    weekday:'long',
    year:'numeric',
    month:'long',
    day:'numeric',
    hour:'numeric',
    minute:'numeric',
  };
  return date.toLocaleDateString(format,options);
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
/* parse json to object -- stand-alone */
this.__proto__.parseJSON=function(data){
  let res=false;
  try{
    res=JSON.parse(data);
  }catch(e){
    res=false;
  }return res;
};
/* sleep ms - promise -- stand-alone */
this.__proto__.sleep=function(ms){
  return new Promise(resolve=>{
    setTimeout(resolve,ms);
  });
};
/* create element -- stand-alone */
this.__proto__.element=function(name='div',attr={},children=[]){
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
/* array of defined headers and footers
 * add using .push()
 * each contains: a function (query,app,page)
 */
this.headers=[];
this.footers=[];
/* array of defined routes
 * add using .push()
 * contain: [path,title,call,env]
 */
this.routes=[];
/* initialize
 * ~ initialize for auto-generate route
 * @paramenters: none
 * @return: mixed of executed given call function
 */
this.__proto__.init=function(){
  /* use event listener */
  window.addEventListener('popstate',e=>{
    return this.page();
  },false);
  return this.page();
};
/* page loader
 * ~ load the page base on the path
 * @paramenters: none
 * @return: mixed of page call function return
 */
this.__proto__.page=function(){
  this.error(false);
  let hash=this.hash(),
  r=this.route(hash.path),
  error='';
  /* check route is exist */
  if(!r){
    error='Not Found';
    this.title('404 '+error);
    return this.error(error,404);
  }
  /* check call function */
  if(!r.call||typeof r.call!=='function'){
    error='Missing Function';
    this.title('514 '+error);
    return this.error(error,400);
  }
  /* print out the title */
  if(typeof r.title==='string'){
    this.title(r.title);
  }
  /* execute headers */
  for(let head of this.headers){
    head.call(head,hash.query,this,r);
  }
  /* execute call function */
  r.call.call(r.call,hash.query,this,r.env);
  /* execute footers */
  for(let foot of this.footers){
    foot.call(foot,hash.query,this,r);
  }
  /* return as true */
  return true;
};
/* hash of path assignment
 * ~ router redirect to path as hash
 * @parameters:
 *   p = string of path as hash
 * @return: object of pop state redirected
 */
this.__proto__.go=function(p){
  p=typeof p==='string'?p:'';
  return window.location.assign('#'+p);
};
/* get route
 * ~ find route using path
 * @parameters: 
 *   p = string of path
 * @return: object of route, contain: path, title and call function
 */
this.__proto__.route=function(p){
  let r=false;
  for(let i in this.routes){
    if(!Array.isArray(this.routes[i])
      ||this.routes[i].length<3){
      continue;
    }
    if(typeof this.routes[i][0]==='string'
      &&typeof this.routes[i][1]==='string'
      &&typeof this.routes[i][2]==='function'
      &&this.routes[i][0]===p){
      r={
        path:this.routes[i][0],
        title:this.routes[i][1],
        call:this.routes[i][2],
        env:typeof this.routes[i][3]==='object'
          &&this.routes[i][3]!==null
          ?this.routes[i][3]:{},
      };break;
    }
  }return r;
};
/* title management
 * @parameters:
 *   s = string of title name
 * @return: always true
 */
this.__proto__.title=function(s){
  s=typeof s==='string'?s:'';
  let t=document.getElementsByTagName('title');
  if(t.length>0){
    for(let i=0;i<t.length;i++){
      t[i].innerText=s;
    }
  }else{
    t=document.createElement('title');
    document.head.appendChild(t);
    t.innerText=s;
  }return true;
};
/* parse hash
 * ~ parse location hash from window.location.hash
 * @parameters: none
 * @return: object of parsed hash
 *   - return object contains:
 *     - path  = string of router path
 *     - query = object of router parsed query
 */
this.__proto__.hash=function(){
  let h=window.location.hash.substr(1),
  d=h.split('?'),
  r={path:d[0],query:{}};
  if(typeof d[1]==='string'){
    r.query=this.query(d[1]);
  }return r;
};
/* error statement
 * ~ print out error from string given
 * @parameters:
 *   s = string of error statement
 *       - set to false to remove printed statement
 *   c = integer of response code
 * @return: print out genetated error statement into document.body
 */
this.__proto__.error=function(s,c){
  let id='router-error-statement',
  n=document.getElementById(id);
  if(n){n.remove();}
  if(s===false){return false;}
  s=typeof s==='string'?s:'Unknown Error';
  c=c%1===0?c:200;
  n=document.createElement('div');
  n.id=id;
  let sp=document.createElement('div'),
  sd=document.createElement('div');
  n.style.margin='0px';
  n.style.padding='30px';
  n.style.textAlign='center';
  n.style.position='fixed';
  n.style.zIndex=99999;
  n.style.top='0px';
  n.style.bottom='0px';
  n.style.left='0px';
  n.style.right='0px';
  n.style.backgroundColor='#eed';
  n.style.cursor='default';
  sp.style.textAlign='center';
  sp.style.color='#555';
  sp.style.fontSize='32px';
  sp.style.fontFamily='consolas,monospace';
  sp.innerText='Error: '+c.toString()+' '+s;
  sd.style.marginTop='30px';
  sd.style.textAlign='center';
  sd.style.color='#999';
  sd.style.fontSize='11px';
  sd.style.fontFamily='consolas,monospace';
  sd.innerText='9r3i\\mia\\app';
  n.appendChild(sp);
  n.appendChild(sd);
  document.body.appendChild(n);
  return true;
};
/* parse query
 * ~ parse url query into readable object
 * @parameters:
 *   t = string of url query
 * @return: object of parsed query
 */
this.__proto__.query=function(t){
  if(typeof t!=='string'){return false;}
  let s=t.split('&'),r={},c={};
  for(let i=0;i<s.length;i++){
    if(!s[i]||s[i]==''){continue;}
    let p=s[i].split('='),
    k=decodeURIComponent(p[0]);
    if(k.match(/\[(.*)?\]$/g)){
      let l=k.replace(/\[(.*)?\]$/g,'');
      let w=k.replace(/^.*\[(.*)?\]$/g,"$1");
      c[l]=c[l]?c[l]:0;
      if(w==''){w=c[l];c[l]+=1;}
      if(!r[l]){r[l]={};}
      r[l][w]=decodeURIComponent(p[1]);
      continue;
    }r[k]=p[1]?decodeURIComponent(p[1]):'';
  }return r;
};
/* temporary statement
 * @return: always false
 */
this.__proto__.temp=function(){
  return false;
};
};


