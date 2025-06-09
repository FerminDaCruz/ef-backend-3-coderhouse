import supertest from "supertest";
import app from "../src/app.js";
import adoptionModel from "../src/dao/Adoption.js";
import userModel from "../src/dao/models/User.js";
import petModel from "../src/dao/models/Pet.js";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { expect } from "chai";

dotenv.config({ path: ".env.test" });

const request = supertest(app);

before(async () => {});

after(async () => {
    await mongoose.connection.close();
});

beforeEach(async () => {
    await adoptionModel.deleteMany({});
    await userModel.deleteMany({});
    await petModel.deleteMany({});
});

describe("Adoptions API", () => {
    let user;
    let pet;
    let adoptionId;

    beforeEach(async () => {
        user = await userModel.create({
            first_name: "Test",
            last_name: "User",
            email: `testuser${Date.now()}@mail.com`,
            password: "1234",
        });

        pet = await petModel.create({
            name: "Firulais",
            specie: "Perro",
            birthDate: new Date("2020-01-01"),
        });
    });

    it("POST /api/adoptions/:uid/:pid → debería crear una adopción", async () => {
        const response = await request
            .post(`/api/adoptions/${user._id}/${pet._id}`)
            .expect(200);

        expect(response.body.status).to.equal("success");
        expect(response.body.message).to.equal("Pet adopted");

        // Guardamos el adoptionId para usarlo después
        const adoption = await adoptionModel.findOne({
            owner: user._id,
            pet: pet._id,
        });
        expect(adoption).to.be.ok();
        adoptionId = adoption._id;
    });

    it("GET /api/adoptions/ → debería devolver las adopciones", async () => {
        // Primero creamos una adopción
        await adoptionModel.create({
            owner: user._id,
            pet: pet._id,
        });

        const response = await request.get("/api/adoptions/").expect(200);

        expect(response.body.status).to.equal("success");
        expect(Array.isArray(response.body.payload)).to.equal(true);
        expect(response.body.payload.length).to.be.at.least(1);
    });

    it("GET /api/adoptions/:aid → debería devolver una adopción específica", async () => {
        const newAdoption = await adoptionModel.create({
            owner: user._id,
            pet: pet._id,
        });

        const response = await request
            .get(`/api/adoptions/${newAdoption._id}`)
            .expect(200);

        expect(response.body.status).to.equal("success");
        expect(response.body.payload._id).to.equal(newAdoption._id.toString());
    });

    it("GET /api/adoptions/:aid → debería devolver 404 si no existe", async () => {
        const fakeId = new mongoose.Types.ObjectId();
        const response = await request
            .get(`/api/adoptions/${fakeId}`)
            .expect(404);

        expect(response.body.status).to.equal("error");
        expect(response.body.error).to.equal("Adoption not found");
    });
});
