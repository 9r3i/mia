/* space.template.js */
function SpaceTemplate(_query,_app,_env){
const query=_query,
  app=_app,
  env=_env;
this.menus=[
  {namespace:'dashboard',name:'Dashboard',icon:'dashboard'},
];
this.dashboard=async function(){
  /* get title and content element */
  let title=document.querySelector('.title'),
  content=document.querySelector('.content'),
  div=app.element;
  /* title */
  title.text('Dashboard');
  /* content */
  app.pre('Logged in',FBUSER);
  
  /* read private data */
  let read=await app.db.read('private'+FBUSER.uid);
  app.pre('private',app.likeJSON(read,4));
  
  /* read public data */
  read=await app.db.read('public');
  app.pre('public',app.likeJSON(read,4));
  
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


