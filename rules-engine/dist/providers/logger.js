"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getErrorJSON = exports.createTemporaryLogger = exports.createLogger = exports.getLogger = void 0;
var log4js_1 = __importDefault(require("log4js"));
var json_stringify_safe_1 = __importDefault(require("json-stringify-safe"));
var uuid_1 = require("uuid");
var lodash_1 = require("lodash");
var APP_INSTANCE_ID = (0, uuid_1.v4)();
var loggers = {};
var defaultConfg;
var loggerSetup = false;
function setupLogger(conf) {
    // Return immediatly if logger is already setup
    if (loggerSetup)
        return;
    log4js_1.default.addLayout('json', function (config) {
        return function (logEvent) {
            // If json is an instance of an error object then we need to
            // make the non-enumerable field in the error object enumerable
            // for proper logging
            var dataJson = {};
            if (logEvent && logEvent.data && logEvent.data.length > 0) {
                for (var i = 0; i < logEvent.data.length; i++) {
                    if (logEvent.data[i] instanceof Error) {
                        logEvent.data[i] = getErrorJSON(logEvent.data[i]);
                    }
                    if (!(typeof logEvent.data[i] === 'string') &&
                        typeof logEvent.data[i] === 'object' &&
                        logEvent.data[i] !== null) {
                        for (var _i = 0, _a = Object.keys(logEvent.data[i]); _i < _a.length; _i++) {
                            var key = _a[_i];
                            dataJson[key] = logEvent.data[i][key];
                        }
                    }
                }
                logEvent.dataJson = dataJson;
            }
            return (0, json_stringify_safe_1.default)(logEvent) + config.separator;
        };
    });
    // Choose the default log based on a config value, if present
    var defaultLogAppender;
    switch (conf.style) {
        case 'json':
            defaultLogAppender = 'console_json';
            break;
        default:
            defaultLogAppender = 'console_colored';
    }
    // Set Logger Settings
    // colored console output
    // file saved locally up to 10megs then backend up and log rolling
    // pm2 (boolean) (optional) - set this to true if you’re running your app using pm2, otherwise logs will not work
    // (you’ll also need to install pm2-intercom as pm2 module: pm2 install pm2-intercom)
    // pm2 ends up with duplicate log entries, so we disableClustering, but then we're careful to use named files per process!
    // Need to do addLevels here instead of passing to configure, because ts throws errors.
    log4js_1.default.levels.addLevels({
        alarm: {
            value: log4js_1.default.levels.ERROR.level + 5,
            colour: 'magenta',
        },
    });
    log4js_1.default.configure({
        pm2: false,
        disableClustering: true,
        appenders: {
            console_colored: {
                type: 'stdout',
                layout: { type: 'colored' },
            },
            console_json: {
                type: 'stdout',
                layout: { type: 'json', separator: '' },
            },
        },
        categories: {
            default: {
                appenders: [defaultLogAppender],
                level: 'debug',
            },
        },
    });
    loggerSetup = true;
}
function getLogger(conf, name) {
    if (name === void 0) { name = 'DEFAULT'; }
    if (!conf) {
        conf = defaultConfg;
    }
    if (!conf) {
        throw new Error('Error getting logger (No configuration available)');
    }
    if (!defaultConfg && conf) {
        defaultConfg = conf;
    }
    setupLogger(conf); // Does nothing if already setup
    if (!loggers[name]) {
        var logger = log4js_1.default.getLogger(name);
        logger.level = conf.level;
        logger.addContext('appInstanceId', APP_INSTANCE_ID);
        logger.addContext('appName', conf.appName);
        loggers[name] = logger;
    }
    return loggers[name];
}
exports.getLogger = getLogger;
exports.createLogger = getLogger; // Here for backwards compatibility
/**
 * Create temporray logger based on old logger
 * @param categoryName
 * @param context
 * @return logger
 */
function createTemporaryLogger(categoryName, oldLogger) {
    var logger = log4js_1.default.getLogger(categoryName);
    logger.context = (0, lodash_1.cloneDeep)(oldLogger.context);
    logger.addContext('temporaryLogger', true);
    logger.level = oldLogger.level;
    return logger;
}
exports.createTemporaryLogger = createTemporaryLogger;
/***
 * The standard Error object fields (message and stack)
 * are not enumerable fields. This uses Object.getOwnPropertyNames instead of Object.keys
 * To copy all fields including non-enumerable fields to a new object where those fields
 * are enumerable
 ***/
function getErrorJSON(error) {
    var alt = {};
    Object.getOwnPropertyNames(error).forEach(function (key) {
        alt[key] = error[key];
    });
    return alt;
}
exports.getErrorJSON = getErrorJSON;
//# sourceMappingURL=logger.js.map