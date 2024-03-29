import PromiseRouter from 'express-promise-router'
import db from '../../db'
import * as dotenv from 'dotenv'
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
// create a new express-promise-router
// this has the same API as the normal express router except
// it allows you to use async functions as route handlers
const router = PromiseRouter();
// export our router to be mounted by the parent application

router.get('/', async (req, res) => {
  const { rows } = await db.query('SELECT id, name, email, phonenumber, role FROM users ORDER BY name;');
  res.status(200).send(rows)
})

router.get('/names', async (req, res) => {
  const { rows } = await db.query('SELECT name FROM users ORDER BY name;');
  res.status(200).send(rows)
})

router.get('/weavers', async (req, res) => {
  const { rows } = await db.query(`SELECT id, name FROM users WHERE role='weaver' ORDER BY name;`);
  res.status(200).send(rows)
})

router.post('/register', async (req, res) => {
  const { id, name, email, phonenumber, password, role } = req.body;
  try {
    const data = await db.query(id ? 'SELECT * FROM users WHERE id = $1;' : 'SELECT * FROM users WHERE name = $1;', [id ? id : name]);
    const arr = data.rows;
    if (arr.length != 0) {
      return res.status(400).json({
        message: "notifications.userexist",
        error: "ID already there, No need to register again.",
      });
    } else {
      bcrypt.hash(password, 10, (err, hash) => {
        if (err)
          res.status(err).json({
            message: "notifications.servererror",
            error: "Server error",
          });
        const user = { id, name, email, phonenumber, password: hash, role };
        var flag = 1; //Declaring a flag
        //Inserting data into the database

        db.query(id ? 'INSERT INTO users (id, name, email, phonenumber, password, role) VALUES ($1,$2,$3,$4,$5,$6);' : 'INSERT INTO users (name, email, phonenumber, password, role) VALUES ($1,$2,$3,$4,$5);', id ? [user.id, user.name, user.email, user.phonenumber, user.password, user.role] : [user.name, user.email, user.phonenumber, user.password, user.role], (err) => {
          if (err) {
            flag = 0; //If user is not inserted is not inserted to database assigning flag as 0/false.
            console.error(err);
            return res.status(500).json({
              message: "notifications.dberror",
              error: "Database error"
            })
          }
          else {
            flag = 1;
            res.status(200).send({ message: "notifications.userregistered", });
          }
        })
      });
    }
  }
  catch (err) {
    /*console.log(err);*/
    res.status(500).json({
      message: "notifications.dberror",
      error: "Database error while registring user!", //Database connection error
    });
  };
});

router.post('/logout', async (req, res) => {
  try {
    const { id, logoutby } = req.body;
    await db.query(`UPDATE userlog SET timestamp = tstzrange(lower(timestamp),current_timestamp(3),'[)'), logoutby=$2 WHERE upper_inf(timestamp) AND id=$1`, [id, logoutby]) //Verifying if the user exists in the database
    res.status(200).json({
      message: "notifications.logout",
    });
  } catch (err) {
    /*console.log(err);*/
    res.status(500).json({
      message: "notifications.dberror",
      error: "Database error occurred!", //Database connection error
    });
  };
});

router.post('/login', async (req, res) => {
  const { name, password } = req.body;
  try {
    const data = await db.query(`SELECT * FROM users WHERE name= $1;`, [name]) //Verifying if the user exists in the database
    const user = data.rows;
    if (user.length === 0) {
      res.status(400).json({
        message: "notifications.notregistered",
        error: "User is not registered, Sign Up first",
      });
    }
    else {
      bcrypt.compare(password, user[0].password, async (err, result) => { //Comparing the hashed password
        if (err) {
          res.status(500).json({
            message: "notifications.servererror",
            error: "Server error",
          });
        } else if (result === true) { //Checking if credentials match
          const token = jwt.sign(
            Object.assign(
              { id: user[0].id },
              { name: user[0].name },
              user[0].email && { email: user[0].email },
              user[0].phonenumber && { phonenumber: user[0].phonenumber },
              { role: user[0].role }
            ),
            process.env['SECRET_KEY'] || 'g@&hGgG&n34b%F7_f123K9',
          );
          let t = new Date()
          await db.query(`UPDATE userlog SET timestamp = tstzrange(lower(timestamp),$5,'[)'), logoutby=$2 WHERE upper_inf(timestamp) AND (role<>$1 OR (role=$1 AND $3=$1)) AND id <> $4`, ['weaver', 'userpassword', user[0].role, user[0].id, t]);
          await db.query(`INSERT INTO userlog (id, name, role, loginby, timestamp) SELECT * FROM (VALUES($1::numeric, $2::text, $3::text, $4::text, tstzrange($5,NULL,'[)')::tstzrange)) AS t (id, name, role, loginby, timestamp) WHERE t.id IS DISTINCT FROM (SELECT id FROM userlog WHERE upper_inf(timestamp))`, [user[0].id, user[0].name, user[0].role, 'password', t]);
          res.status(200).json({
            message: "notifications.userok",
            token: token,
          });
        }
        else {
          //Declaring the errors
          if (result != true)
            res.status(400).json({
              message: "notifications.usererror",
              error: "Enter correct password!",
            });
        }
      })
    }
  } catch (err) {
    /*console.log(err);*/
    res.status(500).json({
      message: "notifications.dberror",
      error: "Database error occurred while signing in!", //Database connection error
    });
  };
});

