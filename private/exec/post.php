<?php
/* check the id */
if(!isset($_POST['id'])){
  return false;
}

/* get data from file */
$file='files/db/posts.json';
$json=@file_get_contents($file);
$data=@json_decode($json,true);

/* find the key of data */
$key=array_find_key($data,function($d){
  return $d['id']==$_POST['id'];
});

/* delete */
if(isset($_POST['delete'])){
  if($key===null){
    return false;
  }
  $ndata=[];
  foreach($data as $d){
    if($d['id']!=$_POST['id']){
      $ndata[]=$d;
    }
  }
  $data=$ndata;
}
/* add */
elseif($key===null){
  $data[]=$_POST;
}
/* edit */
else{
  $data[$key]=$_POST;
}
/* save it */
$put=@file_put_contents($file,@json_encode($data));
return $put?true:false;


