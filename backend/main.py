
import os
import sqlite3
import secrets
import hashlib
import json
import uuid

from pathlib import Path
from datetime import datetime, timedelta, timezone

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Depends, Request, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, EmailStr, Field
from jose import JWTError, jwt
from pwdlib import PasswordHash


# CONFIGURATION
DOSSIER = Path(__file__).resolve().parent
DB_PATH = DOSSIER / "portfolio.db"
UPLOAD_DIR = DOSSIER / "uploads" / "projets"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

load_dotenv(DOSSIER / ".env")

ADMIN_USERNAME = os.getenv("ADMIN_USERNAME", "")
ADMIN_PASSWORD_HASH = os.getenv("ADMIN_PASSWORD_HASH", "")
SECRET_KEY = os.getenv("SECRET_KEY", "")

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

password_hash = PasswordHash.recommended()
security = HTTPBearer(auto_error=False)


# APPLICATION
app = FastAPI(
    title="Portfolio Administration Réseaux",
    description="API du portfolio de MAHATRANGA Patrick",
    version="3.0.0"
)

FRONTEND_URL = os.getenv("FRONTEND_URL", "").rstrip("/")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        origin for origin in [
            "http://localhost:5173",
            "http://127.0.0.1:5173",
            "http://localhost:5178",
            "http://127.0.0.1:5178",
            FRONTEND_URL,
        ] if origin
    ],
    allow_origin_regex=r"^https?://(localhost|127\\.0\\.0\\.1):5[0-9]{3}$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.mount("/uploads", StaticFiles(directory=str(DOSSIER / "uploads")), name="uploads")


# BASE DE DONNEES
def obtenir_connexion():
    connexion = sqlite3.connect(DB_PATH)
    connexion.row_factory = sqlite3.Row
    return connexion


def initialiser_base():
    with obtenir_connexion() as connexion:
        connexion.execute("""
            CREATE TABLE IF NOT EXISTS messages (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nom TEXT NOT NULL,
                email TEXT NOT NULL,
                sujet TEXT NOT NULL,
                message TEXT NOT NULL,
                date_creation DATETIME DEFAULT CURRENT_TIMESTAMP,
                lu INTEGER NOT NULL DEFAULT 0
            )
        """)

        connexion.execute("""
            CREATE TABLE IF NOT EXISTS admin_login_attempts (
                ip TEXT PRIMARY KEY,
                failed_attempts INTEGER NOT NULL DEFAULT 0,
                locked_until TEXT
            )
        """)

        connexion.execute("""
            CREATE TABLE IF NOT EXISTS admin_sessions (
                jti_hash TEXT PRIMARY KEY,
                expires_at TEXT NOT NULL
            )
        """)


        connexion.execute("""
            CREATE TABLE IF NOT EXISTS projets (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                titre TEXT NOT NULL,
                categorie TEXT NOT NULL,
                description TEXT NOT NULL DEFAULT '',
                technologies TEXT NOT NULL DEFAULT '[]',
                date_creation DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        """)

        connexion.execute("""
            CREATE TABLE IF NOT EXISTS projet_images (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                projet_id INTEGER NOT NULL,
                chemin TEXT NOT NULL,
                date_creation DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (projet_id) REFERENCES projets(id) ON DELETE CASCADE
            )
        """)

        # Conserver les anciens projets de l'API
        nombre_projets = connexion.execute(
            "SELECT COUNT(*) FROM projets"
        ).fetchone()[0]

        if nombre_projets == 0:
            anciens_projets = [
                (
                    "Infrastructure Active Directory",
                    "Systèmes",
                    "Mise en place et administration d'un environnement Active Directory.",
                    ["Windows Server", "AD DS", "DNS", "GPO"]
                ),
                (
                    "Simulation Réseau GNS3",
                    "Réseaux",
                    "Conception et simulation d'une infrastructure réseau.",
                    ["GNS3", "TCP/IP", "Routage", "VLAN"]
                ),
                (
                    "Application Web",
                    "Développement",
                    "Développement d'une application web avec React et FastAPI.",
                    ["React", "Python", "FastAPI"]
                )
            ]

            for titre, categorie, description, technologies in anciens_projets:
                connexion.execute(
                    """INSERT INTO projets
                    (titre, categorie, description, technologies)
                    VALUES (?, ?, ?, ?)""",
                    (titre, categorie, description, json.dumps(technologies))
                )

        # Ajouter la colonne lu aux anciennes bases
        colonnes = connexion.execute(
            "PRAGMA table_info(messages)"
        ).fetchall()

        if not any(colonne["name"] == "lu" for colonne in colonnes):
            connexion.execute("""
                ALTER TABLE messages
                ADD COLUMN lu INTEGER NOT NULL DEFAULT 0
            """)
