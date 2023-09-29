const reqHandler = (req, res) => {
  res.setHeader('Content-Type', 'text/html');

  switch (req.url) {
    case '/': {
      res.write('<html>');
      console.log('test')
      res.write('<head><title>Home</title></head>');
      res.write('<body>');
      res.write('<h1 style="color: green"> This is a green text </h1>');
      res.write('<a href="/users">Users</a>');
      res.write('<form action="/create-user" method="POST">');
      res.write('<label for="username">Username</label>');
      res.write('<input type="text" id="username" name="username"/>');
      res.write('<button type="submit">Submit</label>');
      res.write('</form>');
      res.write('</body>');
      res.write('</html>');
      return res.end();
      
    }
    case '/users': {
      res.write('<html>');
      res.write('<head><title>Users</title></head>');
      res.write('<body>');
      res.write('<ul>');
      res.write('<li> User 1 </li>');
      res.write('<li> User 2 </li>');
      res.write('<li> User 3 </li>');
      res.write('</ul>');
      res.write('</body>');
      res.write('</html>');
      return res.end();
    }
    case '/create-user': {
      if (req.method === 'POST') {
        const body = [];

        req.on('data', (chunk) => {
          body.push(chunk);
        });
    
        req.on('end', () => {
          const parsedBody = Buffer.concat(body).toString();
          console.log(parsedBody);
          const username = parsedBody.split('=')[1];
          console.log('New Username', username)
          res.statusCode = 302;
          res.setHeader('Location', '/');
          return res.end();
        });
      }
    }
  };
};

module.exports = reqHandler;
