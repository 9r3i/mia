
;(async function(){
  document.body.innerHTML='Loading...';
  /* get ready */
  let ready=await onFunctionReady('pro');
  document.body.innerHTML=JSON.stringify(ready);
  /* initialize */
  if(ready){
    MIA.init();
  }
/* end of statement */
})();

function onFunctionReady(fn){
  return new Promise(resolve=>{
    return onFunctionReadyCB(fn,resolve);
  });
}

function onFunctionReadyCB(fn,cb,i=0){
  cb=typeof cb==='function'?cb:function(){};
  return setTimeout(e=>{
    if(window.hasOwnProperty(fn)
      &&typeof window[fn]==='function'){
      return cb(true);
    }else if(i>3000){
      return cb(false);
    }return onFunctionReadyCB(fn,cb,i+1);
  },1);
}


