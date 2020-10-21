
const admin = require('firebase-admin');
const XRay = require('x-ray');
const Axios = require('axios');
const get = require('lodash.get');
const serviceAccount = require('./service-account.json');

const float = value => parseFloat(value.replace(',', '.'))

x = XRay({
  filters: {
    float
  }
});

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const getBNAPrice = () => {
  return x('https://www.bna.com.ar/Personas', {
    buy: '.cotizacion tr:first-child td:nth-child(2) | float',
    sell: '.cotizacion tr:first-child td:nth-child(3) | float',
  })
    .then(({ buy, sell }) => ([buy, sell]))
}

const getInfobaePrice = () => {
  return Axios.get('https://static.coins.infobae.com/cotizacion-simple/dolar-libre-riesgo.json')
    .then(response => ([null, get(response, 'data.items[1].unico', 0)]))
}

const getAmbitoPrice = () => {
  return Axios.get('https://mercados.ambito.com//dolar/informal/variacion')
    .then(response => ([float(get(response, 'data.compra', 0)), float(get(response, 'data.venta', 0))]))
}

let snapshot = null;

const main = async () => {

  console.log('- Fetching data from BNA')
  const [officialBuy, officialSell] = await getBNAPrice();

  console.log('- Fetching data from Infobae')
  const [_, infobaeSell] = await getInfobaePrice();


  console.log('- Fetching data from Ambito')
  const [blueBuy, ambitoSell]= await getAmbitoPrice();

  const blueSell = Math.max(infobaeSell, ambitoSell);

  const data = {
    officialBuy,
    officialSell,
    blueBuy,
    blueSell
  }

  const dataSnapshot = JSON.stringify(data);

  if (dataSnapshot !== snapshot) {
    snapshot = dataSnapshot;

    console.log('- Pushing to Firebase')
    db.collection('prices').doc('default').set({
      updated: admin.firestore.FieldValue.serverTimestamp(),
      ...data
    });

  } else {
    console.log('- Skiping because there was no change', snapshot, dataSnapshot);
  }

  setTimeout(main, 5000);

}

main();
