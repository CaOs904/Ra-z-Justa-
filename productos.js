// ======================================================
// CATÁLOGO REAL Y TIENDAS DE CAMPESINOS - RAÍZ JUSTA
// 119 productos repartidos por clima entre 4 campesinos
// ======================================================

const CAMPESINOS = [
  {
    id: "hernando",
    nombre: "Hernando Rojas",
    municipio: "Sibaté",
    clima: "Clima frío",
    iniciales: "HR",
    cuenta: "Bancolombia Ahorros •••• 4821",
    frase: "Cosechamos papa, hortalizas y frutos de páramo cada madrugada en tierra fría.",
    especialidades: ["Papas y raíces", "Hortalizas frescas", "Frutas de frío"],
    colorBanner: "linear-gradient(135deg, #2F6B3A, #5B9444)",
    avatarSVG: `<svg viewBox="0 0 64 64" width="58" height="58" aria-hidden="true">
      <circle cx="32" cy="32" r="30" fill="#E4F3E1"/>
      <ellipse cx="32" cy="24" rx="20" ry="5.5" fill="#D9822B"/>
      <path d="M21 23 C22 13, 42 13, 43 23 Z" fill="#8B5E3C"/>
      <circle cx="32" cy="32" r="8" fill="#E8C29B"/>
      <path d="M17 52 C17 40, 47 40, 47 52 Z" fill="#2F6B3A"/>
      <path d="M26 42 L32 48 L38 42" stroke="#FAF6EE" stroke-width="2.5" fill="none"/>
    </svg>`,
    productosIds: [
      1, 11, 14, 15, 33, 47, 48,
      57, 58, 59, 63, 64, 65, 70, 71, 75, 79, 80, 87, 88, 89, 94,
      97, 99, 100, 101, 102, 106, 107, 108, 109, 110, 115, 116
    ],
    mercadosArmados: [
      {
        id: "her-peq",
        nombre: "Canasta fría pequeña",
        desc: "Básicos de Sibaté para 2 a 3 días",
        emoji: "🥔",
        color: "bg-verduras",
        lineas: [
          { id: 79, qty: 2 }, { id: 94, qty: 2 }, { id: 65, qty: 2 },
          { id: 63, qty: 1 }, { id: 102, qty: 1 }, { id: 14, qty: 1 }, { id: 47, qty: 1 }
        ]
      },
      {
        id: "her-sem",
        nombre: "Mercado semanal de Sibaté",
        desc: "Papas, verduras y frutas de tierra fría",
        emoji: "🧺",
        color: "bg-tuberculos",
        lineas: [
          { id: 79, qty: 3 }, { id: 80, qty: 2 }, { id: 70, qty: 2 }, { id: 57, qty: 1 },
          { id: 94, qty: 3 }, { id: 65, qty: 3 }, { id: 63, qty: 2 }, { id: 87, qty: 1 },
          { id: 100, qty: 1 }, { id: 107, qty: 1 }, { id: 102, qty: 1 }, { id: 14, qty: 2 },
          { id: 33, qty: 1 }, { id: 11, qty: 1 }
        ]
      }
    ]
  },
  {
    id: "marleny",
    nombre: "Marleny Cortés",
    municipio: "Fusagasugá",
    clima: "Clima templado",
    iniciales: "MC",
    cuenta: "Nequi •••• 3190",
    frase: "Finca familiar en Fusagasugá con tomates, aguacate, granadilla y verduras de clima templado.",
    especialidades: ["Tomates y guiso", "Aguacate y cítricos", "Granos frescos"],
    colorBanner: "linear-gradient(135deg, #3E7B42, #D9822B)",
    avatarSVG: `<svg viewBox="0 0 64 64" width="58" height="58" aria-hidden="true">
      <circle cx="32" cy="32" r="30" fill="#FCEAD7"/>
      <ellipse cx="32" cy="23" rx="21" ry="5" fill="#E6B35C"/>
      <path d="M22 22 C23 13, 41 13, 42 22 Z" fill="#C48B3B"/>
      <path d="M23 30 Q20 38 23 42 M41 30 Q44 38 41 42" stroke="#4A3222" stroke-width="3.5" stroke-linecap="round"/>
      <circle cx="32" cy="32" r="8" fill="#E2B48D"/>
      <path d="M17 52 C17 40, 47 40, 47 52 Z" fill="#D9822B"/>
    </svg>`,
    productosIds: [
      3, 16, 19, 21, 22, 23, 31, 34, 49, 50, 51, 52,
      53, 55, 56, 58, 59, 60, 61, 63, 64, 65, 72, 74, 76, 77, 78, 81, 82, 83, 84, 90, 91, 92, 94, 95, 96,
      102, 118
    ],
    mercadosArmados: [
      {
        id: "mar-peq",
        nombre: "Canasta templada pequeña",
        desc: "Guiso fresco y frutas de Fusagasugá",
        emoji: "🍅",
        color: "bg-frutas",
        lineas: [
          { id: 91, qty: 2 }, { id: 84, qty: 1 }, { id: 65, qty: 2 },
          { id: 3, qty: 1 }, { id: 16, qty: 3 }, { id: 21, qty: 1 }, { id: 102, qty: 1 }
        ]
      },
      {
        id: "mar-sem",
        nombre: "Mercado semanal de Fusa",
        desc: "Verduras de guiso, granos y frutas dulces",
        emoji: "🥑",
        color: "bg-verduras",
        lineas: [
          { id: 91, qty: 3 }, { id: 84, qty: 2 }, { id: 63, qty: 2 }, { id: 65, qty: 2 },
          { id: 94, qty: 2 }, { id: 76, qty: 2 }, { id: 58, qty: 1 }, { id: 96, qty: 2 },
          { id: 3, qty: 2 }, { id: 23, qty: 2 }, { id: 34, qty: 2 }, { id: 22, qty: 2 },
          { id: 16, qty: 4 }, { id: 102, qty: 1 }
        ]
      }
    ]
  },
  {
    id: "gonzalo",
    nombre: "Gonzalo Pineda",
    municipio: "Silvania",
    clima: "Clima cálido",
    iniciales: "GP",
    cuenta: "Daviplata •••• 7742",
    frase: "Frutas tropicales dulces, plátano y yuca recién arrancada de las veredas cálidas de Silvania.",
    especialidades: ["Plátano y yuca", "Frutas tropicales", "Cítricos dulces"],
    colorBanner: "linear-gradient(135deg, #8B5E3C, #D9822B)",
    avatarSVG: `<svg viewBox="0 0 64 64" width="58" height="58" aria-hidden="true">
      <circle cx="32" cy="32" r="30" fill="#EFE4D4"/>
      <ellipse cx="32" cy="24" rx="22" ry="5.5" fill="#FAF6EE" stroke="#8B5E3C" stroke-width="1.5"/>
      <path d="M22 23 C23 14, 41 14, 42 23 Z" fill="#FAF6EE" stroke="#8B5E3C" stroke-width="1.5"/>
      <rect x="22" y="20" width="20" height="3" fill="#2B2B2B"/>
      <circle cx="32" cy="32" r="8" fill="#D49B6A"/>
      <path d="M17 52 C17 40, 47 40, 47 52 Z" fill="#8B5E3C"/>
    </svg>`,
    productosIds: [
      2, 6, 7, 8, 10, 17, 18, 21, 23, 24, 25, 26, 31, 32, 34, 35, 36, 37, 38, 39, 43, 44, 45, 46,
      53, 54, 62, 65, 69, 72, 73, 76, 81, 84, 85, 91, 93,
      102, 103
    ],
    mercadosArmados: [
      {
        id: "gon-peq",
        nombre: "Canasta tropical pequeña",
        desc: "Plátano, yuca y fruta dulce para jugos",
        emoji: "🍌",
        color: "bg-frutas",
        lineas: [
          { id: 85, qty: 2 }, { id: 93, qty: 2 }, { id: 7, qty: 2 },
          { id: 36, qty: 2 }, { id: 25, qty: 1 }, { id: 21, qty: 1 }, { id: 18, qty: 1 }
        ]
      },
      {
        id: "gon-sem",
        nombre: "Mercado semanal de Silvania",
        desc: "Frutero lleno, plátano, yuca y guiso",
        emoji: "🍍",
        color: "bg-tuberculos",
        lineas: [
          { id: 85, qty: 3 }, { id: 93, qty: 2 }, { id: 69, qty: 2 }, { id: 7, qty: 3 },
          { id: 36, qty: 3 }, { id: 44, qty: 2 }, { id: 25, qty: 2 }, { id: 34, qty: 2 },
          { id: 23, qty: 2 }, { id: 2, qty: 2 }, { id: 53, qty: 2 }, { id: 91, qty: 2 },
          { id: 65, qty: 2 }, { id: 102, qty: 1 }
        ]
      }
    ]
  },
  {
    id: "rosalba",
    nombre: "Rosalba Duarte",
    municipio: "Granada",
    clima: "Hortalizas finas y frío",
    iniciales: "RD",
    cuenta: "Banco Agrario •••• 5518",
    frase: "Huerta limpia en Granada con lechugas hidropónicas, champiñones, frutos rojos y ensaladas.",
    especialidades: ["Hortalizas finas", "Ensaladas limpias", "Frutos rojos"],
    colorBanner: "linear-gradient(135deg, #1E4D2B, #6FAE4F)",
    avatarSVG: `<svg viewBox="0 0 64 64" width="58" height="58" aria-hidden="true">
      <circle cx="32" cy="32" r="30" fill="#DFF4EE"/>
      <ellipse cx="32" cy="24" rx="20" ry="5" fill="#6FAE4F"/>
      <path d="M22 23 C23 14, 41 14, 42 23 Z" fill="#2F6B3A"/>
      <circle cx="32" cy="32" r="8" fill="#EAC5A2"/>
      <path d="M17 52 C17 40, 47 40, 47 52 Z" fill="#6FAE4F"/>
      <circle cx="24" cy="23" r="2.5" fill="#D9822B"/>
    </svg>`,
    productosIds: [
      3, 4, 5, 9, 11, 12, 13, 14, 20, 27, 28, 29, 30, 33, 40, 41, 42, 48,
      66, 67, 68, 70, 86, 90,
      98, 99, 100, 104, 105, 106, 107, 109, 110, 111, 112, 113, 114, 117, 119
    ],
    mercadosArmados: [
      {
        id: "ros-peq",
        nombre: "Canasta verde pequeña",
        desc: "Ensaladas frescas y fruta selecta",
        emoji: "🥗",
        color: "bg-hierbas",
        lineas: [
          { id: 111, qty: 1 }, { id: 107, qty: 1 }, { id: 90, qty: 1 },
          { id: 3, qty: 1 }, { id: 14, qty: 1 }, { id: 68, qty: 1 }
        ]
      },
      {
        id: "ros-sem",
        nombre: "Mercado semanal de Granada",
        desc: "Hortalizas finas, champiñones y frutos rojos",
        emoji: "🫐",
        color: "bg-verduras",
        lineas: [
          { id: 111, qty: 2 }, { id: 112, qty: 1 }, { id: 117, qty: 1 }, { id: 109, qty: 1 },
          { id: 100, qty: 2 }, { id: 107, qty: 1 }, { id: 90, qty: 2 }, { id: 68, qty: 1 },
          { id: 70, qty: 2 }, { id: 3, qty: 2 }, { id: 14, qty: 2 }, { id: 33, qty: 1 },
          { id: 5, qty: 1 }, { id: 28, qty: 2 }
        ]
      }
    ]
  }
];

