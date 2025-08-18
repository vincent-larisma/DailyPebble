document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search)
  const category = params.get('category')

  const categoryName = document.getElementById('categoryName')
  const title = document.getElementById('pageTitle')

  if (category) {
    if (categoryName) categoryName.textContent = category
    if (title) title.textContent = category
  } else {
    if (categoryName) categoryName.textContent = 'No category selected'
    if (title) title.textContent = 'Detail Page'
  }

  // Modal functionality
  const modal = document.getElementById('addItemModal')
  const openModalBtn = document.getElementById('openModal')
  const closeBtn = document.querySelector('.close')
  const todoTypeSelect = document.getElementById('todo_type')
  const reminderFields = document.getElementById('reminderFields')

  // Open modal
  openModalBtn.addEventListener('click', () => {
    modal.style.display = 'block'
  })

  // Close modal
  closeBtn.addEventListener('click', () => {
    modal.style.display = 'none'
  })

  // Close modal when clicking outside
  window.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.style.display = 'none'
    }
  })

  // Enable/disable reminder fields based on type selection
  const remindNumberInput = document.getElementById('remind_number')
  const remindDenominationSelect = document.getElementById('remind_denomination')
  const startDateInput = document.getElementById('start_date')
  const endDateInput = document.getElementById('end_date')
  const perpetualCheckbox = document.getElementById('perpetual')
  
  todoTypeSelect.addEventListener('change', (e) => {
    if (e.target.value === 'remind_item') {
      remindNumberInput.disabled = false
      remindDenominationSelect.disabled = false
      startDateInput.disabled = false
      endDateInput.disabled = false
      perpetualCheckbox.disabled = false
    } else {
      remindNumberInput.disabled = true
      remindDenominationSelect.disabled = true
      startDateInput.disabled = true
      endDateInput.disabled = true
      perpetualCheckbox.disabled = true
      remindNumberInput.value = ''
      remindDenominationSelect.selectedIndex = 0
      startDateInput.value = ''
      endDateInput.value = ''
      perpetualCheckbox.checked = false
    }
  })

  // Handle perpetual checkbox changes
  perpetualCheckbox.addEventListener('change', (e) => {
    if (e.target.checked) {
      // If perpetual is checked, disable and clear end date
      endDateInput.disabled = true
      endDateInput.value = ''
    } else {
      // If perpetual is unchecked, enable end date (only if remind_item is selected)
      if (todoTypeSelect.value === 'remind_item') {
        endDateInput.disabled = false
      }
    }
  })

  // Handle todo form submission
  document.getElementById('add_todo_form').addEventListener('submit', async (e) => {
    e.preventDefault()
    
    const formData = new FormData(e.target)
    const isPerpetual = formData.get('perpetual') === 'on'
    
    const todoData = {
      name: formData.get('todo_name'),
      type: formData.get('todo_type'),
      number_of: formData.get('remind_number') ? parseInt(formData.get('remind_number')) : null,
      denomination: formData.get('remind_denomination') || null,
      starts_at: formData.get('start_date') || null,
      ends_at: isPerpetual ? null : (formData.get('end_date') || null),
      perpetual: isPerpetual,
      notes: formData.get('todo_notes') || '',
      is_done: false
    }

    // Validate required fields
    if (!todoData.name || !todoData.type) {
      alert('Please fill in all required fields.')
      return
    }

    // If remind_item type, validate reminder fields
    if (todoData.type === 'remind_item') {
      if (!todoData.number_of || !todoData.denomination) {
        alert('Please fill in the reminder frequency.')
        return
      }
    } else {
      // Clear reminder fields for todo type
      todoData.number_of = null
      todoData.denomination = null
      todoData.starts_at = null
      todoData.ends_at = null
      todoData.perpetual = false
    }
    
    try {
      if (window.editingTodo) {
        // Update existing todo
        await updateTodo(window.editingTodo, todoData, category)
        console.log('Todo updated successfully!')
        window.editingTodo = null
      } else {
        // Add new todo
        await saveTodo(todoData, category)
        console.log('Todo saved successfully!')
      }
      
      // Reset form and close modal
      e.target.reset()
      // Disable reminder fields after reset
      remindNumberInput.disabled = true
      remindDenominationSelect.disabled = true
      startDateInput.disabled = true
      endDateInput.disabled = true
      modal.style.display = 'none'
      
      // Reset modal title and button text
      document.querySelector('.modal_header h3').textContent = 'Add New Todo'
      document.querySelector('#add_todo_form button[type="submit"]').textContent = 'Add Todo'
      
      // Reload the page to show the updated todos
      location.reload()
    } catch (error) {
      console.error('Error saving todo:', error)
      alert('Error saving todo. Please try again.')
    }
  })

  // Handle todo checkbox changes to move completed items to bottom
  function handleTodoCheckboxChange() {
    document.querySelectorAll('.selection_item input[type="checkbox"]').forEach(checkbox => {
      checkbox.addEventListener('change', function() {
        const selectionList = this.closest('.selection_list')
        if (selectionList) {
          sortTodoItems(selectionList)
        }
      })
    })
  }

  function sortTodoItems(selectionList) {
    const items = Array.from(selectionList.querySelectorAll('.selection_item'))
    
    // Sort items: unchecked first, then checked
    items.sort((a, b) => {
      const aChecked = a.querySelector('input[type="checkbox"]').checked
      const bChecked = b.querySelector('input[type="checkbox"]').checked
      
      if (aChecked === bChecked) return 0
      return aChecked ? 1 : -1
    })
    
    // Re-append items in sorted order
    items.forEach(item => {
      selectionList.appendChild(item)
    })
  }

  // Load and display todos for this category
  loadTodos(category)

  // Initialize todo sorting functionality
  handleTodoCheckboxChange()
})

