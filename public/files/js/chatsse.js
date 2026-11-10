/* chatsse.js
 * ~ chat sse (server-sent-events)
 * authored by 9r3i
 * https://github.com/9r3i
 * started at march 12th 2018
 */
var W,D;
var MENU=gebi('leftbar-menu'); /* for leftbar-menu element */
var INDEX=gebi('index'); /* for index element */
var BB=gebi('bodybar');
//var API_BASE_URL='https://9r3i.web.id/api/chatsse/';
var API_BASE_URL='https://sabunjelly.com/api/chatsse/';
//var API_BASE_URL='http://127.0.0.1:9302/gr5/chatsse/server/';
var API_URL=API_BASE_URL+'chatsse.api.php';
var API_TOKEN=null;
var USERS={};
var DATA={};
var SSE=null;
var ATT_URL=API_BASE_URL+'attachments/';
var AUDIO_NOTE=new Audio('audio/receive.mp3');





/* check logged in user */
loader('Loading...');
initBase(function(r){
  loader(false);
  var jp=false;
  var now=new Date();
  try{jp=JSON.parse(atob(r));}catch(e){};
  if(!jp||!jp.access_token||now>jp.expires){
    return loginPage();
  }
  SESSION=jp;
  API_TOKEN=SESSION.access_token;
/* --- SESSION --- 
access_token: "9r3iEpUPmpgsIeRg"
expires: 1519804244000
id: 1
privilege: "admin"
username: "fityan"
 */
  if(W.location.search.match(/^\?print=/,'ig')){
    //return transPrintPage();
  }return startingPage();
},function(e){
  loader(false);
  return loginPage();
});

/* home page - dashboard */
function homePage(){
  menuHide();
  if(SSE&&SSE.readyState<2){
    return chatList();
  }
  INDEX.innerHTML='<div style="text-align:center;padding-top:20px;" id="home-loader">'
    +'<i class="fa fa-pulse fa-spinner"></i> Connecting...</div>';
  return openSSE();
}

/* confirm delete chat */
function confirmDeleteChat(id,fid){
  if(!id){return splash('Error: Invalid request.');}
  confirmX('Delete this chat?',function(yes){
    if(!yes){return;}
    loader('Deleting...');
    api('deleteChat',[id],function(r){
      loader(false);
      var fel=gebi('chat-from-'+fid);
      if(fel){fel.parentElement.removeChild(fel);}
      DATA[fid]=[];
      return splash('Chat has been deleted.');
    },function(e){
      loader(false);
      return splash(e);
    });
  });return false;
}


/* chat */
function chatting(id){
  menuHide();
  if(!id||!USERS[id]){return splash('Error: Invalid ID.');}
  var r=DATA[id]?DATA[id]:[];
  var fu=USERS[id];
  var cti=gebi('chatting-'+id);
  var hasCTI=true;
  if(!cti){
    INDEX.innerHTML='<div id="headfix">'+fu.username
      +'<span id="hf-online-'+fu.id+'" class="chat-user-online"></span>'
      +'</div>'
      +'<div id="chatting-'+id+'" class="chatting"></div>'
      +'<div class="chatting-input">'
      +'<input class="chat-message-input" type="text" id="message" placeholder="Message" />'
      +'</div>';
    cti=gebi('chatting-'+id);
    hasCTI=false;
  }
  var html='',unread=0;
  for(var i in r){
    if(gebi('chat-'+r[i].id)){continue;}
    var cte=ce('div');
    cte.id='chat-'+r[i].id;
    cte.innerHTML='<div class="chat-from chat-from-'+(r[i].from==SESSION.id?'me':'other')+'">'
      +'<div class="chat-from-time">'+datetime(parseInt(r[i].time)*1000).substr(11,5)+'</div>'
      +r[i].message+'</div>';
    cti.appendChild(cte);
    if(r[i].from!=SESSION.id){unread++;}
  }
  var hf=gebi('headfix');
  if(hf){hf.style.display='block';}
  cti.scrollTo({
    top:r.length*1000,
    left:0,
    behavior:'smooth',
  });
  if(unread&&hasCTI){
    AUDIO_NOTE.play();
  }
  var mess=gebi('message');
  if(!mess){return splash('Error: Failed to get element "message".');}
  mess.onfocus=function(e){
    cti.scrollTo({
      top:r.length*1000,
      left:0,
      behavior:'smooth',
    });
    /*
    cti.scrollTop=r.length*1000;
    cti.style.bottom='70px';
    mess.parentElement.style.height='250px';
    */
  };
  mess.onblur=function(e){
    cti.style.bottom='70px';
    mess.parentElement.style.height='50px';
  };
  mess.onkeyup=function(e){
    BB.scrollTop=r.length*1000;
    if(e.keyCode!==13){return;}
    if(mess.value==''){return splash('Error: Message is still empty.');}
    var messages=mess.value;
    mess.value='';
    api('sendChat',[id,messages],function(rr){
      //console.log(rr);
    },function(e){
      mess.value=message;
      return splash(e);
    });
  };
}

