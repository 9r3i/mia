/* load mia library */
const {mia}=require(__dirname+'/private/mia/mia');
/* export handler */
exports.handler=function(req,res){
  /* initialize mia */
  const app=new mia;
  /* start the server */
  app.requestListener(req,res);
  /* set as global variable */
  globalThis.MIA=app;
}
