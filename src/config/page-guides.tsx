import { translate } from "@/i18n/translate";
import {
  BadgePercent,
  Banknote,
  Bell,
  Building2,
  Download,
  FileText,
  Filter,
  Gauge,
  LayoutGrid,
  LineChart,
  ListChecks,
  Package,
  Pencil,
  PieChart,
  Plus,
  ReceiptText,
  RefreshCw,
  ScrollText,
  ShieldCheck,
  SlidersHorizontal,
  Table2,
  Timer,
  Truck,
  Upload,
  Users,
} from "lucide-react";
import type { GuideGroup } from "@/components/layout/guide-panel";

/**
 * Contenu du panneau « Guide » propre à chaque écran (Doc/design_system_maquette_complete.md
 * § 4.6 : « son contenu suit l'écran affiché »). Ces groupes s'affichent AVANT les groupes
 * transverses (navigation, en-tête, formulaires) déjà portés par `GuidePanel`.
 *
 * Clé = pathname normalisé (les identifiants numériques deviennent `[id]`). Écran sans
 * entrée = seul le guide transverse s'affiche, comme avant.
 */

const ICON = "h-[19px] w-[19px]";

/** Bloc réutilisé par toutes les pages de liste avec en-tête d'actions harmonisé. */
const listHeaderGroup = (entity: string): GuideGroup => ({
  title: translate("guide.p.enTeteDeLaListe"),
  icon: <Table2 className="h-5 w-5" />,
  rows: [
    { kind: "Bouton", icon: <Plus className={ICON} />, label: translate("guide.p.nouveauEntity", { x: entity }), text: translate("guide.p.ouvreLeFormulaireDeCreationLesChampsObligatoiresPortentU") },
    { kind: "Bouton", icon: <Upload className={ICON} />, label: translate("guide.p.importer"), text: translate("guide.p.importCsvTelechargezLeModeleDeposezVotreFichierVerifiezL") },
    { kind: "Bouton", icon: <Download className={ICON} />, label: translate("guide.p.exporter"), text: translate("guide.p.genereUnPdfUnExcelOuUnCsvReprenantExactementLesFiltresAc") },
    { kind: "Élément", icon: <Filter className={ICON} />, label: translate("guide.p.barreDeFiltres"), text: translate("guide.p.chaqueFiltreEstMemoriseDansLUrlUnRechargementOuUnLienPar") },
  ],
});

const exportOnlyHeaderGroup = (): GuideGroup => ({
  title: translate("guide.p.enTeteDeLaListe"),
  icon: <Table2 className="h-5 w-5" />,
  rows: [
    { kind: "Bouton", icon: <Download className={ICON} />, label: translate("guide.p.exporter"), text: translate("guide.p.genereUnPdfUnExcelOuUnCsvReprenantExactementLesFiltresAc2") },
    { kind: "Élément", icon: <Filter className={ICON} />, label: translate("guide.p.barreDeFiltres"), text: translate("guide.p.chaqueFiltreVitDansLUrlRechargementEtPartageDeLienReprod") },
  ],
});

