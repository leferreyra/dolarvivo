
export const DARK = 'DARK';
export const LIGHT = 'LIGHT';

const THEMES = {
  [LIGHT]: {
    highlight: '#0099ff',
    foreground: 'black',
    background: 'white'
  },
  [DARK]: {
    highlight: '#0099ff',
    foreground: '#CCC',
    background: '#222'
  }
}

export const getTheme = (themeId) => {
  return THEMES[themeId];
}
