package fr.handslam.app;

import android.annotation.SuppressLint;
import android.content.ActivityNotFoundException;
import android.content.ContentValues;
import android.content.Intent;
import android.graphics.Color;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Environment;
import android.provider.MediaStore;
import android.util.Base64;
import android.view.View;
import android.webkit.CookieManager;
import android.webkit.JavascriptInterface;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.FrameLayout;
import android.widget.Toast;

import androidx.activity.ComponentActivity;
import androidx.activity.OnBackPressedCallback;
import androidx.core.content.FileProvider;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.core.view.WindowInsetsControllerCompat;
import androidx.webkit.WebViewCompat;
import androidx.webkit.WebViewFeature;

import java.io.File;
import java.io.FileOutputStream;
import java.io.OutputStream;
import java.util.Collections;

/**
 * L'appli HandSlam : https://handslam.fr/ affiché dans sa propre fenêtre (WebView).
 * Le jeu reste le site ; l'appli ajoute seulement ce que le navigateur faisait à sa place :
 * le bouton retour, le partage et l'enregistrement des images, les liens extérieurs ouverts ailleurs.
 */
public class MainActivity extends ComponentActivity {

    private static final String ACCUEIL = "https://handslam.fr/";
    private static final String HOTE = "handslam.fr";
    // Ajouté à la « carte d'identité » du navigateur : le site sait qu'il est dans l'appli (statistiques par origine).
    private static final String MARQUE_APPLI = " HandSlamApp/" + BuildConfig.VERSION_NAME;

    // Branché sur la page avant ses propres scripts : navigator.share passe par Android, et les boutons
    // « Enregistrer l'image » (liens de téléchargement d'une image générée) aussi.
    private static final String PONT_JS =
        "(function(){if(!window.HandSlamAndroid||window.__handslamPont)return;window.__handslamPont=1;" +
        "var b64=function(blob){return new Promise(function(ok,ko){var r=new FileReader();" +
        "r.onload=function(){ok(String(r.result).split(',')[1]||'')};r.onerror=ko;r.readAsDataURL(blob)})};" +
        "try{Object.defineProperty(navigator,'canShare',{configurable:true,value:function(d){return !!d&&(!d.files||d.files.length===1)}});" +
        "Object.defineProperty(navigator,'share',{configurable:true,value:function(d){d=d||{};" +
        "if(d.files&&d.files.length){var f=d.files[0];return b64(f).then(function(x){" +
        "HandSlamAndroid.partagerFichier(x,f.type||'image/png',f.name||'handslam.png',d.title||'',d.text||'')})}" +
        "HandSlamAndroid.partagerTexte(d.title||'',[d.text,d.url].filter(Boolean).join('\\n'));return Promise.resolve()}})}catch(e){}" +
        "document.addEventListener('click',function(e){var a=e.target&&e.target.closest&&e.target.closest('a[download]');" +
        "if(!a)return;var h=a.getAttribute('href')||'';if(!/^(blob:|data:)/.test(h))return;e.preventDefault();" +
        "fetch(h).then(function(r){return r.blob()}).then(function(bl){return b64(bl).then(function(x){" +
        "HandSlamAndroid.enregistrerImage(x,bl.type||'image/png',a.getAttribute('download')||'handslam.png')})})" +
        ".catch(function(){})},true)})();";

    private WebView vue;

