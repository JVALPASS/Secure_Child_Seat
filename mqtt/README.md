## Installation
To execute our application Iot Project first of all we have to install on our Ubuntu machine AMPQ library<br/>
```
npm install amqp
```
## Application
The application is composed by 5 functions:<br/>
- [sensor.js](##Sensors): that emulates two sensors:
    1. weight sensor to detect if the child is on the seat or not. And this informations is published with an MQTT_Topic “iot/seat/weight”
    2. magnet sensor to detect if the child is on the seat or not. And this informations is published with an MQTT_Topic “iot/seat/magnet”
- [receiverweightmqtt.yaml](#ReceiverWeightFunction) that is a Nuclio Function that is triggered when a weight is published by the sensors with an MQTT_Topic “iot/seat/weight”, it will filter and send only the weight over 1kg to the MQTT_Topic "iot/belt/weight", so these data will be received by the ClientDevice that will rise the alarm.
- [receivermagnetmqtt.yaml](#ReceiverMagnetFunction) that is a Nuclio Function that is triggered when a magnet information is published by the sensors with an MQTT_Topic “iot/seat/magnet”, it will send the message received by the sensor, about if the magnet is connected or not, to the MQTT_Topic "iot/belt/magnet", so these data will be received by the ClientDevice that will rise the alarm.
- [clientDevice.js](#ClientDevice) The subscriber will consume the message about the weight over the MQTT_Topic "iot/belt/weight", after this the subscriber will susbscirbe to the  MQTT_Topic “iot/belt/magnet”, and after six seconds if does not receive a message from the magnet, it unsubscribe from the Topic about the magnet, in this way we consume only fresh information. This function if has received a weight "over 1kg" and magnet "disconnected", send an alarm message to an MQTT_Topic = “iot/trigger/alarm”.
- [alarm.yaml](#Alarm) Nuclio function that will be triggered when a new message is published with MQTT_Topic “iot/trigger/alarm”, and the message received will trigger an IFTTT service to send thtis message as SMS to the smartphone of user.<br/>
## Architeture
<img src="https://github.com/JVALPASS/Secure_Child_Seat/blob/main/assets/architetureserverlessMQTT.png" width="800" height="500"></br>
## ReceiverWeightFunction
The Receiver Weight Function Function is written in pure JavaScript and exploits the MQTT library to communicate on the "iot/seat/weight" MQTT_Topic. The function is deployed using the Docker compose specifics for Nuclio. This is achieved by define a new yaml file that declares all functions specifications and source code. The source code of the function (the JavaScript code) is encoded in base64 and copied in the attribute "functionSourceCode", moreover, is defined a new trigger on the mqtt protocol that allows to automatically invoke the function when a new message is coming on the "iot/seat/weight" MQTT_Topic. Since the functions exploits the mqtt in the "commands" attribute is added the command to install on Node.js the mqtt (npm install mqt).
```
metadata:
  name: receiverweightmqtt
  labels:
    nuclio.io/project-name: aad77fde-cd14-4a61-9ab5-1014a91a5194
spec:
  handler: "main:handler"
  runtime: nodejs
  resources: {}
  image: "nuclio/processor-receiverweightmqtt:latest"
  minReplicas: 1
  maxReplicas: 1
  targetCPU: 75
  triggers:
    TriggerMagnetMQTT:
      class: ""
      kind: mqtt
      url: "guest:guest@192.168.1.16:1883"
      username: guest
      password: guest
      attributes:
        subscriptions:
          - qos: 0
            topic: iot/seat/weight
  build:
    functionSourceCode: dmFyIG1xdHQgPSByZXF1aXJlKCdtcXR0JykNCmNvbnN0IElQID0gIjE5Mi4xNjguMS4xNjoxODgzIg0KY29uc3Qgb3B0aW9ucyA9IHsNCiAgICBob3N0OiAnbXF0dDovLycgKyBJUCwNCgljbGllbnRJZDogJ21xdHRqc18nICsgTWF0aC5yYW5kb20oKS50b1N0cmluZygxNikuc3Vic3RyKDIsIDgpLA0KCXVzZXJuYW1lOiAnZ3Vlc3QnLA0KCXBhc3N3b3JkOiAnZ3Vlc3QnLA0KfQ0KdmFyIEZVTkNUSU9OX05BTUUgPSAicmVjZWl2ZXJ3ZWlnaHQiOw0KDQpmdW5jdGlvbiBzZW5kX21lc3NhZ2UobXNnLHRvcGljKXsNCiAgICBjb25zdCBjbGllbnQgID0gbXF0dC5jb25uZWN0KCJtcXR0Oi8vIiArIElQLCBvcHRpb25zKQ0KICAgIGNsaWVudC5vbignY29ubmVjdCcsIGZ1bmN0aW9uICgpIHsNCiAgICAgICAgY2xpZW50LnB1Ymxpc2godG9waWMsIG1zZywgZnVuY3Rpb24gKCkgew0KICAgICAgICAgICAgICAgIGNsaWVudC5lbmQoKTsNCiAgICAgICAgfSk7DQogICAgfSk7DQp9DQpmdW5jdGlvbiBiaW4yc3RyaW5nKGFycmF5KXsNCiAgICB2YXIgcmVzdWx0ID0gIiI7DQogICAgZm9yKHZhciBpID0gMDsgaSA8IGFycmF5Lmxlbmd0aDsgKytpKXsNCiAgICAgICAgcmVzdWx0Kz0gKFN0cmluZy5mcm9tQ2hhckNvZGUoYXJyYXlbaV0pKTsNCiAgICB9DQogICAgcmV0dXJuIHJlc3VsdDsNCn0NCg0KZXhwb3J0cy5oYW5kbGVyID0gZnVuY3Rpb24oY29udGV4dCwgZXZlbnQpIHsNCiAgICB2YXIgX2V2ZW50ID0gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShldmVudCkpOw0KICAgIHZhciBfZGF0YSA9IGJpbjJzdHJpbmcoX2V2ZW50LmJvZHkuZGF0YSk7DQogICAgY29udGV4dC5jYWxsYmFjaygiZmVlZGJhY2sgIitfZGF0YSk7DQogICAgaWYoX2RhdGE+MTAwMCl7DQogICAgICAgIHNlbmRfbWVzc2FnZShfZGF0YSwnaW90L2JlbHQvd2VpZ2h0Jyk7DQogICAgfQ0KfTs=
    commands:
      - 'npm install mqtt'
    runtimeAttributes:
      repositories: []
    codeEntryType: sourceCode
  platform: {}
  readinessTimeoutSeconds: 60
  version: 1
```
</br>
For deploying the function you can access, from the Nuclio dashboard, to the project IOT and create new function. When the system ask to create new function you have to select the import form yaml, and load the file "iot/receiverweight.yaml". At this point the dashboard show you the function IDE where it is needed to deploy on the system the function pressing the button "Deploy".
Remeber that we have to change with your IP in the url of yaml file</br>

## ReceiverMagnetFunction
The Receiver Magnet Function Function is written in pure JavaScript and exploits the  MQTT library to communicate on the "iot/seat/magnet" MQTT_Topic. The function is deployed using the Docker compose specifics for Nuclio. This is achieved by define a new yaml file that declares all functions specifications and source code. The source code of the function (the JavaScript code) is encoded in base64 and copied in the attribute "functionSourceCode", moreover, is defined a new trigger on the mqtt protocol that allows to automatically invoke the function when a new message is coming on the MQTT_Topic "iot/seat/magnet". Since the functions exploits the mqtt in the "commands" attribute is added the command to install on Node.js the amqplib (npm install mqtt).
```
metadata:
  name: receivermagnetmqtt
  labels:
    nuclio.io/project-name: aad77fde-cd14-4a61-9ab5-1014a91a5194
spec:
  handler: "main:handler"
  runtime: nodejs
  resources: {}
  image: "nuclio/processor-receivermagnetmqtt:latest"
  minReplicas: 1
  maxReplicas: 1
  targetCPU: 75
  triggers:
    TriggerMagnetMQTT:
      class: ""
      kind: mqtt
      url: "guest:guest@192.168.1.16:1883"
      username: guest
      password: guest
      attributes:
        subscriptions:
          - qos: 0
            topic: iot/seat/magnet
  build:
    functionSourceCode: dmFyIG1xdHQgPSByZXF1aXJlKCdtcXR0JykNCmNvbnN0IElQID0gIjE5Mi4xNjguMS4xNjoxODgzIg0KY29uc3Qgb3B0aW9ucyA9IHsNCiAgICBob3N0OiAnbXF0dDovLycgKyBJUCwNCgljbGllbnRJZDogJ21xdHRqc18nICsgTWF0aC5yYW5kb20oKS50b1N0cmluZygxNikuc3Vic3RyKDIsIDgpLA0KCXVzZXJuYW1lOiAnZ3Vlc3QnLA0KCXBhc3N3b3JkOiAnZ3Vlc3QnLA0KfQ0KdmFyIEZVTkNUSU9OX05BTUUgPSAicmVjZWl2ZXJ3ZWlnaHQiOw0KDQpmdW5jdGlvbiBzZW5kX21lc3NhZ2UobXNnLHRvcGljKXsNCiAgICBjb25zdCBjbGllbnQgID0gbXF0dC5jb25uZWN0KCJtcXR0Oi8vIiArIElQLCBvcHRpb25zKQ0KICAgIGNsaWVudC5vbignY29ubmVjdCcsIGZ1bmN0aW9uICgpIHsNCiAgICAgICAgY2xpZW50LnB1Ymxpc2godG9waWMsIG1zZywgZnVuY3Rpb24gKCkgew0KICAgICAgICAgICAgICAgIGNsaWVudC5lbmQoKTsNCiAgICAgICAgfSk7DQogICAgfSk7DQp9DQpmdW5jdGlvbiBiaW4yc3RyaW5nKGFycmF5KXsNCiAgICB2YXIgcmVzdWx0ID0gIiI7DQogICAgZm9yKHZhciBpID0gMDsgaSA8IGFycmF5Lmxlbmd0aDsgKytpKXsNCiAgICAgICAgcmVzdWx0Kz0gKFN0cmluZy5mcm9tQ2hhckNvZGUoYXJyYXlbaV0pKTsNCiAgICB9DQogICAgcmV0dXJuIHJlc3VsdDsNCn0NCg0KZXhwb3J0cy5oYW5kbGVyID0gZnVuY3Rpb24oY29udGV4dCwgZXZlbnQpIHsNCiAgICB2YXIgX2V2ZW50ID0gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShldmVudCkpOw0KICAgIHZhciBfZGF0YSA9IGJpbjJzdHJpbmcoX2V2ZW50LmJvZHkuZGF0YSk7DQogICAgY29udGV4dC5jYWxsYmFjaygiZmVlZGJhY2sgIitfZGF0YSk7DQogICAgc2VuZF9tZXNzYWdlKF9kYXRhLCdpb3QvYmVsdC9tYWduZXQnKTsNCn07
    commands:
      - 'npm install mqtt'
    runtimeAttributes:
      repositories: []
    codeEntryType: sourceCode
  platform: {}
  readinessTimeoutSeconds: 60
  version: 1
```
</br>
For deploying the function you can access, from the Nuclio dashboard, to the project IOT and create new function. When the system ask to create new function you have to select the import form yaml, and load the file "iot/receivermagnet.yaml". At this point the dashboard show you the function IDE where it is needed to deploy on the system the function pressing the button "Deploy".
Remeber that we have to change with your IP in the url of yaml file</br>

## Alarm
The Alarm Function Function is written in pure JavaScript and exploits the mqtt library to communicate on the "iot/trigger/alarm" MQTT_Topic. The function is deployed using the Docker compose specifics for Nuclio. This is achieved by define a new yaml file that declares all functions specifications and source code. The source code of the function (the JavaScript code) is encoded in base64 and copied in the attribute "functionSourceCode", moreover, is defined a new trigger on the mqtt protocol that allows to automatically invoke the function when a new message is coming on the MQTT_Topic "iot/trigger/alarm". Since the functions exploits the mqtt in the "commands" attribute is added the command to install on Node.js the mqtt (npm install mqtt), and we have also add the command to install on Node.js 'npm install request', because the code make an HTTPS request to call an event on IFTTT.
```
metadata:
  name: alarmmqtt
  labels:
    nuclio.io/project-name: aad77fde-cd14-4a61-9ab5-1014a91a5194
spec:
  handler: "main:handler"
  runtime: nodejs
  resources: {}
  image: "nuclio/processor-alarmmqtt:latest"
  minReplicas: 1
  maxReplicas: 1
  targetCPU: 75
  triggers:
    TriggerAlarmMQTT:
      class: ""
      kind: mqtt
      url: "guest:guest@192.168.1.16:1883"
      username: guest
      password: guest
      attributes:
        subscriptions:
          - qos: 2
            topic: iot/trigger/alarm
  build:
    functionSourceCode: dmFyIHJlcXVlc3QgPSByZXF1aXJlKCdyZXF1ZXN0Jyk7DQpmdW5jdGlvbiBiaW4yc3RyaW5nKGFycmF5KXsNCiAgICB2YXIgcmVzdWx0ID0gIiI7DQogICAgZm9yKHZhciBpID0gMDsgaSA8IGFycmF5Lmxlbmd0aDsgKytpKXsNCiAgICAgICAgcmVzdWx0Kz0gKFN0cmluZy5mcm9tQ2hhckNvZGUoYXJyYXlbaV0pKTsNCiAgICB9DQogICAgcmV0dXJuIHJlc3VsdDsNCn0NCmV4cG9ydHMuaGFuZGxlciA9IGZ1bmN0aW9uKGNvbnRleHQsIGV2ZW50KSB7DQogICAgdmFyIF9ldmVudCA9IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkoZXZlbnQpKTsNCiAgICB2YXIgX2RhdGEgPSBiaW4yc3RyaW5nKF9ldmVudC5ib2R5LmRhdGEpOw0KICAgIHJlcXVlc3QucG9zdCh7DQogICAgICAgIGhlYWRlcnM6eydDb250ZW50LVR5cGUnIDogJ2FwcGxpY2F0aW9uL2pzb24nfSwNCiAgICAgICAgdXJsOiAnaHR0cHM6Ly9tYWtlci5pZnR0dC5jb20vdHJpZ2dlci9tYWduZXRfZGlzY29ubmVjdGVkL2pzb24vd2l0aC9rZXkvbkl2c0RfaFNyRkFsSmtfNXRHMHVVbVY4OW9UN19vclIzZHI0NU1iT1B3NicsDQogICAgICAgIC8vYm9keTogJ3sidGhpcyI6W3siaXMiOnsic29tZSI6WyJ0ZXN0IiwiZGF0YSJdfX1dfScNCiAgICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkoW25ldyBTdHJpbmcoX2RhdGEpXSkNCiAgICAgICAgfSwgDQogICAgICAgIGZ1bmN0aW9uKGVycm9yLCByZXNwb25zZSwgYm9keSl7DQogICAgICAgICAgICAgICAgY29uc29sZS5sb2coYm9keSk7DQogICAgICAgIH0NCiAgICApOw0KICAgIGNvbnRleHQuY2FsbGJhY2soJ2ZlZWVkYmFjayBzZW5yIG1lc3NhZ2VzJyk7DQp9Ow==
    commands:
      - 'npm install request'
    runtimeAttributes:
      repositories: []
    codeEntryType: sourceCode
  platform: {}
  readinessTimeoutSeconds: 60
  version: 1
```
</br>
For deploying the function you can access, from the Nuclio dashboard, to the project IOT and create new function. When the system ask to create new function you have to select the import form yaml, and load the file "iot/alarm.yaml". At this point the dashboard show you the function IDE where it is needed to deploy on the system the function pressing the button "Deploy".
Remeber that we have to change with your IP in the url of yaml file</br>

## Sensors
The Sensors Function is written in pure JavaScript and exploits the amqplib JavaScript library to communicate trough the MQTT_Topic "iot/seat". And send any 5 seconds a message for an MQTT_Topic "iot/seat/weight", to send a new weight value, and a message for an MQTT_Topic "iot/seat/magnet" to send a new magnet value.
```
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
```
<br/>

To run the function 
```
node alarm.js
```
</br>

## ClientDevice
The IoT Client could be written in any language for any platform that support the MQTT protocol. In particular this JavaScript code consume the magnet data with "iot/belt/magnet" Topic and weight data with "iot/belt/weight" Topic and send an alarm message over the Topic “iot/trigger/alarm” to trigger the IFTTT service for the sending of message.</br>
```
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

function publish(topic, msg) {
    if (!client.connected) {
        client.on('connect', function() {
            console.log(" [x] connected " + client.connected);
            client.publish(topic, msg, function() {
                console.log(" [x] Sent %s:'%s'", topic, msg);
            })
        })
    } else {
        client.publish(topic, msg, function() {
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
    publish(topicAlarm, msg);
}
```
</br>

To run the function 
```
node clientDevice.js
```
</br>
