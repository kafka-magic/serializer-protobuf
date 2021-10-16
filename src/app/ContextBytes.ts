/**
 * Callback function to retrieve schema from the registry
 * by id or subject
 */
export type GetSchemaCallback = (id: number|string) => string;

/**
 * Context holding info received or sent to Kafka topic
 * Key and Message as byte arrays - exectly as stored in the topic
 */
export interface ContextBytes {
    /**
     * Message Key
     * @returns array of bytes
     */
    Key: number[];

    /**
     * original message value
     * @returns byte array
     */
    Message: number[];

    /**
     * Headers dictionary
     * @returns JavaScript object
     */
    Headers: any;

    /**
     * Topic name
     * @returns string
     */
    Topic: string;

    /**
     * Partition Id
     * @returns number
     */
    Partition: number;

    /**
     * Offset in this partition
     * @returns number
     */
    Offset: number;

    /**
     * Message Timestamp
     * @returns JavaScript Date object
     */
    Timestamp: Date;
}

