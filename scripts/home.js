document.addEventListener('DOMContentLoaded', () => {
  loadCategories()

  // Add functionality for the add category button
  const addCategoryButton = document.querySelector('.add_category')
  if (addCategoryButton) {
    addCategoryButton.addEventListener('click', () => {
      window.location.href = 'add_category.html'
    })
  }
})

async function loadCategories() {
  try {
    // Try to load from localStorage first (fallback)
    let data = { categories: [] }
    const localData = localStorage.getItem('categories')
    
    if (localData) {
      data = JSON.parse(localData)
    } else {
      // Try to load from JSON file
      try {
        const response = await fetch('data/categories.json')
        if (response.ok) {
          data = await response.json()
        }
      } catch (error) {
        console.log('Could not load categories.json, using empty data')
      }
    }

    displayCategories(data.categories)
  } catch (error) {
    console.error('Error loading categories:', error)
    displayCategories([]) // Show empty state
  }
}

function displayCategories(categories) {
  const pebbleList = document.querySelector('.pebble_list')
  if (!pebbleList) return

  // Clear existing categories (except add button)
  const addButton = pebbleList.querySelector('.add_category')
  pebbleList.innerHTML = ''

  // Show empty state if no categories
  if (categories.length === 0) {
    const emptyState = document.createElement('div')
    emptyState.className = 'empty_state'
    emptyState.style.cssText = `
      text-align: center;
      padding: 40px 20px;
      color: #666;
      font-style: italic;
    `
    emptyState.textContent = 'No categories yet. Add your first category to get started!'
    pebbleList.appendChild(emptyState)
  }

  // Add categories
  categories.forEach(category => {
    const categoryElement = document.createElement('div')
    categoryElement.className = 'category_item'
    categoryElement.style.backgroundColor = category.color
    categoryElement.style.color = 'white'
    categoryElement.style.position = 'relative'
    
    // Create category name span
    const nameSpan = document.createElement('span')
    nameSpan.textContent = category.name
    nameSpan.style.textShadow = '1px 1px 2px rgba(0,0,0,0.8), -1px -1px 2px rgba(0,0,0,0.8), 1px -1px 2px rgba(0,0,0,0.8), -1px 1px 2px rgba(0,0,0,0.8)'
    categoryElement.appendChild(nameSpan)
    
    // Create action buttons container
    const actionButtonsContainer = document.createElement('div')
    actionButtonsContainer.className = 'action_buttons_container'
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
    editButton.className = 'edit_button'
    editButton.innerHTML = '✏️'
    editButton.style.cssText = `
      width: 16px;
      height: 16px;
      background: rgba(0,0,0,0.7);
      border: 1px solid rgba(255,255,255,0.5);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 8px;
      color: white;
      cursor: pointer;
      text-shadow: none;
      box-shadow: 0 1px 3px rgba(0,0,0,0.3);
    `
    
    editButton.addEventListener('click', (e) => {
      e.stopPropagation()
      editCategory(category)
    })

    // Add delete button
    const deleteButton = document.createElement('div')
    deleteButton.className = 'delete_button'
    deleteButton.innerHTML = '🗑️'
    deleteButton.style.cssText = `
      width: 16px;
      height: 16px;
      background: rgba(0,0,0,0.7);
      border: 1px solid rgba(255,255,255,0.5);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 8px;
      color: white;
      cursor: pointer;
      text-shadow: none;
      box-shadow: 0 1px 3px rgba(0,0,0,0.3);
    `
    
    deleteButton.addEventListener('click', (e) => {
      e.stopPropagation()
      deleteCategory(category.name)
    })

    actionButtonsContainer.appendChild(editButton)
    actionButtonsContainer.appendChild(deleteButton)

    // Add notes button if notes exist
    let notesButton = null
    if (category.notes && category.notes.trim()) {
      notesButton = document.createElement('div')
      notesButton.className = 'notes_button'
      notesButton.innerHTML = 'i'
      notesButton.style.cssText = `
        width: 16px;
        height: 16px;
        background: rgba(0,0,0,0.7);
        border: 1px solid rgba(255,255,255,0.5);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 10px;
        font-weight: bold;
        color: white;
        cursor: help;
        text-shadow: none;
        box-shadow: 0 1px 3px rgba(0,0,0,0.3);
      `
      
      // Create tooltip
      const tooltip = document.createElement('div')
      tooltip.className = 'notes_tooltip'
      tooltip.textContent = category.notes
      tooltip.style.cssText = `
        position: absolute;
        bottom: 110%;
        right: 0;
        background: #333;
        color: white;
        padding: 8px 12px;
        border-radius: 4px;
        font-size: 12px;
        white-space: nowrap;
        max-width: 200px;
        white-space: normal;
        word-wrap: break-word;
        z-index: 1000;
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.2s;
        box-shadow: 0 2px 8px rgba(0,0,0,0.2);
      `
      
      // Add arrow to tooltip
      const arrow = document.createElement('div')
      arrow.style.cssText = `
        position: absolute;
        top: 100%;
        right: 10px;
        width: 0;
        height: 0;
        border-left: 5px solid transparent;
        border-right: 5px solid transparent;
        border-top: 5px solid #333;
      `
      tooltip.appendChild(arrow)
      
      notesButton.appendChild(tooltip)
      actionButtonsContainer.appendChild(notesButton)
      
      // Show/hide tooltip on hover
      notesButton.addEventListener('mouseenter', () => {
        tooltip.style.opacity = '1'
      })
      
      notesButton.addEventListener('mouseleave', () => {
        tooltip.style.opacity = '0'
      })
    }

    categoryElement.appendChild(actionButtonsContainer)
    
    // Show/hide action buttons on hover
    categoryElement.addEventListener('mouseenter', () => {
      actionButtonsContainer.style.opacity = '1'
    })
    
    categoryElement.addEventListener('mouseleave', () => {
      actionButtonsContainer.style.opacity = '0'
      if (notesButton) {
        const tooltip = notesButton.querySelector('.notes_tooltip')
        if (tooltip) {
          tooltip.style.opacity = '0'
        }
      }
    })
    
    // Long press functionality for both mobile and desktop
    let longPressTimer = null
    let isLongPress = false
    
    function startLongPress() {
      console.log('Starting long press for:', category.name, 'Has notes:', !!(category.notes && category.notes.trim()))
      if (category.notes && category.notes.trim()) {
        isLongPress = false
        longPressTimer = setTimeout(() => {
          console.log('Long press triggered for:', category.name)
          isLongPress = true
          // Show notes button and tooltip on long press
          if (notesButton) {
            console.log('Showing notes button and tooltip')
            notesButton.style.opacity = '1'
            const tooltip = notesButton.querySelector('.notes_tooltip')
            if (tooltip) {
              tooltip.style.opacity = '1'
            }
          } else {
            console.log('No notes button found')
          }
        }, 300) // 300ms (0.3 seconds) for quick response
      }
    }
    
    function endLongPress() {
      if (longPressTimer) {
        clearTimeout(longPressTimer)
        longPressTimer = null
      }
      
      // Hide tooltip after a delay if it was shown
      if (isLongPress && notesButton) {
        setTimeout(() => {
          notesButton.style.opacity = '0'
          const tooltip = notesButton.querySelector('.notes_tooltip')
          if (tooltip) {
            tooltip.style.opacity = '0'
          }
          isLongPress = false
        }, 3000) // Hide after 3 seconds
      }
    }
    
    function cancelLongPress() {
      if (longPressTimer) {
        clearTimeout(longPressTimer)
        longPressTimer = null
      }
    }
    
    // Touch events for mobile
    categoryElement.addEventListener('touchstart', (e) => {
      e.preventDefault() // Prevent default touch behavior
      startLongPress()
    })
    
    categoryElement.addEventListener('touchend', (e) => {
      endLongPress()
    })
    
    categoryElement.addEventListener('touchmove', (e) => {
      cancelLongPress()
    })
    
    // Mouse events for desktop
    categoryElement.addEventListener('mousedown', (e) => {
      startLongPress()
    })
    
    categoryElement.addEventListener('mouseup', (e) => {
      endLongPress()
    })
    
    categoryElement.addEventListener('mouseleave', (e) => {
      cancelLongPress()
    })
    
    categoryElement.addEventListener('mousemove', (e) => {
      // Only cancel if mouse moved significantly
      if (longPressTimer && e.movementX > 5 || e.movementY > 5) {
        cancelLongPress()
      }
    })

    categoryElement.addEventListener('click', (e) => {
      // Don't navigate if clicking on notes button
      if (e.target.closest('.notes_button')) return
      
      // Don't navigate if it was a long press
      if (isLongPress) {
        isLongPress = false
        return
      }
      
      window.location.href = `detail.html?category=${encodeURIComponent(category.name)}`
    })
    
    pebbleList.appendChild(categoryElement)
  })

  // Re-add the add button
  if (addButton) {
    pebbleList.appendChild(addButton)
  }
}

async function editCategory(category) {
  // For now, redirect to add_category.html with category data in URL params
  const params = new URLSearchParams({
    edit: 'true',
    name: category.name,
    color: category.color,
    notes: category.notes || ''
  })
  window.location.href = `add_category.html?${params.toString()}`
}

async function deleteCategory(categoryName) {
  if (confirm(`Are you sure you want to delete the category "${categoryName}"? This will also delete all todos in this category.`)) {
    try {
      // Load existing categories
      let data = { categories: [] }
      const localData = localStorage.getItem('categories')
      
      if (localData) {
        data = JSON.parse(localData)
      } else {
        // Try to load from JSON file
        try {
          const response = await fetch('data/categories.json')
          if (response.ok) {
            data = await response.json()
          }
        } catch (error) {
          console.log('Could not load categories.json, using localStorage data')
        }
      }

      // Remove the category
      data.categories = data.categories.filter(cat => cat.name !== categoryName)

      // Save back to localStorage
      localStorage.setItem('categories', JSON.stringify(data))
      
      console.log('Category deleted:', categoryName)
      
      // Reload the page to show updated categories
      location.reload()
    } catch (error) {
      console.error('Error deleting category:', error)
      console.log('Error deleting category. Please try again.')
    }
  }
}
