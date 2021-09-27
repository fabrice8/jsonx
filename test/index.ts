
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

  // const tokens = Lexer('{"hello":"fabrice","age":43.5, "male": true, "short": false,"lie":null, "roles": [ "ADMIN", "USER" ], "settings":{ "theme":"default", "fontSize":12}}')
  // const tokens = Lexer( await extractJSONX( path.resolve( __dirname, '../samples/normal.json' ) ) )
  
  const 
  basePath = path.resolve( __dirname, '../samples' ),
  input = await fetchContent( basePath + '/1.jsonx' ),
  cleaned = Cleaner( input ),
  { tokens, VARIABLES, IMPORTS, ASSIGNED, SCRIPTS } = Lexer( cleaned )

  // console.log( cleaned )
  // console.log( tokens )
  const { _value } = Parser( tokens )

  console.log( await Compiler( _value, { VARIABLES, IMPORTS, ASSIGNED, SCRIPTS }, basePath ) )
  // console.log( await processImport('https://fakerapi.it/api/v1/users?_quantity=1&_gender=male|{total, data}') )
} )()