const path = require('path');
const fs = require("fs");
var express = require("express"),
    app = express(),
    http = require('http'),
    server = http.Server(app);
var io = require('socket.io').listen(server);
const jsdom = require("jsdom");
var { JSDOM } = jsdom;

io.on('connection', function(socket){
  console.log('New user connected.');

  socket.on("disconnect", function() {
    console.log("User has been disconnected.");
  });

});

app.get("/", function(req, res) {
    var file = path.resolve(__dirname, 'public/index.html');
    var html = fs.readFileSync(file),
        dom = new JSDOM( html.toString() );
    var figures = dom.window.document.querySelectorAll("figure[data-source]");
    figures.forEach(function(figure, index) {
        var sourceHref = 'http://localhost:3003' + figure.dataset.source;
            http.get(sourceHref, function(resData) {
                resData.setEncoding('utf8');
                let rawData = '';
                resData.on('data', (chunk) => { rawData += chunk; });
                resData.on('end', () => {
                  try {
                    figure.innerHTML = rawData;
                    if(this.reqNum == this.reqCount-1) {
                        res.send(dom.serialize());
                    }
                  } catch (e) {
                    console.error(e.message);
                  }
                });
                
            }.bind({reqNum: index, reqCount: figures.length}));
   });
});

app.use("/style",  express.static(__dirname + '/public/css'));
app.use("/sass",  express.static(__dirname + '/public/sass'));
app.use("/script", express.static(__dirname + '/public/javascript'));
app.use("/image", express.static(__dirname + '/public/img'));
app.use("/font", express.static(__dirname + '/public/fonts'));

server.listen(3003, function() {
    console.log('Server is listening on http://localhost:3003');
});
