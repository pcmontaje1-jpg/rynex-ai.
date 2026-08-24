// Конфигурация API (бесплатные варианты)
const config = {
    // Вариант 1: Hugging Face (бесплатно, без ограничений)
    huggingface: {
        url: 'https://api-inference.huggingface.co/models/',
        token: 'hf_ВАШ_ТОКЕН', // Получите на huggingface.co
        models: {
            'code-llama': 'codellama/CodeLlama-7b-Instruct-hf',
            'default': 'mistralai/Mistral-7B-Instruct-v0.2'
        }
    },
    
    // Вариант 2: Cloudflare Workers AI (бесплатно)
    cloudflare: {
        url: 'https://api.cloudflare.com/client/v4/accounts/ВАШ_ACCOUNT_ID/ai/run/',
        token: 'ВАШ_CLOUDFLARE_TOKEN'
    }
};

let conversationHistory = [];

async function sendMessage() {
    const userInput = document.getElementById('userInput');
    const message = userInput.value.trim();
    const modelSelect = document.getElementById('modelSelect');
    
    if (!message) return;
    
    // Добавляем сообщение пользователя
    addMessage(message, 'user-message');
    userInput.value = '';
    
    // Показываем загрузку
    const loadingMsg = addMessage('⚡ Генерация...', 'bot-message loading');
    
    try {
        // Выбираем бесплатный API
        const response = await callHuggingFaceAPI(message, modelSelect.value);
        
        loadingMsg.remove();
        addMessage(response, 'bot-message');
        
        // Подсветка кода
        document.querySelectorAll('pre code').forEach(block => {
            hljs.highlightElement(block);
        });
        
    } catch (error) {
        loadingMsg.remove();
        addMessage('❌ Ошибка: ' + error.message, 'bot-message');
    }
}

async function callHuggingFaceAPI(message, modelType) {
    const model = config.huggingface.models[modelType] || config.huggingface.models.default;
    
    // Специальный промпт для кода
    const codePrompt = `You are Rynex AI, a coding assistant. 
    Task: ${message}
    Provide code examples with explanations.
    Format code in markdown blocks.`;
    
    const response = await fetch(config.huggingface.url + model, {
        method: 'POST',
        headers: {
            'Authorization': Bearer ${config.huggingface.token},
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            inputs: codePrompt,
            parameters: {
                max_new_tokens: 1000,
                temperature: 0.7,
                top_p: 0.95,
                do_sample: true
            }
        })
    });
    
    if (!response.ok) {
        throw new Error('API error: ' + response.status);
    }
    
    const data = await response.json();
    return data[0]?.generated_text || 'Нет ответа';
}

// Альтернатива: Cloudflare Workers AI
async function callCloudflareAPI(message) {
    const response = await fetch(config.cloudflare.url + '@cf/meta/llama-3-8b-instruct', {
        method: 'POST',
        headers: {
            'Authorization': Bearer ${config.cloudflare.token},
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            messages: [
                { role: 'system', content: 'You are a coding assistant' },
                { role: 'user', content: message }
            ]
        })
    });
    
    const data = await response.json();
    return data.result.response;
}

function addMessage(text, className) {
    const chatBox = document.getElementById('chatBox');
    const messageDiv = document.createElement('div');
    messageDiv.className = message ${className};
    
    // Поддержка Markdown
    if (className === 'bot-message' && !className.includes('loading')) {
        messageDiv.innerHTML = marked.parse(text);
    } else {
        messageDiv.textContent = text;
    }
    
    chatBox.appendChild(messageDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
    return messageDiv;
}

// Отправка по Ctrl+Enter
document.getElementById('userInput').addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && e.ctrlKey) {
        e.preventDefault();
        sendMessage();
    }
});

// Быстрые шаблоны
function quickTemplate(type) {
    const templates = {'python': 'Напиши Python функцию для ',
        'js': 'Создай JavaScript код для ',
        'debug': 'Найди ошибку в этом коде:\n',
        'explain': 'Объясни как работает этот код:\n',
        'optimize': 'Оптимизируй этот код:\n'
    };
    
    const input = document.getElementById('userInput');
    input.value = templates[type];
    input.focus();
}
