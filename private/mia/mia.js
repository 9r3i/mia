/* mia.js -- server requirement */
const HTTP = require("http");
const FS   = require("fs");

/* mia exec requirement files */
const MIAX={
  execFiles:['file','post','test','quiz'],
  execDir:__dirname.replace(/\/[^\/]+$/,'')+'/exec/',
  exec:{},
  libFiles:[],
  libDir:__dirname.replace(/\/[^\/]+$/,'')+'/lib/',
  lib:{},
};
for(let file of MIAX.execFiles){
  let exec=require(MIAX.execDir+file);
  MIAX.exec[file]=exec[file];
}
for(let file of MIAX.libFiles){
  let lib=require(MIAX.libDir+file);
  MIAX.lib[file]=lib[file];
}

/**
 * mia
 * ~ m... i... a...
 * ~ mia.js -- server
 * authored by 9r3i
 * https://github.com/9r3i/mia
 * first idea at october 2015
 * continued at october 7th 2026
 * @usage: new mia;
 **/
exports.mia=function(port=9301,host='127.0.0.1',root){
/* set to true before compile to appbase */
this.production=false;
/* the version code */
Object.defineProperty(this,'versionCode',{
  value:115,
  writable:false,
});
/* the version */
Object.defineProperty(this,'version',{
  value:this.versionCode.toString().split('').join('.'),
  writable:false,
});
this.port=port;
this.host=host;
this.root=typeof root==='string'?root
  :[__dirname.replace(/(\/[^\/]+){2}$/,''),'public'].join('/');
this.private=[
  __dirname.replace(/(\/[^\/]+){2}$/,''),
  'private'
].join('/');
this.fs=FS.promises;
this.fso=FS;
this.http=HTTP;
this.exec=MIAX.exec;
this.lib=MIAX.lib;
/* start server */
this.start=function(){
  let server=this.http.createServer((req,res)=>{
    this.requestListener(req,res);
  });
  server.listen(this.port,this.host,()=>{
    console.log(`Server is running on http://${this.host}:${this.port}`);
  });
};
/* request listener */
this.requestListener=async function(req,res){
  let parsed=this.parseURL(req.url),
  file=parsed.file.match(/\/$/)
    ?parsed.file+'/index.html':parsed.file,
  accessed=await this.fs
    .access(this.root+file,this.fso.constants.F_OK)
    .then(e=>e?false:true)
    .catch(e=>false);

  /* default headers */
  this.headers(res);
  /* options request */
  if(req.method==='OPTIONS'){return;}

  /* console report */
  console.log(
    accessed?200:404,
    req.method,
    [
      (new Date).getHours().toString().padStart(2,'0'),
      (new Date).getMinutes().toString().padStart(2,'0'),
      (new Date).getSeconds().toString().padStart(2,'0'),
      ((new Date).getTime()/1000).toFixed(3)
      .toString().split('.')[1].padStart(3,'0'),
    ].join(':'),
    req.url,
  );

  /* method post only */
  if(req.method==='POST'){
    let {post,files}=await this.parseFormData(req),
    exec=post.hasOwnProperty('exec')?post.exec.toString():'',
    key=post.hasOwnProperty('key')?post.key.toString():'',
    result=null;
    /* delete credentials */
    delete post.key;
    delete post.user;
    delete post.exec;
    console.log('   ','POST',post);

    /* login */
    if(exec=='login'&&key=='9r3i\\mia'
      &&post.hasOwnProperty('username')
      &&post.hasOwnProperty('password')){
      if(await this.verify(post.username,post.password)){
        result=this.ukey(post.username);
      }
    }
    /* verify key and check exec */
    if(this.vkey(key)&&this.exec.hasOwnProperty(exec)){
      let obj=new this.exec[exec];
      if(typeof obj.init==='function'){
        result=await obj.init(post);
      }
    }
    /* result statement */
    if(result){
      return this.result(res,JSON.stringify(result),200);
    }
    /* last statement */
    return this.result(res,'Invalid request.',401);
  }

  /* check the access file */
  if(!accessed){
    let err='Error: 404 - Not Found -- '+req.url;
    return this.result(res,err,404);
  }

  /* read the file contents */
  let content=await this.fs.readFile(
    this.root+file,
  ).then(r=>r).catch(e=>'~'),
  mime=this.mime(file);

  /* send the response */
  if(parsed.query.hasOwnProperty('download')){
    /* default: inline or attachment */
    let dispo='attachment; filename='
      +file.split('/').reverse()[0];
    res.setHeader('Content-Description','File Transfer');
    res.setHeader('Content-Disposition',dispo);
  }

  /* send the response */
  return this.result(res,content,200,mime);
};
/* verify key */
this.vkey=function(key){
  let ptrn=/^9r3i\\mia\\key\(([a-z0-9_]+):([a-z0-9]+)\)\@(.*)$/,
  match=key.match(ptrn);
  if(!match){return false;}
  let username=match[1],
    time=parseInt(match[2],36),
    base=[username,match[2]].join(':'),
    now=Math.floor((new Date).getTime()/1000),
    encoded=btoa(base)
      .split('').reverse()
      .join('').replace('=','');
  return time>now&&match[3]==encoded;
};
/* user key */
this.ukey=function(username){
  username=username.replace(/[^a-z0-9_]+/,'_');
  let time=(Math.floor((new Date).getTime()/1000)+86400)
      .toString(36),
    base=[username,time].join(':'),
    encoded=btoa(base)
      .split('').reverse()
      .join('').replace('=','');
  return '9r3i\\mia\\key('+base+')@'+encoded;
};
/* verify */
this.verify=async function(username,password){
  username=username.replace(/[^a-z0-9_]+/,'_');
  let path=[
    this.private,
    'user',
    username+'.xp',
  ].join('/'),
  accessed=await this.fs
    .access(path,this.fso.constants.F_OK)
    .then(e=>e?false:true)
    .catch(e=>false);
  if(!accessed){return false;}
  let content=await this.fs.readFile(path)
    .then(r=>r).catch(e=>null);
  if(!content){return false;}
  return this.hash(password)===content.toString();
};
/* vilify */
this.vilify=async function(username,password){
  username=username.replace(/[^a-z0-9_]+/,'_');
  let path=[
    this.private,
    'user',
    username+'.xp',
  ].join('/'),
  hash=this.hash(password),
  put=await this.fs.writeFile(path,hash)
    .then(r=>r).catch(e=>null);
  return put;
};
/* default headers */
this.headers=function(res){
  /* default headers */
  res.setHeader('Access-Control-Allow-Origin','*');
  res.setHeader('Access-Control-Allow-Headers','Content-Type, Accept');
  res.setHeader('Access-Control-Allow-Methods','POST, GET, OPTIONS, HEAD');
  res.setHeader('Access-Control-Allow-Credentials','true');
  res.setHeader('Access-Control-Max-Age','86400');
  res.setHeader('X-Powered-By','9r3i\\mia\\js '+this.version);
  
  /* options request */
  if(res.req.method==='OPTIONS'){
    res.setHeader('Content-Language','en-US');
    res.setHeader('Content-Encoding','gzip');
    res.setHeader('Content-Length','0');
    res.setHeader('Vary','Accept-Encoding, Origin');
    res.writeHead(200);
    res.end('');
    return;
  }
};
/* result */
this.result=function(res,text,code=200,mime='text/plain'){
  mime+=mime.match(/^text\//)?'; charset=utf-8;':'';
  res.setHeader('Content-Type',mime);
  res.setHeader('Content-Length',text.length);
  res.writeHead(code);
  res.end(text);
  return res;
};
/* parse form-data */
this.parseFormData=function(req){
  return new Promise(resolve=>{
    let ctype=req.headers["content-type"];
    let boundary="--"+ctype.split("; ")[1].replace("boundary=","");
    let body=[];
    req.on('data',r=>body.push(r)).on('end',async ()=>{
      let ptrn=/^[\r\n]+Content\-Disposition: form\-data; name="(.*)"[\r\n]+/i;
      let ptrnFile=/^[\r\n]+Content\-Disposition: form\-data; name="(.*)"; filename="(.*)"[\r\n]+Content\-Type: (.*)[\r\n]+/i;
      let bodyx=Buffer.concat(body).toString();
      let bodies=bodyx.split(boundary);
      let post={};
      let files=[];
      bodies.forEach(val=>{
        let match=val.match(ptrn);
        let fmatch=val.match(ptrnFile);
        if(match){
          let content=val.replace(ptrn,'').replace(/\r\n$/,'');
          post[match[1]]=content;
        }
        if(fmatch){
          let content=val.replace(ptrnFile,'').replace(/\r\n$/,'');
          files.push({
            form:fmatch[1],
            name:fmatch[2],
            type:fmatch[3],
            size:content.length,
            content,
          });
        }
      });
      return resolve({post,files});
    });
  });
};
/* parse url */
this.parseURL=function(url){
  let res=url.split(/\?/);
  return {
    file:res[0],
    query:this.parseQuery(res[1]),
  };
};
/* parse query */
this.parseQuery=function(t){
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
/* mime */
this.mime=function(file){
  let ext=file.split('.').reverse()[0],
  def='application/octet-stream',
  /* mime types */
  mimeTypes={
    txt:'text/plain',
    log:'text/plain',
    ini:'text/plain',
    css:'text/css',
    html:'text/html',
    php:'text/plain',
    phpx:'application/x-httpd-php',
    js:'application/javascript',
    json:'application/json',
    xml:'application/xml',
    zip:'application/zip',
    pdf:'application/pdf',
    rar:'application/x-rar-compressed',
    jpg:'image/jpeg',
    jpeg:'image/jpeg',
    png:'image/png',
    gif:'image/gif',
    webp:'image/webp',
    ico:'image/x-icon',
    ico:'image/vnd.microsoft.icon',
    mp4:'video/mp4',
    webm:'video/webm',
    mp3:'audio/mp3',
    wav:'audio/wav',
    ogg:'audio/ogg',
    ttf:'font/truetype',
  };
  return mimeTypes.hasOwnProperty(ext)
    ?mimeTypes[ext]:def;
};
/* hash */
this.hash=function(s){
  s=typeof s==='string'?s:'9r3i\\mia';
  let l=65535,r=[];
  for(let i=0;i<s.length;i++){
    let k=s[i].charCodeAt(0);
    r.push(String.fromCharCode(l-k));
  }
  return r.join('');
};
/* start the server automatically */
return this.start();
};


