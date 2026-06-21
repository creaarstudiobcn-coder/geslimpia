// Datos de municipios de la provincia de Barcelona para las páginas SEO locales.
// Cada municipio lleva datos reales (comarca, barrios/zonas, municipios cercanos)
// que se usan para generar contenido DIFERENCIADO por página (evita el contenido
// duplicado que Google penaliza). El lenguaje es honesto: "limpiadoras de la zona y
// alrededores", sin inventar cifras de disponibilidad.

export type Municipio = {
  slug: string;
  nombre: string;
  comarca: string;
  // Descriptor honesto de tamaño (no una cifra de limpiadoras disponibles).
  tamano: string;
  // Barrios / zonas reales del municipio.
  barrios: string[];
  // Slugs de municipios cercanos para enlazado interno (deben existir en la lista).
  cercanos: string[];
};

export const MUNICIPIOS: Municipio[] = [
  // --- Barcelonès ---
  {
    slug: "barcelona",
    nombre: "Barcelona",
    comarca: "Barcelonès",
    tamano: "la ciudad más grande de Cataluña, con más de 1,6 millones de habitantes",
    barrios: ["Eixample", "Ciutat Vella", "Gràcia", "Sants-Montjuïc", "Sant Martí", "Sarrià-Sant Gervasi", "Les Corts", "Horta-Guinardó", "Nou Barris", "Sant Andreu"],
    cercanos: ["hospitalet-de-llobregat", "badalona", "santa-coloma-de-gramenet", "sant-adria-de-besos", "esplugues-de-llobregat"],
  },
  {
    slug: "hospitalet-de-llobregat",
    nombre: "L'Hospitalet de Llobregat",
    comarca: "Barcelonès",
    tamano: "la segunda ciudad más poblada de Cataluña, con más de 265.000 habitantes",
    barrios: ["Centre", "Collblanc", "La Torrassa", "Santa Eulàlia", "Bellvitge", "Sant Josep", "Can Serra", "La Florida", "Pubilla Cases"],
    cercanos: ["barcelona", "cornella-de-llobregat", "esplugues-de-llobregat", "el-prat-de-llobregat"],
  },
  {
    slug: "badalona",
    nombre: "Badalona",
    comarca: "Barcelonès",
    tamano: "una de las mayores ciudades del área metropolitana, con más de 220.000 habitantes",
    barrios: ["Centre", "Llefià", "La Salut", "Sant Roc", "Gorg", "Lloreda", "Bufalà", "Canyet", "Montigalà"],
    cercanos: ["santa-coloma-de-gramenet", "sant-adria-de-besos", "barcelona", "montcada-i-reixac"],
  },
  {
    slug: "santa-coloma-de-gramenet",
    nombre: "Santa Coloma de Gramenet",
    comarca: "Barcelonès",
    tamano: "una ciudad densa y muy bien comunicada, con más de 120.000 habitantes",
    barrios: ["Centre", "Fondo", "Singuerlín", "Riu", "Llatí", "Safaretjos", "Raval"],
    cercanos: ["badalona", "sant-adria-de-besos", "barcelona", "montcada-i-reixac"],
  },
  {
    slug: "sant-adria-de-besos",
    nombre: "Sant Adrià de Besòs",
    comarca: "Barcelonès",
    tamano: "un municipio costero del área metropolitana, con unos 37.000 habitantes",
    barrios: ["La Mina", "Sant Joan Baptista", "Besòs", "La Catalana", "El Litoral"],
    cercanos: ["badalona", "santa-coloma-de-gramenet", "barcelona"],
  },
  // --- Baix Llobregat ---
  {
    slug: "cornella-de-llobregat",
    nombre: "Cornellà de Llobregat",
    comarca: "Baix Llobregat",
    tamano: "una ciudad industrial y de servicios, con más de 88.000 habitantes",
    barrios: ["Centre", "Almeda", "Sant Ildefons", "Gavarra", "Riera", "Fontsanta"],
    cercanos: ["hospitalet-de-llobregat", "esplugues-de-llobregat", "sant-boi-de-llobregat", "sant-joan-despi"],
  },
  {
    slug: "sant-boi-de-llobregat",
    nombre: "Sant Boi de Llobregat",
    comarca: "Baix Llobregat",
    tamano: "uno de los municipios más extensos del Baix Llobregat, con más de 83.000 habitantes",
    barrios: ["Marianao", "Vinyets", "Camps Blancs", "Casablanca", "Ciutat Cooperativa", "Centre"],
    cercanos: ["cornella-de-llobregat", "el-prat-de-llobregat", "viladecans", "sant-joan-despi"],
  },
  {
    slug: "el-prat-de-llobregat",
    nombre: "El Prat de Llobregat",
    comarca: "Baix Llobregat",
    tamano: "una ciudad junto al aeropuerto y el delta, con más de 65.000 habitantes",
    barrios: ["Centre", "Sant Cosme", "La Seda", "Les Palmeres", "Sant Jordi"],
    cercanos: ["hospitalet-de-llobregat", "cornella-de-llobregat", "sant-boi-de-llobregat", "viladecans"],
  },
  {
    slug: "viladecans",
    nombre: "Viladecans",
    comarca: "Baix Llobregat",
    tamano: "un municipio en crecimiento del delta del Llobregat, con más de 67.000 habitantes",
    barrios: ["Centre", "Montserratina", "Sales", "Alba-Rosa", "Can Palmer"],
    cercanos: ["gava", "sant-boi-de-llobregat", "castelldefels", "el-prat-de-llobregat"],
  },
  {
    slug: "castelldefels",
    nombre: "Castelldefels",
    comarca: "Baix Llobregat",
    tamano: "una ciudad costera con mucha vivienda unifamiliar, con más de 70.000 habitantes",
    barrios: ["Centre", "Vista Alegre", "Poal", "Castelldefels Platja", "Montmar", "Can Roca"],
    cercanos: ["gava", "viladecans", "sant-boi-de-llobregat"],
  },
  {
    slug: "gava",
    nombre: "Gavà",
    comarca: "Baix Llobregat",
    tamano: "un municipio entre el mar y el Garraf, con más de 47.000 habitantes",
    barrios: ["Centre", "Gavà Mar", "Can Tries", "Ponent", "Les Bòbiles"],
    cercanos: ["castelldefels", "viladecans", "sant-boi-de-llobregat"],
  },
  {
    slug: "esplugues-de-llobregat",
    nombre: "Esplugues de Llobregat",
    comarca: "Baix Llobregat",
    tamano: "un municipio pegado a Barcelona, con más de 46.000 habitantes",
    barrios: ["Centre", "Can Vidalet", "La Plana", "Finestrelles", "El Gall"],
    cercanos: ["hospitalet-de-llobregat", "cornella-de-llobregat", "sant-feliu-de-llobregat", "barcelona"],
  },
  {
    slug: "sant-feliu-de-llobregat",
    nombre: "Sant Feliu de Llobregat",
    comarca: "Baix Llobregat",
    tamano: "la capital comarcal del Baix Llobregat, con más de 45.000 habitantes",
    barrios: ["Centre", "La Salut", "Mas Lluí", "Can Maginàs", "El Pla"],
    cercanos: ["sant-joan-despi", "molins-de-rei", "esplugues-de-llobregat", "cornella-de-llobregat"],
  },
  {
    slug: "sant-joan-despi",
    nombre: "Sant Joan Despí",
    comarca: "Baix Llobregat",
    tamano: "un municipio residencial muy bien conectado, con más de 34.000 habitantes",
    barrios: ["Centre", "Les Planes", "Torreblanca", "Eixample", "Pla del Vent"],
    cercanos: ["cornella-de-llobregat", "sant-feliu-de-llobregat", "esplugues-de-llobregat", "molins-de-rei"],
  },
  {
    slug: "molins-de-rei",
    nombre: "Molins de Rei",
    comarca: "Baix Llobregat",
    tamano: "un municipio con mucho comercio de proximidad, con más de 26.000 habitantes",
    barrios: ["Centre", "La Granja", "El Canal", "Riera Bonet", "Bonavista"],
    cercanos: ["sant-feliu-de-llobregat", "sant-joan-despi", "esplugues-de-llobregat"],
  },
  // --- Vallès Occidental ---
  {
    slug: "terrassa",
    nombre: "Terrassa",
    comarca: "Vallès Occidental",
    tamano: "una de las grandes capitales del Vallès, con más de 225.000 habitantes",
    barrios: ["Centre", "Ca n'Aurell", "Sant Pere", "Can Palet", "Les Fonts", "Sant Llorenç", "Egara", "Can Boada"],
    cercanos: ["sabadell", "rubi", "sant-cugat-del-valles"],
  },
  {
    slug: "sabadell",
    nombre: "Sabadell",
    comarca: "Vallès Occidental",
    tamano: "co-capital del Vallès Occidental, con más de 215.000 habitantes",
    barrios: ["Centre", "Gràcia", "Ca n'Oriac", "La Creu Alta", "Sant Oleguer", "Covadonga", "Can Rull", "Torre-romeu"],
    cercanos: ["terrassa", "barbera-del-valles", "cerdanyola-del-valles", "sant-cugat-del-valles"],
  },
  {
    slug: "rubi",
    nombre: "Rubí",
    comarca: "Vallès Occidental",
    tamano: "un municipio industrial en expansión, con más de 78.000 habitantes",
    barrios: ["Centre", "Les Torres", "Ca n'Oriol", "El Pinar", "Sant Genís", "Castellnou"],
    cercanos: ["terrassa", "sant-cugat-del-valles", "sabadell", "cerdanyola-del-valles"],
  },
  {
    slug: "cerdanyola-del-valles",
    nombre: "Cerdanyola del Vallès",
    comarca: "Vallès Occidental",
    tamano: "ciudad universitaria junto a la UAB, con más de 57.000 habitantes",
    barrios: ["Centre", "Serraperera", "Fontetes", "Banús", "Bellaterra", "Les Fontetes"],
    cercanos: ["sabadell", "barbera-del-valles", "ripollet", "sant-cugat-del-valles"],
  },
  {
    slug: "sant-cugat-del-valles",
    nombre: "Sant Cugat del Vallès",
    comarca: "Vallès Occidental",
    tamano: "uno de los municipios con mayor renta de Cataluña, con más de 92.000 habitantes",
    barrios: ["Centre", "Mira-sol", "La Floresta", "Valldoreix", "Les Planes", "Volpelleres"],
    cercanos: ["rubi", "cerdanyola-del-valles", "barcelona", "terrassa"],
  },
  {
    slug: "barbera-del-valles",
    nombre: "Barberà del Vallès",
    comarca: "Vallès Occidental",
    tamano: "un municipio industrial muy bien comunicado, con más de 33.000 habitantes",
    barrios: ["Centre", "Can Llobet", "La Romànica", "Ronda", "Bosc"],
    cercanos: ["sabadell", "cerdanyola-del-valles", "ripollet"],
  },
  {
    slug: "ripollet",
    nombre: "Ripollet",
    comarca: "Vallès Occidental",
    tamano: "un municipio compacto del Vallès, con más de 39.000 habitantes",
    barrios: ["Centre", "Can Mas", "Pont Vell", "Tiana", "Sant Andreu"],
    cercanos: ["cerdanyola-del-valles", "barbera-del-valles", "montcada-i-reixac", "sabadell"],
  },
  {
    slug: "montcada-i-reixac",
    nombre: "Montcada i Reixac",
    comarca: "Vallès Occidental",
    tamano: "un municipio repartido en varios núcleos, con más de 37.000 habitantes",
    barrios: ["Centre", "Can Sant Joan", "Mas Rampinyo", "Terra Nostra", "La Ribera", "Montcada Nova"],
    cercanos: ["ripollet", "cerdanyola-del-valles", "barcelona", "badalona"],
  },
  // --- Vallès Oriental ---
  {
    slug: "granollers",
    nombre: "Granollers",
    comarca: "Vallès Oriental",
    tamano: "la capital del Vallès Oriental, con más de 63.000 habitantes",
    barrios: ["Centre", "Can Bassa", "Congost", "Sant Miquel", "Font Verda", "Hostal"],
    cercanos: ["mollet-del-valles", "cerdanyola-del-valles"],
  },
  {
    slug: "mollet-del-valles",
    nombre: "Mollet del Vallès",
    comarca: "Vallès Oriental",
    tamano: "un nudo de comunicaciones del Vallès, con más de 51.000 habitantes",
    barrios: ["Centre", "Plana Lledó", "Can Borrell", "Lourdes", "Riera Seca", "Santa Rosa"],
    cercanos: ["granollers", "montcada-i-reixac", "barbera-del-valles"],
  },
  // --- Maresme ---
  {
    slug: "mataro",
    nombre: "Mataró",
    comarca: "Maresme",
    tamano: "la capital del Maresme, con más de 130.000 habitantes",
    barrios: ["Centre", "Cerdanyola", "Rocafonda", "Eixample", "Pla d'en Boet", "Vista Alegre", "Cirera", "Molins"],
    cercanos: ["premia-de-mar", "vilassar-de-mar", "el-masnou"],
  },
  {
    slug: "premia-de-mar",
    nombre: "Premià de Mar",
    comarca: "Maresme",
    tamano: "un municipio costero densamente poblado, con más de 28.000 habitantes",
    barrios: ["Centre", "Eixample", "Santa Maria", "Cotet", "La Plaça"],
    cercanos: ["vilassar-de-mar", "el-masnou", "mataro"],
  },
  {
    slug: "el-masnou",
    nombre: "El Masnou",
    comarca: "Maresme",
    tamano: "un municipio marinero del Maresme sur, con más de 23.000 habitantes",
    barrios: ["Centre", "Ocata", "Can Teixidó", "El Masnou Alt", "Els Vienesos"],
    cercanos: ["premia-de-mar", "vilassar-de-mar", "mataro"],
  },
  {
    slug: "vilassar-de-mar",
    nombre: "Vilassar de Mar",
    comarca: "Maresme",
    tamano: "un municipio costero con tradición de flor y planta, con más de 21.000 habitantes",
    barrios: ["Centre", "Vallmora", "El Cordar", "Sant Joan", "La Montserratina"],
    cercanos: ["premia-de-mar", "el-masnou", "mataro"],
  },
  // --- Garraf ---
  {
    slug: "vilanova-i-la-geltru",
    nombre: "Vilanova i la Geltrú",
    comarca: "Garraf",
    tamano: "la capital del Garraf, con más de 68.000 habitantes",
    barrios: ["Centre", "La Geltrú", "Mar", "Sant Joan", "Tacó", "Molí de Vent"],
    cercanos: ["sant-pere-de-ribes", "vilafranca-del-penedes"],
  },
  {
    slug: "sant-pere-de-ribes",
    nombre: "Sant Pere de Ribes",
    comarca: "Garraf",
    tamano: "un municipio del Garraf con dos núcleos, con más de 31.000 habitantes",
    barrios: ["Centre", "Les Roquetes", "Ribes", "Puigmoltó", "Can Macià"],
    cercanos: ["vilanova-i-la-geltru"],
  },
  // --- Resto de comarcas ---
  {
    slug: "igualada",
    nombre: "Igualada",
    comarca: "Anoia",
    tamano: "la capital de l'Anoia, con más de 40.000 habitantes",
    barrios: ["Centre", "Set Camins", "Montserrat", "Fàtima", "Poble Sec", "Sant Crist"],
    cercanos: ["manresa", "vilafranca-del-penedes"],
  },
  {
    slug: "manresa",
    nombre: "Manresa",
    comarca: "Bages",
    tamano: "la capital del Bages, con más de 78.000 habitantes",
    barrios: ["Centre", "Poble Nou", "La Balconada", "Valldaura", "Cal Gravat", "Sant Pau"],
    cercanos: ["igualada", "vic"],
  },
  {
    slug: "vic",
    nombre: "Vic",
    comarca: "Osona",
    tamano: "la capital d'Osona, con más de 47.000 habitantes",
    barrios: ["Centre", "Remei", "El Sucre", "Estadi", "Santa Anna", "Horta Vermella"],
    cercanos: ["manresa", "granollers"],
  },
  {
    slug: "vilafranca-del-penedes",
    nombre: "Vilafranca del Penedès",
    comarca: "Alt Penedès",
    tamano: "la capital de l'Alt Penedès y del vino, con más de 40.000 habitantes",
    barrios: ["Centre", "L'Espirall", "La Girada", "Sant Julià", "Les Clotes"],
    cercanos: ["vilanova-i-la-geltru", "igualada"],
  },
];