    @SuppressLint({"SetJavaScriptEnabled", "AddJavascriptInterface"})
    @Override
    protected void onCreate(Bundle etat) {
        super.onCreate(etat);

        // Bord à bord (obligatoire depuis Android 15) : on décale la page sous la barre d'état et au-dessus du clavier.
        WindowCompat.setDecorFitsSystemWindows(getWindow(), false);
        FrameLayout cadre = new FrameLayout(this);
        cadre.setBackgroundColor(Color.parseColor("#0F2C52"));
        vue = new WebView(this);
        vue.setBackgroundColor(Color.parseColor("#0F2C52"));
        cadre.addView(vue, new FrameLayout.LayoutParams(FrameLayout.LayoutParams.MATCH_PARENT, FrameLayout.LayoutParams.MATCH_PARENT));
        setContentView(cadre);
        ViewCompat.setOnApplyWindowInsetsListener(cadre, (v, encarts) -> {
            Insets b = encarts.getInsets(WindowInsetsCompat.Type.systemBars() | WindowInsetsCompat.Type.displayCutout());
            Insets clavier = encarts.getInsets(WindowInsetsCompat.Type.ime());
            v.setPadding(b.left, b.top, b.right, Math.max(b.bottom, clavier.bottom));
            return WindowInsetsCompat.CONSUMED;
        });
        WindowInsetsControllerCompat barres = WindowCompat.getInsetsController(getWindow(), cadre);
        barres.setAppearanceLightStatusBars(false);
        barres.setAppearanceLightNavigationBars(false);

        WebSettings r = vue.getSettings();
        r.setJavaScriptEnabled(true);
        r.setDomStorageEnabled(true);
        r.setDatabaseEnabled(true);
        r.setMediaPlaybackRequiresUserGesture(false);   // les sons du court partent sans attendre un toucher
        r.setTextZoom(100);                             // la mise en page du jeu ne suit pas la taille de police du téléphone
        r.setSupportMultipleWindows(false);
        r.setUserAgentString(r.getUserAgentString() + MARQUE_APPLI);
        CookieManager.getInstance().setAcceptCookie(true);
        CookieManager.getInstance().setAcceptThirdPartyCookies(vue, true);

        vue.addJavascriptInterface(new Pont(), "HandSlamAndroid");
        if (WebViewFeature.isFeatureSupported(WebViewFeature.DOCUMENT_START_SCRIPT)) {
            WebViewCompat.addDocumentStartJavaScript(vue, PONT_JS, Collections.singleton("https://" + HOTE));
        }

        vue.setWebChromeClient(new WebChromeClient());
        vue.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView v, WebResourceRequest demande) {
                Uri u = demande.getUrl();
                if ("https".equals(u.getScheme()) && HOTE.equals(u.getHost())) return false;   // le site reste dans l'appli
                ouvrirAilleurs(u);                                                             // le reste : navigateur, e-mail…
                return true;
            }

            @Override
            public void onPageFinished(WebView v, String adresse) {
                // Au cas où l'injection au démarrage de la page n'existe pas sur ce téléphone.
                v.evaluateJavascript(PONT_JS, null);
            }

