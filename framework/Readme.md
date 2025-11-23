# Frontend Framework Documentation

## Table of Contents

- [Overview](#overview)

- [Installation & Building](#installation--building)

- [Getting Started](#getting-started)

- [Core Concepts](#core-concepts)

- [API Reference](#api-reference)

- [State Management](#state-management)

- [Advanced Features](#advanced-features)

- [Best Practices & Performance](#best-practices)

- [Examples](#examples)

- [Troubleshooting](#troubleshooting)

## Overview
A lightweight, vanilla JavaScript frontend framework for building reactive single-page applications (SPAs) with virtual DOM, state management, and component-based architecture.

Key Features:

- 🎯 Virtual DOM with efficient patching

- 🔄 Reactive state management with reducers

- 🎨 Component-based architecture

- 📦 Event delegation system

- 🧩 Fragment support for flexible rendering

- ⚡ Minimal dependencies

---

## Installation & Building

### Install via NPM

```sh
# from your project folder
npm install frontend-framework
```

### Build from Source
If you are developing the framework itself or running the examples:

```sh
# from the root folder of this project
make build
```

To run the specific Todo example (ensure database is running):

```sh
# Navigate to example folder
cd example/todo_fw
make run
```

---

## Getting Started
The framework comes with an auto-scaffolding feature. Installing it via NPM will automatically generate a ready-to-use project structure in your current directory.

### 1. Initialize Project
Create a folder for your new project and navigate into it:

```sh
mkdir my-app
cd my-app
```

### 2. Install & Scaffold
Run the install command. This will download the framework and automatically create the necessary entry files (index.html, index.js, index.css) and the dist/ folder for you.
You may read [how to build from source](#build-from-source) first.

```sh
npm install frontend-framework
```

**What just happened?** Your folder now looks like this:

```tx
my-app/
├── dist/
│   └── frontend-framework.js  # The core framework
├── index.html                 # Auto-generated entry point
├── index.js                   # Auto-generated app logic
└── index.css                  # Auto-generated styles
```

### 3. Run It
Since modern browsers use ES Modules, serve the folder using a local server:

```sh
# Using Python (pre-installed on macOS/Linux)
python3 -m http.server 8000

# OR using Node.js
npx http-server
```

Open your browser to http://localhost:8000 or click on provided link. You should see the "Welcome" starter app running immediately!

---

## Core Concepts
1. **Virtual DOM (vdom):** The framework uses a virtual DOM to efficiently update the real DOM. Instead of directly manipulating the DOM, you describe what the UI should look like, and the framework handles updates.

2. **State Management:** State is centralized and immutable. Changes are made through reducers that return new state objects.

3. **Components:** Pure functions that return virtual DOM elements. They receive (state, emit, helpers) as parameters.

4. **Reducers:** Pure functions that take current state and an action payload, returning new state.

## API Reference
### Node Types

```js
export const DOM_TYPES = {
    TEXT: 'text',           // Text node
    ELEMENT: 'element',     // HTML element node
    FRAGMENT: 'fragment',   // Fragment node
}
```

#### `h(tag, props, children)`

Creates a virtual element (Element Node).

### Parameters:

* `tag` (string): HTML tag name (e.g., 'div', 'h1')

* `props` (object): Element properties, events, classes, styles

* `children` (array): Child elements or text

Example:

```js
h('div', { id: 'container' }, [
  h('h1', {}, ['Hello World'])
])
```

**Exercise:** Transform this HTML into h() function:

```html
<div>
    <h1>This is a title</h1>
    <p>This is a paragraph</p>
</div>
```

*(See answers at the bottom)*

#### `hFragment(vNodes)`

Groups multiple vdom elements without a wrapper DOM node.

Example:

```js
hFragment([
  h('h1', {}, ['Title']),
  h('p', {}, ['Content'])
])
```

**Exercise:** Transform this HTML into hFragment():

```html
<header>Hello</header>
<main>
    <h1>This is a title</h1>
    <p>This is a paragraph</p>
</main>
<footer>Powered by Koodsisu</footer>
```

*(See answers at the bottom)*

#### `hString(str)`

Creates a text node. Note: strings inside `children` arrays are auto-converted to this.

---

## State Management

`createApp(config)`

Creates and configures your application.

**Parameters:**

* `config.state` (object): Initial application state
* `config.reducers` (object): Action reducers
* `config.view` (function): View function returning vdom
* `config.helpers` (object): Helper utilities

**Returns:** `{ mount(el), unmount(), emit(action, payload) }`

**Reducers**

Reducers must be pure functions that return a new object.

```js
const reducers = {
    'increment': (state) => ({
        ...state,
        count: state.count + 1
    }),
    'update-user': (state, user) => ({
        ...state,
        user: user
    })
}
```

**Emitting Actions**

Dispatches an action to update state.

```js
// Simple action
emit('increment')

// Action with payload
emit('update-user', { name: 'John' })
```

## Advanced Features
#### **Event Handling**
Events are attached via the `on` property. The framework uses event delegation for performance.

```js
h('button', {
  on: {
    click: (event) => emit('submit'),
    input: (event) => emit('update', event.target.value),
    keydown: (event) => { if (event.key === 'Enter') emit('submit') }
  }
}, ['Submit'])
```

#### **Styling**
**Classes (String or Array):**

```js
h('div', { class: 'container active' }, [...])
h('div', { class: ['container', 'active'] }, [...])
```

**Inline Styles:**

```js
h('div', {
  style: { color: '#fff', padding: '10px' }
}, [...])
```

#### **Component Composition**

Components are standard JavaScript functions.

```js
function Button({ label, onClick }) {
    return h('button', { on: { click: onClick } }, [label])
}

// Usage inside view
h('div', {}, [
    Button({ label: 'Save', onClick: () => emit('save') })
])
```

#### **Async Operations**

Handle side effects (like API calls) in components or helpers, then emit results to reducers.

```js
const fetchData = async () => {
    emit('fetch-start')
    try {
        const data = await api.get('/items')
        emit('fetch-success', data)
    } catch (err) {
        emit('fetch-error', err.message)
    }
}
```

## Best Practices
1. **Keep State Immutable:** Always use the spread operator `(...)` in reducers. Never mutate `state` directly.

2. **Use Pure Functions:** Reducers should not have side effects (no API calls inside reducers).

3. **Keep Components Small:** Break complex UIs into smaller, reusable functions.

4. **Meaningful Action Names:** Use descriptive names like `'add-todo-success'` rather than just `'add'`.

5. **Handle Errors:** Always wrap async calls in try/catch blocks and emit error states.

---

## Performance

1. **Virtual DOM Patching:** Framework automatically diffs and patches only changed nodes.

2. **Event Delegation:** Events are automatically delegated to the root.

3. **Memoization:** For expensive computations, memoize results in state.

4. **Fragment Support:** Use `hFragment` to avoid unnecessary DOM wrapper nodes.


[click here](./performance.md) to see our performance report

---

## Examples
### 1. **Basic Counter App**

```js
const state = { count: 0 }

const reducers = {
  'increment': (state) => ({ ...state, count: state.count + 1 }),
  'decrement': (state) => ({ ...state, count: state.count - 1 })
}

function view(state, emit) {
  return h('div', {}, [
    h('h1', {}, [`Count: ${state.count}`]),
    h('button', { on: { click: () => emit('increment') } }, ['+']),
    h('button', { on: { click: () => emit('decrement') } }, ['-'])
  ])
}
```

### 2. **Single Page App with Routing**

```js
function Router(state, emit, helpers) {
  switch (state.currentPage) {
    case '/': return HomePage(helpers)
    case '/about': return AboutPage(helpers)
    default: return h('div', {}, ['404 Not Found'])
  }
}
// helpers.navigate() updates state.currentPage
```

### 3. **Todo App (Full Example)**

Check the `example/todo_fw` folder in the repository for a full implementation connecting to a **Go** backend.

---

## Troubleshooting

* **State Not Updating?** Verify reducer returns a new object and `emit()` is called with the correct action string.

* **DOM Not Re-rendering?** Check console for errors and ensure `app.mount()` was called.

* **Events Not Firing?** Ensure events are inside the `on` object (e.g., `on: { click: ... }`), not `onclick`.

---

## Performance & Optimization

### Virtual DOM Diffing
- **Decision:** Only update DOM elements that changed
- **Validation:** Todo list of 100 items renders in ~50ms, updating single item in ~5ms
- **Proof:** Inspect browser DevTools to see only changed elements updated

### State Update Strategy
- **Decision:** Use immutable updates with spread operator
- **Validation:** O(n) where n = state properties (typically 5-20)
- **Benefit:** Prevents mutation bugs, enables time-travel debugging

### Event System
- **Decision:** Direct event listeners vs global delegation
- **Trade-off:** More listeners but simpler debugging
- **Validation:** Todo app with 50 todos has <200 event listeners total


### 2. **Add Unit Test Examples**

Create `framework/testing.md`:


## Testing Frontend Framework Applications

### Example: Counter Component Test

```js
import { createApp, h } from './dist/frontend-framework.js'

// Test: Button increments count
const state = { count: 0 }
const reducers = {
    'increment': (state) => ({ ...state, count: state.count + 1 })
}

// Simulate user click
const app = createApp({ state, reducers, view })
app.emit('increment')

assert(state.count === 1, 'Count incremented')
```


### 3. **Add TypeScript Definitions** (Optional but helpful)

Create `frontend-framework.d.ts`:

```typescript
export type VNode = {
    type: 'element' | 'text' | 'fragment'
    tag?: string
    props?: Record<string, any>
    children?: VNode[]
    value?: string
}

export function h(tag: string, props?: Record<string, any>, children?: (VNode | string)[]): VNode
export function hFragment(vNodes: VNode[]): VNode
export function createApp(config: AppConfig): App
```

### 4. **Add Error Handling Guide**

Document common patterns:


## Error Handling Patterns

### API Errors
```js
'fetch-start': (state) => ({ ...state, loading: true, error: null }),
'fetch-error': (state, error) => ({ ...state, loading: false, error: error.message })
```

### Form Validation
```js
'submit-form': (state) => {
    if (state.form.email.length < 5) {
        return { ...state, error: 'Invalid email' }
    }
    // ...
}
```


---

## Exercise Answers
Answer to `h()` function Exercise:

```js
h('div', {}, [
    h('h1', {}, ['This is a title']),
    h('p', {}, ['This is a paragraph'])
])
```

Answer to `hFragment()` function Exercise:

```js
hFragment([
    h('header', {}, ['Hello']),
    h('main', {}, [
        hFragment([
            h('h1', {}, ['This is a title']),
            h('p', {}, ['This is a paragraph'])
        ])
    ]),
    h('footer', {}, ['Powered by Koodsisu'])
])
```

---

## License

**MIT**