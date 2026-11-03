/* boot.js */
;function boot(host){
this.version='1.0.0';
this.host=typeof host==='string'?host
  :'https://raw.githubusercontent.com/9r3i/.bug/master/';
/* load files -- @return: */
this.bulk=async function(a,b){
  a=Array.isArray(a)?a:[];
  b=typeof b==='function'?b:function(){};
  let h={
    type:'progress',
    loaded:0,
    total:a.length,
    isTrusted:true,
  },
  r={};
  b(h);
  for(let i of a){
    r[i]=await this.load(i);
    h.loaded++;
    b(h);
  }
  h.loaded=h.total;
  b(h);
  return r;
};
/* load a file -- @return: mixed (object, string, bool) */
this.load=async function(f){
  let u=this.host+(typeof f==='string'?f:''),
  c=await fetch(u).then(r=>r.text()).catch(e=>false);
  if(typeof c!=='string'){return false;}
  if(f.match(/\.css$/)){
    return this.exec(c,'style',f);
  }else if(f.match(/(\.module\.js|\.node\.js|\.mjs)$/)){
    return this.exec(c,'module',f);
  }else if(f.match(/\.js$/)){
    return this.exec(c,'script',f);
  }return c;
};
/* execute string -- @return: object of element */
this.exec=function(s,t,i){
  let w={
    script:['script','text/javascript'],
    module:['script','module'],
    style:['style','text/css'],
  },
  u=typeof t==='string'&&w.hasOwnProperty(t)?w[t]:w.script,
  c=document.createElement(u[0]);
  c.type=u[1];
  c.textContent=typeof s==='string'?s:'';
  c.id=typeof i==='string'?i:new Date().getTime();
  document.head.appendChild(c);
  return c;
};
};
