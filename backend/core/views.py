from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .models import ResumeData
from .utils import extract_email, extract_phone, extract_name, extract_skills, extract_experience
from .job_finder import scrape_internshala_jobs
from django.core.validators import EmailValidator
from django.core.exceptions import ValidationError
import PyPDF2
import docx
from datetime import datetime

# ---------------- EMAIL VALIDATOR ----------------
def validate_email(email):
    validator = EmailValidator()
    try:
        validator(email)
        return True
    except ValidationError:
        return False

# ---------------- TEXT EXTRACTOR ----------------
def extract_text_from_docx(file):
    doc = docx.Document(file)
    return "\n".join(para.text for para in doc.paragraphs)

# ---------------- SKILL MATCHER ----------------
def count_matching_skills(job, skills):
    fields = [
        job.get("title", ""),
        job.get("location", ""),
        job.get("salary", "")
    ]
    combined = " ".join(fields).lower()
    return sum(1 for skill in skills if skill.lower() in combined)

# ---------------- RESUME UPLOAD VIEW ----------------
@csrf_exempt
def upload_resume(request):
    if request.method == 'POST' and request.FILES.get('resume'):
        f = request.FILES['resume']
        ext = f.name.split('.')[-1].lower()

        if f.size > 10 * 1024 * 1024:
            return JsonResponse({'error': 'File too large. Maximum size is 10MB.'}, status=400)

        try:
            text = ""
            if ext == 'pdf':
                reader = PyPDF2.PdfReader(f)
                for p in reader.pages:
                    text += p.extract_text() or ""
            elif ext == 'docx':
                text = extract_text_from_docx(f)
            else:
                return JsonResponse({'error': 'Only PDF or DOCX files are allowed.'}, status=400)
        except Exception as e:
            return JsonResponse({'error': f'Failed to read resume: {str(e)}'}, status=500)

        name = extract_name(text)
        email = extract_email(text)
        phone = extract_phone(text)
        skills = extract_skills(text)
        experience = extract_experience(text)

        if not email or not validate_email(email):
            return JsonResponse({'error': 'Invalid or missing email address'}, status=400)

        if not skills:
            return JsonResponse({'error': 'No skills found in the resume.'}, status=400)

        # Save extracted data
        ResumeData.objects.create(
            name=name,
            email=email,
            phone=phone,
            skills=skills,
            experience=experience
        )

        # Fetch and match Internshala jobs
        all_jobs = []
        for skill in skills:
            all_jobs += scrape_internshala_jobs([skill])

        # Count matching skills
        for job in all_jobs:
            job["matching_skills"] = count_matching_skills(job, skills)

        # Deduplicate by (title, company)
        unique_jobs = {(job['title'], job.get('company_name', 'Unknown')): job for job in all_jobs}
        all_jobs = list(unique_jobs.values())

        # Sort by matching_skills (descending) and select top 5
        sorted_jobs = sorted(all_jobs, key=lambda x: -x.get("matching_skills", 0))
        top_matches = sorted_jobs[:5]

        print(f"[DEBUG] Extracted skills from resume: {skills}")
        print(f"[DEBUG] Top matching Internshala jobs: {top_matches}")

        return JsonResponse({
            'message': 'Resume processed successfully!',
            'matches': top_matches,
            'extracted': {
                'name': name,
                'email': email,
                'phone': phone,
                'skills': skills,
                'experience': experience
            }
        })

    return JsonResponse({'error': 'Invalid request. POST with resume file required.'}, status=400)
