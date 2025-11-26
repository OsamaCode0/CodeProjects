import { h } from "../dist/frontend-framework.js"

export const loginState = {
    currentEmail: '',
    currentPassword: '',
    isLoggedIn: false,
    loading: false,
    error: null,
    user_name: localStorage.getItem('user_name') || 'Guess'
}

export const loginReducers = {
    'update-log-name': (state, email) => ({
        ...state,
        currentEmail: email,
    }),
    'update-log-password': (state, password) => ({
        ...state,
        currentPassword: password,
    }),
    'start-login': (state) => ({
        ...state,
        loading: true,
        error: null,
    }),
    'login-success': (state, payload) => {
        localStorage.setItem('user_id', payload.user_id)
        localStorage.setItem('token', payload.token)
        localStorage.setItem('user_name', payload.user_name)
        return {
            ...state,
            loading: false,
            isLoggedIn: true,
            user_id: payload.user_id,
            token: payload.token,
            user_name: payload.user_name
        }
    },
    'login-failure': (state, errorMessage) => ({
        ...state,
        loading: false,
        isLoggedIn: false,
        error: errorMessage,
    }),
}

export function LoginPage(state, emit, helpers) {
    if (state.isLoggedIn) {
        console.log("redirect to /todo")
        helpers.navigate('/todo');
    }
    const { currentEmail, currentPassword } = state;

    const submit = async (e) => {
        e.preventDefault()
        console.log('submit initiated', currentEmail, currentPassword)
        if (!currentEmail || !currentPassword) {
            console.log('not state currentEmail?')
            emit('login-failure', 'provide email and password')
            return
        }
        emit('start-login')

        try {
            console.log('try fetch submit')
            const data = await helpers.api.post('http://localhost:8081/login', {
                email: currentEmail,
                password: currentPassword,
            })

            console.log('login-success', data)
            emit('login-success', {
                user_id: data.data.user_id,
                token: data.data.token,
                user_name: data.data.name ?? data.data.email,
            })
        } catch (err) {
            console.error('Login error:', err)
            emit('login-failure', err.message || 'Network error')
        }
    }
    return h('form', { class: 'login-form', on: { submit: submit } }, [
       /* h('button', {
                type: 'submit',
                class: 'back-button',
                on: {
                    click: () => {
                        helpers.navigate('/'); // Navigate to home page
                    },
                },
            }, ['Back']), */
        
        h('h2', { class: 'title' }, ['Login']),
        
        h('label', { htmlFor: 'email', class: 'label-email' }, ['Email: ']),
        h('input', {
            type: 'text',
            id: 'email',
            class: 'input-email',
            placeholder: 'Enter your email',
            value: currentEmail,
            on: {
                input: ({ target }) => emit('update-log-name', target.value),
            },
        }),

        h('label', { htmlFor: 'password', class: 'label-password' }, ['Password: ']),
        h('input', {
            type: 'password',
            id: 'password',
            class: 'input-password',
            placeholder: 'Create a password',
            value: currentPassword,
            on: {
                input: ({ target }) => emit('update-log-password', target.value)
            }
        }),

        h('div', { class: 'button-group' }, [
            h('button', {
                type: 'submit',
                disabled: state.loading,
                class: 'login-button',
            }, [state.loading ? 'Loggin in...' : 'Login']),

            h('button', {
                type: 'submit',
                class: 'back-button',
                on: {
                    click: () => {
                        helpers.navigate('/'); // Navigate to home page
                    },
                },
            }, ['Back']),
        ]),
        
        state.error ? h('p', { class: 'error' }, [state.error]) : h('span', {}, []),
        state.isLoggedIn ? h('p', {}, ['Logged In']) : null,
    ].filter(Boolean))
}