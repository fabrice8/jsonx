
export const __WHITE_SPACE = ' '
export const __QUOTE = '"'
export const __LEFT_BRACKET = '['
export const __RIGHT_BRACKET = ']'
export const __LEFT_BRACE = '{'
export const __RIGHT_BRACE = '}'
export const __OBJECT_COMMA = ','
export const __OBJECT_COLON = ':'

export const __JSON_SYNTAX = /[\{\}\[\]:,]/
export const __JSON_STRING = /\w+/i
export const __JSONX_ARRAY_KEY_SYNTAX = /\.\$([0-9])+/g

export const __JSONX_VARIABLE = '$'
export const __JSONX_IMPORT = '@'
export const __JSONX_IMPORT_SYNTAX = /^@(import)?(\s+)/i
export const __JSONX_IMPORT_PIPE = '|'
export const __JSONX_ASSIGNED_START = '$'
export const __JSONX_SCRIPT_GRAVE = '`'
export const __JSONX_DESTRUCT_ASSIGN = /\|?(\{(.+)\})|(\[(.+)\])$/
