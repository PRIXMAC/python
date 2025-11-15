document.addEventListener('DOMContentLoaded', () => {
    /* ===== LOGIN ===== */
    const loginScreen = document.getElementById('login-screen');
    const appScreen   = document.getElementById('app-screen');
    const loginForm   = document.getElementById('login-form');
    const loginError  = document.getElementById('login-error');

    loginForm.addEventListener('submit', e => {
        e.preventDefault();
        const user = document.getElementById('login-user').value.trim();
        const pass = document.getElementById('login-pass').value.trim();
        if (!user || !pass) {
            loginError.classList.remove('hidden');
            return;
        }
        loginError.classList.add('hidden');
        loginScreen.classList.add('hidden');
        appScreen.classList.remove('hidden');
    });

    /* ===== SIMULACIÓN / DASHBOARD ===== */
    const zonas = ['Temuco', 'Padre Las Casas', 'Lautaro', 'Angol', 'Villarrica', 'Pitrufquén', 'Rural N.', 'Rural S.'];
    const contratistas = ['MLA', 'TUSAN'];
    const estados = [
        { id: 'ruta', nombre: 'En ruta',   icon: 'fa-truck',       color: 'status-ruta' },
        { id: 'faena', nombre: 'En faena', icon: 'fa-hard-hat',    color: 'status-faena' },
        { id: 'espera', nombre: 'En espera', icon: 'fa-pause-circle', color: 'status-espera' },
        { id: 'offline', nombre: 'Offline', icon: 'fa-plug',       color: 'status-offline' }
    ];
    const estadoTareas = {
        PENDIENTE:   { id: 'pendiente',   nombre: 'Pendiente',   color: 'text-gray-400' },
        EN_CURSO:    { id: 'en_curso',    nombre: 'En Curso',    color: 'text-green-400' },
        FINALIZADA:  { id: 'finalizada',  nombre: 'Finalizada',  color: 'text-blue-400' }
    };

    let brigadas = [];
    const TOTAL_BRIGADAS = 16; 
    let selectedBrigadeId = null;

    const mapContainer            = document.getElementById('map-container');
    const kpiContainer            = document.getElementById('kpi-container-mobile');
    const brigadeListContainer    = document.getElementById('brigade-list-container-mobile');
    const alertContainer          = document.getElementById('alert-container-mobile');
    const operationalStatusDot    = document.getElementById('operational-status-dot');
    const detailModal             = document.getElementById('detail-modal');
    const detailModalTitle        = document.getElementById('detail-modal-title');
    const detailModalContent      = document.getElementById('detail-modal-content');
    const photoModal              = document.getElementById('photo-modal');

    generarBrigadas();
    actualizarDashboard();
    actualizarEstadoOperacional();
    renderizarAlertas();

    setInterval(simularMovimiento, 3000);
    setInterval(simularCambioEstado, 5000);
    setInterval(() => {
        actualizarDashboard();
        actualizarEstadoOperacional();
    }, 10000);
    setInterval(renderizarAlertas, 30000);

    function generarBrigadas() {
        const clientes = ["Juan Pérez", "Maria González", "Constructora Sur", "Comercial XYZ", "Ana Castillo"];
        const direcciones = ["Av. Alemania 0890, Temuco", "Las Encinas 2045, Angol", "Caupolicán 550, Villarrica", "Ruta 5 Sur Km 890, Rural", "Prat 321, Lautaro"];
        const instaladores = ["Carlos Soto", "Luis Mella", "Pedro Vargas", "José Rivas", "Miguel Torres", "Raúl Pino"];
        const fotos = [
            "https://placehold.co/400x300/e2e8f0/64748b?text=Medidor+Instalado",
            "https://placehold.co/400x300/e2e8f0/64748b?text=Empalme+Revisado",
            "https://placehold.co/400x300/e2e8f0/64748b?text=Tablero+OK"
        ];

        brigadas = [];
        for (let i = 0; i < TOTAL_BRIGADAS; i++) {
            const contratista = (i < 13) ? 'MLA' : 'TUSAN';
            const tipo = (contratista === 'MLA' && i < 11) ? 'Monofásica' : 'Trifásica';
            const estadoActual = estados[Math.floor(Math.random() * estados.length)];
            
            brigadas.push({
                id: `${contratista}-${String(i + 1).padStart(2, '0')}`,
                contratista,
                tipo,
                zona: zonas[Math.floor(Math.random() * zonas.length)],
                estado: estadoActual,
                otActual: Math.floor(Math.random() * 5000) + 1000,
                bateria: Math.floor(Math.random() * 70) + 30,
                pos: { top: Math.random() * 80 + 10, left: Math.random() * 80 + 10 },
                tareaEstado: estadoTareas.PENDIENTE,
                cliente: clientes[Math.floor(Math.random() * clientes.length)],
                direccion: direcciones[Math.floor(Math.random() * direcciones.length)],
                instalador: instaladores[Math.floor(Math.random() * instaladores.length)],
                inventario: { medidores: Math.floor(Math.random() * 5) + 1, sellos: Math.floor(Math.random() * 20) + 5 },
                fotoURL: fotos[Math.floor(Math.random() * fotos.length)]
            });
        }
    }

    function actualizarDashboard() {
        renderizarKPIs();
        renderizarMapa();
        renderizarListaBrigadas();
        if (selectedBrigadeId) renderizarPanelDetalle();
    }

    function actualizarEstadoOperacional() {
        const ahora = new Date();
        const diaSemana = ahora.getDay();
        const hora = ahora.getHours();
        const enHorario = (diaSemana >= 1 && diaSemana <= 5 && hora >= 8 && hora < 18);

        if (enHorario) {
            operationalStatusDot.className = 'w-3 h-3 rounded-full bg-green-500';
            operationalStatusDot.title = 'Operativo (08:00 - 18:00 L-V)';
        } else {
            operationalStatusDot.className = 'w-3 h-3 rounded-full bg-red-500';
            operationalStatusDot.title = 'Fuera de Horario';
        }
    }

    function renderizarAlertas() {
        const alertas = [];
        const offline = brigadas.filter(b => b.estado.id === 'offline').length;
        if (offline > 3) {
            alertas.push({ tipo: 'critical', icono: 'fa-plug', color: 'text-red-400', mensaje: `${offline} brigadas OFFLINE.` });
        }
        const enEspera = brigadas.filter(b => b.estado.id === 'espera').length;
        if (enEspera > 5) {
            alertas.push({ tipo: 'warning', icono: 'fa-pause-circle', color: 'text-yellow-400', mensaje: `${enEspera} brigadas en ESPERA.` });
        }
        
        if (alertas.length === 0) {
            alertContainer.innerHTML = '<p class="text-sm text-gray-400">No hay alertas críticas.</p>';
            return;
        }
        alertContainer.innerHTML = alertas.map(a => `
            <div class="bg-gray-800 rounded-lg shadow p-3 flex items-center border-l-4 border-red-500">
                <i class="fas ${a.icono} ${a.color} fa-lg mr-3"></i>
                <span class="text-sm font-medium text-gray-200">${a.mensaje}</span>
            </div>
        `).join('');
    }

    function renderizarKPIs() {
        const costoOriginal = 184500000;
        const costoAjustado = (costoOriginal / 31) * TOTAL_BRIGADAS;
        const brigadasOffline = brigadas.filter(b => b.estado.id === 'offline').length;
        const brigadasActivas = TOTAL_BRIGADAS - brigadasOffline;
        const brigadasImproductivas = brigadas.filter(b => b.estado.id === 'espera' || b.estado.id === 'offline').length;
        const horasImproductivasSimuladas = (brigadasImproductivas * (Math.random() * 1 + 0.5)).toFixed(1);
        const tareasFinalizadas = brigadas.filter(b => b.tareaEstado.id === 'finalizada').length;
        const cumplimientoSimulado = (tareasFinalizadas / TOTAL_BRIGADAS) + (Math.random() * 0.1);

        const kpis = [
            { titulo: 'Costo Proy.', valor: `$${(costoAjustado / 1000000).toFixed(1)}M`, icono: 'fa-dollar-sign', color: 'text-blue-400' },
            { titulo: 'Operativas', valor: `${brigadasActivas}/${TOTAL_BRIGADAS}`, icono: 'fa-users', color: 'text-green-400' },
            { titulo: 'Cumplimiento', valor: `${(cumplimientoSimulado * 100).toFixed(1)}%`, icono: 'fa-check-circle', color: (cumplimientoSimulado > 0.75 ? 'text-green-400' : 'text-red-400') },
            { titulo: 'T. Improd.', valor: `${horasImproductivasSimuladas} h`, icono: 'fa-clock', color: (horasImproductivasSimuladas > 10 ? 'text-red-400' : 'text-yellow-400') }
        ];

        kpiContainer.innerHTML = kpis.map(kpi => `
            <div class="bg-gray-800 rounded-lg shadow p-4">
                <div class="flex items-center">
                    <div class="p-3 rounded-full bg-gray-700 ${kpi.color}">
                        <i class="fas ${kpi.icono} fa-lg"></i>
                    </div>
                    <div class="ml-3">
                        <h3 class="text-sm font-medium text-gray-400">${kpi.titulo}</h3>
                        <p class="text-xl font-bold text-white">${kpi.valor}</p>
                    </div>
                </div>
            </div>
        `).join('');
    }

    function renderizarMapa() {
        mapContainer.querySelectorAll('.brigade-pin').forEach(pin => pin.remove());
        brigadas.forEach(b => {
            const pinColor = b.tareaEstado.id === 'en_curso' ? 'status-tarea' : b.estado.color;
            const pinIcon  = b.tareaEstado.id === 'en_curso' ? 'fa-hard-hat' : b.estado.icon;
            const pin = document.createElement('div');
            pin.className = `brigade-pin ${pinColor}`;
            pin.id = `pin-mob-${b.id}`;
            pin.style.top  = `${b.pos.top}%`;
            pin.style.left = `${b.pos.left}%`;
            pin.innerHTML  = `<i class="fas ${pinIcon}"></i>`;
            pin.title      = `ID: ${b.id}\nEstado: ${b.estado.nombre}\nTarea: ${b.tareaEstado.nombre}`;
            mapContainer.appendChild(pin);
        });
    }

    function renderizarListaBrigadas() {
        brigadas.sort((a, b) => {
            if (a.estado.id === 'offline') return 1; if (b.estado.id === 'offline') return -1;
            if (a.estado.id === 'espera') return 1; if (b.estado.id === 'espera') return -1;
            if (a.tareaEstado.id === 'en_curso') return -1; if (b.tareaEstado.id === 'en_curso') return 1;
            return a.id.localeCompare(b.id);
        });

        brigadeListContainer.innerHTML = brigadas.map(b => {
            const bgColor = b.tareaEstado.id === 'en_curso' ? 'status-tarea' : b.estado.color;
            const icon    = b.tareaEstado.id === 'en_curso' ? 'fa-hard-hat' : b.estado.icon;
            return `
            <div class="p-4 flex items-center cursor-pointer active:bg-gray-700" onclick="seleccionarBrigada('${b.id}')">
                <div class="w-10 h-10 rounded-full ${bgColor} flex-shrink-0 flex items-center justify-center mr-4">
                    <i class="fas ${icon} text-white"></i>
                </div>
                <div class="flex-grow">
                    <div class="flex justify-between items-center">
                        <span class="font-bold text-sm text-white">${b.id} (${b.contratista})</span>
                        <span class="text-xs font-medium ${b.tareaEstado.color} font-semibold">
                            ${b.tareaEstado.nombre}
                        </span>
                    </div>
                    <p class="text-sm text-gray-400"><i class="fas fa-map-marker-alt fa-xs"></i> ${b.zona}</p>
                    <p class="text-xs text-gray-500">
                        OT: ${b.otActual} | <i class="fas ${b.bateria < 40 ? 'fa-battery-quarter text-red-500' : 'fa-battery-full text-green-500'}"></i> ${b.bateria}%
                    </p>
                </div>
                <i class="fas fa-chevron-right text-gray-600 ml-2"></i>
            </div>
        `;
        }).join('');
    }

    function renderizarPanelDetalle() {
        if (!selectedBrigadeId) return;
        const b = brigadas.find(br => br.id === selectedBrigadeId);
        if (!b) return;

        const tareaEnCurso   = b.tareaEstado.id === 'en_curso';
        const tareaPendiente = b.tareaEstado.id === 'pendiente';

        detailModalTitle.textContent = b.id;
        detailModalContent.innerHTML = `
            <div class="bg-gray-800 rounded-lg p-4">
                <h4 class="font-semibold text-gray-200">Control de Tarea (OT: ${b.otActual})</h4>
                <div class="grid grid-cols-2 gap-3 mt-3">
                    <button onclick="iniciarTarea()" class="p-3 rounded-lg font-semibold btn-start ${!tareaPendiente ? 'opacity-50' : ''}" ${!tareaPendiente ? 'disabled' : ''}>
                        <i class="fas fa-play mr-1"></i> Iniciar
                    </button>
                    <button onclick="finalizarTarea()" class="p-3 rounded-lg font-semibold btn-finish ${!tareaEnCurso ? 'opacity-50' : ''}" ${!tareaEnCurso ? 'disabled' : ''}>
                        <i class="fas fa-check mr-1"></i> Finalizar
                    </button>
                </div>
            </div>
            <div class="bg-gray-800 rounded-lg p-4 space-y-2">
                <h4 class="font-semibold text-gray-200">Cliente</h4>
                <p class="text-sm text-gray-300"><i class="fas fa-user fa-xs text-gray-500 w-4"></i> ${b.cliente}</p>
                <p class="text-sm text-gray-300"><i class="fas fa-map-marker-alt fa-xs text-gray-500 w-4"></i> ${b.direccion}</p>
            </div>
            <div class="bg-gray-800 rounded-lg p-4 space-y-2">
                <h4 class="font-semibold text-gray-200">Brigada</h4>
                <p class="text-sm text-gray-300"><i class="fas fa-hard-hat fa-xs text-gray-500 w-4"></i> ${b.instalador}</p>
                <p class="text-sm text-gray-300"><i class="fas fa-tools fa-xs text-gray-500 w-4"></i> Inventario: ${b.inventario.medidores} medidores, ${b.inventario.sellos} sellos.</p>
            </div>
            <div class="bg-gray-800 rounded-lg p-4">
                <h4 class="font-semibold text-gray-200">Control de Foto</h4>
                <button onclick="verFoto('${b.fotoURL}', 'OT: ${b.otActual}')" class="w-full p-3 mt-3 rounded-lg font-semibold btn-neutral ${tareaEnCurso ? 'opacity-50' : ''}" ${tareaEnCurso ? 'disabled' : ''}>
                    <i class="fas fa-camera mr-1"></i> Ver Foto de Instalación
                </button>
            </div>
        `;
    }

    /* ===== FUNCIONES GLOBALES PARA LOS BOTONES ===== */
    window.showPage = (pageId, tabElement) => {
        document.querySelectorAll('.page-content').forEach(page => page.classList.add('hidden'));
        document.getElementById(pageId).classList.remove('hidden');

        document.querySelectorAll('.tab-item').forEach(tab => tab.classList.remove('active'));
        tabElement.classList.add('active');
    };

    window.seleccionarBrigada = id => {
        selectedBrigadeId = id;
        renderizarPanelDetalle();
        detailModal.classList.remove('translate-x-full');
    };

    window.cerrarDetalle = () => {
        detailModal.classList.add('translate-x-full');
        selectedBrigadeId = null;
    };

    window.iniciarTarea = () => {
        const b = brigadas.find(br => br.id === selectedBrigadeId);
        if (b && b.tareaEstado.id === 'pendiente') {
            b.tareaEstado = estadoTareas.EN_CURSO;
            b.estado = estados.find(e => e.id === 'faena');
            actualizarDashboard();
        }
    };

    window.finalizarTarea = () => {
        const b = brigadas.find(br => br.id === selectedBrigadeId);
        if (b && b.tareaEstado.id === 'en_curso') {
            b.tareaEstado = estadoTareas.FINALIZADA;
            b.estado = estados.find(e => e.id === 'espera');
            b.inventario.medidores = Math.max(0, b.inventario.medidores - 1);
            actualizarDashboard();
            setTimeout(cerrarDetalle, 500);
        }
    };

    window.verFoto = (url, caption) => {
        document.getElementById('modal-image').src = url;
        document.getElementById('modal-image-caption').textContent = caption;
        photoModal.classList.remove('hidden');
    };

    window.cerrarFoto = () => {
        photoModal.classList.add('hidden');
    };
    window.logout = () => {
        // Volver a la pantalla de login
        const loginScreen = document.getElementById('login-screen');
        const appScreen   = document.getElementById('app-screen');
        loginScreen.classList.remove('hidden');
        appScreen.classList.add('hidden');

        // Limpiar campos de login (opcional)
        document.getElementById('login-user').value = '';
        document.getElementById('login-pass').value = '';
    };


    function simularMovimiento() {
        brigadas.forEach(b => {
            if (b.estado.id === 'ruta' && b.tareaEstado.id !== 'en_curso') {
                b.pos.top  += (Math.random() - 0.5) * 1;
                b.pos.left += (Math.random() - 0.5) * 1;
                b.pos.top  = Math.max(10, Math.min(90, b.pos.top));
                b.pos.left = Math.max(10, Math.min(90, b.pos.left));
                const pin = document.getElementById(`pin-mob-${b.id}`);
                if (pin) {
                    pin.style.top  = `${b.pos.top}%`;
                    pin.style.left = `${b.pos.left}%`;
                }
            }
        });
    }

    function simularCambioEstado() {
        const brigadaIndex = Math.floor(Math.random() * TOTAL_BRIGADAS);
        const brigada = brigadas[brigadaIndex];
        if (brigada.tareaEstado.id === 'en_curso') return;
        let nuevoEstado = estados[Math.floor(Math.random() * estados.length)];
        while (nuevoEstado.id === brigada.estado.id) {
            nuevoEstado = estados[Math.floor(Math.random() * estados.length)];
        }
        brigada.estado = nuevoEstado;
        if ((nuevoEstado.id === 'faena' || nuevoEstado.id === 'espera') && brigada.tareaEstado.id !== 'finalizada') {
            brigada.tareaEstado = estadoTareas.PENDIENTE;
            brigada.otActual = Math.floor(Math.random() * 5000) + 1000;
        }
        if (nuevoEstado.id === 'ruta') {
            brigada.tareaEstado = estadoTareas.PENDIENTE;
        }
        if (nuevoEstado.id === 'offline') {
            brigada.bateria = Math.floor(Math.random() * 20);
        } else {
            brigada.bateria = Math.max(brigada.bateria, 30);
        }
        renderizarListaBrigadas();
        renderizarMapa();
    }
});
