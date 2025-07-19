// Global variables and utilities
let currentUser = null

// Import Bootstrap
const bootstrap = window.bootstrap

// Initialize the application
document.addEventListener("DOMContentLoaded", () => {
  initializeApp()
})

function initializeApp() {
  // Check for logged in user
  const savedUser = localStorage.getItem("currentUser")
  if (savedUser) {
    currentUser = JSON.parse(savedUser)
  }

  // Initialize page-specific functionality
  const currentPage = getCurrentPage()
  switch (currentPage) {
    case "index":
      initializeHomePage()
      break
    case "dashboard":
      initializeDashboard()
      break
    case "login":
    case "register":
      initializeAuthPages()
      break
    case "tic-tac-toe":
      initializeTicTacToe()
      break
    case "snake":
      initializeSnake()
      break
    case "rock-paper-scissors":
      initializeRockPaperScissors()
      break
    case "leaderboard":
      initializeLeaderboard()
      break
  }

  // Show welcome toast on first visit
  if (!localStorage.getItem("hasVisited")) {
    showToast("Welcome to FunZone! 🎮", "success")
    localStorage.setItem("hasVisited", "true")
  }
}

function getCurrentPage() {
  const path = window.location.pathname
  if (path.includes("dashboard")) return "dashboard"
  if (path.includes("login")) return "login"
  if (path.includes("register")) return "register"
  if (path.includes("leaderboard")) return "leaderboard"
  if (path.includes("games/tic-tac-toe")) return "tic-tac-toe"
  if (path.includes("games/snake")) return "snake"
  if (path.includes("games/rock-paper-scissors")) return "rock-paper-scissors"
  return "index"
}

function initializeHomePage() {
  // Add scroll animations
  const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px",
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("fade-in")
      }
    })
  }, observerOptions)

  // Observe elements for animation
  document.querySelectorAll(".game-card, .feature-item").forEach((el) => {
    observer.observe(el)
  })

  // Add hover effects to game cards
  document.querySelectorAll(".game-card").forEach((card) => {
    card.addEventListener("mouseenter", function () {
      this.style.transform = "translateY(-10px) scale(1.02)"
    })

    card.addEventListener("mouseleave", function () {
      this.style.transform = "translateY(0) scale(1)"
    })
  })
}

function initializeDashboard() {
  // Check if user is logged in
  if (!isLoggedIn()) {
    window.location.href = "login.html"
    return
  }
  console.log("Dashboard initialized")
}

function initializeAuthPages() {
  // Add password toggle functionality
  const toggleButtons = document.querySelectorAll('[id^="toggle"]')
  toggleButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const targetId = this.id.replace("toggle", "").toLowerCase()
      const passwordField = document.getElementById(targetId)
      const icon = this.querySelector("i")

      if (passwordField.type === "password") {
        passwordField.type = "text"
        icon.classList.remove("fa-eye")
        icon.classList.add("fa-eye-slash")
      } else {
        passwordField.type = "password"
        icon.classList.remove("fa-eye-slash")
        icon.classList.add("fa-eye")
      }
    })
  })
}

function initializeTicTacToe() {
  // Check if user is logged in
  if (!isLoggedIn()) {
    window.location.href = "login.html"
    return
  }
  console.log("Tic Tac Toe initialized")
  initializeGamePreviews()
}

function initializeSnake() {
  // Check if user is logged in
  if (!isLoggedIn()) {
    window.location.href = "login.html"
    return
  }
  console.log("Snake game initialized")
}

function initializeRockPaperScissors() {
  // Check if user is logged in
  if (!isLoggedIn()) {
    window.location.href = "login.html"
    return
  }
  console.log("Rock Paper Scissors initialized")
}

function initializeLeaderboard() {
  console.log("Leaderboard initialized")
}

function initializeGamePreviews() {
  // Animate tic-tac-toe preview
  const ticTacCells = document.querySelectorAll(".preview-cell")
  if (ticTacCells.length > 0) {
    setInterval(() => {
      ticTacCells.forEach((cell, index) => {
        setTimeout(() => {
          if (Math.random() > 0.7) {
            cell.textContent = Math.random() > 0.5 ? "X" : "O"
            cell.style.color = cell.textContent === "X" ? "#0d6efd" : "#dc3545"
          }
        }, index * 100)
      })
    }, 3000)
  }
}

// Toast notification system
function showToast(message, type = "info") {
  const toastElement = document.getElementById("toast")
  const toastBody = document.getElementById("toastMessage")

  if (!toastElement || !toastBody) {
    console.log(`Toast: ${message} (${type})`)
    return
  }

  // Set message
  toastBody.textContent = message

  // Update toast header based on type
  const toastHeader = toastElement.querySelector(".toast-header")
  const icon = toastHeader.querySelector("i")

  // Reset classes
  icon.className = "fas me-2"

  switch (type) {
    case "success":
      icon.classList.add("fa-check-circle", "text-success")
      break
    case "error":
      icon.classList.add("fa-exclamation-circle", "text-danger")
      break
    case "warning":
      icon.classList.add("fa-exclamation-triangle", "text-warning")
      break
    default:
      icon.classList.add("fa-info-circle", "text-primary")
  }

  // Show toast using Bootstrap
  if (typeof bootstrap !== "undefined") {
    const toast = new bootstrap.Toast(toastElement, {
      autohide: true,
      delay: 3000,
    })
    toast.show()
  }
}

