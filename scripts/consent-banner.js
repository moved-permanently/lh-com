/**
 * Fallback cookie banner, shown only when OneTrust does not run (see consent.js).
 * Markup, texts and layout reproduce Lufthansa's OneTrust banner (template
 * "[LUFTHANSA]-GDPR Custom Template", otCenterRounded) and a reduced preference center.
 * Texts: OneTrust domain data 01994cb2-af99-7dbe-8fb0-56427773e54e, languages de and en.
 */

import { loadCSS } from './aem.js';
import { BRANDS, brandOf } from './brand.js';
import { pathLanguageOf } from './locale.js';

const TEXTS = {
  en: {
    title: 'Privacy Settings',
    intro: 'We use cookies and similar technologies that are necessary to run our apps and websites. With your consent to one or more of the following processing purposes, you agree on the use of additional cookies and similar technologies which are required to fulfil the respective purpose:',
    purposes: [
      ['Analytics and Statistics', 'We monitor our app and website to measure and improve their performance and evaluate the efficiency of our marketing campaigns.'],
      ['App and Website Personalization', 'We track and analyze your online interactions (e.g. searches, clicks, chatbot interactions) to offer you products and services which meet your interests.'],
      ['Advertising', 'We personalize online and social advertising by using collected data, building customer segments, sharing data with social media and advertising platforms, and embedding third-party content.'],
    ],
    special: 'You can withdraw or manage your consent at any time with future effect in the "Change Consent Settings" - section of the website footer.',
    links: [
      ['Privacy Policy', 'https://www.lufthansa.com/xx/en/data-protection-information?hidebanner=true'],
      ['Cookie Policy', 'https://www.lufthansa.com/xx/en/cookie-policy?hidebanner=true'],
      ['Imprint', 'https://www.lufthansa.com/xx/en/imprint?hidebanner=true'],
    ],
    manage: 'Manage preferences',
    reject: 'Only necessary',
    accept: 'Accept all',
    pcTitle: 'Privacy settings',
    save: 'Save preferences',
    close: 'Close preference center',
    alwaysActive: 'Always Active',
    groups: {
      C0001: ['Strictly Necessary Cookies', ['These cookies are necessary for the website to function and cannot be switched off in our systems. They are usually only set in response to actions made by you which amount to a request for services, such as setting your privacy preferences, logging in or filling in forms. You can set your browser to block or alert you about these cookies, but some parts of the site will not then work. These cookies do not store any personally identifiable information.']],
      C0002: ['Analytics and Statistics', ['Performing aggregated analytics of our digital touchpoints.', 'Monitoring website traffic.', 'Measuring marketing channel performance.']],
      C0004: ['App and Website Personalization', ['Tracking interactions from previous and current visits on our apps and websites', 'Analyzing digital behavior, purchase and service interaction history', 'Determining digital preferences and providing personalized products and services on our apps and websites']],
      C0005: ['Advertising', ['Using collected data to increase the relevance and personalize online and social advertising', 'Building segments on specific customer groups to reconnect with our products along the whole customer journey', 'Sharing specific customer data with advertising and social media partners to match our customers interests', 'Embedding 3rd party content on our digital touchpoints']],
    },
  },
  de: {
    title: 'Privatsphäre-Einstellungen',
    intro: 'Wir verwenden Cookies und ähnliche Technologien, die für den Betrieb unserer Apps und Internetseiten erforderlich sind. Mit Ihrer Zustimmung zu einem oder mehreren der folgenden Verarbeitungszwecke stimmen Sie der Verwendung zusätzlicher Cookies und ähnlicher Technologien zu, die zur Erfüllung des jeweiligen Zwecks erforderlich sind:',
    purposes: [
      ['Analyse und Statistik', 'Wir analysieren unsere App und Internetseite, um deren Leistung zu messen und zu verbessern und die Effizienz unserer Marketingkampagnen zu bewerten.'],
      ['Personalisierung von Apps und Internetseiten', 'Wir verfolgen und analysieren Ihre Online-Interaktionen (z. B. Suchen, Klicks, Chatbot-Interaktionen), um Ihnen Produkte und Services anzubieten, die Ihren Interessen entsprechen.'],
      ['Werbung', 'Wir personalisieren Online- und Social-Media-Werbung, indem wir erhobene Daten verwenden, Kundensegmente erstellen, Daten mit Social-Media- und Werbeplattformen teilen und Inhalte Dritter einbetten.'],
    ],
    special: 'Sie können Ihre Einwilligung jederzeit mit zukünftiger Wirkung im Abschnitt "Einwilligungseinstellungen ändern“ in der Fußzeile der Internetseite widerrufen oder verwalten.',
    links: [
      ['Datenschutzrichtlinie', 'https://www.lufthansa.com/de/de/informationen-zum-datenschutz?hidebanner=true'],
      ['Cookie-Richtlinie', 'https://www.lufthansa.com/xx/de/cookie-policy?hidebanner=true'],
      ['Impressum', 'https://www.lufthansa.com/de/de/impressum?hidebanner=true'],
    ],
    manage: 'Präferenzen verwalten',
    reject: 'Nur erforderliche',
    accept: 'Alle akzeptieren',
    pcTitle: 'Privatsphäre-Einstellungen',
    save: 'Präferenzen speichern',
    close: 'Präferenzen speichern',
    alwaysActive: 'Immer aktiv',
    groups: {
      C0001: ['Unbedingt erforderliche Cookies', ['Diese Cookies sind zur Funktion der Website erforderlich und können in Ihren Systemen nicht deaktiviert werden. In der Regel werden diese Cookies nur als Reaktion auf von Ihnen getätigte Aktionen gesetzt, die einer Dienstanforderung entsprechen, wie etwa dem Festlegen Ihrer Datenschutzeinstellungen, dem Anmelden oder dem Ausfüllen von Formularen. Sie können Ihren Browser so einstellen, dass diese Cookies blockiert oder Sie über diese Cookies benachrichtigt werden. Einige Bereiche der Website funktionieren dann aber nicht. Diese Cookies speichern keine personenbezogenen Daten.']],
      C0002: ['Analyse und Statistik', ['Durchführung aggregierter Analysen unserer digitalen Kontaktpunkte.', 'Überwachung des Datenverkehrs auf der Website.', 'Messung der Performance von Marketingkanälen.']],
      C0004: ['Personalisierung von Apps und Websites', ['Nachverfolgung von Interaktionen von früheren und aktuellen Besuchen unserer Apps und Websites.', 'Analyse der Historie von digitalem Verhalten, Kauf- und Serviceinteraktionen.', 'Ermittlung digitaler Präferenzen und Bereitstellung personalisierter Produkte und Services auf unseren Apps und Websites.']],
      C0005: ['Werbung', ['Nutzung der erfassten Daten zur Steigerung der Relevanz und Personalisierung von Online- und Social-Media-Werbung.', 'Segmentierung der Kund:innen in bestimmte Gruppen, um sie während der gesamten Customer Journey wieder mit unseren Produkten in Kontakt zu bringen.', 'Weitergabe bestimmter Kundendaten an Werbe- und Social-Media-Partner, um den Interessen unserer Kund:innen gerecht zu werden.', 'Einbindung von Inhalten von Drittanbietern in unsere digitalen Kontaktpunkte.']],
    },
  },
  fr: {
    title: 'Paramètres de confidentialité',
    intro: 'Nous utilisons des cookies et des technologies similaires pour le fonctionnement de nos applications et pages Internet. En consentant à l’une ou plusieurs des finalités de traitement suivantes, vous acceptez l’utilisation de cookies supplémentaires et de technologies similaires qui sont nécessaires à la réalisation de l’objectif concerné:',
    purposes: [
      ['Analyses et statistiques', 'Nous surveillons notre application et notre page Internet afin de mesurer et d’améliorer leurs performances et d’évaluer l’efficacité de nos campagnes marketing.'],
      ['Personnalisation de l’application et du site Web', 'Nous suivons et analysons vos interactions en ligne (recherches, clics, interactions avec le chatbot, etc.) afin de vous proposer des produits et des services qui correspondent à vos centres d’intérêt.'],
      ['Publicité', 'Nous personnalisons la publicité en ligne et sur les réseaux sociaux en utilisant les données collectées, en créant des segments de clients, en partageant des données avec les réseaux sociaux et les plateformes publicitaires, et en intégrant le contenu tiers.'],
    ],
    special: 'Vous pouvez retirer ou gérer votre consentement à tout moment avec effet futur dans la section « Modifier les paramètres de consentement » du pied de la page Internet.',
    links: [
      ['Politique de confidentialité', 'https://www.lufthansa.com/xx/fr/data-protection-information?hidebanner=true'],
      ['Gestion des cookies', 'https://www.lufthansa.com/xx/fr/cookie-policy?hidebanner=true'],
      ['Impression', 'https://www.lufthansa.com/xx/fr/imprint?hidebanner=true'],
    ],
    manage: 'Gérer les préférences',
    reject: 'Cookies nécessaires uniquement',
    accept: 'Tout accepter',
    pcTitle: 'Centre de préférences de la confidentialité',
    save: 'Enregistrer mes préférences',
    close: 'Fermer le centre de préférences',
    alwaysActive: 'Toujours actif',
    groups: {
      C0001: ['Cookies strictement nécessaires', ['Ces cookies sont nécessaires au fonctionnement du site Web et ne peuvent pas être désactivés dans nos systèmes. Ils sont généralement établis en tant que réponse à des actions que vous avez effectuées et qui constituent une demande de services, telles que la définition de vos préférences en matière de confidentialité, la connexion ou le remplissage de formulaires. Vous pouvez configurer votre navigateur afin de bloquer ou être informé de l\'existence de ces cookies, mais certaines parties du site Web peuvent être affectées. Ces cookies ne stockent aucune information d’identification personnelle.']],
      C0002: ['Analyses et statistiques', ['Effectuer des analyses agrégées de nos points de contact numériques', 'Surveiller le trafic sur le site Web', 'Mesurer les performances des canaux marketing']],
      C0004: ['Personnalisation de l’application et du site Web', ['Suivre les interactions des visites précédentes et actuelles sur nos applications et sites Web', 'Analyser l’historique des interactions avec les comportements numériques, les achats et les services', 'Déterminer les préférences numériques et fournir des produits et services personnalisés sur nos applications et sites Web']],
      C0005: ['Publicité', ['Utiliser les données recueillies pour augmenter la pertinence et personnaliser la publicité en ligne et sur les réseaux sociaux', 'Construire des segments sur des groupes de clients spécifiques pour se reconnecter à nos produits tout au long du parcours client', 'Nous partageons des données clients spécifiques avec nos partenaires publicitaires et de réseaux sociaux afin de répondre aux besoins de nos clients', 'Intégrer du contenu tiers à nos points de contact numériques']],
    },
  },
  es: {
    title: 'Opciones de privacidad',
    intro: 'Utilizamos cookies y tecnologías similares que son necesarias para ejecutar nuestras apps y páginas web. Con su consentimiento para uno o más de los siguientes fines de tratamiento, usted acepta el uso de cookies adicionales y tecnologías similares que son necesarias para cumplir con el fin respectivo:',
    purposes: [
      ['Análisis y estadísticas', 'Supervisamos nuestra app y nuestra página web para medir y mejorar su rendimiento y evaluar la eficiencia de nuestras campañas de marketing.'],
      ['Personalización de la app y la página web', 'Hacemos un seguimiento y analizamos sus interacciones online (p. ej., búsquedas, clics, interacciones con chatbot) para ofrecerle productos y servicios que se ajusten a sus intereses.'],
      ['Publicidad', 'Personalizamos la publicidad online y en redes sociales utilizando los datos recopilados, creando segmentos de clientes, compartiendo datos con redes sociales y plataformas publicitarias e incorporando contenido de terceros.'],
    ],
    special: 'Puede retirar o gestionar su consentimiento en cualquier momento con efecto futuro en la sección “Cambiar configuración de consentimiento” al pie de la página web.',
    links: [
      ['Política de privacidad', 'https://www.lufthansa.com/xx/es/data-protection-information?hidebanner=true'],
      ['Política de cookies', 'https://www.lufthansa.com/es/es/cookie-policy?hidebanner=true'],
      ['Aviso Legal', 'https://www.lufthansa.com/xx/es/imprint?hidebanner=true'],
    ],
    manage: 'Gestionar preferencias',
    reject: 'Solo las necesarias',
    accept: 'Aceptar todas',
    pcTitle: 'Centro de preferencia de la privacidad',
    save: 'Guardar preferencias',
    close: 'Cerrar centro de preferencias',
    alwaysActive: 'Activas siempre',
    groups: {
      C0001: ['Cookies estrictamente necesarias', ['Estas cookies son necesarias para que el sitio web funcione y no se pueden desactivar en nuestros sistemas. Usualmente están configuradas para responder a acciones hechas por usted para recibir servicios, tales como ajustar sus preferencias de privacidad, iniciar sesión en el sitio, o llenar formularios. Usted puede configurar su navegador para bloquear o alertar la presencia de estas cookies, pero algunas partes del sitio web no funcionarán. Estas cookies no guardan ninguna información personal identificable.']],
      C0002: ['Análisis y estadísticas', ['Realizar análisis agregados de nuestros puntos de contacto digitales', 'Supervisar el tráfico de la página web', 'Medir el rendimiento de los canales de marketing']],
      C0004: ['Personalización de la app y la página web', ['Hacer un seguimiento de las interacciones de visitas anteriores y actuales en nuestras apps y páginas web', 'Analizar el historial de comportamientos digitales, compras e interacción con el servicio', 'Determinar las preferencias digitales y proporcionar productos y servicios personalizados en nuestras apps y páginas web']],
      C0005: ['Publicidad', ['Usar los datos recopilados para aumentar la relevancia y personalizar la publicidad online y social', 'Construir segmentos en grupos de clientes específicos para volver a conectar con nuestros productos a lo largo de todo el trayecto del cliente', 'Compartir datos específicos de clientes con socios publicitarios y de redes sociales para satisfacer los intereses de nuestros clientes.', 'Incorporar contenido de terceros en nuestros puntos de contacto digitales']],
    },
  },
  el: {
    title: 'Ρυθμίσεις απορρήτου',
    intro: 'Χρησιμοποιούμε cookies και παρόμοιες τεχνολογίες που είναι απαραίτητες για την εκτέλεση των εφαρμογών και των ιστότοπών μας. Με τη συαίνεσή σας για έναν ή περισσότερους από τους ακόλουθους σκοπούς επεξεργασίας, συμφωνείτε με τη χρήση πρόσθετων cookies και παρόμοιων τεχνολογιών που απαιτούνται για την εκπλήρωση του αντίστοιχου σκοπού:',
    purposes: [
      ['Αναλυτικά στοιχεία και στατιστικά στοιχεία', 'Παρακολουθούμε την εφαρμογή και τον ιστότοπό μας για να μετρήσουμε και να βελτιώσουμε την απόδοσή τους και να αξιολογήσουμε την αποτελεσματικότητα των εκστρατειών μάρκετινγκ.'],
      ['Εξατομίκευση εφαρμογών και ιστότοπων', 'Παρακολουθούμε και αναλύουμε τις διαδικτυακές αλληλεπιδράσεις σας (π.χ. αναζητήσεις, κλικ, αλληλεπιδράσεις Chatbot) για να σας προσφέρουμε προϊόντα και υπηρεσίες που ανταποκρίνονται στα ενδιαφέροντά σας.'],
      ['Διαφημιστικά Cookie', 'Προσαρμόζουμε τις διαδικτυακές και κοινωνικές διαφημίσεις χρησιμοποιώντας τα συλλεχθέντα δεδομένα, δημιουργώντας τμήματα πελατών, κοινοποιώντας δεδομένα σε μέσα κοινωνικής δικτύωσης και διαφημιστικές πλατφόρμες και ενσωματώνοντας περιεχόμενο τρίτων.'],
    ],
    special: 'Μπορείτε να αποσύρετε ή να διαχειριστείτε τη συναίνεσή σας ανά πάσα στιγμή με μελλοντική ισχύ στην ενότητα «Αλλαγή ρυθμίσεων συναίνεσης» του υποσέλιδου του ιστότοπου.',
    links: [
      ['Πολιτική Απορρήτου', 'https://www.lufthansa.com/xx/el/data-protection-information?hidebanner=true'],
      ['Πολιτική για τα Cookies', 'https://www.lufthansa.com/xx/en/cookie-policy?hidebanner=true'],
      ['Αποτύπωμα', 'https://www.lufthansa.com/xx/el/imprint?hidebanner=true'],
    ],
    manage: 'Διαχείριση προτιμήσεων',
    reject: 'Μόνο τα απαραίτητα',
    accept: 'Αποδοχή όλων',
    pcTitle: 'Κέντρο προτιμήσεων απορρήτου',
    save: 'Αποθήκευση προτιμήσεων',
    close: 'Κλείστε το κέντρο προτιμήσεων',
    alwaysActive: 'Πάντα ενεργό',
    groups: {
      C0001: ['Απολύτως απαραίτητα cookies', ['Αυτά τα cookies είναι απαραίτητα για τη λειτουργία του ιστότοπου και δεν μπορούν να απενεργοποιηθούν στα συστήματά μας. Συνήθως ρυθμίζονται μόνο ως απόκριση σε ενέργειες που γίνονται από εσάς, που αφορούν ένα αίτημα για υπηρεσίες, όπως είναι η ρύθμιση των προτιμήσεων απορρήτου σας, η σύνδεση ή η συμπλήρωση φορμών. Μπορείτε να ρυθμίσετε το πρόγραμμα περιήγησής σας ώστε να αποκλείει ή να σας ειδοποιεί σχετικά με αυτά τα cookies, αλλά ορισμένα τμήματα της τοποθεσίας μπορεί να μην λειτουργούν σε αυτήν την περίπτωση.']],
      C0002: ['Αναλυτικά στοιχεία και στατιστικά στοιχεία', ['Εκτέλεση συγκεντρωτικών αναλύσεων των ψηφιακών σημείων επαφής μας', 'Παρακολούθηση της κίνησης στον ιστότοπο', 'Μέτρηση απόδοσης καναλιού μάρκετινγκ']],
      C0004: ['Εξατομίκευση εφαρμογών και ιστότοπων', ['Παρακολούθηση αλληλεπιδράσεων από προηγούμενες και τρέχουσες επισκέψεις στις εφαρμογές και τους ιστότοπούς μας', 'Ανάλυση του ιστορικού ψηφιακής συμπεριφοράς, αγορών και αλληλεπιδράσεων υπηρεσιών', 'Καθορισμός ψηφιακών προτιμήσεων και παροχή εξατομικευμένων προϊόντων και υπηρεσιών στις εφαρμογές και τους ιστότοπούς μας']],
      C0005: ['Διαφήμιση', ['Χρήση των δεδομένων που συλλέγονται για την αύξηση της συνάφειας και την εξατομίκευση της διαδικτυακής και κοινωνικής διαφήμισης', 'Δημιουργία τμημάτων σε συγκεκριμένες ομάδες πελατών για επανασύνδεση με τα προϊόντα μας σε όλη τη διάρκεια της διαδρομής των πελατών', 'Κοινοποίηση των συγκεκριμένων δεδομένων των πελατών στους διαφημιστικούς συνεργάτες μας και στα συνεργαζόμενα μέσα κοινωνικής δικτύωσης ώστε να ανταποκρίνονται στα ενδιαφέροντα των πελατών μας', 'Ενσωμάτωση περιεχομένου τρίτων στα ψηφιακά σημεία επαφής μας']],
    },
  },
  it: {
    title: 'Impostazioni sulla privacy',
    intro: 'Utilizziamo cookie e tecnologie simili necessari per gestire le nostre app e i nostri siti web. Con il suo consenso a una o più delle seguenti finalità di trattamento, accetta l’uso di cookie aggiuntivi e tecnologie simili necessari per raggiungere le rispettive finalità:',
    purposes: [
      ['Analisi e statistiche', 'Monitoriamo la nostra app e il nostro sito Internet per misurare e migliorare le loro prestazioni e valutare l’efficienza delle nostre campagne di marketing.'],
      ['Personalizzazione di app e siti Internet', 'Monitoriamo e analizziamo le sue interazioni online (ad es. ricerche, clic, interazioni tramite chatbot) per offrirle prodotti e servizi che soddisfano i suoi interessi.'],
      ['Pubblicità', 'Personalizziamo la pubblicità online e sui social utilizzando i dati raccolti, creando segmenti di clienti, condividendo dati con social media e piattaforme pubblicitarie e integrando contenuti di terze parti.'],
    ],
    special: 'Può revocare o gestire il suo consenso in qualsiasi momento con effetto futuro nella sezione “Modifica impostazioni di consenso” del piè di pagina del sito Internet.',
    links: [
      ['Informativa sulla privacy', 'https://www.lufthansa.com/xx/it/data-protection-information?hidebanner=true'],
      ['Informativa sui cookie', 'https://www.lufthansa.com/it/en/cookie-policy?hidebanner=true'],
      ['Dati societari', 'https://www.lufthansa.com/xx/it/imprint?hidebanner=true'],
    ],
    manage: 'Gestire le preferenze',
    reject: 'Solo il necessario',
    accept: 'Accetta tutto',
    pcTitle: 'Centro preferenze sulla privacy',
    save: 'Salva le preferenze',
    close: 'Chiudi il centro preferenze',
    alwaysActive: 'Sempre attivi',
    groups: {
      C0001: ['Cookie strettamente necessari', ['Questi cookie sono necessari per il funzionamento del sito e non possono essere disattivati ​​nei nostri sistemi. Di solito vengono impostati solo in risposta alle azioni da te effettuate che costituiscono una richiesta di servizi, come l\'impostazione delle preferenze di privacy, l\'accesso o la compilazione di moduli. È possibile impostare il browser per bloccare o avere avvisi riguardo questi cookie, ma di conseguenza alcune parti del sito non funzioneranno. Questi cookie non archiviano informazioni personali.']],
      C0002: ['Analisi e statistiche', ['Analisi aggregata dei nostri punti di contatto digitali.', 'Monitoraggio del traffico sul sito Internet.', 'Misurazione delle prestazioni dei canali di marketing.']],
      C0004: ['Personalizzazione di app e siti Internet', ['Tracciamento delle interazioni dalle visite precedenti e attuali all’interno delle nostre app e dei nostri siti Internet.', 'Analisi dei comportamenti digitali, cronologia delle interazioni di acquisto e servizio.', 'Determinazione delle preferenze digitali e fornitura di prodotti e servizi personalizzati all’interno delle nostre app e dei nostri siti Internet']],
      C0005: ['Pubblicità', ['Utilizzo dei dati raccolti per aumentare la pertinenza e personalizzare la pubblicità online e sui social.', 'Creazione di segmenti di gruppi specifici di clientela per invitarla a connettersi nuovamente ai nostri prodotti durante l’intero viaggio della clientela.', 'Condivisione di dati specifici relativi alla clientela con partner pubblicitari e di social media per soddisfare gli interessi della nostra clientela.', 'Integrazione di contenuti di terze parti nei nostri punti di contatto digitali.']],
    },
  },
  ja: {
    title: 'プライバシー設定',
    intro: '当社はアプリとウェブサイトの運営に必要なクッキーや類似技術を使用しています。お客様は、以下の処理目的のうち1つ以上に同意することにより、以下の各目的を達成するために必要となる追加のクッキーや類似技術の使用に同意することになります。',
    purposes: [
      ['解析と統計', '社は、アプリやウェブサイトを監視し、パフォーマンスの測定や改善、マーケティングキャンペーンの効率性の評価を行います。'],
      ['アプリとウェブサイトのパーソナライズ', '当社は、お客様の関心に合った商品やサービスを提供するために、お客様のオンライン上でのやり取り（検索、クリック、チャットボットでのやり取りなど）の追跡と分析を行います。'],
      ['広告', '当社は、収集したデータの使用、お客様セグメントの構築、ソーシャルメディアおよび広告プラットフォームとのデータ共有、第三者コンテンツの埋め込みを行うことで、オンラインおよびソーシャル広告をパーソナライズします。'],
    ],
    special: 'お客様は、ウェブサイトのフッターの「同意設定の変更」セクションで、いつでも同意を撤回または管理することができます。',
    links: [
      ['プライバシーポリシー', 'https://www.lufthansa.com/xx/ja/data-protection-information?hidebanner=true'],
      ['クッキーポリシー', 'https://www.lufthansa.com/xx/ja/cookie-policy?hidebanner=true'],
      ['インプリント', 'https://www.lufthansa.com/xx/ja/imprint?hidebanner=true'],
    ],
    manage: '設定を管理する',
    reject: '必要なもののみ',
    accept: 'すべて受け入れる',
    pcTitle: 'プライバシー優先設定センター',
    save: '設定を保存',
    close: '設定センターを閉じる',
    alwaysActive: '常にアクティブ',
    groups: {
      C0001: ['厳密に必要な Cookie', ['この Cookie はウェブサイトが正常に機能するために必要なもので、利用者のシステム内でスイッチをオフにすることはできません。これらは通常、プライバシー設定、ログイン、フォームへの入力など、サービスのリクエストに相当するユーザーのアクションに応じてのみ設定されます。この Cookie をブロック/警告するようにブラウザを設定することは可能ですが、サイトの一部が機能しなくなります。この Cookie が個人を特定できる情報を保存することはありません。']],
      C0002: ['アナリティクスと統計', ['デジタルタッチポイントの集計解析を実行', 'ウェブサイトトラフィックを監視', 'マーケティングチャネルのパフォーマンスを測定']],
      C0004: ['アプリとウェブサイトのパーソナライズ', ['当社アプリおよびウェブサイトでの以前および現在の訪問におけるインタラクションを追跡', 'デジタル挙動、購入、サービスの利用履歴を解析', 'デジタル設定の決定、当社アプリおよびウェブサイトでのパーソナライズされた商品およびサービスを提供']],
      C0005: ['広告', ['収集したデータを使用して関連性を高め、オンライン広告やSNS広告をパーソナライズ', '特定の顧客グループでセグメントを構築し、カスタマージャーニー全体を通じて自社商品との接点を再構築する', 'お客様の関心に合わせるために、お客様の特定のデータを広告やSNSのパートナーと共有', '第三者のコンテンツを当社のデジタルタッチポイントに組み込む']],
    },
  },
  ko: {
    title: '개인정보 보호 설정',
    intro: '루프트한자는 앱 및 웹사이트 운영에 필요한 쿠키 및 이와 유사한 기술을 사용합니다. 다음 처리 목적 중 하나 이상에 동의하는 경우, 귀하는 해당 목적을 달성하는 데 필요한 추가 쿠키 및 유사 기술의 사용에 동의하게 됩니다:',
    purposes: [
      ['분석 및 통계', '당사는 앱과 웹사이트의 성능을 측정하고 개선하며 마케팅 캠페인의 효율성을 평가하기 위해 앱과 웹사이트를 모니터링합니다.'],
      ['앱 및 웹사이트 맞춤 설정', '당사는 귀하의 관심사에 맞는 상품 및 서비스를 제공하기 위해 귀하의 온라인 상호작용(예: 검색, 클릭, 챗봇 상호작용)을 추적 및 분석합니다.'],
      ['광고', '당사는 수집된 데이터를 사용하고, 고객 세그먼트를 구축하며, 소셜 미디어 및 광고 플랫폼과 데이터를 공유하고, 제3자 콘텐츠를 삽입하여 온라인 및 소셜 광고를 개인화합니다.'],
    ],
    special: '귀하는 언제든지 웹사이트 하단의 “동의 설정 변경” 섹션에서 동의를 철회하거나 관리할 수 있으며, 이는 향후 효력이 발생합니다.',
    links: [
      ['개인정보 보호정책', 'https://www.lufthansa.com/xx/ko/data-protection-information?hidebanner=true'],
      ['쿠키 정책', 'https://www.lufthansa.com/xx/ko/cookie-policy?hidebanner=true'],
      ['임프린트', 'https://www.lufthansa.com/xx/ko/imprint?hidebanner=true'],
    ],
    manage: '설정 관리',
    reject: '필요한 경우에만',
    accept: '모두 수락',
    pcTitle: '개인정보 선호 센터',
    save: '선호사항 저장',
    close: '환경 설정 센터 닫기',
    alwaysActive: '항상 활성화',
    groups: {
      C0001: ['필수 쿠키', ['이 쿠키는 웹사이트의 기능을 위해 필수적이며, 회사 시스템 내에서 종료할 수 없습니다. 이 쿠키는 개인정보 선호도, 로그인 또는 양식 작성과 같은 서비스 요청에 해당하는 귀하의 행위에 따라서만 주로 설정됩니다. 귀하의 브라우저에서 이 쿠키를 차단하거나 쿠키에 대해 알림 설정을 할 수 있지만, 이 경우 해당 사이트의 일부 기능이 동작하지 않을 수 있습니다.']],
      C0002: ['분석 및 통계', ['디지털 터치포인트 전반에 대한 집계 분석 수행', '웹사이트 트래픽 모니터링', '마케팅 채널 성과 측정']],
      C0004: ['앱 및 웹사이트 맞춤 설정', ['앱 및 웹사이트에서 이전 및 현재 방문 내 상호작용 추적', '디지털 이용 행태와 구매 및 서비스 이용 이력 분석', '디지털 선호도를 파악하고 앱과 웹사이트에서 맞춤형 상품 및 서비스 제공']],
      C0005: ['광고', ['수집된 데이터를 활용해 온라인 및 소셜 광고의 관련성을 높이고 개인화', '특정 고객 그룹을 기준으로 세그먼트를 구성해 고객 여정 전반에서 자사 상품과 다시 연결', '고객의 관심사에 부합하도록 광고 및 소셜 미디어 파트너와 특정 고객 데이터 공유', '디지털 터치포인트에 제3자 콘텐츠 포함']],
    },
  },
  nl: {
    title: 'Privacy-instellingen',
    intro: 'We gebruiken cookies en vergelijkbare technologieën die nodig zijn om onze apps en websites te laten werken. Door toestemming te geven voor een of meer van de volgende verwerkingsdoeleinden, stemt u in met het gebruik van aanvullende cookies en vergelijkbare technologieën die nodig zijn om het betreffende doel te bereiken:',
    purposes: [
      ['Analyse en statistiek', 'We volgen onze app en website om de prestaties te meten en te verbeteren en de effectiviteit van onze marketingcampagnes te beoordelen.'],
      ['Personalisatie van app en website', 'We volgen en analyseren uw online interacties (bijv. zoekopdrachten, klikken, chatbotinteracties) om u producten en diensten aan te bieden die aansluiten bij uw interesses.'],
      ['Reclame', 'We personaliseren online en sociale reclame door verzamelde gegevens te gebruiken, klantsegmenten te vormen, gegevens te delen met sociale media en reclameplatforms en content van derden in te sluiten.'],
    ],
    special: 'U kunt uw toestemming op elk moment met ingang van de toekomst intrekken of beheren in het gedeelte “Toestemmingsinstellingen wijzigen” in de voettekst van de website.',
    links: [
      ['Privacybeleid', 'https://www.lufthansa.com/xx/en/data-protection-information?hidebanner=true'],
      ['Cookiebeleid', 'https://www.lufthansa.com/xx/en/cookie-policy?hidebanner=true'],
      ['Colofon', 'https://www.lufthansa.com/xx/en/imprint?hidebanner=true'],
    ],
    manage: 'Voorkeuren beheren',
    reject: 'Alleen noodzakelijke',
    accept: 'Alles accepteren',
    pcTitle: 'Privacyvoorkeurencentrum',
    save: 'Voorkeuren opslaan',
    close: 'Voorkeurencentrum sluiten',
    alwaysActive: 'Altijd actief',
    groups: {
      C0001: ['Strikt noodzakelijke cookies', ['Deze cookies zijn nodig om de website te laten functioneren en kunnen in onze systemen niet worden uitgeschakeld. Ze worden doorgaans alleen geplaatst als reactie op handelingen van u die neerkomen op een verzoek om diensten, zoals het instellen van uw privacyvoorkeuren, inloggen of het invullen van formulieren. U kunt uw browser zo instellen dat deze cookies worden geblokkeerd of dat u erover wordt gewaarschuwd, maar sommige delen van de site werken dan niet. Deze cookies slaan geen persoonlijk identificeerbare informatie op.']],
      C0002: ['Analyse en statistiek', ['Uitvoeren van geaggregeerde analyses van onze digitale contactpunten.', 'Monitoren van het websiteverkeer.', 'Meten van de prestaties van marketingkanalen.']],
      C0004: ['Personalisatie van app en website', ['Volgen van interacties tijdens eerdere en huidige bezoeken aan onze apps en websites', 'Analyseren van digitaal gedrag en de geschiedenis van aankopen en service-interacties', 'Bepalen van digitale voorkeuren en aanbieden van gepersonaliseerde producten en diensten in onze apps en op onze websites']],
      C0005: ['Reclame', ['Gebruiken van verzamelde gegevens om de relevantie van online en sociale reclame te vergroten en deze te personaliseren', 'Vormen van segmenten van specifieke klantgroepen om ze tijdens de hele klantreis opnieuw met onze producten in contact te brengen', 'Delen van specifieke klantgegevens met reclame- en socialemediapartners om aan te sluiten bij de interesses van onze klanten', 'Insluiten van content van derden in onze digitale contactpunten']],
    },
  },
  pl: {
    title: 'Ustawienia prywatności',
    intro: 'Wykorzystujemy pliki cookie i podobne technologie, które są niezbędne do działania naszych aplikacji i stron internetowych. Wyrażając zgodę na jeden lub więcej z poniższych celów przetwarzania, akceptujesz użycie dodatkowych plików cookie i podobnych technologii, które są wymagane do realizacji danego celu:',
    purposes: [
      ['Analityka i statystyki', 'Monitorujemy naszą aplikację i stronę internetową, aby mierzyć i poprawiać ich wydajność oraz oceniać skuteczność naszych kampanii marketingowych.'],
      ['Personalizacja aplikacji i strony internetowej', 'Aby oferować Ci produkty i usługi odpowiadające Twoim zainteresowaniom, śledzimy i analizujemy Twoje interakcje online (np. wyszukiwania, kliknięcia, interakcje z chatbotami).'],
      ['Reklama', 'ersonalizujemy reklamy internetowe i społecznościowe, wykorzystując zgromadzone dane, budując segmenty klientów, udostępniając dane mediom społecznościowym i platformom reklamowym oraz zamieszczając treści stron trzecich.'],
    ],
    special: 'Możesz wycofać swoją zgodę lub zarządzać nią w dowolnym momencie (ze skutkiem na przyszłość) w sekcji „Zmień ustawienia zgody” w stopce strony internetowej.',
    links: [
      ['Polityka prywatności', 'https://www.lufthansa.com/xx/pl/data-protection-information?hidebanner=true'],
      ['Polityka plików cookie', 'https://www.lufthansa.com/xx/pl/cookie-policy?hidebanner=true'],
      ['O nas', 'https://www.lufthansa.com/xx/pl/imprint?hidebanner=true'],
    ],
    manage: 'zarządzaj ustawieniami',
    reject: 'Tylko niezbędne',
    accept: 'Zaakceptuj wszystkie',
    pcTitle: 'Ustawienia prywatności',
    save: 'Zapisz preferencje',
    close: 'Zamknij centrum preferencji',
    alwaysActive: 'Zawsze aktywne',
    groups: {
      C0001: ['Ściśle niezbędne pliki cookie', ['Te pliki cookie są niezbędne dla funkcjonowania strony internetowej i nie mogą być wyłączone w naszych systemach. Są one zazwyczaj ustawiane tylko w odpowiedzi na działania podejmowane przez użytkownika, które sprowadzają się do zapytania o usługi, takie jak ustawienie preferencji prywatności, logowanie lub wypełnianie formularzy. Można ustawić przeglądarkę tak, aby blokowała lub ostrzegała o tych plikach cookie, ale niektóre części witryny nie będą wtedy działały. Te pliki cookie nie przechowują żadnych danych osobowych.']],
      C0002: ['Analityka i statystyki', ['Przeprowadzanie zbiorczych analiz naszych cyfrowych punktów kontaktowych', 'Monitorowanie ruchu na stronie internetowej', 'Pomiar wydajności kanałów marketingowych']],
      C0004: ['Personalizacja aplikacji i strony internetowej', ['Śledzenie interakcji z poprzednich i bieżących wizyt w naszych aplikacjach i na stronach internetowych', 'Analiza zachowań cyfrowych, zakupów i historii korzystania z usług', 'kreślanie preferencji cyfrowych i dostarczanie spersonalizowanych produktów i usług w naszych aplikacjach oraz na stronach internetowych']],
      C0005: ['Reklama', ['Wykorzystywanie zebranych danych w celu poprawy trafności i personalizacji reklam internetowych i społecznościowych', 'Tworzenie segmentów dla określonych grup klientów w celu umożliwienia im ponownego kontaktu z naszymi produktami podczas całej podróży klienta', 'Udostępnianie określonych danych klientów partnerom z branży reklamowej i mediów społecznościowych w celu dopasowania do potrzeb naszych klientów', 'sadzanie treści podmiotów zewnętrznych w naszych cyfrowych punktach kontaktowych']],
    },
  },
  pt: {
    title: 'Configurações de privacidade',
    intro: 'Utilizamos cookies e tecnologias semelhantes que são necessárias para executar as nossas aplicações e páginas na Internet. Com o seu consentimento para uma ou mais das seguintes finalidades de tratamento, concorda com a utilização de cookies adicionais e tecnologias semelhantes que são necessárias para cumprir a respetiva finalidade:',
    purposes: [
      ['Análise e estatísticas', 'Monitorizamos a nossa aplicação e página na Internet para medir e melhorar o respetivo desempenho e avaliar a eficiência das nossas campanhas de marketing.'],
      ['Personalização da aplicação e da página na Internet', 'Rastreamos e analisamos as suas interações online (por exemplo, pesquisas, cliques, interações com o chatbot) para lhe oferecer produtos e serviços que vão ao encontro dos seus interesses.'],
      ['Publicidade', 'Personalizamos a publicidade online e nas redes sociais utilizando dados recolhidos, construindo segmentos de clientes, partilhando dados com plataformas de redes sociais e publicidade e incorporando conteúdo de terceiros.'],
    ],
    special: 'Pode retirar ou gerir o seu consentimento em qualquer momento com efeito futuro na secção “Alterar definições de consentimento” no rodapé da página na Internet.',
    links: [
      ['Política de Privacidade', 'https://www.lufthansa.com/xx/pt/data-protection-information?hidebanner=true'],
      ['Política de Cookies', 'https://www.lufthansa.com/xx/pt/cookie-policy?hidebanner=true'],
      ['Ficha técnica', 'https://www.lufthansa.com/xx/pt/imprint?hidebanner=true'],
    ],
    manage: 'Gerir preferências',
    reject: 'Apenas o necessário',
    accept: 'Aceitar tudo',
    pcTitle: 'Centro de preferências de privacidade',
    save: 'Guardar preferências',
    close: 'Fechar centro de preferências',
    alwaysActive: 'Sempre ativos',
    groups: {
      C0001: ['Cookies estritamente necessários', ['Estes cookies são necessários para que o website funcione e não podem ser desligados nos nossos sistemas. Normalmente, eles só são configurados em resposta a ações levadas a cabo por si e que correspondem a uma solicitação de serviços, tais como definir as suas preferências de privacidade, iniciar sessão ou preencher formulários. Pode configurar o seu navegador para bloquear ou alertá-lo(a) sobre esses cookies, mas algumas partes do website não funcionarão. Estes cookies não armazenam qualquer informação pessoal identificável.']],
      C0002: ['Análise e estatística', ['Efetuar análises agregadas dos nossos pontos de contacto digitais', 'Monitorizar o tráfego da página na Internet', 'Medir o desempenho do canal de marketing']],
      C0004: ['Personalização da aplicação e da página na Internet', ['Seguimento de interações de visitas anteriores e atuais nas nossas aplicações e páginas na Internet', 'Análise do comportamento digital, histórico de compras e interação com o serviço', 'Determinar as preferências digitais e fornecer produtos e serviços personalizados nas nossas aplicações e páginas na Internet']],
      C0005: ['Publicidade', ['Utilizar dados recolhidos para aumentar a relevância e personalizar publicidade online e nas redes sociais', 'riar segmentos em grupos de clientes específicos para se reconectar com os nossos produtos ao longo de toda a jornada do cliente', 'Partilhar dados específicos de clientes com parceiros de publicidade e redes sociais para corresponder aos interesses dos nossos clientes', 'Incorporar conteúdo de terceiros nos nossos pontos de contacto digitais']],
    },
  },
  ru: {
    title: 'Настройки конфиденциальности',
    intro: 'Мы используем файлы cookie и аналогичные технологии, необходимые для работы наших приложений и веб-сайтов. Предоставляя согласие на одну или несколько из следующих целей обработки, вы соглашаетесь на использование дополнительных файлов cookie и аналогичных технологий, которые необходимы для выполнения соответствующей цели:',
    purposes: [
      ['Аналитика и статистика', 'Мы следим за нашим приложением и веб-сайтом для оценки и улучшения их эффективности, а также оценки эффективности наших маркетинговых кампаний.'],
      ['Персонализация приложения и веб-сайта', 'Мы отслеживаем и анализируем ваши взаимодействия в Интернете (например, поиски, клики, взаимодействие с чат-ботами) для предложения вам продуктов и услуг, соответствующих вашим интересам.'],
      ['Реклама', 'Мы персонализируем онлайн-рекламу и рекламу в социальных сетях, используя собранные данные, формируя потребительские сегменты, обмениваясь данными с социальными сетями и рекламными платформами, а также встраивая сторонний контент.'],
    ],
    special: 'Вы можете отозвать свое согласие или управлять им в любое время в разделе «Изменить настройки согласия» в нижней части веб-сайта. Отзыв или изменения согласия не имеют обратной силы.',
    links: [
      ['Политика конфиденциальности', 'https://www.lufthansa.com/xx/ru/data-protection-information?hidebanner=true'],
      ['Политика в отношении файлов cookie', 'https://www.lufthansa.com/xx/ru/cookie-policy?hidebanner=true'],
      ['Правовая информация', 'https://www.lufthansa.com/xx/ru/imprint?hidebanner=true'],
    ],
    manage: 'Управление настройками',
    reject: 'Только необходимые',
    accept: 'Принять все',
    pcTitle: 'Центр настроек конфиденциальности',
    save: 'Сохранить предпочтения',
    close: 'Закрыть центр предпочтений',
    alwaysActive: 'Всегда активно',
    groups: {
      C0001: ['Строго необходимые файлы cookie', ['Хранение информации (например, настройки веб-сайта, такие как язык, размер шрифта или данные для входа)']],
      C0002: ['Аналитика и статистика', ['Проведение обобщенной аналитики наших цифровых источников', 'Отслеживание трафика веб-сайта', 'Оценка эффективности маркетинговых каналов']],
      C0004: ['Персонализация приложения и веб-сайта', ['Отслеживание взаимодействия во время предыдущих и текущих посещений наших приложений и веб-сайтов', 'Анализ цифрового поведения, истории покупок и взаимодействия с услугами', 'Определение цифровых предпочтений и предоставление персонализированных продуктов и услуг в наших приложениях и на веб-сайтах']],
      C0005: ['Реклама', ['Использование собранных данных для повышения актуальности и персонализации интернет-рекламы и рекламы в социальных сетях', 'Создание сегментов для определенных групп клиентов для восстановления связи с нашими продуктами на протяжении всего пути клиента', 'Передача конкретных данных о клиентах партнерам по рекламе и социальным сетям в соответствии с интересами наших клиентов', 'Размещение стороннего контента в наших цифровых источниках']],
    },
  },
  zh: {
    title: '隐私设置',
    intro: '我们使用运营应用程序和网站所必需的 Cookie 和类似技术。您同意以下一个或多个处理目的，即表示您同意使用满足相应目的所需的额外 Cookie 和类似技术：',
    purposes: [
      ['分析和统计', '我们会监控自己的应用程序和网站，以衡量和改善其性能，并评估我们营销活动的效率。'],
      ['应用程序和网站个性化', '我们会跟踪和分析您的在线互动活动（例如搜索、点击、聊天机器人互动），以便为您提供符合您兴趣的产品和服务。'],
      ['广告', '我们通过使用收集到的数据、建立客户细分、与社交媒体和广告平台共享数据，以及嵌入第三方内容来提供个性化的在线和社交广告。'],
    ],
    special: '您可以随时在网站页脚的“更改同意设置”部分撤销或管理您的同意，相关操作会在未来生效。',
    links: [
      ['隐私政策', 'https://www.lufthansa.com/xx/zh/data-protection-information?hidebanner=true'],
      ['Cookie 政策', 'https://www.lufthansa.com/xx/zh/cookie-policy?hidebanner=true'],
      ['公司信息公示', 'https://www.lufthansa.com/xx/zh/imprint?hidebanner=true'],
    ],
    manage: '管理偏好设置',
    reject: '仅限必要',
    accept: '全部接受',
    pcTitle: '隐私偏好中心',
    save: '保存偏好',
    close: '关闭偏好中心',
    alwaysActive: '始终处于活动状态',
    groups: {
      C0001: ['绝对必要的 Cookie', ['网站运行离不开这些 Cookie 且您不能在系统中将其关闭。通常仅根据您所做出的操作（即服务请求）来设置这些 Cookie，如设置隐私偏好、登录或填充表格。您可以将您的浏览器设置为阻止或向您提示这些 Cookie，但可能会导致某些网站功能无法工作。']],
      C0002: ['分析和统计', ['对我们的数字触摸点进行汇总分析', '监控网站流量', '评估营销渠道表现']],
      C0004: ['应用程序和网站个性化', ['跟踪之前和当前访问我们应用程序和网站时的互动', '分析数字行为、购买和服务互动历史记录', '确定数字偏好&#xff0c;并在我们的应用程序和网站上提供个性化产品和服务']],
      C0005: ['广告', ['使用收集的数据提高内容相关性&#xff0c;实现在线和社交广告个性化', '建立特定客户群体细分&#xff0c;以便在整个客户旅程中重新连接客户与我们的产品', '与广告及社交媒体合作伙伴共享特定客户数据&#xff0c;以精准匹配客户兴趣。', '在我们的数字触摸点嵌入第三方内容']],
    },
  },
};

