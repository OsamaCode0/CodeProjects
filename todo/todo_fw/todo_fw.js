import { h, hFragment } from './dist/frontend-framework.js'

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

function CreateTodo({ currentTodo }, emit, helpers) {
    const submitTodo = async () => {
        if (currentTodo.length < 3) return
        const id = localStorage.getItem('user_id') || ''
        const token = localStorage.getItem('token') || ''
        try {
            const data = await helpers.api.post('http://localhost:8081/user/todo', {
                user_id: id,
                content: currentTodo,
                due_time: null, // later also get from user input, for improvement
            })

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

function TodoItem({ todo, i, edit }, emit, helpers) {
    const isEditing = edit.idx === i

    const saveEditedTodo = async () => {
        const id = localStorage.getItem('user_id') || ''
        const token = localStorage.getItem('token') || ''
        try {
            await helpers.api.put(`http://localhost:8081/user/todo`, {
                id: todo.id,
                user_id: todo.user_id,
                content: edit.edited,
                due_time: todo.due_time,
                is_plan: todo.is_plan,
            })
            emit('save-edited-todo')
        } catch (err) {
            console.error('Error updating todo:', err)
        }
    }

    const deleteTodo = async () => {
        try {
            await helpers.api.delete(`http://localhost:8081/user/todo`, {
                id: todo.id,
                user_id: todo.user_id,
            })
            // remove locally by index (uses your existing reducer)
            emit('remove-todo', i)
        } catch (err) {
            console.error('Error deleting todo:', err)
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
                    click: deleteTodo
                }
            }, ['Done']),
        ])
}

function TodoList({ todos, edit }, emit, helpers) {
    return h(
        'ul',
        {},
        todos.map((todo, i) => TodoItem({ todo, i, edit }, emit, helpers))
    )
}

async function loadTodos(emit, helpers) {
    const id = localStorage.getItem('user_id') || ''

    try {
        const data = await helpers.api.get(`http://localhost:8081/user/todo/${id}`)
        emit('load-todos-success', data.data || [])
    } catch (err) {
        console.error('Error loading todos:', err)
        emit('load-todos-failure', err.message)
    }
}

export function TodoApp(state, emit, helpers) {
    const token = localStorage.getItem('token') || ''
    if (token === '') {
        return (
            h('p', {}, ['Please Login In Advance --> ', h("a", {
                href: "/login",
                on: {
                    click: (e) => {
                        e.preventDefault();
                        helpers.navigate("/login")
                    }
                }
            }, ["Login"])])
        )
    }
    if (state.todos.length === 0) {
        loadTodos(emit, helpers)
    }
    return h('div', { class: 'todo-app' }, [
        h('h1', {}, ['My TODOs']),
        CreateTodo(state, emit, helpers),
        TodoList(state, emit, helpers),
    ])
}
