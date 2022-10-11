"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var rule_harvester_1 = require("rule-harvester");
exports.default = [
    (0, rule_harvester_1.closureGenerator)('logFacts', function (facts, context) {
        context.logger.info(facts);
        return facts;
    }),
];
//# sourceMappingURL=actions.js.map