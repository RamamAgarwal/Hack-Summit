// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title Migrations
 * @dev This contract is used by Truffle to track migrations
 */
contract Migrations {
    address public owner;
    uint public last_completed_migration;

    /**
     * @dev Restricts who can run migrations
     */
    modifier restricted() {
        require(msg.sender == owner, "This function is restricted to the contract's owner");
        _;
    }

    /**
     * @dev Constructor sets the contract owner
     */
    constructor() {
        owner = msg.sender;
    }

    /**
     * @dev Set completed migration
     * @param completed Migration number
     */
    function setCompleted(uint completed) public restricted {
        last_completed_migration = completed;
    }

    /**
     * @dev Upgrade migrations
     * @param new_address Address of the new migrations contract
     */
    function upgrade(address new_address) public restricted {
        Migrations upgraded = Migrations(new_address);
        upgraded.setCompleted(last_completed_migration);
    }
}