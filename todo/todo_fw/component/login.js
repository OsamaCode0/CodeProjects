import { createApp, h } from "../dist/frontend-framework.js"
// import './login.css'

const state = {
    currentName: '',
    currentPassword: '',
    isLoggedIn: false,
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
    'login': (state) => {
        // temporary this is hardcoded.. we will wire this soon to the backend.. with few steps..
        const isValid = state.currentName === 'admin' && state.currentPassword === '1234'
        return {
            ...state,
            isLoggedIn: isValid,
        }
    },
}

export function LoginPage({currentName, currentPassword, isLoggedIn}, emit) {
    return h('form', { class: 'login-form', action: 'login' }, [
        h('h2', { class: 'title' }, ['Login']),
        h('label', { htmlFor: 'email', class: 'label-email' }, ['email']),
        h('input', { 
            type: 'text',
            id: 'email',
            class: 'input-email',
            value: currentName,
            on: {
                input: ({target}) => emit('update-name', target.value),
            },
        }),
        h('label', { htmlFor: 'password', class: 'label-password' }, ['password']),
        h('input', { 
            type: 'password',
            id: 'password',
            class: 'input-password',
            value: currentPassword,
            on: {
                input: ({target}) => emit('update-password', target.value)
            }
        }),
        h('button', {
            class: 'login-button',
            on: {
                click: (e) => {
                    e.preventDefault()
                    emit('login')
                },
            },
        }, ['Login']),
        isLoggedIn ? h('p', {}, ['Logged In!']) : h('p', {}, ['Not Logged In']),
    ])
}

createApp({state, reducers, view: LoginPage}).mount(document.body)