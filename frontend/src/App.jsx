
import React, { useEffect, useRef, useState } from "react";
import "./App.css";

const projets = [
  {
    id: 1,
    titre: "Administration Active Directory",
    categorie: "Réseaux et systèmes",
    description:
      "Installation et configuration d'un serveur Windows Server, gestion des utilisateurs, groupes et stratégies de domaine.",
    image: "/projets/active-directory.png",
    statut: "À présenter",
    technologies: ["Windows Server", "Active Directory", "GPO"],
  },
  {
    id: 2,
    titre: "Infrastructure réseau GNS3",
    categorie: "Administration réseau",
    description:
      "Conception et simulation d'une infrastructure réseau avec routeurs, commutateurs et configuration IP.",
    image: "/projets/gns3.png",
    statut: "À présenter",
    technologies: ["GNS3", "Cisco", "TCP/IP"],
  },
  {
    id: 3,
    titre: "Administration Linux",
    categorie: "Systèmes",
    description:
      "Administration des systèmes Linux, gestion des utilisateurs, services et configuration serveur.",
    image: "/projets/linux.png",
    statut: "À présenter",
    technologies: ["Linux", "Terminal", "Serveur"],
  },
];

const competences = [
  {
    icon: "🌐",
    titre: "Réseaux informatiques",
    description: "TCP/IP, adressage IP, routage, commutation et VLAN.",
  },
  {
    icon: "🖥️",
    titre: "Windows Server",
    description: "Active Directory, DNS, DHCP et gestion des utilisateurs.",
  },
  {
    icon: "🐧",
    titre: "Linux",
    description: "Installation, administration et gestion des services.",
  },
  {
    icon: "🔐",
    titre: "Cybersécurité",
    description: "Sécurisation des systèmes et bonnes pratiques de sécurité.",
  },
  {
    icon: "⚙️",
    titre: "Virtualisation",
    description: "Création et gestion d'environnements virtuels.",
  },
  {
    icon: "🛠️",
    titre: "Maintenance informatique",
    description: "Diagnostic, dépannage et maintenance des équipements.",
  },
];

