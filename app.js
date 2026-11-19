// ======================================================
// DATOS DE EJEMPLO Y ESTADO COMPARTIDO (SIN SERVIDOR)
// ======================================================

const PRODUCTOS = [
  { id: 1, nombre: "Papa sabanera", categoria: "Tubérculos", campesino: "Hernando Rojas", unidad: "5 kg", precio: 25000, emoji: "🥔" },
  { id: 2, nombre: "Plátano hartón", categoria: "Frutas", campesino: "Rosa Díaz", unidad: "3 kg", precio: 18000, emoji: "🍌" },
  { id: 3, nombre: "Cebolla cabezona", categoria: "Verduras", campesino: "Hernando Rojas", unidad: "2 kg", precio: 12000, emoji: "🧅" },
  { id: 4, nombre: "Zanahoria orgánica", categoria: "Verduras", campesino: "Hernando Rojas", unidad: "2 kg", precio: 10000, emoji: "🥕" },
  { id: 5, nombre: "Tomate chonto", categoria: "Verduras", campesino: "Luis Beltrán", unidad: "2 kg", precio: 15000, emoji: "🍅" },
  { id: 6, nombre: "Arándanos de altura", categoria: "Frutas", campesino: "Hernando Rojas", unidad: "500 g", precio: 20000, emoji: "🫐" },
  { id: 7, nombre: "Aguacate Hass", categoria: "Frutas", campesino: "Rosa Díaz", unidad: "Malla x 6", precio: 14000, emoji: "🥑" },
  { id: 8, nombre: "Cilantro y hierbabuena", categoria: "Hierbas", campesino: "Hernando Rojas", unidad: "2 manojos", precio: 6000, emoji: "🌿" }
];

const VIDEOS_APRENDER = [
  { id: 1, titulo: "Cómo calcular lo que te cuesta producir", duracion: "4 min", resumen: "Aprende a sumar semillas, abono, transporte y tu trabajo diario para nunca vender a pérdida." },
  { id: 2, titulo: "Cómo fijar tu precio justo", duracion: "5 min", resumen: "Fórmula sencilla para poner un precio que cubra tus costos y te deje ganancia real." },
  { id: 3, titulo: "Cómo negociar y no dejarte estafar", duracion: "6 min", resumen: "Consejos prácticos para acordar pagos claros y vender directo a las familias." }
];

// Estado global compartido entre Perfil Familia y Perfil Campesino
const estado = {
  perfil: null,         // "familia" | "campesino"
  pestana: "mercado",   // familia: mercado, carrito, pedido | campesino: pedidos, saldo, aprender
  busqueda: "",
  categoria: "Todas",
  metodoPago: "Nequi",

  // Carrito precargado para sumar exactamente $120.000 en productos
  carrito: { 1: 1, 2: 1, 3: 1, 4: 1, 5: 1, 6: 1, 7: 1, 8: 1 },

  // Pedidos del campesino (el #RJ-1024 se comparte con el perfil Familia)
  pedidos: [
    {
      id: "RJ-1024",
      familia: "Familia Morales",
      direccion: "Cra 68 # 24B-15, Apto 402 · Bogotá",
      productosTexto: "Mercado semanal (8 productos frescos)",
      valorProductos: 120000,
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
      productosTexto: "Papa sabanera (5 kg), Tomate chonto (2 kg), Aguacate Hass",
      valorProductos: 54000,
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
    saldo: 245000,
    cuenta: "Bancolombia Ahorros •••• 4821",
    historial: [
      { titulo: "Pedido #RJ-1019 entregado", fecha: "Ayer · Productos + envío", monto: 118000 },
      { titulo: "Pedido #RJ-1015 entregado", fecha: "17 Nov · Productos + envío", monto: 127000 }
    ]
  }
};

// Formato de dinero colombiano: $139.800
function formatoCOP(valor) {
  const signo = valor < 0 ? "-" : "";
  return signo + "$" + Math.abs(Math.round(valor)).toLocaleString("es-CO");
}

function mostrarToast(texto = "¡Listo!") {
  const el = document.getElementById("toast");
  el.textContent = texto;
  el.classList.remove("hidden");
  clearTimeout(window._timerToast);
  window._timerToast = setTimeout(() => el.classList.add("hidden"), 2300);
}

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
    titulo.textContent = "Raíz Justa";
    sub.textContent = "Perfil Familia · Bogotá";
  } else {
    iniciales.textContent = "HR";
    titulo.textContent = estado.campesino.nombre;
    sub.textContent = estado.campesino.vereda;
  }

  dibujarBarraInferior();
  dibujarVistaActual();
}

