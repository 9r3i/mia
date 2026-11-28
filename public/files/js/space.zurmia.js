/* space.zurmia.js */
function SpaceZurmia(_query,_app,_env){
const query=_query,
  app=_app,
  env=_env;
this.menus=[
  {namespace:'dashboard',name:'Dashboard',icon:'dashboard'},
  {namespace:'money',name:'Money',icon:'money'},
];
this.dashboard=async function(param){
  /* get title and content element */
  let title=document.querySelector('.title'),
  content=document.querySelector('.content'),
  div=app.element;
  /* title */
  title.text('Dashboard');
  /* content */
  app.pre('isAdmin:'+env.isAdmin);
  app.pre('path:'+env.path());
  app.pre('param:'+param);
  app.pre('user',FBUSER);
  
  /* dynamic */
  div('button').text('Dynamic').appendTo(content).clickOn(async function(){
    let path=['profile','temp','yang takkan pernah terlupakan selamanya'];
    path=path.map(v=>encodeURIComponent(v));
    env.go(path);
  });
  div('button').text('Money').appendTo(content).clickOn(async function(){
    env.go(['zurmia','money']);
  });
  
  /* read private data */
  let private=await app.db.read('private/'+FBUSER.uid);
  app.pre('private',app.likeJSON(private,4));
  
  /* read public data */
  let public=await app.db.read('public');
  app.pre('public',app.likeJSON(public,4));
  
  /* button font */
  div('button').text('Font').appendTo(content).clickOn(async function(){
    this.remove();
    let loader=app.contentLoader(),
    text=await app.fetch('files/css/fontawesome.min.css'),
    match=text.match(/\.fa\-[^:\{]+/g);
    loader.remove();
    for(let i=0;i<match.length;i++){
      let m=match[i].substr(1);
      div('div',{},[
        div('i',{'class':'fa '+m}).text(' '+m),
      ]).appendTo(content);
    }
  });
  //*/
};
this.money=async function(param){
  /* get title and content element */
  let title=document.querySelector('.title'),
  content=document.querySelector('.content'),
  div=app.element;
  /* title */
  title.text('Money');
  /* load data money */
  let loader=app.contentLoader(),
  pathMoney='private/'+FBUSER.uid+'/data/money',
  initData={
    ayyub:[30000],
    isa:[30000],
    malik:[30000],
    rifa:[30000],
    ulfa:[30000],
    zayd:[30000],
    zzz:[-10000],
  },
  //write=await app.db.write(pathMoney,initData),
  dataMoney=await app.db.read(pathMoney);
  loader.remove();
  /*  */
  /*  */
  /* content */
  let table=app.table().appendTo(content),
  keys=Object.keys(dataMoney),
  headerKeys=keys.map(v=>v[0].toUpperCase()+v.substr(1)),
  header=table.rowHead.apply(table,[...headerKeys]),
  max=0,
  inputs=[],
  button=app.element('button',{'class':'button-blue'}).text('Save');
  for(let k in dataMoney){
    if(dataMoney[k].length>max){
      max=dataMoney[k].length;
    }
    let input=app.element('input',{
      name:k,
      type:'number',
    });
    inputs.push(input);
  }
  for(let i=0;i<max;i++){
    let vals=[];
    for(let k in dataMoney){
      let v=dataMoney[k];
      if(v.hasOwnProperty(i)){
        let span=div('span',{
          'data-value':v[i],
          'data-key':k,
          'style':'color:'+(v[i]<0?'#b33':'#7b3')+';',
        }).text(v[i]).on('contextmenu',async function(){
          let yes=await app.confirm(
            'Delete this value?\n'
            +'\nkey: '+this.dataset.key
            +'\nvalue: '+this.dataset.value
          );
          if(!yes){return;}
          let key=this.dataset.key,
          value=parseInt(this.dataset.value,10),
          id=dataMoney[key].indexOf(value);
          if(id>=0){delete dataMoney[key][id];}
          dataMoney[key]=Object.values(dataMoney[key]);
          let load=app.loader(),
          res=await app.db.write(pathMoney,dataMoney);
          app.go(env.path());
        });
        vals.push(span);
      }else{
        vals.push('');
      }
    }
    let row=table.row.apply(table,vals);
    for(let iv in vals){
      row.childNodes[iv].classList.add('td-right');
    }
  }
  table.row.apply(table,inputs);
  let totalValues=Object.values(dataMoney).map(v=>this.getTotal(v)),
  totalRow=table.row.apply(table,totalValues),
  lower=table.row(button,'Grand Total',this.getTotal(totalValues));
  lower.childNodes[0].setAttribute('colspan','2');
  lower.childNodes[1].setAttribute('colspan','3');
  lower.childNodes[2].setAttribute('colspan','2');
  lower.childNodes[1].classList.add('td-right');
  lower.childNodes[2].classList.add('td-right');
  for(let iv in totalValues){
    totalRow.childNodes[iv].classList.add('td-right');
  }
  button.clickOn(async function(){
    for(let input of inputs){
      let key=input.name,
      value=parseInt(input.value,10);
      if(value){
        dataMoney[key].push(value);
      }
    }
    app.pre(dataMoney);
    let load=app.loader(),
    res=await app.db.write(pathMoney,dataMoney);
    app.go(env.path());
  });
  //app.pre(pathMoney,dataMoney);
};
this.getTotal=function(data){
  let total=0;
  for(let v of data){
    total+=v;
  }
  return total;
};
};


