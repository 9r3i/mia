/* oltest.js -- requires: mia.js*/
;const oltest=function(){
this.version='1.0.0';
this.host='';
this.app=null;
/* routers */
this.routers=[];
/* headers */
this.headers=[];
/* footers */
this.footers=[];
/* main elements */
this.mainElement=function(){
  
};
/* initialize */
this.init=async function(){
  /* start mia app */
  this.app=new mia(this.host);
  /* setup routers, headers, footers */
  for(let r of this.routers){this.app.routes.push(r);}
  for(let r of this.headers){this.app.headers.push(r);}
  for(let r of this.footers){this.app.footers.push(r);}
  /* prepare the main element */
  this.mainElement();
  /* initialize the app */
  this.app.init();
};
/* correct -- @return: always true */
this.correct=function(){
  return true;
};
/* wrong -- @return: always false */
this.wrong=function(){
  return false;
};
/* initialize the oltest */
return this.init();
};