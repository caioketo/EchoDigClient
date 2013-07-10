var connection;
function Connection(host, port) {
    connection = this;
    this.host = host;
    this.port = port;
    this.socket = null;
    this.canSend = false;
    this.callbacks = {
        connect: null,    // Called when socket is connected.
        recv: null,       // Called when client receives data from server.
        sent: null        // Called when client sends data to server.
    };
}

Connection.prototype.Connect = function () {
    this.socket = new WebSocket('ws://' + this.host + ':' + this.port + '/');
    this.socket.onopen = function () {
        connection.canSend = true;
        if (connection.callbacks.connect) {
            connection.callbacks.connect();
        }
    };
    this.socket.onerror = function (e) {
        console.log(e);
    };
    this.socket.onmessage = function (evt) {
        if (connection.callbacks.recv) {
            connection.callbacks.recv(evt.data);
        }
        var uint8array = JSON.parse(evt.data);
    };
}

Connection.prototype.Send = function (outPacket) {
    if (!this.canSend) {
        return;
    }
    console.log('Mensagem enviada: ');
    this.socket.send(convertToBase64(ShortBuffer(outPacket.buffer, outPacket.length)));
    if (this.callbacks.sent) {
        this.callbacks.sent(outMessage);
    }
}

function ShortBuffer(typed, len) {
    plain = new Uint8Array(new ArrayBuffer(len));
    for (var i = 0; i < len; i++) {
        plain[i] = typed[i];
    }
    return plain;
}

function convertToUint8(base64) {
    var raw = window.atob(base64);
    var rawLength = raw.length;
    var array = new Uint8Array(new ArrayBuffer(rawLength));

    for (i = 0; i < rawLength; i++) {
        array[i] = raw.charCodeAt(i);
    }
    return array;
}

function convertToBase64(uint8) {
    var base64Str = window.btoa(String.fromCharCode.apply(null, uint8));
    return base64Str;
}


//Packet
function Packet() {
    this.buffer = new Uint8Array(new ArrayBuffer(1105920));
    this.position = 0;
    this.length = 0;
    this.buffersize = 1105920;
};

Packet.prototype = {
    getUint8: function () {
        return this.buffer[this.position++];
    },
    getUint8Array: function (count) {
        var result = new Uint8Array(new ArrayBuffer(count));
        if (this.position + count > this.length) {
            console.log('GetUint8Array: Position + count > length');
            return null;
        }
        ArrayCopy(this.buffer, this.position, result, 0, count);
        this.position += count;
        return result;
    },
    getUint16: function () {
        return ToUint16(this.getUint8Array(2), 0);
    },
    getString: function () {
        var len = this.getUint16();

        var t = '';
        var result = new Uint8Array(new ArrayBuffer(len));
        ArrayCopy(this.buffer, this.position, result, 0, len);
        t = Uint8ToString(result);
        this.position += len;
        return t;
    },
    getUint32: function () {
        return ToUint32(this.getUint8Array(4), 0);
    },
    getDouble: function () {
        return (this.getUint32() / 10);
    },
    addUint8Array: function (uint8Array) {
        ArrayCopy(uint8Array, 0, this.buffer, this.position, uint8Array.length);
        this.position += uint8Array.length;

        if (this.position > this.length) {
            this.length = this.position;
        }
    },
    addUint8: function (uint8) {
        var uint8Arr = new Uint8Array(new ArrayBuffer(1));
        uint8Arr[0] = uint8;
        this.addUint8Array(uint8Arr);
    },
    addUint16: function (uint16) {
        this.addUint8Array(Uint16ToUint8(uint16));
    },
    addString: function (string) {
        this.addUint16(string.length);
        this.addUint8Array(StringToUint8(string));
    },
    addUint32: function (uint32) {
        this.addUint8Array(Uint32ToUint8(uint32));
    },
    addDouble: function (value) {
        var d = value * 10;
        this.addUint32(d);
    },
    prepareToRead: function () {
        this.position = 0;
        this.length = 6;
        var firstByte = this.GetUint8();
        var secondByte = this.GetUint8();
        if (firstByte == 1 && secondByte == 2) {
            this.length = this.GetUint32() + 6;
        }
    }
};


