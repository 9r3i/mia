<?php
/* setup default directory */
$dir='files/upload/';
if(!is_dir($dir)){
  @mkdir($dir,0755,true);
}

/* set ini upload */
ini_set('upload_max_filesize','32M');

/* scan */
if(isset($_POST['scan'])){
  $files=[];
  $scan=@scandir($dir);
  foreach($scan as $file){
    $files[]=[
      'name'=>$file,
      'path'=>$dir.$file,
      'size'=>@filesize($dir.$file),
      'modified'=>@filemtime($dir.$file),
    ];
  }
  return $files;
}
/* info */
elseif(isset($_POST['info'])){
  $file=$dir.$_POST['info'];
  if(!is_file($file)){
    return false;
  }
  return [
    'name'=>basename($file),
    'path'=>$file,
    'size'=>@filesize($file),
    'modified'=>@filemtime($file),
  ];
}
/* upload */
elseif(isset($_POST['upload'],$_FILES['file'])){
  @move_uploaded_file($_FILES['file']['tmp_name'],$dir.$_FILES['file']['name']);
  return $_FILES;
}
/* rename */
elseif(isset($_POST['rename'],$_POST['file'])){
  return @rename($dir.$_POST['file'],$dir.$_POST['rename']);
}
/* delete */
elseif(isset($_POST['delete'],$_POST['file'])){
  $file=$dir.$_POST['file'];
  if(is_file($file)){
    @unlink($file);
  }
  return true;
}
/* invalid */
else{
  return 'Invalid request.';
}



/* --------------------------------------------- */
  /* explore */
  function explore(string $d='.'){
    $d=str_replace('\\','/',$d);
    $d.=substr($d,-1)!='/'?'/':'';
    $s=scandir($d);
    $r=[];
    foreach($s as $f){
      if(is_link($d.$f)||in_array($f,['.','..'])){
        continue;
      }elseif(is_dir($d.$f)){
        $n=explore($d.$f);
        $r=array_merge($r,$n);
      }else{
        $r[]=$d.$f;
      }
    }
    return $r;
  }


