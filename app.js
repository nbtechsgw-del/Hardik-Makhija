if (localStorage.getItem("isLoggedIn") !== "true") {
    window.location.href = "login.html";
}

let prompt = document.querySelector("#userInput")
let chatContainer = document.querySelector(".chat-container")
let submitBtn = document.querySelector("#submit")


const Api_Url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=AIzaSyDy0jFu64WlPVR2pJ3apvYDtWo5zUQoiHU"

async function fetchAIResponse(aiChatBox, message) {
    let textArea = aiChatBox.querySelector(".ai-chat-area")

    let requestOptions = {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            contents: [{
                role: "user",
                parts: [{
                    text: `Please reply in English only.\nUser message: ${message}`
                }]
            }],
            generationConfig: {
                temperature: 0.7,
                candidateCount: 1
            }
        })
    }

    try {
        let response = await fetch(Api_Url, requestOptions)

        let responseText = null
        try {
            responseText = await response.text()
        } catch (e) {
            responseText = null
        }

        if (!response.ok) {
            console.error("HTTP error:", response.status, responseText)
            textArea.innerHTML = `Sorry, request failed.<br><b>Status:</b> ${response.status}<br><b>Reason:</b> ${responseText ? responseText.slice(0, 800) : "(no body)"}`
            return
        }

        let data = null
        try {
            data = responseText ? JSON.parse(responseText) : await response.json()
        } catch (e) {
            data = await response.json().catch(() => null)
        }

        let apiResponse =
            (data && data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content[0] && data.candidates[0].content[0].text) ||
            (data && data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts[0] && data.candidates[0].content.parts[0].text) ||
            (data && data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts ?
                data.candidates[0].content.parts.map(part => part.text).join(" ") :
                null) ||
            "Sorry, I couldn't get a valid response from the AI."

        textArea.innerHTML = String(apiResponse).replace(/\\(.?)\\*/g, "$1").trim()
    } catch (error) {
        console.error("Error fetching AI response:", error)
        textArea.innerHTML = `Sorry, I couldn't generate a response right now.<br><b>Error:</b> ${error?.message ? error.message : String(error)}`
    } finally {
        chatContainer.scrollTo({ top: chatContainer.scrollHeight, behavior: "smooth" })
    }
}

function createChatBox(html, classes) {
    let div = document.createElement("div")
    div.innerHTML = html
    div.classList.add(classes)
    return div
}

function handleChatResponse(message) {
    message = String(message).trim()
    if (!message) return

    let userHtml = `
            <img src="user.png" alt="" id="userImage" width="80">
            <div class="user-chat-area">
                ${message}
            </div>`

    let userChatBox = createChatBox(userHtml, "user-chat-box")
    chatContainer.appendChild(userChatBox)
    chatContainer.scrollTo({ top: chatContainer.scrollHeight, behavior: "smooth" })

    setTimeout(() => {
        let aiHtml = `
                <img src="ai.png" alt="" id="aiImage" width="70px">
                <div class="ai-chat-area">
                    <img src="loading.webp" alt="Loading..." class="load" width="50px">
                </div>`

        let aiChatBox = createChatBox(aiHtml, "ai-chat-box")
        chatContainer.appendChild(aiChatBox)

        prompt.value = ""
        prompt.focus()

        fetchAIResponse(aiChatBox, message)
    }, 1000)
}

prompt.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        handleChatResponse(prompt.value)
    }
})

submitBtn.addEventListener("click", () => {
    handleChatResponse(prompt.value)
})