import collections

def planificarProduccion(ordenes):
    # Caso borde: si no hay órdenes, no hay plan.
    if not ordenes:
        return []

    # --- Paso 1: Construir el grafo de dependencias y contar las dependencias entrantes (in-degree) ---
    adj_list = collections.defaultdict(list)
    in_degree = {orden['id']: 0 for orden in ordenes}

    # print(f"Grado de entrada (in-degree): {in_degree}")

    # Mapeo de IDs para asegurar que las dependencias existan.
    orden_ids = set(in_degree.keys())
    # print(f"IDs de órdenes: {orden_ids}")

    for orden in ordenes:
        dep = orden.get('dependencia')
        if dep:
            # Validar que la dependencia exista en la lista de órdenes
            if dep not in orden_ids:
                raise ValueError(f"La dependencia '{dep}' para la orden '{orden['id']}' no existe.")

            # La orden 'dep' debe completarse antes que 'orden['id']'
            adj_list[dep].append(orden['id'])
            in_degree[orden['id']] += 1
            # print(f"Actualizando lista de adyacencia: {adj_list}")
            # print(f"Grado de entrada (in-degree): {in_degree}")

    # --- Paso 2: Encontrar todas las órdenes sin dependencias iniciales ---
    # Se utiliza un deque para una mayor eficiencia en las operaciones popleft (O(1))
    queue = collections.deque([orden_id for orden_id, degree in in_degree.items() if degree == 0])
    # print(f"Órdenes sin dependencias iniciales: {list(queue)}")

    plan_final = []

    # --- Paso 3: Procesar las órdenes ---
    while queue:
        # Tomar una orden sin dependencias pendientes
        orden_actual_id = queue.popleft()
        # print(f"Procesando orden: {orden_actual_id}")
        plan_final.append(orden_actual_id)
        # print(f"Plan actual: {plan_final}")

        # "Eliminar" esta orden del grafo, reduciendo el in-degree de sus vecinas
        if orden_actual_id in adj_list:
            for orden_siguiente_id in adj_list[orden_actual_id]:
                in_degree[orden_siguiente_id] -= 1
                # Si una orden vecina ya no tiene dependencias, añadirla a la cola
                if in_degree[orden_siguiente_id] == 0:
                    queue.append(orden_siguiente_id)

    # --- Paso 4: Validar el resultado ---
    # Si el plan final no incluye todas las órdenes, debe haber un ciclo.
    if len(plan_final) == len(ordenes):
        return plan_final
    else:
        raise ValueError("Dependencia circular detectada. No se puede generar un plan de producción válido.")



