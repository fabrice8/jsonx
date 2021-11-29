
import Render from './render'

export default async ( filepath: string ) => {
  try { return await Render( filepath ) }
  catch( error: any ){ throw new Error( error || 'Unknown Error' ) }
}