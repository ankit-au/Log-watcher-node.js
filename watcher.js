const events = require("events");
const fs = require("fs");
const watchFile = "test.log";
const bf = require('buffer');
const buffer = new Buffer.alloc(bf.constants.MAX_STRING_LENGTH);
  
  
class Watcher extends events.EventEmitter {
  constructor(watchFile) {
    super();
    this.watchFile = watchFile;
    this.lastTenQueue = [];
  }
  getLogs()
  {
      return this.lastTenQueue;
  }

  watch(curr,prev) {
    const watcher = this;
    fs.open(this.watchFile,(err,fd) => {
        if(err) throw err;
        let dataString = '';
        let logs = [];
        fs.read(fd,buffer,0,buffer.length,prev.size,(err,bytesRead) => {
            if(err) throw err;
            if(bytesRead > 0)
            {
                dataString = buffer.slice(0,bytesRead).toString();
                logs = dataString.split("\n").slice(1);
                console.log("logs read:"+logs);  // no need to write 
                if(logs.length >= 10)
                {
                    logs.slice(-10).forEach((elem) => this.lastTenQueue.push(elem));
                }
                else{
                    logs.forEach((elem) => {
                        if(this.lastTenQueue.length == 10)
                        {
                            console.log("lastTen queue is full");
                            this.lastTenQueue.shift();
                        }
                        this.lastTenQueue.push(elem);
                    });
                }
                watcher.emit("process",logs);
            }
        });
    });
   
    }


  start() {
    var watcher = this;
    fs.open(this.watchFile,(err,fd) => {
        if(err) throw err;
        let dataString = '';
        let logs = [];
        fs.read(fd,buffer,0,buffer.length,0,(err,bytesRead) => {
            if(err) throw err;
            if(bytesRead > 0)
            {   
                dataString = buffer.slice(0,bytesRead).toString();
                logs = dataString.split("\n");
                this.lastTenQueue = [];
                logs.slice(-10).forEach((elem) => this.lastTenQueue.push(elem));
            }
            fs.close(fd);
            });
    fs.watchFile(this.watchFile,{"interval":1000}, function(curr,prev) {
        watcher.watch(curr,prev);
    });
  });
}
}
  
module.exports = Watcher;
