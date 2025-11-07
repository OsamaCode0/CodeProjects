import { createApp, h, hString } from "../../framework/runtime/dist/frontend-framework.js";

createApp({
    state: 0,

    reducers: {
        add: (state, amount) => state + amount,
    },

    view: (state, emit) =>
        h(
            'button',
            { on: { click: () => emit('add', 1) } },
            [hString(String(state))]
        ),
}).mount(document.body)