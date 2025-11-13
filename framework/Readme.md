# Frontend Framework

# Get Started

## Initialize the types

```js
export const DOM_TYPES = {
    TEXT: 'text',           // type for a text node
    ELEMENT: 'element',     // type for an element node
    FRAGMENT: 'fragment',   // type for a fragment node
}
```

## Get To Know Each Functions:

### function h()

```js
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
```

example of using it:
```js
h('h1', { id: 'title'}, ['This is a title'])
```
result:
```html
<h1 id="title">This is a title</h1>
```

exam: please transform this html below into h() function, you can find the answer at the bottom of this file:

```html
<div>
    <h1>This is a title</h1>
    <p>This is a paragraph</p>
</div>
```

### function hFragment()

```js
// To create an object of type fragment
// This can be a second initial entry instead of h() function and nested child with h(), it always good to start with hFragment right away.
export function hFragment(vNodes) {
    return {
        type: DOM_TYPES.FRAGMENT,
        children: mapTextNodes(withoutNulls(vNodes)) // an array of the children node.
    }
}
```

example of using it:
```js
hFragment([
    h('h1', {}, ['This is a title']),
    h('p', {}, ['This is a paragraph'])
])
```
result:
```html
<h1>This is a title</h1>
<p>This is a paragraph</p>
```

exam: now it's your turn to tronsform this into hFragment()
```html
<header>Hello</header>
<main>
    <h1>This is a title</h1>
    <p>This is a paragraph</p>
</main>
<footer>Powered by Koodsisu</footer>
```

### function mapTextNodes()

```js
// To sort out the children: if it is a string then it will be returned as object of type text with the value of it's content string
// If it is not a string, it will recursively handled as either fragment or element
function mapTextNodes(children) {
    return children.map((child) => {
        return typeof child === 'string' ? hString(child) : child
    })
}
```

### function hString()

```js
// To create an object of type text after sort out by mapTextNodes above.
export function hString(str) {
    if (typeof str === 'string') {
        return { type: DOM_TYPES.TEXT, value: str }
    }
}
```

example in use:
```js
h('h1', {}, [hString('This is a title')])
```

result:
```html
<h1>This is a title</h1>
```




# How To Start A New Project With This Frontend Framework

## Complete Guide How To Start

1. Install All Dependencies
    On the root of the project:
```sh
make build
```
2. Create A Project Folder
   On the root of the project:
```sh
mkdir project-name #feel free to name your project folder as you like
```
3. Install Frontend Framework Into Your Project
   On the root of the project:
```sh
cd project-name

npm install frontend-framework
```
4. Start Coding In Frontend Framework as shown at Get Started above
**Happy Coding**

---

## Answers:

function h()
```js
h('div', {}, [
    h('h1', {}, ['This is a title']),
    h('p', {}, ['This is a paragraph'])
])
```

function hFragment:
```js
hFragment([
    h('header', {}, ['Hello']),
    h('main', {}, [
        hFragment([
            h('h1', {}, ['This is a title']),
            h('p', {}, ['This is a paragraph'])
        ])
    ]),
    h('footer', {}, ['Powered by Koodsisu'])
])
```