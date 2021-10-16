import "jasmine";
import { ContextJson } from "../src/app/ContextJson";
import { ProtobufSerializer } from "../dist/bundle";

describe("CustomSerializer", () => {
    it("should serialize message to bytes and back", () => {

        var proto = `message TestMessage {
required float num  = 1;
required string payload = 2;
}`;

        let message = {
            "num": 42,
            "payload": "hello world"
        };
        let conext: ContextJson = {
            Message: message,
            Headers: null,
            SchemaId: 77,
            Key: null,
            Offset: 0,
            Partition: 0,
            Timestamp: new Date(),
            Topic: 'Topic'
        };

        const serlr = new ProtobufSerializer();
        const outContext = serlr.serializeToBytes(conext, proto);
        console.log('outContext', outContext);
        expect(outContext.Message.length).toBe(23);

        const msgContext = serlr.deserializeToObject(outContext, (id) => proto)

        console.log('msgContext', msgContext);
        expect(msgContext.Message.num).toBe(42);
        expect(msgContext.SchemaId).toBe(77);
        expect(msgContext.SchemaType).toBe('ProtoBuf');
    });
});