const NECESSARY = 'C0001';
const GROUP_ORDER = ['C0001', 'C0002', 'C0004', 'C0005'];
const SVG_NS = 'http://www.w3.org/2000/svg';

let root;
let cssLoaded;
let lastFocus;

function el(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);
  Object.entries(attrs).forEach(([key, value]) => {
    if (key === 'className') node.className = value;
    else if (key === 'text') node.textContent = value;
    else node.setAttribute(key, value);
  });
  node.append(...children.flat(Infinity).filter((child) => child !== null && child !== undefined));
  return node;
}

/** the arrow Lufthansa's icon font draws in front of the banner links */
function arrow() {
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('viewBox', '0 0 9 21');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('focusable', 'false');
  const path = document.createElementNS(SVG_NS, 'path');
  path.setAttribute('d', 'M.75 10.5h7M5 7.25l3.25 3.25L5 13.75');
  svg.append(path);
  return el('span', { className: 'lh-consent-arrow' }, svg);
}

const LINK_KEYS = ['privacy', 'cookies', 'imprint'];

/**
 * The banner's privacy, cookie and imprint links: lh-com's (www.lufthansa.com), a brand's own
 * pages on its www (scripts/brands.js consentLinks; English for other languages; a page the
 * brand lacks is left out).
 * @param {string} lang the page language
 * @param {Function} [read] metadata reader
 * @returns {Array<[string, string]>}
 */
