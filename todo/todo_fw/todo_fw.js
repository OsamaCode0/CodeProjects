import { h, hFragment, createApp } from './dist/frontend-framework.js'

export const todoState = {
    currentTodo: '',
    edit: {
        idx: null,
        original: null,
        edited: null,
    },
    todos: [],
}

export const todoReducers = {
    'update-current-todo': (state, currentTodo) => ({
        ...state,
        currentTodo,
    }),
    'add-todo': (state) => ({
        ...state,
        currentTodo: '',
        todos: [...state.todos, state.currentTodo],
    }),
    'add-todo-success': (state, todoObj) => ({
        ...state,
        currentTodo: '',
        todos: [...state.todos, todoObj],
    }),
    'add-todo-failure': (state, errorMessage) => ({
        ...state,
        error: errorMessage,
    }),
    'load-todos-success': (state, todos) => ({
        ...state,
        todos,
    }),
    'load-todos-failure': (state, errorMessage) => ({
        ...state,
        error: errorMessage,
    }),
    'start-editing-todo': (state, idx) => ({
        ...state,
        edit: {
            idx,
            original: state.todos[idx].content,
            edited: state.todos[idx].content,
        },
    }),
    'edit-todo': (state, edited) => ({
        ...state,
        edit: { ...state.edit, edited },
    }),
    'save-edited-todo': (state) => {
        const todos = [...state.todos]
        console.log('save-edited-todo: ', state)
        todos[state.edit.idx].content = state.edit.edited
        console.log('save-edited-todo: ', state.edit.edited)
        console.log('save-edited-todo: ', todos[state.edit.idx])
        console.log('save-edited-todo: ', todos)

        return {
            ...state,
            edit: {
                idx: null,
                original: null,
                edited: null,
            },
            todos,
        }
    },
    'cancel-editing-todo': (state) => ({
        ...state,
        edit: {
            idx: null,
            original: null,
            edited: null,
        },
    }),
    'remove-todo': (state, idx) => ({
        ...state,
        todos: state.todos.filter((_, i) => i !== idx),
    }),
}

function CreateTodo({ currentTodo }, emit) {
    const submitTodo = async () => {
        if (currentTodo.length < 3) return
        const id = localStorage.getItem('user_id') || ''
        const token = localStorage.getItem('token') || ''
        try {
            const res = await fetch('http://localhost:8081/user/todo', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    user_id: id,
                    content: currentTodo,
                    due_time: null, // later also get from user input, for improvement
                }),
            })

            if (!res.ok) {
                console.log('submit todo: res not ok')
                const err = await res.json().catch(() => ({}))
                throw new Error(err.message || 'Fail to save todo')
            }
            
            const data = await res.json()
            emit('add-todo-success', data.data)
        } catch (err) {
            console.error('Error saving todo:', err)
            emit('add-todo-failure', err.message)
        }
    }
    return h('div', {}, [
        h('label', { htmlFor: 'todo-input' }, ['New TODO']),
        h('input', {
            key: "todo-input",
            type: 'text',
            id: 'todo-input',
            value: currentTodo,
            on: {
                input: ({ target }) =>
                    emit('update-current-todo', target.value),
                keydown: ({ key }) => {
                    if (key === 'Enter' && currentTodo.length >= 3) {
                        submitTodo()
                    }
                },
            },
        }),
        h('button', {
            disabled: currentTodo.length < 3,
            on: { click: submitTodo },
        }, ['Add']),
    ])
}

function TodoItem({ todo, i, edit }, emit) {
    const isEditing = edit.idx === i

    const saveEditedTodo = async () => {
        const id = localStorage.getItem('user_id') || ''
        const token = localStorage.getItem('token') || ''
        try {
            const res = await fetch(`http://localhost:8081/user/todo`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    id: todo.id,
                    user_id: todo.user_id,
                    content: edit.edited,
                    due_time: todo.due_time,
                    is_plan: todo.is_plan,
                }),
            })

            if (!res.ok) {
                const err = await res.json().catch(() => ({}))
                throw new Error(err.message || 'Fail to update todo')
            }
            
            emit('save-edited-todo')
        } catch (err) {
            console.error('Error updating todo:', err)
        }
    }

    return isEditing
        ? h('li', {}, [
            h('input', {
                value: edit.edited,
                on: {
                    input: ({ target }) => emit('edit-todo', target.value)
                },
            }),
            h('button', {
                on: {
                    click: saveEditedTodo
                }
            }, ['Save']),
            h('button', {
                on: {
                    click: () => emit('cancel-editing-todo')
                }
            }, ['Cancle']),
        ])
        : h('li', {}, [
            h('span', {
                on: {
                    dblclick: () => emit('start-editing-todo', i)
                }
            }, [todo.content]),
            h('button', {
                on: {
                    click: () => emit('remove-todo', i)
                }
            }, ['Done']),
        ])
}

function TodoList({ todos, edit }, emit) {
    return h(
        'ul',
        {},
        todos.map((todo, i) => TodoItem({ todo, i, edit }, emit))
    )
}

async function loadTodos(emit) {
    const id = localStorage.getItem('user_id') || ''
    const token = localStorage.getItem('token') || ''

    try {
        const res = await fetch(`http://localhost:8081/user/todo/${id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        })

        if (!res.ok) {
            throw new Error('Failed to load todos')
        }
        const data = await res.json()
        emit('load-todos-success', data.data || [])
    } catch (err) {
        console.error('Error loading todos:', err)
        emit('load-todos-failure', err.message)
    }
}

export function TodoApp(state, emit) {
    if (state.todos.length === 0) {
        loadTodos(emit)
    }
    return h('div', { class: 'todo-app' }, [
        h('h1', {}, ['My TODOs']),
        CreateTodo(state, emit),
        TodoList(state, emit),
    ])
}

// createApp({ state: todoState, reducers: todoReducers, view: TodoApp }).mount(document.body)