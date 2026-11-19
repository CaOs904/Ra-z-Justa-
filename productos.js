// ======================================================
// CATÁLOGO REAL DE PRODUCTOS - RAÍZ JUSTA
// 119 productos (Frutas, Verduras y Hortalizas)
// ======================================================

const CAMPESINOS = [
  { nombre: "Hernando Rojas", zona: "Sibaté" },
  { nombre: "Marleny Cortés", zona: "Fusagasugá" },
  { nombre: "Gonzalo Pineda", zona: "Silvania" },
  { nombre: "Rosalba Duarte", zona: "Granada" }
];

// Datos base: [id, nombre, precio, unidadTexto, categoria, emoji, idxCampesino, frescoHoy, masPedido]
const RAW_PRODUCTOS = [
  // -------- FRUTAS (52) --------
  [1, "Agraz", 3950, "Bandeja", "Frutas", "🫐", 0, true, false],
  [2, "Aguacate Papelillo", 4525, "Libra", "Frutas", "🥑", 1, false, true],
  [3, "Aguacate Hass", 4025, "Libra", "Frutas", "🥑", 2, true, true],
  [4, "Arándanos", 24250, "unidad x 500 Gr", "Frutas", "🫐", 0, false, false],
  [5, "Arándanos", 6550, "Unidad X 125 Gr", "Frutas", "🫐", 0, true, false],
  [6, "Banano Bocadillo", 1575, "Libra", "Frutas", "🍌", 1, false, false],
  [7, "Banano Urabá", 1225, "Libra", "Frutas", "🍌", 1, true, true],
  [8, "Borojó", 3250, "Unidad", "Frutas", "🍈", 2, false, false],
  [9, "Ciruela Nacional", 1825, "Libra", "Frutas", "🍑", 0, false, false],
  [10, "Coco", 4050, "Unidad", "Frutas", "🥥", 1, false, false],
  [11, "Curuba", 1675, "Libra", "Frutas", "🥭", 3, true, false],
  [12, "Durazno Importado", 6025, "Libra", "Frutas", "🍑", 3, false, false],
  [13, "Durazno Nacional", 1925, "Libra", "Frutas", "🍑", 0, false, false],
  [14, "Fresa Pareja", 2475, "Libra", "Frutas", "🍓", 0, true, true],
  [15, "Fresa", 2850, "Bandeja X 500 Gr", "Frutas", "🍓", 0, false, false],
  [16, "Granadilla", 950, "Unidad", "Frutas", "🟠", 2, true, true],
  [17, "Guanábana", 3425, "Libra", "Frutas", "🍈", 1, false, false],
  [18, "Guayaba", 2175, "Libra", "Frutas", "🍐", 2, false, false],
  [19, "Gulupa", 1825, "Libra", "Frutas", "🟣", 3, false, false],
  [20, "Kiwi", 8525, "Libra", "Frutas", "🥝", 3, false, false],
  [21, "Limón", 1275, "Libra", "Frutas", "🍋", 1, true, true],
  [22, "Lulo", 2475, "Libra", "Frutas", "🟠", 2, false, false],
  [23, "Mandarina Arrayana", 2125, "Libra", "Frutas", "🍊", 1, true, true],
  [24, "Mandarina Oneco", 2125, "Libra", "Frutas", "🍊", 2, false, false],
  [25, "Mango Azúcar", 2275, "Libra", "Frutas", "🥭", 1, true, true],
  [26, "Mango Farchil", 3125, "Libra", "Frutas", "🥭", 1, false, false],
  [27, "Manzana de Agua", 2275, "Libra", "Frutas", "🍎", 3, false, false],
  [28, "Manzana Roja", 3425, "Libra", "Frutas", "🍎", 3, false, false],
  [29, "Manzana Roja Y Verde", 7750, "Bandeka X 6 Mixta", "Frutas", "🍏", 3, false, false],
  [30, "Manzana Verde", 3725, "Libra", "Frutas", "🍏", 3, false, false],
  [31, "Maracuyá", 2925, "Libra", "Frutas", "🟡", 2, false, false],
  [32, "Melón", 1925, "Libra", "Frutas", "🍈", 1, false, false],
  [33, "Mora", 3925, "Libra", "Frutas", "🫐", 0, true, false],
  [34, "Naranja Valencia", 1475, "Libra", "Frutas", "🍊", 1, false, true],
  [35, "Naranja Tangelo", 2775, "Libra", "Frutas", "🍊", 2, false, false],
  [36, "Papaya", 1225, "Libra", "Frutas", "🍈", 1, true, true],
  [37, "Papayuela", 2775, "Libra", "Frutas", "🍐", 0, false, false],
  [38, "Patilla Baby", 1025, "Libra", "Frutas", "🍉", 1, false, false],
  [39, "Patilla Común", 1025, "Libra", "Frutas", "🍉", 1, false, false],
  [40, "Pera Importada", 3425, "Libra", "Frutas", "🍐", 3, false, false],
  [41, "Pera nacional", 1675, "Libra", "Frutas", "🍐", 0, false, false],
  [42, "Pera Importada", 4125, "Libra", "Frutas", "🍐", 3, false, false],
  [43, "Piña Mayanéz", 1525, "Libra", "Frutas", "🍍", 2, false, false],
  [44, "Piña Golden", 1525, "Libra", "Frutas", "🍍", 2, false, false],
  [45, "Pitahaya Amarilla", 4425, "Libra", "Frutas", "🟡", 1, false, false],
  [46, "Tamarindo", 2500, "Unidad", "Frutas", "🟤", 2, false, false],
  [47, "Tomate de Árbol", 1675, "Libra", "Frutas", "🍅", 0, false, false],
  [48, "Uchuva", 1650, "Unidad", "Frutas", "🟠", 3, false, false],
  [49, "Uva importada Morada", 5525, "Libra", "Frutas", "🍇", 3, false, false],
  [50, "Uva Isabella", 2650, "Bandeja", "Frutas", "🍇", 2, false, false],
  [51, "Uva Nacional Morada", 5525, "Libra", "Frutas", "🍇", 2, false, false],
  [52, "Uva Nacional Verde", 5525, "Libra", "Frutas", "🍇", 2, false, false],

  // -------- VERDURAS (44) --------
  [53, "Ahuyama Nacional", 1325, "Libra", "Verduras", "🎃", 2, false, false],
  [54, "Ahuyama Peruana", 1375, "Libra", "Verduras", "🎃", 2, false, false],
  [55, "Ajo importado", 4775, "Libra", "Verduras", "🧄", 3, false, false],
  [56, "Ajo nacional", 4775, "Libra", "Verduras", "🧄", 0, false, false],
  [57, "Arracacha", 2075, "Libra", "Verduras", "🥔", 3, false, false],
  [58, "Arveja Cáscara", 3525, "Libra", "Verduras", "🫛", 0, false, false],
  [59, "Arveja Desgranada", 8775, "Libra", "Verduras", "🫛", 0, false, false],
  [60, "Berenjena", 2225, "Libra", "Verduras", "🍆", 1, false, false],
  [61, "Calabacín", 1525, "Libra", "Verduras", "🥒", 2, false, false],
  [62, "Calabaza", 625, "Libra", "Verduras", "🎃", 2, false, false],
  [63, "Cebolla Cabezona Blanca", 925, "Libra", "Verduras", "🧅", 0, true, true],
  [64, "Cebolla Cabezona Roja", 1075, "Libra", "Verduras", "🧅", 0, false, false],
  [65, "Cebolla Larga", 675, "Libra", "Verduras", "🧅", 0, true, true],
  [66, "Champiñones", 24950, "Kilo", "Verduras", "🍄", 3, false, false],
  [67, "Champiñones", 11725, "Libra", "Verduras", "🍄", 3, false, false],
  [68, "Champiñones Tajados", 4750, "Unidad X 160 Gr", "Verduras", "🍄", 3, false, false],
  [69, "Colicero", 1925, "Libra", "Verduras", "🍌", 1, false, false],
  [70, "Criolla Lavada", 2025, "Libra", "Verduras", "🥔", 0, true, true],
  [71, "Cubios", 1025, "Libra", "Verduras", "🥔", 0, false, false],
  [72, "Frijol Cáscara", 2725, "Libra", "Verduras", "🫘", 2, false, false],
  [73, "Frijol Desgranado", 7025, "Libra", "Verduras", "🫘", 2, false, false],
  [74, "Guatila", 1675, "Libra", "Verduras", "🍐", 3, false, false],
  [75, "Habas", 925, "Libra", "Verduras", "🫛", 0, false, false],
  [76, "Habichuela", 1025, "Libra", "Verduras", "🫛", 1, false, false],
  [77, "Mazorca Amero", 1825, "Libra", "Verduras", "🌽", 3, false, false],
  [78, "Mazorca Desgranada", 3775, "Libra", "Verduras", "🌽", 3, false, false],
  [79, "Papa Pastusa", 1250, "Libra", "Verduras", "🥔", 0, true, true],
  [80, "Papa Sabanera", 1825, "Libra", "Verduras", "🥔", 0, true, true],
  [81, "Pepino Cohombro", 1075, "Libra", "Verduras", "🥒", 1, false, false],
  [82, "Pepino Dulce", 2025, "Libra", "Verduras", "🥒", 2, false, false],
  [83, "Pepino de Guiso", 2225, "Libra", "Verduras", "🥒", 2, false, false],
  [84, "Pimentón Común", 1775, "Libra", "Verduras", "🫑", 1, false, false],
  [85, "Plátano", 1475, "Libra", "Verduras", "🍌", 1, true, true],
  [86, "Raiz China", 1700, "Unidad X 250 GR", "Verduras", "🌱", 3, false, false],
  [87, "Remolacha", 825, "Libra", "Verduras", "🍠", 0, false, false],
  [88, "Repollo Morado", 975, "Libra", "Verduras", "🥬", 3, false, false],
  [89, "Repollo Verde", 975, "Libra", "Verduras", "🥬", 3, false, false],
  [90, "Tomate Cherry", 2625, "Libra", "Verduras", "🍅", 1, false, false],
  [91, "Tomate de Guiso", 1925, "Libra", "Verduras", "🍅", 2, true, true],
  [92, "Tomate Larga Vida", 2325, "Libra", "Verduras", "🍅", 2, false, false],
  [93, "Yuca", 1225, "Libra", "Verduras", "🥔", 1, false, false],
  [94, "Zanahoria", 725, "Libra", "Verduras", "🥕", 0, true, true],
  [95, "Zuccini amarillo", 775, "Libra", "Verduras", "🥒", 3, false, false],
  [96, "Zuccini Verde", 775, "Libra", "Verduras", "🥒", 3, false, false],

  // -------- HORTALIZAS (23) --------
  [97, "Acelga", 975, "Libra", "Hortalizas", "🥬", 0, false, false],
  [98, "Acelga China", 3550, "Bandeja X 450 gr", "Hortalizas", "🥬", 3, false, false],
  [99, "Apio", 775, "Libra", "Hortalizas", "🥬", 0, false, false],
  [100, "Brócoli", 1925, "Libra", "Hortalizas", "🥦", 3, true, true],
  [101, "Cebolla Puerro", 675, "Libra", "Hortalizas", "🧅", 0, false, false],
  [102, "Cilantro", 1275, "Libra", "Hortalizas", "🌿", 0, true, true],
  [103, "Cilantro Cimarrón", 5550, "Unidad", "Hortalizas", "🌿", 1, false, false],
  [104, "Cogollo", 5250, "Bandeja", "Hortalizas", "🥬", 3, false, false],
  [105, "Col De Bruselas", 6650, "Bandeja x 350 gr", "Hortalizas", "🥦", 3, false, false],
  [106, "Coliflor", 1925, "Libra", "Hortalizas", "🥦", 3, false, false],
  [107, "Espinaca", 1350, "Unidad", "Hortalizas", "🥬", 0, true, false],
  [108, "Guascas", 1775, "Libra", "Hortalizas", "🌿", 0, false, false],
  [109, "Kale", 3350, "Bandeja", "Hortalizas", "🥬", 3, false, false],
  [110, "Lechuga Batavia", 3550, "Unidad", "Hortalizas", "🥬", 3, false, false],
  [111, "Lechuga hidroponica Verde", 1950, "Unidad", "Hortalizas", "🥬", 3, true, true],
  [112, "Lechuga Crespa Morada", 1950, "Unidad", "Hortalizas", "🥬", 3, false, false],
  [113, "Lechuga Romana", 1950, "Unidad", "Hortalizas", "🥬", 3, false, false],
  [114, "Mix Asiatico (hoja tabsoy-mix verde y morado- hoja mostaza y cherry", 3850, "Bandeja 200 gr", "Hortalizas", "🥗", 3, false, false],
  [115, "Perejil Liso", 2525, "Libra", "Hortalizas", "🌿", 0, false, false],
  [116, "Perejil Crespo", 2125, "Libra", "Hortalizas", "🌿", 0, false, false],
  [117, "Rugula", 3550, "Bandeja", "Hortalizas", "🌿", 3, false, false],
  [118, "Yacon", 4650, "Bandeja", "Hortalizas", "🥔", 2, false, false],
  [119, "Zanahoria Baby", 5250, "Bandeja x 250 gr", "Hortalizas", "🥕", 0, false, false]
];

