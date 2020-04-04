import React, { Component } from 'react';
import ReactLoading from 'react-loading';
import { ChatFeed, Message } from 'react-chat-ui'
import './App.css';
import {Sockets, submitWebSocket, USER_ID} from './components/sockets'
import Languages from './components/languages'


class App extends Component { 
  constructor(props) {
    super(props);
    let name = prompt("Please enter your name");
    let user_id =  name + '_' + Math.random().toString(36).substr(2, 9) + ":";

    let language = prompt("Please enter your preferred language (Will change this to dropdown)", "English");
    language = language.toLowerCase();
    
    while (!Languages[language]) {
      language = prompt("Sorry, please pick a different language", "English");
      language = language.toLowerCase()
    }

    this.state = {
      id: user_id,
      lang: Languages[language],
      value: '',
      messages: [],
      typing: false
    };
  }

  setTypingOn = () => {
    console.log("turn type on")
    this.setState(() => {
      return {
        typing: true
      }
    })
  }

  setReceipientLanguage = (otherLanguage) => {
    this.setState(() => {
      return {
        lang: otherLanguage
      }
    })
  }

  receiveMessage = (message) => {
    let msgs = this.state.messages;
    msgs.push(message);
    
    this.setState(() => {
      return {
        messages: msgs
      }
    })
  }

  myChangeHandler = (event) => {
    this.setState({value: event.target.value});
  }

  handleSubmit = (event) => {
    event.preventDefault()

    // Create new message
    let msg = new Message({
      id: USER_ID, 
      message: this.state.value
    })
  
    let msgs = this.state.messages;
    msgs.push(msg);

    this.setState(() => {
      return {
        messages: msgs
      }
    })

    // Prepend userid
    let messageSent = this.state.id + this.state.lang + this.state.value;
    console.log("Sent wrapped message: " + messageSent);

    submitWebSocket.send(messageSent)
  }

  render() {
    return (
      <div>
        <Sockets 
        receiveMessage={this.receiveMessage} userId={this.state.id} 
        langKey={this.state.lang} 
        setReceipientLanguage={this.setReceipientLanguage}
        setTypingOn={this.setTypingOn}
        >
        </Sockets>

        {this.state.typing ? (
          <div className="App" onSubmit={this.handleSubmit}>
            <form>
              <p>Enter message:</p>
              <input type="text" onChange={this.myChangeHandler}/>
            </form>
          </div>
        ): (
          <div>
            <ReactLoading type={"spin"} color={"blue"} height={"10%"} width={"10%"} />
            <p>Waiting for chat room to fill up</p>
          </div>
        )}

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