const BY_SLUG = new Map(MUNICIPIOS.map((m) => [m.slug, m]));

export function getMunicipio(slug: string): Municipio | undefined {
  return BY_SLUG.get(slug);
}

export function allSlugs(): string[] {
  return MUNICIPIOS.map((m) => m.slug);
}

// Agrupa municipios por comarca conservando el orden de la lista (para /zonas).
export function municipiosPorComarca(): { comarca: string; municipios: Municipio[] }[] {
  const out: { comarca: string; municipios: Municipio[] }[] = [];
  for (const m of MUNICIPIOS) {
    let grupo = out.find((g) => g.comarca === m.comarca);
    if (!grupo) {
      grupo = { comarca: m.comarca, municipios: [] };
      out.push(grupo);
    }
    grupo.municipios.push(m);
  }
  return out;
}

// Hash determinista (mismo resultado en cada build) para elegir plantilla sin Math.random.
function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

function pick<T>(arr: T[], slug: string, salt = 0): T {
  return arr[(hash(slug) + salt) % arr.length];
}

function barriosFrase(m: Municipio): string {
  const b = m.barrios.slice(0, 3).join(", ");
  return b;
}

// ---- Contenido para HOGARES (/limpiadoras/[municipio]) ----
export function introHogar(m: Municipio): string {
  const plantillas = [
    `¿Buscas una limpiadora de confianza en ${m.nombre}? GesLimpia te conecta con limpiadoras profesionales independientes de ${m.nombre} y alrededores. Tú ves sus perfiles, sus tarifas y las valoraciones de otros hogares, y contactáis directamente para acordar día, hora y precio.`,
    `En ${m.nombre} (${m.comarca}) encontrar a la persona adecuada para limpiar tu casa no tiene por qué ser complicado. Con GesLimpia accedes a limpiadoras de la zona —desde ${barriosFrase(m)} hasta el resto del municipio— y eres tú quien elige con quién quieres trabajar.`,
    `GesLimpia es la forma sencilla de encontrar limpiadora en ${m.nombre}. Somos una plataforma de conexión: no somos una empresa de limpieza, sino el puente entre tu hogar y limpiadoras independientes de ${m.nombre} que fijan ellas mismas su tarifa.`,
    `Si vives en ${m.nombre}, ${m.tamano}, y necesitas ayuda con la limpieza del hogar, en GesLimpia puedes ver perfiles de limpiadoras de tu zona, comparar y contactar con quien mejor encaje contigo, sin intermediarios que encarezcan el servicio.`,
  ];
  return pick(plantillas, m.slug);
}

