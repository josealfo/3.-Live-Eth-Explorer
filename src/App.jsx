/*
import React, { useEffect, useState } from "react";
import axios from "axios";
*/
import { Alchemy, Network } from 'alchemy-sdk';
import React, { Component } from 'react'

import './App.css';
import newBlockImage from './newBlockAnimated.gif';

const settings = {
  apiKey: process.env.REACT_APP_ALCHEMY_API_KEY,
  network: Network.ETH_MAINNET,
};

const alchemy = new Alchemy(settings);


/* TxDetails
 * 
 * Pure React Component that shows the given 
 * details of a transaction (to, from, amount and so on) */
const TxDetails = (props) => {
  const { selectedTx } = props
  if(selectedTx) {
    return (
      <>
        <h3>Transaction: {selectedTx.hash.slice(0, 18)}...</h3>
        <center>
          <div>From:</div><div>{selectedTx.from}</div>
          <p></p>
          <div>To:</div><div>{selectedTx.to}</div>
          <p></p>
          <div>Amount (in WEIS hex):</div><div>{selectedTx.value._hex}</div>
        </center>
        <p></p>
        <div>Gas Price (in WEIS hex): {selectedTx.gasPrice._hex}</div>
        <div>Max Fee Per Gas (in WEIS hex): 
        {selectedTx.maxFeePerGas && selectedTx.maxFeePerGas._hex /*
          Above is a hack to not evaluate maxFeePerGas if not exists.
          Doing that results in a blank screen! 
          Thanks Dan Nolan */}</div>
        <div>Nonce: {selectedTx.nonce}</div>
        <div>Block Number: {selectedTx.blockNumber}</div>
        <div>Chain id: {selectedTx.chainId}</div>
        <div>Confirmations: {selectedTx.confirmations}</div>
      </>);
  } else {
    return (
      <>
        <h2>2. Select a transaction</h2>
      </>);
  } 
}

/**
 *  Live Blockchain Explorer
 * 
 * This is the main class, all the logic goes here.
 * 
 * I made this to be a class component (instead of a functional 
 * component) to initialize a constructor that continously
 * request for the latest block. This is always happening, so
 * the list of blocks is constantly being updated */ 
class App extends Component {
  constructor(props){
    super(props)
    this.state = {
      nBlocksToDisplay: 2,  // 0 based index
      promiseBNumber: null, // block number received is a promise at first
      initialBNumber: -1,   // almost always will be the latest block
      selectedBNumber: -1,  // the block we wish to see its txs
      blockInfo: false,     // false if no block has been fetched
      promiseBlockInfo: null, // blockInfo starts as a promise
      selectedTx: false,    // false if no tx has been selected
    }
    this.startEthFetcherBinded = this.startEthFetcher.bind(this)
    this.startEthFetcherBinded()
  }

  /* start to continously get the latest block number */
  startEthFetcher(){
    setInterval(() => {
      this.state.promiseBNumber = alchemy.core.getBlockNumber()
      this.state.promiseBNumber.then((bN) => {      
          /*
          the callback function inside then() should be 
          an arrow function (for a correct binding of this)
          and promise's return value is the variable declared 
                                          (in this case bN)
          */
          // if a new block had been minned display one more block
          if(bN > this.state.initialBNumber) {
            const currentNBlocksToDisplay = this.state.nBlocksToDisplay
            this.setState({ initialBNumber: bN,
                            nBlocksToDisplay: currentNBlocksToDisplay + 1,})
            
          }})
    }, 4000)
  }

  /* Block Number Click (as opposed to transaction number click) */ 
  async handleBNumberClick(n) {
    this.setState({ selectedBNumber: n, 
                    blockInfo: false, 
                    selectedTx: false,
                  })
    this.state.promiseBlockInfo = alchemy.core.getBlockWithTransactions(this.state.selectedBlockNumber);
    this.state.promiseBlockInfo.then((block) => {   this.setState( {blockInfo: block} )   })
  }
  
  /* Tx Number Click (as opposed to block number click) */
  handleTxClick(tx) {
    this.setState({selectedTx: tx})
    //console.log('handleTxClick() <- clicked this.state is', this.state)
  }

  /* Main method of conditional rendering
   *
   * Since the clicking involved calling and fetching blocks
   * from Ethereum, most logic goes here.  */
  render() {
    if(this.state.initialBNumber === -1) {
        return ( <div>...waiting...</div> )      
    } else { 
      /* DISPLAY BLOCKCHAIN INFO  
       *
       * First do the logic, and render at the bottom. 
       *
       * Here we construct a clickable list of blocks, 
       * starting from the selectedBNumber in this.state 
       * the number of blocks to display will grow
       * each time a new block is added */ 
     let listOfBlockNumbers = [];
     for(let i = this.state.initialBNumber; 
         (i>(this.state.initialBNumber - this.state.nBlocksToDisplay) && i>0);
          i--) {
        listOfBlockNumbers.push(i);
      }  
      const listOfBlockNumberItems = listOfBlockNumbers.map(n => {
        if(n === this.state.selectedBNumber) {
            return <button  key={n}
                            type="button"
                            className="block-button-selected"
                            onClick={() => this.handleBNumberClick(n)}>
                              Block #{n}
                    </button>
        }
        return  <button  key={n}
                          type="button"
                          className="block-button"
                          onClick={() => this.handleBNumberClick(n)}>
                            Block #{n}
                 </button> 
      })
      
      
      /* If a block has been selected, 
       *   we render a clickable list of transactions.
       * If not, we render an appropriate message */ 
      let listOfTx = '<H2>Live ETH Explorer</H2><- select a block -'      
      if(this.state.blockInfo) { // execute if the blockchain already answered 
        const blockInfoTxs = this.state.blockInfo.transactions;
        listOfTx = blockInfoTxs.map((tx) => {
            if(tx.hash === this.state.selectedTx.hash) {
              return (<button key={tx.hash}
                            className="tx-button-selected"
                            onClick={ () => this.handleTxClick(tx) } 
                            >Transaction: {tx.hash.slice(0, 30)}...
                    </button>);
            }
            return (<button key={tx.hash}
                            className="tx-button"
                            onClick={ () => this.handleTxClick(tx) } 
                            >Transaction: {tx.hash.slice(0, 30)}...
                    </button>);
        })
      }

      // Render everything
      return (
        <>
          <span className="columnLeft">
          <img src={newBlockImage} alt="New block being minned..."/>
            {listOfBlockNumberItems}
          </span>
          <span className="columnMiddle">
            {(() => {
                /*console.log('IIFE() arrow function: this is', this.state)*/
                if(this.state.blockInfo === false) {
                  return [
                    (<h1>Live ETH BlockExplorer</h1>), 
                    (<>Blockchains live in the backend of cryptocurrencies. They register transactions in a chain of blocks updated continously, worldwide. Bitcoin was built on top of a Blockchain. Here you can see the actual blocks and transactions of the Ethereum ecosystem.  Information is encrypted for security. This quantities are in real-time. </>), 
                    (<h2> 1. Click on a block on the left </h2>)];
                } else { 
                  return listOfTx;
                }
            })()}
          </span>
          <span className="columnRight">
            <TxDetails selectedTx={this.state.selectedTx} /> 
          </span>
        </>
        )
    }
  }
}

export default App