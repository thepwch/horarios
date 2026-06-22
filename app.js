// 1. Importamos Firebase directamente desde internet
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

// 2. PEGA TU CONFIGURACIÓN AQUÍ (Reemplaza este bloque con el tuyo)
const firebaseConfig = {
  apiKey: "AIzaSyBjWow7Mhbw00VvnILjDFObBJX059_ANro",
  authDomain: "horariosbd.firebaseapp.com",
  projectId: "horariosbd",
  storageBucket: "horariosbd.firebasestorage.app",
  messagingSenderId: "764174890234",
  appId: "1:764174890234:web:fad07ee9f7cd5214dbc543"
};

// ... (Tus imports y firebaseConfig de Firebase se quedan igualitos arriba) ...

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Definición de los bloques horarios de la app
const bloquesHorarios = [
    "Despertar", "09:00", "10:00", "11:00", "12:00", 
    "13:00", "14:00", "15:00", "16:00", "17:00", 
    "18:00", "19:00", "20:00", "21:00", "Dormir"
];

// Nombres de los días a procesar (De Lunes a Sábado según la especificación)
const diasSemana = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

// Variable global para controlar en qué semana está parado el usuario (Ej: "2026-W25")
//let semanaActualId = "2026-W25"; 

// Variable para saber la fecha exacta que el usuario está mirando en pantalla
let fechaActualVista = new Date(); // Inicia con el día de hoy
let semanaActualId = ""; // Se calculará automáticamente

// --- REQUISITO FUNCIONAL: LÓGICA DE PLANTILLAS ---

// Genera la configuración limpia de un día en base a la plantilla seleccionada
function obtenerDatosPlantilla(tipoPlantilla) {
    let delDia = {};
    
    if (tipoPlantilla === "Miraflores") {
        bloquesHorarios.forEach(bloque => {
            // Oli siempre en Miraflores (M)
            // Flor de 12:00 a 21:00 (F)
            let esHoraFlor = (bloque !== "Despertar" && bloque !== "Dormir" && parseInt(bloque) >= 12 && parseInt(bloque) <= 21);
            delDia[bloque] = {
                oli: "M",
                flor: esHoraFlor ? "F" : ""
            };
        });
    } else if (tipoPlantilla === "Guarangos") {
        bloquesHorarios.forEach(bloque => {
            let configOli = "G"; // Por defecto Guarangos
            if (bloque === "Despertar" || bloque === "09:00" || bloque === "20:00" || bloque === "21:00" || bloque === "Dormir") {
                configOli = "M"; // Miraflores en extremos del día
            }
            
            // Flor de 09:00 a 18:00 (F)
            let esHoraFlor = (bloque !== "Despertar" && bloque !== "Dormir" && parseInt(bloque) >= 9 && parseInt(bloque) <= 18);
            delDia[bloque] = {
                oli: configOli,
                flor: esHoraFlor ? "F" : ""
            };
        });
    }
    return delDia;
}

// --- GENERACIÓN DE NUEVAS SEMANAS POR DEFECTO ---
function generarSemanaPorDefecto() {
    let estructuraSemana = {};
    diasSemana.forEach(dia => {
        // Miércoles va a Guarangos, el resto a Miraflores por defecto
        if (dia === "Miércoles") {
            estructuraSemana[dia] = { plantilla: "Guarangos", bloques: obtenerDatosPlantilla("Guarangos"), comentarios: "" };
        } else {
            estructuraSemana[dia] = { plantilla: "Miraflores", bloques: obtenerDatosPlantilla("Miraflores"), comentarios: "" };
        }
    });
    return estructuraSemana;
}