// ---- Contenido para LIMPIADORAS (/trabajo-limpiadora/[municipio]) ----
export function introLimpiadora(m: Municipio): string {
  const plantillas = [
    `¿Buscas trabajo de limpiadora en ${m.nombre}? En GesLimpia te das de alta gratis, creas tu perfil y empiezas a recibir solicitudes de hogares de ${m.nombre} y alrededores. Tú fijas tu tarifa y eliges qué trabajos aceptar.`,
    `Si quieres conseguir clientes de limpieza en ${m.nombre} (${m.comarca}), GesLimpia te pone en contacto directo con hogares de la zona. Sin comisiones por servicio y sin que nadie te baje el precio: la tarifa la decides tú.`,
    `Trabaja como limpiadora en ${m.nombre} a tu manera. Date de alta gratis en GesLimpia, muestra tu experiencia y recibe solicitudes de familias de ${barriosFrase(m)} y del resto del municipio. Tú organizas tu agenda.`,
    `En ${m.nombre} hay hogares buscando limpiadora cada semana. Con GesLimpia creas tu perfil sin coste, fijas tu propia tarifa y te conectas directamente con clientes de tu zona, sin intermediarios.`,
  ];
  return pick(plantillas, m.slug, 7);
}

export type Faq = { q: string; a: string };