//////BitConverter
function ToUint16(uint8, index) {
    return ((uint8[index]) | (uint8[index + 1] << 8));
}

function Uint8ArrayToUint16Array(uint8, len) {
    var result = new Uint16Array(new ArrayBuffer(len * 2));
    for (var i = 0; i < len; i++) {
        var temp = new Uint8Array(new ArrayBuffer(2));
        temp[0] = uint8[i];
        temp[1] = uint8[i + 1];
        result[i] = ToUint16(temp, 0);
        i++;
    }
    return result;
}

function ToUint32(uint8, index) {
    return (uint8[index] |
                (uint8[index + 1] << 8) |
                (uint8[index + 2] << 16) |
                (uint8[index + 3] << 24))
}

function ToUint64(uint8, index) {
    return (uint8[index] |
        		(uint8[index + 1] << 8) |
        		(uint8[index + 2] << 16) |
        		(uint8[index + 3] << 24) |
        		(uint8[index + 4] << 32) |
        		(uint8[index + 5] << 40) |
        		(uint8[index + 6] << 48) |
        		(uint8[index + 7] << 56)
        		);
}

function ToUint128(uint8, index) {
    return (uint8[index] |
        		(uint8[index + 1] << 8) |
        		(uint8[index + 2] << 16) |
        		(uint8[index + 3] << 24) |
        		(uint8[index + 4] << 32) |
        		(uint8[index + 5] << 40) |
        		(uint8[index + 6] << 48) |
        		(uint8[index + 7] << 56) |
                (uint8[index + 8] << 64) |
        		(uint8[index + 9] << 72) |
        		(uint8[index + 10] << 80) |
        		(uint8[index + 11] << 88) |
        		(uint8[index + 12] << 96) |
        		(uint8[index + 13] << 104) |
        		(uint8[index + 14] << 112) |
        		(uint8[index + 15] << 120)
        		);
}

function Uint16ToUint8(value) {
    var uint8 = new Uint8Array(new ArrayBuffer(2));
    uint8[0] = value;
    uint8[1] = value >>> 8;
    return uint8;
}

function Uint32ToUint8(value) {
    var uint8 = new Uint8Array(new ArrayBuffer(4));
    uint8[0] = value;
    uint8[1] = value >>> 8;
    uint8[2] = value >>> 16;
    uint8[3] = value >>> 24;
    return uint8;
}

function Uint64ToUint8(value) {
    var uint8 = new Uint8Array(new ArrayBuffer(8));
    uint8[0] = value;
    uint8[1] = value >>> 8;
    uint8[2] = value >>> 16;
    uint8[3] = value >>> 24;
    uint8[4] = value >>> 32;
    uint8[5] = value >>> 40;
    uint8[6] = value >>> 48;
    uint8[7] = value >>> 56;
    return uint8;
}

function Uint128ToUint8(value) {
    var uint8 = new Uint8Array(new ArrayBuffer(16));
    uint8[0] = value;
    uint8[1] = value >>> 8;
    uint8[2] = value >>> 16;
    uint8[3] = value >>> 24;
    uint8[4] = value >>> 32;
    uint8[5] = value >>> 40;
    uint8[6] = value >>> 48;
    uint8[7] = value >>> 56;
    uint8[8] = value >>> 64;
    uint8[9] = value >>> 72;
    uint8[10] = value >>> 80;
    uint8[11] = value >>> 88;
    uint8[12] = value >>> 96;
    uint8[13] = value >>> 104;
    uint8[14] = value >>> 112;
    uint8[15] = value >>> 120;
    return uint8;
}

function StringToUint8(str) {
    var buf = new Uint8Array(str.length);
    for (i = 0; i < str.length; i++) {
        buf[i] = str.charCodeAt(i);
    }

    return buf;
}

function Uint8ToString(uint8) {
    var str = new String();
    for (i = 0; i < uint8.length; i++) {
        str = str + String.fromCharCode(uint8[i]);
    }

    return str;
}

function ArrayCopy(source, sourcePos, dest, destPos, len) {
    for (var i = 0; i < len; i++) {
        dest[destPos + i] = source[sourcePos + i];
    }
}