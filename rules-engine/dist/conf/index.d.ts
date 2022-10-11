declare const _default: {
    logger: {
        style: string;
        level: string;
        appName: string;
    };
    server: {
        port: string | number;
    };
    amqp: {
        connectionString: string | undefined;
        amqp_opts: {};
    };
    mongodb: {
        host: string;
        port: string | number;
        username: string;
        password: string;
    };
};
export default _default;
