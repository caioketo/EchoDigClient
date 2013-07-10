/**
 * Shows and hides the help panel
 */
function toggleHelp() {
    document.querySelector('.help').classList.toggle('hidden');
    document.body.classList.toggle('dim');
}

(function () {

    var webClient;
    // Bind the connect dialog to real stuff.
    var button = document.getElementById('connect');
    button.addEventListener('click', function () {

        // Disconnect from previous socket.
        var host = document.getElementById('host').value;
        var port = parseInt(document.getElementById('port').value, 10);
        connect(host, port);
    });

    /**
     * Connects to a host and port
     *
     * @param {String} host The remote host to connect to
     * @param {Number} port The port to connect to at the remote host
     */
    function connect(host, port) {
        webClient = new Connection(host, port);
        webClient.callbacks.connect = function () {
            console.log('connected');
            var outPacket = new Packet();
            outPacket.addUint8(1);
            outPacket.addString('CAIOKETO');
            outPacket.addString('123');
            webClient.Send(outPacket);
        };
        webClient.callbacks.recv = function (data) {
            console.log('recieved');
            console.log(data);
        };
        webClient.Connect();

    }

})();
