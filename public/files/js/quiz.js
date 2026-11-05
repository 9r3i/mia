/* quiz.js -- requires: mia.js (mia:client) */
;const quiz=function(){
this.version='1.0.0';
this.host='';
this.app=null;
/* routers */
this.routers=[
  ['','Home',async function(query,app,env){
    /* load data */
    app.element('div',{'class':'content-loader'}).appendTo(GLOBALS.content);
    let json=await app.get('files/db/topic.json'),
    data=app.parseJSON(json),
    posts=Array.isArray(data)?data:[];
    posts.reverse();
    GLOBALS.content.html();
    /* search form */
    app.searchForm().appendTo(GLOBALS.content);
    /* post loop */
    for(let post of posts){
      app.element('div',{
        'class':'post',
        'data-title':post.title,
      },[
        app.element('div',{'class':'post-title'})
          .html(post.title),
        app.element('div',{'class':'post-time'})
          .html(app.parseDatetime(parseInt(post.time,10))),
        app.element('div',{'class':'post-button'},[
          app.element('button',{
            'class':'button-tosca',
            'data-id':post.id
          }).text('View').clickOn(function(){
            app.go('topic.js?id='+this.dataset.id);
          }),
          app.element('span',{
            id:'qspan-'+post.id
          }).text('Loading...'),
        ]),
      ]).appendTo(GLOBALS.content);
    }
    for(let post of posts){
      let path='files/db/quiz/'+post.id+'.json',
      json=await app.get(path),
      data=app.parseJSON(json),
      qdata=Array.isArray(data)?data:[],
      span=document.getElementById('qspan-'+post.id),
      text=qdata.length==0?'No question yet'
        :qdata.length+' question'
          +(qdata.length>1?'s':'');
      if(span){span.text(text);}
    }
    
    
    /**
    app.element('pre').content(
      app.likeJSON(posts,2)
    ).appendTo(GLOBALS.content);
    //*/
    
    //await app.alert(app.likeJSON({data,res,json},3));
  }],
  /* score page */
  ['score.js','Score',async function(query,app,env){
    /* load data */
    app.element('div',{'class':'content-loader'}).appendTo(GLOBALS.content);
    let json=await app.get('files/db/score.json'),
    data=app.parseJSON(json),
    posts=typeof data==='object'&&data!==null?data:{};
    GLOBALS.content.html();
    /* search form */
    app.searchForm().appendTo(GLOBALS.content);
    
    
  }],
  /* exam page */
  ['exam.js','Exam',async function(query,app,env){
    /* check the query id */
    if(!query.hasOwnProperty('id')){
      return app.error('Not Found',404);
    }
    /* check the user id */
    if(!app.key||!app.user){
      let next=encodeURIComponent('exam.js?id='+query.id);
      return app.go('login.js?next='+next);
    }
    app.element('div',{'class':'content-loader'}).appendTo(GLOBALS.content);
    
    
  },{
    load:async function(app,tid){
      /* question */
      let result={
        quiz:[],
        topic:null,
        score:null,
        exam:null
      },
      json=await app.get('files/db/quiz/'+tid+'.json'),
      data=app.parseJSON(json),
      posts=Array.isArray(data)?data:[];
      result.quiz=posts;
      /* topic */
      json=await app.get('files/db/topic.json'),
      data=app.parseJSON(json),
      posts=Array.isArray(data)?data:[];
      for(let post of posts){
        if(post.id==tid){
          result.topic=post;
          break;
        }
      }
      /* score */
      json=await app.get('files/db/score.json'),
      data=app.parseJSON(json),
      posts=typeof data==-'object'&&data!==null?data:{};
      for(let post in posts){
        if(post==tid){
          result.score=post;
          break;
        }
      }
      /* result */
      return result;
    },
  }],
  /* topic page */
  ['topic.js','Topic',async function(query,app,env){
    /* check the query id */
    if(!query.hasOwnProperty('id')){
      return app.error('Not Found',404);
    }
    /* load data */
    app.element('div',{'class':'content-loader'}).appendTo(GLOBALS.content);
    let json=await app.get('files/db/topic.json'),
    data=app.parseJSON(json),
    posts=Array.isArray(data)?data:[],
    key=posts.findIndex(r=>r.id==query.id),
    post=key>=0?posts[key]:false;
    GLOBALS.content.html();
    if(!post){
      let text='404 - Not Found';
      app.title(text);
      app.element('h1').text('Error: '+text).appendTo(GLOBALS.content);
      return;
    }
    app.title(post.title);
    app.element('h3').text(post.title).appendTo(GLOBALS.content);
    app.element('div',{
      'class':'post-author',
    }).text(
      'Authored by '+post.username+' '
    ).appendTo(GLOBALS.content);
    app.element('div').text(post.description).appendTo(GLOBALS.content);
    let qspan=app.element('div',{
      id:'qspan-'+post.id,
    }).text('Loading...').appendTo(GLOBALS.content),
    path='files/db/quiz/'+post.id+'.json';
    json=await app.get(path),
    data=app.parseJSON(json),
    qdata=Array.isArray(data)?data:[],
    text=qdata.length==0?'No question yet'
      :qdata.length+' question'
        +(qdata.length>1?'s':'');
    qspan.text('\nTotal: '+text);
    /* admin button */
    let button=app.element('button',{
      'class':'button-light-blue post-edit',
      'data-id':post.id,
    }).text('Edit').clickOn(function(){
      this.mia.go('edit.js?id='+this.dataset.id);
    }),
    exam=app.element('button',{
      'class':'button-red post-edit',
      'data-id':post.id,
    }).text('Exam').clickOn(async function(){
      let text='Do you want to exam this topic?\n\n'
        +'Warning! This is one time ticket.\n'
        +'You won\'t be able to do this exam twice.',
      yes=await app.confirm(text);
      if(!yes){return;}
      this.mia.go('exam.js?id='+this.dataset.id);
    });
    if(app.key&&app.user==post.username){
      GLOBALS.content.append(button);
    }
    if(app.user!=post.username){
      GLOBALS.content.append(exam);
    }
  }],
  /* question page -- topic */
  ['question.js','Question',async function(query,app,env){
    if(!app.key){
      return app.go('login.js');
    }
    /* check the query tid */
    if(!query.hasOwnProperty('tid')){
      return app.error('Not Found',404);
    }
    app.element('div',{'class':'content-loader'}).appendTo(GLOBALS.content);
    let def={
      id:1,
      q:'',
      a:'',
      b:'',
      c:'',
      d:'',
      x:'a', 
      tid:query.tid,
      method:'add',
      table:'quiz',
    },
    data=await env.load(app,query.tid);
    GLOBALS.content.html();
    if(data.topic===null||data.topic.username!=app.user){
      return app.error('Unauthorized',401);
    }
    /* find new id */
    if(query.hasOwnProperty('id')){
      for(let post of data.quiz){
        if(query.id==post.id){
          def=post;
          def.method='edit';
          def.table='quiz';
          def.tid=query.tid;
          break;
        }
      }
      app.title('Edit Question #'+def.id);
      GLOBALS.header.text('Edit Question #'+def.id);
    }else{
      let increment=Math.min(Math.max(Math.ceil(Math.random()*9),1),9);
      for(let post of data.quiz){
        if(parseInt(post.id)>=def.id){
          def.id=parseInt(post.id)+increment;
        }
      }
      app.title('New Question #'+def.id);
      GLOBALS.header.text('New Question #'+def.id);
    }
    /* set the form */
    let select=app.element('select',{name:'x'}),
    form=app.element('div',{'class':'editor'},[
      app.element('input',{
        type:'hidden',
        name:'id',
        value:def.id,
      }),
      app.element('input',{
        type:'hidden',
        name:'tid',
        value:def.tid,
      }),
      app.element('input',{
        type:'hidden',
        name:'method',
        value:def.method,
      }),
      app.element('input',{
        type:'hidden',
        name:'table',
        value:def.table,
      }),
      app.element().text('Question'),
      app.element('textarea',{
        name:'q',
        placeholder:'Question',
        row:3,
        id:'editor-content',
        style:'height:5rem;',
      }).content(def.q),
      app.element().text('A'),
      app.element('input',{
        type:'text',
        name:'a',
        maxlength:100,
        placeholder:'...',
        value:def.a,
      }),
      app.element().text('B'),
      app.element('input',{
        type:'text',
        name:'b',
        maxlength:100,
        placeholder:'...',
        value:def.b,
      }),
      app.element().text('C'),
      app.element('input',{
        type:'text',
        name:'c',
        maxlength:100,
        placeholder:'...',
        value:def.c,
      }),
      app.element().text('D'),
      app.element('input',{
        type:'text',
        name:'d',
        maxlength:100,
        placeholder:'...',
        value:def.d,
      }),
      app.element().text('Answer'),
      select,
      app.element().text(' . '),
    ]).appendTo(GLOBALS.content),
    save=app.element('button',{'class':'button-blue'})
      .text('Save').appendTo(form);
    save.dataset.tid=query.tid;
    for(let i of ['a','b','c','d']){
      let opt=app.element('option',{value:i})
        .content(i.toUpperCase()).appendTo(select);
      if(i==def.x){
        opt.selected='selected';
      }
    }
    /* save the post */
    save.clickOn(async function(e){
      let stext=this.innerText;
      this.disabled=true;
      this.text('Saving...');
      let data=app.formSerialize(),
      json=await app.post('quiz',data),
      res=app.parseJSON(json);
      this.disabled=false;
      this.text(stext);
      if(!res){
        let pre=app.element('pre').text('Failed to save!');
        form.insertBefore(pre,save);
        await app.sleep(2000);
        pre.remove();
        return;
      }
      if(!query.hasOwnProperty('id')){
        app.go('edit.js?id='+this.dataset.tid);
        return;
      }
      let pre=app.element('pre').text('Saved!');
      form.insertBefore(pre,save);
      await app.sleep(2000);
      pre.remove();
    });
  },{
    load:async function(app,tid){
      let result={quiz:[],topic:null},
      json=await app.get('files/db/quiz/'+tid+'.json'),
      data=app.parseJSON(json),
      posts=Array.isArray(data)?data:[];
      result.quiz=posts;
      json=await app.get('files/db/topic.json'),
      data=app.parseJSON(json),
      posts=Array.isArray(data)?data:[];
      for(let post of posts){
        if(post.id==tid){
          result.topic=post;
          break;
        }
      }
      return result;
    },
  }],
  /* edit page -- topic */
  ['edit.js','Edit',async function(query,app,env){
    if(!app.key){
      return app.go('login.js');
    }
    app.element('div',{'class':'content-loader'}).appendTo(GLOBALS.content);
    let def={
      id:1,
      username:app.user,
      title:'',
      description:'',
      time:(new Date).getTime(),
      method:'add',
      table:'topic',
    },
    json=await app.get('files/db/topic.json'),
    data=app.parseJSON(json),
    posts=Array.isArray(data)?data:[];
    GLOBALS.content.html();
    /* find new id */
    if(query.hasOwnProperty('id')){
      for(let post of posts){
        if(query.id==post.id){
          def=post;
          def.method='edit';
          def.table='topic';
          break;
        }
      }
      app.title('Edit Topic #'+def.id);
      GLOBALS.header.text('Edit Topic #'+def.id);
    }else{
      let increment=Math.min(Math.max(Math.ceil(Math.random()*9),1),9);
      for(let post of posts){
        if(parseInt(post.id)>=def.id){
          def.id=parseInt(post.id)+increment;
        }
      }
      app.title('New Topic #'+def.id);
      GLOBALS.header.text('New Topic #'+def.id);
    }
    /* check user */
    if(def.username!=app.user){
      return app.error('Unauthorized',401);
    }
    /* set the form */
    let form=app.element('div',{'class':'editor'},[
      app.element('input',{
        type:'hidden',
        name:'id',
        value:def.id,
      }),
      app.element('input',{
        type:'hidden',
        name:'username',
        value:def.username,
      }),
      app.element('input',{
        type:'hidden',
        name:'time',
        value:def.time,
      }),
      app.element('input',{
        type:'hidden',
        name:'method',
        value:def.method,
      }),
      app.element('input',{
        type:'hidden',
        name:'table',
        value:def.table,
      }),
      app.element().text('Title'),
      app.element('input',{
        type:'text',
        name:'title',
        maxlength:100,
        placeholder:'Title',
        value:def.title,
      }),
      app.element().text('Description'),
      app.element('textarea',{
        name:'description',
        placeholder:'Description',
        row:3,
        id:'editor-content',
        style:'height:5rem;',
      }).content(def.description),
      app.element().text(' . '),
    ]).appendTo(GLOBALS.content),
    save=app.element('button',{'class':'button-blue'})
      .text('Save').appendTo(form),
    view=app.element('button',{
      'class':'button-tosca other-button',
      'data-id':def.id,
    }).text('View').appendTo(form)
      .clickOn(async function(){
        await this.save.click();
        await this.mia.sleep(500);
        this.mia.go('topic.js?id='+this.dataset.id);
    }),
    qbut=app.element('button',{
      'class':'button-green other-button',
      'data-tid':query.id,
    }).text('Add Question')
      .appendTo(form).clickOn(function(){
      this.mia.go('question.js?tid='+this.dataset.tid)
    });
    view.save=save;
    /* save the post */
    save.clickOn(async function(e){
      let stext=this.innerText;
      this.disabled=true;
      this.text('Saving...');
      let data=app.formSerialize(),
      json=await app.post('quiz',data),
      res=app.parseJSON(json);
      this.disabled=false;
      this.text(stext);
      if(!res){
        let pre=app.element('pre').text('Failed to save!');
        form.insertBefore(pre,save);
        await app.sleep(2000);
        pre.remove();
        return;
      }
      if(!query.hasOwnProperty('id')){
        app.go('admin.js');
        return;
      }
      let pre=app.element('pre').text('Saved!');
      form.insertBefore(pre,save);
      await app.sleep(2000);
      pre.remove();
    });
    if(def.method=='add'){return;}
    /* ---------- [QUESTION] ---------- */
    let loader=app.element('div',{'class':'content-loader'}).appendTo(GLOBALS.content),
    ganjel=app.element('div',{'class':'content-separator'}).appendTo(GLOBALS.content),
    search=app.searchForm().appendTo(GLOBALS.content),
    qdata=await env.load(app,query.id);
    loader.remove();
    if(qdata.topic===null||qdata.topic.username!=app.user){
      return app.error('Unauthorized',401);
    }
    for(let post of qdata.quiz){
      app.element('div',{
        'class':'post',
        'data-title':post.q,
      },[
        app.element('div',{'class':'post-title'})
          .html('#'+post.id+' -- '+post.q),
        app.element('div',{'class':'post-button'},[
          app.element('button',{
            'class':'button-blue',
            'data-id':post.id,
            'data-tid':query.id,
          }).text('Edit').clickOn(function(){
            app.go('question.js?tid='
              +this.dataset.tid+'&id='+this.dataset.id);
          }),
          app.element('button',{
            'class':'button-red',
            'data-id':post.id,
            'data-tid':query.id,
          }).text('Delete').clickOn(async function(){
            let yes=await app.confirm('Delete the question?');
            if(!yes){return;}
            let stext=this.innerText;
            this.disabled=true;
            this.text('Deleting...');
            let json=await app.post('quiz',{
              table:'quiz',
              method:'delete',
              id:this.dataset.id,
              tid:this.dataset.tid,
            }),
            res=app.parseJSON(json);
            this.disabled=false;
            this.text(stext);
            app.go('edit.js?id='+this.dataset.tid);
          }),
        ]),
      ]).appendTo(GLOBALS.content);
      
    }
  },{
    load:async function(app,tid){
      let result={quiz:[],topic:null},
      json=await app.get('files/db/quiz/'+tid+'.json'),
      data=app.parseJSON(json),
      posts=Array.isArray(data)?data:[];
      result.quiz=posts;
      json=await app.get('files/db/topic.json'),
      data=app.parseJSON(json),
      posts=Array.isArray(data)?data:[];
      for(let post of posts){
        if(post.id==tid){
          result.topic=post;
          break;
        }
      }
      return result;
    },
    setRow:function(minus=false){
      let ec=document.getElementById('editor-content'),
      ers=document.getElementById('editor-row-size');
      if(!ec||!ers){return;}
      let cmh=ec.style.height,
      mh=parseFloat(ers.value),
      vh=minus?mh-0.1:mh+0.1;
      if(vh<3||vh>30){return;}
      vh=Math.min(Math.max(3,vh),30);
      ec.style.height=vh+'rem';
      ers.value=vh;
    },
  }],
  /* admin page -- topic */
  ['admin.js','Admin',async function(query,app,env){
    if(!app.key){
      return app.go('login.js');
    }
    /* load data */
    app.element('div',{'class':'content-loader'}).appendTo(GLOBALS.content);
    let json=await app.get('files/db/topic.json'),
    data=app.parseJSON(json),
    posts=Array.isArray(data)?
      data.filter(r=>r.username==app.user):[];
    posts.reverse();
    GLOBALS.content.html();
    /* search form */
    app.searchForm().appendTo(GLOBALS.content);
    /* no post */
    if(posts.length<1){
      app.element('h3',{
        'class':'content-empty'
      }).appendTo(GLOBALS.content);
      return;
    }
    /* post loop */
    for(let post of posts){
      if(post.username!=app.user){continue;}
      app.element('div',{
        'class':'post',
        'data-title':post.title,
      },[
        app.element('div',{'class':'post-title'})
          .html('#'+post.id+' -- '+post.title),
        app.element('div',{'class':'post-time'})
          .html(app.parseDatetime(parseInt(post.time,10))),
        app.element('div',{'class':'post-button'},[
          app.element('button',{
            'class':'button-tosca',
            'data-id':post.id
          }).text('View').clickOn(function(){
            app.go('topic.js?id='+this.dataset.id);
          }),
          app.element('button',{
            'class':'button-blue',
            'data-id':post.id
          }).text('Edit').clickOn(function(){
            app.go('edit.js?id='+this.dataset.id);
          }),
          app.element('button',{
            'class':'button-red',
            'data-id':post.id
          }).text('Delete').clickOn(async function(){
            let yes=await app.confirm('Delete the topic?');
            if(!yes){return;}
            let stext=this.innerText;
            this.disabled=true;
            this.text('Deleting...');
            let json=await app.post('quiz',{
              table:'topic',
              method:'delete',
              id:this.dataset.id,
            }),
            res=app.parseJSON(json);
            this.disabled=false;
            this.text(stext);
            app.go('admin.js');
          }),
        ]),
      ]).appendTo(GLOBALS.content);
    }
  }],
  /* login page */
  ['login.js','Login',async function(query,app,env){
    if(app.key){
      return app.go('admin.js');
    }
    let username=app.element('input',{
      value:'',
      placeholder:'Username',
      maxlength:100,
      type:'text',
      name:'username',
      autocomplete:'off',
      required:true,
    }),
    password=app.element('input',{
      value:'',
      placeholder:'Password',
      maxlength:100,
      type:'password',
      name:'password',
      autocomplete:'off',
      required:true,
    }),
    submit=app.element('button',{'class':'button-orange'}).text('Login'),
    login=app.element('div',{'class':'login'},[
      app.element().text('Username'),
      username,
      app.element().text('Password'),
      password,
      submit,
    ]).appendTo(GLOBALS.content);
    submit.onclick=async ()=>{
      let stext=submit.innerText;
      submit.disabled=true;
      submit.text('Checking...');
      let data=app.formSerialize(),
      res=await app.login(data),
      key=app.parseJSON(res);
      if(!key){
        submit.text('Denied');
        login.classList.add('login-shake');
        let text='Invalid username or password.',
        pre=app.element('pre').text(text);
        login.insertBefore(pre,submit);
        await app.sleep(1000);
        submit.disabled=false;
        submit.text(stext);
        pre.remove();
        login.classList.remove('login-shake');
        return;
      }
      app.key=key;
      app.user=data.username;
      if(query.hasOwnProperty('next')){
        return app.go(query.next);
      }
      return app.go('admin.js');
    };
  }],
];
/* headers */
this.headers=[
  async function(query,app,page){
    GLOBALS.header.html(page.title);
    GLOBALS.content.html();
    /* logged in */
    if(app.key){
      /* logout */
      app.element('button',{
        'class':'button-red button-float-right',
      }).text('Logout')
      .appendTo(GLOBALS.header)
      .onclick=async function(){
        let yes=await app.confirm('Logout?');
        if(!yes){return;}
        app.key=null;
        app.user=null;
        app.go('');
      };
      /* new topic */
      app.element('button',{
        'class':'button-green button-float-right',
      }).text('New Topic')
      .appendTo(GLOBALS.header)
      .onclick=async function(){
        app.go('edit.js');
      };
    }
    return true;
  },
];
/* footers */
this.footers=[
  async function(query,app,page){
    let old=document.getElementById('table-deck');
    if(old){return;}
    let button={
      score:app.element('div',{},[
        app.element('img',{
          alt:'',
          src:'files/image/score-80.png',
        })
      ]),
      topic:app.element('div',{},[
        app.element('img',{
          alt:'',
          src:'files/image/topic-80.png',
        })
      ]),
      account:app.element('div',{},[
        app.element('img',{
          alt:'',
          src:'files/image/account-80.png',
        })
      ]),
    },
    table=app.element('table',{
      id:'table-deck',
      cellspacing:0,
      cellpadding:0,
      border:0,
      width:'100%',
      backgroundColor:'transparent',
      'class':'table-deck',
    },[
      app.element('tbody',{},[
        app.element('tr',{},[
          app.element('td',{},[button.topic]),
          app.element('td',{},[button.score]),
          app.element('td',{},[button.account]),
        ])
      ])
    ]).appendTo(GLOBALS.footer);
    button.topic.clickOn(async function(){
      app.go('');
    });
    button.score.clickOn(function(){
      app.go('score.js');
    });
    button.account.clickOn(function(){
      app.go('admin.js');
    });
    return true;
  },
];
/* main elements */
this.elements=function(){
  /* clearing the field */
  document.body.innerText='';
  /* create main elements and globalize them */
  GLOBALS.main=this.app.element('div',{id:'main'}).appendTo(document.body);
  GLOBALS.header=this.app.element('div',{'class':'header'}).appendTo(GLOBALS.main);
  GLOBALS.content=this.app.element('div',{'class':'content'}).appendTo(GLOBALS.main);
  GLOBALS.footer=this.app.element('div',{'class':'footer'}).appendTo(GLOBALS.main);
  this.app.loader=this.loader;
  this.app.searchForm=this.searchForm;
};
/* initialize */
this.init=async function(){
  /* start mia app */
  this.app=new mia(this.host);
  /* setup routers, headers, footers */
  for(let r of this.routers){this.app.routes.push(r);}
  for(let r of this.headers){this.app.headers.push(r);}
  for(let r of this.footers){this.app.footers.push(r);}
  /* prepare the main element */
  this.elements();
  /* initialize the app */
  this.app.init();
};
/* loader */
this.loader=function(load=true){
  let el=document.getElementById('loader');
  if(el){el.remove();}
  if(load===false){return;}
  el=document.createElement('div');
  el.classList.add('loader');
  el.id='loader';
  document.body.append(el);
  return el;
};
/* search form */
this.searchForm=function(){
  let search=this.element('input',{
    name:'search',
    placeholder:'Search...',
    maxlength:100,
    value:'',
  });
  search.onkeyup=function(){
    let rg=new RegExp(this.value,'i'),
    nm=document.querySelectorAll('div[data-title]');
    for(let i=0;i<nm.length;i++){
      if(nm[i].dataset.title.match(rg)){
        nm[i].style.removeProperty('display');
      }else{
        nm[i].style.display='none';
      }
    }
  };
  return this.element('div',{'class':'content-search'},[
    search,
  ]);
};
/* initialize the app */
return this.init();
};


