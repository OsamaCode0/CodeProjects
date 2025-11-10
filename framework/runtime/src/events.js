// 4.1.5 Adding eventlistener
export function addEventListener(eventName, handler, el) {
    function boundHandler(event) {
        handler(event)
    }
    el.addEventListener(eventName, boundHandler)
    return boundHandler
}

// 4.1.5 Adding eventlisteners
export function addEventListeners(listeners = {}, el) {
    const addedListeners = {}

    Object.entries(listeners).forEach(([eventName, handler]) => {
        const listener = addEventListener(eventName, handler, el)
        addedListeners[eventName] = listener
    })

    return addedListeners;
}

// 4.2.2 Destroying an element - remove eventlisteners
export function removeEventListeners(listeners = {}, el) {
    Object.entries(listeners).forEach(([eventName, handler]) => {
        el.removeEventListener(eventName, handler)
    })
}