document.querySelectorAll('.color_square').forEach((square) => {
  square.addEventListener('click', () => {
    // Remove previous selection
    document.querySelectorAll('.color_square').forEach((s) => s.classList.remove('selected'))

    // Add selection
    square.classList.add('selected')
    document.getElementById('category_color').value = square.dataset.color
  })
})
