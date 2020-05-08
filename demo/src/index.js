const MY_DIV = {
  fontSize: 14,
  color: 'red'
}, a = 1;

const b = 2;

const App = () => {
  console.log(a + b)
  return (
    <MY_DIV className="container" style={{
        height: '100%',
        padding: 10,
        color: '#333'
    }}>
      <MY_SPAN>hello world</MY_SPAN>
    </MY_DIV>
  )
}

export default App
