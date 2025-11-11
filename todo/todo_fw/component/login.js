import { h } from "../dist/frontend-framework.js"

export function Login() {
    return h('form', { class: 'login-form', action: 'login' }, [
        h('input', { type: 'text', name: 'user' }),
        h('input', { type: 'password', name: 'pass' }),
        h('button', { on: { click: login } }, ['Log in'])
    ])
}