function renderizarTabla(datosSemana) {
    const headerDias = document.getElementById('headerDias');
    const subHeaderEntidades = document.getElementById('subHeaderEntidades');
    const tableBody = document.getElementById('tableBody');

    // Limpiamos contenido anterior
    headerDias.innerHTML = '<th class="sticky-col"></th>';
    subHeaderEntidades.innerHTML = '<td class="sticky-col"></td>';
    tableBody.innerHTML = '';

    let fechaLunes = obtenerLunes(fechaActualVista);

    const nombresCortos = {
        "Lunes": "Lun", "Martes": "Mar", "Miércoles": "Mie",
        "Jueves": "Jue", "Viernes": "Vie", "Sábado": "Sab"
    };

    // 1. Crear columnas de los días (Con raya separadora fin-dia)
    diasSemana.forEach((dia, index) => {
        let fechaDelDia = new Date(fechaLunes);
        fechaDelDia.setDate(fechaLunes.getDate() + index);
        
        let tituloDia = `${nombresCortos[dia]} ${fechaDelDia.getDate()}`;

        // El th del día tiene la clase 'fin-dia'
        headerDias.innerHTML += `<th colspan="2" class="dia-header fin-dia" style="cursor:pointer;" onclick="abrirModalEdicion('${dia}')">${tituloDia}</th>`;
        
        // Reducimos "Oli" y "Flor" a "O" y "F" para ganar espacio
        subHeaderEntidades.innerHTML += `<td>O</td><td class="fin-dia">F</td>`;
    });

    // 2. Crear filas de horarios
    bloquesHorarios.forEach(bloque => {
        let filaHTML = `<tr><td class="sticky-col">${bloque}</td>`;
        
        diasSemana.forEach(dia => {
            let dataBloque = datosSemana[dia].bloques[bloque] || { oli: "", flor: "" };
            
            let claseOli = dataBloque.oli ? `celda-${dataBloque.oli.toLowerCase()}` : '';
            // A Flor SIEMPRE le ponemos la clase fin-dia para dibujar la línea blanca
            let claseFlor = dataBloque.flor ? `celda-${dataBloque.flor.toLowerCase()} fin-dia` : 'fin-dia';

            filaHTML += `<td class="${claseOli}">${dataBloque.oli}</td>`;
            filaHTML += `<td class="${claseFlor}">${dataBloque.flor}</td>`;
        });

        filaHTML += `</tr>`;
        tableBody.innerHTML += filaHTML;
    });

    // Mostrar comentarios abajo
    const listaComentarios = document.getElementById('listaComentarios');
    listaComentarios.innerHTML = ''; 
    let hayComentarios = false;

    diasSemana.forEach(dia => {
        let comentario = datosSemana[dia].comentarios;
        if (comentario && comentario.trim() !== "") {
            hayComentarios = true;
            listaComentarios.innerHTML += `<p style="margin: 5px 0;"><strong>${dia}:</strong> ${comentario}</p>`;
        }
    });

    if (!hayComentarios) {
        listaComentarios.innerHTML = '<p style="color: #999; margin: 5px 0; font-size:13px;"><em>No hay notas guardadas.</em></p>';
    }
}

// Inicialización de prueba en local
//const semanaDePrueba = generarSemanaPorDefecto();
//renderizarTabla(semanaDePrueba);

// Declaramos la variable global para que el sistema la reconozca
let semanaDePrueba = {};

// --- INICIALIZACIÓN DE LA APLICACIÓN ---
// --- INICIALIZACIÓN DE LA APLICACIÓN (CORREGIDA) ---
window.inicializarApp = async function() {
    let lunes = obtenerLunes(fechaActualVista);
    semanaActualId = generarIdSemana(lunes);
    actualizarTituloWeb(lunes);

    try {
        const semanaRef = doc(db, "semanas", semanaActualId);
        const docSnap = await getDoc(semanaRef);

        // 1. Siempre empezamos armando la semana por defecto perfecta
        semanaDePrueba = generarSemanaPorDefecto();

        // 2. Si encontramos datos en la nube, "planchamos" esos cambios encima
        if (docSnap.exists()) {
            let datosGuardados = docSnap.data();
            for (let dia in datosGuardados) {
                semanaDePrueba[dia] = datosGuardados[dia];
            }
            console.log("Datos de la nube combinados con éxito.");
        }
        
        renderizarTabla(semanaDePrueba);
        
    } catch (error) {
        console.error("Error al conectar:", error);
        semanaDePrueba = generarSemanaPorDefecto();
        renderizarTabla(semanaDePrueba);
    }
};
// Ejecutamos la función apenas cargue la página
//inicializarApp();

// Variable para saber qué día estamos editando actualmente
let diaSeleccionado = "";
// Usaremos la variable global semanaDePrueba que ya tienes creada para guardar los datos en memoria

