import { createApp, h } from "./dist/frontend-framework.js";
import { LoginPage, loginReducers, loginState } from "./component/login.js";
import { TodoApp, todoReducers, todoState } from "./todo_fw.js";

const state = {
  ...todoState,
  ...loginState
};

const reducers = {
  ...todoReducers,
  ...loginReducers,
  '__navigate__': (state) => state, // ADD: dummy reducer to trigger rerender
};

function Router(state, emit, helpers) {
  switch (window.location.pathname) {
    case "/":
      return HomePage(helpers);
    case "/login":
      return LoginPage(state, emit, helpers);
    case "/todo":
      return TodoApp(state, emit, helpers);
    default:
      return h("div", {}, [h("h1", {}, ["404 Not Found"])]);
  }
}

let app; // declare first

// helpers: navigation + small API wrapper
const helpers = {
  navigate(path) {
    window.history.pushState({}, "", path);
    app.emit('__navigate__', null); // CHANGE: emit to trigger rerender
  },
  api: {
    async request(path, { method = 'GET', body = null, headers = {} } = {}) {
      const token = localStorage.getItem('token') || '';
      console.log(`API ${method} ${path}`, { token, body })
      const opts = {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...headers,
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      };
      if (body != null) opts.body = JSON.stringify(body);

      try {
        const res = await fetch(path, opts);
        console.log(`Response status: ${res.status}`)
        const json = await res.json().catch(() => null);
        if (!res.ok) {
          const err = (json && json.message) || res.statusText || 'Request failed';
          const e = new Error(err);
          e.response = json;
          throw e;
        }
        return json;
      } catch (err) {
        console.error('API request failed:', err)
        throw err;
      }
    },
    get(path) { return this.request(path, { method: 'GET' }); },
    post(path, body) { return this.request(path, { method: 'POST', body }); },
    put(path, body) { return this.request(path, { method: 'PUT', body }); },
    delete(path, body) { return this.request(path, { method: 'DELETE', body }); },
  },
};

function HomePage(helpers) {
  return h("div", { class: "home" }, [
    h("h1", {}, ["Welcome to My App"]),
    h("p", {}, ["Choose where to go:"]),
    h("nav", {}, [
      h("a", {
        href: "/login",
        on: {
          click: (e) => {
            e.preventDefault();
            helpers.navigate("/login")
          }
        }
      }, ["Login"]),
      h("span", {}, [" | "]),
      h("a", { href: "/register" }, ["Register"]),
    ])
  ]);
}

app = createApp({ state, reducers, view: Router, helpers });
app.mount(document.body);

// Handle browser back/forward
window.addEventListener("popstate", () => {
  app.emit('__navigate__', null);
});