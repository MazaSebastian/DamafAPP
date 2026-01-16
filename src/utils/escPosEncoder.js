
const ESC = 0x1B;
const GS = 0x1D;

export class EscPosEncoder {
    constructor() {
        this.buffer = [];
    }

    initialize() {
        this.buffer.push(ESC, 0x40); // Initialize printer
        return this;
    }

    text(content) {
        if (!content) return this;
        // Simple encoding assuming UTF-8 or standard ASCII support by printer
        // Ideally we might need an encoding library for specialized chars, 
        // but modern browsers/printers often handle UTF-8 text sent as bytes reasonably well 
        // if the printer is configured for it. 
        // For strictly ASCII: 
        const bytes = new TextEncoder().encode(content);
        bytes.forEach(b => this.buffer.push(b));
        return this;
    }

    newline(count = 1) {
        for (let i = 0; i < count; i++) {
            this.buffer.push(0x0A);
        }
        return this;
    }

    align(alignment) {
        // 0: Left, 1: Center, 2: Right
        let val = 0;
        if (alignment === 'center') val = 1;
        if (alignment === 'right') val = 2;
        this.buffer.push(ESC, 0x61, val);
        return this;
    }

    bold(active) {
        this.buffer.push(ESC, 0x45, active ? 1 : 0);
        return this;
    }

    size(width, height) {
        // ESC/POS GS ! n
        // Obsolete "ESC !" logic moved to standard GS ! n
        // Bits 0-3: height multiplier (0-7)
        // Bits 4-7: width multiplier (0-7)
        // e.g., size(1, 1) -> 0x00 (Normal)
        //       size(2, 2) -> 0x11 (2x Width, 2x Height)
        //       size(3, 3) -> 0x22 (3x Width, 3x Height)
        //       size(4, 4) -> 0x33

        // Ensure within bounds (1-8, mapped to 0-7)
        const w = Math.max(1, Math.min(8, width)) - 1;
        const h = Math.max(1, Math.min(8, height)) - 1;

        const n = (w << 4) | h;
        this.buffer.push(GS, 0x21, n);
        return this;
    }

    invert(enabled) {
        // GS B n  (0 or 1)
        this.buffer.push(GS, 0x42, enabled ? 1 : 0);
        return this;
    }

    line(char = '-') {
        // 80mm printer usually 42-48 chars width normal font
        this.text(char.repeat(48));
        this.newline();
        return this;
    }

    cut() {
        this.buffer.push(GS, 0x56, 0x41, 0x03); // Cut full + feed
        return this;
    }

    encode() {
        return new Uint8Array(this.buffer);
    }
}
