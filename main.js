// --- Lógica de Comunicación y UI ---
const API_KEY = "AIzaSyAnJ04cqBbLCHxdqQLts8HSgAU7D-lZ4VE"; 
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

let base64Image = null;

// Escuchar carga de imagen
document.getElementById('image-input').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(event) {
        // Guardamos solo la data codificada
        base64Image = event.target.result.split(',')[1];
        addMessage("Nexo visual cargado. Listo para escaneo.", 'user', event.target.result);
    };
    reader.readAsDataURL(file);
});

async function sendMessage() {
    const inputField = document.getElementById('user-input');
    const text = inputField.value.trim();
    
    if (!text && !base64Image) return;

    // Mostrar mensaje del usuario
    addMessage(text, 'user');
    inputField.value = '';
    setLoading(true);

    // Preparar el cuerpo de la petición (Prompt Multi-modal)
    const payload = {
        contents: [{
            parts: [
                { text: text || "Describe los datos de esta matriz visual." }
            ]
        }]
    };

    // Si hay imagen, se adjunta al arreglo de partes
    if (base64Image) {
        payload.contents[0].parts.push({
            inline_data: {
                mime_type: "image/jpeg",
                data: base64Image
            }
        });
    }

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        const data = await response.json();
        const aiResponse = data.candidates[0].content.parts[0].text;
        
        addMessage(aiResponse, 'ai');
    } catch (error) {
        addMessage("ERROR_LOG: El núcleo neuronal no responde. Reintente.", 'ai');
    } finally {
        setLoading(false);
        base64Image = null; // Reset de imagen
    }
}

function addMessage(content, sender, imgSrc = null) {
    const history = document.getElementById('chat-history');
    const msgDiv = document.createElement('div');
    msgDiv.className = `msg ${sender}-msg`;
    
    let html = `<strong>${sender === 'ai' ? '> CORE' : '> USR'}:</strong><br>${content}`;
    if (imgSrc) html += `<br><img src="${imgSrc}" class="preview-img">`;
    
    msgDiv.innerHTML = html;
    history.appendChild(msgDiv);
    history.scrollTop = history.scrollHeight;
}

function setLoading(status) {
    const statusEl = document.getElementById('status');
    statusEl.innerText = status ? "ESTADO: PROCESANDO..." : "ESTADO: ONLINE";
    statusEl.style.color = status ? "var(--neon-purple)" : "var(--neon-green)";
}
