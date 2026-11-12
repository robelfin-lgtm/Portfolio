
import React, { useEffect, useRef, useState } from "react";
import "./App.css";

const projets = [
  {
    titre: "Administration Active Directory",
    categorie: "Windows Server",
    description:
      "Installation et configuration d'un environnement Active Directory, gestion des utilisateurs, groupes et stratégies de sécurité.",
    image: "/projets/active-directory.png",
  },
  {
    titre: "Infrastructure réseau avec GNS3",
    categorie: "Réseaux",
    description:
      "Conception et simulation d'une infrastructure réseau avec routeurs, commutateurs et configuration des services réseau.",
    image: "/projets/gns3.png",
  },
  {
    titre: "Administration Linux",
    categorie: "Linux",
    description:
      "Installation, configuration et administration d'un système Linux, gestion des utilisateurs et des services.",
    image: "/projets/linux.png",
  },
];

const competences = [
  {
    titre: "Réseaux informatiques",
    description: "Configuration réseau, TCP/IP, routage et commutation.",
  },
  {
    titre: "Windows Server",
    description: "Active Directory, DNS, DHCP et gestion des utilisateurs.",
  },
  {
    titre: "Linux",
    description: "Installation, administration et gestion des services.",
  },
  {
    titre: "Cybersécurité",
    description: "Sécurité des systèmes, contrôle d'accès et protection réseau.",
  },
  {
    titre: "Virtualisation",
    description: "Création et gestion des machines virtuelles.",
  },
  {
    titre: "Maintenance informatique",
    description: "Diagnostic, dépannage et maintenance des équipements.",
  },
];

