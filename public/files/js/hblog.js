/* hblog */
;(async function(){
  const route=async function(){
    let path=window.location.hash.substr(1).split('?')[0];
    path=path==''?'home.html':path;
    document.body.innerHTML='Loading...';
    let content=await fetch('html/'+path).then(r=>r.text());
    document.body.innerHTML=content;
    let title=document.querySelector('title');
    if(title){title.innerText=path;}
    return true;
  };
  /* use event listener */
  window.addEventListener('popstate',e=>{
    return route();
  },false);
  return route();
})();