/* chat list */
function chatList(){
  menuHide();
  INDEX.innerHTML='';
  if(!DATA){return splash('Error: Failed to get data chat.');}
  var html='';
  for(var ii in DATA){
    var r=DATA[ii];
    if(r.length==0){continue;}
    var fu=USERS[ii];
    var image=fu.picture==''?'user.png':fu.picture;
    var lm=r[r.length-1];
    html+='<tr id="chat-from-'+fu.id+'" onclick="chatting('+fu.id+')" '
        +'oncontextmenu="confirmDeleteChat('+lm.session+','+fu.id+');return false;">'
      +'<td class="chat-list-td-left"><img src="'+ATT_URL+image+'" alt="" /></td>'
      +'<td class="chat-list-td-center">'
        +'<div class="td-username">'+fu.username+'</div>'
        +'<div class="td-message">'+lm.message.substr(0,100)+'</div>'
        +'</td>'
      +'<td class="chat-list-td-right"><div>'+chatTime(parseInt(lm.time)*1000)+'</div></td>'
      +'</tr>';
  }
  INDEX.innerHTML='<table class="chat-list" id="chat-list" cellspacing="0" cellpadding="0" width="100%">'
    +'<tbody>'+html+'</tbody></table>';
}

/* chat time */
function chatTime(time){
  var old=new Date(time);
  if(old.getTime()!==time){return 'Error';}
  var now=new Date();
  if(old.getFullYear()==now.getFullYear()){
    if(old.getMonth()==now.getMonth()){
      if(old.getDate()==now.getDate()){
        if(old.getHours()==now.getHours()){
          var min=now.getMinutes()-old.getMinutes();
          if(old.getMinutes()==now.getMinutes()){
            return 'Just now';
          }return min+' minute'+(min>1?'s':'')+' ago';
        }return 'Today at '+old.toTimeString().substr(0,5);
      }else if(now.getDate()-old.getDate()==1){
        return 'Yesterday at '+old.toTimeString().substr(0,5);
      }else if(now.getDate()-old.getDate()<7){
        return old.toDateString().substr(0,3)+old.toTimeString().substr(0,5);
      }return old.getDate()+' '+old.toDateString().substr(4,3)+' at '+old.toTimeString().substr(0,5);
    }return old.getDate()+' '+old.toDateString().substr(4,3);
  }return old.toDateString().substr(4,11);
}


/* connect to sse server */
function openSSE(){
  if(SSE&&SSE.readyState<2){return;}
  SSE=new EventSource(API_URL+'?sse&access_token='+API_TOKEN);
  console.log(SSE);
  var hl=gebi('home-loader');
  SSE.onopen=function(e){
    //splash('Connected.');
    if(hl){hl.innerHTML='';}
  };
  SSE.onmessage=function(e){
    console.log(e);
  };
  SSE.onerror=function(e){
    splash('Error: Failed to connect.');
    if(hl){
      hl.innerHTML='<button class="submit-load-ayat" onclick="homePage()()">'
        +'<i class="fa fa-refresh"></i> Reload</button>';
    }
  };
  SSE.addEventListener('receive',function(r){
    console.log('receive');
    var data=false;
    data=JSON.parse(r.data);
    if(!data){return;}
    var unread=0;
    for(var i in data.chats){
      if(data.chats[i].from!==SESSION.id){unread++;}
      var kk=data.chats[i].from==SESSION.id?data.chats[i].to:data.chats[i].from;
      if(!DATA[kk]){
        DATA[kk]=[];
      }DATA[kk].push(data.chats[i]);
    }
    //console.log(data);
    var hl=gebi('home-loader');
    var cl=gebi('chat-list');
    var ct=gebcn('chatting');
    if(hl||cl){
      if(unread&&!hl){AUDIO_NOTE.play();}
      return chatList();
    }
    if(ct){return chatting(ct[0].id.substr(9));}
  },false);
  SSE.addEventListener('online',function(r){
    var data=false;
    try{data=JSON.parse(r.data);}catch(e){}
    if(!data){return;}
    for(var i in data.users){
      USERS[data.users[i].id]=data.users[i];
    }
    //console.log(data);
    return onlineUsers(data.users);
  },false);
}

