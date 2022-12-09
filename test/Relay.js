const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
// const Tx = require("ethereumjs-tx");


describe("Relay", function () {

  beforeEach(async function () {
    const [owner, otherAccount, otherOtherAccount] = await ethers.getSigners();
    this.owner = owner;
    this.otherAccount = otherAccount;

    this.MinimalForwarder = await ethers.getContractFactory("MinimalForwarder");
    this.MF = await this.MinimalForwarder.deploy();

    this.Recipient = await ethers.getContractFactory("RecipientExample");
    this.R = await this.Recipient.deploy(this.MF.address);

    const tx = await this.owner.sendTransaction({
      to: this.MF.address,
      value: '1000000000000000000'
    });
  });

  describe("Deployment", function () {
    it('Recipient deploys with correct trusted forwarder', async function () {
      expect(await this.R.isTrustedForwarder(this.MF.address)).to.equal(true);
    });
  });
    
  describe("Relay", async function() {
    it('Relays', async function () {

      const typeHash = await this.MF._TYPEHASH();
      const Req = {
        from: this.otherAccount.address,
        to: this.R.address,
        value: '1000000000000000000',
        gas: 100000,
        nonce: 0,
        data: '0x85740a23'
      }

      let message = ethers.utils.solidityKeccak256(
        ['address', 'address', 'uint256', 'uint256', 'uint256', 'bytes'],
        [Req.from, Req.to, Req.value, Req.gas, Req.nonce, Req.data] 
      );
      //console.log(message)
      const arrayifyMessage = await ethers.utils.arrayify(message)
      //console.log(arrayifyMessage)
      const flatSignature = await this.otherAccount.signMessage(arrayifyMessage)
      // console.log(flatSignature)

      expect(await this.MF.connect(this.otherAccount).verify(Req, flatSignature)).to.equal(true);
      const res = await this.MF.connect(this.otherAccount).execute(Req, flatSignature);
      console.log(res);
      console.log(await this.R.calls());
    });
  });
});
