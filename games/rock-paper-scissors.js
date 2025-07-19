// Rock Paper Scissors Game Logic
class RockPaperScissorsGame {
  constructor() {
    this.choices = ["rock", "paper", "scissors"]
    this.playerScore = 0
    this.computerScore = 0
    this.gameStats = this.loadGameStats()
    this.gameHistory = []

    this.choiceIcons = {
      rock: "fa-hand-rock",
      paper: "fa-hand-paper",
      scissors: "fa-hand-scissors",
    }

    this.choiceColors = {
      rock: "text-primary",
      paper: "text-success",
      scissors: "text-warning",
    }

    this.init()
  }

  init() {
    this.bindEvents()
    this.updateDisplay()
    this.loadStats()
    this.loadHistory()
  }

  bindEvents() {
    // Choice buttons
    document.querySelectorAll(".choice-btn").forEach((button) => {
      button.addEventListener("click", (e) => {
        const choice = e.currentTarget.dataset.choice
        this.playRound(choice)
      })
    })

    // Reset button
    document.getElementById("resetGame").addEventListener("click", () => this.resetGame())
  }

  playRound(playerChoice) {
    const computerChoice = this.getComputerChoice()
    const result = this.determineWinner(playerChoice, computerChoice)

    this.animateChoices(playerChoice, computerChoice)
    this.playClickSound()

    setTimeout(() => {
      this.showResult(result, playerChoice, computerChoice)
      this.updateScore(result)
      this.updateStats(result)
      this.addToHistory(playerChoice, computerChoice, result)
    }, 1000)
  }

  getComputerChoice() {
    return this.choices[Math.floor(Math.random() * this.choices.length)]
  }

  determineWinner(playerChoice, computerChoice) {
    if (playerChoice === computerChoice) {
      return "tie"
    }

    const winConditions = {
      rock: "scissors",
      paper: "rock",
      scissors: "paper",
    }

    return winConditions[playerChoice] === computerChoice ? "win" : "lose"
  }

  animateChoices(playerChoice, computerChoice) {
    const playerDisplay = document.getElementById("playerChoice")
    const computerDisplay = document.getElementById("computerChoice")

    // Show thinking animation
    this.showThinkingAnimation()

    setTimeout(() => {
      // Show actual choices
      this.displayChoice(playerDisplay, playerChoice, "You chose")
      this.displayChoice(computerDisplay, computerChoice, "Computer chose")
    }, 800)
  }

  showThinkingAnimation() {
    const playerDisplay = document.getElementById("playerChoice")
    const computerDisplay = document.getElementById("computerChoice")

    let animationCount = 0
    const animationInterval = setInterval(() => {
      const randomChoice = this.choices[Math.floor(Math.random() * this.choices.length)]

      playerDisplay.innerHTML = `<i class="fas ${this.choiceIcons[randomChoice]} fa-4x text-muted"></i>`
      computerDisplay.innerHTML = `<i class="fas ${this.choiceIcons[randomChoice]} fa-4x text-muted"></i>`

      animationCount++
      if (animationCount >= 6) {
        clearInterval(animationInterval)
      }
    }, 100)
  }

  displayChoice(element, choice, label) {
    element.innerHTML = `<i class="fas ${this.choiceIcons[choice]} fa-4x ${this.choiceColors[choice]}"></i>`
    element.parentElement.querySelector("p").textContent = label

    // Add animation
    element.style.transform = "scale(1.2)"
    setTimeout(() => {
      element.style.transform = "scale(1)"
    }, 300)
  }

  showResult(result, playerChoice, computerChoice) {
    const resultElement = document.getElementById("gameResult")
    let message, className

    switch (result) {
      case "win":
        message = `🎉 You Win! ${this.capitalize(playerChoice)} beats ${computerChoice}!`
        className = "result-win"
        this.playWinSound()
        break
      case "lose":
        message = `😔 You Lose! ${this.capitalize(computerChoice)} beats ${playerChoice}!`
        className = "result-lose"
        this.playLoseSound()
        break
      case "tie":
        message = `🤝 It's a Tie! Both chose ${playerChoice}!`
        className = "result-tie"
        this.playClickSound()
        break
    }

    resultElement.innerHTML = `<h3>${message}</h3>`
    resultElement.className = `game-result ${className}`

    // Show toast
    this.showToast(message, result === "win" ? "success" : result === "lose" ? "warning" : "info")

    // Add confetti for wins
    if (result === "win") {
      this.createConfetti()
    }
  }

  updateScore(result) {
    if (result === "win") {
      this.playerScore++
    } else if (result === "lose") {
      this.computerScore++
    }

    document.getElementById("playerScore").textContent = this.playerScore
    document.getElementById("computerScore").textContent = this.computerScore
  }

