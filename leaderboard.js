// Leaderboard functionality
document.addEventListener("DOMContentLoaded", () => {
  initializeLeaderboard()
})

function initializeLeaderboard() {
  // Check if user is logged inn
  const currentUser = getUserData()
  if (!currentUser) {
    window.location.href = "login.html"
    return
  }

  // Update user interfacee
  updateUserInterface(currentUser)

  // Load leaderboard dataa
  loadLeaderboard()

  // Initialize filter
  initializeFilter()

  // Load user achievements
  loadUserAchievements(currentUser)

  // Load weekly stats
  loadWeeklyStats(currentUser)
}

function updateUserInterface(user) {
  const userNameElement = document.getElementById("userNameNav")
  if (userNameElement) {
    userNameElement.textContent = user.name
  }
}

function loadLeaderboard() {
  // Generate mock leaderboard data
  const leaderboardData = generateLeaderboardData()
  const currentUser = getUserData()

  // Update leaderboard table
  updateLeaderboardTable(leaderboardData, currentUser)
}

function generateLeaderboardData() {
  // Mock data for demonstration
  const mockPlayers = [
    { name: "GameMaster2024", score: 15420, gamesPlayed: 156, winRate: 89 },
    { name: "SnakeCharmer", score: 12890, gamesPlayed: 134, winRate: 85 },
    { name: "TicTacPro", score: 11250, gamesPlayed: 98, winRate: 92 },
    { name: "RockPaperWin", score: 9870, gamesPlayed: 87, winRate: 78 },
    { name: "QuickFingers", score: 8640, gamesPlayed: 76, winRate: 81 },
    { name: "PuzzleMaster", score: 7320, gamesPlayed: 65, winRate: 74 },
    { name: "SpeedRunner", score: 6890, gamesPlayed: 58, winRate: 79 },
    { name: "StrategyKing", score: 5670, gamesPlayed: 52, winRate: 68 },
    { name: "GameNinja", score: 4560, gamesPlayed: 45, winRate: 71 },
    { name: "ArcadeHero", score: 3890, gamesPlayed: 38, winRate: 65 },
  ]

  // Add current user to the list
  const currentUser = getUserData()
  if (currentUser) {
    const userStats = calculateUserOverallStats(currentUser)
    mockPlayers.push({
      name: currentUser.name,
      score: userStats.totalScore,
      gamesPlayed: userStats.totalGamesPlayed,
      winRate: userStats.winRate,
      isCurrentUser: true,
    })
  }

  // Sort by score
  return mockPlayers.sort((a, b) => b.score - a.score)
}

function calculateUserOverallStats(user) {
  let totalGamesPlayed = 0
  let totalGamesWon = 0
  let totalScore = 0

  Object.values(user.gameStats || {}).forEach((gameStats) => {
    totalGamesPlayed += gameStats.gamesPlayed || 0
    totalGamesWon += gameStats.gamesWon || 0
    totalScore += gameStats.totalScore || 0
  })

  const winRate = totalGamesPlayed > 0 ? Math.round((totalGamesWon / totalGamesPlayed) * 100) : 0

  return {
    totalGamesPlayed,
    totalGamesWon,
    totalScore,
    winRate,
  }
}

function updateLeaderboardTable(leaderboardData, currentUser) {
  const tableBody = document.getElementById("leaderboardTable")
  if (!tableBody) return

  const tableHTML = leaderboardData
    .map((player, index) => {
      const rank = index + 1
      const isCurrentUser = player.isCurrentUser
      const rowClass = isCurrentUser ? "table-warning" : ""

      let rankBadge
      if (rank === 1) {
        rankBadge = `<span class="rank-badge rank-1">${rank}</span>`
      } else if (rank === 2) {
        rankBadge = `<span class="rank-badge rank-2">${rank}</span>`
      } else if (rank === 3) {
        rankBadge = `<span class="rank-badge rank-3">${rank}</span>`
      } else {
        rankBadge = `<span class="rank-badge">${rank}</span>`
      }

      let playerName = player.name
      if (rank <= 3) {
        const icon = rank === 1 ? "fa-crown text-warning" : "fa-medal text-secondary"
        playerName = `
                <div class="d-flex align-items-center">
                    <i class="fas ${icon} me-2"></i>
                    <strong>${player.name}</strong>
                </div>
            `
      } else {
        playerName = `<strong>${player.name}</strong>`
      }

      if (isCurrentUser) {
        playerName += ' <small class="text-muted ms-2">(Your Rank)</small>'
      }

      const scoreColor = rank <= 3 ? "text-success" : "text-primary"
      const winRateBadge = player.winRate >= 80 ? "bg-success" : "bg-primary"

      return `
            <tr class="${rowClass}">
                <td>${rankBadge}</td>
                <td>${playerName}</td>
                <td><span class="fw-bold ${scoreColor}">${formatNumber(player.score)}</span></td>
                <td>${player.gamesPlayed}</td>
                <td><span class="badge ${winRateBadge}">${player.winRate}%</span></td>
            </tr>
        `
    })
    .join("")

  tableBody.innerHTML = tableHTML
}