function volverBienvenida() {
  document.getElementById("app-shell").classList.add("hidden");
  document.getElementById("welcome-screen").classList.remove("hidden");
}

function cambiarPestana(nuevaPestana) {
  estado.pestana = nuevaPestana;
  dibujarBarraInferior();
  dibujarVistaActual();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function dibujarBarraInferior() {
  const nav = document.getElementById("bottom-nav");
  if (estado.perfil === "familia") {
    const totalUnidades = Object.values(estado.carrito).reduce((a, b) => a + b, 0);
    nav.innerHTML = `
      <button class="nav-item ${estado.pestana === "mercado" ? "active" : ""}" onclick="cambiarPestana('mercado')">
        <span class="nav-ico">🥕</span><span>Mercado</span>
      </button>
      <button class="nav-item ${estado.pestana === "carrito" ? "active" : ""}" onclick="cambiarPestana('carrito')">
        <span class="nav-ico">🛒</span><span>Carrito (${totalUnidades})</span>
      </button>
      <button class="nav-item ${estado.pestana === "pedido" ? "active" : ""}" onclick="cambiarPestana('pedido')">
        <span class="nav-ico">📦</span><span>Mi pedido</span>
      </button>
    `;
  } else {
    nav.innerHTML = `
      <button class="nav-item ${estado.pestana === "pedidos" ? "active" : ""}" onclick="cambiarPestana('pedidos')">
        <span class="nav-ico">🧺</span><span>Pedidos</span>
      </button>
      <button class="nav-item ${estado.pestana === "saldo" ? "active" : ""}" onclick="cambiarPestana('saldo')">
        <span class="nav-ico">💰</span><span>Mi saldo</span>
      </button>
      <button class="nav-item ${estado.pestana === "aprender" ? "active" : ""}" onclick="cambiarPestana('aprender')">
        <span class="nav-ico">🎓</span><span>Aprender</span>
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
    if (estado.pestana === "saldo") vistaSaldoCampesino();
    if (estado.pestana === "aprender") vistaAprender();
  }
}

// ======================================================
// PERFIL FAMILIA: 1. MERCADO
// ======================================================

function vistaMercado() {
  const categorias = ["Todas", "Verduras", "Frutas", "Tubérculos", "Hierbas"];
  const chipsHtml = categorias.map((cat) => `
    <button class="chip ${estado.categoria === cat ? "active" : ""}" onclick="filtrarCategoria('${cat}')">${cat}</button>
  `).join("");

  const filtrados = PRODUCTOS.filter((p) => {
    const coincideCat = estado.categoria === "Todas" || p.categoria === estado.categoria;
    const coincideTexto = p.nombre.toLowerCase().includes(estado.busqueda.toLowerCase()) ||
                          p.campesino.toLowerCase().includes(estado.busqueda.toLowerCase());
    return coincideCat && coincideTexto;
  });

  const productosHtml = filtrados.map((p) => {
    const cant = estado.carrito[p.id] || 0;
    return `
      <article class="product-card">
        <div>
          <div class="product-emoji">${p.emoji}</div>
          <div class="product-name">${p.nombre}</div>
          <div class="product-farmer">${p.campesino}</div>
          <div class="product-price">${formatoCOP(p.precio)} <span class="product-unit">/ ${p.unidad}</span></div>
        </div>
        <div class="qty-selector">
          <button class="qty-btn" onclick="cambiarCantidad(${p.id}, -1)" aria-label="Quitar">−</button>
          <span class="qty-value">${cant}</span>
          <button class="qty-btn" onclick="cambiarCantidad(${p.id}, 1)" aria-label="Agregar">+</button>
        </div>
      </article>
    `;
  }).join("");

  document.getElementById("main-view").innerHTML = `
    <h1 class="page-title">Mercado fresco</h1>
    <input class="search-input" type="search" placeholder="Buscar papa, tomate, campesino..."
      value="${estado.busqueda}" oninput="actualizarBusqueda(this.value)">
    <div class="chips-row">${chipsHtml}</div>
    <div class="products-grid">
      ${productosHtml || `<p style="grid-column:1/-1; color:var(--texto-suave);">No encontramos productos con ese nombre.</p>`}
    </div>
  `;
}

function actualizarBusqueda(texto) {
  estado.busqueda = texto;
  vistaMercado();
}

function filtrarCategoria(cat) {
  estado.categoria = cat;
  vistaMercado();
}

function cambiarCantidad(idProducto, cambio) {
  const actual = estado.carrito[idProducto] || 0;
  const nuevo = Math.max(0, actual + cambio);
  if (nuevo === 0) delete estado.carrito[idProducto];
  else estado.carrito[idProducto] = nuevo;

  dibujarBarraInferior();
  dibujarVistaActual();
}

// ======================================================
// PERFIL FAMILIA: 2. CARRITO Y PAGO SIMULADO
// ======================================================

function calcularTotalesCarrito() {
  let subtotal = 0;
  for (const [id, cant] of Object.entries(estado.carrito)) {
    const prod = PRODUCTOS.find((p) => p.id === Number(id));
    if (prod) subtotal += prod.precio * cant;
  }
  const envio = subtotal > 0 ? 15000 : 0;
  const servicio = Math.round(subtotal * 0.04); // 4% de los productos
  const total = subtotal + envio + servicio;
  return { subtotal, envio, servicio, total };
}

function vistaCarrito() {
  const items = Object.entries(estado.carrito).map(([id, cant]) => {
    const prod = PRODUCTOS.find((p) => p.id === Number(id));
    return { ...prod, cant };
  });

  const { subtotal, envio, servicio, total } = calcularTotalesCarrito();

  const listaHtml = items.length
    ? items.map((item) => `
        <div class="cart-row">
          <div>
            <strong>${item.emoji} ${item.nombre}</strong>
            <div style="font-size:14px; color:var(--texto-suave);">${item.cant} × ${formatoCOP(item.precio)}</div>
          </div>
          <strong>${formatoCOP(item.precio * item.cant)}</strong>
        </div>
      `).join("")
    : `<p style="color:var(--texto-suave); text-align:center; padding:16px 0;">Tu carrito está vacío. Agrega productos en Mercado.</p>`;

  document.getElementById("main-view").innerHTML = `
    <h1 class="page-title">Tu carrito</h1>
    <div class="card">${listaHtml}</div>

    <div class="summary-card">
      <div class="sub-title">Resumen claro de tu compra</div>
      <div class="summary-line"><span>Productos</span><strong>${formatoCOP(subtotal)}</strong></div>
      <div class="summary-line"><span>Envío</span><strong>${formatoCOP(envio)}</strong></div>
      <div class="summary-line"><span>Servicio (4%)</span><strong>${formatoCOP(servicio)}</strong></div>
      <div class="summary-total"><span>Total</span><span>${formatoCOP(total)}</span></div>
      <button class="btn-primary" ${subtotal === 0 ? "disabled" : ""} onclick="abrirModalPago()">
        Pagar ${formatoCOP(total)}
      </button>
    </div>
  `;
}

function abrirModalPago() {
  const { total } = calcularTotalesCarrito();
  const metodos = ["Nequi", "Daviplata", "Tarjeta"];
  const opcionesHtml = metodos.map((m) => `
    <button class="pay-option ${estado.metodoPago === m ? "selected" : ""}" onclick="elegirMetodoPago('${m}')">
      <span>${m === "Nequi" ? "📱" : m === "Daviplata" ? "📲" : "💳"} ${m}</span>
      <span>${estado.metodoPago === m ? "●" : "○"}</span>
    </button>
  `).join("");

  abrirModal(`
    <h2 class="page-title" style="margin-bottom:8px;">Elige cómo pagar</h2>
    <p style="color:var(--texto-suave); margin-bottom:16px;">Total a pagar: <strong>${formatoCOP(total)}</strong></p>
    ${opcionesHtml}
    <button class="btn-primary" onclick="confirmarPagoSimulado()">Confirmar pago con ${estado.metodoPago}</button>
    <button class="btn-secondary" onclick="cerrarModal()">Cancelar</button>
  `);
}

function elegirMetodoPago(metodo) {
  estado.metodoPago = metodo;
  abrirModalPago();
}

function confirmarPagoSimulado() {
  const { subtotal, envio } = calcularTotalesCarrito();
  const pedidoCompartido = estado.pedidos[0]; // #RJ-1024
  pedidoCompartido.valorProductos = subtotal;
  pedidoCompartido.envio = envio;

  abrirModal(`
    <div style="text-align:center; padding:10px 0;">
      <div class="success-check">✓</div>
      <h2 class="page-title" style="margin-bottom:6px;">¡Pago confirmado!</h2>
      <p style="color:var(--texto-suave); margin-bottom:18px;">
        Tu pedido <strong>#RJ-1024</strong> ya fue enviado al campesino Hernando Rojas.
      </p>
      <button class="btn-primary" onclick="irAMiPedidoDespuesDePago()">Ver mi pedido #RJ-1024</button>
    </div>
  `);
}

function irAMiPedidoDespuesDePago() {
  cerrarModal();
  mostrarToast("¡Listo! Pedido confirmado");
  cambiarPestana("pedido");
}

// ======================================================
// PERFIL FAMILIA: 3. MI PEDIDO #RJ-1024
// ======================================================

function vistaMiPedido() {
  const pedido = estado.pedidos[0]; // #RJ-1024 compartido
  const pasos = [
    { nombre: "Pedido confirmado", desc: "Hernando recibió tu lista de mercado." },
    { nombre: "Preparando", desc: "Cosechando y empacando tus alimentos frescos." },
    { nombre: "Enviado por el campesino", desc: "Tu mercado va camino a tu puerta." },
    { nombre: "Entregado", desc: "Mercado entregado directamente a tu familia." }
  ];

  const indiceActual = pasos.findIndex((p) => p.nombre === pedido.estado);

  const timelineHtml = pasos.map((p, idx) => `
    <div class="step ${idx <= indiceActual ? "done" : ""}">
      <div class="step-dot">${idx <= indiceActual ? "✓" : idx + 1}</div>
      <div>
        <strong>${p.nombre}</strong>
        <p>${p.desc}</p>
      </div>
    </div>
  `).join("");

  let accionFinalHtml = "";
  if (!pedido.recibidoPorFamilia) {
    accionFinalHtml = `
      <button class="btn-primary" onclick="confirmarReciboFamilia()">
        Confirmar que recibí mi mercado
      </button>
    `;
  } else {
    const estrellasHtml = [1, 2, 3, 4, 5].map((n) => `
      <button class="star-btn ${pedido.calificacion >= n ? "active" : ""}" onclick="calificarPedido(${n})">★</button>
    `).join("");

    accionFinalHtml = `
      <div class="card" style="text-align:center; border-color:var(--hoja);">
        <div class="sub-title" style="color:var(--bosque);">¡Gracias por confirmar!</div>
        <p style="font-size:15px; color:var(--texto-suave);">Califica la frescura y atención de Hernando:</p>
        <div class="stars-row">${estrellasHtml}</div>
        ${pedido.calificacion > 0 ? `<p style="font-weight:700; color:var(--bosque);">Calificaste con ${pedido.calificacion} estrellas</p>` : ""}
      </div>
    `;
  }

  document.getElementById("main-view").innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px;">
      <h1 class="page-title" style="margin:0;">Mi pedido #${pedido.id}</h1>
      <span class="badge ${pedido.estado === "Entregado" ? "badge-entregado" : "badge-hoja"}">${pedido.estado}</span>
    </div>

    <!-- Tarjeta del campesino -->
    <div class="card" style="display:flex; align-items:center; gap:14px;">
      <div class="initials-circle initials-earth">HR</div>
      <div>
        <div style="font-size:13px; font-weight:700; color:var(--naranja);">TU CAMPESINO</div>
        <strong style="font-size:18px;">${estado.campesino.nombre}</strong>
        <div style="font-size:14px; color:var(--texto-suave);">${estado.campesino.vereda}</div>
      </div>
    </div>

    <div class="card">
      <div class="sub-title">Estado de tu mercado</div>
      <div class="timeline">${timelineHtml}</div>
    </div>

    ${accionFinalHtml}
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

function calificarPedido(estrellas) {
  estado.pedidos[0].calificacion = estrellas;
  mostrarToast("¡Gracias por tu calificación!");
  vistaMiPedido();
}

// ======================================================
// PERFIL CAMPESINO: 1. PEDIDOS
// ======================================================

function vistaPedidosCampesino() {
  const tarjetas = estado.pedidos.map((p) => {
    const totalCampesino = p.valorProductos + p.envio;
    let botonAccion = "";

    if (!p.aceptado) {
      botonAccion = `<button class="btn-primary" onclick="aceptarPedidoCampesino('${p.id}')">Aceptar</button>`;
    } else if (p.estado === "Pedido confirmado") {
      botonAccion = `<button class="btn-primary" onclick="abrirFotoPaso('${p.id}', 'Preparando', 'Marcar preparando')">Marcar preparando</button>`;
    } else if (p.estado === "Preparando") {
      botonAccion = `<button class="btn-primary" onclick="abrirFotoPaso('${p.id}', 'Enviado por el campesino', 'Marcar enviado')">Marcar enviado</button>`;
    } else if (p.estado === "Enviado por el campesino") {
      botonAccion = `<button class="btn-primary" onclick="abrirFotoPaso('${p.id}', 'Entregado', 'Marcar entregado')">Marcar entregado</button>`;
    } else {
      botonAccion = `<div style="margin-top:12px; font-weight:800; color:var(--bosque);">✓ Pedido completado y sumado a tu saldo</div>`;
    }

    return `
      <article class="card">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
          <strong style="font-size:18px;">Pedido #${p.id}</strong>
          <span class="badge ${p.estado === "Entregado" ? "badge-entregado" : "badge-naranja"}">${p.estado}</span>
        </div>
        <p style="font-weight:700;">${p.familia}</p>
        <p style="font-size:15px; color:var(--texto-suave); margin:4px 0;">${p.productosTexto}</p>
        <p style="font-size:14px; color:var(--tierra); margin-bottom:10px;">📍 ${p.direccion}</p>
        <div style="display:flex; justify-content:space-between; border-top:1px solid var(--borde); padding-top:10px;">
          <span style="color:var(--texto-suave);">Recibes (productos + envío)</span>
          <strong style="font-size:19px; color:var(--bosque);">${formatoCOP(totalCampesino)}</strong>
        </div>
        ${botonAccion}
      </article>
    `;
  }).join("");

  document.getElementById("main-view").innerHTML = `
    <h1 class="page-title">Pedidos entrantes</h1>
    ${tarjetas}
  `;
}

function aceptarPedidoCampesino(idPedido) {
  const pedido = estado.pedidos.find((p) => p.id === idPedido);
  if (!pedido) return;
  pedido.aceptado = true;
  mostrarToast("¡Listo! Pedido aceptado");
  vistaPedidosCampesino();
}

function abrirFotoPaso(idPedido, nuevoEstado, textoBoton) {
  abrirModal(`
    <h2 class="page-title" style="margin-bottom:6px;">${textoBoton}</h2>
    <p style="color:var(--texto-suave);">Toma una foto rápida de respaldo para la familia (simulada).</p>
    <div class="photo-box">
      <div style="font-size:48px;">📸🧺🥕</div>
      <strong style="display:block; margin-top:8px;">Foto lista · Pedido #${idPedido}</strong>
      <span style="font-size:14px; color:var(--texto-suave);">Se actualizará a: ${nuevoEstado}</span>
    </div>
    <button class="btn-primary" onclick="confirmarPasoCampesino('${idPedido}', '${nuevoEstado}')">Confirmar</button>
    <button class="btn-secondary" onclick="cerrarModal()">Cancelar</button>
  `);
}

function confirmarPasoCampesino(idPedido, nuevoEstado) {
  const pedido = estado.pedidos.find((p) => p.id === idPedido);
  if (!pedido) return;

  pedido.estado = nuevoEstado;
  if (nuevoEstado === "Entregado") {
    acreditarSaldoCampesino(pedido);
  }

  cerrarModal();
  mostrarToast("¡Listo! Estado actualizado");
  vistaPedidosCampesino();
}

function acreditarSaldoCampesino(pedido) {
  if (pedido.saldoAcreditado) return;
  const pago = pedido.valorProductos + pedido.envio;
  estado.campesino.saldo += pago;
  estado.campesino.historial.unshift({
    titulo: `Pedido #${pedido.id} entregado`,
    fecha: "Ahora mismo · Productos + envío",
    monto: pago
  });
  pedido.saldoAcreditado = true;
}

