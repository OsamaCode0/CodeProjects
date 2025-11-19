import { h, hFragment } from './dist/frontend-framework.js'

export const todoState = {
    currentTodo: '',
    searchQuery: '',
    edit: {
        idx: null,
        original: null,
        edited: null,
    },
    todos: [],
    todosLoaded: false,
    isHistory: false,
    loadAttempts: 0,
}

export const todoReducers = {
    'update-current-todo': (state, currentTodo) => ({
        ...state,
        currentTodo,
    }),
    'update-search-query': (state, searchQuery) => ({
        ...state,
        searchQuery,
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
        todosLoaded: true,
        loadAttempts: 0,
    }),
    'load-todos-failure': (state, errorMessage) => ({
        ...state,
        error: errorMessage,
    }),
    'load-todos-history-success': (state, todos) => ({
        ...state,
        todos,
        isHistory: true,
        todosLoaded: true,
    }),
    'load-todos-history-failure': (state, errorMessage) => ({
        ...state,
        error: errorMessage,
    }),
    'increment-load-attempt': (state) => ({
        ...state,
        loadAttempts: (state.loadAttempts || 0) + 1,
    }),
    'search-todos-success': (state, todos) => ({
        ...state,
        todos,
    }),
    'search-todos-failure': (state, errorMessage) => ({
        ...state,
        error: errorMessage,
    }),
    'clear-search': (state) => ({
        ...state,
        searchQuery: '',
        todos: [],
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
        todos[state.edit.idx].content = state.edit.edited

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

function CreateTodo({ currentTodo, searchQuery }, emit, helpers) {
    const DEBOUNCE_MS = 1000
    let searchTimer = null

    const submitTodo = async () => {
        if (currentTodo.length < 3) return
        const id = localStorage.getItem('user_id') || ''
        try {
            const data = await helpers.api.post('http://localhost:8081/user/todo', {
                user_id: id,
                content: currentTodo,
                due_time: null, // later also get from user input, for improvement
            })

            if (typeof data.data === 'string') {
                emit('add-todo-failure', data.data)
            } else {
                emit('add-todo-success', data.data)
            }
        } catch (err) {
            console.error('Error saving todo:', err)
            emit('add-todo-failure', err.message)
        }
    }

    const searchTodo = async (query) => {
        if (query.length < 3) return
        const user_id = localStorage.getItem('user_id') || ''
        try {
            const data = await helpers.api.get(`http://localhost:8081/user/todo/${user_id}/${query}`)

            if (Array.isArray(data.data) && data.data.length > 0) {
                emit('search-todos-success', data.data)
            } else {
                emit('search-todos-failure', data.data)
            }
        } catch (err) {
            console.error('Error saving todo:', err)
            emit('search-todos-failure', err.message)
        }
    }

    const debouncedSearch = (query) => {
        clearTimeout(searchTimer)
        if (!query || query.length < 2) return
        searchTimer = setTimeout(() => searchTodo(query), DEBOUNCE_MS)
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
        h('label', { htmlFor: 'todo-search' }, ['Search']),
        h('input', {
            key: "todo-search",
            type: 'text',
            id: 'todo-search',
            value: searchQuery,
            on: {
                input: ({ target }) => {
                    const query = target.value
                    emit('update-search-query', query)

                    // auto-search as user typing
                    debouncedSearch(query)

                    // clear search & reload when empty
                    if (query.length === 0) {
                        clearTimeout(searchTimer)
                        emit('clear-search')
                        loadTodos(emit, helpers)
                    }
                },

                keydown: ({ key }) => {
                    if (key === 'Enter' && searchQuery.length >= 2) {
                        clearTimeout(searchTimer)
                        searchTodo(searchQuery)
                    }
                },
            },
        }),
        h('button', {
            disabled: searchQuery.length < 2,
            on: { click: () => { clearTimeout(searchTimer); searchTodo(searchQuery) } },
        }, ['Search']),
    ])
}

function TodoItem({ todo, i, edit, isHistory }, emit, helpers) {
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

    const dueTime = todo.due_time instanceof Date ? todo.due_time : new Date(todo.due_time)
    const isSentinel =
        dueTime.getUTCFullYear() < 2000
    const displayDueTime = isSentinel
        ? ''
        : dueTime.toLocaleString('en-GB', {
            timeZone: 'UTC',
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        })

    return isEditing
        ? h('li', {}, [
            h('input', {
                class: 'edit-input',
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
            h('span', {}, [`${displayDueTime}`]),
            !isHistory ? h('button', {
                on: {
                    click: deleteTodo
                }
            }, ['Done']) : null,
        ])
}

function TodoList({ todos, edit, isHistory }, emit, helpers) {
    return h(
        'ul',
        {},
        todos.map((todo, i) => TodoItem({ todo, i, edit, isHistory }, emit, helpers))
    )
}

async function loadTodos(emit, helpers) {
    const id = localStorage.getItem('user_id') || ''

    try {
        const data = await helpers.api.get(`http://localhost:8081/user/todo/${id}`)

        if (Array.isArray(data.data)) {
            emit('load-todos-success', data.data)
        } else {
            emit('load-todos-failure', data.data)
        }
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

    const MAX_LOAD_ATTEMPTS = 3
    if (!state.todosLoaded && (state.loadAttempts || 0) < MAX_LOAD_ATTEMPTS) {
        emit('increment-load-attempt')
        loadTodos(emit, helpers)
    }

    const loadPreviousTodos = async () => {
        const id = localStorage.getItem('user_id') || ''

        try {
            console.log('load previous todos')
            const data = await helpers.api.get(`http://localhost:8081/user/todo/history/${id}`)

            if (Array.isArray(data.data)) {
                console.log('array is array :', data.data)
                emit('load-todos-history-success', data.data)
            } else {
                emit('load-todos-history-failure', data.data)
            }
        } catch (err) {
            console.error('Error loading todos:', err)
            emit('load-todos-history-failure', err.message)
        }
    }

    const handleLogout = async () => {
        const id = localStorage.getItem('user_id') || ''
        const token = localStorage.getItem('token') || ''
        try {
            await helpers.api.get(`http://localhost:8081/user/logout`, {
                user_id: id,
                token: token,
            })
            state.isLoggedin = false
            localStorage.clear()

        } catch (err) {
            console.log('error logout')
        } finally {
            state.isLoggedin = false
            localStorage.clear()
            helpers.navigate('/')
        }
    }

    return hFragment([
        h('header', {}, [
            h('div', {}, [
                h('button', {
                    class: 'dropdown-btn',
                    on: {
                        click: () => {
                            // Optional: clear list immediately for visual feedback
                            emit('load-todos-success', [])
                            // Reset attempts so the auto-loader works if needed
                            emit('increment-load-attempt')
                            // Fetch active todos
                            loadTodos(emit, helpers)
                        }
                    }
                }, ['Home']),
            ]),
            h('div', {}, [
                h('button', {
                    class: 'dropdown-btn',
                    on: {
                        click: loadPreviousTodos
                    }
                }, ['history']),
                // h('button', {
                //     class: 'dropdown-btn',
                //     on: {
                //         click: (e) => {
                //             e.preventDefault()
                //             helpers.navigate('/friends')
                //         }
                //     }
                // }, ['friends']),
                // h('button', {
                //     class: 'dropdown-btn',
                //     on: {
                //         click: (e) => {
                //             e.preventDefault()
                //             helpers.navigate('/chat')
                //         }
                //     }
                // }, ['chat']),
                h('button', {
                    class: 'dropdown-btn',
                    on: {
                        click: handleLogout
                    }
                }, ['Logout']),
            ]),
        ]),
        h('div', { class: 'todo-app' }, [
            h('h1', {}, ['My TODOs']),
            CreateTodo(state, emit, helpers),
            TodoList({ ...state }, emit, helpers),
        ]),
        h('footer', {}, ['Powered by Kood/Sisu'])
    ])
}
