import React, { Component } from 'react'
import Web3 from 'web3'
import DaiToken from '../abis/DaiToken.json'
import DappToken from '../abis/DappToken.json'
import TokenFarm from '../abis/TokenFarm.json'
import Navbar from './Navbar'
import Main from './Main'
import './App.css'

class App extends Component {

  async componentWillMount() {
    await this.loadWeb3()
    await this.loadBlockchainData()
  }

  async loadBlockchainData() {
    const web3 = window.web3

    const accounts = await web3.eth.getAccounts()
    // logging the current account to the console
    //console.log(accounts)
    // Set the first account
    this.setState({ account: accounts[0] })

    // Get network ID of ganache network
    const networkId = await web3.eth.net.getId()
    // log the networkID
    //console.log(networkId)

    // Load DaiToken
    const daiTokenData = DaiToken.networks[networkId]
    if(daiTokenData) {
      //Create a javascript version of the smart contract of 
      // the DaiToken
      const daiToken = new web3.eth.Contract(DaiToken.abi, daiTokenData.address)
      //Update the state
      this.setState({ daiToken })
      //Fetch the balance 
      // Check documentation web3js.readthedocs.io methods mymethod call
      let daiTokenBalance = await daiToken.methods.balanceOf(this.state.account).call()
      //Setting the state
      this.setState({ daiTokenBalance: daiTokenBalance.toString() })
      // Log the balance in the console in Wei
      //console.log({balance: daiTokenBalance})
    } else {
      // If the contract doesn't exist on the selected 
      // network give a pop up.
      window.alert('DaiToken contract not deployed to detected network.')
    
    }

    // Load DappToken
    // Do the same above for the DappToken
    const dappTokenData = DappToken.networks[networkId]
    if(dappTokenData) {
      const dappToken = new web3.eth.Contract(DappToken.abi, dappTokenData.address)
      this.setState({ dappToken })
      let dappTokenBalance = await dappToken.methods.balanceOf(this.state.account).call()
      this.setState({ dappTokenBalance: dappTokenBalance.toString() })
    } else {
      // If the contract doesn't exist on the selected 
      // network give a pop up.
      window.alert('DappToken contract not deployed to detected network.')
    }

    // Load TokenFarm
    //Do the same as above
    const tokenFarmData = TokenFarm.networks[networkId]
    if(tokenFarmData) {
      const tokenFarm = new web3.eth.Contract(TokenFarm.abi, tokenFarmData.address)
      this.setState({ tokenFarm })
      //Fetch the staking balance
      
      let stakingBalance = await tokenFarm.methods.stakingBalance(this.state.account).call()
      this.setState({ stakingBalance: stakingBalance.toString() })
    } else {
      window.alert('TokenFarm contract not deployed to detected network.')
    }
    // Once all data has been fetched from the blockchain change the state
    // of the loading so that data can be viewed
    this.setState({ loading: false })
  }

  async loadWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum)
      await window.ethereum.enable()
    }
    else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider)
    }
    else {
      window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!')
    }
  }
  // Define a function called stakeTokens
  // To collect how many tokens the user wants to stake
  stakeTokens = (amount) => {
    this.setState({ loading: true })
    // Interact with the blockchain in a two step process

    // Step 1: Approve the tokens first so they can be spent
    // Step 2: Send the transaction to the contract (to the account)
    this.state.daiToken.methods.approve(this.state.tokenFarm._address, amount).send({ from: this.state.account }).on('transactionHash', (hash) => {
      this.state.tokenFarm.methods.stakeTokens(amount).send({ from: this.state.account }).on('transactionHash', (hash) => {
        //When that is finished we set the state back to loading is false
        this.setState({ loading: false })
      })
    })
  }
  // A function to unstake tokens after the user has staked tokens
  unstakeTokens = (amount) => {
    this.setState({ loading: true })
    this.state.tokenFarm.methods.unstakeTokens().send({ from: this.state.account }).on('transactionHash', (hash) => {
      this.setState({ loading: false })
    })
  }

  constructor(props) {
    super(props)
    this.state = {
      account: '0x0',
      daiToken: {},
      dappToken: {},
      tokenFarm: {},
      daiTokenBalance: '0',
      dappTokenBalance: '0',
      stakingBalance: '0',
      loading: true
    }
  }

  render() {
    let content
    if(this.state.loading) {
      content = <p id="loader" className="text-center">Loading...</p>
    } else {
        // pass all these props in Main
        content = <Main
        daiTokenBalance={this.state.daiTokenBalance}
        dappTokenBalance={this.state.dappTokenBalance}
        stakingBalance={this.state.stakingBalance}
        // Pass the function 
        stakeTokens={this.stakeTokens}
        unstakeTokens={this.unstakeTokens}
      />
    }

    return (
      <div>
        <Navbar account={this.state.account} />
        <div className="container-fluid mt-5">
          <div className="row">
            <main role="main" className="col-lg-12 ml-auto mr-auto" style={{ maxWidth: '600px' }}>
              <div className="content mr-auto ml-auto">
                <a
                  href="http://www.dappuniversity.com/bootcamp"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                </a>
               
                {content}

              </div>
            </main>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
