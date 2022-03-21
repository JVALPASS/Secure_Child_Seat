# Seure Child Car Seat
Seure_Child_Car_Seat is a project that wants to show the potential of the IoT and the Serverless approach for make our lives easier, putting putting children's lives in safety.
So in particualar the system alert with an SMS the parents when the child is on the seat, but the belt is not attached.
The application is composed by 5 functions:<br/>
- [sensor.js](##sensors): that emulates two sensors:
    1. weight sensor to detect if the child is on the seat or not. And this informations is send to an AMPQ Topic “iot/seat” with routing key “iot.weight”
    2. magnet sensor to detect if the child is on the seat or not. And this informations is send to an AMPQ Topic “iot/seat” with routing key “iot.magnet”





