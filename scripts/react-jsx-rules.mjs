// 补足新版 React 检查插件未提供的两项 JSX 检查。
export default {
  rules: {
    'valid-jsx': {
      meta: {
        type: 'problem',
        schema: [],
        messages: {
          duplicate: '同一元素重复填写了属性 {{name}}。',
          unescaped: '请用字符实体或 JavaScript 字符串表示这段 JSX 中的引号或括号。',
        },
      },
      create(context) {
        return {
          JSXOpeningElement(node) {
            const names = new Set()
            for (const attribute of node.attributes) {
              if (attribute.type !== 'JSXAttribute' || attribute.name.type !== 'JSXIdentifier') continue
              const name = attribute.name.name
              if (names.has(name)) context.report({ node: attribute, messageId: 'duplicate', data: { name } })
              names.add(name)
            }
          },
          JSXText(node) {
            if (/[>"'}]/.test(node.raw)) context.report({ node, messageId: 'unescaped' })
          },
        }
      },
    },
  },
}
