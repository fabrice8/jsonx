
import { clean } from './utils'
import {
  __MULTILINE_COMMENT_CLOSER,
  __MULTILINE_COMMENT_STAR
} from './lexic'

function removeMultiLineComment( input: string ): string {
  let 
  comments: any = [],
  recording = false,
  index = -1
  
  for( let x = 0; x < input.length; x++ ){
    if( input[x] == __MULTILINE_COMMENT_CLOSER && input[ x + 1] == __MULTILINE_COMMENT_STAR ){
      recording = true
      index++
      comments[ index ] = __MULTILINE_COMMENT_CLOSER
      continue
    }

    else if( recording && x > 0 && input[x] == __MULTILINE_COMMENT_CLOSER && input[ x - 1 ] == __MULTILINE_COMMENT_STAR ){
      recording = false
      comments[ index ] += __MULTILINE_COMMENT_CLOSER 
    }
    
    if( recording ) comments[ index ] += input[x]
  }

  console.log( comments )
  // Remove comments
  comments.map( ( each: string ) => { input = input.replace( each, '') } )
  
  return input
}

export const parse = ( input: string ) => {

  if( !input )
    throw new Error('Undefined Input')

  // input = input.replace(/\[/g, ' [')
  //               .replace(/\{/g, ' {')
  //               .replace(/\(/g, ' (')
  //               .replace(/\}from/g, '} from ')
  //               .replace(/\}as/g, '} as ')

  return input
}

export const stringify = ( input: string | object ): string => {

  if( !input )
    throw new Error('Undefined Input')

  if( typeof input == 'object' )
    input = JSON.stringify( input )

  else if( typeof input == 'string' )
    input = clean( input )
    
  return removeMultiLineComment( input )
}

export default { parse, stringify }