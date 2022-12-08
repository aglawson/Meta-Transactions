const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");

describe("Relay", function () {

  beforeEach(async function () {
    const [owner, otherAccount, otherOtherAccount] = await ethers.getSigners();
    this.owner = owner;
    this.otherAccount = otherAccount;
    this.otherOtherAccount = otherOtherAccount;

    this.MinimalForwarder = await ethers.getContractFactory("MinimalForwarder");
    this.MF = await this.MinimalForwarder.deploy();

    this.Recipient = await ethers.getContractFactory("RecipientExample");
    this.R = await this.Recipient.deploy(this.MF.address);
  });

  describe("Deployment", function () {
    it('Recipient deploys with correct trusted forwarder', async function () {
      expect(await this.R.isTrustedForwarder(this.MF.address)).to.equal(true);
    });
  });
    
  describe("Relay", async function() {
    it('Relays', async function () {
      let Req = {
        from: this.otherAccount.address,
        to: this.R.address,
        value: '1000000000000',
        gas: 100000,
        nonce: 1,
        data: '0x'
      }
      const signature = await this.otherAccount.signMessage(JSON.stringify(Req));
      let res = await this.MF.connect(this.otherAccount).execute(Req, signature);
      console.log(res);
    });
  });
});