export function bannerLinks(lang, read) {
  const { links } = TEXTS[lang] || TEXTS.en;
  const key = brandOf(read);
  const own = key && BRANDS[key].consentLinks;
  if (!own) return links;
  const urls = own[lang] || own.en;
  return links.map(([label], i) => [label, urls[LINK_KEYS[i]]]).filter(([, href]) => href);
}

function texts() {
  const lang = pathLanguageOf(document.documentElement.lang);
  return { ...(TEXTS[lang] || TEXTS.en), links: bannerLinks(lang) };
}

/** banner description: intro, purposes, withdrawal note */
function description(t) {
  return [
    el('p', { text: t.intro }),
    t.purposes.map(([heading, text]) => [el('h3', { text: heading }), el('p', { text })]),
    el('p', { className: 'lh-consent-special', text: t.special }),
  ];
}

function arrowLink(label, href) {
  return el('a', { href, target: '_blank', rel: 'noopener noreferrer' }, arrow(), label);
}

function trapFocus(dialog) {
  dialog.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab') return;
    const focusable = [...dialog.querySelectorAll('a[href], button:not([disabled]), input:not([disabled])')]
      .filter((node) => node.offsetParent !== null);
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey && (document.activeElement === first || document.activeElement === dialog)) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  });
}

/** Removes the fallback banner. */
export function removeConsentBanner() {
  if (!root) return;
  root.remove();
  root = null;
  if (lastFocus && lastFocus.isConnected) lastFocus.focus({ preventScroll: true });
}

