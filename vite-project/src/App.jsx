import { useState } from 'react'
import { ethers } from 'ethers'
import axios from 'axios';

import {MFABI, TOKEN_ABI, URL, etherscan} from './secret';
import './App.css'
let userAddress;
let signer;
let provider;
let forwarder;
let token_contract;
let abiCoder;

let link = etherscan;

const relayer = '0x2A0d1f0EE9c5584b1694BCa16879423432770A52';
const recipient = '0x62aEeD88eA286283D86ac1a00164073028bF3689';
const token = '0x24c8809834Ee44419168B4ceE26BBa5188595891';

function App() {

  async function getSigner () {
    abiCoder = new ethers.utils.AbiCoder();
    try{
      provider = new ethers.providers.Web3Provider(window.ethereum)
      forwarder = new ethers.Contract(relayer, MFABI, provider);
      await provider.send("eth_requestAccounts", []);
      token_contract = new ethers.Contract(token, TOKEN_ABI, provider);
      signer = await provider.getSigner();
      userAddress = await signer.getAddress();

      const allowance = await token_contract.allowance(userAddress, recipient);
      if(parseInt(allowance) < 1000) {
        setMessage('Approve Token Spend');
      } else {
        setMessage('Sign Message');
      }
  
    } catch (error){
      alert(error.message);
    }
  }

  async function mint() {
    await getSigner();
    await token_contract.connect(signer).mint('100000000000000000000');
  }

  async function bal() {
    let balance = await token_contract.balanceOf(userAddress);
    return parseInt(balance);
  }

  async function signMessage () {
    const nonce = await forwarder.getNonce(userAddress);
    const allowance = await token_contract.allowance(userAddress, recipient);
    if(parseInt(allowance) < 1000) {
      try{
        const approvaltx = await token_contract.connect(signer).approve(recipient, '1000000000000000000000000');
        await approvaltx.wait(1);
        setMessage('Sign Message');
      } catch (error) {
        alert(error.message);
      }
    }

    let data = abiCoder.encode(['uint256', 'uint256'], ['1000000000000000000', '0']);
    data = data.slice(2,data.length);
    // console.log(data);
    const Req = {
      from: userAddress,
      to: recipient,
      value: 0,
      gas: 100000,
      nonce: nonce,
      data: '0xef48eee6' + data
    }

    let message = ethers.utils.solidityKeccak256(
      ['address', 'address', 'uint256', 'uint256', 'uint256', 'bytes'],
      [Req.from, Req.to, Req.value, Req.gas, Req.nonce, Req.data] 
    );

    const arrayifyMessage = await ethers.utils.arrayify(message)
    const flatSignature = await signer.signMessage(arrayifyMessage)
    try {
      const execute = await axios.get(
        `${URL}${JSON.stringify(Req)}&signature=${flatSignature}`
      )
      if(execute.data.success) {
        link = etherscan + execute.data.message 
        document.getElementById('etherscanLink').innerHTML = `<a href=${link} target="blank">See tx</a>`
        console.log(link);
      } else {
        alert('Tx failed with error: ' + execute.data.message);
      }
    } catch(error) {
      alert(error.message);
    }
  }

  const [message, setMessage] = useState('Connect Wallet');

  return (
    <div className="App">
      <h1>Gasless Tx</h1>
      <p>Goerli Network</p>
      <p>Approve token spends once and transfer with no gas fees!</p>
      <div id="etherscanLink">

      </div>
      <div className="card">
        <p>{message == 'Connect Wallet' ? 'Not Connected' : 'Connected: ' + userAddress}</p>
        <button onClick={() => mint()}>Mint 100 Test Tokens</button>
        <button onClick={() => message == 'Connect Wallet' ? getSigner() : signMessage()}>
          {message}
        </button>
        
      </div>
    </div>
  )
}

export default App