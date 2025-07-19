// Snake Game Logic
class SnakeGame {
  constructor() {
    this.canvas = document.getElementById("snakeCanvas")
    this.ctx = this.canvas.getContext("2d")
    this.gridSize = 20
    this.tileCount = this.canvas.width / this.gridSize

    this.snake = [{ x: 10, y: 10 }]
    this.food = this.generateFood()
    this.dx = 0
    this.dy = 0
    this.score = 0
    this.gameRunning = false
    this.gameLoop = null
    this.speed = 150
    this.gameStats = this.loadGameStats()

    this.init()
  }

  init() {
    this.bindEvents()
    this.updateDisplay()
    this.loadStats()
    this.draw()
  }

  bindEvents() {
    // Control buttons
    document.getElementById("startGame").addEventListener("click", () => this.startGame())
    document.getElementById("pauseGame").addEventListener("click", () => this.pauseGame())
    document.getElementById("resetGame").addEventListener("click", () => this.resetGame())

    // Keyboard controls
    document.addEventListener("keydown", (e) => this.handleKeyPress(e))

    // Prevent arrow keys from scrolling the page
    window.addEventListener("keydown", (e) => {
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(e.key)) {
        e.preventDefault()
      }
    })
  }

  handleKeyPress(event) {
    if (!this.gameRunning) return

    const key = event.key.toLowerCase()

    // Prevent reverse direction
    switch (key) {
      case "arrowup":
      case "w":
        if (this.dy === 0) {
          this.dx = 0
          this.dy = -1
        }
        break
      case "arrowdown":
      case "s":
        if (this.dy === 0) {
          this.dx = 0
          this.dy = 1
        }
        break
      case "arrowleft":
      case "a":
        if (this.dx === 0) {
          this.dx = -1
          this.dy = 0
        }
        break
      case "arrowright":
      case "d":
        if (this.dx === 0) {
          this.dx = 1
          this.dy = 0
        }
        break
      case " ":
        this.pauseGame()
        break
    }
  }

  startGame() {
    if (this.gameRunning) return

    this.gameRunning = true
    this.updateButtons()

    // Start moving right if no direction is set
    if (this.dx === 0 && this.dy === 0) {
      this.dx = 1
    }

    this.gameLoop = setInterval(() => this.update(), this.speed)
    this.playClickSound()
    this.showToast("Game started! Use WASD or arrow keys to move 🐍", "success")
  }

  pauseGame() {
    if (!this.gameRunning) return

    this.gameRunning = false
    clearInterval(this.gameLoop)
    this.updateButtons()
    this.playClickSound()
    this.showToast("Game paused ⏸️", "info")
  }

  resetGame() {
    this.gameRunning = false
    clearInterval(this.gameLoop)

    this.snake = [{ x: 10, y: 10 }]
    this.food = this.generateFood()
    this.dx = 0
    this.dy = 0
    this.score = 0
    this.speed = 150

    this.updateDisplay()
    this.updateButtons()
    this.hideGameOver()
    this.draw()
    this.playClickSound()
    this.showToast("Game reset! Ready for a new game? 🎮", "info")
  }

  update() {
    this.moveSnake()

    if (this.checkCollision()) {
      this.endGame()
      return
    }

    if (this.checkFoodCollision()) {
      this.eatFood()
    }

    this.draw()
  }

  moveSnake() {
    const head = { x: this.snake[0].x + this.dx, y: this.snake[0].y + this.dy }
    this.snake.unshift(head)

    // Remove tail if no food was eaten
    if (!this.foodEaten) {
      this.snake.pop()
    }
    this.foodEaten = false
  }

  checkCollision() {
    const head = this.snake[0]

    // Wall collision
    if (head.x < 0 || head.x >= this.tileCount || head.y < 0 || head.y >= this.tileCount) {
      return true
    }

    // Self collision
    for (let i = 1; i < this.snake.length; i++) {
      if (head.x === this.snake[i].x && head.y === this.snake[i].y) {
        return true
      }
    }

    return false
  }

  checkFoodCollision() {
    const head = this.snake[0]
    return head.x === this.food.x && head.y === this.food.y
  }

  eatFood() {
    this.score += 10
    this.foodEaten = true
    this.food = this.generateFood()

    // Increase speed slightly
    if (this.speed > 80) {
      this.speed -= 2
      clearInterval(this.gameLoop)
      this.gameLoop = setInterval(() => this.update(), this.speed)
    }

    this.updateDisplay()
    this.playClickSound()

    // Show encouragement
    if (this.score % 50 === 0) {
      this.showToast(`Great job! Score: ${this.score} 🎉`, "success")
    }
  }

  generateFood() {
    let food
    do {
      food = {
        x: Math.floor(Math.random() * this.tileCount),
        y: Math.floor(Math.random() * this.tileCount),
      }
    } while (this.snake.some((segment) => segment.x === food.x && segment.y === food.y))

    return food
  }

  draw() {
    // Clear canvas
    this.ctx.fillStyle = "#2d5a27"
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)

    // Draw snake
    this.ctx.fillStyle = "#4CAF50"
    this.snake.forEach((segment, index) => {
      if (index === 0) {
        // Draw head differently
        this.ctx.fillStyle = "#66BB6A"
      } else {
        this.ctx.fillStyle = "#4CAF50"
      }

      this.ctx.fillRect(
        segment.x * this.gridSize + 1,
        segment.y * this.gridSize + 1,
        this.gridSize - 2,
        this.gridSize - 2,
      )
    })

    // Draw food
    this.ctx.fillStyle = "#FF5722"
    this.ctx.beginPath()
    this.ctx.arc(
      this.food.x * this.gridSize + this.gridSize / 2,
      this.food.y * this.gridSize + this.gridSize / 2,
      this.gridSize / 2 - 2,
      0,
      2 * Math.PI,
    )
    this.ctx.fill()

    // Draw grid (optional)
    this.drawGrid()
  }

  drawGrid() {
    this.ctx.strokeStyle = "rgba(255, 255, 255, 0.1)"
    this.ctx.lineWidth = 1

    for (let i = 0; i <= this.tileCount; i++) {
      this.ctx.beginPath()
      this.ctx.moveTo(i * this.gridSize, 0)
      this.ctx.lineTo(i * this.gridSize, this.canvas.height)
      this.ctx.stroke()

      this.ctx.beginPath()
      this.ctx.moveTo(0, i * this.gridSize)
      this.ctx.lineTo(this.canvas.width, i * this.gridSize)
      this.ctx.stroke()
    }
  }

  endGame() {
    this.gameRunning = false
    clearInterval(this.gameLoop)

    this.updateStats()
    this.showGameOver()
    this.updateButtons()

    if (this.score > this.gameStats.bestScore) {
      this.showToast(`New high score: ${this.score}! 🏆`, "success")
      this.playWinSound()
      this.createConfetti()
    } else {
      this.showToast(`Game Over! Final score: ${this.score} 💀`, "warning")
      this.playLoseSound()
    }
  }

  showGameOver() {
    const gameOverScreen = document.getElementById("gameOverScreen")
    const finalScoreElement = document.getElementById("finalScore")

    if (gameOverScreen && finalScoreElement) {
      finalScoreElement.textContent = this.score
      gameOverScreen.style.display = "block"
    }

    // Add restart button functionality
    const restartButton = document.getElementById("restartGame")
    if (restartButton) {
      restartButton.onclick = () => this.resetGame()
    }
  }

  hideGameOver() {
    const gameOverScreen = document.getElementById("gameOverScreen")
    if (gameOverScreen) {
      gameOverScreen.style.display = "none"
    }
  }

  updateDisplay() {
    document.getElementById("currentScore").textContent = this.score
    document.getElementById("snakeLength").textContent = this.snake.length
    document.getElementById("gameSpeed").textContent = Math.max(1, Math.floor((200 - this.speed) / 20))
  }

  updateButtons() {
    const startButton = document.getElementById("startGame")
    const pauseButton = document.getElementById("pauseGame")

    if (this.gameRunning) {
      startButton.disabled = true
      pauseButton.disabled = false
      pauseButton.innerHTML = '<i class="fas fa-pause me-2"></i>Pause'
    } else {
      startButton.disabled = false
      pauseButton.disabled = true
      pauseButton.innerHTML = '<i class="fas fa-play me-2"></i>Resume'
    }
  }

  updateStats() {
    this.gameStats.gamesPlayed++
    this.gameStats.totalFood += Math.floor(this.score / 10)

    if (this.score > this.gameStats.bestScore) {
      this.gameStats.bestScore = this.score
    }

    if (this.snake.length > this.gameStats.longestSnake) {
      this.gameStats.longestSnake = this.snake.length
    }

    this.saveGameStats()
    this.loadStats()
    this.updateUserGameStats()
  }

  updateUserGameStats() {
    const currentUser = this.getUserData()
    if (!currentUser) return

    if (!currentUser.gameStats) currentUser.gameStats = {}
    if (!currentUser.gameStats["snake"]) {
      currentUser.gameStats["snake"] = {
        gamesPlayed: 0,
        gamesWon: 0,
        bestScore: 0,
        totalScore: 0,
        winStreak: 0,
        bestStreak: 0,
      }
    }

    const userStats = currentUser.gameStats["snake"]
    userStats.gamesPlayed++
    userStats.totalScore += this.score
    userStats.bestScore = Math.max(userStats.bestScore, this.score)

    this.saveUserData(currentUser)
  }

  loadStats() {
    document.getElementById("bestScore").textContent = this.gameStats.bestScore
    document.getElementById("gamesPlayed").textContent = this.gameStats.gamesPlayed
    document.getElementById("totalFood").textContent = this.gameStats.totalFood
    document.getElementById("longestSnake").textContent = this.gameStats.longestSnake
  }

  loadGameStats() {
    const stats = localStorage.getItem("snake_stats")
    return stats
      ? JSON.parse(stats)
      : {
          gamesPlayed: 0,
          bestScore: 0,
          totalFood: 0,
          longestSnake: 1,
        }
  }

  saveGameStats() {
    localStorage.setItem("snake_stats", JSON.stringify(this.gameStats))
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
  new SnakeGame()
})
