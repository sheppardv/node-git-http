var exec = require('child_process').exec,
    Q = require("q"),
    http = require("http"),
    config = require("./config"),
    director = require('director');

var router = new director.http.Router({
    '/lollipop3': {
        get: function () {
            var _this = this;
            _this.res.writeHead(200, {"Content-Type": "text/plain"});
            doPull()
                .then(function (data) {
                    _this.res.end(data);
                }, function (error) {
                    _this.res.end(error);
                });
        }
    }
});

var server_instance = http.createServer(function(request, response){
    router.dispatch(request, response, function (err) {
        if (err) {
            response.writeHeader(404);
            response.write("404");
            response.end();
        }
    });

}).listen(config.http_port);
console.log("Server started.");

/**
 *
 * @returns {Q.promise}
 */
function doPull() {
    var deferred = Q.defer();
    exec('git pull', {cwd: config.working_dir},
        function callback(error, stdout, stderr) {
            if (error) {
                deferred.reject(stderr);
                console.log(stderr);
            } else {
                deferred.resolve(stdout);
                console.log(stdout);
            }
        }
    );
    return deferred.promise;
}

function exitHandler(options, err) {
    console.log("Closing.");
    server_instance.close();
}

process.on('exit', exitHandler.bind(null,{cleanup:true}));
process.on('SIGINT', exitHandler.bind(null, {exit:true}));
process.on('uncaughtException', exitHandler.bind(null, {exit:true}));