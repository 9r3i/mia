<?php
/**
 * mia
 * ~ m... i... a...
 * authored by 9r3i
 * https://github.com/9r3i
 * first idea at october 2015
 * continued at october 7th 2026
 * @usage: new mia(__DIR__);
 **/

/* mia class */
// #[\AllowDynamicProperties]
class mia{
  const version='2.1.0';
  private $config;
  private $private;
  private $public;
  private $libdir;
  private $execdir;
  /* initialize */
  public function __construct(string $dir=''){
    /* config default */
    $config=new data([
      'server'=>[
        'private'=>'private/',
        'public'=>'public/',
        'libdir'=>'lib/',
        'execdir'=>'exec/',
        'log'=>false,
        'autoload'=>false,
        'php'=>false,
        'error'=>false,
      ],
      'route'=>[
      ],
      'constant'=>[
        'MIA_VERSION'=>$this::version,
      ],
    ]);
    $route=[];
    /* root directory */
    $dir=$dir!=''?$dir:dirname(get_included_files()[0]);
    $dir=str_replace('\\','/',$dir);
    $dir.=substr($dir,-1)!='/'?'/':'';
    $ini=[];
    $cfile=$dir.'mia.ini';
    /* config file */
    if(is_file($cfile)){
      $ini=@parse_ini_file($cfile,true);
      $ini=is_array($ini)?$ini:[];
    }
    $dval=['yes','on','1','true'];
    $skey=['private','public','libdir','execdir'];
    $bkey=['log','autoload','php','error'];
    $server=$ini['server']??[];
    $route=$ini['route']??[];
    $constant=$ini['constant']??[];
    $route=array_merge($config->route->toArray(),$route);
    $constant=array_merge($config->constant->toArray(),$constant);
    $config->route=new data($route);
    $config->constant=new data($constant);
    /* string disrectory config */
    foreach($skey as $key){
      if(isset($server[$key])){
        $config->server->{$key}=preg_replace('/[\/]+$/','',str_replace('\\','/',$server[$key])).'/';
      }
    }
    /* bool config */
    foreach($bkey as $key){
      if(isset($server[$key])
        &&in_array(strtolower($server[$key]),$dval)){
        $config->server->{$key}=true;
      }
    }
    /* constant config */
    foreach($constant as $key=>$value){
      defined($key) or define($key,$value);
    }
    /* config directory */
    $this->private=$dir.$config->server->private;
    $this->public=$dir.$config->server->public;
    $this->libdir=$this->private.$config->server->libdir;
    $this->execdir=$this->private.$config->server->execdir;
    $this->config=$config;
    /* change work directory */
    if(is_dir($this->public)){
      chdir($this->public);
    }
    $_SERVER['DOCUMENT_ROOT']=$this->public;
    $_SERVER['SCRIPT_FILENAME']=$this->public;
    $_SERVER['SERVER_SOFTWARE']='9r3i\\mia '.$this::version
      .'; '.$_SERVER['SERVER_SOFTWARE'];
    /* default header */
    if(!headers_sent()){
      /* set powered header */
      header('X-Powered-By: 9r3i\\mia '.$this::version);
      header('Content-type: text/plain; charset=utf-8;');
    }
    /* save the log */
    if($config->server->log){
      $this->log();
    }
    /* prepare auto-load library */
    if($config->server->autoload){
      $this->autoload();
    }
    /* exec request */
    if(isset($_POST['exec'],$_POST['key'])){
      /* login to get key */
      if($_POST['exec']=='login'
        &&$_POST['key']=='9r3i\\mia'
        &&isset($_POST['username'],$_POST['password'])){
        /* verify username and password */
        if(!$this->verify($_POST['username'],$_POST['password'])){
          return $this->result('Invalid username or password.',401);
        }
        /* send the key */
        return $this->result(
          @json_encode(
            $this->ukey($_POST['username']),
            JSON_PRETTY_PRINT
          )
        );
      }
      /* register */
      if($_POST['exec']=='register'
        &&$_POST['key']=='9r3i\\mia'
        &&isset($_POST['nusername'],$_POST['npassword'])
        &&isset($_POST['cpassword'],$_POST['cword'])){
        /* verify username and password */
        $result=$this->register($_POST);
        /* send the key */
        return $this->result(
          @json_encode(
            $result,
            JSON_PRETTY_PRINT
          )
        );
      }
      /* invalid key */
      if(!$this->vkey($_POST['key'])){
        return $this->result('Invalid key.',401);
      }
      /* revert credential */
      $exec=$_POST['exec'];
      /* remove credential */
      unset($_POST['key']);
      unset($_POST['exec']);
      unset($_POST['user']);
      /* prepare execution file */
      $method=preg_replace('/[^a-z0-9_]/i','_',$exec);
      $file=$this->execdir.$method.'.php';
      $result=null;
      /* check the file */
      if(is_file($file)){
        /* execute the file */
        $result=$config->server->error
          ?require_once($file)
          :@require_once($file);
      }
      /* send the result */
      return $this->result(
        @json_encode($result,JSON_PRETTY_PRINT)
      );
    }
    /* file request */
    if(isset($_SERVER['REQUEST_URI'],$_SERVER['REQUEST_METHOD'])){
      /* get file name */
      $file=substr(explode('?',$_SERVER['REQUEST_URI'])[0],1);
      /* route path */
      if(array_key_exists($file,$route)){
        $file=$route[$file];
      }
      /* execute php if allowed */
      if(preg_match('/\.php$/',$file)&&$config->server->php
        &&is_file($this->public.$file)){
        $result=$config->server->error
          ?require_once($this->public.$file)
          :@require_once($this->public.$file);
        return $this->result(
          @json_encode($result,JSON_PRETTY_PRINT)
        );
      }
      /* method get only */
      if(strtoupper($_SERVER['REQUEST_METHOD'])=='GET'){
        /* read the file */
        return $this->read($file);
      }
    }
    /* default error */
    return $this->result('Invalid request.',400);
  }
  /* log --> $this->private */
  private function log(){
    $o=@fopen($this->private.'access.log','ab+');
    $d=[
      date('Y-m-d H:i:s'),
      $_SERVER['REQUEST_METHOD'],
      $_SERVER['REMOTE_ADDR'].':'.$_SERVER['REMOTE_PORT'],
      $_SERVER['HTTP_USER_AGENT'],
      $_SERVER['REQUEST_URI'],
      json_encode($_POST),
    ];
    fwrite($o,implode('|',$d)."\n");
    fclose($o);
    return true;
  }
  /* register autoload --> $this->libdir */
  private function autoload(){
    spl_autoload_register(function($cn){
      /* prepare class' path */
      $libPath=str_replace('\\','/',$cn);
      /* set library files location */
      $libCOB=$this->libdir.$libPath.'.cob.php';
      $libFile=$this->libdir.$libPath.'.php';
      /* check loaded library */
      if(class_exists($cn,false)){
        return false;
      }
      /* check cob file first then normal file */
      $libToLoad=false;
      if(is_file($libCOB)){
        $libToLoad=$libCOB;
      }elseif(is_file($libFile)){
        $libToLoad=$libFile;
      }else{
        return false;
      }
      /* load the file */
      if($this->config->server->error){
        require_once($libToLoad);
      }else{
        @require_once($libToLoad);
      }
      /* return as true */
      return true;
    });
  }
  /* read --> method: mimeType --> $this->public */
  private function read(string $file){
    /* full path */
    $file=$this->public.$file;
    /* check if its a directory */
    if(is_dir($file)){
      $file=$file.(substr($file,-1)!='/'?'/':'').'index.html';
    }
    /* check the file */
    if(!is_file($file)){
      return $this->result('File doesn\'t exist.',404);
    }
    /* get mime type of the file */
    $mime=$this->mimeType($file);
    /* download request */
    $isdown=isset($_GET['download'])?true:false;
    /* prepare file name */
    $name=sprintf('"%s"',addcslashes(basename($file),'"\\'));
    /* prepare file size */
    $size=@filesize($file);
    /* modified time in GMT */
    $mtime=@gmdate('D, d M Y H:i:s',@filemtime($file)).' GMT';
    /* disposition */
    $dispo=$isdown?'attachment':'inline';
    /* prepare byte range for partial content response */
    $start=0;
    $finish=$size;
    if(isset($_SERVER['HTTP_RANGE'])
      &&preg_match('/bytes=(\d+)-(\d+)?/',$_SERVER['HTTP_RANGE'],$a)){
      if($size>PHP_INT_MAX){
        /* using floatval: to prevent PHP_INT_MAX filesize on fseek */
        $start=floatval($a[1]);
        $finush=isset($a[2])?floatval($a[2]):$size;
      }else{
        $start=intval($a[1]);
        $finish=isset($a[2])?intval($a[2]):$size;
      }
    }
    /* set headers */
    if($this->responseHeaders($mime)){
      if($isdown){header('Content-Description: File Transfer');}
      /* default: inline or attachment */
      header('Content-Disposition: '.$dispo.'; filename='.$name);
      header('Last-Modified: '.$mtime);
      /* default: binary or gzip */
      header('Content-Transfer-Encoding: binary, gzip');
      /* default: Keep-Alive or Close */
      header('Connection: Keep-Alive');
      /* default: must-revalidate, max-age=0, post-check=0, pre-check=0 */
      header('Cache-Control: must-revalidate, max-age=0, post-check=0, pre-check=0');
      header('Expires: '.@gmdate('D, d M Y H:i:s',time()+(60*60)).' GMT');
      /* default: public|store|no-store|no-cache */
      header('Pragma: no-cache');
      /* set bytes */
      header('Accept-Ranges: bytes');
      header('Content-Range: bytes '.$start.'-'.$finish.'/'.$size);
      /* set partial content response */
      if($start>0||$finish<$size){
        header('HTTP/1.1 206 Partial Content');
      }else{
        header('HTTP/1.1 200 OK');
      }
      /* optional condition: connection_status()==0 */
      header('Content-Length: '.($finish-$start));
    }
    /* look for server method head only */
    if(strtoupper($_SERVER['REQUEST_METHOD'])=='HEAD'){
      exit;
    }
    /* replacement mode for text only */
    if(preg_match('/\.(html|css|js)$/',$file)){
      $content=@file_get_contents($file);
      $ifile=preg_replace('/\.(.*)$/','.ini',$file);
      if(is_file($ifile)){
        $ini=@parse_ini_file($ifile);
        $ini=is_array($ini)?$ini:[];
        $replacement=[];
        foreach($ini as $key=>$value){
          $replacement[$key]=$value;
          if(preg_match('/^\@/',$value)){
            $vfile=$this->public.substr($value,1);
            if(is_file($vfile)){
              $get=@file_get_contents($vfile);
              $replacement[$key]=$get;
            }
          }
        }
        $content=strtr($content,$replacement);
      }
      /* reset for replacement */
      header('Content-Length: '.strlen($content));
      exit($content);
    }
    /* open the file */
    $resource=@fopen($file,'rb');
    if(!is_resource($resource)){
      exit;
    }
    /* set the pointer into start point */
    fseek($resource,$start);
    /* start loop reading */
    while(!feof($resource)){
      /* read, print and flush */
      $raw=fread($resource,1024);
      print($raw);
      flush();
      /* break when finish */
      if(ftell($resource)>=$finish){break;}
    }
    /* close the file */
    fclose($resource);
    exit;
  }
  /* verify --> $this->private */
  private function verify(string $username,string $password){
    $user=preg_replace('/[^a-z0-9_]/i','_',$username);
    $file='users/'.$user.'.txt';
    if(!is_file($this->private.$file)){
      return false;
    }
    $hash=@file_get_contents($this->private.$file);
    return @password_verify($password,$hash)?true:false;
  }
  /* register --> $this->private */
  private function register(array $post){
    if(!preg_match('/^[a-z0-9_]+$/',$post['nusername'])){
      return 'Invalid username.';
    }
    if($post['npassword']!==$post['cpassword']){
      return 'Password doesn\'t match.';
    }
    if($post['cword']!=strtolower(date('l'))){
      return 'Invalid code word.';
    }
    $file=$this->private.'users/'.$post['nusername'].'.txt';
    if(is_file($file)){
      return 'Username has been taken.';
    }
    $pswd=password_hash($post['cpassword'],1);
    $put=@file_put_contents($file,$pswd);
    return $put?'OK':'Failed to register.';
  }
  /* print result --> method: responseText, responseHeaders */
  private function result(string $s='',int $c=200,string $m='text/plain'){
    $t=$this->responseText($c);
    if($this->responseHeaders($m)){
      header('HTTP/1.1 '.$c.' '.$t);
      header('Content-Length: '.strlen($s));
    }exit($s);
  }
  /* verify key -- [stand-alone] */
  private function vkey(string $key){
    $ptrn='/^9r3i\\\\mia\\\\key'
      .'\(([a-z0-9_]+):([a-z0-9]+)\)\@(.*)$/';
    if(!preg_match($ptrn,$key,$match)){
      return false;
    }
    $hash=base64_encode(md5($match[1].':'.$match[2],true));
    $time=base_convert($match[2],36,10);
    return $hash==$match[3]&&$time>time();
  }
  /* user key -- [stand-alone] */
  private function ukey(string $username){
    $user=preg_replace('/[^a-z0-9_]/i','_',$username);
    $time=base_convert(time()+86400,10,36);
    $base=$user.':'.$time;
    return '9r3i\\mia\\key('.$base.')@'
      .base64_encode(md5($base,true)).'';
  }
  /* default api headers -- [stand-alone] */
  private function responseHeaders(string $mime='text/plain'){
    /* check sent headers */
    if(headers_sent()){return false;}
    /* access control - to allow the access via ajax */
    header('Access-Control-Allow-Origin: *'); /* allow origin */
    header('Access-Control-Allow-Headers: Content-Type, Accept'); /* allow headers */
    header('Access-Control-Allow-Methods: POST, GET, OPTIONS, HEAD'); /* allow methods */
    header('Access-Control-Allow-Credentials: true'); /* allow credentials */
    header('Access-Control-Max-Age: 86400'); /* max age (24 hours) */
    /* set default content type of response header */
    $charset=preg_match('/^text/',$mime)
      ?'; charset=utf-8;':'';
    header('Content-Type: '.$mime.$charset);
    /* checking options */
    if(isset($_SERVER['REQUEST_METHOD'])
      &&strtoupper($_SERVER['REQUEST_METHOD'])=='OPTIONS'){
      header('Content-Language: en-US');
      header('Content-Encoding: gzip');
      header('Content-Length: 0');
      header('Vary: Accept-Encoding, Origin');
      header('HTTP/1.1 200 OK');
      exit;
    }return true;
  }
  /* default response text -- [stand-alone] */
  private function responseText(int $e){
    $c=[
      100=>'Continue',
      101=>'Switching Protocols',
      200=>'OK',
      201=>'Created',
      202=>'Accepted',
      203=>'Non-Authoritative Information',
      204=>'No Content',
      205=>'Reset Content',
      206=>'Partial Content',
      300=>'Multiple Choices',
      301=>'Moved Permanently',
      302=>'Moved Temporarily',
      303=>'See Other',
      304=>'Not Modified',
      305=>'Use Proxy',
      400=>'Bad Request',
      401=>'Unauthorized',
      402=>'Payment Required',
      403=>'Forbidden',
      404=>'Not Found',
      405=>'Method Not Allowed',
      406=>'Not Acceptable',
      407=>'Proxy Authentication Required',
      408=>'Request Time-out',
      409=>'Conflict',
      410=>'Gone',
      411=>'Length Required',
      412=>'Precondition Failed',
      413=>'Request Entity Too Large',
      414=>'Request-URI Too Large',
      415=>'Unsupported Media Type',
      500=>'Internal Server Error',
      501=>'Not Implemented',
      502=>'Bad Gateway',
      503=>'Service Unavailable',
      504=>'Gateway Time-out',
      505=>'HTTP Version not supported',
    ];
    return isset($c[$e])?$c[$e]:'';
  }
  /* default mime types -- [stand-alone] */
  private function mimeType(string $f){
    $t=[
      'txt'=>'text/plain',
      'log'=>'text/plain',
      'ini'=>'text/plain',
      'html'=>'text/html',
      'css'=>'text/css',
      'php'=>'text/plain',
      'phpx'=>'application/x-httpd-php',
      'js'=>'application/javascript',
      'json'=>'application/json',
      'xml'=>'application/xml',
      'mp4'=>'video/mp4',
      'webm'=>'video/webm',
      'mp3'=>'audio/mpeg',
      'wav'=>'audio/wav',
      'ogg'=>'audio/ogg',
      'png'=>'image/png',
      'jpeg'=>'image/jpeg',
      'jpg'=>'image/jpeg',
      'gif'=>'image/gif',
      'webp'=>'image/webp',
      'zip'=>'application/zip',
      'rar'=>'application/x-rar-compressed',
      'pdf'=>'application/pdf',
      'ttf'=>'font/truetype',
    ];
    $r='application/octet-stream';
    if(!preg_match('/\.([a-z0-9]+)$/',$f,$x)){
      return $r;
    }return array_key_exists($x[1],$t)?$t[$x[1]]:$r;
  }
}

/* data class for dynamic object */
#[\AllowDynamicProperties]
class data{
  function __construct(array $data=[]){
    foreach($data as $key=>$value){
      if(is_array($value)){
        $this->{$key}=new $this($value);
      }else{
        $this->{$key}=$value;
      }
    }
  }
  public function toArray(){
    $result=[];
    foreach($this as $key=>$value){
      $result[$key]=$value;
    }
    return $result;
  }
}


