import React, { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, Globe } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { DISHES, CAT_COLORS, IMG, slug, Category, Dish, Lang } from "./dishes";

/**
 * DigitalMenu.tsx — versión por secciones del PDF
 * Comida: Starters, Main Dishes, Grill, Dessert
 * Bebidas: Soft drinks, Beers, Waters, Coffee & infusions, Spirits & mixers, Wines
 * - I18N (ES/EN/DE/FR)
 * - Precios múltiples (chupito/copa, medio/entero)
 * - Mobile-first (Tailwind)
 * - "Sticky" robusto con barra fija al hacer scroll dentro de una categoría abierta
 */

const BG_URL = "img/11.png";

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
      glass: "Glass",
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

/* ===================== Logo con texto + SVG ===================== */
function TeideBackdrop({
  color = "rgba(255,255,255,0.30)",
  className = "pointer-events-none absolute left-1/2 w-[92vw] max-w-[860px] h-28 sm:h-40",
  stretchY = 1.4, // 1 = sin cambio; >1 alarga hacia arriba
}: {
  color?: string;
  className?: string;
  stretchY?: number;
}) {
  return (
    <div
      aria-hidden
      className={className}
      style={{
        // Ancla la base y estira hacia arriba
        transformOrigin: "bottom center",
        transform: `translateX(-50%) scaleY(${stretchY})`,

        // Color + silueta
        background: color,
        clipPath:
          "polygon(0% 100%, 6% 82%, 12% 86%, 18% 74%, 24% 78%, 30% 64%, 36% 68%, 42% 56%, 48% 50%, 52% 52%, 58% 46%, 63% 58%, 70% 54%, 78% 66%, 86% 76%, 94% 84%, 100% 100%)",

        filter: "drop-shadow(0 10px 20px rgba(0,0,0,0.12))",
      }}
    />
  );
}



function LogoWordmark({ lang }: { lang: Lang }) {
  const title = "SAZÓN DE MI TIERRA";
  return (
    <div className="relative select-none w-full max-w-[680px] mx-auto">
      {/* Teide (detrás) */}
      <TeideBackdrop color="rgba(00,00,00,0.60)" />

      {/* Texto centrado por delante */}
      <div
        className="relative z-10 uppercase font-extrabold tracking-wide text-white drop-shadow-[0_2px_0_rgba(0,0,0,0.28)] leading-none text-center"
      >
        <span className="inline-block -skew-y-1 text-3xl sm:text-5xl Titulo">
          {title}
        </span>
      </div>

      <h1 className="sr-only">
        {I18N[lang].menuTitle} Sazón de mi Tierra
      </h1>

      {/* Guirnalda decorativa (opcional, sigue delante) */}
      <svg
        className="relative z-10 mt-2 h-7 sm:h-9 w-full text-white"
        viewBox="0 0 640 48"
        fill="none"
        role="img"
        aria-label="ornamento"
      >
        <path
          d="M4 26 C 68 6, 136 42, 200 26 S 328 6, 392 26 S 520 42, 584 26 S 640 6, 700 26"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
        />
        {[40,80,120,160,200,240,280,320,360,400,440,480,520,560].map((x,i)=>(
          <g key={x}>
            <ellipse cx={x} cy={i%2===0?18:34} rx="7" ry="3.2"
              transform={`rotate(${i%2===0?-18:18}, ${x}, ${i%2===0?18:34})`}
              fill="currentColor" />
            <ellipse cx={x+10} cy={i%2===0?34:18} rx="7" ry="3.2"
              transform={`rotate(${i%2===0?18:-18}, ${x+10}, ${i%2===0?34:18})`}
              fill="currentColor" />
          </g>
        ))}
      </svg>
    </div>
  );
}

// Tipado de categorías actuales
type CategoryKey =
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

