from spellchecker import SpellChecker
from grammarbot import GrammarBotClient
import io
from PyPDF2 import PdfReader

spell = SpellChecker()
grammar_client = GrammarBotClient()

def pdf_to_text(file_obj):
    reader = PdfReader(io.BytesIO(file_obj.read()))
    text = ''
    for page in reader.pages:
        text += page.extract_text() + '\n'
    return text


def check_spelling(text):
    spell = SpellChecker()
    words = text.split()
    errors = []

    for word in words:
        if spell.unknown([word]):
            suggestions = spell.candidates(word)
            if suggestions:  # Check if suggestions is not empty or None
                errors.append({
                    'word': word,
                    'suggestions': list(suggestions)
                })
            else:
                # If there are no suggestions, you can choose to handle it in a way that fits your needs
                errors.append({
                    'word': word,
                    'suggestions': []  # Empty list if no suggestions found
                })

    return errors if errors else []  # Ensure it returns an empty list instead of None


def check_grammar(text):
    try:
        res = grammar_client.check(text)
        errors = []
        for match in res.matches:
            errors.append({
                'message': match.message,
                'offset': match.offset,
                'length': match.length,
                'replacements': [r.value for r in match.replacements]
            })
        return errors
    except Exception as e:
        print(f"Grammar check error: {e}")
        return []
