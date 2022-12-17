const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require("crypto");
const refreshTokenDoc = require('../model/refresh_token.model')
const users = require('../model/users.model')

function setTokenCookie(res, token)
{
    const cookieOptions = {
        httpOnly: true,
        expires: new Date(Date.now() + 7*24*60*60*1000)
    };
    res.cookie('refreshToken', token, cookieOptions);
}

async function authenticate({ email, password}) {
    const user = await users.findOne({ 'email_id': email , 'isActive': true});

    if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
        throw 'Username or password is incorrect';
    }

    // authentication successful so generate jwt and refresh tokens
    const jwtToken = generateJwtToken(user);
    const refreshToken = generateRefreshToken(user);

    // save refresh token
    await refreshToken.save();

    // return basic details and tokens
    return { 
        ...basicDetails(user),
        jwtToken,
        refreshToken: refreshToken.token
    };
}

function generateJwtToken(user) {
    // create a jwt token containing the user id that expires in 15 minutes
    return jwt.sign({ sub: user.id, id: user.id }, 'asdfg][poi', { expiresIn: '3m' });
}

function randomTokenString() {
    return crypto.randomBytes(40).toString('hex');
}

function generateRefreshToken(user) {
    // create a refresh token that expires in 7 days
    return new refreshTokenDoc({
        user: user.id,
        token: randomTokenString(),
        expires: new Date(Date.now() + 7*24*60*60*1000),
    });
}


async function getRefreshToken(token) {
    const refreshToken = await refreshTokenDoc.findOne({ token }).populate('user');
    if (!refreshToken || !refreshToken.isActive) throw 'Invalid token';
    return refreshToken;
}

async function refreshTokens({ token }) {
    const refreshToken = await getRefreshToken(token);
    const { user } = refreshToken;
    
    // replace old refresh token with a new one and save
    const newRefreshToken = generateRefreshToken(user);
    refreshToken.revoked = Date.now();
    refreshToken.replacedByToken = newRefreshToken.token;
    await refreshToken.save();
    await newRefreshToken.save();
    
    // generate new jwt
    const jwtToken = generateJwtToken(user);
    
    // return basic details and tokens
    return { 
        ...basicDetails(user),
        jwtToken,
        refreshToken: newRefreshToken.token
    };
}

router.post('/refresh-token',async(req,res) => {
    const token = req.cookies.refreshToken;
    refreshTokens({ token})
    .then(({ refreshToken, ...user }) => {
        setTokenCookie(res, refreshToken);
        res.json(user);
    })
    .catch((err) => {
        res.send(500)
    });
})

router.post('/',async(req,res) => {
    const { email, password } = req.body;
    authenticate({ email, password })
        .then(({ refreshToken, ...user }) => {
            setTokenCookie(res, refreshToken);
            res.json(user);
        })
        .catch((err) => {
            console.log(err.message)
            res.send(500)
        });
})

function basicDetails(user) {
    const { id, display_name, email_id, password, role } = user;
    return { id, display_name, email_id, password, role };
}

module.exports = router