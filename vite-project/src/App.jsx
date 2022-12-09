import { useState } from 'react'
import reactLogo from './assets/react.svg'
import { ethers } from 'ethers'
import {PRIVATE_KEY, RPC_URL, MFABI, RABI} from './secret';
const PK = PRIVATE_KEY;
const RPC = RPC_URL;
import './App.css'
let userAddress;
let signer;
let provider;
let rpc_provider;
let rpc_wallet;
let forwarder;
let rec;

async function initializeRpc() {
  rpc_provider = new ethers.providers.JsonRpcProvider(RPC);
  rpc_wallet = new ethers.Wallet(PK, rpc_provider);
}

const relayer = '0xE39448E03A98111D6817668B015d3598d6aD0E8A';
const recipient = '0x8f2D26DE3D7d96Ad92312ead846B2B3Fdf290ff7';

function App() {

  async function getCalls() {
    forwarder = new ethers.Contract(relayer, MFABI, rpc_provider);

    rec = new ethers.Contract(recipient, RABI, rpc_provider);
    let _num = await rec.calls();
    if(num == 0){
      setNum(parseInt(_num));
    }
  }

  async function getSigner () {
    try{
      await initializeRpc();
      await getCalls();
      provider = new ethers.providers.Web3Provider(window.ethereum)
      await provider.send("eth_requestAccounts", []);
  
      signer = await provider.getSigner();
  
      userAddress = await signer.getAddress();

      setMessage('Sign Message');
  
    } catch (error){
      alert(error.message);
    }
  }

  async function signMessage () {
    const nonce = await forwarder.getNonce(userAddress);

    const Req = {
      from: userAddress,
      to: recipient,
      value: 0,
      gas: 100000,
      nonce: nonce,
      data: '0x85740a23'
    }

    let message = ethers.utils.solidityKeccak256(
      ['address', 'address', 'uint256', 'uint256', 'uint256', 'bytes'],
      [Req.from, Req.to, Req.value, Req.gas, Req.nonce, Req.data] 
    );

    const arrayifyMessage = await ethers.utils.arrayify(message)
    const flatSignature = await signer.signMessage(arrayifyMessage)
    try {
      const execute = await forwarder.connect(rpc_wallet).execute(Req, flatSignature);
        let _num = await rec.calls();
        setNum(parseInt(_num) + 1);
        alert(execute.hash);
    } catch(error) {
      alert(error.message);
    }
  }



  const [message, setMessage] = useState('Connect Wallet');
  const [num, setNum] = useState(0);

  return (
    <div className="App">
      <h1>Relay</h1>
      <div className="card">
        <p>{message == 'Connect Wallet' ? message : 'Successful Relays: ' + num}</p>
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