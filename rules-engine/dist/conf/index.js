"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    logger: {
        style: process.env.LOG_STYLE || 'colored',
        level: process.env.LOG_LEVEL || 'trace',
        appName: 'IAAPA_BACKEND',
    },
    server: {
        port: process.env.UDP_PORT || 3333,
    },
    amqp: {
        connectionString: process.env.AMQP_CONNECTION_STRING,
        amqp_opts: {},
    },
    mongodb: {
        host: process.env.MONGODB_HOST || 'localhost',
        port: process.env.MONGODB_PORT || 5672,
        username: '',
        password: '',
    },
};
//# sourceMappingURL=index.js.map