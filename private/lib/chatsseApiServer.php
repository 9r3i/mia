<?php
/* callback [response]
 * ~ reponse for api app
 * authored by 9r3i
 * github.com/9r3i
 * started at march 12th 2018 (sse api)
 */
class chatsseApiServer{
  const version='1.0.1';
  private $methods=null;
  private $privilege=null;
  private $userID=null;
  public function __construct(){
    /* set time limit */
    @set_time_limit(false);
    /* set default timezone */
    date_default_timezone_set('Asia/Jakarta');
    /* registered methods */
    $this->methods=[
      'login','getLogs','getAllLogs','deleteAllLogs',
      'getUsers','getUser','addUser','deleteUser','editPassword','editUser','updateUser',
      'sendChat','deleteChat',
    ];
    /* server send event */
    if(isset($_GET['sse'])){
      return $this->sse();
    }
    /* start the api */
    return $this->start();
  }
  /* sse - method */
  private function sse(){
    /* load header */
    $this->header();
    /* write user log */
    $this->userlog();
    /* check access token */
    if(!isset($_GET['access_token'])){
      return $this->out('Error: Require access token.');
    }
    /* require access token for sse request */
    $token=$this->parseToken($_GET['access_token']);
    if(!$token){
      return $this->out('Error: Invalid access token.');
    }
    $this->privilege=$token->privilege;
    $this->userID=$token->uid;
    /* set default stream header */
    header("Content-Type: text/event-stream\n\n");
    /* start looping */
    return $this->sseLoop();
  }
  /* sse loop */
  private function sseLoop(){
    $kdb=$this->kdb();
    $total=0;$online=10;
    while(true){
      if($online>=3){
        $users=$kdb->query('select from "users" where */output='
          .'id,username,online,privilege,type,owner,members,time,picture');
        if(isset($users[0])){
          $out="event: online\r\n";
          $curDate=date(DATE_ISO8601);
          $out.='data: '.json_encode([
            'time'=>$curDate,
            'users'=>$users,
          ]);
          $out.="\r\n\r\n";
          print($out);
        }$online=0;
      }$online++;
      $up=$kdb->query('update into "users" where id='.$this->userID.'/online='.time());
      $chats=$kdb->query('select from "chats" where to='.$this->userID.'|from='.$this->userID);
      $chats=is_array($chats)?$chats:[];
      if(count($chats)>$total){
        $out="event: receive\r\n";
        $curDate=date(DATE_ISO8601);
        $out.='data: '.json_encode([
          'time'=>$curDate,
          'chats'=>$chats,
        ]);
        $out.="\r\n\r\n";
        print($out);
      }
      $total=count($chats);
      while(ob_get_level()>0){
        ob_end_flush();
      }flush();sleep(1);
    }return true;
  }
  
  
  /* deleteChat */
  private function deleteChat($sid=null){
    if(!isset($sid)){return 'Error: Invalid form.';}
    if(!preg_match('/^\d+$/',$sid)){return 'Error: Invalid ID.';}
    $kdb=$this->kdb();
    $del=$kdb->query('delete from "chats" where session='.$sid);
    if(!$del||$kdb->error){return 'Error: Failed to delete chat.';}
    return 'OK';
  }
  /* sendChat */
  private function sendChat($id=null,$message=null){
    if(!isset($id,$message)){return 'Error: Invalid form.';}
    if(!preg_match('/^\d+$/',$id)){return 'Error: Invalid ID.';}
    $kdb=$this->kdb();
    $session=$this->userID<$id?$this->userID.$id:$id.$this->userID;
    $ins=$kdb->query('insert into "chats" '.http_build_query([
      'to'=>$id,
      'from'=>$this->userID,
      'message'=>$message,
      'session'=>$session,
    ]));
    if(!$ins||$kdb->error){return 'Error: Failed to send message.';}
    return 'OK';
  }
  
  
  
  
  /* delete all logs */
  private function deleteAllLogs(){
    if(!$this->isAdmin()){return 'Error: Have no privilege to access this method.';}
    $kdb=$this->kdb();
    $trun=$kdb->query('truncate table "logs"');
    if(!$trun||$kdb->error){return 'Error: Failed to delete all logs.';}
    return 'OK';
  }
  /* get all logs */
  private function getAllLogs($id=null,$s=null,$l=null){
    if(!isset($id)||!preg_match('/^\d+$/',$id)){return 'Error: Invalid ID.';}
    $s=is_numeric($s)?(int)$s:0;
    $l=is_numeric($l)?(int)$l:25;
    if($this->isAdmin()){
      $kdb=$this->kdb();
      if($this->privilege=='master'){
        $sel=$kdb->query('select from "logs" where */sort=desc&order_by=id&start='.$s.'&limit='.$l);
      }else{
        $sel=$kdb->query('select from "logs" REGEXP uid=#^[1-9][0-9]*#/sort=desc&order_by=id&start='.$s.'&limit='.$l);
      }return @json_encode($sel);
    }return 'Error: Have no privilege to access this method.';
  }
  /* get logs */
  private function getLogs($id=null,$s=null,$l=null){
    if(!isset($id)||!preg_match('/^\d+$/',$id)){return 'Error: Invalid ID.';}
    $s=is_numeric($s)?(int)$s:0;
    $l=is_numeric($l)?(int)$l:25;
    if($this->isAdmin()||$this->userID==$id){
      $kdb=$this->kdb();
      if($this->privilege=='master'){
        $sel=$kdb->query('select from "logs" where */sort=desc&order_by=id&start='.$s.'&limit='.$l);
      }else{
        $sel=$kdb->query('select from "logs" where uid='.urlencode($id).'/sort=desc&order_by=id&start='.$s.'&limit='.$l);
      }return @json_encode($sel);
    }return 'Error: Have no privilege to access this method.';
  }


