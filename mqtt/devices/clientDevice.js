#!/usr/bin/env node
var mqtt = require('mqtt')
const IP = "192.168.1.16:1883"
const options = {
    host: 'mqtt://' + IP,
    clientId: 'mqttjs_' + Math.random().toString(16).substr(2, 8),
    username: 'guest',
    password: 'guest',
}
var topicWeight = 'iot/belt/weight';
var topicMagnet = 'iot/belt/magnet';
var topicAlarm = 'iot/trigger/alarm';
console.log(' [*] Waiting for logs. To exit press CTRL+C');
const client = mqtt.connect('mqtt://' + IP, options)
var subMagnet = true;
let timerId;

function publish(topic, msg, options) {
    if (!client.connected) {
        client.on('connect', function() {
            console.log(" [x] connected " + client.connected);
            client.publish(topic, msg, options, function() {
                console.log(" [x] Sent %s:'%s'", topic, msg);
            })
        })
    } else {
        client.publish(topic, msg, options, function() {
            console.log(" [x] Sent %s:'%s'", topic, msg);
        })
    }
}

function subscribe(topic) {
    if (!client.connected) {
        client.on('connect', function() {
            console.log(" [x] connected " + client.connected);
            client.subscribe(topic, function(err) {
                if (!err) {
                    console.log(" [x] subscripted " + topic);
                }
            })
        })
    } else {
        client.subscribe(topic, function(err) {
            if (!err) {
                console.log(" [x] subscripted " + topic);
            }
        })
    }
}

function unsubscribed(topic) {
    if (!client.connected) {
        client.on('connect', function() {
            console.log(" [x] connected " + client.connected);
            client.unsubscribe(topic, function(err) {
                if (!err) {
                    console.log(" [x] unsubscripted " + topic);
                }
            })
        })
    } else {
        client.unsubscribe(topic, function(err) {
            if (!err) {
                console.log(" [x] unsubscripted " + topic);
            }
        })
    }
}
subscribe(topicWeight);
client.on('message', function(topic, message) {
    // message is Buffer
    console.log(" [x] %s:'%s'", topic, message.toString());
    if (topic.toString() == 'iot/belt/magnet') {
        clearTimeout(timerId);
        if (message.toString() != 'true') {
            sendAlert();
        }
        unsubscribed(topicMagnet);
    } else {
        subscribe(topicMagnet);
        timerId = setTimeout(function() { //
            unsubscribed(topicMagnet);
        }, 6000);
    }
})

function sendAlert() {
    console.log(' [x] alert');
    var msg = 'ALARM!!!!!!!: CONNECT BELT';
    publish(topicAlarm, msg,{ qos: 2, retain: false });
}
