
import React, { useEffect, useState, useRef } from "react";
import "./Admin.css";

const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

export default function Admin() {
  const [token, setToken] = useState(
    () => localStorage.getItem("admin_token") || ""
  );
  const [username, setUsername] = useState("patrick");
  const [password, setPassword] = useState("");
  const [stats, setStats] = useState({ total_messages: 0 });
  const [messages, setMessages] = useState([]);
  const [notification, setNotification] = useState("");
  const idsMessagesConnus = useRef(null);
  const [messageActif, setMessageActif] = useState(null);
  const [messageASupprimer, setMessageASupprimer] = useState(null);
  const [erreur, setErreur] = useState("");
  const [chargement, setChargement] = useState(false);
  const [chargementMessages, setChargementMessages] = useState(false);
const [recherche, setRecherche] = useState("");
const [filtre, setFiltre] = useState("tous");
const [filtreStatut, setFiltreStatut] = useState("tous");
const [sectionActive, setSectionActive] = useState("dashboard");
const [pageCourante, setPageCourante] = useState(1);

  // Gestion des projets
  const [projets, setProjets] = useState([]);
  const [chargementProjets, setChargementProjets] = useState(false);
  const [formulaireProjetOuvert, setFormulaireProjetOuvert] = useState(false);
  const [projetEnEdition, setProjetEnEdition] = useState(null);
  const [projetMessage, setProjetMessage] = useState("");
  const [projetErreur, setProjetErreur] = useState("");
  const [imagesProjet, setImagesProjet] = useState([]);
  const [projetForm, setProjetForm] = useState({
    titre: "",
    categorie: "",
    description: "",
    technologies: "",
  });
const messagesParPage = 10;
const messagesFiltres = messages.filter((message) => {
  const terme = recherche.toLowerCase().trim();

  const correspondRecherche =
    (message.nom || "").toLowerCase().includes(terme) ||
    (message.email || "").toLowerCase().includes(terme) ||
    (message.sujet || "").toLowerCase().includes(terme);

  const correspondFiltre =
    filtre === "tous" ||
    (filtre === "recents" &&
      new Date(message.date_creation.replace(" ", "T")) >=
        new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));

  const correspondStatut =
  filtreStatut === "tous" ||
  (filtreStatut === "lus" && Number(message.lu) === 1) ||
  (filtreStatut === "non_lus" && Number(message.lu) === 0);

return correspondRecherche && correspondFiltre && correspondStatut;
});

const nombreMessagesNonLus = messages.filter(
  (message) => Number(message.lu) !== 1
).length;

const nombreMessagesLus = messages.filter(
  (message) => Number(message.lu) === 1
).length;

const pourcentageLus = messages.length
  ? Math.round((nombreMessagesLus / messages.length) * 100)
  : 0;

const dateDuMessage = (message) =>
  new Date(String(message.date_creation || "").replace(" ", "T"));

const maintenant = new Date();

const messagesParMois = Array.from({ length: 6 }, (_, index) => {
  const date = new Date(
    maintenant.getFullYear(),
    maintenant.getMonth() - (5 - index),
    1
  );

  const total = messages.filter((message) => {
    const dateMessage = dateDuMessage(message);
    return (
      !Number.isNaN(dateMessage.getTime()) &&
      dateMessage.getMonth() === date.getMonth() &&
      dateMessage.getFullYear() === date.getFullYear()
    );
  }).length;

  return {
    label: date.toLocaleDateString("fr-FR", { month: "short" }),
    total,
  };
});

const messagesDesSeptJours = Array.from({ length: 7 }, (_, index) => {
  const date = new Date(
    maintenant.getFullYear(),
    maintenant.getMonth(),
    maintenant.getDate() - (6 - index)
  );

  const total = messages.filter((message) => {
    const dateMessage = dateDuMessage(message);
    return (
      !Number.isNaN(dateMessage.getTime()) &&
      dateMessage.getDate() === date.getDate() &&
      dateMessage.getMonth() === date.getMonth() &&
      dateMessage.getFullYear() === date.getFullYear()
    );
  }).length;

  return {
    label: date.toLocaleDateString("fr-FR", { weekday: "short" }),
    total,
  };
});

const maximumMensuel = Math.max(1, ...messagesParMois.map((item) => item.total));
const maximumHebdomadaire = Math.max(1, ...messagesDesSeptJours.map((item) => item.total));

const nombrePages = Math.max(
  1,
  Math.ceil(messagesFiltres.length / messagesParPage)
);