  updateStats(result) {
    this.gameStats.gamesPlayed++

    if (result === "win") {
      this.gameStats.gamesWon++
      this.gameStats.currentStreak++
      this.gameStats.bestStreak = Math.max(this.gameStats.bestStreak, this.gameStats.currentStreak)
    } else {
      this.gameStats.currentStreak = 0
    }

    this.saveGameStats()
    this.loadStats()
    this.updateUserGameStats(result)
  }

  updateUserGameStats(result) {
    const currentUser = this.getUserData()
    if (!currentUser) return

    if (!currentUser.gameStats) currentUser.gameStats = {}
    if (!currentUser.gameStats["rock-paper-scissors"]) {
      currentUser.gameStats["rock-paper-scissors"] = {
        gamesPlayed: 0,
        gamesWon: 0,
        bestScore: 0,
        totalScore: 0,
        winStreak: 0,
        bestStreak: 0,
      }
    }

    const userStats = currentUser.gameStats["rock-paper-scissors"]
    userStats.gamesPlayed++

    if (result === "win") {
      userStats.gamesWon++
      userStats.totalScore += 50 // 50 points per win
      userStats.winStreak++
      userStats.bestStreak = Math.max(userStats.bestStreak, userStats.winStreak)
    } else {
      userStats.winStreak = 0
    }

    this.saveUserData(currentUser)
  }

  addToHistory(playerChoice, computerChoice, result) {
    const historyItem = {
      playerChoice,
      computerChoice,
      result,
      timestamp: new Date(),
    }

    this.gameHistory.unshift(historyItem)

    // Keep only last 10 games
    if (this.gameHistory.length > 10) {
      this.gameHistory = this.gameHistory.slice(0, 10)
    }

    this.loadHistory()
  }

  loadHistory() {
    const historyElement = document.getElementById("gameHistory")
    if (!historyElement) return

    if (this.gameHistory.length === 0) {
      historyElement.innerHTML = '<p class="text-muted text-center">No games played yet</p>'
      return
    }

    const historyHTML = this.gameHistory
      .map((game) => {
        const resultIcon = game.result === "win" ? "✅" : game.result === "lose" ? "❌" : "🤝"
        const resultText = game.result === "win" ? "Won" : game.result === "lose" ? "Lost" : "Tied"

        return `
                <div class="history-item">
                    <span>
                        <i class="fas ${this.choiceIcons[game.playerChoice]} ${this.choiceColors[game.playerChoice]} me-1"></i>
                        vs
                        <i class="fas ${this.choiceIcons[game.computerChoice]} ${this.choiceColors[game.computerChoice]} ms-1"></i>
                    </span>
                    <span>${resultIcon} ${resultText}</span>
                </div>
            `
      })
      .join("")

    historyElement.innerHTML = historyHTML
  }

  resetGame() {
    this.playerScore = 0
    this.computerScore = 0
    this.gameHistory = []

    // Reset display
    document.getElementById("playerScore").textContent = "0"
    document.getElementById("computerScore").textContent = "0"
    document.getElementById("playerChoice").innerHTML = '<i class="fas fa-question fa-4x text-muted"></i>'
    document.getElementById("computerChoice").innerHTML = '<i class="fas fa-question fa-4x text-muted"></i>'
    document.getElementById("gameResult").innerHTML = '<h3 class="text-muted">Choose your weapon!</h3>'

    // Reset choice descriptions
    document.querySelector(".player-section p").textContent = "Make your choice!"
    document.querySelector(".computer-section p").textContent = "Thinking..."

    this.loadHistory()
    this.playClickSound()
    this.showToast("Game reset! Ready for a new match? 🎮", "info")
  }

  updateDisplay() {
    document.getElementById("playerScore").textContent = this.playerScore
    document.getElementById("computerScore").textContent = this.computerScore
  }

  loadStats() {
    document.getElementById("gamesPlayed").textContent = this.gameStats.gamesPlayed
    document.getElementById("winRate").textContent = this.calculateWinRate() + "%"
    document.getElementById("currentStreak").textContent = this.gameStats.currentStreak
    document.getElementById("bestStreak").textContent = this.gameStats.bestStreak
  }

  calculateWinRate() {
    if (this.gameStats.gamesPlayed === 0) return 0
    return Math.round((this.gameStats.gamesWon / this.gameStats.gamesPlayed) * 100)
  }

  loadGameStats() {
    const stats = localStorage.getItem("rps_stats")
    return stats
      ? JSON.parse(stats)
      : {
          gamesPlayed: 0,
          gamesWon: 0,
          currentStreak: 0,
          bestStreak: 0,
        }
  }

  saveGameStats() {
    localStorage.setItem("rps_stats", JSON.stringify(this.gameStats))
  }

  capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1)
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
  new RockPaperScissorsGame()
})
