exports.serializeDataForUrlEncode = function (obj = {}){
    const keys = Object.keys(obj);
    const serialData = keys.map(key => `${encodeURI(key)}=${encodeURI(obj[key])}`).join("&");

    return serialData;
}