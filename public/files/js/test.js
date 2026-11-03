
const indexedDB=window.indexedDB||window.mozIndexedDB
  ||window.webkitIndexedDB||window.msIndexedDB
  ||window.shimIndexedDB,
open=indexedDB.open("virtual",1);
open.onupgradeneeded=()=>{
  let db=open.result,
  store=db.createObjectStore("table",{keyPath:"name"}),
  index=store.createIndex("type_index",["type"]);
};
open.onsuccess=()=>{
  let db=open.result,
  tx=db.transaction("table","readwrite"),
  store=tx.objectStore("table"),
  index=store.index("type_index");
  store.put({
    name:'test.js',
    type:'application/jacascript',
    size:12,
    content:'alert("ok");',
  });
  store.put({
    name:'test.txt',
    type:'text/plain',
    size:14,
    content:'master luthfie',
  });
  let js=store.get('test.js'),
  txt=index.get(["text/plain",]);
  js.onsuccess=function(){
    alert(js.result);
  };
  txt.onsuccess=function(){
    alert(txt.result);
  };
  tx.oncomplete=()=>{db.close()};
}

