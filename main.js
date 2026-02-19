class Time {
    /**
     * Asynchronous delay. Use with await keyword to delay a program action.
     * 
     * @param {number} ms - Time in milliseconds
     * @returns {Promise<any>}
     */
    static delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}


class Card {
    #code;
    #suit;
    #value;
    #imageURL;
    #element;

    /**
     * Represents a playing card from the Deck of Cards API.
     * 
     * @param {string} code - A two character string. Example: "KH" = King of Hearts.
     * @param {string} suit - The card suit. Example: "HEARTS".
     * @param {string} value - The cards value. Example: "KING".
     * @param {string} imageURL - The URL of the card face image.
     */
    constructor(code, suit, value, imageURL) {
        if (!code || typeof code !== "string" || code.length != 2)
            throw new TypeError("Invalid code");
        this.#code = code;
        if (!suit || typeof suit !== "string")
            throw new TypeError("Invalid suit");
        this.#suit = suit;
        if (!value || typeof value !== "string")
            throw new TypeError("Invalid value");
        this.#value = value;
        if (!imageURL || typeof imageURL !== "string")
            throw new TypeError("Invalid image");
        this.#imageURL = imageURL;
        this.#element = Card.createCardElement(this.#imageURL);
    }

    get code() {
        return this.#code;
    }

    get suit() {
        return this.#suit;
    }

    get value() {
        return this.#value;
    }

    get image() {
        return this.#imageURL;
    }

    getCardElement() {
        return this.#element;
    }

    faceUp() {
        this.#element.classList.add("flipped");
    }

    faceDown() {
        this.#element.classList.remove("flipped");
    }

    flip() {
        this.#element.classList.toggle("flipped");
    }

    /**
     * Creates a new playing card HTML element.
     * 
     * @param {string} imageURL - Playing card face image URL.
     * @returns {HTMLDivElement}
     */
    static createCardElement(imageURL = null) {
        const cardWrapper = document.createElement("div");
        cardWrapper.classList.add("card");

        const cardBack = document.createElement("div");
        cardBack.classList.add("back");

        if (imageURL) {
            const cardFace = document.createElement("div");
            cardFace.classList.add("face");
            cardFace.style.backgroundImage = `url("${imageURL}")`;

            const flipper = document.createElement("div");
            flipper.classList.add("flipper");
            flipper.appendChild(cardBack);
            flipper.appendChild(cardFace);

            cardWrapper.appendChild(flipper);
        } else {
            cardWrapper.appendChild(back)
        }

        return cardWrapper;
    }
}


class Deck {
    #deckId;
    #remaining;
    #shuffled;

    /**
     * Represents a deck of cards from the Deck of Cards API.
     * 
     * @param {string} deckId - The `deck_id` from the Deck of Cards API.
     * @param {number} remaining - The number of cards remaining in the deck.
     * @param {boolean} shuffled - Was the deck shuffled?
     */
    constructor(deckId, remaining = 52, shuffled = false) {
        if (!deckId || typeof deckId !== "string" || deckId.length < 12)
            throw new TypeError("Invalid deck_id");
        this.#deckId = deckId;
        this.#remaining = remaining;
        this.#shuffled = shuffled;
    }

    get deckId() {
        return this.#deckId;
    }

    get remaining() {
        return this.#remaining;
    }

    get shuffled() {
        return this.#shuffled;
    }

    static #API_BASE = "https://deckofcardsapi.com/api/deck/";

    /**
     * Fetch from the Deck of Cards API and return back the parsed JSON.
     * 
     * @param {string} endpoint - The specific endpoint on the API. It will be appended to the API_BASE.
     * @returns {any} Parsed JSON.
     * @throws When HTTP error occurs.
     */
    static async #fetchJSON(endpoint) {
        const response = await fetch(Deck.#API_BASE + endpoint);
        if (!response.ok)
            throw new Error(`HTTP error! Status: ${response.status} ${response.statusText}`);
        return await response.json();
    }

    /**
     * Get a new deck of cards from the Deck of Cards API.
     * 
     * @param {boolean} shuffle - Should the new deck be shuffled? (Default: true)
     * @returns {Promise<Deck>} A new deck of cards.
     */
    static async new(shuffle = true) {
        const json = await Deck.#fetchJSON(`new/${shuffle ? "shuffle/" : ""}`);

        const deckId = json["deck_id"];
        const remaining = parseInt(json["remaining"]);
        const shuffled = Boolean(json["shuffled"]);

        return new Deck(deckId, remaining, shuffled);
    }

    /**
     * Load an existing deck of cards from the Deck of Cards API.
     * 
     * @param {string} deckId - The deck_id to load from the Deck of Cards API.
     * @param {boolean} shuffle - Should the new deck be shuffled? (Default: true)
     * @returns {Promise<Deck>} A new deck of cards.
     */
    static async load(deckId, shuffle = true) {
        const json = await Deck.#fetchJSON(`${deckId}/${shuffle ? "shuffle/" : ""}`);

        const remaining = parseInt(json["remaining"]);
        const shuffled = Boolean(json["shuffled"]);

        return new Deck(deckId, remaining, shuffled);
    }

