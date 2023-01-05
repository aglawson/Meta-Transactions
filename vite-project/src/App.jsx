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
const recipient = '0x85Ee6Ce038A5518Eb7897578ffDf675eF06dB3F7' //'0x62aEeD88eA286283D86ac1a00164073028bF3689';

function App() {

  async function getSigner (e) {
    e.preventDefault();
    abiCoder = new ethers.utils.AbiCoder();
    try{
      provider = new ethers.providers.Web3Provider(window.ethereum)
      forwarder = new ethers.Contract(relayer, MFABI, provider);
      await provider.send("eth_requestAccounts", []);
      //token_contract = new ethers.Contract(token, TOKEN_ABI, provider);
      signer = await provider.getSigner();
      userAddress = await signer.getAddress();

      if(provider.network.chainId != 5) {
        //https://rpc.goerli.dev
        await window.ethereum.request({
         method: "wallet_switchEthereumChain",
         params: [{
             chainId: "0x5"
         }]
        });
       }

      // const allowance = await token_contract.allowance(userAddress, recipient);
      // if(parseInt(allowance) < 1000) {
      //   setMessage('Approve Token Spend');
      // } else {
      setMessage('Mint');
      // }
  
    } catch{
      getSigner();
    }
  }

  async function bal() {
    let balance = await token_contract.balanceOf(userAddress);
    return parseInt(balance);
  }

  async function signMessage (e) {
    e.preventDefault();
    const nonce = await forwarder.getNonce(userAddress);
    // const allowance = await token_contract.allowance(userAddress, recipient);
    // if(parseInt(allowance) < 1000) {
    //   try{
    //     const approvaltx = await token_contract.connect(signer).approve(recipient, '1000000000000000000000000');
    //     await approvaltx.wait(1);
    //     setMessage('Sign Message');
    //   } catch (error) {
    //     alert(error.message);
    //   }
    // }

    let data = abiCoder.encode(['uint256'], [amount]);
    data = data.slice(2,data.length);
    // console.log(data);
    const Req = {
      from: userAddress,
      to: recipient,
      value: 0,
      gas: 100000,
      nonce: nonce,
      data: '0xa0712d68' + data
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

  function updateAmount(direction) {
    if(userAddress != '') {
      if(direction == 'up' && amount < 10) {
        setAmount(amount + 1);
      } else if (direction == 'down' && amount > 1) {
        setAmount(amount - 1);
      }
    }
  }

  const [amount, setAmount] = useState(1);
  const [message, setMessage] = useState('Connect Wallet');

  return (
    <div className="App">
      <h1>Gasless Tx</h1>
      <p>Goerli Network</p>
      <p>Mint an NFT with No Gas Fees!</p>
      <div id="etherscanLink">

      </div>
      <div className="card">
        <p>{message == 'Connect Wallet' ? 'Not Connected' : 'Connected: ' + userAddress}</p>
        {/* <button onClick={() => mint()}>Mint 100 Test Tokens</button> */}
        {/* <button onClick={() => message == 'Connect Wallet' ? getSigner() : signMessage()}>
          {message}
        </button> */}

        <form onSubmit={e => message == 'Connect Wallet' ? getSigner(e) : signMessage(e)}>
          <button type="submit">{message == 'Connect Wallet' ? message : message + ' ' + amount}</button>
			  </form>
        <button onClick={() => updateAmount('up')}>^</button>
        <button onClick={() => updateAmount('down')}>v</button>
        
      </div>
    </div>
  )
}

export default App