
import path from 'path'
import Lexer from '../src/lexer'
import Parser from '../src/parser'
import Compiler from '../src/compiler'
import { fetchContent, clean } from '../src/utils'

export default ( async () => {
  const 
  basePath = path.resolve( __dirname, '../samples' ),
  input = await fetchContent( basePath + '/s1.jsonx' ),
  cleaned = clean( input ),
  { tokens, syntaxTree } = Lexer( cleaned )

  // console.log( cleaned )
  // console.log( tokens )
  const { _value } = Parser( tokens )

  console.log( await Compiler( _value, syntaxTree, basePath ) )
} )()