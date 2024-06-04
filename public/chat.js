document.getElementById('sendMessage').addEventListener('click', async () => {
    const message = document.getElementById('userMessage').value;
  
    const response = await fetch('/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getCookie('token')}`
      },
      body: JSON.stringify({ body: message, type: 'text' })
    });
  
    const result = await response.json();
    document.getElementById('chatBox').innerText = result.prompt.body;
  });
  
  function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
  }
  