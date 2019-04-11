import FlightSuretyApp from '../../build/contracts/FlightSuretyApp.json';
import Config from './config.json';
import Web3 from 'web3';
import express from 'express';


let config = Config['localhost'];
let web3 = new Web3(new Web3.providers.WebsocketProvider(config.url.replace('http', 'ws')));
web3.eth.defaultAccount = web3.eth.accounts[0];
let flightSuretyApp = new web3.eth.Contract(FlightSuretyApp.abi, config.appAddress);
let counter =1;


const promisify = (inner) =>
new Promise((resolve, reject) =>
    inner((err, res) => {
        if (err) {
            console.log("error caugth  " + err);
            reject(err);
        } else {
            console.log("success");
            console.log(res);
            resolve(res);
        }
    })
);


flightSuretyApp.events.OracleRequest({
    fromBlock: 0
  }, function (error, event) {
    if (error) console.log(error)
    console.log(event)
    console.log("Oracle request receieved");
    console.log("index  "+event.returnValues.index);
    console.log("airline  "+event.returnValues.airline);
    console.log("flight  "+event.returnValues.flight);
    console.log("timestamp  "+event.returnValues.timestamp);
    submitOracleResponseCall( event.returnValues.index,  event.returnValues.airline,   event.returnValues.flight,  event.returnValues.timestamp)
});

flightSuretyApp.events.FlightStatusInfo({
  fromBlock: 0
}, function (error, event) {
  if (error) console.log(error)
  console.log(event)
  console.log("Flight Status Info receieved");

});
  

var accounts =  promisify(cb => web3.eth.getAccounts(cb)).then(function (x){
console.log("accounts 0 :" + x[0]);
  //for(var i = 0; i < 6; i++){
    //40
    flightSuretyApp.methods.registerOracle()
    .send({
        from: x[0],
        value: web3.utils.toWei('1', 'ether'),
       // gas: 1000000
       "gas": 4712388,
       "gasPrice": 100000000000
    }, function (error, result)  {
        if (error) {
            console.log('Error  while registering oracles' + error)
        } else {
          console.log("Love to see this ");
          console.log(result);
        }
   
      })
  //}

});

function submitOracleResponseCall( index,  airline,   flight,  timestamp){
  
  var accounts =  promisify(cb => web3.eth.getAccounts(cb)).then(function (x){
      console.log("accounts 0 in submit :" + x[0]);

      if(counter > 6) {
        counter =1;
      }
      let statusCode = counter * 100 /10;
      counter = counter +1;
      flightSuretyApp.methods.submitOracleResponse(index,  airline,   flight,  timestamp,statusCode)
      .send({
          from: x[0] ,
          // gas: 1000000
          "gas": 4712388,
          "gasPrice": 100000000000
        }, function (error, result)  {
          if (error) {
              console.log('Error  while submitting oracle response' + error)
          } else {
            console.log("Oracle response submitted");
          }
      
        })
  });
}

const app = express();
app.get('/api', (req, res) => {
    res.send({
      message: 'An API for use with your Dapp!'
    })
})

export default app;


