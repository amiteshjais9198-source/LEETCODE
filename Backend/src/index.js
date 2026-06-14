const dns = require('dns');

dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const express = require("express");
const app = express();
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const main = require("./config/db")
const cookieparser = require("cookie-parser");
const authRouter = require("./routes/userAuth");
const redisClient = require('./config/redis');
const problemRouter = require("./routes/problemCreator");


app.use(express.json());
app.use(cookieparser());

app.use("/user", authRouter);
app.use("/problem", problemRouter);

const InitalizeConnection = async () => {
    try {
        await Promise.all([main(), redisClient.connect()]);
        console.log("The db is connected");

        app.listen(process.env.PORT, () => {
            console.log("SERVER LISTENING AT " + process.env.PORT);
        })

    }
    catch (err) {
        console.error("Error connecting to services:", err);
        if (err.errors) {
            console.error("Individual errors:", err.errors);
        }
    }
}

InitalizeConnection();

