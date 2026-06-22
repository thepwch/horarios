// Arreglo base de horas del día
const bloquesHorarios = [
    "Despertar", "09:00", "10:00", "11:00", "12:00", 
    "13:00", "14:00", "15:00", "16:00", "17:00", 
    "18:00", "19:00", "20:00", "21:00", "Dormir"
];

// Requisito Funcional: Turno automático de 9 horas para Flor
function aplicarTurnoFlor() {
    const horaIngresoStr = document.getElementById('florStartTime').value; 
    if(!horaIngresoStr) return;

    const horaIngreso = parseInt(horaIngresoStr.split(":")[0]); // Extrae la hora (ej. 12)
    
    // Calcula los bloques que serán marcados como "F" (9 horas consecutivas)
    let bloquesAsignados = 0;
    bloquesHorarios.forEach(bloque => {
        if(bloque === "Despertar" || bloque === "Dormir") return;
        
        let horaBloque = parseInt(bloque.split(":")[0]);
        if (horaBloque >= horaIngreso && bloquesAsignados < 9) {
            console.log(`Marcando ${bloque} como F (Presente)`);
            bloquesAsignados++;
            // Aquí iría el código para pintar la celda de HTML y guardar en el objeto de la base de datos
        }
    });

    alert(`Turno de 9 horas aplicado desde las ${horaIngresoStr}`);
}

// Lógica para abrir/cerrar modal al tocar una columna
document.getElementById('closeModal').addEventListener('click', () => {
    document.getElementById('editModal').style.display = 'none';
});