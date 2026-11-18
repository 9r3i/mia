
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


`
  <script type="application/ld+json">
    {
      "@context": "https://schema.org/",
      "@type": "Product",
      "name": "CleanJelly",
      "image": "https://lh3.googleusercontent.com/p/AF1QipPWW8EcqL6C953pRtfic2UtsdDciA-15w0_8dPk=s2280-w1026-h2280",
      "description": "SabunJelly Serbaguna",
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.8",
        "reviewCount": "4546",
        "bestRating": "5",
        "worstRating": "1"
      }
    }
  </script>
`;
