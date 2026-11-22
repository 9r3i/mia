<?php
$file=$argv[1]??'';
$get=file_get_contents($file);
$ptrn='/^data:(image\/[^;]+);base64,/';
preg_match($ptrn,$get,$match);
$mime=$match[1];
$raw=preg_replace($ptrn,'',$get);
$ext=preg_replace('/^image\//','',$mime);
$ofile=preg_replace('/\.[a-z0-9]+$/','.'.$ext,$file);
$data=base64_decode($raw);
$put=file_put_contents($ofile,$data);
echo "$put\n";