router.post('/login/:id', async (req, res) => {
  try {
    const data = await db.query(`SELECT * FROM users WHERE id= $1;`, [req.params.id]) //Verifying if the user exists in the database
    const user = data.rows;
    if (user.length === 0) {
      res.status(400).json({
        message: "notifications.notregistered",
        error: "User is not registered, Sign Up first",
      });
    }
    else {
      const token = jwt.sign(
        Object.assign(
          { id: user[0].id },
          { name: user[0].name },
          user[0].email && { email: user[0].email },
          user[0].phonenumber && { phonenumber: user[0].phonenumber },
          { role: user[0].role }
        ),
        process.env['SECRET_KEY'] || 'g@&hGgG&n34b%F7_f123K9',
      );
      let t = new Date()
      await db.query(`UPDATE userlog SET timestamp = tstzrange(lower(timestamp),$5,'[)'), logoutby=$2 WHERE upper_inf(timestamp) AND (role<>$1 OR (role=$1 AND $3=$1)) AND id IS DISTINCT FROM $4`, ['weaver', 'userid', user[0].role, user[0].id, t]);
      await db.query(`INSERT INTO userlog (id, name, role, loginby, timestamp) SELECT * FROM (VALUES($1::numeric, $2::text, $3::text, $4::text, tstzrange($5,NULL,'[)')::tstzrange)) AS t (id, name, role, loginby, timestamp) WHERE t.id IS DISTINCT FROM (SELECT id FROM userlog WHERE upper_inf(timestamp))`, [user[0].id, user[0].name, user[0].role, 'id', t]);

      res.status(200).json({
        message: "notifications.userok",
        token: token,
      });
    }
  } catch (err) {
    /*console.log(err);*/
    res.status(500).json({
      message: "notifications.dberror",
      error: "Database error occurred while signing in!", //Database connection error
    });
  };
});

router.delete('/:id', async (req, res) => {
  try {
    const data = await db.query(`SELECT * FROM users WHERE id= $1;`, [req.params.id]) //Verifying if the user exists in the database
    const user = data.rows;
    if (user.length === 0) {
      res.status(400).json({
        message: "notifications.notregistered",
        error: "User is not registered",
      });
    }
    else {
      db.query('DELETE FROM users WHERE id= $1;', [req.params.id], (err) => {
        if (err) {
          console.error(err);
          return res.status(500).json({
            message: "notifications.dberror",
            error: "Database error"
          })
        }
        else {
          db.query(`UPDATE userlog SET timestamp = tstzrange(lower(timestamp),current_timestamp(3),'[)'), logoutby=$2 WHERE upper_inf(timestamp) AND id=$1`, [user[0].id, "delete"]);
          res.status(200).send({ message: "notifications.userdel", id: req.params.id });
        }
      })
    }
  } catch (err) {
    /*console.log(err);*/
    res.status(500).json({
      message: "notifications.dberror",
      error: "Database error occurred while deleting user!", //Database connection error
    });
  };
});

router.post('/decode/:jwt', async (req, res) => {
  try {
    const decoded = jwt.decode(req.params.jwt)
    if (decoded) {
      res.status(200).json({
        decoded
      });
    } else {
      throw new Error();
    }
  }
  catch (err) {
    /*console.log(err);*/
    res.status(500).json({
      error: "Token not valid!", //Database connection error
    });
  };
});

