'python': 'Напиши Python функцию для ',
        'js': 'Создай JavaScript код для ',
        'debug': 'Найди ошибку в этом коде:\n',
        'explain': 'Объясни как работает этот код:\n',
        'optimize': 'Оптимизируй этот код:\n'
    };
    
    const input = document.getElementById('userInput');
    input.value = templates[type];
    input.focus();
}
