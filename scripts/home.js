document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.category_item:not(.add_category)').forEach((item) => {
    item.addEventListener('click', () => {
      const category = item.textContent.trim()
      window.location.href = `detail.html?category=${encodeURIComponent(category)}`
    })
  })
})
