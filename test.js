const AUTO_RUN_TEST = false;

function test() {
    function runTest(fn) {
        const testResult = fn();
        console.log((testResult ? "✅ " : "❌ ") + (testResult ? "\x1b[32m" : "\x1b[31m") + fn.name + "\x1b[0m")
    }

    const testCases = [
        function test_poker_hand_is_flush() {
            const hand = new Hand([
                new Card("0S", "SPADES", "10", "null"),
                new Card("QS", "SPADES", "QUEEN", "null"),
                new Card("7S", "SPADES", "7", "null"),
                new Card("9S", "SPADES", "9", "null"),
                new Card("6S", "SPADES", "6", "null"),
            ]);
            const result = hand.isFlush();
            return Boolean(result)
                && result[0] === "Flush"
                && result[1].length === 5;
        },
        function test_poker_hand_is_not_flush() {
            const hand = new Hand([
                new Card("0S", "SPADES", "10", "null"),
                new Card("QH", "HEARTS", "QUEEN", "null"),
                new Card("7S", "SPADES", "7", "null"),
                new Card("9S", "SPADES", "9", "null"),
                new Card("6S", "SPADES", "6", "null"),
            ]);
            const result = hand.isFlush();
            return result === false;
        },
        function test_poker_hand_is_straight() {
            const hand = new Hand([
                new Card("4D", "DIAMONDS", "4", "null"),
                new Card("6H", "HEARTS", "6", "null"),
                new Card("5C", "CLUBS", "5", "null"),
                new Card("7H", "HEARTS", "7", "null"),
                new Card("8D", "DIAMONDS", "8", "null"),
            ]);
            const result = hand.isStraight();
            return Boolean(result)
                && result[0] === "Straight"
                && result[1].length === 5;
        },
        function test_poker_hand_is_not_straight() {
            const hand = new Hand([
                new Card("4D", "DIAMONDS", "4", "null"),
                new Card("6H", "HEARTS", "6", "null"),
                new Card("6C", "CLUBS", "6", "null"),
                new Card("7H", "HEARTS", "7", "null"),
                new Card("8D", "DIAMONDS", "8", "null"),
            ]);
            const result = hand.isStraight();
            return result === false;
        },
        function test_poker_hand_is_royal_flush() {
            const hand = new Hand([
                new Card("0S", "SPADES", "10", "null"),
                new Card("KS", "SPADES", "KING", "null"),
                new Card("QS", "SPADES", "QUEEN", "null"),
                new Card("JS", "SPADES", "JACK", "null"),
                new Card("AS", "SPADES", "ACE", "null"),
            ]);
            const result = hand.isRoyalFlush();
            return Boolean(result)
                && result[0] === "Royal Flush"
                && result[1].length === 5;
        },
        function test_poker_hand_is_not_royal_flush() {
            const hand = new Hand([
                new Card("9S", "SPADES", "9", "null"),
                new Card("KS", "SPADES", "KING", "null"),
                new Card("QS", "SPADES", "QUEEN", "null"),
                new Card("JS", "SPADES", "JACK", "null"),
                new Card("AS", "SPADES", "ACE", "null"),
            ]);
            const result = hand.isRoyalFlush();
            return result === false;
        },
        function test_poker_hand_is_straight_flush() {
            const hand = new Hand([
                new Card("5H", "HEARTS", "5", "null"),
                new Card("AH", "HEARTS", "ACE", "null"),
                new Card("3H", "HEARTS", "3", "null"),
                new Card("2H", "HEARTS", "2", "null"),
                new Card("4H", "HEARTS", "4", "null"),
            ]);
            const result = hand.isStraightFlush();
            return Boolean(result)
                && result[0] === "Straight Flush"
                && result[1].length === 5;
        },
        function test_poker_hand_is_not_straight_flush() {
            const hand = new Hand([
                new Card("5H", "HEARTS", "5", "null"),
                new Card("8C", "CLUBS", "8", "null"),
                new Card("3H", "HEARTS", "3", "null"),
                new Card("2H", "HEARTS", "2", "null"),
                new Card("4H", "HEARTS", "4", "null"),
            ]);
            const result = hand.isStraightFlush();
            return result === false;
        },
        function test_poker_hand_is_four_of_a_kind() {
            const hand = new Hand([
                new Card("7S", "SPADES", "7", "null"),
                new Card("7C", "CLUBS", "7", "null"),
                new Card("7D", "DIAMONDS", "7", "null"),
                new Card("2D", "DIAMONDS", "2", "null"),
                new Card("7H", "HEARTS", "7", "null"),
            ]);
            const result = hand.isOfAKind(4);
            return Boolean(result)
                && result[0] === "Four of a Kind"
                && result[1].length === 4;
        },
        function test_poker_hand_is_not_four_of_a_kind() {
            const hand = new Hand([
                new Card("7S", "SPADES", "7", "null"),
                new Card("7C", "CLUBS", "7", "null"),
                new Card("2C", "CLUBS", "2", "null"),
                new Card("2D", "DIAMONDS", "2", "null"),
                new Card("7H", "HEARTS", "7", "null"),
            ]);
            const result = hand.isOfAKind(4);
            return result === false;
        },
        function test_poker_hand_is_full_house() {
            const hand = new Hand([
                new Card("7D", "DIAMONDS", "7", "null"),
                new Card("5C", "CLUBS", "5", "null"),
                new Card("7H", "HEARTS", "7", "null"),
                new Card("5H", "HEARTS", "5", "null"),
                new Card("7S", "SPADES", "7", "null"),
            ]);
            const result = hand.isFullHouse();
            return Boolean(result)
                && result[0] === "Full House"
                && result[1].length === 5;
        },
        function test_poker_hand_is_not_full_house() {
            const hand = new Hand([
                new Card("7D", "DIAMONDS", "7", "null"),
                new Card("3C", "CLUBS", "3", "null"),
                new Card("7H", "HEARTS", "7", "null"),
                new Card("5H", "HEARTS", "5", "null"),
                new Card("7S", "SPADES", "7", "null"),
            ]);
            const result = hand.isFullHouse();
            return result === false
        },
        function test_poker_hand_is_three_of_a_kind() {
            const hand = new Hand([
                new Card("2D", "DIAMONDS", "2", "null"),
                new Card("2C", "CLUBS", "2", "null"),
                new Card("3H", "HEARTS", "3", "null"),
                new Card("8D", "DIAMONDS", "8", "null"),
                new Card("2H", "HEARTS", "2", "null"),
            ]);
            const result = hand.isOfAKind(3);
            return Boolean(result)
                && result[0] === "Three of a Kind"
                && result[1].length === 3;
        },
        function test_poker_hand_is_not_three_of_a_kind() {
            const hand = new Hand([
                new Card("2D", "DIAMONDS", "2", "null"),
                new Card("3C", "CLUBS", "3", "null"),
                new Card("3H", "HEARTS", "3", "null"),
                new Card("8D", "DIAMONDS", "8", "null"),
                new Card("2H", "HEARTS", "2", "null"),
            ]);
            const result = hand.isOfAKind(3);
            return result === false;
        },
        function test_poker_hand_is_two_pair() {
            const hand = new Hand([
                new Card("JS", "SPADES", "JACK", "null"),
                new Card("AD", "DIAMONDS", "ACE", "null"),
                new Card("QH", "HEARTS", "QUEEN", "null"),
                new Card("JC", "CLUBS", "JACK", "null"),
                new Card("QD", "DIAMONDS", "QUEEN", "null"),
            ]);
            const result = hand.isTwoPair();
            return Boolean(result)
                && result[0] === "Two Pair"
                && result[1].length === 4;
        },
        function test_poker_hand_is_not_two_pair() {
            const hand = new Hand([
                new Card("KS", "SPADES", "KING", "null"),
                new Card("AD", "DIAMONDS", "ACE", "null"),
                new Card("QH", "HEARTS", "QUEEN", "null"),
                new Card("JC", "CLUBS", "JACK", "null"),
                new Card("QD", "DIAMONDS", "QUEEN", "null"),
            ]);
            const result = hand.isTwoPair();
            return result === false;
        },
        function test_poker_hand_is_one_pair() {
            const hand = new Hand([
                new Card("7D", "DIAMONDS", "7", "null"),
                new Card("KH", "HEARTS", "KING", "null"),
                new Card("0S", "SPADES", "10", "null"),
                new Card("KD", "DIAMONDS", "KING", "null"),
                new Card("4C", "CLUBS", "4", "null"),
            ]);
            const result = hand.isOfAKind(2);
            return Boolean(result)
                && result[0] === "One Pair"
                && result[1].length === 2;
        },
        function test_poker_hand_is_not_one_pair() {
            const hand = new Hand([
                new Card("7D", "DIAMONDS", "7", "null"),
                new Card("QH", "HEARTS", "QUEEN", "null"),
                new Card("0S", "SPADES", "10", "null"),
                new Card("KD", "DIAMONDS", "KING", "null"),
                new Card("4C", "CLUBS", "4", "null"),
            ]);
            const result = hand.isOfAKind(2);
            return result === false;
        },
        function test_poker_hand_high_card() {
            const hand = new Hand([
                new Card("8D", "DIAMONDS", "8", "null"),
                new Card("9D", "DIAMONDS", "9", "null"),
                new Card("0H", "HEARTS", "10", "null"),
                new Card("QS", "SPADES", "QUEEN", "null"),
                new Card("5C", "CLUBS", "5", "null"),
            ]);
            const result = hand.getHighCard();
            return Boolean(result)
                && result[0] === "Queen High"
                && result[1].length === 1
                && result[1][0].code === "QS";
        },
    ];

    console.log("Starting Tests");
    testCases.forEach(fn => runTest(fn));
    console.log("Finished Tests");
}

if (AUTO_RUN_TEST) document.addEventListener('DOMContentLoaded', test);
