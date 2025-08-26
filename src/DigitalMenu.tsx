import React, { useEffect, useMemo, useState } from "react";
import { ChevronDown, Globe } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

// ===== Tipos =====
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

// ===== I18N =====
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
  }
> = {
  es: {
    menuTitle: "Menú",
    subtitle: "Toca un plato para ver la descripción e imagen.",
    languageLabel: "Idioma",
    categories: {
      entrantes: "Entrantes",
      carnes: "Carnes",
      pescado: "Pescado",
      postre: "Postre",
      bebidas: "Bebidas",
    },
  },
  en: {
    menuTitle: "Menu",
    subtitle: "Tap a dish to see the description and photo.",
    languageLabel: "Language",
    categories: {
      entrantes: "Starters",
      carnes: "Meats",
      pescado: "Fish",
      postre: "Dessert",
      bebidas: "Drinks",
    },
  },
  de: {
    menuTitle: "Menü",
    subtitle: "Tippe auf ein Gericht, um Beschreibung und Foto zu sehen.",
    languageLabel: "Sprache",
    categories: {
      entrantes: "Vorspeisen",
      carnes: "Fleisch",
      pescado: "Fisch",
      postre: "Dessert",
      bebidas: "Getränke",
    },
  },
  fr: {
    menuTitle: "Menu",
    subtitle: "Touchez un plat pour voir la description et la photo.",
    languageLabel: "Langue",
    categories: {
      entrantes: "Entrées",
      carnes: "Viandes",
      pescado: "Poisson",
      postre: "Dessert",
      bebidas: "Boissons",
    },
  },
};

// ===== Datos (ejemplo) =====
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
      "https://images.unsplash.com/photo-1617191518009-6e7d36e9fe2e?q=80&w=1400&auto=format&fit=crop",
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
      "https://images.unsplash.com/photo-1551183053-bf91a1d81141?q=80&w=1400&auto=format&fit=crop",
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
      "https://images.unsplash.com/photo-1604908812837-0b6f64b2c329?q=80&w=1400&auto=format&fit=crop",
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
      "https://images.unsplash.com/photo-1625944525567-c0f7c07e3992?q=80&w=1400&auto=format&fit=crop",
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
      "https://images.unsplash.com/photo-1558036117-15d82a90b9b8?q=80&w=1400&auto=format&fit=crop",
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
      "https://images.unsplash.com/photo-1625944618284-9b40f13d0a26?q=80&w=1400&auto=format&fit=crop",
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
      "https://images.unsplash.com/photo-1541781286675-09d5f62b52dc?q=80&w=1400&auto=format&fit=crop",
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
      "https://images.unsplash.com/photo-1514511547114-2b3f5f9fcf2e?q=80&w=1400&auto=format&fit=crop",
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
      "https://images.unsplash.com/photo-1548839140-29a749e1cf4d?q=80&w=1400&auto=format&fit=crop",
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
      "https://images.unsplash.com/photo-1516455590571-18256e5bb9ff?q=80&w=1400&auto=format&fit=crop",
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
      "https://images.unsplash.com/photo-1503481766315-7a586b20f66b?q=80&w=1400&auto=format&fit=crop",
  },
];

// ===== Utilidades =====
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

// ===== Subcomponentes =====
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
      className="group rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
    >
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <div className="truncate text-lg font-semibold">{dish.name}</div>
          <div className="mt-1 text-sm text-gray-500">{I18N[lang].categories[dish.category]}</div>
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
              <p className="leading-relaxed text-gray-700">{description}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ===== Componente principal =====
export default function DigitalMenu() {
  const [open, setOpen] = useState<Set<string>>(new Set());
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

  const toggle = (id: string) => {
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // ordenamos por categoría y nombre
  const dishesSorted = useMemo(
    () =>
      [...DISHES].sort((a, b) => {
        if (a.category === b.category) return a.name.localeCompare(b.name);
        const order: Category[] = ["entrantes", "carnes", "pescado", "postre", "bebidas"];
        return order.indexOf(a.category) - order.indexOf(b.category);
      }),
    []
  );

  // agrupamos por categoría
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
    <div className="relative min-h-screen overflow-hidden">
      {/* ===== Fondo de banderas ===== */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        {/* Canarias (arriba): blanco - azul - amarillo, franjas verticales */}
        <div
          className="absolute inset-x-0 top-0 h-1/2"
          style={{
            background:
              "linear-gradient(to right, #ffffff 0 33.33%, #0057B8 33.33% 66.66%, #FCD116 66.66% 100%)",
          }}
        />
        {/* Colombia (abajo): amarillo 50%, azul 25%, rojo 25%, franjas horizontales */}
        <div
          className="absolute inset-x-0 bottom-0 h-1/2"
          style={{
            background:
              "linear-gradient(to bottom, #FCD116 0 50%, #003893 50% 75%, #CE1126 75% 100%)",
          }}
        />
      </div>

      {/* Overlay para legibilidad */}
      <div className="absolute inset-0 -z-0 bg-white/65 backdrop-blur-[2px]" />

      {/* ===== Contenido ===== */}
      <div className="relative z-10 mx-auto max-w-5xl p-6">
        <header className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{I18N[lang].menuTitle}</h1>
            <p className="mt-1 text-sm text-gray-500">{I18N[lang].subtitle}</p>
          </div>

          <label className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 shadow-sm">
            <Globe className="h-4 w-4" aria-hidden />
            <span className="text-sm text-gray-600">{I18N[lang].languageLabel}</span>
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
        </header>

        {Object.entries(grouped).map(([cat, items]) => (
          <section key={cat} className="mb-8">
            <h2 className="mb-4 text-xl font-semibold text-gray-800">
              {I18N[lang].categories[cat as Category]}
            </h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {items.map((dish) => (
                <DishCard
                  key={dish.id}
                  dish={dish}
                  lang={lang}
                  isOpen={open.has(dish.id)}
                  onToggle={() => toggle(dish.id)}
                />
              ))}
            </div>
          </section>
        ))}

        <footer className="mt-10 text-center text-xs text-gray-400">
          © {new Date().getFullYear()} — Ejemplo de menú digital. Edita el array DISHES para personalizarlo.
        </footer>
      </div>
    </div>
  );
}
