pragma solidity ^0.4.25;

import "../node_modules/openzeppelin-solidity/contracts/math/SafeMath.sol";

contract FlightSuretyData {
    using SafeMath for uint256;

    /********************************************************************************************/
    /*                                       DATA VARIABLES                                     */
    /********************************************************************************************/

    address private contractOwner;                                      // Account used to deploy contract
    bool private operational = true;                                    // Blocks all state changes throughout the contract if false

    uint256 airlineCount;
    
    struct Airline{
        bool isRegistered;
        bool isFunded;
    }

    mapping(address => Airline) private airlines;
    

    /*                                       EVENT DEFINITIONS                                  */
    /********************************************************************************************/


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
                                        isFunded: true
                                    });

        airlineCount = 1;
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
    function isOperational() 
                            public 
                            view 
                            returns(bool) 
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

    /********************************************************************************************/
    /*                                     SMART CONTRACT FUNCTIONS                             */
    /********************************************************************************************/

   /**
    * @dev Add an airline to the registration queue
    *      Can only be called from FlightSuretyApp contract
    *
    */   
    function registerAirline (address _airlineAddress, uint256 validVotesCount) verifyOtherAirlinesApproval(validVotesCount)
                            external returns (bool)
    {
        
        airlines[_airlineAddress] = Airline({
                                        isRegistered: true,
                                        isFunded: false
                                    });
        airlineCount = airlineCount +1;
        return true;
    }

    function fundAirline( address _airlineAddress) payable external returns (bool){
        if(airlines[_airlineAddress].isRegistered== true){
            airlines[_airlineAddress].isFunded = true;
        }
         return true;
    }

    function isAirline(address _airlineAddress) external returns(bool){

        bool fundStatus = airlines[_airlineAddress].isFunded ;
        return fundStatus;
    }

    function getAirlineCount() external returns (uint256){
        return airlineCount;
    }

    function checkAirlinesApproval(uint256 validVotesCount ) external returns (bool) {       

        bool flag = airlineCount < 4 || SafeMath.div(SafeMath.mul(validVotesCount, 100), airlineCount) >= 50 ; 
        return flag;
    }

   /*
    * @dev Buy insurance for a flight
    *
    */   
    function buy
                            (                             
                            )
                            external
                            payable
    {

    }

    /**
     *  @dev Credits payouts to insurees
    */
    function creditInsurees
                                (
                                )
                                external
                                pure
    {
    }
    

    /**
     *  @dev Transfers eligible payout funds to insuree
     *
    */
    function pay
                            (
                            )
                            external
                            pure
    {
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
                        )
                        pure
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

