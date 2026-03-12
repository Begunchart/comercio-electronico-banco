# Documentación de APIs del Proyecto

Este documento contiene la lista de todos los endpoints de la aplicación clasificados por microservicio (`auth-service` y `core-banking-service`), junto con el formato JSON esperado y/o devuelto para cada uno de ellos.

---

## 🔐 Auth Service (Servicio de Autenticación)

### `POST /register`
Registra un nuevo usuario en el sistema.
**Body (JSON):**
```json
{
  "username": "usuario_ejemplo",
  "full_name": "Juan Perez",
  "password": "mipasswordseguro",
  "role": "client",
  "cedula": "12345678",
  "phone": "04121234567"
}
```
**Respuesta (JSON):**
```json
{
  "id": 1,
  "username": "usuario_ejemplo",
  "full_name": "Juan Perez",
  "role": "client",
  "cedula": "12345678",
  "phone": "04121234567"
}
```

### `POST /login`
Inicia sesión y genera un token JWT.
**Body (`application/x-www-form-urlencoded` - OJO: No es JSON):**
```text
username=usuario_ejemplo&password=mipasswordseguro
```
**Respuesta (JSON):**
```json
{
  "access_token": "eyJhbGciOi...",
  "token_type": "bearer"
}
```

### `GET /users/me`
Devuelve la información del usuario autenticado. *(Requiere token Bearer)*.
**Respuesta (JSON):**
```json
{
  "id": 1,
  "username": "usuario_ejemplo",
  "full_name": "Juan Perez",
  "role": "client",
  "cedula": "12345678",
  "phone": "04121234567"
}
```

### `GET /users/search?cedula=XXX`
Busca un usuario por cédula. *(Requiere rol Staff/Admin)*.
**Params:** `?cedula=12345678`
**Respuesta (JSON):** Objeto de usuario (igual a `GET /users/me`).

### `POST /admin/create-staff`
Crea un usuario administrador/staff. *(Solo admisible por un `admin`)*.
**Body (JSON):**
```json
{
  "username": "nuevo_cajero",
  "full_name": "María Gómez",
  "password": "passwordstaff",
  "role": "teller",  // o "customer_service"
  "cedula": "87654321",
  "phone": "04141231234"
}
```

---

## 🏦 Core Banking Service (Servicio Bancario Core)

*Nota: La mayoría de estos endpoints requieren el token JWT en el Header: `Authorization: Bearer <token>`.*

### `POST /accounts`
Crea una cuenta bancaria para el usuario autenticado automáticamente si no tiene una.
**Respuesta (JSON):**
```json
{
  "id": 1,
  "user_id": 1,
  "account_number": "1847192847",
  "balance": 0.0
}
```

### `GET /accounts/me`
Obtiene los detalles de la cuenta del usuario actual.
**Respuesta (JSON):**
```json
{
  "id": 1,
  "user_id": 1,
  "account_number": "1847192847",
  "balance": 1500.50
}
```

### `POST /cards`
Emite una nueva tarjeta de crédito (o débito) aleatoria para el usuario autenticado.
**Respuesta (JSON):**
```json
{
  "card_number": "5200 1234 5678 9012",
  "expiry": "11/28",
  "cvv": "456",
  "credit_limit": 5000.0
}
```

### `GET /cards/me`
Lista las tarjetas asignadas al usuario.
**Respuesta (JSON):**
```json
[
  {
    "card_number": "5200 1234 5678 9012",
    "expiry": "11/28",
    "cvv": "456",
    "credit_limit": 5000.0
  }
]
```

### `POST /beneficiaries`
Agrega un nuevo beneficiario para transferencias.
**Body (JSON):**
```json
{
  "name": "Pedro Martinez",
  "account_number": "00010002131234567890",
  "alias": "Pedro Trabajo",
  "cedula": "11222333",
  "phone": "04121112233"
}
```

### `GET /beneficiaries`
Devuelve los beneficiarios del usuario autenticado.
**Respuesta (JSON):**
```json
[
  {
    "id": 1,
    "name": "Pedro Martinez",
    "account_number": "00010002131234567890",
    "alias": "Pedro Trabajo",
    "bank_name": "Banco Externo",
    "cedula": "11222333",
    "phone": "04121112233"
  }
]
```

### `POST /transfer`
Permite transferir fondos de la cuenta del usuario autenticado a otra cuenta.
**Body (JSON):**
```json
{
  "to_account_number": "3928174829",
  "beneficiary_cedula": "11222333",
  "beneficiary_phone": "04121112233",
  "amount": 100.50,
  "description": "Pago mensualidad",
  "beneficiary_name": "Pedro Martinez"
}
```
**Respuesta (JSON):**
```json
{
  "message": "Transfer successful",
  "new_balance": 1400.00
}
```

### `GET /movements`
Obtiene la lista de movimientos o histórico de transacciones del usuario.
**Respuesta (JSON):**
```json
[
  {
    "id": 105,
    "amount": -100.50,
    "transaction_type": "transfer_out",
    "description": "Transfer to 3928174829 - Pago mensualidad",
    "timestamp": "2026-03-11T12:00:00.000000"
  }
]
```

### `GET /notifications`
Obtiene las notificaciones (ej: transferencias recibidas) del usuario.
**Respuesta (JSON):**
```json
[
  {
    "id": 12,
    "title": "Transferencia Recibida",
    "message": "Has recibido $100.50 de la cuenta 1847192847.",
    "timestamp": "2026-03-11T12:05:00.000000",
    "is_read": 0
  }
]
```

### `PUT /notifications/read-all`
Marca todas las notificaciones del usuario como leídas.
**Respuesta (JSON):**
```json
{
  "message": "Marked all as read"
}
```

### `POST /payments/card`
Procesa el cobro de una tarjeta (nuestra o externa) hacia una cuenta de nuestro banco.
**Body (JSON):**
```json
{
  "card_number": "5200 1234 5678 9012",
  "expiry": "11/28",
  "cvv": "456",
  "amount": 200.0,
  "description": "Compra en la tienda",
  "destination_account": "1847192847",
  "bank_identifier": "creditbank" 
}
```

### `POST /external/transfer-in`
Endpoint webhook para que bancos externos transfieran dinero o aprueben transacciones a cuentas locales.
**Body (JSON):**
```json
{
  "amount": 500.00,
  "target_account_number": "1847192847",
  "external_bank_name": "Cienspay",
  "external_card_number": "4111 1111 1111 1111",
  "description": "Transferencia Externa"
}
```

### `POST /api/external/verify-and-charge`
Valida y deduce saldo de una tarjeta de crédito interna a petición de un banco externo.
**Body (JSON):**
```json
{
  "card_number": "5200 1234 5678 9012",
  "expiry_date": "11/28",
  "cvv": "456",
  "amount": 50.0,
  "description": "Cobro externo en negocio X"
}
```
**Respuesta (JSON):**
```json
{
  "status": "approved",
  "message": "Payment successful",
  "transaction_id": 54
}
```

### `POST /admin/mint-money`
Agrega dinero (depósito artificial) a una cuenta bancaria (roles permitidos: admin/teller/client).
**Body (JSON):**
```json
{
  "account_number": "1847192847",
  "amount": 1000.00
}
```
**Respuesta (JSON):**
```json
{
  "message": "Money printed successfully",
  "new_balance": 2500.50
}
```
