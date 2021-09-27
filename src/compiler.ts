
import path from 'path'
import request from 'request-promise-native'
import {
  __JSONX_DESTRUCT_ASSIGN,
  __JSONX_ARRAY_KEY_SYNTAX,
} from './lexic'
import { JSONResponse, SyntaxTree } from '..'

let BASE_PATH = __dirname
const
EXTERNAL_URL = /^https?:\/\/(.+)$/,

variableRegex = /--VARIABLE\[([0-9]+)\]--/,
importRegex = /--IMPORT\[([0-9]+)\]--/,
assignedRegex = /--ASSIGNED\[([0-9]+)\]--/,
scriptRegex = /--SCRIPT\[([0-9]+)\]--/,

Variables: any = {},
Imports: any = {}

function getType( arg: any ){
  return Array.isArray( arg ) ? 'array' : 'object'
}

function toDestructure( str: string ){

  const matches = str.match( __JSONX_DESTRUCT_ASSIGN )
  let fields: any = []
  let isArray = false
  
  if( matches?.length ){
    isArray = /\[(.+)\]$/.test( matches[0] )

    str = str.replace( __JSONX_DESTRUCT_ASSIGN, '') // remove assignment
    fields = matches[ isArray ? 4 : 2 ].split(/\s*,\s*/)
  }

  return { str, fields, isArray }
}

function destructure( jsonData: any, fields: string[], isArray?: boolean ){
  
  const toReturn: any = isArray ? [] : {}
  fields.map( ( key: string ) => {
    isArray ?
        toReturn.push( jsonData[ key ] || null )
        : toReturn[ key ] = jsonData[ key ] || null
  } )

  return toReturn
}

async function fetchImport( uri: string ){
  try {
    let jsonData: any = EXTERNAL_URL.test( uri ) ? 
                                    await request( uri ) 
                                    : await import( path.resolve( BASE_PATH, uri ) )

    // No data found
    if( !jsonData ) return null
    if( typeof jsonData !== 'object' )
      try { return JSON.parse( jsonData ) }
      catch( error ){ return null }
    
    return jsonData
  }
  catch( error ){ throw new Error(`Importing from ${uri} Failed: ${error}`) }
}

async function compile( json: any, tree: SyntaxTree, contentType: string ){

  const compiledJSON: any = contentType == 'array' ? [] : {}

  for( let key in json ){
    let value = json[ key ]

    // Recursive to sub objects and arrays
    if( typeof value == 'object' ){
      compiledJSON[ key ] = await compile( value, tree, getType( value ) )
      continue
    }
    
    // Process imported sources
    if( importRegex.test( value ) ){
      const 
      [ _, index ]: any = value.match( importRegex ),
      { str, fields, isArray } = toDestructure( tree.IMPORTS[ index ] )

      value = Imports.hasOwnProperty( str ) ?
                                    // Use cached data
                                    Imports[ str ]
                                    // Cache temporary the imported data
                                    : Imports[ str ] = await fetchImport( str )

      // Extract only destructuring fields
      if( fields.length )
        value = destructure( value, fields, isArray )
    }

    // Declare variables
    if( variableRegex.test( key ) ){
      const [ _, index ]: any = key.match( variableRegex )
      Variables[ tree.VARIABLES[ index ] ] = value
      continue
    }

    // Assign values to JSONX assignments
    if( assignedRegex.test( value ) ){
      const [ _, index ]: any = value.match( assignedRegex )
      let { str, fields, isArray } = toDestructure( tree.ASSIGNED[ index ] )

      // Replace JSONX $x array items indexing with their equivalent JS syntax
      str = str.replace( __JSONX_ARRAY_KEY_SYNTAX, ( matched, index ) => {
        return matched.replace( matched, `[${index}]`)
      })
      
      try {
        value = fields.length ?
                    // destructuring assignment
                    destructure( eval('Variables.'+ str ), fields, isArray )
                    // simple assignment
                    : eval('Variables.'+ str )
      }
      catch( error ){ throw new Error(`Undefined Variable: ${str.split('.')[0]}: ${error}`) }
    }

    // Run and return scripts value
    if( scriptRegex.test( value ) ){
      const 
      [ _, index ]: any = value.match( scriptRegex ),
      // Replace JSONX assignments in the script with equivalent values
      script = tree.SCRIPTS[ index ].replace(/\$[a-z0-9]+/ig, ( matched, word ) => {
        return matched.replace('$', 'Variables.')
      })
      
      try { value = eval( script ) }
      catch( error ){ throw new Error(`Invalid JS Script at "${key}": ${error}`) }
    }

    compiledJSON[ key ] = value
  }
  
  return compiledJSON
}

export default async ( json: any, tree: SyntaxTree, basePath: string ) => {
  
  if( Object.entries( json ).length === 0 && json.constructor === Object )
    return {}
  
  BASE_PATH = basePath
  return await compile( json, tree, getType( json ) )
}