const messagesPage = messagesFiltres.slice(
  (pageCourante - 1) * messagesParPage,
  pageCourante * messagesParPage
);

useEffect(() => {
  setPageCourante(1);
}, [recherche, filtre, filtreStatut]);

useEffect(() => {
  if (pageCourante > nombrePages) {
    setPageCourante(nombrePages);
  }
}, [pageCourante, nombrePages]);


  function exporterMessagesPDF() {
    if (messagesFiltres.length === 0) {
      alert("Aucun message à exporter.");
      return;
    }

    const echapper = (valeur) =>
      String(valeur ?? "").replace(/[&<>"']/g, (caractere) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
      })[caractere]);

    const lignes = messagesFiltres.map((message) => `
      <article class="message">
        <h2>${echapper(message.sujet || "Sans sujet")}</h2>
        <p><strong>Visiteur :</strong> ${echapper(message.nom)}</p>
        <p><strong>Email :</strong> ${echapper(message.email)}</p>
        <p><strong>Date :</strong> ${echapper(formaterDate(message.date_creation))}</p>
        <p><strong>Statut :</strong> ${Number(message.lu) === 1 ? "Lu" : "Non lu"}</p>
        <div class="contenu">${echapper(message.message).replace(/\n/g, "<br>")}</div>
      </article>
    `).join("");

    const fenetre = window.open("", "_blank");

    if (!fenetre) {
      alert("Autorise les fenêtres pop-up pour exporter le PDF.");
      return;
    }

    fenetre.document.write(`
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <title>Messages du portfolio - MAHATRANGA Patrick</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            color: #1e293b;
            padding: 30px;
            line-height: 1.5;
          }
          h1 { color: #1d4ed8; margin-bottom: 5px; }
          .entete { margin-bottom: 25px; }
          .message {
            border: 1px solid #cbd5e1;
            border-radius: 8px;
            padding: 18px;
            margin-bottom: 18px;
            break-inside: avoid;
          }
          .message h2 { font-size: 17px; color: #1d4ed8; }
          .contenu {
            margin-top: 12px;
            padding: 12px;
            background: #f1f5f9;
            border-radius: 5px;
            overflow-wrap: anywhere;
          }
          @media print {
            body { padding: 0; }
            .message { break-inside: avoid; }
          }
        </style>
      </head>
      <body>
        <div class="entete">
          <h1>Messages reçus</h1>
          <p>MAHATRANGA Patrick — Administration du portfolio</p>
          <p>Total exporté : ${messagesFiltres.length} message(s)</p>
          <p>Date d'exportation : ${echapper(new Date().toLocaleString("fr-FR"))}</p>
        </div>
        ${lignes}
      </body>
      </html>
    `);

    fenetre.document.close();
    fenetre.focus();
    fenetre.print();
  }

  async function deconnexion() {
    const ancienToken = token;

    // Révoquer la session auprès du serveur
    if (ancienToken) {
      try {
        await fetch(`${API}/api/admin/logout`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${ancienToken}`,
            Accept: "application/json",
          },
        });
      } catch (erreur) {
        console.error("Impossible de contacter le serveur pour la déconnexion.");
      }
    }

    // Nettoyer l'interface même si le serveur est indisponible
    localStorage.removeItem("admin_token");
    setToken("");
    setMessages([]);
    idsMessagesConnus.current = null;
    setNotification("");
    setStats({ total_messages: 0 });
    setMessageActif(null);
    setPassword("");
  }

  async function chargerDonnees(authtoken) {
    setChargementMessages(true);
    setErreur("");

    try {
      const headers = {
        Authorization: `Bearer ${authtoken}`,
        Accept: "application/json",
      };

      const [statsResponse, messagesResponse] = await Promise.all([
        fetch(`${API}/api/admin/stats`, { headers }),
        fetch(`${API}/api/admin/messages`, { headers }),
      ]);

      if (statsResponse.status === 401 || messagesResponse.status === 401) {
        deconnexion();
        setErreur("Session expirée. Veuillez vous reconnecter.");
        return;
      }

      if (!statsResponse.ok || !messagesResponse.ok) {
        throw new Error("Impossible de charger les données administrateur.");
      }

      const statsData = await statsResponse.json();
      const messagesData = await messagesResponse.json();

      setStats(statsData);

      const listeMessages = messagesData.messages || [];
      const nouveauxMessages = idsMessagesConnus.current === null
        ? []
        : listeMessages.filter(
            (message) => !idsMessagesConnus.current.includes(message.id)
          );

      if (nouveauxMessages.length > 0) {
        setNotification(
          nouveauxMessages.length === 1
            ? "Nouveau message reçu !"
            : `${nouveauxMessages.length} nouveaux messages reçus !`
        );
      }

      idsMessagesConnus.current = listeMessages.map((message) => message.id);
      setMessages(listeMessages);
    } catch (error) {
      setErreur(error.message || "Erreur de connexion au serveur.");
    } finally {
      setChargementMessages(false);
    }
  }
  async function modifierStatutMessage(id, lu) {
    try {
      const response = await fetch(
        `${API}/api/admin/messages/${id}/statut?lu=${lu}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Erreur de modification du statut.");
      }

      const ancienMessage = messages.find((m) => m.id === id);
      const etaitLu = Number(ancienMessage?.lu) === 1;

      setMessages((anciens) =>
        anciens.map((m) =>
          m.id === id ? { ...m, lu: lu ? 1 : 0 } : m
        )
      );

      setMessageActif((ancien) =>
        ancien?.id === id ? { ...ancien, lu: lu ? 1 : 0 } : ancien
      );

      if (etaitLu !== lu) {
        setStats((anciennes) => ({
          ...anciennes,
          messages_non_lus: Math.max(
            0,
            (anciennes.messages_non_lus || 0) + (lu ? -1 : 1)
          ),
        }));
      }

      return true;
    } catch (error) {
      setErreur(error.message);
      return false;
    }
  }

  async function ouvrirMessage(message) {
    const succes = await modifierStatutMessage(message.id, true);

    setMessageActif({
      ...message,
      lu: succes ? 1 : message.lu,
    });
  }
  useEffect(() => {
    if (!token) return;

    chargerDonnees(token);
    const intervalle = setInterval(() => {
      chargerDonnees(token);
    }, 30000);

    return () => clearInterval(intervalle);
  }, [token]);

    useEffect(() => {
    if (token) chargerProjets();
  }, [token]);

  // Détection automatique de la section visible dans le tableau de bord
  useEffect(() => {
    if (!token) return;

    const sections = document.querySelectorAll("#dashboard, #messages, #projets");
    if (!sections.length) return;

    const observateur = new IntersectionObserver(
      (entrees) => {
        const visibles = entrees
          .filter((entree) => entree.isIntersecting)
          .sort(
            (a, b) =>
              a.boundingClientRect.top - b.boundingClientRect.top
          );

        if (visibles.length > 0) {
          setSectionActive(visibles[0].target.id);
        }
      },
      {
        rootMargin: "-15% 0px -70% 0px",
        threshold: 0
      }
    );

    sections.forEach((section) => observateur.observe(section));

    return () => observateur.disconnect();
  }, [token]);

  // Déconnexion automatique après 15 minutes d'inactivité
  useEffect(() => {
    if (!token) return;

    let minuterie;

    function reinitialiserMinuterie() {
      clearTimeout(minuterie);

      minuterie = setTimeout(() => {
        deconnexion();
        setErreur("Déconnexion automatique après 15 minutes d'inactivité.");
      }, 15 * 60 * 1000);
    }

    const evenements = [
      "mousemove",
      "mousedown",
      "keydown",
      "click",
      "scroll",
      "touchstart"
    ];

    evenements.forEach((evenement) => {
      window.addEventListener(evenement, reinitialiserMinuterie);
    });

    reinitialiserMinuterie();

    return () => {
      clearTimeout(minuterie);
      evenements.forEach((evenement) => {
        window.removeEventListener(evenement, reinitialiserMinuterie);
      });
    };
  }, [token]);

  async function connecter(event) {
    event.preventDefault();
    setErreur("");
    setChargement(true);

    try {
      const response = await fetch(`${API}/api/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Identifiant ou mot de passe incorrect.");
      }

      localStorage.setItem("admin_token", data.access_token);
      setPassword("");
      setToken(data.access_token);
    } catch (error) {
      setErreur(error.message || "Impossible de contacter le serveur.");
    } finally {
      setChargement(false);
    }
  }

  async function supprimerMessage(id) {
    try {
      const response = await fetch(`${API}/api/admin/messages/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "La suppression a échoué.");
      }

      setMessages((anciens) => anciens.filter((message) => message.id !== id));
      setMessageActif(null);
      setMessageASupprimer(null);
      setStats((ancienne) => ({
        ...ancienne,
        total_messages: Math.max(0, ancienne.total_messages - 1),
      }));
    } catch (error) {
      setErreur(error.message);
    }
  }

  function formaterDate(date) {
    if (!date) return "Date inconnue";

    const valeur = new Date(date.replace(" ", "T") + "Z");

    if (Number.isNaN(valeur.getTime())) return date;

    return valeur.toLocaleString("fr-FR", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  }


  async function chargerProjets() {
    setChargementProjets(true);
    setProjetErreur("");

    try {
      const response = await fetch(`${API}/api/admin/projets`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      const data = await response.json();

      if (response.status === 401) {
        deconnexion();
        throw new Error("Session expirée. Reconnectez-vous.");
      }

      if (!response.ok) {
        throw new Error(data.detail || "Impossible de charger les projets.");
      }

      setProjets(data.projets || []);
    } catch (error) {
      setProjetErreur(error.message || "Erreur de chargement des projets.");
    } finally {
      setChargementProjets(false);
    }
  }

  function ouvrirNouveauProjet() {
    setProjetEnEdition(null);
    setProjetForm({
      titre: "",
      categorie: "",
      description: "",
      technologies: "",
    });
    setImagesProjet([]);
    setProjetErreur("");
    setProjetMessage("");
    setFormulaireProjetOuvert(true);
  }

  function ouvrirModificationProjet(projet) {
    setProjetEnEdition(projet);
    setProjetForm({
      titre: projet.titre || "",
      categorie: projet.categorie || "",
      description: projet.description || "",
      technologies: (projet.technologies || []).join(", "),
    });
    setImagesProjet([]);
    setProjetErreur("");
    setProjetMessage("");
    setFormulaireProjetOuvert(true);
  }

  async function enregistrerProjet(event) {
    event.preventDefault();
    setProjetErreur("");
    setProjetMessage("");

    const donnees = new FormData();
    donnees.append("titre", projetForm.titre.trim());
    donnees.append("categorie", projetForm.categorie.trim());
    donnees.append("description", projetForm.description.trim());
    donnees.append("technologies", projetForm.technologies);

    Array.from(imagesProjet).forEach((image) => {
      donnees.append("images", image);
    });

    try {
      const edition = Boolean(projetEnEdition);
      const url = edition
        ? `${API}/api/admin/projets/${projetEnEdition.id}`
        : `${API}/api/admin/projets`;

      const response = await fetch(url, {
        method: edition ? "PUT" : "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: donnees,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Enregistrement impossible.");
      }

      setFormulaireProjetOuvert(false);
      setProjetEnEdition(null);
      setImagesProjet([]);
      setProjetForm({
        titre: "",
        categorie: "",
        description: "",
        technologies: "",
      });

      setProjetMessage(
        edition ? "Projet modifié avec succès." : "Projet ajouté avec succès."
      );

      await chargerProjets();
    } catch (error) {
      setProjetErreur(error.message || "Erreur lors de l'enregistrement.");
    }
  }

  async function supprimerProjet(id) {
    if (!window.confirm("Voulez-vous vraiment supprimer ce projet et ses captures ?")) {
      return;
    }

    setProjetErreur("");
    setProjetMessage("");

    try {
      const response = await fetch(`${API}/api/admin/projets/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Suppression impossible.");
      }

      setProjetMessage("Projet supprimé avec succès.");
      await chargerProjets();
    } catch (error) {
      setProjetErreur(error.message || "Erreur de suppression.");
    }
  }

  async function supprimerCapture(projetId, imageId) {
    if (!window.confirm("Supprimer cette capture ?")) return;

    try {
      const response = await fetch(
        `${API}/api/admin/projets/${projetId}/images/${imageId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Suppression de la capture impossible.");
      }

      setProjetMessage("Capture supprimée.");
      await chargerProjets();
    } catch (error) {
      setProjetErreur(error.message || "Erreur de suppression de la capture.");
    }
  }


  if (!token) {
    return (
      <main className="admin-login-page">
        <div className="admin-login-card">
          <div className="admin-logo">MP</div>
          <span className="admin-eyebrow">ESPACE PRIVÉ</span>
          <h1>Administration</h1>
          <p className="admin-login-description">
            Connectez-vous pour gérer les messages de votre portfolio.
          </p>

          <form onSubmit={connecter} className="admin-login-form">
            <label htmlFor="admin-username">Identifiant</label>
            <input
              id="admin-username"
              type="text"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              autoComplete="username"
              required
            />

            <label htmlFor="admin-password">Mot de passe</label>
            <input
              id="admin-password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              required
            />

            {erreur && <p className="admin-error">{erreur}</p>}

            <button type="submit" disabled={chargement}>
              {chargement ? "Connexion..." : "Se connecter"}
            </button>
          </form>

          <a className="admin-back-link" href="/">
            ← Retour au portfolio
          </a>
        </div>
      </main>
    );
  }

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <a href="/" className="admin-brand">
          <span className="admin-brand-logo">MP</span>
          <span>
            <strong>MON PORTFOLIO</strong>
            <small>Administration</small>
          </span>
        </a>

        <div className="admin-menu-label">MENU PRINCIPAL</div>
        <a href="#dashboard" className={`admin-menu-link ${sectionActive === "dashboard" ? "active" : ""}`}>
          <span>▦</span> Tableau de bord
        </a>
        <a href="#messages" className={`admin-menu-link ${sectionActive === "messages" ? "active" : ""}`}>
          <span>✉</span> Messages reçus
        </a>
        <a href="#projets" className={`admin-menu-link ${sectionActive === "projets" ? "active" : ""}`}>
          <span>▣</span> Mes projets
        </a>

        <div className="admin-sidebar-bottom">
          <div className="admin-profile">
            <div className="admin-avatar">MP</div>
            <div>
              <strong>MAHATRANGA Patrick</strong>
              <small>Administrateur</small>
            </div>
          </div>
          <button className="admin-logout" onClick={deconnexion}>
            ↪ Déconnexion
          </button>
          <a href="/" className="admin-site-link">← Voir le portfolio</a>
        </div>
      </aside>

      <main className="admin-main">
        <header className="admin-topbar">
          <div>
            <span className="admin-eyebrow">GESTION DU PORTFOLIO</span>
            <h1>Tableau de bord</h1>
          </div>
          <button
            className="admin-refresh"
            onClick={exporterMessagesPDF}
            disabled={chargementMessages || messagesFiltres.length === 0}
          >
            ↓ Exporter en PDF
          </button>
          <button
            className="admin-refresh"
            onClick={() => chargerDonnees(token)}
            disabled={chargementMessages}
          >
            ↻ Actualiser
          </button>
        </header>

        {erreur && <div className="admin-error admin-notice">{erreur}</div>}

        {notification && (
          <div className="admin-new-message-notice">
            <span>✉ {notification}</span>
            <button onClick={() => setNotification("")}>
              Fermer ×
            </button>
          </div>
        )}

        <section id="dashboard" className="admin-stats-grid">
          <article className="admin-stat-card">
            <div className="admin-stat-icon">✉</div>
            <span>Total des messages</span>
            <strong>{stats.total_messages ?? 0}</strong>
            <small>Messages enregistrés</small>
          </article>

          <article className="admin-stat-card">
            <div className="admin-stat-icon">▤</div>
            <span>Messages affichés</span>
            <strong>{messages.length}</strong>
            <small>Dans votre boîte de réception</small>
          </article>

          <article className="admin-stat-card">
            <div className="admin-stat-icon">●</div>
            <span>État du tableau</span>
            <strong className="admin-online">Actif</strong>
            <small>Session administrateur</small>
          </article>
        </section>

        <section className="admin-charts-grid">
          <article className="admin-chart-card admin-chart-monthly">
            <div className="admin-chart-heading">
              <div>
                <span className="admin-eyebrow">ÉVOLUTION</span>
                <h3>Messages par mois</h3>
              </div>
              <span className="admin-chart-symbol">▥</span>
            </div>

            <div className="admin-bar-chart">
              {messagesParMois.map((item, index) => (
                <div className="admin-bar-column" key={`${item.label}-${index}`}>
                  <strong>{item.total}</strong>
                  <div className="admin-bar-track">
                    <div
                      className="admin-bar-fill"
                      style={{
                        height: `${Math.max(
                          item.total > 0 ? 8 : 3,
                          (item.total / maximumMensuel) * 100
                        )}%`,
                      }}
                    />
                  </div>
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
            <p className="admin-chart-caption">Activité des six derniers mois</p>
          </article>

          <article className="admin-chart-card">
            <div className="admin-chart-heading">
              <div>
                <span className="admin-eyebrow">RÉPARTITION</span>
                <h3>État des messages</h3>
              </div>
              <span className="admin-chart-symbol">◉</span>
            </div>

            <div className="admin-donut-layout">
              <div
                className="admin-donut"
                style={{
                  background: messages.length
                    ? `conic-gradient(#3185f5 0% ${pourcentageLus}%, #ff7777 ${pourcentageLus}% 100%)`
                    : "#25344d",
                }}
              >
                <div className="admin-donut-center">
                  <strong>{messages.length}</strong>
                  <span>Messages</span>
                </div>
              </div>

              <div className="admin-donut-legend">
                <div>
                  <span className="admin-legend-dot admin-legend-read" />
                  <span>Lus</span>
                  <strong>{nombreMessagesLus}</strong>
                </div>
                <div>
                  <span className="admin-legend-dot admin-legend-unread" />
                  <span>Non lus</span>
                  <strong>{nombreMessagesNonLus}</strong>
                </div>
              </div>
            </div>
            <p className="admin-chart-caption">
              Répartition des messages enregistrés
            </p>
          </article>

          <article className="admin-chart-card">
            <div className="admin-chart-heading">
              <div>
                <span className="admin-eyebrow">ACTIVITÉ RÉCENTE</span>
                <h3>Les 7 derniers jours</h3>
              </div>
              <span className="admin-chart-symbol">⌁</span>
            </div>

            <div className="admin-bar-chart admin-week-chart">
              {messagesDesSeptJours.map((item, index) => (
                <div className="admin-bar-column" key={`${item.label}-${index}`}>
                  <strong>{item.total}</strong>
                  <div className="admin-bar-track">
                    <div
                      className="admin-bar-fill admin-week-fill"
                      style={{
                        height: `${Math.max(
                          item.total > 0 ? 8 : 3,
                          (item.total / maximumHebdomadaire) * 100
                        )}%`,
                      }}
                    />
                  </div>
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
            <p className="admin-chart-caption">Nombre de messages reçus par jour</p>
          </article>
        </section>

        <section id="messages" className="admin-messages-section">
          <div className="admin-section-heading">
            <div>
              <span className="admin-eyebrow">BOÎTE DE RÉCEPTION</span>
              <h2>Messages des visiteurs</h2>
              <div className="admin-unread-summary">
                <span className="admin-unread-dot"></span>
                <strong>{nombreMessagesNonLus}</strong>
                <span>message(s) non lu(s)</span>
              </div>
            </div>
<div className="admin-search-bar">
  <input
    type="search"
    placeholder="Rechercher par nom, email ou sujet..."
    value={recherche}
    onChange={(event) => setRecherche(event.target.value)}
  />

  <select value={filtre} onChange={(event) => setFiltre(event.target.value)}>
    <option value="tous">Tous les messages</option>
    <option value="recents">7 derniers jours</option>
  </select>

  <select
    value={filtreStatut}
    onChange={(event) => setFiltreStatut(event.target.value)}
  >
    <option value="tous">Tous les statuts</option>
    <option value="non_lus">Messages non lus</option>
    <option value="lus">Messages lus</option>
  </select>
</div>

              <span className="admin-message-count">
            {messagesFiltres.length} résultat(s) / {messages.length} message(s)
            </span>
          </div>

          {chargementMessages ? (
            <div className="admin-empty">Chargement des messages...</div>
          ) : messagesFiltres.length === 0 ? (
            <div className="admin-empty">
              <div className="admin-empty-icon">✉</div>
              <h3>Aucun message pour le moment</h3>
              <p>Les messages envoyés depuis le portfolio apparaîtront ici.</p>
            </div>
          ) : (
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Visiteur</th>
                    <th>Sujet</th>
                    <th>Date</th>
                    <th>Statut</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {messagesPage.map((message) => (
                    <tr key={message.id}>
                      <td>
                        <strong>{message.nom}</strong>
                        <small>{message.email}</small>
                      </td>
                      <td>{message.sujet}</td>
                      <td>{formaterDate(message.date_creation)}</td>
                      <td>
                        {Number(message.lu) === 1 ? (
                          <span className="admin-status-read">Lu</span>
                        ) : (
                          <span className="admin-status-unread">Non lu</span>
                        )}
                      </td>
                      <td>
                        <div className="admin-actions">
                          <button
                            className="admin-view-button"
                         onClick={() => ouvrirMessage(message)}
                          >
                            Lire
                          </button>
                          <button
                            className="admin-status-toggle"
                            onClick={() =>
                              modifierStatutMessage(
                                message.id,
                                Number(message.lu) !== 1
                              )
                            }
                          >
                            {Number(message.lu) === 1 ? "Non lu" : "Marquer lu"}
                          </button>
                          <button
                            className="admin-delete-button"
                            onClick={() => setMessageASupprimer(message)}
                          >
                            Supprimer
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {!chargementMessages && messagesFiltres.length > 0 && (
            <div className="admin-pagination">
              <span className="admin-pagination-info">
                Page {pageCourante} sur {nombrePages}
                <small>
                  Affichage de {((pageCourante - 1) * messagesParPage) + 1}
                  à {Math.min(pageCourante * messagesParPage, messagesFiltres.length)}
                  sur {messagesFiltres.length} message(s)
                </small>
              </span>

              <div className="admin-pagination-buttons">
                <button
                  type="button"
                  onClick={() => setPageCourante((page) => Math.max(1, page - 1))}
                  disabled={pageCourante === 1}
                  aria-label="Page précédente"
                >
                  ← Précédent
                </button>

                <span className="admin-pagination-current">
                  {pageCourante}
                </span>

                <button
                  type="button"
                  onClick={() => setPageCourante((page) => Math.min(nombrePages, page + 1))}
                  disabled={pageCourante === nombrePages}
                  aria-label="Page suivante"
                >
                  Suivant →
                </button>
              </div>
            </div>
          )}
        </section>

        <footer className="admin-footer">
          © {new Date().getFullYear()} MAHATRANGA Patrick — Administration
        </footer>
      </main>


      <section id="projets" className="admin-projects-section">
        <div className="admin-section-heading admin-projects-heading">
          <div>
            <span className="admin-eyebrow">PORTFOLIO</span>
            <h2>Mes projets</h2>
            <p>Gérez vos réalisations et leurs captures d'écran.</p>
          </div>

          {!formulaireProjetOuvert && (
            <button
              type="button"
              className="admin-project-add"
              onClick={ouvrirNouveauProjet}
            >
              + Ajouter un projet
            </button>
          )}
        </div>

        {projetMessage && (
          <div className="admin-project-success">{projetMessage}</div>
        )}

        {projetErreur && (
          <div className="admin-error admin-notice">{projetErreur}</div>
        )}

        {formulaireProjetOuvert && (
          <form className="admin-project-form" onSubmit={enregistrerProjet}>
            <div className="admin-project-form-heading">
              <div>
                <span className="admin-eyebrow">
                  {projetEnEdition ? "MODIFICATION" : "NOUVELLE RÉALISATION"}
                </span>
                <h3>{projetEnEdition ? "Modifier le projet" : "Ajouter un projet"}</h3>
              </div>
              <button
                type="button"
                className="admin-project-cancel"
                onClick={() => setFormulaireProjetOuvert(false)}
              >
                Fermer ×
              </button>
            </div>

            <div className="admin-project-fields">
              <label>
                Titre du projet *
                <input
                  type="text"
                  value={projetForm.titre}
                  onChange={(event) =>
                    setProjetForm({ ...projetForm, titre: event.target.value })
                  }
                  placeholder="Ex : Administration Active Directory"
                  required
                />
              </label>

              <label>
                Catégorie *
                <input
                  type="text"
                  value={projetForm.categorie}
                  onChange={(event) =>
                    setProjetForm({ ...projetForm, categorie: event.target.value })
                  }
                  placeholder="Ex : Réseaux, Systèmes, Développement"
                  required
                />
              </label>

              <label className="admin-project-full">
                Description
                <textarea
                  rows="4"
                  value={projetForm.description}
                  onChange={(event) =>
                    setProjetForm({ ...projetForm, description: event.target.value })
                  }
                  placeholder="Décrivez votre réalisation..."
                />
              </label>

              <label className="admin-project-full">
                Technologies utilisées
                <input
                  type="text"
                  value={projetForm.technologies}
                  onChange={(event) =>
                    setProjetForm({ ...projetForm, technologies: event.target.value })
                  }
                  placeholder="Windows Server, DNS, GPO (séparées par des virgules)"
                />
              </label>

              <label className="admin-project-full">
                Captures d'écran
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  multiple
                  onChange={(event) => setImagesProjet(event.target.files)}
                />
                <small>10 images maximum par envoi, 8 Mo maximum par image.</small>
                {imagesProjet.length > 0 && (
                  <small>{imagesProjet.length} image(s) sélectionnée(s).</small>
                )}
              </label>
            </div>

            <div className="admin-project-form-actions">
              <button type="submit" className="admin-project-save">
                {projetEnEdition ? "Enregistrer les modifications" : "Enregistrer le projet"}
              </button>
              <button
                type="button"
                className="admin-project-cancel"
                onClick={() => setFormulaireProjetOuvert(false)}
              >
                Annuler
              </button>
            </div>
          </form>
        )}

        {chargementProjets ? (
          <p className="admin-project-empty">Chargement des projets...</p>
        ) : projets.length === 0 ? (
          <div className="admin-project-empty">
            <span>▣</span>
            <h3>Aucun projet enregistré</h3>
            <p>Utilisez le bouton « Ajouter un projet » pour commencer.</p>
          </div>
        ) : (
          <div className="admin-project-grid">
            {projets.map((projet) => (
              <article className="admin-project-card" key={projet.id}>
                <div className="admin-project-card-top">
                  <span>{projet.categorie}</span>
                  <small>#{projet.id}</small>
                </div>

                <h3>{projet.titre}</h3>
                <p>{projet.description || "Aucune description renseignée."}</p>

                {projet.technologies?.length > 0 && (
                  <div className="admin-project-tags">
                    {projet.technologies.map((tech, index) => (
                      <span key={`${projet.id}-${index}`}>{tech}</span>
                    ))}
                  </div>
                )}

                <div className="admin-project-images">
                  <strong>Captures ({projet.images?.length || 0})</strong>
                  {projet.images?.length > 0 ? (
                    <div className="admin-project-thumbnails">
                      {projet.images.map((image) => (
                        <div className="admin-project-thumbnail" key={image.id}>
                          <a
                            href={`${API}${image.url}`}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <img src={`${API}${image.url}`} alt={projet.titre} />
                          </a>
                          <button
                            type="button"
                            onClick={() => supprimerCapture(projet.id, image.id)}
                            title="Supprimer cette capture"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <small>Aucune capture pour le moment.</small>
                  )}
                </div>

                <div className="admin-project-actions">
                  <button
                    type="button"
                    onClick={() => ouvrirModificationProjet(projet)}
                  >
                    Modifier
                  </button>
                  <button
                    type="button"
                    onClick={() => supprimerProjet(projet.id)}
                  >
                    Supprimer
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {messageActif && (
        <div
          className="admin-modal-overlay"
          onClick={() => setMessageActif(null)}
        >
          <section
            className="admin-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="admin-modal-header">
              <div>
                <span className="admin-eyebrow">MESSAGE REÇU</span>
                <h2>{messageActif.sujet}</h2>
              </div>
              <button
                className="admin-modal-close"
                onClick={() => setMessageActif(null)}
                aria-label="Fermer"
              >
                ×
              </button>
            </div>

            <div className="admin-modal-details">
              <p><strong>Nom :</strong> {messageActif.nom}</p>
              <p><strong>Email :</strong> {messageActif.email}</p>
              <p><strong>Date :</strong> {formaterDate(messageActif.date_creation)}</p>
            </div>

            <div className="admin-message-content">
              {messageActif.message}
            </div>

            <div className="admin-modal-actions">
              {Number(messageActif.lu) === 1 && (
                <button
                  className="admin-view-button"
                  onClick={() => modifierStatutMessage(messageActif.id, false)}
                >
                  Marquer comme non lu
                </button>
              )}
              <a href={`mailto:${messageActif.email}`} className="admin-reply-button">
                Répondre par email
              </a>
              <button
                className="admin-delete-button"
                onClick={() => setMessageASupprimer(messageActif)}
              >
                Supprimer le message
              </button>
            </div>
          </section>
        </div>
      )}

      {messageASupprimer && (
        <div
          className="admin-modal-overlay admin-delete-overlay"
          onClick={() => setMessageASupprimer(null)}
        >
          <section
            className="admin-confirm-modal"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="admin-confirm-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="admin-confirm-icon">!</div>

            <span className="admin-eyebrow">CONFIRMATION</span>
            <h2 id="admin-confirm-title">Supprimer ce message ?</h2>

            <p>
              Voulez-vous vraiment supprimer le message
              <strong> « {messageASupprimer.sujet || "Sans sujet"} » </strong>
              de <strong>{messageASupprimer.nom || "ce visiteur"}</strong> ?
            </p>

            <p className="admin-confirm-warning">
              Cette action est définitive et ne pourra pas être annulée.
            </p>

            <div className="admin-confirm-actions">
              <button
                type="button"
                className="admin-cancel-delete"
                onClick={() => setMessageASupprimer(null)}
              >
                Annuler
              </button>

              <button
                type="button"
                className="admin-confirm-delete"
                onClick={() => supprimerMessage(messageASupprimer.id)}
              >
                Oui, supprimer
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
