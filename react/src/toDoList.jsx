import React, { useState, useTransition } from 'react'

function ToDolist() {

  const [tasks, setTasks] = useState(["Eat breakfeast", "Take a shower", "Walk the dog"])
  const [newTask, setNewTask] = useState("")

  function handleInputChange (event) {
      setNewTask(event.target.value)
  }
  
  function addTask () {

    if(newTask.trim() !== "") {
      setTasks([...tasks, newTask])
      setNewTask("")
    }
    
  }

  function deleteTask (index) {
   
    const updatedTasks = tasks.filter((_, i) => i !== index)
    setTasks(updatedTasks)

  }

  function moveTaskUp (index) {

    if (index > 0) {
      const updatedTasks = [...tasks];  
    
     
      [updatedTasks[index], updatedTasks[index - 1]] = 
      [updatedTasks[index - 1], updatedTasks[index]];
    
      setTasks(updatedTasks);  
    }
  
  }

    function moveTaskDown (index) {

      if (index < tasks.length - 1) {
        const updatedTasks = [...tasks];

        [updatedTasks[index], updatedTasks[index + 1]] = 
        [updatedTasks[index + 1], updatedTasks[index]];
  
        setTasks(updatedTasks)
        
      }
     
      
  }
  
  return (
    <div className="to-do-list">

      <h1>To-Do-List</h1>

      <div>
        <input 
         type='text'
         placeholder='Enter a task...'
         value={newTask}
         onChange={handleInputChange}/>
         <button className='add-button'
          onClick={addTask}>add</button>
      </div>

    <ol>
      {tasks.map((task, index) =>
      <li key={index}>
          <span className='text'>{task}</span>
          <button 
          onClick={() => deleteTask(index)} 
          className='Delete-button'
          >Delete</button>

          <button 
          onClick={() => moveTaskUp(index)} 
          className='moveUp-button'
          >👆</button>
          <button 
          onClick={() => moveTaskDown(index)} 
          className='Down-button'
          >👇</button>
      </li>
      )}
    </ol>

    </div>

    
  )
}

export default ToDolist