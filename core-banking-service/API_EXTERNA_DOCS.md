# Documentación API - Pagos Externos con Tarjeta

Este documento describe cómo bancos o comercios externos pueden conectarse con nuestro **Core Banking API** para verificar y realizar cobros directamente a las tarjetas de crédito emitidas por nuestra entidad.

---

## 🔗 Endpoint de Cobro

Este endpoint permite descontar saldo del límite de crédito de una tarjeta específica, validando su existencia y la cantidad de fondos disponibles.

- **URL Base Sugerida:** `https://tu-dominio.com` *(reemplazar por el dominio de producción)*
- **Ruta:** `/core/api/external/verify-and-charge`
- **Método HTTP:** `POST`
- **Content-Type:** `application/json`

---

## 📥 Estructura de la Petición (Request Body)

El cuerpo de la petición debe ser un objeto JSON con los siguientes campos obligatorios:

| Campo | Tipo | Descripción | Ejemplo |
| :--- | :--- | :--- | :--- |
| `card_number` | `String` | Número de la tarjeta de crédito de nuestro banco. Respete el formato interno con espacios si aplica. | `"5200 1234 5678 9012"` |
| `expiry_date` | `String` | Fecha de vencimiento de la tarjeta en formato `MM/YY` | `"12/28"` |
| `cvv` | `String` | Código de seguridad de la tarjeta (3 dígitos) | `"123"` |
| `amount` | `Float` | Monto total a cobrar. Debe ser mayor a 0. | `150.00` |
| `description` | `String` | *(Opcional)* Concepto descriptivo del cobro. Aparecerá en el estado de cuenta del cliente. | `"Pago por servicio online"` |

---

## 📤 Respuestas del Servidor (Responses)

La API responderá siempre con un objeto JSON indicando el estado final del intento de cobro.

### ✅ Caso de Exito (HTTP 200 OK)
Ocurre cuando la tarjeta existe, los datos son correctos y posee límite de crédito suficiente para cubrir el cobro. El monto es descontado inmediatamente.

```json
{
  "status": "approved",
  "message": "Payment successful",
  "transaction_id": 45  // ID único del movimiento en nuestra base de datos
}
```

### ❌ Caso de Error: Tarjeta Inválida (HTTP 200 OK)
Ocurre si el número de tarjeta no existe en nuestra base de datos, o si los datos de seguridad (CVV, Vencimiento) no coinciden.

```json
{
  "status": "rejected",
  "reason": "Card not found or details are incorrect"
}
```

### ❌ Caso de Error: Fondos Insuficientes (HTTP 200 OK)
Ocurre si la tarjeta existe y los datos son correctos, pero el monto solicitado (`amount`) supera el límite de crédito disponible del cliente en ese momento.

```json
{
  "status": "rejected",
  "reason": "Insufficient credit limit"
}
```

---

## 💻 Código de Ejemplo (JavaScript / Fetch)

Si el banco o comercio externo utiliza JavaScript, pueden usar este código como referencia para la integración:

```javascript
// Función asíncrona para ejecutar el cobro
async function procesarCobroExterno() {
    const url = "https://tu-dominio.com/core/api/external/verify-and-charge";
    
    // Objeto con los datos capturados del cliente
    const payload = {
        card_number: "5200 1234 5678 9012",
        expiry_date: "12/28",
        cvv: "123",
        amount: 85.50,
        description: "Cobro desde Comercio XYZ"
    };

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        // Evaluar la respuesta devuelta por nuestro banco
        if (data.status === "approved") {
            console.log("El pago fue descontado con éxito.");
            console.log("ID Transacción Interna:", data.transaction_id);
            // Marcar orden como PADA en su sistema
            
        } else if (data.status === "rejected") {
            console.error("Pago fallido:", data.reason);
            // Informar al usuario final sobre el error de fondos/tarjeta
        }
        
    } catch (error) {
        console.error("Error de comunicación con el Banco:", error);
    }
}
```
