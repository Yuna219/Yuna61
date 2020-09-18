var express = require('express')
var bodyParser = require('body-parser')
var ejs = require('ejs');
var mongoose = require('mongoose')
var validator = require('validator')
var alert = require('alert')
var path = require('path')
var bcrypt = require('bcrypt')
var nodemailer = require("nodemailer");
var saltRounds = 10;

const app = express();
app.use(bodyParser.urlencoded({extended: true}))
app.set('views', __dirname + '/public');
app.engine('.html', ejs.__express);
app.set('view engine', 'html');
app.use('/assets', express.static('public/assets'));
// 连接 mongodb 数据库
mongoose.connect("mongodb+srv://iCrowdTaskDB:CybG8QInke5Rjkxj@cluster0.j9vo1.mongodb.net/cluster0?retryWrites=true&w=majority", {useNewUrlParser: true})
var userSchema = new mongoose.Schema({
    country: {
        type: String,
        required: true,
        validator(value) {
            if (validator.isEmpty(value)) {
                throw new Error('Please choose your country!')
            }
        }
    },
    salt: {
        type: String
    },
    firstName: {
        type: String,
        required: true,
        validate(value) {
            if (validator.isEmpty(value)) {
                throw new Error('Please input your first name!')
            }
        }
    },
    lastName: {
        type: String,
        required: true,
        validate(value) {
            if (validator.isEmpty(value)) {
                throw new Error('Please input your last name!')
            }
        }
    },
    email: {
        type: String,
        required: true,
        trim: true,
        validator(value) {
            if (validator.isEmpty(value)) {
                throw new Error('Please input your email address!')
            }
            if (!validator.isEmail(value)) {
                throw new Error("Your email address is not valid!")
            }
        }
    },
    password: {
        type: String,
        required: true,
        validate(value) {
            if (validator.isEmpty(value)) {
                throw new Error('Please input your password!')
            }
            if (!validator.isLength(value, {min: 8})) {
                throw new Error('Your password must be at least 8 characters!')
                alert(Error)
            }
        }
    },
    confirmPassword: {
        type: String,
        required: true,
        validate(value) {
            if (!validator.equals(value, this.password)) {
                throw new Error('Your password should be the same as Confirm password!')
            }
        }
    },
    address1: {
        type: String,
        required: true,
        validate(value) {
            if (validator.isEmpty(value)) {
                throw new Error('Please input address!')
            }
        }
    },
    address2: {
        type: String,
        required: false
    },
    city: {
        type: String,
        required: true,
        validate(value) {
            if (validator.isEmpty(value)) {
                throw new Error('Please input city!')
            }
        }
    },
    state: {
        type: String,
        required: true,
        validate(value) {
            if (validator.isEmpty(value)) {
                throw new Error('Please input state!')
            }
        }
    },
    zip: {
        type: String,
        required: false
    },
    phoneNumber: {
        type: String,
        required: false,
        validate(value) {
            if ((!validator.isEmpty(value)) && (!validator.isMobilePhone(value, ['am-Am', 'ar-AE', 'ar-BH', 'ar-DZ', 'ar-EG', 'ar-IQ', 'ar-JO', 'ar-KW', 'ar-SA', 'ar-SY', 'ar-TN', 'be-BY', 'bg-BG', 'bn-BD', 'cs-CZ', 'da-DK', 'de-DE', 'de-AT', 'de-CH', 'el-GR', 'en-AU', 'en-CA', 'en-GB', 'en-GG', 'en-GH', 'en-HK', 'en-MO', 'en-IE', 'en-IN', 'en-KE', 'en-MT', 'en-MU', 'en-NG', 'en-NZ', 'en-PK', 'en-RW', 'en-SG', 'en-SL', 'en-UG', 'en-US', 'en-TZ', 'en-ZA', 'en-ZM', 'en-ZW', 'es-CL', 'es-CO', 'es-CR', 'es-EC', 'es-ES', 'es-MX', 'es-PA', 'es-PY', 'es-UY', 'et-EE', 'fa-IR', 'fi-FI', 'fj-FJ', 'fo-FO', 'fr-BE', 'fr-FR', 'fr-GF', 'fr-GP', 'fr-MQ', 'fr-RE', 'he-IL', 'hu-HU', 'id-ID', 'it-IT', 'ja-JP', 'kk-KZ', 'kl-GL', 'ko-KR', 'lt-LT', 'ms-MY', 'nb-NO', 'ne-NP', 'nl-BE', 'nl-NL', 'nn-NO', 'pl-PL', 'pt-BR', 'pt-PT', 'ro-RO', 'ru-RU', 'sl-SI', 'sk-SK', 'sr-RS', 'sv-SE', 'th-TH', 'tr-TR', 'uk-UA', 'vi-VN', 'zh-CN', 'zh-HK', 'zh-MO', 'zh-TW']))) {
                throw new Error('Your phone number is not valid!')
            }
        }
    }
})
app.get('/', (req, res) => {
    res.render('login.html');
});
app.get('/register', (req, res) => {
    res.render('registration.html');
})
app.get("/login", (req, res) => {
    res.render("login.html");
})
app.post('/login', (req, res) => {
    var email = req.body.email
    var password = req.body.password
    User.findOne({email: email}, function (err, doc) {
        if (doc) {
            var result = bcrypt.compareSync(password, doc.password)
            if (result) {
                res.redirect("/reqtask")
            } else {
                alert("Wrong password!")
            }
        } else {
            alert("Invalid email address!")
        }
    })
})
app.post('/repassword', (req, res) => {
    var email = req.body.email
    sendMail(email, '密码修改', '<a href="https://protected-harbor-33383.herokuapp.com/password?email="+email>密码修改</a>')
})
app.get("/success", (req, res) => {
    res.render("success.html");
});
app.get("/password", (req, res) => {
    res.render("password.html", {email: req.query.email});
});
app.post("/password", (req, res) => {
    var email = req.body.email
    let salt = bcrypt.genSaltSync(saltRounds)
    var password = bcrypt.hashSync(req.body.password, salt)
    User.update({email: email}, {password: password}, {multi: false}, function (err, doc) {
        if (err) {
            alert("Wrong password!")
        } else {
            alert("the password is change")
            res.render("login.html");
        }
    })
    res.render("success.html");
});