    /**
     * Reshuffle all cards back into the deck.
     */
    async reshuffle() {
        const json = await Deck.#fetchJSON(`${this.#deckId}/shuffle/`);

        this.#remaining = parseInt(json["remaining"]);
        this.#shuffled = Boolean(json["shuffled"]);
    }

    /**
     * Draw card(s) from the deck.
     * 
     * @param {number} numCards - Number of cards to draw. (Default: 1)
     * @param {boolean} reshuffle - Reshuffle the deck if there are not enough cards to draw. (Default: false)
     * @returns {Promise<Card[]>} An array of Cards.
     */
    async draw(numCards = 1, reshuffle = false) {
        if (reshuffle && this.#remaining < numCards)
            await this.reshuffle();

        const json = await Deck.#fetchJSON(`${this.#deckId}/draw/?count=${numCards}`);

        this.#remaining = parseInt(json["remaining"]);
        console.info(`Cards remaining in deck: ${this.#remaining}`);

        const cards = Array(...json["cards"])
            .map(card => new Card(card["code"], card["suit"], card["value"], card["image"]));

        return cards;
    }
}


class Hand {
    #cards;

    /**
     * Represents a player's hand.
     * 
     * @param {Card[]} cards - An array of Cards.
     */
    constructor(cards) {
        if (!cards.every(card => card instanceof Card))
            throw new TypeError("cards must be an array of Card.")
        this.#cards = [...cards];
    }

    get cards() {
        return this.#cards;
    }

    static #CARD_ORDER_ACE_HIGH = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "JACK", "QUEEN", "KING", "ACE"];
    static #CARD_ORDER_ACE_LOW = ["ACE", "2", "3", "4", "5", "6", "7", "8", "9", "10", "JACK", "QUEEN", "KING"];

    /**
     * Returns the order of the cards based on their rank value. Ordered from lowest value to highest value.
     * 
     * @param {boolean} ace_high - Should the Ace be considered high value (true) or low value (false)? (Default: true)
     * @returns {string[]} Array of card values.
     */
    static rankOrder(ace_high = true) {
        if (ace_high)
            return [...Hand.#CARD_ORDER_ACE_HIGH];
        return [...Hand.#CARD_ORDER_ACE_LOW]
    }

    /**
     * Counts the number of cards that share the same rank.
     * 
     * @returns {Object<string, number>} {"rank": count, ...}
     */
    countByRank() {
        return this.#cards.reduce((obj, card) => {
            if (!obj[card.value])
                obj[card.value] = 1;
            else
                obj[card.value] += 1;
            return obj;
        }, {});
    }

    /**
     * Sorts the cards in place. This method mutates the cards and returns a reference to the same cards array.
     * 
     * @param {boolean} ace_high - Should the Ace be considered high value (true) or low value (false)? (Default: true)
     * @returns {Card[]} An array of Cards.
     */
    sort(ace_high = true) {
        const order = Hand.rankOrder(ace_high);
        return this.#cards.sort((a, b) => order.indexOf(a.value) - order.indexOf(b.value));
    }

    /**
     * Returns a copy of the cards with the cards sorted.
     * 
     * @param {boolean} ace_high - Should the Ace be considered high value (true) or low value (false)? (Default: true)
     * @returns {Card[]} An array of Cards.
     */
    toSorted(ace_high = true) {
        const order = Hand.rankOrder(ace_high);
        return this.#cards.toSorted((a, b) => order.indexOf(a.value) - order.indexOf(b.value));
    }

    /**
     * A Flush is any five cards of the same suit that are not in sequence.
     * 
     * @returns {boolean} 
     */
    isFlush() {
        const testSuit = this.#cards[0].suit;
        return this.#cards.every(card => card.suit === testSuit);
    }

    /**
     * A Straight is five consecutive cards, not all of the same suit.
     * 
     * @returns {boolean}
     */
    isStraight() {
        // Check with Ace high then with Ace low
        for (let i = 0; i <= 1; i++) {
            const order = Hand.rankOrder(Boolean(i));
            const values = this.toSorted(Boolean(i)).map(card => card.value);
            const offset = order.indexOf(values[0]);
            if (values.every((value, index) => value === order[index + offset]))
                return true;
        }
        return false;
    }

    /**
     * A Royal Flush is the highest five cards all in the same suit to form the best possible Straight Flush.
     * 
     * @returns {boolean}
     */
    isRoyalFlush() {
        if (!this.isFlush())
            return false;
        const royalFlush = Hand.rankOrder(true).slice(-5);  // Top 5 cards
        const values = this.#cards.map(card => card.value);
        return royalFlush.every(value => values.includes(value));
    }

    /**
     * A Straight Flush is five cards in consecutive order of the same suite.
     * 
     * @returns {boolean}
     */
    isStraightFlush() {
        return this.isFlush() && this.isStraight();
    }

