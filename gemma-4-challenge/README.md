# Gemma 4 Error Log Simplifier

Gemma 4 Error Log Simplifier is a lightweight web application that converts raw error logs into clear, structured debugging insights using the Gemma 4 model via the Gemini API.

## Features

- Analyze error logs from multiple domains:
  - Backend (Python, Java, Node.js)
  - Frontend (JavaScript, React)
  - Database (SQL errors)
  - DevOps (Docker, system logs)
- Structured output:
  - Error Summary
  - Possible Causes
  - How to Debug
  - Suggested Fix
- Simple web interface for fast input and results
- Retry mechanism to handle temporary API failures
- Local-first setup (no deployment required)

## What You Can Input

This tool works best with **real error messages, stack traces, or logs**.

### Python Errors

```text
ModuleNotFoundError: No module named 'requests'
```
```text
AttributeError: 'NoneType' object has no attribute 'get'
```
```text
RuntimeError: Event loop is closed
```

### JavaScript / Frontend Errors
```text
TypeError: Cannot read properties of undefined (reading 'map')
```
```text
ReferenceError: fetch is not defined
```

### Java Errors
```text
Exception in thread "main" java.lang.NullPointerException
```

### Database Errors
```text
psycopg2.errors.UniqueViolation: duplicate key value violates unique constraint "users_email_key"
```

### DevOps / Docker Errors
```text
Error response from daemon: pull access denied for my-app, repository does not exist or may require 'docker login'
```

### Full Stack Traces
```text
Traceback (most recent call last):
  File "app.py", line 10, in <module>
    import requests
ModuleNotFoundError: No module named 'requests'
```

## How It Works
* The user pastes an error log into the UI
* The backend sends a structured prompt to Gemma 4
* The model analyzes the input and returns structured debugging insights
* The UI displays the result in a readable format

## Local Setup
1. Install dependencies
```bash
poetry install
```
2. Configure environment variables
- Create a .env file:
```bash
GEMINI_API_KEY=YOUR_API_KEY
GEMMA_MODEL=gemma-4-26b-a4b-it
```

3. Run the application
```bash
poetry run uvicorn app.main:app --reload
```
- Open in browser:
```bash
http://127.0.0.1:8000
```

## Usage
* Paste an error message or log
* Click Analyze
* Review the structured debugging output

## Example Output
1. Error Summary
This error occurs when calling .get() on a None object.

2. Possible Causes
- Variable not initialized
- Function returned None

3. How to Debug
- Inspect variable values
- Trace assignment flow

4. Suggested Fix
- Add null checks
- Ensure valid return values

## Notes
* Works best with real error logs instead of vague descriptions
* Gemini / Gemma API may occasionally return errors due to high load
* Retry logic is implemented to improve reliability
* API usage may incur costs depending on your plan

## Future Improvements
* Structured JSON output
* Better UI formatting (section-based rendering)
* Copy-to-clipboard support
* Optional deployment
    
## Disclaimer

* This project is for learning and demonstration purposes.
* Always validate AI-generated debugging suggestions before using them in production systems.

## Demo
[Watch Demo on YouTube](https://youtu.be/HuebT1qLTmM)

[![Demo Video](https://img.youtube.com/vi/HuebT1qLTmM/0.jpg)](https://youtu.be/HuebT1qLTmM)