// ======================================================
// PERFIL CAMPESINO: 2. MI SALDO
// ======================================================

function vistaSaldoCampesino() {
  const historialHtml = estado.campesino.historial.map((h) => `
    <div class="cart-row">
      <div>
        <strong>${h.titulo}</strong>
        <div style="font-size:13px; color:var(--texto-suave);">${h.fecha}</div>
      </div>
      <strong style="color:${h.monto >= 0 ? "var(--bosque)" : "var(--tierra)"};">
        ${h.monto >= 0 ? "+" : ""}${formatoCOP(h.monto)}
      </strong>
    </div>
  `).join("");

  document.getElementById("main-view").innerHTML = `
    <h1 class="page-title">Mi saldo</h1>

    <div class="balance-card">
      <span style="font-size:15px; opacity:0.9;">Saldo disponible</span>
      <div class="balance-number">${formatoCOP(estado.campesino.saldo)}</div>
      <p style="font-size:14px; opacity:0.9;">Cuenta: ${estado.campesino.cuenta}</p>
      <button class="btn-primary" style="background:var(--blanco); color:var(--bosque);"
        ${estado.campesino.saldo <= 0 ? "disabled" : ""} onclick="abrirModalRetiro()">
        Retirar a mi cuenta bancaria
      </button>
    </div>

    <div class="info-note">
      <strong>Pago justo y claro:</strong> recibes el <strong>100% del valor de tus productos más el envío</strong>. El saldo aparece aquí apenas el pedido queda entregado.
    </div>

    <div class="card">
      <div class="sub-title">Historial de pagos</div>
      ${historialHtml}
    </div>
  `;
}

