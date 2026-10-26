
/* =========================================
   PEDIDOS FAMILIARES 💗
   24 y 25 de octubre de 2026
========================================= */

// Conexión con Supabase: declarar una sola vez.
const SUPABASE_URL = "https://bghetxaeihndeomjiwnb.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_bW_HGwheXL73KGact5gmcw_seTG0i0-";

const listaIntegrantes = document.getElementById("listaIntegrantes");
const desayunos = document.getElementById("desayunos");
const almuerzos = document.getElementById("almuerzos");
const botonAgregar = document.getElementById("agregarIntegrante");
const botonGuardar = document.getElementById("guardarPedidos");
const mensaje = document.getElementById("mensaje");

let supabaseClient = null;
let siguienteId = 1;

// Inicializar Supabase sin impedir que funcione el formulario
// si la biblioteca no carga.
if (window.supabase && typeof window.supabase.createClient === "function") {
  supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
  );
}

// Opciones de desayuno
const opcionesHuevos = [
  "Huevos pericos",
  "Huevos con maíz"
];

const opcionesArroz = [
  "Con arroz",
  "Sin arroz"
];

const opcionesBebida = [
  "Café con leche",
  "Tinto",
  "No quiere bebida"
];

// Opciones del almuerzo del sábado
const opcionesProteina = [
  "Costilla de cerdo",
  "Pierna pernil dorada"
];

const opcionesAcompanamiento = [
  "Fríjoles",
  "Verduras"
];

// Opciones del almuerzo del domingo
const opcionesAlmuerzoDomingo = [
  "Menú 2: Arroz atollado",
  "Menú 3: Sancocho de gallina"
];

