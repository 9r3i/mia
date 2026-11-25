

(async function(){
  document.body.innerHTML='';
  pro('loading...');
  let host='https://9r3i.github.io/mia/public/',
  file='files/js/hblog.js',
  res=await fetch(host+file).then(r=>r.text()).catch(e=>'error:'+JSON.stringify(e));
  pro('loaded!');
  pro('size',res.length);
  pro(res);
  
})();

/* ===================[ basic ]=================== */
const BASIC={};

/* html pre dom -- @require: likeJSON */
function pro(){
  let res=[];
  for(let s of arguments){
    res.push(typeof s==='string'?s:likeJSON(s,3));
  }
  let el=document.createElement('pre'),
  content=document.querySelector('.content');
  if(content){
    content.append(el);
  }else{
    document.body.append(el);
  }
  el.innerText=res.join(' -- ');
  el.style.border='1px solid #ccc';
  el.style.padding='5px';
  el.style.margin='5px';
  el.style.color='#555';
  el.style.whiteSpace='pre-wrap';
  el.style.wordBreak='break-all';
  el.style.fontSize='13px';
  return el;
}

/* sleep -- standalone */
function sleep(ms){
  return new Promise(resolve=>{
    setTimeout(resolve,ms);
  });
}

/* element creator -- standalone */
function div(name='div',attr={},children=[]){
  name=typeof name==='string'?name.toLowerCase():'div';
  attr=typeof attr==='object'&&attr!==null?attr:{};
  children=Array.isArray(children)?children:[];
  let main=document.createElement(name),
  notext=['option','a'];
  /* set attributes */
  for(let k in attr){
    main.setAttribute(k,attr[k]);
  }
  /* add children */
  for(let child of children){
    main.append(child);
  }
  /* add object property and method */
  main.attr=attr;
  main.html=function(html=''){
    this.innerHTML=html;
    return this;
  };
  main.text=notext.indexOf(name)>=0?''
    :function(text=''){
    this.innerText=text;
    return this;
  };
  main.content=function(content=''){
    this.textContent=content;
    return this;
  };
  main.appendTo=function(el){
    if(typeof el==='object'&&el!==null
    &&typeof el.append==='function'){
      el.append(this);
    }return this;
  };
  main.clickOn=function(cb){
    if(typeof cb==='function'){
      this.addEventListener('click',cb,false);
    }return this;
  };
  main.on=function(ev,cb){
    cb=typeof cb==='function'?cb:function(){};
    this.addEventListener(ev,cb,false);
    return this;
  };
  /* return the element object */
  return main;
}

/* parse object to json string -- standalone */
function likeJSON(obj,limit,space,pad){
  let rtext='';  
  space=space?parseInt(space,0xa):0x0;
  limit=limit?parseInt(limit,0xa):0x1;
  pad=pad?parseInt(pad,0xa):0x2;
  if((typeof obj==='object'&&obj!==null)
    ||Array.isArray(obj)){
    let start=Array.isArray(obj)?'[':'{',
        end=Array.isArray(obj)?']':'}';
    if(space==0x0){
      rtext+=(' ').repeat(pad*space)+''+start+'\r\n';
    }
    let len=0,counter=0;
    for(let i in obj){
      if(obj.hasOwnProperty(i)){len++;}
    }
    for(let i in obj){
      counter++;
      let comma=counter<len?',':'',e=obj[i],espace=space+2;
      if((typeof e==='object'&&e!==null)
        ||Array.isArray(e)){
        let estart=Array.isArray(e)?'[':'{',
            eend=Array.isArray(e)?']':'}',
            k=start==='{'?'"'+i+'": ':'';
        rtext+=(' ').repeat(pad*espace)+''+k+estart+'\r\n';
        if((espace/2)<limit){
          rtext+=likeJSON(e,limit,espace,pad);
        }else{
          rtext+=(' ').repeat(pad*(espace+2))
            +'[***LIMITED:'+limit+'***]\r\n';
        }
        rtext+=(' ').repeat(pad*espace)+''+eend+comma+'\r\n';
      }else if(typeof e==='string'||typeof e==='number'){
        let k=typeof e==='number'?e.toString():JSON.stringify(e);
        i=start==='{'?'"'+i+'": ':'';
        rtext+=(' ').repeat(pad*espace)+''+i+k+comma+'\r\n';
      }else if(typeof e==='boolean'){
        let k=e===true?'true':'false';
        i=start==='{'?'"'+i+'": ':'';
        rtext+=(' ').repeat(pad*espace)+''+i+k+comma+'\r\n';
      }else if(e===null){
        i=start==='{'?'"'+i+'": ':'';
        rtext+=(' ').repeat(pad*espace)+''+i+'null'+comma+'\r\n';
      }else{
        let k='"['+(typeof e)+']"';
        i=start==='{'?'"'+i+'" : ':'';
        rtext+=(' ').repeat(pad*espace)+''+i+k+comma+'\r\n';
      }
    }
    if(space==0){
      rtext+=(' ').repeat(pad*space)+''+end+'\r\n';
    }
  }else if(typeof obj==='string'){
    rtext+=(' ').repeat(pad*space)+'"'+obj+'"\r\n';
  }else if(typeof obj==='number'){
    rtext+=(' ').repeat(pad*space)+''+obj.toString()+'\r\n';
  }else if(typeof obj==='boolean'){
    rtext+=(' ').repeat(pad*space)+''+(obj===true
      ?'true':'false')+'\r\n';
  }else if(obj===null){
    rtext+=(' ').repeat(pad*space)+'null\r\n';
  }else{
    rtext+=(' ').repeat(pad*space)+'"['+(typeof obj)+']"\r\n';
  }return rtext;
};