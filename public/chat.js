// This JavaScript code handles sending a message typed by the user to the server and
//  displaying the server's response in the chat box. The getCookie function retrieves 
//  the authorization token stored in cookies.

// Event listener for the send message button
document.getElementById('sendMessage').addEventListener('click', async () => {
  // Get the message value from the input field
  const message = document.getElementById('userMessage').value;

  // Send a POST request to the server with the message data
  const response = await fetch('/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json', // Specify JSON content type
      'Authorization': `Bearer ${getCookie('token')}` // Include authorization token from cookies
    },
    body: JSON.stringify({ body: message, type: 'text' }) // Convert message data to JSON string
  });

  // Parse the JSON response from the server
  const result = await response.json();
  // Display the response message in the chat box
  document.getElementById('chatBox').innerText = result.prompt.body;
});

// Function to get a specific cookie by name
function getCookie(name) {
  const value = `; ${document.cookie}`; // Get all cookies as a single string
  const parts = value.split(`; ${name}=`); // Split the string to find the specific cookie
  if (parts.length === 2) return parts.pop().split(';').shift(); // Return the cookie value
}
