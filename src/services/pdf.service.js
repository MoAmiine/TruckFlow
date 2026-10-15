const PDFDocument = require('pdfkit');

async function genererOrdreDeMission(trajet) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    const buffers = [];

    doc.on('data', (chunk) => buffers.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(buffers)));
    doc.on('error', (err) => reject(err));

    doc.fillColor('#1E3A8A').fontSize(22).text('TRUCKFLOW LOGISTICS', { align: 'center', bold: true });
    doc.moveDown(0.3);
    doc.fillColor('#64748B').fontSize(12).text('Plateforme de Gestion de Flotte de Transport Routier', { align: 'center' });
    doc.moveDown(0.5);
    doc.strokeColor('#CBD5E1').lineWidth(1).moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown(1);

    doc.fillColor('#0F172A').fontSize(16).text('ORDRE DE MISSION OFFICIEL', { align: 'center', underline: true });
    doc.moveDown(0.5);
    doc.fontSize(10).fillColor('#64748B').text(`Réf Trajet : ${trajet._id}`, { align: 'center' });
    doc.text(`Date d'émission : ${new Date().toLocaleDateString('fr-FR')}`, { align: 'center' });
    doc.moveDown(1.5);

    doc.fillColor('#1E3A8A').fontSize(13).text('1. ITINÉRAIRE & PLANNING', { underline: true });
    doc.moveDown(0.4);
    doc.fillColor('#334155').fontSize(11);
    doc.text(`• Site de Départ      : ${trajet.siteDepart}`);
    doc.text(`• Site d'Arrivée      : ${trajet.siteArrivee}`);
    doc.text(`• Marchandise         : ${trajet.marchandise}`);
    doc.text(`• Départ Prévu        : ${new Date(trajet.dateDepartPrevue).toLocaleString('fr-FR')}`);
    doc.text(`• Arrivée Prévue      : ${new Date(trajet.dateArriveePrevue).toLocaleString('fr-FR')}`);
    doc.moveDown(1);

    doc.fillColor('#1E3A8A').fontSize(13).text('2. MOYENS ASSIGNÉS', { underline: true });
    doc.moveDown(0.4);
    doc.fillColor('#334155').fontSize(11);

    const chauffeurNom = trajet.chauffeurId ? `${trajet.chauffeurId.prenom || ''} ${trajet.chauffeurId.nom || ''}`.trim() : 'Non assigné';
    const camionMatricule = trajet.camionId ? `${trajet.camionId.immatriculation} (${trajet.camionId.marque} ${trajet.camionId.modele})` : 'N/A';
    const remorqueMatricule = trajet.remorqueId ? `${trajet.remorqueId.immatriculation} (Type: ${trajet.remorqueId.type})` : 'N/A';

    doc.text(`• Chauffeur Assigné   : ${chauffeurNom}`);
    doc.text(`• Tracteur Routier    : ${camionMatricule}`);
    doc.text(`• Semi-Remorque       : ${remorqueMatricule}`);
    doc.moveDown(2);

    doc.fillColor('#0F172A').fontSize(11);
    const startY = doc.y;
    doc.text('Signature du Conducteur :', 60, startY);
    doc.text('Visa de la Direction :', 350, startY);

    doc.strokeColor('#94A3B8').rect(55, startY + 20, 180, 60).stroke();
    doc.strokeColor('#94A3B8').rect(345, startY + 20, 180, 60).stroke();

    doc.end();
  });
}

module.exports = {
  genererOrdreDeMission
};