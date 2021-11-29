
import path from 'path'
import {
  __JSONX_ASSIGNED_AS,
  __JSONX_DESTRUCT_ASSIGN,
  __JSONX_ARRAY_KEY_SYNTAX,
} from './lexic'
import { render } from '.'
import { getType, isEmpty } from './utils'
import { JSONResponse, SyntaxTree } from '..'

const
variableRegex = /--VARIABLE\[([0-9]+)\]--/,
importRegex = /--IMPORT\[([0-9]+)\]--/,
exportRegex = /--EXPORT\[([0-9]+)\]--/,
assignedRegex = /--ASSIGNED\[([0-9]+)\]--/,
assignedSpreadRegex = /--ASSIGNED_SPREAD\[([0-9]+)\]--/,
scriptRegex = /--SCRIPT\[([0-9]+)\]--/

export default async ( json: any, syntaxTree: SyntaxTree, dirname?: string ) => {
  
  if( Object.entries( json ).length === 0 && json.constructor === Object ) return {}
  
  let Exports: any = {}
  const Variables: any = {}

  function toJSArrayKey( key: string ): string {
    // Replace JSONX $x array items indexing with their equivalent JS syntax
    return key.replace( __JSONX_ARRAY_KEY_SYNTAX, ( matched, index ) => {
      return matched.replace( matched, `[${index}]`)
    })
  }

  function toDestructure( str: string ){

    const matches = str.match( __JSONX_DESTRUCT_ASSIGN )
    let fields: any = []
    let isArray = false
    
    if( matches?.length && matches[2] ){
      isArray = /\[(.+)\]$/.test( matches[1] )

      str = str.replace( __JSONX_DESTRUCT_ASSIGN, '') // remove assignment
      fields = matches[3].split(/\s*,\s*/)
    }

    return { str, fields, isArray }
  }

  function destructure( jsonData: any, fields: string[], isArray?: boolean ){

    // Array indexing
    if( isArray && /^[0-9]+$/.test( fields[0] ) ){
      // Slice array portion
      if( fields[1] && /^\.\.\.[0-9]+$/.test( fields[1] ) )
        return jsonData.slice( +fields[0], +fields[1].replace('...', '') + 1 )

      // Get only one given item value of the array
      else if( fields.length == 1 )
        return [ jsonData[ +fields[0] ] ]

      // Return multiple specified indexes values
      else return fields.map( each => { return jsonData[ +each ] } )
    }

    // Desctructure specified array items or object keys into object
    const toReturn: any = {}
    fields.map( ( key: string, index ) => {

      // Assign destructured key value as a given object key name
      const composedKey = key.match( __JSONX_ASSIGNED_AS )
      if( composedKey?.length && composedKey[0] )
        try { toReturn[ composedKey[2] ] = eval('jsonData.'+ composedKey[1] ) }
        catch( error ){ toReturn[ composedKey[2] ] = null }
      
      else {
        // Deep level Object keys & value 
        const levelKeys = key.split('.')
        if( levelKeys.length > 1 ){
          const asKey = levelKeys.slice(-1)[0]
          
          try { toReturn[ asKey ] = eval(`jsonData${isArray ? toJSArrayKey( key ) : '.'+ key}`) }
          catch( error ){ toReturn[ asKey ] = null }
        }

        // First level keys
        else toReturn[ key ] = jsonData[ isArray ? index : key ] || null
      }
    } )

    return toReturn
  }

  async function fetchImport( uri: string ){
    try {
      const result = await render( path.resolve( dirname || __dirname, uri ) )
      
      return result !== null
              && typeof result == 'object'
              && result.hasOwnProperty('JSON') 
              && result.hasOwnProperty('Exports') ?
                                  !isEmpty( result.Exports ) ? result.Exports : result.JSON // Compiled JSONX results
                                  : result // Regular JSON data
    }
    catch( error ){ throw new Error(`Importing from ${uri} Failed: ${error}`) }
  }

  async function importValue( value: string, syntaxTree: SyntaxTree ){
    const 
    [ _, index ]: any = value.match( importRegex ),
    { str, fields, isArray } = toDestructure( syntaxTree.IMPORTS[ index ] )

    value = await fetchImport( str )
    
    // Extract only destructuring fields
    if( value && fields.length )
      value = destructure( value, fields, isArray )

    return value
  }

  function assignValue( value: any, syntaxTree: SyntaxTree ){

    const [ _, index ]: any = value.match( assignedRegex )
    let { str, fields, isArray } = toDestructure( syntaxTree.ASSIGNED[ index ] )

    // Replace JSONX $x array items indexing with their equivalent JS syntax
    str = toJSArrayKey( str )
    
    try {
      return fields.length ?
                  // destructuring assignment
                  destructure( eval('Variables.'+ str ), fields, isArray )
                  // simple assignment
                  : eval('Variables.'+ str )
    }
    catch( error ){ throw new Error(`Undefined Variable: ${str.split('.')[0]}: ${error}`) }
  }

  function assignSpread( key: string, value: any, syntaxTree: SyntaxTree ){
    const 
    spotted = assignedSpreadRegex.test( key ) ? key : value,
    [ _, index ]: any = spotted.match( assignedSpreadRegex )
    let { str, fields, isArray } = toDestructure( syntaxTree.ASSIGNED[ index ] )

    // Replace JSONX $x array items indexing with their equivalent JS syntax
    str = toJSArrayKey( str )
    
    try {
      value = fields.length ?
                    // destructuring assignment
                    destructure( eval('Variables.'+ str ), fields, isArray )
                    // simple assignment
                    : eval('Variables.'+ str )

      return { asValue: value, spotted }
    }
    catch( error ){ throw new Error(`Undefined Variable: ${str.split('.')[0]}: ${error}`) }
  }

  function scriptValue( key: string, value: string, syntaxTree: SyntaxTree ){
    const 
    [ _, index ]: any = value.match( scriptRegex ),
    // Replace JSONX assignments in the script with equivalent values
    script = syntaxTree.SCRIPTS[ index ].replace(/\$[a-z0-9]+/ig, ( matched, word ) => {
      return matched.replace('$', 'Variables.')
    })
    
    try { return eval( script ) }
    catch( error ){ throw new Error(`Invalid JS Script at "${key}": ${error}`) }
  }

  async function Processor( json: any, syntaxTree: SyntaxTree, contentType: string ){

    let compiledJSON: any = contentType == 'array' ? [] : {}
    const toSpreadValues: any = {}

    async function processValue( key: string, value: any ){
      // Process imported sources
      if( importRegex.test( value ) )
        value = await importValue( value, syntaxTree )

      // Assign values to JSONX assignments
      if( assignedRegex.test( value ) )
        value = assignValue( value, syntaxTree )
        
      // Run and return scripts value
      if( scriptRegex.test( value ) )
        value = scriptValue( key, value, syntaxTree )

      return value
    }
    
    for( let key in json ){
      let value = json[ key ]
      
      // Recursive to sub objects and arrays
      if( typeof value == 'object' ){
        value = await Processor( value, syntaxTree, getType( value ) )

        // Variables with object generated value
        if( variableRegex.test( key ) ){
          const [ _, index ]: any = key.match( variableRegex )
          Variables[ syntaxTree.VARIABLES[ index ] ] = value
          continue
        }
      }

      // Declare variables
      if( variableRegex.test( key ) ){
        const [ _, index ]: any = key.match( variableRegex )

        // Process value being assign to variables
        value = await processValue( key, value )

        Variables[ syntaxTree.VARIABLES[ index ] ] = value
        continue
      }
      
      // Assign values to JSONX spread assignments
      if( assignedSpreadRegex.test( key ) || assignedSpreadRegex.test( value ) ){
        const { asValue, spotted } = assignSpread( key, value, syntaxTree )

        toSpreadValues[ spotted ] = asValue
        // continue
      }

      // Process exported variables
      if( exportRegex.test( key ) ){
        const 
        [ _, index ]: any = key.match( exportRegex ),
        expVar = syntaxTree.EXPORTS[ index ]

        // Process exported value
        value = await processValue( key, value )
        
        /** Export without indicator `as` is assume to be the default
         * export so any existing exported data will be overwritten
         * @export: VALUE
        */
        if( expVar === '' ) Exports = value
        else {
          /** Overwrite existing `Export` in case it's a string or 
           * Array to Object holder of named `key:value` 
           */
          if( Exports !== 'object' || Array.isArray( Exports ) ) Exports = {}
          // Declare/Name value being exported
          Exports[ expVar ] = value
        }
        
        continue
      }
      
      // Process imported, assigned, script, ... value
      compiledJSON[ key ] = await processValue( key, value )
    }

    // Assign spotted spread variables
    if( !isEmpty( toSpreadValues ) )
      Object.entries( toSpreadValues )
            .map( ([ key, value ]) => {
              try {
                if( Array.isArray( compiledJSON ) )
                  compiledJSON = eval( JSON.stringify( compiledJSON ).replace(`"${key}"`, '...value') )

                else {
                  compiledJSON = JSON.parse( JSON.stringify( compiledJSON ).replace(`"${key}":"...",`, '').replace(`"${key}":"..."`, '') )
                  compiledJSON = { ...compiledJSON, ...( value as Object ) }
                }                
              }
              catch( error ){}
            } )
            
    return compiledJSON
  }
  
  return {
    // Generated JSON Object
    JSON: await Processor( json, syntaxTree, getType( json ) ) as JSONResponse,
    /** Exported variables & data independantely 
     * generated during the compiling of this syntaxTree 
     */
    Exports
  }
}