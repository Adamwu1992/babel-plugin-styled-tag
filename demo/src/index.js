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
      hello world
    </MY_DIV>
  )
}

export default App
