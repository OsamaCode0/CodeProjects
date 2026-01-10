import { removeEventListeners } from './events.js'
import { DOM_TYPES } from './h.js'

// 4.2 Destroying the DOM
export function destroyDOM(vdom) {
    const { type } = vdom;

    switch (type) {
        case DOM_TYPES.TEXT: {
            removeTextNode(vdom)
            break
        }
        case DOM_TYPES.ELEMENT: {
            removeElementNode(vdom)
            break
        }
        case DOM_TYPES.FRAGMENT: {
            removeFragmentNodes(vdom)
            break
        }
        default: {
            throw new Error(`Can't destroy DOM of type: ${type}`)
        }
    }

    delete vdom.el
}

// 4.2.1 Destroying a text node
function removeTextNode(vdom) {
    const { el } = vdom;
    if (el) {
        el.remove();
    }
}

// 4.2.2 Destroying an element
function removeElementNode(vdom) {
    const { el, children, listeners } = vdom;

    if (el) {
        el.remove();
    }
    if (children) {
        children.forEach(destroyDOM);
    }
    if (listeners && el) {
        removeEventListeners(listeners, el);
        delete vdom.listeners;
    }
}

// 4.2.3 Destroying a fragment
function removeFragmentNodes(vdom) {
    const { children } = vdom;

    if (children) {
        children.forEach(destroyDOM);
    }
}