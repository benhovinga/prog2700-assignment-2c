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

}

document.addEventListener('DOMContentLoaded', main);