function abrirModalRetiro() {
  abrirModal(`
    <h2 class="page-title" style="margin-bottom:8px;">Confirmar retiro</h2>
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
    fecha: "Ahora mismo",
    monto: -monto
  });

  cerrarModal();
  mostrarToast("¡Listo! Retiro enviado");
  vistaSaldoCampesino();
}

// ======================================================
// PERFIL CAMPESINO: 3. APRENDER
// ======================================================

function vistaAprender() {
  const cardsHtml = VIDEOS_APRENDER.map((v) => `
    <article class="card video-card" onclick="abrirVideo(${v.id})">
      <div class="play-circle">▶</div>
      <div>
        <span class="badge badge-hoja" style="margin-bottom:4px;">Video gratis · ${v.duracion}</span>
        <strong style="display:block; font-size:17px;">${v.titulo}</strong>
      </div>
    </article>
  `).join("");

  document.getElementById("main-view").innerHTML = `
    <h1 class="page-title">Aprender</h1>
    <p style="color:var(--texto-suave); margin-bottom:16px;">
      Videos cortos y gratuitos para fortalecer tu finca y tus ganancias.
    </p>
    ${cardsHtml}
  `;
}

function abrirVideo(idVideo) {
  const v = VIDEOS_APRENDER.find((item) => item.id === idVideo);
  if (!v) return;
  abrirModal(`
    <span class="badge badge-hoja">Video gratis · ${v.duracion}</span>
    <h2 class="page-title" style="margin:10px 0 8px;">${v.titulo}</h2>
    <div class="photo-box" style="background:var(--bosque); color:var(--blanco); border:none;">
      <div style="font-size:44px;">🎬</div>
      <strong style="display:block; margin-top:6px;">Reproduciendo clase simulada</strong>
    </div>
    <p style="font-size:16px; color:var(--texto); margin-bottom:12px;">${v.resumen}</p>
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

function cerrarModalFondo(event) {
  if (event.target.id === "modal-overlay") cerrarModal();
}
