<?php
$result=[
  'this'=>$this,
  'mia::version'=>mia::version,
  'last_update'=>date('Y-m-d H:i:s',@filemtime('mia/mia.php')),
  'spent_time'=>microtime(true)-$_SERVER['REQUEST_TIME_FLOAT'],
  'loaded_files'=>get_included_files(),
  'GLOBALS'=>$GLOBALS,
];
return $result;


