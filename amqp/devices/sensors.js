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
