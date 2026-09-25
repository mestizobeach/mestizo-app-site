# Mestizo · Pedidos

PWA móvil y local para preparar los pedidos semanales de Mestizo y abrir WhatsApp con el mensaje de cada proveedor ya redactado.

## Qué incluye

- Pedido semanal por proveedor con controles grandes `+` / `−`.
- Los productos con cantidad cero nunca aparecen en el resumen ni en WhatsApp.
- Revisión antes de abrir WhatsApp; el envío siempre lo confirma la persona en WhatsApp.
- Historial local de los últimos 50 pedidos, guardado automáticamente al abrir WhatsApp, y repetición en un toque. Cada proveedor enviado desaparece de la revisión y sus cantidades vuelven a cero.
- Alta, edición, eliminación y ordenación de proveedores y productos.
- PIN de acceso local, funcionamiento sin conexión e instalación en la pantalla de inicio.
- Catálogo inicial de 6 distribuidores y 45 productos importado del documento operativo de Mestizo.

No incluye stock, facturas, roles de personal ni automatización de WhatsApp Business.

## Puesta en marcha local

No necesita instalar dependencias. Por seguridad del navegador, debe servirse por HTTP (no abrir `index.html` directamente):

```bash
python3 -m http.server 4173
```

Abrir `http://localhost:4173`. En el primer acceso se crea un PIN de 4 a 8 cifras.

## Uso

1. En **Editar**, añadir el teléfono de cada distribuidor. Debe incluir prefijo de país sin `+` ni espacios, por ejemplo `34600111222`. El documento de origen no incluía teléfonos, por lo que se muestran como pendientes.
2. En **Pedido**, ajustar las cajas. Solo se incluyen las cantidades mayores que cero.
3. Pulsar **Revisar pedido** y después **Abrir WhatsApp** para cada proveedor.
4. Revisar el mensaje y pulsar Enviar dentro de WhatsApp.
5. El pedido queda guardado automáticamente en el historial al abrir WhatsApp y se puede repetir más adelante.

## Datos y privacidad

Todos los datos viven en `localStorage` del navegador del dispositivo:

```text
AppState
├── pinHash: SHA-256 del PIN
├── suppliers[]
│   ├── id, name, phone
│   └── products[]: id, name, unit
├── quantities: { productId: número }
└── history[]
    ├── id, date
    └── groups[]: copia del proveedor y sus líneas de pedido
```

El PIN es una barrera práctica contra el acceso casual en un teléfono compartido; no sustituye la seguridad del bloqueo del dispositivo. La URL publicada puede ser pública, pero no contiene los datos del negocio. Borrar los datos del navegador o usar otro teléfono crea una instalación nueva. Esta elección es intencionada para el MVP de una sola persona y evita almacenar información en un servidor.

Para una futura sincronización entre dispositivos conviene migrar la persistencia a un servicio con autenticación (por ejemplo, Supabase), manteniendo el mismo modelo de datos.

## Comportamiento de WhatsApp

La app genera una URL `https://wa.me/<telefono>?text=<mensaje>` y abre WhatsApp (o WhatsApp Web). El mensaje contiene únicamente los productos del proveedor con cantidad mayor que cero. La app **no envía** el mensaje ni usa la API de WhatsApp Business.

## Despliegue

Es un sitio estático. Puede publicarse en GitHub Pages, Netlify, Cloudflare Pages o cualquier servidor HTTPS. HTTPS es necesario para que el service worker y la instalación PWA funcionen fuera de `localhost`.

### GitHub Pages

1. En el repositorio, abrir **Settings → Pages**.
2. Elegir **Deploy from a branch**.
3. Seleccionar la rama `main` y la carpeta `/ (root)`.

Nota: GitHub Pages no restringe el acceso por el hecho de que el repositorio sea privado. La protección del MVP es el PIN local y el bloqueo del dispositivo. Si se necesita una URL privada con control de identidad, publicar detrás de Cloudflare Access o añadir autenticación con backend.

## Verificación

Ejecutar:

```bash
python3 -m unittest discover -s tests -v
```

Además, se debe comprobar en un móvil: crear PIN, editar un proveedor, preparar un pedido, revisar que no aparecen cantidades cero, abrir WhatsApp, guardar el pedido y repetirlo.
