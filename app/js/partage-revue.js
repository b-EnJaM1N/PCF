// Le bouton « Partager l'article » des Cahiers du HandSlam (26 novembre, demande du porteur du projet) : le menu de partage du
// téléphone (dans l'appli Android, celui d'Android), sinon le lien copié. On partage l'adresse officielle de l'article (canonical).
const bouton = document.getElementById("partagerArticle"), msg = document.getElementById("partageMsg");
const dire = t => { if (msg) { msg.textContent = t; msg.hidden = false; } };
if (bouton) bouton.addEventListener("click", async () => {
  const titre = document.querySelector("h1")?.textContent?.trim() || document.title;
  const url = document.querySelector('link[rel="canonical"]')?.href || location.href;
  const texte = `${titre} · Les Cahiers du HandSlam`;
  if (navigator.share) {
    try { await navigator.share({ title: texte, text: texte, url }); return; } catch (e) { if (e?.name === "AbortError") return; }
  }
  try { await navigator.clipboard.writeText(`${texte}\n${url}`); dire("Lien copié : colle-le où tu veux."); } catch { dire(`Le lien de l'article : ${url}`); }
});
