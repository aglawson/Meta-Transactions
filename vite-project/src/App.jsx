import { useState } from 'react'
import { ethers } from 'ethers'
import {MFABI, RABI, OMHABI, URL} from './secret';
import './App.css'
let userAddress;
let signer;
let provider;
let rpc_provider;
let rpc_wallet;
let forwarder;
let rec;
let omh_contract;
let abiCoder;

const relayer = '0x2A0d1f0EE9c5584b1694BCa16879423432770A52';
const recipient = '0x13e1F696059f7919A1be2BA0a27F98F993d38eB6';
const omh = '0x705aba98E3e6865F7f9Ef80Ba97afB43dE805705';

function App() {

  async function getCalls() {
    forwarder = new ethers.Contract(relayer, MFABI, provider);

    // rec = new ethers.Contract(recipient, RABI, rpc_provider);
    // let _num = await rec.calls();
    // if(num == 0){
    //   setNum(parseInt(_num));
    // }
  }

  async function getSigner () {
    abiCoder = new ethers.utils.AbiCoder();
    try{
      provider = new ethers.providers.Web3Provider(window.ethereum)
      await getCalls();
      await provider.send("eth_requestAccounts", []);
      omh_contract = new ethers.Contract(omh, OMHABI, provider);

  
      signer = await provider.getSigner();
  
      userAddress = await signer.getAddress();

      // let sender = await rec.latestSender();
      // console.log(sender);

      setMessage('Sign Message');
  
    } catch (error){
      alert(error.message);
    }
  }

  async function signMessage () {
    const nonce = await forwarder.getNonce(userAddress);
    const allowance = await omh_contract.allowance(userAddress, recipient);
    if(parseInt(allowance) < 1000) {
      await omh_contract.connect(signer).approve(recipient, '1000000000000000000000000000000000000000');
    }
    //let functionHash = await abiCoder.encode(['string'], ['writeMessage(string _message)']);
    //functionHash = functionHash.slice(functionHash.length - 10, functionHash.length);
    //console.log(functionHash);
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
      console.log(execute);
      // const execute = await forwarder.connect(rpc_wallet).execute(Req, flatSignature);
      // console.log(execute);
      // let _num = await rec.calls();
      // let sender = await rec.latestSender();
      // console.log(sender);
      // setNum(parseInt(_num) + 1);
      //alert(execute.hash);
    } catch(error) {
      alert(error.message);
    }
  }

  const [message, setMessage] = useState('Connect Wallet');
  const [num, setNum] = useState(0);

  return (
    <div className="App">
      <h1>Relay</h1>
      <p>Approve OMH spends once and buy in game items with no gas fees!</p>
      <div className="card">
        <p>{message == 'Connect Wallet' ? 'Connect Wallet' : 'Connected: ' + userAddress}</p>
        <button onClick={() => message == 'Connect Wallet' ? getSigner() : signMessage()}>
          {message}
        </button>
        {/* <button onClick={() => signMessage()}>
          {message != 'Connect Wallet' ? 'Sign Message' : ''}
        </button> */}
      </div>
    </div>
  )
}

export default App