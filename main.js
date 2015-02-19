var exec = require('child_process').exec,
    Q = require("q"),
    http = require("http"),
    config = require("./config");

var server_instance = http.createServer(function(request, response){
    response.writeHeader(200, {"Content-Type": "text/plain"});
    doPull()
        .then(function (data) {
            response.write(data);
        }, function (error) {
            response.write(error);
        }).done(function () {
            response.end();
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