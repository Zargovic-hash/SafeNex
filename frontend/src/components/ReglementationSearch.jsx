import React, { useState, useEffect } from "react";
import { Search, Filter, Save, Download, AlertCircle, CheckCircle, XCircle, Clock } from "lucide-react";

const ReglementationSearch = () => {
  const [search, setSearch] = useState("");
  const [titre, setTitre] = useState("");
  const [selectedDomaine, setSelectedDomaine] = useState("");
  const [allData, setAllData] = useState([]);
  const [titres, setTitres] = useState([]);
  const [domaines, setDomaines] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [notification, setNotification] = useState(null);

  // Récupérer toutes les données
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        const res = await fetch("http://localhost:3001/api/reglementation");
        const data = await res.json();
        setAllData(data);
        setTitres([...new Set(data.map(i => i.titre))]);
        setDomaines([...new Set(data.map(i => i.domaine))]);
      } catch (err) {
        console.error(err);
        showNotification("Erreur lors du chargement des données", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, []);

  // Notification système
  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Filtrer les titres selon le domaine
  const handleDomaineChange = (value) => {
    setSelectedDomaine(value);
    const titresFiltres = value
      ? allData.filter(i => i.domaine === value).map(i => i.titre)
      : allData.map(i => i.titre);
    setTitres([...new Set(titresFiltres)]);
    if (!titresFiltres.includes(titre)) setTitre("");
  };

  // Filtrer les domaines selon le titre
  const handleTitreChange = (value) => {
    setTitre(value);
    const domainesFiltres = value
      ? allData.filter(i => i.titre === value).map(i => i.domaine)
      : allData.map(i => i.domaine);
    setDomaines([...new Set(domainesFiltres)]);
    if (!domainesFiltres.includes(selectedDomaine)) setSelectedDomaine("");
  };

  // Recherche avec loading
  const handleSearch = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ search, titre, domaine: selectedDomaine }).toString();
      const res = await fetch(`http://localhost:3001/api/reglementation?${params}`);
      const data = await res.json();
      setResults(data);
      showNotification(`${data.length} résultats trouvés`, "success");
    } catch (err) {
      console.error(err);
      showNotification("Erreur lors de la recherche", "error");
    } finally {
      setLoading(false);
    }
  };

  // Mise à jour des champs
  const handleChange = (id, field, value) => {
    setResults(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r));
  };

  // Sauvegarde avec feedback
  const saveAudit = async (item) => {
    try {
      const response = await fetch("http://localhost:3001/api/audit", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reglementation_id: item.id,
          conformite: item.conformite,
          risque: item.risque,
          faisabilite: item.faisabilite,
          plan_action: item.plan_action,
          deadline: item.deadline,
          owner: item.owner
        })
      });
      
      if (response.ok) {
        showNotification("Audit sauvegardé avec succès !", "success");
      } else {
        throw new Error('Erreur lors de la sauvegarde');
      }
    } catch (err) {
      console.error(err);
      showNotification("Erreur lors de la sauvegarde", "error");
    }
  };

  // Badge de conformité
  const ConformiteBadge = ({ status }) => {
    const configs = {
      "Conforme": { icon: CheckCircle, color: "bg-green-100 text-green-800", iconColor: "text-green-600" },
      "Non Conforme": { icon: XCircle, color: "bg-red-100 text-red-800", iconColor: "text-red-600" },
      "Non Applicable": { icon: AlertCircle, color: "bg-gray-100 text-gray-800", iconColor: "text-gray-600" }
    };
    
    if (!status) return null;
    const config = configs[status];
    const Icon = config.icon;
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className={`w-3 h-3 mr-1 ${config.iconColor}`} />
        {status}
      </span>
    );
  };

  // Badge de risque
  const RisqueBadge = ({ level }) => {
    const configs = {
      "Faible": "bg-green-100 text-green-800",
      "Moyen": "bg-yellow-100 text-yellow-800", 
      "Élevé": "bg-red-100 text-red-800"
    };
    
    if (!level) return null;
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${configs[level]}`}>
        {level}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${
          notification.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
        }`}>
          {notification.message}
        </div>
      )}

      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Audit Réglementaire</h1>
          <p className="mt-2 text-gray-600">Recherche et audit de conformité des réglementations</p>
        </div>
      </div>

      {/* Barre de recherche et filtres */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Recherche */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Rechercher par mot-clé..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
            </div>

            {/* Toggle filtres */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filtres
            </button>

            {/* Bouton recherche */}
            <button
              onClick={handleSearch}
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {loading ? "Recherche..." : "Rechercher"}
            </button>
          </div>

          {/* Filtres déroulants */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200 flex flex-wrap gap-4">
              <select
                value={selectedDomaine}
                onChange={(e) => handleDomaineChange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Tous les domaines</option>
                {domaines.map((d, i) => (
                  <option key={i} value={d}>{d}</option>
                ))}
              </select>

              <select
                value={titre}
                onChange={(e) => handleTitreChange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Tous les titres</option>
                {titres.map((t, i) => (
                  <option key={i} value={t}>{t}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Statistiques */}
        {results.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">{results.length} résultats trouvés</span>
              <button className="flex items-center px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                <Download className="w-4 h-4 mr-1" />
                Exporter
              </button>
            </div>
          </div>
        )}

        {/* Tableau des résultats */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Réglementation</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Conformité</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Risque</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Faisabilité</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plan d'action</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Échéance</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Responsable</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {results.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-6 py-12 text-center text-gray-500">
                      {loading ? "Chargement..." : "Aucun résultat trouvé"}
                    </td>
                  </tr>
                ) : results.map(item => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{item.titre}</div>
                        <div className="text-sm text-gray-500">{item.domaine}</div>
                        <div className="text-xs text-gray-400 mt-1">{item.exigence}</div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <select 
                        value={item.conformite || ""} 
                        onChange={e => handleChange(item.id, "conformite", e.target.value)}
                        className="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">--Choisir--</option>
                        <option value="Conforme">Conforme</option>
                        <option value="Non Conforme">Non Conforme</option>
                        <option value="Non Applicable">Non Applicable</option>
                      </select>
                      <div className="mt-1">
                        <ConformiteBadge status={item.conformite} />
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <select 
                        value={item.risque || ""} 
                        onChange={e => handleChange(item.id, "risque", e.target.value)}
                        className="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">--Choisir--</option>
                        <option value="Faible">Faible</option>
                        <option value="Moyen">Moyen</option>
                        <option value="Élevé">Élevé</option>
                      </select>
                      <div className="mt-1">
                        <RisqueBadge level={item.risque} />
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <select 
                        value={item.faisabilite || ""} 
                        onChange={e => handleChange(item.id, "faisabilite", e.target.value)}
                        className="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">--Choisir--</option>
                        <option value="Facile">Facile</option>
                        <option value="Moyen">Moyen</option>
                        <option value="Difficile">Difficile</option>
                      </select>
                    </td>

                    <td className="px-6 py-4">
                      <textarea 
                        value={item.plan_action || ""} 
                        onChange={e => handleChange(item.id, "plan_action", e.target.value)}
                        className="w-full text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500"
                        rows="2"
                        placeholder="Décrivez le plan d'action..."
                      />
                    </td>

                    <td className="px-6 py-4">
                      <input 
                        type="date" 
                        value={item.deadline || ""} 
                        onChange={e => handleChange(item.id, "deadline", e.target.value)}
                        className="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500"
                      />
                      {item.deadline && (
                        <div className="flex items-center mt-1 text-xs text-gray-500">
                          <Clock className="w-3 h-3 mr-1" />
                          {new Date(item.deadline).toLocaleDateString('fr-FR')}
                        </div>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      <input 
                        type="text" 
                        value={item.owner || ""} 
                        onChange={e => handleChange(item.id, "owner", e.target.value)}
                        className="w-full text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500"
                        placeholder="Nom du responsable"
                      />
                    </td>

                    <td className="px-6 py-4">
                      <button 
                        onClick={() => saveAudit(item)}
                        className="flex items-center px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
                      >
                        <Save className="w-4 h-4 mr-1" />
                        Sauver
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReglementationSearch;