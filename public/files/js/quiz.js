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
    /* each loop */
    res=[];
    for(let username in posts){
      let post=posts[username],
      length=Object.values(post).length,
      total=Object.values(post)
        .reduce((b,c)=>parseInt(b,10)+parseInt(c,10),0),
      bend=length*100,
      score=(total/bend*100).toFixed(2);
      res.push({
        username,
        score,
        length,
      });
    }
    res.sort(function(a,b){
      if(a.score>b.score){
        return -1;
      }
      if(a.score<b.score){
        return 1;
      }
      if(a.length>b.length){
        return -1;
      }
      if(a.length<b.length){
        return 1;
      }
      return 0;
    });
    let counter=0;
    for(let r of res){
      counter++;
      app.element('div',{
        'class':'score',
        'data-title':r.username,
      },[
        app.element('div',{
          'class':'score-content',
        }).text(counter+'. '+r.username+' --> '+r.score+' ('+r.length+' exams)'),
      ]).appendTo(GLOBALS.content);
    }
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
    /* check the timer */
    let timer=document.getElementById('exam-timer');
    if(timer&&timer.dataset.tid!=query.id){
      setTimeout(e=>{
        app.go('exam.js?id='+timer.dataset.tid);
      },2000);
      return env.text(
        app,
        'The exam is stil runing.\n'
        +'Redirecting now...'
      );
    }
    /* send the warning */
    if(timer){
      return await env.start(timer);
    }
    else{
      let text='Do you want to exam this topic?\n\n'
        +'Warning! This is one time ticket.\n'
        +'You won\'t be able to do this exam twice.',
      yes=await app.confirm(text);
      if(!yes){
        return app.go('topic.js?id='+query.id);
      }
    }
    /* load all data */
    let loader=app.element('div',{'class':'content-loader'}).appendTo(GLOBALS.content),
    data=await env.load(app,query.id);
    loader.remove();
    /* check all data */
    if(!data.quiz||!data.topic||!data.exam){
      return env.text(app,'Error: Failed to load data.');
    }
    if(data.topic.username==app.user){
      return env.text(app,'Error: Unable to exam your own topic.');
    }
    if(data.score&&data.score.hasOwnProperty(query.id)){
      return env.text(
        app,
        'You\'ve been scored this exam with: '
          +data.score[query.id]+' score'
      );
    }
    if(parseInt(data.exam.expired,10)<(new Date).getTime()){
      return env.text(
        app,
        'The time is up.\n'
        +'Expired on '+app.parseDatetime(data.exam.expired)
      );
    }
    let header=app.element('h3')
      .text(data.topic.title)
      .appendTo(GLOBALS.content);
    if(!timer){
      timer=app.element('button',{
        'class':'exam-timer',
        'id':'exam-timer',
        'data-tid':query.id,
      }).text('Starting...').appendTo(document.body);
      timer.answer={};
      timer.data=data;
      timer.timing=env.timing(app,timer,data.exam.expired,env.done);
      timer.clickOn(async function(){
        let yes=await app.confirm('End the exam now?');
        if(!yes){return;}
        env.done(app,this.dataset.tid,this.answer,this.data);
        clearInterval(this.timing);
        this.remove();
        return await app.alert('Time\'s up!');
      });
    }
    return await env.start(timer);
  },{
    start:async function(timer,i=0){
      let gc=GLOBALS.content,
      quiz=timer.data.quiz,
      answer=timer.answer,
      id=i!=0?parseInt(i,10):0,
      post=quiz[id],
      app=timer.mia,
      next=quiz.length-1>id?id+1:0,
      qoer=(id+1)+'/'+quiz.length;
      gc.html();
      let question=app.element('div',{
        'class':'exam-question',
      }).text(qoer+' - '+post.q).appendTo(gc);
      for(let a of ['a','b','c','d']){
        let opt=app.element('div',{
          'class':'exam-answer',
          'data-answer':a,
          'data-id':post.id,
        }).text(a.toUpperCase()+'. '+post[a]).appendTo(gc);
        opt.env=this;
        opt.next=next;
        opt.timer=timer;
        opt.clickOn(async function(){
          this.timer.answer[this.dataset.id]=this.dataset.answer;
          this.classList.add('exam-answered');
          await this.mia.sleep(500);
          if(this.next===0){
            this.env.done(
              this.timer.mia,
              this.timer.dataset.tid,
              this.timer.answer,
              this.timer.data,
            );
            clearInterval(this.timer.timing);
            this.timer.remove();
            return await this.mia.alert('Answers are sent!');
          }
          return await this.env.start(this.timer,this.next);
        });
      }
    },
    done:async function(app,tid,answer,data){
      let loader=app.loader(),
      length=data.quiz.length,
      point=0;
      for(let q of data.quiz){
        if(answer.hasOwnProperty(q.id)
          &&answer[q.id]==q.x){
          point+=1;
        }
      }
      let score=Math.floor(point/length*100),
      res=await app.post('quiz',{
        table:'score',
        score,
        tid,
        username:app.user,
      }),
      success=app.parseJSON(res);
      loader.remove();
      await app.alert(success?'Answers are sent.':'Failed to send the answer.');
      return app.go('score.js');
    },
    timing:function(app,timer,expire,cb){
      let res=setInterval(async e=>{
        let now=(new Date).getTime(),
        left=parseInt(expire,10)-now;
        if(left<0){
          if(typeof cb==='function'){
            cb(app,timer.dataset.tid,timer.answer,timer.data);
          }
          timer.remove();
          clearInterval(res);
          return await app.alert('Time\'s up!');
        }
        let right=(left/1000).toFixed(3)
          .toString().split('.'),
        minute=Math.floor(parseInt(right[0],10)/60),
        second=parseInt(right[0],10)-(minute*60),
        read=[
          minute.toString().padStart(2,'0'),
          second.toString().padStart(2,'0'),
        ].join(':')+'.'+right[1];
        timer.text(read);
      },193);
      return res;
    },
    text:function(app,text){
      return app.element('div',{'class':'exam-error'}).text(text).appendTo(GLOBALS.content);
    },
    load:async function(app,tid){
      /* question */
      let result={
        exam:null,
        score:null,
        topic:null,
        quiz:null,
      },
      json=await app.get('files/db/quiz/'+tid+'.json'),
      data=app.parseJSON(json),
      posts=Array.isArray(data)?data:[],
      minute=posts.length||1;
      result.quiz=posts,
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
      posts=typeof data==='object'&&data!==null?data:{};
      for(let post in posts){
        if(post==app.user){
          result.score=posts[post];
          break;
        }
      }
      /* exam */
      json=await app.post('quiz',{
        table:'exam',
        method:'start',
        username:app.user,
        tid,
        minute,
      }),
      data=app.parseJSON(json);
      result.exam=typeof data==='object'&&data!==null?data:null;
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
  /* register page */
  ['register.js','Register',async function(query,app,env){
    let username=app.element('input',{
      value:'',
      placeholder:'New Username',
      maxlength:100,
      type:'text',
      name:'nusername',
      autocomplete:'off',
      required:true,
    }),
    password=app.element('input',{
      value:'',
      placeholder:'New Password',
      maxlength:100,
      type:'password',
      name:'npassword',
      autocomplete:'off',
      required:true,
    }),
    cpassword=app.element('input',{
      value:'',
      placeholder:'Confirm Password',
      maxlength:100,
      type:'password',
      name:'cpassword',
      autocomplete:'off',
      required:true,
    }),
    cword=app.element('input',{
      value:'',
      placeholder:'Code Word',
      maxlength:100,
      type:'text',
      name:'cword',
      autocomplete:'off',
      required:true,
    }),
    submit=app.element('button',{'class':'button-tosca'}).text('Register'),
    login=app.element('div',{'class':'login'},[
      app.element().text('New Username'),
      username,
      app.element().text('New Password'),
      password,
      app.element().text('Confirm Password'),
      cpassword,
      app.element().text('Code Word'),
      cword,
      submit,
    ]).appendTo(GLOBALS.content);
    submit.onclick=async ()=>{
      let stext=submit.innerText;
      submit.disabled=true;
      submit.text('Checking...');
      let data=app.formSerialize(),
      res=await app.register(data),
      rtext=app.parseJSON(res);
      rtext=typeof rtext==='string'?rtext:res;
      if(rtext.toUpperCase()!='OK'){
        let pre=app.element('pre').text(rtext);
        login.insertBefore(pre,submit);
        submit.text('Failed');
        login.classList.add('login-shake');
        await app.sleep(1000);
        submit.disabled=false;
        submit.text(stext);
        pre.remove();
        login.classList.remove('login-shake');
        return;
      }
      if(query.hasOwnProperty('next')){
        return app.go(query.next);
      }
      return app.go('login.js');
    };
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
    }).text('Add Question').clickOn(function(){
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
    if(def.method=='edit'){
      qbut.appendTo(form);
    }
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
    register=app.element('button',{
      'class':'button-tosca other-button',
    }).text('Register').clickOn(function(){
      let next=query.hasOwnProperty('next')
        ?'?next='+encodeURIComponent(query.next):'';
      return app.go('register.js'+next);
    }),
    login=app.element('div',{'class':'login'},[
      app.element().text('Username'),
      username,
      app.element().text('Password'),
      password,
      submit,
      register,
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