// Escapar texto para evitar interpretar nombres como HTML
function escapar(texto) {
  return String(texto ?? "").replace(/[&<>"']/g, caracter => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[caracter]);
}

// Crear las opciones de un selector
function crearOpciones(opciones, textoInicial) {
  return `
    <option value="">${escapar(textoInicial)}</option>
    ${opciones.map(opcion =>
      `<option value="${escapar(opcion)}">${escapar(opcion)}</option>`
    ).join("")}
  `;
}

// Crear un selector
function crearSelector(id, etiqueta, opciones, textoInicial) {
  return `
    <label for="${id}">${escapar(etiqueta)}</label>
    <select id="${id}" required>
      ${crearOpciones(opciones, textoInicial)}
    </select>
  `;
}

// Agregar una persona
function agregarIntegrante() {
  const id = siguienteId++;

  const tarjeta = document.createElement("div");
  tarjeta.className = "integrante";
  tarjeta.dataset.id = id;

  tarjeta.innerHTML = `
    <h3>💗 Integrante ${id}</h3>

    <label for="nombre-${id}">Nombre</label>
    <input
      type="text"
      id="nombre-${id}"
      class="nombre-persona"
      placeholder="Nombre de la persona"
      required
    >

    <button type="button" class="eliminar">
      Eliminar integrante
    </button>
  `;

  tarjeta.querySelector(".eliminar").addEventListener("click", () => {
    tarjeta.remove();
    actualizarComidas();
  });

  listaIntegrantes.appendChild(tarjeta);
  actualizarComidas();
}

// Obtener las personas registradas
function obtenerPersonas() {
  return [...listaIntegrantes.querySelectorAll(".integrante")].map(tarjeta => ({
    id: tarjeta.dataset.id,
    nombre: tarjeta.querySelector(".nombre-persona").value.trim()
  }));
}

// Crear tarjeta de desayuno
function crearDesayuno(persona, dia, fecha) {
  const prefijo = `d-${persona.id}-${dia}`;

  return `
    <div class="comida-card">
      <h3>🍳 ${escapar(persona.nombre || `Integrante ${persona.id}`)}</h3>
      <p><strong>${fecha}</strong></p>

      ${crearSelector(
        `${prefijo}-tipo`,
        "¿Desea desayuno?",
        ["Desayuno completo", "No desea desayuno"],
        "Selecciona una opción"
      )}

      <div id="${prefijo}-detalles" hidden>
        <p>Incluye caldo de costilla y arepa.</p>

        ${crearSelector(
          `${prefijo}-huevos`,
          "Tipo de huevos",
          opcionesHuevos,
          "Elige los huevos"
        )}

        ${crearSelector(
          `${prefijo}-arroz`,
          "¿Con arroz o sin arroz?",
          opcionesArroz,
          "Elige una opción"
        )}

        ${crearSelector(
          `${prefijo}-bebida`,
          "Bebida",
          opcionesBebida,
          "Elige una bebida"
        )}
      </div>
    </div>
  `;
}

// Crear tarjeta de almuerzo
function crearAlmuerzo(persona) {
  const sabado = `a-${persona.id}-sabado`;
  const domingo = `a-${persona.id}-domingo`;

  return `
    <div class="comida-card">
      <h3>🍲 ${escapar(persona.nombre || `Integrante ${persona.id}`)}</h3>

      <p><strong>Sábado 24 de octubre — Menú 1</strong></p>
      <p>Ajiaco, proteína, acompañamiento, patacón, ensalada y limonada.</p>

      ${crearSelector(
        `${sabado}-proteina`,
        "Elige la proteína",
        opcionesProteina,
        "Selecciona la proteína"
      )}

      ${crearSelector(
        `${sabado}-acompanamiento`,
        "Elige el acompañamiento",
        opcionesAcompanamiento,
        "Selecciona el acompañamiento"
      )}

      <hr>

      <p><strong>Domingo 25 de octubre</strong></p>

      ${crearSelector(
        `${domingo}-menu`,
        "Elige tu almuerzo",
        opcionesAlmuerzoDomingo,
        "Selecciona tu menú"
      )}

      <div class="ayuda">
        Menú 2: arroz atollado, crema de mazorca,
        tajada de maduro y ensalada.<br>
        Menú 3: sancocho de gallina, con un cuarto de gallina
        y un pedacito de carne.
      </div>
    </div>
  `;
}

// Actualizar desayunos y almuerzos
function actualizarComidas() {
  const personas = obtenerPersonas();

  desayunos.innerHTML = "";
  almuerzos.innerHTML = "";

  if (personas.length === 0) {
    desayunos.innerHTML =
      '<p class="ayuda">Agrega un integrante para elegir su desayuno.</p>';

    almuerzos.innerHTML =
      '<p class="ayuda">Agrega un integrante para elegir su almuerzo.</p>';

    return;
  }

  personas.forEach(persona => {
    desayunos.insertAdjacentHTML(
      "beforeend",
      crearDesayuno(persona, "sabado", "Sábado 24 de octubre")
    );

    desayunos.insertAdjacentHTML(
      "beforeend",
      crearDesayuno(persona, "domingo", "Domingo 25 de octubre")
    );

    almuerzos.insertAdjacentHTML(
      "beforeend",
      crearAlmuerzo(persona)
    );
  });

  // Mostrar los detalles solo si se elige desayuno completo
  personas.forEach(persona => {
    ["sabado", "domingo"].forEach(dia => {
      const prefijo = `d-${persona.id}-${dia}`;
      const selector = document.getElementById(`${prefijo}-tipo`);
      const detalles = document.getElementById(`${prefijo}-detalles`);

      selector.addEventListener("change", () => {
        const deseaDesayuno = selector.value === "Desayuno completo";

        detalles.hidden = !deseaDesayuno;

        detalles.querySelectorAll("select").forEach(campo => {
          campo.required = deseaDesayuno;

          if (!deseaDesayuno) {
            campo.value = "";
          }
        });
      });
    });
  });
}

// Leer una selección
function leer(id) {
  return document.getElementById(id)?.value || "";
}

// Construir el pedido de una persona
function obtenerPedido(persona) {
  const id = persona.id;

  const desayunoSabado = leer(`d-${id}-sabado-tipo`);
  const desayunoDomingo = leer(`d-${id}-domingo-tipo`);

  return {
    nombre: persona.nombre,

    sabado: {
      desayuno: desayunoSabado,
      huevos: desayunoSabado === "Desayuno completo"
        ? leer(`d-${id}-sabado-huevos`) : "",
      arroz: desayunoSabado === "Desayuno completo"
        ? leer(`d-${id}-sabado-arroz`) : "",
      bebida: desayunoSabado === "Desayuno completo"
        ? leer(`d-${id}-sabado-bebida`) : "",
      proteina: leer(`a-${id}-sabado-proteina`),
      acompanamiento: leer(`a-${id}-sabado-acompanamiento`)
    },

    domingo: {
      desayuno: desayunoDomingo,
      huevos: desayunoDomingo === "Desayuno completo"
        ? leer(`d-${id}-domingo-huevos`) : "",
      arroz: desayunoDomingo === "Desayuno completo"
        ? leer(`d-${id}-domingo-arroz`) : "",
      bebida: desayunoDomingo === "Desayuno completo"
        ? leer(`d-${id}-domingo-bebida`) : "",
      almuerzo: leer(`a-${id}-domingo-menu`)
    }
  };
}

// Contar las opciones seleccionadas
function contarOpciones(pedidos) {
  const conteo = {};

  function sumar(categoria, opcion) {
    if (!opcion) return;

    const clave = `${categoria}: ${opcion}`;
    conteo[clave] = (conteo[clave] || 0) + 1;
  }

  pedidos.forEach(pedido => {
    ["sabado", "domingo"].forEach(dia => {
      const comida = pedido[dia];

      sumar(`${dia} - Desayuno`, comida.desayuno);

      if (comida.desayuno === "Desayuno completo") {
        sumar(`${dia} - Huevos`, comida.huevos);
        sumar(`${dia} - Arroz`, comida.arroz);
        sumar(`${dia} - Bebida`, comida.bebida);
      }
    });

    sumar("Sábado - Proteína del almuerzo", pedido.sabado.proteina);
    sumar("Sábado - Acompañamiento", pedido.sabado.acompanamiento);
    sumar("Domingo - Almuerzo", pedido.domingo.almuerzo);
  });

  return conteo;
}

// Mostrar el resumen sin duplicar la sección
function mostrarResumen(resultado, conteo) {
  const { organizador, pedidos } = resultado;

  let resumen = document.getElementById("resumenPedidos");

  if (!resumen) {
    resumen = document.createElement("section");
    resumen.id = "resumenPedidos";
    resumen.className = "tarjeta";
    document.querySelector(".contenedor").appendChild(resumen);
  }

  resumen.innerHTML = `
    <h2>💗 Resumen de pedidos</h2>
    <p><strong>Registrado por:</strong> ${escapar(organizador)}</p>
    <p><strong>Total de integrantes:</strong> ${pedidos.length}</p>

    <h3>🍽️ Cantidades por opción</h3>
    <ul>
      ${Object.entries(conteo).map(([opcion, cantidad]) =>
        `<li>${escapar(opcion)}: <strong>${cantidad}</strong></li>`
      ).join("")}
    </ul>

    <h3>👨‍👩‍👧‍👦 Detalle por persona</h3>

    ${pedidos.map(pedido => `
      <div class="comida-card">
        <h3>${escapar(pedido.nombre)}</h3>

        <p>
          <strong>Sábado:</strong>
          desayuno: ${escapar(pedido.sabado.desayuno)};
          huevos: ${escapar(pedido.sabado.huevos || "No aplica")};
          arroz: ${escapar(pedido.sabado.arroz || "No aplica")};
          bebida: ${escapar(pedido.sabado.bebida || "No aplica")};
          almuerzo: ${escapar(pedido.sabado.proteina)} y
          ${escapar(pedido.sabado.acompanamiento)}.
        </p>

        <p>
          <strong>Domingo:</strong>
          desayuno: ${escapar(pedido.domingo.desayuno)};
          huevos: ${escapar(pedido.domingo.huevos || "No aplica")};
          arroz: ${escapar(pedido.domingo.arroz || "No aplica")};
          bebida: ${escapar(pedido.domingo.bebida || "No aplica")};
          almuerzo: ${escapar(pedido.domingo.almuerzo)}.
        </p>
      </div>
    `).join("")}

    ${resultado.observaciones
      ? `<p><strong>Observaciones:</strong> ${escapar(resultado.observaciones)}</p>`
      : ""}

    <button type="button" id="descargarResumen" class="boton-secundario">
      Descargar resumen CSV
    </button>

    <p class="ayuda" id="estadoNube">
      El resumen está disponible en esta página.
    </p>
  `;

  document.getElementById("descargarResumen").addEventListener("click", () => {
    descargarCSV(pedidos, conteo, organizador);
  });

  resumen.scrollIntoView({ behavior: "smooth", block: "start" });
}

// Confirmar, guardar y mostrar el resumen
async function confirmarPedidos() {
  if (botonGuardar.disabled) return;

  const organizador = document.getElementById("organizador").value.trim();
  const personas = obtenerPersonas();

  if (!organizador) {
    mensaje.textContent = "Por favor, escribe el nombre de quien registra.";
    document.getElementById("organizador").focus();
    return;
  }

  if (personas.length === 0) {
    mensaje.textContent = "Primero agrega al menos un integrante de la familia.";
    return;
  }

  if (personas.some(persona => !persona.nombre)) {
    mensaje.textContent = "Por favor, escribe el nombre de cada integrante.";
    return;
  }

  const nombres = personas.map(persona => persona.nombre.toLowerCase());

  if (new Set(nombres).size !== nombres.length) {
    mensaje.textContent = "Hay nombres repetidos. Revisa la lista de integrantes.";
    return;
  }

  const campos = [
    ...document.querySelectorAll(
      "#desayunos select[required], #almuerzos select[required]"
    )
  ];

  const incompleto = campos.find(campo => !campo.value);

  if (incompleto) {
    mensaje.textContent = "Te falta elegir alguna comida. Revisa los campos pendientes.";
    incompleto.focus();
    return;
  }

  const pedidos = personas.map(obtenerPedido);
  const conteo = contarOpciones(pedidos);

  const resultado = {
    organizador,
    fechaRegistro: new Date().toISOString(),
    observaciones: document.getElementById("observaciones").value.trim(),
    pedidos
  };

  botonGuardar.disabled = true;
  botonGuardar.textContent = "Guardando... 💗";
  mensaje.style.color = "";

  let guardadoEnNube = false;
  let errorNube = "";

  try {
    // Guardar primero una copia local para no perder el pedido.
    try {
      localStorage.setItem("pedidosFamiliares", JSON.stringify(resultado));
    } catch (errorLocal) {
      console.warn("No se pudo guardar la copia local:", errorLocal);
    }

    // Intentar guardar en Supabase.
    if (!supabaseClient) {
      throw new Error(
        "No se cargó la biblioteca de Supabase. Revisa index.html."
      );
    }

    const { error } = await supabaseClient
      .from("pedidos_familia")
      .insert({
        nombre_responsable: organizador,
        pedidos: resultado
      });

    if (error) throw error;

    guardadoEnNube = true;

  } catch (error) {
    console.error("Error al guardar en Supabase:", error);
    errorNube = error.message || "Error de conexión con Supabase.";
  }

  // El resumen y el CSV funcionan aunque falle la conexión.
  mostrarResumen(resultado, conteo);

  const estadoNube = document.getElementById("estadoNube");

  if (guardadoEnNube) {
    mensaje.textContent = "¡Pedidos guardados correctamente en la nube! 💕";
    mensaje.style.color = "green";
    estadoNube.textContent =
      "¡Guardado en Supabase! Esta copia se encuentra en la base de datos.";
  } else {
    mensaje.textContent =
      "El resumen está listo, pero no se pudo guardar en la nube.";
    mensaje.style.color = "red";
    estadoNube.textContent =
      "No se confirmó el guardado en la nube. El resumen y el CSV siguen disponibles. Error: " +
      errorNube;
  }

  botonGuardar.disabled = false;
  botonGuardar.textContent = "Confirmar pedidos";
}

// Descargar el resumen para abrirlo en Excel
function descargarCSV(pedidos, conteo, organizador) {
  const filas = [
    ["Pedidos familiares"],
    ["Registrado por", organizador],
    [],
    [
      "Integrante",
      "Día",
      "Desayuno",
      "Huevos",
      "Arroz",
      "Bebida",
      "Almuerzo",
      "Acompañamiento"
    ]
  ];

  pedidos.forEach(pedido => {
    filas.push([
      pedido.nombre,
      "Sábado 24 de octubre",
      pedido.sabado.desayuno,
      pedido.sabado.huevos,
      pedido.sabado.arroz,
      pedido.sabado.bebida,
      pedido.sabado.proteina,
      pedido.sabado.acompanamiento
    ]);

    filas.push([
      pedido.nombre,
      "Domingo 25 de octubre",
      pedido.domingo.desayuno,
      pedido.domingo.huevos,
      pedido.domingo.arroz,
      pedido.domingo.bebida,
      pedido.domingo.almuerzo,
      ""
    ]);
  });

  filas.push([]);
  filas.push(["Resumen de cantidades"]);
  filas.push(["Opción", "Cantidad"]);

  Object.entries(conteo).forEach(([opcion, cantidad]) => {
    filas.push([opcion, cantidad]);
  });

  const contenido = "\uFEFF" + filas.map(fila =>
    fila.map(valor =>
      `"${String(valor ?? "").replace(/"/g, '""')}"`
    ).join(";")
  ).join("\r\n");

  const archivo = new Blob([contenido], {
    type: "text/csv;charset=utf-8;"
  });

  const url = URL.createObjectURL(archivo);
  const enlace = document.createElement("a");

  enlace.href = url;
  enlace.download = "pedidos_familiares.csv";
  document.body.appendChild(enlace);
  enlace.click();
  enlace.remove();

  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// Eventos iniciales
botonAgregar.addEventListener("click", agregarIntegrante);
botonGuardar.addEventListener("click", confirmarPedidos);

// Mostrar un integrante al abrir la página
agregarIntegrante();
