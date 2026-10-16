// Actividad de repaso del foro: familias de licencias, licencias para clasificar
// y casos prácticos. Cada caso tiene exactamente una opción correcta (ok: true).
// Las normas citadas en las explicaciones se verificaron en octubre de 2026:
//  - Ley 23 de 1982, art. 9 (protección sin registro) y art. 20 (modificado por el art. 28 de la Ley 1450 de 2011)
//  - Código Penal, art. 271 (modificado por la Ley 1032 de 2006)

export const LS_REPASO_KEY = 'foro-licenciamiento-repaso-v1'

export const FAMILIAS = [
  { id: 'perm', nombre: 'Permisiva', def: 'Pocas condiciones; se puede usar dentro de software cerrado.' },
  { id: 'fuerte', nombre: 'Copyleft fuerte', def: 'Lo que se distribuya derivado de ella debe usar la misma licencia.' },
  { id: 'debil', nombre: 'Copyleft débil', def: 'La obligación cubre solo la librería o los archivos originales.' },
  { id: 'prop', nombre: 'Propietaria', def: 'Código cerrado; el uso depende del contrato del fabricante.' },
  { id: 'pd', nombre: 'Dominio público', def: 'Sin derechos reservados ni condiciones de uso.' }
];

export const TARJETAS = [
  { id: 'mit', nombre: 'MIT', familia: 'perm',
    porque: 'Permite usar, modificar y vender el código, incluso dentro de software cerrado. Solo exige conservar el aviso de derechos de autor y el texto de la licencia.' },
  { id: 'apache', nombre: 'Apache-2.0', familia: 'perm',
    porque: 'Es permisiva como MIT, pero además concede de forma expresa las patentes de quienes contribuyen y pide indicar qué archivos se modificaron.' },
  { id: 'bsd3', nombre: 'BSD-3-Clause', familia: 'perm',
    porque: 'Es permisiva. Su tercera cláusula prohíbe usar el nombre de los autores para promocionar productos derivados sin su permiso.' },
  { id: 'gpl3', nombre: 'GPL-3.0', familia: 'fuerte',
    porque: 'Quien distribuya un programa que la incluya o derive de ella debe entregarlo completo bajo GPL-3.0 y con su código fuente.' },
  { id: 'agpl3', nombre: 'AGPL-3.0', familia: 'fuerte',
    porque: 'Funciona como la GPL-3.0 y además obliga a ofrecer el código fuente cuando el programa modificado se usa por red, por ejemplo como aplicación web.' },
  { id: 'lgpl', nombre: 'LGPL-2.1', familia: 'debil',
    porque: 'Se puede enlazar la librería desde software cerrado. Solo los cambios hechos a la propia librería deben compartirse bajo LGPL.' },
  { id: 'mpl', nombre: 'MPL-2.0', familia: 'debil',
    porque: 'El copyleft aplica archivo por archivo: los archivos MPL que modifiques siguen abiertos, pero puedes combinarlos con archivos propios cerrados.' },
  { id: 'eula', nombre: 'EULA de Windows 11', familia: 'prop',
    porque: 'Es un contrato de licencia de usuario final: autoriza usar el programa en ciertas condiciones, sin acceso al código ni permiso para modificarlo o copiarlo.' },
  { id: 'reader', nombre: 'Adobe Acrobat Reader (gratuito)', familia: 'prop',
    porque: 'Es freeware: no se paga, pero el código es cerrado y la licencia no permite modificarlo ni redistribuirlo libremente. Gratis no es lo mismo que libre.' },
  { id: 'cc0', nombre: 'CC0-1.0', familia: 'pd',
    porque: 'El autor renuncia a todos los derechos que la ley le permite renunciar. En Colombia los derechos morales son irrenunciables, pero la obra se puede usar sin condiciones.' }
];

