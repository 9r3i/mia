
/* error message -- for development only */
window.addEventListener('error',function(e){
  let errorText=[
    e.message,
    'URL: ' + e.filename,
    'Line: ' + e.lineno + ', Column: ' + e.colno,
    'Stack: ' + (e.error && e.error.stack || '(no stack trace)')
  ].join('\n');
  alert(errorText);
  console.error(errorText);
});//*/

const FBUSER={
  uid:null,
  email:null,
};

/* initialize */
;(async function(){
  let ready=await onFunctionReady('Firebase');
  if(!ready){
    document.body.innerHTML='error -- '+(typeof Firebase);
    return;
  }
  document.body.innerHTML='ok -- '+ready+' -- '+(typeof Firebase);
  let cnf='eyJhcGlLZXkiOiJBSXphU3lET0FNMnB4bEZnai1mZUdhbHBlZjhHMEl0dEktYklXeTQiLCJhdXRoRG9tYWluIjoiaGVscGVyLTYyZmEwLmZpcmViYXNlYXBwLmNvbSIsImRhdGFiYXNlVVJMIjoiaHR0cHM6Ly9oZWxwZXItNjJmYTAtZGVmYXVsdC1ydGRiLmFzaWEtc291dGhlYXN0MS5maXJlYmFzZWRhdGFiYXNlLmFwcCIsInByb2plY3RJZCI6ImhlbHBlci02MmZhMCIsInN0b3JhZ2VCdWNrZXQiOiJoZWxwZXItNjJmYTAuZmlyZWJhc2VzdG9yYWdlLmFwcCIsIm1lc3NhZ2luZ1NlbmRlcklkIjoiMzEyNjUxMTQ5NjQ0IiwiYXBwSWQiOiIxOjMxMjY1MTE0OTY0NDp3ZWI6MzVhZGFiZDYyZDI5MDRjNmNjNWZlOSIsIm1lYXN1cmVtZW50SWQiOiJHLVNXNkVLMTFDSjYifQ==',
  fb=new Firebase(cnf);
  fb.userinfo(async user=>{
    pro('ok2');
    if(user){
      pro('Logged in',user);
      FBUSER.uid=user.uid;
      FBUSER.email=user.email;
      div('button').text('Logout')
        .appendTo(document.body)
        .clickOn(async function(){
        pro(await logout());
      });
    }else{
      pro('Logged out');
      div('button').text('Login with Google')
        .appendTo(document.body)
        .clickOn(async function(){
        await loginGoogle(pro,pro);
      });
    }
    pro('ok3');
  });
  pro('loading...');
  let read=await fb.read('posts');
  pro('loaded');
  pro(read);
  /*
  pro(await fb.write('posts',[
    {id:1,title:'judul',content:'content'},
    {id:2,title:'judul',content:'content'},
    {id:3,title:'judul',content:'content'},
  ]));
  */
  
  
})();

/* ===================[ basic ]=================== */

/* html pre dom -- @require: likeJSON */
function pro(){
  let res=[];
  for(let s of arguments){
    res.push(typeof s==='string'?s:likeJSON(s,3));
  }
  let el=document.createElement('pre'),
  content=document.querySelector('.content');
  if(content){
    content.append(el);
  }else{
    document.body.append(el);
  }
  el.innerText=res.join(' -- ');
  el.style.border='1px solid #ccc';
  el.style.padding='5px';
  el.style.margin='5px';
  el.style.color='#555';
  el.style.whiteSpace='pre-wrap';
  el.style.wordBreak='break-all';
  el.style.fontSize='13px';
  return el;
}

/* sleep -- standalone */
function sleep(ms){
  return new Promise(resolve=>{
    setTimeout(resolve,ms);
  });
}

/* element creator -- standalone */
function div(name='div',attr={},children=[]){
  name=typeof name==='string'?name.toLowerCase():'div';
  attr=typeof attr==='object'&&attr!==null?attr:{};
  children=Array.isArray(children)?children:[];
  let main=document.createElement(name),
  notext=['option','a'];
  /* set attributes */
  for(let k in attr){
    main.setAttribute(k,attr[k]);
  }
  /* add children */
  for(let child of children){
    main.append(child);
  }
  /* add object property and method */
  main.attr=attr;
  main.html=function(html=''){
    this.innerHTML=html;
    return this;
  };
  main.text=notext.indexOf(name)>=0?''
    :function(text=''){
    this.innerText=text;
    return this;
  };
  main.content=function(content=''){
    this.textContent=content;
    return this;
  };
  main.appendTo=function(el){
    if(typeof el==='object'&&el!==null
    &&typeof el.append==='function'){
      el.append(this);
    }return this;
  };
  main.clickOn=function(cb){
    if(typeof cb==='function'){
      this.addEventListener('click',cb,false);
    }return this;
  };
  main.on=function(ev,cb){
    cb=typeof cb==='function'?cb:function(){};
    this.addEventListener(ev,cb,false);
    return this;
  };
  /* return the element object */
  return main;
}

