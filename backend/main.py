from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.v1.route.routes import router
from api.v1.service.alerts import alert
app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def read_root():
    return {"welcome to": "bus buddy"}


app.include_router(router, prefix="/api/v1")
app.include_router(alert, prefix="/api/v1/alerts")