initialiser_base()
# MODELES
class MessageContact(BaseModel):
    nom: str = Field(min_length=2, max_length=100)
    email: EmailStr
    sujet: str = Field(min_length=3, max_length=150)
    message: str = Field(min_length=10, max_length=3000)


class ConnexionAdmin(BaseModel):
    username: str
    password: str


# AUTHENTIFICATION
def verifier_admin(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    if not SECRET_KEY or not ADMIN_USERNAME:
        raise HTTPException(
            status_code=503,
            detail="Configuration administrateur incomplète."
        )

    if credentials is None:
        raise HTTPException(
            status_code=401,
            detail="Authentification nécessaire."
        )

    try:
        payload = jwt.decode(
            credentials.credentials,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )

        username = payload.get("sub")

        if not username or not secrets.compare_digest(
            username, ADMIN_USERNAME
        ):
            raise HTTPException(
                status_code=401,
                detail="Session administrateur invalide."
            )

        identifiant_session = payload.get("jti")

        if not identifiant_session:
            raise HTTPException(
                status_code=401,
                detail="Session invalide. Veuillez vous reconnecter."
            )

        empreinte = hashlib.sha256(
            identifiant_session.encode()
        ).hexdigest()

        with obtenir_connexion() as connexion:
            session = connexion.execute(
                "SELECT expires_at FROM admin_sessions WHERE jti_hash = ?",
                (empreinte,)
            ).fetchone()

        if session is None:
            raise HTTPException(
                status_code=401,
                detail="Session révoquée ou inconnue. Veuillez vous reconnecter."
            )

        if datetime.fromisoformat(session["expires_at"]) <= datetime.now(timezone.utc):
            with obtenir_connexion() as connexion:
                connexion.execute(
                    "DELETE FROM admin_sessions WHERE jti_hash = ?",
                    (empreinte,)
                )
            raise HTTPException(
                status_code=401,
                detail="Session expirée. Veuillez vous reconnecter."
            )

        return username

    except JWTError:
        raise HTTPException(
            status_code=401,
            detail="Jeton invalide ou expiré."
        )


# ACCUEIL
@app.get("/")
def accueil():
    return {
        "message": "Bienvenue sur l'API du portfolio",
        "statut": "success"
    }


# COMPETENCES
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



# GESTION DES PROJETS
EXTENSIONS_AUTORISEES = {".jpg", ".jpeg", ".png", ".webp", ".gif"}
TAILLE_MAX_IMAGE = 8 * 1024 * 1024


def formater_projet(ligne, connexion):
    images = connexion.execute(
        "SELECT id, chemin FROM projet_images WHERE projet_id = ? ORDER BY id",
        (ligne["id"],)
    ).fetchall()

    return {
        "id": ligne["id"],
        "titre": ligne["titre"],
        "categorie": ligne["categorie"],
        "description": ligne["description"],
        "technologies": json.loads(ligne["technologies"] or "[]"),
        "images": [
            {
                "id": image["id"],
                "url": "/uploads/projets/" + image["chemin"]
            }
            for image in images
        ]
    }


@app.get("/api/projets")
def obtenir_projets():
    with obtenir_connexion() as connexion:
        lignes = connexion.execute(
            "SELECT * FROM projets ORDER BY id DESC"
        ).fetchall()
        return {"projets": [formater_projet(ligne, connexion) for ligne in lignes]}


@app.get("/api/admin/projets")
def obtenir_projets_admin(admin: str = Depends(verifier_admin)):
    return obtenir_projets()


async def enregistrer_images(projet_id: int, images: list[UploadFile]):
    if len(images) > 10:
        raise HTTPException(status_code=400, detail="Maximum 10 images par envoi.")

    fichiers_crees = []

    try:
        for image in images:
            if not image.filename:
                continue

            extension = Path(image.filename).suffix.lower()
            if extension not in EXTENSIONS_AUTORISEES:
                raise HTTPException(
                    status_code=400,
                    detail=f"Format non autorisé : {extension}"
                )

            contenu = await image.read(TAILLE_MAX_IMAGE + 1)

            if len(contenu) > TAILLE_MAX_IMAGE:
                raise HTTPException(
                    status_code=400,
                    detail="Chaque image doit faire 8 Mo maximum."
                )

            if not contenu:
                raise HTTPException(status_code=400, detail="Image vide.")

            nom_fichier = f"{uuid.uuid4().hex}{extension}"
            destination = UPLOAD_DIR / nom_fichier
            destination.write_bytes(contenu)
            fichiers_crees.append(destination)

            with obtenir_connexion() as connexion:
                connexion.execute(
                    "INSERT INTO projet_images (projet_id, chemin) VALUES (?, ?)",
                    (projet_id, nom_fichier)
                )

    except Exception:
        for chemin in fichiers_crees:
            chemin.unlink(missing_ok=True)
        raise


@app.post("/api/admin/projets")
async def ajouter_projet(
    titre: str = Form(...),
    categorie: str = Form(...),
    description: str = Form(""),
    technologies: str = Form(""),
    images: list[UploadFile] = File(default=[]),
    admin: str = Depends(verifier_admin)
):
    titre = titre.strip()
    categorie = categorie.strip()

    if not titre or not categorie:
        raise HTTPException(status_code=400, detail="Titre et catégorie obligatoires.")

    liste_technologies = [
        element.strip()
        for element in technologies.split(",")
        if element.strip()
    ]

    with obtenir_connexion() as connexion:
        curseur = connexion.execute(
            """INSERT INTO projets
            (titre, categorie, description, technologies)
            VALUES (?, ?, ?, ?)""",
            (titre, categorie, description.strip(), json.dumps(liste_technologies))
        )
        projet_id = curseur.lastrowid

    await enregistrer_images(projet_id, images)

    with obtenir_connexion() as connexion:
        ligne = connexion.execute(
            "SELECT * FROM projets WHERE id = ?", (projet_id,)
        ).fetchone()
        return {"message": "Projet ajouté.", "projet": formater_projet(ligne, connexion)}


@app.put("/api/admin/projets/{projet_id}")
async def modifier_projet(
    projet_id: int,
    titre: str = Form(...),
    categorie: str = Form(...),
    description: str = Form(""),
    technologies: str = Form(""),
    images: list[UploadFile] = File(default=[]),
    admin: str = Depends(verifier_admin)
):
    with obtenir_connexion() as connexion:
        existe = connexion.execute(
            "SELECT id FROM projets WHERE id = ?", (projet_id,)
        ).fetchone()

        if existe is None:
            raise HTTPException(status_code=404, detail="Projet introuvable.")

        connexion.execute(
            """UPDATE projets
            SET titre = ?, categorie = ?, description = ?, technologies = ?
            WHERE id = ?""",
            (
                titre.strip(),
                categorie.strip(),
                description.strip(),
                json.dumps([x.strip() for x in technologies.split(",") if x.strip()]),
                projet_id
            )
        )

    await enregistrer_images(projet_id, images)

    with obtenir_connexion() as connexion:
        ligne = connexion.execute(
            "SELECT * FROM projets WHERE id = ?", (projet_id,)
        ).fetchone()
        return {"message": "Projet modifié.", "projet": formater_projet(ligne, connexion)}


@app.delete("/api/admin/projets/{projet_id}/images/{image_id}")
def supprimer_image(
    projet_id: int,
    image_id: int,
    admin: str = Depends(verifier_admin)
):
    with obtenir_connexion() as connexion:
        image = connexion.execute(
            "SELECT chemin FROM projet_images WHERE id = ? AND projet_id = ?",
            (image_id, projet_id)
        ).fetchone()

        if image is None:
            raise HTTPException(status_code=404, detail="Capture introuvable.")

        connexion.execute("DELETE FROM projet_images WHERE id = ?", (image_id,))

    (UPLOAD_DIR / image["chemin"]).unlink(missing_ok=True)
    return {"message": "Capture supprimée."}


@app.delete("/api/admin/projets/{projet_id}")
def supprimer_projet(
    projet_id: int,
    admin: str = Depends(verifier_admin)
):
    with obtenir_connexion() as connexion:
        projet = connexion.execute(
            "SELECT id FROM projets WHERE id = ?", (projet_id,)
        ).fetchone()

        if projet is None:
            raise HTTPException(status_code=404, detail="Projet introuvable.")

        images = connexion.execute(
            "SELECT chemin FROM projet_images WHERE projet_id = ?",
            (projet_id,)
        ).fetchall()

        connexion.execute("DELETE FROM projet_images WHERE projet_id = ?", (projet_id,))
        connexion.execute("DELETE FROM projets WHERE id = ?", (projet_id,))

    for image in images:
        (UPLOAD_DIR / image["chemin"]).unlink(missing_ok=True)

    return {"message": "Projet supprimé."}


# FORMULAIRE DE CONTACT
@app.post("/api/contact")
def envoyer_message(donnees: MessageContact):
    try:
        with obtenir_connexion() as connexion:
            curseur = connexion.execute(
                """
                INSERT INTO messages (nom, email, sujet, message)
                VALUES (?, ?, ?, ?)
                """,
                (
                    donnees.nom.strip(),
                    str(donnees.email),
                    donnees.sujet.strip(),
                    donnees.message.strip()
                )
            )

            identifiant = curseur.lastrowid

        return {
            "statut": "success",
            "message": "Votre message a été envoyé avec succès.",
            "id": identifiant
        }

    except sqlite3.Error:
        raise HTTPException(
            status_code=500,
            detail="Erreur lors de l'enregistrement du message."
        )


# CONNEXION ADMINISTRATEUR
@app.post("/api/admin/login")
def connexion_admin(donnees: ConnexionAdmin, request: Request):

    if not ADMIN_USERNAME or not ADMIN_PASSWORD_HASH or not SECRET_KEY:
        raise HTTPException(
            status_code=503,
            detail="Configuration administrateur incomplète."
        )

    # Protection contre les tentatives répétées par adresse IP
    adresse_ip = request.client.host if request.client else "inconnue"
    maintenant = datetime.now(timezone.utc)

    with obtenir_connexion() as connexion:
        tentative = connexion.execute(
            "SELECT failed_attempts, locked_until FROM admin_login_attempts WHERE ip = ?",
            (adresse_ip,)
        ).fetchone()

        if tentative and tentative["locked_until"]:
            fin_blocage = datetime.fromisoformat(tentative["locked_until"])

            if maintenant < fin_blocage:
                secondes = int((fin_blocage - maintenant).total_seconds())
                minutes = max(1, (secondes + 59) // 60)
                raise HTTPException(
                    status_code=429,
                    detail=f"Trop de tentatives. Réessayez dans {minutes} minute(s)."
                )

            connexion.execute(
                "DELETE FROM admin_login_attempts WHERE ip = ?",
                (adresse_ip,)
            )

    utilisateur_valide = secrets.compare_digest(
        donnees.username,
        ADMIN_USERNAME
    )

    try:
        mot_de_passe_valide = password_hash.verify(
            donnees.password,
            ADMIN_PASSWORD_HASH
        )
    except Exception:
        mot_de_passe_valide = False

    if not utilisateur_valide or not mot_de_passe_valide:
        with obtenir_connexion() as connexion:
            tentative = connexion.execute(
                "SELECT failed_attempts FROM admin_login_attempts WHERE ip = ?",
                (adresse_ip,)
            ).fetchone()

            nombre_echecs = (tentative["failed_attempts"] if tentative else 0) + 1
            fin_blocage = None

            if nombre_echecs >= 5:
                fin_blocage = (
                    maintenant + timedelta(minutes=15)
                ).isoformat()

            connexion.execute(
                """
                INSERT INTO admin_login_attempts (ip, failed_attempts, locked_until)
                VALUES (?, ?, ?)
                ON CONFLICT(ip) DO UPDATE SET
                    failed_attempts = excluded.failed_attempts,
                    locked_until = excluded.locked_until
                """,
                (adresse_ip, nombre_echecs, fin_blocage)
            )

        if nombre_echecs >= 5:
            raise HTTPException(
                status_code=429,
                detail="5 tentatives incorrectes. Connexion bloquée pendant 15 minutes."
            )

        raise HTTPException(
            status_code=401,
            detail="Identifiant ou mot de passe incorrect."
        )

    # Une connexion réussie remet le compteur à zéro
    with obtenir_connexion() as connexion:
        connexion.execute(
            "DELETE FROM admin_login_attempts WHERE ip = ?",
            (adresse_ip,)
        )

    expiration = datetime.now(timezone.utc) + timedelta(
        minutes=ACCESS_TOKEN_EXPIRE_MINUTES
    )

    identifiant_session = secrets.token_urlsafe(32)

    token = jwt.encode(
        {
            "sub": ADMIN_USERNAME,
            "exp": expiration,
            "jti": identifiant_session
        },
        SECRET_KEY,
        algorithm=ALGORITHM
    )

    empreinte = hashlib.sha256(
        identifiant_session.encode()
    ).hexdigest()

    with obtenir_connexion() as connexion:
        connexion.execute(
            "DELETE FROM admin_sessions WHERE expires_at <= ?",
            (datetime.now(timezone.utc).isoformat(),)
        )
        connexion.execute(
            "INSERT INTO admin_sessions (jti_hash, expires_at) VALUES (?, ?)",
            (empreinte, expiration.isoformat())
        )

    return {
        "statut": "success",
        "access_token": token,
        "token_type": "bearer",
        "expires_in": ACCESS_TOKEN_EXPIRE_MINUTES * 60
    }


# DECONNEXION ADMINISTRATEUR
@app.post("/api/admin/logout")
def deconnexion_admin(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    admin: str = Depends(verifier_admin)
):
    try:
        payload = jwt.decode(
            credentials.credentials,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )
        identifiant_session = payload.get("jti")

        if identifiant_session:
            empreinte = hashlib.sha256(
                identifiant_session.encode()
            ).hexdigest()

            with obtenir_connexion() as connexion:
                connexion.execute(
                    "DELETE FROM admin_sessions WHERE jti_hash = ?",
                    (empreinte,)
                )

        return {
            "statut": "success",
            "message": "Déconnexion effectuée."
        }

    except JWTError:
        raise HTTPException(
            status_code=401,
            detail="Session invalide."
        )


# STATISTIQUES ADMIN
@app.get("/api/admin/stats")
def statistiques_admin(admin: str = Depends(verifier_admin)):
    with obtenir_connexion() as connexion:
        total = connexion.execute(
            "SELECT COUNT(*) FROM messages"
        ).fetchone()[0]

        non_lus = connexion.execute(
            "SELECT COUNT(*) FROM messages WHERE lu = 0"
        ).fetchone()[0]

    return {
        "total_messages": total,
        "messages_non_lus": non_lus
    }
# MODIFIER LE STATUT LU / NON LU
@app.patch("/api/admin/messages/{message_id}/statut")
def modifier_statut_message(
    message_id: int,
    lu: bool,
    admin: str = Depends(verifier_admin)
):
    with obtenir_connexion() as connexion:
        curseur = connexion.execute(
            "UPDATE messages SET lu = ? WHERE id = ?",
            (1 if lu else 0, message_id)
        )

        if curseur.rowcount == 0:
            raise HTTPException(
                status_code=404,
                detail="Message introuvable."
            )

    return {
        "statut": "success",
        "lu": lu
    }
# LISTE DES MESSAGES
@app.get("/api/admin/messages")
def obtenir_messages(admin: str = Depends(verifier_admin)):
    with obtenir_connexion() as connexion:
        messages = connexion.execute(
            """
            SELECT id, nom, email, sujet, message, date_creation,lu
            FROM messages
            ORDER BY id DESC
            """
        ).fetchall()

    return {
        "messages": [dict(message) for message in messages]
    }


# SUPPRIMER UN MESSAGE
@app.delete("/api/admin/messages/{message_id}")
def supprimer_message(
    message_id: int,
    admin: str = Depends(verifier_admin)
):
    with obtenir_connexion() as connexion:
        curseur = connexion.execute(
            "DELETE FROM messages WHERE id = ?",
            (message_id,)
        )

        if curseur.rowcount == 0:
            raise HTTPException(
                status_code=404,
                detail="Message introuvable."
            )

    return {
        "statut": "success",
        "message": "Message supprimé avec succès."
    }

