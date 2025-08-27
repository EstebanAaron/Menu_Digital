import React, { useEffect, useMemo, useState } from "react";
import { ChevronDown, Globe } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

/**
 * DigitalMenu.tsx
 * - Fondo con IMAGEN (configurable en BG_URL)
 * - I18N (ES/EN/DE/FR) para textos y categorías
 * - Auto-detección de idioma + persistencia en localStorage
 * - Formato € por locale
 * - Secciones colapsables por CATEGORÍA
 * - Tarjetas expandibles por PLATO
 * - Estilos mobile-first con Tailwind (overlay para legibilidad)
 */

/* ===================== Config del Fondo ===================== */
const BG_URL = "img/11.jpg"; // ← Cambia esta URL por tu imagen

/* ===================== Tipos ===================== */
type Lang = "es" | "en" | "de" | "fr";
type Category = "entrantes" | "carnes" | "pescado" | "postre" | "bebidas";

type Dish = {
  id: string;
  category: Category;
  name: string;
  price: number; // EUR
  descriptions: Record<Lang, string>;
  image: string; // URL
};

/* ===================== I18N ===================== */
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
  }
> = {
  es: {
    menuTitle: "Menú",
    subtitle: "Toca un plato o una categoría para ver la descripción e imagen.",
    languageLabel: "Idioma",
    categories: {
      entrantes: "Entrantes",
      carnes: "Carnes",
      pescado: "Pescado",
      postre: "Postre",
      bebidas: "Bebidas",
    },
    expandAll: "Expandir todo",
    collapseAll: "Recoger todo",
  },
  en: {
    menuTitle: "Menu",
    subtitle: "Tap a dish or a category to see description and photo.",
    languageLabel: "Language",
    categories: {
      entrantes: "Starters",
      carnes: "Meats",
      pescado: "Fish",
      postre: "Dessert",
      bebidas: "Drinks",
    },
    expandAll: "Expand all",
    collapseAll: "Collapse all",
  },
  de: {
    menuTitle: "Menü",
    subtitle: "Tippe auf ein Gericht oder eine Kategorie für Beschreibung und Foto.",
    languageLabel: "Sprache",
    categories: {
      entrantes: "Vorspeisen",
      carnes: "Fleisch",
      pescado: "Fisch",
      postre: "Dessert",
      bebidas: "Getränke",
    },
    expandAll: "Alle öffnen",
    collapseAll: "Alle schließen",
  },
  fr: {
    menuTitle: "Menu",
    subtitle: "Touchez un plat ou une catégorie pour voir la description et la photo.",
    languageLabel: "Langue",
    categories: {
      entrantes: "Entrées",
      carnes: "Viandes",
      pescado: "Poisson",
      postre: "Dessert",
      bebidas: "Boissons",
    },
    expandAll: "Tout développer",
    collapseAll: "Tout réduire",
  },
};

/* ===================== Colores por categoría (acentos) ===================== */
const CAT_COLORS: Record<Category, string> = {
  entrantes: "#14b8a6", // teal-500
  carnes: "#ef4444", // red-500
  pescado: "#3b82f6", // blue-500
  postre: "#ec4899", // pink-500
  bebidas: "#f59e0b", // amber-500
};