  /* add user */
  private function addUser($data=null){
    if(!isset($data)){return 'Error: Invalid form.';}
    if(!$this->isAdmin()){return 'Error: Have no privilege to access this method.';}
    $js=@json_decode($data,true);
    if(!isset($js['username'])){return 'Error: Failed to parse data input.';}
    $kdb=$this->kdb();
    $sel=$kdb->query('select from "users" where username='.urlencode($js['username']));
    if(isset($sel[0])){return 'Error: Username has been taken by another member.';}
    $kdb->error=false;
    $ins=$kdb->query('insert into "users" '.http_build_query($js));
    if(!$ins||$kdb->error){return 'Error: Failed to save member information.';}
    return 'OK';
  }
  /* update user */
  private function updateUser($id=null,$data=null){
    if(!isset($id,$data)){return 'Error: Invalid form.';}
    if(!preg_match('/^\d+$/',$id)){return 'Error: Invalid user ID.';}
    if(!$this->isAdmin()){
      if($this->userID!=$id){
        return 'Error: Have no privilege to access this method.';
      }
    }
    $js=@json_decode($data,true);
    if(!isset($js['username'])){return 'Error: Failed to parse data input.';}
    $kdb=$this->kdb();
    $sel=$kdb->query('select from "users" where id='.$id);
    if(!isset($sel[0])||$kdb->error){return 'Error: Member is not available.';}
    $sel=$kdb->query('select from "users" where username='.urlencode($js['username']));
    if(isset($sel[0])&&$sel[0]['id']!=$id){return 'Error: Username has been taken by another member.';}
    $kdb->error=false;
    $up=$kdb->query('update into "users" where id='.$id.'/'.http_build_query($js));
    if(!$up||$kdb->error){return 'Error: Failed to save member information.';}
    return 'OK';
  }
  /* edit user */
  private function editUser($id=null,$user=null,$priv=null){
    if(!isset($id,$user,$priv)){return 'Error: Invalid form.';}
    if(!preg_match('/^\d+$/',$id)){return 'Error: Invalid user ID.';}
    if(!$this->isAdmin()){
      if($this->privilege!=$priv){
        return 'Error: Have no privilege to access this method.';
      }
    }
    $kdb=$this->kdb();
    $sel=$kdb->query('select from "users" where id='.$id);
    if(!isset($sel[0])||$kdb->error){return 'Error: User is not available.';}
    $up=$kdb->query('update into "users" where id='.$id.'/'.http_build_query([
      'username'=>$user,
      'privilege'=>$priv,
    ]));
    if(!$up||$kdb->error){return 'Error: Failed to edit user.';}
    return 'OK';
  }
  /* edit password */
  private function editPassword($id=null,$pass=null){
    if(!isset($id)||!preg_match('/^\d+$/',$id)){return 'Error: Invalid ID.';}
    if(!is_string($pass)){return 'Error: Require new password string.';}
    if($this->isAdmin()||$this->userID==$id){
      $kdb=$this->kdb();
      $sel=$kdb->query('select from "users" where id='.urlencode($id));
      if(!isset($sel[0])){return 'Error: Failed to get user information.';}
      if($sel[0]['password']==$pass){return 'Error: Password is still the same.';}
      $up=$kdb->query('update into "users" where id='.urlencode($id).'/password='.urlencode($pass));
      if(!$up||$kdb->error){return 'Error: Failed to update password.';}
      return 'OK';
    }return 'Error: Have no privilege to access this method.';
  }
  /* delete user */
  private function deleteUser($id=null){
    if(!$this->isAdmin()){return 'Error: Have no privilege to access this method.';}
    if(!isset($id)||!preg_match('/^\d+$/',$id)){return 'Error: Invalid ID.';}
    if($id==$this->userID){return 'Error: Cannot delete self ID.';}
    $kdb=$this->kdb();
    $sel=$kdb->query('select from "users" where id='.urlencode($id));
    if(!isset($sel[0])){return 'Error: Failed to get user information.';}
    $del=$kdb->query('delete from "users" where id='.urlencode($id));
    if(!$del||$kdb->error){return 'Error: Failed to delete user.';}
    return 'OK';
  }
  /* set user */
  private function getUser($id=null){
    if(!isset($id)||!preg_match('/^\d+$/',$id)){return 'Error: Invalid ID.';}
    if($this->isAdmin()||$this->userID==$id){
      $kdb=$this->kdb();
      $sel=$kdb->query('select from "users" where id='.urlencode($id));
      if(!isset($sel[0])){return 'Error: Failed to get user information.';}
      if($this->privilege!=='master'){
        unset($sel[0]['password']);
      }return @json_encode($sel[0]);
    }return 'Error: Have no privilege to access this method.';
  }
  /* get users */
  private function getUsers(){
    $kdb=$this->kdb();
    $sel=$kdb->query('select from "users"');
    $data=$sel;$sel=[];
    foreach($data as $d){
      if($d['privilege']=='master'){continue;}
      if($this->privilege!=='master'){unset($d['password']);}
      $sel[]=$d;
    }return @json_encode($sel);
  }


