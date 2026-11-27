/* space.template.js */
function SpaceTemplate(_query,_app,_env){
const query=_query,
  app=_app,
  env=_env;
this.menus=[
  {namespace:'dashboard',name:'Dashboard',icon:'dashboard'},
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
  
  /* read private data */
  let private=await app.db.read('private/'+FBUSER.uid);
  app.pre('private',app.likeJSON(private,4));
  
  /* read public data */
  let public=await app.db.read('public');
  app.pre('public',app.likeJSON(public,4));
  
  /* dynamic */
  div('button').text('Dynamic').appendTo(content).clickOn(async function(){
    let path=['profile','temp','yang takkan pernah terlupakan selamanya'];
    path=path.map(v=>encodeURIComponent(v));
    env.go(path);
  });
  div('button').text('Zurmia').appendTo(content).clickOn(async function(){
    app.go('zurmia');
  });
  
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


