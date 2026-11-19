// ======================================================
// DATOS COMPARTIDOS Y ESTADO DE RAÍZ JUSTA (SIN SERVIDOR)
// Requiere cargar productos.js antes de este archivo
// ======================================================

const VENTAS_7_DIAS = [
  { dia: "Lun", monto: 65000 },
  { dia: "Mar", monto: 92000 },
  { dia: "Mié", monto: 78000 },
  { dia: "Jue", monto: 118000 },
  { dia: "Vie", monto: 127000 },
  { dia: "Sáb", monto: 164000 },
  { dia: "Hoy", monto: 135000 }
];

const VIDEOS_APRENDER = [
  { id: 1, titulo: "Cómo calcular lo que te cuesta producir", duracion: "4 min", color: "#2F6B3A", emoji: "🧮", resumen: "Suma semillas, abono, empaque y tu jornal diario para saber exactamente desde qué precio ganas." },
  { id: 2, titulo: "Cómo fijar tu precio justo", duracion: "5 min", color: "#8B5E3C", emoji: "⚖️", resumen: "Usa una regla clara para cubrir costos, ahorrar para la próxima siembra y vender sin intermediarios." },
  { id: 3, titulo: "Cómo negociar y no dejarte estafar", duracion: "6 min", color: "#D9822B", emoji: "🤝", resumen: "Claves prácticas para pactar cantidades, fechas y pagos directos con total tranquilidad." }
];

// Estado global compartido entre Perfil Familia y Perfil Campesino
const estado = {
  perfil: null,         // "familia" | "campesino"
  pestana: "mercado",   // familia: mercado, carrito, pedido | campesino: pedidos, productos, saldo, aprender
  busqueda: "",
  categoria: "Todas",
  metodoPago: "Nequi",

  // Carrito inicial con algunos productos reales (se puede editar o cargar un Mercado Armado)
  carrito: { 79: 2, 91: 2, 3: 2, 94: 3, 65: 3, 7: 2, 16: 3 },

  // Pedidos del campesino (#RJ-1024 se comparte en vivo con el perfil Familia)
  pedidos: [
    {
      id: "RJ-1024",
      familia: "Familia Morales",
      direccion: "Cra 68 # 24B-15, Apto 402 · Bogotá",
      listaAlistamiento: [
        "2 lb Papa Pastusa",
        "2 lb Tomate de Guiso",
        "2 lb Aguacate Hass",
        "3 lb Zanahoria",
        "3 lb Cebolla Larga",
        "2 lb Banano Urabá",
        "3 unidades Granadilla"
      ],
      valorProductos: 24500,
      envio: 15000,
      estado: "Pedido confirmado", // Pedido confirmado -> Preparando -> Enviado por el campesino -> Entregado
      aceptado: false,
      recibidoPorFamilia: false,
      calificacion: 0,
      saldoAcreditado: false
    },
    {
      id: "RJ-1025",
      familia: "Familia Castro",
      direccion: "Calle 127 # 18-40, Casa 6 · Bogotá",
      listaAlistamiento: [
        "3 lb Papa Sabanera",
        "2 lb Fresa Pareja",
        "1 unidad Lechuga hidroponica Verde",
        "1 lb Cilantro"
      ],
      valorProductos: 13650,
      envio: 15000,
      estado: "Pedido confirmado",
      aceptado: false,
      recibidoPorFamilia: false,
      calificacion: 0,
      saldoAcreditado: false
    }
  ],

  campesino: {
    nombre: "Hernando Rojas",
    vereda: "Vereda San Miguel, Sibaté",
    historia: "Lleva 22 años cultivando papa, hortalizas y frutos de altura junto a su familia en tierra fría.",
    frase: "“Cuando vendemos directo, la comida llega recién cortada y a nuestra finca sí le queda el fruto del trabajo.”",
    saldo: 245000,
    ventasSemana: 779000,
    cuenta: "Bancolombia Ahorros •••• 4821",
    historial: [
      { titulo: "Pedido #RJ-1019 entregado", fecha: "Ayer · Productos + envío", monto: 118000, tipo: "in" },
      { titulo: "Pedido #RJ-1015 entregado", fecha: "17 Nov · Productos + envío", monto: 127000, tipo: "in" },
      { titulo: "Retiro a Bancolombia", fecha: "14 Nov · Transferencia", monto: -180000, tipo: "out" }
    ]
  }
};

let timerBusqueda = null;

// ======================================================
// UTILIDADES DE FORMATO, UNIDADES Y BÚSQUEDA
// ======================================================

function formatoCOP(valor) {
  const signo = valor < 0 ? "-" : "";
  return signo + "$" + Math.abs(Math.round(valor)).toLocaleString("es-CO");
}