function buildPageGuides(): Record<string, GuideGroup[]> {
  return {
  "/dashboard": [
    {
      title: translate("guide.p.lireLeTableauDeBord"),
      icon: <Gauge className="h-5 w-5" />,
      rows: [
        { kind: "Élément", icon: <Gauge className={ICON} />, label: translate("guide.p.cartesKpi"), text: translate("guide.p.caEncaisseEtCommissionFacturesEnAttenteTauxDeTransformat") },
        { kind: "Élément", icon: <SlidersHorizontal className={ICON} />, label: translate("guide.p.filtreDePeriode"), text: translate("guide.p.jourSemaineMoisFacturesEnAttenteResteUnInstantaneIndepen") },
        { kind: "Élément", icon: <BadgePercent className={ICON} />, label: translate("guide.p.caEncaisseVsPipeline"), text: translate("guide.p.deuxChiffresVolontairementDistinctsLeReellementPercuEtLe") },
        { kind: "Bouton", icon: <ReceiptText className={ICON} />, label: translate("guide.p.voirLesFacturesEnAttente"), text: translate("guide.p.ouvreLaListeCompletePourLaRelanceManuelleAucuneRelanceNE") },
      ],
    },
    {
      title: translate("guide.p.graphiquesEtSuivi"),
      icon: <LineChart className="h-5 w-5" />,
      rows: [
        { kind: "Élément", icon: <RefreshCw className={ICON} />, label: translate("guide.p.actualisationAuto"), text: translate("guide.p.actualisationAutoTxt") },
        { kind: "Élément", icon: <LineChart className={ICON} />, label: translate("guide.p.performanceMensuelle"), text: translate("guide.p.performanceMensuelleTxt") },
        { kind: "Élément", icon: <PieChart className={ICON} />, label: translate("guide.p.qualiteRecouvrement"), text: translate("guide.p.qualiteRecouvrementTxt") },
        { kind: "Élément", icon: <Timer className={ICON} />, label: translate("guide.p.velociteCycleVie"), text: translate("guide.p.velociteCycleVieTxt") },
        { kind: "Élément", icon: <LayoutGrid className={ICON} />, label: translate("guide.p.panneauxModules"), text: translate("guide.p.panneauxModulesTxt") },
        { kind: "Élément", icon: <ScrollText className={ICON} />, label: translate("guide.p.filsActivite"), text: translate("guide.p.filsActiviteTxt") },
        { kind: "Élément", icon: <Bell className={ICON} />, label: translate("guide.p.badgeRelances"), text: translate("guide.p.badgeRelancesTxt") },
        { kind: "Bouton", icon: <Download className={ICON} />, label: translate("guide.p.exporterLeRapport"), text: translate("guide.p.exporterLeRapportTxt") },
      ],
    },
  ],
  "/dashboard/factures-en-attente": [
    {
      title: translate("guide.p.facturesEnAttente"),
      icon: <ReceiptText className="h-5 w-5" />,
      rows: [
        { kind: "Élément", icon: <ReceiptText className={ICON} />, label: translate("guide.p.listeDesRelances"), text: translate("guide.p.commandesNonSoldeesDuPlusAncienAuPlusRecentLeBadgeDEchea") },
        { kind: "Bouton", icon: <FileText className={ICON} />, label: translate("guide.p.ouvrirLaCommande"), text: translate("guide.p.laRelanceWhatsappSeFaitDepuisLOngletDocumentsDeLaFicheCo") },
      ],
    },
  ],
  "/produits": [
    listHeaderGroup("produit"),
    {
      title: translate("guide.p.colonnesDuCatalogue"),
      icon: <Package className="h-5 w-5" />,
      rows: [
        { kind: "Élément", icon: <Package className={ICON} />, label: translate("guide.p.vignetteReference"), text: translate("guide.p.cliquerSurLaLigneOuvreLaFicheProduitEtSesVariantes") },
        { kind: "Élément", icon: <ShieldCheck className={ICON} />, label: translate("guide.p.badgeSensible"), text: translate("guide.p.produitSoumisAUneVigilanceDouaniereLogistiqueLaRaisonEst") },
      ],
    },
  ],
  "/produits/[id]": [
    {
      title: translate("guide.p.ficheProduit"),
      icon: <Package className="h-5 w-5" />,
      rows: [
        { kind: "Élément", icon: <ListChecks className={ICON} />, label: translate("guide.p.ongletVariantes"), text: translate("guide.p.chaqueVarianteUnNiveauDeQualitePremierDeuxiemeTroisiemeC") },
        { kind: "Élément", icon: <FileText className={ICON} />, label: translate("guide.p.argumentsProforma"), text: translate("guide.p.surChaqueVariantePointsFortsPointsDAttentionRecommandati") },
        { kind: "Élément", icon: <SlidersHorizontal className={ICON} />, label: translate("guide.p.ongletAttributs"), text: translate("guide.p.caracteristiquesDeclinantLeProduitCouleurCapaciteLesVale") },
      ],
    },
  ],
  "/clients": [
    listHeaderGroup("client"),
    {
      title: translate("guide.p.colonnesDuPortefeuille"),
      icon: <Users className="h-5 w-5" />,
      rows: [
        { kind: "Élément", icon: <Users className={ICON} />, label: translate("guide.p.puceDeProvenance"), text: translate("guide.p.couleurOuLogoDeLaCategorieClientACoteDuNomReconnaissable") },
        { kind: "Élément", icon: <BadgePercent className={ICON} />, label: translate("guide.p.segmentDeValeur"), text: translate("guide.p.calculeAutomatiquementAPartirDeLHistoriqueJamaisSaisiDan") },
      ],
    },
  ],
  "/clients/[id]": [
    {
      title: translate("guide.p.ficheClient"),
      icon: <Users className="h-5 w-5" />,
      rows: [
        { kind: "Élément", icon: <ListChecks className={ICON} />, label: translate("guide.p.ongletContacts"), text: translate("guide.p.unCanalUnMoyenDeJoindreLeClientEmailTelephoneWhatsappLeC") },
        { kind: "Bouton", icon: <ShieldCheck className={ICON} />, label: translate("guide.p.changerLeStatut"), text: translate("guide.p.actifInactifVipBloqueUnClientBloqueNePeutPlusRecevoirDeN") },
        { kind: "Élément", icon: <BadgePercent className={ICON} />, label: translate("guide.p.modeDeFacturation"), text: translate("guide.p.commissionVisibleLAfficheSurLesDocumentsPrixGlobalLaFond") },
      ],
    },
  ],
  "/fournisseurs": [
    listHeaderGroup("fournisseur"),
    {
      title: translate("guide.p.fiabiliteFournisseur"),
      icon: <ShieldCheck className="h-5 w-5" />,
      rows: [
        { kind: "Élément", icon: <ShieldCheck className={ICON} />, label: translate("guide.p.fiabiliteDeclareeScore"), text: translate("guide.p.laFiabiliteEstSaisieLeScoreBarreEstLaMoyenneCalculeeDesE") },
        { kind: "Élément", icon: <Filter className={ICON} />, label: translate("guide.p.filtreListeNoire"), text: translate("guide.p.unFournisseurEnListeNoireResteConsultableMaisNePeutPlusE") },
      ],
    },
  ],
  "/fournisseurs/[id]": [
    {
      title: translate("guide.p.ficheFournisseur"),
      icon: <Building2 className="h-5 w-5" />,
      rows: [
        { kind: "Élément", icon: <ListChecks className={ICON} />, label: translate("guide.p.6Onglets"), text: translate("guide.p.contactsComptesBancairesDocumentsAvecDateDExpirationEval") },
        { kind: "Bouton", icon: <ShieldCheck className={ICON} />, label: translate("guide.p.verifierListeNoire"), text: translate("guide.p.laVerificationDemandeUneMethodeVisiteDUsineAppelVideoAud") },
      ],
    },
  ],
  "/rfq": [
    listHeaderGroup("RFQ"),
    {
      title: translate("guide.p.demandesDePrix"),
      icon: <ScrollText className="h-5 w-5" />,
      rows: [
        { kind: "Élément", icon: <ScrollText className={ICON} />, label: translate("guide.p.statutDuCycle"), text: translate("guide.p.brouillonEnvoyeeRepondueExpireeAnnuleeLeDetailPermetDeCo") },
      ],
    },
  ],
  "/rfq/[id]": [
    {
      title: translate("guide.p.detailRfq"),
      icon: <ScrollText className="h-5 w-5" />,
      rows: [
        { kind: "Élément", icon: <ListChecks className={ICON} />, label: translate("guide.p.articlesFournisseursSollicites"), text: translate("guide.p.chaqueFournisseurSolliciteDeposeUnOuPlusieursDevisVousEn") },
        { kind: "Bouton", icon: <FileText className={ICON} />, label: translate("guide.p.envoyerParWhatsapp"), text: translate("guide.p.envoiManuelDeLaDemandeAUnFournisseurSolliciteConfirmatio") },
      ],
    },
  ],
  "/commandes-fournisseurs": [
    listHeaderGroup("commande"),
    {
      title: translate("guide.p.commandesFournisseurs"),
      icon: <Truck className="h-5 w-5" />,
      rows: [
        { kind: "Élément", icon: <Truck className={ICON} />, label: translate("guide.p.statutLogistique"), text: translate("guide.p.brouillonEnvoyeeConfirmeeEnProductionExpedieeReceptionne") },
      ],
    },
  ],
  "/commandes-fournisseurs/[id]": [
    {
      title: translate("guide.p.detailCommandeFournisseur"),
      icon: <Truck className="h-5 w-5" />,
      rows: [
        { kind: "Élément", icon: <ListChecks className={ICON} />, label: translate("guide.p.lignesDeVariantes"), text: translate("guide.p.ajoutModificationSuppressionDeLignesLeTotalSuitAutomatiq") },
        { kind: "Élément", icon: <ScrollText className={ICON} />, label: translate("guide.p.lienRfq"), text: translate("guide.p.siLaCommandeNaitDUnDevisRetenuLeLienVersLaRfqDOrigineEst") },
        { kind: "Bouton", icon: <FileText className={ICON} />, label: translate("guide.p.envoyerParWhatsapp"), text: translate("guide.p.envoiManuelDeLaCommandeAuFournisseur") },
      ],
    },
  ],
  "/sales-orders": [
    listHeaderGroup("commande"),
    {
      title: translate("guide.p.commandesClients"),
      icon: <FileText className="h-5 w-5" />,
      rows: [
        { kind: "Élément", icon: <FileText className={ICON} />, label: translate("guide.p.deuxStatutsDistincts"), text: translate("guide.p.statutLogistique8ValeursEtStatutDePaiement3ValeursRecalc") },
        { kind: "Bouton", icon: <BadgePercent className={ICON} />, label: translate("guide.p.baremeDeCommission"), text: translate("guide.p.raccourciVersParametresCommissionsLaCommissionEstFigeeAL") },
      ],
    },
  ],
  "/sales-orders/[id]": [
    {
      title: translate("guide.p.ficheCommande"),
      icon: <FileText className="h-5 w-5" />,
      rows: [
        { kind: "Élément", icon: <ListChecks className={ICON} />, label: translate("guide.p.ongletLignes"), text: translate("guide.p.formulaireDynamiqueSelonLeTypeProduitUnique3ChoixMultiPr") },
        { kind: "Élément", icon: <BadgePercent className={ICON} />, label: translate("guide.p.tva"), text: translate("guide.p.tauxUniqueDeCommandePreRempliAvecLaValeurParDefautSociet") },
        { kind: "Bouton", icon: <FileText className={ICON} />, label: translate("guide.p.ongletDocuments"), text: translate("guide.p.toutLeCycleEmettreUneProformaVersionneeLaFactureAutoEmis") },
        { kind: "Élément", icon: <Banknote className={ICON} />, label: translate("guide.p.ongletPaiements"), text: translate("guide.p.encaissementsEtRemboursementsRattachesALaCommandeLeStatu") },
        { kind: "Bouton", icon: <SlidersHorizontal className={ICON} />, label: translate("guide.p.changerLeStatut"), text: translate("guide.p.seulPointDEntreePourFaireEvoluerLeStatutLogistiqueLEmiss") },
      ],
    },
  ],
  "/factures": [
    exportOnlyHeaderGroup(),
    {
      title: translate("guide.p.registreDesDocuments"),
      icon: <ReceiptText className="h-5 w-5" />,
      rows: [
        { kind: "Élément", icon: <ReceiptText className={ICON} />, label: translate("guide.p.lectureSeule"), text: translate("guide.p.tousLesProformasFacturesRecusEtAvoirsToutesCommandesConf") },
        { kind: "Bouton", icon: <FileText className={ICON} />, label: translate("guide.p.colonneCommande"), text: translate("guide.p.renvoieVersLaFicheCommandeDOrigine") },
        { kind: "Bouton", icon: <Download className={ICON} />, label: translate("guide.p.iconeDeTelechargement"), text: translate("guide.p.ouvreLePdfDuDocumentDansUnNouvelOnglet") },
      ],
    },
  ],
  "/paiements": [
    exportOnlyHeaderGroup(),
    {
      title: translate("guide.p.registreDesPaiements"),
      icon: <Banknote className="h-5 w-5" />,
      rows: [
        { kind: "Élément", icon: <Banknote className={ICON} />, label: translate("guide.p.tousLesMouvements"), text: translate("guide.p.encaissementsEtRemboursementsDuPortefeuilleQuelQueSoitLe") },
        { kind: "Élément", icon: <LayoutGrid className={ICON} />, label: translate("guide.p.vueMethodes"), text: translate("guide.p.repartitLesMemesMouvementsParMoyenDePaiement") },
      ],
    },
  ],
  "/notifications": [
    {
      title: translate("guide.p.centreDeNotifications"),
      icon: <Bell className="h-5 w-5" />,
      rows: [
        { kind: "Élément", icon: <Bell className={ICON} />, label: translate("guide.p.ressourcePersonnelle"), text: translate("guide.p.cesAlertesNeConcernentQueVotreCompteEtNeSontJamaisEnvoye") },
        { kind: "Élément", icon: <Filter className={ICON} />, label: translate("guide.p.filtres"), text: translate("guide.p.parCategoriePrioriteEtStatutDeLecture") },
        { kind: "Bouton", icon: <ListChecks className={ICON} />, label: translate("guide.p.toutMarquerCommeLu"), text: translate("guide.p.videLeCompteurDeLaClocheSansSupprimerLHistorique") },
      ],
    },
  ],
  "/catalogue": [
    {
      title: translate("guide.p.vueGalerie"),
      icon: <LayoutGrid className="h-5 w-5" />,
      rows: [
        { kind: "Élément", icon: <LayoutGrid className={ICON} />, label: translate("guide.p.grilleVisuelle"), text: translate("guide.p.memeJeuDeDonneesQueLaListeProduitsPresenteEnVignettesPra") },
        { kind: "Élément", icon: <Filter className={ICON} />, label: translate("guide.p.lectureSeule"), text: translate("guide.p.lEditionSeFaitDepuisLaFicheProduit") },
      ],
    },
  ],
  "/admin/users": [
    {
      title: translate("guide.p.gestionDesComptes"),
      icon: <Users className="h-5 w-5" />,
      rows: [
        { kind: "Bouton", icon: <Plus className={ICON} />, label: translate("guide.p.inviterUnUtilisateur"), text: translate("guide.p.creeUnCompteAdminEtEnvoieUnEMailDInvitationLeCompteDoitC") },
        { kind: "Bouton", icon: <Download className={ICON} />, label: translate("guide.p.exporter"), text: translate("guide.p.listeDesComptesFiltreeEnPdfExcelCsv") },
        { kind: "Élément", icon: <ShieldCheck className={ICON} />, label: translate("guide.p.actionsReservees"), text: translate("guide.p.desactiverReactiverSupprimerDefinitivementEtRolesPermiss") },
      ],
    },
  ],
  "/admin/audit-log": [
    {
      title: translate("guide.p.journalDActivite"),
      icon: <ScrollText className="h-5 w-5" />,
      rows: [
        { kind: "Élément", icon: <ScrollText className={ICON} />, label: translate("guide.p.retrospectif"), text: translate("guide.p.quiAFaitQuoiQuandSurTousLesModulesAucuneActionPossibleDe") },
        { kind: "Élément", icon: <Filter className={ICON} />, label: translate("guide.p.filtreModuleEntite"), text: translate("guide.p.leSelecteurModuleNeFaitQueRestreindreLaListeDesTypesDEnt") },
        { kind: "Bouton", icon: <FileText className={ICON} />, label: translate("guide.p.ligneCliquable"), text: translate("guide.p.lePanneauDeDetailAfficheLeDiffAvantApresEnClairEtUnLienV") },
        { kind: "Bouton", icon: <Download className={ICON} />, label: translate("guide.p.exporter"), text: translate("guide.p.csvBomExcelOuPdfMemesFiltresQueLaListePlafonneA5000Ligne") },
      ],
    },
  ],
  "/parametres": [
    {
      title: translate("guide.p.hubParametres"),
      icon: <SlidersHorizontal className="h-5 w-5" />,
      rows: [
        { kind: "Élément", icon: <LayoutGrid className={ICON} />, label: translate("guide.p.sixDomaines"), text: translate("guide.p.entrepriseCommercialClientsCatalogueDocumentsAccesChaque") },
        { kind: "Élément", icon: <SlidersHorizontal className={ICON} />, label: translate("guide.p.deuxReglesPartout"), text: translate("guide.p.desactiverConserveLHistoriqueLaOuSupprimerLEffaceUneVale") },
      ],
    },
  ],
  "/parametres/entreprise": [
    {
      title: translate("guide.p.parametresEntreprise"),
      icon: <Building2 className="h-5 w-5" />,
      rows: [
        { kind: "Élément", icon: <Building2 className={ICON} />, label: translate("guide.p.identiteLogo"), text: translate("guide.p.reprisEnEnTeteDeTousLesPdfLeLogoEstEnregistreAuClicSurEn") },
        { kind: "Élément", icon: <FileText className={ICON} />, label: translate("guide.p.valeursParDefautProforma"), text: translate("guide.p.validiteLes4NotesConditionsReprisesAutomatiquementALEmis") },
        { kind: "Élément", icon: <BadgePercent className={ICON} />, label: translate("guide.p.tvaParDefaut"), text: translate("guide.p.tauxProposeALaCreationDeChaqueNouvelleCommande0AucuneTva") },
        { kind: "Bouton", icon: <Banknote className={ICON} />, label: translate("guide.p.moyensDePaiement"), text: translate("guide.p.comptesImprimesAuBasDesDocumentsSurDocumentsMasqueUneMet") },
        { kind: "Bouton", icon: <Banknote className={ICON} />, label: translate("guide.p.devisesTaux"), text: translate("guide.p.leXafEstLaDevisePivotAjouterUnTauxEnregistreUnePariteDat") },
      ],
    },
  ],
  "/parametres/commissions": [
    {
      title: translate("guide.p.baremeDeCommission"),
      icon: <BadgePercent className="h-5 w-5" />,
      rows: [
        { kind: "Élément", icon: <BadgePercent className={ICON} />, label: translate("guide.p.paliersOrdonnes"), text: translate("guide.p.evaluesDansLOrdreALaCreationDUneCommandeForfaitOuPourcen") },
        { kind: "Élément", icon: <ShieldCheck className={ICON} />, label: translate("guide.p.exceptionsParClient"), text: translate("guide.p.uneCommissionDerogatoireSurLaFicheClientPrimeToujoursSur") },
      ],
    },
  ],
  "/parametres/tarifs-transport": [
    {
      title: translate("guide.p.tarifsDeTransport"),
      icon: <Truck className="h-5 w-5" />,
      rows: [
        { kind: "Élément", icon: <Truck className={ICON} />, label: translate("guide.p.grilleAerienMaritime"), text: translate("guide.p.paliersParQuantiteKgOuCbmUtilisesPourLEstimationLogistiq") },
        { kind: "Élément", icon: <SlidersHorizontal className={ICON} />, label: translate("guide.p.desactiverVsSupprimer"), text: translate("guide.p.desactiverUnPalierLeSortDuCalculSansCasserLaLisibiliteDe") },
      ],
    },
  ],
  "/parametres/analyse-flux": [
    {
      title: translate("guide.p.seuilsDAnalyseDesFlux"),
      icon: <SlidersHorizontal className="h-5 w-5" />,
      rows: [
        { kind: "Élément", icon: <SlidersHorizontal className={ICON} />, label: translate("guide.p.seuilsParEtape"), text: translate("guide.p.achatVenteActiviteAuDelaDuSeuilJoursOuOccurrencesLEtapeR") },
      ],
    },
  ],
  "/parametres/notifications": [
    {
      title: translate("guide.p.preferencesDeNotification"),
      icon: <Bell className="h-5 w-5" />,
      rows: [
        { kind: "Élément", icon: <Bell className={ICON} />, label: translate("guide.p.uneCaseEmailParCategorie"), text: translate("guide.p.leCanalInAppLaClocheResteToujoursActifVousChoisissezSeul") },
      ],
    },
  ],
  "/flow-analytics": [
    {
      title: translate("guide.p.analyseDesFlux"),
      icon: <Gauge className="h-5 w-5" />,
      rows: [
        { kind: "Élément", icon: <Gauge className={ICON} />, label: translate("guide.p.5Onglets"), text: translate("guide.p.vueDEnsembleGoulotsFluxAchatFluxVenteFluxFinancierFluxDA") },
        { kind: "Élément", icon: <SlidersHorizontal className={ICON} />, label: translate("guide.p.filtreDePeriode"), text: translate("guide.p.laFenetreAnalyseeJourSemaineMoisSAfficheSousLesFiltresCe") },
        { kind: "Bouton", icon: <Download className={ICON} />, label: translate("guide.p.exporter"), text: translate("guide.p.leRapportDeLOngletOuvertEnCsvOuPdfSurLaPeriodeSelectionn") },
        { kind: "Élément", icon: <Banknote className={ICON} />, label: translate("guide.p.margeEstimee"), text: translate("guide.p.approximationDernierPrixDuFournisseurPrefereSurLesComman") },
      ],
    },
  ],
  "/account/profile": [
    {
      title: translate("guide.p.monProfil"),
      icon: <Pencil className="h-5 w-5" />,
      rows: [
        { kind: "Élément", icon: <Pencil className={ICON} />, label: translate("guide.p.coordonnees"), text: translate("guide.p.nomEMailTelephoneLeRoleEtLeStatutNeSontModifiablesQuePar") },
      ],
    },
  ],
  "/account/security": [
    {
      title: translate("guide.p.securiteSessions"),
      icon: <ShieldCheck className="h-5 w-5" />,
      rows: [
        { kind: "Bouton", icon: <ShieldCheck className={ICON} />, label: translate("guide.p.changerLeMotDePasse"), text: translate("guide.p.appliqueLesReglesDeRobustesseStandard") },
        { kind: "Bouton", icon: <ListChecks className={ICON} />, label: translate("guide.p.revoquerUneSession"), text: translate("guide.p.deconnecteImmediatementLAppareilCorrespondantUtileEnCasD") },
      ],
    },
  ],
  "/change-password": [
    {
      title: translate("guide.p.changementDeMotDePasseRequis"),
      icon: <ShieldCheck className="h-5 w-5" />,
      rows: [
        { kind: "Élément", icon: <ShieldCheck className={ICON} />, label: translate("guide.p.premiereConnexion"), text: translate("guide.p.ecranImposeTantQueLeMotDePasseTemporaireDeLInvitationNAP") },
        { kind: "Bouton", icon: <ShieldCheck className={ICON} />, label: translate("guide.p.valider"), text: translate("guide.p.leNouveauMotDePasseDoitRespecterLesReglesDeRobustesseLaS") },
      ],
    },
  ],
  "/admin/users/new": [
    {
      title: translate("guide.p.inviterUnUtilisateur"),
      icon: <Plus className="h-5 w-5" />,
      rows: [
        { kind: "Élément", icon: <Users className={ICON} />, label: translate("guide.p.compteAdmin"), text: translate("guide.p.seulsDeuxRolesExistentAdminParDefautIciEtSuperAdminNomEt") },
        { kind: "Bouton", icon: <ShieldCheck className={ICON} />, label: translate("guide.p.creerLInvitation"), text: translate("guide.p.leCompteDevraChangerSonMotDePasseALaPremiereConnexionVoi") },
      ],
    },
  ],
  "/admin/users/[id]": [
    {
      title: translate("guide.p.ficheUtilisateur"),
      icon: <Users className="h-5 w-5" />,
      rows: [
        { kind: "Élément", icon: <Users className={ICON} />, label: translate("guide.p.identiteActivite"), text: translate("guide.p.roleStatutDerniereConnexionSessionsActivesLectureSeuleIc") },
        { kind: "Bouton", icon: <ShieldCheck className={ICON} />, label: translate("guide.p.desactiverSupprimer"), text: translate("guide.p.reserveAuSuperAdminDesactiverConserveLHistoriqueDAuditSu") },
      ],
    },
  ],
  "/admin/users/[id]/edit": [
    {
      title: translate("guide.p.modifierUnUtilisateur"),
      icon: <Pencil className="h-5 w-5" />,
      rows: [
        { kind: "Élément", icon: <Pencil className={ICON} />, label: translate("guide.p.champsModifiables"), text: translate("guide.p.nomEMailRoleTelephoneLeChangementDeRolePrendEffetALaProc") },
      ],
    },
  ],
  "/admin/roles": [
    {
      title: translate("guide.p.roles"),
      icon: <ShieldCheck className="h-5 w-5" />,
      rows: [
        { kind: "Élément", icon: <ShieldCheck className={ICON} />, label: translate("guide.p.deuxRolesFixes"), text: translate("guide.p.superAdminAccesTotalContourneTouteVerificationDePermissi") },
        { kind: "Élément", icon: <ListChecks className={ICON} />, label: translate("guide.p.permissionsParModule"), text: translate("guide.p.chaqueModuleExposeViewEtManageLeTableauMontreCeQuiEstAcc") },
      ],
    },
  ],
  "/admin/permissions": [
    {
      title: translate("guide.p.rolesPermissions"),
      icon: <ShieldCheck className="h-5 w-5" />,
      rows: [
        { kind: "Élément", icon: <ListChecks className={ICON} />, label: translate("guide.p.matriceModulePermission"), text: translate("guide.p.cocherDecocherAccordeOuRetireUnePermissionAuRoleAdminLeS") },
        { kind: "Élément", icon: <ShieldCheck className={ICON} />, label: translate("guide.p.effetImmediat"), text: translate("guide.p.unRetraitDePermissionBloqueLAccesDesLaRequeteSuivanteYCo") },
      ],
    },
  ],
  "/clients/categories": [
    {
      title: translate("guide.p.categoriesDeClientsProvenance"),
      icon: <Users className="h-5 w-5" />,
      rows: [
        { kind: "Élément", icon: <Users className={ICON} />, label: translate("guide.p.ecomRichDirectAutre"), text: translate("guide.p.cesCategoriesAlimententLeKpiPerformanceParProvenanceDuTa") },
        { kind: "Élément", icon: <SlidersHorizontal className={ICON} />, label: translate("guide.p.suppressionProtegee"), text: translate("guide.p.uneCategorieEncoreRattacheeAUnClientNePeutPasEtreSupprim") },
      ],
    },
  ],
  "/clients/canaux-contact": [
    {
      title: translate("guide.p.canauxDeContact"),
      icon: <SlidersHorizontal className="h-5 w-5" />,
      rows: [
        { kind: "Élément", icon: <ListChecks className={ICON} />, label: translate("guide.p.typesDeCanal"), text: translate("guide.p.emailTelephoneWhatsappWechatLaListeAlimenteLeChoixCanalS") },
      ],
    },
  ],
  "/produits/categories": [
    {
      title: translate("guide.p.categoriesDeProduits"),
      icon: <Package className="h-5 w-5" />,
      rows: [
        { kind: "Élément", icon: <Package className={ICON} />, label: translate("guide.p.arborescence"), text: translate("guide.p.categoriesEtSousCategoriesPourClasserLeCatalogueUneCateg") },
      ],
    },
  ],
  "/produits/attributs": [
    {
      title: translate("guide.p.attributsDeProduit"),
      icon: <SlidersHorizontal className="h-5 w-5" />,
      rows: [
        { kind: "Élément", icon: <SlidersHorizontal className={ICON} />, label: translate("guide.p.caracteristiquesValeurs"), text: translate("guide.p.exCouleurNoirBlancBleuLesValeursAssigneesAUneVarianteRem") },
        { kind: "Élément", icon: <ListChecks className={ICON} />, label: translate("guide.p.typeDeSaisie"), text: translate("guide.p.listeFermeeOuTexteLibreFixeALaCreationDeLAttribut") },
      ],
    },
  ],
  "/produits/tags": [
    {
      title: translate("guide.p.tags"),
      icon: <ListChecks className="h-5 w-5" />,
      rows: [
        { kind: "Élément", icon: <ListChecks className={ICON} />, label: translate("guide.p.etiquettesTransverses"), text: translate("guide.p.marquageLibreDesProduitsExRentreeScolairePromoSertAuFilt") },
      ],
    },
  ],
  "/produits/[id]/variantes/[id]": [
    {
      title: translate("guide.p.ficheVariante"),
      icon: <Package className="h-5 w-5" />,
      rows: [
        { kind: "Élément", icon: <Package className={ICON} />, label: translate("guide.p.niveauPrixMoq"), text: translate("guide.p.premierDeuxiemeTroisiemeChoixOuStandardPrixUnitaireQuant") },
        { kind: "Élément", icon: <FileText className={ICON} />, label: translate("guide.p.argumentsProforma"), text: translate("guide.p.pointsFortsPointsDAttentionRecommandationPropresACetteVa") },
        { kind: "Élément", icon: <SlidersHorizontal className={ICON} />, label: translate("guide.p.valeursDAttributs"), text: translate("guide.p.alimententLesLignesDeCriteresDuTableauComparatifDuPdf") },
      ],
    },
  ],
  };
}

function normalizePathname(pathname: string): string {
  const trimmed = pathname.replace(/\/+$/, "");
  const withPlaceholders = trimmed.replace(/\/\d+(?=\/|$)/g, "/[id]");
  return withPlaceholders === "" ? "/" : withPlaceholders;
}

/** Groupes de guide propres à l'écran courant, ou `undefined` si l'écran n'en a pas encore. */
export function resolvePageGuide(pathname: string): GuideGroup[] | undefined {
  return buildPageGuides()[normalizePathname(pathname)];
}
