if(typeof window==='undefined'){
  window=globalThis;
}
/* error message -- for development only */
window.addEventListener('error',function(e){
  let errorText=[
    e.message,
    'URL: ' + e.filename,
    'Line: ' + e.lineno + ', Column: ' + e.colno,
    'Stack: ' + (e.error && e.error.stack || '(no stack trace)')
  ].join('\n');
  alert(errorText);
  console.error(errorText);
});//*/
/* GLOBALS VARIABLES */
/* upper-case GLOBALS for global variables */
const GLOBALS={
  host:'http://127.0.0.1:9301/', // host of mia server (mia host)
  // host:'https://9r3i.github.io/mia/public/', // --> 1
  // host:'https://raw.githubusercontent.com/9r3i/mia/master/public/',
  // host:'https://rawfo.vercel.app/9r3i/mia/master/public/',
  welcome:3, // post id for welcome page
  fakeloader:false, // using fake loader in every start
  haltstart:false, // do halt at start
  /* blog elements */
  main:null,
  title:null,
  path:null,
  nav:null,
  content:null,
  footer:null,
  apps:[
    'start',
    'hblog',
    'rblog',
    'fblog',
    'mblog',
    'chat',
    'quiz',
    'monitoring',
    'gaino',
    'force',
    'tree',
    'silsilah',
  ],
};
/* anonymous async function */
(async function(){
  metaContent();
  /* get hostname setup hosts */
  let ptrn=/^localhost|127\.0\.0\.1$/,
  isLocal=location.hostname.match(ptrn)?true:false,
  theHost=[location.hostname,location.port].join(':'),
  hosts=[
    'http://'+theHost+'/', // --> 0
    'https://9r3i.github.io/mia/public/', // --> 1
    'https://raw.githubusercontent.com/9r3i/mia/master/public/', // --> 2
    'https://rawfo.vercel.app/9r3i/mia/master/public/', // --> 3
  ],
  host=hosts[isLocal?0:1],
  fhost=host+'files/';
  /* setup GLOBALS host as well */
  GLOBALS.host=hosts[isLocal?0:1];
  /* execute the boot script */
  let bname='boot.js',
  bhost=fhost+'js/boot.js',
  btag=document.createElement('script'),
  bscript=await fetch(bhost).then(r=>r.text());
  if(!bscript||!bscript.match(/function\sboot/)){
    alert('Error: Failed to load boot.js');
    return;
  }
  btag.id=bname;
  btag.textContent=bscript;
  document.head.append(btag);
  /* setup app name */
  let search=location.search.substr(1).split('&'),
  match=search[0].match(/^app=([a-z0-9]+)$/),
  appname=match?match[1]:'start',
  itag=document.getElementById('index.js');
  if(itag&&itag.dataset.app){
    appname=itag.dataset.app;
  }
  /* initialize boot and files */
  let app=new boot(fhost),
  {files,starter,icon}=fileContent(appname),
  logo=fhost+icon;
  let {progress,span}=splashContent(logo);
  /* load files */
  let loaded=await app.bulk(files,e=>{
    if(!progress||!span){return;}
    if(e.total&&e.total>0){
      progress.setAttribute('max',e.total);
      progress.setAttribute('value',e.loaded);
      span.innerText=Math.floor(e.loaded/e.total*100)
        +'% Loading...';
    }else{
      span.innerText=Math.floor(e.loaded/1024)+'KB - Loading...';
    }
  }),
  success=0;
  window.loaded={};
  for(let path in loaded){
    window.loaded[path]=loaded[path]!==false;
    if(loaded[path]!==false){
      success++;
    }
  }
  span.innerText='Completed ('+success+'/'
    +Object.keys(loaded).length+') --> Processing...';
  /* starter */
  if(starter){
    if(starter.type=='class'){
      let obj=new window[starter.name](starter.param);
      if(starter.init){
        return obj[starter.init]();
      }
      return obj;
    }
    if(starter.type=='function'){
      return window[starter.name](starter.param);
    }
    if(starter.type=='eval'){
      return eval(starter.param);
    }
  }
  /* ... */
})();
/* file content, logo and starter */
function fileContent(appname='start'){
  let libs={
    start:[
      'css/consola.css',
      'css/segoeuil.css',
      'css/firasans.css',
      'css/mia.css',
      'css/start.css',
      'js/start.module.js',
      'js/mia.js',
      'js/binar.js',
      'js/start.js',
    ],
    chat:[
      'css/consola.css',
      'css/segoeuil.css',
      'css/mia.css',
      'css/chat.css',
      'js/binar.js',
      'js/mia.js',
      'js/chat.module.js',
    ],
    rblog:[
      'css/rblog.css',
      'js/rblog.js',
    ],
    mblog:[
      'css/consola.css',
      'css/segoeuil.css',
      'css/mia.css',
      'css/mblog.css',
      'css/atom-one-light.css',
      'js/mia.js',
      'js/parser.js',
      'js/boot.js',
      'js/idb.js',
      'js/highlight.min.js',
      'js/mblog.js',
    ],
    quiz:[
      'css/consola.css',
      'css/segoeuil.css',
      'css/mia.css',
      'css/quiz.css',
      'js/mia.js',
      'js/idb.js',
      'js/quiz.js',
    ],
    hblog:[
      'js/hblog.js',
    ],
    monitoring:[
      'css/monitoring.css',
      'js/monitoring.js',
    ],
    fblog:[
      'css/consola.css',
      'css/segoeuil.css',
      'css/firasans.css',
      'css/mia.css',
      'css/fblog.css',
      'css/tiny.slider.min.css',
      'js/mia.js',
      'js/tiny.slider.min.js',
      'js/fblog.module.js',
      'js/fblog.js',
    ],
    tree:[
      'css/fonts.tree.css',
      'css/tree.css',
      'js/tree.js',
    ],
    silsilah:[
      'css/consola.css',
      'css/segoeuil.css',
      'css/firasans.css',
      'css/mia.css',
      'css/start.css',
      'css/fonts.tree.css',
      'css/tree.css',
      'css/silsilah.css',
      'js/silsilah.module.js',
      'js/mia.js',
      'js/tree.js',
      'js/silsilah.js',
    ],
  },
  starts={
    mblog:{
      type:'class',
      name:'mblog',
      param:null,
      init:null,
    },
    quiz:{
      type:'class',
      name:'quiz',
      param:null,
      init:null,
    },
    monitoring:{
      type:'function',
      name:'init',
      param:null,
    },
    gaino:{
      type:'function',
      name:'replaceURL',
      param:GLOBALS.host+'blog/gaino/',
    },
    force:{
      type:'function',
      name:'replaceURL',
      param:GLOBALS.host+'blog/force/',
    },
    tree:{
      type:'class',
      name:'tree',
      param:null,
      init:'test',
    }
  },
  logos={
    fblog:'image/cleanjelly.png',
    silsilah:'image/silsilah.png',
  },
  icon=logos.hasOwnProperty(appname)
    ?logos[appname]:'image/blackapple.png',
  starter=starts.hasOwnProperty(appname)?starts[appname]:null,
  files=libs.hasOwnProperty(appname)?libs[appname]:[];
  return {files,appname,icon,starter};
}
/* replace url */
function replaceURL(url){
  window.location.replace(url);
}
/* assign url */
function assignURL(url){
  window.location.assign(url);
}
/* meta content */
function metaContent(){
  /* meta viewport */
  let meta=document.createElement('meta');
  meta.name='viewport';
  meta.content='width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no';
  document.head.append(meta);
  /* meta content type */
  let meta2=document.createElement('meta');
  meta2.setAttribute('http-equiv','content-type');
  meta2.content='text/html;charset=utf-8';
  document.head.append(meta2);
  /* meta user agent compatiblity */
  let meta3=document.createElement('meta');
  meta3.setAttribute('http-equiv','X-UA-Compatible');
  meta3.content='IE=edge,chrome=1';
  document.head.append(meta3);
  /* set title */
  let title=document.createElement('title');
  title.innerText='9r3i\\mia@firebase\\app';
  document.head.append(title);
  /* 9r3i\mia@firebase\app */
}
/* splash content */
function splashContent(logo){
  /* splash */
  let css=splashContentCSS(),
  splash=document.createElement('div'),
  progressBar=document.createElement('div'),
  progress=document.createElement('div'),
  span=document.createElement('span'),
  style=document.createElement('style'),
  img=new Image;
  document.body.innerHTML='';
  document.body.append(style);
  document.body.append(splash);
  splash.append(span);
  splash.append(progressBar);
  progressBar.append(progress);
  style.textContent=css;
  splash.classList.add('splash');
  progress.classList.add('progress');
  progressBar.classList.add('progress-bar');
  /* get logo */
  img.src=logo;
  img.onload=function(){
    if(splash&&span){
      splash.insertBefore(this,span);
    }
  };
  return {splash,progress,span,img};
}
/* splash content css */
function splashContentCSS(){
  return `
body{margin:0rem;}
/* splash */
.splash{
  display:flex;
  align-items:center;
  justify-content:center;
  height:100vh;
  width:100vw;
  margin:0rem;
  padding:0rem;
  font-family:system-ui;
  background-color:#fff;
  background:linear-gradient(#fff 0%,#fb7 100%);
  transition:all 0.3s ease 0s;
}
.splash img{
  width:5rem;
  height:5rem;
  position:absolute;
  margin-top:-8rem;
  filter:drop-shadow(0.2rem 0.1rem 0.1rem #333);
}
.splash span{
  position:absolute;
  margin:-2rem 0rem 0rem;
  font-size:0.75rem;
  color:#333 !important;
  animation:fade 2.3s infinite 0s;
  transition:all 0.3s ease 0s;
}
@keyframes fade{
  0%{opacity:1;padding-left:0rem;font-size:0.7rem;color:#333;}
  50%{opacity:0.3;padding-left:0.2rem;font-size:0.75rem;color:#b73;}
  100%{opacity:1;padding-left:0rem;font-size:0.7rem;color:#333;}
}
/* progress */
.progress-bar{
  --color:#333; /* the progress color */
  --background: lightgrey; /* the background color */
  -webkit-appearance:none;
  -moz-appearance:none;
  appearance:none;
  border:none;
  width:12.5rem;
  height:0.5rem;
  margin:0rem 0.625rem;
  border-radius:10em;
  background:var(--background);
  overflow:hidden;
}
.progress-bar .progress{
  border-radius:10em;
  background:var(--color);
  width:0%;
  height:0.5rem;
}
.progress-bar .progress:not([value]){
  width:12%;
  animation:listening 1.7s infinite 0s;
}
.progress-bar .progress[value]{
  width:calc(attr(value number,0) / attr(max number,100) * 12.5rem);
}
@keyframes listening{
  0%{margin-left:-10%;}
  50%{margin-left:98%;}
  100%{margin-left:-10%;}
}
  `;
}

`
<!DOCTYPE html><html lang="en-US" dir="ltr"><head>
  <meta http-equiv="content-type" content="text/html;charset=utf-8" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1" />
  <meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no" />
  <script src="index.js" id="index.js" data-app="start"></script>
</head><body>
</body></html>
`;


