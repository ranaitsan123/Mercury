import joblib

class EmailScannerModel:
    def __init__(self, path="model.pkl"):
        self.model = joblib.load(path)

    def predict(self, subject: str, body: str):
        text = f"{subject} {body}"
        pred = self.model.predict([text])[0]
        proba = self.model.predict_proba([text])[0].max()

        return {
            "malicious": bool(pred),
            "confidence": round(float(proba), 2),
        }
