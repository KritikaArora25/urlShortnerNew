import express from "express";
import {nanoid} from "nanoid"
import dotenv from "dotenv"
import connectDB from "./src/config/monogo.config.js"
import short_url from "./src/routes/short_url.route.js"
import user_routes from "./src/routes/user.routes.js"
import auth_routes from "./src/routes/auth.routes.js"
import { redirectFromShortUrl } from "./src/controller/short_url.controller.js";
import { errorHandler } from "./src/utils/errorHandler.js";
import cors from "cors"
import { attachUser } from "./src/utils/attachUser.js";
import cookieParser from "cookie-parser"

dotenv.config()  // ← Fixed this line

// Debug environment variables
console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'Loaded' : 'NOT LOADED');
console.log('PORT:', process.env.PORT);

const app = express();

app.use(cors({
    origin: true,  // Allow all origins in development
    credentials: true
}));

app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(cookieParser())

app.use(attachUser)

app.use("/api/user",user_routes)
app.use("/api/auth",auth_routes)
app.use("/api/create",short_url)
app.get("/:id",redirectFromShortUrl)

app.use(errorHandler)

app.listen(3000,()=>{
    console.log("Server is running on http://localhost:3000");
    connectDB()  // Call connectDB after server starts
})