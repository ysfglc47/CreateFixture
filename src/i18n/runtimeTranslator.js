let currentLanguage = 'tr';
let textDictionary = {};

export function setRuntimeLanguage(language) {
  currentLanguage = language || 'tr';
}

export function setRuntimeDictionary(dictionary) {
  textDictionary = dictionary || {};
}

function preserveCase(source, translated) {
  if (!source || !translated) return translated;
  if (source === source.toUpperCase()) return translated.toUpperCase();
  return translated;
}

export function translateRuntimeText(value) {
  if (typeof value !== 'string') return value;
  if (currentLanguage === 'tr') return value;

  const dictionary = textDictionary?.[currentLanguage] || {};
  const text = value.trim();
  if (!text) return value;

  const exact = dictionary[text];
  if (exact) return preserveCase(text, exact);

  let translated = value;
  const keys = Object.keys(dictionary)
    .filter(key => key.length > 2 && value.includes(key))
    .sort((a, b) => b.length - a.length);

  for (const key of keys) {
    translated = translated.split(key).join(preserveCase(key, dictionary[key]));
  }

  return translated === value ? value : translated;
}
