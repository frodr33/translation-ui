import React, { Component } from "react";
import ReactLoading from "react-loading";
import { ChatFeed, Message } from "react-chat-ui";
import "./App.css";
import { Sockets, submitWebSocket, USER_ID } from "./components/sockets";
import Languages from "./components/languages";

// import PropTypes from "prop-types";
// import SpeechRecognition from "react-speech-recognition"; // Remove from dependencies if not using

class App extends Component {
  constructor(props) {
    super(props);
    let roomID = prompt("Enter chat room ID");
  
    let language = prompt(
      "Please enter your preferred language (Will change this to dropdown)",
      "English"
    );
    language = language.toLowerCase();

    while (!Languages[language]) {
      language = prompt("Sorry, please pick a different language", "English");
      language = language.toLowerCase();
    }

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = true;
    recognition.lang = Languages[language];

    recognition.onresult = e => {
      const current = e.resultIndex;
      const transcript = e.results[current][0].transcript;
      console.log("you said: " + transcript);

      console.log(this.state.id);
      console.log(this.state.lang);
      console.log(transcript);

      let messageSent = this.state.id + this.state.lang + transcript + ":" + this.state.roomID;
      console.log("Sent wrapped message: " + messageSent);

      let msg = new Message({
        id: USER_ID,
        message: transcript
      });

      let msgs = this.state.messages;
      msgs.push(msg);

      this.setState(() => {
        return {
          messages: msgs
        };

      });
      
      submitWebSocket.send(messageSent);
     
    };
    this.recognition = recognition;

    this.state = {
      id: "",
      ownLanguage: Languages[language],
      lang: Languages[language],
      roomID: roomID,
      message: "",
      messages: [],
      typing: true,
      name: "",
      isRecording: false, 
      otherName: ""
    };
   
  }

  /**
   * Setting whether or not the user is able to
   * type a message to the other user
   */
  setTyping = typingBool => {
    this.setState(() => {
      return {
        typing: typingBool
      };
    });
  };

  /**
   * Setting the language of the other client
   */
  setReceipientLanguage = lang => {
    this.setState(() => {
      return {
        lang: lang
      };
    });
  };

  /** TEST
   * Setting the name of the other client
   */
  setOtherName = otherName => {
    this.setState(() => {
      return {
        otherName: otherName
      };
    });
  };

  /**
   * Handler for when a message is received by this client
   */
  receiveMessage = message => {
    let msgs = this.state.messages;
    msgs.push(message);
    
    this.setState(() => {
      return {
        messages: msgs
      };
    });
    
    
  };

  /**
   * On submission of the message form, creates a chat message object
   * and appends it to the messages list kept in the state as well as
   * sends the message to the other client through submitWebSocket
   */
  messageSubmit = event => {
    event.preventDefault();

    // Create new message
    let msg = new Message({
      id: USER_ID,
      message: this.state.message
    });
    // testing statement
    console.log(msg);
    const messages = document.getElementById('messagefeed');
    let shouldScroll = messages.scrollTop + messages.clientHeight === messages.scrollHeight;
    let msgs = this.state.messages;
    msgs.push(msg);
    if (!shouldScroll) {
      messages.scrollTop = messages.scrollHeight;
    }
   

    this.setState(() => {
      return {
        messages: msgs
      };
    });

    // Prepend userid
    let messageSent = this.state.id + this.state.lang + this.state.message + ":" + this.state.roomID;
    console.log("Sent wrapped message: " + messageSent);

    submitWebSocket.send(messageSent);
  };

  /**
   * On submission of the enter name form, creates a randomly generated
   * user ID for this client
   */
  nameChangeSubmit = event => {
    event.preventDefault();
    let user_id =
      this.state.name +
      "_" +
      Math.random()
        .toString(36)
        .substr(2, 9) +
      ":";
    this.setState({ id: user_id });
  };

  nameChangeHandler = event => {
    this.setState({ name: event.target.value });
  };

  messageChangeHandler = event => {
    this.setState({ message: document.getElementById("inputmessage").value });
    console.log("changed user " + event.data);
  };

