from mongoengine import connect
from urllib.parse import quote_plus

username = quote_plus("John")
password = quote_plus("JohnDoe256")

connect(
    db="resumejobf",
    host=f"mongodb+srv://{username}:{password}@resumejobf.hm4jqor.mongodb.net/resumejobf?retryWrites=true&w=majority",
    alias="default"
)
