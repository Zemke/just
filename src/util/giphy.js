const apiKey = 'ChtjKtGKudG70veqcnA5Bjot8LuIvQxE';
// const baseUrl = 'https://api.giphy.com/v1/gifs';
const baseUrl = 'http://localhost:5000';

const api = {};

api.getTrending = async () =>
  (await fetch(`${baseUrl}/trending?api_key=${apiKey}&limit=5`)
    .then(res => res.json()));

api.getSearch = async term =>
  (await fetch(`${baseUrl}/search?api_key=${apiKey}&q=${term}&limit=5`)
    .then(res => res.json()));

export default api;
