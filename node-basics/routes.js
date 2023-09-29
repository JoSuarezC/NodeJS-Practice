const fs = require('fs');

const reqHandler = (req, res) => {
  res.setHeader('Content-Type', 'text/html');

  if (req.url === '/') {
    res.write('<html>');
    res.write('<head><title>This is my title</title></head>');
    res.write('<body><form action="/message" method="POST"> <input type="text" name="message"/> <button>Submit</button> </form></body>');
    res.write('</html>');
    return res.end();
  } else if (req.url === '/message' && req.method === 'POST') {
    const body = [];
    req.on('data', (chunk) => {
      body.push(chunk);
    });

    req.on('end', () => {
      const parsedBody = Buffer.concat(body).toString();
      console.log(parsedBody);
      const msg = parsedBody.split('=')[1];
      fs.writeFile('message.txt', msg, (err) => {
        console.log(err);
        res.statusCode = 302;
        res.setHeader('Location', '/');
        return res.end();
      });
    });
  } else {
    res.write('<html><head><title>This is my title</title></head><body><h1>Hello from NodeJS</h1></body></html>');
    return res.end();
  }
};

module.exports = reqHandler;
