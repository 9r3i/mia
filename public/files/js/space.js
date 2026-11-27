/* space.js */
const FBUSER={
  uid:null,
  email:null,
  emailVerified:null,
  displayName:null,
  photoURL:null,
}
MIA=new mia(GLOBALS.host),
PAGE={
  callback:async function(query,app,env){
    /* initialize firebase */
    app.db.userinfo(async user=>{
      document.body.innerHTML='';
      if(user){
        FBUSER.uid=user.uid;  
        FBUSER.email=user.email;
        FBUSER.displayName=user.displayName;
        FBUSER.photoURL=user.photoURL;
        FBUSER.emailVerified=user.emailVerified;
        /* admin page */
        let admin=new SpaceAdmin(query,app,env);
        return await admin.init();
      }else{
        /* login page */
        let login=new SpaceLogin(query,app,env);
        return await login.init();
      }
    });
  },
  env:{
    path:location.hash.substr(1).split('?')[0],
    title:'__space',
  },
};
/* initialize */
;(async function(app){
  /* check if everyting is ready */
  let ready=await onFunctionReady('Firebase');
  if(!ready){
    document.body.innerHTML='error --> '+(typeof Firebase);
    return;
  }
  /* push the pages */
  for(let path of ['']){
    app.routes.push([
      path,
      PAGE.env.title+(path?':'+path:''),
      PAGE.callback,
      PAGE.env,
    ]);
  }
  /* prepare boot loader */
  app.boot=new boot(app.host);
  /* prepare database firebase */
  app.db=new Firebase(fbsecret());
  /* start the mia */
  return app.init();
})(MIA);
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
    }else if(i>100){
      return cb(false);
    }return onFunctionReadyCB(fn,cb,i+1);
  },1);
}
/* fbsecret */
function fbsecret(){
  return 'eyJhcGlLZXkiOiJBSXphU3lEVzFvdEQ5WDY0VzFyNWtZZFVqODdpWTYtNXpMTEgxN0EiLCJhdXRoRG9tYWluIjoibG9naW5zcGFjZXguZmlyZWJhc2VhcHAuY29tIiwiZGF0YWJhc2VVUkwiOiJodHRwczovL2xvZ2luc3BhY2V4LWRlZmF1bHQtcnRkYi5hc2lhLXNvdXRoZWFzdDEuZmlyZWJhc2VkYXRhYmFzZS5hcHAiLCJwcm9qZWN0SWQiOiJsb2dpbnNwYWNleCIsInN0b3JhZ2VCdWNrZXQiOiJsb2dpbnNwYWNleC5hcHBzcG90LmNvbSIsIm1lc3NhZ2luZ1NlbmRlcklkIjoiODU3OTI2NjE1NjM3IiwiYXBwSWQiOiIxOjg1NzkyNjYxNTYzNzp3ZWI6ZGZkY2RjODY0M2Y5MzQ1MThlY2FkYyIsIm1lYXN1cmVtZW50SWQiOiJHLUdSVlIxSEZLUkIifQ==';
}