  handleRecordChange = () => {
    const button = document.getElementById("btn");

    if (this.state.isRecording == true) {
      this.stopRecording();
      button.disabled = false;
    } else {
      this.startRecording();
      button.disabled = true;
    }
  };

 

  startRecording = () => {
    this.recognition.start();
    console.log("Using speech-to-text recognizer");
    this.setState({
      isRecording: true
    });
  };

  stopRecording = () => {
    this.recognition.stop();
    console.log("recognizer stop");
    this.setState({
      isRecording: false
    });
  };

  render() {
    return (
      <div>
        {this.state.id ? (
          <Sockets
            receiveMessage={this.receiveMessage}
            userId={this.state.id}
            langKey={this.state.lang}
            roomID={this.state.roomID}
            setReceipientLanguage={this.setReceipientLanguage}
            setTypingOn={this.setTypingOn}
            ownLangKey={this.state.ownLanguage}
            setTyping={this.setTyping}
            setOtherName={this.setOtherName}
          ></Sockets>
        ) : (
          <div className="App" onSubmit={this.nameChangeSubmit}>
            <form style={{ backgroundColor: "#2D9CDB", padding: "20px" }}>
              <p style={{ fontSize: "25px", color: "white" }}>
                Enter Your Name:
              </p>
              <input
                style={{ padding: "5px", width: "200px", marginBottom: "20px" }}
                type="text"
                onChange={this.nameChangeHandler}
              />
            </form>
          </div>
        )}

        {this.state.typing ? (
          <div className="App" onSubmit={this.messageSubmit}>
            {/* Chat interface */}
            <div id = "messagefeed" style={{ padding: "20px",marginBottom: "50px", height: "510px", overflowY: "auto"}}>
              <ChatFeed
                messages={this.state.messages}
                isTyping={this.state.is_typing}
                hasInputField={false}
                showSenderName
                bubblesCentered={false}
                bubbleStyles={{
                  text: {
                    fontSize: 20
                  },
                  chatbubble: {
                    borderRadius: 12,
                    padding: 15
                  }
                }}
              />
            </div>

            <div
              className="bottomchatbar"
              style={{
                position: "fixed",
                bottom: 0,
                width: "100%",
                backgroundColor: "#DCDCDC",
                height: "10%",
                display: "flex",
                justifyContent: "space-around",
                flexFlow: "row wrap",
                alignItems: "stretch"
              }}
            >
              <div
                class="input"
                style={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "stretch",
                  flexGrow: 3,
                  backgroundColor: "white",
                  marginBottom: "10px",
                  marginTop: "9px",
                  marginLeft: "9px"
                }}
              >
                <form style={{ flexGrow: 10 }}>
                  <input
                    id="inputmessage"
                    type="text"
                    placeholder="Enter Message :"
                    onChange={this.messageChangeHandler}
                    style={{
                      borderColor: "transparent",
                      outline: "none",
                      fontSize: "20px",
                      width: "100%",
                      marginTop:"10px",
                      marginLeft:"20px"
                    }}
                  />
                </form>
                <button
                  style={{ flexGrow: 1 }}
                  id="btn"
                  onClick={this.handleRecordChange}
                >
                  <i class="fa fa-microphone"></i>
                </button>
              </div>
              <form
                style={{
                  flexGrow: 1,
                  marginBottom: "9px",
                  marginTop: "9px",
                  marginLeft: "5px",
                  marginRight: "9px"
                }}
              >
                <button
                  style={{
                    backgroundColor: "#2D9CDB",
                    color: "white",
                    fontSize: 20,
                    width: "100%",
                    height: "100%"
                  }}
                  type="submit"
                  onClick={this.messageChangeHandler}
                >
                  Send
                </button>
              </form>
            </div>
          </div>
        ) : (
          <div style={{ margin: "50px" }}>
            <p style={{ textAlign: "center" }}>
              Waiting for others to join chat
            </p>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                margin: "10px"
              }}
            >
              <ReactLoading
                type={"spin"}
                color={"blue"}
                height={"10%"}
                width={"10%"}
              />
            </div>
          </div>
        )}
      </div>
    );
  }
}
export default App;
