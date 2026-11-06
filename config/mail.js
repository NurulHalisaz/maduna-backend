const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({

    service: "gmail",

    auth: {

        user: "madunaasli.id@gmail.com",

        pass: "urlf mzca rvgu etbo"

    }

});

module.exports = transporter;