function finish(onChoice, groups) {
  removeConsentBanner();
  onChoice(groups);
}

function buildBanner(t, { onChoice, openPreferences }) {
  const manage = el('a', { href: '#', className: 'lh-consent-manage' }, arrow(), t.manage);
  manage.addEventListener('click', (e) => {
    e.preventDefault();
    openPreferences();
  });

  const reject = el('button', { type: 'button', className: 'lh-consent-reject', text: t.reject });
  const accept = el('button', { type: 'button', className: 'lh-consent-accept', text: t.accept });
  reject.addEventListener('click', () => finish(onChoice, [NECESSARY]));
  accept.addEventListener('click', () => finish(onChoice, GROUP_ORDER));

  const dialog = el(
    'div',
    {
      className: 'lh-consent-banner',
      role: 'dialog',
      'aria-modal': 'true',
      'aria-labelledby': 'lh-consent-title',
      'aria-describedby': 'lh-consent-text',
      tabindex: '0',
    },
    el(
      'div',
      { className: 'lh-consent-container' },
      el(
        'div',
        { className: 'lh-consent-group' },
        el('h2', { id: 'lh-consent-title', className: 'lh-consent-title', text: t.title }),
        el(
          'div',
          { id: 'lh-consent-text', className: 'lh-consent-text' },
          description(t),
          el(
            'div',
            { className: 'lh-consent-links' },
            t.links.map(([label, href]) => el('div', {}, arrowLink(label, href))),
            el('div', {}, manage),
          ),
        ),
      ),
      el('div', { className: 'lh-consent-actions' }, el('div', { className: 'lh-consent-buttons' }, reject, accept)),
    ),
  );
  return dialog;
}

