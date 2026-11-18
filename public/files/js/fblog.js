
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
  <title>CleanJelly - Sabun Jelly Serbaguna</title>
  <meta name="keywords" content="CleanJelly, SabunJelly, Serbaguna" />
  <meta name="description" content="CleanJelly, Sabun Jelly Serbaguna" />
  <meta name="robots" content="follow,index" />
  <meta name="author" content="9r3i" />
  <meta name="author-uri" content="https://github.com/9r3i" />
  <meta name="generator" content="9r3i\mia\fblog" />
  <meta name="generator-uri" content="https://github.com/9r3i/mia" />
  <meta name="generator-version" content="1.2.0" />
  <meta property="og:image" content="https://9r3i.github.io/sabunjelly/files/cleanjelly/icons/icon-152.png" />
  <meta name="google-site-verification" content="_6u0NLdofOLp0oq1Yo3hM0wTkg_iVJ32Qbv67Ppxr_M" />
  
  <link rel="apple-touch-icon" type="image/png" sizes="57x57" href="https://9r3i.github.io/sabunjelly/files/cleanjelly/icons/icon-57.png" />
  <link rel="apple-touch-icon" type="image/png" sizes="60x60" href="https://9r3i.github.io/sabunjelly/files/cleanjelly/icons/icon-60.png" />
  <link rel="apple-touch-icon" type="image/png" sizes="72x72" href="https://9r3i.github.io/sabunjelly/files/cleanjelly/icons/icon-72.png" />
  <link rel="apple-touch-icon" type="image/png" sizes="76x76" href="https://9r3i.github.io/sabunjelly/files/cleanjelly/icons/icon-76.png" />
  <link rel="apple-touch-icon" type="image/png" sizes="114x114" href="https://9r3i.github.io/sabunjelly/files/cleanjelly/icons/icon-114.png" />
  <link rel="apple-touch-icon" type="image/png" sizes="120x120" href="https://9r3i.github.io/sabunjelly/files/cleanjelly/icons/icon-120.png" />
  <link rel="apple-touch-icon" type="image/png" sizes="144x144" href="https://9r3i.github.io/sabunjelly/files/cleanjelly/icons/icon-144.png" />
  <link rel="apple-touch-icon" type="image/png" sizes="152x152" href="https://9r3i.github.io/sabunjelly/files/cleanjelly/icons/icon-152.png" />
  <link rel="apple-touch-icon" type="image/png" sizes="180x180" href="https://9r3i.github.io/sabunjelly/files/cleanjelly/icons/icon-180.png" />
  
  <link rel="icon" type="image/png" sizes="16x16" href="https://9r3i.github.io/sabunjelly/files/cleanjelly/icons/icon-16.png" />
  <link rel="icon" type="image/png" sizes="32x32" href="https://9r3i.github.io/sabunjelly/files/cleanjelly/icons/icon-32.png" />
  <link rel="icon" type="image/png" sizes="96x96" href="https://9r3i.github.io/sabunjelly/files/cleanjelly/icons/icon-96.png" />
  <link rel="icon" type="image/png" sizes="192x192" href="https://9r3i.github.io/sabunjelly/files/cleanjelly/icons/icon-192.png" />
  <link rel="shortcut icon" type="image/png" sizes="16x16" href="https://9r3i.github.io/sabunjelly/files/cleanjelly/icons/icon-16.png" />
  <link rel="shortcut icon" type="image/png" sizes="32x32" href="https://9r3i.github.io/sabunjelly/files/cleanjelly/icons/icon-32.png" />
  <link rel="shortcut icon" type="image/png" sizes="96x96" href="https://9r3i.github.io/sabunjelly/files/cleanjelly/icons/icon-96.png" />
  <link rel="shortcut icon" type="image/png" sizes="192x192" href="https://9r3i.github.io/sabunjelly/files/cleanjelly/icons/icon-192.png" />
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
