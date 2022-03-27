#!/usr/bin/env node
var mqtt = require('mqtt')
const IP = "192.168.1.16:1883"
const options = {
    host: 'mqtt://' + IP,
    clientId: 'mqttjs_' + Math.random().toString(16).substr(2, 8),
    username: 'guest',
    password: 'guest',
}
const client = mqtt.connect('mqtt://' + IP, options)
function publish(topic, msg) {
    if (!client.connected) {
            client.on('connect', function() {
                console.log(" [x] connected " + client.connected);
                client.publish(topic,msg, function() {
                    console.log(" [x] Sent %s:'%s'", topic, msg);
                })
            })
        } else {
            client.publish(topic, msg,function() {
                    console.log(" [x] Sent %s:'%s'", topic, msg);
            })
        }
}
function sensor(){
	    var topicWeight = 'iot/seat/weight';
	    var topicMagnet = 'iot/seat/magnet';
	    min = Math.ceil(500);
	    max = Math.floor(2000);
	    var msg1 = (Math.floor(Math.random() * (max - min + 1) + min)).toString();
	    var msg2 = (Boolean(Math.round(Math.random()))).toString();

	    publish(topicWeight, msg1);
	    setTimeout(function() {
	       publish(topicMagnet, msg2);
           }, 1000);
	   setTimeout(sensor, 5000);
}
sensor();
