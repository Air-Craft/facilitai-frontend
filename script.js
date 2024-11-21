// JavaScript for FacilitAI

document.addEventListener('DOMContentLoaded', () => {
    const chatForm = document.getElementById('chat-form');
    const userInput = document.getElementById('user-input');
    const conversation = document.getElementById('conversation');
    const loadingIndicator = document.getElementById('loading-indicator');
    const clearConversationBtn = document.getElementById('clear-conversation');

    let initialPrompt = null;
    const FIRST_PROMPT_ROLE = "user"; // Role for the initial prompt
    let conversationHistory = [];     // Stores the conversation messages excluding the initial prompt

    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault(); // Prevent the form from submitting the traditional way

        // Get user input
        const userText = userInput.value.trim();
        if (!userText) return;

        // Display user's message
        addMessage('user', userText);

        // Clear input
        userInput.value = '';

        // Show loading indicator
        loadingIndicator.classList.remove('hidden');

        // Prepare the messages array
        let messages = [];

        if (!initialPrompt) {
            // First query
            // Messages array contains just the user's input
            messages.push({ "role": "user", "content": userText });
        } else {
            // Subsequent queries
            // Start messages array with the stored prompt, with role FIRST_PROMPT_ROLE
            messages.push({ "role": FIRST_PROMPT_ROLE, "content": initialPrompt });

            // Add previous conversation messages (excluding initialPrompt)
            messages = messages.concat(conversationHistory);

            // Add the current user input
            messages.push({ "role": "user", "content": userText });
        }

        try {
            // Determine API base URL
            const apiBaseUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
                ? 'http://localhost/api'
                : 'https://facilitai-api.onrender.com';

            // Append '/query' to base URL to get the full endpoint
            const apiUrl = apiBaseUrl + '/query';

            // Prepare POST data
            let postData = {
                "messages": messages
            };
            console.log("SUBMIT")
            console.dir(postData)

            // Send POST request
            const response = await fetch(apiUrl, {
                method: 'POST', // Use POST method
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(postData)
            });

            const data = await response.json();
            console.log("RESPONSE")
            console.dir(data)

            // Hide loading indicator
            loadingIndicator.classList.add('hidden');

            // Display assistant's response
            const assistantContent = data.response;
            addMessage('assistant', assistantContent);

            // Convert markdown to HTML
            const assistantMessageElem = conversation.lastElementChild.querySelector('.content');
            assistantMessageElem.innerHTML = markdownToHtml(assistantContent);

            // Store initialPrompt if it's the first query
            if (!initialPrompt && data.prompt) {
                initialPrompt = data.prompt; // Use the prompt returned from the API
            }

            // Update conversationHistory
            // We store all messages after the initialPrompt
            conversationHistory.push({ "role": "user", "content": userText });
            conversationHistory.push({ "role": "assistant", "content": assistantContent });

        } catch (error) {
            console.error('Error:', error);
            loadingIndicator.classList.add('hidden');
            addMessage('assistant', 'Sorry, there was an error processing your request.');
        }
    });

    clearConversationBtn.addEventListener('click', () => {
        conversation.innerHTML = '';
        initialPrompt = null;
        conversationHistory = [];
        userInput.value = '';
    });

    function addMessage(role, content) {
        const messageElem = document.createElement('div');
        messageElem.classList.add('message', role);

        const contentElem = document.createElement('div');
        contentElem.classList.add('content');
        contentElem.textContent = content;

        messageElem.appendChild(contentElem);
        conversation.appendChild(messageElem);

        // Scroll to the bottom
        conversation.scrollTop = conversation.scrollHeight;
    }

    function markdownToHtml(markdown) {
        // Basic markdown to HTML conversion
        let html = markdown;

        // Headers using ===== and ------
        html = html.replace(/^(.+)[\r\n]=+/gm, '<h1>$1</h1>');
        html = html.replace(/^(.+)[\r\n]-+/gm, '<h2>$1</h2>');

        html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');
        html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
        html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
        
        // Bold and italics
        html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
        html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');

        // Links
        html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>');

        // Line breaks
        html = html.replace(/\n/g, '<br>');

        return html;
    }
});