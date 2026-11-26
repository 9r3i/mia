/* space.login.js */
function SpaceLogin(_query,_app,_env){
const query=_query,
  app=_app,
  env=_env;
this.init=async function(){
  let div=app.element,
    login=app.db.login,
    sleep=app.sleep,
    email=div('input',{
      value:'',
      placeholder:'Email',
      maxlength:100,
      type:'email',
      name:'email',
      autocomplete:'off',
      required:true,
    }),
    password=div('input',{
      value:'',
      placeholder:'Password',
      maxlength:100,
      type:'password',
      name:'password',
      autocomplete:'off',
      required:true,
    }),
    submit=div('button',{'class':'button-orange'}).text('Login'),
    gLogin=div('button',{'class':'button-orange'})
      .text('Login with Google'),
    loginForm=div('div',{'class':'login'},[
      div().text('Email'),
      email,
      div().text('Password'),
      password,
      submit,
      div().text('or'),
      gLogin,
    ]).appendTo(document.body);
    submit.clickOn(async ()=>{
      let stext=submit.innerText;
      submit.disabled=true;
      submit.text('Checking...');
      let res=await login(email.value,password.value);
      if(!res){
        submit.text('Denied');
        loginForm.classList.add('login-shake');
        let text='Invalid username or password.',
        pre=div('pre').text(text);
        loginForm.insertBefore(pre,submit);
        await sleep(1000);
        submit.disabled=false;
        submit.text(stext);
        pre.remove();
        loginForm.classList.remove('login-shake');
        return;
      }
      submit.text('Redirecting...');
    });
    gLogin.clickOn(async function(){
      return app.db.loginGoogle(async function(r){
        app.alert(r);
      },async function(e){
        app.alert(e);
      },false);
    });
};
};
