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
