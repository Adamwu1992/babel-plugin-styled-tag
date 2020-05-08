
function camelCase(name) {
  return name.replace(/\-(\w)/, (_, p1) => p1.toUpperCase())
}

module.exports = function(babel) {
  const t = babel.types

  function getProperties(nodeList) {
    const map = {}
    for (let p of nodeList) {
      if (!t.isObjectProperty(p)) continue
      if (t.isStringLiteral(p.key)) {
        map[camelCase(p.key.value)] = p.value.value
      } else if (t.isIdentifier(p.key)) {
        map[camelCase(p.key.name)] = p.value.value
      }
    }
    return map
  }

  function createProperties (obj) {
    const properties = []
    Object.keys(obj).forEach(key => {
      const val = obj[key]
      let value
      if (typeof val === 'string') {
        value = t.stringLiteral(val)
      } else {
        value = t.numericLiteral(val)
      }
      properties.push(
        t.objectProperty(
          t.identifier(key),
          value
        )
      )
    })
    return properties
  }

  // 在已有的 jsx attr 中插入指定的样式
  function appendJSXStyleAttr(attrs, styles) {
    const existStyleAttr = attrs.find(node => t.isJSXAttribute(node) && node.name.name === 'style')
    const styleProperties = createProperties(styles)
    if (!existStyleAttr) {
      // 不存在 style 属性，新建一个新增到 attrs 中
      attrs.push(
        t.jsxAttribute(
          t.jSXIdentifier('style'),
          t.jsxExpressionContainer(
            t.objectExpression(styleProperties)
          )
        )
      )
    } else {
      // 存在 style 属性，改写 properties
      const map = {}
      for (const p of [
        ...styleProperties,
        ...existStyleAttr.value.expression.properties,
      ]) {
        const key = p.key.name
        map[key] = p
      }
      const properties = []
      for (const p in map) {
        properties.push(map[p])
      }
      existStyleAttr.value.expression.properties = properties
    }
  }

  // 收集 STYLED_TAG 的样式，并且删除声明代码
  function collectStyleDeclarator(path) {
    // 判断是否是空的 declaration 节点
    const isEmptyDeclaration = node =>
      t.isVariableDeclaration(node) && !node.declarations.length
    // 判断是否是 styled tag 的样式声明
    const isStyledDeclarator = node => {
      const reg = new RegExp(`^${prefix}_`)
      return t.isVariableDeclarator(node) && reg.test(node.id.name)
    }
    
    const node = path.node
    if (!isStyledDeclarator(node)) return
    const key = node.id.name
    const value = getProperties(node.init.properties)
    styleMap[key] = value
    path.remove()
    if (isEmptyDeclaration(path.parent)) {
      path.parent.remove()
    }
    return value
  }

  let styleMap = {}

  let prefix = 'STYLED'

  return {
    name: 'babel-plugin-styled-tag',
    inherits: require('babel-plugin-syntax-jsx'),
    visitor: {
      Program: {
        enter(path, state) {
          if (state.opts && state.opts.prefix) {
            prefix = state.opts.prefix
          }
        }
      },
      JSXElement: {
        enter(path) {
          // 判断是否是 styled 类型的 jsx 元素
          const isStyledJSXElement = ele => {
            const name = ele.name.name
            const reg = new RegExp('^' + prefix + '_')
            return reg.test(name)
          }

          const getTransformedName = node =>
            node.name.slice(prefix.length + 1).toLowerCase()

          const node = path.node
          const { openingElement, closingElement } = node
          let newOpeningElement = newClosingElement = null
          if (openingElement && isStyledJSXElement(openingElement)) {
            const styledTagName = openingElement.name.name
            let JSXStyleAttr = openingElement.attributes
            if (styleMap[styledTagName]) {
              // 对应的样式已经被收集到 styleMap 中
              appendJSXStyleAttr(JSXStyleAttr, styleMap[styledTagName])
            } else {
              // 对应的样式尚未被收集，需要在作用域中查找
              const binding = path.scope.getBinding(styledTagName)
              if (binding) {
                const path = binding.path
                const style = collectStyleDeclarator(path)

                // TODO: styled tag 不在本模块内定义
                if (style) {
                  appendJSXStyleAttr(JSXStyleAttr, style)
                }
              }
            }
            const tagName = getTransformedName(openingElement.name)
            newOpeningElement = t.jsxOpeningElement(
              t.jsxIdentifier(tagName),
              JSXStyleAttr,
              openingElement.selfClosing
            )
          }
          if (closingElement) {
            const tagName = getTransformedName(closingElement.name)
            newClosingElement = t.jsxClosingElement(t.jsxIdentifier(tagName))
          }
          
          if (newOpeningElement) {
            path.replaceWith(t.jsxElement(
              newOpeningElement,
              newClosingElement,
              node.children,
              newClosingElement === null
            ))
          }
        }
      }
    }
  }
}