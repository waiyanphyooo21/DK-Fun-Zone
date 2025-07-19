// Profile Settings functionality
document.addEventListener("DOMContentLoaded", () => {
  // Check if user is logged in
  const currentUser = getCurrentUser()
  if (!currentUser) {
    window.location.href = "login.html"
    return
  }

  initializeProfile()
})

function initializeProfile() {
  loadUserProfile()
  bindEvents()
  loadUserStats()
}

function loadUserProfile() {
  const user = getCurrentUser()
  if (!user) return

  // Load basic info
  document.getElementById("fullName").value = user.name || ""
  document.getElementById("email").value = user.email || ""
  document.getElementById("userName").textContent = user.name || "User"

  // Load member since date
  if (user.createdAt) {
    const memberDate = new Date(user.createdAt)
    document.getElementById("memberSince").textContent = memberDate.toLocaleDateString()
  }

  // Load profile image
  if (user.profileImage) {
    showProfileImage(user.profileImage)
  }

  // Load preferences
  const preferences = user.preferences || {}
  document.getElementById("soundEnabled").checked = preferences.soundEnabled !== false
  document.getElementById("notificationsEnabled").checked = preferences.notificationsEnabled !== false
}

function bindEvents() {
  // Profile form submission
  document.getElementById("profileForm").addEventListener("submit", handleProfileUpdate)

  // Password form submission
  document.getElementById("passwordForm").addEventListener("submit", handlePasswordChange)

  // Image upload
  document.getElementById("imageUpload").addEventListener("change", handleImageUpload)

  // Remove image
  document.getElementById("removeImage").addEventListener("click", removeProfileImage)

  // Password toggle buttons
  setupPasswordToggles()

  // Real-time validation
  setupValidation()
}

function handleProfileUpdate(event) {
  event.preventDefault()

  const name = document.getElementById("fullName").value.trim()
  const email = document.getElementById("email").value.trim()

  // Clear previous errors
  clearAllErrors()

  // Validate fields
  let isValid = true
  if (!validateNameField(name)) isValid = false
  if (!validateEmailField(email)) isValid = false

  if (!isValid) return

  // Check if email is already taken by another user
  const users = getStorageItem("users", [])
  const currentUser = getCurrentUser()
  const existingUser = users.find((u) => u.email === email && u.id !== currentUser.id)

  if (existingUser) {
    showFieldError("email", "This email is already taken by another user")
    showToast("Email already in use by another account", "error")
    return
  }

  // Update user data
  currentUser.name = name
  currentUser.email = email

  // Update in users array
  const userIndex = users.findIndex((u) => u.id === currentUser.id)
  if (userIndex !== -1) {
    users[userIndex] = currentUser
    setStorageItem("users", users)
  }

  // Update current user
  setStorageItem("currentUser", currentUser)

  // Update UI
  document.getElementById("userName").textContent = name
  updateNavProfileInfo()

  showToast("Profile updated successfully! ✅", "success")
}

function handlePasswordChange(event) {
  event.preventDefault()

  const currentPassword = document.getElementById("currentPassword").value
  const newPassword = document.getElementById("newPassword").value
  const confirmNewPassword = document.getElementById("confirmNewPassword").value

  // Clear previous errors
  clearPasswordErrors()

  // Validate fields
  let isValid = true
  if (!validateCurrentPassword(currentPassword)) isValid = false
  if (!validateNewPassword(newPassword)) isValid = false
  if (!validateConfirmNewPassword(newPassword, confirmNewPassword)) isValid = false

  if (!isValid) return

  // Update password
  const currentUser = getCurrentUser()
  const users = getStorageItem("users", [])

  currentUser.password = newPassword

  // Update in users array
  const userIndex = users.findIndex((u) => u.id === currentUser.id)
  if (userIndex !== -1) {
    users[userIndex] = currentUser
    setStorageItem("users", users)
  }

  // Update current user
  setStorageItem("currentUser", currentUser)

  // Clear form
  document.getElementById("passwordForm").reset()

  showToast("Password changed successfully! 🔒", "success")
}

function handleImageUpload(event) {
  const file = event.target.files[0]
  if (!file) return

  // Validate file
  if (!validateImageFile(file)) return

  // Read file as data URL
  const reader = new FileReader()
  reader.onload = (e) => {
    const imageData = e.target.result
    saveProfileImage(imageData)
    showProfileImage(imageData)
    showToast("Profile picture updated! 📸", "success")
  }
  reader.readAsDataURL(file)
}

