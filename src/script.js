
// Display initial log when page loads
console.log("JavaScript file successfully loaded!");

// Get references to elements
const message = document.getElementById("message");
const button = document.getElementById("actionBtn");

// Add click event listener
button.addEventListener("click", () => {
  message.innerText = "🎉 Hello from JavaScript!";
  console.log("Button clicked!");
});
