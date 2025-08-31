import React, { useEffect, useMemo, useState } from "react";
import { ChevronDown, Globe } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

/**
 * DigitalMenu.tsx — versión por secciones del PDF
 * Comida: Starters, Main Dishes, Grill, Dessert
 * Bebidas: Soft drinks, Beers, Waters, Coffee & infusions, Spirits & mixers, Wines
 * - Nombre traducido por idioma (ES/EN/DE/FR)
 * - Descripción breve con ingredientes (en los 4 idiomas)
 * - Precio vacío cuando no está claro
 * - Soporte de precios múltiples:
 *    · Licores: chupito / copa
 *    · Pollo: medio / entero
 * - Estilos mobile-first (Tailwind)
 */

const BG_URL = "img/11.jpg";

/* ===================== Tipos ===================== */
type Lang = "es" | "en" | "de" | "fr";

type Category =
  | "starters"
  | "main"
  | "grill"
  | "dessert"
  | "drinks-soft"
  | "drinks-beer"
  | "drinks-water"
  | "drinks-coffee"
  | "drinks-liquor"
  | "drinks-wine";

type Dish = {
  id: string;
  category: Category;
  /** nombre base (ES) */
  name: string;
  /** precio simple opcional */
  price?: number | null;
  /** licores: chupito / copa */
  priceShot?: number | null;
  priceGlass?: number | null;
  /** pollo: medio / entero */
  priceHalf?: number | null;
  priceWhole?: number | null;
  /** descripciones por idioma (con ingredientes) */
  descriptions: Record<Lang, string>;
  /** nombres traducidos */
  i18nNames?: Partial<Record<Lang, string>>;
  image: string; // URL
};

/* ===================== I18N (UI) ===================== */
const LANG_LABEL: Record<Lang, string> = {
  es: "Español",
  en: "English",
  de: "Deutsch",
  fr: "Français",
};

const LOCALE_BY_LANG: Record<Lang, string> = {
  es: "es-ES",
  en: "en-GB",
  de: "de-DE",
  fr: "fr-FR",
};

const I18N: Record<
  Lang,
  {
    menuTitle: string;
    subtitle: string;
    languageLabel: string;
    categories: Record<Category, string>;
    expandAll: string;
    collapseAll: string;
    priceLabels: {
      shot: string;
      glass: string;
      halfChicken: string;
      wholeChicken: string;
    };
  }
> = {
  es: {
    menuTitle: "Menú",
    subtitle:
      "Toca un plato o una categoría para ver la imagen y los ingredientes.",
    languageLabel: "Idioma",
    categories: {
      starters: "Entrantes",
      main: "Platos principales",
      grill: "Parrilla",
      dessert: "Postres",
      "drinks-soft": "Refrescos",
      "drinks-beer": "Cervezas",
      "drinks-water": "Aguas",
      "drinks-coffee": "Cafés e infusiones",
      "drinks-liquor": "Licores y combinados",
      "drinks-wine": "Vinos",
    },
    expandAll: "Expandir todo",
    collapseAll: "Recoger todo",
    priceLabels: {
      shot: "Chupito",
      glass: "Copa",
      halfChicken: "1/2 pollo",
      wholeChicken: "Pollo entero",
    },
  },
  en: {
    menuTitle: "Menu",
    subtitle: "Tap a dish or a category to see photo and ingredients.",
    languageLabel: "Language",
    categories: {
      starters: "Starters",
      main: "Main Dishes",
      grill: "Grill",
      dessert: "Dessert",
      "drinks-soft": "Soft drinks",
      "drinks-beer": "Beers",
      "drinks-water": "Waters",
      "drinks-coffee": "Coffee & infusions",
      "drinks-liquor": "Spirits & mixers",
      "drinks-wine": "Wines",
    },
    expandAll: "Expand all",
    collapseAll: "Collapse all",
    priceLabels: {
      shot: "Shot",
      glass: "Mixed drink",
      halfChicken: "Half chicken",
      wholeChicken: "Whole chicken",
    },
  },
  de: {
    menuTitle: "Menü",
    subtitle:
      "Tippe auf ein Gericht oder eine Kategorie für Foto und Zutaten.",
    languageLabel: "Sprache",
    categories: {
      starters: "Vorspeisen",
      main: "Hauptgerichte",
      grill: "Grill",
      dessert: "Nachtisch",
      "drinks-soft": "Erfrischungsgetränke",
      "drinks-beer": "Biere",
      "drinks-water": "Wasser",
      "drinks-coffee": "Kaffee & Aufgüsse",
      "drinks-liquor": "Spirituosen & Mixgetränke",
      "drinks-wine": "Weine",
    },
    expandAll: "Alle öffnen",
    collapseAll: "Alle schließen",
    priceLabels: {
      shot: "Shot",
      glass: "Longdrink",
      halfChicken: "Halbes Hähnchen",
      wholeChicken: "Ganzes Hähnchen",
    },
  },
  fr: {
    menuTitle: "Menu",
    subtitle:
      "Touchez un plat ou une catégorie pour voir la photo et les ingrédients.",
    languageLabel: "Langue",
    categories: {
      starters: "Entrées",
      main: "Plats principaux",
      grill: "Grillades",
      dessert: "Desserts",
      "drinks-soft": "Boissons gazeuses",
      "drinks-beer": "Bières",
      "drinks-water": "Eaux",
      "drinks-coffee": "Cafés & infusions",
      "drinks-liquor": "Spiritueux & cocktails",
      "drinks-wine": "Vins",
    },
    expandAll: "Tout développer",
    collapseAll: "Tout réduire",
    priceLabels: {
      shot: "Shooter",
      glass: "Verre",
      halfChicken: "Demi-poulet",
      wholeChicken: "Poulet entier",
    },
  },
};

/* ===================== Colores por categoría (acentos) ===================== */
const CAT_COLORS: Record<Category, string> = {
  starters: "#14b8a6",
  main: "#6366f1",
  grill: "#ef4444",
  dessert: "#ec4899",
  "drinks-soft": "#0ea5e9",
  "drinks-beer": "#f59e0b",
  "drinks-water": "#22c55e",
  "drinks-coffee": "#a16207",
  "drinks-liquor": "#7c3aed",
  "drinks-wine": "#be123c",
};

/* ===================== Imágenes por categoría ===================== */
const IMG: Record<Category, string> = {
  starters:
    "https://images.unsplash.com/photo-1551183053-bf91a1d81141?q=80&w=1200&auto=format&fit=crop",
  main:
    "https://images.unsplash.com/photo-1625944525567-c0f7c07e3992?q=80&w=1200&auto=format&fit=crop",
  grill:
    "https://images.unsplash.com/photo-1604908812837-0b6f64b2c329?q=80&w=1200&auto=format&fit=crop",
  dessert:
    "https://images.unsplash.com/photo-1541781286675-09d5f62b52dc?q=80&w=1200&auto=format&fit=crop",
  "drinks-soft":
    "https://images.unsplash.com/photo-1548839140-29a749e1cf4d?q=80&w=1200&auto=format&fit=crop",
  "drinks-beer":
    "https://images.unsplash.com/photo-1516455590571-18256e5bb9ff?q=80&w=1200&auto=format&fit=crop",
  "drinks-water":
    "https://images.unsplash.com/photo-1516275462205-1c59a3702f44?q=80&w=1200&auto=format&fit=crop",
  "drinks-coffee":
    "https://images.unsplash.com/photo-1503481766315-7a586b20f66b?q=80&w=1200&auto=format&fit=crop",
  "drinks-liquor":
    "https://images.unsplash.com/photo-1541976076758-347942db1978?q=80&w=1200&auto=format&fit=crop",
  "drinks-wine":
    "https://images.unsplash.com/photo-1524594154908-edd2f08f9635?q=80&w=1200&auto=format&fit=crop",
};

/* ===================== Util ===================== */
const slug = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