function validateImageFile(file) {
  // Check file type
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"]
  if (!allowedTypes.includes(file.type)) {
    showToast("Please select a valid image file (JPG, PNG, GIF)", "error")
    return false
  }

  // Check file size (5MB limit)
  const maxSize = 5 * 1024 * 1024 // 5MB in bytes
  if (file.size > maxSize) {
    showToast("Image file is too large. Please select a file under 5MB", "error")
    return false
  }

  return true
}

function saveProfileImage(imageData) {
  const currentUser = getCurrentUser()
  const users = getStorageItem("users", [])

  currentUser.profileImage = imageData

  // Update in users array
  const userIndex = users.findIndex((u) => u.id === currentUser.id)
  if (userIndex !== -1) {
    users[userIndex] = currentUser
    setStorageItem("users", users)
  }

  // Update current user
  setStorageItem("currentUser", currentUser)

  // Update navigation
  updateNavProfileInfo()
}

function showProfileImage(imageData) {
  const profileImage = document.getElementById("profileImage")
  const profileIcon = document.getElementById("profileIcon")
  const removeButton = document.getElementById("removeImage")

  profileImage.src = imageData
  profileImage.style.display = "block"
  profileIcon.style.display = "none"
  removeButton.style.display = "inline-block"
}

function removeProfileImage() {
  const currentUser = getCurrentUser()
  const users = getStorageItem("users", [])

  delete currentUser.profileImage

  // Update in users array
  const userIndex = users.findIndex((u) => u.id === currentUser.id)
  if (userIndex !== -1) {
    users[userIndex] = currentUser
    setStorageItem("users", users)
  }

  // Update current user
  setStorageItem("currentUser", currentUser)

  // Update UI
  const profileImage = document.getElementById("profileImage")
  const profileIcon = document.getElementById("profileIcon")
  const removeButton = document.getElementById("removeImage")

  profileImage.style.display = "none"
  profileIcon.style.display = "block"
  removeButton.style.display = "none"

  // Update navigation
  updateNavProfileInfo()

  showToast("Profile picture removed", "info")
}

function updateNavProfileInfo() {
  const currentUser = getCurrentUser()
  if (!currentUser) return

  const navProfileImage = document.getElementById("navProfileImage")
  const navProfileIcon = document.getElementById("navProfileIcon")

  if (currentUser.profileImage) {
    navProfileImage.src = currentUser.profileImage
    navProfileImage.style.display = "inline-block"
    navProfileIcon.style.display = "none"
  } else {
    navProfileImage.style.display = "none"
    navProfileIcon.style.display = "inline-block"
  }
}

function savePreferences() {
  const currentUser = getCurrentUser()
  const users = getStorageItem("users", [])

  const preferences = {
    soundEnabled: document.getElementById("soundEnabled").checked,
    notificationsEnabled: document.getElementById("notificationsEnabled").checked,
  }

  currentUser.preferences = preferences

  // Update in users array
  const userIndex = users.findIndex((u) => u.id === currentUser.id)
  if (userIndex !== -1) {
    users[userIndex] = currentUser
    setStorageItem("users", users)
  }

  // Update current user
  setStorageItem("currentUser", currentUser)

  showToast("Preferences saved! ⚙️", "success")
}

function loadUserStats() {
  const user = getCurrentUser()
  if (!user || !user.gameStats) return

  const stats = user.gameStats
  let totalGamesPlayed = 0
  let totalGamesWon = 0
  let totalScore = 0

  Object.values(stats).forEach((gameStat) => {
    totalGamesPlayed += gameStat.gamesPlayed || 0
    totalGamesWon += gameStat.gamesWon || 0
    totalScore += gameStat.totalScore || 0
  })

  const winRate = totalGamesPlayed > 0 ? Math.round((totalGamesWon / totalGamesPlayed) * 100) : 0

  document.getElementById("totalGamesPlayed").textContent = formatNumber(totalGamesPlayed)
  document.getElementById("totalGamesWon").textContent = formatNumber(totalGamesWon)
  document.getElementById("totalScore").textContent = formatNumber(totalScore)
  document.getElementById("winRate").textContent = winRate + "%"
}

