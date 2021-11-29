
export const __WHITE_SPACE = ' '
export const __QUOTE = '"'
export const __MULTILINE_COMMENT_CLOSER = '/'
export const __MULTILINE_COMMENT_STAR = '*'
export const __LEFT_BRACKET = '['
export const __RIGHT_BRACKET = ']'
export const __LEFT_BRACE = '{'
export const __RIGHT_BRACE = '}'
export const __OBJECT_COMMA = ','
export const __OBJECT_COLON = ':'

export const __JSON_SYNTAX = /[\{\}\[\]:,]/
export const __JSON_STRING = /\w+/i
export const __JSONX_ARRAY_KEY_SYNTAX = /\.?\$([0-9])+/g

export const __JSONX_VARIABLE = '$'
export const __JSONX_IMPORT_EXPORT = '@'
export const __JSONX_IMPORT_SYNTAX = /^@import(\s+)/i
export const __JSONX_IMPORT_FROM = 'from'
export const __JSONX_EXPORT_SYNTAX = /^@export(\s+as)?(\s*)/i
export const __JSONX_EXPORT_AS = 'as'
export const __JSONX_ASSIGNED_START = /\$|\./
export const __JSONX_ASSIGNED_SPREAD = /\.\.\$/
export const __JSONX_ASSIGNED_AS = /(.+)\s+as\s+(.+)/
export const __JSONX_SCRIPT_GRAVE = '`'
export const __JSONX_DESTRUCT_ASSIGN = /((\{|\[)(.+)(\]|\}))\s*(from\s+)?/