router.post('/update', async (req, res) => {
  const { id, name, email, phonenumber, oldpassword, newpassword, password, role } = req.body;
  try {
    const data = await db.query('SELECT * FROM users WHERE id = $1;', [id]);
    const arr = data.rows;
    const pass = arr[0]['password']
    const oldrole = arr[0]['role']
    if (arr.length = 0) {
      return res.status(400).json({
        message: "notifications.usererror",
        error: "No such user.",
      });
    } else {
      if (name && oldpassword && newpassword) {
        bcrypt.compare(oldpassword, pass, (err, result) => { //Comparing the hashed password
          if (err) {
            res.status(500).json({
              message: "notifications.servererror",
              error: "Server error",
            });
          } else if (result === true) { //Checking if credentials match
            bcrypt.hash(newpassword, 10, (err, hash) => {
              if (err)
                res.status(err).json({
                  message: "notifications.servererror",
                  error: "Server error",
                });

              var flag = 1; //Declaring a flag
              //Inserting data into the database
              db.query('UPDATE users SET name=$2, email=$3, phonenumber=$4, password=$5, role=$6 where id=$1;', [id, name, email, phonenumber, hash, role], (err) => {
                if (err) {
                  flag = 0; //If user is not updated assigning flag as 0/false.
                  console.error(err);
                  return res.status(500).json({
                    message: "notifications.dberror",
                    error: "Database error"
                  })
                }
                else {
                  flag = 1;
                }
              })
              if (flag) {
                const token = jwt.sign( //Signing a jwt token
                  Object.assign(
                    { id: id },
                    { name: name },
                    email && { email: email },
                    phonenumber && { phonenumber: phonenumber },
                    { role: role }
                  ),
                  process.env['SECRET_KEY'] || 'g@&hGgG&n34b%F7_f123K9',
                );
                let t = new Date()
                oldrole != role && db.query(`UPDATE userlog SET timestamp = tstzrange(lower(timestamp),$3,'[)'), logoutby=$2 WHERE upper_inf(timestamp) AND id=$1`, [id, 'rolechange', t]);
                oldrole != role && db.query(`INSERT INTO userlog (id, name, role, loginby, timestamp) VALUES($1, $2, $3, $4, tstzrange($5,NULL,'[)'));`, [id, name, role, 'rolechange', t]);
                res.status(200).json({
                  message: "notifications.userupdate",
                  token: token,
                });
              };
            });
          }
          else {
            //Declaring the errors
            if (result != true)
              res.status(400).json({
                message: "notifications.usererror",
                error: "Enter correct password!",
              });
          }
        })

      } else if (name && password) {
        bcrypt.hash(password, 10, (err, hash) => {
          if (err)
            res.status(err).json({
              message: "notifications.servererror",
              error: "Server error",
            });

          var flag = 1; //Declaring a flag
          //Inserting data into the database
          db.query('UPDATE users SET name=$2, email=$3, phonenumber=$4, password=$5, role=$6 where id=$1;', [id, name, email, phonenumber, hash, role], (err) => {
            if (err) {
              flag = 0; //If user is not updated assigning flag as 0/false.
              console.error(err);
              return res.status(500).json({
                message: "notifications.dberror",
                error: "Database error"
              })
            }
            else {
              flag = 1;
            }
          })
          if (flag) {
            res.status(200).json({
              message: "notifications.userupdate",
            });
          };
        });
      } else if (name && id) {
        db.query('UPDATE users SET name=$2, email=$3, phonenumber=$4, role=$5 where id=$1;', [id, name, email, phonenumber, role], (err) => {
          if (err) {
            console.error(err);
            return res.status(500).json({
              message: "notifications.dberror",
              error: "Database error"
            })
          }
          else {
            res.status(200).json({
              message: "notifications.userupdate",
            });

          }
        })
      } else {
        return res.status(400).json({
          message: "notifications.usererror",
          error: "No username and password given.",
        });
      }
    }
  }
  catch (err) {
    /*console.log(err);*/
    res.status(500).json({
      message: "notifications.dberror",
      error: "Database error while updating user!", //Database connection error
    });
  };
});

export default router
