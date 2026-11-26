/* load mia library */
const {mia}=require(__dirname+'/private/mia/mia');
/* export handler */
export default function handler(req,res){
  /* initialize mia */
  globalThis.MIA=new mia;
  /* start the server */
  globalThis.MIA.requestListener(req,res);
  /* keep origin script */
  if(true){return;}
  const {url,method}=req;
  if(url==='/api/health'){
    return res.status(200).json({
      status:'ok',
      timestamp:Date.now()
    });
  }
  res.status(200).json({
    message: 'Hello from zero-dependency Node.js on Vercel!',
    method,
    path:url
  });
}
