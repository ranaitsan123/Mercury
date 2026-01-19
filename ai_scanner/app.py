from fastapi import FastAPI, Header, HTTPException
from pydantic import BaseModel
import os

from model import EmailScannerModel

API_KEY = os.getenv("SCANNER_API_KEY")
model = EmailScannerModel()

app = FastAPI(title="ML Email Scanner")

class ScanRequest(BaseModel):
    subject: str
    body: str

@app.post("/scan")
def scan_email(
    data: ScanRequest,
    x_api_key: str = Header(None),
):
    if x_api_key != API_KEY:
        raise HTTPException(status_code=401, detail="Invalid API key")

    return model.predict(data.subject, data.body)
