"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
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
var lexic_1 = require("./lexic");
var render_1 = __importDefault(require("./render"));
var utils_1 = require("./utils");
var variableRegex = /--VARIABLE\[([0-9]+)\]--/, importRegex = /--IMPORT\[([0-9]+)\]--/, exportRegex = /--EXPORT\[([0-9]+)\]--/, assignedRegex = /--ASSIGNED\[([0-9]+)\]--/, assignedSpreadRegex = /--ASSIGNED_SPREAD\[([0-9]+)\]--/, scriptRegex = /--SCRIPT\[([0-9]+)\]--/;
exports.default = (function (json, syntaxTree, dirname) { return __awaiter(void 0, void 0, void 0, function () {
    function toJSArrayKey(key) {
        // Replace JSONX $x array items indexing with their equivalent JS syntax
        return key.replace(lexic_1.__JSONX_ARRAY_KEY_SYNTAX, function (matched, index) {
            return matched.replace(matched, "[" + index + "]");
        });
    }
    function toDestructure(str) {
        var matches = str.match(lexic_1.__JSONX_DESTRUCT_ASSIGN);
        var fields = [];
        var isArray = false;
        if ((matches === null || matches === void 0 ? void 0 : matches.length) && matches[2]) {
            isArray = /\[(.+)\]$/.test(matches[1]);
            str = str.replace(lexic_1.__JSONX_DESTRUCT_ASSIGN, ''); // remove assignment
            fields = matches[3].split(/\s*,\s*/);
        }
        return { str: str, fields: fields, isArray: isArray };
    }
    function destructure(jsonData, fields, isArray) {
        // Array indexing
        if (isArray && /^[0-9]+$/.test(fields[0])) {
            // Slice array portion
            if (fields[1] && /^\.\.\.[0-9]+$/.test(fields[1]))
                return jsonData.slice(+fields[0], +fields[1].replace('...', '') + 1);
            // Get only one given item value of the array
            else if (fields.length == 1)
                return [jsonData[+fields[0]]];
            // Return multiple specified indexes values
            else
                return fields.map(function (each) { return jsonData[+each]; });
        }
        // Desctructure specified array items or object keys into object
        var toReturn = {};
        fields.map(function (key, index) {
            // Assign destructured key value as a given object key name
            var composedKey = key.match(lexic_1.__JSONX_ASSIGNED_AS);
            if ((composedKey === null || composedKey === void 0 ? void 0 : composedKey.length) && composedKey[0])
                try {
                    toReturn[composedKey[2]] = eval('jsonData.' + composedKey[1]);
                }
                catch (error) {
                    toReturn[composedKey[2]] = null;
                }
            else {
                // Deep level Object keys & value 
                var levelKeys = key.split('.');
                if (levelKeys.length > 1) {
                    var asKey = levelKeys.slice(-1)[0];
                    try {
                        toReturn[asKey] = eval("jsonData" + (isArray ? toJSArrayKey(key) : '.' + key));
                    }
                    catch (error) {
                        toReturn[asKey] = null;
                    }
                }
                // First level keys
                else
                    toReturn[key] = jsonData[isArray ? index : key] || null;
            }
        });
        return toReturn;
    }
    function fetchImport(uri) {
        return __awaiter(this, void 0, void 0, function () {
            var result, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, (0, render_1.default)(path_1.default.resolve(dirname || __dirname, uri))];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result !== null
                                && typeof result == 'object'
                                && result.hasOwnProperty('JSON')
                                && result.hasOwnProperty('Exports') ?
                                !(0, utils_1.isEmpty)(result.Exports) ? result.Exports : result.JSON // Compiled JSONX results
                                : result]; // Regular JSON data
                    case 2:
                        error_1 = _a.sent();
                        throw new Error("Importing from " + uri + " Failed: " + error_1);
                    case 3: return [2 /*return*/];
                }
            });
        });
    }
    function importValue(value, syntaxTree) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, _, index, _b, str, fields, isArray;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _a = value.match(importRegex), _ = _a[0], index = _a[1], _b = toDestructure(syntaxTree.IMPORTS[index]), str = _b.str, fields = _b.fields, isArray = _b.isArray;
                        return [4 /*yield*/, fetchImport(str)
                            // Extract only destructuring fields
                        ];
                    case 1:
                        value = _c.sent();
                        // Extract only destructuring fields
                        if (value && fields.length)
                            value = destructure(value, fields, isArray);
                        return [2 /*return*/, value];
                }
            });
        });
    }
    function assignValue(value, syntaxTree) {
        var _a = value.match(assignedRegex), _ = _a[0], index = _a[1];
        var _b = toDestructure(syntaxTree.ASSIGNED[index]), str = _b.str, fields = _b.fields, isArray = _b.isArray;
        // Replace JSONX $x array items indexing with their equivalent JS syntax
        str = toJSArrayKey(str);
        try {
            return fields.length ?
                // destructuring assignment
                destructure(eval('Variables.' + str), fields, isArray)
                // simple assignment
                : eval('Variables.' + str);
        }
        catch (error) {
            throw new Error("Undefined Variable: " + str.split('.')[0] + ": " + error);
        }
    }
    function assignSpread(key, value, syntaxTree) {
        var spotted = assignedSpreadRegex.test(key) ? key : value, _a = spotted.match(assignedSpreadRegex), _ = _a[0], index = _a[1];
        var _b = toDestructure(syntaxTree.ASSIGNED[index]), str = _b.str, fields = _b.fields, isArray = _b.isArray;
        // Replace JSONX $x array items indexing with their equivalent JS syntax
        str = toJSArrayKey(str);
        try {
            value = fields.length ?
                // destructuring assignment
                destructure(eval('Variables.' + str), fields, isArray)
                // simple assignment
                : eval('Variables.' + str);
            return { asValue: value, spotted: spotted };
        }
        catch (error) {
            throw new Error("Undefined Variable: " + str.split('.')[0] + ": " + error);
        }
    }
    function scriptValue(key, value, syntaxTree) {
        var _a = value.match(scriptRegex), _ = _a[0], index = _a[1], 
        // Replace JSONX assignments in the script with equivalent values
        script = syntaxTree.SCRIPTS[index].replace(/\$[a-z0-9]+/ig, function (matched, word) {
            return matched.replace('$', 'Variables.');
        });
        try {
            return eval(script);
        }
        catch (error) {
            throw new Error("Invalid JS Script at \"" + key + "\": " + error);
        }
    }
    function compile(json, syntaxTree, contentType) {
        return __awaiter(this, void 0, void 0, function () {
            function processValue(key, value) {
                return __awaiter(this, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                if (!importRegex.test(value)) return [3 /*break*/, 2];
                                return [4 /*yield*/, importValue(value, syntaxTree)
                                    // Assign values to JSONX assignments
                                ];
                            case 1:
                                value = _a.sent();
                                _a.label = 2;
                            case 2:
                                // Assign values to JSONX assignments
                                if (assignedRegex.test(value))
                                    value = assignValue(value, syntaxTree);
                                // Run and return scripts value
                                if (scriptRegex.test(value))
                                    value = scriptValue(key, value, syntaxTree);
                                return [2 /*return*/, value];
                        }
                    });
                });
            }
            var compiledJSON, toSpreadValues, _a, _b, _i, key, value, _c, _, index, _d, _, index, _e, asValue, spotted, _f, _, index, expVar, _g, _h;
            return __generator(this, function (_j) {
                switch (_j.label) {
                    case 0:
                        compiledJSON = contentType == 'array' ? [] : {};
                        toSpreadValues = {};
                        _a = [];
                        for (_b in json)
                            _a.push(_b);
                        _i = 0;
                        _j.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 10];
                        key = _a[_i];
                        value = json[key];
                        if (!(typeof value == 'object')) return [3 /*break*/, 3];
                        return [4 /*yield*/, compile(value, syntaxTree, (0, utils_1.getType)(value))
                            // Variables with object generated value
                        ];
                    case 2:
                        value = _j.sent();
                        // Variables with object generated value
                        if (variableRegex.test(key)) {
                            _c = key.match(variableRegex), _ = _c[0], index = _c[1];
                            Variables[syntaxTree.VARIABLES[index]] = value;
                            return [3 /*break*/, 9];
                        }
                        _j.label = 3;
                    case 3:
                        if (!variableRegex.test(key)) return [3 /*break*/, 5];
                        _d = key.match(variableRegex), _ = _d[0], index = _d[1];
                        return [4 /*yield*/, processValue(key, value)];
                    case 4:
                        // Process value being assign to variables
                        value = _j.sent();
                        Variables[syntaxTree.VARIABLES[index]] = value;
                        return [3 /*break*/, 9];
                    case 5:
                        // Assign values to JSONX spread assignments
                        if (assignedSpreadRegex.test(key) || assignedSpreadRegex.test(value)) {
                            _e = assignSpread(key, value, syntaxTree), asValue = _e.asValue, spotted = _e.spotted;
                            toSpreadValues[spotted] = asValue;
                            // continue
                        }
                        if (!exportRegex.test(key)) return [3 /*break*/, 7];
                        _f = key.match(exportRegex), _ = _f[0], index = _f[1], expVar = syntaxTree.EXPORTS[index];
                        return [4 /*yield*/, processValue(key, value)
                            /** Export without indicator `as` is assume to be the default
                             * export so any existing exported data will be overwritten
                             * @export: VALUE
                            */
                        ];
                    case 6:
                        // Process exported value
                        value = _j.sent();
                        /** Export without indicator `as` is assume to be the default
                         * export so any existing exported data will be overwritten
                         * @export: VALUE
                        */
                        if (expVar === '')
                            Exports = value;
                        else {
                            /** Overwrite existing `Export` in case it's a string or
                             * Array to Object holder of named `key:value`
                             */
                            if (Exports !== 'object' || Array.isArray(Exports))
                                Exports = {};
                            // Declare/Name value being exported
                            Exports[expVar] = value;
                        }
                        return [3 /*break*/, 9];
                    case 7:
                        // Process imported, assigned, script, ... value
                        _g = compiledJSON;
                        _h = key;
                        return [4 /*yield*/, processValue(key, value)];
                    case 8:
                        // Process imported, assigned, script, ... value
                        _g[_h] = _j.sent();
                        _j.label = 9;
                    case 9:
                        _i++;
                        return [3 /*break*/, 1];
                    case 10:
                        // Assign spotted spread variables
                        if (!(0, utils_1.isEmpty)(toSpreadValues))
                            Object.entries(toSpreadValues)
                                .map(function (_a) {
                                var key = _a[0], value = _a[1];
                                try {
                                    if (Array.isArray(compiledJSON))
                                        compiledJSON = eval(JSON.stringify(compiledJSON).replace("\"" + key + "\"", '...value'));
                                    else {
                                        compiledJSON = JSON.parse(JSON.stringify(compiledJSON).replace("\"" + key + "\":\"...\",", '').replace("\"" + key + "\":\"...\"", ''));
                                        compiledJSON = __assign(__assign({}, compiledJSON), value);
                                    }
                                }
                                catch (error) { }
                            });
                        return [2 /*return*/, compiledJSON];
                }
            });
        });
    }
    var Exports, Variables;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                if (Object.entries(json).length === 0 && json.constructor === Object)
                    return [2 /*return*/, {}];
                Exports = {};
                Variables = {};
                _a = {};
                return [4 /*yield*/, compile(json, syntaxTree, (0, utils_1.getType)(json))];
            case 1: return [2 /*return*/, (
                // Generated JSON Object
                _a.JSON = (_b.sent()),
                    /** Exported variables & data independantely
                     * generated during the compiling of this syntaxTree
                     */
                    _a.Exports = Exports,
                    _a)];
        }
    });
}); });
