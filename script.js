

document.getElementById('campaignForm').addEventListener('change', function(e) {
    if (e.target.name === 'channels') {
        const channelSettings = document.getElementById(`settings_${e.target.value}`);
        if (e.target.checked) {
            channelSettings.style.display = 'block';
        } else {
            channelSettings.style.display = 'none';
        }
    }
});

function addButton(channel) {
    const buttonsContainer = document.getElementById(`buttons_${channel}`);
    const buttonCount = buttonsContainer.childElementCount;
    const keyboardType = document.getElementById(`keyboard_type_${channel}`).value;

    const limits = {
        vk: { standard: 40, inline: 10 },
        telegram: { standard: Infinity, inline: Infinity },
        whatsapp: { standard: 10, inline: 3 },
        sms: { standard: 0, inline: 0 }
    };

    const textLengthLimits = {
        vk: 40,
        telegram: { inline: 64 },
        whatsapp: 20,
        sms: 0
    };

    const linkButtonSupport = {
        vk: true,
        telegram: keyboardType === 'inline',
        whatsapp: keyboardType === 'inline' && buttonCount < 1,
        sms: false
    };

    if (buttonCount < limits[channel][keyboardType]) {
        const newButton = document.createElement('div');
        let textLimit;
        if (channel === 'telegram' && keyboardType === 'inline') {
            textLimit = textLengthLimits.telegram.inline; 
        } else if (channel === 'telegram') {
            textLimit = textLengthLimits.telegram.standard || 'неизвестно'; 
        } else {
            textLimit = textLengthLimits[channel] || 'неизвестно'; 
        }
        newButton.innerHTML = `
            <label>Текст кнопки (макс. ${textLimit} символов):</label>
            <input type="text" name="button_text_${channel}[]" required maxlength="${textLimit}">
            ${linkButtonSupport[channel] ? `<label>URL (если кнопка-ссылка):</label>
            <input type="url" name="button_url_${channel}[]">` : ''}
            <button type="button" onclick="this.parentNode.remove()">Удалить кнопку</button>
        `;
        buttonsContainer.appendChild(newButton);
    } else {
        alert(`Вы достигли максимального количества кнопок для ${channel} (${limits[channel][keyboardType]})`);
    }
}

document.getElementById('campaignForm').addEventListener('submit', function(e) {
    e.preventDefault();
    submitForm(new FormData(e.target));
});

function submitForm(formData) {
    const formObject = {};
    formData.forEach((value, key) => {
        if (!formObject[key]) {
            formObject[key] = value;
            return;
        }
        if (!Array.isArray(formObject[key])) {
            formObject[key] = [formObject[key]];
        }
        formObject[key].push(value);
    });

    console.log('Sending data:', formObject); 

    fetch('http://localhost:3000/api/campaign', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(formObject),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        console.log('Успех:', data);
        
    })
    .catch((error) => {
        console.error('Ошибка:', error);
       
    });
}
