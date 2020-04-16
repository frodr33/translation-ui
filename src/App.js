import React, { Component } from "react";
import ReactLoading from "react-loading";
import { ChatFeed, Message } from "react-chat-ui";
import "./App.css";
import { Sockets, submitWebSocket, USER_ID } from "./components/sockets";
import Languages from "./components/languages";
import { ReactMic } from "react-mic";
import Button from "@material-ui/core/Button";
import Stop from "@material-ui/icons/Stop";
import KeyboardVoiceIcon from "@material-ui/icons/KeyboardVoice";
import { rgbToHex } from "@material-ui/core";
// import PropTypes from "prop-types";
// import SpeechRecognition from "react-speech-recognition"; // Remove from dependencies if not using

class App extends Component {
  constructor(props) {
    super(props);
    let language = prompt(
      "Please enter your preferred language (Will change this to dropdown)",
      "English"
    );
    language = language.toLowerCase();

    while (!Languages[language]) {
      language = prompt("Sorry, please pick a different language", "English");
      language = language.toLowerCase();
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new SpeechRecognition()

    recognition.continuous = true
    recognition.lang = Languages[language]

    recognition.onresult = (e) => {
      const current = e.resultIndex
      const transcript = e.results[current][0].transcript
      console.log("you said: " + transcript)


      console.log(this.state.id)
      console.log(this.state.lang)
      console.log(transcript)

      let messageSent = this.state.id + this.state.lang + transcript;
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
    }
    this.recognition = recognition

    this.state = {
      id: "",
      ownLanguage: Languages[language],
      lang: Languages[language],
      message: "",
      messages: [],
      typing: false,
      name: "",
      isRecording: false, 
      blobURL: null,
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
      message: this.state.message,
      senderName: this.state.name
    });
    // testing statement
    console.log(msg);

    let msgs = this.state.messages;
    msgs.push(msg);

    this.setState(() => {
      return {
        messages: msgs
      };
    });

    // Prepend userid
    let messageSent = this.state.id + this.state.lang + this.state.message;
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
    this.setState({ message: event.target.value });
    console.log("changed user " + event.data);

  };

  //mic start 
  onStart = () => {
    this.recognition.start()
    console.log("Using speech-to-text recognizer");
  };

  onStop = async blobObject => {
    this.recognition.stop()
    this.setState({ blobURL: blobObject.blobURL });
    console.log("Done recording")
  };

  startRecording = () => {
    this.recognition.start()
    console.log("Using speech-to-text recognizer");
    this.setState({
      isRecording: true
    });
  };

  stopRecording = () => { 
    this.recognition.stop()
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
            setReceipientLanguage={this.setReceipientLanguage}
            setTypingOn={this.setTypingOn}
            ownLangKey={this.state.ownLanguage}
            setTyping={this.setTyping}
            recordMessage={this.blobURL}
            setOtherName={this.setOtherName} //TEST
          ></Sockets>
        ) : (
          <div className="App" onSubmit={this.nameChangeSubmit}>
            <form style={{backgroundColor: "#2D9CDB", padding: "20px"}}>
              <p style={{fontSize:"25px", color:"white"}}>Enter Your Name:</p>
              <input style={{padding: "5px", width: "200px", marginBottom: "20px"}} type="text" onChange={this.nameChangeHandler} />
            </form>
          </div>
        )}
        

        {this.state.typing ? (
          <div className="App" onSubmit={this.messageSubmit}>
            {/* Chat interface */}
            <div style={{padding: "20px"}}>
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
            
            {/* Chat message box - anchor at bottom */}
            <form>
              <p>Enter message:</p>
              <input type="text" onChange={this.messageChangeHandler} />
            </form>
            {/* <ReactMic
              record={this.state.isRecording}
              width={0}
              height={0}
              onStop={this.onStop}
              onStart={this.onStart}
            /> */}
            {this.state.isRecording ? (
              <Button
                variant="contained"
                color="secondary"
                disabled
                startIcon={<KeyboardVoiceIcon />}
                onClick={this.startRecording}
              >
                Talk
              </Button>
            ) : (
              <Button
                variant="contained"
                color="secondary"
                startIcon={<KeyboardVoiceIcon />}
                onClick={this.startRecording}
              >
                Talk
              </Button>
            )}

            <Button
              variant="contained"
              color="secondary"
              startIcon={<Stop />}
              onClick={this.stopRecording}
            >
              Stop
            </Button>
            <audio
              controls="controls"
              src={this.state.blobURL}
              controlsList="nodownload"
            />
          </div>
        ) : (
          <div style={{margin: "50px"}}>
            <p style={{textAlign: "center"}}>Waiting for others to join chat</p>
            <div style={{display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        margin: "10px"
            }}>
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
