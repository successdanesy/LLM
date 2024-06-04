document.getElementById('loginForm').addEventListener('submit', async (event) => {
  event.preventDefault();

  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;

  const response = await fetch('/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email, password })
  });

  const result = await response.json();
  if (result.success) {
    document.cookie = `token=${result.data._id}; path=/`;
    alert('Login successful');
    window.location.href = '/chat.html'; // Redirect to chat page
  } else {
    alert('Login failed');
  }
});

document.getElementById('registerForm').addEventListener('submit', async (event) => {
  event.preventDefault();

  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  const response = await fetch('/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ name, email, password })
  });

  const result = await response.json();
  if (result.success) {
    document.cookie = `token=${result.data._id}; path=/`;
    alert('Registration successful');
    window.location.href = '/chat.html'; // Redirect to chat page
  } else {
    alert('Registration failed');
  }
});
