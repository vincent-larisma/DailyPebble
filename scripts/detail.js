document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search)
  const category = params.get('category')

  const header = document.getElementById('categoryHeader')
  const title = document.getElementById('pageTitle')

  if (category) {
    if (header) header.textContent = category
    if (title) title.textContent = category
  } else {
    if (header) header.textContent = 'No category selected'
    if (title) title.textContent = 'Detail Page'
  }
})
