export const LS_KEY = 'foro-licenciamiento-v3'

export const PASOS = [
  { t: 'Reconoce', d: 'Valora un acierto concreto del aporte de tu compañero.' },
  { t: 'Complementa', d: 'Aporta normas colombianas (Ley 23/1982, Decisión 351) o casos técnicos.' },
  { t: 'Cuestiona', d: 'Matiza con respeto alguna idea o plantea una postura alternativa.' },
  { t: 'Invita', d: 'Formula una pregunta abierta para continuar el debate formativo.' }
]

export const DRAFT = {
  pregunta: '¿Qué es una licencia de software y cuáles son las más adecuadas para nuestro proyecto formativo y por qué?',
  respuesta: `Una licencia de software es un contrato formal entre el titular de los derechos de autor (licenciante) y quien adquiere el derecho a utilizar el programa (licenciatario). A través de ella no se transfiere la propiedad del código, sino que se autorizan ciertos usos bajo condiciones específicas (alcance, duración, facultades de modificación, distribución comercial y límites de responsabilidad).

En Colombia, el marco legal está regulado principalmente por la Ley 23 de 1982 sobre derechos de autor, el Decreto 1360 de 1989 (que define el software como «soporte lógico» protegido) y la Decisión Andina 351 de 1993. La utilización de software sin la respectiva licencia constituye infracción a los derechos patrimoniales de autor, tipificada en el Código Penal.

Para nuestro proyecto formativo («Construcción de software integrador de tecnologías orientadas a servicios»), considero que las licencias más adecuadas son:

1. Licencia Apache 2.0 o MIT para el repositorio principal:
   • Son licencias de código abierto permisivas que facilitan la reutilización y colaboración técnica.
   • Recomiendo específicamente Apache 2.0 porque incluye una cláusula explícita de concesión de patentes y protección legal ante posibles litigios, lo cual brinda mayor seguridad si el proyecto escala comercialmente.

2. Contrato de cesión o licencia propietaria si se entrega a un cliente específico:
   • En software desarrollado a la medida, la ley colombiana (art. 20 de la Ley 23 de 1982, modificado por la Ley 1450 de 2011) presume que los derechos patrimoniales se transfieren a quien encarga la obra, salvo pacto en contrario por escrito. Por tanto, las condiciones deben quedar claramente estipuladas en la propuesta técnica y económica.

3. Licencias de dependencias:
   • Es esencial auditar que las librerías empleadas (Spring Boot, Vue, React, PostgreSQL) no contravengan nuestro modelo de distribución, evitando el uso de licencias copyleft fuertes (como GPL-3.0) si el objetivo es distribuir un paquete cerrado sin obligación de liberar el código fuente.

En conclusión, elegir la licencia adecuada desde el inicio protege el esfuerzo de desarrollo del equipo, minimiza contingencias jurídicas y permite estimar con precisión el costo total de propiedad (TCO) para la organización.`
}
