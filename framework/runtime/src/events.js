export function addEventListener(eventHame, handler, el) {
    el.addEventListener(eventHame, handler)
    return handler
}

export function addEventListeners(listeners = {}, el) {
    const addedListeners = {}

    Object.entries(listeners).forEach(([eventName, handler]) => {
        const listener = addEventListener(eventName, handler, el)
        addedListeners[eventName] = listener
    })

    return addedListeners;
}

export function removeEventListeners(listeners = {}, el) {
    Object.entries(listeners).forEach(([eventName, handler]) => {
        el.removeEventListener(eventName, handler)
    })
}