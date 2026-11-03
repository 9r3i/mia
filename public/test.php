<?php
//header('content-type:text/plain');
//$this->result=true;
print_r([
  new class extends data{
    public $damn='666';
  },
  'mia::version'=>mia::version,
  'last_update'=>date('Y-m-d H:i:s',@filemtime($this->private.'mia/mia.php')),
  'spent_time'=>microtime(true)-$_SERVER['REQUEST_TIME_FLOAT'],
  'this'=>$this,
  'data'=>new data([
    'test'=>'testing',
    'tos'=>'tossing',
    'tis'=>'rose',
  ])->toArray(),
  'files'=>get_included_files(),
  'constants'=>get_defined_constants(true)['user']??[],
  'GLOBALS'=>$GLOBALS,
]);
exit;
return 0;

