import os
import time

from dotenv import load_dotenv
from google import genai

from app.prompts import SYSTEM_PROMPT

load_dotenv()


class GemmaClient:
    def __init__(self) -> None:
        api_key = os.getenv("GEMINI_API_KEY")
        self.model = os.getenv("GEMMA_MODEL", "gemma-4-26b-a4b-it")

        print("Loaded model:", self.model)
        print("API key exists:", bool(api_key))

        if not api_key:
            raise ValueError("GEMINI_API_KEY is not set. Please check your .env file.")

        self.client = genai.Client(api_key=api_key)

    def analyze_error_log(self, error_log: str) -> str:
        prompt = f"""{SYSTEM_PROMPT}

Error log:
{error_log}
"""

        last_error = None

        for attempt in range(3):
            try:
                response = self.client.models.generate_content(
                    model=self.model,
                    contents=prompt,
                )
                return response.text or "No response received."
            except Exception as exc:
                last_error = exc
                print(f"Attempt {attempt + 1} failed: {exc}")
                time.sleep(2)

        raise RuntimeError(f"Gemma API failed after 3 retries: {last_error}")