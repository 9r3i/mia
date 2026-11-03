/* load requirement */
const FS = require("fs");
/* exec -- test */
exports.test=function(root){
this.root=root?root
  :__dirname.replace(/(\/[^\/]+){2}$/,'')+'/public';
this.fs=FS.promises;
this.fso=FS;
/* file -- init */
this.init=async function(post){
  let result={
    'post':post,
    'dir':__dirname,
    'root':this.root,
    'mia:version':globalThis.MIA.version,
    'mia':globalThis.MIA,
  };
  return result;
};
};