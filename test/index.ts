
import fs from 'fs'
import path from 'path'
import Lexer from '../src/lexer'
import Parser from '../src/parser'
import Cleaner from '../src/cleaner'
import Compiler from '../src/compiler'

async function fetchContent( filePath: string ){
  return await fs.readFileSync( filePath, 'utf-8' )
}

export default ( async () => {
  const 
  basePath = path.resolve( __dirname, '../samples' ),
  input = await fetchContent( basePath + '/s1.jsonx' ),
  cleaned = Cleaner( input ),
  { tokens, VARIABLES, IMPORTS, ASSIGNED, SCRIPTS } = Lexer( cleaned )

  // console.log( cleaned )
  console.log( tokens )
  const { _value } = Parser( tokens )

  console.log( await Compiler( _value, { VARIABLES, IMPORTS, ASSIGNED, SCRIPTS }, basePath ) )
} )()