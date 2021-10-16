import { ContextBytes, GetSchemaCallback } from "./ContextBytes";
import { ContextJson } from "./ContextJson";

/**
 * This interface must be implemented by your CustomMagicSerializer class
 */
export interface MagicSerializer {
    serializeToBytes(context: ContextJson, schema: string): ContextBytes;
    deserializeToObject(context: ContextBytes, getSchema: GetSchemaCallback): ContextJson;
}