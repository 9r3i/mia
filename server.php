<?php
/* calling using anonymous class */
new class{
  protected $error=true;
  function __construct(){
    /* globalize as $_BOOT */
    global $_BOOT;
    $_BOOT=$this;
    /* load mia file */
    $file=__DIR__.'/private/mia/mia.php';
    if(is_file($file)){
      $result=$this->error
        ?require_once($file)
        :@require_once($file);
      /* initialize mia */
      new mia(
        __DIR__, // root directory for private and public
      );
    }
    /* send error message */
    $message='Failed to load mia.';
    if(!headers_sent()){
      header('content-type: text/plain');
      header('content-length: '.strlen($message));
    }
    exit($message);
  }
};


