const API_URL = window.location.origin + "/chat";

// Local fallback dataset
const localDataset = {
    "hello": "Hello! How can I help you today?",
    "hi": "Hi! How may I help you?",
    "hey": "Hey there! Need any help?",
    "bye": "Goodbye! Have a great day!",
    "ok": "Okay!",
    "hmm": "Alright!",
    "nice": "Great!",
    "thanks": "You're welcome!",
};

// Load elements
const chatWindow = document.getElementById("chat-window");
const userInput = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");
const voiceBtn = document.getElementById("voice-btn");
const clearChatBtn = document.getElementById("clear-chat-btn");

// Load saved chat
window.onload = () => {
    const savedHistory = JSON.parse(localStorage.getItem("chatHistory")) || [];
    savedHistory.forEach(msg => addMessage(msg.text, msg.sender, false));
    chatWindow.scrollTop = chatWindow.scrollHeight;
};

// ADD MESSAGE FUNCTION (with delete button)
function addMessage(text, sender, save = true) {
    const msgDiv = document.createElement("div");
    msgDiv.classList.add("message", sender);

    msgDiv.innerHTML = `
        <p>${text}</p>
        <span class="delete-msg" title="Delete Message" 
              style="cursor:pointer; color:#ff5555; margin-left:10px;">🗑</span>
    `;

    msgDiv.querySelector(".delete-msg").addEventListener("click", () => {
        msgDiv.remove();

        let history = JSON.parse(localStorage.getItem("chatHistory")) || [];
        history = history.filter(m => !(m.text === text && m.sender === sender));
        localStorage.setItem("chatHistory", JSON.stringify(history));
    });

    chatWindow.appendChild(msgDiv);
    chatWindow.scrollTop = chatWindow.scrollHeight;

    if (save) {
        let history = JSON.parse(localStorage.getItem("chatHistory")) || [];
        history.push({ text, sender });
        localStorage.setItem("chatHistory", JSON.stringify(history));
    }
}

// Backend response system
async function getBotResponse(userText) {
    try {
        const res = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: userText })
        });

        const data = await res.json();
        return data.response;
    } catch (err) {
        const key = userText.toLowerCase();
        return localDataset[key] || "Sorry, I don't know the answer to that.";
    }
}

// Send Message Handler
async function handleSend() {
    const text = userInput.value.trim();
    if (!text) return;

    addMessage(text, "user");
    userInput.value = "";

    const loadingMsg = document.createElement("div");
    loadingMsg.classList.add("message", "bot");
    loadingMsg.innerHTML = `<p><i>Typing...</i></p>`;
    chatWindow.appendChild(loadingMsg);

    const botReply = await getBotResponse(text);

    chatWindow.removeChild(loadingMsg);
    addMessage(botReply, "bot");
}

sendBtn.addEventListener("click", handleSend);
userInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") handleSend();
});

/* ------------------------------------
   🎤 VOICE INPUT (WORKING NOW)
-------------------------------------- */
let recognition;

if ("webkitSpeechRecognition" in window) {
    recognition = new webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.lang = "en-US";

    recognition.onstart = () => {
        voiceBtn.style.background = "#ff4444";
    };

    recognition.onend = () => {
        voiceBtn.style.background = "#007bff";
    };

    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        userInput.value = transcript;
        handleSend();
    };

    voiceBtn.addEventListener("click", () => {
        recognition.start();
    });
} else {
    voiceBtn.addEventListener("click", () => {
        alert("Voice recognition not supported on this browser.");
    });
}

/* ------------------------------------
   🗑 CLEAR FULL CHAT BUTTON
-------------------------------------- */
clearChatBtn.addEventListener("click", () => {
    localStorage.removeItem("chatHistory");

    chatWindow.innerHTML = `
        <div class="message bot">
            <p>Hello! I am Computer Query Bot. How can I help you today?</p>
        </div>
    `;
});