const tester = require('babel-plugin-tester').default
const styledTag = require('../lib')

tester({
  plugin: styledTag,
  tests: {
    'replace styled tag': {
      code: `
        var STYLED_DIV = {
          color: 'red',
          fontSize: 20
        }

        function App() {
          return <STYLED_DIV>hello world</STYLED_DIV>
        }
      `,
      output: `
        function App() {
          return <div style={{
            color: 'red',
            fontSize: 20
          }}>hello world</div>
        }
      `
    }
  }
})