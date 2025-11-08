import { destroyDOM } from './destroy-dom.js'
import { Dispatcher } from './dispatcher.js'
import { mountDOM } from './mount-dom.js'
import { patch } from './patch.js'

export function createApp({ state, view, reducers = {} }) {
    let parentEl = null
    let vdom = null

    const dispatcher = new Dispatcher()
    const subscriptions = [dispatcher.afterEveryCommand(renderApp)]

    function emit(eventName, payload) {
        dispatcher.dispatch(eventName, payload)
    }

    for (const actionName in reducers) {
        const reducer = reducers[actionName]

        const subs = dispatcher.subscribe(actionName, (payload) => {
            state = reducer(state, payload)
        })

        subscriptions.push(subs)
    }

    function renderApp() {
        const newVdom = view(state, emit);
        if (!vdom) {
            vdom = newVdom;
            mountDOM(vdom, parentEl);
        } else {
            patch(vdom, newVdom, parentEl);
            vdom = newVdom;
        }
    }


    return {
        mount(_parentEl) {
            parentEl = _parentEl
            renderApp()
        },

        unmount() {
            destroyDOM(vdom)
            vdom = null
            subscriptions.forEach((unsubscribe) => unsubscribe())
        },
    }
}