function setupPasswordToggles() {
  const toggleButtons = [
    { button: "toggleCurrentPassword", input: "currentPassword" },
    { button: "toggleNewPassword", input: "newPassword" },
    { button: "toggleConfirmPassword", input: "confirmNewPassword" },
  ]

  toggleButtons.forEach(({ button, input }) => {
    const toggleBtn = document.getElementById(button)
    const inputField = document.getElementById(input)

    if (toggleBtn && inputField) {
      toggleBtn.addEventListener("click", () => {
        const icon = toggleBtn.querySelector("i")
        if (inputField.type === "password") {
          inputField.type = "text"
          icon.classList.remove("fa-eye")
          icon.classList.add("fa-eye-slash")
        } else {
          inputField.type = "password"
          icon.classList.remove("fa-eye-slash")
          icon.classList.add("fa-eye")
        }
      })
    }
  })
}

function setupValidation() {
  // Real-time validation for profile form
  const nameField = document.getElementById("fullName")
  const emailField = document.getElementById("email")

  if (nameField) {
    nameField.addEventListener("blur", () => validateNameField(nameField.value))
    nameField.addEventListener("input", () => clearFieldError("fullName"))
  }

  if (emailField) {
    emailField.addEventListener("blur", () => validateEmailField(emailField.value))
    emailField.addEventListener("input", () => clearFieldError("email"))
  }

  // Real-time validation for password form
  const currentPasswordField = document.getElementById("currentPassword")
  const newPasswordField = document.getElementById("newPassword")
  const confirmNewPasswordField = document.getElementById("confirmNewPassword")

  if (currentPasswordField) {
    currentPasswordField.addEventListener("blur", () => validateCurrentPassword(currentPasswordField.value))
    currentPasswordField.addEventListener("input", () => clearFieldError("currentPassword"))
  }

  if (newPasswordField) {
    newPasswordField.addEventListener("blur", () => validateNewPassword(newPasswordField.value))
    newPasswordField.addEventListener("input", () => clearFieldError("newPassword"))
  }

  if (confirmNewPasswordField) {
    confirmNewPasswordField.addEventListener("blur", () => {
      const newPassword = document.getElementById("newPassword").value
      validateConfirmNewPassword(newPassword, confirmNewPasswordField.value)
    })
    confirmNewPasswordField.addEventListener("input", () => clearFieldError("confirmNewPassword"))
  }
}

// Validation functions
function validateNameField(name) {
  if (!name) {
    showFieldError("fullName", "Name is required")
    return false
  }

  if (name.length < 2) {
    showFieldError("fullName", "Name must be at least 2 characters long")
    return false
  }

  if (name.length > 50) {
    showFieldError("fullName", "Name must be less than 50 characters")
    return false
  }

  if (!/^[a-zA-Z\s\-']+$/.test(name)) {
    showFieldError("fullName", "Name can only contain letters, spaces, hyphens, and apostrophes")
    return false
  }

  clearFieldError("fullName")
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

function validateCurrentPassword(password) {
  if (!password) {
    showFieldError("currentPassword", "Current password is required")
    return false
  }

  const currentUser = getCurrentUser()
  if (password !== currentUser.password) {
    showFieldError("currentPassword", "Current password is incorrect")
    return false
  }

  clearFieldError("currentPassword")
  return true
}

function validateNewPassword(password) {
  if (!password) {
    showFieldError("newPassword", "New password is required")
    return false
  }

  if (password.length < 6) {
    showFieldError("newPassword", "Password must be at least 6 characters long")
    return false
  }

  if (!/(?=.*[a-zA-Z])(?=.*\d)/.test(password)) {
    showFieldError("newPassword", "Password must contain at least one letter and one number")
    return false
  }

  clearFieldError("newPassword")
  return true
}

function validateConfirmNewPassword(newPassword, confirmPassword) {
  if (!confirmPassword) {
    showFieldError("confirmNewPassword", "Please confirm your new password")
    return false
  }

  if (newPassword !== confirmPassword) {
    showFieldError("confirmNewPassword", "Passwords do not match")
    return false
  }

  clearFieldError("confirmNewPassword")
  return true
}

// Error handling functions
function showFieldError(fieldName, message) {
  const field = document.getElementById(fieldName)
  const errorElement = document.getElementById(fieldName.replace("fullName", "name") + "Error")

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
  const errorElement = document.getElementById(fieldName.replace("fullName", "name") + "Error")

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

function clearPasswordErrors() {
  clearFieldError("currentPassword")
  clearFieldError("newPassword")
  clearFieldError("confirmNewPassword")
}

// Utility functions
function getCurrentUser() {
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

function formatNumber(num) {
  return num.toLocaleString()
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

// Initialize profile image in navigation on page load
document.addEventListener("DOMContentLoaded", () => {
  updateNavProfileInfo()
})
