export const getRootFontSize = () => {
  if (typeof document === "undefined") return 192;
  const fontSize = document.documentElement.style.fontSize;
  return fontSize ? Number.parseFloat(fontSize) : 192;
};

export const px2rem = (px: number) => `${px / getRootFontSize()}rem`;

export const DESIGN_BASE = 192;
export const designPx2rem = (px: number) => `${px / DESIGN_BASE}rem`;
