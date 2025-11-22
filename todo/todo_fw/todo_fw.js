import { h, hFragment } from './dist/frontend-framework.js'

export const todoState = {
    currentTodo: '',
    searchQuery: '',
    timeValue: '',
    timeUnit: 'minutes',
    showTimePicker: false,
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
    'toggle-time-picker': (state) => ({
        ...state,
        showTimePicker: !state.showTimePicker,
    }),
    'set-duration': (state, durationMinutes) => ({
        ...state,
        selectedDuration: durationMinutes,
        showTimePicker: false,
    }),
    'clear-duration': (state) => ({
        ...state,
        selectedDuration: null,
    }),
    'add-todo': (state) => ({
        ...state,
        currentTodo: '',
        todos: [...state.todos, state.currentTodo],
    }),
    'add-todo-success': (state, todoObj) => ({
        ...state,
        currentTodo: '',
        selectedDuration: null,
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
    'logout-success': (state) => ({
        ...state,
        isLoggedIn: false,
        currentEmail: '',
        currentPassword: '',
        todos: [],
        todosLoaded: false,
        loadAttempts: 0,
        searchQuery: '',
        isHistory: false,
        selectedDuration: null,
        showTimePicker: false,
        edit: {
            idx: null,
            original: null,
            edited: null,
        }
    })
}

let searchTimer = null

function TimePicker({ selectedDuration }, emit) {
    const timeOptions = [
        { label: '30 minutes', minutes: 30 },
        { label: '1 hour', minutes: 60 },
        { label: '2 hours', minutes: 120 },
        { label: '6 hours', minutes: 360 },
        { label: '12 hours', minutes: 720 },
        { label: '1 day', minutes: 1440 },
        { label: '2 days', minutes: 2880 },
        { label: '3 days', minutes: 4320 },
        { label: '1 week', minutes: 10080 },
        { label: '2 weeks', minutes: 20160 },
        { label: '1 month', minutes: 43200 },
        { label: '2 months', minutes: 86400 },
    ]

    return h('div', { class: 'time-picker-dropdown' }, [
        h('div', { class: 'time-picker-header' }, [
            h('span', {}, ['Select Duration']),
            h('button', {
                class: 'close-picker',
                on: { click: () => emit('toggle-time-picker') }
            }, ['×'])
        ]),
        h('div', { class: 'time-options' },
            timeOptions.map(option =>
                h('button', {
                    class: selectedDuration === option.minutes ? 'time-option selected' : 'time-option',
                    on: {
                        click: () => emit('set-duration', option.minutes)
                    }
                }, [option.label])
            )
        )
    ])
}

function CreateTodo({ currentTodo, searchQuery, selectedDuration, showTimePicker }, emit, helpers) {
    const DEBOUNCE_MS = 1000

    const submitTodo = async () => {
        if (currentTodo.length < 3) return
        const id = localStorage.getItem('user_id') || ''
        
        let dueTime = null
        if (selectedDuration) {
            dueTime = new Date(Date.now() + selectedDuration * 60 * 1000)
        }

        try {
            const data = await helpers.api.post('http://localhost:8081/user/todo', {
                user_id: id,
                content: currentTodo,
                due_time: dueTime,
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

            if (Array.isArray(data.data)) {
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

    const formatDuration = (minutes) => {
        if (!minutes) return ''
        if (minutes < 60) return `${minutes}m`
        if (minutes < 1440) return `${Math.floor(minutes / 60)}h`
        if (minutes < 43200) return `${Math.floor(minutes / 1440)}d`
        return `${Math.floor(minutes / 43200)}mo`
    }

    return h('div', { class: 'create-todo-container' }, [
        h('label', { htmlFor: 'todo-input' }, ['New TODO']),
        h('div', { class: 'todo-input-row' }, [
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
                class: 'time-button',
                on: { click: () => emit('toggle-time-picker') },
            }, [
                selectedDuration ? `⏱️ ${formatDuration(selectedDuration)}` : '⏱️ Set Time'
            ]),
            selectedDuration ? h('button', {
                class: 'clear-time-button',
                on: { click: () => emit('clear-duration') },
            }, ['×']) : null,
            h('button', {
                disabled: currentTodo.length < 3,
                on: { click: submitTodo },
            }, ['Add']),
        ]),
        showTimePicker ? TimePicker({ selectedDuration }, emit) : null,
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
                    debouncedSearch(query)
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

function formatCountdown(ms) {
    if (ms <= 0) return 'Expired'
    
    const minutes = Math.floor(ms / 60000)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)
    const months = Math.floor(days / 30)
    
    if (months > 0) {
        const remainingDays = days % 30
        const remainingHours = hours % 24
        const remainingMinutes = minutes % 60
        return `${months}mo ${remainingDays}d ${remainingHours}h ${remainingMinutes}m`
    }
    
    if (days > 0) {
        const remainingHours = hours % 24
        const remainingMinutes = minutes % 60
        return `${days}d ${remainingHours}h ${remainingMinutes}m`
    }
    
    if (hours > 0) {
        const remainingMinutes = minutes % 60
        return `${hours}h ${remainingMinutes}m`
    }
    
    return `${minutes}m`
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
            emit('remove-todo', i)
        } catch (err) {
            console.error('Error deleting todo:', err)
        }
    }

    const dueTime = todo.due_time instanceof Date ? todo.due_time : new Date(todo.due_time)
    const isSentinel = dueTime.getUTCFullYear() < 2000
    
    const timeRemaining = isSentinel ? null : dueTime.getTime() - Date.now()
    const countdown = timeRemaining !== null ? formatCountdown(timeRemaining) : ''

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
            }, ['Cancel']),
        ])
        : h('li', {}, [
            h('span', {
                class: 'todo-content',
                on: {
                    dblclick: () => emit('start-editing-todo', i)
                }
            }, [todo.content]),
            countdown ? h('span', { 
                class: timeRemaining <= 0 ? 'countdown expired' : 'countdown'
            }, [countdown]) : null,
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
        setTimeout(() => {
            emit('increment-load-attempt')
            loadTodos(emit, helpers)
        }, 0)
    }

    // Update countdown every minute
    setTimeout(() => {
        emit('increment-load-attempt')
    }, 60000)

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
            await helpers.api.post(`http://localhost:8081/logout`, {
                user_id: id,
                token: token,
            })
            localStorage.clear()
            emit('logout-success')

        } catch (err) {
            console.log('error logout')
        } finally {
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
                            emit('load-todos-success', [])
                            emit('increment-load-attempt')
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