/* disconnect sse connection */
function closeSSE(){
  menuHide();
  INDEX.innerHTML='';
  if(SSE&&SSE.readyState<2){
    SSE.close();
  }return splash('Disconnected.');
}

/* right-bar online users */
function onlineUsers(r){
  var RB=gebi('rightbar-content');
  if(!RB||!r){return;}
  var html='';
  for(var i in r){
    if(r[i].id==SESSION.id){continue;}
    var d=new Date(),dt=d.getTime()/1000;
    var online=parseInt(r[i].online)+5>dt
      ?'<i class="fa fa-circle" style="color:#7b3;"></i> Online'
      :chatTime(parseInt(r[i].online)*1000);
    var image=r[i].picture==''?'user.png':r[i].picture;
    html+='<tr id="user-'+r[i].id+'" onclick="chatting('+r[i].id+')">'
      +'<td class="rb-user-td-left"><img src="'+ATT_URL+image+'" alt="" /></td>'
      +'<td class="rb-user-td-center">'
        +'<div class="td-username">'+r[i].username+'</div>'
        +'<div class="td-online">'+online+'</div>'
      +'</td>'
      +'</tr>';
    var hfo=gebi('hf-online-'+r[i].id);
    if(hfo){hfo.innerHTML=' &#8213; '+online;}
  }RB.innerHTML='<table class="rb-users" width="250px" cellspacing="0" cellpadding="0">'
    +'<tbody>'+html+'</tbody></table>';
}




