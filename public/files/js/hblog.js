/* hblog */
;(async function(){
  const replacement=function(content){
    return content;
  },
  host=[
    'http://127.0.0.1:9301/', // --> 0
    'http://127.0.0.1:9301/files/', // --> 1
    'https://raw.githubusercontent.com/9r3i/mia/master/public/files/', // --> 2
    'https://rawfo.vercel.app/9r3i/mia/master/public/files/',
  ],
  http=host[1]+'html/',
  route=async function(){
    let path=window.location.hash.substr(1).split('?')[0];
    path=path==''?'home.html':path;
    document.body.innerHTML='Loading...';
    let content=await fetch(http+path)
      .then(r=>r.text())
      .catch(e=>'Failed to fetch: '+path);
    document.body.innerHTML=replacement(content);
    let title=document.querySelector('title');
    if(title){title.innerText=path.replace(/\.html$/,'');}
    return true;
  };
  window.addEventListener('popstate',e=>{
    return route();
  },false);
  return route();
})();