// Clasifica la unidad para manejar pasos, etiquetas y máximos
function detectarTipoUnidad(unidadTexto) {
  const u = unidadTexto.toLowerCase();
  if (u === "libra") return { tipo: "libra", etiquetaCorta: "lb", max: 10 };
  if (u === "kilo") return { tipo: "kilo", etiquetaCorta: "kg", max: 5 };
  if (u.includes("bandeja") || u.includes("bandeka")) return { tipo: "bandeja", etiquetaCorta: unidadTexto, max: 10 };
  if (u.includes("atado")) return { tipo: "atado", etiquetaCorta: unidadTexto, max: 10 };
  return { tipo: "unidad", etiquetaCorta: unidadTexto, max: 10 };
}

function colorPorCategoria(cat) {
  if (cat === "Frutas") return "bg-frutas";
  if (cat === "Verduras") return "bg-verduras";
  return "bg-hierbas"; // Hortalizas
}

// Arreglo final de productos usado por toda la app
const PRODUCTOS = RAW_PRODUCTOS.map(([id, nombre, precio, unidadTexto, categoria, emoji, idxCamp, frescoHoy, masPedido]) => {
  const infoU = detectarTipoUnidad(unidadTexto);
  const camp = CAMPESINOS[idxCamp];
  return {
    id,
    nombre,
    precio,
    unidad: unidadTexto,
    tipoUnidad: infoU.tipo,          // "libra" | "kilo" | "unidad" | "bandeja" | "atado"
    etiquetaUnidad: infoU.etiquetaCorta,
    maxCantidad: infoU.max,          // 10 (o 5 para kilo)
    categoria,                       // "Frutas" | "Verduras" | "Hortalizas"
    colorCat: colorPorCategoria(categoria),
    emoji,
    campesino: camp.nombre,
    zona: camp.zona,
    frescoHoy,
    masPedido,
    disponible: true
  };
});

