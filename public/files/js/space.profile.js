/* space.profile.js */
function SpaceProfile(_query,_app,_env){
const query=_query,
  app=_app,
  env=_env;
this.menus=[
  {namespace:'ok'},
  {namespace:'error karena panjang banget tulisannya'},
  {namespace:'temp'},
];
this.dashboard=async function(param){
  /* get title and content element */
  let title=document.querySelector('.title'),
  content=document.querySelector('.content'),
  div=app.element;
  /* title */
  title.text('Dashboard');
  /* content */
  app.pre('isAdmin:'+env.isAdmin).style.fontSize='0.7rem';
  app.pre('path:'+env.path()).style.fontSize='0.7rem';
  app.pre('param:'+param).style.fontSize='0.7rem';
  app.pre('user',FBUSER).style.fontSize='0.7rem';
  /* dynamic */
  div('button').text('Dynamic').appendTo(content).clickOn(async function(){
    let path=['profile','temp','yang takkan pernah terlupakan selamanya'];
    path=path.map(v=>encodeURIComponent(v));
    env.go(path);
  });
  div('button').text('Zurmia Money').appendTo(content).clickOn(async function(){
    env.go(['zurmia','money']);
  });
};
this.temp=async function(param='empty'){
  /* get title and content element */
  let title=document.querySelector('.title'),
  content=document.querySelector('.content'),
  div=app.element;
  /* title */
  title.text('Temp');
  /* private */
  let loader=app.contentLoader(),
  private=await app.db.read('private/'+FBUSER.uid);
  loader.remove();
  /*  */
  /* content */
  app.pre('isAdmin:'+env.isAdmin);
  app.pre('path:'+env.path());
  app.pre('param:'+param);
  app.pre('user',FBUSER);
  app.pre('private',private);
  
  /* write profile *
  app.pre(await app.db.write('private/'+FBUSER.uid+'/profile',FBUSER));
  //*/
  
  /* write scope */
  app.pre('scope',await app.db.write('admin/'+FBUSER.uid+'/scope',[
    'profile',
  ]));
  //*/
  
  /* public */
  let read=await app.db.read('public');
  app.pre('public',app.likeJSON(read,4));
  
  /* *
  app.pre(await app.db.write('public/posts',[
    {id:1,title:'judul',content:'content',date:'2025-06-09'},
    {id:2,title:'judul',content:'content',date:'2025-11-19'},
    {id:3,title:'judul',content:'content',date:'2026-06-29'},
    {id:4,title:'judul',content:'content',date:'2026-11-25'},
  ]));
  //*/
  
  /* dynamic */
  div('button').text('Dynamic').appendTo(content).clickOn(async function(){
    let path=['profile','temp','yang takkan pernah terlupakan selamanya'];
    path=path.map(v=>encodeURIComponent(v));
    env.go(path);
  });
  
  /* verify */
  div('button').text('Verify').appendTo(content).clickOn(async function(){
    env.go(['damai.cinta.mu']);
  });
  //*/
  
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
};


