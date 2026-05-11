import pickle
import os

MODEL_PATH = os.path.join("ml_artifacts", "model.pkl")

def load_model():
    if not os.path.exists(MODEL_PATH):
        return None
    with open(MODEL_PATH, "rb") as f:
        return pickle.load(f)

def save_model(model):
    with open(MODEL_PATH, "wb") as f:
        pickle.dump(model, f)