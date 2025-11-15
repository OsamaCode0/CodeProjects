import { destroyDOM } from './destroy-dom.js'
import { Dispatcher } from './dispatcher.js'
import { mountDOM } from './mount-dom.js'
export { helperMountDOM } from './mount-dom.js'
// 7.1.3 Change in rendering
import { patchDOM } from './patch-dom.js'
export { helperPatchDOM } from './patch-dom.js'


// 5.2.2 The application instance's renderer
export function createApp({ state, view, reducers = {}, helpers = {} }) {
    let parentEl = null
    let vdom = null
    let isMounted = false

    const dispatcher = new Dispatcher()

    // register renderApp to run after every dispatched command.
    // Dispatcher.afterEveryCommand returns an unsubscribe function which we keep
    // so unmount() can remove it later.
    const subscriptions = [dispatcher.afterEveryCommand(renderApp)]

    // emit triggers dispatcher.dispatch -> runs reducer handlers -> then runs all after handlers
    // because renderApp is registered as an after handler, it will run after each dispatch.
    function emit(eventName, payload) {
        dispatcher.dispatch(eventName, payload)
    }

    for (const actionName in reducers) {
        const reducer = reducers[actionName]

        const subs = dispatcher.subscribe(actionName, (payload) => {
            // reducer updates local state variable on dispatch
            state = reducer(state, payload)
        })

        subscriptions.push(subs)
    }

    // NOTE: renderApp is a function declaration so it's hoisted and can be referenced
    // above when we register it with dispatcher.afterEveryCommand.
    //
    // renderApp's job:
    //  - call view(state, emit, helpers) to produce the new virtual DOM
    //  - patch the current vdom into the new one, keeping DOM in sync
    //
    // It is invoked automatically after every dispatcher.dispatch(...) because we
    // registered it as an "after" handler. The initial render is done in mount().
    function renderApp() {
        const newVdom = view(state, emit, helpers)
        vdom = patchDOM(vdom, newVdom, parentEl)
    }


    return {
        mount(_parentEl) {
            if (isMounted) {
                throw new Error(`The application is already mounted`)
            }
            parentEl = _parentEl
            // Initial render: call view directly and mount the returned vdom.
            // After this initial mount, future renders will be triggered by dispatch()
            // which runs reducers and then the after handlers (renderApp).
            vdom = view(state, emit, helpers)
            mountDOM(vdom, parentEl)

            isMounted = true
        },

        unmount() {
            // remove DOM and unsubscribe all handlers (including the after handler)
            destroyDOM(vdom)
            vdom = null
            subscriptions.forEach((unsubscribe) => unsubscribe())

            isMounted = false
        },

        // expose emit so caller code can dispatch events (keeps backwards compatibility)
        emit,
    }
}