// ======================================================
// MERCADOS ARMADOS (Básico, Familiar y Quincenal)
// ======================================================

// 28 líneas exactas del Mercado Familiar (suma = $65.525)
const LINEAS_FAMILIAR = [
  { id: 87, qty: 1 },  // Remolacha 1 lb
  { id: 18, qty: 1 },  // Guayaba 1 lb
  { id: 21, qty: 1 },  // Limón 1 lb
  { id: 94, qty: 3 },  // Zanahoria 3 lb
  { id: 65, qty: 3 },  // Cebolla Larga 3 lb
  { id: 9,  qty: 1 },  // Ciruela Nacional 1 lb
  { id: 57, qty: 1 },  // Arracacha 1 lb
  { id: 23, qty: 2 },  // Mandarina Arrayana 2 lb
  { id: 27, qty: 1 },  // Manzana de Agua 1 lb
  { id: 25, qty: 1 },  // Mango Azúcar 1 lb
  { id: 11, qty: 1 },  // Curuba 1 lb
  { id: 16, qty: 3 },  // Granadilla 3 unidades
  { id: 85, qty: 2 },  // Plátano 2 lb
  { id: 34, qty: 1 },  // Naranja Valencia 1 lb
  { id: 53, qty: 2 },  // Ahuyama Nacional 2 lb
  { id: 69, qty: 1 },  // Colicero 1 lb
  { id: 81, qty: 1 },  // Pepino Cohombro 1 lb
  { id: 96, qty: 3 },  // Zuccini Verde 3 lb
  { id: 111, qty: 1 }, // Lechuga hidroponica Verde 1 unidad
  { id: 3,  qty: 2 },  // Aguacate Hass 2 lb
  { id: 99, qty: 1 },  // Apio 1 lb
  { id: 7,  qty: 2 },  // Banano Urabá 2 lb
  { id: 91, qty: 2 },  // Tomate de Guiso 2 lb
  { id: 79, qty: 2 },  // Papa Pastusa 2 lb
  { id: 97, qty: 1 },  // Acelga 1 lb
  { id: 107, qty: 1 }, // Espinaca 1 unidad
  { id: 36, qty: 3 },  // Papaya 3 lb
  { id: 63, qty: 2 }   // Cebolla Cabezona Blanca 2 lb
];

const MERCADOS_ARMADOS = [
  {
    id: "basico",
    nombre: "Mercado Básico",
    desc: "Ideal para 1 a 2 personas",
    emoji: "🧺",
    color: "bg-verduras",
    lineas: LINEAS_FAMILIAR.map((l) => ({ id: l.id, qty: Math.ceil(l.qty / 2) }))
  },
  {
    id: "familiar",
    nombre: "Mercado Familiar",
    desc: "Surtido completo de la semana",
    emoji: "🏡",
    color: "bg-frutas",
    lineas: LINEAS_FAMILIAR.map((l) => ({ id: l.id, qty: l.qty }))
  },
  {
    id: "quincenal",
    nombre: "Mercado Quincenal",
    desc: "El doble para rendir 15 días",
    emoji: "🌾",
    color: "bg-tuberculos",
    lineas: LINEAS_FAMILIAR.map((l) => ({ id: l.id, qty: l.qty * 2 }))
  }
];
