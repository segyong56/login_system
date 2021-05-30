const express = require('express')
const router = express.Router();
const { 
    registerUser,
    loginUser,
    forgotPassword,
    resetPassword,
    logoutUser,

    profileImgUpload,
    editProfileInfo,
    addToMyFollowingList,
    removeFromMyFollowingList,
    getMyfollower
} = require('../controllers/authController')

const {isAuthenticatedUser} = require('../middlewares/auth')

router.route('/register').post(registerUser)
router.route('/login').post(loginUser)
router.route('/forgot_password').post(forgotPassword)
router.route('/password/reset/:token').put(resetPassword)

router.route('/logout').get(isAuthenticatedUser, logoutUser)

router.route('/profile_img').post(isAuthenticatedUser, profileImgUpload)
router.route('/me/mypage/edit').put(isAuthenticatedUser, editProfileInfo)
router.route('/following/:userId').put(isAuthenticatedUser, addToMyFollowingList)
router.route('/unfollowing/:userId').put(isAuthenticatedUser, removeFromMyFollowingList)
router.route('/get_myfollower/:userId').get(isAuthenticatedUser, getMyfollower)
module.exports = router;