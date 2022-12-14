import { useState } from 'react'
import { ethers } from 'ethers'
import {MFABI, RABI, OMHABI, URL} from './secret';
import './App.css'
let userAddress;
let signer;
let provider;
let forwarder;
let omh_contract;
let abiCoder;

const relayer = '0x2A0d1f0EE9c5584b1694BCa16879423432770A52';
const recipient = '0x13e1F696059f7919A1be2BA0a27F98F993d38eB6';
const omh = '0x705aba98E3e6865F7f9Ef80Ba97afB43dE805705';

function App() {

  async function getSigner () {
    abiCoder = new ethers.utils.AbiCoder();
    try{
      provider = new ethers.providers.Web3Provider(window.ethereum)
      forwarder = new ethers.Contract(relayer, MFABI, provider);
      await provider.send("eth_requestAccounts", []);
      omh_contract = new ethers.Contract(omh, OMHABI, provider);
      signer = await provider.getSigner();
      userAddress = await signer.getAddress();

      const allowance = await omh_contract.allowance(userAddress, recipient);
      if(parseInt(allowance) < 1000) {
        setMessage('Approve OMH Spend');
      } else {
        setMessage('Sign Message');
      }
  
    } catch (error){
      alert(error.message);
    }
  }

  async function signMessage () {
    const nonce = await forwarder.getNonce(userAddress);
    const allowance = await omh_contract.allowance(userAddress, recipient);
    if(parseInt(allowance) < 1000) {
      try{
        const approvaltx = await omh_contract.connect(signer).approve(recipient, '1000000000000000000000000000000000000000');
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
      const execute = await fetch(
        `${URL}${JSON.stringify(Req)}&signature=${flatSignature}`
      );
    } catch(error) {
      alert(error.message);
    }
  }

  const [message, setMessage] = useState('Connect Wallet');

  return (
    <div className="App">
      <h1>Relay</h1>
      <p>Approve OMH spends once and buy in game items with no gas fees!</p>
      <div className="card">
        <p>{message == 'Connect Wallet' ? 'Not Connected' : 'Connected: ' + userAddress}</p>
        <button onClick={() => message == 'Connect Wallet' ? getSigner() : signMessage()}>
          {message}
        </button>
      </div>
    </div>
  )
}

export default App