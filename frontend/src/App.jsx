
import React, { useEffect, useRef, useState } from "react";
import "./App.css";

const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
const CONTACT_URL = "https://formspree.io/f/TON_ID";

const projetsInitiaux = [
  {
    titre: "Administration Active Directory",
    categorie: "Windows Server",
    description: "Installation et configuration d'un environnement Active Directory, gestion des utilisateurs, groupes et stratégies de sécurité.",
    technologies: ["Windows Server", "Active Directory", "DNS", "GPO"],
    image: "/projets/active-directory.png",
  },
  {
    titre: "Infrastructure réseau avec GNS3",
    categorie: "Réseaux",
    description: "Conception et simulation d'une infrastructure réseau avec routeurs, commutateurs et configuration des services réseau.",
    technologies: ["GNS3", "TCP/IP", "Routage", "VLAN"],
    image: "/projets/gns3.png",
  },
  {
    titre: "Administration Linux",
    categorie: "Linux",
    description: "Installation, configuration et administration d'un système Linux, gestion des utilisateurs et des services.",
    technologies: ["Linux", "Administration système", "Terminal", "Services"],
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

{
  titre: "Développement d'applications",
  description: "Conception et réalisation d'applications informatiques adaptées aux besoins des utilisateurs.",
},
{
  titre: "Développement web",
  description: "Création de sites web et conception d'interfaces modernes et fonctionnelles.",
},
];

function App() {
  const [projets, setProjets] = useState(projetsInitiaux);
  const [photo, setPhoto] = useState("");
const [nom, setNom] = useState("");
const [email, setEmail] = useState("");
const [sujet, setSujet] = useState("");
const [message, setMessage] = useState("");
const [envoi, setEnvoi] = useState(false);
const [retour, setRetour] = useState("");
  const inputPhoto = useRef(null);

  useEffect(() => {
    const controller = new AbortController();

    async function chargerProjetsPublics() {
      try {
        const response = await fetch(`${API}/api/projets`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Chargement des projets impossible.");
        }

        const data = await response.json();

        if (Array.isArray(data.projets)) {
          setProjets(data.projets);
        }
      } catch (error) {
        if (error.name !== "AbortError") {
          console.warn("Utilisation des projets de secours :", error);
        }
      }
    }

    chargerProjetsPublics();

    return () => controller.abort();
  }, []);

  useEffect(() => {
    const photoEnregistree = localStorage.getItem(
      "patrick-portfolio-photo"
    );

    if (photoEnregistree) {
      setPhoto(photoEnregistree);
    }
  }, []);

useEffect(() => {
  const sections = document.querySelectorAll(
    "main > section"
  );

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.15,
    }
  );

  sections.forEach((section) => {
    section.classList.add("reveal");
    observer.observe(section);
  });

  return () => observer.disconnect();
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
const envoyerContact = async (event) => {
  event.preventDefault();
  setEnvoi(true);
  setRetour("");

  try {
    const reponse = await fetch(CONTACT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        name: nom,
        email,
        _subject: sujet || "Message depuis le portfolio",
        message,
      }),
    });

    const resultat = await reponse.json().catch(() => ({}));

    if (!reponse.ok) {
      const detail = Array.isArray(resultat.errors)
        ? resultat.errors.map((e) => e.message).join(", ")
        : resultat.error;
      throw new Error(detail || "Erreur lors de l'envoi.");
    }

    setRetour("Votre message a été envoyé avec succès !");
    setNom("");
    setEmail("");
    setSujet("");
    setMessage("");
  } catch (erreur) {
    setRetour("Échec de l'envoi : " + erreur.message);
  } finally {
    setEnvoi(false);
  }
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
      Étudiant en L2 Informatique de Gestion (IG) à l'ENI
      de Fianarantsoa, passionné par les réseaux informatiques,
      les systèmes, la virtualisation et la cybersécurité.
      Je développe mes compétences dans la conception,
      l'administration et la maintenance des infrastructures
      informatiques.
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
        <img
          src={photo}
          alt="Photo de MAHATRANGA Patrick"
        />
      ) : (
        <div className="photo-placeholder">
          <strong>MAHATRANGA Patrick</strong>
          <span>Importer votre photo</span>
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
      onClick={() => inputPhoto.current?.click()}
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
      Je suis MAHATRANGA Patrick, étudiant en deuxième année
      (L2), parcours Informatique de Gestion (IG), à l'École
      Nationale d'Informatique (ENI) de Fianarantsoa.
    </p>

    <p>
      Passionné par les technologies informatiques, je souhaite
      développer mes compétences et me spécialiser dans
      l'administration des réseaux et des systèmes informatiques.
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
            {projets.map((projet) => {
              const images = projet.images || [];
              const imageSecours = projet.image;

              return (
                <article className="project-card" key={projet.id || projet.titre}>
                  <div className="project-image">
                    {images.length > 0 ? (
                      <div className="project-gallery">
                        {images.map((image) => (
                          <a
                            href={`${API}${image.url}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            key={image.id}
                          >
                            <img
                              src={`${API}${image.url}`}
                              alt={projet.titre}
                              loading="lazy"
                            />
                          </a>
                        ))}
                      </div>
                    ) : imageSecours ? (
                      <img
                        src={imageSecours}
                        alt={projet.titre}
                        loading="lazy"
                        onError={(event) => {
                          event.currentTarget.style.display = "none";
                        }}
                      />
                    ) : (
                      <span className="project-number">PROJET INFORMATIQUE</span>
                    )}
                  </div>

                  <div className="project-info">
                    <span className="project-category">
                      {projet.categorie}
                    </span>

                    <h3>{projet.titre}</h3>
                    <p>{projet.description}</p>

                    {projet.technologies?.length > 0 && (
                      <div className="technology-list">
                        {projet.technologies.map((tech, index) => (
                          <span key={`${projet.id || projet.titre}-${index}`}>
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </section>


<section className="section formation-section" id="formation">
  <div className="section-heading">
    <p>MON PARCOURS</p>
    <h2>Formation académique</h2>
  </div>

  <div className="formation-card">
    <h3>École Nationale d'Informatique (ENI)</h3>

    <p>
      Université de Toliara
    </p>

    <p>
      Niveau : Deuxième année (L2)
    </p>

    <p>
      Parcours : Informatique de Gestion (IG)
    </p>

    <p>
      Domaine de spécialisation souhaité :
      Administration des réseaux et des systèmes informatiques.
    </p>

    <span>Formation en cours</span>
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

    <div className="contact-details">

      <div className="contact-item">
        <h3>Téléphone</h3>
        <a href="tel:+261338137601">
          033 81 376 01
        </a>
      </div>

      <div className="contact-item">
        <h3>WhatsApp</h3>
        <a
          href="https://wa.me/261338137601"
          target="_blank"
          rel="noopener noreferrer"
        >
          Me contacter sur WhatsApp
        </a>
      </div>

      <div className="contact-item">
        <h3>Adresse email</h3>
        <a href="mailto:patrickmahatranga@gmail.com">
          patrickmahatranga@gmail.com
        </a>
      </div>

        </div>

    <form className="contact-form" onSubmit={envoyerContact}>
      <label>Votre nom</label>
      <input
        type="text"
        placeholder="Entrez votre nom"
        value={nom}
        onChange={(e) => setNom(e.target.value)}
        required
        minLength={2}
      />

      <label>Votre adresse email</label>
      <input
        type="email"
        placeholder="exemple@email.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />

      <label>Sujet</label>
      <input
        type="text"
        placeholder="Objet de votre message"
        value={sujet}
        onChange={(e) => setSujet(e.target.value)}
        required
        minLength={3}
      />

      <label>Votre message</label>
      <textarea
        placeholder="Écrivez votre message ici..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        required
        minLength={10}
        rows={6}
      />

      <button type="submit" disabled={envoi}>
        {envoi ? "Envoi en cours..." : "Envoyer mon message"}
      </button>

      {retour && <p className="contact-feedback">{retour}</p>}
    </form>
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