// Un único componente para todas las formas (SVG puros, sin dependencias)
function CategoryIcon({
  category,
  color = "#111827",
  size = 20,
  className = "",
}: {
  category: CategoryKey;
  color?: string;
  size?: number;
  className?: string;
}) {
  switch (category) {
    case "starters": {
      // Bol/platillo ligero
      return (
        <svg className={className} width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4 11h16a8 8 0 0 1-16 0Z" fill={color} />
          <path d="M7 8h10" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
    }
    case "main": {
      // Cloche (plato principal)
      return (
        <svg className={className} width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4 13h16a8 8 0 0 0-16 0Z" fill={color} />
          <rect x="3" y="13" width="18" height="2.2" rx="1.1" fill={color} />
          <circle cx="12" cy="7.2" r="1.2" fill={color} />
        </svg>
      );
    }
    case "grill": {
      // Llama + parrilla
      return (
        <svg className={className} width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 5c2.2 2 2.6 3.8 1.4 5.6 1.4-.5 2.6-1.8 2.6-3.6 1.8 1.7 2.2 5-1.2 7.2-2.7 1.8-6.2.8-7.4-1.8C6.2 9.6 9 6.7 12 5Z" fill={color}/>
          <path d="M5 17h14M6.5 19h11" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
        </svg>
      );
    }
    case "dessert": {
      // Porción de tarta
      return (
        <svg className={className} width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
          <path d="M3 16l9-7 9 7H3Z" fill={color} />
          <path d="M5 13h14" stroke="white" strokeOpacity="0.7" strokeWidth="1.6" />
          <circle cx="12" cy="7" r="1.6" fill={color} />
        </svg>
      );
    }
    case "drinks-soft": {
      // Refresco: lata + burbujas
      return (
        <svg className={className} width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
          <rect x="8" y="6.5" width="8" height="11" rx="1.6" fill={color}/>
          <path d="M12 5l3-1" stroke={color} strokeWidth="1.6" strokeLinecap="round"/>
          <circle cx="10" cy="11" r="0.9" fill="white" opacity="0.8"/>
          <circle cx="12" cy="13.4" r="0.9" fill="white" opacity="0.8"/>
          <circle cx="14" cy="10.6" r="0.9" fill="white" opacity="0.8"/>
        </svg>
      );
    }
    case "drinks-beer": {
      // Jarra de cerveza con espuma
      return (
        <svg className={className} width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
          <path d="M8 9h7.5a1.5 1.5 0 0 1 1.5 1.5V18a2 2 0 0 1-2 2H10a2 2 0 0 1-2-2V9Z" fill={color}/>
          <rect x="15.5" y="10" width="3" height="5.5" rx="1.3" fill={color}/>
          <path d="M8.5 7.8c.7-1.1 2.3-1.6 3.6-.9.8-.8 2.1-.9 3.1-.2.9-.4 2-.1 2.6.7" stroke={color} strokeWidth="1.6" strokeLinecap="round" fill="none"/>
        </svg>
      );
    }
    case "drinks-water": {
      // Gota de agua
      return (
        <svg className={className} width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 4c3 4 5.5 6.7 5.5 9.3A5.5 5.5 0 1 1 6.5 13.3C6.5 10.7 9 8 12 4Z" fill={color}/>
          <path d="M14.6 13.2c-.5 1.6-2 2.6-3.8 2.5" stroke="white" strokeOpacity="0.7" strokeWidth="1.4" strokeLinecap="round"/>
        </svg>
      );
    }
    case "drinks-coffee": {
      // Taza con vapor
      return (
        <svg className={className} width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
          <path d="M6 10h8.5a3.5 3.5 0 1 1 0 7H9a3 3 0 0 1-3-3v-4Z" fill={color}/>
          <path d="M15.5 12.2h1.6a1.8 1.8 0 1 1 0 3.6H15.5" stroke="white" strokeOpacity="0.85" strokeWidth="1.6" />
          <path d="M9 7.2c.8-.5.9-1.2.5-1.8M11 7.2c.8-.5.9-1.2.5-1.8" stroke={color} strokeWidth="1.6" strokeLinecap="round" fill="none"/>
        </svg>
      );
    }
    case "drinks-liquor": {
      // Vaso corto / chupito
      return (
        <svg className={className} width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
          <path d="M7.5 7h9l-1.8 10.2A2 2 0 0 1 12.8 19h-1.6a2 2 0 0 1-1.9-1.8L7.5 7Z" fill={color}/>
          <path d="M8.2 10h7.6" stroke="white" strokeOpacity="0.7" strokeWidth="1.4"/>
        </svg>
      );
    }
    case "drinks-wine": {
      // Copa de vino
      return (
        <svg className={className} width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
          <path d="M8 6h8v2.5a4 4 0 0 1-4 4 4 4 0 0 1-4-4V6Z" fill={color}/>
          <path d="M12 12.5v5.5M9.5 18h5" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
        </svg>
      );
    }
    default: {
      // Fallback por si en el futuro aparece una categoría no prevista
      return (
        <span
          className={`inline-block rounded-full ${className}`}
          style={{ width: size * 0.7, height: size * 0.7, background: color }}
          aria-hidden
        />
      );
    }
  }
}





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
      className="relative group rounded-2xl border border-white/50 bg-white/85 p-4 shadow-sm ring-1 ring-black/5 transition hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
      style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute left-0 top-0 h-1 w-full rounded-t-2xl"
        style={{ background: CAT_COLORS[dish.category] }}
      />
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <div className="truncate text-lg categorias font-medium">{displayName}</div>
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
    () => new Set([])
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

  // ---------- ORDEN (lo usamos en varias partes) ----------
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

  // ---------- Barra "sticky" robusta (fixed) ----------
  const sectionRefs = useRef<Partial<Record<Category, HTMLElement | null>>>({});
  const [stickyCat, setStickyCat] = useState<Category | null>(null);

  useEffect(() => {
    const handle = () => {
      let candidate: { cat: Category; top: number } | null = null;
      const TOP_OFFSET = 8;   // px desde la parte superior
      const HIDE_AT = 56;     // cuando pasas el final de la sección

      for (const cat of order) {
        if (!openCats.has(cat)) continue;
        const el = sectionRefs.current[cat];
        if (!el) continue;
        const r = el.getBoundingClientRect();
        if (r.top <= TOP_OFFSET && r.bottom > HIDE_AT) {
          if (!candidate || r.top > candidate.top) {
            candidate = { cat, top: r.top };
          }
        }
      }
      setStickyCat(candidate ? candidate.cat : null);
    };

    window.addEventListener("scroll", handle, { passive: true });
    window.addEventListener("resize", handle);
    handle(); // inicial
    return () => {
      window.removeEventListener("scroll", handle);
      window.removeEventListener("resize", handle);
    };
  }, [openCats, order]);

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
    setOpenCats(open ? new Set(order) : new Set());
  };

  // orden y agrupado por categoría
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
          style={{ width: "100vw", height: "100vh", position: "absolute" }}
          loading="lazy"
        />
        <div className="absolute " />
      </div>

      {/* Barra fija "sticky" que aparece cuando una categoría abierta ocupa el top */}
      {stickyCat && (
        <div className="fixed left-0 right-0 top-0 z-40 px-4 sm:px-6">
          <div className="mx-auto max-w-5xl pt-2">
            <button
              onClick={() => toggleCategory(stickyCat)}
              aria-expanded
              className="flex w-full items-center justify-between rounded-xl border border-white/60 bg-white/70 px-4 py-3 shadow-lg backdrop-blur-md"
              style={{
                boxShadow:
                  "0 2px 6px rgba(0,0,0,0.08), 0 6px 20px rgba(0,0,0,0.08)",
              }}
            >
                <div className="flex items-center gap-3">
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-white/00 ring-black/5">
                  <CategoryIcon
                  category={stickyCat as CategoryKey}
                  color={CAT_COLORS[stickyCat]}
                  size={28}
                  className="shrink-0"
                  />
                </div>
                <h2 className="text-base font-semibold text-gray-900 categorias">
                  {I18N[lang].categories[stickyCat]}
                </h2>
                </div>
              <ChevronDown className="h-5 w-5 rotate-180 text-gray-700" />
            </button>
          </div>
        </div>
      )}

      <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6 py-6 sm:py-8">
        {/* Header centrado */}
        <header className="mb-5 sm:mb-8">
          <LogoWordmark lang={lang} />
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2 sm:justify-end">
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

        {/* Secciones por categoría */}
        {order.map((cat) => {
          const items = grouped[cat];
          const isOpen = openCats.has(cat);
          const t = I18N[lang].categories[cat];
          const accent = CAT_COLORS[cat];
          const isDrink =
            cat === "drinks-soft" ||
            cat === "drinks-beer" ||
            cat === "drinks-water" ||
            cat === "drinks-coffee" ||
            cat === "drinks-liquor" ||
            cat === "drinks-wine";

          return (
            <section
              key={cat}
              className="mb-6"
              ref={(el) => (sectionRefs.current[cat] = el)}
            >
              {/* Botón de categoría (desplegable) */}
              <button
                onClick={() => toggleCategory(cat)}
                aria-expanded={isOpen}
                className="group flex w-full items-center justify-between rounded-xl border bg-slate-200/80 border-white/60 px-4 py-3 shadow-sm"
                style={{
                  boxShadow:
                    "0 1px 0 rgba(0,0,0,0.02), 0 4px 12px rgba(0,0,0,0.06)",
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-7 w-7 items-center justify-center rounded-md bg-white/00 ring-black/5">
                    <CategoryIcon category={cat as CategoryKey} color={accent} size={45} className="shrink-0" />
                  </div>

                  <h2 className="text-base font-bold text-black categorias">{t}</h2>
                </div>
                <ChevronDown
                  className={`h-5 w-5 text-gray-600 transition-transform duration-200 ${isOpen ? "rotate-180" : "rotate-0"
                    }`}
                  aria-hidden
                />
              </button>

              {/* Contenido desplegable */}
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
                      {items.map((dish) =>
                        isDrink ? (
                          <div
                            key={dish.id}
                            className="relative group rounded-2xl border border-white/50 bg-white/90 p-4 shadow-sm ring-1 ring-black/5"
                            style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}
                          >
                            {/* Línea de color arriba */}
                            <div
                              aria-hidden
                              className="pointer-events-none absolute left-0 top-0 h-1 w-full rounded-t-2xl"
                              style={{ background: accent }}
                            />
                            <div className="flex items-center justify-between gap-4">
                              <div className="min-w-0">
                                <div className="truncate text-lg categorias">
                                  {dish.i18nNames?.[lang] ?? dish.name}
                                </div>
                                <div className="mt-1 text-sm text-gray-700">
                                  {I18N[lang].categories[dish.category]}
                                </div>
                              </div>
                              <div className="flex flex-col items-end gap-1">
                                {/* Precio único */}
                                {dish.price != null && (
                                  <div className="whitespace-nowrap text-base font-semibold">
                                    {formatEUR(dish.price, LOCALE_BY_LANG[lang])}
                                  </div>
                                )}
                                {/* Precio chupito */}
                                {dish.priceShot != null && (
                                  <div className="text-xs text-gray-700">
                                    {I18N[lang].priceLabels.shot}:{" "}
                                    <span className="font-semibold">
                                      {formatEUR(dish.priceShot, LOCALE_BY_LANG[lang])}
                                    </span>
                                  </div>
                                )}
                                {/* Precio copa */}
                                {dish.priceGlass != null && (
                                  <div className="text-xs text-gray-700">
                                    {I18N[lang].priceLabels.glass}:{" "}
                                    <span className="font-semibold">
                                      {formatEUR(dish.priceGlass, LOCALE_BY_LANG[lang])}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <DishCard
                            key={dish.id}
                            dish={dish}
                            lang={lang}
                            isOpen={openCards.has(dish.id)}
                            onToggle={() => toggleCard(dish.id)}
                          />
                        )
                      )}
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
