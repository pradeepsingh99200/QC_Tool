from venv import logger
import pdfplumber
from spellchecker import SpellChecker
from grammarbot import GrammarBotClient
import io
from io import BytesIO
from django.http import HttpResponse
from reportlab.pdfgen import canvas
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view

spell = SpellChecker()
grammar_client = GrammarBotClient()

def pdf_to_text_exact_layout(file_obj):
    text = ''
    try:
        with pdfplumber.open(file_obj) as pdf:
            for page in pdf.pages:
                
                page_text = page.extract_text(x_tolerance=1, y_tolerance=1)
                if page_text:
                    text += page_text + '\n'
    except Exception as e:
        logger.error(f"Error extracting text from PDF: {e}")
        raise
    return text

def check_spelling(text):
    if not text.strip():  
        return []

    words = text.split()
    errors = []

    for word in words:
        if spell.unknown([word]):
            suggestions = spell.candidates(word)
            errors.append({
                'word': word,
                'suggestions': list(suggestions) if suggestions else []
            })

    return errors

def check_grammar(text):
    if not text.strip():  
        return []

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
        logger.error(f"Grammar check error: {e}")
        return []
    



@api_view(['POST'])
@csrf_exempt
def generate_pdf(request):
    text = request.data.get('text', '')

    buffer = BytesIO()
    p = canvas.Canvas(buffer)
    p.drawString(100, 750, text)
    p.showPage()
    p.save()

    buffer.seek(0)
    return HttpResponse(buffer, as_attachment=True, content_type='application/pdf',
                         headers={'Content-Disposition': 'attachment; filename="edited_document.pdf"'})

