// 1. Importamos Firebase directamente desde internet
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

// 2. PEGA TU CONFIGURACIÓN AQUÍ (Reemplaza este bloque con el tuyo)
const firebaseConfig = {
  apiKey: "AIzaSyBjWow7Mhbw00VvnILjDFObBJX059_ANro",
  authDomain: "horariosbd.firebaseapp.com",
  projectId: "horariosbd",
  storageBucket: "horariosbd.firebasestorage.app",
  messagingSenderId: "764174890234",
  appId: "1:764174890234:web:fad07ee9f7cd5214dbc543"
};

// 3. Inicializamos la App y la Base de Datos
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 4. FUNCIÓN DE PRUEBA: Guardar un dato
async function guardarTurnoPrueba() {
    try {
        // "horarios" es el nombre de tu tabla en la base de datos
        const docRef = await addDoc(collection(db, "horarios"), {
            dia: "Lunes 15",
            horaIngresoFlor: "12:00",
            comentarios: "Prueba desde mi PC"
        });
        console.log("¡Dato guardado con el ID: ", docRef.id);
        alert("¡Base de datos conectada y dato guardado!");
    } catch (e) {
        console.error("Error al guardar: ", e);
    }
}

// 5. FUNCIÓN DE PRUEBA: Leer los datos
async function leerDatos() {
    const querySnapshot = await getDocs(collection(db, "horarios"));
    querySnapshot.forEach((doc) => {
        console.log("Dato recuperado:", doc.id, " => ", doc.data());
    });
}

// Ejecutamos la función para probar
guardarTurnoPrueba();