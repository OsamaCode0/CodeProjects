const head = document.head
const headLastChild = head.lastChild.nextSibling
const title = document.createElement('title')
title.innerText = "My TODOs"
head.insertBefore(title, headLastChild)
const body = document.body
const bodyFirstChild = body.firstChild
const main = document.createElement('div')
main.className = 'main-frame'
body.insertBefore(main, bodyFirstChild)

const h1 = document.createElement('h1')
h1.innerText = "My TODO's"

const divForm = document.createElement('div')
divForm.className = "input-form"

const label = document.createElement('label')
label.for = "todo-input"
label.innerText = "New TODO"

const addTodoInput = document.createElement('input')
addTodoInput.type = "text"
addTodoInput.id ="todo-input"

const addTodoButton = document.createElement('button')
addTodoButton.id = "add-todo-btn"
addTodoButton.disabled = true
addTodoButton.innerText = "Add"

divForm.insertBefore(addTodoButton, divForm.lastChild)
divForm.insertBefore(addTodoInput, addTodoButton)
divForm.insertBefore(label, addTodoInput)

const todosList = document.createElement('ul')
todosList.id = "todos-list"

main.insertBefore(todosList, main.lastChild)
main.insertBefore(divForm, todosList)
main.insertBefore(h1, divForm)

const todos = ['Walk the dog', 'Water the plants', 'Sand the chairs']

// Functions
const renderTodoInReadMode = (todo) => {
    const li = document.createElement('li')

    const span = document.createElement('span')
    span.textContent = todo
    span.addEventListener('dblclick', () => {
        const idx = todos.indexOf(todo)

        todosList.replaceChild(
            renderTodoInEditMode(todo),
            todosList.childNodes[idx]
        )
    })
    li.append(span)

    const button = document.createElement('button')
    button.textContent = 'Done'
    button.addEventListener('click', () => {
        const idx = todos.indexOf(todo)
        removeTodo(idx)
    })
    li.append(button)

    return li
}

const renderTodoInEditMode = (todo) => {
    const li = document.createElement('li')
    const input = document.createElement('input')
    input.type = 'text'
    input.value = todo
    li.append(input)

    const saveBtn = document.createElement('button')
    saveBtn.textContent = 'Save'
    saveBtn.addEventListener('click', () => {
        const idx = todos.indexOf(todo)
        updateTodo(idx, input.value)
    })
    li.append(saveBtn)

    const cancleBtn = document.createElement('button')
    cancleBtn.textContent = 'Cancle'
    cancleBtn.addEventListener('click', () => {
        const idx = todos.indexOf(todo)
        todosList.replaceChild(
            renderTodoInEditMode(todo),
            todosList.childNodes[idx]
        )
    })
    li.append(cancleBtn)

    return li
}

const addTodo = () => {
    const description = addTodoInput.value

    todos.push(description)
    const todo = renderTodoInReadMode(description)
    todosList.append(todo)

    addTodoInput.value = ''
    addTodoButton.disabled = true
}

const removeTodo = (index) => {
    todos.splice(index, 1)
    todosList.childNodes[index].remove()
}

const updateTodo = (index, description) => {
    todos[index] = description
    const todo = renderTodoInReadMode(description)
    todosList.replaceChild(todo, todosList.childNodes[index])
}

// Initialize the view
for (const todo of todos) {
    todosList.append(renderTodoInReadMode(todo))
}

addTodoInput.addEventListener('input', () => {
    addTodoButton.disabled = addTodoInput.value.length < 3
})

addTodoInput.addEventListener('keydown', ({ key }) => {
    if (key === 'Enter' && addTodoInput.value.length >= 3) {
        addTodo()
    }
})

addTodoButton.addEventListener('click', () => {
    addTodo()
})