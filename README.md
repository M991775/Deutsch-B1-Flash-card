# Deutsch-B1-Flash-card
German B1 vocbulary flashcards (self use)
1. Introduction
Deutsch1000 is a German vocabulary learning website designed to help learners improve their German vocabulary from A2 to B1 level.

The project aims to contain 1,000 German vocabulary words, divided into four categories:
- Nouns (Nomen)
- Verbs (Verben)
- Adjectives (Adjektive)
- Adverbs (Adverbien)
The goal is to add 50 new words every day.

The website supports German, English and Chinese translations.
2. Project Files
Keep all five files in the same folder.
- index.html – Main website structure.
- styles.css – Website appearance, colours and responsive design.
- app.js – Flashcards, vocabulary filters and learning progress.
- vocabulary.json – Stores all German vocabulary.
- README.md – Project documentation and instructions.
Each file has a different purpose. Do not combine their contents into one file.
3. How to Run the Website
The website uses JavaScript fetch() to load vocabulary.json, so you should run it through a local web server.

Recommended method: Visual Studio Code with Live Server.
1. Open your project folder in Visual Studio Code.
2. Install the Live Server extension.
3. Right-click index.html.
4. Select Open with Live Server.
5. Your browser will open the website.
4. Vocabulary Categories
Every vocabulary entry must have a type field.

Supported categories:
- noun
- verb
- adjective
- adverb
Nouns
Include:
- German word with article.
- Plural form.
- English meaning.
- Chinese meaning.
- Example sentence and translations.
Verbs
Include:
- Infinitive.
- Präteritum.
- Perfekt.
- Verb-preposition combinations when applicable.
- Example sentence and translations.
Adjectives
Include:
- Basic form.
- English and Chinese meanings.
- Komparativ.
- Superlativ.
- Example sentence and translations.
Adverbs
Include:
- German word.
- English and Chinese meanings.
- Example sentence and translations.
5. How to Add New Vocabulary
Open vocabulary.json.

The file contains a JSON array. Add new vocabulary entries inside the square brackets.
