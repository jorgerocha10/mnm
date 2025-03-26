const http = require('http');

const email = process.argv[2];

if (!email) {
  console.error('Please provide an email address as an argument');
  console.error('Example: node scripts/test-email.js your.email@example.com');
  process.exit(1);
}

const data = JSON.stringify({
  email: email
});

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/test/email',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, (res) => {
  let responseData = '';

  res.on('data', (chunk) => {
    responseData += chunk;
  });

  res.on('end', () => {
    const result = JSON.parse(responseData);
    if (result.success) {
      console.log('✅ Test email sent successfully!');
      console.log('Email ID:', result.result.id);
    } else {
      console.log('❌ Failed to send test email');
      console.log('Error:', result.error);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Error making request:', error.message);
});

req.write(data);
req.end();

console.log(`🚀 Sending test email to ${email}...`); 