async function loadTodos(categoryName) {
  try {
    // Load categories data from API first, then fallback to localStorage
    let data = { categories: [] }
    
    try {
      // Load from ESP32 API
      const response = await fetch('/api/categories')
      if (response.ok) {
        data = await response.json()
        // Store in localStorage as backup
        localStorage.setItem('categories', JSON.stringify(data))
      } else {
        throw new Error('API request failed')
      }
    } catch (error) {
      console.log('Could not load from API, trying localStorage fallback')
      // Fallback to localStorage
      const localData = localStorage.getItem('categories')
      if (localData) {
        data = JSON.parse(localData)
      }
    }

    // Find the category
    const category = data.categories.find(cat => cat.name === categoryName)
    if (category && category.todos) {
      displayTodos(category.todos)
    }
  } catch (error) {
    console.error('Error loading todos:', error)
  }
}

function displayTodos(todos) {
  // Clear existing static todos
  const todoContainer = document.querySelector('.selection_container:first-of-type .selection_list')
  const scheduledContainer = document.querySelector('.selection_container:last-of-type .selection_list')
  
  if (todoContainer) todoContainer.innerHTML = ''
  if (scheduledContainer) scheduledContainer.innerHTML = ''

  // Separate todos by type
  const regularTodos = todos.filter(todo => todo.type === 'todo')
  const reminderTodos = todos.filter(todo => todo.type === 'remind_item')

  // Display regular todos or empty state
  if (todoContainer) {
    if (regularTodos.length > 0) {
      regularTodos.forEach(todo => {
        const todoElement = createTodoElement(todo)
        todoContainer.appendChild(todoElement)
      })
    } else {
      const emptyState = document.createElement('div')
      emptyState.className = 'empty_state'
      emptyState.style.cssText = `
        text-align: center;
        padding: 20px;
        color: #999;
        font-style: italic;
        font-size: 14px;
      `
      emptyState.textContent = 'No todos yet. Add your first todo item!'
      todoContainer.appendChild(emptyState)
    }
  }

  // Display reminder todos or empty state
  if (scheduledContainer) {
    if (reminderTodos.length > 0) {
      reminderTodos.forEach(todo => {
        const todoElement = createTodoElement(todo)
        scheduledContainer.appendChild(todoElement)
      })
    } else {
      const emptyState = document.createElement('div')
      emptyState.className = 'empty_state'
      emptyState.style.cssText = `
        text-align: center;
        padding: 20px;
        color: #999;
        font-style: italic;
        font-size: 14px;
      `
      emptyState.textContent = 'No scheduled todos yet. Add reminder items here!'
      scheduledContainer.appendChild(emptyState)
    }
  }

  // Re-initialize checkbox handlers after adding new todos
  handleTodoCheckboxChange()
}

