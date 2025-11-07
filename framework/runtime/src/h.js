import { withoutNulls } from './utils/arrays.js'

export const DOM_TYPES = {
    TEXT: 'text',
    ELEMENT: 'element',
    FRAGMENT: 'fragment',
}

export function h(tag, props = {}, children = []) {
    return {
        tag,
        props,
        children: mapTextNodes(withoutNulls(children)),
        type: DOM_TYPES.ELEMENT
    }
}

function mapTextNodes(children) {
    return children.map((child) => {
        return typeof child === 'string' ? hString(child) : child
    })
}

export function hString(str) {
    if (typeof str === 'string') {
        return { type: DOM_TYPES.TEXT, value: str }
    }
}

export function hFragment(vNodes) {
    return {
        type: DOM_TYPES.FRAGMENT,
        children: mapTextNodes(withoutNulls(vNodes))
    }
}

export function TodosList(todos) {
    return h('ul', {}, todos.map((todo) => h('li', {}, [todo])))
}

export function MessageComponent(level = 'info' | 'warning' | 'error', message = '') {
    const classOne = 'message'
    const classTwo = `message--${level}`

    return h(`div`, { class: `${classOne} ${classTwo}` }, [
        h('p', {}, [message])
    ])

}

export function TodoInEditMode(todo, idxInList) {

}

export function TodoInReadMode(todo, idxInList) {
    
}


export function TodoItem(todo, idxInList, editingIdxs) {
    const isEditing = editingIdxs.has(idxInList)

    return h(
        'li',
        {},
        [
            isEditing
            ? TodoInEditMode(todo, idxInList)
            : TodoInReadMode(todo, idxInList)
        ]
    )
}

export function CreateTodo(state) {

}

export function TodoList(state) {
    return h(
        'ul',
        {},
        [state.todos.map(
            (todo, i) => TodoItem(todo, i, state.editingIdxs)
        )]
    )
}

export function App(state) {
    return hFragment([
        h('h1', {}, ['My TODOs']),
        CreateTodo(state),
        TodoList(state)
    ])
}