/* ===================== Datos (ejemplo) ===================== */
const DISHES: Dish[] = [
  {
    id: "croquetas-jamon",
    category: "entrantes",
    name: "Croquetas de jamón",
    price: 8.5,
    descriptions: {
      es: "Bechamel cremosa con jamón ibérico, empanadas y fritas al punto. 6 unidades.",
      en: "Creamy béchamel with Iberian ham, breaded and perfectly fried. 6 pieces.",
      de: "Cremige Béchamel mit iberischem Schinken, paniert und goldbraun frittiert. 6 Stück.",
      fr: "Béchamel onctueuse au jambon ibérique, panées et frites. 6 pièces.",
    },
    image:
      "https://images.unsplash.com/photo-1617191518009-6e7d36e9fe2e?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: "ensalada-mediterranea",
    category: "entrantes",
    name: "Ensalada mediterránea",
    price: 9.9,
    descriptions: {
      es: "Mezclum, tomate, pepino, aceitunas, queso feta y vinagreta de limón.",
      en: "Mixed greens, tomato, cucumber, olives, feta and lemon vinaigrette.",
      de: "Blattsalat, Tomate, Gurke, Oliven, Feta und Zitronen-Vinaigrette.",
      fr: "Mesclun, tomate, concombre, olives, feta et vinaigrette au citron.",
    },
    image:
      "https://images.unsplash.com/photo-1551183053-bf91a1d81141?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: "solomillo-parrilla",
    category: "carnes",
    name: "Solomillo a la parrilla",
    price: 21.5,
    descriptions: {
      es: "Ternera madurada a la brasa con sal en escamas y aceite de oliva virgen extra.",
      en: "Grilled aged beef tenderloin with flake salt and extra virgin olive oil.",
      de: "Gegrilltes, gereiftes Rinderfilet mit Flockensalz und nativem Olivenöl extra.",
      fr: "Filet de bœuf maturé grillé, sel en flocons et huile d'olive vierge extra.",
    },
    image:
      "https://images.unsplash.com/photo-1604908812837-0b6f64b2c329?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: "pollo-ajillo",
    category: "carnes",
    name: "Pollo al ajillo",
    price: 14.8,
    descriptions: {
      es: "Muslos de pollo salteados con ajo, vino blanco y hierbas mediterráneas.",
      en: "Chicken thighs sautéed with garlic, white wine and Mediterranean herbs.",
      de: "Hähnchenschenkel mit Knoblauch, Weißwein und mediterranen Kräutern sautiert.",
      fr: "Hauts de cuisse de poulet sautés à l'ail, vin blanc et herbes méditerranéennes.",
    },
    image:
      "https://images.unsplash.com/photo-1625944525567-c0f7c07e3992?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: "lubina-plancha",
    category: "pescado",
    name: "Lubina a la plancha",
    price: 19.9,
    descriptions: {
      es: "Filete de lubina a la plancha con verduritas y salsa de limón.",
      en: "Seabass fillet grilled with veggies and lemon sauce.",
      de: "Gegrilltes Wolfsbarschfilet mit Gemüse und Zitronensauce.",
      fr: "Filet de bar grillé avec légumes et sauce au citron.",
    },
    image:
      "https://images.unsplash.com/photo-1558036117-15d82a90b9b8?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: "pulpo-gallega",
    category: "pescado",
    name: "Pulpo a la gallega",
    price: 18.5,
    descriptions: {
      es: "Pulpo tierno con pimentón, sal en escamas y aceite de oliva sobre cachelos.",
      en: "Tender octopus with paprika, flake salt and olive oil over potatoes.",
      de: "Zarter Oktopus mit Paprika, Flockensalz und Olivenöl auf Kartoffeln.",
      fr: "Poulpe tendre au paprika, sel en flocons et huile d'olive sur pommes de terre.",
    },
    image:
      "https://images.unsplash.com/photo-1625944618284-9b40f13d0a26?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: "tarta-queso",
    category: "postre",
    name: "Tarta de queso",
    price: 6.9,
    descriptions: {
      es: "Tarta cremosa horneada con base de galleta y coulis de frutos rojos.",
      en: "Baked creamy cheesecake with biscuit base and red berry coulis.",
      de: "Gebackener, cremiger Cheesecake mit Keksboden und Beeren-Coulis.",
      fr: "Cheesecake crémeux cuit, base biscuit et coulis de fruits rouges.",
    },
    image:
      "https://images.unsplash.com/photo-1541781286675-09d5f62b52dc?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: "creme-brulee",
    category: "postre",
    name: "Crème brûlée",
    price: 6.5,
    descriptions: {
      es: "Clásica crema de vainilla con crujiente de azúcar caramelizado.",
      en: "Classic vanilla custard with crisp caramelized sugar top.",
      de: "Klassische Vanillecreme mit knuspriger karamellisierter Zuckerschicht.",
      fr: "Classique crème à la vanille avec croûte de sucre caramélisé.",
    },
    image:
      "https://images.unsplash.com/photo-1514511547114-2b3f5f9fcf2e?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: "agua-mineral",
    category: "bebidas",
    name: "Agua mineral",
    price: 2.2,
    descriptions: {
      es: "Agua mineral natural, con o sin gas.",
      en: "Natural mineral water, still or sparkling.",
      de: "Natürliches Mineralwasser, still oder sprudelnd.",
      fr: "Eau minérale naturelle, plate ou gazeuse.",
    },
    image:
      "https://images.unsplash.com/photo-1548839140-29a749e1cf4d?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: "cerveza-artesanal",
    category: "bebidas",
    name: "Cerveza artesanal",
    price: 4.0,
    descriptions: {
      es: "IPA local con notas cítricas y final amargo equilibrado.",
      en: "Local IPA with citrus notes and a balanced bitter finish.",
      de: "Lokales IPA mit Zitrusnoten und ausgewogen bitterem Abgang.",
      fr: "IPA locale aux notes d'agrumes et finale amère équilibrée.",
    },
    image:
      "https://images.unsplash.com/photo-1516455590571-18256e5bb9ff?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: "cafe-espresso",
    category: "bebidas",
    name: "Café espresso",
    price: 1.8,
    descriptions: {
      es: "Café 100% arábica, extracción corta y crema densa.",
      en: "100% arabica coffee, short pull with rich crema.",
      de: "100% Arabica, kurzer Bezug mit dichter Crema.",
      fr: "Café 100% arabica, extraction courte et crema dense.",
    },
    image:
      "https://images.unsplash.com/photo-1503481766315-7a586b20f66b?q=80&w=1200&auto=format&fit=crop",
  },
];

