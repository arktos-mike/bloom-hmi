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
router.post('/register', async (req, res) => {
    const { id, name, email, phonenumber, password, role } = req.body;
    try {
        const data = await db.query('SELECT * FROM users WHERE id = $1;', [id]);
        const arr = data.rows;
        if (arr.length != 0) {
            return res.status(400).json({
                error: "ID already there, No need to register again.",
            });
        } else {
            bcrypt.hash(password, 10, (err, hash) => {
                if (err)
                    res.status(err).json({
                        error: "Server error",
                    });
                const user = { id, name, email, phonenumber, password: hash, role };
                var flag = 1; //Declaring a flag
                //Inserting data into the database
                db.query('INSERT INTO users (id, name, email, phonenumber, password, role) VALUES ($1,$2,$3,$4,$5,$6);', [user.id, user.name, user.email, user.phonenumber, user.password, user.role], (err) => {
                    if (err) {
                        flag = 0; //If user is not inserted is not inserted to database assigning flag as 0/false.
                        console.error(err);
                        return res.status(500).json({
                            error: "Database error"
                        })
                    }
                    else {
                        flag = 1;
                        res.status(200).send({ message: 'User added to database, not verified' });
                    }
                })
                if (flag) {
                    const token = jwt.sign( //Signing a jwt token
                        Object.assign(
                            { id: user[0].id },
                            { name: user[0].name },
                            user[0].email && { email: user[0].email },
                            user[0].phonenumber && { phonenumber: user[0].phonenumber },
                            { role: user[0].phonenumber }
                        ),
                        process.env['SECRET_KEY'] || 'g@&hGgG&n34b%F7_f123K9',
                    );
                };
            });
        }
    }
    catch (err) {
        console.log(err);
        res.status(500).json({
            error: "Database error while registring user!", //Database connection error
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
                error: "User is not registered, Sign Up first",
            });
        }
        else {
            bcrypt.compare(password, user[0].password, (err, result) => { //Comparing the hashed password
                if (err) {
                    res.status(500).json({
                        error: "Server error",
                    });
                } else if (result === true) { //Checking if credentials match
                    const token = jwt.sign(
                        Object.assign(
                            { id: user[0].id },
                            { name: user[0].name },
                            user[0].email && { email: user[0].email },
                            user[0].phonenumber && { phonenumber: user[0].phonenumber },
                            { role: user[0].phonenumber }
                        ),
                        process.env['SECRET_KEY'] || 'g@&hGgG&n34b%F7_f123K9',
                    );
                    res.status(200).json({
                        message: "User signed in!",
                        token: token,
                    });
                }
                else {
                    //Declaring the errors
                    if (result != true)
                        res.status(400).json({
                            error: "Enter correct password!",
                        });
                }
            })
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({
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
                    { role: user[0].phonenumber }
                ),
                process.env['SECRET_KEY'] || 'g@&hGgG&n34b%F7_f123K9',
            );
            res.status(200).json({
                message: "User signed in!",
                token: token,
            });
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({
            error: "Database error occurred while signing in!", //Database connection error
        });
    };
});

router.post('/decode/:jwt', async (req, res) => {
    try {
        const decoded = jwt.decode(req.params.jwt)
        if (decoded) {
            res.status(200).json({
                message: "User decoded",
                user: decoded,
            });
        } else {
            throw new Error();
        }
    }
    catch (err) {
        console.log(err);
        res.status(500).json({
            error: "Token not valid!", //Database connection error
        });
    };
});

router.post('/update', async (req, res) => {
    const { id, name, email, phonenumber, password, role } = req.body;
    try {
        const data = await db.query('SELECT * FROM users WHERE id = $1;', [id]);
        const arr = data.rows;
        if (arr.length = 0) {
            return res.status(400).json({
                error: "No such user.",
            });
        } else {
            if (name && password) {
                bcrypt.hash(password, 10, (err, hash) => {
                    if (err)
                        res.status(err).json({
                            error: "Server error",
                        });
                    const user = { id, name, email, phonenumber, password: hash, role };
                    var flag = 1; //Declaring a flag
                    //Inserting data into the database
                    db.query('UPDATE users SET name=$2, email=$3, phonenumber=$4, password=$5, role=$6 where id=$1;', [user.id, user.name, user.email, user.phonenumber, user.password, user.role], (err) => {
                        if (err) {
                            flag = 0; //If user is not updated assigning flag as 0/false.
                            console.error(err);
                            return res.status(500).json({
                                error: "Database error"
                            })
                        }
                        else {
                            flag = 1;
                            res.status(200).send({ message: 'User updated' });
                        }
                    })
                    if (flag) {
                        const token = jwt.sign( //Signing a jwt token
                            Object.assign(
                                { id: user.id },
                                { name: user.name },
                                user.email && { email: user.email },
                                user.phonenumber && { phonenumber: user.phonenumber },
                                { role: user.phonenumber }
                            ),
                            process.env['SECRET_KEY'] || 'g@&hGgG&n34b%F7_f123K9',
                        );
                    };
                });
            } else {
                return res.status(400).json({
                    error: "No username or password given.",
                });
            }
        }
    }
    catch (err) {
        console.log(err);
        res.status(500).json({
            error: "Database error while updating user!", //Database connection error
        });
    };
});

export default router 