export const CASOS = [
  {
    id: 'gpl-cerrado',
    tema: 'GPL en un producto cerrado',
    enunciado: 'Tu equipo incluyó una librería con licencia GPL-3.0 dentro de una aplicación de escritorio que la empresa quiere vender con código cerrado. ¿Qué debe hacer la empresa?',
    opciones: [
      { texto: 'Distribuir la aplicación completa bajo GPL-3.0 con su código fuente, o reemplazar la librería por una con licencia compatible.', ok: true },
      { texto: 'Nada: como la empresa pagó el desarrollo, puede cerrar el código.', ok: false },
      { texto: 'Solo dar crédito al autor de la librería en la pantalla «Acerca de».', ok: false },
      { texto: 'Dejar de venderla, porque la GPL prohíbe cobrar por el software.', ok: false }
    ],
    explicacion: 'La GPL-3.0 es copyleft fuerte: quien distribuye un programa basado en código GPL debe hacerlo bajo la misma licencia y entregar el código fuente. La GPL sí permite cobrar; lo que no permite es cerrar el código. Algunas librerías tienen licencia dual, y también se puede comprar al autor una licencia comercial.'
  },
  {
    id: 'apache-patentes',
    tema: 'Uso comercial y patentes',
    enunciado: 'Una startup va a publicar en GitHub una librería para que otras empresas la usen, incluso en productos cerrados. Además quiere que cada persona que contribuya conceda de forma expresa los derechos de sus patentes. ¿Qué licencia le conviene?',
    opciones: [
      { texto: 'Apache-2.0', ok: true },
      { texto: 'GPL-3.0', ok: false },
      { texto: 'MIT', ok: false },
      { texto: 'Creative Commons BY-SA 4.0', ok: false }
    ],
    explicacion: 'Apache-2.0 es permisiva, así que permite el uso en productos cerrados, y además incluye una concesión expresa de patentes de cada contribuyente. MIT también es permisiva, pero no menciona las patentes. GPL-3.0 obligaría a abrir los productos derivados, y Creative Commons no se recomienda para código.'
  },
  {
    id: 'sin-licencia',
    tema: 'Código sin licencia',
    enunciado: 'Encuentras en GitHub un repositorio público con justo el código que necesitas, pero no tiene archivo de licencia. ¿Puedes copiarlo en tu proyecto?',
    opciones: [
      { texto: 'No sin permiso del autor: sin licencia, nadie más tiene autorización para copiarlo, modificarlo ni distribuirlo.', ok: true },
      { texto: 'Sí, porque lo que está publicado en internet es de dominio público.', ok: false },
      { texto: 'Sí, siempre que menciones al autor en tu proyecto.', ok: false },
      { texto: 'Sí, si le cambias los nombres a las variables y funciones.', ok: false }
    ],
    explicacion: 'El derecho de autor nace con la creación de la obra, sin registro ni aviso (Ley 23 de 1982, art. 9). Que el código esté a la vista no da permiso de usarlo, y cambiar nombres no lo convierte en una obra nueva. Pide autorización al autor o busca una alternativa con licencia abierta.'
  },
  {
    id: 'encargo',
    tema: 'Software por encargo',
    enunciado: 'Desarrollas un sistema de citas para una clínica mediante un contrato de prestación de servicios escrito. El contrato no dice nada sobre derechos de autor. ¿Quién queda con los derechos patrimoniales del software?',
    opciones: [
      { texto: 'Se presume que pasaron a la clínica, en la medida necesaria para sus actividades habituales. Tú sigues siendo el autor.', ok: true },
      { texto: 'Tú, porque escribiste el código; la clínica necesita una licencia aparte para usarlo.', ok: false },
      { texto: 'Nadie: el software hecho por encargo queda en dominio público.', ok: false },
      { texto: 'Se reparten por partes iguales entre tú y la clínica.', ok: false }
    ],
    explicacion: 'El art. 20 de la Ley 23 de 1982, modificado por el art. 28 de la Ley 1450 de 2011, dice que en las obras creadas por contrato de prestación de servicios o de trabajo el autor es el titular originario, pero se presume, salvo pacto en contrario, que los derechos patrimoniales pasan al encargante en la medida necesaria para sus actividades habituales. La presunción exige que el contrato sea escrito, y los derechos morales siguen siendo del autor. Lo más seguro es pactarlo de forma expresa.'
  },
  {
    id: 'instalaciones',
    tema: 'Instalaciones de más',
    enunciado: 'Una empresa compró la licencia de una suite de ofimática para un equipo y la instaló en sus 20 computadores. ¿Cómo se califica esa conducta?',
    opciones: [
      { texto: 'Es reproducción no autorizada de software: debe adquirir las licencias que faltan, por ejemplo con una licencia por volumen.', ok: true },
      { texto: 'Es legal, porque el uso es interno y la empresa no revende el programa.', ok: false },
      { texto: 'Es legal si los 20 equipos están en la misma oficina.', ok: false },
      { texto: 'Solo sería ilegal si hubiera descargado el programa de una página no oficial.', ok: false }
    ],
    explicacion: 'La licencia fija cuántos equipos o usuarios pueden usar el programa; instalarlo más veces de las autorizadas es reproducir el soporte lógico sin permiso del titular. Además de la responsabilidad civil, el art. 271 del Código Penal, modificado por la Ley 1032 de 2006, castiga con prisión de cuatro a ocho años y multa a quien reproduzca software sin autorización.'
  },
  {
    id: 'libre-costos',
    tema: 'Software libre y costos',
    enunciado: 'Un compañero escribe en el foro: «Como vamos a usar software libre, no hay que incluir ningún costo de licenciamiento ni de nada más en la propuesta económica». ¿Qué le respondes?',
    opciones: [
      { texto: 'Que «libre» se refiere a libertades, no al precio: aunque no pague licencias, la solución tiene costos de soporte, capacitación, infraestructura y mantenimiento.', ok: true },
      { texto: 'Que tiene razón: el software libre no genera ningún costo.', ok: false },
      { texto: 'Que el software libre siempre sale más caro que el propietario.', ok: false },
      { texto: 'Que el software libre no se puede usar en proyectos de empresas.', ok: false }
    ],
    explicacion: 'La Free Software Foundation define el software libre por cuatro libertades (usar, estudiar, distribuir y mejorar), no por el precio. Una propuesta económica seria estima el costo total de propiedad: licencias si las hay, pero también infraestructura, soporte, capacitación y mantenimiento.'
  }
];
