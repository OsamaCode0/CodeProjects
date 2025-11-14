import { createApp, h, helperPatchDOM, helperMountDOM } from "./dist/frontend-framework.js";
import { LoginPage, loginReducers, loginState } from "./component/login.js";
import { TodoApp, todoReducers, todoState } from "./todo_fw.js";

// 1) Single, merged state and reducers
const state = {
  // todo: {...todoState},
  // login: {...loginState},
  ...todoState,
  ...loginState
};

const reducers = {
  ...todoReducers,
  ...loginReducers,
};

// 2) Router: returns a single root node, no extra wrappers, no side effects
function Router(state, emit) {
  switch (window.location.pathname) {
    case "/":
      return HomePage();
    case "/login":
      return LoginPage(state, emit);
    case "/todo":
      return TodoApp(state, emit);
    default:
      return h("div", {}, [h("h1", {}, ["404 Not Found"])]);
  }
}

// 3) App: mount ONCE
const app = createApp({ state, reducers, view: Router });
app.mount(document.body);

// 4) Track current VDOM and render consistently
let currentVdom = null;
// let currentVdom = Router(state, app.emit);

// function initialRender() {
//   const vdom = Router(state, app.emit);
//   helperMountDOM(vdom, document.body);  // first mount should use mount helper
//   currentVdom = vdom;
// }

function rerender() {
  const newVdom = Router(state, app.emit);
  helperPatchDOM(currentVdom, newVdom, document.body);
}

// 5) Navigate: update URL and rerender
export function navigate(path) {
  window.history.pushState({}, "", path);
  console.log('rerender()')
  rerender();
}

// 6) Popstate: back/forward buttons
window.addEventListener("popstate", rerender);

// 7) Kick off initial render
// initialRender();

// 8) HomePage: pure, calls navigate
function HomePage() {
  return h("div", { class: "home" }, [
    h("h1", {}, ["Welcome to My App"]),
    h("p", {}, ["Choose where to go:"]),
    h("nav", {}, [
      h("a", {
        href: "/login",
        onclick: e => {
          e.preventDefault();
          navigate("/login");
          return
        }
      }, ["Login"]),
      h("span", {}, [" | "]),
      // register route not implemented → keep as a normal link or add a case
      h("a", { href: "/register" }, ["Register"]),
      // h("span", {}, [" | "]),
      // h("a", {
      //   href: "/todo",
      //   onclick: e => {
      //     e.preventDefault();
      //     navigate("/todo");
      //   }
      // }, ["Todo"]),
    ])
  ]);
}
