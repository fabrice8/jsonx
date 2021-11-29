
import path from 'path'
import Lexer, {
  isMultiLineComment,
  isString,
  isNumber,
  isBoolean,
  isNull,
  isVariable,
  isImport,
  isExport,
  isAssigned,
  isScript
} from '../src/lexer'
import Parser from '../src/parser'
import Compiler from '../src/compiler'
// import { parse, stringify } from '../src/formater'
import { fetchContent, clean } from '../src/utils'
import { compile } from '../src'

function TestLexer(){
  // Lexer & Lexic Test
  console.log( isMultiLineComment('/** Declaration of a key variable */"bing') )
  console.log( isString('"hello":{},"bing') )
  console.log( isNumber('12.3e6:{}') )
  console.log( isBoolean('false:{}') )
  console.log( isNull('null:{}') )
  console.log( isVariable('$protocol.:"merline') )
  console.log( isImport('@import {firstname,lastname} from https://localhost:3000/user.json?version=1,"merline":') )
  console.log( isExport('@export as $signal: "CLOSE"}') )
  console.log( isAssigned('$account.settings{theme,langugage},"name":"salue"') )
  console.log( isScript('`function(){ return $protocol.substr(8) }`:"merline') )
}

async function TestCompliler(){
  // Entrypoint to compiling process
  const
  // entryPoint = path.resolve( __dirname, '../samples/index.jsonx' ),
  entryPoint = path.resolve( __dirname, '../samples/locales/index.jsonx' ),
  input = await fetchContent( entryPoint ),
  cleaned = clean( input ),
  { tokens, syntaxTree } = Lexer( cleaned )

  console.log('\n---------------------------------- CLEANED INPUT ----------------------------------')
  console.log( cleaned )
  console.log('\n---------------------------------- TOKENS ----------------------------------')
  console.log( tokens )
  console.log('\n---------------------------------- SYNTAX TREE ----------------------------------')
  console.log( syntaxTree )
  
  console.log('\n---------------------------------- PARSED VALUES ----------------------------------')
  const { _value } = Parser( tokens )
  console.log( _value )

  console.log('\n---------------------------------- COMPILED JSON DATA ----------------------------------')
  const { JSON, Exports } = await Compiler( _value, syntaxTree, path.dirname( entryPoint ) ) 
  console.log('JSON Data: ', JSON )
  console.log('Exports: ', Exports )
}

// async function TestParseStringify(){
//   // Parse & Stringify JSONX content
//   const
//   entryPoint = path.resolve( __dirname, '../samples/index.jsonx' ),
//   input = await fetchContent( entryPoint )

//   console.log('\n---------------------------------- JSONX STRINGIFY ----------------------------------')
//   const stringified = stringify( input )
//   console.log( stringified )

//   console.log('\n---------------------------------- JSONX PARSE ----------------------------------')
//   const parsed = parse( stringified )
//   console.log( parsed )
//   console.log( await compile( parsed ) )
// }