// Quita tildes y pasa a minúsculas para buscar sin errores
function normalizarTexto(texto) {
  return String(texto || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

// Formatea la cantidad junto a su unidad (ej: "2 lb", "½ lb", "3 unidades", "1 kg")
function formatearCantidadUnidad(prod, cant) {
  const numTxt = cant === 0.5 ? "½" : String(cant).replace(".5", " ½");
  if (prod.tipoUnidad === "libra") return `${numTxt} lb`;
  if (prod.tipoUnidad === "kilo") return `${numTxt} kg`;
  const u = prod.unidad.toLowerCase();
  if (u === "unidad") return `${numTxt} ${cant === 1 ? "unidad" : "unidades"}`;
  if (u === "bandeja") return `${numTxt} ${cant === 1 ? "bandeja" : "bandejas"}`;
  if (u === "atado") return `${numTxt} ${cant === 1 ? "atado" : "atados"}`;
  return `${numTxt} × ${prod.unidad}`;
}

function mostrarToast(texto = "¡Listo!") {
  const el = document.getElementById("toast");
  el.textContent = texto;
  el.classList.remove("hidden");
  clearTimeout(window._timerToast);
  window._timerToast = setTimeout(() => el.classList.add("hidden"), 2400);
}

// Anima números importantes contando hacia arriba (respeta prefers-reduced-motion)
function animarConteos() {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.querySelectorAll("[data-count]").forEach((el) => {
    const destino = Number(el.getAttribute("data-count")) || 0;
    if (reduceMotion || destino === 0) {
      el.textContent = formatoCOP(destino);
      return;
    }
    const inicio = performance.now();
    const duracion = 420;
    function paso(ahora) {
      const progreso = Math.min((ahora - inicio) / duracion, 1);
      const actual = Math.round(destino * (1 - Math.pow(1 - progreso, 3)));
      el.textContent = formatoCOP(actual);
      if (progreso < 1) requestAnimationFrame(paso);
    }
    requestAnimationFrame(paso);
  });
}

// Íconos SVG propios para la barra inferior
const ICONOS_NAV = {
  mercado: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l2-4h14l2 4"/><path d="M3 9v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9"/><path d="M9 13h6"/></svg>`,
  carrito: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="20" r="1.5"/><circle cx="18" cy="20" r="1.5"/><path d="M2 3h3l2.4 11.2a2 2 0 0 0 2 1.6h8.8a2 2 0 0 0 2-1.5L22 7H6"/></svg>`,
  pedido: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l9 4.5v11L12 22l-9-4.5v-11L12 2z"/><path d="M12 22V11"/><path d="M21 6.5L12 11 3 6.5"/></svg>`,
  productos: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22V12"/><path d="M12 12C12 7 17 4 21 5c0 5-3 8-9 7z"/><path d="M12 14C12 9 7 6 3 7c0 5 3 8 9 7z"/></svg>`,
  saldo: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="5" width="20" height="14" rx="3"/><circle cx="12" cy="12" r="3"/></svg>`,
  aprender: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 8l10-4 10 4-10 4-10-4z"/><path d="M6 10v6c0 2 3 3 6 3s6-1 6-3v-6"/></svg>`
};

// ======================================================
// NAVEGACIÓN ENTRE PERFILES Y PESTAÑAS
// ======================================================

function entrarPerfil(perfil) {
  estado.perfil = perfil;
  estado.pestana = perfil === "familia" ? "mercado" : "pedidos";

  document.getElementById("welcome-screen").classList.add("hidden");
  document.getElementById("app-shell").classList.remove("hidden");

  const iniciales = document.getElementById("header-initials");
  const titulo = document.getElementById("header-title");
  const sub = document.getElementById("header-subtitle");

  if (perfil === "familia") {
    iniciales.textContent = "FM";
    titulo.textContent = "Buenas, familia";
    sub.textContent = "Bogotá · Mercado directo del campo";
  } else {
    const fechaHoy = new Date().toLocaleDateString("es-CO", { weekday: "long", day: "numeric", month: "short" });
    iniciales.textContent = "HR";
    titulo.textContent = "Hola, Hernando";
    sub.textContent = `${fechaHoy.charAt(0).toUpperCase() + fechaHoy.slice(1)} · Sibaté`;
  }

  dibujarBarraInferior();
  dibujarVistaActual();
}

function volverBienvenida() {
  document.getElementById("app-shell").classList.add("hidden");
  document.getElementById("welcome-screen").classList.remove("hidden");
}

function cambiarPestana(nueva) {
  estado.pestana = nueva;
  dibujarBarraInferior();
  dibujarVistaActual();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function dibujarBarraInferior() {
  const nav = document.getElementById("bottom-nav");
  if (estado.perfil === "familia") {
    const lineas = Object.keys(estado.carrito).length;
    nav.innerHTML = `
      <button class="nav-item ${estado.pestana === "mercado" ? "active" : ""}" onclick="cambiarPestana('mercado')">
        ${ICONOS_NAV.mercado}<span>Mercado</span>
      </button>
      <button class="nav-item ${estado.pestana === "carrito" ? "active" : ""}" onclick="cambiarPestana('carrito')">
        ${ICONOS_NAV.carrito}<span>Carrito</span>
        ${lineas > 0 ? `<span class="nav-badge">${lineas}</span>` : ""}
      </button>
      <button class="nav-item ${estado.pestana === "pedido" ? "active" : ""}" onclick="cambiarPestana('pedido')">
        ${ICONOS_NAV.pedido}<span>Mi pedido</span>
      </button>
    `;
  } else {
    nav.innerHTML = `
      <button class="nav-item ${estado.pestana === "pedidos" ? "active" : ""}" onclick="cambiarPestana('pedidos')">
        ${ICONOS_NAV.pedido}<span>Pedidos</span>
      </button>
      <button class="nav-item ${estado.pestana === "productos" ? "active" : ""}" onclick="cambiarPestana('productos')">
        ${ICONOS_NAV.productos}<span>Productos</span>
      </button>
      <button class="nav-item ${estado.pestana === "saldo" ? "active" : ""}" onclick="cambiarPestana('saldo')">
        ${ICONOS_NAV.saldo}<span>Mi saldo</span>
      </button>
      <button class="nav-item ${estado.pestana === "aprender" ? "active" : ""}" onclick="cambiarPestana('aprender')">
        ${ICONOS_NAV.aprender}<span>Aprender</span>
      </button>
    `;
  }
}

function dibujarVistaActual() {
  if (estado.perfil === "familia") {
    if (estado.pestana === "mercado") vistaMercado();
    if (estado.pestana === "carrito") vistaCarrito();
    if (estado.pestana === "pedido") vistaMiPedido();
  } else {
    if (estado.pestana === "pedidos") vistaPedidosCampesino();
    if (estado.pestana === "productos") vistaMisProductos();
    if (estado.pestana === "saldo") vistaSaldoCampesino();
    if (estado.pestana === "aprender") vistaAprender();
  }
  animarConteos();
}

// ======================================================
// MERCADOS ARMADOS (Básico, Familiar, Quincenal)
// ======================================================

function calcularTotalMercadoArmado(mercado) {
  return mercado.lineas.reduce((acc, linea) => {
    const prod = PRODUCTOS.find((p) => p.id === linea.id);
    return acc + (prod ? prod.precio * linea.qty : 0);
  }, 0);
}

function renderMercadosArmadosHtml() {
  const tarjetas = MERCADOS_ARMADOS.map((m) => {
    const totalExacto = calcularTotalMercadoArmado(m);
    return `
      <article class="carousel-card card-accent" style="min-width:255px; flex-direction:column; align-items:stretch; gap:10px; cursor:pointer;"
        onclick="abrirDetalleMercadoArmado('${m.id}')">
        <div style="display:flex; align-items:center; gap:12px;">
          <div class="cat-circle ${m.color}" style="width:52px; height:52px; font-size:28px;">${m.emoji}</div>
          <div>
            <strong style="font-size:17px; display:block;">${m.nombre}</strong>
            <span style="font-size:13px; color:var(--texto-suave);">${m.desc}</span>
          </div>
        </div>
        <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px solid var(--borde); padding-top:8px;">
          <div>
            <span style="font-size:12px; color:var(--tierra); display:block;">${m.lineas.length} productos</span>
            <strong style="font-size:19px; color:var(--bosque);">${formatoCOP(totalExacto)}</strong>
          </div>
          <button class="btn-primary" style="width:auto; min-height:42px; padding:8px 14px; margin:0; font-size:14px;"
            onclick="event.stopPropagation(); agregarMercadoAlCarrito('${m.id}')">
            Agregar
          </button>
        </div>
      </article>
    `;
  }).join("");

  return `
    <div class="section-head" style="margin-top:6px;">
      <h3 class="section-title">Mercados armados</h3>
      <span class="section-sub">Toca para ver lista</span>
    </div>
    <div class="carousel">${tarjetas}</div>
  `;
}

function abrirDetalleMercadoArmado(idMercado) {
  const mercado = MERCADOS_ARMADOS.find((m) => m.id === idMercado);
  if (!mercado) return;
  const totalExacto = calcularTotalMercadoArmado(mercado);

  const filas = mercado.lineas.map((l) => {
    const p = PRODUCTOS.find((item) => item.id === l.id);
    if (!p) return "";
    return `
      <div class="cart-row" style="padding:8px 0;">
        <span>${p.emoji} <strong>${formatearCantidadUnidad(p, l.qty)}</strong> ${p.nombre}</span>
        <strong>${formatoCOP(p.precio * l.qty)}</strong>
      </div>
    `;
  }).join("");

  abrirModal(`
    <div style="display:flex; align-items:center; gap:10px; margin-bottom:8px;">
      <span style="font-size:32px;">${mercado.emoji}</span>
      <div>
        <h2 class="section-title" style="margin:0;">${mercado.nombre}</h2>
        <span style="font-size:14px; color:var(--texto-suave);">${mercado.lineas.length} productos frescos</span>
      </div>
    </div>
    <div style="max-height:45vh; overflow-y:auto; margin:10px 0; border-top:1px solid var(--borde); border-bottom:1px solid var(--borde);">
      ${filas}
    </div>
    <div class="summary-total" style="border:none; padding:4px 0;">
      <span>Total productos</span>
      <span>${formatoCOP(totalExacto)}</span>
    </div>
    <button class="btn-primary" onclick="agregarMercadoAlCarrito('${mercado.id}'); cerrarModal();">
      Agregar al carrito
    </button>
    <button class="btn-secondary" onclick="cerrarModal()">Cerrar</button>
  `);
}

function agregarMercadoAlCarrito(idMercado) {
  const mercado = MERCADOS_ARMADOS.find((m) => m.id === idMercado);
  if (!mercado) return;

  estado.carrito = {};
  mercado.lineas.forEach((l) => {
    const prod = PRODUCTOS.find((p) => p.id === l.id);
    if (prod) {
      estado.carrito[l.id] = Math.min(l.qty, prod.maxCantidad);
    }
  });

  dibujarBarraInferior();
  if (estado.pestana === "mercado") actualizarResultadosMercado();
  mostrarToast(`¡Listo! ${mercado.nombre} en tu carrito`);
}

// ======================================================
// PERFIL FAMILIA: 1. MERCADO (BUSCADOR SIN PERDER FOCO)
// ======================================================

// Crea la estructura base UNA sola vez; el <input> nunca se destruye al escribir
function vistaMercado() {
  const main = document.getElementById("main-view");
  main.innerHTML = `
    <div class="search-box">
      <span class="search-ico">🔍</span>
      <input id="buscador-mercado" class="search-input" type="search"
        placeholder="Busca papa sabanera, tomate, Sibaté..."
        autocomplete="off" value="${estado.busqueda}">
    </div>
    <div id="mercado-resultados"></div>
  `;

  const input = document.getElementById("buscador-mercado");
  input.addEventListener("input", (e) => {
    const valor = e.target.value;
    clearTimeout(timerBusqueda);
    timerBusqueda = setTimeout(() => {
      estado.busqueda = valor;
      actualizarResultadosMercado();
    }, 150);
  });

  actualizarResultadosMercado();
}

function tarjetaCarrusel(p) {
  return `
    <article class="carousel-card card-accent" style="cursor:pointer;" onclick="abrirDetalleProducto(${p.id})">
      <div class="cat-circle ${p.colorCat}">${p.emoji}</div>
      <div style="flex:1; min-width:0;">
        <div class="product-name">${p.nombre}</div>
        <div class="product-farmer">${p.campesino} · ${p.zona}</div>
        <div style="display:flex; align-items:center; justify-content:space-between; margin-top:6px;">
          <strong style="color:var(--bosque); font-size:15px;">${formatoCOP(p.precio)} <span style="font-size:12px; color:var(--texto-suave);">/ ${p.etiquetaUnidad}</span></strong>
          <button class="btn-add-circle" style="width:36px; height:36px; font-size:20px;"
            onclick="event.stopPropagation(); cambiarCantidad(${p.id}, 1)" aria-label="Agregar ${p.nombre}">+</button>
        </div>
      </div>
    </article>
  `;
}

// Actualiza SOLO #mercado-resultados sin tocar el buscador ni subir el scroll
function actualizarResultadosMercado() {
  const cont = document.getElementById("mercado-resultados");
  if (!cont) return;

  const disponibles = PRODUCTOS.filter((p) => p.disponible);
  const q = normalizarTexto(estado.busqueda);

  const categorias = [
    { nombre: "Todas", bg: "#FFFFFF" },
    { nombre: "Frutas", bg: "var(--cat-frutas)" },
    { nombre: "Verduras", bg: "var(--cat-verduras)" },
    { nombre: "Hortalizas", bg: "var(--cat-hierbas)" }
  ];

  const chipsHtml = categorias.map((c) => `
    <button class="chip ${estado.categoria === c.nombre ? "active" : ""}"
      style="background:${c.bg};" onclick="filtrarCategoria('${c.nombre}')">${c.nombre}</button>
  `).join("");

  const filtrados = disponibles.filter((p) => {
    const okCat = estado.categoria === "Todas" || p.categoria === estado.categoria;
    const okTxt = !q ||
      normalizarTexto(p.nombre).includes(q) ||
      normalizarTexto(p.campesino).includes(q) ||
      normalizarTexto(p.zona).includes(q) ||
      normalizarTexto(p.categoria).includes(q);
    return okCat && okTxt;
  });

  const gridHtml = filtrados.map((p) => {
    const cant = estado.carrito[p.id] || 0;
    const esLibra = p.tipoUnidad === "libra";
    return `
      <article class="product-card card-accent" style="cursor:pointer;" onclick="abrirDetalleProducto(${p.id})">
        <div>
          <div class="product-top">
            <div class="cat-circle ${p.colorCat}">${p.emoji}</div>
          </div>
          <div class="product-name">${p.nombre}</div>
          <div class="product-farmer">${p.campesino} · ${p.zona}</div>
        </div>
        <div class="product-foot" onclick="event.stopPropagation()">
          <div class="product-price">
            ${formatoCOP(p.precio)}
            <span class="product-unit">${p.etiquetaUnidad}</span>
          </div>
          ${
            cant === 0
              ? `<div style="display:flex; align-items:center; gap:4px;">
                   ${esLibra ? `<button class="qty-mini" style="background:var(--tierra); font-size:12px; width:34px; height:34px;" onclick="cambiarCantidad(${p.id}, 0.5)" title="Media libra">½</button>` : ""}
                   <button class="btn-add-circle" style="width:40px; height:40px;" onclick="cambiarCantidad(${p.id}, 1)" aria-label="Agregar">+</button>
                 </div>`
              : `<div class="qty-pill">
                   <button class="qty-mini" onclick="cambiarCantidad(${p.id}, -1)">−</button>
                   <strong style="font-size:12px; white-space:nowrap;">${formatearCantidadUnidad(p, cant)}</strong>
                   <button class="qty-mini" onclick="cambiarCantidad(${p.id}, 1)">+</button>
                 </div>`
          }
        </div>
      </article>
    `;
  }).join("");

  const bloquesInicio = q === "" ? `
    ${renderMercadosArmadosHtml()}

    <div class="section-head">
      <h3 class="section-title">Recién cosechado hoy</h3>
      <span class="section-sub">Directo del surco</span>
    </div>
    <div class="carousel">${disponibles.filter((p) => p.frescoHoy).slice(0, 8).map(tarjetaCarrusel).join("")}</div>

    <div class="fair-banner">
      <span style="font-size:26px;">🌱</span>
      <span>El campesino recibe lo que fija por su cosecha, sin intermediarios innecesarios.</span>
    </div>

    <div class="section-head">
      <h3 class="section-title">Los más pedidos</h3>
      <span class="section-sub">Favoritos</span>
    </div>
    <div class="carousel">${disponibles.filter((p) => p.masPedido).slice(0, 8).map(tarjetaCarrusel).join("")}</div>
  ` : "";

  cont.innerHTML = `
    ${bloquesInicio}
    <div class="section-head">
      <h3 class="section-title">${q ? `Resultados (${filtrados.length})` : "Catálogo completo"}</h3>
      <span class="section-sub">${estado.categoria}</span>
    </div>
    <div class="chips-row">${chipsHtml}</div>
    <div class="products-grid">
      ${gridHtml || `<p style="grid-column:1/-1; color:var(--texto-suave); padding:14px 0;">No encontramos productos para "${estado.busqueda}".</p>`}
    </div>
  `;
}

function filtrarCategoria(cat) {
  estado.categoria = cat;
  actualizarResultadosMercado();
}

function abrirDetalleProducto(idProducto) {
  const p = PRODUCTOS.find((item) => item.id === idProducto);
  if (!p) return;
  const cant = estado.carrito[p.id] || 0;

  abrirModal(`
    <div style="text-align:center;">
      <div class="cat-circle ${p.colorCat}" style="width:82px; height:82px; font-size:44px; margin:0 auto 10px;">${p.emoji}</div>
      <span class="badge badge-hoja">${p.categoria}</span>
      <h2 class="section-title" style="margin:8px 0 4px;">${p.nombre}</h2>
      <p style="color:var(--tierra); font-weight:700;">${p.campesino} · ${p.zona}, Cundinamarca</p>
      <div style="font-size:28px; font-weight:900; color:var(--bosque); margin:10px 0 4px;">
        ${formatoCOP(p.precio)} <span style="font-size:15px; font-weight:600; color:var(--texto-suave);">/ ${p.unidad}</span>
      </div>
    </div>

    <div class="tip-card" style="margin:12px 0; text-align:center;">
      <strong>🌱 El campesino recibe el 100% de este precio</strong>
    </div>

    <div style="display:flex; align-items:center; justify-content:center; gap:12px; margin:14px 0;">
      <button class="qty-mini" style="width:44px; height:44px;" onclick="cambiarCantidad(${p.id}, -1); abrirDetalleProducto(${p.id});">−</button>
      <strong style="font-size:20px; min-width:95px; text-align:center;">${cant > 0 ? formatearCantidadUnidad(p, cant) : "0"}</strong>
      <button class="qty-mini" style="width:44px; height:44px;" onclick="cambiarCantidad(${p.id}, 1); abrirDetalleProducto(${p.id});">+</button>
    </div>

    ${
      p.tipoUnidad === "libra"
        ? `<button class="btn-secondary" onclick="cambiarCantidad(${p.id}, 0.5); abrirDetalleProducto(${p.id});">
             + Agregar media libra (½ lb)
           </button>`
        : ""
    }
    <button class="btn-primary" onclick="cerrarModal()">Listo</button>
  `);
}

function cambiarCantidad(idProducto, delta) {
  const prod = PRODUCTOS.find((p) => p.id === idProducto);
  if (!prod) return;

  const actual = estado.carrito[idProducto] || 0;
  let nuevo = actual + delta;

  if (delta < 0 && actual === 0.5) nuevo = 0;
  if (nuevo < 0) nuevo = 0;

  if (nuevo > prod.maxCantidad) {
    mostrarToast("Para este prototipo el máximo es 10 por producto.");
    return;
  }

  if (nuevo === 0) delete estado.carrito[idProducto];
  else estado.carrito[idProducto] = Math.round(nuevo * 2) / 2; // mantiene pasos de 0.5 exactos

  if (delta > 0 && actual === 0) mostrarToast("¡Agregado a tu canasta!");
  dibujarBarraInferior();

  if (estado.pestana === "mercado") actualizarResultadosMercado();
  else if (estado.pestana === "carrito") vistaCarrito();
}

// ======================================================
// PERFIL FAMILIA: 2. CARRITO Y TOTALES REDONDEADOS
// ======================================================

function calcularTotalesCarrito() {
  let sumaCruda = 0;
  const campesinos = new Set();
  const zonas = new Set();

  for (const [id, cant] of Object.entries(estado.carrito)) {
    const prod = PRODUCTOS.find((p) => p.id === Number(id));
    if (prod && cant > 0) {
      sumaCruda += prod.precio * cant;
      campesinos.add(prod.campesino);
      zonas.add(prod.zona);
    }
  }

  // Redondeo exacto: Productos a $50, Envío $15.000, Servicio 4% a $100
  const productos = sumaCruda > 0 ? Math.round(sumaCruda / 50) * 50 : 0;
  const envio = productos > 0 ? 15000 : 0;
  const servicio = productos > 0 ? Math.round((productos * 0.04) / 100) * 100 : 0;
  const total = productos + envio + servicio;

  return { productos, envio, servicio, total, numCampesinos: campesinos.size, zonas: [...zonas] };
}

function vistaCarrito() {
  const items = Object.entries(estado.carrito)
    .map(([id, cant]) => ({ ...PRODUCTOS.find((p) => p.id === Number(id)), cant }))
    .filter((i) => i.id && i.cant > 0);

  if (items.length === 0) {
    document.getElementById("main-view").innerHTML = `
      <div class="card" style="text-align:center; padding:32px 20px; margin-top:12px;">
        <svg viewBox="0 0 120 100" width="110" height="92" style="margin-bottom:12px;" aria-hidden="true">
          <circle cx="60" cy="54" r="42" fill="#EFE4D4"/>
          <path d="M28 52 H92 L84 82 H36 Z" fill="#8B5E3C"/>
          <path d="M40 52 C40 30, 80 30, 80 52" stroke="#2F6B3A" stroke-width="6" fill="none" stroke-linecap="round"/>
        </svg>
        <h2 style="font-size:22px; margin-bottom:6px;">Tu canasta está vacía</h2>
        <p style="color:var(--texto-suave); margin-bottom:14px;">Agrega frutas, verduras y hortalizas frescas o elige un Mercado Armado.</p>
        <button class="btn-primary" onclick="cambiarPestana('mercado')">Ir al mercado</button>
      </div>
    `;
    return;
  }

  const { productos, envio, servicio, total, numCampesinos, zonas } = calcularTotalesCarrito();

  const listaHtml = items.map((item) => `
    <div class="cart-row">
      <div style="display:flex; align-items:center; gap:10px; min-width:0;">
        <div class="cat-circle ${item.colorCat}" style="width:44px; height:44px; font-size:22px;">${item.emoji}</div>
        <div style="min-width:0;">
          <strong style="display:block; font-size:15px;">${formatearCantidadUnidad(item, item.cant)} ${item.nombre}</strong>
          <div style="font-size:13px; color:var(--texto-suave);">${formatoCOP(item.precio)} / ${item.etiquetaUnidad}</div>
        </div>
      </div>
      <div style="text-align:right; flex-shrink:0;">
        <div class="qty-pill" style="margin-bottom:4px;">
          <button class="qty-mini" onclick="cambiarCantidad(${item.id}, -1)">−</button>
          <strong style="font-size:13px;">${item.cant === 0.5 ? "½" : item.cant}</strong>
          <button class="qty-mini" onclick="cambiarCantidad(${item.id}, 1)">+</button>
        </div>
        <strong style="font-size:14px; color:var(--bosque);">${formatoCOP(item.precio * item.cant)}</strong>
      </div>
    </div>
  `).join("");

  document.getElementById("main-view").innerHTML = `
    <div class="section-head" style="margin-top:6px;">
      <h3 class="section-title">Tu carrito</h3>
      <span class="section-sub">${items.length} productos</span>
    </div>

    <div class="impact-card">
      <span style="font-size:32px;">🤝</span>
      <div>
        <strong style="color:var(--bosque); display:block;">Impacto de tu compra</strong>
        <span style="font-size:15px;">Con tu compra apoyas a <strong>${numCampesinos} campesinos</strong> de <strong>${zonas.join(", ")}</strong>.</span>
      </div>
    </div>

    <div class="card">${listaHtml}</div>

    <div class="summary-card">
      <div class="section-sub" style="margin-bottom:10px;">Resumen transparente</div>
      <div class="summary-line"><span>Productos</span><strong>${formatoCOP(productos)}</strong></div>
      <div class="summary-line"><span>Envío</span><strong>${formatoCOP(envio)}</strong></div>
      <div class="summary-line"><span>Servicio (4%)</span><strong>${formatoCOP(servicio)}</strong></div>
      <div class="summary-total">
        <span>Total</span>
        <span data-count="${total}">${formatoCOP(total)}</span>
      </div>
      <button class="btn-primary" onclick="abrirModalPago()">Pagar ${formatoCOP(total)}</button>
    </div>
  `;
}

function abrirModalPago() {
  const { total } = calcularTotalesCarrito();
  const metodos = ["Nequi", "Daviplata", "Tarjeta"];
  const opciones = metodos.map((m) => `
    <button class="pay-option ${estado.metodoPago === m ? "selected" : ""}" onclick="elegirMetodoPago('${m}')">
      <span>${m === "Nequi" ? "📱" : m === "Daviplata" ? "📲" : "💳"} ${m}</span>
      <span>${estado.metodoPago === m ? "●" : "○"}</span>
    </button>
  `).join("");

  abrirModal(`
    <h2 class="section-title" style="margin-bottom:6px;">Elige cómo pagar</h2>
    <p style="color:var(--texto-suave); margin-bottom:14px;">Total a pagar: <strong>${formatoCOP(total)}</strong></p>
    ${opciones}
    <button class="btn-primary" onclick="confirmarPagoSimulado()">Confirmar pago con ${estado.metodoPago}</button>
    <button class="btn-secondary" onclick="cerrarModal()">Cancelar</button>
  `);
}

function elegirMetodoPago(m) {
  estado.metodoPago = m;
  abrirModalPago();
}

function confirmarPagoSimulado() {
  const { productos, envio } = calcularTotalesCarrito();
  const listaNueva = Object.entries(estado.carrito).map(([id, cant]) => {
    const p = PRODUCTOS.find((item) => item.id === Number(id));
    return p ? `${formatearCantidadUnidad(p, cant)} ${p.nombre}` : "";
  }).filter(Boolean);

  estado.pedidos[0].valorProductos = productos;
  estado.pedidos[0].envio = envio;
  if (listaNueva.length > 0) estado.pedidos[0].listaAlistamiento = listaNueva;

  abrirModal(`
    <div style="text-align:center; padding:8px 0;">
      <div class="success-check">✓</div>
      <h2 class="section-title" style="margin-bottom:6px;">¡Pago confirmado!</h2>
      <p style="color:var(--texto-suave); margin-bottom:16px;">
        Tu pedido <strong>#RJ-1024</strong> ya llegó a la finca de Hernando Rojas en Sibaté.
      </p>
      <button class="btn-primary" onclick="cerrarModal(); mostrarToast('¡Listo! Pedido confirmado'); cambiarPestana('pedido');">
        Ver mi pedido #RJ-1024
      </button>
    </div>
  `);
}

// ======================================================
// PERFIL FAMILIA: 3. MI PEDIDO #RJ-1024 + MAPA SVG
// ======================================================

function vistaMiPedido() {
  const pedido = estado.pedidos[0];
  const pasos = [
    { nombre: "Pedido confirmado", desc: "Hernando recibió tu lista de mercado.", ico: "📝" },
    { nombre: "Preparando", desc: "Cosechando y empacando tus alimentos.", ico: "🧺" },
    { nombre: "Enviado por el campesino", desc: "Tu mercado va camino a tu puerta.", ico: "🌿" },
    { nombre: "Entregado", desc: "Recibido directamente en tu hogar.", ico: "🏡" }
  ];
  const idxActual = pasos.findIndex((p) => p.nombre === pedido.estado);

  const timelineHtml = pasos.map((p, idx) => `
    <div class="step ${idx <= idxActual ? "done" : ""} ${idx === idxActual && idx < 3 ? "current" : ""}">
      <div class="step-ico">${p.ico}</div>
      <div>
        <strong>${p.nombre}</strong>
        <p style="font-size:14px; color:var(--texto-suave);">${p.desc}</p>
      </div>
    </div>
  `).join("");

  const listaPedidoHtml = pedido.listaAlistamiento.map((it) => `<li>• ${it}</li>`).join("");

  let cierreHtml = "";
  if (!pedido.recibidoPorFamilia) {
    cierreHtml = `<button class="btn-primary" onclick="confirmarReciboFamilia()">Confirmar que recibí mi mercado</button>`;
  } else {
    const estrellas = [1, 2, 3, 4, 5].map((n) => `
      <button class="star-btn ${pedido.calificacion >= n ? "active" : ""}" onclick="calificarPedido(${n})">★</button>
    `).join("");
    cierreHtml = `
      <div class="card card-accent" style="text-align:center;">
        <strong style="color:var(--bosque); font-size:18px;">¡Gracias por confirmar!</strong>
        <p style="font-size:15px; color:var(--texto-suave); margin-top:4px;">Califica la frescura de la cosecha de Hernando:</p>
        <div class="stars-row">${estrellas}</div>
        ${pedido.calificacion > 0 ? `<p style="font-weight:800; color:var(--bosque);">Calificaste con ${pedido.calificacion} estrellas</p>` : ""}
      </div>
    `;
  }

  document.getElementById("main-view").innerHTML = `
    <div class="section-head" style="margin-top:6px;">
      <h3 class="section-title">Mi pedido #${pedido.id}</h3>
      <span class="badge ${pedido.estado === "Entregado" ? "badge-entregado" : "badge-hoja"}">${pedido.estado}</span>
    </div>

    <div class="card" style="padding:14px;">
      <div class="section-sub" style="margin-bottom:8px;">Ruta directa: Sibaté → Tu puerta</div>
      <svg viewBox="0 0 360 110" width="100%" height="110" aria-label="Mapa de ruta de la finca a la casa">
        <rect width="360" height="110" rx="14" fill="#F4EFE4"/>
        <path d="M0 88 Q90 60 180 76 T360 66 L360 110 L0 110 Z" fill="#E4F3E1"/>
        <path d="M52 62 C115 24, 240 94, 308 48" stroke="#2F6B3A" stroke-width="4" stroke-dasharray="7 6" fill="none" stroke-linecap="round"/>
        <circle cx="52" cy="62" r="16" fill="#8B5E3C"/>
        <text x="52" y="68" text-anchor="middle" font-size="16">🌾</text>
        <text x="52" y="96" text-anchor="middle" font-size="11" font-weight="700" fill="#2B2B2B">Finca Sibaté</text>
        <circle cx="308" cy="48" r="16" fill="#2F6B3A"/>
        <text x="308" y="54" text-anchor="middle" font-size="16">🏡</text>
        <text x="308" y="82" text-anchor="middle" font-size="11" font-weight="700" fill="#2B2B2B">Tu hogar</text>
      </svg>
    </div>

    <div class="card card-accent">
      <div class="section-sub">Seguimiento en vivo</div>
      <div class="timeline">${timelineHtml}</div>
      <ul class="checklist">${listaPedidoHtml}</ul>
    </div>

    <div class="card card-accent card-accent-earth">
      <div style="display:flex; align-items:center; gap:12px; margin-bottom:8px;">
        <div class="initials-circle initials-earth">HR</div>
        <div>
          <span style="font-size:12px; font-weight:800; color:var(--naranja);">TU CAMPESINO</span>
          <strong style="display:block; font-size:18px;">${estado.campesino.nombre}</strong>
          <span style="font-size:14px; color:var(--texto-suave);">${estado.campesino.vereda}</span>
        </div>
      </div>
      <p style="font-size:15px; color:var(--texto-suave);">${estado.campesino.historia}</p>
      <div class="farmer-quote">${estado.campesino.frase}</div>
    </div>

    ${cierreHtml}
  `;
}

function confirmarReciboFamilia() {
  const pedido = estado.pedidos[0];
  pedido.estado = "Entregado";
  pedido.recibidoPorFamilia = true;
  acreditarSaldoCampesino(pedido);
  mostrarToast("¡Listo! Mercado recibido");
  vistaMiPedido();
}

function calificarPedido(n) {
  estado.pedidos[0].calificacion = n;
  mostrarToast("¡Gracias por calificar!");
  vistaMiPedido();
}

// ======================================================
// PERFIL CAMPESINO: 1. PEDIDOS + KPIs + GRÁFICA SVG
// ======================================================

function graficaBarrasSVG() {
  const max = Math.max(...VENTAS_7_DIAS.map((v) => v.monto));
  const barras = VENTAS_7_DIAS.map((v, i) => {
    const h = Math.round((v.monto / max) * 70);
    const x = 14 + i * 48;
    const y = 86 - h;
    const fill = i === VENTAS_7_DIAS.length - 1 ? "#D9822B" : "#6FAE4F";
    return `
      <rect x="${x}" y="${y}" width="26" height="${h}" rx="7" fill="${fill}"/>
      <text x="${x + 13}" y="104" text-anchor="middle" font-size="11" font-weight="700" fill="#595751">${v.dia}</text>
    `;
  }).join("");

  return `
    <div class="card">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
        <strong style="font-size:16px;">Ventas últimos 7 días</strong>
        <span style="font-size:13px; font-weight:700; color:var(--naranja);">Hoy en curso</span>
      </div>
      <svg viewBox="0 0 350 112" width="100%" height="112" aria-label="Gráfica de ventas de los últimos 7 días">
        ${barras}
      </svg>
    </div>
  `;
}

function vistaPedidosCampesino() {
  const porAlistar = estado.pedidos.filter((p) => p.estado !== "Entregado").length;

  const tarjetas = estado.pedidos.map((p) => {
    const totalCampesino = p.valorProductos + p.envio;
    const itemsHtml = p.listaAlistamiento.map((it) => `<li>• ${it}</li>`).join("");
    let btnHtml = "";

    if (!p.aceptado) {
      btnHtml = `<button class="btn-primary" onclick="aceptarPedidoCampesino('${p.id}')">Aceptar</button>`;
    } else if (p.estado === "Pedido confirmado") {
      btnHtml = `<button class="btn-primary" onclick="abrirFotoPaso('${p.id}', 'Preparando', 'Marcar preparando')">Marcar preparando</button>`;
    } else if (p.estado === "Preparando") {
      btnHtml = `<button class="btn-primary" onclick="abrirFotoPaso('${p.id}', 'Enviado por el campesino', 'Marcar enviado')">Marcar enviado</button>`;
    } else if (p.estado === "Enviado por el campesino") {
      btnHtml = `<button class="btn-primary" onclick="abrirFotoPaso('${p.id}', 'Entregado', 'Marcar entregado')">Marcar entregado</button>`;
    } else {
      btnHtml = `<div style="margin-top:12px; font-weight:800; color:var(--bosque);">✓ Entregado y sumado a tu saldo</div>`;
    }

    return `
      <article class="card card-accent card-accent-orange">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
          <strong style="font-size:18px;">Pedido #${p.id}</strong>
          <span class="badge ${p.estado === "Entregado" ? "badge-entregado" : "badge-naranja"}">${p.estado}</span>
        </div>
        <p style="font-weight:700;">${p.familia}</p>
        <p style="font-size:14px; color:var(--tierra); margin-top:2px;">📍 ${p.direccion}</p>
        <ul class="checklist">${itemsHtml}</ul>
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <span style="font-size:14px; color:var(--texto-suave);">Recibes (productos + envío)</span>
          <strong style="font-size:20px; color:var(--bosque);">${formatoCOP(totalCampesino)}</strong>
        </div>
        ${btnHtml}
      </article>
    `;
  }).join("");

  document.getElementById("main-view").innerHTML = `
    <div class="kpi-grid" style="margin-top:8px;">
      <div class="kpi-card">
        <div class="kpi-label">Por alistar</div>
        <div class="kpi-val">${porAlistar}</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">Semana</div>
        <div class="kpi-val" style="font-size:15px;">${formatoCOP(estado.campesino.ventasSemana)}</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">Mi saldo</div>
        <div class="kpi-val" style="font-size:15px;" data-count="${estado.campesino.saldo}">${formatoCOP(estado.campesino.saldo)}</div>
      </div>
    </div>

    ${graficaBarrasSVG()}

    <div class="section-head">
      <h3 class="section-title">Pedidos entrantes</h3>
      <span class="section-sub">Lista de alistamiento</span>
    </div>
    ${tarjetas}
  `;
}

function aceptarPedidoCampesino(id) {
  const p = estado.pedidos.find((item) => item.id === id);
  if (!p) return;
  p.aceptado = true;
  mostrarToast("¡Listo! Pedido aceptado");
  vistaPedidosCampesino();
}

function abrirFotoPaso(idPedido, nuevoEstado, textoBoton) {
  abrirModal(`
    <h2 class="section-title" style="margin-bottom:6px;">${textoBoton}</h2>
    <p style="color:var(--texto-suave);">Toma una foto rápida de respaldo para la familia (simulada).</p>
    <div class="photo-box">
      <div style="font-size:48px;">📸🧺🥕</div>
      <strong style="display:block; margin-top:8px;">Foto lista · Pedido #${idPedido}</strong>
      <span style="font-size:14px; color:var(--texto-suave);">Pasará a: ${nuevoEstado}</span>
    </div>
    <button class="btn-primary" onclick="confirmarPasoCampesino('${idPedido}', '${nuevoEstado}')">Confirmar</button>
    <button class="btn-secondary" onclick="cerrarModal()">Cancelar</button>
  `);
}

function confirmarPasoCampesino(idPedido, nuevoEstado) {
  const p = estado.pedidos.find((item) => item.id === idPedido);
  if (!p) return;
  p.estado = nuevoEstado;
  if (nuevoEstado === "Entregado") acreditarSaldoCampesino(p);
  cerrarModal();
  mostrarToast("¡Listo! Estado actualizado");
  vistaPedidosCampesino();
  animarConteos();
}

function acreditarSaldoCampesino(pedido) {
  if (pedido.saldoAcreditado) return;
  const pago = pedido.valorProductos + pedido.envio;
  estado.campesino.saldo += pago;
  estado.campesino.historial.unshift({
    titulo: `Pedido #${pedido.id} entregado`,
    fecha: "Ahora mismo · Productos + envío",
    monto: pago,
    tipo: "in"
  });
  pedido.saldoAcreditado = true;
}

// ======================================================
// PERFIL CAMPESINO: 2. MIS PRODUCTOS (SIN PERDER FOCO)
// ======================================================

function vistaMisProductos() {
  const mios = PRODUCTOS.filter((p) => p.campesino === "Hernando Rojas");
  const cards = mios.map((p) => `
    <article class="card">
      <div style="display:flex; align-items:center; justify-content:space-between; gap:10px;">
        <div style="display:flex; align-items:center; gap:12px;">
          <div class="cat-circle ${p.colorCat}" style="width:50px; height:50px; font-size:26px;">${p.emoji}</div>
          <div>
            <strong>${p.nombre}</strong>
            <div id="estado-prod-${p.id}" style="font-size:13px; color:var(--texto-suave);">
              ${p.unidad} · ${p.disponible ? "Visible en mercado" : "Pausado"}
            </div>
          </div>
        </div>
        <label class="toggle-switch" aria-label="Disponibilidad de ${p.nombre}">
          <input type="checkbox" ${p.disponible ? "checked" : ""} onchange="cambiarDisponibilidad(${p.id}, this.checked)">
          <span class="toggle-slider"></span>
        </label>
      </div>
      <div style="display:flex; align-items:center; justify-content:space-between; margin-top:12px; padding-top:12px; border-top:1px solid var(--borde);">
        <span style="font-size:14px; font-weight:700; color:var(--tierra);">Precio por ${p.etiquetaUnidad}:</span>
        <input class="price-input" type="number" step="25" min="100" value="${p.precio}"
          onchange="actualizarPrecioProducto(${p.id}, this.value)">
      </div>
    </article>
  `).join("");

  document.getElementById("main-view").innerHTML = `
    <div class="section-head" style="margin-top:6px;">
      <h3 class="section-title">Mis productos (${mios.length})</h3>
      <span class="section-sub">Tú fijas el precio</span>
    </div>
    ${cards}
  `;
}

function cambiarDisponibilidad(id, activo) {
  const prod = PRODUCTOS.find((p) => p.id === id);
  if (!prod) return;
  prod.disponible = activo;
  const sub = document.getElementById(`estado-prod-${id}`);
  if (sub) sub.textContent = `${prod.unidad} · ${activo ? "Visible en mercado" : "Pausado"}`;
  mostrarToast(activo ? "¡Listo! Producto visible" : "Producto pausado");
}

function actualizarPrecioProducto(id, nuevoPrecio) {
  const prod = PRODUCTOS.find((p) => p.id === id);
  const valor = Number(nuevoPrecio);
  if (!prod || isNaN(valor) || valor < 100) return;
  prod.precio = valor;
  mostrarToast("¡Listo! Precio actualizado");
}

// ======================================================
// PERFIL CAMPESINO: 3. MI SALDO
// ======================================================

function vistaSaldoCampesino() {
  const historialHtml = estado.campesino.historial.map((h) => `
    <div class="cart-row">
      <div style="display:flex; align-items:center; gap:10px;">
        <div class="cat-circle ${h.tipo === "in" ? "bg-verduras" : "bg-tuberculos"}" style="width:42px; height:42px; font-size:20px;">
          ${h.tipo === "in" ? "⬇️" : "🏦"}
        </div>
        <div>
          <strong>${h.titulo}</strong>
          <div style="font-size:13px; color:var(--texto-suave);">${h.fecha}</div>
        </div>
      </div>
      <strong style="color:${h.monto >= 0 ? "var(--bosque)" : "var(--tierra)"};">
        ${h.monto >= 0 ? "+" : ""}${formatoCOP(h.monto)}
      </strong>
    </div>
  `).join("");

  document.getElementById("main-view").innerHTML = `
    <div class="section-head" style="margin-top:6px;">
      <h3 class="section-title">Mi saldo</h3>
    </div>

    <div class="balance-card">
      <span style="font-size:15px; opacity:0.92;">Saldo disponible</span>
      <div class="balance-number" data-count="${estado.campesino.saldo}">${formatoCOP(estado.campesino.saldo)}</div>
      <p style="font-size:14px; opacity:0.92;">Cuenta: ${estado.campesino.cuenta}</p>
      <button class="btn-primary" style="background:var(--blanco); color:var(--bosque);"
        ${estado.campesino.saldo <= 0 ? "disabled" : ""} onclick="abrirModalRetiro()">
        Retirar a mi cuenta bancaria
      </button>
    </div>

    <div class="tip-card">
      <strong style="color:var(--tierra);">Pago claro y sin descuentos:</strong> recibes el <strong>100% del valor de tus productos más el envío</strong>. El dinero aparece disponible apenas el pedido queda entregado.
    </div>

    <div class="card">
      <div class="section-sub" style="margin-bottom:6px;">Historial de movimientos</div>
      ${historialHtml}
    </div>
  `;
}

function abrirModalRetiro() {
  abrirModal(`
    <h2 class="section-title" style="margin-bottom:6px;">Confirmar retiro</h2>
    <p style="color:var(--texto-suave); margin-bottom:14px;">
      Enviaremos <strong>${formatoCOP(estado.campesino.saldo)}</strong> a tu cuenta <strong>${estado.campesino.cuenta}</strong>.
    </p>
    <button class="btn-primary" onclick="confirmarRetiro()">Sí, retirar ahora</button>
    <button class="btn-secondary" onclick="cerrarModal()">Cancelar</button>
  `);
}

function confirmarRetiro() {
  const monto = estado.campesino.saldo;
  if (monto <= 0) return;
  estado.campesino.saldo = 0;
  estado.campesino.historial.unshift({
    titulo: "Retiro a cuenta bancaria",
    fecha: "Ahora mismo · Transferencia",
    monto: -monto,
    tipo: "out"
  });
  cerrarModal();
  mostrarToast("¡Listo! Retiro enviado");
  vistaSaldoCampesino();
}

// ======================================================
// PERFIL CAMPESINO: 4. APRENDER + MINIATURAS SVG
// ======================================================

function vistaAprender() {
  const videosHtml = VIDEOS_APRENDER.map((v) => `
    <article class="card video-card" onclick="abrirVideo(${v.id})">
      <div class="video-thumb">
        <svg viewBox="0 0 84 64" width="84" height="64" aria-hidden="true">
          <rect width="84" height="64" fill="${v.color}"/>
          <circle cx="68" cy="14" r="18" fill="rgba(255,255,255,0.14)"/>
          <circle cx="42" cy="32" r="16" fill="rgba(255,255,255,0.92)"/>
          <polygon points="38,24 52,32 38,40" fill="${v.color}"/>
        </svg>
      </div>
      <div style="flex:1;">
        <span class="badge badge-hoja" style="margin-bottom:4px;">Gratis · ${v.duracion}</span>
        <strong style="display:block; font-size:16px; line-height:1.25;">${v.titulo}</strong>
      </div>
    </article>
  `).join("");

  document.getElementById("main-view").innerHTML = `
    <div class="section-head" style="margin-top:6px;">
      <h3 class="section-title">Aprender</h3>
      <span class="section-sub">Clases cortas</span>
    </div>

    <div class="tip-card">
      <span style="font-size:13px; font-weight:800; color:var(--naranja);">💡 CONSEJO DEL DÍA</span>
      <strong style="display:block; font-size:17px; margin:4px 0;">Incluye tu trabajo en el precio</strong>
      <p style="font-size:15px; color:var(--texto);">Antes de fijar el valor por libra o unidad, suma semillas, abono, empaque y las horas que trabajaste en el surco. Tu tiempo también vale.</p>
    </div>

    ${videosHtml}
  `;
}

function abrirVideo(id) {
  const v = VIDEOS_APRENDER.find((item) => item.id === id);
  if (!v) return;
  abrirModal(`
    <span class="badge badge-hoja">Video gratis · ${v.duracion}</span>
    <h2 class="section-title" style="margin:8px 0;">${v.titulo}</h2>
    <div class="photo-box" style="background:${v.color}; color:#FFF; border:none;">
      <div style="font-size:44px;">${v.emoji}</div>
      <strong style="display:block; margin-top:6px;">Reproduciendo clase simulada</strong>
    </div>
    <p style="font-size:16px; margin-bottom:12px;">${v.resumen}</p>
    <button class="btn-primary" onclick="cerrarModal()">Entendido</button>
  `);
}

// ======================================================
// CONTROL DE MODALES
// ======================================================

function abrirModal(html) {
  document.getElementById("modal-content").innerHTML = html;
  document.getElementById("modal-overlay").classList.remove("hidden");
}

function cerrarModal() {
  document.getElementById("modal-overlay").classList.add("hidden");
}

function cerrarModalFondo(e) {
  if (e.target.id === "modal-overlay") cerrarModal();
}
