import React, { useState, useEffect } from 'react';
const { useCallback, useMemo } = React;
import {
  Plus,
  Package,
  TrendingUp,
  DollarSign,
  Bell,
  Users,
  FileText,
  ShoppingCart,
  Calendar,
  PieChart,
  CreditCard,
  AlertCircle,
  Clock,
  Search,
  Edit2,
  Trash2,
  Eye,
  X,
  Truck,
  LogOut,
  BarChart3,
  LineChart,
  TrendingDown,
} from 'lucide-react';
// Pas besoin d'importer XLSX, on va l'utiliser directement depuis un CDN
// ========== NOUVEAU : CONFIGURATION DU PRESSING ==========
const PRESSING_CONFIG_KEY = 'pressing_config';
const PRESSING_LIST_KEY = 'pressing_list';

// Fonction pour ajouter un pressing à la liste
const addPressingToList = async (config) => {
  const stored = localStorage.getItem(PRESSING_LIST_KEY);
  const list = stored ? JSON.parse(stored) : [];

  // Vérifier si le pressing existe déjà
  const exists = list.find((p) => p.pressingId === config.pressingId);
  if (!exists) {
    list.push({
      pressingId: config.pressingId,
      nomPressing: config.nomPressing,
      adresse: config.adresse,
      telephone: config.telephone,
      dateCreation: config.dateCreation,
    });

    localStorage.setItem(PRESSING_LIST_KEY, JSON.stringify(list));

    // Sauvegarder dans Firebase
    if (window.__firestoreDb) {
      const db = window.__firestoreDb;
      await db.collection('tina-data').doc(PRESSING_LIST_KEY).set(
        {
          value: list,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
    }
  }
};

// Fonction pour obtenir la liste des pressings
const getPressingList = () => {
  const stored = localStorage.getItem(PRESSING_LIST_KEY);
  return stored ? JSON.parse(stored) : [];
};
// Composant d'enregistrement du pressing
function EcranEnregistrementPressing({ onComplete }) {
  const [config, setConfig] = useState({
    nomPressing: '',
    adresse: '',
    telephone: '',
    horaires: '',
    signature: '',
  });

  const handleSave = async () => {
    if (
      !config.nomPressing ||
      !config.adresse ||
      !config.telephone ||
      !config.horaires
    ) {
      alert('❌ Veuillez remplir tous les champs obligatoires');
      return;
    }

    // Générer un ID unique pour ce pressing
    const pressingId =
      'pressing_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);

    const configWithId = {
      ...config,
      pressingId: pressingId,
      dateCreation: new Date().toISOString(),
    };

    // Sauvegarder dans localStorage et Firebase
    const storage = {
      set: async (key, value) => {
        localStorage.setItem(key, value);
        if (window.__firestoreDb) {
          const db = window.__firestoreDb;
          const data = JSON.parse(value);
          await db.collection('tina-data').doc(key).set(
            {
              value: data,
              updatedAt: new Date().toISOString(),
            },
            { merge: true }
          );
        }
      },
    };

    await storage.set(PRESSING_CONFIG_KEY, JSON.stringify(configWithId));

    // Sauvegarder aussi l'ID du pressing actif
    localStorage.setItem('current_pressing_id', pressingId);
    await addPressingToList(configWithId);
    onComplete(configWithId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-2xl w-full">
        <div className="text-center mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-4 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
            <Package className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Bienvenue sur Tina
          </h1>
          <p className="text-gray-600">
            Configurez votre pressing pour commencer
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nom du pressing <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={config.nomPressing}
              onChange={(e) =>
                setConfig({ ...config, nomPressing: e.target.value })
              }
              placeholder="Ex: Pressing Tina"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Adresse <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={config.adresse}
              onChange={(e) =>
                setConfig({ ...config, adresse: e.target.value })
              }
              placeholder="Ex: Cocody, Riviera Bonoumin, Abidjan"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Téléphone <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              value={config.telephone}
              onChange={(e) =>
                setConfig({ ...config, telephone: e.target.value })
              }
              placeholder="Ex: +225 07 12 34 56 78"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Horaires d'ouverture <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={config.horaires}
              onChange={(e) =>
                setConfig({ ...config, horaires: e.target.value })
              }
              placeholder="Ex: Lun-Sam 8h-19h, Dimanche fermé"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Message de signature personnalisé (optionnel)
            </label>
            <textarea
              value={config.signature}
              onChange={(e) =>
                setConfig({ ...config, signature: e.target.value })
              }
              placeholder="Ex: Merci de votre confiance ! Votre satisfaction est notre priorité."
              rows={3}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <button
            onClick={handleSave}
            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-4 rounded-xl font-semibold shadow-lg flex items-center justify-center gap-2"
          >
            <Package className="w-5 h-5" />
            Enregistrer et continuer
          </button>

          {/* ✅ NOUVEAU : Bouton "J'ai déjà un pressing" */}
          <button
            onClick={() => {
              if (
                confirm(
                  'Avez-vous déjà configuré un pressing ?\n\nVous serez redirigé vers la page de connexion.'
                )
              ) {
                // Créer une config par défaut pour bypasser l'écran d'enregistrement
                const defaultConfig = {
                  pressingId:
                    localStorage.getItem('current_pressing_id') || 'default',
                  nomPressing: 'Tina',
                  adresse: '',
                  telephone: '',
                  horaires: '',
                  signature: '',
                  dateCreation: new Date().toISOString(),
                };
                onComplete(defaultConfig);
              }
            }}
            className="w-full mt-3 px-4 py-3 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition flex items-center justify-center gap-2 border border-gray-300"
          >
            J'ai déjà un pressing configuré
          </button>
        </div>
      </div>
    </div>
  );
}
// Composant de sélection/changement de pressing
function SelectionPressing({ onSelect, onNewPressing }) {
  const [pressings, setPressings] = useState([]);

  useEffect(() => {
    const loadPressings = () => {
      const list = getPressingList();
      console.log('🔍 SelectionPressing - Liste chargée:', list);
      setPressings(list);
    };
    loadPressings();
  }, []);

  console.log('🔍 SelectionPressing - Pressings dans state:', pressings);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-2xl w-full">
        <div className="text-center mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-4 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
            <Package className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Sélectionnez votre pressing
          </h1>
          <p className="text-gray-600">
            Choisissez un pressing ou créez-en un nouveau
          </p>
        </div>
        {console.log('🔍 Rendu - Nombre de pressings:', pressings.length)}
        {console.log('🔍 Rendu - Liste:', pressings)}
        {pressings.length > 0 && (
          <div className="space-y-3 mb-6">
            {pressings.map((pressing) => (
              <button
                key={pressing.pressingId}
                onClick={() => onSelect(pressing)}
                className="w-full text-left p-4 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-bold text-lg text-gray-800">
                      {pressing.nomPressing}
                    </div>
                    <div className="text-sm text-gray-600">
                      {pressing.adresse}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {pressing.telephone}
                    </div>
                  </div>
                  <div className="text-blue-500">
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        <button
          onClick={onNewPressing}
          className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-4 rounded-xl font-semibold shadow-lg flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Créer un nouveau pressing
        </button>
      </div>
    </div>
  );
}

// Articles du pressing avec prix Laverie et Pressing
const ARTICLES_PRESSING = [
  { nom: 'Débardeur et Top Femme', prixLaverie: 500, prixPressing: 500 },
  { nom: 'Tee Shirt/Maillot / Gilet', prixLaverie: 500, prixPressing: 700 },
  {
    nom: 'Chemise manche courte /Polo manche courte',
    prixLaverie: 500,
    prixPressing: 700,
  },
  { nom: 'Blazer / Veste', prixLaverie: 1000, prixPressing: 1000 },
  {
    nom: 'Chemise délicate (Soie, lin,…)',
    prixLaverie: 1000,
    prixPressing: 1000,
  },
  { nom: 'Pull Over (Homme,Femme)', prixLaverie: 500, prixPressing: 800 },
  {
    nom: 'Polo manche longue/Chemise manche longue',
    prixLaverie: 1000,
    prixPressing: 1000,
  },
  { nom: 'Haut Boubou / Tunique', prixLaverie: 1000, prixPressing: 1000 },
  { nom: 'Sweatshirt / Haut Jogging', prixLaverie: 500, prixPressing: 800 },
  { nom: 'Blouse', prixLaverie: 1000, prixPressing: 1000 },
  { nom: 'Blouse médicale', prixLaverie: 1000, prixPressing: 1200 },
  { nom: 'Haut traditionnel', prixLaverie: 1000, prixPressing: 1000 },
  { nom: 'Blouson/Manteau', prixLaverie: 1000, prixPressing: 2000 },
  {
    nom: 'Jupe courte/Collant / Leggings',
    prixLaverie: 500,
    prixPressing: 700,
  },
  { nom: 'Short / Culotte / Bermuda', prixLaverie: 500, prixPressing: 700 },
  { nom: 'Caleçon homme', prixLaverie: 500, prixPressing: 500 },
  { nom: 'Jupe plissée/Pantacourt', prixLaverie: 500, prixPressing: 800 },
  { nom: 'Pantalon jeans', prixLaverie: 500, prixPressing: 800 },
  { nom: 'Pantalon sweat / Jogging', prixLaverie: 500, prixPressing: 700 },
  { nom: 'Pantalon tissu homme et femme', prixLaverie: 500, prixPressing: 800 },
  {
    nom: 'Pantalon délicat (lin, velours,…)',
    prixLaverie: 700,
    prixPressing: 1000,
  },
  { nom: 'Pantalon médical', prixLaverie: 500, prixPressing: 1000 },
  {
    nom: 'Combinaison / Combishort/Salopette',
    prixLaverie: 1000,
    prixPressing: 1000,
  },
  {
    nom: 'Robe de chambre et Robe courte',
    prixLaverie: 500,
    prixPressing: 800,
  },
  { nom: 'Robe Pagne', prixLaverie: 500, prixPressing: 1000 },
  { nom: 'Tunique Médicale', prixLaverie: 1000, prixPressing: 1200 },
  { nom: 'Pyjama/ Robe longue', prixLaverie: 500, prixPressing: 1000 },
  { nom: 'Survêtement 2 pièces', prixLaverie: 500, prixPressing: 1200 },
  { nom: 'Boubou 1 Pièce', prixLaverie: 500, prixPressing: 1000 },
  { nom: 'Boubou 2 Pièces', prixLaverie: 1500, prixPressing: 1500 },
  { nom: 'Boubou 3 pièces', prixLaverie: 2500, prixPressing: 2500 },
  { nom: 'Soutane', prixLaverie: 500, prixPressing: 2000 },
  { nom: 'Tailleur (veste et Jupe)', prixLaverie: 500, prixPressing: 1500 },
  { nom: 'Costume 2 et 3pièces femme', prixLaverie: 2000, prixPressing: 2000 },
  {
    nom: 'Ensemble Haut et Bas (2 et 3 pièces)',
    prixLaverie: 1300,
    prixPressing: 1500,
  },
  { nom: 'Kimono', prixLaverie: 2000, prixPressing: 2000 },
  {
    nom: 'Robe délicate (lin, perlés, dentelle…)',
    prixLaverie: 1500,
    prixPressing: 1500,
  },
  { nom: 'Robe de soirée courte', prixLaverie: 1500, prixPressing: 1500 },
  { nom: 'Robe de soirée longue', prixLaverie: 2000, prixPressing: 2000 },
  { nom: 'Robe de mariée', prixLaverie: 5000, prixPressing: 5000 },
  { nom: 'Costume 2 pièces homme', prixLaverie: 2000, prixPressing: 2000 },
  { nom: 'Costume 3 pièces homme', prixLaverie: 2500, prixPressing: 2500 },
  { nom: 'Habit traditionnel homme', prixLaverie: 2000, prixPressing: 2000 },
  { nom: 'Habit traditionnel femme', prixLaverie: 2000, prixPressing: 2000 },
  { nom: 'Cape / Poncho', prixLaverie: 1500, prixPressing: 1500 },
  { nom: 'Cravate/Noeud papillon', prixLaverie: 500, prixPressing: 500 },
  { nom: 'Nappe de table', prixLaverie: 1000, prixPressing: 1000 },
  { nom: 'Serviette de table', prixLaverie: 500, prixPressing: 500 },
  { nom: 'Tissu africain', prixLaverie: 500, prixPressing: 500 },
  { nom: 'Serviette de bain', prixLaverie: 500, prixPressing: 500 },
  { nom: 'Drap 1 place', prixLaverie: 1000, prixPressing: 1000 },
  { nom: 'Drap 2 places', prixLaverie: 1500, prixPressing: 1500 },
  { nom: "Taie d'oreiller", prixLaverie: 500, prixPressing: 500 },
  { nom: 'Housse de coussin', prixLaverie: 500, prixPressing: 500 },
  { nom: 'Housse de fauteuil', prixLaverie: 1000, prixPressing: 1000 },
  { nom: 'Housse de matelas', prixLaverie: 1000, prixPressing: 2000 },
  { nom: 'Couette 1 et 2 place', prixLaverie: 2000, prixPressing: 2000 },
  { nom: 'Couette 3 places', prixLaverie: 2500, prixPressing: 2500 },
  { nom: 'Couette 4 places', prixLaverie: 2500, prixPressing: 3000 },
  { nom: 'Couette Grande taille', prixLaverie: 3000, prixPressing: 3500 },
  { nom: 'Housse de lit', prixLaverie: 1500, prixPressing: 1500 },
  { nom: 'Petit Rideau', prixLaverie: 1000, prixPressing: 1000 },
  {
    nom: 'Grand Rideau/ Rideau voilage',
    prixLaverie: 1500,
    prixPressing: 1500,
  },
  { nom: 'Amidonnage', prixLaverie: 500, prixPressing: 500 },
  { nom: 'Haut Dame / Chemiser', prixLaverie: 500, prixPressing: 700 },
  { nom: 'Ensemble Dame', prixLaverie: 1500, prixPressing: 1500 },
  { nom: 'Veste Dame sans manche', prixLaverie: 700, prixPressing: 1000 },
  {
    nom: 'Ensemble délicat (Lin, etc.)',
    prixLaverie: 1500,
    prixPressing: 2000,
  },
  { nom: 'Body Dame', prixLaverie: 500, prixPressing: 500 },
  { nom: 'Sac', prixLaverie: 1000, prixPressing: 1000 },
  { nom: 'Surchemise', prixLaverie: 700, prixPressing: 1000 },
  { nom: 'Colant', prixLaverie: 500, prixPressing: 1000 },
  { nom: 'Vêtement enfants', prixLaverie: 250, prixPressing: 300 },
  { nom: 'Teinture Ensemble Homme', prixLaverie: 8000, prixPressing: 8000 },
  { nom: 'Ensemble culotte', prixLaverie: 1000, prixPressing: 1500 },
];

// Prix fixe pour le service Repassage
const PRIX_REPASSAGE = 200;

// ==========================================
// CHARGEMENT DYNAMIQUE DE XLSX
// ==========================================
const loadXLSX = () => {
  return new Promise((resolve, reject) => {
    if (window.XLSX) {
      resolve(window.XLSX);
      return;
    }

    const script = document.createElement('script');
    script.src =
      'https://cdn.sheetjs.com/xlsx-0.20.1/package/dist/xlsx.full.min.js';
    script.onload = () => resolve(window.XLSX);
    script.onerror = reject;
    document.head.appendChild(script);
  });
};

// ==========================================
// FONCTIONS D'EXPORT EXCEL
// ==========================================

const exporterTableauDeBord = async (commandes, transactions, charges) => {
  const XLSX = await loadXLSX();

  const recetteTotal = transactions
    .filter((t) => t.type === 'recette')
    .reduce((sum, t) => sum + t.montant, 0);
  const chargesTotal = charges.reduce((sum, c) => sum + c.montant, 0);
  const benefice = recetteTotal - chargesTotal;
  const commandesEnCours = commandes.filter((c) => c.statut !== 'livre').length;
  const commandesPrete = commandes.filter((c) => c.statut === 'pret').length;

  const dataDashboard = [
    ['TABLEAU DE BORD - TINA E-PRESSING'],
    ["Date d'export", new Date().toLocaleDateString('fr-FR')],
    [],
    ['STATISTIQUES GÉNÉRALES'],
    ['Indicateur', 'Valeur'],
    ['Recettes totales', `${recetteTotal.toLocaleString()} FCFA`],
    ['Charges totales', `${chargesTotal.toLocaleString()} FCFA`],
    ['Bénéfice total', `${benefice.toLocaleString()} FCFA`],
    ['Total commandes', commandes.length],
    ['Commandes en cours', commandesEnCours],
    ['Commandes prêtes', commandesPrete],
    [],
    ['COMMANDES PRÊTES'],
    ['Client', 'Téléphone', 'Montant', 'Date livraison'],
  ];

  commandes
    .filter((c) => c.statut === 'pret')
    .forEach((cmd) => {
      dataDashboard.push([
        cmd.clientNom,
        cmd.clientTel,
        cmd.montantTotal,
        new Date(cmd.dateLivraison).toLocaleDateString('fr-FR'),
      ]);
    });

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(dataDashboard);
  ws['!cols'] = [{ wch: 25 }, { wch: 20 }, { wch: 20 }, { wch: 20 }];
  XLSX.utils.book_append_sheet(wb, ws, 'Tableau de bord');
  XLSX.writeFile(
    wb,
    `Tina_Dashboard_${new Date().toISOString().split('T')[0]}.xlsx`
  );

  alert('✅ Export Dashboard réussi !');
};

const exporterComptabiliteAnnuelle = async (
  commandes,
  transactions,
  charges,
  selectedYear
) => {
  const XLSX = await loadXLSX();
  const mois = [
    'Janvier',
    'Février',
    'Mars',
    'Avril',
    'Mai',
    'Juin',
    'Juillet',
    'Août',
    'Septembre',
    'Octobre',
    'Novembre',
    'Décembre',
  ];

  const getDataForMonth = (month, year) => {
    const filterByMonth = (items) =>
      items.filter((item) => {
        const date = new Date(item.createdAt || item.date);
        return date.getMonth() === month && date.getFullYear() === year;
      });

    const commandesMois = filterByMonth(commandes);
    const transactionsMois = filterByMonth(transactions);
    const chargesMois = filterByMonth(charges);
    const recetteMois = transactionsMois
      .filter((t) => t.type === 'recette')
      .reduce((sum, t) => sum + t.montant, 0);
    const chargesMoisTotal = chargesMois.reduce((sum, c) => sum + c.montant, 0);

    return {
      commandes: commandesMois.length,
      recette: recetteMois,
      charges: chargesMoisTotal,
      benefice: recetteMois - chargesMoisTotal,
    };
  };

  const dataCompta = [
    [`COMPTABILITÉ ANNUELLE ${selectedYear} - TINA E-PRESSING`],
    ["Date d'export", new Date().toLocaleDateString('fr-FR')],
    [],
    ['Mois', 'CA (FCFA)', 'Charges (FCFA)', 'Bénéfice (FCFA)', 'Commandes'],
  ];

  let totaux = { recette: 0, charges: 0, benefice: 0, commandes: 0 };
  for (let i = 0; i < 12; i++) {
    const data = getDataForMonth(i, selectedYear);
    dataCompta.push([
      mois[i],
      data.recette,
      data.charges,
      data.benefice,
      data.commandes,
    ]);
    totaux.recette += data.recette;
    totaux.charges += data.charges;
    totaux.benefice += data.benefice;
    totaux.commandes += data.commandes;
  }

  dataCompta.push([]);
  dataCompta.push([
    `TOTAL ${selectedYear}`,
    totaux.recette,
    totaux.charges,
    totaux.benefice,
    totaux.commandes,
  ]);

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(dataCompta);
  ws['!cols'] = [
    { wch: 15 },
    { wch: 15 },
    { wch: 15 },
    { wch: 15 },
    { wch: 15 },
  ];
  XLSX.utils.book_append_sheet(wb, ws, `Comptabilité ${selectedYear}`);
  XLSX.writeFile(wb, `Tina_Comptabilite_${selectedYear}.xlsx`);

  alert('✅ Export Comptabilité réussi !');
};

const exporterClients = async (clients, commandes, getNiveauFidelite) => {
  const XLSX = await loadXLSX();

  const getClientStats = (clientTel) => {
    const commandesClient = commandes.filter((c) => c.clientTel === clientTel);
    const commandesTerminees = commandesClient.filter(
      (c) => c.statut === 'livre'
    );
    const totalDepense = commandesTerminees.reduce(
      (sum, c) => sum + c.montantTotal,
      0
    );
    const fidelite = getNiveauFidelite(commandesTerminees.length);
    const derniereCommande =
      commandesClient.length > 0
        ? commandesClient.sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
          )[0]
        : null;
    return {
      nombreCommandes: commandesClient.length,
      commandesTerminees: commandesTerminees.length,
      totalDepense,
      fidelite,
      derniereCommande,
    };
  };

  const dataClients = [
    ['LISTE DES CLIENTS - TINA E-PRESSING'],
    ["Date d'export", new Date().toLocaleDateString('fr-FR')],
    [],
    [
      'Nom',
      'Téléphone',
      'Fidélité',
      'Remise %',
      'Total commandes',
      'Terminées',
      'Dépenses (FCFA)',
      'Dernière commande',
      'Statut',
    ],
  ];

  clients.forEach((client) => {
    const stats = getClientStats(client.telephone);
    dataClients.push([
      client.nom,
      client.telephone,
      stats.fidelite.niveau,
      stats.fidelite.remise,
      stats.nombreCommandes,
      stats.commandesTerminees,
      stats.totalDepense,
      stats.derniereCommande
        ? new Date(stats.derniereCommande.createdAt).toLocaleDateString('fr-FR')
        : 'Aucune',
      client.estMecontent ? 'Mécontent' : 'Satisfait',
    ]);
  });

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(dataClients);
  ws['!cols'] = [
    { wch: 25 },
    { wch: 15 },
    { wch: 15 },
    { wch: 10 },
    { wch: 15 },
    { wch: 15 },
    { wch: 20 },
    { wch: 20 },
    { wch: 15 },
  ];
  XLSX.utils.book_append_sheet(wb, ws, 'Clients');
  XLSX.writeFile(
    wb,
    `Tina_Clients_${new Date().toISOString().split('T')[0]}.xlsx`
  );

  alert('✅ Export Clients réussi !');
};

const exporterTout = async (
  commandes,
  transactions,
  charges,
  clients,
  selectedYear,
  getNiveauFidelite
) => {
  const XLSX = await loadXLSX();
  const wb = XLSX.utils.book_new();
  const mois = [
    'Janvier',
    'Février',
    'Mars',
    'Avril',
    'Mai',
    'Juin',
    'Juillet',
    'Août',
    'Septembre',
    'Octobre',
    'Novembre',
    'Décembre',
  ];

  // Dashboard
  const recetteTotal = transactions
    .filter((t) => t.type === 'recette')
    .reduce((sum, t) => sum + t.montant, 0);
  const chargesTotal = charges.reduce((sum, c) => sum + c.montant, 0);
  const benefice = recetteTotal - chargesTotal;
  const dataDashboard = [
    ['STATISTIQUES'],
    ['Recettes', recetteTotal],
    ['Charges', chargesTotal],
    ['Bénéfice', benefice],
    ['Commandes', commandes.length],
  ];
  const wsDashboard = XLSX.utils.aoa_to_sheet(dataDashboard);
  XLSX.utils.book_append_sheet(wb, wsDashboard, 'Dashboard');

  // Comptabilité
  const getDataForMonth = (month, year) => {
    const filterByMonth = (items) =>
      items.filter((item) => {
        const date = new Date(item.createdAt || item.date);
        return date.getMonth() === month && date.getFullYear() === year;
      });
    const commandesMois = filterByMonth(commandes);
    const transactionsMois = filterByMonth(transactions);
    const chargesMois = filterByMonth(charges);
    const recetteMois = transactionsMois
      .filter((t) => t.type === 'recette')
      .reduce((sum, t) => sum + t.montant, 0);
    const chargesMoisTotal = chargesMois.reduce((sum, c) => sum + c.montant, 0);
    return {
      commandes: commandesMois.length,
      recette: recetteMois,
      charges: chargesMoisTotal,
      benefice: recetteMois - chargesMoisTotal,
    };
  };

  const dataCompta = [['Mois', 'CA', 'Charges', 'Bénéfice', 'Commandes']];
  for (let i = 0; i < 12; i++) {
    const data = getDataForMonth(i, selectedYear);
    dataCompta.push([
      mois[i],
      data.recette,
      data.charges,
      data.benefice,
      data.commandes,
    ]);
  }
  const wsCompta = XLSX.utils.aoa_to_sheet(dataCompta);
  XLSX.utils.book_append_sheet(wb, wsCompta, 'Comptabilité');

  // Commandes
  const dataCommandes = [
    [
      'ID',
      'Client',
      'Téléphone',
      'Statut',
      'Articles',
      'Montant',
      'Création',
      'Livraison',
    ],
  ];
  commandes.forEach((cmd) => {
    dataCommandes.push([
      cmd.id,
      cmd.clientNom,
      cmd.clientTel,
      cmd.statut,
      cmd.articles.length,
      cmd.montantTotal,
      new Date(cmd.createdAt).toLocaleDateString('fr-FR'),
      new Date(cmd.dateLivraison).toLocaleDateString('fr-FR'),
    ]);
  });
  const wsCommandes = XLSX.utils.aoa_to_sheet(dataCommandes);
  XLSX.utils.book_append_sheet(wb, wsCommandes, 'Commandes');

  // Clients
  const getClientStats = (clientTel) => {
    const commandesClient = commandes.filter((c) => c.clientTel === clientTel);
    const commandesTerminees = commandesClient.filter(
      (c) => c.statut === 'livre'
    );
    const totalDepense = commandesTerminees.reduce(
      (sum, c) => sum + c.montantTotal,
      0
    );
    const fidelite = getNiveauFidelite(commandesTerminees.length);
    return { nombreCommandes: commandesClient.length, totalDepense, fidelite };
  };

  const dataClients = [
    ['Nom', 'Téléphone', 'Fidélité', 'Remise %', 'Commandes', 'Dépenses'],
  ];
  clients.forEach((client) => {
    const stats = getClientStats(client.telephone);
    dataClients.push([
      client.nom,
      client.telephone,
      stats.fidelite.niveau,
      stats.fidelite.remise,
      stats.nombreCommandes,
      stats.totalDepense,
    ]);
  });
  const wsClients = XLSX.utils.aoa_to_sheet(dataClients);
  XLSX.utils.book_append_sheet(wb, wsClients, 'Clients');

  // Charges
  const dataCharges = [['Date', 'Type', 'Catégorie', 'Description', 'Montant']];
  charges.forEach((charge) => {
    dataCharges.push([
      new Date(charge.date).toLocaleDateString('fr-FR'),
      charge.type,
      charge.categorie,
      charge.description,
      charge.montant,
    ]);
  });
  const wsCharges = XLSX.utils.aoa_to_sheet(dataCharges);
  XLSX.utils.book_append_sheet(wb, wsCharges, 'Charges');

  XLSX.writeFile(
    wb,
    `Tina_Export_Complet_${new Date().toISOString().split('T')[0]}.xlsx`
  );
  alert('✅ Export complet réussi !');
};

const storage = {
  get: async (key) => {
    try {
      // Ajouter le préfixe du pressing
      const pressingId =
        localStorage.getItem('current_pressing_id') || 'default';
      const fullKey = `${pressingId}_${key}`;

      if (!window.__firestoreDb) {
        const value = localStorage.getItem(fullKey);
        return value ? { key, value, shared: false } : null;
      }

      const db = window.__firestoreDb;
      const docRef = db.collection('tina-data').doc(fullKey);
      const docSnap = await docRef.get();

      if (docSnap.exists) {
        const data = docSnap.data();
        const value = JSON.stringify(data.value);
        localStorage.setItem(fullKey, value);
        console.log(`✅ ${key} chargé depuis Firebase`);
        return { key, value, shared: true };
      }

      const localValue = localStorage.getItem(fullKey);
      return localValue ? { key, value: localValue, shared: false } : null;
    } catch (error) {
      console.error(`❌ Erreur get "${key}":`, error);
      const pressingId =
        localStorage.getItem('current_pressing_id') || 'default';
      const fullKey = `${pressingId}_${key}`;
      const value = localStorage.getItem(fullKey);
      return value ? { key, value, shared: false } : null;
    }
  },

  set: async (key, value) => {
    try {
      // Ajouter le préfixe du pressing
      const pressingId =
        localStorage.getItem('current_pressing_id') || 'default';
      const fullKey = `${pressingId}_${key}`;

      localStorage.setItem(fullKey, value);

      if (!window.__firestoreDb) {
        console.warn('⚠️ Firebase non disponible');
        return { key, value, shared: false };
      }

      const db = window.__firestoreDb;
      const data = JSON.parse(value);
      const docRef = db.collection('tina-data').doc(fullKey);

      await docRef.set(
        {
          value: data,
          pressingId: pressingId,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );

      console.log(`✅ ${key} sauvegardé pour pressing ${pressingId}`);
      return { key, value, shared: true };
    } catch (error) {
      console.error(`❌ Erreur set "${key}":`, error.message);
      return { key, value, shared: false };
    }
  },

  delete: async (key) => {
    try {
      // Ajouter le préfixe du pressing
      const pressingId =
        localStorage.getItem('current_pressing_id') || 'default';
      const fullKey = `${pressingId}_${key}`;

      localStorage.removeItem(fullKey);

      if (!window.__firestoreDb) {
        return { key, deleted: true, shared: false };
      }

      const db = window.__firestoreDb;
      const docRef = db.collection('tina-data').doc(fullKey);
      await docRef.delete();

      console.log(`🗑️ ${key} supprimé pour pressing ${pressingId}`);
      return { key, deleted: true, shared: true };
    } catch (error) {
      console.error(`❌ Erreur delete "${key}":`, error);
      return { key, deleted: true, shared: false };
    }
  },
};

export default function App() {
  const [pressingConfig, setPressingConfig] = useState(null);
  const [showPressingSelection, setShowPressingSelection] = useState(false);
  const [showNewPressingForm, setShowNewPressingForm] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [codeAcces, setCodeAcces] = useState('');
  const [roleSelectionne, setRoleSelectionne] = useState('manager');

  const CODES = { proprietaire: '1234', manager: '5678' };
  // Charger la configuration du pressing
  useEffect(() => {
    const loadConfig = async () => {
      const currentPressingId = localStorage.getItem('current_pressing_id');

      // ✅ NOUVEAU : Si un pressing actif existe, le charger
      if (currentPressingId) {
        // Charger la config du pressing actuel
        const stored = localStorage.getItem(PRESSING_CONFIG_KEY);
        if (stored) {
          const config = JSON.parse(stored);
          if (config.pressingId === currentPressingId) {
            setPressingConfig(config);
            return;
          }
        }

        // Sinon charger depuis Firebase
        if (window.__firestoreDb) {
          const db = window.__firestoreDb;
          const docSnap = await db
            .collection('tina-data')
            .doc(PRESSING_CONFIG_KEY)
            .get();
          if (docSnap.exists) {
            const config = docSnap.data().value;
            if (config.pressingId === currentPressingId) {
              setPressingConfig(config);
              localStorage.setItem(PRESSING_CONFIG_KEY, JSON.stringify(config));
              return;
            }
          }
        }
      }

      // ✅ MODIFICATION CRITIQUE : TOUJOURS afficher la sélection de pressing
      setShowPressingSelection(true);
    };
    loadConfig();
  }, []);
  const handleLogin = () => {
    if (codeAcces === CODES[roleSelectionne]) {
      setUserRole(roleSelectionne);
      localStorage.setItem('userRole', roleSelectionne);
      setCodeAcces('');
    } else {
      alert(
        '❌ Code incorrect pour ' +
          (roleSelectionne === 'proprietaire' ? 'Propriétaire' : 'Manager')
      );
      setCodeAcces('');
    }
  };

  const handleLogout = () => {
    setUserRole(null);
    localStorage.removeItem('userRole');
  };

  useEffect(() => {
    const savedRole = localStorage.getItem('userRole');
    if (savedRole) setUserRole(savedRole);
  }, []);
  // Si on doit afficher la sélection de pressing
  if (showPressingSelection && !pressingConfig) {
    return (
      <SelectionPressing
        onSelect={async (pressing) => {
          // Charger la config complète du pressing sélectionné
          localStorage.setItem('current_pressing_id', pressing.pressingId);

          // Chercher la config complète dans Firebase
          if (window.__firestoreDb) {
            const db = window.__firestoreDb;
            const docSnap = await db
              .collection('tina-data')
              .doc(PRESSING_CONFIG_KEY)
              .get();
            if (docSnap.exists) {
              const config = docSnap.data().value;
              if (config.pressingId === pressing.pressingId) {
                setPressingConfig(config);
                localStorage.setItem(
                  PRESSING_CONFIG_KEY,
                  JSON.stringify(config)
                );
                setShowPressingSelection(false);
              }
            }
          }
        }}
        onNewPressing={() => {
          setShowPressingSelection(false);
          setShowNewPressingForm(true);
        }}
      />
    );
  }

  // Si on doit créer un nouveau pressing
  if (showNewPressingForm && !pressingConfig) {
    return (
      <EcranEnregistrementPressing
        onComplete={(config) => {
          setPressingConfig(config);
          setShowNewPressingForm(false);
        }}
      />
    );
  }

  // Si pas de configuration du tout
  if (!pressingConfig) {
    return <EcranEnregistrementPressing onComplete={setPressingConfig} />;
  }
  if (!userRole) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full">
          <div className="text-center mb-8">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-4 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
              <Package className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              {pressingConfig.nomPressing}
            </h1>
            <p className="text-gray-600">Mon e-pressing</p>
          </div>

          <div className="space-y-4">
            <div className="space-y-3">
              <div
                onClick={() => setRoleSelectionne('proprietaire')}
                className={`border-2 rounded-xl p-4 cursor-pointer transition ${
                  roleSelectionne === 'proprietaire'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 bg-white hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      roleSelectionne === 'proprietaire'
                        ? 'bg-blue-500'
                        : 'bg-gray-300'
                    }`}
                  >
                    <BarChart3 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="font-bold text-gray-800">Propriétaire</div>
                  </div>
                  {roleSelectionne === 'proprietaire' && (
                    <div className="ml-auto text-blue-500">✓</div>
                  )}
                </div>
              </div>

              <div
                onClick={() => setRoleSelectionne('manager')}
                className={`border-2 rounded-xl p-4 cursor-pointer transition ${
                  roleSelectionne === 'manager'
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 bg-white hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      roleSelectionne === 'manager'
                        ? 'bg-green-500'
                        : 'bg-gray-300'
                    }`}
                  >
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="font-bold text-gray-800">Manager</div>
                  </div>
                  {roleSelectionne === 'manager' && (
                    <div className="ml-auto text-green-500">✓</div>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-4">
              <input
                type="password"
                placeholder={`Code ${
                  roleSelectionne === 'proprietaire'
                    ? 'Propriétaire'
                    : 'Manager'
                }`}
                value={codeAcces}
                onChange={(e) => setCodeAcces(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none mb-3"
                autoFocus
              />
              <button
                onClick={handleLogin}
                className={`w-full text-white py-3 rounded-xl font-semibold shadow-lg ${
                  roleSelectionne === 'proprietaire'
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700'
                    : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700'
                }`}
              >
                Se connecter
              </button>
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-gray-500">
            <p>Données partagées • Un seul système</p>
            <p className="mt-1">💙 Tina</p>
          </div>

          {/* ✅ NOUVEAU : Bouton Changer de pressing */}
          <div className="mt-4">
            <button
              onClick={() => {
                if (
                  confirm(
                    '⚠️ Voulez-vous changer de pressing ?\n\nVous serez redirigé vers la configuration.'
                  )
                ) {
                  localStorage.removeItem('current_pressing_id');
                  localStorage.removeItem('pressing_config');
                  window.location.reload();
                }
              }}
              className="w-full px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition flex items-center justify-center gap-2 border border-gray-300"
            >
              <Package className="w-4 h-4" />
              Changer de pressing
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (userRole === 'proprietaire') {
    return (
      <PlateformeProprietaire
        pressingConfig={pressingConfig}
        onLogout={handleLogout}
      />
    );
  }

  if (userRole === 'manager') {
    return (
      <TinaManager pressingConfig={pressingConfig} onLogout={handleLogout} />
    );
  }

  return null;
}
// ==========================================
// 1. SYSTÈME D'ALERTES AUTOMATIQUES
// ==========================================

const SystemeAlertes = ({ commandes, transactions }) => {
  const [alertes, setAlertes] = useState([]);
  const [showAlertes, setShowAlertes] = useState(false);

  // Calculer les alertes
  useEffect(() => {
    const calculerAlertes = () => {
      const nouvellesAlertes = [];
      const aujourdhui = new Date();

      // ⚠️ ALERTE 1 : Commandes en retard
      const commandesEnRetard = commandes.filter((cmd) => {
        if (cmd.statut === 'livre') return false; // Commande déjà livrée

        const dateLivraison = new Date(cmd.dateLivraison);
        return dateLivraison < aujourdhui;
      });

      if (commandesEnRetard.length > 0) {
        commandesEnRetard.forEach((cmd) => {
          const dateLivraison = new Date(cmd.dateLivraison);
          const joursRetard = Math.floor(
            (aujourdhui - dateLivraison) / (1000 * 60 * 60 * 24)
          );

          nouvellesAlertes.push({
            id: `retard-${cmd.id}`,
            type: 'retard',
            priorite:
              joursRetard > 3
                ? 'critique'
                : joursRetard > 1
                ? 'haute'
                : 'moyenne',
            titre: `Commande en retard`,
            message: `Commande #${cmd.id} - ${cmd.clientNom}`,
            details: `${joursRetard} jour${
              joursRetard > 1 ? 's' : ''
            } de retard (prévue le ${dateLivraison.toLocaleDateString(
              'fr-FR'
            )})`,
            commande: cmd,
            icone: '⏰',
            couleur:
              joursRetard > 3 ? 'red' : joursRetard > 1 ? 'orange' : 'yellow',
          });
        });
      }

      // ⚠️ ALERTE 2 : CA mensuel bas (vérifier chaque 20 du mois)
      const jour = aujourdhui.getDate();
      const moisActuel = aujourdhui.getMonth();
      const anneeActuelle = aujourdhui.getFullYear();

      if (jour >= 20) {
        // Calculer le CA du mois en cours
        const transactionsMois = transactions.filter((t) => {
          const date = new Date(t.date);
          return (
            t.type === 'recette' &&
            date.getMonth() === moisActuel &&
            date.getFullYear() === anneeActuelle
          );
        });

        const caMensuel = transactionsMois.reduce(
          (sum, t) => sum + t.montant,
          0
        );
        const SEUIL_CA = 500000;

        if (caMensuel < SEUIL_CA) {
          nouvellesAlertes.push({
            id: `ca-bas-${moisActuel}`,
            type: 'ca_bas',
            priorite: caMensuel < SEUIL_CA * 0.5 ? 'critique' : 'haute',
            titre: `Chiffre d'affaires mensuel bas`,
            message: `CA actuel : ${caMensuel.toLocaleString()} FCFA`,
            details: `Objectif : ${SEUIL_CA.toLocaleString()} FCFA | Manque : ${(
              SEUIL_CA - caMensuel
            ).toLocaleString()} FCFA`,
            icone: '📉',
            couleur: caMensuel < SEUIL_CA * 0.5 ? 'red' : 'orange',
          });
        }
      }

      setAlertes(nouvellesAlertes);
    };

    calculerAlertes();
    // Recalculer toutes les heures
    const interval = setInterval(calculerAlertes, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, [commandes, transactions]);

  // Compter par priorité
  const alertesParPriorite = {
    critique: alertes.filter((a) => a.priorite === 'critique').length,
    haute: alertes.filter((a) => a.priorite === 'haute').length,
    moyenne: alertes.filter((a) => a.priorite === 'moyenne').length,
  };

  const totalAlertes = alertes.length;

  if (totalAlertes === 0) return null;

  return (
    <>
      {/* Badge d'alertes flottant */}
      <button
        onClick={() => setShowAlertes(true)}
        className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-full shadow-2xl hover:shadow-3xl transition-all hover:scale-110 p-4 flex items-center gap-2"
      >
        <Bell className="w-6 h-6 animate-pulse" />
        <span className="bg-white text-red-600 px-3 py-1 rounded-full font-bold text-sm">
          {totalAlertes}
        </span>
      </button>

      {/* Modal des alertes */}
      {showAlertes && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center z-10">
              <div>
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <AlertCircle className="w-7 h-7 text-red-600" />
                  Alertes ({totalAlertes})
                </h2>
                <div className="flex gap-2 mt-2">
                  {alertesParPriorite.critique > 0 && (
                    <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-semibold">
                      🔴 {alertesParPriorite.critique} Critique
                      {alertesParPriorite.critique > 1 ? 's' : ''}
                    </span>
                  )}
                  {alertesParPriorite.haute > 0 && (
                    <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-semibold">
                      🟠 {alertesParPriorite.haute} Haute
                      {alertesParPriorite.haute > 1 ? 's' : ''}
                    </span>
                  )}
                  {alertesParPriorite.moyenne > 0 && (
                    <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-semibold">
                      🟡 {alertesParPriorite.moyenne} Moyenne
                      {alertesParPriorite.moyenne > 1 ? 's' : ''}
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => setShowAlertes(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-3">
              {alertes.map((alerte) => (
                <div
                  key={alerte.id}
                  className={`border-l-4 rounded-xl p-4 ${
                    alerte.couleur === 'red'
                      ? 'bg-red-50 border-red-500'
                      : alerte.couleur === 'orange'
                      ? 'bg-orange-50 border-orange-500'
                      : 'bg-yellow-50 border-yellow-500'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">{alerte.icone}</span>
                        <h3 className="font-bold text-lg">{alerte.titre}</h3>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            alerte.priorite === 'critique'
                              ? 'bg-red-200 text-red-800'
                              : alerte.priorite === 'haute'
                              ? 'bg-orange-200 text-orange-800'
                              : 'bg-yellow-200 text-yellow-800'
                          }`}
                        >
                          {alerte.priorite.toUpperCase()}
                        </span>
                      </div>
                      <div className="text-gray-800 font-semibold mb-1">
                        {alerte.message}
                      </div>
                      <div className="text-sm text-gray-600">
                        {alerte.details}
                      </div>
                    </div>

                    {/* Actions spécifiques */}
                    {alerte.type === 'retard' && alerte.commande && (
                      <button
                        onClick={() => {
                          const cmd = alerte.commande;
                          const message = `🔔 TINA - Mon e-pressing
                    Relance importante
                    
                    Bonjour ${cmd.clientNom},
                    
                    Votre commande #${cmd.id} était prévue pour le ${new Date(
                            cmd.dateLivraison
                          ).toLocaleDateString('fr-FR')}.
                    
                    Nous nous excusons pour ce retard. Votre linge sera prêt très prochainement.
                    
                    Merci de votre patience ! 🙏
                    
                    _Tina - Mon e-pressing_`;

                          let telephone = cmd.clientTel.replace(
                            /[\s\-\(\)]/g,
                            ''
                          );
                          if (!telephone.startsWith('+')) {
                            if (!telephone.startsWith('225'))
                              telephone = '225' + telephone;
                            telephone = '+' + telephone;
                          }

                          // ✅ CORRECTION
                          const messageEncode = encodeURIComponent(message);
                          window.open(
                            `https://wa.me/${telephone.replace(
                              '+',
                              ''
                            )}?text=${messageEncode}`,
                            '_blank'
                          );
                        }}
                        className="ml-4 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm flex items-center gap-2"
                      >
                        <Bell className="w-4 h-4" />
                        Relancer
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// ==========================================
// 2. MODULE INVENTAIRE COMMANDES NON LIVRÉES
// ==========================================

const ModuleInventaire = ({
  commandes,
  mettreAJourStatut,
  envoyerNotificationWhatsApp,
}) => {
  const [filterStatut, setFilterStatut] = useState('tous');
  const [sortBy, setSortBy] = useState('dateLivraison'); // dateLivraison, montant, client
  const [searchTerm, setSearchTerm] = useState('');

  // Filtrer les commandes non livrées
  const commandesNonLivrees = commandes.filter((cmd) => cmd.statut !== 'livre');

  // Filtrer et trier
  const commandesFiltrees = commandesNonLivrees
    .filter((cmd) => {
      const matchSearch =
        cmd.clientNom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cmd.clientTel.includes(searchTerm) ||
        cmd.id.includes(searchTerm);
      const matchStatut =
        filterStatut === 'tous' || cmd.statut === filterStatut;
      return matchSearch && matchStatut;
    })
    .sort((a, b) => {
      if (sortBy === 'dateLivraison') {
        return new Date(a.dateLivraison) - new Date(b.dateLivraison);
      } else if (sortBy === 'montant') {
        return b.montantTotal - a.montantTotal;
      } else if (sortBy === 'client') {
        return a.clientNom.localeCompare(b.clientNom);
      }
      return 0;
    });

  // Statistiques
  const stats = {
    total: commandesNonLivrees.length,
    recu: commandesNonLivrees.filter((c) => c.statut === 'recu').length,
    enCours: commandesNonLivrees.filter((c) => c.statut === 'en_cours').length,
    pret: commandesNonLivrees.filter((c) => c.statut === 'pret').length,
    enRoute: commandesNonLivrees.filter((c) => c.statut === 'en_route').length,
    valeurTotale: commandesNonLivrees.reduce(
      (sum, c) => sum + c.montantTotal,
      0
    ),
    enRetard: commandesNonLivrees.filter(
      (c) => new Date(c.dateLivraison) < new Date()
    ).length,
  };

  return (
    <div className="space-y-6">
      {/* En-tête avec statistiques */}
      <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-2xl p-6 shadow-lg">
        <h2 className="text-2xl font-bold mb-4">
          📦 Inventaire des Commandes en Cours
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          <div className="bg-white/20 rounded-xl p-3">
            <div className="text-xs opacity-90 mb-1">Total</div>
            <div className="text-2xl font-bold">{stats.total}</div>
          </div>
          <div className="bg-white/20 rounded-xl p-3">
            <div className="text-xs opacity-90 mb-1">📦 Reçu</div>
            <div className="text-2xl font-bold">{stats.recu}</div>
          </div>
          <div className="bg-white/20 rounded-xl p-3">
            <div className="text-xs opacity-90 mb-1">⚙️ En cours</div>
            <div className="text-2xl font-bold">{stats.enCours}</div>
          </div>
          <div className="bg-white/20 rounded-xl p-3">
            <div className="text-xs opacity-90 mb-1">🎉 Prêt</div>
            <div className="text-2xl font-bold">{stats.pret}</div>
          </div>
          <div className="bg-white/20 rounded-xl p-3">
            <div className="text-xs opacity-90 mb-1">🚚 En route</div>
            <div className="text-2xl font-bold">{stats.enRoute}</div>
          </div>
          <div className="bg-white/20 rounded-xl p-3">
            <div className="text-xs opacity-90 mb-1">⏰ En retard</div>
            <div className="text-2xl font-bold text-red-300">
              {stats.enRetard}
            </div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-white/30">
          <div className="text-sm opacity-90">Valeur totale en cours</div>
          <div className="text-3xl font-bold">
            {stats.valeurTotale.toLocaleString()} FCFA
          </div>
        </div>
      </div>

      {/* Filtres et recherche */}
      <div className="bg-white rounded-2xl p-4 shadow-lg">
        <div className="flex flex-wrap gap-3 items-center">
          <input
            type="text"
            placeholder="Rechercher (client, tel, #commande)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 min-w-[200px] px-4 py-2 border rounded-xl focus:ring-2 focus:ring-purple-500"
          />

          <select
            value={filterStatut}
            onChange={(e) => setFilterStatut(e.target.value)}
            className="px-4 py-2 border rounded-xl focus:ring-2 focus:ring-purple-500"
          >
            <option value="tous">Tous les statuts</option>
            <option value="recu">📦 Reçu</option>
            <option value="en_cours">⚙️ En cours</option>
            <option value="pret">🎉 Prêt</option>
            <option value="en_route">🚚 En route</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 border rounded-xl focus:ring-2 focus:ring-purple-500"
          >
            <option value="dateLivraison">📅 Date de livraison</option>
            <option value="montant">💰 Montant</option>
            <option value="client">👤 Client</option>
          </select>

          <div className="text-sm text-gray-600 font-medium">
            {commandesFiltrees.length} commande
            {commandesFiltrees.length > 1 ? 's' : ''}
          </div>
        </div>
      </div>

      {/* Liste des commandes */}
      <div className="grid gap-4">
        {commandesFiltrees.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-lg">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <div className="text-gray-500">
              {commandesNonLivrees.length === 0
                ? 'Aucune commande en cours - Tout est livré ! 🎉'
                : 'Aucune commande trouvée avec ces filtres'}
            </div>
          </div>
        ) : (
          commandesFiltrees.map((cmd) => {
            const dateLivraison = new Date(cmd.dateLivraison);
            const aujourdhui = new Date();
            const enRetard = dateLivraison < aujourdhui;
            const joursRestants = Math.ceil(
              (dateLivraison - aujourdhui) / (1000 * 60 * 60 * 24)
            );

            return (
              <div
                key={cmd.id}
                className={`bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition ${
                  enRetard ? 'border-l-4 border-red-500' : ''
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    {/* En-tête */}
                    <div className="flex items-center gap-3 mb-3">
                      <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-bold">
                        #{cmd.id}
                      </span>
                      <h3 className="text-xl font-bold">{cmd.clientNom}</h3>

                      {/* Badge statut */}
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          cmd.statut === 'pret'
                            ? 'bg-blue-100 text-blue-700'
                            : cmd.statut === 'en_cours'
                            ? 'bg-orange-100 text-orange-700'
                            : cmd.statut === 'en_route'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {cmd.statut === 'pret'
                          ? '🎉 Prêt'
                          : cmd.statut === 'en_cours'
                          ? '⚙️ En cours'
                          : cmd.statut === 'en_route'
                          ? '🚚 En route'
                          : '📦 Reçu'}
                      </span>

                      {/* Badge livraison */}
                      {cmd.avecLivraison && (
                        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold">
                          <Truck className="w-3 h-3 inline mr-1" />
                          Livraison
                        </span>
                      )}

                      {/* Badge retard */}
                      {enRetard && (
                        <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-semibold animate-pulse">
                          ⏰ RETARD
                        </span>
                      )}
                    </div>

                    {/* Informations */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                      <div>
                        <div className="text-gray-600">Client</div>
                        <div className="font-semibold">{cmd.clientTel}</div>
                      </div>
                      <div>
                        <div className="text-gray-600">Articles</div>
                        <div className="font-semibold">
                          {cmd.articles.length} article
                          {cmd.articles.length > 1 ? 's' : ''}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-600">Date livraison</div>
                        <div
                          className={`font-semibold ${
                            enRetard
                              ? 'text-red-600'
                              : joursRestants <= 1
                              ? 'text-orange-600'
                              : ''
                          }`}
                        >
                          {dateLivraison.toLocaleDateString('fr-FR')}
                          {enRetard && (
                            <span className="block text-xs text-red-600">
                              {Math.abs(joursRestants)} jour
                              {Math.abs(joursRestants) > 1 ? 's' : ''} de retard
                            </span>
                          )}
                          {!enRetard && joursRestants <= 1 && (
                            <span className="block text-xs text-orange-600">
                              {joursRestants === 0 ? "Aujourd'hui !" : 'Demain'}
                            </span>
                          )}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-600">Montant</div>
                        <div className="font-bold text-lg text-purple-600">
                          {cmd.montantTotal.toLocaleString()} F
                        </div>
                      </div>
                    </div>

                    {/* Adresse livraison si applicable */}
                    {cmd.avecLivraison && (
                      <div className="mt-2 text-sm text-gray-600">
                        📍 {cmd.adresseLivraison}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="ml-4 flex flex-col gap-2">
                    <select
                      value={cmd.statut}
                      onChange={(e) =>
                        mettreAJourStatut(cmd.id, e.target.value)
                      }
                      className="px-3 py-2 border rounded-lg text-sm font-semibold"
                    >
                      <option value="recu">📦 Reçu</option>
                      <option value="en_cours">⚙️ En cours</option>
                      <option value="pret">🎉 Prêt</option>
                      {cmd.avecLivraison && (
                        <option value="en_route">🚚 En route</option>
                      )}
                      <option value="livre">✅ Livrer</option>
                    </select>

                    <button
                      onClick={() =>
                        envoyerNotificationWhatsApp(cmd, cmd.statut)
                      }
                      className="px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm"
                    >
                      <Bell className="w-4 h-4 inline mr-1" />
                      Notifier
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export { SystemeAlertes, ModuleInventaire };

// ==========================================
// PLATEFORME PROPRIÉTAIRE
// ==========================================
function PlateformeProprietaire({ onLogout }) {
  const [activeModule, setActiveModule] = useState('dashboard');
  const [commandes, setCommandes] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [charges, setCharges] = useState([]);
  const [clients, setClients] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const loadArticlesPersonnalises = async () => {
    try {
      const data = await storage.get('articlesPersonnalises');
      if (data?.value) {
        setArticlesPersonnalises(JSON.parse(data.value));
      }
    } catch (error) {
      console.log('Aucun article personnalisé');
    }
  };

  const saveArticlesPersonnalises = async (articles) => {
    await storage.set('articlesPersonnalises', JSON.stringify(articles));
  };

  const loadData = async () => {
    try {
      const [cmdData, transData, chargeData, clientData] = await Promise.all([
        storage.get('commandes'),
        storage.get('transactions'),
        storage.get('charges'),
        storage.get('clients'),
      ]);
      if (cmdData?.value) setCommandes(JSON.parse(cmdData.value));
      if (transData?.value) setTransactions(JSON.parse(transData.value));
      if (chargeData?.value) setCharges(JSON.parse(chargeData.value));
      if (clientData?.value) setClients(JSON.parse(clientData.value));
    } catch (error) {
      console.log('Chargement données');
    }
  };
  const getNiveauFidelite = (nombreCommandes) => {
    if (nombreCommandes >= 20)
      return {
        niveau: 'VIP',
        remise: 15,
        couleur: 'from-purple-500 to-purple-600',
        icone: '👑',
      };
    if (nombreCommandes >= 10)
      return {
        niveau: 'Or',
        remise: 10,
        couleur: 'from-yellow-500 to-yellow-600',
        icone: '⭐',
      };
    if (nombreCommandes >= 5)
      return {
        niveau: 'Argent',
        remise: 5,
        couleur: 'from-gray-400 to-gray-500',
        icone: '🥈',
      };
    return {
      niveau: 'Standard',
      remise: 0,
      couleur: 'from-blue-400 to-blue-500',
      icone: '💙',
    };
  };
  const getDataForMonth = (month, year) => {
    const filterByMonth = (items) =>
      items.filter((item) => {
        const date = new Date(item.createdAt || item.date);
        return date.getMonth() === month && date.getFullYear() === year;
      });

    const commandesMois = filterByMonth(commandes);
    const transactionsMois = filterByMonth(transactions);
    const chargesMois = filterByMonth(charges);
    const recetteMois = transactionsMois
      .filter((t) => t.type === 'recette')
      .reduce((sum, t) => sum + t.montant, 0);
    const chargesMoisTotal = chargesMois.reduce((sum, c) => sum + c.montant, 0);
    const beneficeMois = recetteMois - chargesMoisTotal;

    return {
      commandes: commandesMois.length,
      recette: recetteMois,
      charges: chargesMoisTotal,
      benefice: beneficeMois,
    };
  };

  const getAnnualData = () => {
    const data = [];
    for (let i = 0; i < 12; i++) {
      data.push(getDataForMonth(i, selectedYear));
    }
    return data;
  };

  const annualData = getAnnualData();
  const currentMonthData = getDataForMonth(selectedMonth, selectedYear);
  const mois = [
    'Janvier',
    'Février',
    'Mars',
    'Avril',
    'Mai',
    'Juin',
    'Juillet',
    'Août',
    'Septembre',
    'Octobre',
    'Novembre',
    'Décembre',
  ];

  const DashboardProprietaire = () => {
    // ✅ NOUVEAU CALCUL
    const entrees = commandes.reduce((sum, cmd) => sum + cmd.montantTotal, 0);
    const caEncaisse = commandes.reduce(
      (sum, cmd) => sum + (cmd.montantPaye || 0),
      0
    );
    const resteAEncaisser = entrees - caEncaisse;

    const chargesTotal = charges.reduce((sum, c) => sum + c.montant, 0);
    const benefice = caEncaisse - chargesTotal; // ✅ Basé sur CA encaissé
    const commandesEnCours = commandes.filter(
      (c) => c.statut !== 'livre'
    ).length;
    const commandesPrete = commandes.filter((c) => c.statut === 'pret').length;

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-white shadow-lg">
            <DollarSign className="w-6 h-6 sm:w-8 sm:h-8 opacity-80 mb-2 sm:mb-3" />
            <div className="text-xl sm:text-2xl md:text-3xl font-bold mb-1">
              {entrees.toLocaleString()} F
            </div>
            <div className="text-xs sm:text-sm opacity-90">
              📥 Entrées totales
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-white shadow-lg">
            <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 opacity-80 mb-2 sm:mb-3" />
            <div className="text-xl sm:text-2xl md:text-3xl font-bold mb-1">
              {caEncaisse.toLocaleString()} F
            </div>
            <div className="text-xs sm:text-sm opacity-90">💰 CA Encaissé</div>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-white shadow-lg">
            <Clock className="w-6 h-6 sm:w-8 sm:h-8 opacity-80 mb-2 sm:mb-3" />
            <div className="text-xl sm:text-2xl md:text-3xl font-bold mb-1">
              {resteAEncaisser.toLocaleString()} F
            </div>
            <div className="text-xs sm:text-sm opacity-90">
              ⏳ Reste à encaisser
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-white shadow-lg">
            <TrendingDown className="w-6 h-6 sm:w-8 sm:h-8 opacity-80 mb-2 sm:mb-3" />
            <div className="text-xl sm:text-2xl md:text-3xl font-bold mb-1">
              {chargesTotal.toLocaleString()} F
            </div>
            <div className="text-xs sm:text-sm opacity-90">Charges totales</div>
          </div>
        </div>

        {/* Indicateur Bénéfice */}
        <div
          className={`rounded-2xl p-6 shadow-lg ${
            benefice >= 0
              ? 'bg-gradient-to-br from-green-500 to-green-600'
              : 'bg-gradient-to-br from-red-500 to-red-600'
          } text-white`}
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm opacity-90">Bénéfice (CA - Charges)</div>
              <div className="text-4xl font-bold mt-2">
                {benefice.toLocaleString()} F
              </div>
            </div>
            <div className="text-6xl opacity-50">
              {benefice >= 0 ? '📈' : '📉'}
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <h3 className="text-xl font-bold mb-4">Commandes prêtes</h3>
            <div className="space-y-3">
              {commandes
                .filter((c) => c.statut === 'pret')
                .slice(0, 5)
                .map((cmd) => (
                  <div
                    key={cmd.id}
                    className="flex justify-between items-center p-4 bg-green-50 rounded-xl"
                  >
                    <div>
                      <div className="font-semibold">{cmd.clientNom}</div>
                      <div className="text-sm text-gray-600">
                        {cmd.clientTel}
                      </div>
                    </div>
                    <div className="text-green-600 font-bold">
                      {cmd.montantTotal.toLocaleString()} F
                    </div>
                  </div>
                ))}
              {commandes.filter((c) => c.statut === 'pret').length === 0 && (
                <div className="text-center text-gray-500 py-8">
                  Aucune commande prête
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <h3 className="text-xl font-bold mb-4">Vue d'ensemble</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-4 bg-blue-50 rounded-xl">
                <div className="text-gray-700">Total commandes</div>
                <div className="text-2xl font-bold text-blue-600">
                  {commandes.length}
                </div>
              </div>
              <div className="flex justify-between items-center p-4 bg-orange-50 rounded-xl">
                <div className="text-gray-700">Commandes en cours</div>
                <div className="text-2xl font-bold text-orange-600">
                  {commandesEnCours}
                </div>
              </div>
              <div className="flex justify-between items-center p-4 bg-green-50 rounded-xl">
                <div className="text-gray-700">Commandes prêtes</div>
                <div className="text-2xl font-bold text-green-600">
                  {commandesPrete}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const ComptabiliteAnnuelle = () => {
    const totaux = annualData.reduce(
      (acc, month) => ({
        recette: acc.recette + month.recette,
        charges: acc.charges + month.charges,
        benefice: acc.benefice + month.benefice,
        commandes: acc.commandes + month.commandes,
      }),
      { recette: 0, charges: 0, benefice: 0, commandes: 0 }
    );

    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-2xl p-6 shadow-lg">
          <h2 className="text-2xl font-bold mb-4">
            📊 Comptabilité {selectedYear}
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-white/20 rounded-xl p-4">
              <div className="text-xs sm:text-sm opacity-90">CA Total</div>
              <div className="text-2xl font-bold">
                {totaux.recette.toLocaleString()} F
              </div>
            </div>
            <div className="bg-white/20 rounded-xl p-4">
              <div className="text-xs sm:text-sm opacity-90">Charges Total</div>
              <div className="text-2xl font-bold">
                {totaux.charges.toLocaleString()} F
              </div>
            </div>
            <div className="bg-white/20 rounded-xl p-4">
              <div className="text-xs sm:text-sm opacity-90">
                Bénéfice Total
              </div>
              <div className="text-2xl font-bold">
                {totaux.benefice.toLocaleString()} F
              </div>
            </div>
            <div className="bg-white/20 rounded-xl p-4">
              <div className="text-xs sm:text-sm opacity-90">Commandes</div>
              <div className="text-2xl font-bold">{totaux.commandes}</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg">
          <h3 className="text-xl font-bold mb-4">Détails par mois</h3>
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-semibold text-sm sm:text-base">
                    Mois
                  </th>
                  <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-semibold text-sm sm:text-base">
                    CA (FCFA)
                  </th>
                  <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-semibold text-sm sm:text-base">
                    Charges (FCFA)
                  </th>
                  <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-semibold text-sm sm:text-base">
                    Bénéfice (FCFA)
                  </th>
                  <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-semibold text-sm sm:text-base">
                    Commandes
                  </th>
                </tr>
              </thead>
              <tbody>
                {annualData.map((data, idx) => (
                  <tr
                    key={idx}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="text-left py-2 sm:py-3 px-2 sm:px-4 font-semibold text-sm sm:text-base">
                      {mois[idx]}
                    </td>
                    <td className="text-left py-2 sm:py-3 px-2 sm:px-4 font-semibold text-sm sm:text-base">
                      {data.recette.toLocaleString()}
                    </td>
                    <td className="text-left py-2 sm:py-3 px-2 sm:px-4 font-semibold text-sm sm:text-base">
                      {data.charges.toLocaleString()}
                    </td>
                    <td className="text-left py-2 sm:py-3 px-2 sm:px-4 font-semibold text-sm sm:text-base">
                      {data.benefice.toLocaleString()}
                    </td>
                    <td className="text-left py-2 sm:py-3 px-2 sm:px-4 font-semibold text-sm sm:text-base">
                      {data.commandes}
                    </td>
                  </tr>
                ))}
                <tr className="bg-gray-100 font-bold">
                  <td className="text-left py-2 sm:py-3 px-2 sm:px-4 font-semibold text-sm sm:text-base">
                    TOTAL {selectedYear}
                  </td>
                  <td className="text-left py-2 sm:py-3 px-2 sm:px-4 font-semibold text-sm sm:text-base">
                    {totaux.recette.toLocaleString()}
                  </td>
                  <td className="text-left py-2 sm:py-3 px-2 sm:px-4 font-semibold text-sm sm:text-base">
                    {totaux.charges.toLocaleString()}
                  </td>
                  <td className="text-left py-2 sm:py-3 px-2 sm:px-4 font-semibold text-sm sm:text-base">
                    {totaux.benefice.toLocaleString()}
                  </td>
                  <td className="text-left py-2 sm:py-3 px-2 sm:px-4 font-semibold text-sm sm:text-base">
                    {totaux.commandes}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const Graphiques = () => {
    const maxRecette = Math.max(...annualData.map((d) => d.recette));
    const maxCharges = Math.max(...annualData.map((d) => d.charges));
    const max = Math.max(maxRecette, maxCharges);

    return (
      <div className="space-y-6">
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <div className="flex items-center gap-3 mb-6">
            <LineChart className="w-6 h-6 text-green-600" />
            <h3 className="text-xl font-bold">
              Évolution du Chiffre d'Affaires {selectedYear}
            </h3>
          </div>
          <div className="space-y-2">
            {annualData.map((data, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <div className="w-20 text-sm font-medium text-gray-600">
                  {mois[idx].substring(0, 3)}
                </div>
                <div className="flex-1 bg-gray-100 rounded-full h-8 relative overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-green-400 to-green-600 h-full rounded-full flex items-center justify-end px-3 transition-all duration-500"
                    style={{
                      width: `${max > 0 ? (data.recette / max) * 100 : 0}%`,
                    }}
                  >
                    <span className="text-white font-semibold text-sm">
                      {data.recette.toLocaleString()} F
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <div className="flex items-center gap-3 mb-6">
            <TrendingDown className="w-6 h-6 text-red-600" />
            <h3 className="text-xl font-bold">
              Évolution des Charges {selectedYear}
            </h3>
          </div>
          <div className="space-y-2">
            {annualData.map((data, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <div className="w-20 text-sm font-medium text-gray-600">
                  {mois[idx].substring(0, 3)}
                </div>
                <div className="flex-1 bg-gray-100 rounded-full h-8 relative overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-red-400 to-red-600 h-full rounded-full flex items-center justify-end px-3 transition-all duration-500"
                    style={{
                      width: `${max > 0 ? (data.charges / max) * 100 : 0}%`,
                    }}
                  >
                    <span className="text-white font-semibold text-sm">
                      {data.charges.toLocaleString()} F
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const exporterDonnees = () => {
    const choix = prompt(
      'Choisir:\n1 = Export complet Excel\n2 = Dashboard Excel\n3 = Comptabilité Excel\n4 = Clients Excel\n5 = Export JSON (backup)'
    );

    if (choix === '1') {
      exporterTout(
        commandes,
        transactions,
        charges,
        clients,
        selectedYear,
        getNiveauFidelite
      );
    } else if (choix === '2') {
      exporterTableauDeBord(commandes, transactions, charges);
    } else if (choix === '3') {
      exporterComptabiliteAnnuelle(
        commandes,
        transactions,
        charges,
        selectedYear
      );
    } else if (choix === '4') {
      const loadClientsAndExport = async () => {
        const clientData = await storage.get('clients');
        const clientsList = clientData?.value
          ? JSON.parse(clientData.value)
          : [];
        exporterClients(clientsList, commandes, getNiveauFidelite);
      };
      loadClientsAndExport();
    } else if (choix === '5') {
      // Export JSON (l'ancien export)
      const dataExport = {
        commandes,
        transactions,
        charges,
        dateExport: new Date().toISOString(),
        version: '1.0',
        stats: {
          totalCommandes: commandes.length,
          totalRecettes: transactions
            .filter((t) => t.type === 'recette')
            .reduce((sum, t) => sum + t.montant, 0),
          totalCharges: charges.reduce((sum, c) => sum + c.montant, 0),
        },
      };

      const dataStr = JSON.stringify(dataExport, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `tina-backup-${
        new Date().toISOString().split('T')[0]
      }.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      alert('✅ Backup JSON exporté avec succès !');
    }
  };
  const ModuleCharges = () => {
    const [charges, setCharges] = useState([]);
    const [showModalCharge, setShowModalCharge] = useState(false);
    const [chargeEnEdition, setChargeEnEdition] = useState(null);
    const [filterType, setFilterType] = useState('tous');
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    const [nouvelleCharge, setNouvelleCharge] = useState({
      type: 'fixe',
      categorie: '',
      description: '',
      montant: 0,
      date: new Date().toISOString().split('T')[0],
      recurrente: false,
      frequence: 'mensuelle',
    });

    useEffect(() => {
      loadCharges();
    }, []);

    const loadCharges = async () => {
      try {
        const data = await storage.get('charges');
        if (data?.value) setCharges(JSON.parse(data.value));
      } catch (error) {
        console.log('Aucune charge');
      }
    };

    const saveCharges = async (data) => {
      await storage.set('charges', JSON.stringify(data));
    };

    const categoriesParType = {
      fixe: [
        'Loyer',
        'Salaire Gérant',
        'Salaire Agent Technique',
        'Internet/Wifi',
        'Amortissement',
        'Taxes et Impôts',
        'Dettes',
        'Assurance',
      ],
      consommable: [
        'Détergent',
        'Adoucissant',
        'Javel',
        'Produits de nettoyage',
        'Emballages',
        'Cintres',
        'Sacs plastique',
        'Étiquettes',
      ],
      variable: [
        'Eau',
        'Électricité',
        'Salaire Propriétaire',
        'Carburant livraison',
        'Téléphone',
        'Marketing',
      ],
      exceptionnelle: [
        'Maintenance machine',
        'Réparation équipement',
        'Achat nouveau matériel',
        'Formation personnel',
        'Travaux locaux',
        'Autre',
      ],
    };

    const typeLabels = {
      fixe: {
        label: '📌 Charges Fixes',
        color: 'blue',
        description: 'Montant constant chaque mois',
      },
      consommable: {
        label: '🧴 Consommables',
        color: 'green',
        description: 'Produits et fournitures',
      },
      variable: {
        label: '⚡ Charges Variables',
        color: 'orange',
        description: 'Montant qui change chaque mois',
      },
      exceptionnelle: {
        label: '🔧 Dépenses Exceptionnelles',
        color: 'red',
        description: 'Dépenses ponctuelles',
      },
    };

    const ajouterCharge = async () => {
      if (
        !nouvelleCharge.categorie ||
        !nouvelleCharge.montant ||
        !nouvelleCharge.description
      ) {
        alert('Veuillez remplir tous les champs');
        return;
      }

      const charge = {
        id: chargeEnEdition?.id || Date.now().toString(),
        ...nouvelleCharge,
        createdAt: chargeEnEdition?.createdAt || new Date().toISOString(),
      };

      let newCharges;
      if (chargeEnEdition) {
        newCharges = charges.map((c) => (c.id === charge.id ? charge : c));
      } else {
        newCharges = [...charges, charge];
      }

      setCharges(newCharges);
      await saveCharges(newCharges);

      setShowModalCharge(false);
      resetForm();
    };

    const supprimerCharge = async (id) => {
      if (!confirm('Supprimer cette charge ?')) return;
      const newCharges = charges.filter((c) => c.id !== id);
      setCharges(newCharges);
      await saveCharges(newCharges);
    };

    const editerCharge = (charge) => {
      setChargeEnEdition(charge);
      setNouvelleCharge({
        type: charge.type,
        categorie: charge.categorie,
        description: charge.description,
        montant: charge.montant,
        date: charge.date,
        recurrente: charge.recurrente || false,
        frequence: charge.frequence || 'mensuelle',
      });
      setShowModalCharge(true);
    };

    const resetForm = () => {
      setChargeEnEdition(null);
      setNouvelleCharge({
        type: 'fixe',
        categorie: '',
        description: '',
        montant: 0,
        date: new Date().toISOString().split('T')[0],
        recurrente: false,
        frequence: 'mensuelle',
      });
    };

    // Filtrer les charges par mois et type
    const chargesFiltrees = charges.filter((charge) => {
      const chargeDate = new Date(charge.date);
      const matchMonth =
        chargeDate.getMonth() === selectedMonth &&
        chargeDate.getFullYear() === selectedYear;
      const matchType = filterType === 'tous' || charge.type === filterType;
      return matchMonth && matchType;
    });

    // Calculer les totaux
    const totauxParType = {
      fixe: chargesFiltrees
        .filter((c) => c.type === 'fixe')
        .reduce((sum, c) => sum + c.montant, 0),
      consommable: chargesFiltrees
        .filter((c) => c.type === 'consommable')
        .reduce((sum, c) => sum + c.montant, 0),
      variable: chargesFiltrees
        .filter((c) => c.type === 'variable')
        .reduce((sum, c) => sum + c.montant, 0),
      exceptionnelle: chargesFiltrees
        .filter((c) => c.type === 'exceptionnelle')
        .reduce((sum, c) => sum + c.montant, 0),
    };

    const totalGeneral = Object.values(totauxParType).reduce(
      (sum, val) => sum + val,
      0
    );

    const mois = [
      'Janvier',
      'Février',
      'Mars',
      'Avril',
      'Mai',
      'Juin',
      'Juillet',
      'Août',
      'Septembre',
      'Octobre',
      'Novembre',
      'Décembre',
    ];

    return (
      <div className="space-y-6">
        {/* Sélecteur de mois */}
        <div className="bg-white rounded-2xl p-4 shadow-lg flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Calendar className="w-6 h-6 text-blue-600" />
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              className="px-4 py-2 border-2 border-blue-200 rounded-xl font-semibold text-lg focus:ring-2 focus:ring-blue-500 outline-none"
            >
              {mois.map((m, idx) => (
                <option key={idx} value={idx}>
                  {m} {selectedYear}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={() => {
              resetForm();
              setShowModalCharge(true);
            }}
            className="bg-blue-500 text-white px-6 py-2 rounded-xl hover:bg-blue-600 flex items-center gap-2 font-medium"
          >
            <Plus className="w-5 h-5" />
            Ajouter une charge
          </button>
        </div>

        {/* Résumé des charges */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-white shadow-lg">
            <div className="text-sm opacity-90 mb-2">📌 Charges Fixes</div>
            <div className="text-3xl font-bold">
              {totauxParType.fixe.toLocaleString()} F
            </div>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="text-sm opacity-90 mb-2">🧴 Consommables</div>
            <div className="text-3xl font-bold">
              {totauxParType.consommable.toLocaleString()} F
            </div>
          </div>
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="text-sm opacity-90 mb-2">⚡ Variables</div>
            <div className="text-3xl font-bold">
              {totauxParType.variable.toLocaleString()} F
            </div>
          </div>
          <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="text-sm opacity-90 mb-2">🔧 Exceptionnelles</div>
            <div className="text-3xl font-bold">
              {totauxParType.exceptionnelle.toLocaleString()} F
            </div>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="text-sm opacity-90 mb-2">💰 TOTAL</div>
            <div className="text-3xl font-bold">
              {totalGeneral.toLocaleString()} F
            </div>
          </div>
        </div>

        {/* Filtres */}
        <div className="bg-white rounded-2xl p-4 shadow-lg">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilterType('tous')}
              className={`px-4 py-2 rounded-xl font-medium transition ${
                filterType === 'tous'
                  ? 'bg-gray-800 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Toutes les charges
            </button>
            {Object.entries(typeLabels).map(([key, { label, color }]) => (
              <button
                key={key}
                onClick={() => setFilterType(key)}
                className={`px-4 py-2 rounded-xl font-medium transition ${
                  filterType === key
                    ? `bg-${color}-500 text-white`
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Liste des charges */}
        <div className="space-y-4">
          {chargesFiltrees.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center shadow-lg">
              <DollarSign className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <div className="text-gray-500">
                Aucune charge pour {mois[selectedMonth]} {selectedYear}
              </div>
            </div>
          ) : (
            chargesFiltrees.map((charge) => {
              const typeInfo = typeLabels[charge.type];
              return (
                <div
                  key={charge.id}
                  className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span
                          className={`bg-${typeInfo.color}-100 text-${typeInfo.color}-700 px-3 py-1 rounded-full text-xs font-semibold`}
                        >
                          {typeInfo.label}
                        </span>
                        <span className="font-bold text-lg">
                          {charge.categorie}
                        </span>
                        {charge.recurrente && (
                          <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-semibold">
                            🔄 Récurrente
                          </span>
                        )}
                      </div>
                      <div className="text-gray-600 mb-2">
                        {charge.description}
                      </div>
                      <div className="text-sm text-gray-500">
                        📅 {new Date(charge.date).toLocaleDateString('fr-FR')}
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <div className="text-3xl font-bold text-gray-800 mb-3">
                        {charge.montant.toLocaleString()} F
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => editerCharge(charge)}
                          className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 text-sm"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => supprimerCharge(charge.id)}
                          className="px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 text-sm"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Ajouter/Modifier Charge */}
        {showModalCharge && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
                <h2 className="text-2xl font-bold">
                  {chargeEnEdition
                    ? '✏️ Modifier la charge'
                    : '➕ Ajouter une charge'}
                </h2>
                <button
                  onClick={() => {
                    setShowModalCharge(false);
                    resetForm();
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                {/* Type de charge */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type de charge *
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {Object.entries(typeLabels).map(
                      ([key, { label, color, description }]) => (
                        <button
                          key={key}
                          onClick={() =>
                            setNouvelleCharge({
                              ...nouvelleCharge,
                              type: key,
                              categorie: '',
                            })
                          }
                          className={`p-4 rounded-xl border-2 transition text-left ${
                            nouvelleCharge.type === key
                              ? `border-${color}-500 bg-${color}-50`
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="font-bold mb-1">{label}</div>
                          <div className="text-xs text-gray-600">
                            {description}
                          </div>
                        </button>
                      )
                    )}
                  </div>
                </div>

                {/* Catégorie */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Catégorie *
                  </label>
                  <select
                    value={nouvelleCharge.categorie}
                    onChange={(e) =>
                      setNouvelleCharge({
                        ...nouvelleCharge,
                        categorie: e.target.value,
                      })
                    }
                    className="w-full px-3 sm:px-4 py-3 sm:py-2 text-base border rounded-xl focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Sélectionner...</option>
                    {categoriesParType[nouvelleCharge.type].map((cat, idx) => (
                      <option key={idx} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    value={nouvelleCharge.description}
                    onChange={(e) =>
                      setNouvelleCharge({
                        ...nouvelleCharge,
                        description: e.target.value,
                      })
                    }
                    className="w-full px-3 sm:px-4 py-3 sm:py-2 text-base border rounded-xl focus:ring-2 focus:ring-blue-500"
                    rows="3"
                    placeholder="Détails de la charge..."
                  />
                </div>

                {/* Montant et Date */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Montant (FCFA) *
                    </label>
                    <input
                      type="number"
                      value={nouvelleCharge.montant}
                      onChange={(e) =>
                        setNouvelleCharge({
                          ...nouvelleCharge,
                          montant: parseInt(e.target.value) || 0,
                        })
                      }
                      className="w-full px-3 sm:px-4 py-3 sm:py-2 text-base border rounded-xl focus:ring-2 focus:ring-blue-500"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date *
                    </label>
                    <input
                      type="date"
                      value={nouvelleCharge.date}
                      onChange={(e) =>
                        setNouvelleCharge({
                          ...nouvelleCharge,
                          date: e.target.value,
                        })
                      }
                      className="w-full px-3 sm:px-4 py-3 sm:py-2 text-base border rounded-xl focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Charge récurrente */}
                <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <input
                      type="checkbox"
                      id="recurrente"
                      checked={nouvelleCharge.recurrente}
                      onChange={(e) =>
                        setNouvelleCharge({
                          ...nouvelleCharge,
                          recurrente: e.target.checked,
                        })
                      }
                      className="w-5 h-5 text-purple-600 rounded"
                    />
                    <label
                      htmlFor="recurrente"
                      className="font-medium text-purple-800 cursor-pointer"
                    >
                      🔄 Charge récurrente
                    </label>
                  </div>
                  {nouvelleCharge.recurrente && (
                    <select
                      value={nouvelleCharge.frequence}
                      onChange={(e) =>
                        setNouvelleCharge({
                          ...nouvelleCharge,
                          frequence: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="mensuelle">Mensuelle</option>
                      <option value="trimestrielle">Trimestrielle</option>
                      <option value="annuelle">Annuelle</option>
                    </select>
                  )}
                </div>

                {/* Boutons */}
                <div className="flex gap-3 pt-4 border-t">
                  <button
                    onClick={() => {
                      setShowModalCharge(false);
                      resetForm();
                    }}
                    className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-xl hover:bg-gray-50 transition font-medium"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={ajouterCharge}
                    className="flex-1 bg-blue-500 text-white px-6 py-3 rounded-xl hover:bg-blue-600 transition font-medium"
                  >
                    {chargeEnEdition ? 'Modifier' : 'Ajouter'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };
  const mettreAJourStatut = async (commandeId, nouveauStatut) => {
    const updatedCommandes = commandes.map((cmd) =>
      cmd.id === commandeId ? { ...cmd, statut: nouveauStatut } : cmd
    );
    setCommandes(updatedCommandes);
    await storage.set('commandes', JSON.stringify(updatedCommandes));
  };

  // ✅ AJOUTER CETTE FONCTION ICI
  const envoyerNotificationWhatsApp = (commande, etape) => {
    // ✅ NOUVEAU : Utiliser les infos du pressing
    const infoPressing = pressingConfig
      ? `
📍 ${pressingConfig.adresse}
📞 ${pressingConfig.telephone}
🕐 ${pressingConfig.horaires}`
      : '';

    const signature = pressingConfig?.signature
      ? `

${pressingConfig.signature}`
      : '';

    const nomPressing = pressingConfig?.nomPressing || 'Tina';

    const messages = {
      nouvelle: `🧺 ${nomPressing.toUpperCase()} - Mon e-pressing
Commande reçue ✅

Bonjour ${commande.clientNom},

Votre commande a été enregistrée avec succès !

📦 Détails :
- ${commande.articles.length} article(s)
- Sous-total : ${(
        commande.sousTotal || commande.montantTotal
      ).toLocaleString()} FCFA${
        commande.montantRemise > 0
          ? `
- Remise fidélité : -${commande.montantRemise.toLocaleString()} FCFA 🎉`
          : ''
      }${
        commande.avecLivraison
          ? `
- Livraison : +${commande.fraisLivraison.toLocaleString()} FCFA 🚚`
          : ''
      }
- TOTAL : ${commande.montantTotal.toLocaleString()} FCFA
- Date de livraison : ${new Date(commande.dateLivraison).toLocaleDateString(
        'fr-FR',
        {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
        }
      )}${
        commande.avecLivraison
          ? `

📍 Livraison à : ${commande.adresseLivraison}
(Vous serez notifié quand le livreur sera en route)`
          : ''
      }

Merci pour votre confiance ! 🙏
${infoPressing}${signature}

_${nomPressing} - Mon e-pressing_`,

      pret: `✅ ${nomPressing.toUpperCase()} - Mon e-pressing
Linge prêt ! 🎉

Bonjour ${commande.clientNom},

📣 Bonne nouvelle ! Votre linge est prêt !

${
  commande.avecLivraison
    ? `🚚 LIVRAISON À DOMICILE

Notre livreur sera chez vous bientôt !
📍 Adresse : ${commande.adresseLivraison}

💡 Vous recevrez une notification quand il sera en route.`
    : `Vous pouvez venir le récupérer dès maintenant.
${infoPressing}`
}

💰 Montant à régler : ${commande.montantTotal.toLocaleString()} FCFA${
        commande.montantRemise > 0
          ? `
(Remise fidélité appliquée : -${commande.montantRemise.toLocaleString()} FCFA 🎁)`
          : ''
      }

À tout de suite ! 😊${signature}

_${nomPressing} - Mon e-pressing_`,

      en_route: `🚚 ${nomPressing.toUpperCase()} - Mon e-pressing
Livreur en route !

Bonjour ${commande.clientNom},

Notre livreur est en route vers chez vous ! 🚗💨

📍 Adresse de livraison :
${commande.adresseLivraison}

⏱️ Arrivée estimée : 15-20 minutes

Merci d'être disponible ! 🙏
${infoPressing}${signature}

_${nomPressing} - Mon e-pressing_`,

      livre: commande.avecLivraison
        ? `✅ ${nomPressing.toUpperCase()} - Mon e-pressing
Livraison terminée !

Bonjour ${commande.clientNom},

Votre linge a été livré avec succès ! 📦✅

Nous espérons que tout est à votre satisfaction.

💰 Montant réglé : ${commande.montantTotal.toLocaleString()} FCFA

Merci pour votre confiance ! 💙

👉 Programme de fidélité :
Après 5 commandes → 5% de réduction
Après 10 commandes → 10% de réduction
Après 20 commandes → 15% de réduction

À bientôt ! ✨
${infoPressing}${signature}

_${nomPressing} - Mon e-pressing_`
        : `🙏 ${nomPressing.toUpperCase()} - Mon e-pressing
Merci !

Bonjour ${commande.clientNom},

Merci infiniment pour votre confiance ! 💙

À bientôt ! ✨
${infoPressing}${signature}

_${nomPressing} - Mon e-pressing_`,
    };

    const message = messages[etape] || messages['nouvelle'];

    let telephone = commande.clientTel.replace(/[\s\-\(\)]/g, '');
    if (!telephone.startsWith('+')) {
      if (!telephone.startsWith('225')) {
        telephone = '225' + telephone;
      }
      telephone = '+' + telephone;
    }

    const messageEncode = encodeURIComponent(message);
    const lienWhatsApp = `https://wa.me/${telephone.replace(
      '+',
      ''
    )}?text=${messageEncode}`;

    window.open(lienWhatsApp, '_blank');
    showToast(`📱 WhatsApp ouvert pour ${commande.clientNom}`, 'success');
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <header className="bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <div className="bg-white rounded-xl p-2 sm:p-3 flex-shrink-0">
                <BarChart3 className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
              </div>
              <div className="text-white min-w-0">
                <h1 className="text-lg sm:text-2xl font-bold truncate">
                  Tina - Propriétaire
                </h1>
                <p className="text-xs sm:text-sm opacity-90 hidden sm:block">
                  Vue stratégique
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
              <button
                onClick={exporterDonnees}
                className="hidden md:flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-3 sm:px-4 py-2 rounded-xl transition text-sm"
                title="Exporter toutes les données"
              >
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
                  />
                </svg>
                <span className="hidden lg:inline">Export</span>
              </button>
              <div className="hidden sm:flex items-center gap-2 text-white text-xs sm:text-sm">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="hidden md:inline">Sync active</span>
              </div>
              <button
                onClick={onLogout}
                className="flex items-center gap-1 sm:gap-2 bg-white/20 hover:bg-white/30 text-white px-2 sm:px-4 py-2 rounded-xl transition"
              >
                <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline text-sm">Déconnexion</span>
              </button>
            </div>
          </div>
        </div>
      </header>
      <SystemeAlertes commandes={commandes} transactions={transactions} />
      <nav className="bg-white shadow-md sticky top-[76px] z-30 overflow-x-auto">
        <div className="max-w-7xl mx-auto px-2 sm:px-4">
          <div className="flex space-x-1 sm:space-x-2 py-2 min-w-max sm:min-w-0">
            {[
              {
                id: 'dashboard',
                label: 'Tableau de bord',
                icon: PieChart,
                shortLabel: 'Dashboard',
              },
              {
                id: 'comptabilite',
                label: 'Comptabilité',
                icon: FileText,
                shortLabel: 'Compta',
              },
              {
                id: 'graphiques',
                label: 'Graphiques',
                icon: LineChart,
                shortLabel: 'Stats',
              },
              {
                id: 'charges',
                label: 'Charges',
                icon: DollarSign,
                shortLabel: 'Charges',
              },
              {
                id: 'statistiques',
                label: 'Statistiques',
                icon: TrendingUp,
                shortLabel: 'Avancé',
              },
              {
                id: 'inventaire',
                label: 'Inventaire',
                icon: Package,
                shortLabel: 'Stock',
              },
            ].map((module) => (
              <button
                key={module.id}
                onClick={() => setActiveModule(module.id)}
                className={`flex flex-col sm:flex-row items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 rounded-xl font-medium whitespace-nowrap transition ${
                  activeModule === module.id
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <module.icon className="w-5 h-5 sm:w-4 sm:h-4" />
                <span className="text-xs sm:text-sm hidden sm:inline">
                  {module.label}
                </span>
                <span className="text-xs sm:hidden">{module.shortLabel}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {activeModule === 'dashboard' && <DashboardProprietaire />}
        {activeModule === 'comptabilite' && <ComptabiliteAnnuelle />}
        {activeModule === 'graphiques' && <Graphiques />}
        {activeModule === 'charges' && <ModuleCharges />}
        {activeModule === 'statistiques' && (
          <ModuleStatistiquesAvancees
            commandes={commandes}
            clients={clients}
            getNiveauFidelite={getNiveauFidelite}
          />
        )}
        {activeModule === 'inventaire' && (
          <ModuleInventaire
            commandes={commandes}
            mettreAJourStatut={mettreAJourStatut}
            envoyerNotificationWhatsApp={envoyerNotificationWhatsApp}
          />
        )}
      </main>
    </div>
  );
}
const ModuleStatistiquesAvancees = ({
  commandes,
  clients,
  getNiveauFidelite,
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState('30');
  const [activeTab, setActiveTab] = useState('clients');

  // ==========================================
  // 1. CLIENTS INACTIFS
  // ==========================================
  const getClientsInactifs = () => {
    const aujourdhui = new Date();
    const limiteInactivite = parseInt(selectedPeriod);

    return clients
      .map((client) => {
        const commandesClient = commandes.filter(
          (c) => c.clientTel === client.telephone
        );

        if (commandesClient.length === 0) {
          return {
            ...client,
            derniereCommande: null,
            joursInactivite: null,
            totalDepense: 0,
            nombreCommandes: 0,
          };
        }

        const derniereCommande = commandesClient.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        )[0];

        const dateDerniereCommande = new Date(derniereCommande.createdAt);
        const joursInactivite = Math.floor(
          (aujourdhui - dateDerniereCommande) / (1000 * 60 * 60 * 24)
        );

        const commandesTerminees = commandesClient.filter(
          (c) => c.statut === 'livre'
        );
        const totalDepense = commandesTerminees.reduce(
          (sum, c) => sum + c.montantTotal,
          0
        );

        return {
          ...client,
          derniereCommande,
          joursInactivite,
          totalDepense,
          nombreCommandes: commandesClient.length,
          fidelite: getNiveauFidelite(commandesTerminees.length),
        };
      })
      .filter(
        (client) =>
          client.joursInactivite === null ||
          client.joursInactivite >= limiteInactivite
      )
      .sort((a, b) => b.totalDepense - a.totalDepense);
  };

  // ==========================================
  // 2. JOUR LE PLUS CHARGÉ
  // ==========================================
  const getStatistiquesJours = () => {
    const joursStats = {
      0: { nom: 'Dimanche', commandes: 0, montantTotal: 0 },
      1: { nom: 'Lundi', commandes: 0, montantTotal: 0 },
      2: { nom: 'Mardi', commandes: 0, montantTotal: 0 },
      3: { nom: 'Mercredi', commandes: 0, montantTotal: 0 },
      4: { nom: 'Jeudi', commandes: 0, montantTotal: 0 },
      5: { nom: 'Vendredi', commandes: 0, montantTotal: 0 },
      6: { nom: 'Samedi', commandes: 0, montantTotal: 0 },
    };

    commandes.forEach((cmd) => {
      const jour = new Date(cmd.createdAt).getDay();
      joursStats[jour].commandes += 1;
      joursStats[jour].montantTotal += cmd.montantTotal;
    });

    Object.keys(joursStats).forEach((jour) => {
      const stats = joursStats[jour];
      stats.moyenneParCommande =
        stats.commandes > 0
          ? Math.round(stats.montantTotal / stats.commandes)
          : 0;
    });

    const joursArray = Object.values(joursStats);
    const jourLePlusCharge = joursArray.reduce(
      (max, jour) => (jour.commandes > max.commandes ? jour : max),
      joursArray[0]
    );

    return { joursStats: joursArray, jourLePlusCharge };
  };

  // ==========================================
  // 3. TEMPS MOYEN DE TRAITEMENT
  // ==========================================
  const getTempsTraitement = () => {
    const commandesLivrees = commandes.filter((c) => c.statut === 'livre');

    if (commandesLivrees.length === 0) {
      return {
        moyenneJours: 0,
        minimum: 0,
        maximum: 0,
        repartition: { express: 0, normal: 0, long: 0 },
        total: 0,
      };
    }

    const tempsList = commandesLivrees.map((cmd) => {
      const dateEntree = new Date(cmd.dateEntree);
      const dateLivraison = new Date(cmd.dateLivraison);
      return Math.floor((dateLivraison - dateEntree) / (1000 * 60 * 60 * 24));
    });

    const moyenneJours = Math.round(
      tempsList.reduce((sum, jours) => sum + jours, 0) / tempsList.length
    );

    const repartition = {
      express: tempsList.filter((j) => j <= 1).length,
      normal: tempsList.filter((j) => j > 1 && j <= 3).length,
      long: tempsList.filter((j) => j > 3).length,
    };

    return {
      moyenneJours,
      minimum: Math.min(...tempsList),
      maximum: Math.max(...tempsList),
      repartition,
      total: commandesLivrees.length,
    };
  };

  const clientsInactifs = getClientsInactifs();
  const { joursStats, jourLePlusCharge } = getStatistiquesJours();
  const tempsTraitement = getTempsTraitement();

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-2xl p-6 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold mb-2">
              📊 Statistiques Avancées
            </h2>
            <p className="text-sm opacity-90">
              Analyse approfondie de votre activité
            </p>
          </div>
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-4 py-2 bg-white/20 text-white rounded-xl border-2 border-white/30 font-semibold focus:ring-2 focus:ring-white outline-none"
          >
            <option value="30" className="text-gray-800">
              30 jours
            </option>
            <option value="60" className="text-gray-800">
              60 jours
            </option>
            <option value="90" className="text-gray-800">
              90 jours
            </option>
          </select>
        </div>
      </div>

      {/* Onglets */}
      <div className="bg-white rounded-2xl p-4 shadow-lg">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('clients')}
            className={`flex-1 px-4 py-3 rounded-xl font-semibold transition ${
              activeTab === 'clients'
                ? 'bg-purple-500 text-white shadow-lg'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            👥 Clients
          </button>
          <button
            onClick={() => setActiveTab('commercial')}
            className={`flex-1 px-4 py-3 rounded-xl font-semibold transition ${
              activeTab === 'commercial'
                ? 'bg-purple-500 text-white shadow-lg'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            📈 Commercial
          </button>
        </div>
      </div>

      {/* ONGLET CLIENTS */}
      {activeTab === 'clients' && (
        <div className="space-y-6">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl p-6 text-white shadow-lg">
              <AlertCircle className="w-8 h-8 opacity-80 mb-3" />
              <div className="text-3xl font-bold mb-1">
                {clientsInactifs.length}
              </div>
              <div className="text-sm opacity-90">
                Clients inactifs ({selectedPeriod}+ jours)
              </div>
            </div>
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white shadow-lg">
              <DollarSign className="w-8 h-8 opacity-80 mb-3" />
              <div className="text-3xl font-bold mb-1">
                {clientsInactifs
                  .reduce((sum, c) => sum + c.totalDepense, 0)
                  .toLocaleString()}{' '}
                F
              </div>
              <div className="text-sm opacity-90">
                Valeur perdue potentielle
              </div>
            </div>
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
              <TrendingUp className="w-8 h-8 opacity-80 mb-3" />
              <div className="text-3xl font-bold mb-1">
                {Math.round(
                  clientsInactifs.reduce((sum, c) => sum + c.totalDepense, 0) /
                    (clientsInactifs.length || 1)
                ).toLocaleString()}{' '}
                F
              </div>
              <div className="text-sm opacity-90">
                Valeur moyenne par client
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">🔴 Clients à réactiver</h3>
              <div className="text-sm text-gray-600">
                Triés par valeur décroissante
              </div>
            </div>

            {clientsInactifs.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <div className="text-gray-500">
                  Aucun client inactif - Excellent ! 🎉
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {clientsInactifs.map((client, idx) => (
                  <div
                    key={client.id}
                    className="bg-gradient-to-r from-red-50 to-orange-50 border-l-4 border-red-500 rounded-xl p-4 hover:shadow-md transition"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold">
                            #{idx + 1}
                          </span>
                          <h4 className="font-bold text-lg">{client.nom}</h4>
                          {client.fidelite && (
                            <span
                              className={`bg-gradient-to-r ${client.fidelite.couleur} text-white px-3 py-1 rounded-full text-xs font-semibold`}
                            >
                              {client.fidelite.icone} {client.fidelite.niveau}
                            </span>
                          )}
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                          <div>
                            <div className="text-gray-600">Téléphone</div>
                            <div className="font-semibold">
                              {client.telephone}
                            </div>
                          </div>
                          <div>
                            <div className="text-gray-600">Inactif depuis</div>
                            <div className="font-bold text-red-600">
                              {client.joursInactivite === null
                                ? 'Jamais commandé'
                                : `${client.joursInactivite} jours`}
                            </div>
                          </div>
                          <div>
                            <div className="text-gray-600">Total dépensé</div>
                            <div className="font-bold text-green-600">
                              {client.totalDepense.toLocaleString()} F
                            </div>
                          </div>
                          <div>
                            <div className="text-gray-600">Commandes</div>
                            <div className="font-semibold">
                              {client.nombreCommandes}
                            </div>
                          </div>
                        </div>

                        {client.derniereCommande && (
                          <div className="mt-2 text-xs text-gray-500">
                            Dernière commande :{' '}
                            {new Date(
                              client.derniereCommande.createdAt
                            ).toLocaleDateString('fr-FR')}
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => {
                          const message = `🎉 *TINA - Mon e-pressing*\nNous vous avons manqué !\n\nBonjour ${
                            client.nom
                          },\n\nVous nous manquez ! 💙\n\n🎁 *OFFRE SPÉCIALE RETOUR*\nPour votre prochaine commande :\n${
                            client.fidelite?.remise > 0
                              ? `• Votre remise fidélité ${client.fidelite.niveau} : ${client.fidelite.remise}%\n`
                              : ''
                          }• + 10% de remise supplémentaire !\n\nValable jusqu'au ${new Date(
                            Date.now() + 7 * 24 * 60 * 60 * 1000
                          ).toLocaleDateString(
                            'fr-FR'
                          )}\n\nOn vous attend ! ✨\n\n_Tina - Mon e-pressing_`;

                          let telephone = client.telephone.replace(
                            /[\s\-\(\)]/g,
                            ''
                          );
                          if (!telephone.startsWith('+')) {
                            if (!telephone.startsWith('225'))
                              telephone = '225' + telephone;
                            telephone = '+' + telephone;
                          }

                          window.open(
                            `https://wa.me/${telephone.replace(
                              '+',
                              ''
                            )}?text=${encodeURIComponent(message)}`,
                            '_blank'
                          );
                        }}
                        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center gap-2 text-sm ml-4"
                      >
                        <Bell className="w-4 h-4" />
                        Réactiver
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ONGLET COMMERCIAL */}
      {activeTab === 'commercial' && (
        <div className="space-y-6">
          {/* Jour le plus chargé */}
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Calendar className="w-6 h-6 text-blue-600" />
              📅 Jour de la semaine le plus chargé
            </h3>

            <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl p-6 mb-6">
              <div className="text-center">
                <div className="text-sm opacity-90 mb-2">
                  Jour le plus actif
                </div>
                <div className="text-4xl font-bold mb-2">
                  {jourLePlusCharge.nom}
                </div>
                <div className="text-2xl font-semibold mb-1">
                  {jourLePlusCharge.commandes} commandes
                </div>
                <div className="text-sm opacity-90">
                  {jourLePlusCharge.montantTotal.toLocaleString()} FCFA de CA
                </div>
              </div>
            </div>

            <div className="space-y-2">
              {joursStats.map((jour, idx) => {
                const maxCommandes = Math.max(
                  ...joursStats.map((j) => j.commandes)
                );
                const pourcentage =
                  maxCommandes > 0 ? (jour.commandes / maxCommandes) * 100 : 0;
                const estLePlusCharge = jour.nom === jourLePlusCharge.nom;

                return (
                  <div key={idx} className="flex items-center gap-3">
                    <div className="w-24 text-sm font-medium text-gray-600">
                      {jour.nom}
                    </div>
                    <div className="flex-1 bg-gray-100 rounded-full h-10 relative overflow-hidden">
                      <div
                        className={`h-full rounded-full flex items-center justify-between px-3 transition-all duration-500 ${
                          estLePlusCharge
                            ? 'bg-gradient-to-r from-blue-500 to-blue-600'
                            : 'bg-gradient-to-r from-gray-400 to-gray-500'
                        }`}
                        style={{ width: `${pourcentage}%` }}
                      >
                        <span className="text-white font-semibold text-sm">
                          {jour.commandes} cmd
                        </span>
                        <span className="text-white font-semibold text-sm">
                          {jour.montantTotal.toLocaleString()} F
                        </span>
                      </div>
                    </div>
                    <div className="w-32 text-right text-sm text-gray-600">
                      Moy: {jour.moyenneParCommande.toLocaleString()} F
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-700">
              💡 <strong>Conseil :</strong> Planifiez votre personnel en
              fonction de ces pics d'activité.
            </div>
          </div>

          {/* Temps moyen de traitement */}
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Clock className="w-6 h-6 text-orange-600" />
              ⏱️ Temps de traitement
            </h3>

            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
                <div className="text-sm opacity-90 mb-2">Temps moyen</div>
                <div className="text-4xl font-bold">
                  {tempsTraitement.moyenneJours}
                </div>
                <div className="text-sm opacity-90">jours</div>
              </div>
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
                <div className="text-sm opacity-90 mb-2">Minimum</div>
                <div className="text-4xl font-bold">
                  {tempsTraitement.minimum}
                </div>
                <div className="text-sm opacity-90">
                  jour{tempsTraitement.minimum > 1 ? 's' : ''}
                </div>
              </div>
              <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-6 text-white">
                <div className="text-sm opacity-90 mb-2">Maximum</div>
                <div className="text-4xl font-bold">
                  {tempsTraitement.maximum}
                </div>
                <div className="text-sm opacity-90">jours</div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Répartition des délais</h4>
              <div className="space-y-2">
                {[
                  {
                    label: 'Express (≤1j)',
                    key: 'express',
                    color: 'from-green-400 to-green-600',
                  },
                  {
                    label: 'Normal (2-3j)',
                    key: 'normal',
                    color: 'from-blue-400 to-blue-600',
                  },
                  {
                    label: 'Long (>3j)',
                    key: 'long',
                    color: 'from-red-400 to-red-600',
                  },
                ].map(({ label, key, color }) => (
                  <div key={key} className="flex items-center gap-3">
                    <div className="w-32 text-sm font-medium text-gray-600">
                      {label}
                    </div>
                    <div className="flex-1 bg-gray-100 rounded-full h-8 relative overflow-hidden">
                      <div
                        className={`bg-gradient-to-r ${color} h-full rounded-full flex items-center justify-end px-3`}
                        style={{
                          width: `${
                            tempsTraitement.total > 0
                              ? (tempsTraitement.repartition[key] /
                                  tempsTraitement.total) *
                                100
                              : 0
                          }%`,
                        }}
                      >
                        <span className="text-white font-semibold text-sm">
                          {tempsTraitement.repartition[key]} (
                          {Math.round(
                            (tempsTraitement.repartition[key] /
                              (tempsTraitement.total || 1)) *
                              100
                          )}
                          %)
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 bg-orange-50 border border-orange-200 rounded-lg p-3 text-sm text-orange-700">
              💡 <strong>Objectif :</strong> Visez 80% de commandes en moins de
              3 jours.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
// ==========================================
// MODAL NOUVELLE COMMANDE (EXTRAIT!)
// ==========================================
const ModalNouvelleCommande = React.memo(
  ({
    nouvelleCommande,
    setNouvelleCommande,
    nouvelArticle,
    setNouvelArticle,
    ajouterArticleCommande,
    ajouterCommande,
    setShowModal,
    commandes,
    getNiveauFidelite,
    getClientStats,
    commandeEnModification,
    articlesPersonnalises,
    creerArticlePersonnalise,
  }) => {
    const [fideliteInfo, setFideliteInfo] = useState(null);
    const [searchArticle, setSearchArticle] = useState('');

    const verifierFidelite = useCallback(
      (tel) => {
        if (tel.length >= 8) {
          const commandesClient = commandes.filter((c) => c.clientTel === tel);
          const stats = { nombreCommandes: commandesClient.length };
          const fidelite = getNiveauFidelite(stats.nombreCommandes);
          setFideliteInfo(fidelite);

          if (fidelite.remise > 0) {
            setNouvelleCommande((prev) => ({
              ...prev,
              remise: fidelite.remise,
              typeRemise: 'pourcentage',
            }));
          }
        }
      },
      [commandes, getNiveauFidelite, setNouvelleCommande]
    );

    const recalculerTotal = useCallback(() => {
      const sousTotal = nouvelleCommande.articles.reduce(
        (sum, art) => sum + art.total,
        0
      );
      const remiseNombre = Number(nouvelleCommande.remise) || 0;

      let montantRemise = 0;
      if (nouvelleCommande.typeRemise === 'pourcentage') {
        montantRemise = (sousTotal * remiseNombre) / 100;
      } else {
        montantRemise = remiseNombre;
      }

      const totalApresRemise = sousTotal - montantRemise;
      const fraisLivraisonNombre = nouvelleCommande.avecLivraison
        ? Number(nouvelleCommande.fraisLivraison) || 0
        : 0;
      const montantFinal = totalApresRemise + fraisLivraisonNombre;

      setNouvelleCommande((prev) => ({
        ...prev,
        sousTotal,
        montantRemise,
        montantTotal: montantFinal,
        resteAPayer:
          prev.statutPaiement === 'non_paye'
            ? montantFinal
            : prev.statutPaiement === 'paye'
            ? 0
            : montantFinal - (prev.montantPaye || 0),
      }));
    }, [
      nouvelleCommande.articles,
      nouvelleCommande.typeRemise,
      nouvelleCommande.remise,
      nouvelleCommande.avecLivraison,
      nouvelleCommande.fraisLivraison,
      setNouvelleCommande,
    ]);

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-0 sm:p-4">
        <div className="bg-white rounded-none sm:rounded-2xl shadow-2xl w-full h-full sm:h-auto sm:max-w-3xl sm:max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center z-10">
            <h2 className="text-lg sm:text-2xl font-bold">
              {commandeEnModification
                ? '✏️ Modifier la commande'
                : 'Nouvelle commande'}
            </h2>
            <button
              onClick={() => setShowModal(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>

          <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom du client *
                </label>
                <input
                  type="text"
                  placeholder="Nom complet"
                  value={nouvelleCommande.clientNom}
                  onChange={(e) =>
                    setNouvelleCommande((prev) => ({
                      ...prev,
                      clientNom: e.target.value,
                    }))
                  }
                  className="w-full px-3 sm:px-4 py-3 sm:py-2 text-base border rounded-xl focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Téléphone *
                </label>
                <input
                  type="tel"
                  placeholder="+33, +225, +1, etc."
                  value={nouvelleCommande.clientTel}
                  onChange={(e) => {
                    const tel = e.target.value;
                    setNouvelleCommande((prev) => ({
                      ...prev,
                      clientTel: tel,
                    }));
                    if (tel.length >= 8) {
                      verifierFidelite(tel);
                    }
                  }}
                  className="w-full px-3 sm:px-4 py-3 sm:py-2 text-base border rounded-xl focus:ring-2 focus:ring-blue-500"
                />
                {fideliteInfo && fideliteInfo.remise > 0 && (
                  <div
                    className={`mt-2 bg-gradient-to-r ${fideliteInfo.couleur} text-white px-3 py-2 rounded-lg text-sm flex items-center gap-2`}
                  >
                    <span>{fideliteInfo.icone}</span>
                    <span className="font-semibold">
                      Client {fideliteInfo.niveau} - {fideliteInfo.remise}% de
                      remise automatique !
                    </span>
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date d'entrée
                </label>
                <input
                  type="date"
                  value={nouvelleCommande.dateEntree}
                  onChange={(e) =>
                    setNouvelleCommande((prev) => ({
                      ...prev,
                      dateEntree: e.target.value,
                    }))
                  }
                  className="w-full px-3 sm:px-4 py-3 sm:py-2 text-base border rounded-xl focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date de livraison *
                </label>
                <input
                  type="date"
                  value={nouvelleCommande.dateLivraison}
                  onChange={(e) =>
                    setNouvelleCommande((prev) => ({
                      ...prev,
                      dateLivraison: e.target.value,
                    }))
                  }
                  className="w-full px-3 sm:px-4 py-3 sm:py-2 text-base border rounded-xl focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="bg-blue-50 rounded-xl p-4 space-y-3">
              <h3 className="font-semibold">Ajouter un article</h3>

              {/* Choix du service : Laverie, Pressing ou Repassage */}
              <div className="flex gap-2 mb-3">
                <button
                  onClick={() => {
                    setNouvelArticle({
                      ...nouvelArticle,
                      service: 'Laverie',
                      prix: 0,
                    });
                  }}
                  className={`flex-1 py-2 px-3 rounded-lg font-medium transition text-sm ${
                    nouvelArticle.service === 'Laverie'
                      ? 'bg-blue-500 text-white'
                      : 'bg-white text-gray-700 border-2 border-gray-300'
                  }`}
                >
                  💧 Laverie
                </button>
                <button
                  onClick={() => {
                    setNouvelArticle({
                      ...nouvelArticle,
                      service: 'Pressing',
                      prix: 0,
                    });
                  }}
                  className={`flex-1 py-2 px-3 rounded-lg font-medium transition text-sm ${
                    nouvelArticle.service === 'Pressing'
                      ? 'bg-purple-500 text-white'
                      : 'bg-white text-gray-700 border-2 border-gray-300'
                  }`}
                >
                  ✨ Pressing
                </button>
                <button
                  onClick={() => {
                    setNouvelArticle({
                      ...nouvelArticle,
                      service: 'Repassage',
                      prix: PRIX_REPASSAGE,
                      isCustom: false,
                    });
                  }}
                  className={`flex-1 py-2 px-3 rounded-lg font-medium transition text-sm ${
                    nouvelArticle.service === 'Repassage'
                      ? 'bg-orange-500 text-white'
                      : 'bg-white text-gray-700 border-2 border-gray-300'
                  }`}
                >
                  🔥 Repassage
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Sélection de l'article (sauf si Repassage) */}
                {nouvelArticle.service !== 'Repassage' ? (
                  <div className="col-span-2 space-y-2">
                    {/* ✅ BARRE DE RECHERCHE */}
                    <input
                      type="text"
                      placeholder="🔍 Rechercher un article..."
                      value={searchArticle}
                      onChange={(e) => setSearchArticle(e.target.value)}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                    />

                    {/* SELECT AVEC ARTICLES FILTRÉS */}
                    <select
                      value={nouvelArticle.type}
                      onChange={(e) => {
                        const selectedNom = e.target.value;

                        if (selectedNom === 'CUSTOM') {
                          setNouvelArticle({
                            ...nouvelArticle,
                            type: '',
                            isCustom: true,
                            prix: 0,
                          });
                        } else if (selectedNom === 'CREATE_NEW') {
                          // ✅ NOUVEAU : Créer un nouvel article
                          const nom = prompt('Nom du nouvel article :');
                          if (!nom) return;

                          const prixLaverie = parseInt(
                            prompt('Prix Laverie (FCFA) :') || '0'
                          );
                          const prixPressing = parseInt(
                            prompt('Prix Pressing (FCFA) :') || '0'
                          );

                          if (prixLaverie === 0 && prixPressing === 0) {
                            alert('❌ Veuillez entrer au moins un prix');
                            return;
                          }

                          creerArticlePersonnalise(
                            nom,
                            prixLaverie,
                            prixPressing
                          ).then((success) => {
                            if (success) {
                              // Sélectionner automatiquement l'article créé
                              const prix =
                                nouvelArticle.service === 'Laverie'
                                  ? prixLaverie
                                  : prixPressing;
                              setNouvelArticle({
                                ...nouvelArticle,
                                type: nom,
                                isCustom: false,
                                prix: prix,
                              });
                            }
                          });
                          return;
                        } else if (selectedNom) {
                          // Chercher dans les articles de base ET personnalisés
                          const article =
                            ARTICLES_PRESSING.find(
                              (a) => a.nom === selectedNom
                            ) ||
                            articlesPersonnalises.find(
                              (a) => a.nom === selectedNom
                            );
                          if (article) {
                            const prix =
                              nouvelArticle.service === 'Laverie'
                                ? article.prixLaverie
                                : article.prixPressing;
                            setNouvelArticle({
                              ...nouvelArticle,
                              type: selectedNom,
                              isCustom: false,
                              prix: prix,
                            });
                          }
                        } else {
                          setNouvelArticle({
                            ...nouvelArticle,
                            type: '',
                            prix: 0,
                            isCustom: false,
                          });
                        }
                      }}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Sélectionner un article...</option>

                      {/* ✅ Articles personnalisés en premier */}
                      {articlesPersonnalises.length > 0 && (
                        <optgroup label="📌 Vos articles personnalisés">
                          {articlesPersonnalises
                            .filter((article) =>
                              article.nom
                                .toLowerCase()
                                .includes(searchArticle.toLowerCase())
                            )
                            .map((article, idx) => (
                              <option key={`perso-${idx}`} value={article.nom}>
                                {article.nom} -{' '}
                                {nouvelArticle.service === 'Laverie'
                                  ? article.prixLaverie
                                  : article.prixPressing}{' '}
                                FCFA ⭐
                              </option>
                            ))}
                        </optgroup>
                      )}

                      {/* Articles de base */}
                      <optgroup label="📋 Articles standards">
                        {ARTICLES_PRESSING.filter((article) =>
                          article.nom
                            .toLowerCase()
                            .includes(searchArticle.toLowerCase())
                        ).map((article, idx) => (
                          <option key={idx} value={article.nom}>
                            {article.nom} -{' '}
                            {nouvelArticle.service === 'Laverie'
                              ? article.prixLaverie
                              : article.prixPressing}{' '}
                            FCFA
                          </option>
                        ))}
                      </optgroup>

                      <option
                        value="CREATE_NEW"
                        style={{ fontWeight: 'bold', color: 'green' }}
                      >
                        ➕ Créer un nouvel article permanent
                      </option>
                      <option value="CUSTOM">
                        📝 Autre article (usage unique)
                      </option>
                    </select>

                    {/* Nombre de résultats */}
                    {searchArticle && (
                      <div className="text-xs text-gray-500">
                        {
                          ARTICLES_PRESSING.filter((a) =>
                            a.nom
                              .toLowerCase()
                              .includes(searchArticle.toLowerCase())
                          ).length
                        }{' '}
                        article(s) trouvé(s)
                      </div>
                    )}
                  </div>
                ) : (
                  /* Pour Repassage : juste un input texte */
                  <input
                    type="text"
                    placeholder="Nom de l'article à repasser"
                    value={nouvelArticle.type}
                    onChange={(e) =>
                      setNouvelArticle({
                        ...nouvelArticle,
                        type: e.target.value,
                        prix: PRIX_REPASSAGE,
                      })
                    }
                    className="col-span-2 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
                  />
                )}

                {/* Si article personnalisé (Laverie ou Pressing), afficher input pour le nom */}
                {nouvelArticle.isCustom &&
                  nouvelArticle.service !== 'Repassage' && (
                    <input
                      type="text"
                      placeholder="Nom de l'article personnalisé"
                      value={nouvelArticle.type}
                      onChange={(e) =>
                        setNouvelArticle({
                          ...nouvelArticle,
                          type: e.target.value,
                        })
                      }
                      className="col-span-2 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  )}

                {/* Quantité */}
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="Quantité"
                  value={
                    nouvelArticle.quantite === 0
                      ? ''
                      : String(nouvelArticle.quantite)
                  }
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9]/g, '');
                    setNouvelArticle({
                      ...nouvelArticle,
                      quantite: val === '' ? 0 : parseInt(val),
                    });
                  }}
                  className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />

                {/* Prix */}
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="Prix unitaire (FCFA)"
                  value={
                    nouvelArticle.prix === 0 ? '' : String(nouvelArticle.prix)
                  }
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9]/g, '');
                    setNouvelArticle({
                      ...nouvelArticle,
                      prix: val === '' ? 0 : parseInt(val),
                    });
                  }}
                  className={`px-3 py-2 border rounded-lg focus:ring-2 ${
                    nouvelArticle.service === 'Repassage'
                      ? 'focus:ring-orange-500 bg-orange-50'
                      : 'focus:ring-blue-500'
                  } ${
                    !nouvelArticle.isCustom &&
                    nouvelArticle.service !== 'Repassage'
                      ? 'bg-gray-100'
                      : ''
                  }`}
                  disabled={
                    !nouvelArticle.isCustom &&
                    nouvelArticle.service !== 'Repassage'
                  }
                />
              </div>
              {/* Description de l'article */}
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  📝 Description (couleur, état, problèmes détectés...)
                </label>
                <textarea
                  value={nouvelArticle.description}
                  onChange={(e) =>
                    setNouvelArticle({
                      ...nouvelArticle,
                      description: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500"
                  rows="3"
                  placeholder="Ex: Chemise blanche avec tache de vin sur la manche droite, bouton manquant au col"
                />
                <div className="text-xs text-gray-500 mt-1">
                  💡 Indiquez la couleur, les taches, déchirures, boutons
                  manquants, etc.
                </div>
              </div>
              {/* Badge pour indiquer le type de service sélectionné */}
              <div
                className={`text-xs px-3 py-1 rounded-full inline-flex items-center gap-1 ${
                  nouvelArticle.service === 'Laverie'
                    ? 'bg-blue-100 text-blue-700'
                    : nouvelArticle.service === 'Pressing'
                    ? 'bg-purple-100 text-purple-700'
                    : 'bg-orange-100 text-orange-700'
                }`}
              >
                {nouvelArticle.service === 'Laverie'
                  ? '💧'
                  : nouvelArticle.service === 'Pressing'
                  ? '✨'
                  : '🔥'}
                Service {nouvelArticle.service}
                {nouvelArticle.service === 'Repassage' &&
                  ` - ${PRIX_REPASSAGE} FCFA/article`}
              </div>

              <button
                onClick={ajouterArticleCommande}
                className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Ajouter l'article
              </button>
            </div>

            {nouvelleCommande.articles.length > 0 && (
              <div className="space-y-2">
                <div className="font-medium">
                  Articles ({nouvelleCommande.articles.length})
                </div>
                {nouvelleCommande.articles.map((art, idx) => (
                  <div
                    key={idx}
                    className="bg-white rounded-xl p-4 border-2 border-gray-200"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-bold text-lg">{art.type}</span>
                          <span
                            className={`text-xs px-2 py-1 rounded-full font-semibold ${
                              art.service === 'Laverie'
                                ? 'bg-blue-100 text-blue-700'
                                : art.service === 'Pressing'
                                ? 'bg-purple-100 text-purple-700'
                                : 'bg-orange-100 text-orange-700'
                            }`}
                          >
                            {art.service === 'Laverie'
                              ? '💧'
                              : art.service === 'Pressing'
                              ? '✨'
                              : '🔥'}{' '}
                            {art.service}
                          </span>
                          <span className="text-sm text-gray-600">
                            ({art.quantite}x)
                          </span>
                        </div>

                        {/* ✅ AFFICHER LA DESCRIPTION SI ELLE EXISTE */}
                        {art.description && (
                          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2 mb-2">
                            <div className="text-xs font-semibold text-yellow-800 mb-1">
                              📝 Description :
                            </div>
                            <div className="text-sm text-gray-700">
                              {art.description}
                            </div>
                          </div>
                        )}

                        <div className="text-sm text-gray-600">
                          Prix unitaire : {art.prix.toLocaleString()} FCFA
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <div className="text-2xl font-bold text-gray-800">
                          {art.total.toLocaleString()} F
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {nouvelleCommande.articles.length > 0 && (
              <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-4 space-y-3">
                <h3 className="font-semibold text-purple-800 flex items-center gap-2">
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M10 3.5a1.5 1.5 0 013 0V4a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-.5a1.5 1.5 0 000 3h.5a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-.5a1.5 1.5 0 00-3 0v.5a1 1 0 01-1 1H6a1 1 0 01-1-1v-3a1 1 0 00-1-1h-.5a1.5 1.5 0 010-3H4a1 1 0 001-1V6a1 1 0 011-1h3a1 1 0 001-1v-.5z" />
                  </svg>
                  Remises et Promotions
                </h3>
                <div className="grid md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Type de remise
                    </label>
                    <select
                      value={nouvelleCommande.typeRemise}
                      onChange={(e) => {
                        setNouvelleCommande((prev) => ({
                          ...prev,
                          typeRemise: e.target.value,
                        }));
                        setTimeout(recalculerTotal, 100);
                      }}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="pourcentage">Pourcentage (%)</option>
                      <option value="montant">Montant fixe (FCFA)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {nouvelleCommande.typeRemise === 'pourcentage'
                        ? 'Remise (%)'
                        : 'Montant (FCFA)'}
                    </label>
                    <input
                      type="number"
                      step="any"
                      min="0"
                      value={nouvelleCommande.remise || ''}
                      onChange={(e) => {
                        const value =
                          e.target.value === '' ? 0 : Number(e.target.value);
                        console.log(
                          '🔍 REMISE - Valeur tapée:',
                          e.target.value
                        );
                        console.log(
                          '🔍 REMISE - Après conversion:',
                          value,
                          typeof value
                        );

                        // ✅ MISE À JOUR IMMÉDIATE avec le calcul
                        setNouvelleCommande((prev) => {
                          const sousTotal = prev.articles.reduce(
                            (sum, art) => sum + art.total,
                            0
                          );
                          const remiseNombre = Number(value) || 0;

                          let montantRemise = 0;
                          if (prev.typeRemise === 'pourcentage') {
                            montantRemise = (sousTotal * remiseNombre) / 100;
                          } else {
                            montantRemise = remiseNombre;
                          }

                          const totalApresRemise = sousTotal - montantRemise;
                          const fraisLivraisonNombre = prev.avecLivraison
                            ? Number(prev.fraisLivraison) || 0
                            : 0;
                          const montantFinal =
                            totalApresRemise + fraisLivraisonNombre;

                          return {
                            ...prev,
                            remise: value,
                            sousTotal,
                            montantRemise,
                            montantTotal: montantFinal,
                          };
                        });
                      }}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                      placeholder="0"
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      onClick={() => {
                        // ✅ RÉINITIALISER LA REMISE ET RECALCULER
                        setNouvelleCommande((prev) => {
                          const sousTotal = prev.articles.reduce(
                            (sum, art) => sum + art.total,
                            0
                          );
                          const fraisLivraisonNombre = prev.avecLivraison
                            ? Number(prev.fraisLivraison) || 0
                            : 0;
                          const montantFinal = sousTotal + fraisLivraisonNombre;

                          return {
                            ...prev,
                            remise: 0,
                            montantRemise: 0,
                            montantTotal: montantFinal,
                          };
                        });
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
                    >
                      Annuler remise
                    </button>
                  </div>
                </div>
              </div>
            )}

            {nouvelleCommande.articles.length > 0 && (
              <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="avecLivraison"
                    checked={nouvelleCommande.avecLivraison}
                    onChange={(e) => {
                      setNouvelleCommande((prev) => ({
                        ...prev,
                        avecLivraison: e.target.checked,
                      }));
                      setTimeout(recalculerTotal, 100);
                    }}
                    className="w-5 h-5 text-green-600 rounded focus:ring-2 focus:ring-green-500"
                  />
                  <label
                    htmlFor="avecLivraison"
                    className="font-semibold text-green-800 flex items-center gap-2 cursor-pointer"
                  >
                    <Truck className="w-5 h-5" />
                    Livraison à domicile
                  </label>
                </div>

                {nouvelleCommande.avecLivraison && (
                  <div className="grid md:grid-cols-2 gap-3 pt-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Adresse de livraison
                      </label>
                      <input
                        type="text"
                        value={nouvelleCommande.adresseLivraison}
                        onChange={(e) =>
                          setNouvelleCommande((prev) => ({
                            ...prev,
                            adresseLivraison: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                        placeholder="Quartier, commune, indication..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Frais de livraison (FCFA)
                      </label>
                      <input
                        type="number"
                        step="1"
                        min="0"
                        value={nouvelleCommande.fraisLivraison || ''}
                        onChange={(e) => {
                          const value =
                            e.target.value === '' ? 0 : Number(e.target.value);

                          setNouvelleCommande((prev) => {
                            const sousTotal = prev.articles.reduce(
                              (sum, art) => sum + art.total,
                              0
                            );
                            const remiseNombre = Number(prev.remise) || 0;

                            let montantRemise = 0;
                            if (prev.typeRemise === 'pourcentage') {
                              montantRemise = (sousTotal * remiseNombre) / 100;
                            } else {
                              montantRemise = remiseNombre;
                            }

                            const totalApresRemise = sousTotal - montantRemise;
                            const montantFinal = totalApresRemise + value;

                            return {
                              ...prev,
                              fraisLivraison: value,
                              sousTotal,
                              montantRemise,
                              montantTotal: montantFinal,
                            };
                          });
                        }}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                        placeholder="1000"
                      />
                    </div>

                    <div className="md:col-span-2 bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
                      <div className="flex items-start gap-2">
                        <Bell className="w-4 h-4 text-blue-600 mt-0.5" />
                        <div>
                          <div className="font-semibold text-blue-800">
                            Notifications de livraison activées
                          </div>
                          <div className="text-blue-700 text-xs mt-1">
                            Le client recevra une notification WhatsApp quand le
                            livreur sera en route 📱
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ✅ SECTION PAIEMENT */}
            {nouvelleCommande.articles.length > 0 && (
              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 space-y-3">
                <h3 className="font-semibold text-blue-800 flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  💳 Paiement
                </h3>

                <div className="space-y-3">
                  <div className="flex flex-col gap-2">
                    <label
                      className={`flex items-center gap-3 p-3 border-2 rounded-xl cursor-pointer hover:bg-blue-50 transition ${
                        nouvelleCommande.statutPaiement === 'non_paye'
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200'
                      }`}
                    >
                      <input
                        type="radio"
                        name="statutPaiement"
                        value="non_paye"
                        checked={nouvelleCommande.statutPaiement === 'non_paye'}
                        onChange={(e) => {
                          setNouvelleCommande((prev) => ({
                            ...prev,
                            statutPaiement: 'non_paye',
                            montantPaye: 0,
                            resteAPayer: prev.montantTotal,
                          }));
                        }}
                        className="w-4 h-4 text-blue-600"
                      />
                      <div className="flex-1">
                        <div className="font-semibold text-gray-800">
                          ❌ Non payé
                        </div>
                        <div className="text-xs text-gray-600">
                          Le client paiera plus tard
                        </div>
                      </div>
                    </label>

                    <label
                      className={`flex items-center gap-3 p-3 border-2 rounded-xl cursor-pointer hover:bg-green-50 transition ${
                        nouvelleCommande.statutPaiement === 'paye'
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200'
                      }`}
                    >
                      <input
                        type="radio"
                        name="statutPaiement"
                        value="paye"
                        checked={nouvelleCommande.statutPaiement === 'paye'}
                        onChange={(e) => {
                          setNouvelleCommande((prev) => ({
                            ...prev,
                            statutPaiement: 'paye',
                            montantPaye: prev.montantTotal,
                            resteAPayer: 0,
                          }));
                        }}
                        className="w-4 h-4 text-green-600"
                      />
                      <div className="flex-1">
                        <div className="font-semibold text-gray-800">
                          ✅ Payé intégralement
                        </div>
                        <div className="text-xs text-gray-600">
                          Le montant total a été réglé
                        </div>
                      </div>
                    </label>

                    <label
                      className={`flex items-center gap-3 p-3 border-2 rounded-xl cursor-pointer hover:bg-orange-50 transition ${
                        nouvelleCommande.statutPaiement === 'avance'
                          ? 'border-orange-500 bg-orange-50'
                          : 'border-gray-200'
                      }`}
                    >
                      <input
                        type="radio"
                        name="statutPaiement"
                        value="avance"
                        checked={nouvelleCommande.statutPaiement === 'avance'}
                        onChange={(e) => {
                          setNouvelleCommande((prev) => ({
                            ...prev,
                            statutPaiement: 'avance',
                            montantPaye: 0,
                            resteAPayer: prev.montantTotal,
                          }));
                        }}
                        className="w-4 h-4 text-orange-600"
                      />
                      <div className="flex-1">
                        <div className="font-semibold text-gray-800">
                          💰 Avance versée
                        </div>
                        <div className="text-xs text-gray-600">
                          Un acompte a été payé
                        </div>
                      </div>
                    </label>
                  </div>

                  {/* Montant de l'avance */}
                  {nouvelleCommande.statutPaiement === 'avance' && (
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Montant de l'avance (FCFA)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max={nouvelleCommande.montantTotal}
                        value={nouvelleCommande.montantPaye || ''}
                        onChange={(e) => {
                          const montant = Number(e.target.value) || 0;
                          const montantFinal = Math.min(
                            montant,
                            nouvelleCommande.montantTotal
                          );
                          setNouvelleCommande((prev) => ({
                            ...prev,
                            montantPaye: montantFinal,
                            resteAPayer: prev.montantTotal - montantFinal,
                          }));
                        }}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
                        placeholder="0"
                      />
                      {nouvelleCommande.montantPaye > 0 && (
                        <div className="mt-2 text-sm text-orange-700">
                          Reste à payer :{' '}
                          <strong>
                            {(
                              nouvelleCommande.montantTotal -
                              nouvelleCommande.montantPaye
                            ).toLocaleString()}{' '}
                            FCFA
                          </strong>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Résumé paiement */}
                  {nouvelleCommande.statutPaiement !== 'non_paye' && (
                    <div className="bg-white border border-blue-200 rounded-lg p-3 text-sm">
                      <div className="flex justify-between mb-1">
                        <span className="text-gray-600">Montant total :</span>
                        <span className="font-semibold">
                          {nouvelleCommande.montantTotal.toLocaleString()} FCFA
                        </span>
                      </div>
                      <div className="flex justify-between mb-1">
                        <span className="text-gray-600">Montant payé :</span>
                        <span className="font-semibold text-green-600">
                          {nouvelleCommande.montantPaye.toLocaleString()} FCFA
                        </span>
                      </div>
                      <div className="flex justify-between pt-2 border-t">
                        <span className="text-gray-800 font-semibold">
                          Reste à payer :
                        </span>
                        <span
                          className={`font-bold ${
                            nouvelleCommande.resteAPayer === 0
                              ? 'text-green-600'
                              : 'text-orange-600'
                          }`}
                        >
                          {nouvelleCommande.resteAPayer.toLocaleString()} FCFA
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {nouvelleCommande.articles.length > 0 && (
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-xl space-y-2">
                <div className="flex justify-between text-sm opacity-90">
                  <span>Sous-total</span>
                  <span>
                    {(nouvelleCommande.sousTotal || 0).toLocaleString()} FCFA
                  </span>
                </div>

                {nouvelleCommande.montantRemise > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M10 3.5a1.5 1.5 0 013 0V4a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-.5a1.5 1.5 0 000 3h.5a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-.5a1.5 1.5 0 00-3 0v.5a1 1 0 01-1 1H6a1 1 0 01-1-1v-3a1 1 0 00-1-1h-.5a1.5 1.5 0 010-3H4a1 1 0 001-1V6a1 1 0 011-1h3a1 1 0 001-1v-.5z" />
                      </svg>
                      Remise ({nouvelleCommande.remise}
                      {nouvelleCommande.typeRemise === 'pourcentage'
                        ? '%'
                        : ' FCFA'}
                      )
                    </span>
                    <span className="font-semibold">
                      - {nouvelleCommande.montantRemise.toLocaleString()} FCFA
                    </span>
                  </div>
                )}

                {nouvelleCommande.avecLivraison &&
                  nouvelleCommande.fraisLivraison > 0 && (
                    <div className="flex justify-between text-sm opacity-90">
                      <span className="flex items-center gap-2">
                        <Truck className="w-4 h-4" />
                        Livraison
                      </span>
                      <span>
                        + {nouvelleCommande.fraisLivraison.toLocaleString()}{' '}
                        FCFA
                      </span>
                    </div>
                  )}

                <div className="border-t border-white/30 pt-2 mt-2"></div>

                <div className="flex justify-between items-center text-2xl font-bold">
                  <span>TOTAL</span>
                  <span>
                    {(nouvelleCommande.montantTotal || 0).toLocaleString()} FCFA
                  </span>
                </div>

                {nouvelleCommande.montantRemise > 0 && (
                  <div className="text-center text-sm bg-white/20 rounded-lg py-2 mt-2">
                    🎉 Vous économisez{' '}
                    {nouvelleCommande.montantRemise.toLocaleString()} FCFA !
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-3 pt-4 border-t">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-xl hover:bg-gray-50 transition-all font-medium"
              >
                Annuler
              </button>
              <button
                onClick={ajouterCommande}
                className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all font-medium shadow-lg"
              >
                {commandeEnModification
                  ? 'Enregistrer les modifications'
                  : 'Créer la commande'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

// ==========================================
// PLATEFORME MANAGER
// ==========================================
// ==========================================
// COMPOSANT COMMANDES (EXTRAIT DE TinaManager)
// ==========================================
const CommandesModule = ({
  commandes,
  setCommandes,
  searchTerm,
  setSearchTerm,
  filterStatus,
  setFilterStatus,
  filterDate,
  setFilterDate,
  setModalType,
  setShowModal,
  mettreAJourStatut,
  genererLienPaiement,
  envoyerNotificationWhatsApp,
  saveData,
  transactions,
  setTransactions,
  modifierCommande,
  supprimerCommande,
}) => {
  // États locaux
  const [commandeDetailId, setCommandeDetailId] = React.useState(null);
  const [showModalPaiement, setShowModalPaiement] = React.useState(false); // ✅ NOUVEAU
  const [commandePaiement, setCommandePaiement] = React.useState(null); // ✅ NOUVEAU
  const [montantPaiement, setMontantPaiement] = React.useState(0); // ✅ NOUVEAU

  // ✅ NOUVELLE FONCTION : Ouvrir le modal de paiement
  const ouvrirModalPaiement = (commande) => {
    setCommandePaiement(commande);
    // Calculer le montant restant à payer
    const restant = commande.montantTotal - (commande.montantPaye || 0);
    setMontantPaiement(restant);
    setShowModalPaiement(true);
  };

  // ✅ NOUVELLE FONCTION : Enregistrer le paiement
  const enregistrerPaiement = async () => {
    if (!commandePaiement || montantPaiement <= 0) {
      alert('Veuillez entrer un montant valide');
      return;
    }

    const montantActuel = commandePaiement.montantPaye || 0;
    const nouveauMontantPaye = montantActuel + montantPaiement;
    const nouveauReste = commandePaiement.montantTotal - nouveauMontantPaye;

    // Déterminer le nouveau statut
    let nouveauStatut = 'avance';
    if (nouveauReste <= 0) {
      nouveauStatut = 'paye';
    }

    // Mettre à jour la commande
    const updatedCommandes = commandes.map((cmd) =>
      cmd.id === commandePaiement.id
        ? {
            ...cmd,
            statutPaiement: nouveauStatut,
            montantPaye: nouveauMontantPaye,
            resteAPayer: Math.max(0, nouveauReste),
            historiquePaiements: [
              ...(cmd.historiquePaiements || []),
              {
                id: Date.now().toString(),
                montant: montantPaiement,
                date: new Date().toISOString(),
                methode: 'Manuel',
              },
            ],
          }
        : cmd
    );

    setCommandes(updatedCommandes);
    await saveData('commandes', updatedCommandes);

    // ✅ CORRECTION : Créer une transaction de recette
    const transaction = {
      id: Date.now().toString(),
      type: 'recette',
      description: `Paiement commande #${commandePaiement.id} - ${
        commandePaiement.clientNom
      }${
        nouveauStatut === 'paye'
          ? ' (Solde final)'
          : ` (Paiement partiel ${montantPaiement.toLocaleString()} FCFA)`
      }`,
      montant: montantPaiement, // ✅ Le montant du paiement effectué
      date: new Date().toISOString(),
      commandeId: commandePaiement.id, // ✅ Lien avec la commande
    };

    const newTransactions = [...transactions, transaction];
    setTransactions(newTransactions);
    await saveData('transactions', newTransactions);

    // Notification de succès
    alert(
      `✅ Paiement de ${montantPaiement.toLocaleString()} FCFA enregistré avec succès !`
    );

    // Fermer le modal
    setShowModalPaiement(false);
    setCommandePaiement(null);
    setMontantPaiement(0);
  };
  // Handlers stabilisés
  const handleSearchChange = React.useCallback(
    (e) => {
      setSearchTerm(e.target.value);
    },
    [setSearchTerm]
  );

  const handleFilterChange = React.useCallback(
    (e) => {
      setFilterStatus(e.target.value);
    },
    [setFilterStatus]
  );

  // Filtrage des commandes
  const commandesFiltrees = commandes
    .filter((cmd) => {
      const matchSearch =
        cmd.clientNom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cmd.clientTel.includes(searchTerm);
      const matchStatus =
        filterStatus === 'tous' || cmd.statut === filterStatus;

      // ✅ FILTRE PAR DATE
      let matchDate = true;
      if (filterDate) {
        const cmdDate = new Date(cmd.createdAt).toISOString().split('T')[0];
        matchDate = cmdDate === filterDate;
      }

      return matchSearch && matchStatus && matchDate;
    })
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); // Tri par date décroissante

  const commandeDetail = commandeDetailId
    ? commandes.find((c) => c.id === commandeDetailId)
    : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-4 items-center justify-between bg-white rounded-2xl p-4 shadow-lg">
        <div className="flex flex-wrap gap-3 items-center">
          <input
            type="text"
            placeholder="Rechercher..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={filterStatus}
            onChange={handleFilterChange}
            className="px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500"
          >
            <option value="tous">Tous</option>
            <option value="recu">Reçu</option>
            <option value="en_cours">En cours</option>
            <option value="pret">Prêt</option>
            <option value="livre">Livré</option>
          </select>

          {/* ✅ NOUVEAU FILTRE PAR DATE */}
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="px-4 py-2 border rounded-xl focus:ring-2 focus:ring-purple-500"
            />
            {filterDate && (
              <button
                onClick={() => setFilterDate('')}
                className="px-3 py-2 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 text-sm"
                title="Effacer le filtre de date"
              >
                ✕
              </button>
            )}
          </div>
        </div>
        <button
          onClick={() => {
            setModalType('nouvelle-commande');
            setShowModal(true);
          }}
          className="bg-blue-500 text-white px-6 py-2 rounded-xl hover:bg-blue-600 flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Nouvelle commande
        </button>
      </div>

      <div className="grid gap-4">
        {commandesFiltrees.map((cmd) => (
          <div
            key={cmd.id}
            className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition cursor-pointer"
            onClick={() => setCommandeDetailId(cmd.id)}
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-bold">{cmd.clientNom}</h3>

                  {/* Badge statut commande */}
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      cmd.statut === 'livre'
                        ? 'bg-green-100 text-green-700'
                        : cmd.statut === 'pret'
                        ? 'bg-blue-100 text-blue-700'
                        : cmd.statut === 'en_cours'
                        ? 'bg-orange-100 text-orange-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {cmd.statut === 'livre'
                      ? '✅ Livré'
                      : cmd.statut === 'pret'
                      ? '🎉 Prêt'
                      : cmd.statut === 'en_cours'
                      ? '⚙️ En cours'
                      : '📦 Reçu'}
                  </span>

                  {/* Badge livraison */}
                  {cmd.avecLivraison && (
                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                      <Truck className="w-3 h-3" />
                      Livraison
                    </span>
                  )}

                  {/* ✅ Badge statut paiement - TOUJOURS VISIBLE */}
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${
                      cmd.statutPaiement === 'paye'
                        ? 'bg-green-100 text-green-700'
                        : cmd.statutPaiement === 'avance'
                        ? 'bg-orange-100 text-orange-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {cmd.statutPaiement === 'paye' ? (
                      <>✅ Payé</>
                    ) : cmd.statutPaiement === 'avance' ? (
                      <>
                        💰 Avance: {(cmd.montantPaye || 0).toLocaleString()} F
                      </>
                    ) : (
                      <>❌ Non payé</>
                    )}
                  </span>
                </div>

                <div className="text-gray-600">{cmd.clientTel}</div>
                <div className="text-sm text-gray-500 mt-1">
                  📅 Livraison:{' '}
                  {new Date(cmd.dateLivraison).toLocaleDateString('fr-FR')}
                </div>
                <div className="text-sm text-gray-500">
                  📦 {cmd.articles.length} article
                  {cmd.articles.length > 1 ? 's' : ''}
                </div>
              </div>

              {/* ✅ PARTIE DROITE - ACTIONS */}
              <div className="text-right">
                <div>
                  {cmd.sousTotal && cmd.sousTotal !== cmd.montantTotal && (
                    <div className="text-sm text-gray-400 line-through">
                      {cmd.sousTotal.toLocaleString()} F
                    </div>
                  )}
                  <div className="text-2xl font-bold text-gray-800">
                    {cmd.montantTotal.toLocaleString()} F
                  </div>

                  {/* ✅ Afficher le reste à payer */}
                  {cmd.statutPaiement !== 'paye' && (
                    <div className="text-sm text-orange-600 font-semibold">
                      Reste:{' '}
                      {(
                        (cmd.montantTotal || 0) - (cmd.montantPaye || 0)
                      ).toLocaleString()}{' '}
                      F
                    </div>
                  )}
                </div>

                <select
                  value={cmd.statut}
                  onChange={(e) => {
                    e.stopPropagation();
                    mettreAJourStatut(cmd.id, e.target.value);
                  }}
                  onClick={(e) => e.stopPropagation()}
                  className="mt-2 w-full px-3 py-1 border rounded-lg text-sm"
                >
                  <option value="recu">Reçu</option>
                  <option value="en_cours">En cours</option>
                  <option value="pret">Prêt</option>
                  {cmd.avecLivraison && (
                    <option value="en_route">En livraison</option>
                  )}
                  <option value="livre">Livré</option>
                </select>

                {/* ✅ BOUTON ENREGISTRER PAIEMENT - Si non totalement payé */}
                {cmd.statutPaiement !== 'paye' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      ouvrirModalPaiement(cmd);
                    }}
                    className="mt-2 w-full px-3 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 text-sm flex items-center justify-center gap-1"
                  >
                    <CreditCard className="w-4 h-4" />
                    Enregistrer paiement
                  </button>
                )}

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    genererLienPaiement(cmd);
                  }}
                  className="mt-2 w-full px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm"
                >
                  💳 Lien paiement
                </button>
              </div>
            </div>
          </div>
        ))}

        {commandesFiltrees.length === 0 && (
          <div className="text-center py-12 bg-white rounded-2xl shadow-lg">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <div className="text-gray-500">Aucune commande trouvée</div>
          </div>
        )}
      </div>

      {/* ✅ MODAL ENREGISTRER PAIEMENT */}
      {showModalPaiement && commandePaiement && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold">💳 Enregistrer un paiement</h2>
              <button
                onClick={() => {
                  setShowModalPaiement(false);
                  setCommandePaiement(null);
                  setMontantPaiement(0);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Infos commande */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div className="font-semibold text-blue-800 mb-2">
                  Commande #{commandePaiement.id} - {commandePaiement.clientNom}
                </div>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Montant total :</span>
                    <span className="font-bold">
                      {commandePaiement.montantTotal.toLocaleString()} FCFA
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Déjà payé :</span>
                    <span className="font-bold text-green-600">
                      {(commandePaiement.montantPaye || 0).toLocaleString()}{' '}
                      FCFA
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-blue-300">
                    <span className="text-gray-800 font-semibold">
                      Reste à payer :
                    </span>
                    <span className="font-bold text-orange-600">
                      {(
                        commandePaiement.montantTotal -
                        (commandePaiement.montantPaye || 0)
                      ).toLocaleString()}{' '}
                      FCFA
                    </span>
                  </div>
                </div>
              </div>

              {/* Historique des paiements */}
              {commandePaiement.historiquePaiements &&
                commandePaiement.historiquePaiements.length > 0 && (
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                    <div className="font-semibold text-gray-800 mb-2 text-sm">
                      📋 Historique des paiements
                    </div>
                    <div className="space-y-1 text-xs">
                      {commandePaiement.historiquePaiements.map(
                        (paiement, idx) => (
                          <div
                            key={idx}
                            className="flex justify-between text-gray-600"
                          >
                            <span>
                              {new Date(paiement.date).toLocaleDateString(
                                'fr-FR'
                              )}
                            </span>
                            <span className="font-semibold text-green-600">
                              {paiement.montant.toLocaleString()} FCFA
                            </span>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}

              {/* Montant à payer */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Montant du paiement (FCFA) *
                </label>
                <input
                  type="number"
                  min="0"
                  max={
                    commandePaiement.montantTotal -
                    (commandePaiement.montantPaye || 0)
                  }
                  value={montantPaiement || ''}
                  onChange={(e) =>
                    setMontantPaiement(Number(e.target.value) || 0)
                  }
                  className="w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-orange-500 text-lg font-semibold"
                  placeholder="0"
                  autoFocus
                />
                <div className="mt-2 flex gap-2">
                  <button
                    onClick={() =>
                      setMontantPaiement(
                        commandePaiement.montantTotal -
                          (commandePaiement.montantPaye || 0)
                      )
                    }
                    className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 text-sm"
                  >
                    Montant complet
                  </button>
                  <button
                    onClick={() => {
                      const restant =
                        commandePaiement.montantTotal -
                        (commandePaiement.montantPaye || 0);
                      setMontantPaiement(Math.floor(restant / 2));
                    }}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm"
                  >
                    50%
                  </button>
                </div>
              </div>

              {/* Aperçu après paiement */}
              {montantPaiement > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <div className="text-sm font-semibold text-green-800 mb-2">
                    ✅ Après ce paiement :
                  </div>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total payé :</span>
                      <span className="font-bold text-green-600">
                        {(
                          (commandePaiement.montantPaye || 0) + montantPaiement
                        ).toLocaleString()}{' '}
                        FCFA
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Reste à payer :</span>
                      <span
                        className={`font-bold ${
                          commandePaiement.montantTotal -
                            (commandePaiement.montantPaye || 0) -
                            montantPaiement ===
                          0
                            ? 'text-green-600'
                            : 'text-orange-600'
                        }`}
                      >
                        {(
                          commandePaiement.montantTotal -
                          (commandePaiement.montantPaye || 0) -
                          montantPaiement
                        ).toLocaleString()}{' '}
                        FCFA
                      </span>
                    </div>
                    <div className="pt-2 border-t border-green-300">
                      <span className="font-semibold text-green-800">
                        {commandePaiement.montantTotal -
                          (commandePaiement.montantPaye || 0) -
                          montantPaiement ===
                        0
                          ? '✅ Commande totalement payée !'
                          : '💰 Paiement partiel (avance)'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Boutons */}
              <div className="flex gap-3 pt-4 border-t">
                <button
                  onClick={() => {
                    setShowModalPaiement(false);
                    setCommandePaiement(null);
                    setMontantPaiement(0);
                  }}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-xl hover:bg-gray-50 transition font-medium"
                >
                  Annuler
                </button>
                <button
                  onClick={enregistrerPaiement}
                  disabled={
                    montantPaiement <= 0 ||
                    montantPaiement >
                      commandePaiement.montantTotal -
                        (commandePaiement.montantPaye || 0)
                  }
                  className={`flex-1 px-6 py-3 rounded-xl transition font-medium ${
                    montantPaiement <= 0 ||
                    montantPaiement >
                      commandePaiement.montantTotal -
                        (commandePaiement.montantPaye || 0)
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-orange-500 text-white hover:bg-orange-600'
                  }`}
                >
                  Enregistrer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DÉTAIL COMMANDE */}
      {commandeDetail && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center z-10">
              <div>
                <h2 className="text-2xl font-bold">
                  Commande #{commandeDetail.id}
                </h2>
                <div className="text-sm text-gray-600">
                  Créée le{' '}
                  {new Date(commandeDetail.createdAt).toLocaleDateString(
                    'fr-FR',
                    {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    }
                  )}
                </div>
              </div>
              <button
                onClick={() => setCommandeDetailId(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Statut de la commande */}
              <div
                className={`rounded-xl p-4 ${
                  commandeDetail.statut === 'livre'
                    ? 'bg-green-50 border-2 border-green-200'
                    : commandeDetail.statut === 'pret'
                    ? 'bg-blue-50 border-2 border-blue-200'
                    : commandeDetail.statut === 'en_cours'
                    ? 'bg-orange-50 border-2 border-orange-200'
                    : 'bg-gray-50 border-2 border-gray-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-3xl ${
                        commandeDetail.statut === 'livre'
                          ? 'text-green-600'
                          : commandeDetail.statut === 'pret'
                          ? 'text-blue-600'
                          : commandeDetail.statut === 'en_cours'
                          ? 'text-orange-600'
                          : 'text-gray-600'
                      }`}
                    >
                      {commandeDetail.statut === 'livre'
                        ? '✅'
                        : commandeDetail.statut === 'pret'
                        ? '🎉'
                        : commandeDetail.statut === 'en_cours'
                        ? '⚙️'
                        : '📦'}
                    </span>
                    <div>
                      <div className="font-bold text-lg">
                        {commandeDetail.statut === 'livre'
                          ? 'Commande livrée'
                          : commandeDetail.statut === 'pret'
                          ? 'Commande prête'
                          : commandeDetail.statut === 'en_cours'
                          ? 'En cours de traitement'
                          : 'Commande reçue'}
                      </div>
                      <div className="text-sm text-gray-600">
                        {commandeDetail.statut === 'livre'
                          ? 'Cette commande a été livrée au client'
                          : commandeDetail.statut === 'pret'
                          ? 'La commande est prête à être récupérée'
                          : commandeDetail.statut === 'en_cours'
                          ? 'La commande est en cours de nettoyage'
                          : 'En attente de traitement'}
                      </div>
                    </div>
                  </div>
                  <select
                    value={commandeDetail.statut}
                    onChange={(e) =>
                      mettreAJourStatut(commandeDetail.id, e.target.value)
                    }
                    className="px-4 py-2 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 font-semibold"
                  >
                    <option value="recu">📦 Reçu</option>
                    <option value="en_cours">⚙️ En cours</option>
                    <option value="pret">🎉 Prêt</option>
                    {commandeDetail.avecLivraison && (
                      <option value="en_route">🚚 En livraison</option>
                    )}
                    <option value="livre">✅ Livré</option>
                  </select>
                </div>
              </div>

              {/* Informations client */}
              <div className="bg-blue-50 rounded-xl p-4">
                <h3 className="font-bold text-blue-800 mb-3 flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Informations client
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-600">Nom du client</div>
                    <div className="font-semibold text-lg">
                      {commandeDetail.clientNom}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Téléphone</div>
                    <div className="font-semibold text-lg">
                      {commandeDetail.clientTel}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Date d'entrée</div>
                    <div className="font-semibold">
                      {new Date(commandeDetail.dateEntree).toLocaleDateString(
                        'fr-FR'
                      )}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">
                      Date de livraison prévue
                    </div>
                    <div className="font-semibold">
                      {new Date(
                        commandeDetail.dateLivraison
                      ).toLocaleDateString('fr-FR')}
                    </div>
                  </div>
                </div>
              </div>

              {/* Livraison */}
              {commandeDetail.avecLivraison && (
                <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4">
                  <h3 className="font-bold text-green-800 mb-3 flex items-center gap-2">
                    <Truck className="w-5 h-5" />
                    Livraison à domicile
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-gray-600">
                        Adresse de livraison
                      </div>
                      <div className="font-semibold">
                        {commandeDetail.adresseLivraison}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">
                        Frais de livraison
                      </div>
                      <div className="font-semibold text-green-600">
                        {commandeDetail.fraisLivraison.toLocaleString()} FCFA
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Articles */}
              <div>
                <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Articles ({commandeDetail.articles.length})
                </h3>
                <div className="space-y-2">
                  {commandeDetail.articles.map((article, idx) => (
                    <div
                      key={idx}
                      className="bg-white border-2 border-gray-200 rounded-xl p-4"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="font-semibold text-lg mb-2">
                            {article.type}
                          </div>

                          {/* ✅ AFFICHER LA DESCRIPTION */}
                          {article.description && (
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-3">
                              <div className="flex items-start gap-2">
                                <span className="text-lg">📝</span>
                                <div className="flex-1">
                                  <div className="font-semibold text-yellow-800 text-sm mb-1">
                                    Description détaillée :
                                  </div>
                                  <div className="text-sm text-gray-700 whitespace-pre-wrap">
                                    {article.description}
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}

                          <div className="flex items-center gap-2 mt-1">
                            <span
                              className={`text-xs px-2 py-1 rounded-full font-semibold ${
                                article.service === 'Laverie'
                                  ? 'bg-blue-100 text-blue-700'
                                  : article.service === 'Pressing'
                                  ? 'bg-purple-100 text-purple-700'
                                  : 'bg-orange-100 text-orange-700'
                              }`}
                            >
                              {article.service === 'Laverie'
                                ? '💧 Laverie'
                                : article.service === 'Pressing'
                                ? '✨ Pressing'
                                : '🔥 Repassage'}
                            </span>
                            <span className="text-sm text-gray-600">
                              Quantité: {article.quantite}
                            </span>
                            <span className="text-sm text-gray-600">
                              Prix unitaire: {article.prix.toLocaleString()}{' '}
                              FCFA
                            </span>
                          </div>
                        </div>
                        <div className="text-right ml-4">
                          <div className="text-2xl font-bold text-gray-800">
                            {article.total.toLocaleString()} F
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Récapitulatif financier */}
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl p-6">
                <h3 className="font-bold text-xl mb-4">
                  Récapitulatif financier
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm opacity-90">
                    <span>Sous-total</span>
                    <span>
                      {(
                        commandeDetail.sousTotal || commandeDetail.montantTotal
                      ).toLocaleString()}{' '}
                      FCFA
                    </span>
                  </div>

                  {commandeDetail.montantRemise > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="flex items-center gap-2">
                        <svg
                          className="w-4 h-4"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M10 3.5a1.5 1.5 0 013 0V4a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-.5a1.5 1.5 0 000 3h.5a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-.5a1.5 1.5 0 00-3 0v.5a1 1 0 01-1 1H6a1 1 0 01-1-1v-3a1 1 0 00-1-1h-.5a1.5 1.5 0 010-3H4a1 1 0 001-1V6a1 1 0 011-1h3a1 1 0 001-1v-.5z" />
                        </svg>
                        Remise ({commandeDetail.remise}
                        {commandeDetail.typeRemise === 'pourcentage'
                          ? '%'
                          : ' FCFA'}
                        )
                      </span>
                      <span className="font-semibold">
                        - {commandeDetail.montantRemise.toLocaleString()} FCFA
                      </span>
                    </div>
                  )}

                  {commandeDetail.avecLivraison &&
                    commandeDetail.fraisLivraison > 0 && (
                      <div className="flex justify-between text-sm opacity-90">
                        <span className="flex items-center gap-2">
                          <Truck className="w-4 h-4" />
                          Livraison
                        </span>
                        <span>
                          + {commandeDetail.fraisLivraison.toLocaleString()}{' '}
                          FCFA
                        </span>
                      </div>
                    )}

                  <div className="border-t border-white/30 pt-2 mt-2"></div>

                  <div className="flex justify-between items-center text-2xl font-bold">
                    <span>TOTAL</span>
                    <span>
                      {commandeDetail.montantTotal.toLocaleString()} FCFA
                    </span>
                  </div>

                  {commandeDetail.montantRemise > 0 && (
                    <div className="text-center text-sm bg-white/20 rounded-lg py-2 mt-2">
                      🎉 Économie de{' '}
                      {commandeDetail.montantRemise.toLocaleString()} FCFA
                    </div>
                  )}
                </div>
              </div>
              {/* Historique des paiements */}
              {commandeDetail.historiquePaiements &&
                commandeDetail.historiquePaiements.length > 0 && (
                  <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4">
                    <h3 className="font-bold text-green-800 mb-3 flex items-center gap-2">
                      <CreditCard className="w-5 h-5" />
                      Historique des paiements (
                      {commandeDetail.historiquePaiements.length})
                    </h3>
                    <div className="space-y-2">
                      {commandeDetail.historiquePaiements.map(
                        (paiement, idx) => (
                          <div
                            key={idx}
                            className="bg-white rounded-lg p-3 flex justify-between items-center"
                          >
                            <div>
                              <div className="font-semibold text-sm">
                                Paiement #{idx + 1}
                              </div>
                              <div className="text-xs text-gray-600">
                                {new Date(paiement.date).toLocaleDateString(
                                  'fr-FR',
                                  {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  }
                                )}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-xl font-bold text-green-600">
                                {paiement.montant.toLocaleString()} FCFA
                              </div>
                              <div className="text-xs text-gray-500">
                                {paiement.methode}
                              </div>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}

              {/* Actions */}
              <div className="grid md:grid-cols-2 gap-3 pt-4 border-t">
                <button
                  onClick={() => {
                    modifierCommande(commandeDetail);
                    setCommandeDetailId(null); // Fermer le modal de détail
                  }}
                  className="px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition font-medium flex items-center justify-center gap-2"
                >
                  <Edit2 className="w-5 h-5" />
                  Modifier la commande
                </button>
                <button
                  onClick={() => {
                    if (
                      confirm('⚠️ Supprimer cette commande définitivement ?')
                    ) {
                      supprimerCommande(commandeDetail.id);
                      setCommandeDetailId(null);
                    }
                  }}
                  className="px-6 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition font-medium flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-5 h-5" />
                  Supprimer
                </button>
                <button
                  onClick={() => {
                    envoyerNotificationWhatsApp(
                      commandeDetail,
                      commandeDetail.statut
                    );
                  }}
                  className="px-6 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 transition font-medium flex items-center justify-center gap-2"
                >
                  <Bell className="w-5 h-5" />
                  Notifier le client
                </button>
                <button
                  onClick={() => {
                    genererLienPaiement(commandeDetail);
                  }}
                  className="px-6 py-3 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition font-medium flex items-center justify-center gap-2"
                >
                  <CreditCard className="w-5 h-5" />
                  Lien de paiement
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
function TinaManager({ onLogout }) {
  const [activeModule, setActiveModule] = useState('dashboard');
  const [commandes, setCommandes] = useState([]);
  const [clients, setClients] = useState([]);

  const [tarifs, setTarifs] = useState([]);
  const [stocks, setStocks] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [charges, setCharges] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [articlesPersonnalises, setArticlesPersonnalises] = useState([]);
  const [modalType, setModalType] = useState('');
  const [commandeEnModification, setCommandeEnModification] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('tous');
  const [filterDate, setFilterDate] = useState('');

  const [nouvelleCommande, setNouvelleCommande] = useState({
    clientNom: '',
    clientTel: '',
    articles: [],
    dateEntree: new Date().toISOString().split('T')[0],
    dateLivraison: '',
    statut: 'recu',
    montantTotal: 0,
    remise: 0,
    typeRemise: 'pourcentage',
    avecLivraison: false,
    adresseLivraison: '',
    fraisLivraison: 0,
    statutPaiement: 'non_paye', // 'non_paye' | 'paye' | 'avance'
    montantPaye: 0,
    resteAPayer: 0,
  });

  const [nouvelArticle, setNouvelArticle] = useState({
    type: '',
    service: 'Laverie',
    quantite: 1,
    prix: 0,
    isCustom: false,
    description: '',
  });

  useEffect(() => {
    loadData();
    loadArticlesPersonnalises();
  }, []);

  const loadArticlesPersonnalises = async () => {
    try {
      const data = await storage.get('articlesPersonnalises');
      if (data?.value) {
        setArticlesPersonnalises(JSON.parse(data.value));
      }
    } catch (error) {
      console.log('Aucun article personnalisé');
    }
  };

  const saveArticlesPersonnalises = async (articles) => {
    await storage.set('articlesPersonnalises', JSON.stringify(articles));
  };

  const loadData = async () => {
    try {
      const [cmdData, clientData, tarifData, stockData, transData, chargeData] =
        await Promise.all([
          storage.get('commandes'),
          storage.get('clients'),
          storage.get('tarifs'),
          storage.get('stocks'),
          storage.get('transactions'),
          storage.get('charges'),
          storage.get('clients'),
        ]);

      if (cmdData?.value) setCommandes(JSON.parse(cmdData.value));
      if (clientData?.value) setClients(JSON.parse(clientData.value));
      if (tarifData?.value) setTarifs(JSON.parse(tarifData.value));
      if (stockData?.value) setStocks(JSON.parse(stockData.value));
      if (transData?.value) setTransactions(JSON.parse(transData.value));
      if (chargeData?.value) setCharges(JSON.parse(chargeData.value));
      if (clientData?.value) setClients(JSON.parse(clientData.value));
    } catch (error) {
      console.log('Première utilisation');
    }
  };

  const saveData = async (key, data) => {
    await storage.set(key, JSON.stringify(data));
  };

  const calculerStatistiques = () => {
    const recetteTotal = transactions
      .filter((t) => t.type === 'recette')
      .reduce((sum, t) => sum + t.montant, 0);
    const chargesTotal = charges.reduce((sum, c) => sum + c.montant, 0);
    const benefice = recetteTotal - chargesTotal;
    const commandesEnCours = commandes.filter(
      (c) => c.statut !== 'livre'
    ).length;
    const commandesPrete = commandes.filter((c) => c.statut === 'pret').length;

    return {
      recetteTotal,
      chargesTotal,
      benefice,
      commandesEnCours,
      commandesPrete,
      totalCommandes: commandes.length,
    };
  };

  const stats = calculerStatistiques();

  const getNiveauFidelite = (nombreCommandes) => {
    if (nombreCommandes >= 20)
      return {
        niveau: 'VIP',
        remise: 15,
        couleur: 'from-purple-500 to-purple-600',
        icone: '👑',
      };
    if (nombreCommandes >= 10)
      return {
        niveau: 'Or',
        remise: 10,
        couleur: 'from-yellow-500 to-yellow-600',
        icone: '⭐',
      };
    if (nombreCommandes >= 5)
      return {
        niveau: 'Argent',
        remise: 5,
        couleur: 'from-gray-400 to-gray-500',
        icone: '🥈',
      };
    return {
      niveau: 'Standard',
      remise: 0,
      couleur: 'from-blue-400 to-blue-500',
      icone: '💙',
    };
  };

  const getClientStats = (clientTel) => {
    const commandesClient = commandes.filter((c) => c.clientTel === clientTel);
    return { nombreCommandes: commandesClient.length };
  };
  const supprimerCommande = async (commandeId) => {
    if (
      !confirm(
        '⚠️ ATTENTION : Supprimer définitivement cette commande ?\n\nCette action est irréversible !'
      )
    ) {
      return;
    }

    const newCommandes = commandes.filter((c) => c.id !== commandeId);
    setCommandes(newCommandes);
    await saveData('commandes', newCommandes);

    showToast('🗑️ Commande supprimée', 'success');
  };

  const modifierCommande = (commande) => {
    // Pré-remplir le formulaire avec les données de la commande
    setNouvelleCommande({
      clientNom: commande.clientNom,
      clientTel: commande.clientTel,
      articles: commande.articles,
      dateEntree: commande.dateEntree,
      dateLivraison: commande.dateLivraison,
      statut: commande.statut,
      montantTotal: commande.montantTotal,
      sousTotal: commande.sousTotal || commande.montantTotal,
      montantRemise: commande.montantRemise || 0,
      remise: commande.remise || 0,
      typeRemise: commande.typeRemise || 'pourcentage',
      avecLivraison: commande.avecLivraison || false,
      adresseLivraison: commande.adresseLivraison || '',
      fraisLivraison: commande.fraisLivraison || 0,
      statutPaiement: commande.statutPaiement || 'non_paye',
      montantPaye: commande.montantPaye || 0,
      resteAPayer: commande.resteAPayer || 0,
    });

    setCommandeEnModification(commande);
    setModalType('modifier-commande');
    setShowModal(true);
  };
  const ajouterCommande = async () => {
    if (
      !nouvelleCommande.clientNom ||
      !nouvelleCommande.clientTel ||
      nouvelleCommande.articles.length === 0
    ) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    let commande;
    let newCommandes;

    // ✅ MODIFICATION : Si on modifie une commande existante
    if (commandeEnModification) {
      commande = {
        ...commandeEnModification,
        ...nouvelleCommande,
        // Garder l'ID et la date de création originale
        id: commandeEnModification.id,
        createdAt: commandeEnModification.createdAt,
        updatedAt: new Date().toISOString(),
      };

      newCommandes = commandes.map((c) =>
        c.id === commandeEnModification.id ? commande : c
      );

      showToast('✅ Commande modifiée avec succès', 'success');
    } else {
      // ✅ CRÉATION : Nouvelle commande
      commande = {
        id: Date.now().toString(),
        ...nouvelleCommande,
        createdAt: new Date().toISOString(),
      };

      newCommandes = [...commandes, commande];
    }
    setCommandes(newCommandes);
    await saveData('commandes', newCommandes);

    const clientExistant = clients.find(
      (c) => c.telephone === nouvelleCommande.clientTel
    );
    if (!clientExistant) {
      const nouveauClient = {
        id: Date.now().toString(),
        nom: nouvelleCommande.clientNom,
        telephone: nouvelleCommande.clientTel,
        dateInscription: new Date().toISOString(),
      };
      const newClients = [...clients, nouveauClient];
      setClients(newClients);
      await saveData('clients', newClients);
    }

    // ✅ CORRECTION : Créer une transaction UNIQUEMENT si un paiement a été effectué
    let newTransactions = transactions;

    if (nouvelleCommande.montantPaye > 0) {
      const transaction = {
        id: Date.now().toString(),
        type: 'recette',
        description: `Paiement commande #${commande.id} - ${
          nouvelleCommande.clientNom
        }${
          nouvelleCommande.statutPaiement === 'avance'
            ? ` (Avance ${nouvelleCommande.montantPaye.toLocaleString()} FCFA)`
            : ' (Paiement complet)'
        }`,
        montant: nouvelleCommande.montantPaye, // ✅ UNIQUEMENT le montant payé !
        date: new Date().toISOString(),
        commandeId: commande.id, // ✅ Lien avec la commande
      };

      newTransactions = [...transactions, transaction];
      setTransactions(newTransactions);
      await saveData('transactions', newTransactions);
    }

    setNouvelleCommande({
      clientNom: '',
      clientTel: '',
      articles: [],
      dateEntree: new Date().toISOString().split('T')[0],
      dateLivraison: '',
      statut: 'recu',
      montantTotal: 0,
      remise: 0,
      typeRemise: 'pourcentage',
      avecLivraison: false,
      adresseLivraison: '',
      fraisLivraison: 0,
      statutPaiement: 'non_paye',
      montantPaye: 0,
      resteAPayer: 0,
    });

    setShowModal(false);
    setCommandeEnModification(null); // ✅ Réinitialiser
    setTimeout(() => {
      envoyerNotificationWhatsApp(commande, 'nouvelle');
    }, 500);
  };
  const creerArticlePersonnalise = async (
    nomArticle,
    prixLaverie,
    prixPressing
  ) => {
    // Vérifier si l'article existe déjà
    const articleExiste = [...ARTICLES_PRESSING, ...articlesPersonnalises].find(
      (a) => a.nom.toLowerCase() === nomArticle.toLowerCase()
    );

    if (articleExiste) {
      alert('❌ Cet article existe déjà !');
      return false;
    }

    const nouvelArticle = {
      nom: nomArticle,
      prixLaverie: prixLaverie,
      prixPressing: prixPressing,
      isPersonnalise: true,
      createdAt: new Date().toISOString(),
    };

    const newArticles = [...articlesPersonnalises, nouvelArticle];
    setArticlesPersonnalises(newArticles);
    await saveArticlesPersonnalises(newArticles);

    showToast(`✅ Article "${nomArticle}" créé avec succès !`, 'success');
    return true;
  };
  const ajouterArticleCommande = () => {
    if (!nouvelArticle.type || nouvelArticle.prix === 0) {
      alert("Veuillez remplir tous les champs de l'article");
      return;
    }

    const article = {
      ...nouvelArticle,
      total: nouvelArticle.prix * nouvelArticle.quantite,
    };

    const nouveauxArticles = [...nouvelleCommande.articles, article];
    const sousTotal = nouveauxArticles.reduce((sum, art) => sum + art.total, 0);

    let montantRemise = 0;
    if (nouvelleCommande.typeRemise === 'pourcentage') {
      montantRemise = (sousTotal * nouvelleCommande.remise) / 100;
    } else {
      montantRemise = nouvelleCommande.remise;
    }

    const totalApresRemise = sousTotal - montantRemise;
    const montantFinal =
      totalApresRemise +
      (nouvelleCommande.avecLivraison ? nouvelleCommande.fraisLivraison : 0);

    setNouvelleCommande({
      ...nouvelleCommande,
      articles: nouveauxArticles,
      sousTotal: sousTotal,
      montantRemise: montantRemise,
      montantTotal: montantFinal,
    });

    // Réinitialiser avec le service actuel
    const serviceActuel = nouvelArticle.service;
    const prixDefaut = serviceActuel === 'Repassage' ? 200 : 0;

    setNouvelArticle({
      type: '',
      service: serviceActuel,
      quantite: 1,
      prix: prixDefaut,
      isCustom: false,
      description: '',
    });
  };

  const mettreAJourStatut = async (commandeId, nouveauStatut) => {
    const updatedCommandes = commandes.map((cmd) =>
      cmd.id === commandeId ? { ...cmd, statut: nouveauStatut } : cmd
    );
    setCommandes(updatedCommandes);
    await saveData('commandes', updatedCommandes);

    const commande = updatedCommandes.find((c) => c.id === commandeId);
    if (
      commande &&
      (nouveauStatut === 'pret' ||
        nouveauStatut === 'livre' ||
        nouveauStatut === 'en_route')
    ) {
      setTimeout(() => {
        envoyerNotificationWhatsApp(commande, nouveauStatut);
      }, 300);
    }
  };

  const showToast = (message, type = 'info') => {
    const toast = document.createElement('div');
    toast.className = `fixed bottom-4 right-4 px-6 py-3 rounded-xl shadow-lg z-50 animate-slide-in ${
      type === 'success'
        ? 'bg-green-500'
        : type === 'error'
        ? 'bg-red-500'
        : 'bg-blue-500'
    } text-white font-medium`;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.3s';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  };

  const envoyerNotificationWhatsApp = (commande, etape) => {
    // ✅ NOUVEAU : Utiliser les infos du pressing
    const infoPressing = pressingConfig
      ? `
📍 ${pressingConfig.adresse}
📞 ${pressingConfig.telephone}
🕐 ${pressingConfig.horaires}`
      : '';

    const signature = pressingConfig?.signature
      ? `

${pressingConfig.signature}`
      : '';

    const nomPressing = pressingConfig?.nomPressing || 'Tina';

    const messages = {
      nouvelle: `🧺 ${nomPressing.toUpperCase()} - Mon e-pressing
Commande reçue ✅

Bonjour ${commande.clientNom},

Votre commande a été enregistrée avec succès !

📦 Détails :
- ${commande.articles.length} article(s)
- Sous-total : ${(
        commande.sousTotal || commande.montantTotal
      ).toLocaleString()} FCFA${
        commande.montantRemise > 0
          ? `
- Remise fidélité : -${commande.montantRemise.toLocaleString()} FCFA 🎉`
          : ''
      }${
        commande.avecLivraison
          ? `
- Livraison : +${commande.fraisLivraison.toLocaleString()} FCFA 🚚`
          : ''
      }
- TOTAL : ${commande.montantTotal.toLocaleString()} FCFA
- Date de livraison : ${new Date(commande.dateLivraison).toLocaleDateString(
        'fr-FR',
        {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
        }
      )}${
        commande.avecLivraison
          ? `

📍 Livraison à : ${commande.adresseLivraison}
(Vous serez notifié quand le livreur sera en route)`
          : ''
      }

Merci pour votre confiance ! 🙏
${infoPressing}${signature}

_${nomPressing} - Mon e-pressing_`,

      pret: `✅ ${nomPressing.toUpperCase()} - Mon e-pressing
Linge prêt ! 🎉

Bonjour ${commande.clientNom},

📣 Bonne nouvelle ! Votre linge est prêt !

${
  commande.avecLivraison
    ? `🚚 LIVRAISON À DOMICILE

Notre livreur sera chez vous bientôt !
📍 Adresse : ${commande.adresseLivraison}

💡 Vous recevrez une notification quand il sera en route.`
    : `Vous pouvez venir le récupérer dès maintenant.
${infoPressing}`
}

💰 Montant à régler : ${commande.montantTotal.toLocaleString()} FCFA${
        commande.montantRemise > 0
          ? `
(Remise fidélité appliquée : -${commande.montantRemise.toLocaleString()} FCFA 🎁)`
          : ''
      }

À tout de suite ! 😊${signature}

_${nomPressing} - Mon e-pressing_`,

      en_route: `🚚 ${nomPressing.toUpperCase()} - Mon e-pressing
Livreur en route !

Bonjour ${commande.clientNom},

Notre livreur est en route vers chez vous ! 🚗💨

📍 Adresse de livraison :
${commande.adresseLivraison}

⏱️ Arrivée estimée : 15-20 minutes

Merci d'être disponible ! 🙏
${infoPressing}${signature}

_${nomPressing} - Mon e-pressing_`,

      livre: commande.avecLivraison
        ? `✅ ${nomPressing.toUpperCase()} - Mon e-pressing
Livraison terminée !

Bonjour ${commande.clientNom},

Votre linge a été livré avec succès ! 📦✅

Nous espérons que tout est à votre satisfaction.

💰 Montant réglé : ${commande.montantTotal.toLocaleString()} FCFA

Merci pour votre confiance ! 💙

👉 Programme de fidélité :
Après 5 commandes → 5% de réduction
Après 10 commandes → 10% de réduction
Après 20 commandes → 15% de réduction

À bientôt ! ✨
${infoPressing}${signature}

_${nomPressing} - Mon e-pressing_`
        : `🙏 ${nomPressing.toUpperCase()} - Mon e-pressing
Merci !

Bonjour ${commande.clientNom},

Merci infiniment pour votre confiance ! 💙

À bientôt ! ✨
${infoPressing}${signature}

_${nomPressing} - Mon e-pressing_`,
    };

    const message = messages[etape] || messages['nouvelle'];

    let telephone = commande.clientTel.replace(/[\s\-\(\)]/g, '');
    if (!telephone.startsWith('+')) {
      if (!telephone.startsWith('225')) {
        telephone = '225' + telephone;
      }
      telephone = '+' + telephone;
    }

    const messageEncode = encodeURIComponent(message);
    const lienWhatsApp = `https://wa.me/${telephone.replace(
      '+',
      ''
    )}?text=${messageEncode}`;

    window.open(lienWhatsApp, '_blank');
    showToast(`📱 WhatsApp ouvert pour ${commande.clientNom}`, 'success');
  };

  const genererLienPaiement = (commande) => {
    const nomPressing = pressingConfig?.nomPressing || 'Tina';
    const infoPressing = pressingConfig
      ? `

📍 ${pressingConfig.adresse}
📞 ${pressingConfig.telephone}`
      : '';

    const lien = `https://paiement.tina-epressing.com/pay/${commande.id}?amount=${commande.montantTotal}`;

    const messagePayment = `💳 ${nomPressing.toUpperCase()} - Mon e-pressing
Paiement en ligne

Bonjour ${commande.clientNom},

Voici votre lien de paiement sécurisé :

${lien}

💰 Montant : ${commande.montantTotal.toLocaleString()} FCFA
${infoPressing}

Merci ! 🙏`;

    let telephone = commande.clientTel.replace(/[\s\-\(\)]/g, '');
    if (!telephone.startsWith('+')) {
      if (!telephone.startsWith('225')) {
        telephone = '225' + telephone;
      }
      telephone = '+' + telephone;
    }

    const messageEncode = encodeURIComponent(messagePayment);
    const lienWhatsApp = `https://wa.me/${telephone.replace(
      '+',
      ''
    )}?text=${messageEncode}`;

    navigator.clipboard?.writeText(lien);

    if (
      confirm(
        `💳 Envoyer le lien de paiement à ${commande.clientNom} via WhatsApp ?`
      )
    ) {
      window.open(lienWhatsApp, '_blank');
      showToast(`✅ Lien de paiement envoyé`, 'success');
    } else {
      showToast(`📋 Lien copié`, 'info');
    }
  };

  const Dashboard = () => {
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    const getDataForMonth = (month, year) => {
      const filterByMonth = (items) =>
        items.filter((item) => {
          const date = new Date(item.createdAt || item.date);
          return date.getMonth() === month && date.getFullYear() === year;
        });

      const commandesMois = filterByMonth(commandes);
      const chargesMois = filterByMonth(charges);

      // ✅ NOUVEAU CALCUL
      const entreesMois = commandesMois.reduce(
        (sum, c) => sum + c.montantTotal,
        0
      );
      const caEncaisse = commandesMois.reduce(
        (sum, c) => sum + (c.montantPaye || 0),
        0
      );
      const resteAEncaisser = entreesMois - caEncaisse;
      const chargesMoisTotal = chargesMois.reduce(
        (sum, c) => sum + c.montant,
        0
      );
      const beneficeMois = caEncaisse - chargesMoisTotal;

      return {
        commandes: commandesMois.length,
        entrees: entreesMois,
        caEncaisse: caEncaisse,
        resteAEncaisser: resteAEncaisser,
        charges: chargesMoisTotal,
        benefice: beneficeMois,
      };
    };

    const currentMonthData = getDataForMonth(selectedMonth, selectedYear);
    const mois = [
      'Janvier',
      'Février',
      'Mars',
      'Avril',
      'Mai',
      'Juin',
      'Juillet',
      'Août',
      'Septembre',
      'Octobre',
      'Novembre',
      'Décembre',
    ];

    return (
      <div className="space-y-6">
        <div className="bg-white rounded-2xl p-4 shadow-lg flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Calendar className="w-6 h-6 text-blue-600" />
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              className="px-4 py-2 border-2 border-blue-200 rounded-xl font-semibold text-lg focus:ring-2 focus:ring-blue-500 outline-none"
            >
              {mois.map((m, idx) => (
                <option key={idx} value={idx}>
                  {m} {selectedYear}
                </option>
              ))}
            </select>
          </div>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="px-4 py-2 border-2 border-gray-200 rounded-xl font-semibold focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value={2025}>2025</option>
            <option value={2026}>2026</option>
          </select>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-white shadow-lg">
            <DollarSign className="w-6 h-6 sm:w-8 sm:h-8 opacity-80 mb-2 sm:mb-3" />
            <div className="text-xl sm:text-2xl md:text-3xl font-bold mb-1">
              {currentMonthData.entrees.toLocaleString()} F
            </div>
            <div className="text-xs sm:text-sm opacity-90">
              📥 Entrées du mois
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-white shadow-lg">
            <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 opacity-80 mb-2 sm:mb-3" />
            <div className="text-xl sm:text-2xl md:text-3xl font-bold mb-1">
              {currentMonthData.caEncaisse.toLocaleString()} F
            </div>
            <div className="text-xs sm:text-sm opacity-90">💰 CA Encaissé</div>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-white shadow-lg">
            <Clock className="w-6 h-6 sm:w-8 sm:h-8 opacity-80 mb-2 sm:mb-3" />
            <div className="text-xl sm:text-2xl md:text-3xl font-bold mb-1">
              {currentMonthData.resteAEncaisser.toLocaleString()} F
            </div>
            <div className="text-xs sm:text-sm opacity-90">
              ⏳ Reste à encaisser
            </div>
          </div>

          <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-white shadow-lg">
            <TrendingDown className="w-6 h-6 sm:w-8 sm:h-8 opacity-80 mb-2 sm:mb-3" />
            <div className="text-xl sm:text-2xl md:text-3xl font-bold mb-1">
              {currentMonthData.charges.toLocaleString()} F
            </div>
            <div className="text-xs sm:text-sm opacity-90">Charges du mois</div>
          </div>
        </div>

        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <div className="font-semibold text-blue-800">Vue mensuelle</div>
              <div className="text-sm text-blue-700">
                Vous consultez les données de{' '}
                <strong>
                  {mois[selectedMonth]} {selectedYear}
                </strong>
                .
                <br />
                <span className="text-xs">
                  Entrées = Total commandes | CA = Paiements reçus | Reste = Non
                  encaissé
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const ModuleClients = () => {
    const [searchClient, setSearchClient] = useState('');
    const [filterStatut, setFilterStatut] = useState('tous');
    const [clientDetailId, setClientDetailId] = useState(null);
    const [showModalIncident, setShowModalIncident] = useState(false);
    const [clientIncidentId, setClientIncidentId] = useState(null);
    const [nouvelIncident, setNouvelIncident] = useState({
      type: 'incident',
      description: '',
      date: new Date().toISOString().split('T')[0],
    });

    // Calculer les statistiques complètes d'un client
    const getClientDetailedStats = (clientTel) => {
      const commandesClient = commandes.filter(
        (c) => c.clientTel === clientTel
      );
      const commandesTerminees = commandesClient.filter(
        (c) => c.statut === 'livre'
      );
      const commandesEnCours = commandesClient.filter(
        (c) => c.statut !== 'livre'
      );
      const commandesPrete = commandesClient.filter((c) => c.statut === 'pret');

      const totalDepense = commandesTerminees.reduce(
        (sum, c) => sum + c.montantTotal,
        0
      );
      const montantEnCours = commandesEnCours.reduce(
        (sum, c) => sum + c.montantTotal,
        0
      );

      const derniereCommande =
        commandesClient.length > 0
          ? commandesClient.sort(
              (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
            )[0]
          : null;

      const fidelite = getNiveauFidelite(commandesTerminees.length);

      // Récupérer les incidents/notes du client
      const clientData = clients.find((c) => c.telephone === clientTel);
      const incidents = clientData?.incidents || [];
      const notes = clientData?.notes || '';
      const estMecontent = clientData?.estMecontent || false;

      return {
        nombreCommandes: commandesClient.length,
        commandesTerminees: commandesTerminees.length,
        commandesEnCours: commandesEnCours.length,
        commandesPrete: commandesPrete.length,
        totalDepense,
        montantEnCours,
        derniereCommande,
        fidelite,
        commandesClient,
        incidents,
        notes,
        estMecontent,
      };
    };

    // Ajouter un incident
    const ajouterIncident = async () => {
      if (!nouvelIncident.description) {
        alert("Veuillez décrire l'incident");
        return;
      }

      const clientIndex = clients.findIndex((c) => c.id === clientIncidentId);
      if (clientIndex === -1) return;

      const clientUpdate = { ...clients[clientIndex] };
      if (!clientUpdate.incidents) clientUpdate.incidents = [];

      clientUpdate.incidents.push({
        id: Date.now().toString(),
        ...nouvelIncident,
        createdAt: new Date().toISOString(),
      });

      const newClients = [...clients];
      newClients[clientIndex] = clientUpdate;
      setClients(newClients);
      await saveData('clients', newClients);

      setShowModalIncident(false);
      setNouvelIncident({
        type: 'incident',
        description: '',
        date: new Date().toISOString().split('T')[0],
      });
    };

    // Marquer client comme mécontent/content
    const toggleMecontent = async (clientId) => {
      const clientIndex = clients.findIndex((c) => c.id === clientId);
      if (clientIndex === -1) return;

      const newClients = [...clients];
      newClients[clientIndex].estMecontent =
        !newClients[clientIndex].estMecontent;
      setClients(newClients);
      await saveData('clients', newClients);
    };

    const clientsFiltres = clients.filter((client) => {
      const stats = getClientDetailedStats(client.telephone);
      const matchSearch =
        client.nom.toLowerCase().includes(searchClient.toLowerCase()) ||
        client.telephone.includes(searchClient);

      if (filterStatut === 'tous') return matchSearch;
      if (filterStatut === 'vip')
        return matchSearch && stats.fidelite.niveau === 'VIP';
      if (filterStatut === 'or')
        return matchSearch && stats.fidelite.niveau === 'Or';
      if (filterStatut === 'argent')
        return matchSearch && stats.fidelite.niveau === 'Argent';
      if (filterStatut === 'mecontent')
        return matchSearch && client.estMecontent;

      return matchSearch;
    });

    const clientDetail = clientDetailId
      ? clients.find((c) => c.id === clientDetailId)
      : null;
    const statsDetail = clientDetail
      ? getClientDetailedStats(clientDetail.telephone)
      : null;

    return (
      <div className="space-y-6">
        {/* Barre de recherche et filtres */}
        <div className="bg-white rounded-2xl p-4 shadow-lg">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="Rechercher un client..."
                value={searchClient}
                onChange={(e) => setSearchClient(e.target.value)}
                className="px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500"
              />
              <select
                value={filterStatut}
                onChange={(e) => setFilterStatut(e.target.value)}
                className="px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500"
              >
                <option value="tous">Tous les clients</option>
                <option value="vip">👑 VIP</option>
                <option value="or">⭐ Or</option>
                <option value="argent">🥈 Argent</option>
                <option value="mecontent">😠 Mécontents</option>
              </select>
            </div>
            <div className="text-sm text-gray-600 font-medium">
              {clientsFiltres.length} client
              {clientsFiltres.length > 1 ? 's' : ''}
            </div>
          </div>
        </div>

        {/* Liste des clients */}
        <div className="grid gap-4">
          {clientsFiltres.map((client) => {
            const stats = getClientDetailedStats(client.telephone);

            return (
              <div
                key={client.id}
                className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold">{client.nom}</h3>

                      {/* Badge fidélité */}
                      <span
                        className={`bg-gradient-to-r ${stats.fidelite.couleur} text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1`}
                      >
                        {stats.fidelite.icone} {stats.fidelite.niveau}
                      </span>

                      {/* Badge mécontent */}
                      {client.estMecontent && (
                        <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                          😠 Mécontent
                        </span>
                      )}

                      {/* Badge incidents */}
                      {stats.incidents.length > 0 && (
                        <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                          ⚠️ {stats.incidents.length} incident
                          {stats.incidents.length > 1 ? 's' : ''}
                        </span>
                      )}
                    </div>

                    <div className="text-gray-600 text-sm mb-3">
                      📱 {client.telephone}
                    </div>

                    {/* Statistiques rapides */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                      <div className="bg-blue-50 rounded-lg p-3">
                        <div className="text-xs text-gray-600">
                          Total commandes
                        </div>
                        <div className="text-lg font-bold text-blue-600">
                          {stats.nombreCommandes}
                        </div>
                      </div>
                      <div className="bg-green-50 rounded-lg p-3">
                        <div className="text-xs text-gray-600">
                          Dépenses totales
                        </div>
                        <div className="text-lg font-bold text-green-600">
                          {stats.totalDepense.toLocaleString()} F
                        </div>
                      </div>
                      <div className="bg-orange-50 rounded-lg p-3">
                        <div className="text-xs text-gray-600">En cours</div>
                        <div className="text-lg font-bold text-orange-600">
                          {stats.commandesEnCours}
                        </div>
                      </div>
                      <div className="bg-purple-50 rounded-lg p-3">
                        <div className="text-xs text-gray-600">Remise</div>
                        <div className="text-lg font-bold text-purple-600">
                          {stats.fidelite.remise}%
                        </div>
                      </div>
                    </div>

                    {/* Dernière commande */}
                    {stats.derniereCommande && (
                      <div className="text-sm text-gray-500">
                        Dernière commande :{' '}
                        {new Date(
                          stats.derniereCommande.createdAt
                        ).toLocaleDateString('fr-FR')}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 ml-4">
                    <button
                      onClick={() => setClientDetailId(client.id)}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm flex items-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      Détails
                    </button>
                    <button
                      onClick={() => toggleMecontent(client.id)}
                      className={`px-4 py-2 rounded-lg text-sm flex items-center gap-2 ${
                        client.estMecontent
                          ? 'bg-green-500 text-white hover:bg-green-600'
                          : 'bg-red-100 text-red-700 hover:bg-red-200'
                      }`}
                    >
                      {client.estMecontent ? '😊 Satisfait' : '😠 Mécontent'}
                    </button>
                    <button
                      onClick={() => {
                        setClientIncidentId(client.id);
                        setShowModalIncident(true);
                      }}
                      className="px-4 py-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 text-sm flex items-center gap-2"
                    >
                      ⚠️ Incident
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {clientsFiltres.length === 0 && (
            <div className="text-center py-12 bg-white rounded-2xl shadow-lg">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <div className="text-gray-500">Aucun client trouvé</div>
            </div>
          )}
        </div>

        {/* Modal Détails Client */}
        {clientDetail && statsDetail && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold">{clientDetail.nom}</h2>
                  <div className="text-gray-600">{clientDetail.telephone}</div>
                </div>
                <button
                  onClick={() => setClientDetailId(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Badges statut */}
                <div className="flex flex-wrap gap-2">
                  <span
                    className={`bg-gradient-to-r ${statsDetail.fidelite.couleur} text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2`}
                  >
                    {statsDetail.fidelite.icone} Client{' '}
                    {statsDetail.fidelite.niveau}
                  </span>
                  <span className="bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-semibold">
                    Remise automatique : {statsDetail.fidelite.remise}%
                  </span>
                  {clientDetail.estMecontent && (
                    <span className="bg-red-100 text-red-700 px-4 py-2 rounded-full text-sm font-semibold">
                      😠 Client mécontent
                    </span>
                  )}
                </div>

                {/* Statistiques détaillées */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-blue-50 rounded-xl p-4">
                    <div className="text-sm text-gray-600 mb-1">
                      Commandes totales
                    </div>
                    <div className="text-3xl font-bold text-blue-600">
                      {statsDetail.nombreCommandes}
                    </div>
                  </div>
                  <div className="bg-green-50 rounded-xl p-4">
                    <div className="text-sm text-gray-600 mb-1">
                      Dépenses totales
                    </div>
                    <div className="text-2xl font-bold text-green-600">
                      {statsDetail.totalDepense.toLocaleString()} F
                    </div>
                  </div>
                  <div className="bg-orange-50 rounded-xl p-4">
                    <div className="text-sm text-gray-600 mb-1">En cours</div>
                    <div className="text-3xl font-bold text-orange-600">
                      {statsDetail.commandesEnCours}
                    </div>
                    <div className="text-xs text-gray-500">
                      {statsDetail.montantEnCours.toLocaleString()} F
                    </div>
                  </div>
                  <div className="bg-purple-50 rounded-xl p-4">
                    <div className="text-sm text-gray-600 mb-1">Prêtes</div>
                    <div className="text-3xl font-bold text-purple-600">
                      {statsDetail.commandesPrete}
                    </div>
                  </div>
                </div>

                {/* Incidents */}
                {statsDetail.incidents.length > 0 && (
                  <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-4">
                    <h3 className="font-bold text-orange-800 mb-3 flex items-center gap-2">
                      ⚠️ Incidents signalés ({statsDetail.incidents.length})
                    </h3>
                    <div className="space-y-2">
                      {statsDetail.incidents.map((incident) => (
                        <div
                          key={incident.id}
                          className="bg-white rounded-lg p-3"
                        >
                          <div className="flex justify-between items-start mb-1">
                            <span
                              className={`text-xs px-2 py-1 rounded ${
                                incident.type === 'incident'
                                  ? 'bg-red-100 text-red-700'
                                  : 'bg-yellow-100 text-yellow-700'
                              }`}
                            >
                              {incident.type === 'incident'
                                ? '⚠️ Incident'
                                : '📝 Note'}
                            </span>
                            <span className="text-xs text-gray-500">
                              {new Date(incident.createdAt).toLocaleDateString(
                                'fr-FR'
                              )}
                            </span>
                          </div>
                          <div className="text-sm text-gray-700">
                            {incident.description}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Historique des commandes */}
                <div>
                  <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                    📋 Historique des commandes
                  </h3>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {statsDetail.commandesClient
                      .sort(
                        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
                      )
                      .map((cmd) => (
                        <div
                          key={cmd.id}
                          className={`border-l-4 rounded-lg p-4 ${
                            cmd.statut === 'livre'
                              ? 'bg-green-50 border-green-500'
                              : cmd.statut === 'pret'
                              ? 'bg-blue-50 border-blue-500'
                              : cmd.statut === 'en_cours'
                              ? 'bg-orange-50 border-orange-500'
                              : 'bg-gray-50 border-gray-500'
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="font-semibold">
                                Commande #{cmd.id}
                              </div>
                              <div className="text-sm text-gray-600">
                                {new Date(cmd.createdAt).toLocaleDateString(
                                  'fr-FR',
                                  {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                  }
                                )}
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                {cmd.articles.length} article
                                {cmd.articles.length > 1 ? 's' : ''}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-xl font-bold">
                                {cmd.montantTotal.toLocaleString()} F
                              </div>
                              <span
                                className={`text-xs px-2 py-1 rounded-full ${
                                  cmd.statut === 'livre'
                                    ? 'bg-green-100 text-green-700'
                                    : cmd.statut === 'pret'
                                    ? 'bg-blue-100 text-blue-700'
                                    : cmd.statut === 'en_cours'
                                    ? 'bg-orange-100 text-orange-700'
                                    : 'bg-gray-100 text-gray-700'
                                }`}
                              >
                                {cmd.statut === 'livre'
                                  ? '✅ Livré'
                                  : cmd.statut === 'pret'
                                  ? '🎉 Prêt'
                                  : cmd.statut === 'en_cours'
                                  ? '⚙️ En cours'
                                  : '📦 Reçu'}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal Incident */}
        {showModalIncident && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
              <div className="border-b px-6 py-4 flex justify-between items-center">
                <h2 className="text-xl font-bold">⚠️ Signaler un incident</h2>
                <button
                  onClick={() => setShowModalIncident(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type
                  </label>
                  <select
                    value={nouvelIncident.type}
                    onChange={(e) =>
                      setNouvelIncident({
                        ...nouvelIncident,
                        type: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="incident">⚠️ Incident</option>
                    <option value="note">📝 Note importante</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={nouvelIncident.description}
                    onChange={(e) =>
                      setNouvelIncident({
                        ...nouvelIncident,
                        description: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-orange-500"
                    rows="4"
                    placeholder="Décrivez l'incident ou la note..."
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowModalIncident(false)}
                    className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-xl hover:bg-gray-50 transition font-medium"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={ajouterIncident}
                    className="flex-1 bg-orange-500 text-white px-6 py-3 rounded-xl hover:bg-orange-600 transition font-medium"
                  >
                    Enregistrer
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };
  const ModuleTarifs = ({
    articlesPersonnalises,
    setArticlesPersonnalises,
    saveArticlesPersonnalises,
  }) => {
    const [searchTarif, setSearchTarif] = useState('');
    const [filterCategorie, setFilterCategorie] = useState('tous');
    const [showModalEditTarif, setShowModalEditTarif] = useState(false);
    const [tarifEnEdition, setTarifEnEdition] = useState(null);
    const [tarifsPersonnalises, setTarifsPersonnalises] = useState([]);

    // Charger les tarifs personnalisés
    useEffect(() => {
      loadTarifsPersonnalises();
    }, []);

    const loadTarifsPersonnalises = async () => {
      try {
        const data = await storage.get('tarifsPersonnalises');
        if (data?.value) {
          setTarifsPersonnalises(JSON.parse(data.value));
        }
      } catch (error) {
        console.log('Aucun tarif personnalisé');
      }
    };

    const saveTarifsPersonnalises = async (tarifs) => {
      await storage.set('tarifsPersonnalises', JSON.stringify(tarifs));
    };

    // Catégories pour le filtrage
    const categories = {
      hauts: [
        'Débardeur',
        'Tee Shirt',
        'Chemise',
        'Blazer',
        'Pull',
        'Polo',
        'Boubou',
        'Sweatshirt',
        'Blouse',
        'Tunique',
        'Haut',
      ],
      bas: [
        'Jupe',
        'Short',
        'Culotte',
        'Bermuda',
        'Caleçon',
        'Pantalon',
        'Jogging',
      ],
      robes: ['Robe', 'Pyjama'],
      ensembles: [
        'Survêtement',
        'Boubou',
        'Tailleur',
        'Costume',
        'Ensemble',
        'Kimono',
        'Soutane',
      ],
      linge_maison: [
        'Nappe',
        'Serviette',
        'Tissu',
        'Drap',
        'Taie',
        'Housse',
        'Couette',
        'Rideau',
      ],
      services: ['Repassage', 'Amidonnage', 'Teinture', 'Livraison'],
    };

    const getCategorieArticle = (nomArticle) => {
      for (const [categorie, mots] of Object.entries(categories)) {
        if (mots.some((mot) => nomArticle.includes(mot))) {
          return categorie;
        }
      }
      return 'autres';
    };

    // Fusionner tarifs de base, personnalisés ET articles personnalisés
    const getTarifsActuels = () => {
      const tarifsBase = ARTICLES_PRESSING.map((article) => ({
        ...article,
        id: article.nom,
        isPersonnalise: false,
      }));

      // Ajouter les articles personnalisés créés
      const articlesPerso = articlesPersonnalises.map((article) => ({
        ...article,
        id: article.nom,
        isPersonnalise: true,
        isArticleCustom: true, // Pour différencier
      }));

      // Remplacer par les tarifs personnalisés si ils existent
      const tarifsFinaux = tarifsBase.map((tarif) => {
        const perso = tarifsPersonnalises.find((tp) => tp.nom === tarif.nom);
        return perso || tarif;
      });

      // Ajouter les articles personnalisés à la fin
      return [...tarifsFinaux, ...articlesPerso];
    };

    const tarifsFiltres = getTarifsActuels().filter((tarif) => {
      const matchSearch = tarif.nom
        .toLowerCase()
        .includes(searchTarif.toLowerCase());
      const categorie = getCategorieArticle(tarif.nom);
      const matchCategorie =
        filterCategorie === 'tous' || categorie === filterCategorie;
      return matchSearch && matchCategorie;
    });

    const modifierTarif = (tarif) => {
      setTarifEnEdition({
        nom: tarif.nom,
        prixLaverie: tarif.prixLaverie,
        prixPressing: tarif.prixPressing,
      });
      setShowModalEditTarif(true);
    };

    const enregistrerModification = async () => {
      if (!tarifEnEdition) return;

      const index = tarifsPersonnalises.findIndex(
        (t) => t.nom === tarifEnEdition.nom
      );
      let newTarifs;

      if (index >= 0) {
        // Modifier existant
        newTarifs = [...tarifsPersonnalises];
        newTarifs[index] = { ...tarifEnEdition, isPersonnalise: true };
      } else {
        // Ajouter nouveau
        newTarifs = [
          ...tarifsPersonnalises,
          { ...tarifEnEdition, isPersonnalise: true },
        ];
      }

      setTarifsPersonnalises(newTarifs);
      await saveTarifsPersonnalises(newTarifs);
      setShowModalEditTarif(false);
      setTarifEnEdition(null);
    };

    const reinitialiserTarif = async (nomArticle) => {
      if (
        !confirm(
          `Réinitialiser les tarifs de "${nomArticle}" aux valeurs par défaut ?`
        )
      )
        return;

      const newTarifs = tarifsPersonnalises.filter((t) => t.nom !== nomArticle);
      setTarifsPersonnalises(newTarifs);
      await saveTarifsPersonnalises(newTarifs);
    };
    const supprimerArticlePersonnalise = async (nomArticle) => {
      if (
        !confirm(
          `⚠️ Supprimer définitivement l'article "${nomArticle}" ?\n\nCette action est irréversible !`
        )
      )
        return;

      const newArticles = articlesPersonnalises.filter(
        (a) => a.nom !== nomArticle
      );
      setArticlesPersonnalises(newArticles);
      await saveArticlesPersonnalises(newArticles);

      alert(`✅ Article "${nomArticle}" supprimé`);
    };
    const categorieLabels = {
      tous: 'Tous les articles',
      hauts: '👕 Hauts',
      bas: '👖 Bas',
      robes: '👗 Robes',
      ensembles: '🤵 Ensembles',
      linge_maison: '🏠 Linge de maison',
      services: '⚙️ Services',
    };

    return (
      <div className="space-y-6">
        {/* Barre de recherche et filtres */}
        <div className="bg-white rounded-2xl p-4 shadow-lg">
          <div className="flex flex-wrap gap-4 items-center justify-between mb-4">
            <input
              type="text"
              placeholder="Rechercher un article..."
              value={searchTarif}
              onChange={(e) => setSearchTarif(e.target.value)}
              className="px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500"
            />
            <div className="text-sm text-gray-600 font-medium">
              {commandesFiltrees.length} commande
              {commandesFiltrees.length > 1 ? 's' : ''}
              {filterDate && (
                <span className="ml-2 text-purple-600">
                  •{' '}
                  {new Date(filterDate).toLocaleDateString('fr-FR', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
              )}
            </div>
          </div>

          {/* Filtres par catégorie */}
          <div className="flex flex-wrap gap-2">
            {Object.entries(categorieLabels).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setFilterCategorie(key)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
                  filterCategorie === key
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Info tarifs */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl p-6 shadow-lg">
          <h3 className="text-xl font-bold mb-2">💰 Grille tarifaire</h3>
          <p className="text-sm opacity-90 mb-4">
            Gérez les prix de vos services. Les modifications s'appliquent
            immédiatement.
          </p>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white/20 rounded-xl p-3">
              <div className="text-xs sm:text-sm opacity-90">💧 Laverie</div>
              <div className="font-bold">Service standard</div>
            </div>
            <div className="bg-white/20 rounded-xl p-3">
              <div className="text-xs sm:text-sm opacity-90">✨ Pressing</div>
              <div className="font-bold">Service premium</div>
            </div>
            <div className="bg-white/20 rounded-xl p-3">
              <div className="text-xs sm:text-sm opacity-90">🔥 Repassage</div>
              <div className="font-bold">{PRIX_REPASSAGE} FCFA/article</div>
            </div>
          </div>
        </div>

        {/* Liste des tarifs */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b-2 border-gray-200">
              <tr>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">
                  Article
                </th>
                <th className="text-center py-4 px-4 font-semibold text-blue-600">
                  💧 Laverie
                </th>
                <th className="text-center py-4 px-4 font-semibold text-purple-600">
                  ✨ Pressing
                </th>
                <th className="text-center py-4 px-4 font-semibold text-gray-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {tarifsFiltres.map((tarif, idx) => (
                <tr
                  key={idx}
                  className={`border-b border-gray-100 hover:bg-blue-50 transition ${
                    tarif.isPersonnalise ? 'bg-yellow-50' : ''
                  }`}
                >
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                      <span className="font-medium">{tarif.nom}</span>
                      {tarif.isPersonnalise && (
                        <span className="bg-yellow-200 text-yellow-800 text-xs px-2 py-1 rounded-full">
                          Modifié
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="text-center py-4 px-4">
                    <span className="font-bold text-blue-600">
                      {tarif.prixLaverie.toLocaleString()} F
                    </span>
                  </td>
                  <td className="text-center py-4 px-4">
                    <span className="font-bold text-purple-600">
                      {tarif.prixPressing.toLocaleString()} F
                    </span>
                  </td>
                  <td className="text-center py-4 px-4">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => modifierTarif(tarif)}
                        className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 text-sm flex items-center gap-1"
                      >
                        <Edit2 className="w-3 h-3" />
                        Modifier
                      </button>
                      {tarif.isPersonnalise && !tarif.isArticleCustom && (
                        <button
                          onClick={() => reinitialiserTarif(tarif.nom)}
                          className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm"
                        >
                          Réinitialiser
                        </button>
                      )}
                      {tarif.isArticleCustom && (
                        <button
                          onClick={() =>
                            supprimerArticlePersonnalise(tarif.nom)
                          }
                          className="px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 text-sm flex items-center gap-1"
                        >
                          <Trash2 className="w-3 h-3" />
                          Supprimer
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {tarifsFiltres.length === 0 && (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <div className="text-gray-500">Aucun article trouvé</div>
            </div>
          )}
        </div>

        {/* Modal Modification Tarif */}
        {showModalEditTarif && tarifEnEdition && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
              <div className="border-b px-6 py-4 flex justify-between items-center">
                <h2 className="text-xl font-bold">✏️ Modifier les tarifs</h2>
                <button
                  onClick={() => setShowModalEditTarif(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Article
                  </label>
                  <div className="px-4 py-3 bg-gray-50 rounded-xl font-semibold">
                    {tarifEnEdition.nom}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    💧 Prix Laverie (FCFA)
                  </label>
                  <input
                    type="number"
                    value={tarifEnEdition.prixLaverie}
                    onChange={(e) =>
                      setTarifEnEdition({
                        ...tarifEnEdition,
                        prixLaverie: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 sm:px-4 py-3 sm:py-2 text-base border rounded-xl focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ✨ Prix Pressing (FCFA)
                  </label>
                  <input
                    type="number"
                    value={tarifEnEdition.prixPressing}
                    onChange={(e) =>
                      setTarifEnEdition({
                        ...tarifEnEdition,
                        prixPressing: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-sm text-blue-700">
                  💡 Ces modifications s'appliqueront immédiatement aux
                  nouvelles commandes.
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowModalEditTarif(false)}
                    className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-xl hover:bg-gray-50 transition font-medium"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={enregistrerModification}
                    className="flex-1 bg-blue-500 text-white px-6 py-3 rounded-xl hover:bg-blue-600 transition font-medium"
                  >
                    Enregistrer
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <header className="bg-gradient-to-r from-green-600 to-teal-600 shadow-lg sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <div className="bg-white rounded-xl p-2 sm:p-3 flex-shrink-0">
                <Package className="w-8 h-8 text-green-600" />
              </div>
              <div className="text-white min-w-0">
                <h1 className="text-lg sm:text-2xl font-bold truncate">
                  Tina - Manager
                </h1>
                <p className="text-xs sm:text-sm text-white opacity-90 hidden sm:block">
                  Gestion quotidienne 📱
                </p>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="flex items-center gap-1 sm:gap-2 bg-white/20 hover:bg-white/30 text-white px-2 sm:px-4 py-2 rounded-xl transition"
            >
              <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline text-sm">Déconnexion</span>
            </button>
          </div>
        </div>
      </header>

      <nav className="bg-white shadow-md sticky top-[76px] z-30 overflow-x-auto">
        <div className="max-w-7xl mx-auto px-2 sm:px-4">
          <div className="flex space-x-1 sm:space-x-2 py-2 min-w-max sm:min-w-0">
            {[
              {
                id: 'dashboard',
                label: 'Tableau de bord',
                icon: PieChart,
                shortLabel: 'Dashboard',
              },
              {
                id: 'commandes',
                label: 'Commandes',
                icon: Package,
                shortLabel: 'Commandes',
              },
              {
                id: 'clients',
                label: 'Clients',
                icon: Users,
                shortLabel: 'Clients',
              },
              {
                id: 'tarifs',
                label: 'Tarifs',
                icon: FileText,
                shortLabel: 'Tarifs',
              },
            ].map((module) => (
              <button
                key={module.id}
                onClick={() => setActiveModule(module.id)}
                className={`flex flex-col sm:flex-row items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 rounded-xl font-medium whitespace-nowrap transition ${
                  activeModule === module.id
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <module.icon className="w-5 h-5 sm:w-4 sm:h-4" />
                <span className="text-xs sm:text-sm hidden sm:inline">
                  {module.label}
                </span>
                <span className="text-xs sm:hidden">{module.shortLabel}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {activeModule === 'dashboard' && <Dashboard />}
        {activeModule === 'commandes' && (
          <CommandesModule
            commandes={commandes}
            setCommandes={setCommandes}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            filterStatus={filterStatus}
            setFilterStatus={setFilterStatus}
            filterDate={filterDate}
            setFilterDate={setFilterDate}
            setModalType={setModalType}
            setShowModal={setShowModal}
            mettreAJourStatut={mettreAJourStatut}
            genererLienPaiement={genererLienPaiement}
            envoyerNotificationWhatsApp={envoyerNotificationWhatsApp}
            saveData={saveData}
            transactions={transactions}
            setTransactions={setTransactions}
            modifierCommande={modifierCommande}
            supprimerCommande={supprimerCommande}
          />
        )}
        {activeModule === 'clients' && <ModuleClients />}
        {activeModule === 'tarifs' && (
          <ModuleTarifs
            articlesPersonnalises={articlesPersonnalises}
            setArticlesPersonnalises={setArticlesPersonnalises}
            saveArticlesPersonnalises={saveArticlesPersonnalises}
          />
        )}
      </main>

      {showModal &&
        (modalType === 'nouvelle-commande' ||
          modalType === 'modifier-commande') && (
          <ModalNouvelleCommande
            nouvelleCommande={nouvelleCommande}
            setNouvelleCommande={setNouvelleCommande}
            nouvelArticle={nouvelArticle}
            setNouvelArticle={setNouvelArticle}
            ajouterArticleCommande={ajouterArticleCommande}
            ajouterCommande={ajouterCommande}
            setShowModal={setShowModal}
            commandes={commandes}
            getNiveauFidelite={getNiveauFidelite}
            getClientStats={getClientStats}
            commandeEnModification={commandeEnModification}
            articlesPersonnalises={articlesPersonnalises}
            creerArticlePersonnalise={creerArticlePersonnalise}
          />
        )}
    </div>
  );
}
