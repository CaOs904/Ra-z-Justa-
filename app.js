// ======================================================
// RAÍZ JUSTA - MODELO DE TIENDAS POR CAMPESINO (LOCALSTORAGE)
// Requiere cargar productos.js antes de este archivo
// ======================================================

const STORAGE_KEY = "raiz_justa_estado_v5";

const VIDEOS_APRENDER = [
  { id: 1, titulo: "Cómo calcular lo que te cuesta producir", duracion: "4 min", color: "#2F6B3A", emoji: "🧮", resumen: "Suma semillas, abono, empaque y tu jornal diario para saber exactamente desde qué precio ganas." },
  { id: 2, titulo: "Cómo fijar tu precio justo", duracion: "5 min", color: "#8B5E3C", emoji: "⚖️", resumen: "Usa una regla clara para cubrir costos, ahorrar para la próxima siembra y vender sin intermediarios." },
  { id: 3, titulo: "Cómo negociar y no dejarte estafar", duracion: "6 min", color: "#D9822B", emoji: "🤝", resumen: "Claves prácticas para pactar cantidades, fechas y pagos directos con total tranquilidad." }
];

const MOTIVOS_RECHAZO = [
  "No tengo todos los productos",
  "Sin disponibilidad esta semana",
  "Queda muy lejos de mi ruta",
  "Otro"
];

// Estado inicial 100% en cero
function crearEstadoInicial() {
  return {
    perfil: null,                  // "familia" | "campesino"
    pestana: "mercado",            // familia: mercado, carrito, pedido | campesino: pedidos, productos, saldo, aprender
    campesinoActivoId: "hernando", // Campesino logueado en perfil Campesino
    campesinoVistoId: null,        // Tienda de campesino abierta en perfil Familia (null = lista de tiendas)
    filtroInicio: "Todos",         // Todos | Verduras | Frutas | Hortalizas
    filtroTienda: "Todas",         // Categoría dentro de la página de un campesino
    busqueda: "",
    metodoPago: "Nequi",
    consecutivoPedido: 1001,       // #RJ-1001, #RJ-1002...
    carrito: {
      campesinoId: null,
      items: {}                    // { [prodId]: cantidad }
    },
    pendienteReasignar: null,      // { pedidoId, items: [{id, qty, nombre}] } si la familia eligió cambiar de campesino
    pedidos: [],                   // Pedidos reales completos dirigidos a un solo campesino
    retiros: [],                   // { campesinoId, monto, fecha }
    preciosCampesino: {},          // { [campesinoId]: { [prodId]: precio } }
    pausadosCampesino: {},         // { [campesinoId]: { [prodId]: true } }
    mostrarRechazados: false,
    barraSeleccionada: null
  };
}

let estado = cargarEstado();
let timerBusqueda = null;
let motivoSeleccionado = MOTIVOS_RECHAZO[0];

function cargarEstado() {
  try {
    const guardado = localStorage.getItem(STORAGE_KEY);
    if (!guardado) return crearEstadoInicial();
    const parsed = JSON.parse(guardado);
    const base = crearEstadoInicial();
    return {
      ...base,
      ...parsed,
      carrito: { ...base.carrito, ...(parsed.carrito || {}) }
    };
  } catch (e) {
    return crearEstadoInicial();
  }
}

function guardarEstado() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(estado));
  } catch (e) {}
}

// Sincronización en tiempo real si la app está abierta en otra pestaña
window.addEventListener("storage", (e) => {
  if (e.key === STORAGE_KEY) {
    estado = cargarEstado();
    if (estado.perfil) {
      actualizarEncabezado();
      dibujarBarraInferior();
      dibujarVistaActual();
    }
  }
});

// ======================================================
// UTILIDADES DE CAMPESINOS, PRECIOS Y FORMATO
// ======================================================

function obtenerCampesino(id) {
  return CAMPESINOS.find((c) => c.id === id) || CAMPESINOS[0];
}

function obtenerPrecioProducto(campesinoId, prodId) {
  const custom = estado.preciosCampesino[campesinoId]?.[prodId];
  if (custom) return custom;
  const prod = PRODUCTOS.find((p) => p.id === prodId);
  return prod ? prod.precioBase : 0;
}

function estaDisponible(campesinoId, prodId) {
  return !(estado.pausadosCampesino[campesinoId]?.[prodId]);
}

function obtenerProductosDeCampesino(campesinoId, soloDisponibles = true) {
  const camp = obtenerCampesino(campesinoId);
  return camp.productosIds
    .map((id) => PRODUCTOS.find((p) => p.id === id))
    .filter((p) => p && (!soloDisponibles || estaDisponible(campesinoId, p.id)))
    .map((p) => ({
      ...p,
      precio: obtenerPrecioProducto(campesinoId, p.id),
      disponible: estaDisponible(campesinoId, p.id)
    }));
}

function obtenerCalificacionCampesino(campesinoId) {
  const calificados = estado.pedidos.filter((p) => p.campesinoId === campesinoId && p.calificacion > 0);
  if (calificados.length === 0) return { promedio: null, total: 0 };
  const suma = calificados.reduce((acc, p) => acc + p.calificacion, 0);
  return { promedio: (suma / calificados.length).toFixed(1), total: calificados.length };
}

function contarPedidosNuevos(campesinoId) {
  return estado.pedidos.filter((p) => p.campesinoId === campesinoId && p.estado === "Nuevo").length;
}

function formatoCOP(valor) {
  const signo = valor < 0 ? "-" : "";
  return signo + "$" + Math.abs(Math.round(valor)).toLocaleString("es-CO");
}