// Sound effects
function playSound(type) {
  // Create audio context for sound effects
  const audioContext = new (window.AudioContext || window.webkitAudioContext)()

  let frequency
  switch (type) {
    case "click":
      frequency = 800
      break
    case "win":
      frequency = 1000
      break
    case "lose":
      frequency = 300
      break
    default:
      frequency = 600
  }

  const oscillator = audioContext.createOscillator()
  const gainNode = audioContext.createGain()

  oscillator.connect(gainNode)
  gainNode.connect(audioContext.destination)

  oscillator.frequency.value = frequency
  oscillator.type = "sine"

  gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3)

  oscillator.start(audioContext.currentTime)
  oscillator.stop(audioContext.currentTime + 0.3)
}

// Confetti animation
function createConfetti() {
  const confettiContainer = document.createElement("div")
  confettiContainer.className = "confetti"
  document.body.appendChild(confettiContainer)

  const colors = ["#0d6efd", "#198754", "#ffc107", "#dc3545", "#6f42c1", "#20c997"]

  for (let i = 0; i < 50; i++) {
    const confettiPiece = document.createElement("div")
    confettiPiece.className = "confetti-piece"
    confettiPiece.style.left = Math.random() * 100 + "%"
    confettiPiece.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)]
    confettiPiece.style.animationDelay = Math.random() * 3 + "s"
    confettiPiece.style.animationDuration = Math.random() * 3 + 2 + "s"
    confettiContainer.appendChild(confettiPiece)
  }

  // Remove confetti after animation
  setTimeout(() => {
    confettiContainer.remove()
  }, 5000)
}

// Utility functions
function formatNumber(num) {
  return num.toLocaleString()
}

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, "0")}`
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function debounce(func, wait) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

function animateElement(element, animationClass, duration = 1000) {
  element.classList.add(animationClass)
  setTimeout(() => {
    element.classList.remove(animationClass)
  }, duration)
}

// Game statistics management
function getGameStats(gameName) {
  const stats = localStorage.getItem(`gameStats_${gameName}`)
  return stats
    ? JSON.parse(stats)
    : {
        gamesPlayed: 0,
        gamesWon: 0,
        bestScore: 0,
        totalScore: 0,
        winStreak: 0,
        bestStreak: 0,
      }
}

function saveGameStats(gameName, stats) {
  localStorage.setItem(`gameStats_${gameName}`, JSON.stringify(stats))
}

function updateGameStats(gameName, result) {
  const stats = getGameStats(gameName)
  stats.gamesPlayed++

  if (result.won) {
    stats.gamesWon++
    stats.winStreak++
    stats.bestStreak = Math.max(stats.bestStreak, stats.winStreak)
  } else {
    stats.winStreak = 0
  }

  if (result.score !== undefined) {
    stats.totalScore += result.score
    stats.bestScore = Math.max(stats.bestScore, result.score)
  }

  saveGameStats(gameName, stats)
  return stats
}

// Local storage helpers
function getStorageItem(key, defaultValue = null) {
  try {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : defaultValue
  } catch (error) {
    console.error("Error reading from localStorage:", error)
    return defaultValue
  }
}

function setStorageItem(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    console.error("Error writing to localStorage:", error)
  }
}

// Check if user is logged in
function isLoggedIn() {
  const user = getStorageItem("currentUser")
  return user !== null && user !== undefined
}

// Get current user
function getCurrentUser() {
  return getStorageItem("currentUser")
}

// Logout function
function logout() {
  localStorage.removeItem("currentUser")
  showToast("Logged out successfully!", "success")
  setTimeout(() => {
    window.location.href = "index.html"
  }, 1000)
}

// Add click sound to all buttons
document.addEventListener("click", (e) => {
  if (e.target.tagName === "BUTTON" || e.target.closest("button")) {
    playSound("click")
  }
})

// Placeholder functions for missing features
function playWinSound() {
  playSound("win")
}

function playLoseSound() {
  playSound("lose")
}

// Performance monitoring
function measurePerformance(name, fn) {
  const start = performance.now()
  const result = fn()
  const end = performance.now()
  console.log(`${name} took ${end - start} milliseconds`)
  return result
}

// Error handling
window.addEventListener("error", (event) => {
  console.error("Global error:", event.error)
  showToast("An error occurred. Please refresh the page.", "error")
})

// Prevent right-click context menu on game elements
document.addEventListener("contextmenu", (event) => {
  if (event.target.closest(".game-board-card, .snake-canvas, .board-cell")) {
    event.preventDefault()
  }
})

// Smooth scrolling for anchor links
document.addEventListener("click", (event) => {
  if (event.target.matches('a[href^="#"]')) {
    event.preventDefault()
    const targetId = event.target.getAttribute("href").substring(1)
    const targetElement = document.getElementById(targetId)

    if (targetElement) {
      targetElement.scrollIntoView({
        behavior: "smooth",
        block: "start",
      })
    }
  }
})

// Initialize tooltips and popovers
document.addEventListener("DOMContentLoaded", () => {
  // Initialize Bootstrap tooltips
  const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
  tooltipTriggerList.map((tooltipTriggerEl) => new bootstrap.Tooltip(tooltipTriggerEl))

  // Initialize Bootstrap popovers
  const popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'))
  popoverTriggerList.map((popoverTriggerEl) => new bootstrap.Popover(popoverTriggerEl))
})

// Export functions for use in other scripts
window.FunZone = {
  showToast,
  playSound,
  playWinSound,
  playLoseSound,
  createConfetti,
  getGameStats,
  saveGameStats,
  updateGameStats,
  logout,
  formatNumber,
  formatTime,
  getRandomInt,
  animateElement,
  getStorageItem,
  setStorageItem,
}

// Placeholder functions for missing features
function getUserData() {
  // Placeholder implementation
  return null
}

function saveUserData(userData) {
  // Placeholder implementation
}
