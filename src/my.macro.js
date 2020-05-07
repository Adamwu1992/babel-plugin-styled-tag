import { createMacro } from 'babel-plugin-macros'

function myMacro() {}

export default createMacro(myMacro)