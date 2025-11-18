import { createApp, h, hFragment } from './dist/frontend-framework.js'

function head() {
    return hFragment([
        h('link', { rel: 'stylesheet', href: './index.css' }),
        h('title', {}, ['Frontend Framework']),
    ])
}

createApp({
    view: head,
}).mount(document.head)

function helloWorld() {
    return hFragment([
        h('header', {}, ['Frontend Framework']),
        h('main', {}, [
            h('h1', { class: 'title' }, ['Hello valued costumer']),
            h('p', { class: 'paragraph' }, ['Thankyou for choosing frontend-framework as your frontend framework'])
        ]),
        h('footer', {}, ['Powered by Kood/Sisu']),
    ])
}

createApp({
    state: {},
    view: helloWorld,
}).mount(document.body)