
import fs from 'fs'

export const fetchContent = async ( filePath: string ) => {
  return await fs.readFileSync( filePath, 'utf-8' )
}

export const clean = ( input: string ): string => {
  
  const
  VALID_JSON = /^(\[|\{)\s*(.+)\s*(\}|\])$/,
  REMOVE_BREAKLINES = /\r?\n\s+/g,
  REMOVE_SINGLELINE_COMMENT = /(\s+)?[^:]\/\/(.+)/g,
  REMOVE_MULTIPLELINE_COMMENT = /\/\*(.+)\*\//g

  // Remove single line comments
  input = input.replace( REMOVE_SINGLELINE_COMMENT, '' )
  // console.log('\nNo Comment: ', input )

  // Remove breaking lines
  input = input.replace( REMOVE_BREAKLINES, '' )
  // console.log('\nNo BreakLine: ', input )

  // Remove multiple-lines comment
  // input = input.replace( REMOVE_MULTIPLELINE_COMMENT, '' )
  // console.log('\nNo Multiple Lines Comment: ', input )

  if( !VALID_JSON.test( input ) )
    throw new Error('Invalid JSONX Format')

  // Remove useless spaces
  return input.replace(/\{\s+/g, '{')
              .replace(/\s*\}/g, '}')
              .replace(/\[\s+/g, '[')
              .replace(/\s*\]/g, ']')
}

export const getType = ( arg: any ) => {
  return Array.isArray( arg ) ? 'array' : 'object'
}

export const isEmpty = ( entry: any ) => {
  // test empty array or object
  if( typeof entry !== 'object' ) return null
  return Array.isArray( entry ) ? !entry.length : Object.keys( entry ).length === 0 && entry.constructor === Object
}