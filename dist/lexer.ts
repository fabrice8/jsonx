
import {
  __WHITE_SPACE,
  __QUOTE,
  __LEFT_BRACKET,
  __RIGHT_BRACKET,
  __LEFT_BRACE,
  __RIGHT_BRACE,
  __OBJECT_COMMA,
  __OBJECT_COLON,
  __JSON_STRING,
  __JSON_SYNTAX,
  __JSONX_VARIABLE,
  __JSONX_IMPORT,
  __JSONX_IMPORT_SYNTAX,
  __JSONX_IMPORT_PIPE,
  __JSONX_ASSIGNED_START,
  __JSONX_SCRIPT_GRAVE
} from './lexic'
import { LexicalCheckRespone } from '..'

const 
VARIABLES: string[] = [],
ASSIGNED: string[] = [],
IMPORTS: string[] = [],
SCRIPTS: string[] = []

function isString( str: any ): LexicalCheckRespone {

  let _string = ''
  if( str[0] != __QUOTE )
    return { rest: str }

  str = str.substr(1)
  for( let x in str )
    if( str[x] == __QUOTE )
      return { _string, rest: str.substr( _string.length + 1 ) }
    else _string += str[x]
  
  throw new Error('Expected End of String QUOTE: (")')
}

function isNumber( str: any ): LexicalCheckRespone {

  let _number = ''
  for( let x in str ){
    if( !/[0-9-e.]/.test( str[x] ) ) break
    _number += str[x]
  }
  
  if( !_number.length ) return { rest: str }
  return {
    _number: Number( _number ), 
    rest: str.substr( _number.length ) 
  }
}

function isBoolean( str: any ): LexicalCheckRespone {

  if( str.length >= 4 && str.substring(0, 4) == 'true' )
    return { _boolean: true, rest: str.substr(4) }
  
  if( str.length >= 5 && str.substring(0, 5) == 'false' )
    return { _boolean: false, rest: str.substr(5) }

  return { rest: str }
}

function isNull( str: any ): LexicalCheckRespone{

  if( str.length >= 4 && str.substring(0, 4) == 'null' )
    return { _null: null, rest: str.substr(4) }

  return { rest: str }
}

function isVariable( str: any ): LexicalCheckRespone {

  let _variable: any = ''
  if( str[0] != __JSONX_VARIABLE )
    return { rest: str }
    
  str = str.substr(1)
  for( let x in str )
    if( str[x] == __OBJECT_COLON )
      return { _variable, rest: str.substr( _variable.length ) }
    
    // Identify as assignment
    else if( ['.', ','].includes( str[x] ) )
      return { rest: str }

    else _variable += str[x]
  
  return { rest: str }
}

function isImport( str: any ): LexicalCheckRespone {

  let _import: any = ''
  if( str[0] != __JSONX_IMPORT )
    return { rest: str }
  
  for( let x in str )
    if( str[x] == __OBJECT_COMMA 
        && !_import.includes( __JSONX_IMPORT_PIPE )
        && !_import.includes( __LEFT_BRACE )
        && !_import.includes( __LEFT_BRACKET ) )
      return { _import, rest: str.substr( _import.length ) }

    // Assigned Object construction closure, added to the import URI
    else if( str[x] == __RIGHT_BRACE && _import.includes( __LEFT_BRACE ) ){
      // Seperator pipe (|) is required before declaring object {}
      if( !_import.includes( __JSONX_IMPORT_PIPE ) )
        throw new Error('Expected assign keys seperator PIPE (|)')

      _import += str[x]
      return { _import, rest: str.substr( _import.length ) }
    }

    // Assigned Array construction closure, added to the import URI
    else if( str[x] == __RIGHT_BRACKET 
              && _import.includes( __JSONX_IMPORT_PIPE )
              && _import.includes( __LEFT_BRACKET ) ){
      // Seperator pipe (|) is required before declaring array []
      if( !_import.includes( __JSONX_IMPORT_PIPE ) )
        throw new Error('Expected assign keys seperator PIPE (|)')

      _import += str[x]
      return { _import, rest: str.substr( _import.length ) }
    }

    else _import += str[x]
  
  throw new Error('Expected End of Import URI to be: COMMA (,) or BRACKET CLOSURE (]) or BRACE CLOSURE (})')
}