    /**
     * If there are {count} of the same rank.
     * 
     * @param {number} count - The number of cards that must be of the same rank.
     * @returns {boolean}
     */
    isOfAKind(count = 2) {
        return Object.values(this.countByRank())
            .some(cardCount => cardCount === count);
    }

    /**
     * A Full House consists of three cards of a single rank and two cards of another rank.
     * 
     * @returns {boolean}
     */
    isFullHouse() {
        return this.isOfAKind(3) && this.isOfAKind(2);
    }

    /**
     * A Two Pair is two cards with the same rank, along with two cards of a different rank.
     * 
     * @returns {boolean}
     */
    isTwoPair() {
        const counts = Object.values(this.countByRank());
        const pairs = counts.filter(value => value === 2);
        return pairs.length === 2;
    }

    /**
     * One Pair consists of two cards of the same rank, with three other unrelated cards.
     * 
     * @returns {boolean}
     */
    isOnePair() {
        return this.isOfAKind(2);
    }

    /**
     * Determines the highest possible poker hand held.
     * 
     * @returns {string}
     */
    highestHand() {
        if (this.isRoyalFlush()) {
            return "Royal Flush";
        } else if (this.isStraightFlush()) {
            return "Straight Flush";
        } else if (this.isOfAKind(4)) {
            return "Four of a Kind";
        } else if (this.isFullHouse()) {
            return "Full House";
        } else if (this.isFlush()) {
            return "Flush";
        } else if (this.isStraight()) {
            return "Straight";
        } else if (this.isOfAKind(3)) {
            return "Three of a Kind";
        } else if (this.isTwoPair()) {
            return "Two Pair";
        } else if (this.isOnePair()) {
            return "One Pair";
        }
        // else
        return "High Card";
    }
}


class Game {
    #tabletopElem;
    #drawHandElem;
    #handResultElem;
    /**@type {Deck} */
    #deck;
    /**@type {Hand} */
    #playerHand;

    /**
     * Represents the game board and game logic.
     * 
     * @param {HTMLElement} tabletopElem 
     * @param {HTMLElement} drawHandElem 
     * @param {HTMLElement} handResultElem 
     */
    constructor(tabletopElem, drawHandElem, handResultElem) {
        this.#tabletopElem = tabletopElem;
        this.#drawHandElem = drawHandElem;
        this.#handResultElem = handResultElem;

        this.#drawHandElem.addEventListener("click", (e) => this.handleDrawHand(e));
    }

    async load() {
        const deckId = localStorage.getItem("deck_id");
        if (deckId) {
            this.#deck = await Deck.load(deckId);
            console.info(`Loaded an existing deck of cards with id: '${this.#deck.deckId}'`);
        } else {
            this.#deck = await Deck.new();
            localStorage.setItem("deck_id", this.#deck.deckId);
            console.info(`Created new deck of cards with id: '${this.#deck.deckId}'`);
        }
        return this;
    }

    /**
     * 
     * @param {PointerEvent} event 
     */
    async handleDrawHand(event) {
        // Lock the button
        event.target.disabled = true;

        console.info('"Draw Hand" button was clicked.')
        // Hide the pervious highest hand
        this.#handResultElem.innerHTML = "";

        // Conceal the current cards (if they exist)
        if (this.#playerHand) {
            await this.concealHand();
            console.info("Cards on screen have been concealed.");
        }

        // Draw five new cards and put them in the players hand.
        this.#playerHand = new Hand(await this.#deck.draw(5, true));

        // Check if at bottom of the deck
        if (this.#playerHand.cards.length != 5)
            throw Error("Didn't receive 5 cards from the deck.");

        // Sort the hand (ace high)
        this.#playerHand.sort();
        console.info(`Five cards were drawn from the deck: ${this.#playerHand.cards.map(card => card.code)}`);

        // Clear the tabletop
        this.#tabletopElem.innerHTML = "";

        // Add the new cards to the tabletop
        this.#playerHand.cards.forEach((card) => {
            this.#tabletopElem.appendChild(card.getCardElement());
        });

        // Reveal the cards
        await this.revealHand();
        console.info("Cards were shown to the player.");

        // Display the highest poker hand to the player.
        this.#handResultElem.innerText = this.#playerHand.highestHand();
        console.info("The highest hand was shown to the player.");

        // Unlock the button
        event.target.disabled = false;
    }

    /**
     * Reveals the hand to the player
     */
    async revealHand() {
        for (const card of this.#playerHand.cards) {
            await Time.delay(300);   // Flip each card one after the other
            card.faceUp();
        }
        await Time.delay(300);  // Allows animation to finish
    }

    /**
     * Conceals the hand from the player
     */
    async concealHand() {
        for (const card of this.#playerHand.cards) {
            card.faceDown();
        }
        await Time.delay(300);  // Allows animation to finish
    }
}


async function main() {
    // Load the game and start it.
    await new Game(
        document.getElementById("tabletop"),
        document.getElementById("draw-hand"),
        document.getElementById("hand-result")
    ).load();
    console.info("Game is ready.");
}


document.addEventListener('DOMContentLoaded', main);
