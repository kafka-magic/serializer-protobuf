var ProtobufSerializer = require('./dist/bundle').ProtobufSerializer;

var proto = `message Test {
required float num  = 1;
required string payload = 2;
}`;


var ctx = {
    Message: {
        "num": 42,
        "payload": "hello world"
    },
    SchemaId: 77,
    Topic: 'topic1'
};

console.log('ProtobufSerializer', ProtobufSerializer);
var ser = new ProtobufSerializer();

var outContext = ser.serializeToBytes(ctx, proto);
console.log(outContext);

var res = ser.deserializeToObject(outContext, (id) => proto)
console.log(res);