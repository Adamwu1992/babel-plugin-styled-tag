const STYLED_DIV = {
  'color': 'red',
  'position': 'relative',
  'background-position': 'center'
}, a = 1, b = 2;

export default function App() {
  console.log(a + b)
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

const STYLED_SPAN = {
  'color': 'black',
  'background-color': 'red'
}