
export default ( input: string ): string => {
  
  const
  VALID_JSON = /^\{\s*(.+)\s*\}$/,
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
  input = input.replace( REMOVE_MULTIPLELINE_COMMENT, '' )
  // console.log('\nNo Multiple Lines Comment: ', input )

  if( !VALID_JSON.test( input ) )
    throw new Error('Invalid JSONX Format')

  // Remove useless spaces
  return input.replace(/\{\s+/g, '{')
              .replace(/\s*\}/g, '}')
              .replace(/\[\s+/g, '[')
              .replace(/\s*\]/g, ']')
}