// Llenar los campos de selección con los horarios (Incluye Despertar y Dormir)
const cargarDesplegables = () => {
    const selects = ['oliDesde', 'oliHasta', 'florIngreso'];
    selects.forEach(id => {
        const select = document.getElementById(id);
        select.innerHTML = ''; // Limpiamos primero
        bloquesHorarios.forEach(bloque => {
            select.innerHTML += `<option value="${bloque}">${bloque}</option>`;
        });
    });
};
cargarDesplegables(); // Se ejecuta al abrir la app

// Cerrar el modal al hacer clic afuera de la caja blanca
window.addEventListener('click', function(event) {
    let modal = document.getElementById('editModal');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
});

// --- LÓGICA DE ANIMACIÓN DEL MODAL ---
window.abrirModalEdicion = function(dia) {
    diaSeleccionado = dia;
    document.getElementById('modalTitle').innerText = `Editar: ${dia}`;
    document.getElementById('comentariosDia').value = semanaDePrueba[dia].comentarios || "";
    
    let modal = document.getElementById('editModal');
    modal.style.display = 'block'; // Lo mostramos en el DOM
    
    // Un pequeño retraso para que el navegador aplique la transición CSS
    setTimeout(() => {
        modal.classList.add('show');
    }, 10);
};

// Función maestra para cerrar con animación
function cerrarModalAnimado() {
    let modal = document.getElementById('editModal');
    modal.classList.remove('show'); // Dispara la animación de bajada
    
    // Esperamos a que baje antes de ocultarlo completamente
    setTimeout(() => {
        modal.style.display = 'none';
    }, 300);
}

// Cerrar tocando la X o el botón de guardar
document.getElementById('closeModal').addEventListener('click', cerrarModalAnimado);

// Cerrar tocando el fondo oscuro
document.getElementById('modalOverlay').addEventListener('click', cerrarModalAnimado);

// (Asegúrate de cambiar en tu función guardarDiaEnFirebase() la línea que dice 
// document.getElementById('editModal').style.display = 'none'; 
// por: cerrarModalAnimado(); para que también se cierre con estilo).

// 2. LÓGICA V2: Aplicar bloque de horas a Oli (Actualizado para Desplegables)
window.aplicarBloqueOli = function() {
    let desdeVal = document.getElementById('oliDesde').value;
    let hastaVal = document.getElementById('oliHasta').value;
    let ubiSeleccionada = document.querySelector('input[name="oliUbicacion"]:checked').value;
    
    // Buscamos en qué posición de la lista están las horas seleccionadas
    let idxDesde = bloquesHorarios.indexOf(desdeVal);
    let idxHasta = bloquesHorarios.indexOf(hastaVal);
    
    if (idxDesde > idxHasta) return alert("La hora de inicio debe ser antes que la hora de fin.");
    
    bloquesHorarios.forEach((bloque, idx) => {
        // Pintamos todo lo que esté entre el índice de inicio y el índice de fin
        if (idx >= idxDesde && idx <= idxHasta) {
            semanaDePrueba[diaSeleccionado].bloques[bloque].oli = ubiSeleccionada;
        }
    });
    
    renderizarTabla(semanaDePrueba);
    alert(`Ubicación aplicada de ${desdeVal} a ${hastaVal}.`);
};

// 3. LÓGICA V2: Calcular 9 horas automáticas de Flor (Actualizado para Desplegables)
window.aplicarTurnoFlor = function() {
    let horaIngreso = document.getElementById('florIngreso').value;
    let idxIngreso = bloquesHorarios.indexOf(horaIngreso);
    let horasAsignadas = 0;
    
    bloquesHorarios.forEach((bloque, idx) => {
        // Flor nunca está en Despertar ni Dormir
        if (bloque === "Despertar" || bloque === "Dormir") {
            semanaDePrueba[diaSeleccionado].bloques[bloque].flor = "";
            return;
        }
        
        // Si el bloque actual es igual o posterior a la hora de ingreso y van menos de 9 horas
        if (idx >= idxIngreso && horasAsignadas < 9) {
            semanaDePrueba[diaSeleccionado].bloques[bloque].flor = "F";
            horasAsignadas++;
        } else {
            semanaDePrueba[diaSeleccionado].bloques[bloque].flor = ""; // Borramos el resto
        }
    });
    
    renderizarTabla(semanaDePrueba);
    alert(`Turno de 9 horas para Flor calculado desde ${horaIngreso}.`);
};

