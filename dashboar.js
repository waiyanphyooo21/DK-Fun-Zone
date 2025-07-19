// Dashboard functionality
document.addEventListener("DOMContentLoaded", () => {
  initializeDashboard()
})

function initializeDashboard() {
  // Check if user is logged in
  const currentUser = getUserData()
  if (!currentUser) {
    window.location.href = "login.html"
    return
  }

  // Update user interface
  updateUserInterface(currentUser)

  // Load user statistics
  loadUserStatistics(currentUser)

  // Load recent activity
  loadRecentActivity(currentUser)

  // Initialize game cards
  initializeGameCards()

  // Show welcome message for new users
  if (isNewUser(currentUser)) {
    showWelcomeMessage(currentUser)
  }
}

function updateUserInterface(user) {
  // Update user name in navigation and welcome section
  const userNameElements = document.querySelectorAll("#userName, #userNameNav")
  userNameElements.forEach((element) => {
    if (element) element.textContent = user.name
  })

  // Update member since date
  const memberSinceElement = document.getElementById("memberSince")
  if (memberSinceElement) {
    const memberDate = new Date(user.createdAt)
    memberSinceElement.textContent = memberDate.toLocaleDateString()
  }
}

function loadUserStatistics(user) {
  // Calculate overall statistics
  const stats = calculateOverallStats(user)

  // Update dashboard stats
  updateStatElement("gamesPlayed", stats.totalGamesPlayed)
  updateStatElement("gamesWon", stats.totalGamesWon)
  updateStatElement("totalScore", stats.totalScore)

  // Update individual game stats
  updateGameSpecificStats(user)

  // Update favorite game
  const favoriteGame = getFavoriteGame(user)
  updateStatElement("favoriteGame", favoriteGame)

  // Calculate total playtime (estimated)
  const totalPlaytime = estimatePlaytime(user)
  updateStatElement("totalPlaytime", totalPlaytime)
}

function calculateOverallStats(user) {
  let totalGamesPlayed = 0
  let totalGamesWon = 0
  let totalScore = 0

  Object.values(user.gameStats || {}).forEach((gameStats) => {
    totalGamesPlayed += gameStats.gamesPlayed || 0
    totalGamesWon += gameStats.gamesWon || 0
    totalScore += gameStats.totalScore || 0
  })

  return {
    totalGamesPlayed,
    totalGamesWon,
    totalScore,
  }
}

function updateGameSpecificStats(user) {
  const gameStats = user.gameStats || {}

  // Tic-Tac-Toe stats
  const tttStats = gameStats["tic-tac-toe"] || {}
  updateStatElement("tttBestScore", tttStats.bestScore || 0)

  // Snake stats
  const snakeStats = gameStats["snake"] || {}
  updateStatElement("snakeBestScore", snakeStats.bestScore || 0)

  // Rock Paper Scissors stats
  const rpsStats = gameStats["rock-paper-scissors"] || {}
  const rpsWinRate = rpsStats.gamesPlayed > 0 ? Math.round((rpsStats.gamesWon / rpsStats.gamesPlayed) * 100) : 0
  updateStatElement("rpsWinRate", rpsWinRate + "%")
}

function updateStatElement(elementId, value) {
  const element = document.getElementById(elementId)
  if (element) {
    element.textContent = typeof value === "number" ? formatNumber(value) : value
  }
}

function getFavoriteGame(user) {
  const gameStats = user.gameStats || {}
  let favoriteGame = "None"
  let maxGames = 0

  Object.entries(gameStats).forEach(([gameName, stats]) => {
    if (stats.gamesPlayed > maxGames) {
      maxGames = stats.gamesPlayed
      favoriteGame = formatGameName(gameName)
    }
  })

  return favoriteGame
}

function formatGameName(gameName) {
  const gameNames = {
    "tic-tac-toe": "Tic-Tac-Toe",
    snake: "Snake",
    "rock-paper-scissors": "Rock Paper Scissors",
  }
  return gameNames[gameName] || gameName
}

function estimatePlaytime(user) {
  const gameStats = user.gameStats || {}
  let totalMinutes = 0

  // Estimate based on games played (rough calculation)
  Object.entries(gameStats).forEach(([gameName, stats]) => {
    const avgGameTime = getAverageGameTime(gameName)
    totalMinutes += (stats.gamesPlayed || 0) * avgGameTime
  })

  return Math.round(totalMinutes) + " min"
}

function getAverageGameTime(gameName) {
  const avgTimes = {
    "tic-tac-toe": 2, // 2 minutes per game
    snake: 3, // 3 minutes per game
    "rock-paper-scissors": 1, // 1 minute per game
  }
  return avgTimes[gameName] || 2
}

