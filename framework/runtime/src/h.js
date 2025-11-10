import { withoutNulls } from './utils/arrays.js'

// 3.4 Types of nodes
export const DOM_TYPES = {
    TEXT: 'text',
    ELEMENT: 'element',
    FRAGMENT: 'fragment',
}

// 3.5 Element nodes
export function h(tag, props = {}, children = []) {
    return {
        tag,
        props,
        children: mapTextNodes(withoutNulls(children)),
        type: DOM_TYPES.ELEMENT
    }
}

// 3.5.2 Mapping string to text nodes
function mapTextNodes(children) {
    return children.map((child) => {
        return typeof child === 'string' ? hString(child) : child
    })
}

// 3.6 Text nodes
export function hString(str) {
    if (typeof str === 'string') {
        return { type: DOM_TYPES.TEXT, value: str }
    }
}

// 3.7 Fragment nodes, 3.7.1 Implementing frament nodes
export function hFragment(vNodes) {
    return {
        type: DOM_TYPES.FRAGMENT,
        children: mapTextNodes(withoutNulls(vNodes))
    }
}

// 8.2.3 // Subtree change : Extracting the children of a node
export function extractChildren(vdom) {
    if (vdom.children == null) {
        return []
    }

    const children = []

    for (const child of vdom.children) {
        if (child.type === DOM_TYPES.FRAGMENT) {
            children.push(...extractChildren(child, children))
        } else {
            children.push(child)
        }
    }

    return children
}
