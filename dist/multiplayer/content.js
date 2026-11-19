"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LEVEL_NAMES = exports.COOP_QUESTS = exports.QUIZ_CONFIG = exports.QUIZ_BANK = exports.TAG_CONFIG = exports.HUNT_CONFIG = exports.HUNT_SPAWNS = exports.HUNT_ITEMS = void 0;
exports.getCoopQuest = getCoopQuest;
exports.buildHuntSpawns = buildHuntSpawns;
exports.HUNT_ITEMS = {
    apple: { de: 'der Apfel', article: 'der', example: 'Der Apfel ist rot und süß.' },
    bread: { de: 'das Brot', article: 'das', example: 'Das Brot liegt auf dem Tisch.' },
    milk: { de: 'die Milch', article: 'die', example: 'Die Milch steht im Kühlschrank.' },
    cheese: { de: 'der Käse', article: 'der', example: 'Der Käse kommt aus der Schweiz.' },
    bus: { de: 'der Bus', article: 'der', example: 'Der Bus fährt zum Bahnhof.' },
    bicycle: { de: 'das Fahrrad', article: 'das', example: 'Das Fahrrad hat zwei Räder.' },
    car: { de: 'das Auto', article: 'das', example: 'Das Auto parkt vor dem Haus.' },
    book: { de: 'das Buch', article: 'das', example: 'Das Buch ist sehr interessant.' },
    computer: { de: 'der Computer', article: 'der', example: 'Der Computer steht im Klassenzimmer.' },
    lamp: { de: 'die Lampe', article: 'die', example: 'Die Lampe leuchtet hell.' },
    table: { de: 'der Tisch', article: 'der', example: 'Der Tisch ist aus Holz.' },
    cup: { de: 'die Tasse', article: 'die', example: 'Die Tasse ist noch warm.' }
};
exports.HUNT_SPAWNS = [
    { id: 'hunt-1', x: 30, z: 95, key: 'apple' },
    { id: 'hunt-2', x: -80, z: 170, key: 'bread' },
    { id: 'hunt-3', x: 120, z: 95, key: 'milk' },
    { id: 'hunt-4', x: -60, z: 284, key: 'cheese' },
    { id: 'hunt-5', x: -80, z: -130, key: 'bus' },
    { id: 'hunt-6', x: 100, z: -203, key: 'bicycle' },
    { id: 'hunt-7', x: 30, z: 0, key: 'car' },
    { id: 'hunt-8', x: -170, z: 130, key: 'book' },
    { id: 'hunt-9', x: 30, z: 170, key: 'computer' },
    { id: 'hunt-10', x: 30, z: 284, key: 'lamp' },
    { id: 'hunt-11', x: 30, z: -203, key: 'table' },
    { id: 'hunt-12', x: -100, z: 95, key: 'cup' }
];
exports.HUNT_CONFIG = {
    durationMs: 90000,
    collectDistance: 4,
    pointsPerItem: 10,
    maxItems: 10
};
exports.TAG_CONFIG = {
    minPlayers: 2,
    maxPlayers: 12,
    countdownMs: 3000,
    roundMs: 120000,
    hidePhaseMs: 20000,
    tagDistance: 4,
    immunityMs: 2000,
    actionCooldownMs: 900,
    spawnRadius: 8
};
exports.QUIZ_BANK = [
    {
        id: 'art-apfel',
        kind: 'artikel',
        prompt: 'Welcher Artikel gehört zu „Apfel“?',
        options: ['der', 'die', 'das'],
        correctIndex: 0
    },
    {
        id: 'art-brot',
        kind: 'artikel',
        prompt: 'Welcher Artikel gehört zu „Brot“?',
        options: ['der', 'die', 'das'],
        correctIndex: 2
    },
    {
        id: 'art-milch',
        kind: 'artikel',
        prompt: 'Welcher Artikel gehört zu „Milch“?',
        options: ['der', 'die', 'das'],
        correctIndex: 1
    },
    {
        id: 'art-kaese',
        kind: 'artikel',
        prompt: 'Welcher Artikel gehört zu „Käse“?',
        options: ['der', 'die', 'das'],
        correctIndex: 0
    },
    {
        id: 'art-fahrrad',
        kind: 'artikel',
        prompt: 'Welcher Artikel gehört zu „Fahrrad“?',
        options: ['der', 'die', 'das'],
        correctIndex: 2
    },
    {
        id: 'art-schule',
        kind: 'artikel',
        prompt: 'Welcher Artikel gehört zu „Schule“?',
        options: ['der', 'die', 'das'],
        correctIndex: 1
    },
    {
        id: 'art-computer',
        kind: 'artikel',
        prompt: 'Welcher Artikel gehört zu „Computer“?',
        options: ['der', 'die', 'das'],
        correctIndex: 0
    },
    {
        id: 'art-lampe',
        kind: 'artikel',
        prompt: 'Welcher Artikel gehört zu „Lampe“?',
        options: ['der', 'die', 'das'],
        correctIndex: 1
    },
    {
        id: 'art-buch',
        kind: 'artikel',
        prompt: 'Welcher Artikel gehört zu „Buch“?',
        options: ['der', 'die', 'das'],
        correctIndex: 2
    },
    {
        id: 'art-tisch',
        kind: 'artikel',
        prompt: 'Welcher Artikel gehört zu „Tisch“?',
        options: ['der', 'die', 'das'],
        correctIndex: 0
    },
    {
        id: 'art-tasse',
        kind: 'artikel',
        prompt: 'Welcher Artikel gehört zu „Tasse“?',
        options: ['der', 'die', 'das'],
        correctIndex: 1
    },
    {
        id: 'art-auto',
        kind: 'artikel',
        prompt: 'Welcher Artikel gehört zu „Auto“?',
        options: ['der', 'die', 'das'],
        correctIndex: 2
    },
    {
        id: 'luecke-brot',
        kind: 'lueckentext',
        prompt: 'Ergänze den Satz: „Ich kaufe ___ für das Frühstück.“',
        options: ['das Brot', 'der Bus', 'die Lampe', 'das Fahrrad'],
        correctIndex: 0
    },
    {
        id: 'luecke-milch',
        kind: 'lueckentext',
        prompt: 'Ergänze den Satz: „Die ___ steht im Kühlschrank.“',
        options: ['der Käse', 'die Milch', 'das Buch', 'der Tisch'],
        correctIndex: 1
    },
    {
        id: 'luecke-bus',
        kind: 'lueckentext',
        prompt: 'Ergänze den Satz: „Der ___ fährt zum Bahnhof.“',
        options: ['das Auto', 'die Tasse', 'der Bus', 'das Brot'],
        correctIndex: 2
    },
    {
        id: 'luecke-fahrrad',
        kind: 'lueckentext',
        prompt: 'Ergänze den Satz: „Das ___ hat zwei Räder.“',
        options: ['der Computer', 'die Schule', 'das Fahrrad', 'der Apfel'],
        correctIndex: 2
    },
    {
        id: 'luecke-lampe',
        kind: 'lueckentext',
        prompt: 'Ergänze den Satz: „Die ___ leuchtet hell.“',
        options: ['der Käse', 'die Lampe', 'das Auto', 'der Tisch'],
        correctIndex: 1
    },
    {
        id: 'luecke-computer',
        kind: 'lueckentext',
        prompt: 'Ergänze den Satz: „Der ___ steht im Klassenzimmer.“',
        options: ['das Buch', 'die Milch', 'der Computer', 'das Fahrrad'],
        correctIndex: 2
    },
    {
        id: 'luecke-auto',
        kind: 'lueckentext',
        prompt: 'Ergänze den Satz: „Das ___ parkt vor dem Haus.“',
        options: ['die Schule', 'der Apfel', 'das Auto', 'die Lampe'],
        correctIndex: 2
    },
    {
        id: 'luecke-kaese',
        kind: 'lueckentext',
        prompt: 'Ergänze den Satz: „Der ___ kommt aus der Schweiz.“',
        options: ['der Käse', 'die Tasse', 'das Brot', 'der Bus'],
        correctIndex: 0
    },
    {
        id: 'bedeutung-fahrrad',
        kind: 'bedeutung',
        prompt: 'Welches Wort bedeutet „ein Fahrzeug mit zwei Rädern, das man tritt“?',
        options: ['der Bus', 'das Fahrrad', 'das Auto', 'der Computer'],
        correctIndex: 1
    },
    {
        id: 'bedeutung-apfel',
        kind: 'bedeutung',
        prompt: 'Welches Wort bedeutet „eine runde, rote oder grüne Frucht“?',
        options: ['der Apfel', 'das Brot', 'der Käse', 'die Milch'],
        correctIndex: 0
    },
    {
        id: 'bedeutung-schule',
        kind: 'bedeutung',
        prompt: 'Welches Wort bedeutet „ein Ort, an dem Kinder lernen“?',
        options: ['der Supermarkt', 'die Schule', 'das Restaurant', 'der Park'],
        correctIndex: 1
    },
    {
        id: 'bedeutung-lampe',
        kind: 'bedeutung',
        prompt: 'Welches Wort bedeutet „ein Gegenstand, der Licht macht“?',
        options: ['der Tisch', 'das Buch', 'die Lampe', 'die Tasse'],
        correctIndex: 2
    },
    {
        id: 'bedeutung-buch',
        kind: 'bedeutung',
        prompt: 'Welches Wort bedeutet „viele Seiten mit Text zum Lesen“?',
        options: ['das Buch', 'der Bus', 'der Käse', 'die Milch'],
        correctIndex: 0
    },
    {
        id: 'bedeutung-tasse',
        kind: 'bedeutung',
        prompt: 'Welches Wort bedeutet „ein kleines Gefäß für Kaffee oder Tee“?',
        options: ['der Tisch', 'die Tasse', 'das Fahrrad', 'der Computer'],
        correctIndex: 1
    },
    {
        id: 'bedeutung-kaese',
        kind: 'bedeutung',
        prompt: 'Welches Wort bedeutet „ein Lebensmittel aus Milch“?',
        options: ['der Apfel', 'das Brot', 'der Käse', 'der Bus'],
        correctIndex: 2
    },
    {
        id: 'bedeutung-computer',
        kind: 'bedeutung',
        prompt: 'Welches Wort bedeutet „ein Gerät zum Arbeiten und Spielen am Bildschirm“?',
        options: ['der Computer', 'die Lampe', 'das Brot', 'die Schule'],
        correctIndex: 0
    },
    {
        id: 'bedeutung-supermarkt',
        kind: 'bedeutung',
        prompt: 'Welches Wort bedeutet „ein großes Geschäft für Lebensmittel“?',
        options: ['die Schule', 'der Supermarkt', 'das Restaurant', 'der Park'],
        correctIndex: 1
    },
    {
        id: 'bedeutung-restaurant',
        kind: 'bedeutung',
        prompt: 'Welches Wort bedeutet „ein Ort, an dem man Essen bestellt“?',
        options: ['der Bus', 'das Fahrrad', 'das Restaurant', 'das Buch'],
        correctIndex: 2
    }
];
exports.QUIZ_CONFIG = {
    questionsPerRound: 10,
    questionMs: 15000,
    revealMs: 3000,
    points: [100, 60, 30]
};
exports.COOP_QUESTS = {
    City: {
        id: 'city_quest',
        title: 'Orientierung in der Stadt',
        tasks: [
            { key: 'bus', de: 'der Bus', article: 'der', completed: false },
            { key: 'bicycle', de: 'das Fahrrad', article: 'das', completed: false },
            { key: 'drug store', de: 'die Apotheke', article: 'die', completed: false },
            { key: 'car', de: 'das Auto', article: 'das', completed: false }
        ]
    },
    House: {
        id: 'house_quest',
        title: 'Mein gemütliches Zuhause',
        tasks: [
            { key: 'bed', de: 'das Bett', article: 'das', completed: false },
            { key: 'fridge', de: 'der Kühlschrank', article: 'der', completed: false },
            { key: 'lamp', de: 'die Lampe', article: 'die', completed: false },
            { key: 'sofa', de: 'das Sofa', article: 'das', completed: false }
        ]
    },
    Classroom: {
        id: 'classroom_quest',
        title: 'Erster Tag in der Schule',
        tasks: [
            { key: 'black board', de: 'die Tafel', article: 'die', completed: false },
            { key: 'book', de: 'das Buch', article: 'das', completed: false },
            { key: 'computer', de: 'der Computer', article: 'der', completed: false },
            { key: 'pen', de: 'der Kugelschreiber', article: 'der', completed: false }
        ]
    },
    Restaurant: {
        id: 'restaurant_quest',
        title: 'Im Restaurant & Café',
        tasks: [
            { key: 'table', de: 'der Tisch', article: 'der', completed: false },
            { key: 'menu', de: 'die Speisekarte', article: 'die', completed: false },
            { key: 'glass', de: 'das Glas', article: 'das', completed: false },
            { key: 'cup', de: 'die Tasse', article: 'die', completed: false }
        ]
    },
    Supermarket: {
        id: 'supermarket_quest',
        title: 'Einkauf für das Abendessen',
        tasks: [
            { key: 'apple', de: 'der Apfel', article: 'der', completed: false },
            { key: 'bread', de: 'das Brot', article: 'das', completed: false },
            { key: 'milk', de: 'die Milch', article: 'die', completed: false },
            { key: 'cheese', de: 'der Käse', article: 'der', completed: false }
        ]
    }
};
exports.LEVEL_NAMES = {
    '1': 'Stadt',
    '2': 'Haus',
    '3': 'Klassenzimmer',
    '4': 'Restaurant',
    '5': 'Supermarkt'
};
function getCoopQuest(level) {
    const template = exports.COOP_QUESTS[exports.LEVEL_NAMES[level] || 'City'] || exports.COOP_QUESTS.City;
    return {
        id: template.id,
        title: template.title,
        tasks: template.tasks.map((task) => ({ ...task, completed: false })),
        contributors: {}
    };
}
function buildHuntSpawns() {
    return exports.HUNT_SPAWNS.map((spawn) => {
        const item = exports.HUNT_ITEMS[spawn.key];
        return {
            ...spawn,
            de: item?.de || spawn.key,
            article: item?.article,
            example: item?.example
        };
    });
}
