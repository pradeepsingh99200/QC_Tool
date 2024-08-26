from django.urls import path
from .views import PDFUploadView, SpellCheckView, GrammarCheckView, generate_pdf

urlpatterns = [
    path('upload/', PDFUploadView.as_view(), name='pdf-upload'),
    path('spellcheck/', SpellCheckView.as_view(), name='spell-check'),
    path('grammarcheck/', GrammarCheckView.as_view(), name='grammar-check'),
    path('generate-pdf/', generate_pdf, name='generate-pdf'),
]
