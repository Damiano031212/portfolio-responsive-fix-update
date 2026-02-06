/* ==========================================================================
   WORK PAGE SCRAMBLE EFFECT
   Triggers on hover over .mission-card
   ========================================================================== */

class WorkScrambler {
    constructor(cardSelector, titleSelector, options = {}) {
        this.cards = document.querySelectorAll(cardSelector);

        if (this.cards.length === 0) {
            console.warn(`No cards found with selector "${cardSelector}"`);
            return;
        }

        this.titleSelector = titleSelector;

        // Configuration Parameters
        this.config = {
            replacementInterval: 15,
            glitchDuration: 300,
            pauseBeforeReverse: 800,
            reverseInterval: 15,
            highlightDigits: true,
            ...options
        };

        this.instances = new Map();
        this.init();
    }

    init() {
        this.cards.forEach(card => {
            const titleEl = card.querySelector(this.titleSelector);
            if (!titleEl) return;

            // Prepare the title by wrapping characters
            const originalText = titleEl.textContent;
            const chars = originalText.split('');
            const wrappedHTML = chars.map((char, index) => {
                const isSpace = char === ' ';
                const className = isSpace ? 'char space' : 'char';
                return `<span class="${className}" data-index="${index}" data-original="${char}">${char}</span>`;
            }).join('');

            titleEl.innerHTML = wrappedHTML;
            const charElements = Array.from(titleEl.querySelectorAll('.char'));

            // State for this specific instance
            const state = {
                titleEl,
                originalText,
                charElements,
                intervalId: null,
                isAnimating: false,
                isReversing: false
            };

            this.instances.set(card, state);

            // Add event listeners
            card.addEventListener('mouseenter', () => this.startEffect(card));
        });
    }

    getRandomDigit() {
        return Math.floor(Math.random() * 10).toString();
    }

    getAvailableLetterIndices(state) {
        return state.charElements
            .map((el, index) => ({
                index,
                isSpace: el.classList.contains('space'),
                isDigit: /\d/.test(el.textContent)
            }))
            .filter(item => !item.isSpace && !item.isDigit)
            .map(item => item.index);
    }

    replaceRandomCharacter(card) {
        const state = this.instances.get(card);
        const availableIndices = this.getAvailableLetterIndices(state);

        if (availableIndices.length === 0) {
            this.scheduleReverse(card);
            return;
        }

        const randomIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];
        const targetElement = state.charElements[randomIndex];
        const randomDigit = this.getRandomDigit();

        targetElement.classList.add('glitching');

        setTimeout(() => {
            targetElement.textContent = randomDigit;
            if (this.config.highlightDigits) {
                targetElement.classList.add('is-digit');
            }
        }, this.config.glitchDuration / 2);

        setTimeout(() => {
            targetElement.classList.remove('glitching');
        }, this.config.glitchDuration);
    }

    reverseRandomCharacter(card) {
        const state = this.instances.get(card);
        const digitIndices = state.charElements
            .map((el, index) => ({
                index,
                isDigit: /\d/.test(el.textContent),
                isSpace: el.classList.contains('space')
            }))
            .filter(item => item.isDigit && !item.isSpace)
            .map(item => item.index);

        if (digitIndices.length === 0) {
            this.stopEffect(card);
            state.isAnimating = false;
            state.isReversing = false;
            return;
        }

        const randomIndex = digitIndices[Math.floor(Math.random() * digitIndices.length)];
        const targetElement = state.charElements[randomIndex];
        const originalChar = targetElement.getAttribute('data-original');

        targetElement.classList.add('glitching');

        setTimeout(() => {
            targetElement.textContent = originalChar;
            targetElement.classList.remove('is-digit');
        }, this.config.glitchDuration / 2);

        setTimeout(() => {
            targetElement.classList.remove('glitching');
        }, this.config.glitchDuration);
    }

    scheduleReverse(card) {
        const state = this.instances.get(card);
        this.stopEffect(card);
        state.isReversing = true;

        setTimeout(() => {
            this.startReverse(card);
        }, this.config.pauseBeforeReverse);
    }

    startReverse(card) {
        const state = this.instances.get(card);
        state.intervalId = setInterval(() => {
            this.reverseRandomCharacter(card);
        }, this.config.reverseInterval);
    }

    startEffect(card) {
        const state = this.instances.get(card);
        if (state.isAnimating) return;

        state.isAnimating = true;
        state.isReversing = false;

        // Clear any stuck interval
        this.stopEffect(card);

        state.intervalId = setInterval(() => {
            this.replaceRandomCharacter(card);
        }, this.config.replacementInterval);
    }

    stopEffect(card) {
        const state = this.instances.get(card);
        if (state.intervalId) {
            clearInterval(state.intervalId);
            state.intervalId = null;
        }
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new WorkScrambler('.mission-card', '.mission-name');
});