/* add user */
function addUser(){
  menuHide();
  var n=1;
  INDEX.innerHTML='';
  loader('Preparing...');
  api('getUsers',[n],function(rr){
    loader(false);
    for(var i in rr){
      USERS[rr[i].id]=rr[i];
    }
    if(!USERS[n]){return splash('Error: Member is not available.');}
    var r=USERS[n],data={};
    var options={
      father:['<option value="0">-</option>'],
      mother:['<option value="0">-</option>'],
      spouse:{
        male:['<option value=""></option>'],
        female:['<option value=""></option>']
      }
    };
    for(var i in rr){
      var tf=getNameFromID(rr[i].father);
      var tm=getNameFromID(rr[i].mother);
      var bin=rr[i].gender==1?'bin':'binti';
      var parent=tf!=''?' '+bin+' '+tf:tm!=''?' '+bin+' '+tm:'';
      if(rr[i].gender==1){
        options.father.push('<option value="'+rr[i].id+'">'+rr[i].name+parent+'</option>');
      }else{
        options.mother.push('<option value="'+rr[i].id+'">'+rr[i].name+parent+'</option>');
      }
      if(rr[i].gender==1){
        options.spouse.male.push('<option value="'+rr[i].id+'">'+rr[i].name+parent+'</option>');
      }else{
        options.spouse.female.push('<option value="'+rr[i].id+'">'+rr[i].name+parent+'</option>');
      }
    }
    var name='Add Member';
    var title='<div class="items-title">'+name+'</div><div id="headfix">'+name+'</div>';
    var head='<tr><th style="width:80px;max-width:80px;min-width:80px;">Key</th>'
      +'<th style="width:99%;max-width:99%;min-width:99%;">Value</th></tr>';
    var html='';
    for(var i in r){
      if(i=='id'){continue;}
      var val='<input value="" class="input-item-search" id="'+i+'" placeholder="'+ucfirst(i)+'" />';
      if(i=='gender'){
        val='<select id="'+i+'" class="select-item">'
          +'<option value="1">Male</option>'
          +'<option value="2">Female</option>'
          +'</select>';
      }
      else if(i=='mother'){
        val='<select class="select-item" id="'+i+'">'+options.mother.join('')+'</select>';
      }
      else if(i=='father'){
        val='<select class="select-item" id="'+i+'">'+options.father.join('')+'</select>';
      }
      else if(i=='spouse'){
        val='<select class="select-item" id="'+i+'">'+options.spouse.female.join('')+'</select>';
      }
      else if(i=='privilege'){
        if(isAdmin()){
          val='<select class="select-item" id="'+i+'">'
            +(SESSION.privilege=='master'?'<option value="master">Master</option>':'')
            +'<option value="admin" '+(r.privilege=='admin'?'selected="selected"':'')+'>Admin</option>'
            +'<option value="user" '+(r.privilege=='user'?'selected="selected"':'')+'>User</option>'
            +'</select>';
        }else{
          val=r[i];
        }
      }
      else if(i=='id'){
        val=r[i];
      }
      var k=i=='id'?'ID':ucfirst(i);
      if(i=='order'){
        k='Family Order';
        val='<input value="0" class="input-item-search" id="'+i+'" placeholder="Family Order" />';
      }
      
      html+='<tr><td class="td-right">'+k+'</td>'
        +'<td>'+val+'</td></tr>';
      if(i!='id'&&i!='privilege'){
        data[i]=r[i];
      }else if(i=='privilege'&&isAdmin()){
        data[i]=r[i];
      }
    }
    var imenu='<div class="items-menu">'
      +'<button class="submit-load-ayat" id="submit-save">'
      +'<i class="fa fa-save"></i> Save</button>'
      +'</div>';
    INDEX.innerHTML=title
      +'<div class="items-table-parent">'
      +'<table class="items-table"><thead>'
      +head+'<tbody id="tbody">'+html+'</tbody></table></div>'+imenu;
    var save=gebi('submit-save');
    var spouseg=gebi('spouse');
    var genderg=gebi('gender');
    if(!save||!spouseg||!genderg){return splash('Some error has been occured.');}
    genderg.onchange=function(e){
      if(this.value==1){
        spouseg.innerHTML=options.spouse.female.join('');
      }else{
        spouseg.innerHTML=options.spouse.male.join('');
      }
    };
    save.onclick=function(e){
      var ndata={};
      for(var i in data){
        var el=gebi(i);
        if(!el){return splash('Error: Failed to get element "'+i+'".');}
        ndata[i]=el.value.trim();
      }
      if(ndata.username!==''&&!ndata.username.match(/^[a-z0-9]+$/g)){
        return splash('Error: Invalid username input.\r\nPlease, use alphabetical value.');
      }
      loader('Saving...');
      api('addUser',[JSON.stringify(ndata)],function(res){
        loader(false);
        splash('Member information has been saved.');
        return usersPage();
      },function(e){
        loader(false);
        return splash(e);
      });
    };
  },function(e){
    loader(false);
    return splash(e);
  });
}
/* edit or user update */
function editUser(n){
  menuHide();
  if(!n){return splash('Error: Invalid parameter id.');}
  INDEX.innerHTML='';
  loader('Loading...');
  api('getUsers',[n],function(rr){
    loader(false);
    for(var i in rr){
      USERS[rr[i].id]=rr[i];
    }
    if(!USERS[n]){return splash('Error: User is not available.');}
    var r=USERS[n],data={};
    var name='Edit User #'+n;
    var title='<div class="items-title">'+name+'</div><div id="headfix">'+name+'</div>';
    var head='<tr><th style="width:80px;max-width:80px;min-width:80px;">Key</th>'
      +'<th style="width:99%;max-width:99%;min-width:99%;">Value</th></tr>';
    var html='';
    for(var i in r){
      var val='<input value="'+r[i]+'" class="input-item-search" id="'+i+'" placeholder="'+ucfirst(i)+'" />';
      if(i=='type'||i=='time'||i=='online'||i=='members'||i=='owner'){continue;}
      else if(i=='privilege'){
        if(isAdmin()){
          val='<select class="select-item" id="'+i+'">'
            +(SESSION.privilege=='master'?'<option value="master">Master</option>':'')
            +'<option value="admin" '+(r.privilege=='admin'?'selected="selected"':'')+'>Admin</option>'
            +'<option value="user" '+(r.privilege=='user'?'selected="selected"':'')+'>User</option>'
            +'</select>';
        }else{
          val=ucfirst(r[i]);
        }
      }
      else if(i=='id'||i=='username'){
        val=r[i];
      }
      var k=i=='id'?'ID':ucfirst(i);
      
      html+='<tr><td class="td-right">'+k+'</td>'
        +'<td>'+val+'</td></tr>';
      if(i!='id'&&i!='privilege'&&i!='username'){
        data[i]=r[i];
      }else if(i=='privilege'&&isAdmin()){
        data[i]=r[i];
      }
    }
    var imenu='<div class="items-menu">'
      +'<button class="submit-load-ayat" id="submit-save">'
      +'<i class="fa fa-save"></i> Save</button>'
      +'</div>';
    INDEX.innerHTML=title
      +'<div class="items-table-parent">'
      +'<table class="items-table"><thead>'
      +head+'<tbody id="tbody">'+html+'</tbody></table></div>'+imenu;
    var save=gebi('submit-save');
    if(!save){return splash('Some error has been occured.');}
    save.onclick=function(e){
      var ndata={};
      for(var i in data){
        var el=gebi(i);
        if(!el){return splash('Error: Failed to get element "'+i+'".');}
        ndata[i]=el.value.trim();
      }
      loader('Saving...');
      api('updateUser',[r.id,JSON.stringify(ndata)],function(res){
        loader(false);
        splash('Member information has been saved.');
        return userDetail(r.id);
      },function(e){
        loader(false);
        return splash(e);
      });
    };
  },function(e){
    loader(false);
    return splash(e);
  });
}
/* user detail */
function userDetail(n){
  menuHide();
  if(!n){return splash('Error: Invalid parameter id.');}
  INDEX.innerHTML='';
  loader('Loading...');
  api('getUsers',[n],function(rr){
    loader(false);
    for(var i in rr){
      USERS[rr[i].id]=rr[i];
    }
    if(!USERS[n]){return splash('Error: User is not available.');}
    var r=USERS[n];
    var name='Profile #'+n+' - '+r.username;
    var title='<div class="items-title">'+name+'</div><div id="headfix">'+name+'</div>';
    var head='<tr><th style="width:80px;max-width:80px;min-width:80px;">Key</th>'
      +'<th style="width:99%;max-width:99%;min-width:99%;">Value</th></tr>';
    var html='';
    for(var i in r){
      var val=r[i];
      if(i=='type'){
        val=r[i]==2?'Group':'Personal';
      }
      else if(i=='privilege'){val=ucfirst(val);}
      else if(i=='time'||i=='online'){val=datetime(parseInt(val)*1000);}
      else if(i=='picture'){
        val='<img src="'+ATT_URL+r[i]+'" alt="" style="max-width:100px;max-height:100px;" />';
      }
      var k=i=='id'?'ID':ucfirst(i);
      if(r.type==1&&(i=='owner'||i=='members')){continue;}
      else if(r.type==2&&i=='owner'){
        val=USERS[r.owner].username;
      }
      else if(r.type==2&&i=='members'){
        var jd=false,res=[];
        try{jd=JSON.parse(r.members);}catch(e){}
        if(jd){for(var ii in jd){
          res.push(USERS[jd[ii]].username);
        }}val=res.join('\r\n');
      }
      html+='<tr><td class="td-right">'+k+'</td>'
        +'<td>'+val+'</td></tr>';
    }
    var imenu='';
    INDEX.innerHTML=title
      +'<div class="items-table-parent">'
      +'<table class="items-table"><thead>'
      +head+'<tbody id="tbody">'+html+'</tbody></table></div>'+imenu;
  },function(e){
    loader(false);
    return splash(e);
  });
}






