"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var lexic_1 = require("./lexic");
function parseArray(tokens) {
    var _array = [];
    var _token = tokens[0];
    if (_token == lexic_1.__RIGHT_BRACKET) {
        tokens.shift();
        return { _array: _array, _tokens: tokens };
    }
    while (tokens.length) {
        var extract = Parser(tokens);
        _array.push(extract._value);
        tokens = extract._tokens;
        _token = tokens.shift();
        if (_token == lexic_1.__RIGHT_BRACKET)
            return { _array: _array, _tokens: tokens };
        else if (_token != lexic_1.__OBJECT_COMMA)
            throw new Error('Expected comma (,) after object in Array');
    }
    throw new Error('Expected End of Array Bracket: (])');
}
function parseObject(tokens) {
    var _object = {};
    var _token = tokens[0];
    if (_token == lexic_1.__RIGHT_BRACE) {
        tokens.shift();
        return { _object: _object, _tokens: tokens };
    }
    while (tokens.length) {
        _token = tokens.shift();
        if (typeof _token != 'string' || !lexic_1.__JSON_STRING.test(_token))
            throw new Error("Expected STRING key, got: (" + _token + ")");
        if (tokens.shift() != lexic_1.__OBJECT_COLON)
            throw new Error('Expected COLON after key in object: (:)');
        var extract = Parser(tokens);
        _object[_token] = extract._value; // JSONX Key and value
        tokens = extract._tokens;
        _token = tokens.shift();
        if (_token == lexic_1.__RIGHT_BRACE)
            return { _object: _object, _tokens: tokens };
        else if (_token != lexic_1.__OBJECT_COMMA)
            throw new Error("Expected comma (,) after pair in object, got: " + _token);
    }
    throw new Error('Expected End of Object Brace: (})');
}
function Parser(tokens) {
    var _token = tokens.shift();
    if (_token == lexic_1.__LEFT_BRACKET) {
        var _a = parseArray(tokens), _array = _a._array, _tokens = _a._tokens;
        return { _value: _array, _tokens: _tokens };
    }
    if (_token == lexic_1.__LEFT_BRACE) {
        var _b = parseObject(tokens), _object = _b._object, _tokens = _b._tokens;
        return { _value: _object, _tokens: _tokens };
    }
    return { _value: _token, _tokens: tokens };
}
exports.default = Parser;
