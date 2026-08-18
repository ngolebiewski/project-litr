// Character index map (spaces are handled automatically by index -1)
const FONT_CHARS = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ.,!?:";

// 15-bit Glyph Data (each octal digit represents 1 row of 3 pixels)
const FONT_DATA = [
  // 0-9
  0o75557, 0o26227, 0o71747, 0o71717, 0o55711, 0o74717, 0o74757, 0o71222, 0o75757, 0o75717,
  // A-J
  0o25755, 0o65656, 0o74447, 0o65556, 0o74747, 0o74744, 0o74557, 0o55755, 0o72227, 0o11152,
  // K-T
  0o55655, 0o44447, 0o57555, 0o65555, 0o75557, 0o75744, 0o75571, 0o75765, 0o34216, 0o72222,
  // U-Z
  0o55557, 0o55552, 0o55575, 0o55255, 0o55222, 0o71247,
  // .,!?:
  0o00002, 0o00024, 0o22202, 0o61202, 0o02020
];

/**
 * Draws micro 3x5 bitmap text onto a 2D canvas context.
 * @param {CanvasRenderingContext2D} ctx 
 * @param {string} text - The string to render
 * @param {number} x - Target X coordinate
 * @param {number} y - Target Y coordinate
 * @param {number} scale - Pixel multiplier (1 = 3x5, 2 = 6x10, etc.)
 * @param {string} color - Fill style color
 */
export function drawText(ctx, text, x, y, scale = 1, color = "#fff") {
  ctx.fillStyle = color;
  text = text.toUpperCase();

  for (let i = 0; i < text.length; i++) {
    const idx = FONT_CHARS.indexOf(text[i]);
    if (idx !== -1) {
      const glyph = FONT_DATA[idx];
      for (let bit = 0; bit < 15; bit++) {
        // Test bit from top-left (bit 14) to bottom-right (bit 0)
        if ((glyph >> (14 - bit)) & 1) {
          ctx.fillRect(
            x + (i * 4 + (bit % 3)) * scale, // 3px char width + 1px spacing
            y + ((bit / 3) | 0) * scale,     // Row offset
            scale,
            scale
          );
        }
      }
    }
  }
}