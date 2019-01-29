const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const express = require('express');
const app = express();
const bodyParser = require('body-parser');
app.use(bodyParser.json());


/**
 * test key and data
 */
const secretKey = 'oursecretkey';
const users = [
  {
    id: 1,
    userName: 'john',
    password: 'john'
  },
  {
    id: 2,
    userName: 'grace',
    password: 'grace'
  },
  {
    id: 3,
    userName: 'hash'
  },
  {
    id: 4,
    userName: 'choco'
  }
];





app.post('/login', (req, res) => {
  const body = req.body;

  /**
   * version 1 - simple
   */

  // const user = users.find(item => {
  //   return item.userName === body.userName && item.password === body.password;
    
  // })

  // if (!user) {
  //   // want vague errors instead of detailing
  //   return res.status(401).send('login failed');
  // }

  // const token = jwt.sign({ id: user.id}, secretKey, {
  //   expiresIn: '24h'
  // })

  // res.status(200).send({ token: token});


  /**
   * version 2 - legit
   */

  const user = users.find(item => {
    return item.userName === body.userName
  })

  bcrypt.compare(body.password, user.password, (err, bcryptResponse)=> {
    if (err){
      return res.status(500).json(err);
    }

    if (!bcryptResponse) {
      return res.status(401).send('login failed')
    }

    //secret key should be stored in .env file
    const token = jwt.sign({ id: user.id}, secretKey, {
      expiresIn: '24h'
    })

    res.status(200).send({ token: token});
  })
})

app.get('/not-so-secret', (req, res) => {
  res.send('you got in!!!')
})

/**
 * check if user logged in
 *  
 */ 

app.use((req, res, next) => {
  var token = req.headers['x-access-token'];
  if (!token)
    return res.status(403).send({ message: 'No token provided.' });
  jwt.verify(token, secretKey, function(err, decoded) {
    if (err)
    return res.status(500).send({ message: 'Failed to authenticate token.' });

    // if everything good, save to request for use in other routes
    req.userId = decoded.id;
    next();
  });
})



/**
 * secured routes go below
 */

app.get('/secret-vault', (req, res) => {
  res.send(`good job, userId ${req.userId} you got here!`)
})



/**
 * create hashed passwords and set them on the user
 * lastly, start the node express server
 */
bcrypt.hash('brown', 10)
  .then(hash => {
    users[2].password = hash;

    return bcrypt.hash('cookie', 10)
  })
  .then(hash => {
    users[3].password = hash;
    console.log(users[3])
  })
  .then(()=> {
    app.listen(3000, () => {
      console.log('server listening')
    })
  })

