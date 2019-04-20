
import DOM from './dom';
import Contract from './contract';
import './flightsurety.css';


(async() => {

    let result = null;

    let contract = new Contract('localhost', () => {
        console.log("I am here");
        console.log(contract);
        // Read transaction
        contract.isOperational((error, result) => {
            console.log(result);
            console.log(error);
            console.log(error,result);
            display('Operational Status', 'Check if contract is operational', [ { label: 'Operational Status', error: error, value: result} ]);
        });

        // contract.flightSuretyApp.events.FlightStatusInfo({
        //     fromBlock: "latest"
        // }, function (error, result) {
        //     if (error) {
        //         console.log(error)
        //     } else {
        //         console.log("Flight status info received");
        //         console.log(result.returnValues);
        //         let els = document.querySelectorAll(`.${ btoa(result.returnValues.timestamp + result.returnValues.flight)}`);
        //         console.log(els[els.length - 1]);
        //         els[els.length - 1].querySelector(".results").innerText = result.returnValues.status === "10" ? "10 - On time" : `${result.returnValues.status} - ${STATUS_CODES.find(code => code.code == result.returnValues.status).label}`;
        //     }
        // });


        // contract.flightSuretyData.events.CreditInsured({
        //     fromBlock: "latest"
        // }, function (error, result) {
        //     if (error) {
        //         console.log(error)
        //     } else {
        //         alert(`Account ${result.returnValues.passenger} got refunded ${result.returnValues.amount} regarding flight ${result.returnValues.flight}`);
        //     }
        // });
    

        // fetch flight status
        DOM.elid('submit-oracle').addEventListener('click', () => {
            let flight = DOM.elid('flight-number').value;
            // Write transaction
            contract.fetchFlightStatus(flight, (error, result) => {
                display('Oracles', 'Trigger oracles', [ { label: 'Fetch Flight Status', error: error, value: result.flight + ' ' + result.timestamp} ]);
            });
        })

        // check airline  
        DOM.elid('check-airline').addEventListener('click', () => {
            let airlineCode = DOM.elid('inp-airline-number').value;
            // Write transaction
            contract.isAirline(airlineCode, (error, result) => {
                display('Airline', 'Check Airline', [ { label: 'Check Airline Status ', error: error, value: result} ]);
            });
        })

        // register airline
        DOM.elid('submit-airline').addEventListener('click', () => {
            let airlineCode = DOM.elid('airline-number').value;
            // Write transaction
            contract.registerAirline(airlineCode, (error, result) => {
                console.log(result);
                display('Airline', 'Register Airline', [ { label: 'Register Airline Status ', error: error, value: result.airlineCode + ' ' + result.airline} ]);
            });
        })

        // fund airline
        DOM.elid('fund-airline').addEventListener('click', () => {
            let airlineCode = DOM.elid('airline-number').value;
            // Write transaction
            contract.fundAirline(airlineCode, (error, result) => {
                console.log("fund airline" +  result);
                display('Airline', 'fund Airline', [ { label: 'fundAirline Airline Status ', error: error, value: true} ]);
            });
        })

        // register flight
        DOM.elid('submit-flight').addEventListener('click', () => {
            let flight = DOM.elid('flight-numberRF').value;
            console.log(flight)
            // Write transaction
            contract.registerFlight(flight, (error, result) => {
                console.log("register flight " + result);
                display('Flight', 'Register Flight', [ { label: 'Register Flight Status ', error: error, value: result.airline + ' ' + result.flight} ]);
            });
        })

        //purchase-insurance
        DOM.elid('purchase-insurance').addEventListener('click', () => {
            let flight = DOM.elid('flight_purchase').value;
            // Write transaction
            contract.purchaseFlightInsurance(flight, (error, result) => {
                display('Flight', 'Purchase Flight Insurace', [ { label: 'Purchase Flight Insurance Status ', error: error, value: true} ]);
            });
        })

        //withdraw credits
        DOM.elid('withdraw-credits').addEventListener('click', () => {
            // Write transaction
            contract.withdrawCredits( (error, result) => {
                display('Flight', 'Widthdraw Credits', [ { label: 'Withdraw Credit Status ', error: error, value: result} ]);
            });
        }) 

        //show available credits
        DOM.elid('show-insured-amount').addEventListener('click', () => {
            // Write transaction
            let flight = DOM.elid('flight_purchase').value;
            contract.checkInsuredAmount(flight,  (error, result) => {
                console.log("we are in debug");
                console.log(  result);
                display('Insured Amount', 'Insured Amount', [ { label: 'Insured Amounts ', error: error, value: result} ]);
            });
        })
        
        //show available credits
        DOM.elid('show-credits').addEventListener('click', () => {
            // Write transaction
            contract.getCredits(  (error, result) => {
                console.log("we are in debug");
                console.log( result);
                display('Available Credits', 'Available Credits', [ { label: 'Available Credits ', error: error, value: result} ]);
            });
        })
        
    
    });
    

})();


function display(title, description, results) {
    let displayDiv = DOM.elid("display-wrapper");
    let section = DOM.section();
    section.appendChild(DOM.h2(title));
    section.appendChild(DOM.h5(description));
    results.map((result) => {
        let row = section.appendChild(DOM.div({className:'row'}));
        row.appendChild(DOM.div({className: 'col-sm-4 field'}, result.label));
        row.appendChild(DOM.div({className: 'col-sm-8 field-value'}, result.error ? String(result.error) : String(result.value)));
        section.appendChild(row);
    })
    displayDiv.append(section);

}







