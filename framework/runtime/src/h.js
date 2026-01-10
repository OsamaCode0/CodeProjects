import { withoutNulls } from './utils/arrays.js'

// 3.4 Types of nodes
export const DOM_TYPES = {
    TEXT: 'text',           // type for a text node
    ELEMENT: 'element',     // type for an element node
    FRAGMENT: 'fragment',   // type for a fragment node
}

// 3.5 Element nodes
// Element nodes are the most common type of virtual node, representing the regular
// HTML elements that you use to define the structure of your web pages. To name a
// few, you have <h1> through <h6> for headings, <p> for paragraphs, <ul> and <ol> for
// lists, <a> for links, and <div> for generic containers. These nodes have a tag name
// (such as 'p'), attributes (such as a class name or the type attribute of an <input> element),
// and children nodes (the nodes that are inside them between the opening and
// closing tags).
export function h(tag, props = {}, children = []) {
    return {
        tag,    // element's tag name : <p>, <div>, --> 'p', 'div'
        props,  // an object with it's attributes: { id: 'input-button' }
        children: mapTextNodes(withoutNulls(children)), // an array of the children node, withoutNulls will trim all null and undefined child: see arrays.js
        type: DOM_TYPES.ELEMENT
    }
}

// 3.5.2 Mapping string to text nodes
// To sort out the children: if it is a string then it will be returned as object of type text with the value of it's content string
// If it is not a string, it will recursively handled as either fragment or element
function mapTextNodes(children) {
    return children.map((child) => {
        return typeof child === 'string' ? hString(child) : child
    })
}

// 3.6 Text nodes
// To create an object of type text after sort out by mapTextNodes above.
export function hString(str) {
    if (typeof str === 'string') {
        return { type: DOM_TYPES.TEXT, value: str }
    }
}

// 3.7 Fragment nodes, 3.7.1 Implementing frament nodes
// To create an object of type fragment
// This can be a second initial entry instead of h() function and nested child with h(), it always good to start with hFragment right away.
export function hFragment(vNodes) {
    return {
        type: DOM_TYPES.FRAGMENT,
        children: mapTextNodes(withoutNulls(vNodes)) // an array of the children node.
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
