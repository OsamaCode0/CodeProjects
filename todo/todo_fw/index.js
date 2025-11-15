import { createApp, h, helperPatchDOM, helperMountDOM } from "./dist/frontend-framework.js";
import { LoginPage, loginReducers, loginState } from "./component/login.js";
import { TodoApp, todoReducers, todoState } from "./todo_fw.js";

const state = {
  ...todoState,
  ...loginState
};

const reducers = {
  ...todoReducers,
  ...loginReducers,
};

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

const app = createApp({ state, reducers, view: Router });
app.mount(document.body);

let currentVdom = null;

function rerender() {
  const newVdom = Router(state, app.emit);
  helperPatchDOM(currentVdom, newVdom, document.body);
}

export function navigate(path) {
  window.history.pushState({}, "", path);
  rerender();
}

window.addEventListener("popstate", rerender);

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


// import { createApp, h, helperPatchDOM } from "./dist/frontend-framework.js";
// import { LoginPage, loginReducers, loginState } from "./component/login.js";
// import { TodoApp, todoReducers, todoState } from "./todo_fw.js";

// const state = {
//   ...todoState,
//   ...loginState
// };

// const reducers = {
//   ...todoReducers,
//   ...loginReducers,
// };

// function Router(state, emit) {
//   switch (window.location.pathname) {
//     case "/":
//       return HomePage(state, emit);
//     case "/login":
//       return LoginPage(state, emit);
//     case "/todo":
//       return TodoApp(state, emit);
//     default:
//       return h("div", {}, [h("h1", {}, ["404 Not Found"])]);
//   }
// }

// const app = createApp({ state: state, reducers: reducers, view: Router });

// let currentVdom = Router(app.state, app.emit);
// helperPatchDOM(null, currentVdom, document.body);

// function rerender() {
//   const newVdom = Router(app.state, app.emit);
//   helperPatchDOM(currentVdom, newVdom, document.body);
//   currentVdom = newVdom;
// }

// export function navigate(path) {
//   window.history.pushState({}, "", `${path}`);
//   rerender();
// }

// window.addEventListener("popstate", () => {
//   rerender();
// });

// function HomePage(state, emit) {
//   return h("div", { class: "home" }, [
//     h("h1", {}, ["Welcome to My App"]),
//     h("p", {}, ["Choose where to go:"]),
//     h("nav", {}, [
//       h("a", {
//         href: "/login",
//         onclick: e => {
//           e.preventDefault();
//           navigate("/login");
//           return
//         }
//       }, ["Login"]),
//       h("span", {}, [" | "]),
//       h("a", { href: "/register" }, ["Register"]),
//     ])
//   ]);
// }
