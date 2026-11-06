<?php
/* check table */
if(!isset($_POST['table'])){
  return false;
}
$table=$_POST['table'];
unset($_POST['table']);
/* topic */
if($table=='topic'){
  return topic($_POST);
}
/* quiz */
if($table=='quiz'){
  return quiz($_POST);
}
/* score */
if($table=='score'){
  return score($_POST);
}
/* exam */
if($table=='exam'){
  return exam($_POST);
}
/* -------------------- */
/* exam */
function exam($post){
  if(!isset($post['method'],$post['tid'])
    ||!isset($post['username'],$post['minute'])){
    return false;
  }
  $now=ceil(microtime(true)*1000);
  $minute=intval($post['minute']);
  $def=[
    'username'=>$post['username'],
    'tid'=>$post['tid'],
    'time'=>$now,
    'expired'=>$now+($minute*60*1000),
  ];
  $dir=dirname(dirname(__DIR__));
  $path=$dir.'/public/files/db/exam/'
    .$post['username'].'.'.$post['tid'].'.json';
  if(!is_file($path)){
    file_put_contents($path,json_encode($def));
  }
  $raw=file_get_contents($path);
  $data=@json_decode($raw,true);
  if(!is_array($data)){return false;}
  if($post['method']=='start'){
    return $data;
  }
  return false;
}
/* topic */
function topic($post){
  if(!isset($post['method'],$post['id'])){
    return false;
  }
  $dir=dirname(dirname(__DIR__));
  $path=$dir.'/public/files/db/topic.json';
  if(!is_file($path)){return false;}
  $raw=file_get_contents($path);
  $data=@json_decode($raw,true);
  if(!is_array($data)){return false;}
  $key=null;
  foreach($data as $k=>$val){
    if($val['id']==$post['id']){
      $key=$k;
      break;
    }
  }
  $method=$post['method'];
  unset($post['method']);
  if($method=='delete'){
    if($key==null){return false;}
    unset($data[$key]);
  }
  elseif($method=='edit'){
    if($key==null){return false;}
    $data[$key]=$post;
  }
  elseif($method=='add'){
    if($key!=null){return false;}
    $data[]=$post;
  }else{
    return false;
  }
  $data=array_values($data);
  $json=@json_encode($data);
  return file_put_contents($path,$json)?true:false;
}
/* quiz */
function quiz($post){
  if(!isset($post['method'],$post['tid'])){
    return false;
  }
  $dir=dirname(dirname(__DIR__));
  $path=$dir.'/public/files/db/quiz/'.$post['tid'].'.json';
  if(!is_file($path)){
    file_put_contents($path,'[]');
  }
  unset($post['tid']);
  $raw=file_get_contents($path);
  $data=@json_decode($raw,true);
  if(!is_array($data)){return false;}
  $method=$post['method'];
  unset($post['method']);
  if($method=='get'){return $data;}
  if(!isset($post['id'])){return false;}
  $key=null;
  foreach($data as $k=>$val){
    if($val['id']==$post['id']){
      $key=$k;
      break;
    }
  }
  if($method=='delete'){
    if($key==null){return false;}
    unset($data[$key]);
  }
  elseif($method=='edit'){
    if($key==null){return false;}
    $data[$key]=$post;
  }
  elseif($method=='add'){
    if($key!=null){return false;}
    $data[]=$post;
  }else{
    return false;
  }
  $data=array_values($data);
  $json=@json_encode($data);
  return file_put_contents($path,$json)?true:false;
}
/* score */
function score($post){
  if(!isset($post['username'],$post['tid'],$post['score'])){
    return false;
  }
  $dir=dirname(dirname(__DIR__));
  $path=$dir.'/public/files/db/score.json';
  if(!is_file($path)){return false;}
  $raw=file_get_contents($path);
  $data=@json_decode($raw,true);
  if(!is_array($data)){return false;}
  $username=$post['username'];
  $tid=$post['tid'];
  $score=$post['score'];
  if(!isset($data[$username])){
    $data[$username]=[];
  }
  if(isset($data[$username][$tid])){
    return false;
  }
  $data[$username][$tid]=intval($score);
  $json=@json_encode($data);
  return file_put_contents($path,$json)?true:false;
}