export function faqsHogar(m: Municipio): Faq[] {
  return [
    {
      q: `¿Cuánto cuesta una limpiadora en ${m.nombre}?`,
      a: `El precio de la limpieza lo fija cada limpiadora, así que varía según el servicio, las horas y la profesional. En GesLimpia ves la tarifa de cada limpiadora de ${m.nombre} antes de contactar y acordáis el precio directamente. La cuota mensual de GesLimpia es solo por usar la plataforma, no incluye la limpieza.`,
    },
    {
      q: `¿En qué zonas de ${m.nombre} hay limpiadoras?`,
      a: `Trabajamos con limpiadoras de todo ${m.nombre} y alrededores, incluyendo zonas como ${m.barrios.slice(0, 4).join(", ")}. La disponibilidad depende de las altas en cada momento; si todavía hay pocas en tu barrio, también puedes conectar con limpiadoras de municipios cercanos.`,
    },
    {
      q: `¿Cómo contacto con una limpiadora en ${m.nombre}?`,
      a: `Te suscribes a un plan de acceso, buscas limpiadoras en ${m.nombre}, revisas sus perfiles y valoraciones y les escribes por el chat de la plataforma. A partir de ahí acordáis día, hora y precio directamente con ella.`,
    },
    {
      q: `¿GesLimpia es una empresa de limpieza?`,
      a: `No. GesLimpia es una plataforma de conexión entre hogares y limpiadoras independientes. No contratamos a las limpiadoras ni fijamos sus precios: solo facilitamos que os encontréis y acordéis el servicio entre vosotros.`,
    },
  ];
}