function createTodoElement(todo) {
  const todoItem = document.createElement('div')
  todoItem.className = 'selection_item'
  todoItem.style.position = 'relative'
  
  const checkbox = document.createElement('input')
  checkbox.type = 'checkbox'
  checkbox.id = `todo_${Date.now()}_${Math.random()}`
  checkbox.checked = todo.is_done
  
  const label = document.createElement('label')
  label.htmlFor = checkbox.id
  label.textContent = todo.name
  
  // Add reminder info if it's a reminder item
  if (todo.type === 'remind_item' && todo.number_of && todo.denomination) {
    const reminderInfo = document.createElement('small')
    reminderInfo.style.cssText = 'display: block; color: #666; font-size: 0.8em; margin-top: 2px;'
    reminderInfo.textContent = `Every ${todo.number_of} ${todo.denomination}${todo.number_of > 1 ? 's' : ''}`
    
    // Add perpetual or date range info
    if (todo.perpetual) {
      reminderInfo.textContent += ' (Perpetual)'
      if (todo.starts_at) {
        reminderInfo.textContent += ` - From: ${new Date(todo.starts_at).toLocaleDateString()}`
      }
    } else if (todo.starts_at || todo.ends_at) {
      const dateInfo = []
      if (todo.starts_at) dateInfo.push(`From: ${new Date(todo.starts_at).toLocaleDateString()}`)
      if (todo.ends_at) dateInfo.push(`To: ${new Date(todo.ends_at).toLocaleDateString()}`)
      reminderInfo.textContent += ` (${dateInfo.join(', ')})`
    }
    
    label.appendChild(reminderInfo)
  }
  
  // Add notes if they exist
  if (todo.notes && todo.notes.trim()) {
    const notesInfo = document.createElement('small')
    notesInfo.style.cssText = 'display: block; color: #888; font-size: 0.8em; margin-top: 2px; font-style: italic;'
    notesInfo.textContent = todo.notes
    label.appendChild(notesInfo)
  }

  // Create action buttons container
  const actionButtonsContainer = document.createElement('div')
  actionButtonsContainer.className = 'todo_action_buttons_container'
  actionButtonsContainer.style.cssText = `
    position: absolute;
    top: 5px;
    right: 5px;
    display: flex;
    gap: 4px;
    opacity: 0;
    transition: opacity 0.2s;
  `

  // Add edit button
  const editButton = document.createElement('div')
  editButton.className = 'todo_edit_button'
  editButton.innerHTML = '✏️'
  editButton.style.cssText = `
    width: 14px;
    height: 14px;
    background: rgba(0,0,0,0.7);
    border: 1px solid rgba(0,0,0,0.5);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 7px;
    color: white;
    cursor: pointer;
    text-shadow: none;
    box-shadow: 0 1px 3px rgba(0,0,0,0.3);
  `
  
  editButton.addEventListener('click', (e) => {
    e.stopPropagation()
    editTodo(todo)
  })

  // Add delete button
  const deleteButton = document.createElement('div')
  deleteButton.className = 'todo_delete_button'
  deleteButton.innerHTML = '🗑️'
  deleteButton.style.cssText = `
    width: 14px;
    height: 14px;
    background: rgba(0,0,0,0.7);
    border: 1px solid rgba(0,0,0,0.5);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 7px;
    color: white;
    cursor: pointer;
    text-shadow: none;
    box-shadow: 0 1px 3px rgba(0,0,0,0.3);
  `
  
  deleteButton.addEventListener('click', (e) => {
    e.stopPropagation()
    deleteTodo(todo)
  })

  actionButtonsContainer.appendChild(editButton)
  actionButtonsContainer.appendChild(deleteButton)

  // Show/hide action buttons on hover
  todoItem.addEventListener('mouseenter', () => {
    actionButtonsContainer.style.opacity = '1'
  })
  
  todoItem.addEventListener('mouseleave', () => {
    actionButtonsContainer.style.opacity = '0'
  })
  
  todoItem.appendChild(checkbox)
  todoItem.appendChild(label)
  todoItem.appendChild(actionButtonsContainer)
  
  return todoItem
}

