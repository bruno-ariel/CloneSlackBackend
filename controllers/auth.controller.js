//funciones con la capacidad de responder // responsabilidad de responder
import filesystem from "fs";
import jwt from "jsonwebtoken";
import ENVIROMENT from "../config/enviroment.js";
import User from "../models/User.model.js";
import { sendMail } from "../utils/mail.util.js";
import bcrypt from "bcrypt"

//Buscar por email
const findUserByEmail = async (email) => {
    const userFound = await User.findOne({ email: email })
    return userFound
}
// crear usuario
const createUser = async ({ username, email, password, verificationToken }) => {
    const nuevo_usuario = new User({
        username,
        email,
        password,
        verificationToken,
        modifiedAt: null
    })
    return nuevo_usuario.save()
}

export const registerController = async (req, res) => {
    try {
        console.log(req.body)
        const { username, email, password } = req.body;
        if (!username || !email || !password) {
            return res.json({
                ok: false,
                status: 400,
                message: "Bad request",
            })
        }
        const user_found = await findUserByEmail(email)

        if (user_found) {
            return res.json({
                ok: false,
                status: 400,
                message: "User already exists",
            })
        }
        const verificationToken = jwt.sign({ email }, ENVIROMENT.SECRET_KEY_JWT, { expiresIn: "1d" })
        await sendMail(
            {
                to: email,
                subject:"valida tu mail",
                html:`
                <h1>Debes validar tu mail</h1>
                <p>da Click en el enlace de verificacion para validar tu mail</p>
                <a
                    href='http://localhost:${ENVIROMENT.PORT}/api/auth/verify-email?verification_token=${verificationToken}'
                    >
                    verificar 
                    </a>
            `
            })
        const password_hash = await bcrypt.hash (password, 10)
        const new_user = await createUser(
            {
                username: username,
                email,
                password: password_hash,
                verificationToken
            })
        res.json({
            ok: true,
            status: 201,
            message: "User registered successfully",
            data: {},
        })
    } catch (error) {
        console.error(error);
        res.json({
            ok: false,  
            status: 500,
            message: "Internal server error (register Controller)",
        });
    }
}

export const verifyEmailController = async (req, res) => {
    try {
        const { verification_token } = req.query
        if (!verification_token){
            return res.redirect(`${ENVIROMENT.URL_FRONTEND}/error?error=REQUEST_EMAIL_VERIFY_TOKEN`)
        }
        const payload = jwt.verify(verification_token, ENVIROMENT.SECRET_KEY_JWT)
        const user_to_verify = await findUserByEmail(payload.email)
        if(!user_to_verify){
            return res.redirect(`${ENVIROMENT.URL_FRONTEND}/error?error=REQUEST_EMAIL_VERIFY_TOKEN`)
        }
        if (user_to_verify.verificationToken !== verification_token){
            return res.redirect(`${ENVIROMENT.URL_FRONTEND}/error?error=RESEND_VERIFY_TOKEN`)
        }
        user_to_verify.verified = true
        await user_to_verify.save()
        return res.redirect(`${ENVIROMENT.URL_FRONTEND}/login?verified=true`)
    }
    catch (error) {
        console.error(error);
        res.json({
            ok: false,
            status: 500,
            message: "Internal server error",
        })
    }
}

export const loginController = async (req, res) => {
    try {
        const { email, password } = req.body;
        const errors = {
            email: null,
            password: null,
        };

        if (!email || !/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g.test(email)) {
            errors.email = "You must enter a valid value for email";
        }

        if (!password) {
            errors.password = "You must enter a password";
        }

        let hayErrores = false;
        for (let error in errors) {
            if (errors[error]) {
                hayErrores = true;
            }
        }

        if (hayErrores) {
            return res.json({
                message: "Errors exist!",
                ok: false,
                status: 400,
                errors: errors,
            });
        }

        const user_found = await findUserByEmail(email)

        if (!user_found) {
            return res.json({
                ok: false,
                status: 400,
                message: "there is no user with this email",
            });
        }
        const isPasswordValid = await bcrypt.compare(password, user_found.password)

        if (!isPasswordValid) {
            return res.json({
                ok: false,
                status: 400,
                message: "Wrong password",
            });
        }
        const user_info = {
            id: user_found.id,
            name: user_found.name,
            email: user_found.email,
        }
        // SIGN UP O INSCRIBIRSE  
        const access_token = jwt.sign(user_info, ENVIROMENT.SECRET_KEY_JWT)

        return res.json({
            ok: true,
            status: 200,
            message: "Logged in",
            data: {
                user_info: {
                    id: user_found.id,
                    name: user_found.name,
                    email: user_found.email,
                },
                access_token: access_token
            },
        });
    } catch (error) {
        console.error(error);
        res.json({
            ok: false,
            status: 500,
            message: "Internal server error",
        });
    }
}

export const forgotPasswordController = async (req, res) => {
    try{
        console.log(req.body)
        const {email} = req.body
        const user_found = await User.findOne({email})
        if(!user_found){
            return res.json({
                ok: false,  
                status: 400,
                message: "there is no user with this email",
            })
        }
        else {
            const reset_token = jwt.sign ({email}, ENVIROMENT.SECRET_KEY_JWT, {expiresIn: "1d"})
            const reset_url = `${ENVIROMENT.URL_FRONTEND}/reset-password?reset_token=${reset_token}`
            await sendMail ({
                to: email,
                subject: "reset password",
                html: `
                <h1> Restablece tu contraseña </h1>
                <p> has click en el enlace de abajo para restablecer tu contraseña</p>
                <a href="${reset_url}"> restablecer contraseña </a>
                `
            })
            return res.json({
                ok: true,
                status: 200,
                message: "Email sent"
            })
        }
    }
    catch (error){
        console.error(error);
        res.json({
            ok: false,
            status: 500,
            message: "Internal server error",
        });
    }
}

export const resetPasswordController = async (req, res) =>{
    try{
        const {reset_token} = req.query
        const {password} = req.body

        const {email} = jwt.verify(reset_token, ENVIROMENT.SECRET_KEY_JWT)
        const user_found = await User.findOne({email})
        const password_hash = await bcrypt.hash(password, 10)

        user_found.password = password_hash
        
        await user_found.save()
        return res.json({
            ok: true,
            status: 200, 
            message: 'Password changed'
        })
    }
    catch(error){
        console.error(error)
        return res.json({
            ok:false,
            message: "Internal server error(no valid token)",
            status: 500,
        })
    }
} 