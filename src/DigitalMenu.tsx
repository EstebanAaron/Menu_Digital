import React, { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, Globe } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { DISHES, CAT_COLORS, Category, Dish, Lang } from "./dishes";

/**
 * DigitalMenu.tsx — secciones del menú
 * - I18N (ES/EN/DE/FR)
 * - Precios múltiples (chupito/copa, medio/entero)
 * - Mobile-first (Tailwind)
 * - Fondo global: vertical en móvil / horizontal en escritorio o landscape
 * - Header: imagen del Teide con tinte de color (sin polígonos)
 */

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
    subtitle: "Toca un plato o una categoría para ver la imagen y los ingredientes.",
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
    priceLabels: { shot: "Chupito", glass: "Copa", halfChicken: "1/2 pollo", wholeChicken: "Pollo entero" },
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
    priceLabels: { shot: "Shot", glass: "Glass", halfChicken: "Half chicken", wholeChicken: "Whole chicken" },
  },
  de: {
    menuTitle: "Menü",
    subtitle: "Tippe auf ein Gericht oder eine Kategorie für Foto und Zutaten.",
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
    priceLabels: { shot: "Shot", glass: "Longdrink", halfChicken: "Halbes Hähnchen", wholeChicken: "Ganzes Hähnchen" },
  },
  fr: {
    menuTitle: "Menu",
    subtitle: "Touchez un plat ou une catégorie pour voir la photo et les ingrédients.",
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
    priceLabels: { shot: "Shooter", glass: "Verre", halfChicken: "Demi-poulet", wholeChicken: "Poulet entier" },
  },
};

/* ===================== Header: Teide con tinte ===================== */
/** Imagen del Teide con tinte por mezcla (conserva sombras del PNG). */
function TeideTinted({
  src = "img/teide.png",
  // tint/opacity quedan por compatibilidad, pero no se renderiza overlay si opacity <= 0
  tint = "#111827",
  opacity = 0.,
  className = "absolute left-1/2 w-[100vw] max-w-[860px] h-40 sm:h-40 -top-0 sm:-top-5 z-[-1]",
}: {
  src?: string;
  tint?: string;
  opacity?: number;
  className?: string;
}) {
  return (
    <div
      aria-hidden
      // z-0 garantiza que queda detrás; pointer-events-none evita clicks
      className={`pointer-events-none -translate-x-1/2 z-0 ${className}`}
    >
      <img
        src={src}
        alt=""
        className="absolute inset-0 h-full w-full object-contain drop-shadow-md"
        loading="lazy"
      />
      {/* No pintamos overlay si opacity es 0 */}
      {opacity > 0 && (
        <div
          className="absolute inset-0"
          style={{ background: tint, mixBlendMode: "multiply", opacity }}
        />
      )}
    </div>
  );
}

