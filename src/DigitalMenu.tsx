import React, { useEffect, useMemo, useState } from "react";
import { ChevronDown, Globe } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { DISHES, CAT_COLORS, IMG, slug, Category, Dish, Lang } from "./dishes";

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
        // por defecto todas cerradas
      ])
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
              {/* BOTÓN STICKY directamente:
                  - Solo cuando la categoría está abierta
                  - Queda pegado al top del viewport
                  - Blur + sombra para legibilidad */}
              <button
                onClick={() => toggleCategory(cat)}
                aria-expanded={isOpen}
                className={`group flex w-full items-center justify-between rounded-xl border border-white/60 bg-white/90 px-4 py-3 shadow-sm hover:bg-white backdrop-blur-md ${
                  isOpen ? "sticky top-0 z-30" : ""
                }`}
                style={{
                  boxShadow:
                    "0 1px 0 rgba(0,0,0,0.02), 0 4px 12px rgba(0,0,0,0.06)",
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
          © {new Date().getFullYear()} — Menú Sazón de mi Tierra.
        </footer>
      </div>
    </div>
  );
}
