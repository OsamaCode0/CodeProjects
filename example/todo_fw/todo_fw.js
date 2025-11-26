import { h, hFragment } from './dist/frontend-framework.js'

/* FIXED VERSION - Backend uses /user/todo (verified from main.go) */

let searchTimer = null
let reminderCheckInterval = null
let latestStateRef = null

function isValidDate(d) {
    return d instanceof Date && !isNaN(d.getTime())
}

function parseMaybeDate(val) {
    if (val === null || typeof val === 'undefined' || val === '') return null
    if (val instanceof Date) return isValidDate(val) ? val : null
    if (typeof val === 'number') {
        const d = new Date(val)
        return isValidDate(d) ? d : null
    }
    const d = new Date(val)
    if (!isValidDate(d)) return null
    if (d.getFullYear() <= 1) return null
    return d
}

export const todoState = {
    currentTodo: '',
    searchQuery: '',
    timeValue: '',
    timeUnit: 'minutes',
    showTimePicker: false,
    reminderValue: '',
    reminderUnit: 'minutes',
    showReminderPicker: false,
    activeReminders: [],
    edit: {
        idx: null,
        original: null,
        edited: null,
    },
    todos: [],
    todosLoaded: false,
    isHistory: false,
    loadAttempts: 0,
    isLoggedIn: true,
    currentEmail: '',
    currentPassword: '',
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
        showReminderPicker: false,
    }),
    'toggle-reminder-picker': (state) => ({
        ...state,
        showReminderPicker: !state.showReminderPicker,
        showTimePicker: false,
    }),
    'update-time-value': (state, value) => ({
        ...state,
        timeValue: value,
    }),
    'update-time-unit': (state, unit) => ({
        ...state,
        timeUnit: unit,
    }),
    'update-reminder-value': (state, value) => ({
        ...state,
        reminderValue: value,
    }),
    'update-reminder-unit': (state, unit) => ({
        ...state,
        reminderUnit: unit,
    }),
    'clear-time-input': (state) => ({
        ...state,
        timeValue: '',
        timeUnit: 'minutes',
        showTimePicker: false,
    }),
    'clear-reminder-input': (state) => ({
        ...state,
        reminderValue: '',
        reminderUnit: 'minutes',
        showReminderPicker: false,
    }),
    'add-reminder-notification': (state, todo) => ({
        ...state,
        activeReminders: [...(state.activeReminders || []), todo],
    }),
    'dismiss-reminder': (state, todoId) => ({
        ...state,
        activeReminders: (state.activeReminders || []).filter(r => r.id !== todoId),
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
        reminderValue: '',
        reminderUnit: 'minutes',
        showReminderPicker: false,
        todos: [...state.todos, todoObj],
    }),
    'add-todo-failure': (state, errorMessage) => ({
        ...state,
        error: errorMessage,
    }),
    'load-todos-success': (state, todos) => ({
        ...state,
        todos: todos.map(todo => ({
            ...todo,
            due_time: parseMaybeDate(todo.due_time),
            reminder_time: parseMaybeDate(todo.reminder_time),
        })),
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
        todos: todos.map(todo => ({
            ...todo,
            due_time: parseMaybeDate(todo.due_time),
            reminder_time: parseMaybeDate(todo.reminder_time),
        })),
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
        if (state.edit.idx != null && todos[state.edit.idx]) {
            todos[state.edit.idx].content = state.edit.edited
        }

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
        reminderValue: '',
        reminderUnit: 'minutes',
        showReminderPicker: false,
        activeReminders: [],
        edit: {
            idx: null,
            original: null,
            edited: null,
        }
    }),
}

function ReminderNotification({ reminder }, emit) {
    return h('div', { 
        class: 'reminder-notification',
        style: { position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 9999, background: 'white', padding: '30px', borderRadius: '10px', boxShadow: '0 10px 40px rgba(0,0,0,0.3)', minWidth: '320px', maxWidth: '600px' }
    }, [
        h('div', { 
            class: 'reminder-header',
            style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }
        }, [
            h('div', { style: { display: 'flex', alignItems: 'center', gap: '10px' } }, [
                h('span', { 
                    class: 'reminder-icon',
                    style: { fontSize: '28px' }
                }, ['🔔']),
                h('span', { 
                    class: 'reminder-title',
                    style: { fontSize: '18px', fontWeight: 'bold', color: '#333' }
                }, ['Reminder'])
            ]),
            h('button', {
                class: 'reminder-close',
                style: { background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#999' },
                on: { click: () => emit('dismiss-reminder', reminder.id) }
            }, ['×'])
        ]),
        h('div', { 
            class: 'reminder-content',
            style: { marginBottom: '20px', padding: '15px', background: '#f5f5f5', borderRadius: '5px' }
        }, [
            h('p', { style: { fontSize: '16px', margin: 0, color: '#333' } }, [reminder.content])
        ]),
        h('button', {
            class: 'reminder-dismiss-btn',
            style: { width: '100%', padding: '10px', background: '#4CAF50', color: 'white', border: 'none', borderRadius: '5px', fontSize: '14px', cursor: 'pointer' },
            on: { click: () => emit('dismiss-reminder', reminder.id) }
        }, ['Dismiss'])
    ])
}

