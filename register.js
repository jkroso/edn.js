import {define} from 'parse-mime'
import parse from './read'

export default define('application/edn', parse)
