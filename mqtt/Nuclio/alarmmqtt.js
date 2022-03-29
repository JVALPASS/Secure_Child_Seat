var request = require('request');
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
    request.post({
        headers:{'Content-Type' : 'application/json'},
        url: 'https://maker.ifttt.com/trigger/magnet_disconnected/json/with/key/nIvsD_hSrFAlJk_5tG0uUmV89oT7_orR3dr45MbOPw6',
        //body: '{"this":[{"is":{"some":["test","data"]}}]}'
        body: JSON.stringify([new String(_data)])
        }, 
        function(error, response, body){
                console.log(body);
        }
    );
    context.callback('feeedback senr messages');
};