async function saveTodo(todoData, categoryName) {
  try {
    // Load existing categories from API first
    let data = { categories: [] }
    
    try {
      const response = await fetch('/api/categories')
      if (response.ok) {
        data = await response.json()
      } else {
        throw new Error('Failed to load from API')
      }
    } catch (error) {
      console.log('API failed, trying localStorage')
      const localData = localStorage.getItem('categories')
      if (localData) {
        data = JSON.parse(localData)
      }
    }

    // Find the category and add the todo
    const categoryIndex = data.categories.findIndex(cat => cat.name === categoryName)
    if (categoryIndex === -1) {
      throw new Error('Category not found')
    }

    // Add todo to category
    data.categories[categoryIndex].todos.push(todoData)

    // Save to API first
    try {
      const saveResponse = await fetch('/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      })

      if (saveResponse.ok) {
        console.log('Todo saved to API successfully')
        // Also save to localStorage as backup
        localStorage.setItem('categories', JSON.stringify(data))
      } else {
        throw new Error('Failed to save to API')
      }
    } catch (error) {
      console.log('API save failed, saving to localStorage only')
      localStorage.setItem('categories', JSON.stringify(data))
    }
    
    console.log('Todo saved:', todoData)
    return data
  } catch (error) {
    throw error
  }
}

async function updateTodo(originalTodo, updatedTodoData, categoryName) {
  try {
    // Load existing categories from API first
    let data = { categories: [] }
    
    try {
      const response = await fetch('/api/categories')
      if (response.ok) {
        data = await response.json()
      } else {
        throw new Error('Failed to load from API')
      }
    } catch (error) {
      console.log('API failed, trying localStorage')
      const localData = localStorage.getItem('categories')
      if (localData) {
        data = JSON.parse(localData)
      }
    }

    // Find the category
    const categoryIndex = data.categories.findIndex(cat => cat.name === categoryName)
    if (categoryIndex === -1) {
      throw new Error('Category not found')
    }

    // Find and update the todo
    const todoIndex = data.categories[categoryIndex].todos.findIndex(t => 
      t.name === originalTodo.name && 
      t.type === originalTodo.type && 
      t.notes === originalTodo.notes
    )
    
    if (todoIndex === -1) {
      throw new Error('Todo not found')
    }

    // Preserve the is_done status from the original todo
    updatedTodoData.is_done = originalTodo.is_done

    // Update the todo
    data.categories[categoryIndex].todos[todoIndex] = updatedTodoData

    // Save to API first
    try {
      const saveResponse = await fetch('/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      })

      if (saveResponse.ok) {
        console.log('Todo updated in API successfully')
        // Also save to localStorage as backup
        localStorage.setItem('categories', JSON.stringify(data))
      } else {
        throw new Error('Failed to save to API')
      }
    } catch (error) {
      console.log('API save failed, saving to localStorage only')
      localStorage.setItem('categories', JSON.stringify(data))
    }
    
    console.log('Todo updated:', updatedTodoData)
    return data
  } catch (error) {
    throw error
  }
}

function editTodo(todo) {
  // Pre-fill the modal form with existing todo data
  document.getElementById('todo_name').value = todo.name
  document.getElementById('todo_type').value = todo.type
  document.getElementById('todo_notes').value = todo.notes || ''
  
  // Handle reminder fields
  const remindNumberInput = document.getElementById('remind_number')
  const remindDenominationSelect = document.getElementById('remind_denomination')
  const startDateInput = document.getElementById('start_date')
  const endDateInput = document.getElementById('end_date')
  const perpetualCheckbox = document.getElementById('perpetual')
  
  if (todo.type === 'remind_item') {
    remindNumberInput.disabled = false
    remindDenominationSelect.disabled = false
    startDateInput.disabled = false
    perpetualCheckbox.disabled = false
    
    remindNumberInput.value = todo.number_of || ''
    remindDenominationSelect.value = todo.denomination || 'day'
    startDateInput.value = todo.starts_at || ''
    
    // Handle perpetual checkbox and end date
    const isPerpetual = todo.perpetual || false
    perpetualCheckbox.checked = isPerpetual
    
    if (isPerpetual) {
      endDateInput.disabled = true
      endDateInput.value = ''
    } else {
      endDateInput.disabled = false
      endDateInput.value = todo.ends_at || ''
    }
  } else {
    remindNumberInput.disabled = true
    remindDenominationSelect.disabled = true
    startDateInput.disabled = true
    endDateInput.disabled = true
    perpetualCheckbox.disabled = true
    
    remindNumberInput.value = ''
    remindDenominationSelect.selectedIndex = 0
    startDateInput.value = ''
    endDateInput.value = ''
    perpetualCheckbox.checked = false
  }
  
  // Update modal title and button
  document.querySelector('.modal_header h3').textContent = 'Edit Todo'
  document.querySelector('#add_todo_form button[type="submit"]').textContent = 'Update Todo'
  
  // Store original todo data for comparison
  window.editingTodo = todo
  
  // Show the modal
  document.getElementById('addItemModal').style.display = 'block'
}

async function deleteTodo(todo) {
  const params = new URLSearchParams(window.location.search)
  const categoryName = params.get('category')
  
  if (confirm(`Are you sure you want to delete the todo "${todo.name}"?`)) {
    try {
      // Load existing categories from API first
      let data = { categories: [] }
      
      try {
        const response = await fetch('/api/categories')
        if (response.ok) {
          data = await response.json()
        } else {
          throw new Error('Failed to load from API')
        }
      } catch (error) {
        console.log('API failed, trying localStorage')
        const localData = localStorage.getItem('categories')
        if (localData) {
          data = JSON.parse(localData)
        }
      }

      // Find the category
      const categoryIndex = data.categories.findIndex(cat => cat.name === categoryName)
      if (categoryIndex === -1) {
        throw new Error('Category not found')
      }

      // Remove the todo from the category
      data.categories[categoryIndex].todos = data.categories[categoryIndex].todos.filter(t => 
        !(t.name === todo.name && t.type === todo.type && t.notes === todo.notes)
      )

      // Save to API first
      try {
        const saveResponse = await fetch('/api/categories', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data)
        })

        if (saveResponse.ok) {
          console.log('Todo deleted from API successfully')
          // Also save to localStorage as backup
          localStorage.setItem('categories', JSON.stringify(data))
        } else {
          throw new Error('Failed to save to API')
        }
      } catch (error) {
        console.log('API save failed, saving to localStorage only')
        localStorage.setItem('categories', JSON.stringify(data))
      }
      
      console.log('Todo deleted:', todo.name)
      
      // Reload the page to show updated todos
      location.reload()
    } catch (error) {
      console.error('Error deleting todo:', error)
      alert('Error deleting todo. Please try again.')
    }
  }
}