function LogoWordmark({ lang }: { lang: Lang }) {
  const title = "SAZÓN DE MI TIERRA";
  return (
    <div className="relative select-none w-full max-w-[680px] mx-auto  ">
      {/* Teide detrás del texto */}
      <TeideTinted
        // si quieres moverlo un poco hacia abajo usa, por ejemplo: className="absolute left-1/2 w-[92vw] max-w-[860px] h-28 sm:h-40 top-2 sm:-top-6"
        opacity={0} // sin tinte
      />

      {/* Texto delante */}
      <div className="relative z-10 uppercase font-extrabold tracking-wide text-white drop-shadow-[0_2px_0_rgba(0,0,0,0.28)] leading-none text-center ">
        <span className="inline-block -skew-y-1 text-4xl sm:text-5xl Titulo ">
          {title}
        </span>
      </div>

      <h1 className="sr-only">{I18N[lang].menuTitle} Sazón de mi Tierra</h1>

      {/* Guirnalda */}
      <svg
        className="relative z-10 mt-2 h-7 sm:h-9 w-full text-white/0"
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


/* ===================== Iconos de categorías (usa el tipo Category) ===================== */
function CategoryIcon({
  category,
  color = "#111827",
  size = 20,
  className = "",
}: {
  category: Category;
  color?: string;
  size?: number;
  className?: string;
}) {
  switch (category) {
    case "starters":
      return (
        <svg className={className} width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4 11h16a8 8 0 0 1-16 0Z" fill={color} />
          <path d="M7 8h10" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
    case "main":
      return (
        <svg className={className} width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4 13h16a8 8 0 0 0-16 0Z" fill={color} />
          <rect x="3" y="13" width="18" height="2.2" rx="1.1" fill={color} />
          <circle cx="12" cy="7.2" r="1.2" fill={color} />
        </svg>
      );
    case "grill":
      return (
        <svg className={className} width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 5c2.2 2 2.6 3.8 1.4 5.6 1.4-.5 2.6-1.8 2.6-3.6 1.8 1.7 2.2 5-1.2 7.2-2.7 1.8-6.2.8-7.4-1.8C6.2 9.6 9 6.7 12 5Z" fill={color} />
          <path d="M5 17h14M6.5 19h11" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
    case "dessert":
      return (
        <svg className={className} width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
          <path d="M3 16l9-7 9 7H3Z" fill={color} />
          <path d="M5 13h14" stroke="white" strokeOpacity="0.7" strokeWidth="1.6" />
          <circle cx="12" cy="7" r="1.6" fill={color} />
        </svg>
      );
    case "drinks-soft":
      return (
        <svg className={className} width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
          <rect x="8" y="6.5" width="8" height="11" rx="1.6" fill={color} />
          <path d="M12 5l3-1" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
          <circle cx="10" cy="11" r="0.9" fill="white" opacity="0.8" />
          <circle cx="12" cy="13.4" r="0.9" fill="white" opacity={0.8} />
          <circle cx="14" cy="10.6" r="0.9" fill="white" opacity={0.8} />
        </svg>
      );
    case "drinks-beer":
      return (
        <svg className={className} width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
          <path d="M8 9h7.5a1.5 1.5 0 0 1 1.5 1.5V18a2 2 0 0 1-2 2H10a2 2 0 0 1-2-2V9Z" fill={color} />
          <rect x="15.5" y="10" width="3" height="5.5" rx="1.3" fill={color} />
          <path d="M8.5 7.8c.7-1.1 2.3-1.6 3.6-.9.8-.8 2.1-.9 3.1-.2.9-.4 2-.1 2.6.7" stroke={color} strokeWidth="1.6" strokeLinecap="round" fill="none" />
        </svg>
      );
    case "drinks-water":
      return (
        <svg className={className} width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 4c3 4 5.5 6.7 5.5 9.3A5.5 5.5 0 1 1 6.5 13.3C6.5 10.7 9 8 12 4Z" fill={color} />
          <path d="M14.6 13.2c-.5 1.6-2 2.6-3.8 2.5" stroke="white" strokeOpacity="0.7" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      );
    case "drinks-coffee":
      return (
        <svg className={className} width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
          <path d="M6 10h8.5a3.5 3.5 0 1 1 0 7H9a3 3 0 0 1-3-3v-4Z" fill={color} />
          <path d="M15.5 12.2h1.6a1.8 1.8 0 1 1 0 3.6H15.5" stroke="white" strokeOpacity="0.85" strokeWidth="1.6" />
          <path d="M9 7.2c.8-.5.9-1.2.5-1.8M11 7.2c.8-.5.9-1.2.5-1.8" stroke={color} strokeWidth="1.6" strokeLinecap="round" fill="none" />
        </svg>
      );
    case "drinks-liquor":
      return (
        <svg className={className} width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
          <path d="M7.5 7h9l-1.8 10.2A2 2 0 0 1 12.8 19h-1.6a2 2 0 0 1-1.9-1.8L7.5 7Z" fill={color} />
          <path d="M8.2 10h7.6" stroke="white" strokeOpacity="0.7" strokeWidth="1.4" />
        </svg>
      );
    case "drinks-wine":
      return (
        <svg className={className} width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
          <path d="M8 6h8v2.5a4 4 0 0 1-4 4 4 4 0 0 1-4-4V6Z" fill={color} />
          <path d="M12 12.5v5.5M9.5 18h5" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
    default:
      return <span className={`inline-block rounded-full ${className}`} style={{ width: size * 0.7, height: size * 0.7, background: color }} aria-hidden />;
  }
}


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

function formatEUR(value?: number | null, locale = "es-ES") {
  if (value === null || value === undefined || Number.isNaN(value)) return "";
  return new Intl.NumberFormat(locale, { style: "currency", currency: "EUR" }).format(value);
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
  const displayName = dish.i18nNames?.[lang] ?? dish.name;
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
                <p className="leading-relaxed text-gray-800">{description}</p>

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
  const [openCats, setOpenCats] = useState<Set<Category>>(() => new Set([]));
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

  // ---------- Barra "sticky" ----------
  const sectionRefs = useRef<Partial<Record<Category, HTMLElement | null>>>({});
  const [stickyCat, setStickyCat] = useState<Category | null>(null);

  useEffect(() => {
    const handle = () => {
      let candidate: { cat: Category; top: number } | null = null;
      const TOP_OFFSET = 8;
      const HIDE_AT = 56;

      for (const cat of order) {
        if (!openCats.has(cat)) continue;
        const el = sectionRefs.current[cat];
        if (!el) continue;
        const r = el.getBoundingClientRect();
        if (r.top <= TOP_OFFSET && r.bottom > HIDE_AT) {
          if (!candidate || r.top > candidate.top) candidate = { cat, top: r.top };
        }
      }
      setStickyCat(candidate ? candidate.cat : null);
    };

    window.addEventListener("scroll", handle, { passive: true });
    window.addEventListener("resize", handle);
    handle();
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

  // orden y agrupado
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
      {/* ===== Fondo global: horizontal en escritorio/landscape, vertical por defecto ===== */}
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
        <picture>
          {/* escritorio o landscape */}
          <source srcSet="img/horizontal.png" media="(min-aspect-ratio: 4/3)" />
          <source srcSet="img/horizontal.png" media="(orientation: landscape)" />
          {/* móvil / vertical */}
          <img
            src="img/11.png"
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
            loading="lazy"
          />
        </picture>
        {/* overlay para legibilidad */}
        <div className="absolute inset-0 bg-white/14" />
      </div>

      {/* Barra fija "sticky" */}
      {stickyCat && (
        <div className="fixed left-0 right-0 top-0 z-40 px-4 sm:px-6">
          <div className="mx-auto max-w-5xl pt-2">
            <button
              onClick={() => toggleCategory(stickyCat)}
              aria-expanded={true}
              className="flex w-full items-center justify-between rounded-xl border border-white/60 bg-white/70 px-4 py-3 shadow-lg backdrop-blur-md"
              style={{
                boxShadow: "0 2px 6px rgba(0,0,0,0.08), 0 6px 20px rgba(0,0,0,0.08)",
              }}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-7 w-7 items-center justify-center rounded-md">
                  <CategoryIcon
                    category={stickyCat}
                    color={CAT_COLORS[stickyCat]}
                    size={40}
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
        {/* Header */}
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
            <section key={cat} className="mb-6" ref={(el) => (sectionRefs.current[cat] = el)}>
              <button
                onClick={() => toggleCategory(cat)}
                aria-expanded={isOpen}
                className="group flex w-full items-center justify-between rounded-xl border bg-slate-200/80 border-white/60 px-4 py-3 shadow-sm"
                style={{
                  boxShadow: "0 1px 0 rgba(0,0,0,0.02), 0 4px 12px rgba(0,0,0,0.06)",
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-7 w-7 items-center justify-center rounded-md">
                    <CategoryIcon category={cat} color={accent} size={45} className="shrink-0" />
                  </div>
                  <h2 className="text-base font-bold text-black categorias">{t}</h2>
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
                      {items.map((dish) =>
                        isDrink ? (
                          <div
                            key={dish.id}
                            className="relative group rounded-2xl border border-white/50 bg-white/90 p-4 shadow-sm ring-1 ring-black/5"
                            style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}
                          >
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
                                {dish.price != null && (
                                  <div className="whitespace-nowrap text-base font-semibold">
                                    {formatEUR(dish.price, LOCALE_BY_LANG[lang])}
                                  </div>
                                )}
                                {dish.priceShot != null && (
                                  <div className="text-xs text-gray-700">
                                    {I18N[lang].priceLabels.shot}:{" "}
                                    <span className="font-semibold">
                                      {formatEUR(dish.priceShot, LOCALE_BY_LANG[lang])}
                                    </span>
                                  </div>
                                )}
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

        <footer className="mt-8 text-center text-xs text-gray-600 flex flex-col items-center gap-2">
          <div className="flex justify-center gap-4 mb-1">
            {/* Instagram */}
            <a
              href="https://www.instagram.com/_sazondemitierra_/?hl=es"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="inline-block hover:scale-110 transition"
            >
              <svg width="26" height="26" fill="none" viewBox="0 0 24 24">
                <rect width="20" height="20" x="2" y="2" rx="6" stroke="#E1306C" strokeWidth="2" fill="none"/>
                <circle cx="12" cy="12" r="5" stroke="#E1306C" strokeWidth="2" fill="none"/>
                <circle cx="17" cy="7" r="1.2" fill="#E1306C"/>
              </svg>
            </a>
            {/* Google Reviews */}
            <a
              href="https://www.google.com/search?rlz=1C1UEAD_esES1165ES1165&uds=AOm0WdE2fekQnsyfYEw8JPYozOKzXE_DI4AHiyV3_85Iokg0xyxPlXh9OhClyEqQrpoorPvXLWiAZzwGybB3QU-UerVrSgb2XTsRSwVTjeD8QvfCFAhCgMxTsMz04uTOAf5lgxeCqrOsd00s9-eqNBnKz08jqlo-rg&q=Saz%C3%B3n%20De%20Mi%20Tierra%20Rese%C3%B1as&si=AMgyJEtREmoPL4P1I5IDCfuA8gybfVI2d5Uj7QMwYCZHKDZ-EzAU5VEI037mbYR_z3CD-mg5JQyrhbQG5gv5WrflcwE-xcOuBAmACfaeT7aWmhpezqfpGvHhDeQGYtIBUOpyYGzGCj4MKPO1NjV6Ocx9fJICeeWmWg%3D%3D&cs=1&hl=es&sa=X&ved=0CBEQ_4MLahcKEwjYlpDls--PAxUAAAAAHQAAAAAQDg&biw=1920&bih=953&dpr=1" // Pon aquí tu enlace directo a los comentarios de Google
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Google Reviews"
              className="inline-block hover:scale-110 transition"
            >
              <svg width="26" height="26" viewBox="0 0 48 48">
        <g>
          <path fill="#4285F4" d="M43.6 20.5H42V20.4H24v7.2h11.2c-1.5 4-5.2 6.8-9.2 6.8-5.5 0-10-4.5-10-10s4.5-10 10-10c2.4 0 4.6.9 6.3 2.3l5.4-5.4C34.6 8.1 29.6 6 24 6 13.5 6 5 14.5 5 25s8.5 19 19 19c9.5 0 18-7.5 18-19 0-1.3-.1-2.7-.4-4z"/>
          <path fill="#34A853" d="M6.3 14.7l5.9 4.3C14.1 16.1 18.7 13 24 13c2.4 0 4.6.9 6.3 2.3l5.4-5.4C34.6 8.1 29.6 6 24 6c-7.2 0-13.4 4-17 8.7z"/>
          <path fill="#FBBC05" d="M24 44c5.3 0 10.3-1.8 14.1-4.9l-6.5-5.3c-2 1.4-4.5 2.2-7.6 2.2-4 0-7.7-2.7-9.2-6.7l-6.4 5c3.6 4.7 9.8 9.7 15.6 9.7z"/>
          <path fill="#EA4335" d="M43.6 20.5H42V20.4H24v7.2h11.2c-.6 1.7-1.7 3.2-3.1 4.3l6.5 5.3c1.9-1.8 3.4-4.3 4-7.1.3-1.3.4-2.7.4-4 0-1.3-.1-2.7-.4-4z"/>
        </g>
      </svg>
            </a>
          </div>
          <span>
            © {new Date().getFullYear()} — Menú Sazón de mi Tierra.
          </span>
        </footer>
      </div>
    </div>
  );
}
