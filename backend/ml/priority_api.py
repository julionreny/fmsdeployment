import sys
import joblib
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

model_path = os.path.join(BASE_DIR, "priority_model.pkl")
vectorizer_path = os.path.join(BASE_DIR, "vectorizer.pkl")

model = joblib.load(model_path)
vectorizer = joblib.load(vectorizer_path)

# text from node
text = sys.argv[1]

vec = vectorizer.transform([text])
prediction = model.predict(vec)[0]

print(prediction)