import { h } from "../dist/frontend-framework.js";

export const registerState = {
    reg_name: '',
    reg_email: '',
    reg_password: '',
    reg_loading: false,
    reg_success: false,
    reg_error: null,
};

export const registerReducers = {
    'update-name': (state, reg_name) => ({ ...state, reg_name }),
    'update-email': (state, reg_email) => ({ ...state, reg_email }),
    'update-password': (state, reg_password) => ({ ...state, reg_password }),

    'start-register': (state) => ({
        ...state,
        reg_loading: true,
        reg_error: null,
    }),

    'register-success': (state) => ({
        ...state,
        reg_loading: false,
        reg_success: true,
    }),

    'register-failure': (state, error) => ({
        ...state,
        reg_loading: false,
        reg_success: false,
        reg_error,
    }),
};

export function RegisterPage(state, emit, helpers) {

    const submit = async (e) => {
        e.preventDefault();

        const { reg_name, reg_email, reg_password } = state;

        if (!reg_name || !reg_email || !reg_password) {
            emit('register-failure', 'All fields required');
            return;
        }

        emit('start-register');

        try {
            const data = await helpers.api.post('http://localhost:8081/register', {
                name: reg_name,
                email: reg_email,
                password: reg_password,
            });

            console.log('Register success', data);
            emit('register-success');

            helpers.navigate('/login');
        } catch (err) {
            console.error(err);
            emit('register-failure', err.message || "Network error");
        }
    };

    return h("form", { class: "login-form", on: { submit } }, [
        h('h2', { class: 'title' }, ['Register']),

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
                type: 'submit',
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
