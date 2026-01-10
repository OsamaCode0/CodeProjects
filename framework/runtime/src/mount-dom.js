import { DOM_TYPES } from "./h.js";
import { setAttributes } from './attributes.js'
import { addEventListeners } from './events.js'

// 4.1.1 Mounting virtual nodes into the DOM
export function mountDOM(vdom, parentEl, index) {
    if (!vdom || typeof vdom.type === 'undefined') {
        console.warn('Invalid vdom passed to mountDOM:', vdom);
        return;
    }
    
    switch (vdom.type) {
        case DOM_TYPES.TEXT: {
            // Mounts a text virtual node
            createTextNode(vdom, parentEl, index)
            break
        }

        case DOM_TYPES.ELEMENT: {
            // Mounts an element virtual node
            createElementNode(vdom, parentEl, index)
            break
        }

        case DOM_TYPES.FRAGMENT: {
            // Mounts the children of a fragment virtual node
            createFragmentNode(vdom, parentEl, index)
            break
        }

        default: {
            console.log("an error happen")
            throw new Error(`Can't mount DOM of type: ${vdom.type}`)
        }
    }
}

// 4.1.2 Mounting text nodes
function createTextNode(vdom, parentEl, index) {
    const { value } = vdom

    const textNode = document.createTextNode(value) // Creates a text node
    vdom.el = textNode // Saves a reference of the node

    // parentEl.append(textNode) // Append to the parent element
    insert(textNode, parentEl, index)
}

// 4.1.3 Mounting fragment nodes
function createFragmentNode(vdom, parentEl, index) {
    const { children } = vdom;

    vdom.el = parentEl;

    // children.forEach((child) => mountDOM(child, parentEl))
    children.forEach((child, i) => {
        mountDOM(child, parentEl, index ? index + i : null)
    })
}

// 4.1.4 Mounting element nodes
function createElementNode(vdom, parentEl, index) {
    const { tag, props, children } = vdom;

    const element = document.createElement(tag);
    addProps(element, props, vdom);
    vdom.el = element;

    children.forEach((child) => mountDOM(child, element));
    // parentEl.append(element);
    insert(element, parentEl, index)
}

// 4.1.4 Mounting element nodes -> add props
function addProps(el, props, vdom) {
    // split listeners from attributes
    const { on: events, ...attrs } = props;

    // add event listeners
    vdom.listeners = addEventListeners(events, el);
    // set attributes
    setAttributes(el, attrs)
}

// 8.1 Mounting the DOM at an index
function insert(el, parentEl, index) {
    if (index == null) {
        parentEl.append(el)
        return
    }

    if (index < 0) {
        throw new Error(`Index must be a positive integer, got ${index}`)
    }

    const children = parentEl.childNodes

    if (index >= children.length) {
        parentEl.append(el)
    } else {
        parentEl.insertBefore(el, children[index])
    }
}

// export function helperMountDOM(vdom, parentEl, index) {
//     if (!vdom || typeof vdom.type === 'undefined') {
//         console.warn('Invalid vdom passed to mountDOM:', vdom);
//         return;
//     }
    
//     switch (vdom.type) {
//         case DOM_TYPES.TEXT: {
//             console.log("start create text node")
//             createTextNode(vdom, parentEl, index)
//             break
//         }

//         case DOM_TYPES.ELEMENT: {
//             console.log("start create element node")
//             createElementNode(vdom, parentEl, index)
//             break
//         }

//         case DOM_TYPES.FRAGMENT: {
//             console.log('start create frament node')
//             createFragmentNode(vdom, parentEl, index)
//             break
//         }

//         default: {
//             console.log("an error happen")
//             throw new Error(`Can't mount DOM of type: ${vdom.type}`)
//         }
//     }
// }