/**
 * binar
 * ~ reparse string to binary
 * ~ binar bola matamu
 * authored by 9r3i
 * https://github.com/9r3i/binar.js
 * started at december 2nd 2021, on M51
 */
;function binar(pswd,off){
this.version='1.0.0';
this.off=typeof off===(0x55f57d43).toString(0x24)
  ?Math.max(off,0x00)%0xff:0x00;
this.pswd=typeof pswd===(0x67e4c42c).toString(0x24)
  ?pswd:String.raw({raw:[]});
this.decrypt=function(s){
  var r=String.raw({raw:[]}),p=this.pkey(),
      t=typeof s===(0x67e4c42c).toString(0x24)?s:r,
      x=false,i=0x00,e=false,
      g=Math.max(this.off,0x5d);
  while(i<t.length){
    var u=t.charCodeAt(i);
    if(i%g===0x00){
      r+=String.raw({raw:[]});
      q=t.substr(i,p.length);
      if(q!==p){e=true;break;}
    }else if(u===0x00){
      r+=String.fromCharCode(0x3a);
      x=true;
    }else if(x){
      x=false;
      r+=u.toString(0x24).padStart(0x04,0)
        +String.fromCharCode(0x3b);
    }else if(u>0xff){
      r+=u.toString(0x10).padStart(0x04,0);
    }else{
      r+=u.toString(0x10).padStart(0x02,0);
    }
    i+=i%g===0x00?p.length:0x01;
  }return e?false:this.decode(r);
};
this.encrypt=function(s){
  var r=String.raw({raw:[]}),p=this.pkey(),
      t=typeof s===(0x67e4c42c).toString(0x24)?this.encode(s):r;
      x=t.match(/[0-9a-f]{4}|[0-9a-f]{2}|:[0-9a-z]{4};/g),
      g=Math.max(this.off,0x5d);
  for(var i=0x00;i<x.length;i++){
    if(i%g===0x00){r+=p;}
    var u=x[i].length===0x04
         ?parseInt(x[i],0x10)
         :x[i].length===0x02
           ?parseInt(x[i],0x10)
           :parseInt(x[i].substr(1,4),0x24);
    if(x[i].length>0x04){
      r+=String.fromCharCode(0x00);
    }r+=String.fromCharCode(u);
  }return r;
};
this.decode=function(s){
  var r=String.raw({raw:[]}),
      t=typeof s===(0x67e4c42c).toString(0x24)?s:r;
      x=t.match(/[0-9a-f]{2}|:[0-9a-z]{4};/g);
  for(var i=0x00;i<x.length;i++){
    var u=x[i].length>0x02
         ?parseInt(x[i].substr(0x01,0x04),0x24)
         :parseInt(x[i],0x10);
    u+=(u-this.off)<0x00?0xff:0x00;
    r+=String.fromCharCode(u-this.off);
  }return r;
};
this.encode=function(s){
  var r=String.raw({raw:[]}),
      t=typeof s===(0x67e4c42c).toString(0x24)?s:r;
  for(var i=0x00;i<t.length;i++){
    var u=(t.charCodeAt(i)+this.off)%0xff;
    r+=u>0xff
      ?String.fromCharCode(0x3a)
      +u.toString(0x24).padStart(0x04,0)
      +String.fromCharCode(0x3b)
      :u.toString(0x10).padStart(0x02,0);
  }return r;
};
this.pkey=function(){
  var r=String.raw({raw:[]}),
      t=String.fromCharCode(0x3a)
        +this.pswd
        +String.fromCharCode(0x3b),
      p=false;
  for(var i=0x00;i<t.length;i++){
    var u=(t.charCodeAt(i)+this.off)%0xff;
    if(p===false){
      p=u.toString(0x10).padStart(0x02,0);
    }else{
      p+=u.toString(0x10).padStart(0x02,0);
      r+=String.fromCharCode(parseInt(p,0x10));
      p=false;
    }
  }
  if(p!==false){
      p+=(0x00).toString(0x10).padStart(0x02,0);
      r+=String.fromCharCode(parseInt(p,0x10));
  }return r;
};
};


