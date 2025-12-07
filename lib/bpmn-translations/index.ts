import enTranslations from './en';
import svTranslations from './sv';

type Translations = { [key: string]: string };

const translations: { [locale: string]: Translations } = {
  en: enTranslations,
  sv: svTranslations,
};

/**
 * Creates a custom translate function for bpmn-js that uses our translations.
 * This function follows the bpmn-js translate module pattern.
 * 
 * @param locale - The locale to use (e.g., 'en', 'sv')
 * @returns A translate function compatible with bpmn-js
 */
export function createTranslate(locale: string) {
  const currentTranslations = translations[locale] || translations['en'];

  /**
   * The translate function that bpmn-js will use.
   * Supports template strings with {placeholder} syntax.
   */
  return function translate(template: string, replacements?: { [key: string]: string }): string {
    // Get the translated template or fall back to the original
    let translated = currentTranslations[template] || template;

    // Replace placeholders if replacements are provided
    if (replacements) {
      for (const key in replacements) {
        if (Object.prototype.hasOwnProperty.call(replacements, key)) {
          translated = translated.replace(new RegExp(`\\{${key}\\}`, 'g'), replacements[key]);
        }
      }
    }

    return translated;
  };
}

/**
 * Creates a bpmn-js additionalModule for translation.
 * 
 * @param locale - The locale to use (e.g., 'en', 'sv')
 * @returns A module object that can be passed to BpmnModeler's additionalModules option
 */
export function createTranslateModule(locale: string) {
  return {
    translate: ['value', createTranslate(locale)]
  };
}

export { translations };
