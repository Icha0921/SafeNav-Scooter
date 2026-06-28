const map = L.map('mapa-contenedor').setView([4.6097, -74.0817], 13);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

const colores = { "Zona Oscura": "darkblue", "Infraestructura en mal estado": "green", "Incidente de hurto": "orange" };

async function actualizarTodo() {
    const zonas = await obtenerZonasRiesgo();
    const lista = document.getElementById('lista-alertas');
    lista.innerHTML = '';
    
    zonas.forEach(z => {
        let iconoHtml = z.tipo.includes("Hurto") ? '<div style="font-size:25px;">🦹</div>' : 
                        `<div style="background-color:${colores[z.tipo] || 'blue'}; width:20px; height:20px; border-radius:50%; border:2px solid white;"></div>`;
        L.marker([z.lat, z.lng], { icon: L.divIcon({ html: iconoHtml, className: 'icon' }) })
         .addTo(map).bindPopup(`${z.tipo} (${z.gravedad})`);
        lista.innerHTML += `<li class="list-group-item">${z.tipo} - ${z.gravedad}</li>`;
    });

    // 2. Cargar Mapa de Calor (Datos externos) DESPUÉS y asegúrate de la opacidad
    const heatData = await (await fetch(`${API_BASE_URL}/mapa-calor`)).json();
    L.heatLayer(heatData, {
        radius: 35,
        blur: 20,
        maxOpacity: 0.8
    }).addTo(map);
}

async function cargarMapaCalor() {
    try {
        const res = await fetch(`${API_BASE_URL}/mapa-calor`);
        const datosRaw = await res.json();
        
        const datosProcesados = datosRaw.map(d => [parseFloat(d[0]), parseFloat(d[1]), parseFloat(d[2])]);
        
        console.log("Datos cargados para calor:", datosProcesados);

        
        const heat = L.heatLayer(datosProcesados, {
            radius: 50,      
            blur: 25,        
            maxOpacity: 1.0,
            gradient: {0.4: 'blue', 0.6: 'cyan', 0.8: 'lime', 1.0: 'red'}
        }).addTo(map);

        
        heat.bringToFront();
        
    } catch (error) {
        console.error("Error al cargar mapa de calor:", error);
    }
}

document.addEventListener('DOMContentLoaded', actualizarTodo);


document.getElementById('btn-buscar').addEventListener('click', () => {
    const val = document.getElementById('input-coord').value.split(',');
    if(val.length === 2) {
        const lat = parseFloat(val[0]), lng = parseFloat(val[1]);
        L.marker([lat, lng]).addTo(map).bindPopup("Ubicación buscada").openPopup();
        map.setView([lat, lng], 15);
    }
});


document.getElementById('btn-reportar').addEventListener('click', () => {
    navigator.geolocation.getCurrentPosition(async (pos) => {
        await reportarNuevaZona({
            tipo: document.getElementById('tipo-incidente').value,
            gravedad: document.getElementById('gravedad-incidente').value,
            lat: pos.coords.latitude, lng: pos.coords.longitude
        });
        location.reload();
    });
});