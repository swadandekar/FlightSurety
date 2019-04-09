
var Test = require('../config/testConfig.js');
var BigNumber = require('bignumber.js');

contract('Flight Surety Tests', async (accounts) => {

  var config;
  before('setup contract', async () => {
    config = await Test.Config(accounts);
    //await config.flightSuretyData.authorizeCaller(config.flightSuretyApp.address);
  });

  /****************************************************************************************/
  /* Operations and Settings                                                              */
  /****************************************************************************************/

  it(`Test 1 (multiparty) has correct initial isOperational() value`, async function () {

    // Get operating status
    let status = await config.flightSuretyData.isOperational.call();
    assert.equal(status, true, "Incorrect initial operating status value");

  });

  it(`Test 2 (multiparty) can block access to setOperatingStatus() for non-Contract Owner account`, async function () {

      // Ensure that access is denied for non-Contract Owner account
      let accessDenied = false;
      try 
      {
          await config.flightSuretyData.setOperatingStatus(false, { from: config.testAddresses[2] });
      }
      catch(e) {
          accessDenied = true;
      }
      assert.equal(accessDenied, true, "Access not restricted to Contract Owner");
            
  });

  it(`Test 3 (multiparty) can allow access to setOperatingStatus() for Contract Owner account`, async function () {

      // Ensure that access is allowed for Contract Owner account
      let accessDenied = false;
      try 
      {
          await config.flightSuretyData.setOperatingStatus(false);
      }
      catch(e) {
          accessDenied = true;
      }
      assert.equal(accessDenied, false, "Access not restricted to Contract Owner");
      
  });

  it(`Test 4 (multiparty) can block access to functions using requireIsOperational when operating status is false`, async function () {

      await config.flightSuretyData.setOperatingStatus(false);

      let reverted = false;
      try 
      {
          await config.flightSurety.setTestingMode(true);
      }
      catch(e) {
          reverted = true;
      }
      assert.equal(reverted, true, "Access not blocked for requireIsOperational");      

      // Set it back for other tests to work
      await config.flightSuretyData.setOperatingStatus(true);

  });

  it('Test 5 (airline) can be registered an Airline using registerAirline() if it is funded', async () => {
    
    // ARRANGE
    let newAirline = accounts[2];    

    let amount = 10; 
    amount = web3.utils.toWei(amount.toString(), 'ether');



    // ACT
    try {
       await config.flightSuretyApp.registerAirline(newAirline, "AC02",1, {from: config.firstAirline});
       await config.flightSuretyApp.fundAirline(newAirline,{from: config.firstAirline, value: amount, gasPrice: 0});
       
       
    }
    catch(e) {

    }
    
     let result = await config.flightSuretyData.isAirline.call(newAirline); 

    // ASSERT
    assert.equal(result, true, "Airline should be able to register another airline if it has provided funding");

  });
 
  it('Test 6 (airline) cannot register an Airline using registerAirline() if it is not funded', async () => {
    
    // ARRANGE
    let thirdAirline = accounts[3];   
    let fourthAirline = accounts[4]; 
    let amount = 5; 
    amount = web3.utils.toWei(amount.toString(), 'ether');

    // // ACT
    try {
        await config.flightSuretyApp.registerAirline( thirdAirline, "AC03", 0, {from: fourthAirline});
        await config.flightSuretyApp.fundAirline(thirdAirline,{from: config.firstAirline, value: amount, gasPrice: 0});
    }
    catch(e) {

    }
    let result = await config.flightSuretyData.isAirline.call(thirdAirline); 

    // let cnt = await config.flightSuretyData.getAirlineCount.call(); 
    // console.log("airline count "+ cnt);
    console.log("amount "+ amount);

    // ASSERT
    assert.equal(result, false, "Airline should not be able to register another airline if it hasn't provided funding");

  });

  it('Test 7 (airline) cannot register an Airline using registerAirline() if do not have 50% airlines votoes ', async () => {
    
    // ARRANGE
    let thirdAirline = accounts[3];   
    let fourthAirline = accounts[4]; 
    let fifthAirline = accounts[5];
    let amount = 10; 
    amount = web3.utils.toWei(amount.toString(), 'ether');
    
    let cnt = await config.flightSuretyData.getAirlineCount.call(); 
    console.log("airline count 7 before  "+ cnt);

    // // ACT
    try {
        await config.flightSuretyApp.registerAirline( thirdAirline, "AC03", 0, {from: config.firstAirline});
        await config.flightSuretyApp.fundAirline(thirdAirline,{from: config.firstAirline, value: amount, gasPrice: 0});

        await config.flightSuretyApp.registerAirline( fourthAirline, "AC04", 0, {from: config.firstAirline});
        await config.flightSuretyApp.fundAirline(fourthAirline,{from: config.firstAirline, value: amount, gasPrice: 0});

        await config.flightSuretyApp.registerAirline( fifthAirline, "AC05", 1, {from: config.firstAirline});
        await config.flightSuretyApp.fundAirline(fifthAirline,{from: config.firstAirline, value: amount, gasPrice: 0});
    }
    catch(e) {

    }


    let result = await config.flightSuretyData.isAirline.call(fifthAirline); 

    let cnt2 = await config.flightSuretyData.getAirlineCount.call(); 
    console.log("airline count 7 after "+ cnt2);

    let resultApproval = await config.flightSuretyData.checkAirlinesApproval.call(1);
    console.log("check approval result: " + resultApproval);

    // ASSERT
    assert.equal(result, false, "Airline should not be able to register when do not have enough votes");

  });

  it('Test 8 (airline) can be registerd an Airline using registerAirline() if has 50% airlines votoes ', async () => {
    
    // ARRANGE
 
    let sixAirline = accounts[6];
    let amount = 10; 
    amount = web3.utils.toWei(amount.toString(), 'ether');
    //amount = web3.toBigNumber(web3.utils.toWei(amount.toString(), 'ether'));

    // // ACT
    try {

        await config.flightSuretyApp.registerAirline( sixAirline, "AC06",3, {from: config.firstAirline});
        await config.flightSuretyApp.fundAirline(sixAirline,{from: config.firstAirline, value: amount, gasPrice: 0});
    }
    catch(e) {

    }
    
    let result = await config.flightSuretyData.isAirline.call(sixAirline); 

    // ASSERT
    assert.equal(result, true, "Airline should be able to registered when has enough votes");

  });
});
