import { expect } from "chai";
import { ethers, upgrades } from "hardhat";

describe("ETCArmy", function () {
  it("Test contract", async function () {
    const ContractFactory = await ethers.getContractFactory("ETCArmy");

    const defaultAdmin = (await ethers.getSigners())[0].address;
    const pauser = (await ethers.getSigners())[1].address;
    const minter = (await ethers.getSigners())[2].address;
    const upgrader = (await ethers.getSigners())[3].address;

    const instance = await upgrades.deployProxy(ContractFactory, [defaultAdmin, pauser, minter, upgrader]);
    await instance.waitForDeployment();

    expect(await instance.uri(0)).to.equal("");
  });
});
