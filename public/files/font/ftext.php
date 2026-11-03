<?php
$file=$argv[1]??'';
$name=$argv[2]??'';
$ofile=preg_replace('/\.[a-z0-9]+$/','.css',$file);
$get=file_get_contents($file);
$data='data:font/truetype;base64,'.base64_encode($get);
$content="
/* font-face */
@font-face{
  font-family:'{$name}';
  src:url('{$data}') format('truetype');
  font-weight:normal;
  font-style:normal;
}
";
$put=file_put_contents($ofile,$content);
echo "$put\n";