function ReminderNotifications({ activeReminders }, emit) {
    if (!Array.isArray(activeReminders) || activeReminders.length === 0) return null

    return h('div', { 
        class: 'reminder-notifications-container',
        style: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9998, display: 'flex', alignItems: 'center', justifyContent: 'center' }
    },
        activeReminders.map(reminder => 
            ReminderNotification({ reminder }, emit)
        )
    )
}

function ReminderPicker({ reminderValue, reminderUnit }, emit) {
    const units = ['minutes', 'hours', 'days', 'months', 'years']

    return h('div', { class: 'time-picker-dropdown' }, [
        h('div', { class: 'time-picker-header' }, [
            h('span', {}, ['Set Reminder']),
            h('button', {
                class: 'close-picker',
                on: { click: () => emit('toggle-reminder-picker') }
            }, ['×'])
        ]),
        h('div', { class: 'time-input-container' }, [
            h('input', {
                type: 'number',
                min: '1',
                placeholder: 'Enter number',
                value: reminderValue,
                class: 'time-value-input',
                on: {
                    input: ({ target }) => emit('update-reminder-value', target.value)
                }
            }),
            h('select', {
                class: 'time-unit-select',
                value: reminderUnit,
                on: {
                    change: ({ target }) => emit('update-reminder-unit', target.value)
                }
            }, units.map(unit => 
                h('option', { value: unit }, [unit])
            ))
        ])
    ])
}

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

function CreateTodo({ currentTodo, searchQuery, timeValue, timeUnit, showTimePicker, reminderValue, reminderUnit, showReminderPicker }, emit, helpers) {
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

    const calculateReminderTime = () => {
        if (!reminderValue || reminderValue <= 0) return null
        const value = parseInt(reminderValue)
        let milliseconds = 0
        switch (reminderUnit) {
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
        if (currentTodo.length < 3) {
            console.log('Todo must be at least 3 characters')
            return
        }
        
        const id = localStorage.getItem('user_id') || ''
        if (!id) {
            console.error('No user_id found in localStorage')
            emit('add-todo-failure', 'User ID not found. Please log in again.')
            return
        }

        const dueTime = calculateDueTime()
        const reminderTime = calculateReminderTime()

        clearTimeout(searchTimer)

        try {
            const payload = {
                user_id: id,
                content: currentTodo,
                due_time: dueTime ? dueTime.toISOString() : null,
                reminder_time: reminderTime ? reminderTime.toISOString() : null,
            }

            console.log('Submitting todo with payload:', payload)
            
            const data = await helpers.api.post('http://localhost:8081/user/todo', payload)
            console.log('Response received:', data)

            if (data && data.data) {
                if (typeof data.data === 'string') {
                    emit('add-todo-failure', data.data)
                } else {
                    const todoObj = {
                        ...data.data,
                        due_time: parseMaybeDate(data.data.due_time),
                        reminder_time: parseMaybeDate(data.data.reminder_time),
                    }
                    emit('add-todo-success', todoObj)
                }
            } else {
                emit('add-todo-failure', 'Invalid response from server')
            }
        } catch (err) {
            console.error('Error saving todo:', err)
            emit('add-todo-failure', err.message || 'Failed to save todo')
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
            console.error('Error searching todo:', err)
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

    const formatReminder = () => {
        if (!reminderValue || reminderValue <= 0) return ''
        return `${reminderValue} ${reminderUnit}`
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
                class: 'reminder-button',
                on: { click: () => emit('toggle-reminder-picker') },
            }, [
                reminderValue ? `🔔 ${formatReminder()}` : '🔔 Reminder'
            ]),
            reminderValue ? h('button', {
                class: 'clear-time-button',
                on: { click: () => emit('clear-reminder-input') },
            }, ['×']) : null,
            h('button', {
                disabled: currentTodo.length < 3,
                on: { click: submitTodo },
            }, ['Add']),
        ]),
        showTimePicker ? TimePicker({ timeValue, timeUnit }, emit) : null,
        showReminderPicker ? ReminderPicker({ reminderValue, reminderUnit }, emit) : null,
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
        try {
            const due_time = isValidDate(todo.due_time) ? todo.due_time.toISOString() : (todo.due_time || null)
            const reminder_time = isValidDate(todo.reminder_time) ? todo.reminder_time.toISOString() : (todo.reminder_time || null)

            await helpers.api.put(`http://localhost:8081/user/todo`, {
                id: todo.id,
                user_id: todo.user_id,
                content: edit.edited,
                due_time,
                reminder_time,
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

    const dueTime = parseMaybeDate(todo.due_time)
    const isSentinel = dueTime === null

    const timeRemaining = isSentinel ? null : dueTime.getTime() - Date.now()
    const countdown = timeRemaining !== null ? formatCountdown(timeRemaining) : ''

    let reminderDisplay = ''
    if (todo.reminder_time) {
        const rt = parseMaybeDate(todo.reminder_time)
        if (isValidDate(rt)) {
            const timeStr = rt.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
            const now = Date.now()
            const hasTriggered = rt.getTime() <= now
            reminderDisplay = hasTriggered ? `Reminded at ${timeStr}` : `Reminder at ${timeStr}`
        }
    }

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
                class: 'todo-text',
                on: { dblclick: () => emit('start-editing-todo', i) }
            }, [todo.content]),

            countdown ? h('span', {
                class: timeRemaining <= 0 ? 'countdown expired' : 'countdown'
            }, [countdown]) : null,

            reminderDisplay ? h('div', { class: 'reminder-info' }, [
                h('span', { class: 'reminder-display' }, [reminderDisplay])
            ]) : null,

            !isHistory ? h('button', {
                on: { click: deleteTodo }
            }, ['Done']) : null,
        ])
}

