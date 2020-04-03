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
    super(props);
    // Creating Unique User ID
    let name = prompt("Please enter your name");
    let language = prompt("Please enter your preferred language (Will change this to dropdown)", "English");
    language = language.toLowerCase();

    let user_id =  name + '_' + Math.random().toString(36).substr(2, 9) + ":";

    let key_to_language_map = {
      'af': 'afrikaans',
      'sq': 'albanian',
      'am': 'amharic',
      'ar': 'arabic',
      'hy': 'armenian',
      'az': 'azerbaijani',
      'eu': 'basque',
      'be': 'belarusian',
      'bn': 'bengali',
      'bs': 'bosnian',
      'bg': 'bulgarian',
      'ca': 'catalan',
      'ceb': 'cebuano',
      'ny': 'chichewa',
      'zh-cn': 'chinese (simplified)',
      'zh-tw': 'chinese (traditional)',
      'co': 'corsican',
      'hr': 'croatian',
      'cs': 'czech',
      'da': 'danish',
      'nl': 'dutch',
      'en': 'english',
      'eo': 'esperanto',
      'et': 'estonian',
      'tl': 'filipino',
      'fi': 'finnish',
      'fr': 'french',
      'fy': 'frisian',
      'gl': 'galician',
      'ka': 'georgian',
      'de': 'german',
      'el': 'greek',
      'gu': 'gujarati',
      'ht': 'haitian creole',
      'ha': 'hausa',
      'haw': 'hawaiian',
      'iw': 'hebrew',
      'hi': 'hindi',
      'hmn': 'hmong',
      'hu': 'hungarian',
      'is': 'icelandic',
      'ig': 'igbo',
      'id': 'indonesian',
      'ga': 'irish',
      'it': 'italian',
      'ja': 'japanese',
      'jw': 'javanese',
      'kn': 'kannada',
      'kk': 'kazakh',
      'km': 'khmer',
      'ko': 'korean',
      'ku': 'kurdish (kurmanji)',
      'ky': 'kyrgyz',
      'lo': 'lao',
      'la': 'latin',
      'lv': 'latvian',
      'lt': 'lithuanian',
      'lb': 'luxembourgish',
      'mk': 'macedonian',
      'mg': 'malagasy',
      'ms': 'malay',
      'ml': 'malayalam',
      'mt': 'maltese',
      'mi': 'maori',
      'mr': 'marathi',
      'mn': 'mongolian',
      'my': 'myanmar (burmese)',
      'ne': 'nepali',
      'no': 'norwegian',
      'ps': 'pashto',
      'fa': 'persian',
      'pl': 'polish',
      'pt': 'portuguese',
      'pa': 'punjabi',
      'ro': 'romanian',
      'ru': 'russian',
      'sm': 'samoan',
      'gd': 'scots gaelic',
      'sr': 'serbian',
      'st': 'sesotho',
      'sn': 'shona',
      'sd': 'sindhi',
      'si': 'sinhala',
      'sk': 'slovak',
      'sl': 'slovenian',
      'so': 'somali',
      'es': 'spanish',
      'su': 'sundanese',
      'sw': 'swahili',
      'sv': 'swedish',
      'tg': 'tajik',
      'ta': 'tamil',
      'te': 'telugu',
      'th': 'thai',
      'tr': 'turkish',
      'uk': 'ukrainian',
      'ur': 'urdu',
      'uz': 'uzbek',
      'vi': 'vietnamese',
      'cy': 'welsh',
      'xh': 'xhosa',
      'yi': 'yiddish',
      'yo': 'yoruba',
      'zu': 'zulu',
      'fil': 'Filipino',
      'he': 'Hebrew'
    }

    let language_to_key_map = Object.fromEntries(Object.entries(key_to_language_map).map(([k,v], i) => [v,k]))

    while (!language_to_key_map[language]) {
      language = prompt("Sorry, please pick a different language", "English");
      language = language.toLowerCase()
    }

    let lang = language_to_key_map[language] + ":"

    this.state = {
      id: user_id,
      lang: 'en',
      value: '',
      messages: []
    };

    // GET REQUEST CONNECT
    let otherLanguage;
    let fetchUrl = "http://translation-backend.herokuapp.com/connect?lang=" + language_to_key_map[language]
    fetch(fetchUrl ,{
      method: 'GET',
      headers: {
        "access-control-allow-origin" : "*",
      }
    })
    .then(res => res.json())
    .then(res => {
      console.log(res);
      res.forEach((v, i) => {
        let myKey = language_to_key_map[language]
        if (v !== myKey) {
          console.log("OTHER language is v");
          otherLanguage = v + ":";
          console.log(otherLanguage)
        }
      })
            
      this.setState(() => {
        return {
          lang: otherLanguage
        }
      })
    })

    receiveWebSocket.onmessage = (event) => {
      let messageRecevied = event.data;
      let message_id;

      console.log("received message: " + messageRecevied)
      console.log(messageRecevied.indexOf(this.state.id))

      if (messageRecevied.indexOf(this.state.id) == -1) {
        // Message received was not sent by this user
        message_id = RECIPIENT_ID;
        let langIndex = messageRecevied.indexOf(":") + 1;
        let messageIndex = messageRecevied.indexOf(":", langIndex) + 1;
  
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
  }


  componentDidMount() {
    // Activate the event listener
    console.log("ADDING EVENT LISTENER")

    window.onbeforeunload = async function () {
      await fetch("http://translation-backend.herokuapp.com/disconnect",{
        method: 'GET',
        headers: {
          "access-control-allow-origin" : "*",
        }
      })
      .then(res => console.log(res))

      return "Do you really want to close?"
  };
  }

  myChangeHandler = (event) => {
    this.setState({value: event.target.value});
  }

  handleSubmit = (event) => {
    event.preventDefault();

    // Send to backend
    console.log("Sending '" + this.state.value + "' to backend")

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
    let newMsg = this.state.id + this.state.lang + this.state.value;
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