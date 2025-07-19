// Dashboard functionality
document.addEventListener("DOMContentLoaded", () => {
  // Check if user is logged in
  const currentUser = getCurrentUser()
  if (!currentUser) {
    window.location.href = "login.html"
    return
  }

  loadUserData()
  loadGameStats()
  loadRecentActivity()
  updateNavProfileInfo() // Add this line
})

function getCurrentUser() {
  try {
    const userData = localStorage.getItem("currentUser")
    return userData ? JSON.parse(userData) : null
  } catch (error) {
    console.error("Error reading user data:", error)
    return null
  }
}

function loadUserData() {
  const user = getCurrentUser()
  if (!user) return

  // Update user name in navigation and welcome message
  const userNameElement = document.getElementById("userName")
  const welcomeNameElement = document.getElementById("welcomeName")

  if (userNameElement) {
    userNameElement.textContent = user.name
  }

  if (welcomeNameElement) {
    welcomeNameElement.textContent = user.name
  }
}

function loadGameStats() {
  const user = window.getCurrentUser()
  if (!user || !user.gameStats) return

  const stats = user.gameStats

  // Calculate totals
  let totalGames = 0
  let totalWins = 0
  let bestScore = 0
  let currentWinStreak = 0

  Object.values(stats).forEach((gameStat) => {
    totalGames += gameStat.gamesPlayed || 0
    totalWins += gameStat.gamesWon || 0
    bestScore = Math.max(bestScore, gameStat.bestScore || 0)
    currentWinStreak = Math.max(currentWinStreak, gameStat.winStreak || 0)
  })

  // Update dashboard stats
  window.updateElement("totalGames", totalGames)
  window.updateElement("totalWins", totalWins)
  window.updateElement("bestScore", bestScore)
  window.updateElement("winStreak", currentWinStreak)

  // Update individual game stats
  window.updateElement("ticTacToeGames", stats["tic-tac-toe"]?.gamesPlayed || 0)
  window.updateElement("ticTacToeWins", stats["tic-tac-toe"]?.gamesWon || 0)

  window.updateElement("snakeGames", stats.snake?.gamesPlayed || 0)
  window.updateElement("snakeBest", stats.snake?.bestScore || 0)

  window.updateElement("rpsGames", stats["rock-paper-scissors"]?.gamesPlayed || 0)
  window.updateElement("rpsWins", stats["rock-paper-scissors"]?.gamesWon || 0)
}

function loadRecentActivity() {
  const user = getCurrentUser()
  if (!user) return

  // Get recent activity from localStorage
  const recentActivity = getStorageItem("recentActivity_" + user.id, [])
  const activityContainer = document.getElementById("recentActivity")

  if (!activityContainer) return

  if (recentActivity.length === 0) {
    activityContainer.innerHTML = `
            <i class="fas fa-gamepad fa-3x mb-3"></i>
            <p>No recent activity. Start playing to see your game history!</p>
        `
    return
  }

  // Display recent activities
  const activityHTML = recentActivity
    .slice(0, 5)
    .map(
      (activity) => `
        <div class="activity-item d-flex align-items-center justify-content-between mb-3 p-3 bg-light rounded">
            <div class="d-flex align-items-center">
                <i class="fas ${getGameIcon(activity.game)} fa-2x me-3 text-${getGameColor(activity.game)}"></i>
                <div>
                    <h6 class="mb-1">${activity.game}</h6>
                    <small class="text-muted">${formatActivityTime(activity.timestamp)}</small>
                </div>
            </div>
            <div class="text-end">
                <span class="badge bg-${activity.result === "win" ? "success" : activity.result === "lose" ? "danger" : "secondary"}">
                    ${activity.result.toUpperCase()}
                </span>
                ${activity.score ? `<div><small class="text-muted">Score: ${activity.score}</small></div>` : ""}
            </div>
        </div>
    `,
    )
    .join("")

  activityContainer.innerHTML = activityHTML
}

function updateElement(id, value) {
  const element = document.getElementById(id)
  if (element) {
    element.textContent = window.formatNumber(value)
  }
}

function formatNumber(num) {
  return num.toLocaleString()
}

function formatActivityTime(timestamp) {
  const date = new Date(timestamp)
  const now = new Date()
  const diffInHours = Math.floor((now - date) / (1000 * 60 * 60))

  if (diffInHours < 1) {
    return "Just now"
  } else if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`
  } else {
    const diffInDays = Math.floor(diffInHours / 24)
    return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`
  }
}

function getGameIcon(gameName) {
  switch (gameName.toLowerCase()) {
    case "tic-tac-toe":
      return "fa-th-large"
    case "snake":
      return "fa-snake"
    case "rock-paper-scissors":
      return "fa-hand-rock"
    default:
      return "fa-gamepad"
  }
}

function getGameColor(gameName) {
  switch (gameName.toLowerCase()) {
    case "tic-tac-toe":
      return "primary"
    case "snake":
      return "success"
    case "rock-paper-scissors":
      return "warning"
    default:
      return "secondary"
  }
}

// Add activity to recent activity
function addRecentActivity(game, result, score = null) {
  const user = window.getCurrentUser()
  if (!user) return

  const activity = {
    game: game,
    result: result,
    score: score,
    timestamp: new Date().toISOString(),
  }

  const recentActivity = window.getStorageItem("recentActivity_" + user.id, [])
  recentActivity.unshift(activity)

  // Keep only last 10 activities
  if (recentActivity.length > 10) {
    recentActivity.splice(10)
  }

  window.setStorageItem("recentActivity_" + user.id, recentActivity)
}

// Add this function to update navigation profile info
function updateNavProfileInfo() {
  const currentUser = getCurrentUser()
  if (!currentUser) return

  const navProfileImage = document.getElementById("navProfileImage")
  const navProfileIcon = document.getElementById("navProfileIcon")

  if (currentUser.profileImage && navProfileImage && navProfileIcon) {
    navProfileImage.src = currentUser.profileImage
    navProfileImage.style.display = "inline-block"
    navProfileIcon.style.display = "none"
  } else if (navProfileImage && navProfileIcon) {
    navProfileImage.style.display = "none"
    navProfileIcon.style.display = "inline-block"
  }
}

// Export function for use in game pages
window.addRecentActivity = addRecentActivity

// Declare necessary functions
window.isLoggedIn = () => {
  // Implementation for checking if user is logged in
  return true // Placeholder implementation
}

window.getCurrentUser = () => {
  // Implementation for getting current user
  try {
    const userData = localStorage.getItem("currentUser")
    return userData ? JSON.parse(userData) : null
  } catch (error) {
    console.error("Error reading user data:", error)
    return null
  }
}

function getStorageItem(key, defaultValue) {
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

window.getStorageItem = (key, defaultValue) => {
  // Implementation for getting item from localStorage
  return JSON.parse(localStorage.getItem(key)) || defaultValue // Placeholder implementation
}

window.setStorageItem = (key, value) => {
  // Implementation for setting item in localStorage
  localStorage.setItem(key, JSON.stringify(value)) // Placeholder implementation
}
