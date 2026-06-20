/**
 * The single source of truth for which languages this app supports.
 * - code: matches the filename in src/messages/{code}.json
 * - nativeName: shown in the language switcher, in the language's own script
 * - englishName: used when instructing the AI model what language to
 *   respond in — English names are more reliable instructions for the
 *   model than native-script names ("Tamil" works better than "தமிழ்"
 *   as a prompt instruction, even though the model should still respond
 *   using the native script itself).
 * - speechLang: BCP-47 tag used for the Web Speech API (SpeechSynthesis).
 *   Browser/OS voice availability varies — see SpeakButton's fallback
 *   behavior for what happens when a device has no voice installed for
 *   a given language.
 */
export type LanguageCode =
  | 'en' | 'hi' | 'ta' | 'te' | 'bn' | 'mr' | 'gu' | 'kn' | 'ml' | 'pa'
  | 'ur' | 'as' | 'or' | 'ne' | 'sa' | 'sd' | 'kok' | 'mai' | 'dgo'
  | 'brx' | 'ks' | 'mni' | 'sat';

type LanguageMeta = { code: LanguageCode; nativeName: string; englishName: string; speechLang: string };

export const SUPPORTED_LANGUAGES: LanguageMeta[] = [
  { code: 'en', nativeName: 'English', englishName: 'English', speechLang: 'en-IN' },
  { code: 'hi', nativeName: 'हिन्दी', englishName: 'Hindi', speechLang: 'hi-IN' },
  { code: 'ta', nativeName: 'தமிழ்', englishName: 'Tamil', speechLang: 'ta-IN' },
  { code: 'te', nativeName: 'తెలుగు', englishName: 'Telugu', speechLang: 'te-IN' },
  { code: 'bn', nativeName: 'বাংলা', englishName: 'Bengali', speechLang: 'bn-IN' },
  { code: 'mr', nativeName: 'मराठी', englishName: 'Marathi', speechLang: 'mr-IN' },
  { code: 'gu', nativeName: 'ગુજરાતી', englishName: 'Gujarati', speechLang: 'gu-IN' },
  { code: 'kn', nativeName: 'ಕನ್ನಡ', englishName: 'Kannada', speechLang: 'kn-IN' },
  { code: 'ml', nativeName: 'മലയാളം', englishName: 'Malayalam', speechLang: 'ml-IN' },
  { code: 'pa', nativeName: 'ਪੰਜਾਬੀ', englishName: 'Punjabi', speechLang: 'pa-IN' },
  { code: 'ur', nativeName: 'اردو', englishName: 'Urdu', speechLang: 'ur-IN' },
  { code: 'as', nativeName: 'অসমীয়া', englishName: 'Assamese', speechLang: 'as-IN' },
  { code: 'or', nativeName: 'ଓଡ଼ିଆ', englishName: 'Odia', speechLang: 'or-IN' },
  { code: 'ne', nativeName: 'नेपाली', englishName: 'Nepali', speechLang: 'ne-IN' },
  { code: 'sa', nativeName: 'संस्कृतम्', englishName: 'Sanskrit', speechLang: 'sa-IN' },
  { code: 'sd', nativeName: 'سنڌي', englishName: 'Sindhi', speechLang: 'sd-IN' },
  { code: 'kok', nativeName: 'कोंकणी', englishName: 'Konkani', speechLang: 'kok-IN' },
  { code: 'mai', nativeName: 'मैथिली', englishName: 'Maithili', speechLang: 'mai-IN' },
  { code: 'dgo', nativeName: 'डोगरी', englishName: 'Dogri', speechLang: 'dgo-IN' },
  { code: 'brx', nativeName: 'बड़ो', englishName: 'Bodo', speechLang: 'brx-IN' },
  { code: 'ks', nativeName: 'کٲشُر', englishName: 'Kashmiri', speechLang: 'ks-IN' },
  { code: 'mni', nativeName: 'ꯃꯩꯇꯩꯂꯣꯟ', englishName: 'Manipuri', speechLang: 'mni-IN' },
  { code: 'sat', nativeName: 'ᱥᱟᱱᱛᱟᱲᱤ', englishName: 'Santali', speechLang: 'sat-IN' },
];

export const DEFAULT_LANGUAGE: LanguageCode = 'en';

export function getLanguageMeta(code: LanguageCode): LanguageMeta {
  return SUPPORTED_LANGUAGES.find((l) => l.code === code) ?? SUPPORTED_LANGUAGES[0];
}
