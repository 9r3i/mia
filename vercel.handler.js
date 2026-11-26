/* load mia library */
import {mia} from './private/mia/mia.js';
/* export handler */
export default function handler(req,res){
  /* initialize mia */
  const app=new mia;
  /* start the server */
  app.requestListener(req,res);
  /* set as global variable */
  globalThis.MIA=app;
  /* stop the script */
  if(true){return;}
  /* keep origin script */
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
