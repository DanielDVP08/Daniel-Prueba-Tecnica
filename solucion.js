/**
 * Calcula una secuencia de producción válida que respeta las dependencias de las órdenes.
 *
 * Esta función utiliza el algoritmo de Kahn para realizar un ordenamiento topológico
 * del grafo de dependencias de las órdenes.
 *
 * @param {Array<Object>} ordenes Una lista de objetos, donde cada objeto
 * representa una orden con 'id', 'duracion' y 'dependencia'.
 * @returns {Array<string>} Una lista de 'id' de órdenes en una secuencia de ejecución válida.
 * @throws {Error} Si se detecta una dependencia circular en las órdenes,
 * lo que hace imposible un plan de producción.
 */
function planificarProduccion(ordenes) {
  // Caso borde: si no hay órdenes, no hay plan.
  if (!ordenes || ordenes.length === 0) {
    return [];
  }

  // --- Paso 1: Construir el grafo de dependencias y contar las dependencias entrantes (in-degree) ---
  const adjList = new Map();
  const inDegree = new Map();
  const ordenIds = new Set(ordenes.map((o) => o.id));

  for (const orden of ordenes) {
    inDegree.set(orden.id, 0);
    adjList.set(orden.id, []);
  }

  for (const orden of ordenes) {
    const { id, dependencia } = orden;
    if (dependencia) {
      // Validar que la dependencia exista en la lista de órdenes
      if (!ordenIds.has(dependencia)) {
        throw new Error(
          `La dependencia '${dependencia}' para la orden '${id}' no existe.`
        );
      }

      // La orden 'dependencia' debe completarse antes que la orden 'id'
      adjList.get(dependencia).push(id);
      inDegree.set(id, inDegree.get(id) + 1);
    }
  }

  // --- Paso 2: Encontrar todas las órdenes sin dependencias iniciales ---
  const queue = [];
  for (const [id, degree] of inDegree.entries()) {
    if (degree === 0) {
      queue.push(id);
    }
  }

  const planFinal = [];

  // --- Paso 3: Procesar las órdenes ---
  while (queue.length > 0) {
    // Tomar una orden sin dependencias pendientes (shift es O(n), pero aceptable para este contexto)
    const ordenActualId = queue.shift();
    planFinal.push(ordenActualId);

    // "Eliminar" esta orden del grafo, reduciendo el in-degree de sus vecinas
    const ordenesSiguientes = adjList.get(ordenActualId);
    if (ordenesSiguientes) {
      for (const ordenSiguienteId of ordenesSiguientes) {
        inDegree.set(ordenSiguienteId, inDegree.get(ordenSiguienteId) - 1);
        // Si una orden vecina ya no tiene dependencias, añadirla a la cola
        if (inDegree.get(ordenSiguienteId) === 0) {
          queue.push(ordenSiguienteId);
        }
      }
    }
  }

  // --- Paso 4: Validar el resultado ---
  // Si el plan final no incluye todas las órdenes, debe haber un ciclo.
  if (planFinal.length === ordenes.length) {
    return planFinal;
  } else {
    throw new Error(
      "Dependencia circular detectada. No se puede generar un plan de producción válido."
    );
  }
}

module.exports = { planificarProduccion };