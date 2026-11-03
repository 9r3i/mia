/* mblog.js */
const mblog=function(){
this.version='1.3.0';
/* routers */
this.routers=[
  /* redirect page */
  ['','Redirecting...',function(query,app,env){
    GLOBALS.title.text('Redirecting...');
    app.go('home.js');
  }],
  /* hblog */
  ['hblog/','R-Blog',async function(query,app,env){
    app.element('div',{'class':'content-loader'}).appendTo(GLOBALS.content);
    GLOBALS.content.html();
    let frame=app.element('iframe').appendTo(GLOBALS.content),
    doc=frame.contentDocument,
    win=frame.contentWindow,
    close=app.element('button',{
      'class':'button-orange frame-close',
    }).text('Close').appendTo(GLOBALS.content);
    close.frame=frame;
    close.historyLength=history.length-1;
    frame.src='hblog.html';
    close.clickOn(async function(){
      let length=this.historyLength-history.length;
      this.frame.remove();
      this.remove();
      history.go(length);
      app.go('test.js');
    });
  }],
  /* rblog */
  ['rblog/','R-Blog',async function(query,app,env){
    app.element('div',{'class':'content-loader'}).appendTo(GLOBALS.content);
    GLOBALS.content.html();
    let frame=app.element('iframe').appendTo(GLOBALS.content),
    doc=frame.contentDocument,
    win=frame.contentWindow,
    close=app.element('button',{
      'class':'button-orange frame-close',
    }).text('Close').appendTo(GLOBALS.content);
    close.frame=frame;
    close.historyLength=history.length-1;
    frame.src='rblog.html';
    close.clickOn(async function(){
      let length=this.historyLength-history.length;
      this.frame.remove();
      this.remove();
      history.go(length);
      app.go('test.js');
    });
  }],
  /* gblog */
  ['gblog/','G-Blog',async function(query,app,env){
    app.element('div',{'class':'content-loader'}).appendTo(GLOBALS.content);
    GLOBALS.content.html();
    let frame=app.element('iframe').appendTo(GLOBALS.content),
    doc=frame.contentDocument,
    win=frame.contentWindow,
    close=app.element('button',{
      'class':'button-orange frame-close',
    }).text('Close').appendTo(GLOBALS.content);
    close.frame=frame;
    close.historyLength=history.length-1;
    frame.src='gblog/';
    close.clickOn(async function(){
      let length=this.historyLength-history.length;
      this.frame.remove();
      this.remove();
      history.go(length);
      app.go('test.js');
    });
  }],
  /* test page */
  ['test.js','Test Page',async function(query,app,env){
    app.element('div',{'class':'content-loader'}).appendTo(GLOBALS.content);
    /**
    let db=(new idb).create();
    //db.set('test.txt','yang takkan pernah terlupakan selamanya');
    let data=await db.get('test.txt');
    //let data=await db.index('');
    await app.alert(app.likeJSON(data,2));
    //await app.alert(data);
    //*/
    localStorage.setItem('test','testing');
    let qindex=await fetch(GLOBALS.host+'files/db/qindex.json')
      .then(r=>r.json()),
    anakUmmu=['Ayyub','Isa','Malik','Rifa','Ulfa','Zayd'],
    lsSize=(
      new Blob(Object.values(localStorage)).size +
      new Blob(Object.keys(localStorage)).size +
      localStorage.length
    ),
    qlist={
      '30':[],
      '29':[],
      '28':[],
      '27':[],
      '26':[],
      '25':[],
      '24':[],
      '23':[],
    },
    speed=20,
    slist=app.element('select',{id:'speed'}),
    juzList=app.element('select',{id:'juz'});
    for(let qi of qindex){
      /* juz 30 */
      if(parseInt(qi.number,10)>=78){
        qlist[30].push(qi.number+' - '+qi.name+' - '+qi.arabic_name);
      }
      /* juz 29 */
      else if(parseInt(qi.number,10)>=67){
        qlist[29].push(qi.number+' - '+qi.name+' - '+qi.arabic_name);
      }
      /* juz 28 */
      else if(parseInt(qi.number,10)>=58){
        qlist[28].push(qi.number+' - '+qi.name+' - '+qi.arabic_name);
      }
      /* juz 27 */
      else if(parseInt(qi.number,10)>=52){
        qlist[27].push(qi.number+' - '+qi.name+' - '+qi.arabic_name);
      }
      /* juz 26 */
      else if(parseInt(qi.number,10)>=46){
        qlist[26].push(qi.number+' - '+qi.name+' - '+qi.arabic_name);
      }
      /* juz 25 */
      else if(parseInt(qi.number,10)>=42){
        qlist[25].push(qi.number+' - '+qi.name+' - '+qi.arabic_name);
      }
      /* juz 24 */
      else if(parseInt(qi.number,10)>=40){
        qlist[24].push(qi.number+' - '+qi.name+' - '+qi.arabic_name);
      }
      /* juz 23 */
      else if(parseInt(qi.number,10)>=37){
        qlist[23].push(qi.number+' - '+qi.name+' - '+qi.arabic_name);
      }
    }
    for(let sp of [
      1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,
      20,25,30,35,40,45,50,60,70,80,90,99
    ]){
      let opt=app.element('option',{
        value:sp,
      }).content(sp+' w/s').appendTo(slist);
      if(sp==10){
        opt.setAttribute('selected','selected');
      }
    }
    for(let sp in qlist){
      let opt=app.element('option',{
        value:sp,
      }).content('Juz '+sp).appendTo(juzList);
      if(sp==30){
        opt.setAttribute('selected','selected');
      }
    }
    GLOBALS.content.html(
      'This is <span style="font-size:20px;">"20px FONT"</span>'
      +'<br />And this is a testing page of test.js<br />'
      +'And also this is M-Blog that create this blog<br />'
      +'I got more blog sample:<br />'
      +[
        '<a target="_blank" href="hblog.html">H-Blog</a>',
        '<a target="_blank" href="rblog.html">R-Blog</a>',
        '<a target="_blank" href="gblog/">G-Blog</a>',
      ].join(' -- ')
      +'<br />'
      +env.target(app)
      +'Size of localStorage: '+(lsSize/1024).toFixed(2)+' KB<br />'
      +env.text+'<br />'+env.gas()
      +'<br />Sample of unavailable file --> <a href="#euweuh.html">euweuh.html</a> -- <br /><br />'
      +'<h3 id="surat">Juz 30</h3>'
      +'Speed: '
      +slist.outerHTML
      +' Juz: '
      +juzList.outerHTML
    );
    juzList=document.getElementById('juz');
    juzList.onchange=function(){
      let h3=document.getElementById('surat');
      h3.innerText='Juz '+this.value;
    };
    let botton=app.element('button',{
      'class':'button-orange',
      'style':'margin-left:1rem;',
    }).text('Randomize').appendTo(GLOBALS.content);
    botton.clickOn(async e=>{
      let speed=parseInt(document.getElementById('speed').value),
      juz=parseInt(document.getElementById('juz').value);
      env.suratInline(app,qlist[juz],speed);
      //env.surat(app,qlist,speed);
      //env.surat(app,anakUmmu,speed);
    });
    let img=new Image;
    img.src=GLOBALS.host+'files/upload/sunset-view.jpg';
    GLOBALS.content.append(img);
    img.addEventListener('click',async ()=>{
      //let yes=await app.prompt('kamu mau gak?','ogah ah','Jawab');
      //let res=await app.alert(yes);
      //yes=await app.confirm('kamu mau gak?');
      //res=await app.alert(yes);
      //await app.alert(buss);
    });
    let time_now=(new Date).getTime();
    let bell=app.element('pre').appendTo(GLOBALS.content).html('Loading...'),
    buss=app.likeJSON(GLOBALS),
    bussList=app.likeJSON(qlist,2),
    boss=await env.boss(app);
    spent=((new Date).getTime()-time_now)/1000;
    bass='spent time: '+spent+' s\n';
    bass+='app key: '+app.key+' \n';
    bass+='app user: '+app.user+' \n';
    bass+='width: '+window.innerWidth+' px \n';
    bass+='height: '+window.innerHeight+' px \n';
    bass+='width out: '+window.outerWidth+' px \n';
    bass+='height out: '+window.outerHeight+' px \n';
    bass+='GLOBALS: '+buss+'  \n';
    bass+='Q-List: '+bussList+'  \n';
    bell.text(bass+'\n\n'+boss);
    GLOBALS.content.append(app.element());
    app.element('a',{
      href:GLOBALS.host+'files/image/thumb.jpg',
    }).html('thumb.jpg').appendTo(GLOBALS.content);
  },{
    text:'yang takkan pernah terlupakan selamanya dalam hidupku',
    target:function(app){
      let ul=app.element('ul'),
      list=[
        'One file app like mhtml',
        'boot.js and idb.js as iboot.js',
        'Assessment app',
        '',
        '',
      ];
      for(let i of list){
        let li=app.element('li').text(i).appendTo(ul);
      }
      return ul.outerHTML;
    },
    gas:function(){
      return 'test function for env subject';
    },
    bess:async function(app){
      let url='https://www.imagefap.com/pictures/12875733/Amber%20Dawn',
      res=await fetch(url,{
        //mode:'cors',
      }).then(r=>r.text()).catch(e=>'error'),
      ros=await fetch('index.ini').then(r=>r.text());
      return app.likeJSON({
        res,ros,
      });
    },
    boss:async function(app){
      let res='';
      if(app.key){
        res=await app.post('test',{'test':'just testing'});
        let data=app.parseJSON(res);
        res=app.likeJSON(data,3);
      }else{
        res=await app.get('test.php');
      }
      return res;//.replace(/</g,'&lt;');
    },
    surat:function(app,surat,speed=50){
      speed=Math.max(Math.min(speed,99),1);
      let h1=app.element('h1'),
      intv=setInterval(e=>{
        let key=Math.floor(Math.random()*surat.length);
        h1.text(surat[key]);
      },Math.floor(1000/speed)),
      dial=app.alertCB('',function(){
        clearInterval(intv);
        let dal=app.alertCB('');
        app.element('h1').appendTo(dal.content)
          .text(this.content.innerText);
      });
      dial.text('Stop');
      dial.header.dataset.text='Surat';
      dial.content.append(h1);
      surat.reverse();
    },
    suratInline:function(app,surat,speed=50){
      speed=Math.max(Math.min(speed,99),1);
      let obut=document.getElementById('button-stop');
      if(obut){return;}
      let h1=document.getElementById('surat'),
      intv=setInterval(e=>{
        let key=Math.floor(Math.random()*surat.length);
        h1.innerText=surat[key];
      },Math.floor(1000/speed)),
      but=app.element('button',{
        'class':'button-orange',
        id:'button-stop',
      }).text('Stop'),
      parent=h1.parentNode;
      parent.insertBefore(but,h1);
      but.intv=intv;
      but.clickOn(function(){
        clearInterval(this.intv);
        this.remove();
      });
      surat.reverse();
      return intv;
    },
  }],
  /* home page */
  ['home.js','Welcome',async function(query,app,env){
    let route=null;
    for(let rou of app.routes){
      if(rou[0]=='post.js'){
        route=rou[2];
        env=rou.length>3?rou[3]:env;
        break;
      }
    }
    query.id=GLOBALS.welcome;
    return typeof route==='function'?route(query,app,env):'';
  }],
  /* posts page -- recent page */
  ['posts.js','Recent Posts',async function(query,app,env){
    app.element('div',{'class':'content-loader'}).appendTo(GLOBALS.content);
    /* load the posts  */
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
    /* each */
    let eachs=[];
    /* post loop */
    for(let post of posts){
      let isPublished=(new Date).getTime()>
        (new Date(post.date+' '+post.time)).getTime(),
      isNotAllowed=!app.key&&!isPublished;
      if(post.id==GLOBALS.welcome||isNotAllowed){
        continue;
      }
      let elp=app.element('div',{
        'class':'post',
        'data-title':post.title,
        'data-animation':'post-unscale',
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
            'class':'button-orange',
            'data-id':post.id
          }).text('View').clickOn(function(){
            app.go('post.js?id='+this.dataset.id);
          }),
        ]),
      ]),
      obp=app.element('div',{
        'class':'post-observer',
      },[elp]).appendTo(GLOBALS.content);
      eachs.push(obp);
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
    /* observers */
    let observers=[],
    thold=[],
    tholdold=[0.1, 0.3, 0.5, 0.7, 0.9],
    callback=(eachs,key)=>{
      /**/
      eachs.forEach(e=>{
        let el=e.target.querySelector('.post'),
        vis=Math.ceil(e.intersectionRatio*100);
        if(vis>=50){
          if(el.classList.contains(el.dataset.animation)){
            el.classList.remove(el.dataset.animation);
          }
        }else if(vis<50){
          if(!el.classList.contains(el.dataset.animation)){
            el.classList.add(el.dataset.animation);
          }
        }
      });//*/
    };
    for(let i=0;i<100;i++){
      thold.push(i*0.01);
    }
    for(let i=0;i<eachs.length;i++){
      observers[i]=new IntersectionObserver(
        callback,
        {
          root:null,
          rootMargin:"0px",
          threshold:thold,
        }
      );
      observers[i].observe(eachs[i]);
    }
  }],
  /* post page */
  ['post.js','Post',async function(query,app,env){
    /* check the query id */
    if(!query.hasOwnProperty('id')){
      return app.error('Not Found',404);
    }
    /* load the posts  */
    app.element('div',{'class':'content-loader'}).appendTo(GLOBALS.content);
    let json=await app.get('files/db/posts.json'),
    data=app.parseJSON(json),
    posts=Array.isArray(data)?data:[];
    GLOBALS.content.html();
    
    /* find the post match to the id */
    let def=null;
    for(let post of posts){
      if(query.id==post.id){
        def=post;
        break;
      }
    }
    let isPublished=(new Date).getTime()>
      (new Date(def.date+' '+def.time)).getTime();
    if(def===null||(!app.key&&!isPublished)){
      let text='Not Found';
      app.title(text);
      GLOBALS.title.html(text);
      return;
    }
    
    /* set the author and datetime */
    let datetime=app.parseDatetime(def.date+' '+def.time),
    author=app.element('div',{'class':'post-author'})
      .html('Authored by '+def.author+' on '+datetime),
    content=app.element('div',{'class':'post-content'})
      .html(env.replacement(def.content,app)),
    picture=app.element('img',{
      alt:'',
      src:GLOBALS.host+'files/image/preloader.gif',
    }),
    button=app.element('button',{
      'class':'button-light-blue post-edit',
      'data-id':def.id,
    }).text('Edit').clickOn(function(){
      this.mia.go('edit.js?id='+this.dataset.id);
    });
    /* set the title */
    app.title(def.title);
    GLOBALS.title.html(def.title);
    GLOBALS.content.append(author);
    GLOBALS.content.append(app.element('div',{
      'class':'post-content-image post-content-image-margin',
    },[picture]));
    GLOBALS.content.append(content);
    if(app.key){
      GLOBALS.content.append(button);
    }
    let img=new Image;
    img.src=GLOBALS.host+def.picture;
    img.onerror=async e=>{
      await app.sleep(100);
      picture.parentNode.classList.remove('post-content-image-margin');
      picture.remove();
    };
    img.onload=async e=>{
      await app.sleep(100);
      picture.src=img.src;
    };
  },{
    replacement:function(content,app){
      return content
        .replace(/\r\n|\r|\n/g,function(m){
          return m+'';
        })
        .replace(/\[image:([^\]]+)\]/g,function(m){
          return app.element('img',{
            alt:'',
            src:m.substr(7,m.length-8),
          }).outerHTML;
        });
    },
  }],
  /* files page */
  ['files.js','Files',async function(query,app,env){
    if(!app.key){
      return app.go('login.js');
    }
    app.element('div',{'class':'content-loader'}).appendTo(GLOBALS.content);
    let json=await app.post('file',{
      scan:true,
    }),
    files=app.parseJSON(json);
    GLOBALS.content.html();
    /* upload form */
    let upload=app.element('input',{
      type:'file',
      name:'upload',
    }),
    progress=app.element('div',{id:'upload-progress'}),
    bar=app.element('div',{
      'class':'upload-bar',
    },[progress]);
    upload.progress=progress;
    upload.onchange=async function(){
      let file=this.files[0];
      if(file.size>Math.pow(1024,2)*2){
        await app.alert('File is too large.');
        return;
      }
      if(!file.type.match(/^image\//)){
        await app.alert('File must be image.');
        return;
      }
      this.progress.style.width='10%';
      let res=await app.uploadBase64(file,(e)=>{
        let progress=document.getElementById('upload-progress'),
        percent=Math.floor(e.loaded/e.total*100);
        if(progress){
          progress.style.width=percent+'%';
        }
      });
      app.go('files.js');
    };
    /* search form */
    let search=app.element('input',{
      name:'search',
      placeholder:'Search...',
      maxlength:100,
      value:'',
    });
    search.onkeyup=function(){
      let rg=new RegExp(this.value,'i'),
      nm=document.querySelectorAll('div[data-name]');
      for(let i=0;i<nm.length;i++){
        if(nm[i].dataset.name.match(rg)){
          nm[i].style.removeProperty('display');
        }else{
          nm[i].style.display='none';
        }
      }
    };
    app.element('div',{'class':'post-search'},[
      upload,bar,search,
    ]).appendTo(GLOBALS.content);
    /* files loop */
    for(let file of files){
      let timg=app.element('div',{
          'class':'post-image post-image-hidden',
        },[
          app.element('img',{
            id:'post-image-'+file.name,
          }),
        ]);
      timg.app=app;
      timg.clickOn(function(){
        let cname='post-image-fullscreen',
        xname='post-image-fullscreen-move',
        isOn=this.classList.contains(cname);
        if(isOn){
          this.classList.remove(cname);
          document.body.style.removeProperty('overflow');
        }else{
          this.classList.add(cname);
          document.body.style.overflow='hidden';
        }
      });
      app.element('div',{
        'class':'post',
        'data-name':file.name,
      },[
        timg,
        app.element('img',{
          alt:'',
          src:GLOBALS.host+'files/image/preloader.gif',
          'class':'post-image-loader',
          id:'post-image-loader-'+file.name,
        }),
        app.element('div',{'class':'post-title'})
          .html(file.name),
        app.element('div',{'class':'post-time'})
          .html([
            app.parseDatetime(file.modified*1000),
            Math.ceil(file.size/1024)+' kB',
          ].join('<br />')),
        app.element('div',{'class':'post-button'},[
          app.element('button',{
            'class':'button-tosca',
            'data-path':file.path,
          }).html('&#8227;').clickOn(function(){
            window.open(this.dataset.path,'_blank');
          }),
          app.element('button',{
            'class':'button-yellow',
            'data-path':file.path+'?download',
          }).html('&#9654;').clickOn(function(){
            window.open(this.dataset.path,'_blank');
          }),
          app.element('button',{
            'class':'button-blue',
            'data-id':file.name,
          }).html('&#10004;').clickOn(async function(){
            let yes=await app.prompt('New file name:',file.name,'Rename');
            if(!yes){return;}
            let stext=this.innerText;
            this.disabled=true;
            this.text('Renaming...');
            let json=await app.post('file',{
              file:this.dataset.id,
              rename:yes,
            }),
            res=app.parseJSON(json);
            this.disabled=false;
            this.text(stext);
            app.go('files.js');
          }),
          app.element('button',{
            'class':'button-red',
            'data-id':file.name,
          }).html('&#10006;').clickOn(async function(){
            let yes=await app.confirm('Delete the file?');
            if(!yes){return;}
            let stext=this.innerText;
            this.disabled=true;
            this.text('Deleting...');
            let json=await app.post('file',{
              file:this.dataset.id,
              'delete':true,
            }),
            res=app.parseJSON(json);
            this.disabled=false;
            this.text(stext);
            app.go('files.js');
          }),
        ]),
      ]).appendTo(GLOBALS.content);
      /* image renderer */
      let img=new Image;
      img.src=GLOBALS.host+file.path;
      img.dataset.pid=file.name;
      img.dataset.thumb=GLOBALS.host+'files/image/thumb.jpg';
      img.onerror=function(){
        this.src=this.dataset.thumb;
      };
      img.onload=function(){
        let pimg=document.getElementById('post-image-'+this.dataset.pid),
        limg=document.getElementById('post-image-loader-'+this.dataset.pid);
        if(pimg){
          pimg.src=this.src;
          pimg.parentNode.classList.remove('post-image-hidden');
        }
        if(limg){
          limg.remove();
        }
      };
    }
    /*  */
  }],
  /* edit page */
  ['edit.js','Edit',async function(query,app,env){
    if(!app.key){
      return app.go('login.js');
    }
    app.element('div',{'class':'content-loader'}).appendTo(GLOBALS.content);
    let def={
      id:1,
      title:'',
      content:'',
      date:[
        (new Date).getFullYear().toString(),
        ((new Date).getMonth()+1).toString().padStart(2,'0'),
        (new Date).getDate().toString().padStart(2,'0'),
      ].join('-'),
      time:[
        (new Date).getHours().toString().padStart(2,'0'),
        (new Date).getMinutes().toString().padStart(2,'0'),
      ].join(':'),
      author:'9r3i',
      picture:'',
    },
    json=await app.get('files/db/posts.json'),
    fjson=await app.post('file',{scan:true}),
    data=app.parseJSON(json),
    fdata=app.parseJSON(fjson),
    posts=Array.isArray(data)?data:[],
    files=Array.isArray(fdata)?fdata:[];
    GLOBALS.content.html();
    /* find new id */
    if(query.hasOwnProperty('id')){
      for(let post of posts){
        if(query.id==post.id){
          def=post;
          break;
        }
      }
      app.title('Edit Post #'+def.id);
      GLOBALS.title.text('Edit Post #'+def.id);
    }else{
      for(let post of posts){
        if(parseInt(post.id)>=def.id){
          def.id=parseInt(post.id)+1;
        }
      }
      app.title('New Post #'+def.id);
      GLOBALS.title.text('New Post #'+def.id);
    }
    /* set the form */
    let form=app.element('div',{'class':'editor'},[
      app.element('input',{
        type:'hidden',
        name:'id',
        value:def.id,
      }),
      app.element().text('Title'),
      app.element('input',{
        type:'text',
        name:'title',
        maxlength:100,
        placeholder:'Title',
        value:def.title,
      }),
      app.element().text('Content'),
      app.element('textarea',{
        name:'content',
        placeholder:'Content',
        row:5,
        id:'editor-content',
        style:'height:9rem;',
      }).content(def.content),
      app.element('div',{'class':'editor-row'},[
        app.element('button',{
          'class':'button-orange',
        }).text('-')
          .clickOn(function(){
            return env.setRow(true);
        }),
        app.element('input',{
          type:'number',
          readonly:'readonly',
          value:9,
          id:'editor-row-size'
        }),
        app.element('button',{
          'class':'button-orange',
        }).text('+')
          .clickOn(function(){
            return env.setRow();
        }),
      ]),
      app.element().text('Date & Time'),
      app.element('input',{
        type:'date',
        name:'date',
        value:def.date,
      }),
      app.element('input',{
        type:'time',
        name:'time',
        value:def.time,
      }),
      app.element().text('Author'),
      app.element('input',{
        type:'text',
        name:'author',
        placeholder:'Author',
        value:def.author,
      }),
      app.element().text('Picture'),
      app.element('input',{
        type:'text',
        name:'picture',
        placeholder:'Picture',
        value:def.picture,
        list:'post-files',
        autocomplete:'post-files',
      }),
    ]).appendTo(GLOBALS.content),
    dlist=app.element('datalist',{
      id:'post-files',
    }).appendTo(GLOBALS.content),
    save=app.element('button',{'class':'button-blue'})
      .text('Save').appendTo(form),
    view=app.element('button',{
      'class':'button-tosca other-button',
      'data-id':def.id,
    }).text('View').appendTo(form)
      .clickOn(async function(){
        await this.save.click();
        await this.mia.sleep(500);
        this.mia.go('post.js?id='+this.dataset.id);
      });
    view.save=save;
    /* set the list of files */
    for(let file of files){
      let opt=document.createElement('option');
      opt.value=file.path;
      dlist.append(opt);
    }
    /* save the post */
    save.clickOn(async function(e){
      let stext=this.innerText;
      this.disabled=true;
      this.text('Saving...');
      let data=app.formSerialize(),
      json=await app.post('post',data),
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
  },{
    setRow:function(minus=false){
      let ec=document.getElementById('editor-content'),
      ers=document.getElementById('editor-row-size');
      if(!ec||!ers){return;}
      let cmh=ec.style.height,
      mh=parseInt(cmh),
      vh=minus?mh-1:mh+1;
      ec.style.height=vh+'rem';
      ers.value=vh;
    },
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
    GLOBALS.title.text(page.title);
    GLOBALS.path.text(page.path);
    GLOBALS.nav.html();
    GLOBALS.content.html();
    let navs={
      home:'Home',
      posts:'Recent',
      test:'Test',
    },
    akey=app.key?'admin':'login';
    navs[akey]=app.key?'Admin':'Login';
    /* navigation buttons */
    for(let nav in navs){
      app.element('button',{
        'class':page.path==nav+'.js'?'button-dark-orange':'button-orange',
        'data-link':''+nav+'.js',
      }).text(navs[nav])
        .appendTo(GLOBALS.nav)
        .clickOn(function(){
          this.mia.go(this.dataset.link);
        });
    }//*/
    if(app.key){
      app.element('button',{
        'class':page.path=='files.js'?'button-dark-orange':'button-orange',
      }).text('Files')
        .appendTo(GLOBALS.nav)
        .onclick=function(){
          app.go('files.js');
        };
      app.element('button',{
        'class':'button-red',
      }).text('Logout')
        .appendTo(GLOBALS.nav)
        .onclick=async function(){
          let yes=await app.confirm('Logout?');
          if(!yes){return;}
          app.key=null;
          app.user=null;
          app.go('login.js');
        };
      app.element('button',{
        'class':'button-green',
      }).text('New Post')
        .appendTo(GLOBALS.nav)
        .onclick=function(){
          app.go('edit.js');
        };
    }
    return true;
  },
];
/* footers */
this.footers=[
  async function(query,app,page){
    GLOBALS.footer.text('Powered by 9r3i');
  },
];
/* main elements */
this.elements=function(app){
  /* clearing the field */
  document.body.innerText='';
  /* create main elements and globalize them */
  GLOBALS.main=app.element('div',{id:'main'}).appendTo(document.body);
  GLOBALS.title=app.element('h1').appendTo(GLOBALS.main);
  GLOBALS.path=app.element('h6').appendTo(GLOBALS.main);
  GLOBALS.nav=app.element('div',{'class':'nav'}).appendTo(GLOBALS.main);
  GLOBALS.content=app.element('div',{'class':'content'}).appendTo(GLOBALS.main);
  GLOBALS.footer=app.element('div',{'class':'footer'}).appendTo(GLOBALS.main);
  /* scroll button */
  let sbutton=app.element('div',{
    'class':'scroll-button',
  }).appendTo(GLOBALS.main);
  sbutton.addEventListener('click',function(){
    document.body.scrollIntoView({behavior:'smooth'});
  });
  document.body.onscroll=()=>{
    if(window.scrollY>100){
      sbutton.style.visibility='visible';
      sbutton.style.transform='scale(1)';
    }else{
      sbutton.style.visibility='hidden';
      sbutton.style.transform='scale(0.1)';
    }
  };
};
/* initialize */
this.init=async function(){
  /* halt point -- development only */
  if(GLOBALS.haltstart){return;}
  /* start mia app */
  let app=new mia(GLOBALS.host);
  /* setup routers, headers, footers */
  for(let r of this.routers){app.routes.push(r);}
  for(let r of this.headers){app.headers.push(r);}
  for(let r of this.footers){app.footers.push(r);}
  /* fake loader -- development only */
  if(GLOBALS.fakeloader){
    await app.sleep(1200);
    let progress=document.querySelector('.progress'),
      span=document.querySelector('span');
    await app.fakeLoader(e=>{
      progress.setAttribute('max',e.total);
      progress.setAttribute('value',e.loaded);
      span.innerText=e.loaded+'% Loading...';
    },12);
    span.innerText='Completed.';
  }
  /* go for main element */
  this.elements(app);
  /* initialize the app */
  app.init();
};
/* start the blog */
return this.init();
};


