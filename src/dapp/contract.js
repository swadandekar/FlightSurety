import FlightSuretyApp from '../../build/contracts/FlightSuretyApp.json';
//import FlightSuretyData from '../../build/contracts/FlightSuretyData.json';
import Config from './config.json';
import Web3 from 'web3';

export default class Contract {
    constructor(network, callback) {

        let config = Config[network];
        this.web3 = new Web3(new Web3.providers.HttpProvider(config.url));
       // this.flightSuretyData = new this.web3.eth.Contract(FlightSuretyData.abi, config.dataAddress);
        this.flightSuretyApp = new this.web3.eth.Contract(FlightSuretyApp.abi, config.appAddress);
        this.initialize(callback);
        this.owner = null;
        this.airlines = [];
        this.passengers = [];
        this.firstAirline = null;
      
    }

    initialize(callback) {
        this.web3.eth.getAccounts((error, accts) => {
           console.log(accts);
            this.owner = accts[0];
            this.firstAirline = accts[1];
            let counter = 2;
            
            while(this.airlines.length < 5) {
                this.airlines.push(accts[counter++]);
            }

            while(this.passengers.length < 5) {
                this.passengers.push(accts[counter++]);
            }

            //this.fundAirline("Sprint",callback);

            callback();
        });
    }

    isOperational(callback) {
       let self = this;
       console.log("I am the caller "+ self.owner );
       self.flightSuretyApp.methods
            .isOperational()
            .call({ from: self.owner}, callback);
    }

    isAirline(airline, callback) {
        let self = this;
        console.log("I am the caller on isAirline"+ self.owner );
        self.flightSuretyApp.methods
             .isAirline(airline)
             .call({ from: self.owner}, callback);
     }


    fetchFlightStatus(flight, callback) {
        let self = this;
        let airlineAddress;
        if(flight == "AC01")
        {    
            airlineAddress = self.airlines[0];
        }
        else{
            
            airlineAddress = self.airlines[1];
        }
        let payload = {
            airline: airlineAddress,
            flight: flight,
            timestamp: 1549432800
        } 
        self.flightSuretyApp.methods
            .fetchFlightStatus(payload.airline, payload.flight, payload.timestamp)
            .send({ from: self.owner}, (error, result) => {
                callback(error, payload);
            });
    }

    registerAirline(airlineCode, callback) {
        let self = this;
        let airlineAddress;
        if(airlineCode == "airCanada")
        {
            airlineAddress =  self.airlines[0];
        }
        else{
            airlineAddress =  self.airlines[1];
        }
        let payload = {
            airline: airlineAddress,
            airlineCode: airlineCode,
            validVotesCount: 0
        } 
        self.flightSuretyApp.methods
            .registerAirline(payload.airline, payload.airlineCode, payload.validVotesCount)
            .send({ from: this.firstAirline}, (error, result) => {
                callback(error, payload);
            });
    }

    fundAirline(airlineCode, callback) {
        let self = this;
        let airlineAddress;
        let amount = 10; 
        amount = web3.toWei(amount.toString(), 'ether');
        if(airlineCode == "airCanada")
        {
            airlineAddress =  self.airlines[0];
        }
        else{
            airlineAddress =  self.airlines[1];
        }
        let payload = {
            airline: airlineAddress
        } 
        self.flightSuretyApp.methods
            .fundAirline(payload.airline)
            .send({ from: this.firstAirline,value: amount, gasPrice: 0}, (error, result) => {
                callback(error, payload);
            });
    }

    registerFlight(flightCode, callback) {
        let self = this;
        let airlineAddress;
        if(flightCode == "AC01")
        {    
            airlineAddress = self.airlines[0];
        }
        else{
            
            airlineAddress = self.airlines[1];
        }
        let payload = {
            airline: airlineAddress,
            flight: flightCode,
            timestamp: Date.now(),// 1549432800,
            StatusCode: 0
        } 
        let timestamp =Date.now();
        //await config.flightSuretyApp.registerFlight( airline,"US01", timestamp,10, {from: config.firstAirline});
        console.log("payload " +payload.airline + ' ' + payload.flight +' ' + payload.StatusCode);
        console.log(self.airlines[0]);
        self.flightSuretyApp.methods
           // .registerFlight(payload.airline, payload.flight, payload.timestamp, payload.StatusCode)
           .registerFlight(this.firstAirline, "US01", timestamp, 10)
            .send({ from: self.owner, "gas": 4712388, "gasPrice": 100000000000}, (error, result) => {
                callback(error, payload);
            });
    }

    purchaseFlightInsurance(flight, callback) {
        let self = this;
        let airlineAddress;
        let amount = 1; 
        amount = web3.toWei(amount.toString(), 'ether');
        if(flight == "AC01")
        {    
            airlineAddress = self.airlines[0];
        }
        else{
            
            airlineAddress = self.airlines[1];
        }
        let payload = {
            insuree: self.passengers[0],
            airline: airlineAddress,
            flight: flight,
            timestamp: 1549432800
        } 
        self.flightSuretyApp.methods
            .buy(payload.insuree, payload.airline, payload.flight, payload.timestamp)
            .send({ from: self.owner,value: amount, "gas": 4712388, "gasPrice": 100000000000}, (error, result) => {
                callback(error, payload);
            });
    }

    withdrawCredits(callback) {
        let self = this;
        let payload = {
            insuree: self.passengers[0]
        }
        self.flightSuretyApp.methods
            .pay(payload.insuree)
            .send({ from: self.owner}, (error, result) => {
                callback(error, payload);
            });
    }

    showCredits(callback) {
        let self = this;
        let payload = {
            insuree: self.passengers[0]
        }
        self.flightSuretyApp.methods
            .getCredits(payload.insuree)
            .send({ from: self.owner}, (error, result) => {
                callback(error, payload);
            });
    }


    checkInsuredAmount(flight, callback) {
        let self = this;
        let airlineAddress;
        let amount = 1; 
        amount = web3.toWei(amount.toString(), 'ether');
        if(flight == "AC01")
        {    
            airlineAddress = self.airlines[0];
        }
        else{
            
            airlineAddress = self.airlines[1];
        }
        let payload = {
            insuree: self.passengers[0],
            airline: airlineAddress,
            flight: flight,
            timestamp: 1549432800
        } 
        self.flightSuretyApp.methods
            .getPassengerInsuredAmount(payload.insuree, payload.airline, payload.flight, payload.timestamp)
            .send({ from: self.owner,"gas": 4712388, "gasPrice": 100000000000}, (error, result) => {
                callback(error, payload);
            });
    }
}