function loadRecentActivity(user) {
  const recentActivityElement = document.getElementById("recentActivity")
  if (!recentActivityElement) return

  const activities = getRecentActivities(user)

  if (activities.length === 0) {
    recentActivityElement.innerHTML = `
            <div class="text-center text-muted py-4">
                <i class="fas fa-gamepad fa-3x mb-3"></i>
                <p>No recent activity. Start playing to see your game history!</p>
            </div>
        `
    return
  }

  const activitiesHTML = activities
    .map(
      (activity) => `
        <div class="activity-item d-flex align-items-center mb-3">
            <div class="activity-icon me-3">
                <i class="fas ${activity.icon} ${activity.color}"></i>
            </div>
            <div class="activity-content flex-grow-1">
                <div class="activity-title">${activity.title}</div>
                <small class="text-muted">${activity.time}</small>
            </div>
            <div class="activity-score">
                ${activity.score ? `<span class="badge bg-primary">${activity.score}</span>` : ""}
            </div>
        </div>
    `,
    )
    .join("")

  recentActivityElement.innerHTML = activitiesHTML
}

function getRecentActivities(user) {
  // This would normally come from a database
  // For now, we'll generate some sample activities based on user stats
  const activities = []
  const gameStats = user.gameStats || {}

  Object.entries(gameStats).forEach(([gameName, stats]) => {
    if (stats.gamesPlayed > 0) {
      activities.push({
        title: `Played ${formatGameName(gameName)}`,
        time: getRelativeTime(user.lastLogin || user.createdAt),
        icon: getGameIcon(gameName),
        color: getGameColor(gameName),
        score: stats.bestScore > 0 ? stats.bestScore : null,
      })
    }
  })

  return activities.slice(0, 5) // Show last 5 activities
}

function getGameIcon(gameName) {
  const icons = {
    "tic-tac-toe": "fa-th-large",
    snake: "fa-snake",
    "rock-paper-scissors": "fa-hand-rock",
  }
  return icons[gameName] || "fa-gamepad"
}

function getGameColor(gameName) {
  const colors = {
    "tic-tac-toe": "text-primary",
    snake: "text-success",
    "rock-paper-scissors": "text-warning",
  }
  return colors[gameName] || "text-secondary"
}

function getRelativeTime(dateString) {
  const date = new Date(dateString)
  const now = new Date()
  const diffInHours = Math.floor((now - date) / (1000 * 60 * 60))

  if (diffInHours < 1) return "Just now"
  if (diffInHours < 24) return `${diffInHours} hours ago`

  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 7) return `${diffInDays} days ago`

  return date.toLocaleDateString()
}

function initializeGameCards() {
  const gameCards = document.querySelectorAll(".game-card")

  gameCards.forEach((card) => {
    // Add hover effects
    card.addEventListener("mouseenter", function () {
      this.style.transform = "translateY(-5px)"
      this.style.boxShadow = "0 15px 35px rgba(0,0,0,0.1)"
    })

    card.addEventListener("mouseleave", function () {
      this.style.transform = "translateY(0)"
      this.style.boxShadow = ""
    })

    // Add click sound effect
    const playButton = card.querySelector('a[href*="games/"]')
    if (playButton) {
      playButton.addEventListener("click", () => {
        playClickSound()
      })
    }
  })
}

function isNewUser(user) {
  const createdAt = new Date(user.createdAt)
  const now = new Date()
  const diffInHours = (now - createdAt) / (1000 * 60 * 60)

  return diffInHours < 24 // Consider user new if account is less than 24 hours old
}

function showWelcomeMessage(user) {
  setTimeout(() => {
    showToast(`Welcome to FunZone, ${user.name}! 🎮 Ready to play some games?`, "success")
  }, 1000)
}

// Utility functions
function formatNumber(num) {
  return num.toLocaleString()
}

function getUserData() {
  const userData = localStorage.getItem("currentUser")
  return userData ? JSON.parse(userData) : null
}

function showToast(message, type) {
  // This function should be available from script.js
  if (window.FunZone && window.FunZone.showToast) {
    window.FunZone.showToast(message, type)
  } else {
    console.log(`Toast: ${message} (${type})`)
  }
}

function playClickSound() {
  // This function should be available from script.js
  if (window.FunZone && window.FunZone.playClickSound) {
    window.FunZone.playClickSound()
  }
}

// Auto-refresh stats every 30 seconds
setInterval(() => {
  const currentUser = getUserData()
  if (currentUser) {
    loadUserStatistics(currentUser)
  }
}, 30000)

// Handle logout
function logout() {
  localStorage.removeItem("currentUser")
  showToast("Logged out successfully! 👋", "success")
  setTimeout(() => {
    window.location.href = "index.html"
  }, 1000)
}

// Export functions for global access
window.logout = logout
