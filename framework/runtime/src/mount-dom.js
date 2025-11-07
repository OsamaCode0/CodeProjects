import { DOM_TYPES } from "./h.js";
import { setAttributes } from './attributes.js'
import { addEventListeners } from './events.js'

export function mountDOM(vdom, parentEl) {
    switch (vdom.type) {
        case DOM_TYPES.TEXT: {
            console.log("start create text node")
            createTextNode(vdom, parentEl)
            break
        }

        case DOM_TYPES.ELEMENT: {
            console.log("start create element node")
            createElementNode(vdom, parentEl)
            break
        }

        case DOM_TYPES.FRAGMENT: {
            console.log('start create frament node')
            createFragmentNode(vdom, parentEl)
            break
        }

        default: {
            console.log("an error happen")
            throw new Error(`Can't mount DOM of type: ${vdom.type}`)
        }
    }
}

function createTextNode(vdom, parentEl) {
    const { value } = vdom

    const textNode = document.createTextNode(value)
    vdom.el = textNode

    parentEl.append(textNode)
}

function createFragmentNode(vdom, parentEl) {
    const { children } = vdom;

    vdom.el = parentEl;

    children.forEach((child) => mountDOM(child, parentEl))
}

function createElementNode(vdom, parentEl) {
    const { tag, props, children } = vdom;

    const element = document.createElement(tag);
    addProps(element, props, vdom);
    vdom.el = element;

    children.forEach((child) => mountDOM(child, element));
    parentEl.append(element);
}

function addProps(el, props, vdom) {
    // split listeners from attributes
    const { on: events, ...attrs } = props;

    // add event listeners
    vdom.listeners = addEventListeners(events, el);
    // set attributes
    setAttributes(el, attrs)
}