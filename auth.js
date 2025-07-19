// Authentication functionality
document.addEventListener("DOMContentLoaded", () => {
  const currentPage = getCurrentPage()

  if (currentPage === "login") {
    initializeLoginPage()
  } else if (currentPage === "register") {
    initializeRegisterPage()
  }

  // Initialize demo users on page load
  createDemoUsers()
})

function initializeLoginPage() {
  const loginForm = document.getElementById("loginForm")
  if (!loginForm) return

  loginForm.addEventListener("submit", handleLogin)

  // Add real-time validation
  const emailField = document.getElementById("email")
  const passwordField = document.getElementById("password")

  if (emailField) {
    emailField.addEventListener("blur", () => validateEmailField(emailField.value))
    emailField.addEventListener("input", () => clearFieldError("email"))
  }

  if (passwordField) {
    passwordField.addEventListener("blur", () => validatePasswordField(passwordField.value))
    passwordField.addEventListener("input", () => clearFieldError("password"))
  }
}

function initializeRegisterPage() {
  const registerForm = document.getElementById("registerForm")
  if (!registerForm) return

  registerForm.addEventListener("submit", handleRegister)

  // Add real-time validation
  const nameField = document.getElementById("name")
  const emailField = document.getElementById("email")
  const passwordField = document.getElementById("password")
  const confirmPasswordField = document.getElementById("confirmPassword")
  const agreeTermsField = document.getElementById("agreeTerms")

  if (nameField) {
    nameField.addEventListener("blur", () => validateNameField(nameField.value))
    nameField.addEventListener("input", () => clearFieldError("name"))
  }

  if (emailField) {
    emailField.addEventListener("blur", () => validateEmailField(emailField.value))
    emailField.addEventListener("input", () => clearFieldError("email"))
  }

  if (passwordField) {
    passwordField.addEventListener("blur", () => validatePasswordField(passwordField.value))
    passwordField.addEventListener("input", () => clearFieldError("password"))
  }

  if (confirmPasswordField) {
    confirmPasswordField.addEventListener("blur", () => {
      const password = document.getElementById("password").value
      validateConfirmPasswordField(password, confirmPasswordField.value)
    })
    confirmPasswordField.addEventListener("input", () => clearFieldError("confirmPassword"))
  }

  if (agreeTermsField) {
    agreeTermsField.addEventListener("change", () => validateTermsField(agreeTermsField.checked))
  }
}

function handleLogin(event) {
  event.preventDefault()

  const email = document.getElementById("email").value.trim()
  const password = document.getElementById("password").value
  const rememberMe = document.getElementById("rememberMe").checked

  // Clear previous errors
  clearAllErrors()

  // Validate fields
  let isValid = true

  if (!validateEmailField(email)) isValid = false
  if (!validatePasswordField(password)) isValid = false

  if (!isValid) return

  // Check if user exists
  const users = getStorageItem("users", [])
  const user = users.find((u) => u.email === email && u.password === password)

  if (!user) {
    showFieldError("email", "Invalid email or password")
    showToast("Login failed. Please check your credentials.", "error")
    return
  }

  // Update last login
  user.lastLogin = new Date().toISOString()
  user.rememberMe = rememberMe

  // Save updated user data
  const userIndex = users.findIndex((u) => u.email === email)
  users[userIndex] = user
  setStorageItem("users", users)

  // Set current user
  setStorageItem("currentUser", user)

  // Show success message
  showToast(`Welcome back, ${user.name}! 🎮`, "success")

  // Redirect to dashboard immediately
  window.location.href = "dashboard.html"
}

function handleRegister(event) {
  event.preventDefault()

  const name = document.getElementById("name").value.trim()
  const email = document.getElementById("email").value.trim()
  const password = document.getElementById("password").value
  const confirmPassword = document.getElementById("confirmPassword").value
  const agreeTerms = document.getElementById("agreeTerms").checked

  // Clear previous errors
  clearAllErrors()

  // Validate all fields
  let isValid = true

  if (!validateNameField(name)) isValid = false
  if (!validateEmailField(email)) isValid = false
  if (!validatePasswordField(password)) isValid = false
  if (!validateConfirmPasswordField(password, confirmPassword)) isValid = false
  if (!validateTermsField(agreeTerms)) isValid = false

  if (!isValid) return

  // Check if user already exists
  const users = getStorageItem("users", [])
  const existingUser = users.find((u) => u.email === email)

  if (existingUser) {
    showFieldError("email", "An account with this email already exists")
    showToast("Registration failed. Email already in use.", "error")
    return
  }

  // Create new user
  const newUser = {
    id: generateUserId(),
    name: name,
    email: email,
    password: password, // In a real app, this would be hashed
    createdAt: new Date().toISOString(),
    lastLogin: null,
    gameStats: {
      "tic-tac-toe": { gamesPlayed: 0, gamesWon: 0, bestScore: 0, totalScore: 0, winStreak: 0, bestStreak: 0 },
      snake: { gamesPlayed: 0, gamesWon: 0, bestScore: 0, totalScore: 0, winStreak: 0, bestStreak: 0 },
      "rock-paper-scissors": { gamesPlayed: 0, gamesWon: 0, bestScore: 0, totalScore: 0, winStreak: 0, bestStreak: 0 },
    },
    achievements: [],
    preferences: {
      soundEnabled: true,
    },
  }

  // Save user
  users.push(newUser)
  setStorageItem("users", users)

  // Show success modal
  const successModalElement = document.getElementById("successModal")
  if (successModalElement) {
    const successModal = window.bootstrap.Modal(successModalElement)
    successModal.show()
  }

  // Show success message
  showToast("Account created successfully! 🎉", "success")
}