function initializeFilter() {
  const filterSelect = document.getElementById("gameFilter")
  if (!filterSelect) return

  filterSelect.addEventListener("change", function () {
    const selectedGame = this.value
    loadLeaderboard(selectedGame)
    showToast(`Showing ${selectedGame === "overall" ? "overall" : selectedGame} leaderboard 📊`, "info")
  })
}

function loadUserAchievements(user) {
  const achievements = getUserAchievements(user)
  updateAchievementsDisplay(achievements)
}

function getUserAchievements(user) {
  const achievements = [
    {
      id: "first_win",
      name: "First Win",
      icon: "fa-trophy text-warning",
      unlocked: hasFirstWin(user),
    },
    {
      id: "win_streak_5",
      name: "5 Win Streak",
      icon: "fa-fire text-danger",
      unlocked: hasWinStreak(user, 5),
    },
    {
      id: "play_50_games",
      name: "Play 50 Games",
      icon: "fa-gamepad text-primary",
      unlocked: hasPlayedGames(user, 50),
    },
    {
      id: "top_10",
      name: "Reach Top 10",
      icon: "fa-crown text-warning",
      unlocked: false, // This would be calculated based on actual leaderboard position
    },
  ]

  return achievements
}

function hasFirstWin(user) {
  const gameStats = user.gameStats || {}
  return Object.values(gameStats).some((stats) => stats.gamesWon > 0)
}

function hasWinStreak(user, streakLength) {
  const gameStats = user.gameStats || {}
  return Object.values(gameStats).some((stats) => stats.bestStreak >= streakLength)
}

function hasPlayedGames(user, gameCount) {
  const gameStats = user.gameStats || {}
  const totalGames = Object.values(gameStats).reduce((total, stats) => total + (stats.gamesPlayed || 0), 0)
  return totalGames >= gameCount
}

function updateAchievementsDisplay(achievements) {
  const achievementsContainer = document.querySelector(".card-body")
  if (!achievementsContainer) return

  const achievementsHTML = achievements
    .map((achievement) => {
      const statusIcon = achievement.unlocked
        ? '<i class="fas fa-check text-success ms-auto"></i>'
        : '<i class="fas fa-times text-muted ms-auto"></i>'

      return `
            <div class="achievement-item">
                <i class="fas ${achievement.icon} me-2"></i>
                <span>${achievement.name}</span>
                ${statusIcon}
            </div>
        `
    })
    .join("")

  // Find the achievements card body and update it
  const achievementsCard = document.querySelector('.card-header h6:contains("Your Achievements")')
  if (achievementsCard) {
    const cardBody = achievementsCard.closest(".card").querySelector(".card-body")
    if (cardBody) {
      cardBody.innerHTML = achievementsHTML
    }
  }
}

function loadWeeklyStats(user) {
  // Generate mock weekly stats
  const weeklyStats = {
    gamesThisWeek: 12,
    winsThisWeek: 8,
    pointsEarned: 450,
    rankChange: 3,
  }

  updateWeeklyStatsDisplay(weeklyStats)
}

function updateWeeklyStatsDisplay(stats) {
  const elements = {
    gamesThisWeek: document.querySelector(".stat-row:nth-child(1) .fw-bold"),
    winsThisWeek: document.querySelector(".stat-row:nth-child(2) .fw-bold"),
    pointsEarned: document.querySelector(".stat-row:nth-child(3) .fw-bold"),
    rankChange: document.querySelector(".stat-row:nth-child(4) .fw-bold"),
  }

  if (elements.gamesThisWeek) elements.gamesThisWeek.textContent = stats.gamesThisWeek
  if (elements.winsThisWeek) elements.winsThisWeek.textContent = stats.winsThisWeek
  if (elements.pointsEarned) elements.pointsEarned.textContent = `+${stats.pointsEarned}`
  if (elements.rankChange) {
    const changeText = stats.rankChange > 0 ? `+${stats.rankChange} ↗` : `${stats.rankChange} ↘`
    const changeClass = stats.rankChange > 0 ? "text-success" : "text-danger"
    elements.rankChange.innerHTML = `<span class="${changeClass}">${changeText}</span>`
  }
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
  if (window.FunZone && window.FunZone.showToast) {
    window.FunZone.showToast(message, type)
  } else {
    console.log(`Toast: ${message} (${type})`)
  }
}

function logout() {
  localStorage.removeItem("currentUser")
  showToast("Logged out successfully! 👋", "success")
  setTimeout(() => {
    window.location.href = "index.html"
  }, 1000)
}

// Export functions for global access
window.logout = logout

// Auto-refresh leaderboard every 60 seconds
setInterval(() => {
  loadLeaderboard()
}, 60000)
