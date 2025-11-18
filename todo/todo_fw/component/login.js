import { h } from "../dist/frontend-framework.js"

export const loginState = {
    currentName: '',
    currentPassword: '',
    isLoggedIn: false,
    loading: false,
    error: null,
}

export const loginReducers = {
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
    'login-success': (state, payload) => {
        localStorage.setItem('user_id', payload.user_id)
        localStorage.setItem('token', payload.token)
        return {
            ...state,
            loading: false,
            isLoggedIn: true,
            user_id: payload.user_id,
            token: payload.token,
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
        return h('div', {}, [])
    }
    const { currentName, currentPassword } = state;

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
            const data = await helpers.api.post('http://localhost:8081/login', {
                email: currentName,
                password: currentPassword,
            })

            console.log('login-success', data)
            emit('login-success', {
                user_id: data.data.user_id,
                token: data.data.token,
            })
        } catch (err) {
            console.error('Login error:', err)
            emit('login-failure', err.message || 'Network error')
        }
    }
    return h('form', { class: 'login-form', on: { submit: submit } }, [
       h('button', {
                type: 'submit',
                class: 'back-button',
                on: {
                    click: () => {
                        helpers.navigate('/'); // Navigate to home page
                    },
                },
            }, ['Back']),
        
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

        h('div', { class: 'button-group' }, [
            h('button', {
                type: 'submit',
                disabled: state.loading,
                class: 'login-button',
            }, [state.loading ? 'Loggin in...' : 'Login']),

           /*  h('button', {
                type: 'submit',
                class: 'back-button',
                on: {
                    click: () => {
                        helpers.navigate('/'); // Navigate to home page
                    },
                },
            }, ['Back']), */
        ]),
        
        state.error ? h('p', { class: 'error' }, [state.error]) : h('span', {}, []),
        state.isLoggedIn ? h('p', {}, ['Logged In']) : null,
    ].filter(Boolean))
}