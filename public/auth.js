// This code handles the login and registration processes by sending user input to the server, 
// processing the server's response, and taking appropriate actions based on whether the login or 
// registration was successful.

// Event listener for login form submission
document.getElementById('loginForm').addEventListener('submit', async (event) => {
  event.preventDefault(); // Prevent form from submitting the default way

  // Get email and password values from the form
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;

  // Send a POST request to the server with the login data
  const response = await fetch('/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json' // Specify JSON content type
    },
    body: JSON.stringify({ email, password }) // Convert data to JSON string
  });

  // Parse the JSON response from the server
  const result = await response.json();
  if (result.success) {
    document.cookie = `token=${result.data._id}; path=/`; // Save token in cookies
    alert('Login successful');
    window.location.href = '/chat.html'; // Redirect to chat page
  } else {
    alert('Login failed');
  }
});

// Event listener for register form submission
document.getElementById('registerForm').addEventListener('submit', async (event) => {
  event.preventDefault(); // Prevent form from submitting the default way

  // Get name, email, and password values from the form
  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  // Send a POST request to the server with the registration data
  const response = await fetch('/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json' // Specify JSON content type
    },
    body: JSON.stringify({ name, email, password }) // Convert data to JSON string
  });

  // Parse the JSON response from the server
  const result = await response.json();
  if (result.success) {
    document.cookie = `token=${result.data._id}; path=/`; // Save token in cookies
    alert('Registration successful');
    window.location.href = '/chat.html'; // Redirect to chat page
  } else {
    alert('Registration failed');
  }
});
