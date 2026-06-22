const prompt = document.querySelector("#prompt");
const chatBox = document.querySelector(".chat-box");
const sendBtn = document.querySelector("#send-btn");
const fileInput = document.querySelector("#file-input");
const uploadBtn = document.querySelector("#upload-btn");

const API_URL =
"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=AQ.Ab8RN6JMG3HXHEsSQaIiLL-pA-1ptl3EkpdXdP1zoIfrpa8zvw";

let user = {
    message: null,
    file: null
};

// Upload button click
uploadBtn.addEventListener("click", () => {
    fileInput.click();
});

// Convert image to Gemini format  to get image response from Gemini
function fileToGenerativePart(file) {

    return new Promise((resolve) => {

        const reader = new FileReader();

        reader.onloadend = () => {

            resolve({
                inline_data: {
                    mime_type: file.type,
                    data: reader.result.split(",")[1]
                }
            });

        };

        reader.readAsDataURL(file);
    });
}

// Create chat element
function createChatBox(html, className) {

    const div = document.createElement("div");

    div.innerHTML = html;

    div.classList.add(className);

    return div;
}

// Generate Gemini response
async function generateResponse(botChatBox) {

    try {

        let parts = [];

        // User text
        if (user.message) {

            parts.push({
                text: user.message
            });

        }

        // User image
        if (user.file) {

            const imagePart =
                await fileToGenerativePart(user.file);

            parts.push(imagePart);

        }

        const requestOptions = {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                contents: [
                    {
                        parts: parts
                    }
                ]
            })

        };

        const response =
            await fetch(API_URL, requestOptions);

        const data =
            await response.json();

        console.log(data);

        const botReply =
            data.candidates?.[0]?.content?.parts?.[0]?.text ||
            "Sorry, I couldn't generate a response.";

        botChatBox.querySelector(".bot-chat").innerHTML =
            `<p>${botReply.replace(/\n/g,"<br>")}</p>`;

        // Clear image after successful send
        user.file = null;

        fileInput.value = "";

        const preview =
            document.querySelector(".image-preview");

        if(preview){
            preview.innerHTML = "";
        }

    }
    catch(error){

        console.error(error);

        botChatBox.querySelector(".bot-chat").innerHTML =
            `<p>Something went wrong.</p>`;
    }

    chatBox.scrollTop =
        chatBox.scrollHeight;
}

// Send message
function handleChats(message) {

    if (
        message.trim() === "" &&
        !user.file
    ) return;

    user.message = message;

    // Show image in chat
    if(user.file){

        const imageURL =
            URL.createObjectURL(user.file);

        chatBox.insertAdjacentHTML(
            "beforeend",
            `
            <div class="user-msg">
                <img src="${imageURL}"
                     class="uploaded-image">
                <img src="User Png.png"
                     class="avatar">
            </div>
            `
        );
    }

    // Show text in chat
    if(message.trim() !== ""){

        const userHtml = `
            <div class="user-msg">
                <p>${message}</p>
                <img src="User Png.png"
                     class="avatar"
                     alt="User">
            </div>
        `;

        const userChatBox =
            createChatBox(userHtml,"user-chat");

        chatBox.appendChild(userChatBox);
    }

    prompt.value = "";

    setTimeout(() => {

        const botHtml = `
        <div class="bot-reply">

            <img src="ChatBot png.png"
                 class="avatar"
                 alt="Bot">

            <div class="bot-chat">

                <img src="chat.png"
                     class="loading-img"
                     alt="Loading">

            </div>

        </div>
        `;

        const botChatBox =
            createChatBox(botHtml,"bot-chat");

        chatBox.appendChild(botChatBox);

        generateResponse(botChatBox);

    },500);

    chatBox.scrollTop =
        chatBox.scrollHeight;
}

// Enter key
prompt.addEventListener("keydown",(e)=>{

    if(e.key === "Enter"){

        handleChats(prompt.value);

    }

});

// Send button
sendBtn.addEventListener("click",()=>{

    handleChats(prompt.value);

});

// Image selection
fileInput.addEventListener("change",()=>{

    const file =
        fileInput.files[0];

    if(!file) return;

    user.file = file;

    const imageURL =
        URL.createObjectURL(file);

    const preview =
        document.querySelector(".image-preview");

    if(preview){

        preview.innerHTML = `
            <img src="${imageURL}"
                 class="preview-image">
        `;
    }

});