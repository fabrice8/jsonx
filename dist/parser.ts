
import {
  __LEFT_BRACKET,
  __RIGHT_BRACKET,
  __LEFT_BRACE,
  __RIGHT_BRACE,
  __OBJECT_COMMA,
  __OBJECT_COLON,
  __JSON_STRING
} from './lexic'
import {
  ParseArray,
  parseObject,
  TokenArray
} from '..'

function isSpread( _token: string ): boolean {
  // Check whether a token is a spread assigned variable
  return _token.includes('ASSIGNED_SPREAD')
}

function parseArray( tokens: TokenArray[] ): ParseArray {

  const _array: any[] = []
  let _token: any = tokens[0]
  if( _token == __RIGHT_BRACKET ){
    tokens.shift()
    return { _array, _tokens: tokens }
  }

  while( tokens.length ){
    
    const extract = Parser( tokens )
    _array.push( extract._value )
    tokens = extract._tokens
    
    _token = tokens.shift()
    if( _token == __RIGHT_BRACKET )
      return { _array, _tokens: tokens }
    
    else if( _token != __OBJECT_COMMA )
      throw new Error('Expected comma (,) after object in Array: '+ _token )
  }

  throw new Error('Expected End of Array Bracket: (])')
}

function parseObject( tokens: TokenArray[] ): parseObject {

  const _object: any = {}
  let _token: any = tokens[0]
  if( _token == __RIGHT_BRACE ){
    tokens.shift()
    return { _object, _tokens: tokens }
  }

  while( tokens.length ){
    _token = tokens.shift()
    
    if( typeof _token != 'string' || !__JSON_STRING.test( _token ) )
      throw new Error(`Expected STRING key, got: (${_token})`)
    
    /** NOTE: Spread Object variable assignment 
     * has exception to the mandatory `key:value` rule 
     * due to their self declaration and assignment
     * property in an object: { ...$variable }
     */
    if( !isSpread( _token ) && tokens.shift() != __OBJECT_COLON )
      throw new Error('Expected COLON after key in object: (:): '+ _token )

    let extract
    if( isSpread( _token ) ){
      /** Generate `key:value` by giving a dummy (...)
       * value to spread _token converted to key: 
       * It's should be identify as `key:value` during 
       * compilation process.
       */
      extract = { _value: '...', _tokens: tokens }
    }
    // Normal `key:value` parsing
    else extract = Parser( tokens )

    _object[ _token ] = extract._value // JSONX Key and value
    tokens = extract._tokens
    
    _token = tokens.shift()
    if( _token == __RIGHT_BRACE )
      return { _object, _tokens: tokens }
    
    else if( _token != __OBJECT_COMMA )
      throw new Error(`Expected comma (,) after pair in object, got: ${_token}`)
  }

  throw new Error('Expected End of Object Brace: (})')
}

function Parser( tokens: TokenArray[] ): { _value: any, _tokens: TokenArray[] } {

  const _token = tokens.shift()
  if( _token == __LEFT_BRACKET ){
    const { _array, _tokens } = parseArray( tokens )
    return { _value: _array, _tokens }
  }
  
  if( _token == __LEFT_BRACE ){
    const { _object, _tokens } = parseObject( tokens )
    return { _value: _object, _tokens }
  }

  return { _value: _token, _tokens: tokens }
}

export default Parser