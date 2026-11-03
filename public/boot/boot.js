/* boot.js */
;function boot(host){
this.version='1.0.0';
this.host=typeof host==='string'?host
  :'https://raw.githubusercontent.com/9r3i/.bug/master/';
/* load files -- @return: object */
this.bulk=async function(a,b){
  a=Array.isArray(a)?a:[];
  b=typeof b==='function'?b:function(){};
  let h={
    type:'progress',
    loaded:0,
    total:100,
    isTrusted:true,
  },
  c=0,
  d=Math.floor(1/a.length*100),
  r={};
  b(h);
  for(let i of a){
    r[i]=await this.load(i,e=>{
      if(e.total&&e.total>0){
        h.loaded=(d*c)+Math.floor(e.loaded/e.total*d);
        b(h);
      }
    });
    c++;
    h.loaded=d*c;
    b(h);
  }
  h.loaded=h.total;
  b(h);
  return r;
};
/* load a file -- @return: mixed (object, string, bool) */
this.load=async function(f,b){
  let u=this.host+(typeof f==='string'?f:''),
  c=await this.fetch(u,b);
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
/* fetch with progress -- @return: string or false */
this.fetch=async function(u,b){
  u=typeof u==='string'?u:'';
  b=typeof b==='function'?b:function(){};
  let r=await fetch(u),
  t=parseInt(r.headers.get('content-length'),10),
  h={
    type:'progress',
    loaded:0,
    total:t?t:-1,
    isTrusted:true,
  };
  b(h);
  if(!r.ok){return false;}
  let z=new Response(new ReadableStream({
    async start(c){
      let d=r.body.getReader();
      for(;;){
        let {done,value}=await d.read();
        if(done){break;}
        h.loaded+=value.byteLength;
        b(h);
        c.enqueue(value);
      }
      c.close();
      h.loaded=h.total;
      b(h);
    },
  }));
  return await z.text()||false;
};
};
