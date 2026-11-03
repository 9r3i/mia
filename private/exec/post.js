/* load requirement */
const FS = require("fs");

/* exec -- post */
exports.post=function(root){
this.root=root?root
  :__dirname.replace(/(\/[^\/]+){2}$/,'')+'/public';
this.fs=FS.promises;
this.fso=FS;
/* post -- init */
this.init=async function(post){
  if(!post.hasOwnProperty('id')){
    return false;
  }
  let path=[
    this.root,
    'files',
    'db',
    'posts.json',
  ].join('/'),
  accessed=await this.fs
    .access(path,this.fso.constants.F_OK)
    .then(e=>e?false:true)
    .catch(e=>false);
  if(!accessed){return false;}
  let content=await this.fs.readFile(path)
    .then(r=>r).catch(e=>null);
  if(!content){return false;}
  let data=null;
  try{
    data=JSON.parse(content);
  }catch(e){
    return false;
  }
  data=Array.isArray(data)?data:[];
  let key=data.findIndex(r=>r.id==post.id);
  if(post.hasOwnProperty('delete')){
    if(key<0){return false;}
    let ndata=[];
    for(let d of data){
      if(d.id==post.id){continue;}
      ndata.push(d);
    }
    data=ndata;
  }
  else if(key<0){
    data.push(post);
  }
  else{
    data[key]=post;
  }
  /* write the file */
  await this.fs.writeFile(
    path,
    JSON.stringify(data)
  );
  return true;
};
};


