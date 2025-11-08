import { destroyDOM } from './destroy-dom.js'
import { mountDOM } from './mount-dom.js'
import { DOM_TYPES } from './h.js'
import { setAttribute } from './attributes.js';

// replace old node with new node
function replaceNode(oldVdom, newVdom, parentEl) {
  destroyDOM(oldVdom);
  mountDOM(newVdom, parentEl);
}

// update text node in place
function updateTextNode(oldVdom, newVdom) {
  if (oldVdom.value !== newVdom.value) {
    oldVdom.el.nodeValue = newVdom.value;
    oldVdom.value = newVdom.value;
  }
  newVdom.el = oldVdom.el;
}

// update element props/listeners in place (simple diff)
function updateElementProps(el, oldProps = {}, newProps = {}, vdom) {
  const { on: oldEvents = {}, ...oldAttrs } = oldProps;
  const { on: newEvents = {}, ...newAttrs } = newProps;

  // listeners: remove old not present, add new/changed
  Object.entries(oldEvents).forEach(([name, handler]) => {
    if (!newEvents[name] || newEvents[name] !== handler) {
      el.removeEventListener(name, handler);
    }
  });
  Object.entries(newEvents).forEach(([name, handler]) => {
    if (!oldEvents[name] || oldEvents[name] !== handler) {
      el.addEventListener(name, handler);
    }
  });

  // attributes: remove missing, update changed
  Object.keys(oldAttrs).forEach((k) => { if (!(k in newAttrs)) setAttribute(el, k, null); });
  Object.entries(newAttrs).forEach(([k, v]) => { if (oldAttrs[k] !== v) setAttribute(el, k, v); });

  // keep vdom.props for future diffs
  vdom.props = newProps;
}

// naive index-based children patching
function patchChildren(oldChildren = [], newChildren = [], parentEl) {
  const max = Math.max(oldChildren.length, newChildren.length);
  for (let i = 0; i < max; i++) {
    const oldChild = oldChildren[i];
    const newChild = newChildren[i];

    if (!oldChild && newChild) {
      mountDOM(newChild, parentEl);
      oldChildren[i] = newChild;
      continue;
    }
    if (oldChild && !newChild) {
      destroyDOM(oldChild);
      oldChildren.splice(i, 1);
      i--; // adjust index
      continue;
    }
    // both exist
    patch(oldChild, newChild, parentEl);
    oldChildren[i] = newChild;
  }
}

// main patch function
export function patch(oldVdom, newVdom, parentEl) {
  if (!oldVdom || !newVdom) return; 
  if (oldVdom.type !== newVdom.type) {
    replaceNode(oldVdom, newVdom, parentEl);
    return;
  }

  if (newVdom.type === DOM_TYPES.TEXT) {
    updateTextNode(oldVdom, newVdom);
    return;
  }

  if (newVdom.type === DOM_TYPES.ELEMENT) {
    if (oldVdom.tag !== newVdom.tag) {
      replaceNode(oldVdom, newVdom, parentEl);
      return;
    }
    // reuse element
    const el = oldVdom.el;
    newVdom.el = el;

    // update props/listeners
    updateElementProps(el, oldVdom.props || {}, newVdom.props || {}, newVdom);

    // patch children
    patchChildren(oldVdom.children || [], newVdom.children || [], el);
    return;
  }

  if (newVdom.type === DOM_TYPES.FRAGMENT) {
    patchChildren(oldVdom.children || [], newVdom.children || [], parentEl);
    newVdom.el = parentEl;
    return;
  }
}