/* ===================== Dishes (según secciones del PDF) ===================== */
/** Nota: si en el PDF hay tamaños/doble precio, lo dejo sin precio único (null). */
const DISHES: Dish[] = [
  /* ---------- STARTERS ---------- */
  {
    id: slug("Empanadas"),
    category: "starters",
    name: "Empanadas (unidad)",
    i18nNames: {
      es: "Empanadas (unidad)",
      en: "Empanadas (per unit)",
      de: "Empanadas (Stück)",
      fr: "Empanadas (à l’unité)",
    },
    price: 2.0,
    descriptions: {
      es: "Masa de maíz frita con relleno casero (carne y cebolla). Ingredientes: harina de maíz, carne, cebolla, especias, aceite.",
      en: "Crispy corn dough with homemade filling (meat & onion). Ingredients: corn flour, meat, onion, spices, oil.",
      de: "Knuspriger Maisteig mit hausgemachter Füllung (Fleisch & Zwiebel). Zutaten: Maismehl, Fleisch, Zwiebel, Gewürze, Öl.",
      fr: "Pâte de maïs frite avec farce maison (viande & oignon). Ingrédients : farine de maïs, viande, oignon, épices, huile.",
    },
    image: IMG["starters"],
  },
  {
    id: slug("Papa rellena"),
    category: "starters",
    name: "Papa rellena",
    i18nNames: {
      es: "Papa rellena",
      en: "Stuffed potato",
      de: "Gefüllte Kartoffel",
      fr: "Pomme de terre farcie",
    },
    price: 3.5,
    descriptions: {
      es: "Bola de patata rellena y dorada. Ingredientes: patata, carne, huevo, cebolla, especias.",
      en: "Golden stuffed potato ball. Ingredients: potato, minced meat, egg, onion, spices.",
      de: "Goldbraune, gefüllte Kartoffelkugel. Zutaten: Kartoffel, Hackfleisch, Ei, Zwiebel, Gewürze.",
      fr: "Boule de pomme de terre farcie, dorée. Ingrédients : pomme de terre, viande hachée, œuf, oignon, épices.",
    },
    image: IMG["starters"],
  },
  {
    id: slug("Arepa con salchicha"),
    category: "starters",
    name: "Arepa con salchicha",
    i18nNames: {
      es: "Arepa con salchicha",
      en: "Arepa with sausage",
      de: "Arepa mit Wurst",
      fr: "Arepa à la saucisse",
    },
    price: 7.0,
    descriptions: {
      es: "Arepa de maíz con salchicha y salsas. Ingredientes: harina de maíz, salchicha, salsa (ketchup/mostaza).",
      en: "Corn arepa with sausage and sauces. Ingredients: corn flour, sausage, sauce (ketchup/mustard).",
      de: "Mais-Arepa mit Wurst und Saucen. Zutaten: Maismehl, Wurst, Sauce (Ketchup/Senf).",
      fr: "Arepa de maïs avec saucisse et sauces. Ingrédients : farine de maïs, saucisse, sauce (ketchup/moutarde).",
    },
    image: IMG["starters"],
  },
  {
    id: slug("Arepa con chicharron"),
    category: "starters",
    name: "Arepa con chicharrón",
    i18nNames: {
      es: "Arepa con chicharrón",
      en: "Arepa with pork rind",
      de: "Arepa mit Schweineschwarte",
      fr: "Arepa au chicharrón",
    },
    price: 7.0,
    descriptions: {
      es: "Arepa de maíz con chicharrón crujiente. Ingredientes: harina de maíz, chicharrón, sal.",
      en: "Corn arepa with crispy pork rind. Ingredients: corn flour, pork rind, salt.",
      de: "Mais-Arepa mit knuspriger Schweineschwarte. Zutaten: Maismehl, Schweineschwarte, Salz.",
      fr: "Arepa de maïs au chicharrón croustillant. Ingrédients : farine de maïs, couenne de porc, sel.",
    },
    image: IMG["starters"],
  },
  {
    id: slug("Patacon con hogao"),
    category: "starters",
    name: "Patacón con hogao",
    i18nNames: {
      es: "Patacón con hogao",
      en: "Patacón with hogao",
      de: "Patacón mit Hogao",
      fr: "Patacón au hogao",
    },
    price: 7.0,
    descriptions: {
      es: "Plátano verde frito con salsa criolla. Ingredientes: plátano verde, tomate, cebolla, ajo, aceite.",
      en: "Fried green plantain with Creole sauce. Ingredients: green plantain, tomato, onion, garlic, oil.",
      de: "Frittierte Kochbanane mit kreolischer Sauce. Zutaten: Kochbanane, Tomate, Zwiebel, Knoblauch, Öl.",
      fr: "Banane plantain frite avec sauce créole. Ingrédients : plantain vert, tomate, oignon, ail, huile.",
    },
    image: IMG["starters"],
  },
  {
    id: slug("Patacon con queso"),
    category: "starters",
    name: "Patacón con queso",
    i18nNames: {
      es: "Patacón con queso",
      en: "Patacón with cheese",
      de: "Patacón mit Käse",
      fr: "Patacón au fromage",
    },
    price: 6.0,
    descriptions: {
      es: "Patacón crujiente con queso fundido. Ingredientes: plátano verde, queso, aceite.",
      en: "Crispy plantain topped with melted cheese. Ingredients: green plantain, cheese, oil.",
      de: "Knuspriger Patacón mit geschmolzenem Käse. Zutaten: Kochbanane, Käse, Öl.",
      fr: "Patacón croustillant au fromage fondu. Ingrédients : plantain vert, fromage, huile.",
    },
    image: IMG["starters"],
  },
  {
    id: slug("Queso a la plancha"),
    category: "starters",
    name: "Queso a la plancha",
    i18nNames: {
      es: "Queso a la plancha",
      en: "Grill cheese",
      de: "Gegrillter Käse",
      fr: "Fromage grillé",
    },
    price: 9.5,
    descriptions: {
      es: "Queso dorado a la plancha. Ingredientes: queso semicurado, aceite de oliva.",
      en: "Seared cheese, golden and melty. Ingredients: semi-cured cheese, olive oil.",
      de: "Auf der Platte gebräunter Käse. Zutaten: Schnittkäse, Olivenöl.",
      fr: "Fromage saisi et fondant. Ingrédients : fromage demi-affiné, huile d’olive.",
    },
    image: IMG["starters"],
  },
  {
    id: slug("Camarones al ajillo"),
    category: "starters",
    name: "Camarones al ajillo",
    i18nNames: {
      es: "Camarones al ajillo",
      en: "Shrimp in garlic",
      de: "Garnelen in Knoblauch",
      fr: "Crevettes à l’ail",
    },
    price: 8.0,
    descriptions: {
      es: "Salteados con ajo y aceite de oliva. Ingredientes: camarón, ajo, aceite, perejil, sal.",
      en: "Sautéed with garlic and olive oil. Ingredients: shrimp, garlic, olive oil, parsley, salt.",
      de: "Mit Knoblauch in Olivenöl sautiert. Zutaten: Garnelen, Knoblauch, Olivenöl, Petersilie, Salz.",
      fr: "Sautés à l’ail et huile d’olive. Ingrédients : crevettes, ail, huile d’olive, persil, sel.",
    },
    image: IMG["starters"],
  },
  {
    id: slug("Huevos revueltos"),
    category: "starters",
    name: "Huevos revueltos",
    i18nNames: {
      es: "Huevos revueltos",
      en: "Scrambled eggs",
      de: "Rühreier",
      fr: "Œufs brouillés",
    },
    price: 6.0,
    descriptions: {
      es: "Cremosos al estilo casero. Ingredientes: huevo, mantequilla, sal.",
      en: "Creamy, home-style. Ingredients: egg, butter, salt.",
      de: "Cremig nach Hausart. Zutaten: Ei, Butter, Salz.",
      fr: "Crémeux, façon maison. Ingrédients : œuf, beurre, sel.",
    },
    image: IMG["starters"],
  },
  {
    id: slug("Escaldon"),
    category: "starters",
    name: "Escaldón",
    i18nNames: {
      es: "Escaldón",
      en: "Escaldón",
      de: "Escaldón",
      fr: "Escaldón",
    },
    price: 6.0,
    descriptions: {
      es: "Gofio ligado con caldo. Ingredientes: gofio, caldo, cebolla, cilantro.",
      en: "Gofio worked with broth. Ingredients: gofio (toasted cereal flour), broth, onion, coriander.",
      de: "Gofio mit Brühe angerührt. Zutaten: Gofio, Brühe, Zwiebel, Koriander.",
      fr: "Gofio lié au bouillon. Ingrédients : gofio, bouillon, oignon, coriandre.",
    },
    image: IMG["starters"],
  },
  {
    id: slug("Papas arrugadas con mojo"),
    category: "starters",
    name: "Papas arrugadas con mojo",
    i18nNames: {
      es: "Papas arrugadas con mojo",
      en: "Wrinkled potatoes with mojo",
      de: "Runzelkartoffeln mit Mojo",
      fr: "Pommes de terre « arrugadas » au mojo",
    },
    price: 6.0,
    descriptions: {
      es: "Patatas canarias con mojo rojo o verde. Ingredientes: papa canaria, sal, ajo, pimienta, aceite, vinagre.",
      en: "Canary potatoes with red or green mojo. Ingredients: Canarian potato, salt, garlic, pepper, oil, vinegar.",
      de: "Kanarische Kartoffeln mit rotem/grünem Mojo. Zutaten: Kartoffel, Salz, Knoblauch, Pfeffer, Öl, Essig.",
      fr: "Pommes de terre canariennes au mojo rouge/vert. Ingrédients : pomme de terre, sel, ail, poivre, huile, vinaigre.",
    },
    image: IMG["starters"],
  },
  {
    id: slug("Ensalada mixta"),
    category: "starters",
    name: "Ensalada mixta",
    i18nNames: {
      es: "Ensalada mixta",
      en: "Mixed salad",
      de: "Gemischter Salat",
      fr: "Salade mixte",
    },
    price: 3.0,
    descriptions: {
      es: "Verdes, tomate y cebolla. Ingredientes: lechuga, tomate, cebolla, aceite, vinagre, sal.",
      en: "Greens, tomato & onion. Ingredients: lettuce, tomato, onion, oil, vinegar, salt.",
      de: "Blattsalat, Tomate, Zwiebel. Zutaten: Salat, Tomate, Zwiebel, Öl, Essig, Salz.",
      fr: "Salade, tomate, oignon. Ingrédients : laitue, tomate, oignon, huile, vinaigre, sel.",
    },
    image: IMG["starters"],
  },
  {
    id: slug("Ensalada Sazon de mi Tierra"),
    category: "starters",
    name: "Ensalada Sazón de mi Tierra",
    i18nNames: {
      es: "Ensalada Sazón de mi Tierra",
      en: "Sazón from my Land salad",
      de: "Salat « Sazón de mi Tierra »",
      fr: "Salade « Sazón de mi Tierra »",
    },
    price: null,
    descriptions: {
      es: "Ensalada de la casa. Ingredientes: mezcla de verdes, tomate, pepino, cebolla, vinagreta.",
      en: "House salad. Ingredients: mixed greens, tomato, cucumber, onion, vinaigrette.",
      de: "Haussalat. Zutaten: Blattsalat-Mix, Tomate, Gurke, Zwiebel, Vinaigrette.",
      fr: "Salade maison. Ingrédients : mesclun, tomate, concombre, oignon, vinaigrette.",
    },
    image: IMG["starters"],
  },

  /* ---------- MAIN DISHES (incluye sopas del PDF) ---------- */
  {
    id: slug("Bandeja paisa"),
    category: "main",
    name: "Bandeja paisa",
    i18nNames: {
      es: "Bandeja paisa",
      en: "Bandeja paisa",
      de: "Bandeja paisa",
      fr: "Bandeja paisa",
    },
    price: 16.0,
    descriptions: {
      es: "Clásico colombiano. Ingredientes: frijoles, arroz, carne, chicharrón, huevo, plátano, arepa.",
      en: "Colombian classic. Ingredients: beans, rice, meat, pork rind, egg, plantain, arepa.",
      de: "Kolumbianischer Klassiker. Zutaten: Bohnen, Reis, Fleisch, Schwarte, Ei, Kochbanane, Arepa.",
      fr: "Classique colombien. Ingrédients : haricots, riz, viande, couenne, œuf, banane plantain, arepa.",
    },
    image: IMG["main"],
  },
  {
    id: slug("Chuleta valluna"),
    category: "main",
    name: "Chuleta valluna",
    i18nNames: {
      es: "Chuleta valluna",
      en: "Valluna chop",
      de: "Valluna-Kotelett",
      fr: "Côte valluna",
    },
    price: 14.0,
    descriptions: {
      es: "Empanada y crujiente. Ingredientes: chuleta de cerdo, pan rallado, huevo, especias.",
      en: "Breaded and crispy. Ingredients: pork chop, breadcrumbs, egg, spices.",
      de: "Paniert und knusprig. Zutaten: Schweinekotelett, Paniermehl, Ei, Gewürze.",
      fr: "Panée et croustillante. Ingrédients : côte de porc, chapelure, œuf, épices.",
    },
    image: IMG["main"],
  },
  {
    id: slug("Panceta asada"),
    category: "main",
    name: "Panceta asada",
    i18nNames: {
      es: "Panceta asada",
      en: "Roasted pork belly",
      de: "Gebratener Schweinebauch",
      fr: "Poitrine de porc rôtie",
    },
    price: 15.5,
    descriptions: {
      es: "Jugosa y dorada. Ingredientes: panceta de cerdo, sal, pimienta, ajo.",
      en: "Juicy and golden. Ingredients: pork belly, salt, pepper, garlic.",
      de: "Saftig & goldbraun. Zutaten: Schweinebauch, Salz, Pfeffer, Knoblauch.",
      fr: "Juteuse & dorée. Ingrédients : poitrine de porc, sel, poivre, ail.",
    },
    image: IMG["main"],
  },
  {
    id: slug("Panceta en salsa"),
    category: "main",
    name: "Panceta en salsa",
    i18nNames: {
      es: "Panceta en salsa",
      en: "Pork belly in sauce",
      de: "Schweinebauch in Sauce",
      fr: "Poitrine de porc en sauce",
    },
    price: 16.0,
    descriptions: {
      es: "Guisada tierna. Ingredientes: panceta, cebolla, tomate, especias.",
      en: "Braised & tender. Ingredients: pork belly, onion, tomato, spices.",
      de: "Geschmort & zart. Zutaten: Schweinebauch, Zwiebel, Tomate, Gewürze.",
      fr: "Braisée & fondante. Ingrédients : poitrine de porc, oignon, tomate, épices.",
    },
    image: IMG["main"],
  },
  {
    id: slug("Picada colombiana"),
    category: "main",
    name: "Picada colombiana",
    i18nNames: {
      es: "Picada colombiana",
      en: "Colombian platter",
      de: "Kolumbianische Platte",
      fr: "Assortiment colombien",
    },
    price: 30.0,
    descriptions: {
      es: "Para compartir. Ingredientes: surtido de carnes, chorizo, papa, plátano, salsas.",
      en: "To share. Ingredients: assorted meats, chorizo, potato, plantain, sauces.",
      de: "Zum Teilen. Zutaten: Fleischmix, Chorizo, Kartoffel, Kochbanane, Saucen.",
      fr: "À partager. Ingrédients : assortiment de viandes, chorizo, pomme de terre, plantain, sauces.",
    },
    image: IMG["main"],
  },
  {
    id: slug("Carne fiestera"),
    category: "main",
    name: "Carne fiestera (adobada)",
    i18nNames: {
      es: "Carne fiestera (adobada)",
      en: "Party meat (marinated)",
      de: "Mariniertes Festfleisch",
      fr: "Viande « fiestera » marinée",
    },
    price: 9.0,
    descriptions: {
      es: "Tiras marinadas. Ingredientes: ternera, ajo, comino, pimentón, aceite.",
      en: "Marinated strips. Ingredients: beef, garlic, cumin, paprika, oil.",
      de: "Marinierte Streifen. Zutaten: Rind, Knoblauch, Kreuzkümmel, Paprika, Öl.",
      fr: "Lanières marinées. Ingrédients : bœuf, ail, cumin, paprika, huile.",
    },
    image: IMG["main"],
  },
  {
    id: slug("Costillas con papas y mazorca"),
    category: "main",
    name: "Costillas con papas y mazorca",
    i18nNames: {
      es: "Costillas con papas y mazorca",
      en: "Ribs with potatoes & corn",
      de: "Rippen mit Kartoffeln & Mais",
      fr: "Côtes avec pommes de terre & maïs",
    },
    price: 9.5,
    descriptions: {
      es: "Guarnición campesina. Ingredientes: costillas de cerdo, papa, mazorca, especias.",
      en: "Rustic garnish. Ingredients: pork ribs, potato, corn, spices.",
      de: "Rustikale Beilage. Zutaten: Schweinerippen, Kartoffel, Mais, Gewürze.",
      fr: "Garniture rustique. Ingrédients : côtes de porc, pomme de terre, maïs, épices.",
    },
    image: IMG["main"],
  },
  {
    id: slug("Carne de cabra"),
    category: "main",
    name: "Carne de cabra",
    i18nNames: {
      es: "Carne de cabra",
      en: "Goat meat stew",
      de: "Ziegeneintopf",
      fr: "Ragoût de chèvre",
    },
    price: 9.5,
    descriptions: {
      es: "Guiso tradicional. Ingredientes: cabra, tomate, cebolla, ajo, vino, especias.",
      en: "Traditional stew. Ingredients: goat, tomato, onion, garlic, wine, spices.",
      de: "Traditioneller Eintopf. Zutaten: Ziege, Tomate, Zwiebel, Knoblauch, Wein, Gewürze.",
      fr: "Ragoût traditionnel. Ingrédients : chèvre, tomate, oignon, ail, vin, épices.",
    },
    image: IMG["main"],
  },
  {
    id: slug("Garbanzos"),
    category: "main",
    name: "Garbanzos",
    i18nNames: {
      es: "Garbanzos",
      en: "Chickpeas stew",
      de: "Kichererbsen-Eintopf",
      fr: "Ragoût de pois chiches",
    },
    price: 8.0,
    descriptions: {
      es: "Estilo casero. Ingredientes: garbanzo, tomate, cebolla, pimiento, especias.",
      en: "Home-style. Ingredients: chickpeas, tomato, onion, pepper, spices.",
      de: "Hausgemacht. Zutaten: Kichererbsen, Tomate, Zwiebel, Paprika, Gewürze.",
      fr: "Maison. Ingrédients : pois chiches, tomate, oignon, poivron, épices.",
    },
    image: IMG["main"],
  },
  {
    id: slug("Potaje de lentejas"),
    category: "main",
    name: "Potaje de lentejas",
    i18nNames: {
      es: "Potaje de lentejas",
      en: "Lentil stew",
      de: "Linseneintopf",
      fr: "Ragoût de lentilles",
    },
    price: 6.0,
    descriptions: {
      es: "Clásico y nutritivo. Ingredientes: lenteja, zanahoria, patata, laurel, especias.",
      en: "Classic & hearty. Ingredients: lentils, carrot, potato, bay leaf, spices.",
      de: "Klassisch & herzhaft. Zutaten: Linsen, Karotte, Kartoffel, Lorbeer, Gewürze.",
      fr: "Classique & copieux. Ingrédients : lentilles, carotte, pomme de terre, laurier, épices.",
    },
    image: IMG["main"],
  },
  {
    id: slug("Potaje de berros"),
    category: "main",
    name: "Potaje de berros",
    i18nNames: {
      es: "Potaje de berros",
      en: "Watercress stew",
      de: "Brunnenkresse-Eintopf",
      fr: "Ragoût de cresson",
    },
    price: 6.0,
    descriptions: {
      es: "Vegetal y aromático. Ingredientes: berros, patata, calabaza, cebolla, especias.",
      en: "Vegetable & aromatic. Ingredients: watercress, potato, pumpkin, onion, spices.",
      de: "Gemüsig & aromatisch. Zutaten: Brunnenkresse, Kartoffel, Kürbis, Zwiebel, Gewürze.",
      fr: "Végétal & aromatique. Ingrédients : cresson, pomme de terre, courge, oignon, épices.",
    },
    image: IMG["main"],
  },
  // Sopas del PDF (Main Dishes)
  {
    id: slug("Sancocho de gallina"),
    category: "main",
    name: "Sancocho de gallina (domingos)",
    i18nNames: {
      es: "Sancocho de gallina (domingos)",
      en: "Hen sancocho (Sundays)",
      de: "Hühnersancocho (sonntags)",
      fr: "Sancocho de poule (dimanches)",
    },
    price: 13.0,
    descriptions: {
      es: "Sopa tradicional. Ingredientes: gallina, yuca, papa, mazorca, cilantro.",
      en: "Traditional soup. Ingredients: hen, cassava, potato, corn, coriander.",
      de: "Traditionelle Suppe. Zutaten: Huhn, Maniok, Kartoffel, Mais, Koriander.",
      fr: "Soupe traditionnelle. Ingrédients : poule, manioc, pomme de terre, maïs, coriandre.",
    },
    image: IMG["main"],
  },
  {
    id: slug("Sancocho trifasico"),
    category: "main",
    name: "Sancocho trifásico (sábados)",
    i18nNames: {
      es: "Sancocho trifásico (sábados)",
      en: "Trifásico sancocho (Saturdays)",
      de: "Dreifacher Sancocho (samstags)",
      fr: "Sancocho « trifásico » (samedis)",
    },
    price: 10.0,
    descriptions: {
      es: "Tres carnes. Ingredientes: res, cerdo, pollo, yuca, papa, maíz.",
      en: "Three meats. Ingredients: beef, pork, chicken, cassava, potato, corn.",
      de: "Drei Fleischsorten. Zutaten: Rind, Schwein, Huhn, Maniok, Kartoffel, Mais.",
      fr: "Trois viandes. Ingrédients : bœuf, porc, poulet, manioc, pomme de terre, maïs.",
    },
    image: IMG["main"],
  },
  {
    id: slug("Sancocho de costilla"),
    category: "main",
    name: "Sancocho de costilla",
    i18nNames: {
      es: "Sancocho de costilla",
      en: "Rib sancocho",
      de: "Sancocho mit Rippchen",
      fr: "Sancocho de côtes",
    },
    price: 10.0,
    descriptions: {
      es: "Caldo sustancioso. Ingredientes: costilla de res, yuca, papa, mazorca, cilantro.",
      en: "Hearty broth. Ingredients: beef ribs, cassava, potato, corn, coriander.",
      de: "Kräftige Brühe. Zutaten: Rinderrippen, Maniok, Kartoffel, Mais, Koriander.",
      fr: "Bouillon copieux. Ingrédients : côtes de bœuf, manioc, pomme de terre, maïs, coriandre.",
    },
    image: IMG["main"],
  },
  // === Nuevos MAIN solicitados ===
  {
    id: slug("Bacalao encebollado"),
    category: "main",
    name: "Bacalao encebollado",
    i18nNames: {
      es: "Bacalao encebollado",
      en: "Cod with onions",
      de: "Kabeljau mit Zwiebeln",
      fr: "Morue aux oignons",
    },
    price: null,
    descriptions: {
      es: "Lomo de bacalao con cebolla confitada. Ingredientes: bacalao, cebolla, aceite de oliva, ajo, perejil, sal.",
      en: "Cod loin with caramelized onions. Ingredients: cod, onion, olive oil, garlic, parsley, salt.",
      de: "Kabeljaufilet mit geschmorten Zwiebeln. Zutaten: Kabeljau, Zwiebel, Olivenöl, Knoblauch, Petersilie, Salz.",
      fr: "Filet de morue aux oignons confits. Ingrédients : morue, oignon, huile d’olive, ail, persil, sel.",
    },
    image: IMG["main"],
  },
  {
    id: slug("Pescado frito"),
    category: "main",
    name: "Pescado frito",
    i18nNames: {
      es: "Pescado frito",
      en: "Fried fish",
      de: "Frittierter Fisch",
      fr: "Poisson frit",
    },
    price: null,
    descriptions: {
      es: "Pieza de pescado dorada y crujiente. Ingredientes: pescado blanco, harina, aceite, limón, sal.",
      en: "Golden, crispy fish piece. Ingredients: white fish, flour, oil, lemon, salt.",
      de: "Goldbraun und knusprig. Zutaten: Weißfisch, Mehl, Öl, Zitrone, Salz.",
      fr: "Pièce de poisson dorée et croustillante. Ingrédients : poisson blanc, farine, huile, citron, sel.",
    },
    image: IMG["main"],
  },

  /* ---------- GRILL ---------- */
  {
    id: slug("Parrillada mixta"),
    category: "grill",
    name: "Parrillada mixta",
    i18nNames: {
      es: "Parrillada mixta",
      en: "Mixed grill",
      de: "Gemischter Grillteller",
      fr: "Grillade mixte",
    },
    price: 30.0,
    descriptions: {
      es: "Surtido de carnes a la brasa. Ingredientes: ternera, cerdo, chorizo, adobo.",
      en: "Assorted grilled meats. Ingredients: beef, pork, chorizo, marinade.",
      de: "Gemischte Grillfleischplatte. Zutaten: Rind, Schwein, Chorizo, Marinade.",
      fr: "Assortiment de viandes grillées. Ingrédients : bœuf, porc, chorizo, marinade.",
    },
    image: IMG["grill"],
  },
  {
    id: slug("Solomillo de cerdo"),
    category: "grill",
    name: "Solomillo de cerdo",
    i18nNames: {
      es: "Solomillo de cerdo",
      en: "Pork tenderloin",
      de: "Schweinefilet",
      fr: "Filet de porc",
    },
    price: 11.0,
    descriptions: {
      es: "A la plancha, jugoso. Ingredientes: solomillo de cerdo, sal, pimienta, aceite.",
      en: "Griddled, juicy. Ingredients: pork tenderloin, salt, pepper, oil.",
      de: "Von der Platte, saftig. Zutaten: Schweinefilet, Salz, Pfeffer, Öl.",
      fr: "Saisi, juteux. Ingrédients : filet de porc, sel, poivre, huile.",
    },
    image: IMG["grill"],
  },
  {
    id: slug("Entrecot de ternera"),
    category: "grill",
    name: "Entrecot de ternera",
    i18nNames: {
      es: "Entrecot de ternera",
      en: "Veal/Beef entrecôte",
      de: "Entrecôte (Rind/Veal)",
      fr: "Entrecôte (veau/boeuf)",
    },
    price: 15.0,
    descriptions: {
      es: "Al punto. Ingredientes: entrecot, sal, pimienta, aceite.",
      en: "To your liking. Ingredients: entrecôte, salt, pepper, oil.",
      de: "Nach Wunsch. Zutaten: Entrecôte, Salz, Pfeffer, Öl.",
      fr: "À la demande. Ingrédients : entrecôte, sel, poivre, huile.",
    },
    image: IMG["grill"],
  },
  {
    id: slug("Secreto iberico"),
    category: "grill",
    name: "Secreto ibérico",
    i18nNames: {
      es: "Secreto ibérico",
      en: "Iberian pork 'secreto'",
      de: "Iberico Secreto",
      fr: "Secreto ibérique",
    },
    price: 12.0,
    descriptions: {
      es: "Muy jugoso. Ingredientes: secreto ibérico, sal, pimienta, aceite.",
      en: "Very juicy. Ingredients: Iberian pork secreto, salt, pepper, oil.",
      de: "Sehr saftig. Zutaten: Iberico Secreto, Salz, Pfeffer, Öl.",
      fr: "Très juteux. Ingrédients : secreto ibérique, sel, poivre, huile.",
    },
    image: IMG["grill"],
  },
  {
    id: slug("Chuleta de cerdo"),
    category: "grill",
    name: "Chuleta de cerdo",
    i18nNames: {
      es: "Chuleta de cerdo",
      en: "Pork chop",
      de: "Schweinekotelett",
      fr: "Côte de porc",
    },
    price: 10.0,
    descriptions: {
      es: "A la plancha con guarnición. Ingredientes: chuleta, sal, pimienta, aceite.",
      en: "Griddled with garnish. Ingredients: pork chop, salt, pepper, oil.",
      de: "Von der Platte mit Beilage. Zutaten: Kotelett, Salz, Pfeffer, Öl.",
      fr: "Poêlée avec garniture. Ingrédients : côte de porc, sel, poivre, huile.",
    },
    image: IMG["grill"],
  },
  {
    id: slug("Medio pollo - pollo entero"),
    category: "grill",
    name: "Medio pollo / pollo entero",
    i18nNames: {
      es: "Medio pollo / pollo entero",
      en: "Half chicken / whole chicken",
      de: "Halbes / ganzes Hähnchen",
      fr: "Demi-poulet / poulet entier",
    },
    priceHalf: 3.5,
    priceWhole: 7.0,
    descriptions: {
      es: "A la brasa. Ingredientes: pollo, sal, pimienta, ajo, aceite.",
      en: "From the grill. Ingredients: chicken, salt, pepper, garlic, oil.",
      de: "Vom Grill. Zutaten: Hähnchen, Salz, Pfeffer, Knoblauch, Öl.",
      fr: "Au gril. Ingrédients : poulet, sel, poivre, ail, huile.",
    },
    image: IMG["grill"],
  },
  // === Nueva GRILL solicitada ===
  {
    id: slug("Grilled Picada Sazon from my Land"),
    category: "grill",
    name: "Picada a la brasa Sazón de mi Tierra",
    i18nNames: {
      es: "Picada a la brasa Sazón de mi Tierra",
      en: "Grilled Picada Sazón from my Land",
      de: "Gegrillte Picada „Sazón de mi Tierra“",
      fr: "Picada grillée « Sazón de mi Tierra »",
    },
    price: null,
    descriptions: {
      es: "Surtido a la brasa para compartir. Ingredientes: ternera, cerdo, pollo, chorizo, arepa/patata, salsas.",
      en: "Grilled assortment to share. Ingredients: beef, pork, chicken, chorizo, arepa/potato, sauces.",
      de: "Gegrillte Auswahl zum Teilen. Zutaten: Rind, Schwein, Huhn, Chorizo, Arepa/Kartoffel, Saucen.",
      fr: "Assortiment grillé à partager. Ingrédients : bœuf, porc, poulet, chorizo, arepa/pomme de terre, sauces.",
    },
    image: IMG["grill"],
  },

  /* ---------- DESSERT ---------- */
  {
    id: slug("Tarta de la abuela"),
    category: "dessert",
    name: "Tarta de la abuela",
    i18nNames: {
      es: "Tarta de la abuela",
      en: "Grandma's cake",
      de: "Omas Kuchen",
      fr: "Gâteau de grand-mère",
    },
    price: 4.5,
    descriptions: {
      es: "Casera con crema y galleta. Ingredientes: galleta, crema pastelera, cacao.",
      en: "Homemade with cream & biscuit. Ingredients: biscuit, custard, cocoa.",
      de: "Hausgemacht mit Creme & Keks. Zutaten: Keks, Vanillecreme, Kakao.",
      fr: "Maison, crème & biscuit. Ingrédients : biscuit, crème pâtissière, cacao.",
    },
    image: IMG["dessert"],
  },
  {
    id: slug("Quesillo"),
    category: "dessert",
    name: "Quesillo",
    i18nNames: { es: "Quesillo", en: "Quesillo", de: "Quesillo", fr: "Quesillo" },
    price: 3.5,
    descriptions: {
      es: "Flan de queso suave. Ingredientes: leche, huevo, azúcar, queso.",
      en: "Silky cheese flan. Ingredients: milk, egg, sugar, cheese.",
      de: "Zarter Käseflan. Zutaten: Milch, Ei, Zucker, Käse.",
      fr: "Flan au fromage onctueux. Ingrédients : lait, œuf, sucre, fromage.",
    },
    image: IMG["dessert"],
  },
  {
    id: slug("Principe Alberto"),
    category: "dessert",
    name: "Príncipe Alberto",
    i18nNames: {
      es: "Príncipe Alberto",
      en: "Príncipe Alberto",
      de: "Príncipe Alberto",
      fr: "Príncipe Alberto",
    },
    price: null,
    descriptions: {
      es: "Postre canario. Ingredientes: chocolate, almendra, bizcocho.",
      en: "Canarian dessert. Ingredients: chocolate, almond, sponge.",
      de: "Kanarisches Dessert. Zutaten: Schokolade, Mandel, Biskuit.",
      fr: "Dessert canarien. Ingrédients : chocolat, amande, biscuit.",
    },
    image: IMG["dessert"],
  },
  {
    id: slug("Pastel de elote con bocadillo"),
    category: "dessert",
    name: "Pastel de elote con bocadillo",
    i18nNames: {
      es: "Pastel de elote con bocadillo",
      en: "Corn cake with guava paste",
      de: "Maiskuchen mit Guavenpaste",
      fr: "Gâteau de maïs au bocadillo",
    },
    price: 4.5,
    descriptions: {
      es: "Bizcocho de maíz y guayaba. Ingredientes: maíz, huevo, leche, bocadillo (guayaba).",
      en: "Corn sponge & guava. Ingredients: corn, egg, milk, guava paste.",
      de: "Mais-Biskuit & Guave. Zutaten: Mais, Ei, Milch, Guavenpaste.",
      fr: "Biscuit de maïs & goyave. Ingrédients : maïs, œuf, lait, pâte de goyave.",
    },
    image: IMG["dessert"],
  },
  {
    id: slug("Mousse de maracuya"),
    category: "dessert",
    name: "Mousse de maracuyá",
    i18nNames: {
      es: "Mousse de maracuyá",
      en: "Passion fruit mousse",
      de: "Maracuja-Mousse",
      fr: "Mousse au fruit de la passion",
    },
    price: 3.5,
    descriptions: {
      es: "Ligera y afrutada. Ingredientes: maracuyá, nata, azúcar, gelatina.",
      en: "Light & fruity. Ingredients: passion fruit, cream, sugar, gelatin.",
      de: "Leicht & fruchtig. Zutaten: Maracuja, Sahne, Zucker, Gelatine.",
      fr: "Légère & fruitée. Ingrédients : fruit de la passion, crème, sucre, gélatine.",
    },
    image: IMG["dessert"],
  },

  /* ---------- DRINKS: Soft drinks ---------- */
  {
    id: slug("Coca-Cola"),
    category: "drinks-soft",
    name: "Coca-Cola (normal/diet)",
    i18nNames: {
      es: "Coca-Cola (normal/diet)",
      en: "Coca-Cola (regular/diet)",
      de: "Coca-Cola (normal/light)",
      fr: "Coca-Cola (classique/light)",
    },
    price: 1.2,
    descriptions: {
      es: "Refresco carbonatado. Ingredientes: agua, azúcar/edulcorante, CO₂, aromas.",
      en: "Carbonated soft drink. Ingredients: water, sugar/sweetener, CO₂, flavorings.",
      de: "Kohlensäurehaltiges Erfrischungsgetränk. Zutaten: Wasser, Zucker/Süßstoff, CO₂, Aromen.",
      fr: "Boisson gazeuse. Ingrédients : eau, sucre/édulcorant, CO₂, arômes.",
    },
    image: IMG["drinks-soft"],
  },
  {
    id: slug("Fanta"),
    category: "drinks-soft",
    name: "Fanta (naranja/limón)",
    i18nNames: {
      es: "Fanta (naranja/limón)",
      en: "Fanta (orange/lemon)",
      de: "Fanta (Orange/Zitrone)",
      fr: "Fanta (orange/citron)",
    },
    price: 1.3,
    descriptions: {
      es: "Refresco de sabor. Ingredientes: agua, azúcar, CO₂, aromas cítricos.",
      en: "Flavoured soda. Ingredients: water, sugar, CO₂, citrus flavorings.",
      de: "Limonade mit Geschmack. Zutaten: Wasser, Zucker, CO₂, Zitrusaromen.",
      fr: "Soda aromatisé. Ingrédients : eau, sucre, CO₂, arômes d’agrumes.",
    },
    image: IMG["drinks-soft"],
  },
  {
    id: slug("Sprite"),
    category: "drinks-soft",
    name: "Sprite",
    i18nNames: { es: "Sprite", en: "Sprite", de: "Sprite", fr: "Sprite" },
    price: 1.4,
    descriptions: {
      es: "Refresco lima-limón. Ingredientes: agua, azúcar, CO₂, aromas.",
      en: "Lemon-lime soda. Ingredients: water, sugar, CO₂, flavorings.",
      de: "Zitronenlimonade. Zutaten: Wasser, Zucker, CO₂, Aromen.",
      fr: "Soda citron-limette. Ingrédients : eau, sucre, CO₂, arômes.",
    },
    image: IMG["drinks-soft"],
  },
  {
    id: slug("Fuze Tea Mango Pina"),
    category: "drinks-soft",
    name: "Fuze Tea (mango-piña)",
    i18nNames: {
      es: "Fuze Tea (mango-piña)",
      en: "Fuze Tea (mango-pineapple)",
      de: "Fuze Tea (Mango-Ananas)",
      fr: "Fuze Tea (mangue-ananas)",
    },
    price: 1.8,
    descriptions: {
      es: "Té frío saborizado. Ingredientes: agua, extracto de té, azúcar, aromas.",
      en: "Flavoured iced tea. Ingredients: water, tea extract, sugar, flavorings.",
      de: "Aromatisierter Eistee. Zutaten: Wasser, Tee-Extrakt, Zucker, Aromen.",
      fr: "Thé glacé aromatisé. Ingrédients : eau, extrait de thé, sucre, arômes.",
    },
    image: IMG["drinks-soft"],
  },
  {
    id: slug("Royal Bliss"),
    category: "drinks-soft",
    name: "Royal Bliss (Classic/Berry)",
    i18nNames: {
      es: "Royal Bliss (Classic/Berry)",
      en: "Royal Bliss (Classic/Berry)",
      de: "Royal Bliss (Classic/Berry)",
      fr: "Royal Bliss (Classic/Berry)",
    },
    price: 1.8,
    descriptions: {
      es: "Mixer refrescante. Ingredientes: agua carbonatada, azúcar, aromas.",
      en: "Refreshing mixer. Ingredients: carbonated water, sugar, flavorings.",
      de: "Erfrischender Mixer. Zutaten: kohlensäurehaltiges Wasser, Zucker, Aromen.",
      fr: "Mixer rafraîchissant. Ingrédients : eau gazeuse, sucre, arômes.",
    },
    image: IMG["drinks-soft"],
  },
  {
    id: slug("Postobon"),
    category: "drinks-soft",
    name: "Postobón",
    i18nNames: { es: "Postobón", en: "Postobón", de: "Postobón", fr: "Postobón" },
    price: 1.2,
    descriptions: {
      es: "Refresco colombiano. Ingredientes: agua, azúcar, CO₂, aromas.",
      en: "Colombian soda. Ingredients: water, sugar, CO₂, flavorings.",
      de: "Kolumbianische Limonade. Zutaten: Wasser, Zucker, CO₂, Aromen.",
      fr: "Soda colombien. Ingrédients : eau, sucre, CO₂, arômes.",
    },
    image: IMG["drinks-soft"],
  },
  {
    id: slug("Zumo"),
    category: "drinks-soft",
    name: "Zumo (mango/melocotón)",
    i18nNames: {
      es: "Zumo (mango/melocotón)",
      en: "Juice (mango/peach)",
      de: "Saft (Mango/Pfirsich)",
      fr: "Jus (mangue/pêche)",
    },
    price: 2.0,
    descriptions: {
      es: "Jugo de fruta. Ingredientes: fruta, agua, azúcar (según sabor).",
      en: "Fruit juice. Ingredients: fruit, water, sugar (varies).",
      de: "Fruchtsaft. Zutaten: Frucht, Wasser, Zucker (variabel).",
      fr: "Jus de fruits. Ingrédients : fruit, eau, sucre (variable).",
    },
    image: IMG["drinks-soft"],
  },

  /* ---------- DRINKS: Beers ---------- */
  {
    id: slug("Dorada especial"),
    category: "drinks-beer",
    name: "Dorada Especial",
    i18nNames: {
      es: "Dorada Especial",
      en: "Dorada Especial",
      de: "Dorada Especial",
      fr: "Dorada Especial",
    },
    price: 2.0,
    descriptions: {
      es: "Lager canaria. Ingredientes: agua, malta de cebada, lúpulo.",
      en: "Canarian lager. Ingredients: water, barley malt, hops.",
      de: "Kanarisches Lager. Zutaten: Wasser, Gerstenmalz, Hopfen.",
      fr: "Lager canarienne. Ingrédients : eau, malt d’orge, houblon.",
    },
    image: IMG["drinks-beer"],
  },
  {
    id: slug("Dorada especial grande"),
    category: "drinks-beer",
    name: "Dorada Especial (grande)",
    i18nNames: {
      es: "Dorada Especial (grande)",
      en: "Dorada Especial (large)",
      de: "Dorada Especial (groß)",
      fr: "Dorada Especial (grande)",
    },
    price: 3.5,
    descriptions: {
      es: "Formato grande. Ingredientes: agua, malta, lúpulo.",
      en: "Large bottle. Ingredients: water, malt, hops.",
      de: "Große Flasche. Zutaten: Wasser, Malz, Hopfen.",
      fr: "Grand format. Ingrédients : eau, malt, houblon.",
    },
    image: IMG["drinks-beer"],
  },
  {
    id: slug("Dorada pilsen"),
    category: "drinks-beer",
    name: "Dorada Pilsen",
    i18nNames: {
      es: "Dorada Pilsen",
      en: "Dorada Pilsen",
      de: "Dorada Pilsen",
      fr: "Dorada Pilsen",
    },
    price: 2.2,
    descriptions: {
      es: "Pilsen canaria. Ingredientes: agua, malta, lúpulo.",
      en: "Canarian pilsner. Ingredients: water, malt, hops.",
      de: "Kanarisches Pils. Zutaten: Wasser, Malz, Hopfen.",
      fr: "Pils canarienne. Ingrédients : eau, malt, houblon.",
    },
    image: IMG["drinks-beer"],
  },
  {
    id: slug("Dorada tostada"),
    category: "drinks-beer",
    name: "Dorada Especial Tostada",
    i18nNames: {
      es: "Dorada Especial Tostada",
      en: "Dorada Especial Toasted",
      de: "Dorada Especial Toasted",
      fr: "Dorada Especial Toasted",
    },
    price: 2.5,
    descriptions: {
      es: "Malta tostada. Ingredientes: agua, malta tostada, lúpulo.",
      en: "Toasted malt profile. Ingredients: water, toasted malt, hops.",
      de: "Geröstetes Malzprofil. Zutaten: Wasser, Röstmalz, Hopfen.",
      fr: "Profil malté torréfié. Ingrédients : eau, malt torréfié, houblon.",
    },
    image: IMG["drinks-beer"],
  },
  {
    id: slug("Dorada 0"),
    category: "drinks-beer",
    name: "Dorada sin alcohol",
    i18nNames: {
      es: "Dorada sin alcohol",
      en: "Dorada alcohol-free",
      de: "Dorada alkoholfrei",
      fr: "Dorada sans alcool",
    },
    price: 2.0,
    descriptions: {
      es: "Sin alcohol. Ingredientes: agua, malta, lúpulo.",
      en: "Alcohol-free. Ingredients: water, malt, hops.",
      de: "Alkoholfrei. Zutaten: Wasser, Malz, Hopfen.",
      fr: "Sans alcool. Ingrédients : eau, malt, houblon.",
    },
    image: IMG["drinks-beer"],
  },
  {
    id: slug("Dorada 0 limon"),
    category: "drinks-beer",
    name: "Dorada sin alcohol limón",
    i18nNames: {
      es: "Dorada sin alcohol limón",
      en: "Dorada alcohol-free lemon",
      de: "Dorada alkoholfrei Zitrone",
      fr: "Dorada sans alcool citron",
    },
    price: 2.2,
    descriptions: {
      es: "Con limón. Ingredientes: cerveza 0.0, limón, azúcar.",
      en: "Lemon blend. Ingredients: 0.0 beer, lemon, sugar.",
      de: "Mit Zitrone. Zutaten: 0.0 Bier, Zitrone, Zucker.",
      fr: "Citronnée. Ingrédients : bière 0.0, citron, sucre.",
    },
    image: IMG["drinks-beer"],
  },
  {
    id: slug("Corona"),
    category: "drinks-beer",
    name: "Corona",
    i18nNames: { es: "Corona", en: "Corona", de: "Corona", fr: "Corona" },
    price: 3.5,
    descriptions: {
      es: "Cerveza internacional. Ingredientes: agua, malta, lúpulo.",
      en: "International lager. Ingredients: water, malt, hops.",
      de: "Internationales Lagerbier. Zutaten: Wasser, Malz, Hopfen.",
      fr: "Bière blonde internationale. Ingrédients : eau, malt, houblon.",
    },
    image: IMG["drinks-beer"],
  },

  /* ---------- DRINKS: Waters ---------- */
  {
    id: slug("Agua pequena"),
    category: "drinks-water",
    name: "Agua (botella pequeña)",
    i18nNames: {
      es: "Agua (pequeña)",
      en: "Water (small bottle)",
      de: "Wasser (klein)",
      fr: "Eau (petite bouteille)",
    },
    price: 1.0,
    descriptions: {
      es: "Agua mineral. Ingredientes: agua.",
      en: "Mineral water. Ingredients: water.",
      de: "Mineralwasser. Zutaten: Wasser.",
      fr: "Eau minérale. Ingrédients : eau.",
    },
    image: IMG["drinks-water"],
  },
  {
    id: slug("Agua grande"),
    category: "drinks-water",
    name: "Agua (botella grande)",
    i18nNames: {
      es: "Agua (grande)",
      en: "Water (large bottle)",
      de: "Wasser (groß)",
      fr: "Eau (grande bouteille)",
    },
    price: 2.0,
    descriptions: {
      es: "Agua mineral. Ingredientes: agua.",
      en: "Mineral water. Ingredients: water.",
      de: "Mineralwasser. Zutaten: Wasser.",
      fr: "Eau minérale. Ingrédients : eau.",
    },
    image: IMG["drinks-water"],
  },
  {
    id: slug("Agua con gas"),
    category: "drinks-water",
    name: "Agua con gas",
    i18nNames: {
      es: "Agua con gas",
      en: "Sparkling water",
      de: "Sprudelwasser",
      fr: "Eau gazeuse",
    },
    price: 1.5,
    descriptions: {
      es: "Con burbujas. Ingredientes: agua, CO₂.",
      en: "Bubbly. Ingredients: water, CO₂.",
      de: "Mit Kohlensäure. Zutaten: Wasser, CO₂.",
      fr: "Pétillante. Ingrédients : eau, CO₂.",
    },
    image: IMG["drinks-water"],
  },

  /* ---------- DRINKS: Coffee & infusions ---------- */
  {
    id: slug("Cafe expreso"),
    category: "drinks-coffee",
    name: "Café expreso",
    i18nNames: {
      es: "Café expreso",
      en: "Espresso",
      de: "Espresso",
      fr: "Expresso",
    },
    price: 1.2,
    descriptions: {
      es: "Corto y aromático. Ingredientes: café arábica, agua.",
      en: "Short & aromatic. Ingredients: arabica coffee, water.",
      de: "Kurz & aromatisch. Zutaten: Arabica-Kaffee, Wasser.",
      fr: "Court & aromatique. Ingrédients : café arabica, eau.",
    },
    image: IMG["drinks-coffee"],
  },
  {
    id: slug("Cafe cortado"),
    category: "drinks-coffee",
    name: "Café cortado",
    i18nNames: {
      es: "Café cortado",
      en: "Macchiato",
      de: "Cortado",
      fr: "Cortado",
    },
    price: 1.3,
    descriptions: {
      es: "Con un toque de leche. Ingredientes: espresso, leche.",
      en: "Dash of milk. Ingredients: espresso, milk.",
      de: "Mit Milchschuss. Zutaten: Espresso, Milch.",
      fr: "Nuage de lait. Ingrédients : expresso, lait.",
    },
    image: IMG["drinks-coffee"],
  },
  {
    id: slug("Cafe bombon"),
    category: "drinks-coffee",
    name: "Café bombón",
    i18nNames: {
      es: "Café bombón",
      en: "Bombón coffee",
      de: "Kaffee mit Kondensmilch",
      fr: "Café bombón",
    },
    price: 1.4,
    descriptions: {
      es: "Con leche condensada. Ingredientes: espresso, leche condensada.",
      en: "With condensed milk. Ingredients: espresso, condensed milk.",
      de: "Mit Kondensmilch. Zutaten: Espresso, Kondensmilch.",
      fr: "Avec lait concentré. Ingrédients : expresso, lait concentré.",
    },
    image: IMG["drinks-coffee"],
  },
  {
    id: slug("Cafe con leche"),
    category: "drinks-coffee",
    name: "Café con leche",
    i18nNames: {
      es: "Café con leche",
      en: "Coffee with milk",
      de: "Kaffee mit Milch",
      fr: "Café au lait",
    },
    price: null,
    descriptions: {
      es: "Clásico suave. Ingredientes: café, leche.",
      en: "Smooth classic. Ingredients: coffee, milk.",
      de: "Sanfter Klassiker. Zutaten: Kaffee, Milch.",
      fr: "Classique doux. Ingrédients : café, lait.",
    },
    image: IMG["drinks-coffee"],
  },
  {
    id: slug("Leche y leche"),
    category: "drinks-coffee",
    name: "Café leche y leche",
    i18nNames: {
      es: "Café leche y leche",
      en: "Milk & milk coffee",
      de: "Kaffee mit Milch & Kondensmilch",
      fr: "Café lait & lait concentré",
    },
    price: null,
    descriptions: {
      es: "Con leche y condensada. Ingredientes: café, leche, leche condensada.",
      en: "Milk & condensed milk. Ingredients: coffee, milk, condensed milk.",
      de: "Mit Milch & Kondensmilch. Zutaten: Kaffee, Milch, Kondensmilch.",
      fr: "Lait & lait concentré. Ingrédients : café, lait, lait concentré.",
    },
    image: IMG["drinks-coffee"],
  },
  {
    id: slug("Descafeinado"),
    category: "drinks-coffee",
    name: "Café descafeinado",
    i18nNames: {
      es: "Café descafeinado",
      en: "Decaf coffee",
      de: "Entkoffeinierter Kaffee",
      fr: "Café décaféiné",
    },
    price: null,
    descriptions: {
      es: "Sin cafeína. Ingredientes: café descafeinado, agua.",
      en: "Caffeine-free. Ingredients: decaf coffee, water.",
      de: "Koffeinfrei. Zutaten: entkoffeinierter Kaffee, Wasser.",
      fr: "Sans caféine. Ingrédients : café décaféiné, eau.",
    },
    image: IMG["drinks-coffee"],
  },
  {
    id: slug("Descafeinado con leche"),
    category: "drinks-coffee",
    name: "Descafeinado con leche",
    i18nNames: {
      es: "Descafeinado con leche",
      en: "Decaf with milk",
      de: "Entkoffeiniert mit Milch",
      fr: "Décaféiné au lait",
    },
    price: null,
    descriptions: {
      es: "Suave y cremoso. Ingredientes: decaf, leche.",
      en: "Smooth & creamy. Ingredients: decaf, milk.",
      de: "Sanft & cremig. Zutaten: entkoffeinierter Kaffee, Milch.",
      fr: "Doux & crémeux. Ingrédients : décaféiné, lait.",
    },
    image: IMG["drinks-coffee"],
  },
  {
    id: slug("Barraquito"),
    category: "drinks-coffee",
    name: "Barraquito",
    i18nNames: { es: "Barraquito", en: "Barraquito", de: "Barraquito", fr: "Barraquito" },
    price: 3.0,
    descriptions: {
      es: "Café canario en capas. Ingredientes: espresso, leche, leche condensada, licor, canela, limón.",
      en: "Layered Canarian coffee. Ingredients: espresso, milk, condensed milk, liqueur, cinnamon, lemon.",
      de: "Kanarischer Schichtkaffee. Zutaten: Espresso, Milch, Kondensmilch, Likör, Zimt, Zitrone.",
      fr: "Café canarien en couches. Ingrédients : expresso, lait, lait concentré, liqueur, cannelle, citron.",
    },
    image: IMG["drinks-coffee"],
  },
  {
    id: slug("Infusiones"),
    category: "drinks-coffee",
    name: "Infusiones variadas",
    i18nNames: {
      es: "Infusiones variadas",
      en: "Various infusions",
      de: "Verschiedene Tees",
      fr: "Infusions variées",
    },
    price: 2.0,
    descriptions: {
      es: "Selección de tés. Ingredientes: mezcla de hierbas/hojas.",
      en: "Selection of teas. Ingredients: mixed herbs/leaves.",
      de: "Teeauswahl. Zutaten: Kräuter-/Blattmischung.",
      fr: "Sélection de thés. Ingrédients : mélange d’herbes/feuilles.",
    },
    image: IMG["drinks-coffee"],
  },

  /* ---------- DRINKS: Spirits & mixers (con 2 precios) ---------- */
  {
    id: slug("Johnnie Red"),
    category: "drinks-liquor",
    name: "Johnnie Walker Red Label",
    i18nNames: {
      es: "Johnnie Walker Red Label",
      en: "Johnnie Walker Red Label",
      de: "Johnnie Walker Red Label",
      fr: "Johnnie Walker Black Label",
    },
    // priceShot: null, priceGlass: null, // deja vacío si aún no tienes precios
    descriptions: {
      es: "Blended Scotch. Ingredientes: whisky de malta y grano.",
      en: "Blended Scotch. Ingredients: malt & grain whiskies.",
      de: "Blended Scotch. Zutaten: Malt- & Grain-Whiskys.",
      fr: "Blended Scotch. Ingrédients : whiskies de malt et de grain.",
    },
    image: IMG["drinks-liquor"],
  },
  {
    id: slug("Johnnie Black"),
    category: "drinks-liquor",
    name: "Johnnie Walker Black Label",
    i18nNames: {
      es: "Johnnie Walker Black Label",
      en: "Johnnie Walker Black Label",
      de: "Johnnie Walker Black Label",
      fr: "Johnnie Walker Black Label",
    },
    descriptions: {
      es: "Añejo escocés. Ingredientes: mezcla de whiskies.",
      en: "Aged Scotch. Ingredients: blended whiskies.",
      de: "Gereifter Scotch. Zutaten: Blended Whiskys.",
      fr: "Scotch vieilli. Ingrédients : whiskies assemblés.",
    },
    image: IMG["drinks-liquor"],
  },
  {
    id: slug("Chivas"),
    category: "drinks-liquor",
    name: "Chivas",
    i18nNames: { es: "Chivas", en: "Chivas", de: "Chivas", fr: "Chivas" },
    descriptions: {
      es: "Whisky blended. Ingredientes: whiskies de malta y grano.",
      en: "Blended whisky. Ingredients: malt & grain whiskies.",
      de: "Blended Whisky. Zutaten: Malt- & Grain-Whiskys.",
      fr: "Whisky blend. Ingrédients : whiskies de malt et de grain.",
    },
    image: IMG["drinks-liquor"],
  },
  {
    id: slug("Buchanans"),
    category: "drinks-liquor",
    name: "Buchanan’s",
    i18nNames: {
      es: "Buchanan’s",
      en: "Buchanan’s",
      de: "Buchanan’s",
      fr: "Buchanan’s",
    },
    descriptions: {
      es: "Scotch blended. Ingredientes: whiskies de malta y grano.",
      en: "Blended Scotch. Ingredients: malt & grain whiskies.",
      de: "Blended Scotch. Zutaten: Malt- & Grain-Whiskys.",
      fr: "Blended Scotch. Ingrédients : whiskies de malt et de grain.",
    },
    image: IMG["drinks-liquor"],
  },
  {
    id: slug("Gordons"),
    category: "drinks-liquor",
    name: "Gordon’s",
    i18nNames: { es: "Gordon’s", en: "Gordon’s", de: "Gordon’s", fr: "Gordon’s" },
    descriptions: {
      es: "Ginebra clásica. Ingredientes: destilado de grano, enebro, botánicos.",
      en: "Classic gin. Ingredients: grain spirit, juniper, botanicals.",
      de: "Klassischer Gin. Zutaten: Getreidealkohol, Wacholder, Botanicals.",
      fr: "Gin classique. Ingrédients : alcool de grain, genévrier, botaniques.",
    },
    image: IMG["drinks-liquor"],
  },
  {
    id: slug("Hendricks"),
    category: "drinks-liquor",
    name: "Hendrick’s",
    i18nNames: { es: "Hendrick’s", en: "Hendrick’s", de: "Hendrick’s", fr: "Hendrick’s" },
    descriptions: {
      es: "Ginebra premium. Ingredientes: botánicos, pepino, rosa.",
      en: "Premium gin. Ingredients: botanicals, cucumber, rose.",
      de: "Premium-Gin. Zutaten: Botanicals, Gurke, Rose.",
      fr: "Gin premium. Ingrédients : botaniques, concombre, rose.",
    },
    image: IMG["drinks-liquor"],
  },
  {
    id: slug("Arehucas"),
    category: "drinks-liquor",
    name: "Arehucas",
    i18nNames: { es: "Arehucas", en: "Arehucas", de: "Arehucas", fr: "Arehucas" },
    descriptions: {
      es: "Ron canario. Ingredientes: melaza de caña, envejecimiento.",
      en: "Canarian rum. Ingredients: cane molasses, aging.",
      de: "Kanarischer Rum. Zutaten: Zuckerrohrmelasse, Reifung.",
      fr: "Rhum canarien. Ingrédients : mélasse de canne, vieillissement.",
    },
    image: IMG["drinks-liquor"],
  },
  {
    id: slug("Havana 3"),
    category: "drinks-liquor",
    name: "Havana 3 años",
    i18nNames: {
      es: "Havana 3 años",
      en: "Havana 3 years",
      de: "Havana 3 Jahre",
      fr: "Havana 3 ans",
    },
    descriptions: {
      es: "Ron cubano. Ingredientes: melaza, añejamiento 3 años.",
      en: "Cuban rum. Ingredients: molasses, 3-year aging.",
      de: "Kubanischer Rum. Zutaten: Melasse, 3 Jahre Reife.",
      fr: "Rhum cubain. Ingrédients : mélasse, vieillissement 3 ans.",
    },
    image: IMG["drinks-liquor"],
  },
  {
    id: slug("Ron Viejo de Caldas"),
    category: "drinks-liquor",
    name: "Ron Viejo de Caldas",
    i18nNames: {
      es: "Ron Viejo de Caldas",
      en: "Ron Viejo de Caldas",
      de: "Ron Viejo de Caldas",
      fr: "Ron Viejo de Caldas",
    },
    descriptions: {
      es: "Ron colombiano. Ingredientes: melaza de caña, añejamiento.",
      en: "Colombian rum. Ingredients: cane molasses, aging.",
      de: "Kolumbianischer Rum. Zutaten: Rohrmelasse, Reifung.",
      fr: "Rhum colombien. Ingrédients : mélasse de canne, vieillissement.",
    },
    image: IMG["drinks-liquor"],
  },
  {
    id: slug("Smirnoff Red"),
    category: "drinks-liquor",
    name: "Smirnoff Red",
    i18nNames: {
      es: "Smirnoff Red",
      en: "Smirnoff Red",
      de: "Smirnoff Red",
      fr: "Smirnoff Red",
    },
    descriptions: {
      es: "Vodka clásico. Ingredientes: alcohol de grano, agua.",
      en: "Classic vodka. Ingredients: grain spirit, water.",
      de: "Klassischer Wodka. Zutaten: Getreidealkohol, Wasser.",
      fr: "Vodka classique. Ingrédients : alcool de grain, eau.",
    },
    image: IMG["drinks-liquor"],
  },
  {
    id: slug("Aguardiente rojo"),
    category: "drinks-liquor",
    name: "Aguardiente Antioqueño (rojo)",
    i18nNames: {
      es: "Aguardiente Antioqueño (rojo)",
      en: "Aguardiente Antioqueño (red)",
      de: "Aguardiente Antioqueño (rot)",
      fr: "Aguardiente Antioqueño (rouge)",
    },
    descriptions: {
      es: "Anisado colombiano. Ingredientes: alcohol, anís, azúcar.",
      en: "Colombian anis spirit. Ingredients: alcohol, anise, sugar.",
      de: "Kolumbianischer Anisschnaps. Zutaten: Alkohol, Anis, Zucker.",
      fr: "Spiritueux anisé colombien. Ingrédients : alcool, anis, sucre.",
    },
    image: IMG["drinks-liquor"],
  },
  {
    id: slug("Aguardiente amarillo"),
    category: "drinks-liquor",
    name: "Aguardiente Antioqueño (amarillo)",
    i18nNames: {
      es: "Aguardiente Antioqueño (amarillo)",
      en: "Aguardiente Antioqueño (yellow)",
      de: "Aguardiente Antioqueño (gelb)",
      fr: "Aguardiente Antioqueño (jaune)",
    },
    descriptions: {
      es: "Anisado colombiano. Ingredientes: alcohol, anís, azúcar.",
      en: "Colombian anis spirit. Ingredients: alcohol, anise, sugar.",
      de: "Kolumbianischer Anisschnaps. Zutaten: Alkohol, Anis, Zucker.",
      fr: "Spiritueux anisé colombien. Ingrédients : alcool, anis, sucre.",
    },
    image: IMG["drinks-liquor"],
  },
  {
    id: slug("Aguardiente azul"),
    category: "drinks-liquor",
    name: "Aguardiente Antioqueño (azul)",
    i18nNames: {
      es: "Aguardiente Antioqueño (azul)",
      en: "Aguardiente Antioqueño (blue)",
      de: "Aguardiente Antioqueño (blau)",
      fr: "Aguardiente Antioqueño (bleu)",
    },
    descriptions: {
      es: "Anisado colombiano. Ingredientes: alcohol, anís, azúcar.",
      en: "Colombian anis spirit. Ingredients: alcohol, anise, sugar.",
      de: "Kolumbianischer Anisschnaps. Zutaten: Alkohol, Anis, Zucker.",
      fr: "Spiritueux anisé colombien. Ingrédients : alcool, anis, sucre.",
    },
    image: IMG["drinks-liquor"],
  },
  {
    id: slug("Aguardiente del Valle"),
    category: "drinks-liquor",
    name: "Aguardiente del Valle",
    i18nNames: {
      es: "Aguardiente del Valle",
      en: "Aguardiente del Valle",
      de: "Aguardiente del Valle",
      fr: "Aguardiente del Valle",
    },
    descriptions: {
      es: "Aguardiente vallecaucano. Ingredientes: alcohol, anís, azúcar.",
      en: "Anis spirit from Valle del Cauca. Ingredients: alcohol, anise, sugar.",
      de: "Anisschnaps aus Valle del Cauca. Zutaten: Alkohol, Anis, Zucker.",
      fr: "Spiritueux anisé du Valle del Cauca. Ingrédients : alcool, anis, sucre.",
    },
    image: IMG["drinks-liquor"],
  },
  {
    id: slug("Jagermeister"),
    category: "drinks-liquor",
    name: "Jägermeister",
    i18nNames: { es: "Jägermeister", en: "Jägermeister", de: "Jägermeister", fr: "Jägermeister" },
    descriptions: {
      es: "Licor de hierbas. Ingredientes: macerado de hierbas, especias.",
      en: "Herbal liqueur. Ingredients: herbs & spices maceration.",
      de: "Kräuterlikör. Zutaten: Kräuter- & Gewürzauszug.",
      fr: "Liqueur aux herbes. Ingrédients : macération d'herbes & épices.",
    },
    image: IMG["drinks-liquor"],
  },
  {
    id: slug("Baileys"),
    category: "drinks-liquor",
    name: "Baileys",
    i18nNames: { es: "Baileys", en: "Baileys", de: "Baileys", fr: "Baileys" },
    descriptions: {
      es: "Crema irlandesa. Ingredientes: crema de leche, whisky, azúcar.",
      en: "Irish cream. Ingredients: dairy cream, whisky, sugar.",
      de: "Irischer Sahnelikör. Zutaten: Sahne, Whisky, Zucker.",
      fr: "Crème irlandaise. Ingrédients : crème laitière, whisky, sucre.",
    },
    image: IMG["drinks-liquor"],
  },

  /* ---------- DRINKS: Wines ---------- */
  {
    id: slug("Vino tinto cuarto"),
    category: "drinks-wine",
    name: "Vino tinto (1/4)",
    i18nNames: {
      es: "Vino tinto (1/4)",
      en: "Red wine (1/4)",
      de: "Rotwein (1/4)",
      fr: "Vin rouge (1/4)",
    },
    price: 3.0,
    descriptions: {
      es: "Vino de la casa. Ingredientes: uva tinta.",
      en: "House red. Ingredients: red grapes.",
      de: "Hauswein rot. Zutaten: rote Trauben.",
      fr: "Vin rouge maison. Ingrédients : raisins rouges.",
    },
    image: IMG["drinks-wine"],
  },
  {
    id: slug("Vino tinto medio"),
    category: "drinks-wine",
    name: "Vino tinto (media)",
    i18nNames: {
      es: "Vino tinto (media)",
      en: "Red wine (medium)",
      de: "Rotwein (mittel)",
      fr: "Vin rouge (moyen)",
    },
    price: 5.5,
    descriptions: {
      es: "Vino de la casa. Ingredientes: uva tinta.",
      en: "House red. Ingredients: red grapes.",
      de: "Hauswein rot. Zutaten: rote Trauben.",
      fr: "Vin rouge maison. Ingrédients : raisins rouges.",
    },
    image: IMG["drinks-wine"],
  },
  {
    id: slug("Vino blanco cuarto"),
    category: "drinks-wine",
    name: "Vino blanco (1/4)",
    i18nNames: {
      es: "Vino blanco (1/4)",
      en: "White wine (1/4)",
      de: "Weißwein (1/4)",
      fr: "Vin blanc (1/4)",
    },
    price: 3.0,
    descriptions: {
      es: "Vino de la casa. Ingredientes: uva blanca.",
      en: "House white. Ingredients: white grapes.",
      de: "Hauswein weiß. Zutaten: weiße Trauben.",
      fr: "Vin blanc maison. Ingrédients : raisins blancs.",
    },
    image: IMG["drinks-wine"],
  },
  {
    id: slug("Vino blanco medio"),
    category: "drinks-wine",
    name: "Vino blanco (media)",
    i18nNames: {
      es: "Vino blanco (media)",
      en: "White wine (medium)",
      de: "Weißwein (mittel)",
      fr: "Vin blanc (moyen)",
    },
    price: 5.5,
    descriptions: {
      es: "Vino de la casa. Ingredientes: uva blanca.",
      en: "House white. Ingredients: white grapes.",
      de: "Hauswein weiß. Zutaten: weiße Trauben.",
      fr: "Vin blanc maison. Ingrédients : raisins blancs.",
    },
    image: IMG["drinks-wine"],
  },
  {
    id: slug("Vino dulce cuarto"),
    category: "drinks-wine",
    name: "Vino dulce (1/4)",
    i18nNames: {
      es: "Vino dulce (1/4)",
      en: "Sweet wine (1/4)",
      de: "Süßwein (1/4)",
      fr: "Vin doux (1/4)",
    },
    price: 3.0,
    descriptions: {
      es: "Dulce de la casa. Ingredientes: uva, azúcar residual.",
      en: "House sweet. Ingredients: grapes, residual sugar.",
      de: "Haus-Süßwein. Zutaten: Trauben, Restsüße.",
      fr: "Vin doux maison. Ingrédients : raisins, sucre résiduel.",
    },
    image: IMG["drinks-wine"],
  },
  {
    id: slug("Vino dulce medio"),
    category: "drinks-wine",
    name: "Vino dulce (media)",
    i18nNames: {
      es: "Vino dulce (media)",
      en: "Sweet wine (medium)",
      de: "Süßwein (mittel)",
      fr: "Vin doux (moyen)",
    },
    price: 5.5,
    descriptions: {
      es: "Dulce de la casa. Ingredientes: uva, azúcar residual.",
      en: "House sweet. Ingredients: grapes, residual sugar.",
      de: "Haus-Süßwein. Zutaten: Trauben, Restsüße.",
      fr: "Vin doux maison. Ingrédients : raisins, sucre résiduel.",
    },
    image: IMG["drinks-wine"],
  },
];

