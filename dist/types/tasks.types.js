"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Status = exports.Priority = void 0;
var Priority;
(function (Priority) {
    Priority["LOW"] = "low";
    Priority["MEDIUM"] = "medium";
    Priority["HIGH"] = "high";
})(Priority || (exports.Priority = Priority = {}));
var Status;
(function (Status) {
    Status["PENDING"] = "pending";
    Status["IN_PROGRESS"] = "in_progress";
    Status["COMPLETED"] = "completed";
})(Status || (exports.Status = Status = {}));
//# sourceMappingURL=tasks.types.js.map