// Catálogo base exacto de las 3 imágenes confirmadas (119 productos)
const RAW_PRODUCTOS = [
  // FRUTAS (52)
  [1, "Agraz", 3950, "Bandeja", "Frutas", "🫐"],
  [2, "Aguacate Papelillo", 4525, "Libra", "Frutas", "🥑"],
  [3, "Aguacate Hass", 4025, "Libra", "Frutas", "🥑"],
  [4, "Arándanos", 24250, "unidad x 500 Gr", "Frutas", "🫐"],
  [5, "Arándanos", 6550, "Unidad X 125 Gr", "Frutas", "🫐"],
  [6, "Banano Bocadillo", 1575, "Libra", "Frutas", "🍌"],
  [7, "Banano Urabá", 1225, "Libra", "Frutas", "🍌"],
  [8, "Borojó", 3250, "Unidad", "Frutas", "🍈"],
  [9, "Ciruela Nacional", 1825, "Libra", "Frutas", "🍑"],
  [10, "Coco", 4050, "Unidad", "Frutas", "🥥"],
  [11, "Curuba", 1675, "Libra", "Frutas", "🥭"],
  [12, "Durazno Importado", 6025, "Libra", "Frutas", "🍑"],
  [13, "Durazno Nacional", 1925, "Libra", "Frutas", "🍑"],
  [14, "Fresa Pareja", 2475, "Libra", "Frutas", "🍓"],
  [15, "Fresa", 2850, "Bandeja X 500 Gr", "Frutas", "🍓"],
  [16, "Granadilla", 950, "Unidad", "Frutas", "🟠"],
  [17, "Guanábana", 3425, "Libra", "Frutas", "🍈"],
  [18, "Guayaba", 2175, "Libra", "Frutas", "🍐"],
  [19, "Gulupa", 1825, "Libra", "Frutas", "🟣"],
  [20, "Kiwi", 8525, "Libra", "Frutas", "🥝"],
  [21, "Limón", 1275, "Libra", "Frutas", "🍋"],
  [22, "Lulo", 2475, "Libra", "Frutas", "🟠"],
  [23, "Mandarina Arrayana", 2125, "Libra", "Frutas", "🍊"],
  [24, "Mandarina Oneco", 2125, "Libra", "Frutas", "🍊"],
  [25, "Mango Azúcar", 2275, "Libra", "Frutas", "🥭"],
  [26, "Mango Farchil", 3125, "Libra", "Frutas", "🥭"],
  [27, "Manzana de Agua", 2275, "Libra", "Frutas", "🍎"],
  [28, "Manzana Roja", 3425, "Libra", "Frutas", "🍎"],
  [29, "Manzana Roja Y Verde", 7750, "Bandeka X 6 Mixta", "Frutas", "🍏"],
  [30, "Manzana Verde", 3725, "Libra", "Frutas", "🍏"],
  [31, "Maracuyá", 2925, "Libra", "Frutas", "🟡"],
  [32, "Melón", 1925, "Libra", "Frutas", "🍈"],
  [33, "Mora", 3925, "Libra", "Frutas", "🫐"],
  [34, "Naranja Valencia", 1475, "Libra", "Frutas", "🍊"],
  [35, "Naranja Tangelo", 2775, "Libra", "Frutas", "🍊"],
  [36, "Papaya", 1225, "Libra", "Frutas", "🍈"],
  [37, "Papayuela", 2775, "Libra", "Frutas", "🍐"],
  [38, "Patilla Baby", 1025, "Libra", "Frutas", "🍉"],
  [39, "Patilla Común", 1025, "Libra", "Frutas", "🍉"],
  [40, "Pera Importada", 3425, "Libra", "Frutas", "🍐"],
  [41, "Pera nacional", 1675, "Libra", "Frutas", "🍐"],
  [42, "Pera Importada", 4125, "Libra", "Frutas", "🍐"],
  [43, "Piña Mayanéz", 1525, "Libra", "Frutas", "🍍"],
  [44, "Piña Golden", 1525, "Libra", "Frutas", "🍍"],
  [45, "Pitahaya Amarilla", 4425, "Libra", "Frutas", "🟡"],
  [46, "Tamarindo", 2500, "Unidad", "Frutas", "🟤"],
  [47, "Tomate de Árbol", 1675, "Libra", "Frutas", "🍅"],
  [48, "Uchuva", 1650, "Unidad", "Frutas", "🟠"],
  [49, "Uva importada Morada", 5525, "Libra", "Frutas", "🍇"],
  [50, "Uva Isabella", 2650, "Bandeja", "Frutas", "🍇"],
  [51, "Uva Nacional Morada", 5525, "Libra", "Frutas", "🍇"],
  [52, "Uva Nacional Verde", 5525, "Libra", "Frutas", "🍇"],
  // VERDURAS (44)
  [53, "Ahuyama Nacional", 1325, "Libra", "Verduras", "🎃"],
  [54, "Ahuyama Peruana", 1375, "Libra", "Verduras", "🎃"],
  [55, "Ajo importado", 4775, "Libra", "Verduras", "🧄"],
  [56, "Ajo nacional", 4775, "Libra", "Verduras", "🧄"],
  [57, "Arracacha", 2075, "Libra", "Verduras", "🥔"],
  [58, "Arveja Cáscara", 3525, "Libra", "Verduras", "🫛"],
  [59, "Arveja Desgranada", 8775, "Libra", "Verduras", "🫛"],
  [60, "Berenjena", 2225, "Libra", "Verduras", "🍆"],
  [61, "Calabacín", 1525, "Libra", "Verduras", "🥒"],
  [62, "Calabaza", 625, "Libra", "Verduras", "🎃"],
  [63, "Cebolla Cabezona Blanca", 925, "Libra", "Verduras", "🧅"],
  [64, "Cebolla Cabezona Roja", 1075, "Libra", "Verduras", "🧅"],
  [65, "Cebolla Larga", 675, "Libra", "Verduras", "🧅"],
  [66, "Champiñones", 24950, "Kilo", "Verduras", "🍄"],
  [67, "Champiñones", 11725, "Libra", "Verduras", "🍄"],
  [68, "Champiñones Tajados", 4750, "Unidad X 160 Gr", "Verduras", "🍄"],
  [69, "Colicero", 1925, "Libra", "Verduras", "🍌"],
  [70, "Criolla Lavada", 2025, "Libra", "Verduras", "🥔"],
  [71, "Cubios", 1025, "Libra", "Verduras", "🥔"],
  [72, "Frijol Cáscara", 2725, "Libra", "Verduras", "🫘"],
  [73, "Frijol Desgranado", 7025, "Libra", "Verduras", "🫘"],
  [74, "Guatila", 1675, "Libra", "Verduras", "🍐"],
  [75, "Habas", 925, "Libra", "Verduras", "🫛"],
  [76, "Habichuela", 1025, "Libra", "Verduras", "🫛"],
  [77, "Mazorca Amero", 1825, "Libra", "Verduras", "🌽"],
  [78, "Mazorca Desgranada", 3775, "Libra", "Verduras", "🌽"],
  [79, "Papa Pastusa", 1250, "Libra", "Verduras", "🥔"],
  [80, "Papa Sabanera", 1825, "Libra", "Verduras", "🥔"],
  [81, "Pepino Cohombro", 1075, "Libra", "Verduras", "🥒"],
  [82, "Pepino Dulce", 2025, "Libra", "Verduras", "🥒"],
  [83, "Pepino de Guiso", 2225, "Libra", "Verduras", "🥒"],
  [84, "Pimentón Común", 1775, "Libra", "Verduras", "🫑"],
  [85, "Plátano", 1475, "Libra", "Verduras", "🍌"],
  [86, "Raiz China", 1700, "Unidad X 250 GR", "Verduras", "🌱"],
  [87, "Remolacha", 825, "Libra", "Verduras", "🍠"],
  [88, "Repollo Morado", 975, "Libra", "Verduras", "🥬"],
  [89, "Repollo Verde", 975, "Libra", "Verduras", "🥬"],
  [90, "Tomate Cherry", 2625, "Libra", "Verduras", "🍅"],
  [91, "Tomate de Guiso", 1925, "Libra", "Verduras", "🍅"],
  [92, "Tomate Larga Vida", 2325, "Libra", "Verduras", "🍅"],
  [93, "Yuca", 1225, "Libra", "Verduras", "🥔"],
  [94, "Zanahoria", 725, "Libra", "Verduras", "🥕"],
  [95, "Zuccini amarillo", 775, "Libra", "Verduras", "🥒"],
  [96, "Zuccini Verde", 775, "Libra", "Verduras", "🥒"],
  // HORTALIZAS (23)
  [97, "Acelga", 975, "Libra", "Hortalizas", "🥬"],
  [98, "Acelga China", 3550, "Bandeja X 450 gr", "Hortalizas", "🥬"],
  [99, "Apio", 775, "Libra", "Hortalizas", "🥬"],
  [100, "Brócoli", 1925, "Libra", "Hortalizas", "🥦"],
  [101, "Cebolla Puerro", 675, "Libra", "Hortalizas", "🧅"],
  [102, "Cilantro", 1275, "Libra", "Hortalizas", "🌿"],
  [103, "Cilantro Cimarrón", 5550, "Unidad", "Hortalizas", "🌿"],
  [104, "Cogollo", 5250, "Bandeja", "Hortalizas", "🥬"],
  [105, "Col De Bruselas", 6650, "Bandeja x 350 gr", "Hortalizas", "🥦"],
  [106, "Coliflor", 1925, "Libra", "Hortalizas", "🥦"],
  [107, "Espinaca", 1350, "Unidad", "Hortalizas", "🥬"],
  [108, "Guascas", 1775, "Libra", "Hortalizas", "🌿"],
  [109, "Kale", 3350, "Bandeja", "Hortalizas", "🥬"],
  [110, "Lechuga Batavia", 3550, "Unidad", "Hortalizas", "🥬"],
  [111, "Lechuga hidroponica Verde", 1950, "Unidad", "Hortalizas", "🥬"],
  [112, "Lechuga Crespa Morada", 1950, "Unidad", "Hortalizas", "🥬"],
  [113, "Lechuga Romana", 1950, "Unidad", "Hortalizas", "🥬"],
  [114, "Mix Asiatico (hoja tabsoy-mix verde y morado- hoja mostaza y cherry", 3850, "Bandeja 200 gr", "Hortalizas", "🥗"],
  [115, "Perejil Liso", 2525, "Libra", "Hortalizas", "🌿"],
  [116, "Perejil Crespo", 2125, "Libra", "Hortalizas", "🌿"],
  [117, "Rugula", 3550, "Bandeja", "Hortalizas", "🌿"],
  [118, "Yacon", 4650, "Bandeja", "Hortalizas", "🥔"],
  [119, "Zanahoria Baby", 5250, "Bandeja x 250 gr", "Hortalizas", "🥕"]
];

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
  return "bg-hierbas";
}

const PRODUCTOS = RAW_PRODUCTOS.map(([id, nombre, precio, unidadTexto, categoria, emoji]) => {
  const infoU = detectarTipoUnidad(unidadTexto);
  return {
    id,
    nombre,
    precioBase: precio,
    unidad: unidadTexto,
    tipoUnidad: infoU.tipo,
    etiquetaUnidad: infoU.etiquetaCorta,
    maxCantidad: infoU.max,
    categoria,
    colorCat: colorPorCategoria(categoria),
    emoji
  };
});
