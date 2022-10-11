"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setup = void 0;
// Bring in Package Dependencies
var rule_harvester_1 = __importStar(require("rule-harvester"));
var conf_1 = __importDefault(require("./conf"));
var closures_1 = __importDefault(require("./providers/closures"));
var corpus_1 = __importDefault(require("./providers/corpus"));
var amqp_cacoon_1 = __importDefault(require("amqp-cacoon"));
var setup = function (_a) {
    var logger = _a.logger;
    return __awaiter(void 0, void 0, void 0, function () {
        var amqpCacoon, coreInputAmqpProvider, rulesHarvester;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    logger.info(conf_1.default.amqp);
                    return [4 /*yield*/, new Promise(function (resolve, reject) {
                            var amqpCacoonInternal = new amqp_cacoon_1.default({
                                connectionString: conf_1.default.amqp.connectionString,
                                amqp_opts: conf_1.default.amqp.amqp_opts,
                                providers: {
                                    logger: logger,
                                },
                                onBrokerConnect: function (_connection, _url) { return __awaiter(void 0, void 0, void 0, function () {
                                    return __generator(this, function (_a) {
                                        // This is an example "Connect" event fired off by AMQP Connection Manager
                                        logger.debug("Connected to broker");
                                        return [2 /*return*/];
                                    });
                                }); },
                                onBrokerDisconnect: function (err) { return __awaiter(void 0, void 0, void 0, function () {
                                    return __generator(this, function (_a) {
                                        // This is an example "Disconnect" event fired off by AMQP Connection Manager
                                        logger.error("ERROR: Setup AmqpCacoon.onBrokerConnect - Broker disconnected", err);
                                        return [2 /*return*/];
                                    });
                                }); },
                                // Important - onChannelConnect will ensure a certain configuration exists in RMQ.
                                // This might not be needed in environments where RMQ is set up by some other process!
                                onChannelConnect: function (channel) { return __awaiter(void 0, void 0, void 0, function () {
                                    var ex_1;
                                    return __generator(this, function (_a) {
                                        switch (_a.label) {
                                            case 0:
                                                _a.trys.push([0, 4, , 5]);
                                                // Notice all of these are done in sequence with AWAIT. This is so that each
                                                // operation can depend on the prior operation having finished. This is important
                                                // when binding Queues to Exchanges, for example, because you need both the
                                                // Exchange and Queue to exist prior to trying to bind them together.
                                                // Make sure we have our example queue
                                                return [4 /*yield*/, channel.assertQueue('qu.iaapa-rules', {
                                                        autoDelete: true,
                                                        durable: false,
                                                    })];
                                            case 1:
                                                // Notice all of these are done in sequence with AWAIT. This is so that each
                                                // operation can depend on the prior operation having finished. This is important
                                                // when binding Queues to Exchanges, for example, because you need both the
                                                // Exchange and Queue to exist prior to trying to bind them together.
                                                // Make sure we have our example queue
                                                _a.sent();
                                                // Make sure we have our example exchange
                                                return [4 /*yield*/, channel.assertExchange('ex.iaapa', 'direct', {
                                                        autoDelete: true,
                                                        durable: false,
                                                    })];
                                            case 2:
                                                // Make sure we have our example exchange
                                                _a.sent();
                                                // Bind the new Exchange and Queue together
                                                return [4 /*yield*/, channel.bindQueue('qu.iaapa-rules', 'ex.iaapa', '' // Empty routing key to match anything published without one! (Messages published into this
                                                    // exchange without a routing key WILL be sent to the bound queue.
                                                    )];
                                            case 3:
                                                // Bind the new Exchange and Queue together
                                                _a.sent();
                                                resolve(amqpCacoonInternal);
                                                return [3 /*break*/, 5];
                                            case 4:
                                                ex_1 = _a.sent();
                                                logger.error("ERROR: Setup - AmqpCacoon.onChannelConnect", ex_1);
                                                // If we can't complete our connection setup, we better throw because it's unlikely we'll
                                                // be able to properly consume messages!
                                                reject(ex_1);
                                                throw ex_1;
                                            case 5: return [2 /*return*/];
                                        }
                                    });
                                }); },
                            });
                        })];
                case 1:
                    amqpCacoon = _b.sent();
                    coreInputAmqpProvider = new rule_harvester_1.CoreInputAmqp(amqpCacoon, // Our amqpCacoon object manages RMQ connections
                    'qa.iaapa-rules', // This is the queue you're going to be consuming from
                    logger, // This is the logger the libraries will use when logging anything.
                    { requeueOnNack: false });
                    rulesHarvester = new rule_harvester_1.default({
                        providers: {
                            inputs: [coreInputAmqpProvider],
                            outputs: [],
                            corpus: corpus_1.default,
                            closures: closures_1.default,
                            logger: logger,
                        },
                    });
                    rulesHarvester.start();
                    return [2 /*return*/];
            }
        });
    });
};
exports.setup = setup;
//# sourceMappingURL=setup.js.map