/* load requirement */
const FS = require("fs");

/* exec -- quiz */
exports.quiz=function(root){
this.root=root?root
  :__dirname.replace(/(\/[^\/]+){2}$/,'')
    +'/public/files/db/';
this.fs=FS.promises;
this.fso=FS;
this.topicFile=this.root+'topic.json';
this.scoreFile=this.root+'score.json';
this.quizDir=this.root+'quiz/';
/* quiz -- init */
this.init=async function(post){
  if(!post.hasOwnProperty('table')){
    return false;
  }
  if(post.table=='topic'){
    delete post.table;
    return this.topic(post);
  }
  else if(post.table=='score'){
    delete post.table;
    return this.score(post);
  }
  else if(post.table=='quiz'){
    delete post.table;
    return this.quiz(post);
  }
  return false;
};
/* quiz -- question */
this.quiz=async function(post){
  if(!post.hasOwnProperty('method')
    ||!post.hasOwnProperty('tid')
    ||!post.hasOwnProperty('id')){
    return false;
  }
  let path=this.quizDir+post.tid+'.json',
  accessed=await this.fs
    .access(path,this.fso.constants.F_OK)
    .then(e=>e?false:true)
    .catch(e=>false);
  if(!accessed){
    /* create the file */
    await this.fs.writeFile(
      path,
      JSON.stringify([])
    );
  }
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
  delete post.tid;
  if(post.method=='delete'){
    delete post.method;
    if(key<0){return false;}
    let ndata=[];
    for(let d of data){
      if(d.id==post.id){continue;}
      ndata.push(d);
    }
    data=ndata;
  }
  else if(post.method=='edit'){
    delete post.method;
    if(key<0){return false;}
    data[key]=post;
  }
  else if(post.method=='add'){
    delete post.method;
    if(key>=0){return false;}
    data.push(post);
  }
  else{
    return false;
  }
  /* write the file */
  await this.fs.writeFile(
    path,
    JSON.stringify(data)
  );
  return true;
  
};
/* score */
this.score=async function(post){
  if(!post.hasOwnProperty('tid')
    ||!post.hasOwnProperty('score')
    ||!post.hasOwnProperty('username')){
    return false;
  }
  let path=this.scoreFile,
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
  data=typeof data==='object'&&data!==null?data:{};
  if(!data.hasOwnProperty(post.username)){
    data[post.username]={};
  }
  if(data[post.username].hasOwnProperty(post.tid)){
    return false;
  }
  data[post.username][post.tid]=parseInt(post.score,10);
  /* write the file */
  await this.fs.writeFile(
    path,
    JSON.stringify(data)
  );
  return true;
};
/* topic */
this.topic=async function(post){
  if(!post.hasOwnProperty('method')
    ||!post.hasOwnProperty('id')){
    return false;
  }
  let path=this.topicFile,
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
  
  if(post.method=='delete'){
    delete post.method;
    if(key<0){return false;}
    let ndata=[];
    for(let d of data){
      if(d.id==post.id){continue;}
      ndata.push(d);
    }
    data=ndata;
  }
  else if(post.method=='edit'){
    delete post.method;
    if(key<0){return false;}
    data[key]=post;
  }
  else if(post.method=='add'){
    delete post.method;
    if(key>=0){return false;}
    data.push(post);
  }
  else{
    return false;
  }
  /* write the file */
  await this.fs.writeFile(
    path,
    JSON.stringify(data)
  );
  return true;
};
};

/*
-----------------
quiz/<tid>.json format
-----------------
array [
  {
    "id":97,
    "q":"pertanyaan yang sulit...",
    "a":"begini",
    "b":"begitu",
    "c":"yang ini",
    "d":"yang itu",
    "x":"d",
    "y":"d",
  }
]
-----------------
topic.json format
-----------------
array [
  {
    "tid": 23,
    "username": "siapa",
    "title": "bersatu kita teguh",
    "description": "yah begitu lah",
    "time": 1792008773009
  }
]
-----------------
score.json format
-----------------
object {
  "username": {
    "tid": "score",
    "23": 90,
    ...
  }
}
-----------------
*/