/* parse object to json string -- standalone */
function likeJSON(obj,limit,space,pad){
  let rtext='';  
  space=space?parseInt(space,0xa):0x0;
  limit=limit?parseInt(limit,0xa):0x1;
  pad=pad?parseInt(pad,0xa):0x2;
  if((typeof obj==='object'&&obj!==null)
    ||Array.isArray(obj)){
    let start=Array.isArray(obj)?'[':'{',
        end=Array.isArray(obj)?']':'}';
    if(space==0x0){
      rtext+=(' ').repeat(pad*space)+''+start+'\r\n';
    }
    let len=0,counter=0;
    for(let i in obj){
      if(obj.hasOwnProperty(i)){len++;}
    }
    for(let i in obj){
      counter++;
      let comma=counter<len?',':'',e=obj[i],espace=space+2;
      if((typeof e==='object'&&e!==null)
        ||Array.isArray(e)){
        let estart=Array.isArray(e)?'[':'{',
            eend=Array.isArray(e)?']':'}',
            k=start==='{'?'"'+i+'": ':'';
        rtext+=(' ').repeat(pad*espace)+''+k+estart+'\r\n';
        if((espace/2)<limit){
          rtext+=likeJSON(e,limit,espace,pad);
        }else{
          rtext+=(' ').repeat(pad*(espace+2))
            +'[***LIMITED:'+limit+'***]\r\n';
        }
        rtext+=(' ').repeat(pad*espace)+''+eend+comma+'\r\n';
      }else if(typeof e==='string'||typeof e==='number'){
        let k=typeof e==='number'?e.toString():JSON.stringify(e);
        i=start==='{'?'"'+i+'": ':'';
        rtext+=(' ').repeat(pad*espace)+''+i+k+comma+'\r\n';
      }else if(typeof e==='boolean'){
        let k=e===true?'true':'false';
        i=start==='{'?'"'+i+'": ':'';
        rtext+=(' ').repeat(pad*espace)+''+i+k+comma+'\r\n';
      }else if(e===null){
        i=start==='{'?'"'+i+'": ':'';
        rtext+=(' ').repeat(pad*espace)+''+i+'null'+comma+'\r\n';
      }else{
        let k='"['+(typeof e)+']"';
        i=start==='{'?'"'+i+'" : ':'';
        rtext+=(' ').repeat(pad*espace)+''+i+k+comma+'\r\n';
      }
    }
    if(space==0){
      rtext+=(' ').repeat(pad*space)+''+end+'\r\n';
    }
  }else if(typeof obj==='string'){
    rtext+=(' ').repeat(pad*space)+'"'+obj+'"\r\n';
  }else if(typeof obj==='number'){
    rtext+=(' ').repeat(pad*space)+''+obj.toString()+'\r\n';
  }else if(typeof obj==='boolean'){
    rtext+=(' ').repeat(pad*space)+''+(obj===true
      ?'true':'false')+'\r\n';
  }else if(obj===null){
    rtext+=(' ').repeat(pad*space)+'null\r\n';
  }else{
    rtext+=(' ').repeat(pad*space)+'"['+(typeof obj)+']"\r\n';
  }return rtext;
};

/* onFunctionReady */
function onFunctionReady(fn){
  return new Promise(resolve=>{
    return onFunctionReadyCB(fn,resolve);
  });
}

/* onFunctionReadyCB */
function onFunctionReadyCB(fn,cb,i=0){
  cb=typeof cb==='function'?cb:function(){};
  return setTimeout(e=>{
    if(window.hasOwnProperty(fn)
      &&typeof window[fn]==='function'){
      return cb(true);
    }else if(i>1000){
      return cb(false);
    }return onFunctionReadyCB(fn,cb,i+1);
  },1);
}

/* ago hours */
function agoHours(date='2018-08-21'){
    let bstart=(new Date(date)).getTime(),
    bsecond=bstart/1000,
    bhour=bsecond/3600,
    now=(new Date).getTime(),
    nowSecond=now/1000,
    nowHour=nowSecond/3600,
    hours=Math.ceil(nowHour-bhour).toString();
  return hours;
}

