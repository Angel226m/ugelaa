# Estrategias de Importación de Excel

## Problema
Al importar planillas desde Excel, necesitamos identificar si un empleado ya existe en el sistema para:
- Evitar duplicados
- Mantener un historial consistente
- Actualizar datos existentes

## Opciones de Identificación

### Opción 1: Solo por DNI (Recomendado si todos tienen DNI)
```
- REQUIERE: Todos los empleados en el Excel tienen DNI
- LÓGICA: Si el DNI ya existe → actualizar, si no → crear
- VENTAJAS: Identificación precisa, sin ambiguedades
- DESVENTAJAS: Fallback si alguien no tiene DNI
```

### Opción 2: Por DNI o Nombre (Combo)
```
- PRIORIDAD 1: Coincidencia exacta de DNI
- PRIORIDAD 2: Coincidencia exacta de nombres + apellidos
- LÓGICA:
  1. Buscar por DNI exacto
  2. Si no encuentra → buscar por nombres+apellidos (case insensitive)
  3. Si encuentra uno solo → usar ese registro
  4. Si encuentra múltiples → marcar conflicto para revisión manual
  5. Si no encuentra ninguno → crear nuevo
```

### Opción 3: Por Nombre completo (Sin DNI)
```
- USAR CUANDO: El Excel no tiene columna DNI
- LÓGICA: Buscar por "Apellidos Nombres" exacto
- CONSIDERACIONES: Nombres con tildes, espacios, mayúsculas pueden variar
```

## Recomendación para este proyecto

**Usar Opción 2** con el siguiente flujo:

```
Excel → Backend → ImportarHaberes

Para cada empleado en Excel:
  1. Si tiene DNI:
     - Buscar en BD por DNI exacto
     - SI existe → usar ese ID (actualizar datos si cambian)
     - SI NO existe → ir a paso 2
  2. Si no tiene DNI o no se encontró:
     - Buscar por nombres + apellidos (ignorar mayúsculas/tildes)
     - SI hay 1 resultado → usar ese ID
     - SI hay múltiples → crear nuevo (marcar "pendiente revisión")
     - SI no hay → crear nuevo registro

  3. Crear/Actualizar planilla del período (mes + año)
```

## Manejo de Conflictos

### Escenarios posibles:

| Excel | BD Existente | Acción |
|-------|--------------|--------|
| DNI: 12345678 | DNI: 12345678 | Actualizar registro, reuse ID |
| DNI: 12345678 | No existe | Crear nuevo registro |
| Sin DNI, Nombre: "Juan Perez" | "Juan Pérez" (1 resultado) | Usar ese ID (normalizar tildes) |
| Sin DNI, Nombre: "Juan Perez" | "Juan Perez", "Juan Perez Jr" (múltiples) | Crear nuevo, marcar conflicto |

## Columnas del Excel a considerar

```
Obligatorias:
- nombres (o nombre_completo)
- mes
- anio

Opcionales (usadas para matching):
- dni
- apellidos (opcional si viene en nombre_completo)

Datos de haberes/descuentos:
- ingresos: [{concepto, monto}]
- descuentos: [{concepto, monto}]
```

## Ejemplo de payload esperado

```json
{
  "mes": 5,
  "anio": 2026,
  "empleados": [
    {
      "nombre": "Juan Perez",
      "dni": "12345678",
      "cargo": "Técnico",
      "haberes": [
        {"concepto": "Sueldo Base", "monto": 2500.00},
        {"concepto": "Bonificación", "monto": 300.00}
      ],
      "descuentos": [
        {"concepto": "AFP", "monto": 250.00},
        {"concepto": "Essalud", "monto": 75.00}
      ]
    }
  ]
}
```

## Scripts de Python sugeridos

Para extraer del Excel y enviar al backend:

```python
# Option A: Por DNI
def identificar_empleado(row):
    if row.get('dni'):
        return {"buscar_por": "dni", "valor": row['dni']}
    return {"buscar_por": "nombre", "valor": row['nombres']}

# Option B: Combo con prioridad
def identificar_empleado(row):
    if row.get('dni'):
        return {"prioridad": "dni", "dni": row['dni'], "nombre": row.get('nombres', '')}
    return {"prioridad": "nombre", "nombre": row['nombres']}
```

## Estado actual del sistema

- Backend tiene `ImportarHaberes` en handlers.go:574
- Solo busca por nombre, no maneja el caso de múltiples resultados
- No tiene lógica de "crear solo si no existe"

## Próximos pasos sugeridos

1. [ ] Modificar `ImportarHaberes` para buscar primero por DNI
2. [ ] Si no tiene DNI, buscar por nombres+apellidos
3. [ ] Manejar caso de múltiples resultados (devolver warning)
4. [ ] Agregar endpoint para resolver conflictos manualmente
5. [ ] Agregar logging de qué empleados se crearon vs actualizaron