class Card {
    #code;
    #suit;
    #value;
    #image;

    constructor (code, suit, value, image) {
        if (!code || typeof code !== "string" || code.length != 2)
            throw new TypeError("Invalid code");
        this.#code = code;
        if (!suit || typeof suit !== "string")
            throw new TypeError("Invalid suit");
        this.#suit = suit;
        if (!value || typeof value !== "string")
            throw new TypeError("Invalid value");
        this.#value = value;
        if (!image || typeof image !== "string")
            throw new TypeError("Invalid image");
        this.#image = image;
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
        return this.#image;
    }
}


class Deck {
    #deckId;
    #remaining;
    #shuffled;

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
     * Fetch from the Deck of Cards API and return back a json object.
     * @param {string} endpoint The specific endpoint on the API. It will be appended to the API_BASE.
     */
    static async #fetchJSON(endpoint) {
        // Fetch the API endpoint
        const response = await fetch(Deck.#API_BASE + endpoint);
        if (!response.ok)
            throw new Error(`HTTP error! Status: ${response.status} ${response.statusText}`);
        return await response.json();
    }

    /**
     * Builds a new deck of cards
     * @param {boolean} shuffle default = true
     * @returns {Promise<Deck>}
     */
    static async new(shuffle = true) {
        const json = await Deck.#fetchJSON(`new/${shuffle ? "shuffle/": ""}`);

        const deckId = json["deck_id"];
        const remaining = parseInt(json["remaining"]);
        const shuffled = Boolean(json["shuffled"]);

        return new Deck(deckId, remaining, shuffled);
    }

    /**
     * Draw card(s) from the deck
     * @param {number} numCards default = 1
     * @returns {Promise<Card[]>}
     */
    async draw(numCards = 1) {
        const json = await Deck.#fetchJSON(`${this.#deckId}/draw/?count=${numCards}`);

        this.#remaining = parseInt(json["remaining"]);

        const cards = Array(...json["cards"])
            .map(card => new Card(card["code"], card["suit"], card["value"], card["image"]));

        return cards;
    }
}


class PokerHand {
    #cards;

    constructor(cards = []) {
        if (!cards.every(card => card instanceof Card))
            throw new TypeError("cards must be an array of Card.")
        this.#cards = [...cards];
    }
    
    get cards() {
        return this.#cards;
    }

    static #CARD_ORDER = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "JACK", "QUEEN", "KING", "ACE"];

    /**
     * Sorts the cards in place. This method mutates the array and returns a reference to the same array.
     * @returns {Card[]}
     */
    sort() {
        return this.#cards.sort((a, b) => PokerHand.#CARD_ORDER.indexOf(a.value) - PokerHand.#CARD_ORDER.indexOf(b.value));
    }

    /**
     * Returns a copy of the cards with its elements sorted.
     * @returns {Card[]}
     */
    toSorted() {
        return this.#cards.toSorted((a, b) => PokerHand.#CARD_ORDER.indexOf(a.value) - PokerHand.#CARD_ORDER.indexOf(b.value));
    }

    /**
     * A Flush is any five cards of the same suit that are not in sequence.
     * @returns {boolean}
     */
    isFlush() {
        const testSuit = this.#cards[0].suit;
        return this.#cards.every(card => card.suit === testSuit);
    }

    /**
     * A Straight is five consecutive cards, not all of the same suit.
     * @returns {boolean}
     */
    isStraight() {
        const values = this.toSorted().map(card => card.value);
        const offset = PokerHand.#CARD_ORDER.indexOf(values[0]);
        return values.every((value, index) => value === PokerHand.#CARD_ORDER[index + offset]);
    }

    /**
     * A Royal Flush is the highest five cards all in the same suit to form the best possible Straight Flush.
     * @returns {boolean}
     */
    isRoyalFlush() {
        if (!this.isFlush())
            return false;
        const royalFlush = PokerHand.#CARD_ORDER.slice(-5);  // Top 5 cards
        const values = this.#cards.map(card => card.value);
        return royalFlush.every(value => values.includes(value));
    }

    /**
     * A Straight Flush is five cards in consecutive order of the same suite.
     * @returns {boolean}
     */
    isStraightFlush() {
        return this.isFlush() && this.isStraight();
    }

    /**
     * Counts the cards and returns an object with keys being the card and the value being the count.
     * @returns {Object<string, number>}
     */
    countCards() {
        return this.#cards.reduce((counter, card) => {
            if (!counter[card.value])
                counter[card.value] = 1;
            else 
                counter[card.value] += 1;
            return counter;
        }, {});
    }

    /**
     * If there are {count} of the same rank.
     * @param {number} count 
     * @returns {boolean}
     */
    isOfAKind(count = 2) {
        return Object.values(this.countCards())
            .some(cardCount => cardCount === count);
    }

    /**
     * A Full House consists of three cards of a single rank and two cards of another rank.
     * @returns {boolean}
     */
    isFullHouse() {
        return this.isOfAKind(3) && this.isOfAKind(2);
    }

    /**
     * A Two Pair is two cards with the same rank, along with two cards of a different rank.
     * @returns {boolean}
     */
    isTwoPair() {
        const counts = Object.values(this.countCards());
        const pairs = counts.filter(value => value === 2);
        return pairs.length === 2;
    }

    /**
     * One Pair consists of two cards of the same rank, with three other unrelated cards.
     * @returns {boolean}
     */
    isOnePair() {
        return this.isOfAKind(2);
    }

    /**
     * Determine the highest poker hand.
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
        // Else
        return "High Card";
    }

    /**
     * Display the cards on the screen.
     * @param {HTMLElement} element 
     */
    displayCards(element) {
        const cardElements = this.#cards.map((card) => {
            const elem = document.createElement("div");
            elem.classList.add("card");
            elem.style.backgroundImage = `url("${card.image}")`;
            return elem;
        });

        element.innerHTML = "";
        cardElements.forEach(elem => element.appendChild(elem));
    }

    /**
     * 
     * @param {HTMLElement} element 
     */
    displayHighestHand(element) {
        element.innerText = this.highestHand();
    }
}


async function main() {
    // PART ONE: RETRIEVE AND PERSIST A DECK OF CARDS FROM THE API (10 PTS)
    // Using the Deck of Cards API (https://deckofcardsapi.com/), use fetch() to retrieve a deck of cards that can be used by the application.

    const deck = await Deck.new();
    console.info("New deck created", deck.deckId);

    // PART TWO: REQUEST FIVE CARDS FROM THE DECK (10 PTS)
    // Using the deck that was retrieved in part one, ask the API for a hand of five cards from the deck. Store the given cards in an appropriate manner in your code so that you can evaluate its contents.

    const pokerHand = new PokerHand(await deck.draw(5));
    console.info("Cards drawn from deck", pokerHand);

    // PART THREE: DISPLAY THE HAND IN A WEB PAGE (10 PTS)
    // Display the cards in the browser.  Use a CSS stylesheet to arrange them on the screen.

    // Pre sort (optional)
    pokerHand.sort();

    pokerHand.displayCards(document.getElementById('tabletop'));
    console.info("Rendered cards on screen")

    // PART FOUR: WRITE A FUNCTION THAT WILL DETERMINE THE HIGHEST POKER HAND FOR THE DISPLAYED CARDS (20 PTS)
    // Write a function that will determine and output the highest poker hand based on the given five cards.

    pokerHand.displayHighestHand(document.getElementById('pokerhand'));
    console.info("Rendered highest hand on screen")
}

document.addEventListener('DOMContentLoaded', main);
