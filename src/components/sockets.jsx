import React, { Component } from 'react';
import ReconnectingWebSocket from 'reconnecting-websocket';
import { Message } from 'react-chat-ui'

let myKey = ""

const USER_ID = 0;
const RECIPIENT_ID = 1
const submitWebSocket = new ReconnectingWebSocket('ws://translation-backend.herokuapp.com/submit');
const receiveWebSocket = new ReconnectingWebSocket('ws://translation-backend.herokuapp.com/receive');
const notificationWebSocket = new ReconnectingWebSocket('ws://translation-backend.herokuapp.com/interruptions');


submitWebSocket.addEventListener('open', () => {
    console.log("Establishing initial /submit socket connection")
});
  
receiveWebSocket.addEventListener('open', () => {
    console.log("Establishing initial /receive socket connection")
});

notificationWebSocket.addEventListener('open', () => {
    console.log("Establishing initial /interruptions socket connection")
});


class Sockets extends Component {
    constructor(props) {
        super(props)
        myKey = this.props.ownLangKey

        receiveWebSocket.onmessage = (event) => {
            let messageRecevied = event.data;
            let message_id;
        
            if (messageRecevied.indexOf(this.props.userId) === -1) {
              message_id = RECIPIENT_ID;
              let langIndex = messageRecevied.indexOf(":") + 1;
              let messageIndex = messageRecevied.indexOf(":", langIndex) + 1;
        
              messageRecevied = messageRecevied.substring(messageIndex);
        
              let msg = new Message({
                id: message_id, 
                message: messageRecevied
              })
        
              console.log("Message received: " + messageRecevied)
              this.props.receiveMessage(msg)
            }
        }

        notificationWebSocket.onmessage = (event) => {
            let messageRecevied = event.data;
            this.props.setTyping(messageRecevied === "2")
        }
    }

    async componentDidMount() {
        console.log("Registering window close event listener")
        console.log("ownkey: " + this.props.ownLangKey)


        window.onbeforeunload = async function () {
            console.log(myKey)
            let disconnectUrl = "http://translation-backend.herokuapp.com/disconnect?lang=" + myKey
            await fetch(disconnectUrl,{
              method: 'GET',
              headers: {
                "access-control-allow-origin" : "*",
              }
            })
            .then(res => console.log(res))
      
            return "Do you really want to close?"
        }

        console.log("lang key: " + this.props.langKey)
        let fetchUrl = "http://translation-backend.herokuapp.com/connect?lang=" + this.props.langKey + "&id=" + this.props.userId
        console.log("Connecting to backend at: " + fetchUrl)

        let otherLanguage = "" // default
        let getRequest = fetch(fetchUrl ,{
          method: 'GET',
          headers: {
            "access-control-allow-origin" : "*",
          }
        })
        .then(res => res.json())
        .then(res => {
          console.log("IN SOCKETS JSX")
          console.log(res);
          res.forEach((v, i) => {
              if (v !== this.props.langKey) {
                  console.log("Other client's language is: " + v);
                  otherLanguage = v + ":";
              }
          })    

          if (otherLanguage === "") {
              // Both clients choose the same language
              otherLanguage = this.props.langKey + ":"
          }

        this.props.setReceipientLanguage(otherLanguage)          
        })

        await getRequest;
        this.props.setTyping(true)
        console.log("Finished connecting successfully")
    }

    render() {
        return (
            <div>
            </div>
        )
    }

}

export {Sockets, submitWebSocket, USER_ID}