function normalizarTexto(texto) {
  return String(texto || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function claveFechaLocal(fecha = new Date()) {
  const d = new Date(fecha);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

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
  window._timerToast = setTimeout(() => el.classList.add("hidden"), 2600);
}

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

const ICONOS_NAV = {
  mercado: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l2-4h14l2 4"/><path d="M3 9v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9"/><path d="M9 13h6"/></svg>`,
  carrito: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="20" r="1.5"/><circle cx="18" cy="20" r="1.5"/><path d="M2 3h3l2.4 11.2a2 2 0 0 0 2 1.6h8.8a2 2 0 0 0 2-1.5L22 7H6"/></svg>`,
  pedido: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l9 4.5v11L12 22l-9-4.5v-11L12 2z"/><path d="M12 22V11"/><path d="M21 6.5L12 11 3 6.5"/></svg>`,
  productos: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22V12"/><path d="M12 12C12 7 17 4 21 5c0 5-3 8-9 7z"/><path d="M12 14C12 9 7 6 3 7c0 5 3 8 9 7z"/></svg>`,
  saldo: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="5" width="20" height="14" rx="3"/><circle cx="12" cy="12" r="3"/></svg>`,
  aprender: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 8l10-4 10 4-10 4-10-4z"/><path d="M6 10v6c0 2 3 3 6 3s6-1 6-3v-6"/></svg>`
};

// ======================================================
// NAVEGACIÓN, MENÚ DE PERFIL Y REINICIAR DEMO
// ======================================================

function entrarPerfil(perfil, campesinoId) {
  estado.perfil = perfil;
  if (campesinoId) estado.campesinoActivoId = campesinoId;
  estado.pestana = perfil === "familia" ? "mercado" : "pedidos";
  estado.barraSeleccionada = null;
  guardarEstado();

  document.getElementById("welcome-screen").classList.add("hidden");
  document.getElementById("app-shell").classList.remove("hidden");

  actualizarEncabezado();
  dibujarBarraInferior();
  dibujarVistaActual();

  if (perfil === "campesino") {
    const nuevos = estado.pedidos.filter((p) => p.campesinoId === estado.campesinoActivoId && p.estado === "Nuevo");
    if (nuevos.length > 0) {
      mostrarToast(`Nuevo pedido #${nuevos[0].id}`);
    }
  }
}

function actualizarEncabezado() {
  const iniciales = document.getElementById("header-initials");
  const titulo = document.getElementById("header-title");
  const sub = document.getElementById("header-subtitle");

  if (estado.perfil === "familia") {
    iniciales.textContent = "FM";
    titulo.textContent = "Buenas, familia";
    sub.textContent = "Bogotá · Elige tu campesino";
  } else {
    const camp = obtenerCampesino(estado.campesinoActivoId);
    const fechaHoy = new Date().toLocaleDateString("es-CO", { weekday: "long", day: "numeric", month: "short" });
    iniciales.textContent = camp.iniciales;
    titulo.textContent = `Hola, ${camp.nombre.split(" ")[0]}`;
    sub.textContent = `${fechaHoy.charAt(0).toUpperCase() + fechaHoy.slice(1)} · ${camp.municipio}`;
  }
}

function abrirMenuPerfil() {
  const listaCampesinos = CAMPESINOS.map((c) => {
    const activo = estado.perfil === "campesino" && estado.campesinoActivoId === c.id;
    const nuevos = contarPedidosNuevos(c.id);
    return `
      <button class="pay-option ${activo ? "selected" : ""}" onclick="cerrarModal(); entrarPerfil('campesino', '${c.id}');">
        <span>👨‍🌾 ${c.nombre} <small style="color:var(--texto-suave); font-weight:600;">(${c.municipio})</small></span>
        <span style="display:flex; align-items:center; gap:8px;">
          ${nuevos > 0 ? `<span class="badge badge-rojo" style="background:var(--rojo); color:#FFF;">${nuevos}</span>` : ""}
          <span>${activo ? "●" : "○"}</span>
        </span>
      </button>
    `;
  }).join("");

  abrirModal(`
    <h2 class="section-title" style="margin-bottom:10px;">Cambiar perfil</h2>
    <button class="pay-option ${estado.perfil === "familia" ? "selected" : ""}" onclick="cerrarModal(); entrarPerfil('familia');">
      <span>🧺 Perfil Familia (Bogotá)</span>
      <span>${estado.perfil === "familia" ? "●" : "○"}</span>
    </button>
    <div class="section-sub" style="margin:12px 0 8px;">Entrar como campesino:</div>
    ${listaCampesinos}
    <button class="btn-secondary" onclick="cerrarModal(); volverBienvenida();">Ir a pantalla de bienvenida</button>
    <button class="btn-danger-outline" onclick="confirmarReiniciarDemo()">🔄 Reiniciar demo (volver todo a 0)</button>
  `);
}

function confirmarReiniciarDemo() {
  abrirModal(`
    <h2 class="section-title" style="margin-bottom:8px;">¿Reiniciar toda la demo?</h2>
    <p style="color:var(--texto-suave); margin-bottom:14px;">
      Se borrarán todos los pedidos, el carrito, las calificaciones, las ventas y los saldos para empezar desde $0.
    </p>
    <button class="btn-danger-outline" onclick="ejecutarReinicioDemo()">Sí, borrar todo y volver a 0</button>
    <button class="btn-secondary" onclick="cerrarModal()">Cancelar</button>
  `);
}

function ejecutarReinicioDemo() {
  try { localStorage.removeItem(STORAGE_KEY); } catch (e) {}
  estado = crearEstadoInicial();
  cerrarModal();
  volverBienvenida();
  mostrarToast("¡Listo! Demo reiniciada en 0");
}

function volverBienvenida() {
  document.getElementById("app-shell").classList.add("hidden");
  document.getElementById("welcome-screen").classList.remove("hidden");
}

function cambiarPestana(nueva) {
  estado.pestana = nueva;
  if (nueva === "mercado") estado.campesinoVistoId = null;
  guardarEstado();
  dibujarBarraInferior();
  dibujarVistaActual();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function dibujarBarraInferior() {
  const nav = document.getElementById("bottom-nav");
  if (estado.perfil === "familia") {
    const lineas = Object.keys(estado.carrito.items).length;
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
    const nuevos = contarPedidosNuevos(estado.campesinoActivoId);
    nav.innerHTML = `
      <button class="nav-item ${estado.pestana === "pedidos" ? "active" : ""}" onclick="cambiarPestana('pedidos')">
        ${ICONOS_NAV.pedido}<span>Pedidos</span>
        ${nuevos > 0 ? `<span class="nav-badge" style="background:var(--rojo);">${nuevos}</span>` : ""}
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
    if (estado.pestana === "mercado") {
      if (estado.campesinoVistoId) vistaTiendaCampesino(estado.campesinoVistoId);
      else vistaInicioFamilia();
    }
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
// PERFIL FAMILIA: 1. INICIO (TIENDAS DE CAMPESINOS)
// ======================================================

function vistaInicioFamilia() {
  const main = document.getElementById("main-view");
  main.innerHTML = `
    <div class="search-box">
      <span class="search-ico">🔍</span>
      <input id="buscador-inicio" class="search-input" type="search"
        placeholder="Busca papa, tomate, aguacate o campesino..."
        autocomplete="off" value="${estado.busqueda}">
    </div>
    <div id="inicio-resultados"></div>
  `;

  const input = document.getElementById("buscador-inicio");
  input.addEventListener("input", (e) => {
    const valor = e.target.value;
    clearTimeout(timerBusqueda);
    timerBusqueda = setTimeout(() => {
      estado.busqueda = valor;
      actualizarResultadosInicio();
    }, 150);
  });

  actualizarResultadosInicio();
}

function actualizarResultadosInicio() {
  const cont = document.getElementById("inicio-resultados");
  if (!cont) return;

  const q = normalizarTexto(estado.busqueda);
  const filtros = [
    { nombre: "Todos", bg: "#FFFFFF" },
    { nombre: "Verduras", bg: "var(--cat-verduras)" },
    { nombre: "Frutas", bg: "var(--cat-frutas)" },
    { nombre: "Hortalizas", bg: "var(--cat-hierbas)" }
  ];

  const chipsHtml = filtros.map((f) => `
    <button class="chip ${estado.filtroInicio === f.nombre ? "active" : ""}"
      style="background:${f.bg};" onclick="estado.filtroInicio='${f.nombre}'; actualizarResultadosInicio();">${f.nombre}</button>
  `).join("");

  // Filtrar campesinos por categoría y/o búsqueda de producto o nombre
  const campesinosFiltrados = CAMPESINOS.filter((c) => {
    const prods = obtenerProductosDeCampesino(c.id, true);
    const okCat = estado.filtroInicio === "Todos" || prods.some((p) => p.categoria === estado.filtroInicio);
    if (!okCat) return false;
    if (!q) return true;
    const enNombre = normalizarTexto(c.nombre).includes(q) || normalizarTexto(c.municipio).includes(q);
    const enProds = prods.some((p) => normalizarTexto(p.nombre).includes(q));
    return enNombre || enProds;
  });

  const avisoReasignar = estado.pendienteReasignar ? `
    <div class="tip-card" style="border-color:var(--naranja);">
      <strong style="color:var(--tierra);">🔄 Elige otro campesino para tu pedido</strong>
      <p style="font-size:14px; margin-top:4px;">Toca un campesino para cargar los productos de tu pedido anterior que tenga disponibles.</p>
    </div>
  ` : "";

  const tarjetasCampesinos = campesinosFiltrados.map((c) => {
    const prods = obtenerProductosDeCampesino(c.id, true);
    const cal = obtenerCalificacionCampesino(c.id);
    const calTxt = cal.promedio ? `★ ${cal.promedio} (${cal.total})` : "Sin calificaciones aún";
    const chipsEsp = c.especialidades.map((e) => `<span class="badge badge-hoja" style="font-size:12px;">${e}</span>`).join(" ");

    return `
      <article class="card card-accent" style="cursor:pointer;" onclick="abrirTiendaCampesino('${c.id}')">
        <div style="display:flex; gap:12px; align-items:center; margin-bottom:10px;">
          <div style="flex-shrink:0;">${c.avatarSVG}</div>
          <div style="flex:1; min-width:0;">
            <span class="badge badge-naranja" style="font-size:11px; margin-bottom:3px;">✓ Campesino verificado</span>
            <strong style="display:block; font-size:18px;">${c.nombre}</strong>
            <span style="font-size:14px; color:var(--texto-suave);">📍 ${c.municipio} · ${prods.length} productos</span>
          </div>
        </div>
        <div style="display:flex; flex-wrap:wrap; gap:6px; margin-bottom:10px;">${chipsEsp}</div>
        <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px solid var(--borde); padding-top:10px; font-size:14px;">
          <span style="color:var(--tierra); font-weight:700;">Envío $15.000</span>
          <span style="font-weight:700; color:${cal.promedio ? "var(--naranja)" : "var(--texto-suave)"};">${calTxt}</span>
        </div>
      </article>
    `;
  }).join("");

  // Si hay búsqueda escrita, mostrar también los productos coincidentes con su campesino
  let productosBuscadosHtml = "";
  if (q) {
    const coincidencias = [];
    CAMPESINOS.forEach((c) => {
      obtenerProductosDeCampesino(c.id, true).forEach((p) => {
        if (normalizarTexto(p.nombre).includes(q)) {
          coincidencias.push({ ...p, campesinoId: c.id, campesinoNombre: c.nombre, municipio: c.municipio });
        }
      });
    });

    if (coincidencias.length > 0) {
      const grid = coincidencias.slice(0, 12).map((p) => `
        <article class="product-card card-accent" style="cursor:pointer;" onclick="abrirDetalleProducto('${p.campesinoId}', ${p.id})">
          <div>
            <div class="product-top"><div class="cat-circle ${p.colorCat}">${p.emoji}</div></div>
            <div class="product-name">${p.nombre}</div>
            <div class="product-farmer">${p.campesinoNombre} · ${p.municipio}</div>
          </div>
          <div class="product-foot" onclick="event.stopPropagation()">
            <div class="product-price">${formatoCOP(p.precio)}<span class="product-unit">${p.etiquetaUnidad}</span></div>
            <button class="btn-add-circle" style="width:40px; height:40px;" onclick="intentarAgregarAlCarrito('${p.campesinoId}', ${p.id}, 1)">+</button>
          </div>
        </article>
      `).join("");

      productosBuscadosHtml = `
        <div class="section-head">
          <h3 class="section-title">Productos encontrados (${coincidencias.length})</h3>
        </div>
        <div class="products-grid">${grid}</div>
      `;
    }
  }

  cont.innerHTML = `
    ${avisoReasignar}
    <div class="chips-row">${chipsHtml}</div>
    <div class="section-head" style="margin-top:8px;">
      <h3 class="section-title">Campesinos cerca de ti</h3>
      <span class="section-sub">${campesinosFiltrados.length} fincas</span>
    </div>
    ${tarjetasCampesinos || `<p style="color:var(--texto-suave); padding:14px 0;">No encontramos campesinos con "${estado.busqueda}".</p>`}
    ${productosBuscadosHtml}
  `;
}

// ======================================================
// PERFIL FAMILIA: 2. PÁGINA DE UN CAMPESINO (TIENDA)
// ======================================================

function abrirTiendaCampesino(campesinoId) {
  // Si venimos de "Elegir otro campesino" tras un rechazo, cargamos los productos disponibles
  if (estado.pendienteReasignar) {
    const camp = obtenerCampesino(campesinoId);
    const nuevosItems = {};
    const faltantes = [];

    estado.pendienteReasignar.items.forEach((it) => {
      if (camp.productosIds.includes(it.id) && estaDisponible(campesinoId, it.id)) {
        nuevosItems[it.id] = it.qty;
      } else {
        faltantes.push(it.nombre);
      }
    });

    estado.carrito = { campesinoId, items: nuevosItems };
    estado.pendienteReasignar = null;
    guardarEstado();
    dibujarBarraInferior();

    if (faltantes.length > 0) {
      mostrarToast(`Cargado con ${camp.nombre.split(" ")[0]}. Se quitaron ${faltantes.length} no disponibles.`);
    } else {
      mostrarToast(`¡Todos tus productos están listos con ${camp.nombre.split(" ")[0]}!`);
    }
    cambiarPestana("carrito");
    return;
  }

  estado.campesinoVistoId = campesinoId;
  estado.filtroTienda = "Todas";
  guardarEstado();
  vistaTiendaCampesino(campesinoId);
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function calcularTotalMercadoCampesino(campesinoId, mercado) {
  return mercado.lineas.reduce((acc, l) => acc + obtenerPrecioProducto(campesinoId, l.id) * l.qty, 0);
}

function vistaTiendaCampesino(campesinoId) {
  const camp = obtenerCampesino(campesinoId);
  const prods = obtenerProductosDeCampesino(campesinoId, true);
  const cal = obtenerCalificacionCampesino(campesinoId);
  const calTxt = cal.promedio ? `★ ${cal.promedio} (${cal.total})` : "Sin calificaciones aún";

  // 2 mercados armados propios de este campesino
  const mercadosHtml = camp.mercadosArmados.map((m) => {
    const totalM = calcularTotalMercadoCampesino(campesinoId, m);
    return `
      <article class="carousel-card card-accent" style="min-width:255px; flex-direction:column; align-items:stretch; gap:10px; cursor:pointer;"
        onclick="abrirDetalleMercadoCampesino('${campesinoId}', '${m.id}')">
        <div style="display:flex; align-items:center; gap:12px;">
          <div class="cat-circle ${m.color}" style="width:50px; height:50px; font-size:26px;">${m.emoji}</div>
          <div>
            <strong style="font-size:16px; display:block;">${m.nombre}</strong>
            <span style="font-size:13px; color:var(--texto-suave);">${m.desc}</span>
          </div>
        </div>
        <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px solid var(--borde); padding-top:8px;">
          <div>
            <span style="font-size:12px; color:var(--tierra); display:block;">${m.lineas.length} productos</span>
            <strong style="font-size:18px; color:var(--bosque);">${formatoCOP(totalM)}</strong>
          </div>
          <button class="btn-primary" style="width:auto; min-height:40px; padding:8px 14px; margin:0; font-size:14px;"
            onclick="event.stopPropagation(); intentarAgregarMercado('${campesinoId}', '${m.id}')">Agregar</button>
        </div>
      </article>
    `;
  }).join("");

  const catsDisponibles = ["Todas", ...new Set(prods.map((p) => p.categoria))];
  const chipsHtml = catsDisponibles.map((cat) => `
    <button class="chip ${estado.filtroTienda === cat ? "active" : ""}" style="background:#FFF;"
      onclick="estado.filtroTienda='${cat}'; vistaTiendaCampesino('${campesinoId}');">${cat}</button>
  `).join("");

  const filtrados = estado.filtroTienda === "Todas" ? prods : prods.filter((p) => p.categoria === estado.filtroTienda);

  const gridHtml = filtrados.map((p) => {
    const cant = estado.carrito.campesinoId === campesinoId ? (estado.carrito.items[p.id] || 0) : 0;
    const esLibra = p.tipoUnidad === "libra";
    return `
      <article class="product-card card-accent" style="cursor:pointer;" onclick="abrirDetalleProducto('${campesinoId}', ${p.id})">
        <div>
          <div class="product-top"><div class="cat-circle ${p.colorCat}">${p.emoji}</div></div>
          <div class="product-name">${p.nombre}</div>
          <div class="product-farmer">${camp.nombre} · ${camp.municipio}</div>
        </div>
        <div class="product-foot" onclick="event.stopPropagation()">
          <div class="product-price">${formatoCOP(p.precio)}<span class="product-unit">${p.etiquetaUnidad}</span></div>
          ${
            cant === 0
              ? `<div style="display:flex; align-items:center; gap:4px;">
                   ${esLibra ? `<button class="qty-mini" style="background:var(--tierra); font-size:12px; width:34px; height:34px;" onclick="intentarAgregarAlCarrito('${campesinoId}', ${p.id}, 0.5)" title="Media libra">½</button>` : ""}
                   <button class="btn-add-circle" style="width:40px; height:40px;" onclick="intentarAgregarAlCarrito('${campesinoId}', ${p.id}, 1)">+</button>
                 </div>`
              : `<div class="qty-pill">
                   <button class="qty-mini" onclick="intentarAgregarAlCarrito('${campesinoId}', ${p.id}, -1)">−</button>
                   <strong style="font-size:12px; white-space:nowrap;">${formatearCantidadUnidad(p, cant)}</strong>
                   <button class="qty-mini" onclick="intentarAgregarAlCarrito('${campesinoId}', ${p.id}, 1)">+</button>
                 </div>`
          }
        </div>
      </article>
    `;
  }).join("");

  document.getElementById("main-view").innerHTML = `
    <button class="btn-secondary" style="width:auto; min-height:42px; padding:8px 14px; margin:4px 0 12px;"
      onclick="estado.campesinoVistoId=null; vistaInicioFamilia();">← Todos los campesinos</button>

    <div class="card" style="background:${camp.colorBanner}; color:#FFF; border:none;">
      <div style="display:flex; align-items:center; gap:14px;">
        <div>${camp.avatarSVG}</div>
        <div>
          <span class="badge" style="background:rgba(255,255,255,0.22); color:#FFF; font-size:11px;">✓ Campesino verificado · ${camp.clima}</span>
          <h2 style="font-size:22px; margin-top:4px;">${camp.nombre}</h2>
          <p style="font-size:14px; opacity:0.94;">📍 ${camp.municipio}, Cundinamarca · ${calTxt}</p>
        </div>
      </div>
      <p style="font-size:15px; margin-top:12px; opacity:0.95;">${camp.frase}</p>
    </div>

    <div class="section-head">
      <h3 class="section-title">Mercados armados de ${camp.nombre.split(" ")[0]}</h3>
    </div>
    <div class="carousel">${mercadosHtml}</div>

    <div class="section-head">
      <h3 class="section-title">Productos (${filtrados.length})</h3>
    </div>
    <div class="chips-row">${chipsHtml}</div>
    <div class="products-grid">${gridHtml}</div>
  `;
}

function abrirDetalleMercadoCampesino(campesinoId, mercadoId) {
  const camp = obtenerCampesino(campesinoId);
  const mercado = camp.mercadosArmados.find((m) => m.id === mercadoId);
  if (!mercado) return;
  const totalM = calcularTotalMercadoCampesino(campesinoId, mercado);

  const filas = mercado.lineas.map((l) => {
    const p = PRODUCTOS.find((item) => item.id === l.id);
    if (!p) return "";
    const precio = obtenerPrecioProducto(campesinoId, p.id);
    return `
      <div class="cart-row" style="padding:8px 0;">
        <span>${p.emoji} <strong>${formatearCantidadUnidad(p, l.qty)}</strong> ${p.nombre}</span>
        <strong>${formatoCOP(precio * l.qty)}</strong>
      </div>
    `;
  }).join("");

  abrirModal(`
    <h2 class="section-title" style="margin-bottom:4px;">${mercado.emoji} ${mercado.nombre}</h2>
    <p style="font-size:14px; color:var(--tierra); margin-bottom:10px;">${camp.nombre} · ${camp.municipio}</p>
    <div style="max-height:45vh; overflow-y:auto; border-top:1px solid var(--borde); border-bottom:1px solid var(--borde);">${filas}</div>
    <div class="summary-total" style="border:none; padding:8px 0;">
      <span>Total productos</span><span>${formatoCOP(totalM)}</span>
    </div>
    <button class="btn-primary" onclick="cerrarModal(); intentarAgregarMercado('${campesinoId}', '${mercadoId}');">Agregar al carrito</button>
    <button class="btn-secondary" onclick="cerrarModal()">Cerrar</button>
  `);
}

function abrirDetalleProducto(campesinoId, prodId) {
  const camp = obtenerCampesino(campesinoId);
  const p = PRODUCTOS.find((item) => item.id === prodId);
  if (!p) return;
  const precio = obtenerPrecioProducto(campesinoId, prodId);
  const cant = estado.carrito.campesinoId === campesinoId ? (estado.carrito.items[prodId] || 0) : 0;

  abrirModal(`
    <div style="text-align:center;">
      <div class="cat-circle ${p.colorCat}" style="width:80px; height:80px; font-size:42px; margin:0 auto 10px;">${p.emoji}</div>
      <span class="badge badge-hoja">${p.categoria}</span>
      <h2 class="section-title" style="margin:8px 0 4px;">${p.nombre}</h2>
      <p style="color:var(--tierra); font-weight:700;">${camp.nombre} · ${camp.municipio}</p>
      <div style="font-size:28px; font-weight:900; color:var(--bosque); margin:8px 0;">
        ${formatoCOP(precio)} <span style="font-size:15px; font-weight:600; color:var(--texto-suave);">/ ${p.unidad}</span>
      </div>
    </div>
    <div class="tip-card" style="text-align:center;"><strong>🌱 El campesino recibe el 100% de este precio</strong></div>
    <div style="display:flex; align-items:center; justify-content:center; gap:12px; margin:14px 0;">
      <button class="qty-mini" style="width:44px; height:44px;" onclick="intentarAgregarAlCarrito('${campesinoId}', ${p.id}, -1); abrirDetalleProducto('${campesinoId}', ${p.id});">−</button>
      <strong style="font-size:20px; min-width:95px; text-align:center;">${cant > 0 ? formatearCantidadUnidad(p, cant) : "0"}</strong>
      <button class="qty-mini" style="width:44px; height:44px;" onclick="intentarAgregarAlCarrito('${campesinoId}', ${p.id}, 1); abrirDetalleProducto('${campesinoId}', ${p.id});">+</button>
    </div>
    ${p.tipoUnidad === "libra" ? `<button class="btn-secondary" onclick="intentarAgregarAlCarrito('${campesinoId}', ${p.id}, 0.5); abrirDetalleProducto('${campesinoId}', ${p.id});">+ Agregar media libra (½ lb)</button>` : ""}
    <button class="btn-primary" onclick="cerrarModal()">Listo</button>
  `);
}

// ======================================================
// UN CARRITO POR CAMPESINO (CON AVISO DE CAMBIO)
// ======================================================

function intentarAgregarAlCarrito(campesinoId, prodId, delta) {
  const hayItems = Object.keys(estado.carrito.items).length > 0;
  if (hayItems && estado.carrito.campesinoId && estado.carrito.campesinoId !== campesinoId) {
    if (delta <= 0) return;
    const campA = obtenerCampesino(estado.carrito.campesinoId);
    const campB = obtenerCampesino(campesinoId);
    abrirModal(`
      <h2 class="section-title" style="margin-bottom:8px;">¿Cambiar de campesino?</h2>
      <p style="color:var(--texto-suave); margin-bottom:14px;">
        Tu carrito tiene productos de <strong>${campA.nombre}</strong>. ¿Vaciar el carrito y empezar uno nuevo con <strong>${campB.nombre}</strong>?
      </p>
      <button class="btn-primary" onclick="cerrarModal(); estado.carrito={campesinoId:'${campesinoId}', items:{}}; aplicarCambioCantidad('${campesinoId}', ${prodId}, ${delta});">Vaciar</button>
      <button class="btn-secondary" onclick="cerrarModal()">Cancelar</button>
    `);
    return;
  }
  aplicarCambioCantidad(campesinoId, prodId, delta);
}

function aplicarCambioCantidad(campesinoId, prodId, delta) {
  const prod = PRODUCTOS.find((p) => p.id === prodId);
  if (!prod) return;

  if (!estado.carrito.campesinoId) estado.carrito.campesinoId = campesinoId;
  const actual = estado.carrito.items[prodId] || 0;
  let nuevo = actual + delta;
  if (delta < 0 && actual === 0.5) nuevo = 0;
  if (nuevo < 0) nuevo = 0;

  if (nuevo > prod.maxCantidad) {
    mostrarToast("Para este prototipo el máximo es 10 por producto.");
    return;
  }

  if (nuevo === 0) delete estado.carrito.items[prodId];
  else estado.carrito.items[prodId] = Math.round(nuevo * 2) / 2;

  if (Object.keys(estado.carrito.items).length === 0) estado.carrito.campesinoId = null;

  guardarEstado();
  if (delta > 0 && actual === 0) mostrarToast("¡Agregado a tu carrito!");
  dibujarBarraInferior();

  if (estado.pestana === "carrito") vistaCarrito();
  else if (estado.campesinoVistoId) vistaTiendaCampesino(estado.campesinoVistoId);
  else actualizarResultadosInicio();
}

function intentarAgregarMercado(campesinoId, mercadoId) {
  const hayItems = Object.keys(estado.carrito.items).length > 0;
  if (hayItems && estado.carrito.campesinoId && estado.carrito.campesinoId !== campesinoId) {
    const campA = obtenerCampesino(estado.carrito.campesinoId);
    const campB = obtenerCampesino(campesinoId);
    abrirModal(`
      <h2 class="section-title" style="margin-bottom:8px;">¿Cambiar de campesino?</h2>
      <p style="color:var(--texto-suave); margin-bottom:14px;">
        Tu carrito tiene productos de <strong>${campA.nombre}</strong>. ¿Vaciar el carrito y empezar uno nuevo con <strong>${campB.nombre}</strong>?
      </p>
      <button class="btn-primary" onclick="cerrarModal(); cargarMercadoEnCarrito('${campesinoId}', '${mercadoId}');">Vaciar</button>
      <button class="btn-secondary" onclick="cerrarModal()">Cancelar</button>
    `);
    return;
  }
  cargarMercadoEnCarrito(campesinoId, mercadoId);
}

function cargarMercadoEnCarrito(campesinoId, mercadoId) {
  const camp = obtenerCampesino(campesinoId);
  const mercado = camp.mercadosArmados.find((m) => m.id === mercadoId);
  if (!mercado) return;

  const nuevosItems = {};
  mercado.lineas.forEach((l) => {
    const prod = PRODUCTOS.find((p) => p.id === l.id);
    if (prod) nuevosItems[l.id] = Math.min(l.qty, prod.maxCantidad);
  });

  estado.carrito = { campesinoId, items: nuevosItems };
  guardarEstado();
  dibujarBarraInferior();
  if (estado.campesinoVistoId) vistaTiendaCampesino(campesinoId);
  mostrarToast(`¡Listo! ${mercado.nombre} en tu carrito`);
}

// ======================================================
// PERFIL FAMILIA: 3. CARRITO Y PAGO REAL
// ======================================================

function calcularTotalesCarrito() {
  const campId = estado.carrito.campesinoId;
  if (!campId) return { productos: 0, envio: 0, servicio: 0, total: 0 };

  let sumaCruda = 0;
  for (const [id, cant] of Object.entries(estado.carrito.items)) {
    if (cant > 0) sumaCruda += obtenerPrecioProducto(campId, Number(id)) * cant;
  }

  const productos = sumaCruda > 0 ? Math.round(sumaCruda / 50) * 50 : 0;
  const envio = productos > 0 ? 15000 : 0;
  const servicio = productos > 0 ? Math.round((productos * 0.04) / 100) * 100 : 0;
  return { productos, envio, servicio, total: productos + envio + servicio };
}

function vistaCarrito() {
  const campId = estado.carrito.campesinoId;
  const items = Object.entries(estado.carrito.items)
    .map(([id, cant]) => {
      const p = PRODUCTOS.find((item) => item.id === Number(id));
      return p ? { ...p, cant, precio: obtenerPrecioProducto(campId, p.id) } : null;
    })
    .filter((i) => i && i.cant > 0);

  if (!campId || items.length === 0) {
    document.getElementById("main-view").innerHTML = `
      <div class="card" style="text-align:center; padding:32px 20px; margin-top:12px;">
        <svg viewBox="0 0 120 100" width="110" height="92" style="margin-bottom:12px;" aria-hidden="true">
          <circle cx="60" cy="54" r="42" fill="#EFE4D4"/>
          <path d="M28 52 H92 L84 82 H36 Z" fill="#8B5E3C"/>
          <path d="M40 52 C40 30, 80 30, 80 52" stroke="#2F6B3A" stroke-width="6" fill="none" stroke-linecap="round"/>
        </svg>
        <h2 style="font-size:22px; margin-bottom:6px;">Tu carrito está vacío</h2>
        <p style="color:var(--texto-suave); margin-bottom:14px;">Elige un campesino y arma tu mercado directo de su finca.</p>
        <button class="btn-primary" onclick="cambiarPestana('mercado')">Ir al mercado</button>
      </div>
    `;
    return;
  }

  const camp = obtenerCampesino(campId);
  const { productos, envio, servicio, total } = calcularTotalesCarrito();

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
          <button class="qty-mini" onclick="aplicarCambioCantidad('${campId}', ${item.id}, -1)">−</button>
          <strong style="font-size:13px;">${item.cant === 0.5 ? "½" : item.cant}</strong>
          <button class="qty-mini" onclick="aplicarCambioCantidad('${campId}', ${item.id}, 1)">+</button>
        </div>
        <strong style="font-size:14px; color:var(--bosque);">${formatoCOP(item.precio * item.cant)}</strong>
      </div>
    </div>
  `).join("");

  document.getElementById("main-view").innerHTML = `
    <div class="impact-card" style="margin-top:8px;">
      <div>${camp.avatarSVG}</div>
      <div>
        <span style="font-size:12px; font-weight:800; color:var(--tierra);">PEDIDO DIRECTO</span>
        <strong style="color:var(--bosque); display:block; font-size:17px;">Pedido a ${camp.nombre} · ${camp.municipio}</strong>
        <span style="font-size:14px;">El 100% del valor de los productos va para su finca.</span>
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
    <button class="pay-option ${estado.metodoPago === m ? "selected" : ""}" onclick="estado.metodoPago='${m}'; abrirModalPago();">
      <span>${m === "Nequi" ? "📱" : m === "Daviplata" ? "📲" : "💳"} ${m}</span>
      <span>${estado.metodoPago === m ? "●" : "○"}</span>
    </button>
  `).join("");

  abrirModal(`
    <h2 class="section-title" style="margin-bottom:6px;">Elige cómo pagar</h2>
    <p style="color:var(--texto-suave); margin-bottom:14px;">Total a pagar: <strong>${formatoCOP(total)}</strong></p>
    ${opciones}
    <button class="btn-primary" onclick="confirmarPagoReal()">Confirmar pago con ${estado.metodoPago}</button>
    <button class="btn-secondary" onclick="cerrarModal()">Cancelar</button>
  `);
}

function confirmarPagoReal() {
  const campId = estado.carrito.campesinoId;
  const camp = obtenerCampesino(campId);
  const { productos, envio, servicio, total } = calcularTotalesCarrito();
  if (!campId || productos <= 0) return;

  const numeroPedido = `RJ-${estado.consecutivoPedido}`;
  estado.consecutivoPedido += 1;

  const itemsPedido = Object.entries(estado.carrito.items)
    .map(([id, qty]) => {
      const p = PRODUCTOS.find((item) => item.id === Number(id));
      if (!p || qty <= 0) return null;
      const precio = obtenerPrecioProducto(campId, p.id);
      return {
        id: p.id,
        nombre: p.nombre,
        emoji: p.emoji,
        qty,
        textoCantidad: formatearCantidadUnidad(p, qty),
        subtotal: precio * qty
      };
    })
    .filter(Boolean);

  estado.pedidos.unshift({
    id: numeroPedido,
    campesinoId: camp.id,
    campesinoNombre: camp.nombre,
    municipio: camp.municipio,
    fechaCreacion: new Date().toISOString(),
    familia: "Familia Morales",
    direccion: "Cra 68 # 24B-15, Apto 402 · Bogotá",
    items: itemsPedido,
    valorProductos: productos,
    envio,
    servicio,
    totalPagado: total,
    estado: "Nuevo", // Nuevo | Aceptado | Preparando | Enviado | Entregado | Rechazado
    motivoRechazo: "",
    fechaAceptado: null,
    fechaEntregado: null,
    recibidoPorFamilia: false,
    calificacion: 0
  });

  estado.carrito = { campesinoId: null, items: {} };
  guardarEstado();
  dibujarBarraInferior();

  abrirModal(`
    <div style="text-align:center; padding:8px 0;">
      <div class="success-check">✓</div>
      <h2 class="section-title" style="margin-bottom:6px;">¡Pago confirmado!</h2>
      <p style="color:var(--texto-suave); margin-bottom:16px;">
        Tu pedido <strong>#${numeroPedido}</strong> ya llegó a <strong>${camp.nombre}</strong> en ${camp.municipio}.
      </p>
      <button class="btn-primary" onclick="cerrarModal(); mostrarToast('¡Listo! Pedido #${numeroPedido}'); cambiarPestana('pedido');">
        Ver mi pedido #${numeroPedido}
      </button>
    </div>
  `);
}

// ======================================================
// PERFIL FAMILIA: 4. MI PEDIDO (RECHAZO Y CALIFICACIÓN)
// ======================================================

function vistaMiPedido() {
  if (estado.pedidos.length === 0) {
    document.getElementById("main-view").innerHTML = `
      <div class="card" style="text-align:center; padding:32px 20px; margin-top:12px;">
        <div style="font-size:48px; margin-bottom:8px;">📦</div>
        <h2 style="font-size:22px; margin-bottom:6px;">Aún no tienes pedidos</h2>
        <p style="color:var(--texto-suave); margin-bottom:14px;">Cuando hagas tu compra, podrás seguir aquí cada paso desde la finca hasta tu puerta.</p>
        <button class="btn-primary" onclick="cambiarPestana('mercado')">Ir al mercado</button>
      </div>
    `;
    return;
  }

  const cardsHtml = estado.pedidos.map((p) => {
    const camp = obtenerCampesino(p.campesinoId);
    const listaHtml = p.items.map((it) => `<li>• ${it.textoCantidad} ${it.nombre}</li>`).join("");

    if (p.estado === "Rechazado") {
      return `
        <article class="card card-accent card-accent-red">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
            <strong>#${p.id} · Pedido a ${p.campesinoNombre}</strong>
            <span class="badge badge-rojo">Rechazado</span>
          </div>
          <div class="rejected-box">
            <strong>El campesino no pudo atender tu pedido:</strong> ${p.motivoRechazo}
          </div>
          <ul class="checklist">${listaHtml}</ul>
          <button class="btn-primary" onclick="iniciarReasignacion('${p.id}')">Elegir otro campesino</button>
        </article>
      `;
    }

    const pasos = [
      { clave: "Nuevo", titulo: "Pedido confirmado", ico: "📝" },
      { clave: "Aceptado", titulo: "Aceptado", ico: "🤝" },
      { clave: "Preparando", titulo: "Preparando", ico: "🧺" },
      { clave: "Enviado", titulo: "Enviado por el campesino", ico: "🌿" },
      { clave: "Entregado", titulo: "Entregado", ico: "🏡" }
    ];
    const idxActual = pasos.findIndex((s) => s.clave === p.estado);
    const timelineHtml = pasos.map((s, i) => `
      <div class="step ${i <= idxActual ? "done" : ""} ${i === idxActual && i < 4 ? "current" : ""}">
        <div class="step-ico">${s.ico}</div>
        <div><strong>${s.titulo}</strong></div>
      </div>
    `).join("");

    let cierreHtml = "";
    if (p.estado === "Enviado" || (p.estado === "Entregado" && !p.recibidoPorFamilia)) {
      cierreHtml = `<button class="btn-primary" onclick="confirmarReciboFamilia('${p.id}')">Confirmar que recibí mi mercado</button>`;
    } else if (p.recibidoPorFamilia) {
      const estrellas = [1, 2, 3, 4, 5].map((n) => `
        <button class="star-btn ${p.calificacion >= n ? "active" : ""}" onclick="calificarPedido('${p.id}', ${n})">★</button>
      `).join("");
      cierreHtml = `
        <div style="text-align:center; margin-top:12px; padding-top:12px; border-top:1px solid var(--borde);">
          <strong style="color:var(--bosque);">¡Gracias por confirmar! Califica a ${p.campesinoNombre}:</strong>
          <div class="stars-row">${estrellas}</div>
        </div>
      `;
    }

    return `
      <article class="card card-accent">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
          <div style="display:flex; align-items:center; gap:10px;">
            <div style="width:42px; height:42px; overflow:hidden;">${camp.avatarSVG}</div>
            <div>
              <strong style="display:block;">#${p.id} · Pedido a ${p.campesinoNombre}</strong>
              <span style="font-size:13px; color:var(--texto-suave);">${p.municipio} · ${formatoCOP(p.totalPagado)}</span>
            </div>
          </div>
          <span class="badge ${p.estado === "Entregado" ? "badge-entregado" : "badge-hoja"}">${p.estado}</span>
        </div>
        <div class="timeline">${timelineHtml}</div>
        <ul class="checklist">${listaHtml}</ul>
        ${cierreHtml}
      </article>
    `;
  }).join("");

  document.getElementById("main-view").innerHTML = `
    <div class="section-head" style="margin-top:6px;">
      <h3 class="section-title">Mis pedidos (${estado.pedidos.length})</h3>
      <span class="section-sub">En vivo</span>
    </div>
    ${cardsHtml}
  `;
}

function iniciarReasignacion(pedidoId) {
  const p = estado.pedidos.find((item) => item.id === pedidoId);
  if (!p) return;
  estado.pendienteReasignar = {
    pedidoId,
    items: p.items.map((it) => ({ id: it.id, qty: it.qty, nombre: it.nombre }))
  };
  estado.campesinoVistoId = null;
  estado.pestana = "mercado";
  guardarEstado();
  dibujarBarraInferior();
  vistaInicioFamilia();
  mostrarToast("Elige otro campesino para cargar tu mercado");
}

function confirmarReciboFamilia(pedidoId) {
  const p = estado.pedidos.find((item) => item.id === pedidoId);
  if (!p) return;
  p.estado = "Entregado";
  p.recibidoPorFamilia = true;
  if (!p.fechaEntregado) p.fechaEntregado = new Date().toISOString();
  guardarEstado();
  mostrarToast("¡Listo! Mercado recibido");
  vistaMiPedido();
}

function calificarPedido(pedidoId, n) {
  const p = estado.pedidos.find((item) => item.id === pedidoId);
  if (!p) return;
  p.calificacion = n;
  guardarEstado();
  mostrarToast(`¡Calificaste con ${n} estrellas!`);
  vistaMiPedido();
}

// ======================================================
// PERFIL CAMPESINO: PANEL INDEPENDIENTE Y GRÁFICA 7 DÍAS
// ======================================================

function calcularMetricasCampesino(campesinoId) {
  const todos = estado.pedidos.filter((p) => p.campesinoId === campesinoId);
  const porAlistar = todos.filter((p) => p.estado === "Aceptado" || p.estado === "Preparando").length;

  const ahora = new Date();
  const nombresDia = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
  const dias = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(ahora);
    d.setDate(ahora.getDate() - i);
    dias.push({ clave: claveFechaLocal(d), etiqueta: i === 0 ? "Hoy" : nombresDia[d.getDay()], monto: 0, cantidad: 0, esHoy: i === 0 });
  }

  let ventasSemana = 0;
  todos.forEach((p) => {
    if (p.fechaAceptado && p.estado !== "Rechazado") {
      const dia = dias.find((x) => x.clave === claveFechaLocal(p.fechaAceptado));
      if (dia) {
        dia.monto += p.valorProductos;
        dia.cantidad += 1;
        ventasSemana += p.valorProductos;
      }
    }
  });

  const ingresos = todos
    .filter((p) => p.estado === "Entregado")
    .reduce((acc, p) => acc + p.valorProductos + p.envio, 0);

  const retiros = estado.retiros
    .filter((r) => r.campesinoId === campesinoId)
    .reduce((acc, r) => acc + r.monto, 0);

  return { porAlistar, ventasSemana, saldo: Math.max(0, ingresos - retiros), dias, todos };
}

function graficaVentasSVG(dias) {
  const maxMonto = Math.max(...dias.map((d) => d.monto), 0);
  const sinVentas = maxMonto === 0;

  const barras = dias.map((d, i) => {
    const x = 14 + i * 48;
    const h = sinVentas ? 8 : Math.max(8, Math.round((d.monto / maxMonto) * 68));
    const y = 86 - h;
    const fill = sinVentas ? "#DDD7CA" : (d.esHoy ? "#D9822B" : "#6FAE4F");
    return `
      <g onclick="estado.barraSeleccionada=${i}; vistaPedidosCampesino();" style="cursor:pointer;">
        <rect class="chart-bar" x="${x}" y="${y}" width="26" height="${h}" rx="7" fill="${fill}"/>
        <text x="${x + 13}" y="104" text-anchor="middle" font-size="11" font-weight="700" fill="#595751">${d.etiqueta}</text>
      </g>
    `;
  }).join("");

  let detalle = `<div class="chart-detail" style="color:var(--texto-suave);">Aún no hay ventas esta semana</div>`;
  if (!sinVentas) {
    if (estado.barraSeleccionada !== null && dias[estado.barraSeleccionada]) {
      const sel = dias[estado.barraSeleccionada];
      detalle = `<div class="chart-detail">${sel.etiqueta}: ${formatoCOP(sel.monto)} (${sel.cantidad} ${sel.cantidad === 1 ? "pedido" : "pedidos"})</div>`;
    } else {
      detalle = `<div class="chart-detail" style="color:var(--texto-suave); font-weight:600;">Toca una barra para ver el detalle del día</div>`;
    }
  }

  return `
    <div class="card">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
        <strong style="font-size:16px;">Ventas últimos 7 días</strong>
        <span style="font-size:13px; font-weight:700; color:var(--naranja);">Hoy resaltado</span>
      </div>
      <svg viewBox="0 0 350 112" width="100%" height="112">${barras}</svg>
      ${detalle}
    </div>
  `;
}

function vistaPedidosCampesino() {
  const { porAlistar, ventasSemana, saldo, dias, todos } = calcularMetricasCampesino(estado.campesinoActivoId);
  const activos = todos.filter((p) => p.estado !== "Rechazado");
  const rechazados = todos.filter((p) => p.estado === "Rechazado");

  const renderTarjeta = (p) => {
    const totalRecibe = p.valorProductos + p.envio;
    const listaHtml = p.items.map((it) => `<li>• ${it.textoCantidad} ${it.nombre}</li>`).join("");
    let botones = "";

    if (p.estado === "Nuevo") {
      botones = `
        <div class="btn-row">
          <button class="btn-danger-outline" onclick="abrirModalRechazo('${p.id}')">Rechazar</button>
          <button class="btn-primary" onclick="aceptarPedido('${p.id}')">Aceptar</button>
        </div>`;
    } else if (p.estado === "Aceptado") {
      botones = `<button class="btn-primary" onclick="abrirFotoPaso('${p.id}', 'Preparando', 'Marcar preparando')">Marcar preparando</button>`;
    } else if (p.estado === "Preparando") {
      botones = `<button class="btn-primary" onclick="abrirFotoPaso('${p.id}', 'Enviado', 'Marcar enviado')">Marcar enviado</button>`;
    } else if (p.estado === "Enviado") {
      botones = `<button class="btn-primary" onclick="abrirFotoPaso('${p.id}', 'Entregado', 'Marcar entregado')">Marcar entregado</button>`;
    } else if (p.estado === "Entregado") {
      botones = `<div style="margin-top:12px; font-weight:800; color:var(--bosque);">✓ Entregado y sumado a tu saldo</div>`;
    } else {
      botones = `<div class="rejected-box">Motivo: ${p.motivoRechazo}</div>`;
    }

    return `
      <article class="card card-accent ${p.estado === "Rechazado" ? "card-accent-red" : "card-accent-orange"}">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
          <strong style="font-size:18px;">Pedido #${p.id}</strong>
          <span class="badge ${p.estado === "Entregado" ? "badge-entregado" : p.estado === "Rechazado" ? "badge-rojo" : "badge-naranja"}">${p.estado}</span>
        </div>
        <p style="font-weight:700;">${p.familia}</p>
        <p style="font-size:14px; color:var(--tierra); margin-top:2px;">📍 ${p.direccion}</p>
        <ul class="checklist">${listaHtml}</ul>
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <span style="font-size:14px; color:var(--texto-suave);">Recibes (productos + envío)</span>
          <strong style="font-size:19px; color:var(--bosque);">${formatoCOP(totalRecibe)}</strong>
        </div>
        ${botones}
      </article>
    `;
  };

  const activosHtml = activos.length
    ? activos.map(renderTarjeta).join("")
    : `<div class="card" style="text-align:center; padding:26px 16px; color:var(--texto-suave);">
         <div style="font-size:38px; margin-bottom:6px;">🧺</div>
         <strong style="display:block; color:var(--texto);">Aún no tienes pedidos</strong>
         <span style="font-size:14px;">Cuando una familia haga un pedido a tu finca, aparecerá aquí al instante.</span>
       </div>`;

  const rechazadosHtml = rechazados.length > 0 ? `
    <button class="collapsible-btn" onclick="estado.mostrarRechazados=!estado.mostrarRechazados; vistaPedidosCampesino();">
      <span>Rechazados (${rechazados.length})</span><span>${estado.mostrarRechazados ? "▲" : "▼"}</span>
    </button>
    ${estado.mostrarRechazados ? rechazados.map(renderTarjeta).join("") : ""}
  ` : "";

  document.getElementById("main-view").innerHTML = `
    <div class="kpi-grid" style="margin-top:8px;">
      <div class="kpi-card"><div class="kpi-label">Por alistar</div><div class="kpi-val">${porAlistar}</div></div>
      <div class="kpi-card"><div class="kpi-label">Semana</div><div class="kpi-val" style="font-size:15px;" data-count="${ventasSemana}">${formatoCOP(ventasSemana)}</div></div>
      <div class="kpi-card"><div class="kpi-label">Mi saldo</div><div class="kpi-val" style="font-size:15px;" data-count="${saldo}">${formatoCOP(saldo)}</div></div>
    </div>
    ${graficaVentasSVG(dias)}
    <div class="section-head"><h3 class="section-title">Pedidos entrantes</h3><span class="section-sub">${activos.length} activos</span></div>
    ${activosHtml}
    ${rechazadosHtml}
  `;
}

function aceptarPedido(id) {
  const p = estado.pedidos.find((item) => item.id === id);
  if (!p) return;
  p.estado = "Aceptado";
  p.fechaAceptado = new Date().toISOString();
  guardarEstado();
  dibujarBarraInferior();
  mostrarToast("¡Listo! Pedido aceptado");
  vistaPedidosCampesino();
  animarConteos();
}

function abrirModalRechazo(id) {
  motivoSeleccionado = MOTIVOS_RECHAZO[0];
  renderModalRechazo(id);
}

function renderModalRechazo(id) {
  const opciones = MOTIVOS_RECHAZO.map((m) => `
    <button class="pay-option ${motivoSeleccionado === m ? "selected" : ""}" onclick="motivoSeleccionado='${m}'; renderModalRechazo('${id}');">
      <span>${m}</span><span>${motivoSeleccionado === m ? "●" : "○"}</span>
    </button>
  `).join("");

  abrirModal(`
    <h2 class="section-title" style="margin-bottom:6px;">¿Por qué rechazas el pedido #${id}?</h2>
    <p style="color:var(--texto-suave); margin-bottom:14px;">Le avisaremos a la familia el motivo.</p>
    ${opciones}
    <button class="btn-danger-outline" onclick="confirmarRechazo('${id}')">Confirmar rechazo</button>
    <button class="btn-secondary" onclick="cerrarModal()">Cancelar</button>
  `);
}

function confirmarRechazo(id) {
  const p = estado.pedidos.find((item) => item.id === id);
  if (!p) return;
  p.estado = "Rechazado";
  p.motivoRechazo = motivoSeleccionado;
  guardarEstado();
  dibujarBarraInferior();
  cerrarModal();
  mostrarToast("Pedido rechazado");
  vistaPedidosCampesino();
}

function abrirFotoPaso(id, nuevoEstado, textoBoton) {
  abrirModal(`
    <h2 class="section-title" style="margin-bottom:6px;">${textoBoton}</h2>
    <p style="color:var(--texto-suave);">Foto rápida de respaldo para la familia (simulada).</p>
    <div class="photo-box">
      <div style="font-size:48px;">📸🧺🥕</div>
      <strong style="display:block; margin-top:8px;">Foto lista · Pedido #${id}</strong>
      <span style="font-size:14px; color:var(--texto-suave);">Pasará a: ${nuevoEstado}</span>
    </div>
    <button class="btn-primary" onclick="confirmarPasoCampesino('${id}', '${nuevoEstado}')">Confirmar</button>
    <button class="btn-secondary" onclick="cerrarModal()">Cancelar</button>
  `);
}

function confirmarPasoCampesino(id, nuevoEstado) {
  const p = estado.pedidos.find((item) => item.id === id);
  if (!p) return;
  p.estado = nuevoEstado;
  if (nuevoEstado === "Entregado" && !p.fechaEntregado) p.fechaEntregado = new Date().toISOString();
  guardarEstado();
  cerrarModal();
  mostrarToast("¡Listo! Estado actualizado");
  vistaPedidosCampesino();
  animarConteos();
}

// ======================================================
// PERFIL CAMPESINO: MIS PRODUCTOS, MI SALDO Y APRENDER
// ======================================================

function vistaMisProductos() {
  const campId = estado.campesinoActivoId;
  const mios = obtenerProductosDeCampesino(campId, false);

  const cards = mios.map((p) => `
    <article class="card">
      <div style="display:flex; align-items:center; justify-content:space-between; gap:10px;">
        <div style="display:flex; align-items:center; gap:12px;">
          <div class="cat-circle ${p.colorCat}" style="width:50px; height:50px; font-size:26px;">${p.emoji}</div>
          <div>
            <strong>${p.nombre}</strong>
            <div id="estado-prod-${p.id}" style="font-size:13px; color:var(--texto-suave);">
              ${p.unidad} · ${p.disponible ? "Visible en tu tienda" : "Pausado"}
            </div>
          </div>
        </div>
        <label class="toggle-switch">
          <input type="checkbox" ${p.disponible ? "checked" : ""} onchange="cambiarDisponibilidad('${campId}', ${p.id}, this.checked)">
          <span class="toggle-slider"></span>
        </label>
      </div>
      <div style="display:flex; align-items:center; justify-content:space-between; margin-top:12px; padding-top:12px; border-top:1px solid var(--borde);">
        <span style="font-size:14px; font-weight:700; color:var(--tierra);">Precio por ${p.etiquetaUnidad}:</span>
        <input class="price-input" type="number" step="25" min="100" value="${p.precio}"
          onchange="actualizarPrecioProducto('${campId}', ${p.id}, this.value)">
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

function cambiarDisponibilidad(campId, prodId, activo) {
  if (!estado.pausadosCampesino[campId]) estado.pausadosCampesino[campId] = {};
  if (activo) delete estado.pausadosCampesino[campId][prodId];
  else estado.pausadosCampesino[campId][prodId] = true;
  guardarEstado();
  const prod = PRODUCTOS.find((p) => p.id === prodId);
  const sub = document.getElementById(`estado-prod-${prodId}`);
  if (sub && prod) sub.textContent = `${prod.unidad} · ${activo ? "Visible en tu tienda" : "Pausado"}`;
  mostrarToast(activo ? "¡Listo! Producto visible" : "Producto pausado");
}

function actualizarPrecioProducto(campId, prodId, nuevoPrecio) {
  const valor = Number(nuevoPrecio);
  if (isNaN(valor) || valor < 100) return;
  if (!estado.preciosCampesino[campId]) estado.preciosCampesino[campId] = {};
  estado.preciosCampesino[campId][prodId] = valor;
  guardarEstado();
  mostrarToast("¡Listo! Precio actualizado");
}

function vistaSaldoCampesino() {
  const camp = obtenerCampesino(estado.campesinoActivoId);
  const { saldo, todos } = calcularMetricasCampesino(camp.id);

  const movimientos = [];
  todos.forEach((p) => {
    if (p.estado === "Entregado") {
      movimientos.push({
        titulo: `Pedido #${p.id} entregado`,
        fecha: new Date(p.fechaEntregado || p.fechaCreacion).toLocaleDateString("es-CO", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }),
        monto: p.valorProductos + p.envio,
        tipo: "in",
        ts: new Date(p.fechaEntregado || p.fechaCreacion).getTime()
      });
    }
  });
  estado.retiros.filter((r) => r.campesinoId === camp.id).forEach((r) => {
    movimientos.push({
      titulo: "Retiro a cuenta bancaria",
      fecha: new Date(r.fecha).toLocaleDateString("es-CO", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }),
      monto: -r.monto,
      tipo: "out",
      ts: new Date(r.fecha).getTime()
    });
  });
  movimientos.sort((a, b) => b.ts - a.ts);

  const historialHtml = movimientos.length
    ? movimientos.map((h) => `
        <div class="cart-row">
          <div style="display:flex; align-items:center; gap:10px;">
            <div class="cat-circle ${h.tipo === "in" ? "bg-verduras" : "bg-tuberculos"}" style="width:42px; height:42px; font-size:20px;">${h.tipo === "in" ? "⬇️" : "🏦"}</div>
            <div><strong>${h.titulo}</strong><div style="font-size:13px; color:var(--texto-suave);">${h.fecha}</div></div>
          </div>
          <strong style="color:${h.monto >= 0 ? "var(--bosque)" : "var(--tierra)"};">${h.monto >= 0 ? "+" : ""}${formatoCOP(h.monto)}</strong>
        </div>
      `).join("")
    : `<p style="color:var(--texto-suave); text-align:center; padding:14px 0;">Aún no tienes movimientos registrados.</p>`;

  document.getElementById("main-view").innerHTML = `
    <div class="section-head" style="margin-top:6px;"><h3 class="section-title">Mi saldo</h3></div>
    <div class="balance-card">
      <span style="font-size:15px; opacity:0.92;">Saldo disponible</span>
      <div class="balance-number" data-count="${saldo}">${formatoCOP(saldo)}</div>
      <p style="font-size:14px; opacity:0.92;">Cuenta: ${camp.cuenta}</p>
      <button class="btn-primary" style="background:var(--blanco); color:var(--bosque);" ${saldo <= 0 ? "disabled" : ""} onclick="abrirModalRetiro(${saldo})">
        Retirar a mi cuenta bancaria
      </button>
    </div>
    <div class="tip-card">
      <strong style="color:var(--tierra);">Pago claro y sin descuentos:</strong> recibes el <strong>100% del valor de tus productos más el envío</strong>. El saldo aparece aquí apenas el pedido queda entregado.
    </div>
    <div class="card"><div class="section-sub" style="margin-bottom:6px;">Historial de movimientos</div>${historialHtml}</div>
  `;
}

