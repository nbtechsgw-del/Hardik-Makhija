const http = require('http');
const fs = require('fs');
const data = JSON.stringify({ patientId: 'PAT-1270', amount: 1500, status: 'Pending', generatePDF: true });
const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/patients/billing',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data)
  }
};
const req = http.request(options, (res) => {
  console.log('statusCode', res.statusCode);
  console.log('headers', res.headers);
  const chunks = [];
  res.on('data', (chunk) => chunks.push(chunk));
  res.on('end', () => {
    const body = Buffer.concat(chunks);
    console.log('body length', body.length);
    if (res.headers['content-type'] && res.headers['content-type'].includes('application/pdf')) {
      fs.writeFileSync('invoice_test.pdf', body);
      console.log('PDF saved invoice_test.pdf');
    } else {
      console.log(body.toString('utf8'));
    }
  });
});
req.on('error', (err) => console.error(err));
req.write(data);
req.end();