/* my account - logged in detail */
function myaccount(){
  menuHide();
  var name='My Account';
  var title='<div class="home-title">'+name+'</div><div id="headfix">'+name+'</div>';
  var html='<div class="each" style="background-color:#fff;">'
    +'<div class="each-config" '
    +'style="border-bottom:1px dotted #bbb;margin:10px 10px 20px;padding-bottom: 20px;">'
    +'<span class="each-label">Username: <span>'
    +'<span class="each-label" style="color:red;font-weight:bold;">'+SESSION.username+'<span>'
    +'<span class="each-label" style="margin-left:7px;">('+SESSION.privilege+')<span>'
    +'</div>'
    +'<div class="input-text" id="input-password">'
    +'<div class="label"><label for="password">Password</label></div>'
    +'<input class="input-clean" type="password" id="password" />'
    +'</div>'
    +'<div style="text-align:center;">'
    +'<input class="submit-load-ayat" type="submit" value="Submit" id="submit" />'
    +'</div></div>';
  INDEX.innerHTML=title+html;
  inputText('input-password');
  var pass=gebi('password');
  var submit=gebi('submit');
  if(submit&&pass){
    submit.onclick=function(e){
      if(pass.value==''){
        return splash('Error: Password is still empty.');
      }
      loader('Loading...');
      api('editPassword',[SESSION.id,pass.value],function(r){
        loader(false);
        splash('Password has been updated.');
        return myaccount();
      },function(e){
        loader(false);
        return splash(e);
      });
    };
  }
}
/* my access logs */
function mylogs(id,m){
  menuHide();
  id=id?id:SESSION.id;
  var uname=USERS[id]?USERS[id].username:SESSION.username;
  var upriv=USERS[id]?USERS[id].privilege:SESSION.privilege;
  INDEX.innerHTML='';
  var method=m&&isAdmin()?'getAllLogs':'getLogs';
  var name='Access Logs #'+id+' ('+uname+'/'+upriv+')';
  var title='<div class="items-title">'+name+'</div><div id="headfix">'+name+'</div>';
  var imenu='';
  var head='<tr><th>Method</th><th>Args</th><th>Time</th></tr>';
  if(SESSION.privilege=='master'||m){
    head='<tr><th>Method</th><th>Args</th><th>Time</th><th>UID</th></tr>';
    var imenu='<div class="items-menu">'
      +'<button class="submit-load-ayat" onclick="deleteAllLogs()">'
      +'<i class="fa fa-trash"></i> Delete All Access Logs</button>'
      +'</div>';
  }
  var html='<tr>'
    +'<td><input class="input-item-search" placeholder="Search..." id="item-search-method" /></td>'
    +'<td><input class="input-item-search" placeholder="Search..." id="item-search-args" /></td>'
    +'<td><input class="input-item-search" placeholder="Search..." id="item-search-time" /></td>'
    +(SESSION.privilege=='master'||m?
       '<td><input class="input-item-search" placeholder="Search..." id="item-search-uid" /></td>':'')
    +'</tr>';
  INDEX.innerHTML=title+imenu
    +'<div class="items-table-parent">'
    +'<table class="items-table"><thead>'
    +head+'</thead><tbody id="logbody">'+html+'</tbody></table></div>';
  getLogs(id,null,null,m);
}
/* get logs */
function getLogs(id,s,l,m){
  menuHide();
  s=s?parseInt(s):0;
  l=l?parseInt(l):25;
  var lbm=gebi('logbody-more');
  if(lbm){lbm.parentElement.removeChild(lbm);}
  var lb=gebi('logbody');
  if(!lb){return splash('Error: Failed to get element "logbody".');}
  var lbl=ce('tr');
  lbl.id='logbody-loader';
  lbl.innerHTML='<td colspan="'+(SESSION.privilege=='master'||m?4:3)+'" style="text-align:center;">'
    +'<i class="fa fa-pulse fa-spinner"></i> Loading...</td>';
  lb.appendChild(lbl);
  var method=m&&isAdmin()?'getAllLogs':'getLogs';
  id=id?id:SESSION.id;
  api(method,[id,s,l],function(r){
    lb.removeChild(lbl);
    var html='';
    for(var i in r){
      var d=new Date(parseInt(r[i].time)*1000);
      var time=d.toDateString()+' - '+d.toTimeString().substr(0,8);
      html+='<tr>'
        +'<td class="data-method">'+r[i].method+'</td>'
        +'<td class="data-args">'+parseLogArgs(r[i].args)+'</td>'
        +'<td class="data-time">'+time+'</td>'
        +(SESSION.privilege=='master'||m?'<td>'+r[i].uid+'</td>':'')
        +'</tr>';
    }lb.innerHTML+=html;
    if(r.length>=l){
      lb.innerHTML+='<tr id="logbody-more"><td colspan="'+(SESSION.privilege=='master'||m?4:3)+'" '
        +'style="text-align:center;">'
        +'<button class="submit-load-ayat" onclick="getLogs('+id+','+(s+l)+','+l+','+(m?'true':'false')+')">'
        +'<i class="fa fa-download"></i> Load More</button>'
        +'</td></tr>';
    }
    itemSearch('method');
    itemSearch('args');
    itemSearch('time');
    if(SESSION.privilege=='master'||m){
      itemSearch('uid');
    }
  },function(e){
    lb.removeChild(lbl);
    return splash(e);
  });
}
/* parse log args */
function parseLogArgs(args,k){
  var jt=false,res=[],c=0;
  k=k?parseInt(k):0;
  if(args===null){return 'NULL';}
  if(typeof args==='string'){
    try{jt=JSON.parse(args);}catch(e){}
    if(!jt){return args.toString();}
  }
  else if(typeof jt==='string'){return jt.toString();}
  else if(typeof jt==='number'){return jt.toString();}
  else if(args===null){return 'NULL';}
  else if(typeof args==='object'){jt=args;}
  for(var i in jt){
    var val=jt[i];
    var ik='';
    if(typeof val==='object'&&object_length(val)>0){
      val="\r\n"+parseLogArgs(jt[i],(k+1));
      ik='(object) ';
    }
    var ht=false;
    try{ht=JSON.parse(val);}catch(e){}
    if(typeof val==='string'&&ht&&typeof ht==='object'){
      val="\r\n"+parseLogArgs(jt[i],(k+1));
      ik='(object) ';
    }
    if(val===null){val='NULL';}
    res.push('    '.repeat(k)+i+': '+ik+val.toString());
  }return res.join("\r\n");
}
/* delete all logs */
function deleteAllLogs(){
  menuHide();
  if(!isAdmin()){return splash('Error: Have no privilege to this function.');}
  confirmX('Are you sure want to delete all these logs?',function(yes){
    if(!yes){return;}
    loader('Loading...');
    api('deleteAllLogs',[],function(r){
      loader(false);
      splash('All access logs have been deleted.');
      return mylogs(null,true);
    },function(e){
      loader(false);
      return splash(e);
    });
  },'Delete All Logs');
}