            @Override
            public void onReceivedError(WebView v, WebResourceRequest demande, WebResourceError erreur) {
                if (!demande.isForMainFrame()) return;
                v.loadDataWithBaseURL(null,
                    "<html><body style='margin:0;height:100vh;display:flex;flex-direction:column;align-items:center;" +
                    "justify-content:center;background:#0F2C52;color:#fff;font-family:sans-serif;text-align:center;padding:24px'>" +
                    "<p style='font-size:20px'>Pas de connexion</p><p style='opacity:.8'>HandSlam a besoin d'Internet pour se lancer.</p>" +
                    "<p><a style='color:#F2C14E;font-size:18px' href='" + ACCUEIL + "'>Réessayer</a></p></body></html>",
                    "text/html", "UTF-8", null);
            }
        });
        vue.setDownloadListener((adresse, agent, disposition, type, taille) -> ouvrirAilleurs(Uri.parse(adresse)));

        getOnBackPressedDispatcher().addCallback(this, new OnBackPressedCallback(true) {
            @Override
            public void handleOnBackPressed() {
                if (vue.canGoBack()) vue.goBack();
                else moveTaskToBack(true);
            }
        });

        if (etat != null) vue.restoreState(etat);
        else vue.loadUrl(adresseDe(getIntent()));
    }

    @Override
    protected void onNewIntent(Intent intention) {
        super.onNewIntent(intention);
        Uri u = intention.getData();
        if (u != null) vue.loadUrl(adresseDe(intention));
    }

    private static String adresseDe(Intent intention) {
        Uri u = intention != null ? intention.getData() : null;
        if (u != null && "https".equals(u.getScheme()) && HOTE.equals(u.getHost())) return u.toString();
        return ACCUEIL;
    }

    @Override
    protected void onSaveInstanceState(Bundle etat) {
        super.onSaveInstanceState(etat);
        vue.saveState(etat);
    }

    @Override
    protected void onPause() {
        super.onPause();
        CookieManager.getInstance().flush();
    }

    private void ouvrirAilleurs(Uri u) {
        try {
            startActivity(new Intent(Intent.ACTION_VIEW, u).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK));
        } catch (ActivityNotFoundException e) {
            Toast.makeText(this, "Aucune appli pour ouvrir ce lien", Toast.LENGTH_SHORT).show();
        }
    }

    private File ecrireFichier(String base64, String nom) throws Exception {
        File dossier = new File(getCacheDir(), "partages");
        //noinspection ResultOfMethodCallIgnored
        dossier.mkdirs();
        File f = new File(dossier, nom.replaceAll("[^A-Za-z0-9._-]", "_"));
        try (FileOutputStream sortie = new FileOutputStream(f)) {
            sortie.write(Base64.decode(base64, Base64.DEFAULT));
        }
        return f;
    }

    /** Ce que la page peut demander à Android (appelé depuis le JavaScript du site, voir PONT_JS). */
    private class Pont {
        @JavascriptInterface
        public void partagerTexte(String titre, String texte) {
            runOnUiThread(() -> {
                Intent i = new Intent(Intent.ACTION_SEND).setType("text/plain").putExtra(Intent.EXTRA_TEXT, texte);
                if (!titre.isEmpty()) i.putExtra(Intent.EXTRA_SUBJECT, titre);
                startActivity(Intent.createChooser(i, titre.isEmpty() ? "Partager" : titre));
            });
        }

        @JavascriptInterface
        public void partagerFichier(String base64, String type, String nom, String titre, String texte) {
            runOnUiThread(() -> {
                try {
                    Uri u = FileProvider.getUriForFile(MainActivity.this, getPackageName() + ".fichiers", ecrireFichier(base64, nom));
                    Intent i = new Intent(Intent.ACTION_SEND).setType(type).putExtra(Intent.EXTRA_STREAM, u)
                        .addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
                    if (!texte.isEmpty()) i.putExtra(Intent.EXTRA_TEXT, texte);
                    startActivity(Intent.createChooser(i, titre.isEmpty() ? "Partager" : titre));
                } catch (Exception e) {
                    Toast.makeText(MainActivity.this, "Le partage n'a pas marché", Toast.LENGTH_SHORT).show();
                }
            });
        }

        @JavascriptInterface
        public void enregistrerImage(String base64, String type, String nom) {
            runOnUiThread(() -> {
                if (Build.VERSION.SDK_INT < Build.VERSION_CODES.Q) {   // avant Android 10 : on passe par le partage
                    partagerFichier(base64, type, nom, "", "");
                    return;
                }
                try {
                    ContentValues v = new ContentValues();
                    v.put(MediaStore.Images.Media.DISPLAY_NAME, nom);
                    v.put(MediaStore.Images.Media.MIME_TYPE, type);
                    v.put(MediaStore.Images.Media.RELATIVE_PATH, Environment.DIRECTORY_PICTURES + "/HandSlam");
                    Uri u = getContentResolver().insert(MediaStore.Images.Media.EXTERNAL_CONTENT_URI, v);
                    if (u == null) throw new IllegalStateException();
                    try (OutputStream sortie = getContentResolver().openOutputStream(u)) {
                        if (sortie == null) throw new IllegalStateException();
                        sortie.write(Base64.decode(base64, Base64.DEFAULT));
                    }
                    Toast.makeText(MainActivity.this, "Image enregistrée dans la galerie (HandSlam)", Toast.LENGTH_SHORT).show();
                } catch (Exception e) {
                    Toast.makeText(MainActivity.this, "L'image n'a pas pu être enregistrée", Toast.LENGTH_SHORT).show();
                }
            });
        }
    }

    @Override
    protected void onDestroy() {
        if (vue != null) {
            vue.setVisibility(View.GONE);
            vue.destroy();
        }
        super.onDestroy();
    }
}
