"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
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
var path_1 = __importDefault(require("path"));
var request_promise_native_1 = __importDefault(require("request-promise-native"));
var lexic_1 = require("./lexic");
var utils_1 = require("./utils");
var BASE_PATH = __dirname;
var EXTERNAL_URL = /^https?:\/\/(.+)$/, variableRegex = /--VARIABLE\[([0-9]+)\]--/, importRegex = /--IMPORT\[([0-9]+)\]--/, assignedRegex = /--ASSIGNED\[([0-9]+)\]--/, scriptRegex = /--SCRIPT\[([0-9]+)\]--/, Variables = {}, Imports = {};
function toDestructure(str) {
    var matches = str.match(lexic_1.__JSONX_DESTRUCT_ASSIGN);
    var fields = [];
    var isArray = false;
    if (matches === null || matches === void 0 ? void 0 : matches.length) {
        isArray = /\[(.+)\]$/.test(matches[0]);
        str = str.replace(lexic_1.__JSONX_DESTRUCT_ASSIGN, ''); // remove assignment
        fields = matches[isArray ? 4 : 2].split(/\s*,\s*/);
    }
    return { str: str, fields: fields, isArray: isArray };
}
function destructure(jsonData, fields, isArray) {
    var toReturn = isArray ? [] : {};
    fields.map(function (key) {
        isArray ?
            toReturn.push(jsonData[key] || null)
            : toReturn[key] = jsonData[key] || null;
    });
    return toReturn;
}
function fetchImport(uri) {
    return __awaiter(this, void 0, void 0, function () {
        var jsonData, _a, error_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 5, , 6]);
                    if (!EXTERNAL_URL.test(uri)) return [3 /*break*/, 2];
                    return [4 /*yield*/, (0, request_promise_native_1.default)(uri)];
                case 1:
                    _a = _b.sent();
                    return [3 /*break*/, 4];
                case 2: return [4 /*yield*/, Promise.resolve().then(function () { return __importStar(require(path_1.default.resolve(BASE_PATH, uri))); })];
                case 3:
                    _a = _b.sent();
                    _b.label = 4;
                case 4:
                    jsonData = _a;
                    // No data found
                    if (!jsonData)
                        return [2 /*return*/, null];
                    if (typeof jsonData !== 'object')
                        try {
                            return [2 /*return*/, JSON.parse(jsonData)];
                        }
                        catch (error) {
                            return [2 /*return*/, null];
                        }
                    return [2 /*return*/, jsonData];
                case 5:
                    error_1 = _b.sent();
                    throw new Error("Importing from " + uri + " Failed: " + error_1);
                case 6: return [2 /*return*/];
            }
        });
    });
}
function compile(json, syntaxTree, contentType) {
    return __awaiter(this, void 0, void 0, function () {
        var compiledJSON, _a, _b, _i, key, value, _c, _d, _e, _, index, _f, str, fields, isArray, _g, _h, _j, _k, _, index, _l, _, index, _m, str, fields, isArray, _o, _, index, 
        // Replace JSONX assignments in the script with equivalent values
        script;
        return __generator(this, function (_p) {
            switch (_p.label) {
                case 0:
                    compiledJSON = contentType == 'array' ? [] : {};
                    _a = [];
                    for (_b in json)
                        _a.push(_b);
                    _i = 0;
                    _p.label = 1;
                case 1:
                    if (!(_i < _a.length)) return [3 /*break*/, 9];
                    key = _a[_i];
                    value = json[key];
                    if (!(typeof value == 'object')) return [3 /*break*/, 3];
                    _c = compiledJSON;
                    _d = key;
                    return [4 /*yield*/, compile(value, syntaxTree, (0, utils_1.getType)(value))];
                case 2:
                    _c[_d] = _p.sent();
                    return [3 /*break*/, 8];
                case 3:
                    if (!importRegex.test(value)) return [3 /*break*/, 7];
                    _e = value.match(importRegex), _ = _e[0], index = _e[1], _f = toDestructure(syntaxTree.IMPORTS[index]), str = _f.str, fields = _f.fields, isArray = _f.isArray;
                    if (!Imports.hasOwnProperty(str)) return [3 /*break*/, 4];
                    // Use cached data
                    _g = Imports[str];
                    return [3 /*break*/, 6];
                case 4:
                    _h = Imports;
                    _j = str;
                    return [4 /*yield*/, fetchImport(str)
                        // Extract only destructuring fields
                    ];
                case 5:
                    _g = _h[_j] = _p.sent();
                    _p.label = 6;
                case 6:
                    value = _g;
                    // Extract only destructuring fields
                    if (fields.length)
                        value = destructure(value, fields, isArray);
                    _p.label = 7;
                case 7:
                    // Declare variables
                    if (variableRegex.test(key)) {
                        _k = key.match(variableRegex), _ = _k[0], index = _k[1];
                        Variables[syntaxTree.VARIABLES[index]] = value;
                        return [3 /*break*/, 8];
                    }
                    // Assign values to JSONX assignments
                    if (assignedRegex.test(value)) {
                        _l = value.match(assignedRegex), _ = _l[0], index = _l[1];
                        _m = toDestructure(syntaxTree.ASSIGNED[index]), str = _m.str, fields = _m.fields, isArray = _m.isArray;
                        // Replace JSONX $x array items indexing with their equivalent JS syntax
                        str = str.replace(lexic_1.__JSONX_ARRAY_KEY_SYNTAX, function (matched, index) {
                            return matched.replace(matched, "[" + index + "]");
                        });
                        try {
                            value = fields.length ?
                                // destructuring assignment
                                destructure(eval('Variables.' + str), fields, isArray)
                                // simple assignment
                                : eval('Variables.' + str);
                        }
                        catch (error) {
                            throw new Error("Undefined Variable: " + str.split('.')[0] + ": " + error);
                        }
                    }
                    // Run and return scripts value
                    if (scriptRegex.test(value)) {
                        _o = value.match(scriptRegex), _ = _o[0], index = _o[1], script = syntaxTree.SCRIPTS[index].replace(/\$[a-z0-9]+/ig, function (matched, word) {
                            return matched.replace('$', 'Variables.');
                        });
                        try {
                            value = eval(script);
                        }
                        catch (error) {
                            throw new Error("Invalid JS Script at \"" + key + "\": " + error);
                        }
                    }
                    compiledJSON[key] = value;
                    _p.label = 8;
                case 8:
                    _i++;
                    return [3 /*break*/, 1];
                case 9: return [2 /*return*/, compiledJSON];
            }
        });
    });
}
exports.default = (function (json, syntaxTree, basePath) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (Object.entries(json).length === 0 && json.constructor === Object)
                    return [2 /*return*/, {}];
                if (basePath)
                    BASE_PATH = basePath;
                return [4 /*yield*/, compile(json, syntaxTree, (0, utils_1.getType)(json))];
            case 1: return [2 /*return*/, _a.sent()];
        }
    });
}); });
