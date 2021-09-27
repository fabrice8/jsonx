

import Lexer from './lexer'
import Parser from './parser'
import Compiler from './compiler'
import { fetchContent, clean } from './utils'

export default async ( filepath: string ) => {
  try {
    const
    input = await fetchContent( filepath ),
    { tokens, syntaxTree } = Lexer( clean( input ) ),
    { _value } = Parser( tokens )

    return await Compiler( _value, syntaxTree )
  }
  catch( error: any ){ throw new Error( error || 'Unknown Error' ) }
}