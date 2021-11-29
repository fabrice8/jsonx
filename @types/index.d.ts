
export declare module 'node-fetch'

export type LexicalCheckRespone = {
  _comment?: string,
  _string?: string,
  _number?: number,
  _boolean?: boolean,
  _null?: null,
  _variable?: string,
  _import?: string,
  _export?: string,
  _assigned?: string,
  _script?: string,
  rest: string
}

export type TokenArray = {
  [index: number]: string | number | boolean | null
}

export type ParseArray = {
  _array: any[],
  _tokens: TokenArray[]
}

export type parseObject = {
  _object: any[],
  _tokens: TokenArray[]
}

export type JSONResponse = { [index: string]: any }
export type SyntaxTree = { [ index:string ]: string[] } 