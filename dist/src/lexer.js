"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isScript = exports.isAssigned = exports.isExport = exports.isImport = exports.isVariable = exports.isNull = exports.isBoolean = exports.isNumber = exports.isString = exports.isMultiLineComment = void 0;
var lexic_1 = require("./lexic");
var VARIABLES = [], ASSIGNED = [], IMPORTS = [], EXPORTS = [], SCRIPTS = [];
function isMultiLineComment(str) {
    var _comment = '';
    if (str[0] != lexic_1.__MULTILINE_COMMENT_CLOSER && str[1] != lexic_1.__MULTILINE_COMMENT_STAR)
        return { rest: str };
    str = str.substr(2); // remove `/*` starter
    for (var x in str)
        if (+x > 0 && str[x] == lexic_1.__MULTILINE_COMMENT_CLOSER && str[+x - 1] == lexic_1.__MULTILINE_COMMENT_STAR)
            return { _comment: _comment, rest: str.substr(_comment.length + 1) };
        else
            _comment += str[x];
    throw new Error('Expected End of Multiple Line Comment CLOSER: (*/)');
}
exports.isMultiLineComment = isMultiLineComment;
function isString(str) {
    var _string = '';
    if (str[0] != lexic_1.__QUOTE)
        return { rest: str };
    str = str.substr(1);
    for (var x in str)
        if (str[x] == lexic_1.__QUOTE)
            return { _string: _string, rest: str.substr(_string.length + 1) };
        else
            _string += str[x];
    throw new Error('Expected End of String QUOTE: (")');
}
exports.isString = isString;
function isNumber(str) {
    var _number = '';
    for (var x in str) {
        if (!/[0-9-e.]/.test(str[x]))
            break;
        _number += str[x];
    }
    if (!_number.length)
        return { rest: str };
    return {
        _number: Number(_number),
        rest: str.substr(_number.length)
    };
}
exports.isNumber = isNumber;
function isBoolean(str) {
    if (str.length >= 4 && str.substring(0, 4) == 'true')
        return { _boolean: true, rest: str.substr(4) };
    if (str.length >= 5 && str.substring(0, 5) == 'false')
        return { _boolean: false, rest: str.substr(5) };
    return { rest: str };
}
exports.isBoolean = isBoolean;
function isNull(str) {
    if (str.length >= 4 && str.substring(0, 4) == 'null')
        return { _null: null, rest: str.substr(4) };
    return { rest: str };
}
exports.isNull = isNull;
function isVariable(str) {
    var _variable = '';
    if (str[0] != lexic_1.__JSONX_VARIABLE)
        return { rest: str };
    str = str.substr(1);
    for (var x in str)
        if (str[x] == lexic_1.__OBJECT_COLON)
            return { _variable: _variable, rest: str.substr(_variable.length) };
        // Identify as assignment
        else if (['.', ','].includes(str[x]))
            return { rest: str };
        else
            _variable += str[x];
    return { rest: str };
}
exports.isVariable = isVariable;
function isImport(str) {
    var _import = '';
    if (str[0] != lexic_1.__JSONX_IMPORT_EXPORT || str[1] != 'i')
        return { rest: str };
    for (var x in str) {
        if (str[x] == lexic_1.__OBJECT_COMMA || str[x] == lexic_1.__RIGHT_BRACE || str[x] == lexic_1.__RIGHT_BRACKET) {
            if (!_import.includes(lexic_1.__LEFT_BRACE) && !_import.includes(lexic_1.__LEFT_BRACKET))
                return { _import: _import, rest: str.substr(_import.length) };
            if ((_import.includes(lexic_1.__LEFT_BRACE) || _import.includes(lexic_1.__LEFT_BRACKET)) && _import.includes(lexic_1.__JSONX_IMPORT_FROM))
                return { _import: _import, rest: str.substr(_import.length) };
            else
                _import += str[x];
        }
        // Assigned Object construction closure, added to the import URI
        // else if( str[x] == __RIGHT_BRACE && _import.includes( __LEFT_BRACE ) ){
        //   // Seperator pipe (|) is required before declaring object {}
        //   // if( !_import.includes( __JSONX_IMPORT_PIPE ) )
        //   //   throw new Error('Expected assign keys & URI seperator FROM')
        //   _import += str[x]
        //   return { _import, rest: str.substr( _import.length ) }
        // }
        // // Assigned Object construction closure, added to the import URI
        // else if( str[x] == __RIGHT_BRACE && _import.includes( __LEFT_BRACE ) ){
        //   // Seperator pipe (|) is required before declaring object {}
        //   if( !_import.includes( __JSONX_IMPORT_PIPE ) )
        //     throw new Error('Expected assign keys & URI seperator FROM')
        //   _import += str[x]
        //   return { _import, rest: str.substr( _import.length ) }
        // }
        // // Assigned Array construction closure, added to the import URI
        // else if( str[x] == __RIGHT_BRACKET 
        //           && _import.includes( __JSONX_IMPORT_PIPE )
        //           && _import.includes( __LEFT_BRACKET ) ){
        //   // Seperator pipe (|) is required before declaring array []
        //   if( !_import.includes( __JSONX_IMPORT_PIPE ) )
        //     throw new Error('Expected assign keys seperator PIPE (|)')
        //   _import += str[x]
        //   return { _import, rest: str.substr( _import.length ) }
        // }
        else
            _import += str[x];
    }
    throw new Error('Expected End of Import URI to be: COMMA (,) or BRACKET CLOSURE (]) or BRACE CLOSURE (})');
}
exports.isImport = isImport;
function isExport(str) {
    var _export = '';
    if (str[0] != lexic_1.__JSONX_IMPORT_EXPORT || str[1] != 'e')
        return { rest: str };
    for (var x in str) {
        if (str[x] == lexic_1.__OBJECT_COLON) {
            // Exporting variable indicator AS (as) is required before declaring the variable
            // if( !_export.includes( __JSONX_EXPORT_AS ) )
            //   throw new Error('Expected variable indicator key seperator AS')
            return { _export: _export, rest: str.substr(_export.length) };
        }
        else
            _export += str[x];
    }
    throw new Error('Expected End of Export Variable to be: COLON (:)');
}
exports.isExport = isExport;
function isAssigned(str) {
    var _assigned = '';
    if (!lexic_1.__JSONX_ASSIGNED_START.test(str[0]))
        return { rest: str };
    str = str.substr(1);
    for (var x in str)
        if ((str[x] == lexic_1.__OBJECT_COMMA)
            && !_assigned.includes(lexic_1.__LEFT_BRACE)
            && !_assigned.includes(lexic_1.__LEFT_BRACKET))
            return { _assigned: _assigned, rest: str.substr(_assigned.length) };
        // Assigned Object construction closure
        else if (str[x] == lexic_1.__RIGHT_BRACE && _assigned.includes(lexic_1.__LEFT_BRACE)) {
            _assigned += str[x];
            return { _assigned: _assigned, rest: str.substr(_assigned.length) };
        }
        // Assigned Array construction closure
        else if (str[x] == lexic_1.__RIGHT_BRACKET && _assigned.includes(lexic_1.__LEFT_BRACKET)) {
            _assigned += str[x];
            return { _assigned: _assigned, rest: str.substr(_assigned.length) };
        }
        // End of JSONX
        else if (str.substr(_assigned.length).length == 1)
            return { _assigned: _assigned, rest: str.substr(_assigned.length) };
        else if (str[x] != lexic_1.__RIGHT_BRACE
            && str[x] != lexic_1.__RIGHT_BRACKET
            && str[x] != lexic_1.__MULTILINE_COMMENT_CLOSER)
            _assigned += str[x];
    throw new Error('Expected End of Assigned to be: COMMA (,) or BRACKET CLOSURE (]) or BRACE CLOSURE (})');
}
exports.isAssigned = isAssigned;
function isScript(str) {
    var _script = '';
    if (str[0] != lexic_1.__JSONX_SCRIPT_GRAVE)
        return { rest: str };
    str = str.substr(1);
    for (var x in str)
        if (str[x] == lexic_1.__JSONX_SCRIPT_GRAVE)
            return { _script: _script, rest: str.substr(_script.length + 1) };
        else
            _script += str[x];
    throw new Error('Expected End of String QUOTE: (")');
}
exports.isScript = isScript;
exports.default = (function (str) {
    var tokens = [];
    var extract;
    while (str.length) {
        extract = isMultiLineComment(str);
        if (extract._comment !== undefined) {
            // Remove multi-line comments
            str = extract.rest;
            continue;
        }
        extract = isVariable(str);
        if (extract._variable !== undefined) {
            // Hoist variable key and replace it with meta-key
            VARIABLES.push(extract._variable);
            tokens.push("--VARIABLE[" + (VARIABLES.length - 1) + "]--");
            str = extract.rest;
            continue;
        }
        extract = isAssigned(str);
        if (extract._assigned !== undefined) {
            // Hoist assigned line as metaset and replace it with meta-key
            var prefix = '--ASSIGNED';
            if (lexic_1.__JSONX_ASSIGNED_SPREAD.test(extract._assigned)) {
                prefix += '_SPREAD';
                extract._assigned = extract._assigned.replace(lexic_1.__JSONX_ASSIGNED_SPREAD, '');
            }
            ASSIGNED.push(extract._assigned);
            tokens.push(prefix + "[" + (ASSIGNED.length - 1) + "]--");
            str = extract.rest;
            continue;
        }
        extract = isImport(str);
        if (extract._import !== undefined) {
            // Hoist import line and replace it with meta-key
            IMPORTS.push(extract._import.replace(lexic_1.__JSONX_IMPORT_SYNTAX, ''));
            tokens.push("--IMPORT[" + (IMPORTS.length - 1) + "]--");
            str = extract.rest;
            continue;
        }
        extract = isExport(str);
        if (extract._export !== undefined) {
            // Hoist export line and replace it with meta-key
            EXPORTS.push(extract._export.replace(lexic_1.__JSONX_EXPORT_SYNTAX, ''));
            tokens.push("--EXPORT[" + (EXPORTS.length - 1) + "]--");
            str = extract.rest;
            continue;
        }
        extract = isScript(str);
        if (extract._script !== undefined) {
            // Hoist script value as metaset and replace it with meta-key
            SCRIPTS.push(extract._script);
            tokens.push("--SCRIPT[" + (SCRIPTS.length - 1) + "]--");
            str = extract.rest;
            continue;
        }
        extract = isString(str);
        if (extract._string !== undefined) {
            tokens.push(extract._string);
            str = extract.rest;
            continue;
        }
        extract = isNumber(str);
        if (extract._number !== undefined) {
            tokens.push(extract._number);
            str = extract.rest;
            continue;
        }
        extract = isBoolean(str);
        if (extract._boolean !== undefined) {
            tokens.push(extract._boolean);
            str = extract.rest;
            continue;
        }
        extract = isNull(str);
        if (extract._null !== undefined) {
            tokens.push(extract._null);
            str = extract.rest;
            continue;
        }
        if (str[0] == lexic_1.__WHITE_SPACE)
            str = str.substr(1);
        else if (lexic_1.__JSON_SYNTAX.test(str[0])) {
            tokens.push(str[0]);
            str = str.substr(1);
        }
        else
            throw new Error("Unexpected JSONX Character: (" + str[0] + ")");
    }
    return {
        tokens: tokens,
        syntaxTree: { VARIABLES: VARIABLES, IMPORTS: IMPORTS, EXPORTS: EXPORTS, ASSIGNED: ASSIGNED, SCRIPTS: SCRIPTS }
    };
});
