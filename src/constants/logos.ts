// SETU 3D Official Brand Assets (English & Hindi)
// Sourced from src/assets/ to ensure seamless Metro resolution in all environments
export const SETU_LOGO_HI = require('../assets/setu-logo-hi.png');
export const SETU_LOGO_EN = require('../assets/setu-logo-en.png');

export const getSetuLogo = (lang: string) => {
  return lang === 'hi' ? SETU_LOGO_HI : SETU_LOGO_EN;
};
