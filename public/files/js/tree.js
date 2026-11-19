/* tree.js
 * ~ written to build a simple family tree diagram
 * authored by 9r3i
 * https://github.com/9r3i
 * started at december 12th 2021 - v1.1.0
 * continued at november 14th 2026 - v1.2.0 - standalone
 * @require: tree.css
 * @usage: (new tree).test()
 */
function tree(host,config){
this.version='1.2.0';
this.element=null;
this.host=host||'';
this.config=typeof config==='object'&&config!==null?config:{};
globalThis._tree=this;
/* test */
this.test=async function(){
  document.body.innerHTML='';
  let plant=await this.plant('nabi');
};
/* plant the family tree */
this.plant=async function(path=''){
  let builder=this.buildElement,
  rootid='tree-root-'+path,
  parent=builder('div',null,{'class':'tree-root','id':rootid}),
  loader=builder('div',null,{'style':'text-align:center;'},[
    builder('div',null,{'class':'lds-ellipsis'},[
      builder('div'),builder('div'),
      builder('div'),builder('div'),
    ]),
    builder('div','Loading...',{'class':'lds-text'}),
  ]);
  loader.appendTo(parent);
  document.body.append(parent);
  let url=this.host+path+'.json',
  dataObject=await this.fetchData(url);
  if(!dataObject||typeof dataObject!=='object'
    ||dataObject===null){
    parent.remove();
    alert('Error: Failed to fetch data.');
    return false;
  }
  let dataArray=Array.isArray(dataObject)
    ?dataObject:Object.values(dataObject),
  data=this.generate(dataArray,1);
  if(!data){
    parent.remove();
    alert('Error: Failed to generate data.');
    return false;
  }
  this.create(data,parent);
  let root=document.getElementById('root');
  parent.scrollTo({
    top:root.offsetTop-100,
    left:parent.offsetWidth/15,
    behavior:'smooth',
  });
  let closer=builder('div','Close',{
    'class':'tree-root-closer',
    'data-rootid':rootid,
  });
  closer.addEventListener('click',function(){
    let el=document.getElementById(this.dataset.rootid);
    if(el){el.remove();}
  },false);
  parent.append(closer);
  return parent;
};
/* generate */
this.generate=function(data,id=1){
  data=Array.isArray(data)?data:[];
  let user=data.find(u=>u.id==id);
  if(!user){return false;}
  let children=this.getChildren(data,user.id),
  sibling=this.getSibling(data,user);
  if(Array.isArray(children)&&children.length>0){
    user.children=children;
  }
  if(Array.isArray(sibling)&&sibling.length>0){
    user.sibling=sibling;
  }
  let mother=data.find(u=>u.id==user.mother),
  father=data.find(u=>u.id==user.father),
  spouse=data.find(u=>u.id==user.spouse);
  user.mother=mother?mother.name:'';
  user.father=father?father.name:'';
  user.spouse=spouse?spouse.name:'';
  return user;
};
/* get children */
this.getChildren=function(data,id){
  data=Array.isArray(data)?data:[];
  let res=[],
  users=data.filter(u=>u.mother==id||u.father==id);
  users=Array.isArray(users)?users:[];
  for(let i in users){
    let user=JSON.parse(JSON.stringify(users[i])),
    sibling=this.getSibling(data,user),
    children=this.getChildren(data,user.id);
    if(Array.isArray(children)&&children.length>0){
      user.children=children;
    }
    if(Array.isArray(sibling)&&sibling.length>0){
      user.sibling=sibling;
    }
    let mother=data.find(u=>u.id==user.mother),
    father=data.find(u=>u.id==user.father),
    spouse=data.find(u=>u.id==user.spouse);
    user.mother=mother?mother.name:'';
    user.father=father?father.name:'';
    user.spouse=spouse?spouse.name:'';
    res.push(user);
  }
  res.sort((a,b)=>a.order-b.order);
  return res;
};
/* get sibling */
this.getSibling=function(data,user){
  data=Array.isArray(data)?data:[];
  let res=[];
  for(let d of data){
    let u=JSON.parse(JSON.stringify(d));
    if(u.id==user.id){continue;}
    if((u.mother&&u.mother==user.mother)
      ||(u.father&&u.father==user.father)){
      let odr=(u.order?u.order.toString().padStart(3,'0'):'000')+u.id.toString().padStart(5,'0'),
      r={
        id:u.id,
        name:u.name,
        order:parseInt(odr),
      };
      res.push(r);
    }
  };
  res.sort((a,b)=>a.order-b.order);
  return res;
};
/* fetch data */
this.fetchData=async function(url){
  return await fetch(url).then(r=>r.json()).catch(e=>false);
};
/* create family tree */
this.create=function(data,parent){
  this.element=document.createElement('div');
  let ftree=document.createElement('div');
  this.element.classList.add('family-tree-root');
  ftree.id='family-tree';
  this.element.append(ftree);
  if(typeof parent==='object'&&parent!==null
    &&typeof parent.append==='function'){
    parent.innerHTML='';
    parent.append(this.element);
  }
  this.print('family-tree',data);
  return this;
};
/* print family tree -- output */
this.print=function(id,data){
  if(typeof id!=='string'
    ||typeof data!=='object'
    ||data===null
    ||!data.name){return false;}
  let ftree=document.getElementById(id);
  if(!ftree){return false;}
  this.entry(data,ftree);
};
/* build family entry */
this.entry=function(data,en,sole){
  if(typeof data!=='object'
    ||data===null
    ||!data.name){return false;}
  let uid=true;
  if(!en){
    en=document.createElement('div');
    en.classList.add('entry');
    if(sole){
      en.classList.add('sole');
    }uid=false;
  }
  let gender=data.gender==1?'male':'female';
  let job=typeof data.job==='string'?data.job.toLowerCase().replace(/[^a-z]+/g,''):'nojob';
  let span=document.createElement('span');
  span.classList.add('label');
  span.classList.add('label-'+gender);
  span.classList.add('label-'+job);
  if(data.privilege=='admin'){
    span.classList.add('label-admin');
  }
  span.innerText=data.name;
  span.dataset.id='info-'+data.id;
  if(typeof data.photo==='string'){
    span.dataset.photo=data.photo;
  }
  span.onclick=function(e){
    return _tree.infoOpen(this.dataset.id);
  };
  span.oncontextmenu=function(e){
    let dataID=this.dataset.id;
    _tree.infoOpen(dataID);
    e.preventDefault&&e.preventDefault();
    e.stopPropagation&&e.stopPropagation();
    e.cancelBubble=true;
    e.returnValue=false;
    return false;
  };
  if(uid){span.id='root';}
  en.append(span);
  if(data.hasOwnProperty('children')
    &&Array.isArray(data.children)
    &&data.children.length>0){
    let cb=this.branch();
    cb.id='branch-'+data.id;
    let solo=data.children.length==1?true:false;
    for(let i=0;i<data.children.length;i++){
      let ch=this.entry(data.children[i],null,solo);
      if(ch){cb.append(ch);}
    }en.append(cb);
  }
  en.append(this.info(data));
  return en;
};
/* build member info */
this.info=function(data){
  if(typeof data!=='object'
    ||data===null
    ||!data.name){return false;}
  let el=document.createElement('div');
  if(!data.id){alert(data.name);console.log(data);}
  el.id='info-'+data.id;
  el.classList.add('info');
  let gender=data.gender==1
    ?'<span class="info-gender-male">Male</span>'
    :'<span class="info-gender-female">Female</span>';
  let father=data.father
    ?'<tr><td>Father</td><td>:</td><td>'+data.father+'</td></tr>':'';
  let mother=data.mother
    ?'<tr><td>Mother</td><td>:</td><td>'+data.mother+'</td></tr>':'';
  let spouse=data.spouse
    ?'<tr><td>Spouse</td><td>:</td><td>'+data.spouse+'</td></tr>':'';
  let birth=data.birth
    ?'<tr><td>Date of Birth</td><td>:</td><td>'
      +(new Date(data.birth)).toString().substr(0,15)
      +'</td></tr>':'';
  let death=data.death
    ?'<tr><td>Date of Death</td><td>:</td><td>'
      +(new Date(data.death)).toString().substr(0,15)
      +'</td></tr>':'';
  let order=data.order
    ?'<tr><td>Family Order</td><td>:</td><td>'+data.order+'</td></tr>':'';
  let nickname=data.nickname
    ?'<tr><td>Nickname</td><td>:</td><td>'+data.nickname+'</td></tr>':'';
  let phone=data.phone
    ?'<tr><td>Phone</td><td>:</td><td>'+data.phone+'</td></tr>':'';
  let job=data.job
    ?'<tr><td>Job</td><td>:</td><td>'+data.job+'</td></tr>':'';
  let address=data.address
    ?'<tr><td>Address</td><td>:</td><td>'+data.address+'</td></tr>':'';
  let children='';
  if(data.children){
    children+='<tr><td>Children</td><td>:</td><td>'+data.children[0].name+'</td></tr>';
    for(let i=1;i<data.children.length;i++){
      children+='<tr><td></td><td></td><td>'+data.children[i].name+'</td></tr>';
    }
  }
  let sibling='';
  if(data.sibling){
    sibling+='<tr><td>Siblings</td><td>:</td><td>'+data.sibling[0].name+'</td></tr>';
    for(let i=1;i<data.sibling.length;i++){
      sibling+='<tr><td></td><td></td><td>'+data.sibling[i].name+'</td></tr>';
    }
  }
  let photoURL=typeof data.photo==='string'?data.photo:'';
  let html='<div class="info-photo" id="info-photo-'+data.id+'" data-photo="'+photoURL+'"></div>'
    +'<div class="info-header">'+data.name+'</div>'
    +'<table class="table-info" cellpadding="0" cellspacing="0"><tbody>'
    +'<tr><td>ID</td><td>:</td><td>'+data.id+'</td></tr>'
    +'<tr><td>Gender</td><td>:</td><td>'+gender+'</td></tr>'
    +birth+death+father+mother+spouse+order+nickname
    +children+sibling+phone+job
    +'</tbody></table>'
    +'<div class="info-footer">'
      +'<a href="javascript:_tree.infoClose(\'info-'+data.id
      +'\')">Close</a>'
    +'</div>';
  el.innerHTML=html;
  if(data.privilege=='admin'){
    el.classList.add('info-admin');
  }
  return el;
};
/* info open */
this.infoOpen=function(id){
  let infos=document.getElementsByClassName('info-show');
  let i=infos.length;
  while(i--){
    infos[i].classList.remove('info-show');
  }
  let iid=id.replace(/^info\-/,'');
  let cb=document.getElementById('branch-'+iid);
  if(cb&&cb.classList.contains('branch-hide')){
    cb.classList.remove('branch-hide');
    return;
  }
  let el=document.getElementById(id);
  if(el){
    el.classList.add('info-show');
    let infoPhoto=document.getElementById('info-photo-'+iid);
    let infoImg=document.getElementById('info-image-'+iid);
    if(!infoPhoto||infoImg){return;}
    let builder=_tree.buildElement;
    let loader=builder('div',null,{'style':'text-align:center;'},[
      builder('div',null,{'class':'lds-ellipsis'},[
        builder('div'),builder('div'),
        builder('div'),builder('div'),
      ]),
      builder('div','Loading...'),
    ]);
    loader.appendTo(infoPhoto);
    infoImg=new Image;
    infoImg.id='info-image-'+iid;
    infoImg.onload=function(){
      let ipi=builder('div',null,{
        'class':'info-photo-image',
      });
      ipi.appendTo(infoPhoto);
      ipi.append(infoImg);
      infoPhoto.removeChild(loader);
    };
    infoImg.onerror=function(){
      infoPhoto.removeChild(loader);
    };
    infoImg.src=infoPhoto.dataset.photo;
  }
};
/* info close */
this.infoClose=function(id){
  let el=document.getElementById(id);
  if(el){el.classList.remove('info-show');}
};
/* build family branch */
this.branch=function(){
  let el=document.createElement('div');
  el.classList.add('branch');
  if(this.config.hasOwnProperty('hide')
    &&this.config.hide===true){
    el.classList.add('branch-hide');
  }
  return el;
};
/* build element */
this.buildElement=function(tag,text,attr,children,html,content){
  let div=document.createElement(typeof tag==='string'?tag:'div');
  div.appendTo=function(el){
    if(typeof el==='object'&&el!==null
      &&typeof el.append==='function'){
      el.append(this);
      return true;
    }return false;
  };
  if(typeof text==='string'){
    div.innerText=text;
  }
  if(typeof attr==='object'&&attr!==null){
    for(let i in attr){
      div.setAttribute(i,attr[i]);
    }
  }
  if(Array.isArray(children)){
    for(let i=0;i<children.length;i++){
      div.append(children[i]);
    }
  }
  if(typeof html==='string'){
    div.innerHTML=html;
  }
  if(typeof content==='string'){
    div.textContent=content;
  }
  div.args={
    tag:tag,
    text:text,
    attr:attr,
    children:children,
    html:html,
    content:content,
  };
  return div;
};
/* temporary */
this.temp=function(){
  return false;
};
};


