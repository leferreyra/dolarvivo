
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
const messaging = admin.messaging();

const sendNotification = notification => {
  return db.collection('devices').get().then(snapshot => {
    const tokens = [];

    snapshot.forEach(doc => {
      const device = doc.data();
      if (device.enabled) tokens.push(device.token);
    });

    const message = {
      notification,
      tokens
    }

    messaging.sendMulticast(message)
      .then(response => console.log('all messages sent', response))
      .catch(error => console.error(error));
  })
  .catch(error => console.error(error));
}

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
  const previousData = snapshot && JSON.parse(snapshot);

  if (dataSnapshot !== snapshot) {
    snapshot = dataSnapshot;

    console.log('- Pushing to Firebase')
    db.collection('prices').doc('default').set({
      updated: admin.firestore.FieldValue.serverTimestamp(),
      ...data
    });

    // Send notifications if blue sell price changed
    if (previousData) {

      blueSellDifference = data.blueSell - previousData.blueSell;

      if (blueSellDifference > 0) {
        console.log('Sending dolar blue up notification', blueSellDifference, previousData, data);
        sendNotification({
          title: `El dolar blue subio a $${data.blueSell}`,
          body: `Compra: ${data.blueBuy}, Venta: ${data.blueSell}`
        });
      } else if (blueSellDifference < 0) {
        console.log('Sending dolar blue down notification', blueSellDifference, previousData, data);
        sendNotification({
          title: `El dolar blue bajo a $${data.blueSell}`,
          body: `Compra: ${data.blueBuy}, Venta: ${data.blueSell}`
        });
      } else {
        console.log('No change', blueSellDifference, previousData, data);
      }
    }


  } else {
    console.log('- Skiping because there was no change', snapshot, dataSnapshot);
  }

  setTimeout(main, 5000);

}

main();
