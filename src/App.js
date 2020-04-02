import React, { Component } from 'react';
import ReconnectingWebSocket from 'reconnecting-websocket';
import { ChatFeed, Message } from 'react-chat-ui'
import logo from './logo.svg';
import './App.css';

const USER_ID = 0;
const RECIPIENT_ID = 1
const submitWebSocket = new ReconnectingWebSocket('ws://translation-backend.herokuapp.com/submit');
const receiveWebSocket = new ReconnectingWebSocket('ws://translation-backend.herokuapp.com/receive');


submitWebSocket.addEventListener('open', () => {
  console.log("Establishing initial reconnecting connection")
});

receiveWebSocket.addEventListener('open', () => {
  console.log("Establishing initial reconnecting connection")
});

class App extends Component { 
  constructor(props) {

    // Creating Unique User ID
    let name = prompt("Please enter your name", "Harry Potter");
    let user_id =  name + '_' + Math.random().toString(36).substr(2, 9) + ":";

    console.log(user_id)

    super(props);
    this.state = {
      id: user_id,
      value: '',
      messages: []
    };

    receiveWebSocket.onmessage = (event) => {
      let messageRecevied = event.data;
      let message_id;

      console.log("received message: " + messageRecevied)

      console.log(messageRecevied.indexOf(this.state.id))

      if (messageRecevied.indexOf(this.state.id) != -1) {
        // Message received was sent by this user
        message_id = USER_ID;
      } else {
        message_id = RECIPIENT_ID;
      }

      let messageIndex = messageRecevied.indexOf(":") + 1;
      messageRecevied = messageRecevied.substring(messageIndex);

      // Create new message
      let msg = new Message({
        id: message_id, 
        message: messageRecevied
      })

      let msgs = this.state.messages;
      msgs.push(msg);
      
      this.setState(() => {
        return {
          messages: msgs
        }
      })
    }
  }

  myChangeHandler = (event) => {
    this.setState({value: event.target.value});
  }

  handleSubmit = (event) => {
    event.preventDefault();

    // Send to backend
    console.log("Sending '" + this.state.value + "' to backend")

    // Prepend userid
    let newMsg = this.state.id + this.state.value;
    console.log(newMsg);

    submitWebSocket.send(newMsg)
  }

  render() {
    return (
      <div>
        <div className="App" onSubmit={this.handleSubmit}>
          <form>
            <p>Enter message:</p>
            <input type="text" onChange={this.myChangeHandler}/>
          </form>
        </div>

        <ChatFeed
        messages={this.state.messages} // Boolean: list of message objects
        isTyping={this.state.is_typing} // Boolean: is the recipient typing
        hasInputField={false} // Boolean: use our input, or use your own
        showSenderName // show the name of the user who sent the message
        bubblesCentered={false} //Boolean should the bubbles be centered in the feed?
        // JSON: Custom bubble styles
        bubbleStyles={
          {
            text: {
              fontSize: 30
            },
            chatbubble: {
              borderRadius: 70,
              padding: 40
            }
          }
        }
      />
    </div>
    );
  }
}
export default App;