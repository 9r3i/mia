/* load requirement */
const FS = require("fs");
/* exec -- file */
exports.file=function(root){
this.root=root?root
  :__dirname.replace(/(\/[^\/]+){2}$/,'')+'/public';
this.fs=FS.promises;
this.fso=FS;
/* file -- init */
this.init=async function(post){
  let result=null,
  execs=['delete','rename','scan','info','uploadBase64'];
  for(let exec of execs){
    if(post.hasOwnProperty(exec)){
      result=await this[exec](post);
      break;
    }
  }
  return result;
};
/* file -- info */
this.info=async function(post){
  let path=[
    this.root,
    'files',
    'upload',
    post.info,
  ].join('/'),
  xpath=[
    'files',
    'upload',
    post.info,
  ].join('/'),
  accessed=await this.fs
    .access(path,this.fso.constants.F_OK)
    .then(e=>e?false:true)
    .catch(e=>false);
  if(!accessed){return false;}
  let stat=await this.fs.stat(fpath);
  return {
    name:post.info,
    path:xpath,
    size:stat.size,
    modified:Math.ceil(stat.mtimeMs/1000),
  };
};
/* file -- rename */
this.rename=async function(post){
  let path=[
    this.root,
    'files',
    'upload',
    post.file,
  ].join('/'),
  npath=[
    this.root,
    'files',
    'upload',
    post.rename,
  ].join('/'),
  accessed=await this.fs
    .access(path,this.fso.constants.F_OK)
    .then(e=>e?false:true)
    .catch(e=>false);
  try{
    await this.fs.rename(path,npath);
  }catch(e){
    return false;
  }
  return true;
};
/* file -- delete */
this.delete=async function(post){
  let path=[
    this.root,
    'files',
    'upload',
    post.file,
  ].join('/'),
  accessed=await this.fs
    .access(path,this.fso.constants.F_OK)
    .then(e=>e?false:true)
    .catch(e=>false);
  try{
    await this.fs.unlink(path);
  }catch(e){
    return false;
  }
  return true;
};
/* file -- scan */
this.scan=async function(){
  let path=[
    this.root,
    'files',
    'upload',
  ].join('/'),
  result=[];
  try{
    let files=await this.fs.readdir(path);
    for(let file of files){
      let fpath=[path,file].join('/'),
      xpath=['files','upload',file].join('/'),
      accessed=await this.fs
        .access(fpath,this.fso.constants.F_OK)
        .then(e=>e?false:true)
        .catch(e=>false);
      if(!accessed){continue;}
      let stat=await this.fs.stat(fpath);
      result.push({
        name:file,
        path:xpath,
        size:stat.size,
        modified:Math.ceil(stat.mtimeMs/1000),
      });
    }
  }catch(e){
    console.error(e);
  }
  return result;
};
/* file -- uploadBase64 */
this.uploadBase64=async function(post){
  let path=[
    this.root,
    'files',
    'upload',
    post.filename
  ].join('/'),
  content=post.content
    .replace(/^data:image\/[a-z]+;base64,/,'');
  /* write the file */
  await this.fs.writeFile(
    path,
    Buffer.from(content,'base64')
  );
  return true;
};
};