export function faqsLimpiadora(m: Municipio): Faq[] {
  return [
    {
      q: `¿Cuánto cuesta darse de alta como limpiadora en ${m.nombre}?`,
      a: `Nada. Registrarte como limpiadora en GesLimpia es totalmente gratis y sin permanencia. No cobramos comisión por servicio: la tarifa que acuerdes con cada hogar de ${m.nombre} es íntegra para ti.`,
    },
    {
      q: `¿Cómo consigo clientes de limpieza en ${m.nombre}?`,
      a: `Creas tu perfil, indicas tu tarifa y las zonas donde trabajas (por ejemplo ${m.barrios.slice(0, 3).join(", ")}) y los hogares de ${m.nombre} que buscan limpiadora pueden contactarte directamente por el chat de la plataforma.`,
    },
    {
      q: `¿Puedo fijar yo mi tarifa?`,
      a: `Sí. En GesLimpia tú decides el precio de tu servicio. Nadie te lo baja ni hay un intermediario que se quede una comisión: acuerdas el precio directamente con cada hogar de ${m.nombre}.`,
    },
    {
      q: `¿Tengo que aceptar todas las solicitudes?`,
      a: `No. Tú eliges qué trabajos aceptar y organizas tu agenda como quieras. Recibes las solicitudes de hogares de ${m.nombre} y alrededores y respondes solo a las que te encajen.`,
    },
  ];
}
