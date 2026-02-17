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

    get suite() {
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

/**
 * Display the cards on the tabletop.
 * @param {Card[]} cards 
 */
function displayCards(cards) {
    const cardElements = cards.map((card) => {
        const element = document.createElement("div");
        element.classList.add("card");
        element.style.backgroundImage = `url("${card.image}")`;
        return element;
    });

    const tabletop = document.getElementById("tabletop");
    tabletop.innerHTML = "";

    cardElements.forEach(elem => tabletop.appendChild(elem));
}

const CARD_ORDER = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "JACK", "QUEEN", "KING", "ACE"];

/**
 * Returns a sorted copy of a cards array.
 * @param {Card[]} cards 
 * @returns {Card[]}
 */
function sortCards(cards) {
    return cards.toSorted((a, b) => CARD_ORDER.indexOf(a.value) - CARD_ORDER.indexOf(b.value));
}

/**
 * A Flush is any five cards of the same suit that are not in sequence.
 * @param {Card[]} cards 
 * @returns {boolean}
 */
function isFlush(cards) {
    const testSuit = cards[0].suite;
    return cards.every(card => card.suite === testSuit);
}

/**
 * A Straight is five consecutive cards, not all of the same suit.
 * @param {Card[]} cards 
 * @returns {boolean}
 */
function isStraight(cards) {
    const values = sortCards(cards).map(card => card.value);
    const offset = CARD_ORDER.indexOf(values[0]);
    return values.every((value, index) => value === CARD_ORDER[index + offset]);
}

/**
 * A Royal Flush is the highest five cards all in the same suit to form the best possible Straight Flush.
 * @param {Card[]} cards 
 * @returns {boolean}
 */
function isRoyalFlush(cards) {
    if (!isFlush(cards))
        return false;
    const royalFlush = CARD_ORDER.slice(-5);  // Top 5 cards
    const values = cards.map(card => card.value);
    return royalFlush.every(value => values.includes(value));
}

/**
 * A Straight Flush is five cards in consecutive order of the same suite.
 * @param {Card[]} cards 
 * @returns {boolean}
 */
function isStraightFlush(cards) {
    return isFlush(cards) && isStraight(cards);
}

/**
 * Determine the highest poker hand for the given cards
 * @param {Card[]} cards 
 */
function highestPokerHand(cards) {
    if (isRoyalFlush(cards)) {
        return "Royal Flush";
    } else if (isStraightFlush(cards)) {
        return "Straight Flush";
    } else if (isFourOfAKind(cards)) { // TODO
        return "Four of a Kind";
    } else if (isFullHouse(cards)) { // TODO
        return "Full House";
    } else if (isFlush(cards)) {
        return "Flush";
    } else if (isStraight(cards)) {
        return "Straight";
    } else if (isThreeOfAKind(cards)) { // TODO
        return "Three of a Kind";
    } else if (isTwoPair(cards)) { // TODO
        return "Two Pair";
    } else if (isOnePair(cards)) { // TODO
        return "One Pair";
    } else if (isHighCard(cards)) { // TODO
        return "High Card";
    }
    return "no hand found";
}

async function main() {
    // PART ONE: RETRIEVE AND PERSIST A DECK OF CARDS FROM THE API (10 PTS)
    // Using the Deck of Cards API (https://deckofcardsapi.com/), use fetch() to retrieve a deck of cards that can be used by the application.

    const deck = await Deck.new();
    console.info("New deck created", deck.deckId);

    // PART TWO: REQUEST FIVE CARDS FROM THE DECK (10 PTS)
    // Using the deck that was retrieved in part one, ask the API for a hand of five cards from the deck. Store the given cards in an appropriate manner in your code so that you can evaluate its contents.

    const cards = await deck.draw(5);
    console.info("Cards drawn from deck", cards);

    // PART THREE: DISPLAY THE HAND IN A WEB PAGE (10 PTS)
    // Display the cards in the browser.  Use a CSS stylesheet to arrange them on the screen.

    displayCards(cards);

    // PART FOUR: WRITE A FUNCTION THAT WILL DETERMINE THE HIGHEST POKER HAND FOR THE DISPLAYED CARDS (20 PTS)
    // Write a function that will determine and output the highest poker hand based on the given five cards.

    console.log(highestPokerHand(cards));

    // console.log(isStraight([
    //     new Card("2S", "SPADES", "2", ""),
    //     new Card("3S", "SPADES", "3", ""),
    //     new Card("4S", "SPADES", "4", ""),
    //     new Card("5S", "SPADES", "5", ""),
    //     new Card("6S", "SPADES", "6", ""),
    // ]));
}

document.addEventListener('DOMContentLoaded', main);
