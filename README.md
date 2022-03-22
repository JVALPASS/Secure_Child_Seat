## Seure Child Car Seat
Seure_Child_Car_Seat is a project that wants to show the potential of the IoT and the Serverless approach for make our lives easier, putting putting children's lives in safety.
So in particualar the system alert with an SMS the parents when the child is on the seat, but the belt is not attached.<br/>
The application is composed by 5 functions:<br/>
- [sensor.js](##sensors): that emulates two sensors:
    1. weight sensor to detect if the child is on the seat or not. And this informations is send to an AMPQ Topic “iot/seat” with routing key “iot.weight”
    2. magnet sensor to detect if the child is on the seat or not. And this informations is send to an AMPQ Topic “iot/seat” with routing key “iot.magnet”
- [receivermagnet.yaml](##ReceiverMagnet) that is a Nuclio Function that is triggered when a weight is published by the sensors with the Exchange Topic “iot/seat”, and    routing key “iot.weight”, it will filter and send only the weight over 1kg to the node that will rise the alarm, with routing key “belt.weight” with an Exchange Topic “iot/belt”.
- [receiverweight.yaml](##ReeceiverWeight) that is a Nuclio Function that is triggered when a magnet information is published by the sensors with the Exchange Topic “iot/seat”, and routing key “iot.magnet”, it will send the message received by the sensor, about if the magnet is connected or not, to the node that will rise the alarm with routing key “belt.magnet” with an Exchange Topic “iot/belt”.
- [callAlarm.js](##CallAlarm) The subscriber will consume the message about the weight with routing key “belt.weight”
The subscriber will bind to the queue with routing key “belt.magnet” only after receive a message about the weight
After five seconds that does not receive a message from the magnet, it unbind from the queue, in this way we consume only fresh information.
- [alarm.yaml](##Alarm) Nuclio function that will be triggered when a new message is published with Topic “iot/trigger” with routing key “iot.alarm”, and the message received will be send trough IFTTT application as SMS to the smartphone of user.<br/>
## Prerequisites
* OS:
    * Ubuntu 18.04 LTS or more recent
* Software:
    * Docker and Docker Compose (Application containers engine)
    * Nuclio (Serverless computing provider)
    * RabbitMQ (AMQP and MQTT message broker)
    * Node.js
## Installation
This project is made on top of one local machine an Linux Ubuntu ? LTS machine.
## Docker
Docker is a tool designed to make it easier to create, deploy, and run applications by using containers.
**Install Docker using the Docker CE installation [GUIDE](https://docs.docker.com/engine/install/ubuntu/).**<br/>
```$ sudo apt-get update
$ sudo apt-get install \
    apt-transport-https \
    ca-certificates \
    curl \
    software-properties-common
$ curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
$ sudo apt-key fingerprint 0EBFCD88
$ sudo add-apt-repository \
   "deb [arch=amd64] https://download.docker.com/linux/ubuntu \
   $(lsb_release -cs) \
   stable"
$ sudo apt-get update
$ sudo apt-get install docker-ce
```
IMPORTANT FIX Ubuntu 18.04 changed to use systemd-resolved to generate /etc/resolv.conf. Now by default it uses a local DNS cache 127.0.0.53. That will not work inside a container, so Docker will default to Google's 8.8.8.8 DNS server, which may break for people behind a firewall. Refers to the [Stackoverflow discussion.](https://github.com/spagnuolocarmine/serverless-computing-for-iot#:~:text=Stackoverflow%20discussion.)
