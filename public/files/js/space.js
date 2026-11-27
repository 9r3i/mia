/* space.js */
const FBUSER={
  uid:null,
  email:null,
  emailVerified:null,
  displayName:null,
  photoURL:null,
};
/* space as class */
function Space(){
/* space environment */
this.title='__space';
this.version='1.0.0';
/* scope */
this.scopes=['profile','user','account','zurmia'];
/* path */
this.path=function(){
  return location.hash.substr(1).split('?')[0];
};
/* callback */
this.callback=async function(query,app,env){
  app.db.userinfo(async user=>{
    document.body.innerHTML='';
    if(user){
      FBUSER.uid=user.uid;  
      FBUSER.email=user.email;
      FBUSER.displayName=user.displayName;
      FBUSER.photoURL=user.photoURL;
      FBUSER.emailVerified=user.emailVerified;
      /* loader page */
      let admin=new SpaceLoader(query,app,env);
      return await admin.init();
    }else{
      /* login page */
      let login=new SpaceLogin(query,app,env);
      return await login.init();
    }
  });
};
/* app.go with path undergo */
this.go=function(path=[],query={}){
  path=Array.isArray(path)?path:[];
  query=typeof query==='object'&&query!==null?query:{};
  path=path.map(v=>encodeURIComponent(v));
  let urlQuery=this.app.buildQuery(query),
  urlPath=path.join('/');
  this.app.routes.push([
    urlPath,
    path[0],
    this.callback,
    this,
  ]);
  return this.app.go(urlPath+(urlQuery?'?'+urlQuery:''));
};
/* initialize */
this.init=async function(){
  /* check if everyting is ready */
  let ready=await this.onFunctionReady('Firebase');
  if(!ready){
    document.body.innerHTML='error --> '+(typeof Firebase);
    return;
  }
  /* push the pages */
  let app=new mia(GLOBALS.host),
  scopes=this.scopes.map(v=>v+'/dashboard');
  for(let path of ['',...this.scopes,...scopes]){
    app.routes.push([
      path,
      this.title+(path?'\\'+path.replace('/','\\'):''),
      this.callback,
      this,
    ]);
  }
  /* prepare boot loader */
  app.boot=new boot(app.host);
  /* prepare database firebase */
  app.db=new Firebase(this.fbsecret());
  /* start the mia */
  this.app=app;
  return app.init();
};
/* onFunctionReady */
this.onFunctionReady=function(fn){
  return new Promise(resolve=>{
    return this.onFunctionReadyCB(fn,resolve);
  });
};
/* onFunctionReadyCB */
this.onFunctionReadyCB=function(fn,cb,i=0){
  cb=typeof cb==='function'?cb:function(){};
  return setTimeout(e=>{
    if(window.hasOwnProperty(fn)
      &&typeof window[fn]==='function'){
      return cb(true);
    }else if(i>100){
      return cb(false);
    }return this.onFunctionReadyCB(fn,cb,i+1);
  },1);
};
/* fbsecret */
this.fbsecret=function(){
  return 'eyJhcGlLZXkiOiJBSXphU3lEVzFvdEQ5WDY0VzFyNWtZZFVqODdpWTYtNXpMTEgxN0EiLCJhdXRoRG9tYWluIjoibG9naW5zcGFjZXguZmlyZWJhc2VhcHAuY29tIiwiZGF0YWJhc2VVUkwiOiJodHRwczovL2xvZ2luc3BhY2V4LWRlZmF1bHQtcnRkYi5hc2lhLXNvdXRoZWFzdDEuZmlyZWJhc2VkYXRhYmFzZS5hcHAiLCJwcm9qZWN0SWQiOiJsb2dpbnNwYWNleCIsInN0b3JhZ2VCdWNrZXQiOiJsb2dpbnNwYWNleC5hcHBzcG90LmNvbSIsIm1lc3NhZ2luZ1NlbmRlcklkIjoiODU3OTI2NjE1NjM3IiwiYXBwSWQiOiIxOjg1NzkyNjYxNTYzNzp3ZWI6ZGZkY2RjODY0M2Y5MzQ1MThlY2FkYyIsIm1lYXN1cmVtZW50SWQiOiJHLUdSVlIxSEZLUkIifQ==';
};
};


