## Installation
To execute our application Iot Project first of all we have to install on our Ubuntu machine AMQP library<br/>
```
npm install amqp
```
## Application
The application is composed by 5 functions:<br/>
- [sensor.js](##Sensors): that emulates two sensors:
    1. weight sensor to detect if the child is on the seat or not. And this informations is send to an AMQP Exchange_Topic “iot/seat” with routing key “iot.weight”
    2. magnet sensor to detect if the child is on the seat or not. And this informations is send to an AMQP Exchange_Topic “iot/seat” with routing key “iot.magnet”
- [receiverweight.yaml](#ReceiverWeightFunction) that is a Nuclio Function that is triggered when a weight is published by the sensors with the Exchange Topic “iot/seat”, and routing key “iot.weight”, it will filter and send only the weight over 1kg to the Exchange_Topic "iot/belt" with routing key "belt.weight", so these data will be received by the ClientDevice that will rise the alarm.
- [receivermagnet.yaml](#ReceiverMagnetFunction) that is a Nuclio Function that is triggered when a magnet information is published by the sensors with the Exchange_Topic “iot/seat”, and routing key “iot.magnet”, it will send the message received by the sensor, about if the magnet is connected or not, to the Exchange_Topic "iot/belt" with routing key "belt.magnet", so these data will be received by the ClientDevice that will rise the alarm.
- [clientDevice.js](#ClientDevice) The subscriber will consume the message about the weight over the queue trough the Exchange_Topic "iot/belt" with routing key “belt.weight”, after this the subscriber will bind to the queue with routing key “belt.magnet”, and after six seconds if does not receive a message from the magnet, it unbind from the queue about the magnet, in this way we consume only fresh information. This function if has received a weight "over 1kg" and magnet "disconnected", send an alarm message to an Exchange_Topic = “iot/trigger” with routing key “iot.alarm”.
- [alarm.yaml](#Alarm) Nuclio function that will be triggered when a new message is published with Exchange_Topic “iot/trigger” with routing key “iot.alarm”, and the message received will trigger an IFTTT service to send thtis message as SMS to the smartphone of user.<br/>
## Architeture
<img src="https://github.com/JVALPASS/Secure_Child_Seat/blob/main/assets/architetureserverless.png" width="800" height="500"></br>
## ReceiverWeightFunction
The Receiver Weight Function Function is written in pure JavaScript and exploits the amqplib JavaScript library to communicate on the "iot/seat" Exchange_Topic. The function is deployed using the Docker compose specifics for Nuclio. This is achieved by define a new yaml file that declares all functions specifications and source code. The source code of the function (the JavaScript code) is encoded in base64 and copied in the attribute "functionSourceCode", moreover, is defined a new trigger on the amqp protocol that allows to automatically invoke the function when a new message is coming on the Exchange_Topic "iot/seat" for the routing key "iot.weight". Since the functions exploits the amqplib in the "commands" attribute is added the command to install on Node.js the amqplib (npm install amqplib).
```
metadata:
  name: receiverweight
  labels:
    nuclio.io/project-name: 7830d63b-24ec-40ec-8688-0dfa91e031cc
spec:
  handler: "main:handler"
  runtime: nodejs
  resources: {}
  image: "nuclio/processor-receiverweight:latest"
  minReplicas: 1
  maxReplicas: 1
  targetCPU: 75
  triggers:
    TriggerWeight:
      class: ""
      kind: rabbit-mq
      url: "amqp://guest:guest@192.168.1.16:5672"
      attributes:
        exchangeName: iot/seat
        queueName: iot/seat
        topics:
          - iot.weight
  build:
    functionSourceCode: dmFyIGFtcXAgPSByZXF1aXJlKCdhbXFwbGliJyk7DQp2YXIgYW1xcDIgPSByZXF1aXJlKCdhbXFwbGliL2NhbGxiYWNrX2FwaScpOw0KICAgICAgICB2YXIgRlVOQ1RJT05fTkFNRSA9ICJyZWNlaXZlcndlaWdodCI7DQogICAgICAgIGZ1bmN0aW9uIHNlbmRfbWVzc2FnZShtc2cscm91dGluZ19rZXkpew0KICAgICAgICAgICAgYW1xcDIuY29ubmVjdCgnYW1xcDovL2d1ZXN0Omd1ZXN0QDE5Mi4xNjguMS4xNjo1NjcyJywgZnVuY3Rpb24oZXJyb3IwLCBjb25uZWN0aW9uKSB7DQogICAgICAgICAgICAgICAgaWYgKGVycm9yMCkgew0KICAgICAgICAgICAgICAgICAgICB0aHJvdyBlcnJvcjA7DQogICAgICAgICAgICAgICAgfQ0KICAgICAgICAgICAgICAgIGNvbm5lY3Rpb24uY3JlYXRlQ2hhbm5lbChmdW5jdGlvbihlcnJvcjEsIGNoYW5uZWwpIHsNCiAgICAgICAgICAgICAgICAgICAgaWYgKGVycm9yMSkgew0KICAgICAgICAgICAgICAgICAgICB0aHJvdyBlcnJvcjE7DQogICAgICAgICAgICAgICAgICAgIH0NCiAgICAgICAgICAgICAgICAgICAgdmFyIGV4Y2hhbmdlID0gJ2lvdC9iZWx0JzsNCiAgICAgICAgICAgICAgICAgICAgdmFyIGtleSA9IHJvdXRpbmdfa2V5Ow0KICAgICAgICAgICAgICAgICAgICANCiAgICAgICAgICAgICAgICAgICAgY2hhbm5lbC5hc3NlcnRFeGNoYW5nZShleGNoYW5nZSwgJ3RvcGljJywgew0KICAgICAgICAgICAgICAgICAgICBkdXJhYmxlOiBmYWxzZQ0KICAgICAgICAgICAgICAgICAgICB9KTsNCiAgICAgICAgICAgICAgICAgICAgY2hhbm5lbC5wdWJsaXNoKGV4Y2hhbmdlLCBrZXksIEJ1ZmZlci5mcm9tKG1zZykpOw0KICAgICAgICAgICAgICAgIH0pOw0KICAgICAgICAgICAgfSk7DQogICAgICAgIH0NCiAgICAgICAgZnVuY3Rpb24gYmluMnN0cmluZyhhcnJheSl7DQogICAgICAgICAgdmFyIHJlc3VsdCA9ICIiOw0KICAgICAgICAgIGZvcih2YXIgaSA9IDA7IGkgPCBhcnJheS5sZW5ndGg7ICsraSl7DQogICAgICAgICAgICByZXN1bHQrPSAoU3RyaW5nLmZyb21DaGFyQ29kZShhcnJheVtpXSkpOw0KICAgICAgICAgIH0NCiAgICAgICAgICByZXR1cm4gcmVzdWx0Ow0KICAgICAgICB9DQoNCiAgICAgICAgZXhwb3J0cy5oYW5kbGVyID0gZnVuY3Rpb24oY29udGV4dCwgZXZlbnQpIHsNCiAgICAgICAgICAgIHZhciBfZXZlbnQgPSBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KGV2ZW50KSk7DQogICAgICAgICAgICB2YXIgX2RhdGEgPSBiaW4yc3RyaW5nKF9ldmVudC5ib2R5LmRhdGEpOw0KDQogICAgICAgICAgICBjb250ZXh0LmNhbGxiYWNrKCJmZWVkYmFjayAiK19kYXRhKTsNCg0KICAgICAgICAgICAgY29uc29sZS5sb2coIlRSSUdHRVIgIitfZGF0YSk7DQogICAgICAgICAgICBpZihfZGF0YT4xMDAwKXsNCiAgICAgICAgICAgICAgICBzZW5kX21lc3NhZ2UoX2RhdGEsJ2JlbHQud2VpZ2h0Jyk7DQogICAgICAgICAgICB9DQogICAgICAgIH07
    commands:
      - 'npm install amqplib'
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
The Receiver Magnet Function Function is written in pure JavaScript and exploits the amqplib JavaScript library to communicate on the "iot/seat" Exchange_Topic. The function is deployed using the Docker compose specifics for Nuclio. This is achieved by define a new yaml file that declares all functions specifications and source code. The source code of the function (the JavaScript code) is encoded in base64 and copied in the attribute "functionSourceCode", moreover, is defined a new trigger on the amqp protocol that allows to automatically invoke the function when a new message is coming on the Exchange_Topic "iot/seat" for the routing key "iot.magnet". Since the functions exploits the amqplib in the "commands" attribute is added the command to install on Node.js the amqplib (npm install amqplib).
```
metadata:
  name: receivermagnet
  labels:
    nuclio.io/project-name: 7830d63b-24ec-40ec-8688-0dfa91e031cc
spec:
  handler: "main:handler"
  runtime: nodejs
  resources: {}
  image: "nuclio/processor-receivermagnet:latest"
  minReplicas: 1
  maxReplicas: 1
  targetCPU: 75
  triggers:
    TriggerMagnet:
      class: ""
      kind: rabbit-mq
      url: "amqp://guest:guest@192.168.1.16:5672"
      attributes:
        exchangeName: iot/seat
        queueName: iot/seat
        topics:
          - iot.magnet
  build:
    functionSourceCode: dmFyIGFtcXAgPSByZXF1aXJlKCdhbXFwbGliJyk7DQp2YXIgYW1xcDIgPSByZXF1aXJlKCdhbXFwbGliL2NhbGxiYWNrX2FwaScpOw0KICAgICAgICB2YXIgRlVOQ1RJT05fTkFNRSA9ICJyZWNlaXZlcm1hZ25ldCI7DQogICAgICAgIGZ1bmN0aW9uIHNlbmRfbWVzc2FnZShtc2cscm91dGluZ19rZXkpew0KICAgICAgICAgICAgYW1xcDIuY29ubmVjdCgnYW1xcDovL2d1ZXN0Omd1ZXN0QDE5Mi4xNjguMS4xNjo1NjcyJywgZnVuY3Rpb24oZXJyb3IwLCBjb25uZWN0aW9uKSB7DQogICAgICAgICAgICAgICAgaWYgKGVycm9yMCkgew0KICAgICAgICAgICAgICAgICAgICB0aHJvdyBlcnJvcjA7DQogICAgICAgICAgICAgICAgfQ0KICAgICAgICAgICAgICAgIGNvbm5lY3Rpb24uY3JlYXRlQ2hhbm5lbChmdW5jdGlvbihlcnJvcjEsIGNoYW5uZWwpIHsNCiAgICAgICAgICAgICAgICAgICAgaWYgKGVycm9yMSkgew0KICAgICAgICAgICAgICAgICAgICB0aHJvdyBlcnJvcjE7DQogICAgICAgICAgICAgICAgICAgIH0NCiAgICAgICAgICAgICAgICAgICAgdmFyIGV4Y2hhbmdlID0gJ2lvdC9iZWx0JzsNCiAgICAgICAgICAgICAgICAgICAgdmFyIGtleSA9IHJvdXRpbmdfa2V5Ow0KICAgICAgICAgICAgICAgICAgICANCiAgICAgICAgICAgICAgICAgICAgY2hhbm5lbC5hc3NlcnRFeGNoYW5nZShleGNoYW5nZSwgJ3RvcGljJywgew0KICAgICAgICAgICAgICAgICAgICBkdXJhYmxlOiBmYWxzZQ0KICAgICAgICAgICAgICAgICAgICB9KTsNCiAgICAgICAgICAgICAgICAgICAgY2hhbm5lbC5wdWJsaXNoKGV4Y2hhbmdlLCBrZXksIEJ1ZmZlci5mcm9tKG1zZykpOw0KICAgICAgICAgICAgICAgIH0pOw0KICAgICAgICAgICAgfSk7DQogICAgICAgIH0NCiAgICAgICAgZnVuY3Rpb24gYmluMnN0cmluZyhhcnJheSl7DQogICAgICAgICAgdmFyIHJlc3VsdCA9ICIiOw0KICAgICAgICAgIGZvcih2YXIgaSA9IDA7IGkgPCBhcnJheS5sZW5ndGg7ICsraSl7DQogICAgICAgICAgICByZXN1bHQrPSAoU3RyaW5nLmZyb21DaGFyQ29kZShhcnJheVtpXSkpOw0KICAgICAgICAgIH0NCiAgICAgICAgICByZXR1cm4gcmVzdWx0Ow0KICAgICAgICB9DQoNCiAgICAgICAgZXhwb3J0cy5oYW5kbGVyID0gZnVuY3Rpb24oY29udGV4dCwgZXZlbnQpIHsNCiAgICAgICAgICAgIHZhciBfZXZlbnQgPSBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KGV2ZW50KSk7DQogICAgICAgICAgICB2YXIgX2RhdGEgPSBiaW4yc3RyaW5nKF9ldmVudC5ib2R5LmRhdGEpOw0KDQogICAgICAgICAgICBjb250ZXh0LmNhbGxiYWNrKCJmZWVkYmFjayAiK19kYXRhKTsNCg0KICAgICAgICAgICAgY29uc29sZS5sb2coIlRSSUdHRVIgIitfZGF0YSk7DQogICAgICAgICAgICBzZW5kX21lc3NhZ2UoX2RhdGEsJ2JlbHQubWFnbmV0Jyk7DQogICAgICAgIH07
    commands:
      - 'npm install amqplib'
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
The Alarm Function Function is written in pure JavaScript and exploits the amqplib JavaScript library to communicate on the "iot/trigger" queue. The function is deployed using the Docker compose specifics for Nuclio. This is achieved by define a new yaml file that declares all functions specifications and source code. The source code of the function (the JavaScript code) is encoded in base64 and copied in the attribute "functionSourceCode", moreover, is defined a new trigger on the amqp protocol that allows to automatically invoke the function when a new message is coming on the Exchange_Topic "iot/trigger" for the routing key “iot.alarm”. Since the functions exploits the amqplib in the "commands" attribute is added the command to install on Node.js the amqplib (npm install amqplib), and we have also add the command to install on Node.js 'npm install request', because the code make an HTTPS request to call an event on IFTTT.
```
metadata:
  name: alarm
  labels:
    nuclio.io/project-name: 7830d63b-24ec-40ec-8688-0dfa91e031cc
spec:
  handler: "main:handler"
  runtime: nodejs
  resources: {}
  image: "nuclio/processor-alarm:latest"
  minReplicas: 1
  maxReplicas: 1
  targetCPU: 75
  triggers:
    TriggerAlarm:
      class: ""
      kind: rabbit-mq
      url: "amqp://guest:guest@192.168.1.16:5672"
      attributes:
        exchangeName: iot/trigger
        queueName: iot/trigger
        topics:
          - iot.alarm
  build:
    functionSourceCode: dmFyIHJlcXVlc3QgPSByZXF1aXJlKCdyZXF1ZXN0Jyk7DQpmdW5jdGlvbiBiaW4yc3RyaW5nKGFycmF5KXsNCiAgICB2YXIgcmVzdWx0ID0gIiI7DQogICAgZm9yKHZhciBpID0gMDsgaSA8IGFycmF5Lmxlbmd0aDsgKytpKXsNCiAgICAgICAgcmVzdWx0Kz0gKFN0cmluZy5mcm9tQ2hhckNvZGUoYXJyYXlbaV0pKTsNCiAgICB9DQogICAgcmV0dXJuIHJlc3VsdDsNCn0NCmV4cG9ydHMuaGFuZGxlciA9IGZ1bmN0aW9uKGNvbnRleHQsIGV2ZW50KSB7DQogICAgdmFyIF9ldmVudCA9IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkoZXZlbnQpKTsNCiAgICB2YXIgX2RhdGEgPSBiaW4yc3RyaW5nKF9ldmVudC5ib2R5LmRhdGEpOw0KICAgIHJlcXVlc3QucG9zdCh7DQogICAgICAgIGhlYWRlcnM6eydDb250ZW50LVR5cGUnIDogJ2FwcGxpY2F0aW9uL2pzb24nfSwNCiAgICAgICAgdXJsOiAnaHR0cHM6Ly9tYWtlci5pZnR0dC5jb20vdHJpZ2dlci9tYWduZXRfZGlzY29ubmVjdGVkL2pzb24vd2l0aC9rZXkvbkl2c0RfaFNyRkFsSmtfNXRHMHVVbVY4OW9UN19vclIzZHI0NU1iT1B3NicsDQogICAgICAgIC8vYm9keTogJ3sidGhpcyI6W3siaXMiOnsic29tZSI6WyJ0ZXN0IiwiZGF0YSJdfX1dfScNCiAgICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkoW25ldyBTdHJpbmcoX2RhdGEpXSkNCiAgICAgICAgfSwgDQogICAgICAgIGZ1bmN0aW9uKGVycm9yLCByZXNwb25zZSwgYm9keSl7DQogICAgICAgICAgICAgICAgY29uc29sZS5sb2coYm9keSk7DQogICAgICAgIH0NCiAgICApOw0KICAgIGNvbnRleHQuY2FsbGJhY2soJ2ZlZWVkYmFjayBzZW5yIG1lc3NhZ2VzJyk7DQp9Ow==
    commands:
      - 'npm install amqplib'
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
The Sensors Function is written in pure JavaScript and exploits the amqplib JavaScript library to communicate trough the Exchange_Topic "iot/seat". And send any 5 seconds a message for routing key "iot.weight", to send a new weight value, and a message for routing key "iot.magnet" to send a new magnet value.
```
#!/usr/bin/env node

var amqp = require('amqplib/callback_api');
function sensor(){
	amqp.connect('amqp://guest:guest@192.168.1.16:5672', function(error0, connection) {
	  if (error0) {
	    throw error0;
	  }
	  connection.createChannel(function(error1, channel) {
	    if (error1) {
	      throw error1;
	    }
	    var exchange = 'iot/seat';
	    var key1 = 'iot.weight';
	    var key2 = 'iot.magnet';
	    min = Math.ceil(100);
	    max = Math.floor(2000);
	    var msg1 = (Math.floor(Math.random() * (max - min + 1) + min)).toString();
	    var msg2 = (Boolean(Math.round(Math.random()))).toString();

	    channel.assertExchange(exchange, 'topic', {
	      durable: false
	    });
	    console.log(" [x] Sent %s:'%s'", key1, msg1);
	    channel.publish(exchange, key1, Buffer.from(msg1));
	    setTimeout(function() {
	       console.log(" [x] Sent %s:'%s'", key2, msg2);
	       channel.publish(exchange, key2, Buffer.from(msg2));
            }, 1000);
	  });
	  setTimeout(sensor, 5000);

	  /*setTimeout(function() {
	    connection.close();
	    process.exit(0)
	  }, 500);*/
	});
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
The IoT Client could be written in any language for any platform that support the AMQP protocol. In particular this JavaScript code consume the magnet (routing key = "iot.magnet") and weight (routing key = "iot.weight") data over the Exchange_Topic "iot/belt" and send an alarm message over the Exchange_Topic “iot/trigger” with routing key “iot.alarm” to trigger the IFTTT service for the sending of message.</br>
```
#!/usr/bin/env node

var amqp = require('amqplib/callback_api');
let timerId;
amqp.connect('amqp://guest:guest@192.168.1.16:5672', function(error0, connection) {
  if (error0) {
    throw error0;
  }
  connection.createChannel(function(error1, channel) {
    if (error1) {
      throw error1;
    }
    var exchange = 'iot/belt';

    channel.assertExchange(exchange, 'topic', {
      durable: false
    });

    channel.assertQueue('', {
      exclusive: true
    }, function(error2, q) {
      if (error2) {
        throw error2;
      }
      console.log(' [*] Waiting for logs. To exit press CTRL+C');
      key1 = 'belt.weight';
      key2 = 'belt.magnet';
      channel.bindQueue(q.queue, exchange, key1);

      channel.consume(q.queue, function(msg) {
      	console.log(" [x] %s:'%s'", msg.fields.routingKey, msg.content.toString());
      	if(msg.fields.routingKey == 'belt.magnet'){
      	     clearTimeout(timerId);
      	     if(msg.content!='true'){
      	     	sendAlert();
      	     }
      	     channel.unbindQueue(q.queue, exchange, key2);
      	     console.log(" [x] disconnetto belt.magnet");
      	}else {
      	     console.log(" [x] connetto belt.magnet");
             channel.bindQueue(q.queue, exchange, key2);
             timerId = setTimeout(function() { //
	         channel.unbindQueue(q.queue, exchange, key2);
	         console.log(" [x] disconnetto belt.magnet");
	     }, 6000);//
        }
      }, {
        noAck: false
      });
    });
  });
});
function sendAlert(){
  console.log(' [x] alert');
  amqp.connect('amqp://guest:guest@192.168.1.16:5672', function(error0, connection) {
  if (error0) {
    throw error0;
  }
  connection.createChannel(function(error1, channel) {
    if (error1) {
      throw error1;
    }
    var exchange = 'iot/trigger';
    var args = process.argv.slice(2);
    var key = 'iot.alarm';
    var msg = 'ALARM!!!!!!!: CONNECT BELT';

    channel.assertExchange(exchange, 'topic', {
      durable: false
    });
    console.log(" [x] Sent %s:'%s'", key, msg);
    channel.publish(exchange, key, Buffer.from(msg));
  });

});
}
```
</br>

To run the function 
```
node clientDevice.js
```
</br>
