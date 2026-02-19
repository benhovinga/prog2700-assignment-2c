const AUTO_RUN_TEST = false;

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

if (AUTO_RUN_TEST) document.addEventListener('DOMContentLoaded', test);