/* ===================== Utilidades ===================== */
function detectDeviceLang(): Lang {
  const supported: Lang[] = ["es", "en", "de", "fr"];
  const pick = (code?: string) => code?.slice(0, 2).toLowerCase();
  const fromNavigator = pick(typeof navigator !== "undefined" ? navigator.language : "");
  if (fromNavigator && supported.includes(fromNavigator as Lang)) return fromNavigator as Lang;
  if (typeof navigator !== "undefined" && Array.isArray((navigator as any).languages)) {
    const match = (navigator as any).languages.map(pick).find((l: string) => supported.includes(l as Lang));
    if (match) return match as Lang;
  }
  return "es";
}

function formatEUR(value: number, locale = "es-ES") {
  return new Intl.NumberFormat(locale, { style: "currency", currency: "EUR" }).format(value);
}

/* ===================== Tarjeta de plato ===================== */
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
  const description = dish.descriptions[lang] || dish.descriptions.en;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onToggle}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onToggle()}
      className="relative group rounded-2xl border border-white/50 bg-white/90 p-4 shadow-sm ring-1 ring-black/5 transition hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
      style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}
    >
      {/* barra de color por categoría */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-0 top-0 h-1 w-full rounded-t-2xl"
        style={{ background: CAT_COLORS[dish.category] }}
      />
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <div className="truncate text-lg font-semibold">{dish.name}</div>
          <div className="mt-1 text-sm text-gray-700">
            {I18N[lang].categories[dish.category]}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="whitespace-nowrap text-base font-semibold">
            {formatEUR(dish.price, LOCALE_BY_LANG[lang])}
          </div>
          <ChevronDown
            className={`h-5 w-5 transition-transform duration-200 ${isOpen ? "rotate-180" : "rotate-0"}`}
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
                  alt={`Foto de ${dish.name}`}
                  className="aspect-video w-full rounded-xl object-cover"
                  loading="lazy"
                />
              </div>
              <p className="leading-relaxed text-gray-800">{description}</p>
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
    () => new Set(["entrantes", "carnes", "pescado", "postre", "bebidas"]) // por defecto todas abiertas
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
    setOpenCats(open ? new Set(["entrantes", "carnes", "pescado", "postre", "bebidas"]) : new Set());
  };

  // orden y agrupado
  const order: Category[] = ["entrantes", "carnes", "pescado", "postre", "bebidas"];
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
      { entrantes: [], carnes: [], pescado: [], postre: [], bebidas: [] }
    );
  }, [dishesSorted]);

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      {/* ===== Fondo con imagen + overlay para legibilidad ===== */}
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
        <img
          src={BG_URL}
          alt=""
         className="absolute inset-0 h-full w-full object-cover"
    style={{ width: "100vw", height: "100vh" }}
    loading="lazy"
        />
        {/* overlay (ajusta opacidad/color a tu gusto) */}
        <div className="absolute inset-0 bg-white/20" />
      </div>

      {/* ===== Contenido ===== */}
      <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6 py-6 sm:py-8">
        {/* Header */}
        <header className="mb-5 sm:mb-8 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
         
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">
              {I18N[lang].menuTitle} Sazón de mi Tierra
            </h1>
            <p className="mt-1 text-sm text-gray-700">{I18N[lang].subtitle}</p>
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
              <span className="text-sm text-gray-700">{I18N[lang].languageLabel}</span>
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

        {/* Secciones por categoría (colapsables) */}
        {order.map((cat) => {
          const items = grouped[cat];
          const isOpen = openCats.has(cat);
          const t = I18N[lang].categories[cat];
          const accent = CAT_COLORS[cat];

          return (
            <section key={cat} className="mb-6">
              {/* Encabezado de categoría */}
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
                  className={`h-5 w-5 text-gray-600 transition-transform duration-200 ${isOpen ? "rotate-180" : "rotate-0"}`}
                  aria-hidden
                />
              </button>

              {/* Contenido de la categoría */}
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
          © {new Date().getFullYear()} — Menú de ejemplo. Edita el array DISHES para personalizarlo.
        </footer>
      </div>
    </div>
  );
}
