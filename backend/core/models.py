from mongoengine import Document, StringField,ListField, EmailField, connect,disconnect

from mongoengine import connect
from urllib.parse import quote_plus

username = quote_plus("John")
password = quote_plus("JohnDoe256")

connect(
    db="resumejobf",
    host=f"mongodb+srv://{username}:{password}@resumejobf.hm4jqor.mongodb.net/resumejobf?retryWrites=true&w=majority",
    alias="default"
)


class ResumeData(Document):
    name = StringField()
    email = EmailField()
    phone = StringField()
    skills = ListField(StringField())
    experience = StringField()  # ✅ New field for experience
    extracted_text = StringField()  # Optional: full extracted resume text
