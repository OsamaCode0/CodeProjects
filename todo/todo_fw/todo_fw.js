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
    'update-time-value': (state, value) => ({
        ...state,
        timeValue: value,
    }),
    'update-time-unit': (state, unit) => ({
        ...state,
        timeUnit: unit,
    }),
    'clear-time-input': (state) => ({
        ...state,
        timeValue: '',
        timeUnit: 'minutes',
        showTimePicker: false,
    }),
    'add-todo': (state) => ({
        ...state,
        currentTodo: '',
        todos: [...state.todos, state.currentTodo],
    }),
    'add-todo-success': (state, todoObj) => ({
        ...state,
        currentTodo: '',
        timeValue: '',
        timeUnit: 'minutes',
        showTimePicker: false,
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
        isHistory: false,
        edit: { idx: null, original: null, edited: null },
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
        edit: { idx: null, original: null, edited: null },
    }),
    'load-todos-history-failure': (state, errorMessage) => ({
        ...state,
        error: errorMessage,
    }),
    'tick': (state) => ({
        ...state,
        lastTick: Date.now()
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
        timeValue: '',
        timeUnit: 'minutes',
        showTimePicker: false,
        edit: {
            idx: null,
            original: null,
            edited: null,
        }
    }),
}

let searchTimer = null

function TimePicker({ timeValue, timeUnit }, emit) {
    const units = ['minutes', 'hours', 'days', 'months', 'years']

    return h('div', { class: 'time-picker-dropdown' }, [
        h('div', { class: 'time-picker-header' }, [
            h('span', {}, ['Set Timer']),
            h('button', {
                class: 'close-picker',
                on: { click: () => emit('toggle-time-picker') }
            }, ['×'])
        ]),
        h('div', { class: 'time-input-container' }, [
            h('input', {
                type: 'number',
                min: '1',
                placeholder: 'Enter number',
                value: timeValue,
                class: 'time-value-input',
                on: {
                    input: ({ target }) => emit('update-time-value', target.value)
                }
            }),
            h('select', {
                class: 'time-unit-select',
                value: timeUnit,
                on: {
                    change: ({ target }) => emit('update-time-unit', target.value)
                }
            }, units.map(unit =>
                h('option', { value: unit }, [unit])
            ))
        ])
    ])
}

function CreateTodo({ currentTodo, searchQuery, timeValue, timeUnit, showTimePicker }, emit, helpers) {
    const DEBOUNCE_MS = 1000

    const calculateDueTime = () => {
        if (!timeValue || timeValue <= 0) return null

        const value = parseInt(timeValue)
        let milliseconds = 0

        switch (timeUnit) {
            case 'minutes':
                milliseconds = value * 60 * 1000
                break
            case 'hours':
                milliseconds = value * 60 * 60 * 1000
                break
            case 'days':
                milliseconds = value * 24 * 60 * 60 * 1000
                break
            case 'months':
                milliseconds = value * 30 * 24 * 60 * 60 * 1000
                break
            case 'years':
                milliseconds = value * 365 * 24 * 60 * 60 * 1000
                break
        }

        return new Date(Date.now() + milliseconds)
    }

    const submitTodo = async () => {
        if (currentTodo.length < 3) return
        const id = localStorage.getItem('user_id') || ''

        const dueTime = calculateDueTime()

        clearTimeout(searchTimer)

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

    const formatDuration = () => {
        if (!timeValue || timeValue <= 0) return ''
        return `${timeValue} ${timeUnit}`
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
                timeValue ? `⏱️ ${formatDuration()}` : '⏱️ Set Time'
            ]),
            timeValue ? h('button', {
                class: 'clear-time-button',
                on: { click: () => emit('clear-time-input') },
            }, ['×']) : null,
            h('button', {
                disabled: currentTodo.length < 3,
                on: { click: submitTodo },
            }, ['Add']),
        ]),
        showTimePicker ? TimePicker({ timeValue, timeUnit }, emit) : null,
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

    const totalSeconds = Math.floor(ms / 1000)
    const totalMinutes = Math.floor(totalSeconds / 60)
    const totalHours = Math.floor(totalMinutes / 60)
    const totalDays = Math.floor(totalHours / 24)
    const totalMonths = Math.floor(totalDays / 30)
    const totalYears = Math.floor(totalDays / 365)

    // Show seconds only when less than 1 minute remains
    if (totalMinutes < 1) {
        const seconds = totalSeconds % 60
        return `${seconds}s`
    }

    if (totalYears > 0) {
        const remainingMonths = Math.floor((totalDays % 365) / 30)
        const remainingDays = (totalDays % 365) % 30
        const remainingHours = totalHours % 24
        const remainingMinutes = totalMinutes % 60
        return `${totalYears}y ${remainingMonths}mo ${remainingDays}d ${remainingHours}h ${remainingMinutes}m`
    }

    if (totalMonths > 0) {
        const remainingDays = totalDays % 30
        const remainingHours = totalHours % 24
        const remainingMinutes = totalMinutes % 60
        return `${totalMonths}mo ${remainingDays}d ${remainingHours}h ${remainingMinutes}m`
    }

    if (totalDays > 0) {
        const remainingHours = totalHours % 24
        const remainingMinutes = totalMinutes % 60
        return `${totalDays}d ${remainingHours}h ${remainingMinutes}m`
    }

    if (totalHours > 0) {
        const remainingMinutes = totalMinutes % 60
        return `${totalHours}h ${remainingMinutes}m`
    }

    return `${totalMinutes}m`
}

function TodoItem({ todo, i, edit, isHistory }, emit, helpers) {
    const isEditing = !isHistory && edit.idx === i

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

    const path = window.location.pathname
    const isHistoryPath = path === '/todo/history'
    const MAX_LOAD_ATTEMPTS = 3

    if (isHistoryPath && !state.isHistory) {
        setTimeout(() => loadPreviousTodos(), 0)
    } else if (!isHistoryPath && (state.isHistory || !state.todosLoaded)) {

        if ((state.loadAttempts || 0) < MAX_LOAD_ATTEMPTS) {
            setTimeout(() => {
                // If coming back from history, clear the list first so we don't see old data
                if (state.isHistory) emit('load-todos-success', []);

                emit('increment-load-attempt');
                loadTodos(emit, helpers);
            }, 0);
        }
    }

    // Update countdown every minute (or every second if any todo is under 1 minute)
    const hasUrgentTodo = state.todos.some(todo => {
        if (!todo.due_time) return false
        const dueTime = new Date(todo.due_time)
        const timeRemaining = dueTime.getTime() - Date.now()
        return timeRemaining > -6000 && timeRemaining < 3600000 // less than 1 minute
    })

    setTimeout(() => {
        emit('tick')
    }, hasUrgentTodo ? 1000 : 60000)

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
                        click: (e) => {
                            e.preventDefault()
                            helpers.navigate('/todo')
                        }
                    }
                }, ['Home']),
            ]),
            h('div', {}, [
                h('button', {
                    class: 'dropdown-btn',
                    on: {
                        click: (e) => {
                            e.preventDefault()
                            helpers.navigate('/todo/history')
                        }
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