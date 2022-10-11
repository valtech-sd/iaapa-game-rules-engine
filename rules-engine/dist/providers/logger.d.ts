import { Logger } from 'log4js';
export { Logger };
export declare function getLogger(conf: {
    style: string;
    level: string;
    appName: string;
} | undefined, name?: string): any;
export declare const createLogger: typeof getLogger;
/**
 * Create temporray logger based on old logger
 * @param categoryName
 * @param context
 * @return logger
 */
export declare function createTemporaryLogger(categoryName: string, oldLogger: any): Logger;
/***
 * The standard Error object fields (message and stack)
 * are not enumerable fields. This uses Object.getOwnPropertyNames instead of Object.keys
 * To copy all fields including non-enumerable fields to a new object where those fields
 * are enumerable
 ***/
export declare function getErrorJSON(error: any): any;
