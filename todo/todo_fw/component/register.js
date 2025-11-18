import { h } from "../dist/frontend-framework.js";

export const registerState = {
    name: '',
    email: '',
    password: '',
    loading: false,
    success: false,
    error: null,
};

export const registerReducers = {
    'update-name': (state, name) => ({ ...state, name }),
    'update-email': (state, email) => ({ ...state, email }),
    'update-password': (state, password) => ({ ...state, password }),

    'start-register': (state) => ({
        ...state,
        loading: true,
        error: null,
    }),

    'register-success': (state) => ({
        ...state,
        loading: false,
        success: true,
    }),

    'register-failure': (state, error) => ({
        ...state,
        loading: false,
        success: false,
        error,
    }),
};

export function RegisterPage(state, emit, helpers) {

    const submit = async (e) => {
        e.preventDefault();

        const { name, email, password } = state;

        if (!name || !email || !password) {
            emit('register-failure', 'All fields required');
            return;
        }

        emit('start-register');

        try {
            const data = await helpers.api.post('http://localhost:8081/register', {
                name,
                email,
                password,
            });

            console.log('Register success', data);
            emit('register-success');

            helpers.navigate('/login');
        } catch (err) {
            console.error(err);
            emit('register-failure', err.message || "Network error");
        }
    };

    return h("form", { class: "register-form", on: { submit } }, [
        h('h2', { class: 'title' }, ['Register']),

        // Name
        h('label', { htmlFor: 'reg-name', class: 'label-name' }, ['Name: ']),
        h('input', {
            id: 'reg-name',
            type: 'text',
            class: 'input-name',
            placeholder: 'Enter your username',
            value: '',
            on: { input: ({ target }) => emit('update-name', target.value) }
        }),

        // Email
        h('label', { htmlFor: 'reg-email', class: 'label-email' }, ['Email: ']),
        h('input', {
            id: 'reg-email',
            type: 'email',
            class: 'input-email',
            placeholder: 'Enter your email',
            value: '',
            on: { input: ({ target }) => emit('update-email', target.value) }
        }),

        // Password
        h('label', { htmlFor: 'reg-password', class: 'label-password' }, ['Password: ']),
        h('input', {
            id: 'reg-password',
            type: 'password',
            class: 'input-password',
            placeholder: 'Create a password',
            value: '',
            on: { input: ({ target }) => emit('update-password', target.value) }
        }),

        // Buttons
        h('div', { class: 'button-group' }, [
            h('button', {
                type: 'submit',
                disabled: state.loading,
                class: 'register-button'
            }, [
                state.loading ? 'Registering…' : 'Register'
            ]),

            h('button', {
                type: 'button',
                class: 'back-button',
                on: {
                    click: () => helpers.navigate('/')
                }
            }, ['Back']),
        ]),

        state.error
            ? h('p', { class: 'error' }, [state.error])
            : null,

    ].filter(Boolean));
}
