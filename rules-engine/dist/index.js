"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var setup_1 = require("./setup");
var conf_1 = __importDefault(require("./conf"));
var logger_1 = require("./providers/logger");
console.log(conf_1.default);
var logger = (0, logger_1.getLogger)(conf_1.default.logger, 'Backend');
logger.info('Rules Engine Starting');
(0, setup_1.setup)({ logger: logger })
    .then(function () {
    logger.info('Rules Engine Started');
})
    .catch(function (err) {
    logger.info('Error Starting Rules Engine', err);
});
//# sourceMappingURL=index.js.map