/* ===================== Utilidades ===================== */
function detectDeviceLang(): Lang {
  const supported: Lang[] = ["es", "en", "de", "fr"];
  const pick = (code?: string) => code?.slice(0, 2).toLowerCase();
  const fromNavigator = pick(
    typeof navigator !== "undefined" ? navigator.language : ""
  );
  if (fromNavigator && supported.includes(fromNavigator as Lang))
    return fromNavigator as Lang;
  if (
    typeof navigator !== "undefined" &&
    Array.isArray((navigator as any).languages)
  ) {
    const match = (navigator as any).languages
      .map(pick)
      .find((l: string) => supported.includes(l as Lang));
    if (match) return match as Lang;
  }
  return "es";
}

function formatEUR(value?: number | null, locale = "es-ES") {
  if (value === null || value === undefined || Number.isNaN(value)) return "";
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "EUR",
  }).format(value);
}

/* ===================== Tarjeta ===================== */
function DishCard({
  dish,
  lang,
  isOpen,
  onToggle,
}: {
  dish: Dish;
  lang: Lang;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const displayName =
    dish.i18nNames && dish.i18nNames[lang]
      ? (dish.i18nNames[lang] as string)
      : dish.name;
  const description = dish.descriptions[lang] || dish.descriptions.en;

  const hasDual = dish.priceShot != null || dish.priceGlass != null;
  const hasHalfWhole = dish.priceHalf != null || dish.priceWhole != null;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onToggle}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onToggle()}
      className="relative group rounded-2xl border border-white/50 bg-white/90 p-4 shadow-sm ring-1 ring-black/5 transition hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
      style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute left-0 top-0 h-1 w-full rounded-t-2xl"
        style={{ background: CAT_COLORS[dish.category] }}
      />
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <div className="truncate text-lg font-semibold">{displayName}</div>
          <div className="mt-1 text-sm text-gray-700">
            {I18N[lang].categories[dish.category]}
          </div>
        </div>

        {/* Precios en el encabezado */}
        <div className="flex items-center gap-3">
          {!hasDual && !hasHalfWhole && (
            <div className="whitespace-nowrap text-base font-semibold">
              {formatEUR(dish.price ?? null, LOCALE_BY_LANG[lang])}
            </div>
          )}

          {hasDual && (
            <div className="text-right text-xs leading-tight">
              {dish.priceShot != null && (
                <div>
                  {I18N[lang].priceLabels.shot}:{" "}
                  <span className="font-semibold">
                    {formatEUR(dish.priceShot, LOCALE_BY_LANG[lang])}
                  </span>
                </div>
              )}
              {dish.priceGlass != null && (
                <div>
                  {I18N[lang].priceLabels.glass}:{" "}
                  <span className="font-semibold">
                    {formatEUR(dish.priceGlass, LOCALE_BY_LANG[lang])}
                  </span>
                </div>
              )}
            </div>
          )}

          {hasHalfWhole && (
            <div className="text-right text-xs leading-tight">
              {dish.priceHalf != null && (
                <div>
                  {I18N[lang].priceLabels.halfChicken}:{" "}
                  <span className="font-semibold">
                    {formatEUR(dish.priceHalf, LOCALE_BY_LANG[lang])}
                  </span>
                </div>
              )}
              {dish.priceWhole != null && (
                <div>
                  {I18N[lang].priceLabels.wholeChicken}:{" "}
                  <span className="font-semibold">
                    {formatEUR(dish.priceWhole, LOCALE_BY_LANG[lang])}
                  </span>
                </div>
              )}
            </div>
          )}

          <ChevronDown
            className={`h-5 w-5 transition-transform duration-200 ${
              isOpen ? "rotate-180" : "rotate-0"
            }`}
            aria-hidden
          />
        </div>
      </div>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <img
                  src={dish.image}
                  alt={`Foto de ${displayName}`}
                  className="aspect-video w-full rounded-xl object-cover"
                  loading="lazy"
                />
              </div>

              <div>
                {/* Texto */}
                <p className="leading-relaxed text-gray-800">{description}</p>

                {/* Repetimos precios como chips si hay múltiples */}
                {(hasDual || hasHalfWhole) && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {hasDual && dish.priceShot != null && (
                      <span className="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-gray-700">
                        {I18N[lang].priceLabels.shot}:{" "}
                        {formatEUR(dish.priceShot, LOCALE_BY_LANG[lang])}
                      </span>
                    )}
                    {hasDual && dish.priceGlass != null && (
                      <span className="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-gray-700">
                        {I18N[lang].priceLabels.glass}:{" "}
                        {formatEUR(dish.priceGlass, LOCALE_BY_LANG[lang])}
                      </span>
                    )}
                    {hasHalfWhole && dish.priceHalf != null && (
                      <span className="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-gray-700">
                        {I18N[lang].priceLabels.halfChicken}:{" "}
                        {formatEUR(dish.priceHalf, LOCALE_BY_LANG[lang])}
                      </span>
                    )}
                    {hasHalfWhole && dish.priceWhole != null && (
                      <span className="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-gray-700">
                        {I18N[lang].priceLabels.wholeChicken}:{" "}
                        {formatEUR(dish.priceWhole, LOCALE_BY_LANG[lang])}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ===================== Componente principal ===================== */
export default function DigitalMenu() {
  const [openCards, setOpenCards] = useState<Set<string>>(new Set());
  const [openCats, setOpenCats] = useState<Set<Category>>(
    () =>
      new Set([
        // "starters",
        // "main",
        // "grill",
        // "dessert",
        // "drinks-soft",
        // "drinks-beer",
        // "drinks-water",
        // "drinks-coffee",
        // "drinks-liquor",
        // "drinks-wine",
      ]) // por defecto todas cerradas
  );
  const [lang, setLang] = useState<Lang>(() => {
    if (typeof window !== "undefined") {
      const saved = window.localStorage.getItem("menu:lang") as Lang | null;
      return saved ?? detectDeviceLang();
    }
    return "es";
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("menu:lang", lang);
    }
  }, [lang]);

  const toggleCard = (id: string) => {
    setOpenCards((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleCategory = (cat: Category) => {
    setOpenCats((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  };

  const setAllCats = (open: boolean) => {
    setOpenCats(
      open
        ? new Set([
            "starters",
            "main",
            "grill",
            "dessert",
            "drinks-soft",
            "drinks-beer",
            "drinks-water",
            "drinks-coffee",
            "drinks-liquor",
            "drinks-wine",
          ])
        : new Set()
    );
  };

  // orden y agrupado por categoría PDF
  const order: Category[] = [
    "starters",
    "main",
    "grill",
    "dessert",
    "drinks-soft",
    "drinks-beer",
    "drinks-water",
    "drinks-coffee",
    "drinks-liquor",
    "drinks-wine",
  ];

  const dishesSorted = useMemo(
    () =>
      [...DISHES].sort((a, b) => {
        if (a.category === b.category) return a.name.localeCompare(b.name);
        return order.indexOf(a.category) - order.indexOf(b.category);
      }),
    []
  );

  const grouped = useMemo(() => {
    return dishesSorted.reduce<Record<Category, Dish[]>>(
      (acc, d) => {
        (acc[d.category] ||= []).push(d);
        return acc;
      },
      {
        starters: [],
        main: [],
        grill: [],
        dessert: [],
        "drinks-soft": [],
        "drinks-beer": [],
        "drinks-water": [],
        "drinks-coffee": [],
        "drinks-liquor": [],
        "drinks-wine": [],
      }
    );
  }, [dishesSorted]);

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      {/* Fondo */}
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
        <img
          src={BG_URL}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          style={{ width: "100vw", height: "100vh" }}
          loading="lazy"
        />
        <div className="absolute inset-0 bg-white/20" />
      </div>

      <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6 py-6 sm:py-8">
        {/* Header */}
        <header className="mb-5 sm:mb-8 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">
              {I18N[lang].menuTitle} Sazón de mi Tierra
            </h1>
            {/* <p className="mt-1 text-sm text-gray-700">{I18N[lang].subtitle}</p> */}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setAllCats(true)}
              className="rounded-lg border border-white/50 bg-white/90 px-3 py-2 text-xs font-medium text-gray-800 shadow-sm hover:bg-white"
            >
              {I18N[lang].expandAll}
            </button>
            <button
              onClick={() => setAllCats(false)}
              className="rounded-lg border border-white/50 bg-white/90 px-3 py-2 text-xs font-medium text-gray-800 shadow-sm hover:bg-white"
            >
              {I18N[lang].collapseAll}
            </button>

            <label className="ml-2 flex items-center gap-2 rounded-xl border border-white/50 bg-white/90 px-3 py-2 shadow-sm">
              <Globe className="h-4 w-4" aria-hidden />
              <span className="text-sm text-gray-700">
                {I18N[lang].languageLabel}
              </span>
              <select
                className="ml-1 rounded-md border border-gray-200 bg-white px-2 py-1 text-sm focus:outline-none"
                value={lang}
                onChange={(e) => setLang(e.target.value as Lang)}
                aria-label="Seleccionar idioma"
              >
                {(["es", "en", "de", "fr"] as Lang[]).map((code) => (
                  <option key={code} value={code}>
                    {LANG_LABEL[code]}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </header>

        {/* Secciones por categoría del PDF */}
        {order.map((cat) => {
          const items = grouped[cat];
          const isOpen = openCats.has(cat);
          const t = I18N[lang].categories[cat];
          const accent = CAT_COLORS[cat];

          return (
            <section key={cat} className="mb-6">
              <button
                onClick={() => toggleCategory(cat)}
                aria-expanded={isOpen}
                className="group flex w-full items-center justify-between rounded-xl border border-white/50 bg-white/90 px-4 py-3 shadow-sm hover:bg-white"
                style={{
                  boxShadow:
                    "0 1px 0 rgba(0,0,0,0.02), 0 2px 8px rgba(0,0,0,0.04)",
                }}
              >
                <div className="flex items-center gap-3">
                  <span
                    className="inline-block h-3 w-3 rounded-full"
                    style={{ background: accent }}
                    aria-hidden
                  />
                  <h2 className="text-base font-semibold text-gray-900">{t}</h2>
                </div>
                <ChevronDown
                  className={`h-5 w-5 text-gray-600 transition-transform duration-200 ${
                    isOpen ? "rotate-180" : "rotate-0"
                  }`}
                  aria-hidden
                />
              </button>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    key={`${cat}-content`}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                      {items.map((dish) => (
                        <DishCard
                          key={dish.id}
                          dish={dish}
                          lang={lang}
                          isOpen={openCards.has(dish.id)}
                          onToggle={() => toggleCard(dish.id)}
                        />
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </section>
          );
        })}

        <footer className="mt-8 text-center text-xs text-gray-600">
          © {new Date().getFullYear()} — Menú Sazón de mi Tierra.
        </footer>
      </div>
    </div>
  );
}
