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
  value:190,
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
this.aliases={};
/* =================[ alias ]================= */
this.__proto__._______ALIAS_______=function(){};
/* alias register bulk -- @require: this.aliases */
this.__proto__.aliasRegBulk=function(data){
  data=typeof data==='object'&&data!==null?data:{};
  for(let key in data){
    let value=data[key];
    this.aliasReg(key,value);
  }
  return this.aliases;
};
/* alias register -- @require: this.aliases */
this.__proto__.aliasReg=function(key,value){
  this.aliases=typeof this.aliases==='object'&&this.aliases!==null?this.aliases:{};
  this.aliases[key]=value;
  return this.aliases;
};
/* alias -- @require: this.aliases */
this.__proto__.alias=function(text=''){
  let aliases=typeof this.aliases==='object'&&this.aliases!==null?this.aliases:{};
  return aliases.hasOwnProperty(text)?aliases[text]:text;
};
/* =================[ form ]================= */
this.__proto__._______FORM_______=function(){};
/* search form -- @require: element */
this.__proto__.searchForm=function(key='text'){
  let search=this.element('input',{
    name:'search',
    placeholder:'Search...',
    maxlength:100,
    value:'',
  });
  search.onkeyup=function(){
    let rg=new RegExp(this.value,'i'),
    nm=document.querySelectorAll('[data-'+key+']');
    for(let i=0;i<nm.length;i++){
      if(nm[i].dataset[key].match(rg)){
        nm[i].style.removeProperty('display');
      }else{
        nm[i].style.display='none';
      }
    }
  };
  return search;
};
/* select */
this.__proto__.select=function(data,selected,name=''){
  data=typeof data==='object'&&data!==null?data:{};
  let sel=this.element('select',{'name':name});
  for(let key in data){
    let opt=this.element('option')
      .content(data[key])
      .appendTo(sel);
    opt.value=key;
    if(selected&&key==selected){
      opt.selected='selected';
    }
  }
  return sel;
};
/* =================[ loader -- css ]================= */
this.__proto__._______LOADER_______=function(){};
/* content loader -- @require: css */
this.__proto__.contentLoader=function(cname='content'){
  let el=document.querySelector('.content-loader'),
  content=document.querySelector('.'+cname);
  if(el){el.remove();}
  el=document.createElement('div');
  el.classList.add('content-loader');
  if(content){
    content.append(el);
  }else{
    document.body.append(el);
  }
  let lds=document.createElement('div');
  lds.classList.add('lds-ellipsis');
  for(let i of [1,2,3,4]){
    ld=document.createElement('div');
    lds.append(ld);
  }
  el.append(lds);
  return el;
};
/* loader -- @require: css */
this.__proto__.loader=function(load=true){
  let el=document.getElementById('loader');
  if(el){el.remove();}
  if(load===false){return;}
  el=document.createElement('div');
  el.classList.add('loader');
  el.id='loader';
  document.body.append(el);
  let lds=document.createElement('div');
  lds.classList.add('lds-ellipsis');
  for(let i of [1,2,3,4]){
    ld=document.createElement('div');
    lds.append(ld);
  }
  el.append(lds);
  return el;
};
/* table */
this.__proto__.table=function(tname){
  tname=typeof tname==='string'?tname:'table';
  let tbody=this.element('tbody'),
  thead=this.element('thead'),
  table=this.element('table',{'class':tname},[thead,tbody]);
  table.tbody=tbody;
  table.thead=thead;
  table.row=function(){
    let tr=this.mia.element('tr');
    for(let arg of arguments){
      let td=this.mia.element('td');
      td.append(arg);
      tr.append(td);
    }
    this.tbody.append(tr);
    return tr;
  };
  table.rowHead=function(){
    let tr=this.mia.element('tr');
    for(let arg of arguments){
      let td=this.mia.element('th');
      td.append(arg);
      tr.append(td);
    }
    this.thead.append(tr);
    return tr;
  };
  table.header=function(val,col){
    let th=this.mia.element('th',{'colspan':col}),
    tr=this.mia.element('tr',{},[th]);
    th.append(val);
    this.thead.append(tr);
    return tr;
  };
  return table;
};
/* =================[ basic ]================= */
this.__proto__._______BASIC_______=function(){};
/* paste from clipboard */
this.__proto__.paste=async function(text){
  try{
    await navigator.clipboard.readText();
    return true;
  }catch(e){
    return false;
  }
};
/* copy to clipboard */
this.__proto__.copy=async function(text){
  try{
    await navigator.clipboard.writeText(text);
    return true;
  }catch(e){
    return false;
  }
};
/* pre dump -- @require: likeJSON */
this.__proto__.pre=function(){
  let res=[];
  for(let s of arguments){
    res.push(typeof s==='string'?s:this.likeJSON(s,3));
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
  el.style.fontSize='12px';
  el.style.backgroundColor='rgba(255,255,240,0.7)';
  el.style.borderLeft='11px solid #fd5';
  el.style.fontFamily='monospace';
  return el;
};
/* serialize a form by elements name -- @require: parseQuery */
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
    let ndata=this.parseQuery(query.join('&'));
    if(!ndata.hasOwnProperty('data')){
      ndata.data={};
    }
    res.data=JSON.stringify(ndata.data);
  }
  return res;
};
/* =================[ fake-loader ]================= */
this.__proto__._______FAKE_LOADER_______=function(){};
/* fake loader -- promise */
this.__proto__.fakeLoader=function(dl,s=10){
  return new Promise(resolve=>{
    this.fakeLoaderCB(resolve,dl,s);
  });
};
/* fake loader callback -- no-ui */
this.__proto__.fakeLoaderCB=function(cb,dl,s=10,i=0){
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
/* =================[ alert -- css ]================= */
this.__proto__._______ALERT_______=function(){};
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
this.__proto__.alert=function(text,max=1){
  return new Promise(resolve=>{
    this.alertCB(text,resolve,max);
  });
};
/* alert callback --> @return: button object */
this.__proto__.alertCB=function(text,cb,max=1){
  let old=document.getElementById('alert-bg');
  if(old){old.remove();}
  text=typeof text==='string'?text:this.likeJSON(text,max);
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
/* =================[ client ]================= */
this.__proto__._______CLIENT_______=function(){};
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
/* register request, @return: string of key */
this.__proto__.register=async function(data={}){
  let body=new FormData;
  for(let k in data){
    body.append(k,data[k]);
  }
  body.append('exec','register');
  body.append('key','9r3i\\mia');
  return await fetch(this.host,{
    mode:'cors',
    method:'POST',
    body,
  }).then(r=>r.text());
};
/* =================[ standalone ]================= */
this.__proto__._______STANDALONE_______=function(){};
/* geo location - promise -- standalone */
this.__proto__.userLocation=function(){
  return new Promise(resolve=>{
    navigator.geolocation.getCurrentPosition(r=>{
      return resolve(r);
    });
  });
};
/* page url -- @return: object {url:<url>,revoke()} -- standalone */
this.__proto__.pageURL=function(data,type='text/html'){
  data=typeof data!=='string'?JSON.stringify(data):data;
  let blob=new Blob([data],{type}),
  url=URL.createObjectURL(blob);
  return {
    url,
    revoke:function(){
      URL.revokeObjectURL(this.url);
    }
  };
};
/* ini object (class) -- standalone */
this.__proto__.ini=function(){
  return {
    value:function(str){
      if(str===null){
        return 'null';
      }else if(str===false){
        return 'false';
      }else if(str===true){
        return 'true';
      }
      str=str.toString();
      if(!str.match(/"|\n/g)){
        return str;
      }
      return '"'+str
        .replace(/\n/g,'\\n')
        .replace(/"/g,'\\"')
        +'"';
    },
    /* build an ini string */
    build:function(data,nested=false){
      if(typeof data!=='object'||data===null
        ||Array.isArray(data)){
        return;
      }
      let res=[];
      for(let k in data){
        let v=data[k],
        col=k+'='+this.value(v);
        if(nested){
          col='['+k+']\n';
          for(let i in v){
            col+=i+'='+this.value(v[i]);
          }
        }res.push(col);
      }return res.join('\n');
    },
    /* parse without section */
    parseNoSection:function(data){
      if(typeof data!=="string"){return {};}
      let ln=data.split(/\r\n|\r|\n/g),
      res={};
      for(let p of ln){
        let m=p.match(/^\s*([^=]+?)\s*=\s*(.*?)\s*$/);
        if(!m){continue;}
        res[m[1]]=m[2].match(/^"/)&&m[2].match(/"$/)
          ?m[2].substr(1,m[2].length-2)
            .replace(/\\"/g,'"')
            .replace(/\\n/g,'\n')
          :m[2];
      }return res;
    },
    /** 
     * ini.js
     * ~ parse ini from string (nested only)
     * ~ this could be parse multiline ini values
     * @parameters:
      *   data = string of ini data string
        ** actually this is my old code, wrote 5 years ago
        ** started at november 18th 2017
        ** update at september 7th 2018
     */
    parse:function(data){
      if(typeof data!=="string"){return;}
      let ex=data.split(/\r\n|\r|\n/g);
      let res={},store='',index='',pin='';
      for(let i in ex){
        if(ex[i]==''&&index==''){continue;}
        else if(ex[i].match(/^;/g)){continue;}
        else if(ex[i].match(/^\[(.*)\]/ig)){
          pin=ex[i].replace(/^\[/ig,'').replace(/\]\s*$/ig,'');
          res[pin]={};
        }else if(ex[i].match(/^.+=\s*/ig)&&index==''){
          let mt=ex[i].match(/^(.+)=\s*"(.*)"\s*$/ig);
          let mi=ex[i].match(/^[^=]+/ig);
          if(mt&&mi){
            index=mi[0].replace(/^\s+|\s+$/ig,'');
            res[pin][index]=mt[0].substr(mi[0].length).replace(/^\s*=\s*"|\s*"\s*$/ig,'');
            index='';
            continue;
          }
          let exi=ex[i].match(/^.+=\s*/ig);
          if(mi){
            index=mi[0].replace(/^\s+|\s+$/ig,'');
          }else{
            index=exi[0].replace(/=\s*$/ig,'').replace(/^\s+|\s+$/ig,'');
          }
          exi=ex[i].replace(/^.+=\s*/ig,'');
          if(exi.match(/^".*"\s*$/ig)){
            res[pin][index]=exi.substr(1).replace(/"\s*$/ig,'');
            index='';
          }else if(exi.match(/^"/ig)){
            store=exi.substr(1)+'\r\n';
          }else{
            if(typeof res[pin]==='undefined'){continue;}
            res[pin][index]=exi.replace(/^\s+|\s+$/ig,'');
            index='';
          }exi=null;
        }else if(ex[i].match(/"\s*$/ig)&&index!==''){
          if(typeof res[pin]==='undefined'){continue;}
          store+=ex[i].replace(/"\s*$/ig,'')+'\r\n';
          res[pin][index]=store;
          store='',index='';
        }else if(index!==''){
          store+=ex[i]+'\r\n';
        }
      }return res;
    },
  };
};
/* local storage (class) -- standalone */
this.__proto__.storage=function(prefix='local'){
  return {
    __prefix:prefix+'/',
    size:function(){
      let res=0,
      length=this.__prefix.length;
      for(let i=0;i<localStorage.length;i++){
        let key=localStorage.key(i);
        if(key.substring(0,length)==this.__prefix){
          let value=localStorage.getItem(key);
          res+=key.length+value.length+1;
        }
      }return res;
    },
    get:function(key=''){
      key=typeof key!=='string'?JSON.stringify(key):key;
      let res=false,
      raw=localStorage.getItem(this.__prefix+key);
      try{res=JSON.parse(raw);}catch(e){}
      return res;
    },
    set:function(key='',value=''){
      key=typeof key!=='string'?JSON.stringify(key):key;
      value=typeof value!=='string'?JSON.stringify(value):value;
      localStorage.setItem(this.__prefix+key,value);
      return this.keys().indexOf(this.__prefix+key)>=0?true:false;
    },
    delete:function(key=''){
      key=typeof key!=='string'?JSON.stringify(key):key;
      localStorage.removeItem(this.__prefix+key);
      return this.keys().indexOf(this.__prefix+key)<0?true:false;
    },
    keys:function(){
      let res=[],
      length=this.__prefix.length;
      for(let i=0;i<localStorage.length;i++){
        let key=localStorage.key(i);
        if(key.substring(0,length)==this.__prefix){
          res.push(key.substring(length));
        }
      }return res;
    },
    clear:function(){
      let res=0,
      length=this.__prefix.length;
      for(let i=0;i<localStorage.length;i++){
        let key=localStorage.key(i);
        if(key.substring(0,length)==this.__prefix){
          localStorage.removeItem(key);
          res++;
        }
      }return res;
    },
  };
};
/* get data by key from dataArray -- @result: array (nobreak) or object or null -- standalone */
this.__proto__.getDataByKey=function(key,value='',data=[],nobreak=false){
  data=Array.isArray(data)?data:[];
  let res=nobreak?[]:null;
  for(let i of data){
    if(i[key]==value){
      if(nobreak){
        res.push(i);
      }else{
        res=i;
        break;
      }
    }
  }return res;
};
/* speak -- standalone */
this.__proto__.speak=function(s,l='en-US'){
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
/* JSON download -- standalone */
this.__proto__.downloadJSON=function(data,out='data'){
  data=JSON.stringify(data);
  let blob=new Blob([data],{type:'application/json'}),
  url=URL.createObjectURL(blob),
  a=document.createElement('a');
  a.href=url;
  a.download=out+'.json';
  a.click();
  URL.revokeObjectURL(url);
  return url;
};
/* audio play -- standalone */
this.__proto__.audioPlay=function(url){
  return new Promise(function(resolve,reject){
    let audio=new Audio();
    audio.preload="auto";
    audio.autoplay=true;
    audio.onerror=reject;
    audio.onplay=resolve;
    audio.src=url;
  });
};
/* checksum, @default: sha-256 -- standalone */
this.__proto__.checksum=async function(text,algo='sha-256'){
  let encoder=new TextEncoder(),
  data=encoder.encode(text),
  hashBuffer=await crypto.subtle.digest(algo,data),
  hashArray=Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b=>b.toString(16).padStart(2,'0')).join('');
};
/* encode utf-8 string to base64 -- standalone */
this.__proto__.encodeBase64=function(str){
  const bytes=new TextEncoder().encode(str);
  const binString=Array.from(bytes,(b)=>String.fromCodePoint(b)).join('');
  return btoa(binString);
};
/* decode base64 to utf-8 string -- standalone */
this.__proto__.decodeBase64=function(base64){
  const binString=atob(base64);
  const bytes=Uint8Array.from(binString,(m)=>m.codePointAt(0));
  return new TextDecoder().decode(bytes);
};
/* time ago [en-US] -- standalone */
this.__proto__.timeago=function(time){
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
};
/* file reader -- standalone -- with promise */
this.__proto__.reader=function(file){
  return new Promise(resolve=>{
    let reader=new FileReader;
    reader.onload=async ()=>{
      return resolve(reader.result);
    };
    reader.readAsDataURL(file);
  });
};
/* fetch -- with download progress -- standalone */
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
/* parse date and time -- @default:en-US -- standalone */
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
/* parse date -- @default: en-US -- standalone */
this.__proto__.parseDate=function(value,format='en-US'){
  value=value?value:(new Date).getTime();
  let date=new Date(value),
  options={
    weekday:'long',
    year:'numeric',
    month:'long',
    day:'numeric',
  };
  return date.toLocaleDateString(format,options);
};
/* parse nominal -- @default: USD -- standalone */
this.__proto__.parseNominal=function(nominal=0,format='en-US',currency='USD',decimal=0){
  let money=new Intl.NumberFormat(format,{
    style:'currency',
    currency:currency,
    maximumFractionDigits:decimal,
  });
  return money.format(nominal);
};
/* parse object to json string -- standalone */
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
/* parse json to object -- standalone */
this.__proto__.parseJSON=function(data){
  let res=null;
  try{
    res=JSON.parse(data);
  }catch(e){
    res=null;
  }return res;
};
/* sleep ms - promise -- standalone */
this.__proto__.sleep=function(ms){
  return new Promise(resolve=>{
    setTimeout(resolve,ms);
  });
};
/* array range -- standalone */
this.__proto__.range=function(s,t){
  s=s?s:0;
  t=t?Math.max(s,t):0;
  let r=[];
  for(let i=s;i<=t;i++){
    r.push(i);
  }return r;
};
/* create element -- standalone */
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
      this.addEventListener('click',cb,false);
    }return this;
  };
  main.on=function(ev,cb){
    cb=typeof cb==='function'?cb:function(){};
    this.addEventListener(ev,cb,false);
    return this;
  };
  main.mia=this;
  /* return the element object */
  return main;
};
/* =================[ router ]================= */
this.__proto__._______ROUTER_______=function(){};
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
  let l=window.location.hash.substr(1),
  h=this.parseURL(l),
  r=this.route(h.path),
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
    head.call(head,h.query,this,r);
  }
  /* execute call function */
  r.call.call(r.call,h.query,this,r.env);
  /* execute footers */
  for(let foot of this.footers){
    foot.call(foot,h.query,this,r);
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
/* title management -- @return: always true */
this.__proto__.title=function(s=''){
  s=typeof s==='string'?s:'';
  let t=document.getElementsByTagName('title');
  if(t.length>0){
    for(let i=0;i<t.length;i++){
      t[i].innerText=s;
    }
  }else{
    t=document.createElement('title');
    document.head.append(t);
    t.innerText=s;
  }return true;
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
  n.append(sp);
  n.append(sd);
  document.body.append(n);
  return true;
};
/* parse url path -- protocol and hostname are not included */
this.__proto__.parseURL=function(str){
  if(typeof str!=='string'){return false;}
  let obj=str.split('?'),
  path=obj[0],
  query=obj.length>1
    ?this.parseQuery(obj[1]):{};
  return {path,query};
};
/* parse url query -- @return: object */
this.__proto__.parseQuery=function(t){
  if(typeof t!=='string'){return false;}
  let s=t.split('&'),r={},c={};
  for(let i=0;i<s.length;i++){
    if(!s[i]||s[i]==''){continue;}
    let p=s[i].split('='),
    k=decodeURIComponent(p[0]),
    m=k.match(/(\[[^\]]*\])/g),
    v=p[1]?decodeURIComponent(p[1]):'';
    if(!m){
      r[k]=v;
      continue;
    }
    let l=k.replace(/\[(.*)?\]$/g,'');
    c[l]=c[l]?c[l]:0;
    if(!r[l]){r[l]={};}
    r[l]=this.parseQueryKey(r[l],m,v);
  }return r;
};
/* parse query key as object keys -- @return: object */
this.__proto__.parseQueryKey=function(obj,m,v,i){
  obj=typeof obj==='object'&&obj!==null?obj:{};
  i=i?parseInt(i,10):0;
  if(!Array.isArray(m)||!m[i]){
    return v;
  }
  let ml=m.length,
  mi=m[i].replace(/^\[(.*)\]$/,'$1');
  if(!obj[mi]){
    obj[mi]={};
  }
  obj[mi]=this.parseQueryKey(obj[mi],m,v,i+1);
  return obj;
};
/* buildQuery v2, build http query recusively */
this.__proto__.buildQuery=function(data,key){
  let ret=[],dkey=null;
    for(let d in data){
      dkey=key?key+'['
            +encodeURIComponent(d)
              .replace(/\(/g,'%28')
              .replace(/\)/g,'%29')
            +']'
          :encodeURIComponent(d)
            .replace(/\(/g,'%28')
            .replace(/\)/g,'%29');
      if(typeof data[d]=='object'&&data[d]!==null){
        ret.push(this.buildQuery(data[d],dkey));
      }else{
        ret.push(
          dkey+"="
            +encodeURIComponent(data[d])
            .replace(/\(/g,'%28')
            .replace(/\)/g,'%29')
        );
      }
  }return ret.join("&");
};
/* =================[ nothing ]================= */
this.__proto__._______NOTHING_______=function(){};
/* nothing statement */
this.__proto__.nothing=function(){
  return arguments;
};
/* temporary statement -- @return: always false */
this.__proto__.temp=function(){
  return false;
};
};


