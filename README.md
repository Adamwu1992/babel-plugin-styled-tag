# babel-plugin-styled-tag

🤔 Define your tag with style.

## How it is work

src/index.js

```javascript
const STYLED_DIV = {
  fontSize: 14,
  color: 'red'
}, a = 1;

const b = 2;

const App = () => {
  console.log(a + b)
  return (
    <STYLED_DIV className="container" style={{
        height: '100%',
        padding: 10,
        color: '#333'
    }}>
      hello world
    </STYLED_DIV>
  )
}

export default App
```

dist/index.js

```javascript
const a = 1;
const b = 2;

const App = () => {
  console.log(a + b);
  return <div className="container" style={{
    fontSize: 14,
    color: '#333',
    height: '100%',
    padding: 10
  }}>
      hello world
    </div>;
};

export default App;
```

## Usage

```bash
npm install -D babel-plugin-styled-tag
```

Via `.babelrc`

```json
{
  "plugins": [
    "babel-plugin-styled-tag"
  ]
}
```

### options

You can specify prefix for your styled tags. `STYLED` is default.

```json
{
  "plugins": [
    ["babel-plugin-styled-tag", {
      "prefix": "STYLED"
    }]
  ]
}
```