/**
 * GameState — shared singleton for cross-scene state.
 */
const GameState = {
    ageGroup: null,        // '4-5' | '6-7' | '8-10'
    soccerBalls: 0,        // balls earned from any math game
    totalScore: 0,
    consecutiveCorrect: 0, // streak across any math game

    /** Reset per-game values (keep ageGroup). */
    resetGame() {
        this.soccerBalls = 0;
        this.totalScore = 0;
        this.consecutiveCorrect = 0;
    },

    /** Return the multiplication difficulty range for the current age group. */
    multiplicationRange() {
        if (this.ageGroup === '8-10') return { min: 2, max: 10 };
        if (this.ageGroup === '6-7')  return { min: 2, max: 5 };
        return { min: 1, max: 3 };
    },

    /** Return the math (addition/subtraction) max number for the current age group. */
    mathMax() {
        if (this.ageGroup === '8-10') return 100;
        if (this.ageGroup === '6-7')  return 20;
        return 10;
    }
};
