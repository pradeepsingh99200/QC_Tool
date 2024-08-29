import io
from PyPDF2 import PdfReader 
import pdfplumber
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser ,FormParser
from rest_framework import status
from .utils import pdf_to_text_exact_layout, check_spelling, check_grammar
import logging
from django.http import JsonResponse
from io import BytesIO
from django.http import HttpResponse
from rest_framework.decorators import api_view
from reportlab.pdfgen import canvas

logger = logging.getLogger(__name__)

def pdf_to_text(file_obj, page_number):
    reader = PdfReader(io.BytesIO(file_obj.read()))
    text = reader.pages[page_number - 1].extract_text() if page_number <= len(reader.pages) else ""
    return text, len(reader.pages)

class PDFUploadView(APIView):
    parser_classes = (MultiPartParser, FormParser)

    def post(self, request, *args, **kwargs):
        file_obj = request.FILES.get('file')
        page_number = int(request.POST.get('page', 1))  

        if not file_obj:
            return JsonResponse({'error': 'No file uploaded'}, status=400)

        try: 
            with pdfplumber.open(file_obj) as pdf:
                if page_number < 1 or page_number > len(pdf.pages):
                    return JsonResponse({'error': 'Page number out of range'}, status=400)

                page = pdf.pages[page_number - 1]
                text = page.extract_text(x_tolerance=1, y_tolerance=1) or ''
                return JsonResponse({'text': text, 'total_pages': len(pdf.pages)})

        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
        
class SpellCheckView(APIView):
    def post(self, request, *args, **kwargs):
        text = request.data.get('text', "")
        corrected_text = check_spelling(text)
        return Response({'errors': corrected_text})


class GrammarCheckView(APIView):
    def post(self , request, *args, **kwargs):
        try:
            text = request.data.get('text', '')
            logger.debug(f"Received text for grammar check: {text}")
            errors = check_grammar(text)
            return Response({'errors': errors})
        except Exception as e:
            logger.error(f"Failed to check grammar: {e}")
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        


@api_view(['POST'])
def generate_pdf(request):
    try:
        text = request.data.get('text', '')
        edits = request.data.get('edits', [])  

        buffer = BytesIO()
        c = canvas.Canvas(buffer, pagesize= letter )
        c.drawString(100, 750, text)
        
        for edit in edits:
            x, y, comment = edit['x'], edit['y'], edit['comment']
            c.drawString(x, y, comment) 

        c.showPage()    
        c.save()
        
        buffer.seek(0)
        return HttpResponse(buffer, content_type='application/pdf')
    except Exception as e:
        return HttpResponse(f"Error generating PDF: {str(e)}", status=500)