function App() {
  const [photo, setPhoto] = useState("");
  const inputPhoto = useRef(null);

  useEffect(() => {
    const photoEnregistree = localStorage.getItem(
      "patrick-portfolio-photo"
    );

    if (photoEnregistree) {
      setPhoto(photoEnregistree);
    }
  }, []);

  const importerPhoto = (event) => {
    const fichier = event.target.files[0];

    if (!fichier) return;

    if (!fichier.type.startsWith("image/")) {
      alert("Veuillez sélectionner une image.");
      return;
    }

    if (fichier.size > 2 * 1024 * 1024) {
      alert("La photo ne doit pas dépasser 2 Mo.");
      return;
    }

    const lecteur = new FileReader();

    lecteur.onload = () => {
      try {
        localStorage.setItem(
          "patrick-portfolio-photo",
          lecteur.result
        );
        setPhoto(lecteur.result);
      } catch {
        alert("Impossible d'enregistrer cette photo. Essayez une image plus petite.");
      }
    };

    lecteur.readAsDataURL(fichier);
  };

  const supprimerPhoto = () => {
    localStorage.removeItem("patrick-portfolio-photo");
    setPhoto("");
  };

  return (
    <div className="portfolio">
      <header className="navbar">
        <a href="#accueil" className="logo">
          MAHATRANGA<span>.</span>
        </a>

        <nav className="nav-links">
          <a href="#accueil">Accueil</a>
          <a href="#apropos">À propos</a>
          <a href="#competences">Compétences</a>
          <a href="#projets">Projets</a>
          <a href="#formation">Formation</a>
          <a href="#contact">Contact</a>
        </nav>
      </header>

      <main>
        <section className="hero" id="accueil">
          <div className="hero-content">
            <p className="hero-subtitle">
              BIENVENUE SUR MON PORTFOLIO
            </p>

            <h1>
              Bonjour, je suis
              <span> MAHATRANGA Patrick</span>
            </h1>

            <h2>Administrateur Réseaux et Systèmes</h2>

            <p className="hero-description">
              Passionné par les réseaux informatiques, les systèmes,
              la virtualisation et la cybersécurité. Je développe
              mes compétences dans la conception, l'administration
              et la maintenance des infrastructures informatiques.
            </p>

            <div className="hero-buttons">
              <a href="#projets" className="btn-primary">
                Voir mes projets
              </a>

              <a href="#contact" className="btn-secondary">
                Me contacter
              </a>
            </div>
          </div>

          <div className="hero-image">
            <div className="photo-frame">
              {photo ? (
                <img src={photo} alt="Photo de MAHATRANGA Patrick" />
              ) : (
                <div className="photo-placeholder">
                  <span>Votre photo</span>
                </div>
              )}
            </div>

            <input
              type="file"
              accept="image/*"
              ref={inputPhoto}
              onChange={importerPhoto}
              hidden
            />

            <button
              className="photo-button"
              onClick={() => inputPhoto.current.click()}
            >
              Importer ma photo
            </button>

            {photo && (
              <button
                className="photo-delete"
                onClick={supprimerPhoto}
              >
                Supprimer la photo
              </button>
            )}
          </div>
        </section>

        <section className="section about-section" id="apropos">
          <div className="section-heading">
            <p>QUI SUIS-JE ?</p>
            <h2>À propos de moi</h2>
          </div>

          <div className="about-content">
            <p>
              Je suis MAHATRANGA Patrick, spécialisé dans
              l'administration des réseaux et des systèmes
              informatiques.
            </p>

            <p>
              Je m'intéresse particulièrement à la configuration
              des équipements réseau, à l'administration des serveurs,
              à Linux, à Windows Server et à la sécurité informatique.
            </p>

            <p>
              Mon objectif est de participer à la mise en place
              d'infrastructures informatiques fiables, performantes
              et sécurisées.
            </p>
          </div>
        </section>

        <section className="section skills-section" id="competences">
          <div className="section-heading">
            <p>MON SAVOIR-FAIRE</p>
            <h2>Mes compétences</h2>
          </div>

          <div className="skills-grid">
            {competences.map((competence, index) => (
              <article className="skill-card" key={index}>
                <h3>{competence.titre}</h3>
                <p>{competence.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="section projects-section" id="projets">
          <div className="section-heading">
            <p>MES RÉALISATIONS</p>
            <h2>Mes projets informatiques</h2>
          </div>

          <div className="projects-grid">
            {projets.map((projet, index) => (
              <article className="project-card" key={index}>
                <div className="project-image">
                  <img
                    src={projet.image}
                    alt={projet.titre}
                    onError={(event) => {
                      event.currentTarget.style.display = "none";
                    }}
                  />
                </div>

                <div className="project-info">
                  <span className="project-category">
                    {projet.categorie}
                  </span>

                  <h3>{projet.titre}</h3>
                  <p>{projet.description}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="section formation-section" id="formation">
          <div className="section-heading">
            <p>MON PARCOURS</p>
            <h2>Formation et parcours professionnel</h2>
          </div>

          <div className="formation-card">
            <h3>Formation informatique</h3>

            <p>
              Ajoutez ici le nom de votre établissement, votre diplôme,
              votre spécialisation et les dates.
            </p>

            <span>Informations à compléter</span>
          </div>

          <div className="formation-card">
            <h3>Expérience professionnelle</h3>

            <p>
              Présentez ici vos expériences professionnelles,
              vos stages et vos réalisations.
            </p>

            <span>Informations à compléter</span>
          </div>
        </section>

        <section className="section contact-section" id="contact">
          <div className="section-heading">
            <p>RESTONS EN CONTACT</p>
            <h2>Me contacter</h2>
          </div>

          <div className="contact-content">
            <p>
              Vous avez un projet informatique ou une opportunité
              professionnelle ? N'hésitez pas à me contacter.
            </p>

            <a
              href="mailto:votre-adresse-email@example.com"
              className="btn-primary"
            >
              Envoyer un email
            </a>
          </div>
        </section>
      </main>

      <footer className="footer">
        <p>
          © {new Date().getFullYear()} MAHATRANGA Patrick.
          Tous droits réservés.
        </p>

        <a href="#accueil">Retour en haut</a>
      </footer>
    </div>
  );
}

export default App;

