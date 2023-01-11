import chatBotPng from "./public/assets/chatBot.png";
import userPng from "./public/assets/user.png";

let loaderInterval;
const form = document.querySelector("form");
const chatContainer = document.getElementById("chat_container");

function typingLoader(el) {
  el.textContent = "";

  loaderInterval = setInterval(() => {
    el.textContent += "▪️ ";
    if (el.textContent === "▪️ ▪️ ▪️ ▪️ ") {
      el.textContent = "";
    }
  }, 80);
}

function typeChat(el, chatText) {
  let i = 0;

  let chatInterval = setInterval(() => {
    if (i < chatText.length) {
      el.innerHTML += chatText.charAt(i);
      i++;
    }
    else {
      clearInterval(chatInterval);
    }
  }, 25);
}

function generateUID() {
  const timestamp = Date.now();
  const randomNum = Math.random();
  const hex = randomNum.toString(16);

  return `id-${timestamp}-${hex}`;
}

function chatMessage(isAi, messageValue, uid) {
  return (
    `
<div class="wrapper ${isAi && "ai"}">
  <div class="chat">
    <div class="profile">
      <img src="${isAi ? chatBotPng : userPng}" 
        alt="${isAi ? "chatBotPng" : "userPng"}" 
      />
    </div> 
    <div class="message" id="${uid}">${messageValue}</div> 
  </div>
</div>
    `
  )
}

const handleSubmit = async (e) => {
  e.preventDefault()

  const data = new FormData(form)

  // user's chatstripe
  chatContainer.innerHTML += chatMessage(false, data.get('user_message'))

  // to clear the textarea input 
  form.reset()

  // bot's chatstripe
  const uniqueId = generateUID()
  chatContainer.innerHTML += chatMessage(true, "", uniqueId)

  // to focus scroll to the bottom 
  chatContainer.scrollTop = chatContainer.scrollHeight;

  // specific message div 
  const messageDiv = document.getElementById(uniqueId)

  // messageDiv.innerHTML = "..."
  typingLoader(messageDiv)

  const response = await fetch('https://codex-2au6.onrender.com', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      user_message: data.get('user_message')
    })
  })

  clearInterval(loaderInterval) // stop typing loader 
  messageDiv.innerHTML = " "

  if (response.ok) {
    const data = await response.json();
    const parsedData = data.botMessage.trim();// trims any spaces '\n' 
    typeChat(messageDiv, parsedData);
    chatContainer.scrollTop = chatContainer.scrollHeight;
  } else {
    const err = await response.text();

    messageDiv.innerHTML = "Something went wrong"
    alert(err);
  }
}

form.addEventListener('submit', handleSubmit)
form.addEventListener('keyup', (e) => {
  if (e.keyCode === 13) {
    handleSubmit(e)
  }
})