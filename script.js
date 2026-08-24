const HF_TOKEN =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
let conversationHistory = [];
let isProcessing = false;

// Функция отправки сообщения
async function sendMessage() {
    const userInput = document.getElementById('userInput');
    const message = userInput.value.trim();
    
    if (!message || isProcessing) return;
    
    isProcessing = true;
    
    // Скрываем welcome screen
    const welcomeScreen = document.getElementById('welcomeScreen');
    if (welcomeScreen) {
        welcomeScreen.style.display = 'none';
    }
    
    // Добавляем сообщение пользователя
    addMessage(message, 'user');
    
    // Очищаем input
    userInput.value = '';
    userInput.style.height = 'auto';
    
    // Показываем индикатор печати
    const typingIndicator = showTypingIndicator();
    
    try {
        // Вызываем API
        const response = await callHuggingFaceAPI(message);
        
        // Убираем индикатор
        typingIndicator.remove();
        
        // Добавляем ответ
        addMessage(response, 'assistant');
        
    } catch (error) {
        typingIndicator.remove();
        addMessage('❌ Ошибка: ' + error.message + '\n\nПроверьте:\n1. Вставлен ли API ключ в script.js\n2. Есть ли интернет соединение', 'assistant');
    }
    
    isProcessing = false;
}

// Вызов Hugging Face API
async function callHuggingFaceAPI(message) {
    const API_URL = 'https://api-inference.huggingface.co/models/codellama/CodeLlama-7b-Instruct-hf';
    
    const prompt = `You are Rynex AI, a helpful coding assistant. 
    Provide clear, detailed answers with code examples when relevant.
    
    User: ${message}
    
    Assistant:`;
    
    const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
            'Authorization': Bearer ${HF_TOKEN},
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            inputs: prompt,
            parameters: {
                max_new_tokens: 1000,
                temperature: 0.7,
                top_p: 0.95,
                do_sample: true
            }
        })
    });
    
    if (!response.ok) {
        if (response.status === 401) {
            throw new Error('Неверный API ключ');
        } else if (response.status === 503) {
            throw new Error('Модель загружается, попробуйте через минуту');
        } else {
            throw new Error('HTTP ' + response.status);
        }
    }
    
    const data = await response.json();
    let text = data[0]?.generated_text || 'Нет ответа';
    
    // Убираем промпт из ответа
    if (text.includes('Assistant:')) {
        text = text.split('Assistant:')[1].trim();
    }
    
    return text;
}

// Добавление сообщения в чат
function addMessage(text, role) {
    const chatBox = document.getElementById('chatBox');
    const messageDiv = document.createElement('div');
    messageDiv.className = message ${role};
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    
    // Аватар
    const avatar = document.createElement('div');
    avatar.className = avatar ${role}-avatar;
    if (role === 'user') {
        avatar.textContent = 'R';
    } else {
        avatar.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" fill="#10a37f"/><path d="M8 12l3 3 5-6" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    }
    
    // Текст сообщения
    const textDiv = document.createElement('div');
    textDiv.className = 'message-text';
    
    if (role === 'assistant') {
        // Поддержка markdown и подсветка кода
        textDiv.innerHTML = marked.parse(text);
        
        // Подсветка кода
        textDiv.querySelectorAll('pre code').forEach(block => {
            hljs.highlightElement(block);
        });
    } else {
        textDiv.textContent = text;
    }
    
    contentDiv.appendChild(avatar);
    contentDiv.appendChild(textDiv);
    messageDiv.appendChild(contentDiv);
    
    chatBox.appendChild(messageDiv);chatBox.scrollTop = chatBox.scrollHeight;
}

// Индикатор печати
function showTypingIndicator() {
    const chatBox = document.getElementById('chatBox');
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message assistant';
    typingDiv.innerHTML = `
        <div class="message-content">
            <div class="avatar ai-avatar">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" fill="#10a37f"/>
                    <path d="M8 12l3 3 5-6" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            </div>
            <div class="typing-indicator">
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
            </div>
        </div>
    `;
    chatBox.appendChild(typingDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
    return typingDiv;
}

// Быстрые подсказки
function quickPrompt(text) {
    const input = document.getElementById('userInput');
    input.value = text;
    input.focus();
    sendMessage();
}

// Очистка чата
function clearChat() {
    const chatBox = document.getElementById('chatBox');
    chatBox.innerHTML = '';
    location.reload();
}

// Обработка клавиш
function handleKeyDown(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        sendMessage();
    }
    
    // Автоувеличение высоты textarea
    const textarea = event.target;
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
}

// Автофокус на input при загрузке
window.addEventListener('load', () => {
    document.getElementById('userInput').focus();
});
