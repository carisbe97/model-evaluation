export interface IconoCategoriaOption {
  name: string;
  label: string;
  category: string;
  keywords: string;
  svgPath: string;
}

export const LISTA_ICONOS_CATEGORIA: IconoCategoriaOption[] = [
  {
    name: 'crown',
    label: 'Corona Oficial',
    category: 'Certamen',
    keywords: 'corona reina miss ganadora gala queen tiara',
    svgPath: 'M5 16l-3-9 6 3 4-6 4 6 6-3-3 9H5zm0 3h14v2H5v-2z'
  },
  {
    name: 'sparkles',
    label: 'Destellos / Glamour',
    category: 'Estilo',
    keywords: 'destellos brillo glamour sparkle magia luz estrellas',
    svgPath: 'M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.286L13 21l-2.286-6.857L5 12l5.714-2.286L13 3z'
  },
  {
    name: 'star',
    label: 'Estrella / Talento',
    category: 'Talento',
    keywords: 'estrella star talento favorita show destacada',
    svgPath: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z'
  },
  {
    name: 'gem',
    label: 'Diamante / Joya',
    category: 'Estilo',
    keywords: 'diamante joya gem crystal piedra preciosa lujo',
    svgPath: 'M6 3h12l4 7-10 11L2 10l4-7zM2 10h20M7 3l5 18 5-18'
  },
  {
    name: 'trophy',
    label: 'Trofeo / Podio',
    category: 'Certamen',
    keywords: 'trofeo premio final ganadora podio victoria copa',
    svgPath: 'M8 21h8m-4-4v4M6 4h12v4a6 6 0 01-12 0V4zm0 0H4a2 2 0 00-2 2v1a4 4 0 004 4h0zm12 0h2a2 2 0 012 2v1a4 4 0 01-4 4h0'
  },
  {
    name: 'award',
    label: 'Medalla / Mención',
    category: 'Certamen',
    keywords: 'medalla cinta reconocimiento honor premio distincion',
    svgPath: 'M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7'
  },
  {
    name: 'camera',
    label: 'Fotogenia / Cámara',
    category: 'Evaluación',
    keywords: 'camara foto fotogenia shooting sesion flash rostro modelaje',
    svgPath: 'M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z M15 13a3 3 0 11-6 0 3 3 0 016 0z'
  },
  {
    name: 'microphone',
    label: 'Entrevista / Oratoria',
    category: 'Evaluación',
    keywords: 'microfono entrevista voz discurso elocuencia oratoria pregunta',
    svgPath: 'M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z'
  },
  {
    name: 'heart',
    label: 'Carisma / Simpatía',
    category: 'Personalidad',
    keywords: 'corazon carisma simpatia afecto amor publico pasion',
    svgPath: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z'
  },
  {
    name: 'dress',
    label: 'Traje de Gala / Alta Costura',
    category: 'Pasarela',
    keywords: 'traje gala vestido costura moda runway pasarela vestuario',
    svgPath: 'M9 3l3 2 3-2 3 5-3 14H6L3 8l6-5z'
  },
  {
    name: 'swim',
    label: 'Traje de Baño / Verano',
    category: 'Pasarela',
    keywords: 'traje baño bikini olas playa verano waves swim figura fitness',
    svgPath: 'M3 15a4 4 0 004 4 4 4 0 004-4 4 4 0 014-4 4 4 0 014 4 4 4 0 004 4M3 9a4 4 0 004 4 4 4 0 004-4 4 4 0 014-4 4 4 0 014 4 4 4 0 004 4'
  },
  {
    name: 'fire',
    label: 'Presencia Escénica',
    category: 'Pasarela',
    keywords: 'fuego presencia pasarela actitud energia fuego runway seguridad',
    svgPath: 'M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z'
  },
  {
    name: 'smile',
    label: 'Sonrisa / Belleza Facial',
    category: 'Evaluación',
    keywords: 'sonrisa rostro expresion belleza angel facial simpatia',
    svgPath: 'M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
  },
  {
    name: 'eye',
    label: 'Mirada / Porte',
    category: 'Evaluación',
    keywords: 'mirada porte contacto visual expresion seguridad ojos',
    svgPath: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z'
  },
  {
    name: 'globe',
    label: 'Proyección Internacional',
    category: 'Certamen',
    keywords: 'mundo mundo global internacional proyeccion universo tierra',
    svgPath: 'M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9'
  },
  {
    name: 'sun',
    label: 'Luminosidad / Sol',
    category: 'Estilo',
    keywords: 'sol brillo luminosidad bronceado verano calidez luz',
    svgPath: 'M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z'
  },
  {
    name: 'music',
    label: 'Coreografía / Armonía',
    category: 'Talento',
    keywords: 'musica ritmo baile coreografia oido artistico armonia',
    svgPath: 'M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3'
  },
  {
    name: 'shield',
    label: 'Distinción / Seguridad',
    category: 'Personalidad',
    keywords: 'distincion elegancia escudo proteccion firmeza seguridad porte',
    svgPath: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z'
  },
  {
    name: 'book',
    label: 'Cultura General',
    category: 'Evaluación',
    keywords: 'libro saber conocimiento educacion oratoria cultura intelecto',
    svgPath: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253'
  },
  {
    name: 'lightning',
    label: 'Impacto Escénico',
    category: 'Pasarela',
    keywords: 'rayo energia impacto dinamismo fuerza pasarela lightning',
    svgPath: 'M13 10V3L4 14h7v7l9-11h-7z'
  }
];
