// 5.1.3 The dispatcher
// Small pub/sub + "after" handler system used by the framework to:
//  - register reducers/handlers for specific commands (subscribe)
//  - register global handlers that run after every dispatch (afterEveryCommand)
//  - dispatch commands (dispatch) which runs relevant handlers then the after handlers
export class Dispatcher {
    // map commandName -> [handler, ...]
    #subs = new Map()

    // array of handlers that run after every dispatch (e.g. render)
    #afterHandlers = []

    // Subscribe a handler to a specific command name.
    // Returns an unsubscribe function that removes this handler.
    subscribe(commandName, handler) {
        if (!this.#subs.has(commandName)) {
            // create handlers array for this command if missing
            this.#subs.set(commandName, [])
        }

        const handlers = this.#subs.get(commandName)

        // avoid registering the same handler twice
        if (handlers.includes(handler)) {
            return () => { }
        }

        handlers.push(handler)

        // return unsubscribe function
        return () => {
            const idx = handlers.indexOf(handler)
            handlers.splice(idx, 1)
        }
    }

    // Register a handler to run after every dispatch.
    // Useful for actions that should run on every change (e.g. re-render).
    // Returns an unsubscribe function.
    afterEveryCommand(handler) {
        this.#afterHandlers.push(handler)

        return () => {
            const idx = this.#afterHandlers.indexOf(handler)
            this.#afterHandlers.splice(idx, 1)
        }
    }

    // Dispatch a command:
    // 1) run all handlers subscribed to commandName with the payload
    // 2) then run all afterHandlers (no args)
    dispatch(commandName, payload) {
        if (this.#subs.has(commandName)) {
            // call each handler for this command with the payload
            this.#subs.get(commandName).forEach((handler) => handler(payload))
        } else {
            // helpful warning during development when no reducer/handler exists
            console.warn(`No handlers for command: ${commandName}`)
        }

        // run global after handlers (e.g. render)
        this.#afterHandlers.forEach((handler) => handler())
    }
}