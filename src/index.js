import React from 'react'

const STYLED_DIV = {
  'color': 'red',
  'position': 'relative',
  'background-position': 'center'
}, a = 1, b = 2;


export default class App extends React.Component {
  constructor(props) {
    super(props)
  }

  render() {
    return (
      <STYLED_DIV
        className="wrapper"
        style={{
          color: 'yellow',
          fontSize: 20
        }}
      >
        <STYLED_SPAN>
          Hello World
        </STYLED_SPAN>
        
        <div> What's your name? </div>
      </STYLED_DIV>
    )
  }
}

const STYLED_SPAN = {
  'color': 'black',
  'background-color': 'red'
}