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


// flightSuretyApp.events.OracleRequest({
//     fromBlock: 0
//   }, function (error, event) {
//     if (error) console.log(error)
//     console.log(event)
//     console.log("Oracle request receieved");
//     console.log("index  "+event.returnValues.index);
//     console.log("airline  "+event.returnValues.airline);
//     console.log("flight  "+event.returnValues.flight);
//     console.log("timestamp  "+event.returnValues.timestamp);
//     submitOracleResponseCall( event.returnValues.index,  event.returnValues.airline,   event.returnValues.flight,  event.returnValues.timestamp)
// });

flightSuretyApp.events.FlightStatusInfo({
  fromBlock: 0
}, function (error, event) {
  if (error) console.log(error)
  
  console.log("Flight Status Info receieved");
 // console.log(event)
});
  
var accounts =  promisify(cb => web3.eth.getAccounts(cb));

function getAccounts(){
  return new Promise((resolve, reject) => {
      web3.eth.getAccounts().then(accounts => {
        web3.eth.defaultAccount = accounts[0];
        console.log("get accounts: success");
        resolve(accounts);
      }).catch(err => {
        reject(err);
      });
  });
}

function registerOracles(accounts){
  return new Promise((resolve, reject) => {
    let oracles = [];
    let rounds = accounts.length;
    console.log("rounds " + rounds);
    flightSuretyApp.methods.REGISTRATION_FEE().call().then(fee => {
      console.log("registeration fee : success");
      accounts.forEach(account => {
        console.log("account fetched "+ account);

        flightSuretyApp.methods.registerOracle().send({
            "from": account,
            "value": fee,
            // gas: 1000000
            "gas": 4712388,
            "gasPrice": 100000000000
        }).then(() => {
          console.log("register Oracle: success");  
          flightSuretyApp.methods.getMyIndexes().call({
            "from": account
          }).then(result => {
              console.log("getIndex: success");
              oracles.push(result);
              console.log(rounds);
              console.log(`Oracle Registered: ${result[0]}, ${result[1]}, ${result[2]} at ${account}`);
              rounds -= 1;
              // if (rounds<1) {
              //     resolve(oracles);
              // }
              if (!rounds) {
                resolve(oracles);
              }
          }).catch(err => {
              reject(err); // get index
          });


        }).catch(err => {
          reject(err); // register Oracle
        });
    

      });
    }).catch(err => {
      reject(err); // registeration fee
    });



  });  
}

getAccounts().then(accounts => {

  registerOracles(accounts).then(oracles => {
      console.log("Oracle counts "+ oracles.length);
      flightSuretyApp.events.OracleRequest({
          fromBlock: "latest"
      }, function (error, event) {
          if (error) {
              console.log(error)
          }
          let airline = event.returnValues.airline;
          let flight = event.returnValues.flight;
          let timestamp = event.returnValues.timestamp;
          let indexOfOracle = event.returnValues.index;
          let found = false;

          console.log("I am at main");

          // let selectedCode = STATUS_CODES[1];
          // let scheduledTime = (timestamp * 1000);
          // console.log(`Flight scheduled to: ${new Date(scheduledTime)}`);
          // if (scheduledTime < Date.now()) {
          //     //disabled to better debugging
          //     // selectedCode = STATUS_CODES[assignRandomIndex(2, STATUS_CODES.length - 1)];
          //     selectedCode = STATUS_CODES[2];
          // }
          if(counter > 6) {
            counter =1;
          }
          let statusCode = 20 //counter * 100 /10;
          counter = counter +1;
          console.log("counter " + counter);
          console.log("status code set " + statusCode );

          oracles.forEach((oracle, index) => {
              if (found) {
                  return false;
              }
              for(let idx = 0; idx < 3; idx += 1) {
                  if (found) {
                      break;
                  }
                  if (statusCode === 20) {
                      console.log("WILL COVER USERS");
                      flightSuretyApp.methods.creditInsurees(
                          accounts[index],
                          airline,                          
                          flight,
                          timestamp
                      ).send({
                          from: accounts[index]
                      }).then(result => {
                          console.log(result.returnValues);
                          console.log(`Flight ${flight}  and Account ${accounts[index]} got covered and insured the users`);
                      }).catch(err => {
                          console.log(" Error at creditInsuree "+err.message);
                      });
                  } //oracle[idx
                  flightSuretyApp.methods.submitOracleResponse(
                    oracle[idx], airline, flight, timestamp, statusCode
                  ).send({
                      from: accounts[index]
                  }).then(result => {
                      found = true;
                     // oracle[idx], airline, flight, timestamp, statusCode
                      console.log(`Oracle: ${oracle[idx]} responded from airline ${airline} flight ${flight} with status ${statusCode} `);
                  }).catch(err => {
                      console.log(`Error atsubmit oracle response :   ${err.message}  airline ${airline} flight ${flight} timestamp ${timestamp}`);
                  });
              }
          });
      });
  }).catch(err => {
      console.log(err.message);
  });
}).catch(err => {
  console.log(err.message);
});



const app = express();
app.get('/api', (req, res) => {
    res.send({
      message: 'An API for use with your Dapp!'
    })
})

export default app;


