exports.generateUniqueToken = function(nbBytes = 16) {
   return require('node:crypto').randomBytes(nbBytes).toString('hex');
}