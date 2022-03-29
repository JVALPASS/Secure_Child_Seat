var mqtt = require('mqtt')
const IP = "192.168.1.16:1883"
const options = {
    host: 'mqtt://' + IP,
	clientId: 'mqttjs_' + Math.random().toString(16).substr(2, 8),
	username: 'guest',
	password: 'guest',
}
var FUNCTION_NAME = "receiverweight";

function send_message(msg,topic){
    const client  = mqtt.connect("mqtt://" + IP, options)
    client.on('connect', function () {
        client.publish(topic, msg, { qos: 2, retain: false }, function () {
                client.end();
        });
    });
}
function bin2string(array){
    var result = "";
    for(var i = 0; i < array.length; ++i){
        result+= (String.fromCharCode(array[i]));
    }
    return result;
}

exports.handler = function(context, event) {
    var _event = JSON.parse(JSON.stringify(event));
    var _data = bin2string(_event.body.data);
    context.callback("feedback "+_data);
    send_message(_data,'iot/belt/magnet');
};
