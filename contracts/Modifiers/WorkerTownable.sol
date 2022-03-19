// SPDX-License-Identifier: MIT
pragma solidity ^0.7.5;

contract WorkerTownable {

    address internal _worker;

    event WorkershipChanged(address indexed previousWorker, address indexed newWorker);

    constructor () {
        _worker = msg.sender;
        emit WorkershipChanged( address(0), _worker );
    }

    function worker() public view returns (address) {
        return _worker;
    }

    modifier onlyWorkerTown() {
        require( _worker == msg.sender, "Workable: caller is not the worker town" );
        _;
    }

    function changeWorkership( address _newWorker ) public virtual onlyWorkerTown() {
        emit WorkershipChanged( _worker, _newWorker );
        _worker = _newWorker;
    }
}