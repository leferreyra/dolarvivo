import { get } from 'axios';

export default (req, res) => {
  return get('https://static.coins.infobae.com/cotizacion-simple/dolar-libre-riesgo.json')
    .then(response => res.status(200).send(JSON.stringify(response.data)));
}