function buildPreferences(t, { onChoice, groups }) {
  const items = GROUP_ORDER.map((id) => {
    const [name, details] = t.groups[id];
    const necessary = id === NECESSARY;
    const input = el('input', {
      type: 'checkbox',
      id: `lh-consent-group-${id}`,
      value: id,
      'aria-describedby': `lh-consent-desc-${id}`,
    });
    input.checked = necessary || groups.includes(id);
    input.disabled = necessary;
    const toggle = el('button', {
      type: 'button',
      className: 'lh-consent-toggle',
      'aria-expanded': 'false',
      'aria-controls': `lh-consent-desc-${id}`,
      'aria-label': name,
    });
    const desc = el(
      'div',
      { id: `lh-consent-desc-${id}`, className: 'lh-consent-group-desc', hidden: '' },
      details.length > 1 ? el('ul', {}, details.map((text) => el('li', { text }))) : el('p', { text: details[0] }),
    );
    toggle.addEventListener('click', () => {
      const open = toggle.getAttribute('aria-expanded') !== 'true';
      toggle.setAttribute('aria-expanded', String(open));
      desc.hidden = !open;
    });
    return el(
      'li',
      { className: 'lh-consent-item' },
      el(
        'div',
        { className: 'lh-consent-item-header' },
        el('label', { for: input.id }, input, el('span', { text: name })),
        necessary ? el('span', { className: 'lh-consent-always', text: t.alwaysActive }) : null,
        toggle,
      ),
      desc,
    );
  });

  const selected = (dialog) => [...dialog.querySelectorAll('input[type="checkbox"]:checked')].map((input) => input.value);
  const close = el('button', { type: 'button', className: 'lh-consent-close', 'aria-label': t.close });
  const save = el('button', { type: 'button', className: 'lh-consent-save', text: t.save });
  const accept = el('button', { type: 'button', className: 'lh-consent-accept-all', text: t.accept });

  const dialog = el(
    'div',
    {
      className: 'lh-consent-pc',
      role: 'dialog',
      'aria-modal': 'true',
      'aria-labelledby': 'lh-consent-pc-title',
      tabindex: '-1',
    },
    el('div', { className: 'lh-consent-pc-header' }, close),
    el(
      'div',
      { className: 'lh-consent-pc-content' },
      el('h2', { id: 'lh-consent-pc-title', className: 'lh-consent-pc-title', text: t.pcTitle }),
      el(
        'div',
        { className: 'lh-consent-pc-desc' },
        description(t),
        el('div', { className: 'lh-consent-links' }, t.links.map(([label, href]) => el('div', {}, arrowLink(label, href)))),
      ),
      el('ul', { className: 'lh-consent-groups' }, items),
    ),
    el('div', { className: 'lh-consent-pc-footer' }, save, accept),
  );
  // closing the preference center saves the current selection, like OneTrust
  close.addEventListener('click', () => finish(onChoice, selected(dialog)));
  save.addEventListener('click', () => finish(onChoice, selected(dialog)));
  accept.addEventListener('click', () => finish(onChoice, GROUP_ORDER));
  return dialog;
}

