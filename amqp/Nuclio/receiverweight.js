var amqp = require('amqplib');
var amqp2 = require('amqplib/callback_api');
var FUNCTION_NAME = "receiverweight";

function send_message(msg, routing_key) {
    amqp2.connect('amqp://guest:guest@192.168.1.16:5672', function(error0, connection) {
        if (error0) {
            throw error0;
        }
        connection.createChannel(function(error1, channel) {
            if (error1) {
                throw error1;
            }
            var exchange = 'iot/belt';
            var key = routing_key;

            channel.assertExchange(exchange, 'topic', {
                durable: false
            });
            channel.publish(exchange, key, Buffer.from(msg));
        });
    });
}

function bin2string(array) {
    var result = "";
    for (var i = 0; i < array.length; ++i) {
        result += (String.fromCharCode(array[i]));
    }
    return result;
}

exports.handler = function(context, event) {
    var _event = JSON.parse(JSON.stringify(event));
    var _data = bin2string(_event.body.data);

    context.callback("feedback " + _data);

    if (_data > 1000) {
        send_message(_data, 'belt.weight');
    }
};
