
/**
 * Ensure that the SVG has a defs section for gradients
 */
export const ensureDefsExists = (svg: SVGSVGElement): SVGDefsElement => {
  // Check if defs already exists
  let defs = svg.querySelector("defs");
  if (!defs) {
    // Create defs if it doesn't exist
    defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
    svg.appendChild(defs);
  }
  
  return defs as SVGDefsElement;
};

/**
 * Create a linear gradient for the SVG
 */
export const createGradient = (
  svg: SVGSVGElement,
  id: string,
  startColor: string,
  endColor: string = startColor
): void => {
  // Get or create defs section
  const defs = ensureDefsExists(svg);
  
  // Check if the gradient already exists
  if (document.getElementById(id)) {
    return;
  }
  
  // Create the linear gradient element
  const gradient = document.createElementNS("http://www.w3.org/2000/svg", "linearGradient");
  gradient.setAttribute("id", id);
  gradient.setAttribute("gradientUnits", "userSpaceOnUse");
  gradient.setAttribute("x1", "0%");
  gradient.setAttribute("y1", "0%");
  gradient.setAttribute("x2", "100%");
  gradient.setAttribute("y2", "0%");
  
  // Create start stop
  const stop1 = document.createElementNS("http://www.w3.org/2000/svg", "stop");
  stop1.setAttribute("offset", "0%");
  stop1.setAttribute("stop-color", startColor);
  
  // Create end stop
  const stop2 = document.createElementNS("http://www.w3.org/2000/svg", "stop");
  stop2.setAttribute("offset", "100%");
  stop2.setAttribute("stop-color", endColor);
  
  // Add stops to gradient
  gradient.appendChild(stop1);
  gradient.appendChild(stop2);
  
  // Add gradient to defs
  defs.appendChild(gradient);
};
