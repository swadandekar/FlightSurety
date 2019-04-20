pragma solidity ^0.4.24;

import "../node_modules/openzeppelin-solidity/contracts/math/SafeMath.sol";

contract FlightSuretyData {
    using SafeMath for uint256;

    /********************************************************************************************/
    /*                                       DATA VARIABLES                                     */
    /********************************************************************************************/

    address private contractOwner;                                      // Account used to deploy contract
    bool private operational = true;                                    // Blocks all state changes throughout the contract if false

    uint256 airlineCount;
    uint256 flightCount;
    
    mapping(address => uint8) authorizedCaller;
    mapping(bytes32 => Flight) private flights;
    mapping(address => Airline) private airlines;
   // FlightInsurance[] private flightInsurance;    
    //mapping(address => uint256) private customerCredits;
    mapping(bytes32 => uint256) private customerFlightCredits;
    mapping(address => uint256) private customerCredits;
    mapping(bytes32 => uint256) private flightInsurance;
    struct Airline{
        bool isRegistered;
        bool isFunded;
        string airlineCode;
    }
    struct Flight {
        bool isRegistered;
        uint8 statusCode;
        uint256 updatedTimestamp;        
        address airline;
        string flightCode;
    } 
    struct FlightInsurance{
        address insuree;
        bytes32 flightKey;
        uint256 insuranceAmount;
    }


    /*                                       EVENT DEFINITIONS                                  */
    /********************************************************************************************/
    event CreditInsured (address insuree, address airline, string  flight, uint256 timestamp, uint256 amount);

    event AirlineRegistered (address airlineAddress, bool isRegistered, bool isFunded, string airlineCode );
 
    event FlightRegistered (address airline, string flightCode, uint256 timestamp );

    event AuthorizedCaller(address caller);

    event DeAuthorizedCaller(address caller);

    /**
    * @dev Constructor
    *      The deploying account becomes contractOwner
    */
    constructor
                                (
                                    address firstAirlineAddress
                                ) 
                                public 
    {
        contractOwner = msg.sender;

        airlines[firstAirlineAddress] = Airline({
                                        isRegistered: true,
                                        isFunded: true,
                                        airlineCode: "Sprint"
                                    });

        airlineCount = 1;
        flightCount= 0;
    }

    /********************************************************************************************/
    /*                                       FUNCTION MODIFIERS                                 */
    /********************************************************************************************/

    // Modifiers help avoid duplication of code. They are typically used to validate something
    // before a function is allowed to be executed.

    /**
    * @dev Modifier that requires the "operational" boolean variable to be "true"
    *      This is used on all state changing functions to pause the contract in 
    *      the event there is an issue that needs to be fixed
    */
    modifier requireIsOperational() 
    {
        require(operational, "Contract is currently not operational");
        _;  // All modifiers require an "_" which indicates where the function body will be added
    }

    /**
    * @dev Modifier that requires the "ContractOwner" account to be the function caller
    */
    modifier requireContractOwner()
    {
        require(msg.sender == contractOwner, "Caller is not contract owner");
        _;
    }

    modifier requireIsCallerAuthorized()
    {
        require(authorizedCaller[msg.sender] == 1, "Caller is not authorized");
        _;
    }

    modifier verifyOtherAirlinesApproval (uint256 validVotesCount) {
        require( airlineCount < 4 || SafeMath.div(SafeMath.mul(validVotesCount, 100), airlineCount) >= 50, "At least 50% airlines should vote to register new airline");    
        _;
    }


    /********************************************************************************************/
    /*                                       UTILITY FUNCTIONS                                  */
    /********************************************************************************************/

    /**
    * @dev Get operating status of contract
    *
    * @return A bool that is the current operating status
    */      
    function isOperational() external view returns(bool) 
    {
        return operational;
    }


    /**
    * @dev Sets contract operations on/off
    *
    * When operational mode is disabled, all write transactions except for this one will fail
    */    
    function setOperatingStatus
                            (
                                bool mode
                            ) 
                            external
                            requireContractOwner 
    {
        operational = mode;
    }

    /* authorize caller */
    function authorizeCaller(address _caller) public returns(bool)
    {
        authorizedCaller[_caller] = 1;
        emit AuthorizedCaller(_caller);
        return true;
    }

    /* deauthorize caller */
    function deAuthorizeCaller(address _caller) public returns(bool)
    {
        delete authorizedCaller[_caller];
        //authorizedCaller[_caller] = 0;
        emit DeAuthorizedCaller(_caller);
        return true;
    }

    function checkIfCallerAuthorized() external returns(bool)
    {
        if(authorizedCaller[msg.sender] == 1)
        return true ;
        else
        return false;
    }
    /********************************************************************************************/
    /*                                     SMART CONTRACT FUNCTIONS                             */
    /********************************************************************************************/

   /**
    * @dev Add an airline to the registration queue
    *      Can only be called from FlightSuretyApp contract
    *
    */   
    function registerAirline (address airlineAddress, string airlineCode,  uint256 validVotesCount) requireIsCallerAuthorized verifyOtherAirlinesApproval(validVotesCount)
                            external returns (bool)
    {
        
        airlines[airlineAddress] = Airline({
                                        isRegistered: true,
                                        isFunded: false,
                                        airlineCode: airlineCode
                                    });
        airlineCount = airlineCount +1;
        
        emit AirlineRegistered (airlineAddress,airlines[airlineAddress].isRegistered, airlines[airlineAddress].isFunded, airlines[airlineAddress].airlineCode );

        return true;
    }

    function fundAirline( address _airlineAddress) requireIsCallerAuthorized payable external returns (bool){
        if(airlines[_airlineAddress].isRegistered== true){
            airlines[_airlineAddress].isFunded = true;
        }
         return true;
    }

    function isAirline(address _airlineAddress) requireIsCallerAuthorized external view returns(bool){

        bool fundStatus = airlines[_airlineAddress].isFunded ;
        return fundStatus;
    }

    function getAirlineCount() requireIsCallerAuthorized external view returns (uint256){
        return airlineCount;
    }

    function checkAirlinesApproval(uint256 validVotesCount ) requireIsCallerAuthorized external view returns (bool) {       

        bool flag = airlineCount < 4 || SafeMath.div(SafeMath.mul(validVotesCount, 100), airlineCount) >= 50 ; 
        return flag;
    }

    function registerFlight( address airline, string  flight, uint256 timestamp, uint8 statusCode) requireIsCallerAuthorized external                                
    {
        bytes32  _flightKey = getFlightKey( airline, flight, timestamp );

        flights[_flightKey] = Flight({
                                        isRegistered: true,
                                        statusCode: statusCode,
                                        updatedTimestamp: timestamp,       
                                        airline: airline,
                                        flightCode: flight
                                    });   
        flightCount = flightCount +1;

        emit FlightRegistered (flights[_flightKey].airline, flights[_flightKey].flightCode, flights[_flightKey].updatedTimestamp );
    }
    
    function isFlight(address _airlineAddress, string flight , uint256 timestamp) requireIsCallerAuthorized external view returns(bool){

        bytes32  _flightKey = getFlightKey( _airlineAddress, flight, timestamp );
        return flights[_flightKey].isRegistered;
    }

    function processFlightStatus( address airline, string  flight, uint256 timestamp, uint8 statusCode ) requireIsCallerAuthorized external
    {
        bytes32  _flightKey = getFlightKey( airline, flight, timestamp );
       
        flights[_flightKey].statusCode = statusCode;
    }

    function getPassengerInsuredAmount(address insuree , address airline, string  flight, uint256 timestamp) requireIsCallerAuthorized external  returns(uint256)
    {
        bytes32  _passengerflightKey =  keccak256(abi.encodePacked(insuree, airline, flight, timestamp));
        uint256 amount = flightInsurance[_passengerflightKey] ;
        return amount;
    }

   /*
    * @dev Buy insurance for a flight
    *
    */   
    function buy(address insuree , address airline, string  flight, uint256 timestamp, uint256 amount) requireIsCallerAuthorized external payable
    {
        bytes32  _passengerflightKey =  keccak256(abi.encodePacked(insuree, airline, flight, timestamp));
        flightInsurance[_passengerflightKey] =  amount;
    }

    function getCredits(address insuree) requireIsCallerAuthorized external view returns(uint256){
        uint256 credits =  customerCredits[insuree];
        return credits;
    }
    /**
     *  @dev Credits payouts to insurees
    */
    function creditInsurees ( address insuree, address airline, string  flight, uint256 timestamp) requireIsCallerAuthorized external 
    {
        bytes32  _passengerflightKey =  keccak256(abi.encodePacked(insuree, airline, flight, timestamp));
        uint256 amountToCredit = flightInsurance[_passengerflightKey];
        amountToCredit= amountToCredit.mul(15).div(10);
        if(flightInsurance[_passengerflightKey] > 0){
            
            customerFlightCredits[_passengerflightKey] = amountToCredit;
            customerCredits[insuree]= amountToCredit;
        }

        emit CreditInsured (insuree, airline, flight, timestamp, amountToCredit);
    }
    

    /**
     *  @dev Transfers eligible payout funds to insuree
     *
    */
    function pay(address insuree , uint256 amount) requireIsCallerAuthorized external payable 
    {
        //only data contract has money
      
      uint256 creditBefore =  customerCredits[insuree] ;

      require(creditBefore >= amount ,"Caller should have sufficient funds to withdraw");

      customerCredits[insuree] = creditBefore.sub(amount);
      //insuree.transfer(amount);
    }

   /**
    * @dev Initial funding for the insurance. Unless there are too many delayed flights
    *      resulting in insurance payouts, the contract should be self-sustaining
    *
    */   
    function fund
                            (   
                            )
                            public
                            payable
    {
    }

    function getFlightKey
                        (
                            address airline,
                            string memory flight,
                            uint256 timestamp
                        ) requireIsCallerAuthorized
                        view 
                        internal
                        returns(bytes32) 
    {
        return keccak256(abi.encodePacked(airline, flight, timestamp));
    }

    /**
    * @dev Fallback function for funding smart contract.
    *
    */
    function() 
                            external 
                            payable 
    {
        fund();
    }


}

