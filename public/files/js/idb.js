/* idb.js */
;function idb(dbname='database',table='table',key='path'){
this.version='1.0.0';
this.drive=window.indexedDB||window.mozIndexedDB
  ||window.webkitIndexedDB||window.msIndexedDB
  ||window.shimIndexedDB;
this.dbname=dbname;
this.table=table;
this.key=key;
/* create database */
this.create=function(){
  let db=this.drive.open(this.dbname,1);
  db.onupgradeneeded=()=>{
    db.result
      .createObjectStore(this.table,{keyPath:this.key})
      .createIndex('index',['alias']);
  };
  return this;
};
/* set */
this.set=function(path,content='',alias=''){
  if(typeof path!=='string'){return;}
  let db=this.drive.open(this.dbname,1);
  db.onsuccess=()=>{
    let tx=db.result.transaction(this.table,'readwrite'),
    store=tx.objectStore(this.table),
    index=store.index('index'),
    size=content.length,
    type=this.mime(path);
    store.put({[this.key]:path,type,size,content,alias});
  };
  return this;
};
/* get */
this.get=function(path){
  if(typeof path!=='string'){return false;}
  return new Promise((resolve)=>{
    let db=this.drive.open(this.dbname,1);
    db.onsuccess=()=>{
      let tx=db.result.transaction(this.table,'readwrite'),
      store=tx.objectStore(this.table),
      index=store.index('index'),
      data=store.get(path);
      data.onsuccess=function(){
        return resolve(typeof data.result!=='undefined'?data.result:false);
      };
    };
  });
};
/* index */
this.index=function(alias){
  if(typeof alias!=='string'){return false;}
  return new Promise((resolve)=>{
    let db=this.drive.open(this.dbname,1);
    db.onsuccess=()=>{
      let tx=db.result.transaction(this.table,'readwrite'),
      store=tx.objectStore(this.table),
      index=store.index('index'),
      data=index.get([alias]);
      data.onsuccess=function(){
        return resolve(typeof data.result!=='undefined'?data.result:false);
      };
    };
  });
};
/* mime */
this.mime=function(file){
  let ext=file.split('.').reverse()[0],
  def='application/octet-stream',
  /* mime types */
  mimeTypes={
    txt:'text/plain',
    log:'text/plain',
    ini:'text/plain',
    css:'text/css',
    html:'text/html',
    php:'text/plain',
    phpx:'application/x-httpd-php',
    js:'application/javascript',
    json:'application/json',
    xml:'application/xml',
    zip:'application/zip',
    pdf:'application/pdf',
    rar:'application/x-rar-compressed',
    jpg:'image/jpeg',
    jpeg:'image/jpeg',
    png:'image/png',
    gif:'image/gif',
    webp:'image/webp',
    ico:'image/x-icon',
    ico:'image/vnd.microsoft.icon',
    mp4:'video/mp4',
    webm:'video/webm',
    mp3:'audio/mp3',
    wav:'audio/wav',
    ogg:'audio/ogg',
    ttf:'font/truetype',
  };
  return mimeTypes.hasOwnProperty(ext)
    ?mimeTypes[ext]:def;
};
};


