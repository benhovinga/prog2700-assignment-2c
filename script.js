const TEST_MODE = false;

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


class Hand {
    #cards;

    constructor(cards = []) {
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
     * Returns the order of the cards depending on if the ace is considered the high card or the low card.
     * @param {boolean} ace_high 
     * @returns {string[]}
     */
    static card_order(ace_high = true) {
        if (ace_high)
            return [...Hand.#CARD_ORDER_ACE_HIGH];
        return [...Hand.#CARD_ORDER_ACE_LOW]
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
     * Sorts the cards in place. This method mutates the array and returns a reference to the same array.
     * @param {boolean} ace_high 
     * @returns {Card[]}
     */
    sort(ace_high = true) {
        const order = Hand.card_order(ace_high);
        return this.#cards.sort((a, b) => order.indexOf(a.value) - order.indexOf(b.value));
    }

    /**
     * Returns a copy of the cards with its elements sorted.
     * @param {boolean} ace_high 
     * @returns {Card[]}
     */
    toSorted(ace_high = true) {
        const order = Hand.card_order(ace_high);
        return this.#cards.toSorted((a, b) => order.indexOf(a.value) - order.indexOf(b.value));
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
        // Check with ace high and ace low
        for (let i = 0; i <= 1; i++) {
            const order = Hand.card_order(Boolean(i));
            const values = this.toSorted(Boolean(i)).map(card => card.value);
            const offset = order.indexOf(values[0]);
            if (values.every((value, index) => value === order[index + offset]))
                return true;
        }
        return false;
    }

    /**
     * A Royal Flush is the highest five cards all in the same suit to form the best possible Straight Flush.
     * @returns {boolean}
     */
    isRoyalFlush() {
        if (!this.isFlush())
            return false;
        const royalFlush = Hand.card_order(true).slice(-5);  // Top 5 cards
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
    async displayCards(element) {
        function delay(ms) {
            return new Promise(resolve => setTimeout(resolve, ms))
        }
        async function flipCards(cards) {
            for (const card of cards) {
                await delay(300);
                card.classList.add("flipped");
            }
        }
        const cardElements = this.#cards.map((card) => {
            const backElement = document.createElement("div");
            backElement.classList.add("back");

            const faceElement = document.createElement("div");
            faceElement.classList.add("face")
            faceElement.style.backgroundImage = `url("${card.image}")`;

            const flipperElement = document.createElement("div");
            flipperElement.classList.add("flipper");
            flipperElement.appendChild(backElement);
            flipperElement.appendChild(faceElement);

            const cardElement = document.createElement("div");
            cardElement.classList.add("card");

            cardElement.appendChild(flipperElement);
            return cardElement;
        });

        element.innerHTML = "";
        cardElements.forEach(elem => element.appendChild(elem));

        // Flip cards
        await flipCards(element.children);
        await delay(300);
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
    // Get a new deck of cards from the deck of cards API.
    const deck = await Deck.new();
    console.info(`Created new deck of cards with id: '${deck.deckId}'`);
    
    // Draw five cards and put them in the players hand.
    const playerHand = new Hand(await deck.draw(5));
    playerHand.sort();
    console.info(`Five cards were drawn from the deck: ${playerHand.cards.map(card=> card.code)}`);

    // Display the cards on the tabletop.
    await playerHand.displayCards(document.getElementById('tabletop'));
    console.info("Cards were shown to the player.");

    // Display the highest poker hand to the player.
    playerHand.displayHighestHand(document.getElementById('pokerhand'));
    console.info("The highest hand was shown to the player.");
}


function test() {
    function runTest(fn) {
        const testResult = fn();
        console.log((testResult ? "\x1b[32m" : "\x1b[31m") + fn.name + (testResult ? " PASS" : " FAIL") + "\x1b[0m")
    }

    const testCases = [
        function test_poker_hand_is_royal_flush() {
            const hand = new Hand([
                new Card("0S", "SPADES", "10", "null"),
                new Card("KS", "SPADES", "KING", "null"),
                new Card("QS", "SPADES", "QUEEN", "null"),
                new Card("JS", "SPADES", "JACK", "null"),
                new Card("AS", "SPADES", "ACE", "null"),
            ]);
            return hand.isRoyalFlush() && hand.highestHand() === "Royal Flush";
        },
        function test_poker_hand_is_straight_flush() {
            const hand = new Hand([
                new Card("5H", "HEARTS", "5", "null"),
                new Card("AH", "HEARTS", "ACE", "null"),
                new Card("3H", "HEARTS", "3", "null"),
                new Card("2H", "HEARTS", "2", "null"),
                new Card("4H", "HEARTS", "4", "null"),
            ]);
            return hand.isStraightFlush() && hand.highestHand() === "Straight Flush";
        },
        function test_poker_hand_is_four_of_a_kind() {
            const hand = new Hand([
                new Card("7S", "SPADES", "7", "null"),
                new Card("7C", "CLUBS", "7", "null"),
                new Card("7D", "DIAMONDS", "7", "null"),
                new Card("2D", "DIAMONDS", "2", "null"),
                new Card("7H", "HEARTS", "7", "null"),
            ]);
            return hand.isOfAKind(4) && hand.highestHand() === "Four of a Kind";
        },
        function test_poker_hand_is_full_house() {
            const hand = new Hand([
                new Card("7D", "DIAMONDS", "7", "null"),
                new Card("5C", "CLUBS", "5", "null"),
                new Card("7H", "HEARTS", "7", "null"),
                new Card("5H", "HEARTS", "5", "null"),
                new Card("7S", "SPADES", "7", "null"),
            ]);
            return hand.isFullHouse() && hand.highestHand() === "Full House";
        },
        function test_poker_hand_is_flush() {
            const hand = new Hand([
                new Card("0S", "SPADES", "10", "null"),
                new Card("QS", "SPADES", "QUEEN", "null"),
                new Card("7S", "SPADES", "7", "null"),
                new Card("9S", "SPADES", "9", "null"),
                new Card("6S", "SPADES", "6", "null"),
            ]);
            return hand.isFlush() && hand.highestHand() === "Flush";
        },
        function test_poker_hand_is_straight() {
            const hand = new Hand([
                new Card("4D", "DIAMONDS", "4", "null"),
                new Card("6H", "HEARTS", "6", "null"),
                new Card("5C", "CLUBS", "5", "null"),
                new Card("7H", "HEARTS", "7", "null"),
                new Card("8D", "DIAMONDS", "8", "null"),
            ]);
            return hand.isStraight() && hand.highestHand() === "Straight";
        },
        function test_poker_hand_is_three_of_a_kind() {
            const hand = new Hand([
                new Card("2D", "DIAMONDS", "2", "null"),
                new Card("2C", "CLUBS", "2", "null"),
                new Card("3H", "HEARTS", "3", "null"),
                new Card("8D", "DIAMONDS", "8", "null"),
                new Card("2H", "HEARTS", "2", "null"),
            ]);
            return hand.isOfAKind(3) && hand.highestHand() === "Three of a Kind";
        },
        function test_poker_hand_is_two_pair() {
            const hand = new Hand([
                new Card("JS", "SPADES", "JACK", "null"),
                new Card("AD", "DIAMONDS", "ACE", "null"),
                new Card("QH", "HEARTS", "QUEEN", "null"),
                new Card("JC", "CLUBS", "JACK", "null"),
                new Card("QD", "DIAMONDS", "QUEEN", "null"),
            ]);
            return hand.isTwoPair() && hand.highestHand() === "Two Pair";
        },
        function test_poker_hand_is_one_pair() {
            const hand = new Hand([
                new Card("7D", "DIAMONDS", "7", "null"),
                new Card("KH", "HEARTS", "KING", "null"),
                new Card("0S", "SPADES", "10", "null"),
                new Card("KD", "DIAMONDS", "KING", "null"),
                new Card("4C", "CLUBS", "4", "null"),
            ]);
            return hand.isOnePair() && hand.highestHand() === "One Pair";
        },
        function test_poker_hand_is_high_card() {
            const hand = new Hand([
                new Card("8D", "DIAMONDS", "8", "null"),
                new Card("9D", "DIAMONDS", "9", "null"),
                new Card("0H", "HEARTS", "10", "null"),
                new Card("QS", "SPADES", "QUEEN", "null"),
                new Card("5C", "CLUBS", "5", "null"),
            ]);
            return hand.highestHand() === "High Card";
        },
    ];
    
    console.log("Starting Tests");
    testCases.forEach(fn => runTest(fn));
    console.log("Finished Tests");
}


document.addEventListener('DOMContentLoaded', TEST_MODE ? test : main);
