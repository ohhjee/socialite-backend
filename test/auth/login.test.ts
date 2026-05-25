import { App } from "../../src/app";
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";

const app = new App();

beforeAll(async () => {
  await app.init();
});

afterAll(async () => {
  await app.shutdown();
});

describe("Tests the user login", () => {
  it("should login a user", async () => {
    const endPoint = "/api/v1/user/auth/login";

    const userData = {
      email: "FtHbE@example.com",
      password: "Password123@",
      //   firstName: "John",
      //   lastName: "Doe",
      //   userName: "johndoe",
      //   passwordConfirmation: "Password123@",
    };

    const response = await request(app.express).post(endPoint).send(userData);

    console.log(response.status);
    console.log(response.body);

    expect(response.status).toBe(200);
    expect(response.body).toBeDefined();
  });
});
