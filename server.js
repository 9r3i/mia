/* load mia library */
const {mia}=require(__dirname+'/private/mia/mia');
/* initialize mia */
globalThis.MIA=new mia;
/* start the server */
globalThis.MIA.start();