/* ago days */
function agoDays(date='2012-04-08'){
    let bstart=(new Date(date)).getTime(),
    bsecond=bstart/1000,
    bhour=bsecond/3600,
    bday=bhour/24,
    now=(new Date).getTime(),
    nowSecond=now/1000,
    nowHour=nowSecond/3600,
    nowDay=nowHour/24,
    days=Math.ceil(nowDay-bday).toString(16);
  return days;
}

/*

Nama Asli: Luthfie Al Ansháry
Lahir dan dibesarkan di Bandung.

Berasal dari keluarga yang sangat sederhana disebuah kampung yang tenang dan sangat sederhana pula. Kampung yang jauh dari teknologi, meski akhirnya sekarang kampung tersebut melek dengan teknologi.</div></div>Ketertarikan saya pada komputer sudah dimulai sejak masih SD kelas 5, hanya bisa rental komputer, gak mampu beli. Dan memang sampai sekarang gak mampu beli, apalagi yang spek tinggi buat <em>games</em>, wah sudah gak bakal kesampaian.

Sempat ngiri lihat teman-teman sekolah yang bisa beli komputer, rasanya ingin juga bisa merasakan seperti mereka. Bahkan saya sempat nabung biar bisa beli komputer, belain gak jajan, disisihkan sehari seribu perak, tapi apa daya, saat itu orang tua gak bisa bayar spp, dan akhirnya tabungan habis untuk bayar spp.

Pernah, untuk pertama kalinya dibelikan komputer murah tahun 2007 pentium 3, tapi bukan untuk <em>programming</em>, malah untuk <em>compose</em> musik dan mengembangkan bakat dibidang tersebut, maklum lah bakat musik juga sudah berakar dari usia SMP. Itupun tak lama, setelah beberapa bulan tak menghasilkan dari komputer, komputer pun dijual dan tidak membekas sama sekali.

Barulah, setelah bekerja di sebuah perusahaan HR, perusahaan tersebut menyediakan komputer, dan mulai belajar <em>programming</em> sejak saat itu. Tepatnya bulan April tahun 2012 hingga sekarang masih belajar.

Sudah beberapa website, aplikasi, <em>project</em> dan juga <em>software</em> yang sudah dibuat, kebanyakan untuk <em>client</em>. Jadi, kebanyakan yang tidak bisa atau tidak boleh di<em>share</em> ke publik.

Tahun 2020, tepatnya bulan September, saya mengundurkan diri dari perusahaan HR tersebut sebagai <em>IT Programmer</em> dan <em>Software Engineer</em>. Dengan alasan ingin kerja diperusahaan lain. Tapi sebenarnya adalah perusahaan sudah tidak mampu membayar saya <em>properly</em>. Ditambah lagi, perusahaan terkena dampak Corona waktu itu.

Sebagai gantinya, saya menjadi <em>freelancer</em> masih di bidang yang sama, namun lebih fokus ke aplikasi. Hingga akhirnya saya punya <em>channel</em> <strong>Playstore</strong> sendiri untuk meng<em>upload</em> aplikasi yang sudah saya buat.

Ada beberapa fakta menarik, laptop saya rusak. Percaya tidak percaya, saya kemudian menulis kode untuk berbagai aplikasi hanya dari <em>smartphone</em>, termasuk <em>Engine</em> untuk <em>website</em> ini. Itu artinya, tak ada satupun yang bisa menghentikan saya untuk menulis kode, kecuali Allah sudah takdirkan akan hal itu.

Ada beberapa aplikasi yang sudah dibuat secara publik, saya <em>upload</em> di Github, supaya lebih mudah diakses. Silahkan boleh cari di <em>Google</em> dengan <em>keyword</em> <strong>9r3i</strong>.

Dengan harapan banyak orang yang pakai, tapi apa boleh buat, sepertinya aplikasi-aplikasi yang saya buat bukan apa yang kebanyakan orang cari dan butuhkan. Mungkin atau hanya perasaan saya saja, mungkin karena aplikasi-apliaksi yang saya buat tersebut tidak semudah yang orang lain buat terutama dalam cara memakainya, itu karena saya lebih mengutamakan <em>performance</em> dan <em>security</em> ketimbang tampilan. Dan sejujurnya, saya termasuk orang yang kurang mahir dalam hal <em>design</em> dan tampilan.

Segitu dulu, selanjutnya akan saya lanjutkan kisah saya dan aplikasi-aplikasi saya di postingan website ini. In syaa Allah.

BTW, bagi yang ingin donasi, boleh transfer ke nomor rekening tertera diatas, dan itu akan sangat membantu pengembangan <em>Web-Engine</em> ini kedepannya. Dan semoga Allah menggantinya dengan yang lebih baik di dunia dan akhirat.

Barakallaahu fiikum...

*/


