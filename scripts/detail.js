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
  
  todoTypeSelect.addEventListener('change', (e) => {
    if (e.target.value === 'remind_item') {
      remindNumberInput.disabled = false
      remindDenominationSelect.disabled = false
      startDateInput.disabled = false
      endDateInput.disabled = false
    } else {
      remindNumberInput.disabled = true
      remindDenominationSelect.disabled = true
      startDateInput.disabled = true
      endDateInput.disabled = true
      remindNumberInput.value = ''
      remindDenominationSelect.selectedIndex = 0
      startDateInput.value = ''
      endDateInput.value = ''
    }
  })

  // Handle todo form submission
  document.getElementById('add_todo_form').addEventListener('submit', (e) => {
    e.preventDefault()
    
    const formData = new FormData(e.target)
    const todoData = {
      name: formData.get('todo_name'),
      type: formData.get('todo_type'),
      notes: formData.get('todo_notes'),
      category: category
    }
    
    if (todoData.type === 'remind_item') {
      todoData.remindNumber = formData.get('remind_number')
      todoData.remindDenomination = formData.get('remind_denomination')
      todoData.startDate = formData.get('start_date')
      todoData.endDate = formData.get('end_date')
    }
    
    console.log('Todo data:', todoData)
    
    // Reset form and close modal
    e.target.reset()
    // Disable reminder fields after reset
    remindNumberInput.disabled = true
    remindDenominationSelect.disabled = true
    startDateInput.disabled = true
    endDateInput.disabled = true
    modal.style.display = 'none'
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

  // Initialize todo sorting functionality
  handleTodoCheckboxChange()
})
