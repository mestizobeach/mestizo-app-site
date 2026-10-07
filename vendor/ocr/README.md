# Reconocimiento local de facturas

Componentes distribuidos con la app para procesar imágenes en el navegador sin enviarlas a servidores:

- Tesseract.js 5.1.1 (naptha/tesseract.js): API y worker. Licencia Apache 2.0 incluida en LICENSE-tesseract.
- Tesseract.js-core 5.1.1: variantes WebAssembly para dispositivos con y sin SIMD. Licencia incluida en LICENSE.
- Modelo español @tesseract.js-data/spa 1.0.0, variante 4.0.0_best_int, distribuida por el proyecto Tesseract.js. Archivo spa.traineddata.gz.

Las rutas del worker, núcleo y modelo se configuran en invoices.js para que todos se sirvan desde este sitio. Solo los componentes necesarios para el dispositivo se descargan bajo demanda y se conservan en la caché del service worker. Ninguna foto de usuario se incorpora a estos archivos.