function abrirModalRetiro(saldoActual) {
  const camp = obtenerCampesino(estado.campesinoActivoId);
  abrirModal(`
    <h2 class="section-title" style="margin-bottom:6px;">Confirmar retiro</h2>
    <p style="color:var(--texto-suave); margin-bottom:14px;">Enviaremos <strong>${formatoCOP(saldoActual)}</strong> a tu cuenta <strong>${camp.cuenta}</strong>.</p>
    <button class="btn-primary" onclick="confirmarRetiro(${saldoActual})">Sí, retirar ahora</button>
    <button class="btn-secondary" onclick="cerrarModal()">Cancelar</button>
  `);
}

function confirmarRetiro(monto) {
  if (monto <= 0) return;
  estado.retiros.unshift({ campesinoId: estado.campesinoActivoId, monto, fecha: new Date().toISOString() });
  guardarEstado();
  cerrarModal();
  mostrarToast("¡Listo! Retiro enviado");
  vistaSaldoCampesino();
}

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
    <div class="section-head" style="margin-top:6px;"><h3 class="section-title">Aprender</h3><span class="section-sub">Clases cortas</span></div>
    <div class="tip-card">
      <span style="font-size:13px; font-weight:800; color:var(--naranja);">💡 CONSEJO DEL DÍA</span>
      <strong style="display:block; font-size:17px; margin:4px 0;">Incluye tu trabajo en el precio</strong>
      <p style="font-size:15px;">Antes de fijar el valor por libra o unidad, suma semillas, abono, empaque y las horas que trabajaste en el surco.</p>
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
