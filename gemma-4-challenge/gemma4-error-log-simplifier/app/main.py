from fastapi import FastAPI, Form, Request
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

from app.services.gemma_client import GemmaClient

app = FastAPI(title="Gemma 4 Error Log Simplifier")
app.mount("/static", StaticFiles(directory="app/static"), name="static")

templates = Jinja2Templates(directory="app/templates")
gemma_client = GemmaClient()


@app.get("/", response_class=HTMLResponse)
async def home(request: Request):
    return templates.TemplateResponse(
        request=request,
        name="index.html",
        context={
            "request": request,
            "result": None,
            "error_log": "",
            "error_message": None,
        },
    )


@app.post("/", response_class=HTMLResponse)
async def analyze(request: Request, error_log: str = Form(...)):
    result = None
    error_message = None

    try:
        result = gemma_client.analyze_error_log(error_log)
    except Exception as exc:
        error_message = f"Analysis failed: {str(exc)}"

    return templates.TemplateResponse(
        request=request,
        name="index.html",
        context={
            "request": request,
            "result": result,
            "error_log": error_log,
            "error_message": error_message,
        },
    )