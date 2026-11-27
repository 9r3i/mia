/* load mia library */
const mia=require(__dirname+'/private/mia/mia');
const fs = require('fs');
const path = require('path');
const http = require('http');
/* export handler */
module.exports=function(req,res){
  /* initialize mia */
  const app=new mia;
  /* start the server */
  app.requestListener(req,res);
  /* set as global variable */
  globalThis.MIA=app;
}
/*
module.exports=(req, res) => {
  try {
    // Always resolve paths relative to process.cwd() or __dirname
    const filePath = path.join(process.cwd(), 'data', 'sample.txt');
    const fileContent = fs.readFileSync(filePath, 'utf8');

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(
      JSON.stringify({
        statusMessage: http.STATUS_CODES[200],
        url: req.url,
        content: fileContent,
      })
    );
  } catch (error) {
    res.statusCode = 500;
    res.end(`Error reading file: ${error.message}`);
  }
};
//*/
