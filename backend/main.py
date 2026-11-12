
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="Portfolio Administration Réseaux",
    description="API du portfolio Administration Réseaux et Systèmes",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def accueil():
    return {
        "message": "Bienvenue sur l'API du portfolio",
        "statut": "success"
    }

@app.get("/api/competences")
def obtenir_competences():
    return {
        "competences": [
            "Administration Réseaux",
            "Infrastructure Informatique",
            "Administration Systèmes",
            "Cybersécurité",
            "Active Directory",
            "GNS3",
            "Développement Web et Applications",
        ]
    }

@app.get("/api/projets")
def obtenir_projets():
    return {
        "projets": [
            {
                "titre": "Infrastructure Active Directory",
                "categorie": "Systèmes",
                "technologies": [
                    "Windows Server",
                    "AD DS",
                    "DNS",
                    "GPO"
                ]
            },
            {
                "titre": "Simulation Réseau GNS3",
                "categorie": "Réseaux",
                "technologies": [
                    "GNS3",
                    "TCP/IP",
                    "Routage",
                    "VLAN"
                ]
            },
            {
                "titre": "Application Web",
                "categorie": "Développement",
                "technologies": [
                    "React",
                    "Python",
                    "FastAPI"
                ]
            }
        ]
    }

