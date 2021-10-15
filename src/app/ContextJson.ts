/**
 * Context holding Message and Key deserialized as Js objects
 */
 export interface ContextJson {

    /**
     * Deserialized message value
     * @returns JavaScript object
     */
    Message: any;

    /**
     * Schema id
     */
    SchemaId?: number, 

    /**
     * Schema type
     */
     SchemaType?: string, 

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

    /**
     * Headers dictionary
     * @returns JavaScript object
     */
    Headers: any;

    /**
     * Deserialized message Key
     * @returns JavaScript object
     */
    Key: any;

    /**
     * Description of deserialization errors. Can be used to filter out failures.
     * @returns null or error message
     * */
    Error?: string;
}