document.addEventListener('DOMContentLoaded', () => {
  // Check if we're editing a category
  const urlParams = new URLSearchParams(window.location.search)
  const isEditing = urlParams.get('edit') === 'true'
  
  if (isEditing) {
    // Pre-fill form with existing data
    const name = urlParams.get('name')
    const color = urlParams.get('color')
    const notes = urlParams.get('notes')
    
    if (name) document.getElementById('category_name').value = name
    if (notes) document.getElementById('category_notes').value = notes
    if (color) {
      document.getElementById('category_color').value = color
      // Select the corresponding color square
      const colorSquare = document.querySelector(`[data-color="${color}"]`)
      if (colorSquare) {
        document.querySelectorAll('.color_square').forEach((s) => s.classList.remove('selected'))
        colorSquare.classList.add('selected')
      }
    }
    
    // Update page title and button text
    document.title = 'Edit Category - DailyPebble'
    const submitButton = document.querySelector('button[type="submit"]')
    if (submitButton) submitButton.textContent = 'Update Category'
  }

  // Color square selection
  document.querySelectorAll('.color_square').forEach((square) => {
    square.addEventListener('click', () => {
      // Remove previous selection
      document.querySelectorAll('.color_square').forEach((s) => s.classList.remove('selected'))

      // Add selection
      square.classList.add('selected')
      document.getElementById('category_color').value = square.dataset.color
    })
  })

  // Handle form submission
  document.getElementById('add_category_form').addEventListener('submit', async (e) => {
    e.preventDefault()
    
    const formData = new FormData(e.target)
    const categoryData = {
      name: formData.get('category_name'),
      color: formData.get('category_color'),
      notes: formData.get('category_notes') || '',
      todos: []
    }

    // Validate required fields
    if (!categoryData.name || !categoryData.color) {
      alert('Please fill in all required fields and select a color.')
      return
    }

    try {
      await saveCategory(categoryData, isEditing)
      console.log('Category saved successfully!')
      
      // Reset form
      e.target.reset()
      document.querySelectorAll('.color_square').forEach((s) => s.classList.remove('selected'))
      
      // Redirect to home page
      window.location.href = 'index.html'
    } catch (error) {
      console.error('Error saving category:', error)
      alert('Error saving category. Please try again.')
    }
  })
})

async function saveCategory(categoryData, isEditing) {
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

    if (isEditing) {
      // Get the original name from URL params
      const urlParams = new URLSearchParams(window.location.search)
      const originalName = urlParams.get('name')
      
      // Find and update the existing category
      const categoryIndex = data.categories.findIndex(cat => cat.name === originalName)
      if (categoryIndex === -1) {
        throw new Error('Category not found for editing')
      }
      
      // Check if new name conflicts with other categories (excluding the current one)
      const nameConflict = data.categories.find(cat => 
        cat.name.toLowerCase() === categoryData.name.toLowerCase() && cat.name !== originalName
      )
      if (nameConflict) {
        throw new Error('Category with this name already exists')
      }
      
      // Preserve existing todos when updating
      categoryData.todos = data.categories[categoryIndex].todos || []
      
      // Update the category
      data.categories[categoryIndex] = categoryData
    } else {
      // Check if category name already exists
      const existingCategory = data.categories.find(cat => cat.name.toLowerCase() === categoryData.name.toLowerCase())
      if (existingCategory) {
        throw new Error('Category with this name already exists')
      }

      // Add new category
      data.categories.push(categoryData)
    }

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
        console.log('Category saved to API successfully')
        // Also save to localStorage as backup
        localStorage.setItem('categories', JSON.stringify(data))
      } else {
        throw new Error('Failed to save to API')
      }
    } catch (error) {
      console.log('API save failed, saving to localStorage only')
      localStorage.setItem('categories', JSON.stringify(data))
    }
    
    console.log('Category data saved:', data)
    return data
  } catch (error) {
    throw error
  }
}