/**
 * Shows the fallback banner (or its preference center).
 * @param {Object} options
 * @param {string} [options.view] 'banner' or 'preferences'
 * @param {string[]} [options.groups] currently accepted categories
 * @param {Function} options.onChoice receives the accepted categories
 */
export async function showConsentBanner({ view = 'banner', groups = [NECESSARY], onChoice }) {
  if (!cssLoaded) cssLoaded = loadCSS(`${window.hlx.codeBasePath}/styles/consent-banner.css`);
  await cssLoaded;
  removeConsentBanner();
  lastFocus = document.activeElement;

  const t = texts();
  const lang = t === TEXTS.de ? 'de' : 'en';
  root = el('div', { className: 'lh-consent', lang, 'data-nosnippet': 'true' }, el('div', { className: 'lh-consent-overlay' }));
  const render = (which) => {
    const current = root.querySelector('.lh-consent-banner, .lh-consent-pc');
    const dialog = which === 'preferences'
      ? buildPreferences(t, { onChoice, groups })
      : buildBanner(t, { onChoice, openPreferences: () => render('preferences') });
    trapFocus(dialog);
    if (current) current.replaceWith(dialog);
    else root.append(dialog);
    const target = which === 'preferences' ? dialog.querySelector('.lh-consent-close') : dialog;
    target.focus({ preventScroll: true });
  };
  document.body.append(root);
  render(view);
}
