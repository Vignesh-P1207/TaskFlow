const bcrypt = require("bcrypt");

// A focused unit test that doesn't need a live DB — verifies the password
// hashing/compare contract the auth controller relies on.
describe("password hashing", () => {
  it("hashes a password and verifies it correctly", async () => {
    const plain = "SuperSecret123";
    const hash = await bcrypt.hash(plain, 12);

    expect(hash).not.toBe(plain);
    await expect(bcrypt.compare(plain, hash)).resolves.toBe(true);
    await expect(bcrypt.compare("WrongPassword", hash)).resolves.toBe(false);
  });
});
