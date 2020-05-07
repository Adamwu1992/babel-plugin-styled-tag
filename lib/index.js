
function camelCase(name) {
  return name.replace(/\-(\w)/, (_, p1) => p1.toUpperCase())
}

module.exports = function(babel) {
  const t = babel.types

  function isStyledTag(node) {
    const reg = /^STYLED_/
    return t.isJSXIdentifier(node)
      && reg.test(node.name)
  }
  function isStyledDeclarator(node) {
    const reg = /^STYLED_/
    return t.isVariableDeclarator(node) && reg.test(node.id.name)
  }

  function getTagName(node) {
    const prefix = 'STYLED_'
    return node.name.slice(prefix.length).toLowerCase()
  }

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
        ...existStyleAttr.value.expression.properties,
        // TODO： 默认 styleProperties 中的同名属性将覆盖原有的属性，此处可以增加配置项
        ...styleProperties
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
    const isEmptyDeclaration = node =>
      t.isVariableDeclaration(node) && !node.declarations.length
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

  return {
    visitor: {
      JSXElement: {
        enter(path) {
          const node = path.node
          const { openingElement, closingElement } = node
          let newOpeningElement = newClosingElement = null
          if (openingElement && isStyledTag(openingElement.name)) {
            const styledTagName = openingElement.name.name
            let JSXStyleAttr = openingElement.attributes
            if (styleMap[styledTagName]) {
              appendJSXStyleAttr(JSXStyleAttr, styleMap[styledTagName])
            } else {
              const binding = path.scope.getBinding(styledTagName)
              if (binding) {
                const path = binding.path
                const style = collectStyleDeclarator(path)
                appendJSXStyleAttr(JSXStyleAttr, style)
              }
            }
            const tagName = getTagName(openingElement.name)
            newOpeningElement = t.jsxOpeningElement(
              t.jsxIdentifier(tagName),
              JSXStyleAttr,
              openingElement.selfClosing
            )
          }
          if (closingElement) {
            const tagName = getTagName(closingElement.name)
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