// Validation functions
function validateNameField(name) {
  if (!name) {
    showFieldError("name", "Name is required")
    return false
  }

  if (name.length < 2) {
    showFieldError("name", "Name must be at least 2 characters long")
    return false
  }

  if (name.length > 50) {
    showFieldError("name", "Name must be less than 50 characters")
    return false
  }

  // Allow letters, spaces, hyphens, and apostrophes
  if (!/^[a-zA-Z\s\-']+$/.test(name)) {
    showFieldError("name", "Name can only contain letters, spaces, hyphens, and apostrophes")
    return false
  }

  clearFieldError("name")
  return true
}

function validateEmailField(email) {
  if (!email) {
    showFieldError("email", "Email is required")
    return false
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    showFieldError("email", "Please enter a valid email address")
    return false
  }

  clearFieldError("email")
  return true
}

function validatePasswordField(password) {
  if (!password) {
    showFieldError("password", "Password is required")
    return false
  }

  if (password.length < 6) {
    showFieldError("password", "Password must be at least 6 characters long")
    return false
  }

  if (password.length > 100) {
    showFieldError("password", "Password must be less than 100 characters")
    return false
  }

  // Check for at least one letter and one number
  if (!/(?=.*[a-zA-Z])(?=.*\d)/.test(password)) {
    showFieldError("password", "Password must contain at least one letter and one number")
    return false
  }

  clearFieldError("password")
  return true
}

function validateConfirmPasswordField(password, confirmPassword) {
  if (!confirmPassword) {
    showFieldError("confirmPassword", "Please confirm your password")
    return false
  }

  if (password !== confirmPassword) {
    showFieldError("confirmPassword", "Passwords do not match")
    return false
  }

  clearFieldError("confirmPassword")
  return true
}

function validateTermsField(agreeTerms) {
  if (!agreeTerms) {
    showFieldError("agreeTerms", "You must agree to the Terms of Service")
    return false
  }

  clearFieldError("agreeTerms")
  return true
}

// Error handling functions
function showFieldError(fieldName, message) {
  const field = document.getElementById(fieldName)
  const errorElement = document.getElementById(fieldName + "Error")

  if (field) {
    field.classList.add("is-invalid")
  }

  if (errorElement) {
    errorElement.textContent = message
    errorElement.style.display = "block"
  }
}

function clearFieldError(fieldName) {
  const field = document.getElementById(fieldName)
  const errorElement = document.getElementById(fieldName + "Error")

  if (field) {
    field.classList.remove("is-invalid")
  }

  if (errorElement) {
    errorElement.textContent = ""
    errorElement.style.display = "none"
  }
}

function clearAllErrors() {
  const errorElements = document.querySelectorAll(".invalid-feedback")
  const invalidFields = document.querySelectorAll(".is-invalid")

  errorElements.forEach((element) => {
    element.textContent = ""
    element.style.display = "none"
  })

  invalidFields.forEach((field) => {
    field.classList.remove("is-invalid")
  })
}

// Utility functions
function generateUserId() {
  return "user_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9)
}

function getCurrentPage() {
  const path = window.location.pathname
  if (path.includes("login")) return "login"
  if (path.includes("register")) return "register"
  return "unknown"
}

// Demo user creation (for testing)
function createDemoUsers() {
  const users = getStorageItem("users", [])

  if (users.length === 0) {
    const demoUsers = [
      {
        id: "demo_user_1",
        name: "Demo Player",
        email: "demo@funzone.com",
        password: "demo123",
        createdAt: new Date().toISOString(),
        lastLogin: null,
        gameStats: {
          "tic-tac-toe": { gamesPlayed: 15, gamesWon: 10, bestScore: 0, totalScore: 1000, winStreak: 3, bestStreak: 5 },
          snake: { gamesPlayed: 8, gamesWon: 0, bestScore: 450, totalScore: 1200, winStreak: 0, bestStreak: 0 },
          "rock-paper-scissors": {
            gamesPlayed: 20,
            gamesWon: 12,
            bestScore: 0,
            totalScore: 600,
            winStreak: 2,
            bestStreak: 4,
          },
        },
        achievements: ["first_win", "streak_5"],
        preferences: {
          soundEnabled: true,
        },
      },
    ]

    setStorageItem("users", demoUsers)
  }
}

// Storage functions
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

function saveUserData(user) {
  setStorageItem("currentUser", user)
}

// Placeholder functions for features not yet implemented
function showToast(message, type) {
  console.log(`Toast: ${message} (Type: ${type})`)
  // You can implement actual toast functionality here
}

function playWinSound() {
  console.log("Playing win sound")
  // You can implement actual sound functionality here
}

function createConfetti() {
  console.log("Creating confetti")
  // You can implement actual confetti functionality here
}
