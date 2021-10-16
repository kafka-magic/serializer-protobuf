import * as protobuf from "protobufjs";
import { Buffer } from "buffer";

import { ContextBytes, GetSchemaCallback } from "./app/ContextBytes";
import { ContextJson } from "./app/ContextJson";
import { MagicSerializer } from "./app/MagicSerializer";

export class ProtobufSerializer implements MagicSerializer {

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
        const protoBuffer = this.encodeToBuffer(context.Message, proto);
        let messageBuffer = this.combineIntoMessageBuffer(context.SchemaId, protoBuffer);

        let res: ContextBytes = {
            Message: this.toBytes(messageBuffer),
            Headers: context.Headers,
            Key: context.Key,
            Offset: context.Offset,
            Partition: context.Partition,
            Timestamp: context.Timestamp,
            Topic: context.Topic
        };
        return res;
    }

    private toBuffer(msg: number[]): Buffer {
        var msgLength = msg.length;
        var messageBuffer = Buffer.alloc(msgLength, 0);
        for (var i = 0; i < msgLength; i++) {
            messageBuffer.writeUInt8(msg[i], i);
        }
        return messageBuffer;
    }

    private toBytes(msg: Buffer): number[] {
        var msgLength = msg.length;
        var messageBuffer = [];
        for (var i = 0; i < msgLength; i++) {
            messageBuffer.push(msg[i]);
        }
        return messageBuffer;
    }

    deserializeToObject(context: ContextBytes, getSchema: GetSchemaCallback): ContextJson {
        //TODO: add serializer cache for proto schemas
        let msgObj = null;
        let err = null;
        let schemaId: number;
        try {
            // get schema Id
            const msgBuffer = this.toBuffer(context.Message);
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
        const protoSchema = protobuf.parse(schema);
        let protoObj;
        for (var key in protoSchema.root.nested) {
            if (!!key) {
                protoObj = protoSchema.root.nested[key];
                break;
            }
        }
        return protoObj;
    }

    private encodeToBuffer(message: any, protoObj: any): Buffer {
        var mb = protoObj.create(message);
        return protoObj.encode(mb).finish();
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