function isAssigned( str: any ): LexicalCheckRespone {

  let _assigned: any = ''
  if( str[0] != __JSONX_ASSIGNED_START )
    return { rest: str }
    
  str = str.substr(1)
  for( let x in str )
    if( str[x] == __OBJECT_COMMA 
        && !_assigned.includes( __LEFT_BRACE )
        && !_assigned.includes( __LEFT_BRACKET ) )
      return { _assigned, rest: str.substr( _assigned.length ) }

    // Assigned Object construction closure
    else if( str[x] == __RIGHT_BRACE && _assigned.includes( __LEFT_BRACE ) ){
      _assigned += str[x]
      return { _assigned, rest: str.substr( _assigned.length ) }
    }

    // Assigned Array construction closure
    else if( str[x] == __RIGHT_BRACKET && _assigned.includes( __LEFT_BRACKET ) ){
      _assigned += str[x]
      return { _assigned, rest: str.substr( _assigned.length ) }
    }

    // End of JSONX
    else if( str.substr( _assigned.length ).length == 1 )
      return { _assigned, rest: str.substr( _assigned.length ) }

    else _assigned += str[x]
    
  throw new Error('Expected End of Assigned to be: COMMA (,) or BRACKET CLOSURE (]) or BRACE CLOSURE (})')
}

function isScript( str: any ): LexicalCheckRespone {

  let _script = ''
  if( str[0] != __JSONX_SCRIPT_GRAVE )
    return { rest: str }

  str = str.substr(1)
  for( let x in str )
    if( str[x] == __JSONX_SCRIPT_GRAVE )
      return { _script, rest: str.substr( _script.length + 1 ) }
    else _script += str[x]
  
  throw new Error('Expected End of String QUOTE: (")')
}

// console.log( isString('"hello":{}') )
// console.log( isNumber('12.3e6:{}') )
// console.log( isBoolean('false:{}') )
// console.log( isNull('null:{}') )
// console.log( isVariable('$protocol.:"merline') )
// console.log( isImport('@https://localhost:3000/user.json?version=1|{firstname,lastname},"merline') )
// console.log( isAssigned('$account.settings{theme,langugage},"name":"salue"') )
// console.log( isScript('`function(){ return $protocol.substr(8) }`:"merline') )

export default ( str: string ) => {

  const tokens: any = []
  let extract
  
  while( str.length ){

    extract = isVariable( str )
    if( extract._variable !== undefined ){
      // Hoist variable key and replace it with meta-key
      VARIABLES.push( extract._variable )
      tokens.push(`--VARIABLE[${VARIABLES.length - 1}]--`)

      str = extract.rest
      continue
    }

    extract = isAssigned( str )
    if( extract._assigned !== undefined ){
      // Hoist assigned line as metaset and replace it with meta-key
      ASSIGNED.push( extract._assigned )
      tokens.push(`--ASSIGNED[${ASSIGNED.length - 1}]--`)
      
      str = extract.rest
      continue
    }

    extract = isImport( str )
    if( extract._import !== undefined ){
      // Hoist import line and replace it with meta-key
      IMPORTS.push( extract._import.replace( __JSONX_IMPORT_SYNTAX, '') )
      tokens.push(`--IMPORT[${IMPORTS.length - 1}]--`)

      str = extract.rest
      continue
    }

    extract = isScript( str )
    if( extract._script !== undefined ){
      // Hoist script value as metaset and replace it with meta-key
      SCRIPTS.push( extract._script )
      tokens.push(`--SCRIPT[${SCRIPTS.length - 1}]--`)

      str = extract.rest
      continue
    }

    extract = isString( str )
    if( extract._string !== undefined ){
      tokens.push( extract._string )
      str = extract.rest
      continue
    }

    extract = isNumber( str )
    if( extract._number !== undefined ){
      tokens.push( extract._number )
      str = extract.rest
      continue
    }

    extract = isBoolean( str )
    if( extract._boolean !== undefined ){
      tokens.push( extract._boolean )
      str = extract.rest
      continue
    }

    extract = isNull( str )
    if( extract._null !== undefined ){
      tokens.push( extract._null )
      str = extract.rest
      continue
    }

    if( str[0] == __WHITE_SPACE )
      str = str.substr(1)
    
    else if( __JSON_SYNTAX.test( str[0] ) ){
      tokens.push( str[0] )
      str = str.substr(1)
    }
    else throw new Error(`Unexpected JSONX Character: (${str[0]})`)
  }
  
  return { 
    tokens,
    syntaxTree: { VARIABLES, IMPORTS, ASSIGNED, SCRIPTS }
  }
}