import React, { Component } from "react";
import ReconnectingWebSocket from "reconnecting-websocket";
import { Message } from "react-chat-ui";

let myKey = "";
let roomID = "";
let userID = "";
let connected = true;

const USER_ID = 0;
const RECIPIENT_ID = 1;
let otherName = ""; //test

const PROD_URL = "translation-backend.herokuapp.com"; // Will eventually put this env variables
const DEV_URL = "localhost:5000";
const baseURL = PROD_URL;

const submitWebSocket = new ReconnectingWebSocket(
  "wss://" + baseURL + "/submit"
);

const healthCheckSocket = new ReconnectingWebSocket(
  "wss://" + baseURL + "/healthcheck"
);


submitWebSocket.addEventListener("open", () => {
  console.log("Establishing initial /submit socket connection");
});

healthCheckSocket.addEventListener("open", () => {
  console.log("Establishing initial /healthcheck socket connection");
});

function timeout(f) {
  setTimeout(function () {
      f()
      timeout(f);
  }, 5000);
}

class Sockets extends Component {
  constructor(props) {
    console.log("CREATING SOCKETS")
    super(props);
    myKey = this.props.ownLangKey;
    roomID = this.props.roomID;
    userID = this.props.userId;

    this.state = {
      activeClients: 0
    };

    const receiveWebSocket = new ReconnectingWebSocket(
      "wss://" + baseURL + "/receive"
    );
    const notificationWebSocket = new ReconnectingWebSocket(
      "wss://" + baseURL + "/interruptions"
    );

    notificationWebSocket.addEventListener("open", () => {
      console.log(this.props.roomID)
      notificationWebSocket.send(this.props.roomID)
      console.log("Establishing initial /interruptions socket connection");
    });

    receiveWebSocket.addEventListener("open", () => {
      receiveWebSocket.send(this.props.roomID + ":" + this.props.userId)
      console.log("Establishing initial /receive socket connection");
    });

    let healthData = userID;
    const sendHealthStatus = () => {
      healthCheckSocket.send(healthData)
    }
    timeout(sendHealthStatus);


    receiveWebSocket.onmessage = event => {
      let messageRecevied = event.data;
      let message_id; 

      if (messageRecevied.indexOf(this.props.userId) === -1) {
        message_id = RECIPIENT_ID;
        let langIndex = messageRecevied.indexOf(":") + 1;
        let messageIndex = messageRecevied.indexOf(":", langIndex) + 1;

        messageRecevied = messageRecevied.substring(messageIndex);


        console.log("Message received: " + messageRecevied);

        otherName = event.data.substring(0, event.data.indexOf("_"));
        this.props.setOtherName(otherName);

        let msg = new Message({
          id: message_id,
          message: otherName + ": " + messageRecevied
        });
        console.log(event.data);
        console.log("Message sender: " + otherName);
        this.props.receiveMessage(msg);
      }
    };

    notificationWebSocket.onmessage = async (event) => {
      let numberOfClients = event.data;
      this.setState({
        activeClients: numberOfClients
      })
  }
  }

  async componentDidMount() {
    console.log("Registering window close event listener");
    console.log("ownkey: " + this.props.ownLangKey);

    // window.onbeforeunload = async function(event) {
    //   event.preventDefault()
    //   console.log("here")
    //   let disconnectUrl = "https://" + baseURL + "/disconnect?lang=" + myKey + "&roomID=" + roomID + "&userID=" + userID;
    //   await fetch(disconnectUrl, {
    //     method: "GET",
    //     headers: {
    //       "access-control-allow-origin": "*"
    //     }
    //   }).then(res => console.log(res));
    //   console.log("here2")


    //   console.log(window.confirm())
    //   return undefined
    // };

    console.log("lang key: " + this.props.langKey);
    let fetchUrl =
      "https://" +
      baseURL +
      "/connect?lang=" +
      this.props.langKey +
      "&id=" +
      this.props.userId +
      "&roomID=" +
      this.props.roomID;

    console.log("Connecting to backend at: " + fetchUrl);

    let otherLanguage = ""; // default
    let getRequest = fetch(fetchUrl, {
      method: "GET",
      headers: {
        "access-control-allow-origin": "*"
      }
    })
      .then(res => res.json())
      .then(res => {
        console.log("IN SOCKETS JSX");
        console.log(res);
        res.forEach((v, i) => {
          if (v !== this.props.langKey) {
            console.log("Other client's language is: " + v);
            otherLanguage = v + ":";
          }
        });

        if (otherLanguage === "") {
          // Both clients choose the same language
          otherLanguage = this.props.langKey + ":";
        }

        console.log("CHANNG RECEPIENT LANG TO: " + otherLanguage)
        this.props.setReceipientLanguage(otherLanguage);
      });

    await getRequest;
    this.props.setTyping(true);
    this.setState({
      activeClients: 1
    })
    console.log("Finished connecting successfully");
  }
  render() {

    return (
      <div className="chatName" 
        style={{overflow: "hidden",
                position: "sticky",
                top:0,
                width:"100%",
                backgroundColor: "#2D9CDB", 
                textAlign: "center",
                color: "white",
                padding: "10px",
                fontSize: "35px",
                marginTop: "20",
                zIndex:"3"
        }}>
          <p>Chat Room: {this.props.roomID}</p>
          <p>Capacity: {this.state.activeClients} / 10</p>
      </div>
    );
  }
}

export { Sockets, submitWebSocket, USER_ID };
