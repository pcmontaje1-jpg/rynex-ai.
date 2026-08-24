const GROQ_TOKEN = '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'; // ← ВСТАВЬ СВОЙ КЛЮЧ ОТ GROQ

const chat = document.getElementById('chat');
const input = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');

sendBtn.addEventListener('click', sendMessage);
input.addEventListener('keydown', e => {
    if (e.key === 'Enter') sendMessage();
});

async function sendMessage() {
    const text = input.value.trim();
    if (!text) return;
    
    addMessage(text, 'user');
    input.value = '';
    
    // Показываем что бот "печатает"
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'message bot';
    loadingDiv.innerHTML = '<div class="text">...</div>';
    chat.appendChild(loadingDiv);
    
    try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': Bearer ${GROQ_TOKEN},
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                messages: [
                    {
                        role: 'system',
                        content: 'Ты Rynex AI — ассистент для программирования. Отвечай кратко и по делу. Если нужно, показывай код.'
                    },
                    {
                        role: 'user',
                        content: text
                    }
                ],
                temperature: 0.7,
                max_tokens: 2000
            })
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || 'Ошибка ' + response.status);
        }
        
        const data = await response.json();
        const answer = data.choices[0].message.content;
        
        // Убираем "..." и добавляем ответ
        loadingDiv.remove();
        addMessage(answer, 'bot');
        
    } catch (error) {
        loadingDiv.remove();
        addMessage('Ошибка: ' + error.message, 'bot');
    }
}

function addMessage(text, role) {
    const div = document.createElement('div');
    div.className = message ${role};
    
    const textDiv = document.createElement('div');
    textDiv.className = 'text';
    
    if (role === 'bot') {
        textDiv.innerHTML = marked.parse(text);
        textDiv.querySelectorAll('pre code').forEach(block => {
            hljs.highlightElement(block);
        });
    } else {
        textDiv.textContent = text;
    }
    
    div.appendChild(textDiv);
    chat.appendChild(div);
    chat.scrollTop = chat.scrollHeight;
}
