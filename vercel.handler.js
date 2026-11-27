/* load mia library */
//const mia=require(__dirname+'/private/mia/mia');
const fs = require('fs');
const path = require('path');
const http = require('http');
/* export handler *
module.exports=function(req,res){
  const app=new mia;
  app.requestListener(req,res);
  globalThis.MIA=app;
}
//*/
/* */
module.exports=(req, res) => {
  try {
    // Always resolve paths relative to process.cwd() or __dirname
    const filePath = path.join(process.cwd(), 'public', 'index.html');
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
