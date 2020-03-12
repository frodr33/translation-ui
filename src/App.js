import React, { Component } from 'react';
import ReconnectingWebSocket from 'reconnecting-websocket';
import logo from './logo.svg';
import './App.css';

const submitWebSocket = new ReconnectingWebSocket('ws://translation-backend.herokuapp.com/submit');
const receiveWebSocket = new ReconnectingWebSocket('ws://translation-backend.herokuapp.com/receive');

submitWebSocket.addEventListener('open', () => {
  console.log("Establishing initial reconnecting connection")
});

receiveWebSocket.addEventListener('open', () => {
  console.log("Establishing initial reconnecting connection")
});

receiveWebSocket.onmessage = (event) => {
  console.log("received message: " + event.data)
}

class App extends Component { 
  constructor(props) {
    super(props);
    this.state = {
      value: ''
    };
  }

  myChangeHandler = (event) => {
    this.setState({value: event.target.value});
  }

  handleSubmit = (event) => {
    event.preventDefault();

    // Send to backend
    console.log("Sending '" + this.state.value + "' to backend")
    submitWebSocket.send(this.state.value)
  }

  render() {
    return (
      <div className="App" onSubmit={this.handleSubmit}>
        <form>
          <p>Enter message:</p>
          <input type="text" onChange={this.myChangeHandler}/>
        </form>
      </div>
    );
  }
}
export default App;