app.get("/reqtask", (req, res) => {
    res.render("reqtask.html");
})
app.get("/repassword", (req, res) => {
    res.render("repassword.html");
})
var User = mongoose.model('User', userSchema)
app.post('/register', (req, res) => {
    var body = req.body;
    var userInfo = {
        country,
        firstName,
        lastName,
        email,
        password,
        confirmPassword,
        address1,
        address2,
        city,
        state,
        zip,
        phoneNumber
    } = body;
    body.salt = bcrypt.genSaltSync(saltRounds)
    body.password = bcrypt.hashSync(body.password, body.salt)
    body.confirmPassword = body.password

    var user = new User(userInfo)

    User.findOne({email: email}, function (err, doc) {
        if (doc) {
            alert("This email address has already been registered! Please change another email address!")
        } else {
            user.save(function (error) {
                if (error) {
                    console.log("Error!")
                } else {
                    sendMail(email, '注册成功', '<b>欢迎注册本网站</b>')
                    res.redirect("/success")
                }
            })
        }
    })

})

function sendMail(tos, subject, msg) {

    let transporter = nodemailer.createTransport({
        service: 'qq', // 使用了内置传输发送邮件 查看支持列表：https://nodemailer.com/smtp/well-known/
        port: 465, // SMTP 端口
        secureConnection: true, // 使用了 SSL
        auth: {
            user: '1401440047@qq.com',//你的邮箱
            // 这里密码不是qq密码，是你设置的smtp授权码
            pass: 'kqduhyovdadsgacd',
        }
    });
    let mailOptions = {
        from: '1401440047@qq.com', // 这里写上你自己的邮箱
        to: '1652268479@qq.com', // 这里写上要发送到的邮箱
        subject: '注册成功', // Subject line
        html: '<b>欢迎注册本网站</b>' // html body
    };
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }
        console.log('Message sent: %s', info.messageId);
    });

}

const PORT = process.env.PORT || 3000;
app.listen(PORT);
