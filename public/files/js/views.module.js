/* import */
import { initializeApp } from "https://www.gstatic.com/firebasejs/13.2.0/firebase-app.js";
import { 
  getDatabase, 
  ref, 
  set, 
  get, 
  child, 
} from "https://www.gstatic.com/firebasejs/13.2.0/firebase-database.js";

exports.views=async function(uname){
  let a='eyJhcGlLZXkiOiJBSXphU3lCRnZJam5IZGV6em0wY2ZGdGlxdVAwcnpMeGRoLUY0djAiLCJhdXRoRG9tYWluIjoidmlld3N4LmZpcmViYXNlYXBwLmNvbSIsImRhdGFiYXNlVVJMIjoiaHR0cHM6Ly92aWV3c3gtZGVmYXVsdC1ydGRiLmFzaWEtc291dGhlYXN0MS5maXJlYmFzZWRhdGFiYXNlLmFwcCIsInByb2plY3RJZCI6InZpZXdzeCIsInN0b3JhZ2VCdWNrZXQiOiJ2aWV3c3guZmlyZWJhc2VzdG9yYWdlLmFwcCIsIm1lc3NhZ2luZ1NlbmRlcklkIjoiOTE2NjYzNDM1NzUiLCJhcHBJZCI6IjE6OTE2NjYzNDM1NzU6d2ViOjQwMDdlY2VlM2Q4ZjYwMmE0ZGFiZDIiLCJtZWFzdXJlbWVudElkIjoiRy05UVk4MlZUN0VZIn0=',
  b=atob(a),
  c=null;
  try{c=JSON.parse(b);}catch(e){return null;}
  if(!c){return null;}
  let db=getDatabase(initializeApp(c)),
  path='visitor/'+uname,
  visitor=await get(child(ref(db),path))
    .then(r=>r.exists()?r.val():null).catch(e=>null),
  data=visitor?visitor+1:1,
  put=await set(ref(db,path),data)
    .then(r=>true).catch(e=>false);
  return 'https://img.shields.io/badge/visitor-'+data+'-orange.svg?style=for-the-badge';
};


