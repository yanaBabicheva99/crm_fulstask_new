const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const keys = require('../config/keys');
const errorHandler = require('../utils/errorHandler');


module.exports.login = async function(req, res) {
    const candidate = await User.findOne({email: req.body.email});
    if(candidate) {
        const passwordResult = bcrypt.compareSync(req.body.password, candidate.password);
        if(passwordResult) {
            const token = jwt.sign({
                email: candidate.email,
                userId: candidate._id
            }, keys.jwt, {expiresIn: 60 * 60});

           res.status(200).json({
               token: `Bearer ${token}`,
               userId: candidate._id,
           })

        } else {
            res.status(401).json({
                message: 'Пароли не совпадают. Попробуйте снова'
            })
        }

    } else {
        res.status(404).json({
            message: 'Пользователь с таким email не найден'
        })
    }

}

module.exports.register = async function(req, res) {

      const candidate = await User.findOne({email: req.body.email});

      if(candidate) {
          res.status(409).json({
             message: 'Такой email уже существует'
          })
      } else {
         const salt = bcrypt.genSaltSync(10)
         const password = req.body.password
         const user = new User({
            email: req.body.email,
            password: bcrypt.hashSync(password, salt),
            name: req.body.name,
            lastName: req.body.lastName,
            companyName: req.body.companyName
         })
         try {
            await user.save();
            res.status(201).json(user)
         } catch(err) {
             errorHandler()
         }

      }
}

module.exports.getUser = async function(req, res) {
    try {
        const user = await User.find({
            user: req.user.id
        })
        res.status(200).json(user);
    } catch(err) {
        errorHandler(res, err);
    }
}