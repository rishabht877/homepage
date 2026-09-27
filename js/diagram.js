// diagram.js
// Builds an animated SVG architecture diagram for a project from its
// `pipeline` array. Nothing here uses a charting or icon library: the nodes,
// connectors, arrowheads, and the travelling pulse are all plain SVG elements
// created with the DOM API and themed per project through a custom property.
//
// Nodes are laid out as a serpentine: the first row runs left to right, the
// next runs right to left, joined by a U-turn. That keeps the boxes large
// enough to read inside a narrow card, which a single long row does not.

const SVG_NS = "http://www.w3.org/2000/svg";

// Diagram geometry, in viewBox units.
const VIEW_WIDTH = 320;
const VIEW_HEIGHT = 196;
const COLUMNS = 3;
const PADDING = 12;
const NODE_GAP = 14;
const NODE_HEIGHT = 40;
const ROW_Y = [56, 140];
const TURN_INSET = 4;

const NODE_WIDTH = (VIEW_WIDTH - PADDING * 2 - NODE_GAP * (COLUMNS - 1)) / COLUMNS;

// Create an SVG element with attributes applied in one call.
function svgEl(name, attrs = {}) {
  const el = document.createElementNS(SVG_NS, name);
  Object.entries(attrs).forEach(([key, value]) => {
    el.setAttribute(key, String(value));
  });
  return el;
}

// Where node `index` sits, accounting for the serpentine row reversal.
function nodeAt(index) {
  const row = Math.floor(index / COLUMNS);
  const rawCol = index % COLUMNS;
  // Odd rows run right to left.
  const col = row % 2 === 0 ? rawCol : COLUMNS - 1 - rawCol;
  return {
    row,
    x: PADDING + col * (NODE_WIDTH + NODE_GAP),
    y: ROW_Y[row] ?? ROW_Y[ROW_Y.length - 1],
    rightward: row % 2 === 0,
  };
}

// The connector path from node `index` to the node after it. Returns a path
// string so the visible line and the travelling pulse can share one geometry.
function connectorPath(index) {
  const from = nodeAt(index);
  const to = nodeAt(index + 1);

  if (from.row === to.row) {
    // Straight hop within a row, in whichever direction the row runs.
    const startX = from.rightward ? from.x + NODE_WIDTH : from.x;
    const endX = from.rightward ? to.x : to.x + NODE_WIDTH;
    return `M ${startX} ${from.y} L ${endX} ${to.y}`;
  }

  // U-turn into the next row, looping around the outer edge.
  const exitX = from.rightward ? from.x + NODE_WIDTH : from.x;
  const turnX = from.rightward ? VIEW_WIDTH - TURN_INSET : TURN_INSET;
  const entryX = from.rightward ? to.x + NODE_WIDTH : to.x;
  return `M ${exitX} ${from.y} L ${turnX} ${from.y} L ${turnX} ${to.y} L ${entryX} ${to.y}`;
}

// Dotted schematic background plus the arrowhead marker the connectors reuse.
// Ids are namespaced per diagram so two diagrams on one page cannot collide.
function addDefs(svg, key) {
  const defs = svgEl("defs");

  const pattern = svgEl("pattern", {
    id: `diagram-grid-${key}`,
    width: 14,
    height: 14,
    patternUnits: "userSpaceOnUse",
  });
  pattern.appendChild(svgEl("circle", { cx: 1, cy: 1, r: 1, class: "diagram-grid-dot" }));
  defs.appendChild(pattern);

  const marker = svgEl("marker", {
    id: `diagram-arrow-${key}`,
    viewBox: "0 0 8 8",
    refX: 7,
    refY: 4,
    markerWidth: 5,
    markerHeight: 5,
    orient: "auto-start-reverse",
  });
  marker.appendChild(svgEl("path", { d: "M 0 0 L 8 4 L 0 8 z", class: "diagram-arrow" }));
  defs.appendChild(marker);

  svg.appendChild(defs);
  svg.appendChild(
    svgEl("rect", {
      x: 0,
      y: 0,
      width: VIEW_WIDTH,
      height: VIEW_HEIGHT,
      fill: `url(#diagram-grid-${key})`,
    })
  );
}

// One connector line plus a pulse that travels along it.
function addConnector(svg, index, key) {
  const d = connectorPath(index);

  svg.appendChild(
    svgEl("path", { d, class: "diagram-connector", "marker-end": `url(#diagram-arrow-${key})` })
  );

  const pulse = svgEl("circle", { r: 3, class: "diagram-pulse" });
  const motion = svgEl("animateMotion", {
    dur: "2.6s",
    repeatCount: "indefinite",
    // Stagger so the flow reads as one signal moving through the system.
    begin: `${index * 0.3}s`,
    path: d,
  });
  pulse.appendChild(motion);
  svg.appendChild(pulse);
}

// One labelled node box.
function addNode(svg, label, index) {
  const { x, y } = nodeAt(index);
  const group = svgEl("g", { class: "diagram-node" });

  group.appendChild(
    svgEl("rect", {
      x,
      y: y - NODE_HEIGHT / 2,
      width: NODE_WIDTH,
      height: NODE_HEIGHT,
      rx: 8,
      class: "diagram-node-box",
    })
  );

  const text = svgEl("text", {
    x: x + NODE_WIDTH / 2,
    y: y + 4.5,
    "text-anchor": "middle",
    class: "diagram-node-label",
  });
  text.textContent = label;
  group.appendChild(text);

  svg.appendChild(group);
}

/**
 * Build the architecture diagram for a project.
 * @param {object} project A project record from data.js.
 * @param {string} variant "card" for the gallery tile, "detail" for the dialog.
 * @returns {SVGSVGElement} A themed, animated SVG element.
 */
export function createDiagram(project, variant = "card") {
  const svg = svgEl("svg", {
    viewBox: `0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`,
    class: `diagram diagram-${variant}`,
    role: "img",
    preserveAspectRatio: "xMidYMid meet",
  });
  svg.style.setProperty("--diagram-accent", project.accent);

  const title = svgEl("title");
  title.textContent = `${project.name} architecture: ${project.pipeline.join(" to ")}`;
  svg.appendChild(title);

  const key = `${project.id}-${variant}`;
  addDefs(svg, key);

  // Connectors first so the node boxes paint on top of them.
  for (let i = 0; i < project.pipeline.length - 1; i += 1) {
    addConnector(svg, i, key);
  }

  project.pipeline.forEach((label, index) => addNode(svg, label, index));

  return svg;
}
