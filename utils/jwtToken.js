let cookieExpiresTime = 7;

const sendToken = (user, statusCode, res) => {

    const token = user.getJwtToken();

    const options = {
        expires: new Date(
            Date.now() + cookieExpiresTime * 24 * 60 * 60 * 100
        ),
        httpOnly: true
    }

    res.status(statusCode).cookie('token', token, options).json({
        success: true,
        token,
        user
    })
}

module.exports = sendToken;