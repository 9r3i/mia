/* space.account.js */
function SpaceAccount(_query,_app,_env){
const query=_query,
  app=_app,
  env=_env;
this.menus=[
  {namespace:'dashboard',name:'Dashboard',icon:'dashboard'},
  {namespace:'ok'},
];
this.dashboard=async function(){
  /* get title and content element */
  let title=document.querySelector('.title'),
  content=document.querySelector('.content'),
  div=app.element;
  /* title */
  title.text('Dashboard');
  /*  */
  /*  */
  /* content */
  app.pre('Logged in',FBUSER);
  
  /* write profile *
  app.pre(await app.db.write('private/'+FBUSER.uid+'/profile',{
    uid:FBUSER.uid,
    email:FBUSER.email,
    emailVerified:false,
    displayName:'Abu Ayyub',
    photoURL:'https://avatars.githubusercontent.com/u/3212290?v=4',
  }));
  //*/
  
  let read=await app.db.read('private');
  //let read=await app.db.read('private'+FBUSER.uid);
  app.pre('private',app.likeJSON(read,4));
  
  /* */
  read=await app.db.read('public');
  app.pre('public',app.likeJSON(read,4));
  
  /* *
  app.pre(await app.db.write('public/posts',[
    {id:1,title:'judul',content:'content',date:'2025-06-09'},
    {id:2,title:'judul',content:'content',date:'2025-11-19'},
    {id:3,title:'judul',content:'content',date:'2026-06-29'},
    {id:4,title:'judul',content:'content',date:'2026-11-25'},
  ]));
  //*/
  
  /* verify */
  div('button').text('Verify').appendTo(content).clickOn(async function(){
    await app.alert('Sent!');
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


