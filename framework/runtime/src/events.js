/**
 * Centralized event delegation for the framework.
 *
 * Rationale:
 * - Instead of attaching one DOM listener per virtual node, we attach a single
 *   global listener per event type on document and dispatch to handlers
 *   registered for specific elements. This reduces the number of real DOM
 *   listeners and makes adding/removing listeners cheaper.
 *
 * Data structures:
 * - delegated: Map<HTMLElement, Map<eventName, handler>>
 *     For each mounted element we keep a Map of eventName -> handler.
 *     This allows O(1) lookup of a handler for a given element and event.
 *
 * - globalHandlers: Map<eventName, globalFn>
 *     For each event type we attach exactly one global function to document.
 *     The function walks the event path and invokes any registered handler.
 */
const delegated = new Map() // Map<HTMLElement, Map<eventName, handler>>
const globalHandlers = new Map() // Map<eventName, globalFn>

// 4.1.5 Adding eventlistener
/**
 * Register a handler for a specific element and event type.
 *
 * - eventName: string like 'click', 'input', etc.
 * - handler: function(event) { ... }  (the original handler provided by the user)
 * - el: the DOM element associated with the vdom node
 *
 * This stores the handler in delegated and ensures a single global listener
 * for the event type exists on document.
 *
 * Returns the handler (kept so callers can store it on vdom.listeners).
 */
export function addEventListener(eventName, handler, el) {
    if (!el) throw new Error('addEventListener: element is required')

    // ensure a per-element map exists and register the handler
    if (!delegated.has(el)) delegated.set(el, new Map())
    delegated.get(el).set(eventName, handler)

    // ensure the global document-level listener for this event type exists
    ensureGlobalListener(eventName)

    // return the handler reference (used later by removeEventListeners)
    return handler
}

// 4.1.5 Adding eventlisteners
/**
 * Convenience to register multiple listeners at once from a props.on object.
 * - listeners: { click: fn, input: fn, ... }
 * - el: DOM element
 *
 * Returns an object mapping eventName -> handler (used as vdom.listeners).
 */
export function addEventListeners(listeners = {}, el) {
    const addedListeners = {}

    Object.entries(listeners).forEach(([eventName, handler]) => {
        const listener = addEventListener(eventName, handler, el)
        addedListeners[eventName] = listener
    })

    return addedListeners;
}

// 4.2.2 Destroying an element - remove eventlisteners
/**
 * Remove listeners previously added for an element.
 *
 * - listeners: the object returned by addEventListeners (eventName -> handler)
 * - el: DOM element
 *
 * For each event type removed we also check whether any other element still
 * uses that event type; if not, we remove the single global listener from document.
 */
export function removeEventListeners(listeners = {}, el) {
    const map = delegated.get(el)
    if (!map) return

    Object.keys(listeners).forEach((eventName) => {
        // remove the handler entry for this element
        if (map.has(eventName)) map.delete(eventName)

        // If no element keeps this event type, remove the global listener
        let stillUsed = false
        for (const m of delegated.values()) {
            if (m.has(eventName)) {
                stillUsed = true
                break
            }
        }

        if (!stillUsed) {
            const fn = globalHandlers.get(eventName)
            if (fn) {
                // remove the global listener from document and drop it from the map
                document.removeEventListener(eventName, fn, false)
                globalHandlers.delete(eventName)
            }
        }
    })

    // if this element has no more listeners, remove its entry
    if (map.size === 0) delegated.delete(el)
}

/**
 * Ensure there's a single global listener on document for the given event type.
 *
 * The global handler:
 * - Computes the event path (uses composedPath when available to support shadow DOM)
 * - Walks the path from target up to document, checking for a registered handler
 *   on each node (delegated.get(node).get(event.type))
 * - Invokes the first matching handler(s). Handlers can call event.stopPropagation()
 *   which sets event.cancelBubble -> we honor that and stop further delivery.
 *
 * Notes:
 * - We attach the global listener in the bubble phase (capture=false). Change to
 *   capture=true if capture-phase delivery is desired.
 * - Handlers are invoked with the original event object. Because the handler
 *   stored is the user function, removeEventListeners can remove it by reference.
 */
function ensureGlobalListener(eventName) {
    if (globalHandlers.has(eventName)) return

    const globalFn = (event) => {
        // walk composedPath if available (handles shadow DOM) else bubble path
        const path = (typeof event.composedPath === 'function')
            ? event.composedPath()
            : (function () {
                const p = []
                // manual path: start from target and walk up parentElement chain
                let node = event.target
                while (node) {
                    p.push(node)
                    node = node.parentElement
                }
                return p
            })()

        // Walk the path and call registered handlers for this event type
        for (const node of path) {
            if (!node) continue
            const map = delegated.get(node)
            if (!map) continue
            const handler = map.get(event.type)
            if (handler) {
                try {
                    handler(event)
                } catch (err) {
                    // don't halt delegation loop on handler errors; log for debugging
                    console.error('delegated handler error', err)
                }
                // If a handler called stopPropagation(), the event.cancelBubble flag
                // will be true. Honor that and stop delivering to further nodes.
                if (event.cancelBubble) return
            }
        }
    }

    // attach single global listener for this event type on document
    document.addEventListener(eventName, globalFn, false)
    globalHandlers.set(eventName, globalFn)
}
