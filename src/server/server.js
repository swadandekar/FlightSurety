import FlightSuretyApp from '../../build/contracts/FlightSuretyApp.json';
import Config from './config.json';
import Web3 from 'web3';
import express from 'express';


let config = Config['localhost'];
let web3 = new Web3(new Web3.providers.WebsocketProvider(config.url.replace('http', 'ws')));
web3.eth.defaultAccount = web3.eth.accounts[0];
let flightSuretyApp = new web3.eth.Contract(FlightSuretyApp.abi, config.appAddress);


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
});

    

var accounts =  promisify(cb => web3.eth.getAccounts(cb)).then(function (x){
console.log("accounts 0 :" + x[0]);
  //for(var i = 0; i < 6; i++){
    //40
    flightSuretyApp.methods.registerOracle()
    .send({
        from: x[1],
        value: web3.utils.toWei('1', 'ether'),
        gas: 1000000
    }, function (error, result)  {
        if (error) {
            console.log('Error  while registering oracles' + error)
        } else {
          console.log("Love to see this  ");
          console.log(result);
        }
   
      })
  //}

});


const app = express();
app.get('/api', (req, res) => {
    res.send({
      message: 'An API for use with your Dapp!'
    })
})

export default app;


