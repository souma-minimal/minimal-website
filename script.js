// minimal. quiet by design
// The copy is authored in Japanese and English so visitors never have to rely
// on browser machine translation for product or purchase information.
(() => {
  const storageKey = 'minimal-language';
  const choices = document.querySelectorAll('[data-language-choice]');
  if (!choices.length) return;

  const initial = localStorage.getItem(storageKey) ||
    (navigator.language.toLowerCase().startsWith('ja') ? 'ja' : 'en');

  const setLanguage = (language) => {
    document.documentElement.dataset.uiLanguage = language;
    document.documentElement.lang = language;
    choices.forEach((choice) => {
      choice.setAttribute('aria-pressed', String(choice.dataset.languageChoice === language));
    });
    localStorage.setItem(storageKey, language);
  };

  choices.forEach((choice) => choice.addEventListener('click', () => setLanguage(choice.dataset.languageChoice)));
  setLanguage(initial);
})();