/* item search */
function itemSearch(id){
  if(!id){return;}
  var dn=gebcn('data-'+id);
  var isn=gebi('item-search-'+id);
  if(!isn||!dn){return;}
  isn.onkeyup=function(e){
    var i=dn.length,c=0;
    while(i--){
      if(dn[i].innerText.match(new RegExp(this.value,'ig'))){
        dn[i].parentElement.style.removeProperty('display');
        c++;
      }else{
        dn[i].parentElement.style.display='none';
      }
    }splash('Matched: '+c+' item'+(c>1?'s':''));
  };
}
/* logout */
function logout(ask){
  menuHide();
  if(!ask){
    return confirmX('Do you want to logout?',function(yes){
      if(!yes){return;}
      return logout(true);
    },'Logout','Yes','No');
  }
  loader('Logging out...');
  var op=new fs();
  if(op.on){
    var fname=op.iapp+'session.txt';
    op.delete(fname,function(rr){
      W.location.reload();
      return;
    },function(e){
      loader(false);
      return splash(e);
    });
    return;
  }
  fs_delete('session.txt',function(rr){
    W.location.reload();
    return;
  },function(e){
    loader(false);
    return splash(e);
  });
}
/* login page - unlogged in */
function loginPage(){
  var headbar=gebi('headbar');
  if(headbar){headbar.style.visibility='hidden';}
  var sb=gebi('statusbar');
  if(sb){sb.style.visibility='hidden';}
  INDEX.style.maxWidth='270px';
  INDEX.style.margin='50px auto 270px';
  INDEX.style.border='1px solid #bbb';
  INDEX.style.boxShadow='0px 0px 5px 3px #999';
  if(window.StatusBar){StatusBar.hide();}
  BB=gebi('bodybar');
  BB.style.top='0px';
  var html='<div class="each-header">Login</div>'
    +'<div class="each" style="background-color:#fff;"><div class="input-text" id="input-username">'
    +'<div class="label"><label for="username">Username</label></div>'
    +'<input class="input-clean" type="text" id="username" style="text-transform:lowercase;" />'
    +'</div>'
    +'<div class="input-text" id="input-password">'
    +'<div class="label"><label for="password">Password</label></div>'
    +'<input class="input-clean" type="password" id="password" />'
    +'</div>'
    +'<div style="text-align:center;">'
    +'<button class="submit-load-ayat" id="submit"><i class="fa fa-sign-in"></i> Login</button>'
    +'</div></div>';
  INDEX.innerHTML=html;
  inputText('input-username');
  inputText('input-password');
  var input=gebi('username');
  var password=gebi('password');
  var submit=gebi('submit');
  if(submit&&input&&password){
    submit.onclick=function(e){
      return loginPageSubmit(input,password);
    };
    password.onkeyup=function(e){
      if(e.keyCode==13){
        return loginPageSubmit(input,password);
      }
    };
    input.onkeyup=function(e){
      if(e.keyCode==13){
        return loginPageSubmit(input,password);
      }
    };
  }
  function loginPageSubmit(input,password){
    if(input.value==''){
      return splash('Error: Username is still empty.');
    }
    var username=input.value.toLowerCase();
    if(!username.match(/^[a-z0-9]+$/ig)){
      return splash('Error: Invalid username.');
    }
    if(password.value==''){
      return splash('Error: Password is still empty.');
    }
    loader('Loading...');
    api('login',[username,password.value],function(r){
      loader(false);
      var op=new fs();
      if(op.on){
        var fname=op.iapp+'session.txt';
        op.write(fname,btoa(JSON.stringify(r)),0,function(rr){
          splash('Logged in.');
          INDEX.parentElement.removeChild(INDEX);
          loader('Redirecting...');
          setTimeout(function(){
            W.location.reload();
          },2000);
          return;
        },function(e){
          return splash('Error: Failed to write session.');
        });return;
      }
      fs_write('session.txt',btoa(JSON.stringify(r)),null,function(rr){
        splash('Logged in.');
        INDEX.parentElement.removeChild(INDEX);
        W.location.reload();
        return;
      },function(e){
        return splash('Error: Failed to write session.');
      });
    },function(e){
      loader(false);
      return splash(e);
    });
  }
}
/* starting page - logged in */
function startingPage(){
  var headbar=gebi('headbar');
  if(headbar){headbar.style.visibility='visible';}
  var sb=gebi('statusbar');
  if(sb){sb.style.visibility='visible';}
  /* right menu */
  var rbar=gebcn('rmenu-button');
  if(rbar[0]&&rbar[0].children.length==6){
    //rbar[0].style.visibility='hidden';
  }
  /* username */
  var ue=gebi('user-email');
  if(ue){ue.innerHTML=SESSION.username+' ('+SESSION.privilege+')';}
  /* initial menu setup */
  initMenu();
  /* menu-button event */
  document.addEventListener("menubutton",function(e){
    e.preventDefault();
    return menuShow();
  },false);
  /* body bar scrolling */
  BB.onscroll=function(e){
    var ind=gebi('index');
    var hf=gebi('headfix');
    if(hf&&ind.children[0]){
      var ic=ind.children[0];
      var ih=ic.offsetHeight;
      hf.style.display=BB.scrollTop>ih?'block':'none';
    }
  };
  //return usersPage();
  return homePage();
}
/* initial base */
function initBase(cb,er){
  cb=typeof cb==='function'?cb:function(){};
  er=typeof er==='function'?er:function(){};
  var op=new fs();
  if(op.on){
    var fname=op.iapp+'session.txt';
    op.read(fname,0,null,cb,er);
    return;
  }fs_read('session.txt',0,null,cb,er);
}
/* initial menu */
function initMenu(){
  if(!SESSION||!SESSION.privilege){return false;}
  /* setup menu */
  var menu=[
    {"href":"homePage()","title":"Chats","name":"Chats","icon":"wechat","color":"#555"},
    {"href":"closeSSE()","title":"Disconnect","name":"Disconnect","icon":"circle","color":"#b33"},
  ];
  menu.push({"separator":true});
  menu.push({"href":"userDetail("+SESSION.id+")","title":"My Profile","name":"My Profile","icon":"child","color":"#555"});
  menu.push({"href":"myaccount()","title":"My Account","name":"My Account","icon":"user","color":"#555"});
  menu.push({"href":"mylogs()","title":"My Logs","name":"My Logs","icon":"history","color":"#555"});
  if(isAdmin()){
    menu.push({"separator":true});
    menu.push({"href":"addUser()","title":"Add Member","name":"Add Member","icon":"user-plus","color":"#555"});
    menu.push({"href":"mylogs(null,true)","title":"All Access Logs","name":"All Access Logs","icon":"history","color":"#555"});
  }
  menu.push({"separator":true});
  menu.push({"href":"logout()","title":"Logout","name":"Logout","icon":"sign-out","color":"#555"});
  menu.push({"href":"quitApp()","title":"Close","name":"Close","icon":"power-off","color":"#b33"});
  loadMenu(menu);
}



/* app api */
function api(method,args,cb,er){
  var data={api:btoa(JSON.stringify({method:method,args:args}))};
  if(API_TOKEN){data['access_token']=API_TOKEN;}
  W.post(API_URL,function(r){
    if(r.toString().match(/^error/ig)){
      return typeof er==='function'?er(r):false;
    }if(typeof cb==='function'){return cb(r);}
    return false;
  },data,false,null,null,null,er);
}
/* is admin privilege */
function isAdmin(){
  if(!SESSION||!SESSION.privilege){return false;}
  return SESSION.privilege=='admin'||SESSION.privilege=='master'?true:false;
}
/* kdb execute */
function kdbExec(host,query,cb,er){
  return kdb(host,{
    user:'master',
    pass:'luthfie',
    db:'chat',
    timezone:'Asia/Jakarta',
    queries:query
  },cb,er);
}


