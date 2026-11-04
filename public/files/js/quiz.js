/* quiz.js -- requires: mia.js*/
;const quiz=function(){
this.version='1.0.0';
this.host='';
this.app=null;
/* routers */
this.routers=[
  ['','Home',function(query,app,env){
      GLOBALS.content.text('this is home, welcome home!');
    
  }],
  /* admin page */
  ['admin.js','Admin',async function(query,app,env){
    if(!app.key){
      return app.go('login.js');
    }
    app.element('div',{'class':'content-loader'}).appendTo(GLOBALS.content);
    let json=await app.get('files/db/posts.json'),
    data=app.parseJSON(json),
    posts=Array.isArray(data)?data:[];
    posts.reverse();
    GLOBALS.content.html();
    /* search form */
    let search=app.element('input',{
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
    app.element('div',{'class':'post-search'},[
      search,
    ]).appendTo(GLOBALS.content);
    /* post loop */
    for(let post of posts){
      app.element('div',{
        'class':'post',
        'data-title':post.title,
      },[
        app.element('div',{
          'class':'post-image post-image-hidden',
        },[
          app.element('img',{
            id:'post-image-'+post.id,
          }),
        ]),
        app.element('img',{
          alt:'',
          src:GLOBALS.host+'files/image/preloader.gif',
          'class':'post-image-loader',
          id:'post-image-loader-'+post.id,
        }),
        app.element('div',{'class':'post-title'})
          .html('#'+post.id+' -- '+post.title),
        app.element('div',{'class':'post-time'})
          .html(app.parseDatetime(post.date+' '+post.time)),
        app.element('div',{'class':'post-button'},[
          app.element('button',{
            'class':'button-tosca',
            'data-id':post.id
          }).text('View').clickOn(function(){
            app.go('post.js?id='+this.dataset.id);
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
            let yes=await app.confirm('Delete the post?');
            if(!yes){return;}
            let stext=this.innerText;
            this.disabled=true;
            this.text('Deleting...');
            let json=await app.post('post',{
              id:this.dataset.id,
              'delete':true,
            }),
            res=app.parseJSON(json);
            this.disabled=false;
            this.text(stext);
            app.go('admin.js');
          }),
        ]),
      ]).appendTo(GLOBALS.content);
      /* image renderer */
      let img=new Image;
      img.src=GLOBALS.host+post.picture;
      img.dataset.pid=post.id;
      img.dataset.thumb=GLOBALS.host+'files/image/thumb.jpg';
      img.onerror=function(){
        this.src=this.dataset.thumb;
      };
      img.onload=function(){
        let pimg=document.querySelector('img#post-image-'+this.dataset.pid),
        limg=document.querySelector('img#post-image-loader-'+this.dataset.pid);
        if(pimg){
          pimg.src=this.src;
          pimg.parentNode.classList.remove('post-image-hidden');
        }
        if(limg){
          limg.remove();
        }
      };
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
      return app.go('admin.js');
    };
  }],
];
/* headers */
this.headers=[
  async function(query,app,page){
    GLOBALS.header.html(page.title);
    GLOBALS.content.html();
    
    if(app.key){
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
      background:'tansparent',
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
      let loader=app.loader();
      await app.sleep(1000);
      loader.remove();
      GLOBALS.content.text('topic '.repeat(300));
    });
    button.score.clickOn(function(){
      GLOBALS.content.text('score ');
      
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
/* initialize the app */
return this.init();
};


