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

    this.state = {
      id: "",
      ownLanguage: Languages[language],
      lang: Languages[language],
      message: "",
      messages: [],
      typing: false,
      name: "",
      isRecording: false, 
      blobURL: null
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
    this.setState(() => {
      return {
        messages: msgs
      };
    });
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
  };

  //mic start
  onStart = () => {
    console.log("You can tap into the onStart callback");
  };

  onStop = blobObject => {
    this.setState({ blobURL: blobObject.blobURL });
    //not sure which should be sent, can try different format
    //console.log(blobObject.blobURL);
    //console.log(blobObject.blob);
  };

  startRecording = () => {
    this.setState({
      isRecording: true
    });
  };

  stopRecording = () => {
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
          ></Sockets>
        ) : (
          <div className="App" onSubmit={this.nameChangeSubmit}>
            <form>
              <p>Enter Name:</p>
              <input type="text" onChange={this.nameChangeHandler} />
            </form>
          </div>
        )}

        {this.state.typing ? (
          <div className="App" onSubmit={this.messageSubmit}>
            <form>
              <p>Enter message:</p>
              <input type="text" onChange={this.messageChangeHandler} />
            </form>
            <ReactMic
              record={this.state.isRecording}
              width={0}
              height={0}
              onStop={this.onStop}
              onStart={this.onStart}
            />
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
          <div>
            <ReactLoading
              type={"spin"}
              color={"blue"}
              height={"10%"}
              width={"10%"}
            />
            <p>Waiting for chat room to fill up</p>
          </div>
        )}

        <ChatFeed
          messages={this.state.messages}
          isTyping={this.state.is_typing}
          hasInputField={false}
          showSenderName
          bubblesCentered={false}
          bubbleStyles={{
            text: {
              fontSize: 30
            },
            chatbubble: {
              borderRadius: 70,
              padding: 40
            }
          }}
        />
      </div>
    );
  }
}
export default App;
