// Tic-Tac-Toe Game Logic
class TicTacToeGame {
  constructor() {
    this.board = Array(9).fill("")
    this.currentPlayer = "X"
    this.gameActive = true
    this.vsAI = false
    this.gameStats = this.loadGameStats()

    this.winningConditions = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8], // Rows
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8], // Columns
      [0, 4, 8],
      [2, 4, 6], // Diagonals
    ]

    this.init()
  }

  init() {
    this.bindEvents()
    this.updateDisplay()
    this.loadStats()
  }

  bindEvents() {
    // Board cell clicks
    document.querySelectorAll(".board-cell").forEach((cell, index) => {
      cell.addEventListener("click", () => this.handleCellClick(index))
    })

    // Control buttons
    const resetButton = document.getElementById("resetGame")
    const toggleButton = document.getElementById("toggleAI")

    if (resetButton) {
      resetButton.addEventListener("click", () => this.resetGame())
    }

    if (toggleButton) {
      toggleButton.addEventListener("click", () => this.toggleAI())
    }
  }

  handleCellClick(index) {
    if (!this.gameActive || this.board[index] !== "") return

    this.makeMove(index, this.currentPlayer)
    this.playClickSound()

    if (this.gameActive && this.vsAI && this.currentPlayer === "O") {
      setTimeout(() => this.makeAIMove(), 500)
    }
  }

  makeMove(index, player) {
    this.board[index] = player
    this.updateCell(index, player)

    if (this.checkWinner()) {
      this.endGame(player)
    } else if (this.board.every((cell) => cell !== "")) {
      this.endGame("draw")
    } else {
      this.currentPlayer = this.currentPlayer === "X" ? "O" : "X"
      this.updateStatus()
    }
  }

  makeAIMove() {
    if (!this.gameActive) return

    const bestMove = this.getBestMove()
    this.makeMove(bestMove, "O")
  }

  getBestMove() {
    // Simple AI using minimax algorithm
    let bestScore = Number.NEGATIVE_INFINITY
    let bestMove = 0

    for (let i = 0; i < 9; i++) {
      if (this.board[i] === "") {
        this.board[i] = "O"
        const score = this.minimax(this.board, 0, false)
        this.board[i] = ""

        if (score > bestScore) {
          bestScore = score
          bestMove = i
        }
      }
    }

    return bestMove
  }

  minimax(board, depth, isMaximizing) {
    const winner = this.checkWinnerForBoard(board)

    if (winner === "O") return 10 - depth
    if (winner === "X") return depth - 10
    if (board.every((cell) => cell !== "")) return 0

    if (isMaximizing) {
      let bestScore = Number.NEGATIVE_INFINITY
      for (let i = 0; i < 9; i++) {
        if (board[i] === "") {
          board[i] = "O"
          const score = this.minimax(board, depth + 1, false)
          board[i] = ""
          bestScore = Math.max(score, bestScore)
        }
      }
      return bestScore
    } else {
      let bestScore = Number.POSITIVE_INFINITY
      for (let i = 0; i < 9; i++) {
        if (board[i] === "") {
          board[i] = "X"
          const score = this.minimax(board, depth + 1, true)
          board[i] = ""
          bestScore = Math.min(score, bestScore)
        }
      }
      return bestScore
    }
  }

  checkWinner() {
    return this.checkWinnerForBoard(this.board)
  }

  checkWinnerForBoard(board) {
    for (const condition of this.winningConditions) {
      const [a, b, c] = condition
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return board[a]
      }
    }
    return null
  }

  updateCell(index, player) {
    const cell = document.querySelector(`[data-index="${index}"]`)
    if (cell) {
      cell.textContent = player
      cell.classList.add(player.toLowerCase())
      cell.style.transform = "scale(1.1)"
      setTimeout(() => {
        cell.style.transform = "scale(1)"
      }, 200)
    }
  }

  updateStatus() {
    const statusElement = document.getElementById("gameStatus")
    if (statusElement) {
      const playerName = this.vsAI && this.currentPlayer === "O" ? "AI" : `Player ${this.currentPlayer}`
      statusElement.innerHTML = `<h4 class="text-primary">${playerName}'s Turn</h4>`
    }
  }

  endGame(result) {
    this.gameActive = false
    const statusElement = document.getElementById("gameStatus")

    if (result === "draw") {
      statusElement.innerHTML = '<h4 class="text-warning">It\'s a Draw! 🤝</h4>'
      this.showToast("It's a draw! Good game! 🤝", "info")
    } else {
      const winnerName = this.vsAI && result === "O" ? "AI" : `Player ${result}`
      statusElement.innerHTML = `<h4 class="text-success">${winnerName} Wins! 🎉</h4>`

      if (result === "X" || (this.vsAI && result === "O")) {
        this.playWinSound()
        this.createConfetti()
        this.showToast(`${winnerName} wins! 🎉`, "success")
      } else {
        this.playLoseSound()
        this.showToast("Better luck next time! 💪", "warning")
      }
    }

    // Update statistics
    this.updateStats(result)
    this.highlightWinningCells(result)
  }

  highlightWinningCells(winner) {
    if (winner === "draw") return

    for (const condition of this.winningConditions) {
      const [a, b, c] = condition
      if (this.board[a] === winner && this.board[b] === winner && this.board[c] === winner) {
        ;[a, b, c].forEach((index) => {
          const cell = document.querySelector(`[data-index="${index}"]`)
          if (cell) {
            cell.style.backgroundColor = winner === "X" ? "#d4edda" : "#f8d7da"
            cell.style.animation = "pulse 0.5s ease-in-out 3"
          }
        })
        break
      }
    }
  }

  resetGame() {
    this.board = Array(9).fill("")
    this.currentPlayer = "X"
    this.gameActive = true

    // Clear board display
    document.querySelectorAll(".board-cell").forEach((cell) => {
      cell.textContent = ""
      cell.className = "board-cell"
      cell.style.backgroundColor = ""
      cell.style.animation = ""
    })

    this.updateStatus()
    this.playClickSound()
  }

  toggleAI() {
    this.vsAI = !this.vsAI
    const toggleButton = document.getElementById("toggleAI")

    if (this.vsAI) {
      toggleButton.innerHTML = '<i class="fas fa-user me-2"></i>Play vs Human'
      toggleButton.classList.remove("btn-info")
      toggleButton.classList.add("btn-success")
      this.showToast("AI mode enabled! 🤖", "info")
    } else {
      toggleButton.innerHTML = '<i class="fas fa-robot me-2"></i>Play vs AI'
      toggleButton.classList.remove("btn-success")
      toggleButton.classList.add("btn-info")
      this.showToast("Human vs Human mode! 👥", "info")
    }

    this.resetGame()
  }

  updateStats(result) {
    this.gameStats.gamesPlayed++

    if (result === "X") {
      this.gameStats.playerXWins++
      if (!this.vsAI) {
        this.gameStats.currentStreak++
      }
    } else if (result === "O") {
      this.gameStats.playerOWins++
      if (this.vsAI) {
        this.gameStats.currentStreak = 0
      } else {
        this.gameStats.currentStreak++
      }
    } else {
      this.gameStats.draws++
      this.gameStats.currentStreak = 0
    }

    // Update best streak
    if (this.gameStats.currentStreak > this.gameStats.bestStreak) {
      this.gameStats.bestStreak = this.gameStats.currentStreak
    }

    this.saveGameStats()
    this.loadStats()

    // Update user's overall game stats
    this.updateUserGameStats(result)
  }

  updateUserGameStats(result) {
    const currentUser = this.getUserData()
    if (!currentUser) return

    if (!currentUser.gameStats) currentUser.gameStats = {}
    if (!currentUser.gameStats["tic-tac-toe"]) {
      currentUser.gameStats["tic-tac-toe"] = {
        gamesPlayed: 0,
        gamesWon: 0,
        bestScore: 0,
        totalScore: 0,
        winStreak: 0,
        bestStreak: 0,
      }
    }

    const userStats = currentUser.gameStats["tic-tac-toe"]
    userStats.gamesPlayed++

    let gameResult = "draw"
    if (result === "X" || (this.vsAI && result === "O")) {
      userStats.gamesWon++
      userStats.totalScore += 100 // 100 points per win
      userStats.winStreak++
      userStats.bestStreak = Math.max(userStats.bestStreak, userStats.winStreak)
      gameResult = "win"
    } else if (result !== "draw") {
      userStats.winStreak = 0
      gameResult = "lose"
    }

    this.saveUserData(currentUser)

    // Add to recent activity
    this.addRecentActivity("Tic-Tac-Toe", gameResult, gameResult === "win" ? 100 : 0)
  }

  loadStats() {
    document.getElementById("gamesPlayed").textContent = this.gameStats.gamesPlayed
    document.getElementById("playerXWins").textContent = this.gameStats.playerXWins
    document.getElementById("playerOWins").textContent = this.gameStats.playerOWins
    document.getElementById("draws").textContent = this.gameStats.draws
    document.getElementById("currentStreak").textContent = this.gameStats.currentStreak
  }

  loadGameStats() {
    const stats = localStorage.getItem("tictactoe_stats")
    return stats
      ? JSON.parse(stats)
      : {
          gamesPlayed: 0,
          playerXWins: 0,
          playerOWins: 0,
          draws: 0,
          currentStreak: 0,
          bestStreak: 0,
        }
  }

  saveGameStats() {
    localStorage.setItem("tictactoe_stats", JSON.stringify(this.gameStats))
  }

  // Utility functions
  getUserData() {
    const userData = localStorage.getItem("currentUser")
    return userData ? JSON.parse(userData) : null
  }

  saveUserData(userData) {
    localStorage.setItem("currentUser", JSON.stringify(userData))
  }

  showToast(message, type) {
    if (window.FunZone && window.FunZone.showToast) {
      window.FunZone.showToast(message, type)
    }
  }

  playClickSound() {
    if (window.FunZone && window.FunZone.playClickSound) {
      window.FunZone.playClickSound()
    }
  }

  playWinSound() {
    if (window.FunZone && window.FunZone.playWinSound) {
      window.FunZone.playWinSound()
    }
  }

  playLoseSound() {
    if (window.FunZone && window.FunZone.playLoseSound) {
      window.FunZone.playLoseSound()
    }
  }

  createConfetti() {
    if (window.FunZone && window.FunZone.createConfetti) {
      window.FunZone.createConfetti()
    }
  }

  updateDisplay() {
    this.updateStatus()
  }

  addRecentActivity(game, result, score = null) {
    const user = this.getUserData()
    if (!user) return

    const activity = {
      game: game,
      result: result,
      score: score,
      timestamp: new Date().toISOString(),
    }

    const recentActivity = JSON.parse(localStorage.getItem("recentActivity_" + user.id) || "[]")
    recentActivity.unshift(activity)

    // Keep only last 10 activities
    if (recentActivity.length > 10) {
      recentActivity.splice(10)
    }

    localStorage.setItem("recentActivity_" + user.id, JSON.stringify(recentActivity))
  }
}

// Initialize game when page loads
document.addEventListener("DOMContentLoaded", () => {
  // Check if user is logged in
  const currentUser = localStorage.getItem("currentUser")
  if (!currentUser) {
    window.location.href = "../login.html"
    return
  }

  // Initialize the game
  new TicTacToeGame()
})
