import { createApp, h } from "../dist/frontend-framework.js"
// import './login.css'

const state = {
    currentName: '',
    currentPassword: '',
    isLoggedIn: false,
    loading: false,
    error: null,
}

const reducers = {
    'update-name': (state, name) => ({
        ...state,
        currentName: name,
    }),
    'update-password': (state, password) => ({
        ...state,
        currentPassword: password,
    }),
    'start-login': (state) => ({
        ...state,
        loading: true,
        error: null,
    }),
    'login-success': (state, payload) => ({
        ...state,
        loading: false,
        isLoggedIn: true,
        user: payload.user,
        token: payload.token,
    }),
    'login-failure': (state, errorMessage) => ({
        ...state,
        loading: false,
        isLoggedIn: false,
        error: errorMessage,
    }),
}

export function LoginPage({ currentName, currentPassword, isLoggedIn }, emit) {
    const submit = async (e) => {
        e.preventDefault()
        console.log('submit initiated', currentName, currentPassword)
        if (!currentName || !currentPassword) {
            console.log('not state currentName?')
            emit('login-failure', 'provide email and password')
            return
        }
        emit('start-login')

        try {
            console.log('try fetch submit')
            const res = await fetch('http://localhost:8081/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: currentName,
                    password: currentPassword,
                }),
            })
            if (!res.ok) {
                console.log('res not ok')
                const err = await res.json().catch(() => ({}))
                throw new Error((err.message || 'Login failed'))
            }
            console.log('res ok')
            const data = await res.json()
            console.log('login-success:', data)
            emit('login-success', {
                user: data.data.user_id,
                token: data.data.token,
            })
        } catch {
            emit('login-failure', err.message || 'Network error')
        }
    }
    return h('form', { class: 'login-form', on: { submit: submit } }, [
        h('h2', { class: 'title' }, ['Login']),
        h('label', { htmlFor: 'email', class: 'label-email' }, ['email']),
        h('input', {
            type: 'text',
            id: 'email',
            class: 'input-email',
            value: currentName,
            on: {
                input: ({ target }) => emit('update-name', target.value),
            },
        }),
        h('label', { htmlFor: 'password', class: 'label-password' }, ['password']),
        h('input', {
            type: 'password',
            id: 'password',
            class: 'input-password',
            value: currentPassword,
            on: {
                input: ({ target }) => emit('update-password', target.value)
            }
        }),
        h('button', {
            type: 'submit',
            disabled: state.loading,
            class: 'login-button',
        }, [ state.loading ? 'Loggin in...' : 'Login']),
        state.error ? h('p', { class: 'error' }, [state.error]) : null,
        state.isLoggedIn ? h('p', {}, ['Logged In']) : null,
    ].filter(Boolean))
}

createApp({ state, reducers, view: LoginPage }).mount(document.body)