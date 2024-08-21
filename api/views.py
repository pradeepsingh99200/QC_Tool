from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser
from rest_framework import status
from .utils import pdf_to_text, check_spelling, check_grammar
import logging
from PyPDF2 import PdfReader 
import io

logger = logging.getLogger(__name__)

def pdf_to_text(file_obj, page_number):
    reader = PdfReader(io.BytesIO(file_obj.read()))
    text = reader.pages[page_number - 1].extract_text() if page_number <= len(reader.pages) else ""
    return text, len(reader.pages)

class PDFUploadView(APIView):
    parser_classes = [MultiPartParser]

    def post(self, request, *args, **kwargs):
        try:
            file_obj = request.FILES['file']
            page_number = int(request.data.get('page', 1))
            text, total_pages = pdf_to_text(file_obj, page_number)
            return Response({'text': text, 'total_pages': total_pages})
        except Exception as e:
            logger.error(f"Error processing PDF: {e}")
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
            

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
        
