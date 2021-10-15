import protobuf from 'protocol-buffers';

import { ContextBytes, GetSchemaCallback } from "./app/ContextBytes";
import { ContextJson } from "./app/ContextJson";

export class ProtobufSerializer {

    serializeToBytes(context: ContextJson, schema: string): ContextBytes {
        if (!context) {
            throw "Can't serialize message without context";
        }
        if (context.SchemaId !== 0 && !context.SchemaId) {
            throw "Can't serialize message without schema Id";
        }
        if (!schema) {
            throw "Can't serialize message without schema";
        }

        const proto = this.getProtoObj(schema);
        const protoBuffer = proto.encode(context.Message);
        let messageBuffer = this.combineIntoMessageBuffer(context.SchemaId, protoBuffer);

        let res: ContextBytes = {
            Message: messageBuffer,
            Headers: context.Headers,
            Key: context.Key,
            Offset: context.Offset,
            Partition: context.Partition,
            Timestamp: context.Timestamp,
            Topic: context.Topic
        };
        return res;
    }

    deserializeToObject(context: ContextBytes, getSchema: GetSchemaCallback): ContextJson {
        //TODO: add serializer cache for proto schemas
        let msgObj = null;
        let err = null;
        let schemaId: number;
        try {
            // get schema Id
            const msgBuffer = context.Message;
            schemaId = msgBuffer.readInt32BE(1);
            // get schema using GetSchemaCallback
            const schema = getSchema(schemaId);
            const proto = this.getProtoObj(schema);
            //get obj
            const objBuff = this.getObjectBuffer(msgBuffer);
            msgObj = proto.decode(objBuff)
        } catch (error) {
            if (error.message) {
                err = error.message
            }
            else {
                err = "" + error;
            }
        }

        // build context
        let res: ContextJson = {
            Message: msgObj,
            Headers: context.Headers,
            Key: context.Key,
            SchemaId: schemaId,
            SchemaType: 'ProtoBuf',
            Offset: context.Offset,
            Partition: context.Partition,
            Timestamp: context.Timestamp,
            Topic: context.Topic,
            Error: err
        };

        return res;
    };

    private getObjectBuffer(msgBuffer: Buffer) {
        let objBuffer = Buffer.alloc(msgBuffer.length - 5, 0);
        for (let i = 5; i < msgBuffer.length; i++) {
            objBuffer.writeUInt8(msgBuffer.readUInt8(i), i - 5);
        }
        return objBuffer;
    }

    private getProtoObj(schema: string): any {
        const definedMessages = protobuf(schema);
        let proto;
        for (var msgProp in definedMessages) {
            proto = definedMessages[msgProp]; // get first of defined
            break;
        }
        return proto;
    }

    private combineIntoMessageBuffer(schemaId: number, protoBuffer: Buffer): Buffer {
        const idBuffer = Buffer.alloc(5, 0);
        // magic byte 0
        idBuffer.writeUInt8(0, 0);
        // schema id
        idBuffer.writeInt32BE(schemaId, 1);

        // all serialized message bytes
        return Buffer.concat([idBuffer, protoBuffer]);
    }
}
