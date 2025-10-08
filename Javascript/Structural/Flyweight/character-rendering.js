/**
 * Flyweight Pattern - Text Editor Character Rendering Example
 *
 * The Flyweight pattern minimizes memory use by sharing as much data as possible
 * with similar objects. It's a way to use objects in large numbers when a simple
 * repeated representation would use an unacceptable amount of memory.
 */

/**
 * Flyweight: CharacterStyle
 * Stores intrinsic state (shared among many characters)
 */
class CharacterStyle {
  constructor(font, size, color, isBold, isItalic) {
    this.font = font;
    this.size = size;
    this.color = color;
    this.isBold = isBold;
    this.isItalic = isItalic;
  }

  /**
   * Display method uses both intrinsic and extrinsic state
   */
  display(character, position) {
    const style = [];
    if (this.isBold) style.push('bold');
    if (this.isItalic) style.push('italic');

    console.log(
      `Char: '${character}' at position ${position} | ` +
      `Font: ${this.font} ${this.size}pt | ` +
      `Color: ${this.color}` +
      (style.length > 0 ? ` | Style: ${style.join(', ')}` : '')
    );
  }

  getKey() {
    return `${this.font}-${this.size}-${this.color}-${this.isBold}-${this.isItalic}`;
  }
}

/**
 * Flyweight Factory: CharacterStyleFactory
 * Creates and manages flyweight objects, ensures sharing
 */
class CharacterStyleFactory {
  constructor() {
    this.styles = new Map();
  }

  /**
   * Get or create a style (flyweight)
   */
  getStyle(font, size, color, isBold = false, isItalic = false) {
    const key = `${font}-${size}-${color}-${isBold}-${isItalic}`;

    if (!this.styles.has(key)) {
      console.log(`[Factory] Creating new style: ${key}`);
      this.styles.set(key, new CharacterStyle(font, size, color, isBold, isItalic));
    } else {
      console.log(`[Factory] Reusing existing style: ${key}`);
    }

    return this.styles.get(key);
  }

  getTotalStyles() {
    return this.styles.size;
  }

  getStylesInfo() {
    return Array.from(this.styles.keys());
  }
}

/**
 * Context: Character
 * Stores extrinsic state (unique to each character)
 */
class Character {
  constructor(char, position, style) {
    this.char = char; // Extrinsic state
    this.position = position; // Extrinsic state
    this.style = style; // Reference to shared flyweight
  }

  display() {
    this.style.display(this.char, this.position);
  }
}

/**
 * Client: TextEditor
 * Uses flyweight pattern to render text efficiently
 */
class TextEditor {
  constructor() {
    this.characters = [];
    this.styleFactory = new CharacterStyleFactory();
  }

  insertCharacter(char, position, font, size, color, isBold = false, isItalic = false) {
    const style = this.styleFactory.getStyle(font, size, color, isBold, isItalic);
    const character = new Character(char, position, style);
    this.characters.push(character);
  }

  insertText(text, startPosition, font, size, color, isBold = false, isItalic = false) {
    for (let i = 0; i < text.length; i++) {
      this.insertCharacter(text[i], startPosition + i, font, size, color, isBold, isItalic);
    }
  }

  render() {
    console.log('\n--- Rendering Text ---');
    this.characters.forEach(char => char.display());
  }

  getMemoryStats() {
    const totalCharacters = this.characters.length;
    const uniqueStyles = this.styleFactory.getTotalStyles();

    // Estimate memory (simplified)
    const memoryPerCharacter = 16; // char + position
    const memoryPerStyle = 100; // font, size, color, bools

    const actualMemory = (totalCharacters * memoryPerCharacter) + (uniqueStyles * memoryPerStyle);

    // Without flyweight, each character would store its own style
    const memoryWithoutFlyweight = totalCharacters * (memoryPerCharacter + memoryPerStyle);

    return {
      totalCharacters,
      uniqueStyles,
      actualMemory,
      memoryWithoutFlyweight,
      savedMemory: memoryWithoutFlyweight - actualMemory,
      savingsPercentage: ((1 - actualMemory / memoryWithoutFlyweight) * 100).toFixed(2)
    };
  }
}

module.exports = {
  CharacterStyle,
  CharacterStyleFactory,
  Character,
  TextEditor
};
