import fitz  # PyMuPDF
import io
import re
from typing import Dict, Any

class PDFService:
    ACADEMIC_RESEARCH_SIGNALS = [
        r'\b(abstract|introduction|methodology|methods|experiments|experimental|results|discussion|conclusion|references|literature|dataset|framework|evaluation|proposed|model|algorithm|architecture|benchmark)\b'
    ]

    @staticmethod
    def extract_text_from_pdf(pdf_bytes: bytes) -> str:
        """Extracts plain text from a PDF byte array."""
        text = ""
        try:
            pdf_document = fitz.open(stream=pdf_bytes, filetype="pdf")
            for page_num in range(pdf_document.page_count):
                page = pdf_document.load_page(page_num)
                text += page.get_text() + "\n"
            pdf_document.close()
        except Exception as e:
            print(f"Error reading PDF text: {e}")
        return text

    @staticmethod
    def extract_metadata(pdf_bytes: bytes) -> dict:
        """Extracts PDF document metadata."""
        metadata = {}
        try:
            pdf_document = fitz.open(stream=pdf_bytes, filetype="pdf")
            metadata = pdf_document.metadata or {}
            pdf_document.close()
        except Exception as e:
            print(f"Error extracting metadata: {e}")
        return metadata

    @staticmethod
    def analyze_pdf_paper(pdf_bytes: bytes, filename: str) -> Dict[str, Any]:
        """
        Validates, parses, and extracts structured research intelligence from an uploaded PDF.
        Derives title, abstract, authors, limitations, and an auto-detected research topic.
        """
        text = PDFService.extract_text_from_pdf(pdf_bytes)
        clean_text = text.strip()
        
        # 1. Check readability & minimum length
        words = re.findall(r'\b[a-zA-Z]{3,}\b', clean_text)
        if len(words) < 40:
            raise ValueError("We couldn't extract meaningful research content from this file. Please upload a valid research paper PDF.")

        # 2. Check academic/scientific research content density
        text_lower = clean_text.lower()
        matches = sum(1 for pattern in PDFService.ACADEMIC_RESEARCH_SIGNALS if re.search(pattern, text_lower))
        
        # Additional research signal keywords
        kw_hits = sum(1 for kw in ["paper", "study", "research", "method", "dataset", "results", "analysis", "accuracy", "performance", "proposed"] if kw in text_lower)
        
        if matches == 0 and kw_hits < 3:
            raise ValueError("The uploaded document does not appear to contain sufficient research content for AIRIP analysis. Please upload a research paper, technical paper, thesis, or research document.")

        # 3. Extract Metadata Title & Fallbacks
        meta = PDFService.extract_metadata(pdf_bytes)
        title = meta.get("title", "").strip() if meta else ""
        
        # Fallback to page 1 text heuristic
        if not title or len(title) < 5 or title.lower().endswith(".pdf") or "untitled" in title.lower():
            lines = [l.strip() for l in text.split("\n") if len(l.strip()) > 8]
            if lines:
                title = lines[0]
                if len(title) > 120 and len(lines) > 1:
                    title = lines[1]

        if not title or len(title) < 5:
            title = filename.replace(".pdf", "").replace("_", " ").replace("-", " ").title()

        # 4. Extract Abstract
        abstract = ""
        abstract_match = re.search(r'(?i)abstract[:\s]+(.*?)(?=\n\s*(1[\.\s]|introduction|keywords|1\.\s+intro))', text, re.DOTALL)
        if abstract_match:
            abstract = abstract_match.group(1).strip()
        else:
            # Fallback: Top 250 words of paper
            abstract = " ".join(words[:250])

        if len(abstract) > 1200:
            abstract = abstract[:1200] + "..."

        # 5. Auto-Detect / Infer Research Topic from Title & Abstract
        stopwords = {"this", "that", "with", "from", "these", "those", "which", "paper", "study", "research", "proposed", "model", "method", "results", "using", "based", "approach", "performance", "analysis", "system", "authors"}
        topic_candidates = [w.title() for w in re.findall(r'\b[A-Za-z]{4,}\b', f"{title} {abstract}") if w.lower() not in stopwords]
        
        counts = {}
        for tc in topic_candidates:
            counts[tc] = counts.get(tc, 0) + 1
            
        sorted_concepts = sorted(counts.items(), key=lambda x: x[1], reverse=True)
        top_concepts = [c[0] for c in sorted_concepts[:3]]
        
        if top_concepts:
            inferred_topic = f"{' '.join(top_concepts)} Analysis"
        else:
            inferred_topic = title[:60]

        # 6. Extract Authors
        author_str = meta.get("author", "").strip() if meta else ""
        if not author_str:
            author_str = "Primary Research Authors"

        return {
            "title": title,
            "abstract": abstract,
            "authors": [a.strip() for a in author_str.split(",") if a.strip()],
            "inferred_topic": inferred_topic,
            "full_text": clean_text[:8000],
            "year": meta.get("creationDate", "")[:4] if meta and meta.get("creationDate") else "2024",
            "venue": "Uploaded Publication (PDF)"
        }
