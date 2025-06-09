import express from "express";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";

import usersRouter from "./routes/users.router.js";
import petsRouter from "./routes/pets.router.js";
import adoptionsRouter from "./routes/adoption.router.js";
import sessionsRouter from "./routes/sessions.router.js";

import swaggerUI from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";
import __dirname from "./utils.js";

const app = express();
const PORT = process.env.PORT || 8080;
const MONGO_URL = process.env.MONGO_URL || "mongodb://localhost:27017/adoptme";
const connection = mongoose.connect(MONGO_URL, { dbName: "adoptme" });

console.log(__dirname + "routes/*.js");

const swaggerOptions = {
    definition: {
        openapi: "3.0.1",
        info: {
            title: "API AdoptMe",
            version: "1.0.0",
            description: "Documentación de la API AdoptMe",
        },
    },
    apis: [`${__dirname}/routes/*.js`], // Busca comentarios JSDoc
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerSpec)); //Si no queremos usar comentarios: const swaggerSpec = YAML.load( path.join(__dirname, 'docs', 'swagger.yaml') );

app.use(express.json());
app.use(cookieParser());

app.use("/api/users", usersRouter);
app.use("/api/pets", petsRouter);
app.use("/api/adoptions", adoptionsRouter);
app.use("/api/sessions", sessionsRouter);

app.listen(PORT, () => console.log(`Listening on ${PORT}`));

export default app;