function TodoList({ todos, edit, isHistory }, emit, helpers) {
    if (!todos || todos.length === 0) {
        return h('div', { class: 'empty-state' }, [
            isHistory ? 'No archived items found.' : 'No tasks yet. Add one above!'
        ])
    }
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
            const parsed = data.data.map(t => ({ ...t, reminder_time: parseMaybeDate(t.reminder_time), due_time: parseMaybeDate(t.due_time) }))
            emit('load-todos-success', parsed)
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
            }, ["Login"])] )
        )
    }

    latestStateRef = state

    const path = window.location.pathname.replace(/\/+$|\/$/g, '')
    const isHistoryPath = path === '/history'
    const MAX_LOAD_ATTEMPTS = 3
    const userName = state.user_name

    const loadPreviousTodos = async () => {
        const id = localStorage.getItem('user_id') || ''

        try {
            console.log('load previous todos')
            const data = await helpers.api.get(`http://localhost:8081/user/history/${id}`)

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

    if (isHistoryPath && !state.isHistory) {
        setTimeout(() => loadPreviousTodos(), 0)
    } else if (!isHistoryPath && (state.isHistory || !state.todosLoaded)) {
        if ((state.loadAttempts || 0) < MAX_LOAD_ATTEMPTS) {
            setTimeout(() => {
                if (state.isHistory) emit('load-todos-success', []);
                emit('increment-load-attempt');
                loadTodos(emit, helpers);
            }, 0);
        }
    }

    if (reminderCheckInterval === null) {
        reminderCheckInterval = setInterval(() => {
            const now = Date.now()
            const s = latestStateRef || state || { todos: [], activeReminders: [] }
            const todosToCheck = Array.isArray(s.todos) ? s.todos : []

            todosToCheck.forEach(todo => {
                const rt = parseMaybeDate(todo.reminder_time)
                if (!isValidDate(rt)) return

                const timeUntilReminder = rt.getTime() - now

                if (timeUntilReminder <= 1000 && timeUntilReminder > -500) {
                    const active = Array.isArray(s.activeReminders) ? s.activeReminders : []
                    const isAlreadyShowing = active.some(r => r.id === todo.id)
                    if (!isAlreadyShowing) {
                        console.log('🔔 REMINDER TRIGGERED FOR:', todo.content)
                        emit('add-reminder-notification', todo)
                    }
                }
            })
        }, 1000)
    }

    const hasUrgentTodo = state.todos.some(todo => {
        if (!todo.due_time) return false
        const dueTime = parseMaybeDate(todo.due_time)
        if (!isValidDate(dueTime)) return false
        const timeRemaining = dueTime.getTime() - Date.now()
        return timeRemaining > -6000 && timeRemaining < 3600000
    })

    setTimeout(() => {
        emit('tick')
    }, hasUrgentTodo ? 1000 : 60000)

    return hFragment([
        ReminderNotifications({ activeReminders: state.activeReminders }, emit),
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
                h('h3', {}, [`Hello ${userName}`])
            ]),
            h('div', {}, [
                h('button', {
                    class: 'dropdown-btn',
                    on: {
                        click: (e) => {
                            e.preventDefault()
                            helpers.navigate('/history')
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
            h('h1', {}, [isHistoryPath ? 'History Archive' : 'My TODOs']),
            !isHistoryPath ? CreateTodo(state, emit, helpers) : null,
            (!state.todosLoaded && !state.isHistory && !isHistoryPath)
                ? h('p', {}, ['Loading...'])
                : TodoList({ ...state }, emit, helpers),
        ]),
        h('footer', {}, ['Powered by Kood/Sisu'])
    ])
}