export default function App() {
  const [photo, setPhoto] = useState(
    () => localStorage.getItem("patrick-portfolio-photo") || ""
  );
  const [erreurPhoto, setErreurPhoto] = useState("");
  const inputPhoto = useRef(null);

  useEffect(() => {
    try {
      if (photo) {
        localStorage.setItem("patrick-portfolio-photo", photo);
      } else {
        localStorage.removeItem("patrick-portfolio-photo");
      }
    } catch {
      setErreurPhoto(
        "Le stockage est plein. Essaie une image plus légère."
      );
    }
  }, [photo]);

  const importerPhoto = (event) => {
    const fichier = event.target.files?.[0];

    if (!fichier) return;

    if (!fichier.type.startsWith("image/")) {
      setErreurPhoto("Veuillez choisir une image valide.");
      return;
    }

    if (fichier.size > 2 * 1024 * 1024) {
      setErreurPhoto("La photo doit faire moins de 2 Mo.");
      return;
    }

    const lecteur = new FileReader();

    lecteur.onload = () => {
      setPhoto(lecteur.result);
      setErreurPhoto("");
    };

    lecteur.onerror = () => {
      setErreurPhoto("Impossible de lire cette image.");
    };

    lecteur.readAsDataURL(fichier);
    event.target.value = "";
  };

  const supprimerPhoto = () => {
    setPhoto("");
    setErreurPhoto("");
  };

  return (
    <div className="portfolio">
      <header className="navbar">
        <a href="#accueil" className="logo">
          MP<span>.</span>
        </a>

        <nav className="nav-links">
          <a href="#accueil">Accueil</a>
          <a href="#apropos">À propos</a>
          <a href="#competences">Compétences</a>
          <a href="#projets">Projets</a>
          <a href="#formation">Parcours</a>
          <a href="#contact">Contact</a>
        </nav>

        <a href="#contact" className="nav-button">
          Me contacter
        </a>
      </header>

      <main>
        <section className="hero" id="accueil">
          <div className="hero-content">
            <span className="eyebrow">
              PORTFOLIO PROFESSIONNEL
            </span>

            <p className="hero-intro">Bonjour, je suis</p>

            <h1>
              MAHATRANGA
              <br />
              <span>Patrick.</span>
            </h1>

            <h2>Administrateur Réseaux et Systèmes</h2>

            <p className="hero-description">
              Passionné par les technologies informatiques, les
              infrastructures réseau, l'administration des systèmes
              et la cybersécurité. Je développe mes compétences
              pour concevoir et maintenir des solutions fiables
              et performantes.
            </p>

            <div className="hero-buttons">
              <a href="#projets" className="primary-button">
                Découvrir mes projets ↗
              </a>

              <a href="#apropos" className="secondary-button">
                En savoir plus
              </a>
            </div>

            <div className="hero-note">
              <span className="online-dot"></span>
              Portfolio évolutif – Mes réalisations informatiques
            </div>
          </div>

          <div className="hero-visual">
            <div className="photo-frame">
              <div className="photo-display">
                {photo ? (
                  <img src={photo} alt="MAHATRANGA Patrick" />
                ) : (
                  <div className="photo-placeholder">
                    <span>👨‍💻</span>
                    <strong>Votre photo ici</strong>
                    <small>Importez votre portrait</small>
                  </div>
                )}
              </div>

              <div className="photo-controls">
                <button
                  className="upload-button"
                  onClick={() => inputPhoto.current?.click()}
                >
                  + Importer ma photo
                </button>

                {photo && (
                  <button
                    className="remove-photo"
                    onClick={supprimerPhoto}
                  >
                    Supprimer
                  </button>
                )}

                <input
                  ref={inputPhoto}
                  type="file"
                  accept="image/*"
                  onChange={importerPhoto}
                  hidden
                />

                {erreurPhoto && (
                  <p className="photo-error">{erreurPhoto}</p>
                )}
              </div>
            </div>

            <div className="floating-card">
              <span>💻</span>
              <div>
                <strong>IT & Réseaux</strong>
                <small>Administration informatique</small>
              </div>
            </div>
          </div>
        </section>

        <section className="about section" id="apropos">
          <div className="section-heading">
            <span>QUI SUIS-JE ?</span>
            <h2>À propos de moi</h2>
          </div>

          <div className="about-content">
            <div className="about-mark">MP.</div>
            <div>
              <h3>La technologie au service des solutions.</h3>
              <p>
                Je suis MAHATRANGA Patrick, spécialisé dans
                l'administration des réseaux et des systèmes
                informatiques. Je m'intéresse à la conception
                d'infrastructures, à la configuration des serveurs,
                à la gestion des réseaux et à la sécurité informatique.
              </p>
              <p>
                Ce portfolio présente mon parcours, mes compétences
                et les projets que je réalise au fil de mon évolution
                professionnelle.
              </p>
            </div>
          </div>
        </section>

        <section className="skills section" id="competences">
          <div className="section-heading">
            <span>MON SAVOIR-FAIRE</span>
            <h2>Mes compétences techniques</h2>
            <p>
              Les domaines informatiques qui constituent mon
              environnement de travail.
            </p>
          </div>

          <div className="skills-grid">
            {competences.map((competence) => (
              <article className="skill-card" key={competence.titre}>
                <span className="skill-icon">{competence.icon}</span>
                <h3>{competence.titre}</h3>
                <p>{competence.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="projects section" id="projets">
          <div className="section-heading">
            <span>MES RÉALISATIONS</span>
            <h2>Mes projets informatiques</h2>
            <p>
              Découvrez mes travaux et mes réalisations dans
              les domaines des réseaux et des systèmes.
            </p>
          </div>

          <div className="projects-grid">
            {projets.map((projet) => (
              <article className="project-card" key={projet.id}>
                <div className="project-image">
                  <img
                    src={projet.image}
                    alt={projet.titre}
                    onError={(event) => {
                      event.currentTarget.style.display = "none";
                    }}
                  />
                  <span className="project-number">
                    PROJET 0{projet.id}
                  </span>
                </div>

                <div className="project-content">
                  <span className="project-category">
                    {projet.categorie}
                  </span>

                  <h3>{projet.titre}</h3>

                  <p>{projet.description}</p>

                  <div className="technology-list">
                    {projet.technologies.map((tech) => (
                      <span key={tech}>{tech}</span>
                    ))}
                  </div>

                  <span className="project-status">
                    {projet.statut}
                  </span>
                </div>
              </article>
            ))}
          </div>

          <p className="project-note">
            Cette liste est un modèle de présentation. Remplacez
            les projets par vos réalisations réelles au fur et à mesure.
          </p>
        </section>

        <section className="journey section" id="formation">
          <div className="section-heading">
            <span>MON ÉVOLUTION</span>
            <h2>Formation et parcours</h2>
            <p>
              Un espace pour présenter mon parcours académique,
              mes certifications et mes expériences.
            </p>
          </div>

          <div className="journey-card">
            <div className="journey-icon">🎓</div>
            <div>
              <h3>Formation informatique</h3>
              <p>
                Ajoutez ici le nom de votre établissement,
                votre diplôme, votre spécialisation et les dates.
              </p>
              <span>Informations à compléter</span>
            </div>
          </div>

          <div className="journey-card">
            <div className="journey-icon">🏆</div>
            <div>
              <h3>Certifications et expériences</h3>
              <p>
                Présentez ici vos certifications, stages,
                expériences et formations complémentaires.
              </p>
              <span>Informations à compléter</span>
            </div>
          </div>
        </section>

        <section className="contact section" id="contact">
          <div className="contact-box">
            <span>ENTRONS EN CONTACT</span>
            <h2>Construisons ensemble de nouvelles opportunités.</h2>
            <p>
              Vous souhaitez échanger sur un projet informatique,
              une collaboration ou une opportunité professionnelle ?
              N'hésitez pas à me contacter.
            </p>
            <a href="mailto:" className="primary-button">
              Me contacter par email ↗
            </a>
            <small>
              Ajoutez votre adresse email dans le lien mailto
              lorsque vous serez prêt à publier le portfolio.
            </small>
          </div>
        </section>
      </main>

      <footer className="footer">
        <a href="#accueil" className="logo">
          MP<span>.</span>
        </a>
        <p>
          © {new Date().getFullYear()} MAHATRANGA Patrick.
          Tous droits réservés.
        </p>
        <a href="#accueil">Retour en haut ↑</a>
      </footer>
    </div>
  );
}

