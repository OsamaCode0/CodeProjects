# Frontend Framework Documentation

## Table of Contents
1. Overview
2. [Installation](#installation)
3. Core Concepts
4. API Reference
5. Examples
6. Advanced Features
7. [Get Started](#get-started)

---

## Overview

A lightweight, vanilla JavaScript frontend framework for building reactive single-page applications (SPAs) with virtual DOM, state management, and component-based architecture.

**Key Features:**
- 🎯 Virtual DOM with efficient patching
- 🔄 Reactive state management with reducers
- 🎨 Component-based architecture
- 📦 Event delegation system
- 🧩 Fragment support for flexible rendering
- ⚡ Minimal dependencies

---

## Installation

```bash
# from your project folder
npm install frontend-framework
```

Import in your project:
```javascript
import { createApp, h, hFragment, hString } from './dist/frontend-framework.js'
```

---

## Core Concepts

### 1. Virtual DOM (vdom)

The framework uses a virtual DOM to efficiently update the real DOM. Instead of directly manipulating the DOM, you describe what the UI should look like, and the framework handles updates.

### 2. State Management

State is centralized and immutable. Changes are made through **reducers** that return new state objects.

### 3. Components

Components are pure functions that return virtual DOM elements. They receive `(state, emit, helpers)` as parameters.

### 4. Reducers

Reducers are pure functions that take current state and an action payload, returning new state:
```javascript
const reducer = (state, payload) => ({
  ...state,
  // updated state
})
```

---

## API Reference

### `h(tag, props, children)`

Creates a virtual element.

**Parameters:**
- `tag` (string): HTML tag name
- `props` (object): Element properties, events, classes, styles
- `children` (array): Child elements or text

**Returns:** vdom element

**Example:**
```javascript
h('div', { class: 'container' }, [
  h('h1', {}, ['Hello World']),
  h('p', { class: 'text' }, ['This is a paragraph'])
])
```

### `hFragment(vNodes)`

Groups multiple vdom elements without a wrapper. Useful when you don't want an extra DOM node.

**Parameters:**
- `vNodes` (array): Array of vdom elements

**Returns:** fragment vdom element

**Example:**
```javascript
hFragment([
  h('h1', {}, ['Title']),
  h('p', {}, ['Content'])
])
```

### `hString(str)`

Creates a text node (rarely used directly, strings are auto-converted).

### `createApp(config)`

Creates and configures your application.

**Parameters:**
- `config.state` (object): Initial application state
- `config.reducers` (object): Action reducers
- `config.view` (function): View function returning vdom
- `config.helpers` (object): Helper utilities

**Returns:** app object with `mount()`, `unmount()`, `emit()`

**Example:**
```javascript
const app = createApp({
  state: { count: 0 },
  reducers: {
    'increment': (state) => ({ ...state, count: state.count + 1 })
  },
  view: (state, emit) => h('div', {}, [...]),
  helpers: { navigate: (path) => {...} }
})

app.mount(document.body)
```

---

## Examples

### Basic Counter App

```javascript
import { createApp, h } from './dist/frontend-framework.js'

const state = {
  count: 0
}

const reducers = {
  'increment': (state) => ({
    ...state,
    count: state.count + 1
  }),
  'decrement': (state) => ({
    ...state,
    count: state.count - 1
  }),
  'reset': (state) => ({
    ...state,
    count: 0
  })
}

function view(state, emit) {
  return h('div', { class: 'counter' }, [
    h('h1', {}, [`Count: ${state.count}`]),
    h('button', {
      on: { click: () => emit('increment') }
    }, ['+']),
    h('button', {
      on: { click: () => emit('decrement') }
    }, ['-']),
    h('button', {
      on: { click: () => emit('reset') }
    }, ['Reset'])
  ])
}

const app = createApp({ state, reducers, view })
app.mount(document.body)
```

### Todo App with API

```javascript
import { createApp, h } from './dist/frontend-framework.js'

const state = {
  todos: [],
  currentTodo: '',
  loading: false,
  error: null
}

const reducers = {
  'update-todo': (state, text) => ({
    ...state,
    currentTodo: text
  }),
  'add-todo-start': (state) => ({
    ...state,
    loading: true
  }),
  'add-todo-success': (state, todo) => ({
    ...state,
    todos: [...state.todos, todo],
    currentTodo: '',
    loading: false
  }),
  'add-todo-error': (state, error) => ({
    ...state,
    error,
    loading: false
  }),
  'remove-todo': (state, id) => ({
    ...state,
    todos: state.todos.filter(t => t.id !== id)
  })
}

function TodoForm({ currentTodo }, emit, helpers) {
  const handleSubmit = async () => {
    if (currentTodo.trim().length < 3) return
    
    emit('add-todo-start')
    try {
      const result = await helpers.api.post('/api/todos', {
        content: currentTodo
      })
      emit('add-todo-success', result.data)
    } catch (err) {
      emit('add-todo-error', err.message)
    }
  }

  return h('div', {}, [
    h('input', {
      type: 'text',
      value: currentTodo,
      on: {
        input: ({ target }) => emit('update-todo', target.value),
        keydown: ({ key }) => {
          if (key === 'Enter') handleSubmit()
        }
      }
    }),
    h('button', {
      disabled: currentTodo.length < 3,
      on: { click: handleSubmit }
    }, ['Add Todo'])
  ])
}

function TodoList({ todos }, emit, helpers) {
  return h('ul', {}, todos.map(todo => 
    h('li', { key: todo.id }, [
      h('span', {}, [todo.content]),
      h('button', {
        on: {
          click: async () => {
            try {
              await helpers.api.delete(`/api/todos/${todo.id}`)
              emit('remove-todo', todo.id)
            } catch (err) {
              console.error(err)
            }
          }
        }
      }, ['Delete'])
    ])
  ))
}

function view(state, emit, helpers) {
  return h('div', { class: 'todo-app' }, [
    h('h1', {}, ['My Todos']),
    TodoForm(state, emit, helpers),
    state.error ? h('p', { class: 'error' }, [state.error]) : null,
    TodoList(state, emit, helpers)
  ])
}

const helpers = {
  api: {
    async request(path, { method = 'GET', body = null } = {}) {
      const opts = {
        method,
        headers: { 'Content-Type': 'application/json' }
      }
      if (body) opts.body = JSON.stringify(body)
      const res = await fetch(path, opts)
      if (!res.ok) throw new Error(await res.text())
      return res.json()
    },
    get(path) { return this.request(path) },
    post(path, body) { return this.request(path, { method: 'POST', body }) },
    put(path, body) { return this.request(path, { method: 'PUT', body }) },
    delete(path) { return this.request(path, { method: 'DELETE' }) }
  }
}

const app = createApp({ state, reducers, view, helpers })
app.mount(document.body)
```

### Single Page App with Routing

```javascript
import { createApp, h } from './dist/frontend-framework.js'

const state = {
  currentPage: '/'
}

const reducers = {
  'navigate': (state, path) => ({
    ...state,
    currentPage: path
  })
}

function HomePage(helpers) {
  return h('div', { class: 'home' }, [
    h('h1', {}, ['Welcome']),
    h('a', {
      href: '/about',
      on: {
        click: (e) => {
          e.preventDefault()
          helpers.navigate('/about')
        }
      }
    }, ['Go to About'])
  ])
}

function AboutPage(helpers) {
  return h('div', { class: 'about' }, [
    h('h1', {}, ['About Us']),
    h('a', {
      href: '/',
      on: {
        click: (e) => {
          e.preventDefault()
          helpers.navigate('/')
        }
      }
    }, ['Back Home'])
  ])
}

function Router(state, emit, helpers) {
  switch (state.currentPage) {
    case '/':
      return HomePage(helpers)
    case '/about':
      return AboutPage(helpers)
    default:
      return h('div', {}, ['Page not found'])
  }
}

const helpers = {
  navigate(path) {
    app.emit('navigate', path)
  }
}

let app = createApp({ state, reducers, view: Router, helpers })
app.mount(document.body)
```

---

## Advanced Features

### Event Handling

Events are attached via the `on` property:

```javascript
h('button', {
  on: {
    click: (event) => emit('action', payload),
    keydown: (event) => {
      if (event.key === 'Enter') emit('submit')
    },
    input: (event) => emit('update', event.target.value)
  }
}, ['Click me'])
```

**Common Events:** `click`, `input`, `change`, `submit`, `keydown`, `keyup`, `focus`, `blur`, `dblclick`

### Styling

#### Classes
```javascript
h('div', {
  class: 'container active'  // string
  // or
  class: ['container', 'active']  // array
}, [...])
```

#### Inline Styles
```javascript
h('div', {
  style: {
    color: '#fff',
    backgroundColor: '#333',
    padding: '10px'
  }
}, [...])
```

### Conditional Rendering

```javascript
function view(state, emit) {
  return h('div', {}, [
    state.isLoggedIn 
      ? h('p', {}, ['Welcome!'])
      : h('p', {}, ['Please login']),
    
    // or
    state.showForm ? h('form', {}, [...]) : null
  ])
}
```

### List Rendering

```javascript
function view(state, emit) {
  return h('ul', {}, 
    state.items.map((item, index) => 
      h('li', { key: item.id }, [
        h('span', {}, [item.name]),
        h('button', {
          on: { click: () => emit('remove', item.id) }
        }, ['Remove'])
      ])
    )
  )
}
```

### Fragments for Flexible Rendering

```javascript
import { hFragment } from './dist/frontend-framework.js'

function Header() {
  return hFragment([
    h('header', {}, [...]),
    h('nav', {}, [...])
  ])
}
```

### Data Attributes

```javascript
h('div', {
  'data-testid': 'user-card',
  'data-user-id': '123'
}, [...])
```

---

## Best Practices

1. **Keep State Immutable**
   ```javascript
   // ✅ Good
   const newState = { ...state, count: state.count + 1 }
   
   // ❌ Bad
   state.count += 1
   ```

2. **Use Pure Functions**
   ```javascript
   // ✅ Good reducer
   'increment': (state) => ({ ...state, count: state.count + 1 })
   
   // ❌ Bad reducer (side effects)
   'increment': (state) => {
     console.log('incrementing')  // Side effect
     return { ...state, count: state.count + 1 }
   }
   ```

3. **Keep Components Small**
   - Break complex UIs into smaller components
   - Components should be reusable

4. **Handle Errors Gracefully**
   ```javascript
   try {
     const data = await helpers.api.get('/data')
     emit('success', data)
   } catch (err) {
     emit('error', err.message)
   }
   ```

5. **Use Meaningful Action Names**
   ```javascript
   // ✅ Good
   emit('add-todo-success', todo)
   emit('load-todos-failure', error)
   
   // ❌ Bad
   emit('action', data)
   emit('update', stuff)
   ```

---

## Performance Tips

1. **Virtual DOM Patching**: Framework automatically diffs and patches only changed nodes
2. **Event Delegation**: Events are automatically delegated for better performance
3. **Memoization**: For expensive computations, memoize results in state
4. **Lazy Loading**: Load data only when needed via reducers

---

## Troubleshooting

### State Not Updating?
- Ensure you're using immutable updates (spread operator)
- Verify reducer returns new state object
- Check that `emit()` is called with correct action name

### DOM Not Re-rendering?
- Make sure reducer is registered in `reducers` object
- Verify `emit()` calls the correct action
- Check browser console for errors

### Events Not Firing?
- Ensure events are in `on` property, not as direct attributes
- Use proper event names (`click`, not `onclick`)
- Check that handler function is defined

---

## License

MIT

# Get Started

## Initialize the types

```js
export const DOM_TYPES = {
    TEXT: 'text',           // type for a text node
    ELEMENT: 'element',     // type for an element node
    FRAGMENT: 'fragment',   // type for a fragment node
}
```

## Get To Know Each Functions:

### function h()

```js
// Element nodes are the most common type of virtual node, representing the regular
// HTML elements that you use to define the structure of your web pages. To name a
// few, you have <h1> through <h6> for headings, <p> for paragraphs, <ul> and <ol> for
// lists, <a> for links, and <div> for generic containers. These nodes have a tag name
// (such as 'p'), attributes (such as a class name or the type attribute of an <input> element),
// and children nodes (the nodes that are inside them between the opening and
// closing tags).
export function h(tag, props = {}, children = []) {
    return {
        tag,    // element's tag name : <p>, <div>, --> 'p', 'div'
        props,  // an object with it's attributes: { id: 'input-button' }
        children: mapTextNodes(withoutNulls(children)), // an array of the children node, withoutNulls will trim all null and undefined child: see arrays.js
        type: DOM_TYPES.ELEMENT
    }
}
```

example of using it:
```js
h('h1', { id: 'title'}, ['This is a title'])
```
result:
```html
<h1 id="title">This is a title</h1>
```

exam: please transform this html below into h() function, you can find the answer at the bottom of this file:

```html
<div>
    <h1>This is a title</h1>
    <p>This is a paragraph</p>
</div>
```

### function hFragment()

```js
// To create an object of type fragment
// This can be a second initial entry instead of h() function and nested child with h(), it always good to start with hFragment right away.
export function hFragment(vNodes) {
    return {
        type: DOM_TYPES.FRAGMENT,
        children: mapTextNodes(withoutNulls(vNodes)) // an array of the children node.
    }
}
```

example of using it:
```js
hFragment([
    h('h1', {}, ['This is a title']),
    h('p', {}, ['This is a paragraph'])
])
```
result:
```html
<h1>This is a title</h1>
<p>This is a paragraph</p>
```

exam: now it's your turn to tronsform this into hFragment()
```html
<header>Hello</header>
<main>
    <h1>This is a title</h1>
    <p>This is a paragraph</p>
</main>
<footer>Powered by Koodsisu</footer>
```

### function mapTextNodes()

```js
// To sort out the children: if it is a string then it will be returned as object of type text with the value of it's content string
// If it is not a string, it will recursively handled as either fragment or element
function mapTextNodes(children) {
    return children.map((child) => {
        return typeof child === 'string' ? hString(child) : child
    })
}
```

### function hString()

```js
// To create an object of type text after sort out by mapTextNodes above.
export function hString(str) {
    if (typeof str === 'string') {
        return { type: DOM_TYPES.TEXT, value: str }
    }
}
```

example in use:
```js
h('h1', {}, [hString('This is a title')])
```

result:
```html
<h1>This is a title</h1>
```

---

## State Management with createApp()

### function createApp()

```js
export function createApp({ state, reducers, view, helpers }) {
    return {
        mount(element),      // Mount app to DOM element
        unmount(),           // Unmount and cleanup
        emit(action, payload) // Dispatch actions to update state
    }
}
```

The `createApp()` function creates a reactive application with centralized state management.

**Parameters:**
- `state` (object): Initial application state
- `reducers` (object): Action handlers that return new state
- `view` (function): Pure function that returns vdom based on state
- `helpers` (object): Utility functions available to components

**Example:**
```js
const state = {
    count: 0,
    message: 'Hello'
}

const reducers = {
    'increment': (state) => ({
        ...state,
        count: state.count + 1
    }),
    'set-message': (state, newMessage) => ({
        ...state,
        message: newMessage
    })
}

function view(state, emit) {
    return h('div', { class: 'app' }, [
        h('h1', {}, [state.message]),
        h('p', {}, [`Count: ${state.count}`]),
        h('button', {
            on: { click: () => emit('increment') }
        }, ['Increment'])
    ])
}

const app = createApp({ state, reducers, view })
app.mount(document.body)
```

### Reducers: Pure State Updates

Reducers are pure functions that take the current state and a payload, returning new state.

**Rules:**
- ✅ Always return a new object (use spread operator `...`)
- ✅ Never mutate the original state
- ✅ Pure function (no side effects)

**Example:**
```js
const reducers = {
    'add-todo': (state, todo) => ({
        ...state,
        todos: [...state.todos, todo]
    }),
    'remove-todo': (state, id) => ({
        ...state,
        todos: state.todos.filter(t => t.id !== id)
    }),
    'update-todo': (state, { id, content }) => ({
        ...state,
        todos: state.todos.map(t => 
            t.id === id ? { ...t, content } : t
        )
    })
}
```

### emit(action, payload)

Dispatches an action to update state.

**Parameters:**
- `action` (string): Reducer name to execute
- `payload` (any): Data passed to the reducer

**Example:**
```js
// Simple action
emit('increment')

// Action with payload
emit('set-message', 'New message')
emit('add-todo', { id: 1, content: 'Buy milk' })
```

---

## Event Handling

### Event Binding

Events are attached via the `on` property with event delegation:

```js
h('button', {
    on: {
        click: (event) => emit('action', payload)
    }
}, ['Click me'])
```

**Common Events:**
- `click` - Mouse click
- `input` - Text input change
- `change` - Form input change
- `submit` - Form submission
- `keydown` - Key press
- `keyup` - Key release
- `focus` - Element focused
- `blur` - Element loses focus
- `dblclick` - Double click

**Full Example:**
```js
h('form', {
    on: { submit: (e) => {
        e.preventDefault()
        emit('submit-form')
    }}
}, [
    h('input', {
        type: 'text',
        on: {
            input: ({ target }) => emit('update-name', target.value),
            keydown: ({ key }) => {
                if (key === 'Enter') emit('submit-form')
            }
        }
    }),
    h('button', { type: 'submit' }, ['Submit'])
])
```

---

## Styling

### CSS Classes

```js
// String
h('div', { class: 'container active' }, [...])

// Array
h('div', { class: ['container', 'active'] }, [...])

// Conditional
const isActive = true
h('div', { class: isActive ? 'active' : '' }, [...])
```

### Inline Styles

```js
h('div', {
    style: {
        color: '#fff',
        backgroundColor: '#333',
        padding: '10px',
        borderRadius: '5px'
    }
}, [...])
```

### HTML Attributes

```js
h('input', {
    type: 'email',
    placeholder: 'Enter email',
    disabled: false,
    'data-testid': 'email-input'
}, [])

h('img', {
    src: '/image.jpg',
    alt: 'Description',
    width: '200',
    height: '150'
}, [])
```

---

## Conditional Rendering

### If/Else Pattern

```js
function view(state, emit) {
    return h('div', {}, [
        state.isLoggedIn 
            ? h('p', {}, ['Welcome back!'])
            : h('p', {}, ['Please login'])
    ])
}
```

### Null/Undefined Pattern

```js
function view(state, emit) {
    return h('div', {}, [
        state.showAlert ? h('div', { class: 'alert' }, [state.message]) : null,
        state.error ? h('p', { class: 'error' }, [state.error]) : null
    ])
}
```

### Boolean Flags

```js
function view(state, emit) {
    return h('div', {}, [
        state.loading && h('p', {}, ['Loading...']),
        state.isEmpty && h('p', {}, ['No items found']),
        state.hasError && h('p', { class: 'error' }, ['Something went wrong'])
    ].filter(Boolean))  // Remove falsy values
}
```

---

## List Rendering

### map() for Dynamic Lists

```js
function view(state, emit) {
    return h('ul', {}, 
        state.items.map((item, index) => 
            h('li', { key: item.id }, [
                h('span', {}, [item.name]),
                h('button', {
                    on: { click: () => emit('remove-item', item.id) }
                }, ['Delete'])
            ])
        )
    )
}
```

### Handling Empty Lists

```js
function view(state, emit) {
    return h('div', {}, [
        state.items.length > 0
            ? h('ul', {}, state.items.map(item => 
                h('li', {}, [item.name])
            ))
            : h('p', {}, ['No items yet'])
    ])
}
```

---

## Component Composition

### Creating Reusable Components

Components are functions that accept `(state, emit, helpers)`:

```js
function UserCard(user, emit) {
    return h('div', { class: 'user-card' }, [
        h('h3', {}, [user.name]),
        h('p', {}, [user.email]),
        h('button', {
            on: { click: () => emit('select-user', user.id) }
        }, ['Select'])
    ])
}

function UserList(state, emit) {
    return h('div', { class: 'users' }, [
        h('h2', {}, ['Users']),
        h('div', {}, 
            state.users.map(user => UserCard(user, emit))
        )
    ])
}
```

### Component with Props

```js
function Button({ label, disabled, onClick }) {
    return h('button', {
        disabled,
        on: { click: onClick }
    }, [label])
}

// Usage
h('div', {}, [
    Button({ 
        label: 'Save', 
        disabled: false, 
        onClick: () => emit('save')
    })
])
```

---

## Advanced Patterns

### Form Handling

```js
const state = {
    form: {
        email: '',
        password: '',
        rememberMe: false
    },
    errors: {}
}

const reducers = {
    'update-form': (state, { field, value }) => ({
        ...state,
        form: { ...state.form, [field]: value }
    }),
    'reset-form': (state) => ({
        ...state,
        form: { email: '', password: '', rememberMe: false }
    })
}

function LoginForm(state, emit) {
    return h('form', {
        on: { submit: (e) => {
            e.preventDefault()
            emit('login')
        }}
    }, [
        h('input', {
            type: 'email',
            value: state.form.email,
            on: { input: ({ target }) => 
                emit('update-form', { field: 'email', value: target.value })
            }
        }),
        h('input', {
            type: 'password',
            value: state.form.password,
            on: { input: ({ target }) => 
                emit('update-form', { field: 'password', value: target.value })
            }
        }),
        h('input', {
            type: 'checkbox',
            checked: state.form.rememberMe,
            on: { change: ({ target }) => 
                emit('update-form', { field: 'rememberMe', value: target.checked })
            }
        }),
        h('button', { type: 'submit' }, ['Login'])
    ])
}
```

### Async Operations

```js
const state = {
    data: null,
    loading: false,
    error: null
}

const reducers = {
    'fetch-start': (state) => ({
        ...state,
        loading: true,
        error: null
    }),
    'fetch-success': (state, data) => ({
        ...state,
        data,
        loading: false
    }),
    'fetch-error': (state, error) => ({
        ...state,
        error,
        loading: false
    })
}

function DataComponent(state, emit, helpers) {
    const fetchData = async () => {
        emit('fetch-start')
        try {
            const data = await helpers.api.get('/api/data')
            emit('fetch-success', data)
        } catch (err) {
            emit('fetch-error', err.message)
        }
    }

    return h('div', {}, [
        state.loading && h('p', {}, ['Loading...']),
        state.error && h('p', { class: 'error' }, [state.error]),
        state.data && h('div', {}, [JSON.stringify(state.data)]),
        h('button', {
            on: { click: fetchData }
        }, ['Fetch Data'])
    ])
}
```

---

## How To Start A New Project With This Frontend Framework

## Complete Guide How To Start

1. **Create A Project Folder**
    
   ```sh
   mkdir my-app
   cd my-app
   ```

2. **Create Project Structure**

   ```sh
   mkdir -p src dist
   ```

3. **Create HTML Entry Point**

   ```html
   <!-- src/index.html -->
   <!DOCTYPE html>
   <html lang="en">
   <head>
       <meta charset="UTF-8">
       <meta name="viewport" content="width=device-width, initial-scale=1.0">
       <title>My App</title>
       <link rel="stylesheet" href="./styles.css">
   </head>
   <body>
       <div id="app"></div>
       <script type="module" src="./app.js"></script>
   </body>
   </html>
   ```

4. **Copy Frontend Framework**

   ```sh
   cp /path/to/frontend-framework.js dist/
   ```

5. **Create Your App**

   ```js
   // src/app.js
   import { createApp, h } from '../dist/frontend-framework.js'

   const state = {
       message: 'Hello World'
   }

   const reducers = {}

   function view(state, emit) {
       return h('div', { class: 'container' }, [
           h('h1', {}, [state.message])
       ])
   }

   const app = createApp({ state, reducers, view })
   app.mount(document.getElementById('app'))
   ```

6. **Add Styles**

   ```css
   /* src/styles.css */
   body {
       font-family: system-ui, sans-serif;
       background: #f5f5f5;
   }

   .container {
       max-width: 1000px;
       margin: 0 auto;
       padding: 20px;
   }
   ```

7. **Open in Browser**

   Simply open `src/index.html` in your browser, or use a local server:

   ```sh
   python3 -m http.server 8000
   # or
   npx http-server
   ```

**Happy Coding!** 🚀

---
## Troubleshooting

### State Not Updating?
- Ensure reducers return new objects (use spread operator `...`)
- Verify action name matches reducer key exactly
- Check that `emit()` is being called

### DOM Not Re-rendering?
- Check browser console for errors
- Verify `view()` function is returning valid vdom
- Make sure `app.mount()` is called with a valid DOM element

### Events Not Working?
- Ensure event handlers are in `on` object
- Use correct event names (e.g., `click`, not `onclick`)
- Check that `emit()` is defined in scope

---

## API Summary

| Function                    | Purpose               |
|-----------------------------|-----------------------|
| `h(tag, props, children)`   | Create element vnode  |
| `hFragment(vNodes)`         | Create fragment vnode |
| `hString(str)`              | Create text vnode     |
| `createApp(config)`         | Create application    |
| `app.mount(element)`        | Mount to DOM          |
| `app.emit(action, payload)` | Dispatch action       |

---

## Answers:

### function h()
```js
h('div', {}, [
    h('h1', {}, ['This is a title']),
    h('p', {}, ['This is a paragraph'])
])
```

### function hFragment()
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

**License:** MIT