// 4. GUARDAR EN BASE DE DATOS (FIREBASE)
// 4. GUARDAR EN BASE DE DATOS (FIREBASE CORREGIDO)
window.guardarDiaEnFirebase = async function() {
    try {
        // Guardamos el comentario escrito
        semanaDePrueba[diaSeleccionado].comentarios = document.getElementById('comentariosDia').value;
        
        const semanaRef = doc(db, "semanas", semanaActualId);
        
        // Ahora guardamos TODA la estructura de la semana completa en un solo bloque
        await setDoc(semanaRef, semanaDePrueba);
        
        alert(`¡Excelente! Los horarios guardados correctamente.`);
        document.getElementById('editModal').style.display = 'none'; // Cerramos el panel
        
    } catch (error) {
        console.error("Error guardando datos:", error);
        alert("Hubo un error al conectar con la base de datos.");
    }
};

// --- MOTOR DE NAVEGACIÓN TEMPORAL ---

// 1. Función para encontrar siempre el Lunes de la semana que estamos viendo
function obtenerLunes(fecha) {
    let d = new Date(fecha);
    let dia = d.getDay(); // 0 es domingo, 1 es lunes...
    let diff = d.getDate() - dia + (dia === 0 ? -6 : 1); // Ajuste matemático
    return new Date(d.setDate(diff));
}

// 2. Función para crear un ID único para Firebase basado en el Lunes (Ej: "semana_2026-05-11")
function generarIdSemana(fechaLunes) {
    let anio = fechaLunes.getFullYear();
    let mes = String(fechaLunes.getMonth() + 1).padStart(2, '0');
    let dia = String(fechaLunes.getDate()).padStart(2, '0');
    return `semana_${anio}-${mes}-${dia}`;
}

// 3. Función para cambiar el título grande de la pantalla
function actualizarTituloWeb(fechaLunes) {
    let fechaDomingo = new Date(fechaLunes);
    fechaDomingo.setDate(fechaDomingo.getDate() + 6); // Le sumamos 6 días al lunes

    const opciones = { month: 'long' };
    let mesLunes = fechaLunes.toLocaleDateString('es-ES', opciones);
    let mesDomingo = fechaDomingo.toLocaleDateString('es-ES', opciones);

    // Si la semana cruza de un mes a otro (Ej: 28 Mayo al 3 Junio)
    let texto = `Semana del ${fechaLunes.getDate()} `;
    if (mesLunes !== mesDomingo) texto += `de ${mesLunes} `;
    texto += `al ${fechaDomingo.getDate()} de ${mesDomingo}`;

    document.getElementById('weekTitle').innerText = texto;
}

// --- INICIALIZACIÓN DE LA APLICACIÓN (ACTUALIZADA) ---
window.inicializarApp = async function() {
    // A. Calculamos el lunes y actualizamos el ID y el título
    let lunes = obtenerLunes(fechaActualVista);
    semanaActualId = generarIdSemana(lunes);
    actualizarTituloWeb(lunes);

    try {
        const semanaRef = doc(db, "semanas", semanaActualId);
        const docSnap = await getDoc(semanaRef);

        if (docSnap.exists()) {
            semanaDePrueba = docSnap.data();
        } else {
            semanaDePrueba = generarSemanaPorDefecto();
        }
        
        renderizarTabla(semanaDePrueba);
        
    } catch (error) {
        console.error("Error al conectar:", error);
        semanaDePrueba = generarSemanaPorDefecto();
        renderizarTabla(semanaDePrueba);
    }
};

// --- EVENTOS DE LOS BOTONES < y > ---
document.getElementById('prevWeek').addEventListener('click', () => {
    fechaActualVista.setDate(fechaActualVista.getDate() - 7); // Retrocedemos 7 días
    inicializarApp(); // Volvemos a consultar a la base de datos
});

document.getElementById('nextWeek').addEventListener('click', () => {
    fechaActualVista.setDate(fechaActualVista.getDate() + 7); // Avanzamos 7 días
    inicializarApp(); // Volvemos a consultar a la base de datos
});

// Ejecutamos la función apenas cargue la página
inicializarApp();