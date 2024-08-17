class Logger{
    pathtoLogFile = "";
    fileName = "";

    constructor(pathF, fn){
        this.pathtoLogFile = pathF;
        this.fileName = fn;
    }

    /**
     * 
     */
    log(str) {
        const fs = require("fs");
        const p = `${this.pathtoLogFile/this.fileName}.log`;
        if(fs.existsSync(p)){
            fs.writeFileSync(p, str);
        }else{
            throw new Error("invalid path to file")
        }
    }

    error(str) {
        const fs = require("fs");
        const p = `${this.pathtoLogFile/this.fileName}.log`;
        if(fs.existsSync(p)){
            const newStr = `\n###############################################\n${str}\n###############################################\n`
            fs.writeFileSync(p, str);
        }else{
            throw new Error("invalid path to file")
        }
    }
}