  /* login - to get access token */
  private function login($user=null,$pass=null){
    if(!is_string($user)||!is_string($pass)){return 'Error: Require username and password.';}
    $kdb=$this->kdb();
    $sel=$kdb->query('select from "users" where '.http_build_query([
      'username'=>$user,
      'password'=>$pass,
    ]));
    if(!isset($sel[0])){return 'Error: Invalid username or password.';}
    $res=[
      'uid'=>$sel[0]['id'],
      'token'=>$this->token($sel[0]['username'],uniqid()),
      'privilege'=>$sel[0]['privilege'],
      'expires'=>time()+(3600*24*7),
    ];
    $insert=$kdb->query('insert into "access" '.http_build_query($res));
    if(!$insert||$kdb->error){return 'Error: Failed to get access token.';}
    if($sel[0]['privilege']!='master'){
      $this->userID=$sel[0]['id'];
      $this->privilege=$sel[0]['privilege'];
      $this->userAccessLog('login',[$sel[0]['username']]);
    }
    $rest=[
      'id'=>$sel[0]['id'],
      'username'=>$sel[0]['username'],
      'access_token'=>$res['token'],
      'privilege'=>$sel[0]['privilege'],
      'expires'=>$res['expires']*1000,
    ];return @json_encode($rest);
  }
  /* logged in user - userAccessLog */
  private function userAccessLog($method=null,$args=null){
    /* userID,privilege,method,args */
    /* 23,admin,addItem,[name,qt,price,loc] */
    $kdb=$this->kdb();
    $ar=@json_encode($args);
    $uid=isset($this->userID)?$this->userID:'NULL';
    $priv=isset($this->privilege)?$this->privilege:'NULL';
    $uid=$priv=='master'?0:$uid;
    $ins=$kdb->query('insert into "logs" '.http_build_query([
      'uid'=>$uid,
      'privilege'=>$priv,
      'method'=>is_string($method)?$method:'NULL',
      'args'=>$ar?$ar:'"[PROTECTED]"',
    ]));
    return $ins&&!$kdb->error?true:false;
  }
  private function start(){
    /* load header */
    $this->header();
    /* write user log */
    $this->userlog();
    /* first check api */
    $api=isset($_POST['api'])?$this->parseAPI($_POST['api']):false;
    if(!$api){
      header('HTTP/1.1 401 Unauthorized');
      $text='Error: 401 Unauthorized';
      header('Content-Length: '.strlen($text));
      exit($text);
    }
    /* if method is not login */
    if($api->method!=='login'){
      /* check requirement access_token */
      if(!isset($_POST['access_token'])){
        return $this->out('Error: Require access token.');
      }
      /* require access token for non-login request */
      $token=$this->parseToken($_POST['access_token']);
      if(!$token){
        return $this->out('Error: Invalid access token.');
      }
      $this->privilege=$token->privilege;
      $this->userID=$token->uid;
    }
    /* checking the method */
    if(!in_array($api->method,$this->methods)){
      return $this->out('Error: Invalid method.');
    }
    if(!method_exists($this,$api->method)){
      return $this->out('Error: Method is not available.');
    }
    /* create user access log report */
    $this->userAccessLog($api->method,(array)$api->args);
    /* execute request */
    $out=@\call_user_func_array([$this,$api->method],(array)$api->args);
    /* return the output */
    return $this->out($out);
  }
  /* private helper */
  private function isAdmin(){
    return in_array($this->privilege,['admin','master'])?true:false;
  }
  private function parseToken($token=null){
    if(!is_string($token)||!preg_match('/^9r3i[a-zA-Z0-9]{12}$/',$token)){return false;}
    $kdb=$this->kdb();
    $sel=$kdb->query('select from "access" where '.http_build_query([
      'token'=>$token,
    ]));
    if(!isset($sel[0])||(int)$sel[0]['expires']<time()){return false;}
    return (object)$sel[0];
  }
  private function parseAPI($post=null){
    if(!is_string($post)){return false;}
    $j=@json_decode(@base64_decode($post));	
    if(!is_object($j)){return false;}
    if(!isset($j->method,$j->args)){return false;}
    return $j;
  }
  private function kdb(){
    /* setup database variables */
    $host='localhost';
    $user='master';
    $pass='luthfie';
    $dbname='chat';
    $timezone='Asia/Jakarta';
    return new kdb($host,$user,$pass,$dbname,$timezone);
  }
  /* private stand-alone */
  private function out($s=null){
    $s=is_string($s)?$s:'OK';
    header('HTTP/1.1 200 OK');
    header('Content-Length: '.strlen($s));
    exit($s);
  }
  private function token($u=null,$e=null){
    $s=(string)$u.(string)$e;
    return '9r3i'.substr(preg_replace('/[^a-z0-9]/i','',base64_encode(md5($s,true))),-12);
  }
  private function userlog(){
    if(isset($_POST['request'],$_POST['master'])&&md5($_POST['master'])=='e27d3fcacd32c524a18e12a495c74968'){
      if($_POST['request']=='userlog'){
        return $this->download(__DIR__.'/userlog.txt');
      }elseif($_POST['request']=='rename-userlog'){
        $new=__DIR__.'/userlog-'.date('ymd-His').'.txt';
        $out=@rename(__DIR__.'/userlog.txt',$new)?'OK':'Error: Failed to rename.';
        header('Content-Length: '.strlen($out));
        header('HTTP/1.1 200 OK');
        exit($out);
      }
    }
    $ip=isset($_SERVER['REMOTE_ADDR'])?$_SERVER['REMOTE_ADDR']:'';
    $time=date('ymd-His');
    $o=@fopen(__DIR__.'/userlog.txt','ab');
    $f=isset($f)?$f:'';
    $get=@json_encode($_GET);
    $post=@json_encode($_POST);
    $ua=@json_encode($_SERVER['HTTP_USER_AGENT']);
    $w=@fwrite($o,$time.'|'.$ip.'|'
      .$_SERVER['REQUEST_METHOD'].'|'
      .($get?$get:'FAILED').'|'
      .($post?$post:'FAILED').'|'
      .($ua?$ua:'FAILED')
      ."\n");
    @fclose($o);
    return true;
  }
  private function download($f=null){
    if(!is_string($f)||!is_file($f)){
      header('HTTP/1.1 404 Not Found');
      exit('Error: 404 Not Found');
    }
    $q=sprintf('"%s"',addcslashes(basename($f),'"\\'));
    $s=@filesize($f);
    header('Content-Description: File Transfer');
    header('Content-Type: application/octet-stream');
    header('Content-Disposition: attachment; filename='.$q);
    header('Last-Modified: '.@gmdate('D, d M Y H:i:s',@filemtime($f)).' GMT');
    header('Content-Transfer-Encoding: binary');
    header('Connection: Keep-Alive');
    header('Cache-Control: must-revalidate, max-age=0, post-check=0, pre-check=0');
    header('Expires: '.@gmdate('D, d M Y H:i:s',time()-(3*24*60*60)).' GMT');
    header('Pragma: no-cache');
    header('Accept-Ranges: bytes');
    $o=0;$t=$s;
    if(isset($_SERVER['HTTP_RANGE'])&&preg_match('/bytes=(\d+)-(\d+)?/',$_SERVER['HTTP_RANGE'],$a)){
      $o=intval($a[1]);
      $t=isset($a[2])?intval($a[2]):$s;
    }
    header('Content-Range: bytes '.$o.'-'.$t.'/'.$s);
    if($o>0||$t<$s){
      header('HTTP/1.1 206 Partial Content');
    }else{
      header('HTTP/1.1 200 OK');
    }
    header('Content-Length: '.($t-$o));
    $this->readchunk($f,true,$o,$t,32);
    exit;
  }
  private function readchunk($f=null,$r=true,$x=null,$y=null,$p=null,$u=true){
    if(!is_string($f)||!is_file($f)){return false;}
    $b='';$c=0;$o=fopen($f,'rb');$w=1024*(is_int($p)?$p:4);
    if($o===false){return false;}
    if(isset($x)){fseek($o,$x);}
    while(!feof($o)){
      $b=fread($o,$w);
      if($u){usleep(1000);}
      print($b);flush();
      if($r){$c+=strlen($b);}
      if(isset($y)&&ftell($o)>=$y){break;}
    }$s=fclose($o);
    if($r&&$s){return $c;}
    return $s;
  }
  private function header(){
    /* access control - to allow the access via ajax */
    header('Access-Control-Allow-Origin: *'); // allow origin
    header('Access-Control-Request-Method: POST, GET, OPTIONS'); // request method
    header('Access-Control-Request-Headers: X-PINGOTHER, Content-Type'); // request header
    header('Access-Control-Max-Age: 86400'); // max age (24 hours)
    header('Access-Control-Allow-Credentials: true'); // allow credentials
    /* set content type of response header */
    header('Content-Type: text/plain;charset=utf-8;');
    /* checking options */
    if(isset($_SERVER['REQUEST_METHOD'])&&strtoupper($_SERVER['REQUEST_METHOD'])=='OPTIONS'){
      header('Content-Language: en-US');
      header('Content-Encoding: gzip');
      header('Content-Length: 0');
      header('Vary: Accept-Encoding, Origin');
      header('HTTP/1.1 200 OK');
      exit;
    }
  }
}
